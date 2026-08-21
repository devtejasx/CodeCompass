import { describe, expect, it } from "vitest";

import {
  SPAWN_RETRY_LIMIT,
  classifyFailure,
  isTimeout,
  shouldRetrySpawn,
} from "../scripts/verify/verdicts";

/**
 * The rules the solution verifier uses to decide what a failed process means.
 *
 * Every one of these exists because getting it wrong made the tooling claim
 * something it had not shown. Java was reported as verified when no JDK was
 * present. Ten C++ solutions were reported as failures when the process had
 * never started. A timeout was retried as though it were a failed spawn, which
 * turned one non-terminating solution into eight sequential minutes of waiting
 * and then described it as a process that would not start.
 *
 * None of that was visible in a test, because the verifier is a script that
 * runs `main()` on import and does its work by spawning three hundred
 * processes. The rules now live in scripts/verify/verdicts, which spawns
 * nothing, so they can be given a fabricated result and asked what they think.
 */

/** A spawnSync result, shaped the way Node returns one. */
function spawnResult(
  overrides: Partial<{
    error: NodeJS.ErrnoException | undefined;
    status: number | null;
    signal: NodeJS.Signals | null;
  }> = {},
) {
  return {
    pid: 1,
    output: [],
    stdout: "",
    stderr: "",
    status: 0 as number | null,
    signal: null as NodeJS.Signals | null,
    error: undefined as NodeJS.ErrnoException | undefined,
    ...overrides,
  } as unknown as ReturnType<typeof import("node:child_process").spawnSync>;
}

const spawnFailure = () => {
  const error: NodeJS.ErrnoException = new Error("spawnSync ...-cpp.exe UNKNOWN");
  error.code = "UNKNOWN";
  return spawnResult({ error, status: null });
};

const timedOut = () => {
  const error: NodeJS.ErrnoException = new Error("ETIMEDOUT");
  error.code = "ETIMEDOUT";
  return spawnResult({ error, status: null, signal: "SIGTERM" });
};

describe("telling a timeout from a failed spawn", () => {
  it("recognises a timeout by its error code", () => {
    expect(isTimeout(timedOut())).toBe(true);
  });

  it("recognises a timeout that only surfaced as a signal", () => {
    // Windows can kill the process without setting ETIMEDOUT, leaving the
    // signal as the only evidence.
    const error: NodeJS.ErrnoException = new Error("killed");
    expect(isTimeout(spawnResult({ error, status: null, signal: "SIGTERM" }))).toBe(true);
  });

  it("does not mistake a failed spawn for a timeout", () => {
    expect(isTimeout(spawnFailure())).toBe(false);
  });

  it("does not mistake an ordinary non-zero exit for a timeout", () => {
    expect(isTimeout(spawnResult({ status: 1 }))).toBe(false);
  });
});

describe("what may be retried", () => {
  it("retries a process that never started", () => {
    expect(shouldRetrySpawn(spawnFailure(), 0)).toBe(true);
  });

  it("retries it at most once", () => {
    expect(SPAWN_RETRY_LIMIT).toBe(1);
    expect(shouldRetrySpawn(spawnFailure(), 1)).toBe(false);
    expect(shouldRetrySpawn(spawnFailure(), 7)).toBe(false);
  });

  it("never retries a timeout", () => {
    // The whole point of separating the two. A timeout is the process telling
    // us what it does; running it again just costs another minute.
    expect(shouldRetrySpawn(timedOut(), 0)).toBe(false);
  });

  it("never retries a process that ran and exited non-zero", () => {
    // It ran. What it did is the answer, however unwelcome.
    expect(shouldRetrySpawn(spawnResult({ status: 1 }), 0)).toBe(false);
  });

  it("terminates: the retry predicate goes false within a bounded loop", () => {
    let attempts = 0;
    while (shouldRetrySpawn(spawnFailure(), attempts)) {
      attempts += 1;
      // A guard, so a predicate that never went false would fail the test
      // rather than hang the suite.
      if (attempts > 50) break;
    }
    expect(attempts).toBe(SPAWN_RETRY_LIMIT);
  });
});

describe("naming a failure", () => {
  it("calls a process that never started an environment failure", () => {
    const verdict = classifyFailure(
      { stderr: "spawnSync ...-cpp.exe UNKNOWN", timedOut: false, spawnFailed: true },
      "RUNTIME",
    );

    // Never RUNTIME, and never WRONG_ANSWER: the solution has not been run, so
    // nothing has been learned about it.
    expect(verdict.kind).toBe("ENVIRONMENT");
  });

  it("calls a timeout a timeout, whatever step it happened in", () => {
    expect(
      classifyFailure(
        { stderr: "timed out after 60000ms", timedOut: true, spawnFailed: false },
        "COMPILE",
      ).kind,
    ).toBe("TIMEOUT");
  });

  it("keeps the caller's kind when the process actually ran and failed", () => {
    expect(
      classifyFailure(
        { stderr: "error: no matching function", timedOut: false, spawnFailed: false },
        "COMPILE",
      ).kind,
    ).toBe("COMPILE");

    expect(
      classifyFailure(
        { stderr: "TypeError: undefined is not a function", timedOut: false, spawnFailed: false },
        "RUNTIME",
      ).kind,
    ).toBe("RUNTIME");
  });

  it("reports the first line, or the last one where that is the useful one", () => {
    const stderr = "Traceback (most recent call last):\n  File x\nValueError: bad input";

    expect(
      classifyFailure({ stderr, timedOut: false, spawnFailed: false }, "RUNTIME").reason,
    ).toBe("Traceback (most recent call last):");

    // Python puts the exception last, under a header that says nothing.
    expect(
      classifyFailure({ stderr, timedOut: false, spawnFailed: false }, "RUNTIME", true)
        .reason,
    ).toBe("ValueError: bad input");
  });

  it("says something rather than nothing when the stream was empty", () => {
    expect(
      classifyFailure({ stderr: "", timedOut: false, spawnFailed: false }, "RUNTIME")
        .reason,
    ).toBe("run failed");
  });

  it("never returns ok for a failure", () => {
    // The verdict type allows { ok: true }; this helper must never produce it,
    // because "unverified" quietly becoming "passed" is the exact class of bug
    // this module was extracted to prevent.
    for (const run of [
      { stderr: "x", timedOut: true, spawnFailed: false },
      { stderr: "x", timedOut: false, spawnFailed: true },
      { stderr: "x", timedOut: false, spawnFailed: false },
    ]) {
      expect(classifyFailure(run, "RUNTIME").ok).toBe(false);
    }
  });
});
