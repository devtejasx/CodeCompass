import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import { timingSafeEqual } from "node:crypto";

import { config } from "./config.js";
import { execute } from "./execute.js";
import { log } from "./log.js";
import { ExecutionQueue, QueueFull } from "./queue.js";
import type { Sandbox } from "./sandbox/types.js";
import { validateExecuteRequest } from "./validate.js";

/**
 * The HTTP surface. Two routes, and neither of them is chatty.
 *
 *   POST /v1/execute   grade one submission. Bearer token required.
 *   GET  /health       is the service able to run something. No token.
 *
 * The contract is docs/code-execution.md in the application repository, and the
 * application validates every response against it, so this file's job is to
 * produce exactly that shape or an honest failure - never a partially-filled
 * result, and never an error page.
 *
 * Error bodies say what a *caller* did wrong and nothing about what is behind
 * this process. "queue is full" is useful; "cannot connect to the Docker daemon
 * at unix:///var/run/docker.sock" is a map of our infrastructure, so it goes to
 * the log and the caller gets 503 with a sentence.
 */

/** Bounds the body before it is buffered, let alone parsed. */
const MAX_BODY_BYTES = 2 * 1024 * 1024;

export function createExecutionServer(sandbox: Sandbox): {
  server: Server;
  queue: ExecutionQueue;
} {
  const queue = new ExecutionQueue();

  const server = createServer((req, res) => {
    void handle(req, res, sandbox, queue).catch((error: unknown) => {
      log.error("http.unhandled", {
        executionId: "-",
        reason: error instanceof Error ? error.name : "unknown",
      });
      send(res, 500, { error: "internal error" });
    });
  });

  // A submission that finishes in twenty seconds has already lost the learner's
  // attention; the application gives up at that point too. Set above the
  // longest legitimate execution so a slow Java compile is not cut off here.
  server.requestTimeout = 120_000;
  server.headersTimeout = 20_000;

  return { server, queue };
}

async function handle(
  req: IncomingMessage,
  res: ServerResponse,
  sandbox: Sandbox,
  queue: ExecutionQueue,
): Promise<void> {
  const url = req.url ?? "/";
  const path = url.split("?")[0] ?? "/";

  if (req.method === "GET" && path === "/health") {
    const health = await sandbox.health();
    // 503 rather than 200-with-a-flag, so a load balancer and an uptime check
    // agree with the JSON body instead of having to read it.
    send(res, health.ok ? 200 : 503, {
      status: health.ok ? "ok" : "unavailable",
      detail: health.detail,
      sandbox: sandbox.name,
      queue: queue.stats(),
    });
    return;
  }

  if (path !== "/v1/execute") {
    send(res, 404, { error: "not found" });
    return;
  }

  if (req.method !== "POST") {
    send(res, 405, { error: "method not allowed" });
    return;
  }

  if (!authorised(req)) {
    // Deliberately not "wrong token" versus "no token": both are the same
    // answer to anyone who does not already have it.
    send(res, 401, { error: "unauthorised" });
    return;
  }

  const body = await readBody(req);
  if (body === null) {
    send(res, 413, { error: "request body too large" });
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    send(res, 400, { error: "body is not valid JSON" });
    return;
  }

  const validation = validateExecuteRequest(parsed);
  if (!validation.ok) {
    send(res, 400, { error: validation.reason });
    return;
  }

  try {
    const { result, queuedMs } = await queue.run(() =>
      execute(sandbox, validation.request),
    );
    if (queuedMs > 0) {
      log.info("execution.queued", {
        executionId: result.executionId,
        queuedMs,
        ...queue.stats(),
      });
    }
    send(res, 200, result.response);
  } catch (error) {
    if (error instanceof QueueFull) {
      log.warn("execution.rejected", { executionId: "-", ...queue.stats() });
      // Retry-After, because the caller can do something useful with it and
      // because a client that backs off is the difference between a busy
      // service and a collapsing one.
      res.setHeader("retry-after", "5");
      send(res, 429, { error: "execution capacity is full" });
      return;
    }
    throw error;
  }
}

/**
 * Bearer authentication.
 *
 * An unset token means the service refuses every request rather than accepting
 * every request. A deployment that forgot to configure it should be visibly
 * broken, not quietly open to anyone who can reach the port.
 */
function authorised(req: IncomingMessage): boolean {
  if (config.token.length === 0) return false;

  const header = req.headers.authorization;
  if (typeof header !== "string" || !header.startsWith("Bearer ")) return false;

  const presented = Buffer.from(header.slice("Bearer ".length).trim(), "utf8");
  const expected = Buffer.from(config.token, "utf8");
  // Compared in constant time, and length-checked first because
  // timingSafeEqual throws on a mismatch - which would itself be a timing
  // signal about the token's length if it were left to the exception.
  if (presented.length !== expected.length) return false;
  return timingSafeEqual(presented, expected);
}

/** Buffers the body, or gives up on one that is over the limit. */
function readBody(req: IncomingMessage): Promise<string | null> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let size = 0;
    let settled = false;

    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        // Stop reading rather than keep buffering something we have already
        // decided to refuse.
        req.destroy();
        finish(null);
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => finish(Buffer.concat(chunks).toString("utf8")));
    req.on("error", () => finish(null));
  });
}

function send(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
    // Nothing this service returns should ever be cached or sniffed.
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  res.end(payload);
}
