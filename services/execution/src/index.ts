import { config } from "./config.js";
import { log } from "./log.js";
import { DockerSandbox } from "./sandbox/docker.js";
import { createExecutionServer } from "./server.js";

/**
 * The process.
 *
 * Starts the sandbox, sweeps anything a previous incarnation left running,
 * serves, and shuts down without leaving containers behind. Nothing here
 * decides anything; the decisions are in config.ts and the sandbox.
 */

const sandbox = new DockerSandbox();
const { server, queue } = createExecutionServer(sandbox);

/**
 * Containers outlive the process that started them.
 *
 * `docker run --rm` cleans up when the container exits, but if this process is
 * killed mid-execution the container carries on running the submission it was
 * given, holding a CPU and a slot nothing is tracking any more. The sweep at
 * start-up removes those; the interval removes any that appear while we are
 * running, which should be none and which is worth knowing about if it is not.
 */
async function sweep(reason: string): Promise<void> {
  try {
    const removed = await sandbox.sweep();
    if (removed > 0) log.warn("sandbox.swept", { executionId: "-", reason, removed });
  } catch {
    log.error("sandbox.sweep_failed", { executionId: "-", reason });
  }
}

const sweeper = setInterval(() => void sweep("interval"), 60_000);
sweeper.unref();

async function main(): Promise<void> {
  await sweep("startup");

  const health = await sandbox.health();
  if (!health.ok) {
    // Started anyway, and loudly. /health answers 503 until the image is there,
    // which is a service a deployment can roll forward from; refusing to start
    // is a crash loop nobody can read.
    log.error("startup.sandbox_unavailable", {
      executionId: "-",
      reason: health.detail,
      image: config.image,
    });
  }

  if (config.token.length === 0) {
    log.error("startup.no_token", {
      executionId: "-",
      reason: "EXECUTION_TOKEN is unset; every request will be refused",
    });
  }

  server.listen(config.port, () => {
    log.info("startup.listening", {
      executionId: "-",
      port: config.port,
      image: config.image,
      sandbox: sandbox.name,
      maxConcurrent: config.maxConcurrent,
      maxQueued: config.maxQueued,
      health: health.ok ? "ok" : "unavailable",
    });
  });
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    log.info("shutdown.begin", { executionId: "-", signal, ...queue.stats() });
    server.close(() => {
      void sweep("shutdown").then(() => process.exit(0));
    });
    // A submission still running gets the time it was already promised, and
    // then the process goes regardless - a shutdown that waits forever is an
    // outage with extra steps.
    setTimeout(() => {
      void sweep("shutdown-timeout").then(() => process.exit(0));
    }, 30_000).unref();
  });
}

void main();
