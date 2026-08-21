import type { spawnSync } from "node:child_process";

/**
 * How the solution verifier decides what a failed process *means*.
 *
 * Split out of verify-solutions.ts so it can be tested without running three
 * hundred solutions. That script runs `main()` on import, and these are the
 * rules most worth pinning: every one of them exists because getting it wrong
 * once made the tooling claim something it had not shown.
 *
 * Nothing here spawns anything or touches a file. It is given the result of a
 * process that has already run, and answers two questions: should this be
 * attempted again, and what should it be called.
 */

/**
 * How a reference solution failed, not merely that it did.
 *
 * A run that prints "12 failing solutions" is a list of twelve things to read;
 * the same run split into "1 wrong answer, 11 that never started" is a
 * diagnosis. The kinds are acted on differently — a wrong answer means the
 * answer key and the statement disagree and one of them needs fixing, a
 * compile error is usually a missing header, and ENVIRONMENT means nothing
 * about the solution at all.
 */
export type FailureKind =
  | "COMPILE"
  | "RUNTIME"
  | "TIMEOUT"
  | "WRONG_ANSWER"
  | "OUTPUT"
  /**
   * The process never started. On Windows this arrives as an opaque UNKNOWN
   * from spawnSync when something local — a virus scanner, most likely — holds
   * a freshly compiled executable closed for a moment. It is kept out of every
   * other bucket because a solution must never be called wrong on this
   * evidence.
   */
  | "ENVIRONMENT";

export type Verdict =
  | { ok: true }
  | {
      ok: false;
      kind: FailureKind;
      reason: string;
      caseIndex?: number;
      expected?: string;
      actual?: string;
    };

/** What runProcess reports back about a process that has finished. */
export interface ProcessOutcome {
  ok: boolean;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  spawnFailed: boolean;
}

/**
 * Whether spawnSync killed this process for running past its `timeout`.
 *
 * Node reports it as an error with code ETIMEDOUT on most platforms, but on
 * Windows the kill can surface only as the signal, so both are accepted.
 */
export function isTimeout(result: ReturnType<typeof spawnSync>): boolean {
  const code = (result.error as NodeJS.ErrnoException | undefined)?.code;
  return code === "ETIMEDOUT" || (Boolean(result.error) && result.signal !== null);
}

/**
 * One retry, and only for a process that never started.
 *
 * A spawn failure is not a verdict, so it is worth attempting again. A timeout
 * is the opposite kind of event — spawnSync reporting that the process *did*
 * start and then ran past its limit — so retrying it would spend a minute per
 * attempt re-learning that a solution does not terminate, and would bury that
 * fact inside a message about failing to start.
 *
 * A non-zero exit status is not retried either: the process ran, and what it
 * did is the answer.
 *
 * Bounded at one deliberately. An escalating inline backoff used to sit here,
 * from before the run ended with a recovery pass over everything classified
 * ENVIRONMENT; that pass is what actually clears these, because it runs once
 * the whole catalog has stopped handing fresh executables to the scanner.
 * Retrying eight times inline only moved the waiting earlier.
 */
export const SPAWN_RETRY_LIMIT = 1;

export function shouldRetrySpawn(
  result: ReturnType<typeof spawnSync>,
  attemptsSoFar: number,
): boolean {
  if (attemptsSoFar >= SPAWN_RETRY_LIMIT) return false;
  if (!result.error) return false;
  return !isTimeout(result);
}

/**
 * Names a failed process, letting how it failed override the caller's guess.
 *
 * The caller knows what it was doing — compiling, or running — and passes that
 * as `kind`. A timeout or a failed spawn outranks it, because those are facts
 * about the process rather than about the step.
 *
 * `last` picks the useful line out of the stream: Python puts the exception on
 * the final line under a traceback header, everything else puts it first.
 */
export function classifyFailure(
  run: Pick<ProcessOutcome, "stderr" | "timedOut" | "spawnFailed">,
  kind: FailureKind,
  last = false,
): Extract<Verdict, { ok: false }> {
  if (run.timedOut) return { ok: false, kind: "TIMEOUT", reason: run.stderr };

  const lines = run.stderr.trim().split("\n");
  const reason = (last ? lines[lines.length - 1] : lines[0]) || "run failed";

  return { ok: false, kind: run.spawnFailed ? "ENVIRONMENT" : kind, reason };
}
