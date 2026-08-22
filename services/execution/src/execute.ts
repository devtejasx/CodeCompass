import { config, containerMemoryMb, wallClockMs } from "./config.js";
import { matches } from "./compare.js";
import { buildProgram } from "./harness/index.js";
import { log, executionId } from "./log.js";
import { capValue, scrub } from "./scrub.js";
import type { Sandbox } from "./sandbox/types.js";
import {
  narrow,
  type ExecuteRequest,
  type ExecuteResponse,
  type SandboxOutcome,
  type WireOutcome,
} from "./types.js";

/**
 * One graded submission, end to end.
 *
 * Generate a program, run it once in a sandbox, compare what came back, and
 * turn the whole thing into the six fields the application knows how to store.
 *
 * The single most important line in this file is the last thing `grade` does:
 * outcomes are built from the *request's* test list, in the request's order,
 * and a case the sandbox said nothing about is a failure. Nothing the sandbox
 * produces can add a test, remove one, or turn a case that never ran into a
 * pass. The application re-does exactly this check on its side, for the same
 * reason and against a different adversary.
 */

export interface ExecutionSummary {
  executionId: string;
  response: ExecuteResponse;
}

export async function execute(
  sandbox: Sandbox,
  request: ExecuteRequest,
): Promise<ExecutionSummary> {
  const id = executionId();
  const started = Date.now();

  log.info("execution.start", {
    executionId: id,
    language: request.language,
    entryPoint: request.entryPoint,
    tests: request.tests.length,
    provider: sandbox.name,
  });

  let outcome: SandboxOutcome;
  try {
    outcome = await sandbox.run({
      executionId: id,
      language: request.language,
      program: buildProgram(request),
      wallClockMs: wallClockMs(
        request.language,
        request.timeLimitMs,
        request.tests.length,
      ),
      compileTimeoutMs: config.limits.compileTimeoutMs,
      memoryMb: containerMemoryMb(request.language, request.memoryLimitMb),
      outputLimitBytes: config.limits.maxOutputBytes,
    });
  } catch (error) {
    // A throw from the sandbox is ours, never the learner's: their code has not
    // been shown to be wrong, so the verdict must not say that it is.
    log.error("execution.crashed", {
      executionId: id,
      language: request.language,
      reason: error instanceof Error ? error.name : "unknown",
    });
    return { executionId: id, response: systemError(request) };
  }

  const response = grade(request, outcome);

  log.info("execution.finish", {
    executionId: id,
    language: request.language,
    verdict: outcome.verdict,
    status: response.status,
    passed: response.outcomes.filter((entry) => entry.passed).length,
    tests: request.tests.length,
    durationMs: Date.now() - started,
    memoryKb: outcome.memoryKb,
  });

  return { executionId: id, response };
}

/**
 * Sandbox outcome plus expected answers to a verdict.
 *
 * The interesting case is a run that finished cleanly. "The program exited
 * zero" is not ACCEPTED - it means the harness got through every case without
 * crashing, and whether those answers are *right* is decided here, against the
 * expected values, which never left this process.
 */
function grade(request: ExecuteRequest, outcome: SandboxOutcome): ExecuteResponse {
  const byIndex = new Map(outcome.results.map((result) => [result.index, result]));

  const outcomes: WireOutcome[] = request.tests.map((test, index) => {
    const produced = byIndex.get(index);
    if (!produced) {
      // The program stopped before reaching this case, or said nothing about
      // it. Either way it did not answer, and not answering is not passing.
      return { order: test.order, passed: false, actualOutput: null };
    }
    return {
      order: test.order,
      passed: matches(test.expectedOutput, produced.value),
      actualOutput: capValue(produced.value),
    };
  });

  const allPassed = outcomes.every((entry) => entry.passed);

  /*
   * A clean exit is only ACCEPTED if every answer was right; otherwise it is a
   * wrong answer. Every other verdict already describes *why* the run ended and
   * is kept as it is - a program that timed out on case four has some correct
   * answers behind it, and calling that a wrong answer would send the learner
   * hunting for a logic bug instead of a slow loop.
   */
  const status =
    outcome.verdict === "ACCEPTED" && !allPassed
      ? "WRONG_ANSWER"
      : narrow(outcome.verdict);

  return {
    status,
    executionTime: outcome.durationMs,
    memoryUsed: outcome.memoryKb,
    // Scrubbed here as well as on the application's side. A wrong answer gets
    // no message at all: whatever the program printed is the learner's own
    // debugging output, and echoing it back as if it were a diagnostic is
    // confusing rather than helpful.
    message:
      status === "WRONG_ANSWER" || status === "ACCEPTED"
        ? null
        : scrub(outcome.message),
    outcomes,
  };
}

/** What a caller gets when the failure was ours. No case is marked as run. */
function systemError(request: ExecuteRequest): ExecuteResponse {
  return {
    status: "SYSTEM_ERROR",
    executionTime: null,
    memoryUsed: null,
    message: null,
    outcomes: request.tests.map((test) => ({
      order: test.order,
      passed: false,
      actualOutput: null,
    })),
  };
}
