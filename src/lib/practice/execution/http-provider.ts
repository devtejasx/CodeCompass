import { z } from "zod";

import type { CodeLanguage } from "@/generated/prisma/client";

import { sanitiseMessage, sanitiseOutput } from "./sanitise";
import {
  EXECUTION_LIMITS,
  type CodeExecutionService,
  type ExecutionHealth,
  type ExecutionRequest,
  type ExecutionResult,
} from "./types";

/**
 * Talks to an external, isolated execution service over HTTP.
 *
 * This is the production path. The service is a separate deployment — its own
 * container, its own network policy, no database credentials, no application
 * secrets — and this file is the only thing that knows it exists. See
 * docs/code-execution.md for what that service must guarantee.
 *
 * Everything crossing this boundary is treated as untrusted in both directions:
 * the code we send is hostile input to the service, and the response we get
 * back is hostile input to us. Hence the schema validation and the scrubbing.
 */

const outcomeSchema = z.object({
  order: z.number().int().nonnegative(),
  passed: z.boolean(),
  actualOutput: z.string().nullable().optional(),
});

const responseSchema = z.object({
  status: z.enum([
    "ACCEPTED",
    "WRONG_ANSWER",
    "TIME_LIMIT",
    "MEMORY_LIMIT",
    "OUTPUT_LIMIT",
    "COMPILE_ERROR",
    "RUNTIME_ERROR",
    "SYSTEM_ERROR",
  ]),
  executionTime: z.number().int().nonnegative().nullable().optional(),
  memoryUsed: z.number().int().nonnegative().nullable().optional(),
  message: z.string().nullable().optional(),
  outcomes: z.array(outcomeSchema).default([]),
});

/** Comma-separated env override, so a service that only runs Python says so. */
function configuredLanguages(): readonly CodeLanguage[] {
  const all: CodeLanguage[] = ["JAVASCRIPT", "TYPESCRIPT", "PYTHON", "JAVA", "CPP"];
  const raw = process.env.CODE_EXECUTION_LANGUAGES?.trim();
  if (!raw) return all;

  const requested = new Set(
    raw
      .split(",")
      .map((entry) => entry.trim().toUpperCase())
      .filter(Boolean),
  );

  // Intersection, never union: an unknown name in the env cannot invent support.
  return all.filter((language) => requested.has(language));
}

export class HttpExecutionService implements CodeExecutionService {
  readonly name = "http";
  readonly simulated = false;

  constructor(
    private readonly endpoint: string,
    private readonly token: string | undefined,
  ) {}

  supportedLanguages(): readonly CodeLanguage[] {
    return configuredLanguages();
  }

  /**
   * Whether the service could grade something right now.
   *
   * A GET to the health route beside the execute route, which answers without
   * running anything - that is the requirement, and it is why this is not
   * implemented by submitting a trivial program. Asking "are you up?" must not
   * cost a container, and must never involve executing code to find out.
   *
   * Nothing about the answer is shown to a learner. The problem page decides
   * what to offer from supportedLanguages(), which does not depend on a network
   * call; this exists for deployment checks and for the operator script.
   */
  async health(): Promise<ExecutionHealth> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5_000);

    try {
      const response = await fetch(healthUrl(this.endpoint), {
        method: "GET",
        signal: controller.signal,
        headers: this.token ? { authorization: `Bearer ${this.token}` } : {},
      });
      return response.ok
        ? { available: true, detail: "execution service responded" }
        : {
            available: false,
            detail: `execution service responded ${response.status}`,
          };
    } catch {
      return { available: false, detail: "execution service unreachable" };
    } finally {
      clearTimeout(timer);
    }
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const total = request.tests.length;

    // A hung service must not hold a request open indefinitely.
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      EXECUTION_LIMITS.serviceTimeoutMs,
    );

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "content-type": "application/json",
          ...(this.token ? { authorization: `Bearer ${this.token}` } : {}),
        },
        // Built field by field, never spread from `request`. `development`
        // carries the reference solution and must never cross this boundary.
        body: JSON.stringify({
          language: request.language,
          code: request.code,
          entryPoint: request.entryPoint,
          timeLimitMs: Math.min(request.timeLimitMs, EXECUTION_LIMITS.maxTimeLimitMs),
          memoryLimitMb: Math.min(
            request.memoryLimitMb,
            EXECUTION_LIMITS.maxMemoryLimitMb,
          ),
          tests: request.tests.map((test) => ({
            order: test.order,
            input: test.input,
            expectedOutput: test.expectedOutput,
          })),
        }),
      });

      if (!response.ok) {
        // The status code is ours to log; the learner gets a plain sentence.
        console.error(`[execution] service responded ${response.status}`);
        return systemError(total, request);
      }

      const parsed = responseSchema.safeParse(await response.json());
      if (!parsed.success) {
        console.error("[execution] service response failed validation");
        return systemError(total, request);
      }

      const byOrder = new Map(
        parsed.data.outcomes.map((outcome) => [outcome.order, outcome]),
      );

      // Built from *our* test list, not the service's: a response that invents
      // or omits cases cannot change how many tests the learner is graded on.
      const outcomes = request.tests.map((test) => {
        const reported = byOrder.get(test.order);
        return {
          order: test.order,
          passed: reported?.passed ?? false,
          actualOutput: sanitiseOutput(reported?.actualOutput ?? null),
          isHidden: test.isHidden,
        };
      });

      return {
        status: parsed.data.status,
        passedTests: outcomes.filter((outcome) => outcome.passed).length,
        totalTests: total,
        executionTime: parsed.data.executionTime ?? null,
        memoryUsed: parsed.data.memoryUsed ?? null,
        message: sanitiseMessage(parsed.data.message),
        outcomes,
        simulated: false,
      };
    } catch (error) {
      // Includes the abort: a timeout talking to the service is our problem,
      // not the learner's code being slow.
      console.error(
        "[execution] service unreachable:",
        error instanceof Error ? error.name : "unknown",
      );
      return systemError(total, request);
    } finally {
      clearTimeout(timer);
    }
  }
}

function systemError(total: number, request: ExecutionRequest): ExecutionResult {
  return {
    status: "SYSTEM_ERROR",
    passedTests: 0,
    totalTests: total,
    executionTime: null,
    memoryUsed: null,
    message: null,
    outcomes: request.tests.map((test) => ({
      order: test.order,
      passed: false,
      actualOutput: null,
      isHidden: test.isHidden,
    })),
    simulated: false,
  };
}

/**
 * The health route beside the execute route.
 *
 * CODE_EXECUTION_URL names the endpoint that grades submissions, because that
 * is the one the application actually needs; the health route is derived from
 * it rather than configured separately, so a deployment cannot end up checking
 * the health of one service while sending work to another.
 */
function healthUrl(endpoint: string): string {
  try {
    const url = new URL(endpoint);
    url.pathname = "/health";
    url.search = "";
    return url.toString();
  } catch {
    return endpoint;
  }
}
