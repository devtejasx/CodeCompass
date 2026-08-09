import type { SubmissionStatus } from "@/generated/prisma/client";

import type { ExecutionResult, ExecutionTestOutcome } from "./execution/types";

/**
 * Deterministic failure feedback.
 *
 * Phase 6 has no AI, and this is better without one anyway: the rules below are
 * inspectable, identical for every learner, and never confidently wrong. They
 * work by comparing the *shape* of what came back with the shape that was
 * expected — right values in the wrong order, one value short, a string that
 * differs only in capitalisation — which is where beginners actually get stuck.
 *
 * Nothing here reads a hidden test case's data. A hidden failure is described
 * by position and by the general shape of the mismatch only.
 */

export const STATUS_LABEL: Record<SubmissionStatus, string> = {
  QUEUED: "Queued",
  RUNNING: "Running",
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
  TIME_LIMIT: "Time Limit Exceeded",
  MEMORY_LIMIT: "Memory Limit Exceeded",
  COMPILE_ERROR: "Compilation Error",
  RUNTIME_ERROR: "Runtime Error",
  SYSTEM_ERROR: "Execution Unavailable",
};

export type StatusTone = "pending" | "success" | "failure" | "neutral";

export const STATUS_TONE: Record<SubmissionStatus, StatusTone> = {
  QUEUED: "pending",
  RUNNING: "pending",
  ACCEPTED: "success",
  WRONG_ANSWER: "failure",
  TIME_LIMIT: "failure",
  MEMORY_LIMIT: "failure",
  COMPILE_ERROR: "failure",
  RUNTIME_ERROR: "failure",
  SYSTEM_ERROR: "neutral",
};

export function isTerminal(status: SubmissionStatus): boolean {
  return status !== "QUEUED" && status !== "RUNNING";
}

/** What the result panel shows about the first failing case. */
export interface FailureDetail {
  /** 1-based position among the cases that ran. */
  order: number;
  /** Null for a hidden case — its data never leaves the server. */
  input: string | null;
  expectedOutput: string | null;
  actualOutput: string | null;
  isHidden: boolean;
}

export interface GradedFeedback {
  feedback: string | null;
  failure: FailureDetail | null;
}

interface TestCaseData {
  order: number;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

/**
 * Builds the learner-facing explanation and, where it is safe to show, the
 * detail of the first failing case.
 */
export function buildFeedback(
  result: ExecutionResult,
  tests: TestCaseData[],
  options: { timeLimitMs: number; memoryLimitMb: number },
): GradedFeedback {
  if (result.status === "ACCEPTED") {
    return { feedback: null, failure: null };
  }

  if (result.status === "SYSTEM_ERROR") {
    return {
      feedback:
        "Code execution is temporarily unavailable. Your code has not been lost — try running it again in a moment.",
      failure: null,
    };
  }

  if (result.status === "COMPILE_ERROR") {
    return {
      feedback:
        "Your code didn't compile, so none of the tests ran. Compilation errors are almost always a typo — a missing bracket, a missing semicolon, or a name spelled differently from where it was defined. Fix the line reported below and try again.",
      failure: null,
    };
  }

  if (result.status === "RUNTIME_ERROR") {
    return {
      feedback:
        "Your code compiled but stopped part-way through with an error. The usual causes are reading past the end of a list, dividing by zero, or using a value that turned out to be empty. Look at what your code assumes about its input.",
      failure: null,
    };
  }

  if (result.status === "TIME_LIMIT") {
    const seconds = (options.timeLimitMs / 1000).toFixed(1).replace(/\.0$/, "");
    return {
      feedback:
        `Your code was still running after ${seconds} seconds and was stopped. ` +
        "That normally means a loop that never ends — check that whatever your loop is counting actually moves toward the condition that stops it — or a loop inside a loop doing far more work than the problem needs.",
      failure: null,
    };
  }

  if (result.status === "MEMORY_LIMIT") {
    return {
      feedback:
        `Your code used more than ${options.memoryLimitMb}MB of memory and was stopped. ` +
        "Usually that means something is being added to a list or a string on every pass of a loop that never ends, or a copy is being made where the original could have been used.",
      failure: null,
    };
  }

  // ── Wrong answer ──────────────────────────────────────────────────────
  const byOrder = new Map(tests.map((test) => [test.order, test]));
  const firstFailure = result.outcomes.find((outcome) => !outcome.passed);
  const testCase = firstFailure ? byOrder.get(firstFailure.order) : undefined;

  const failure: FailureDetail | null =
    firstFailure && testCase
      ? {
          order: firstFailure.order,
          // The whole point of a hidden case: position only, never data.
          input: testCase.isHidden ? null : testCase.input,
          expectedOutput: testCase.isHidden ? null : testCase.expectedOutput,
          actualOutput: testCase.isHidden ? null : firstFailure.actualOutput,
          isHidden: testCase.isHidden,
        }
      : null;

  return {
    feedback: wrongAnswerFeedback(result, firstFailure, testCase),
    failure,
  };
}

function wrongAnswerFeedback(
  result: ExecutionResult,
  firstFailure: ExecutionTestOutcome | undefined,
  testCase: TestCaseData | undefined,
): string {
  const { passedTests, totalTests } = result;

  // The mock provider and a genuine service both use `message` for the one
  // sentence that explains a non-standard failure; it beats anything derived.
  if (passedTests === 0 && result.message && result.simulated) {
    return result.message;
  }

  const opening =
    passedTests === 0
      ? "None of the test cases passed."
      : `Your solution works for ${passedTests} of ${totalTests} test cases, so the general idea is close — something specific is going wrong.`;

  const shape =
    firstFailure && testCase && !testCase.isHidden
      ? describeMismatch(testCase.expectedOutput, firstFailure.actualOutput)
      : firstFailure && testCase?.isHidden
        ? "The first failure is on a hidden test case, which usually means an edge the examples don't cover — an empty input, a single element, a repeated value, or a negative number."
        : null;

  const closing =
    passedTests > 0 && firstFailure && !testCase?.isHidden
      ? "Try running that case by hand, on paper, and see where your version diverges."
      : null;

  return [opening, shape, closing].filter(Boolean).join(" ");
}

/**
 * Names the difference between what was expected and what came back.
 *
 * Purely structural, and it degrades gracefully: anything it cannot classify
 * simply produces no extra sentence rather than a guess.
 */
function describeMismatch(
  expectedJson: string,
  actualJson: string | null,
): string | null {
  if (actualJson === null) {
    return "Your function returned nothing for that case. Check that every path through it ends in a return.";
  }

  let expected: unknown;
  let actual: unknown;
  try {
    expected = JSON.parse(expectedJson);
    actual = JSON.parse(actualJson);
  } catch {
    return null;
  }

  if (actual === null || actual === undefined) {
    return "Your function returned nothing for that case. Check that every path through it ends in a return.";
  }

  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (expected.length !== actual.length) {
      return `You produced ${actual.length} value${actual.length === 1 ? "" : "s"} where ${expected.length} were expected, so something is being skipped or counted twice.`;
    }
    const sameSet =
      JSON.stringify([...expected].map(String).sort()) ===
      JSON.stringify([...actual].map(String).sort());
    if (sameSet) {
      return "The values are right but the order is wrong — check the order you add things to your result.";
    }
    return "The list is the right length but some of its values are wrong. Compare it element by element with the expected output below.";
  }

  if (Array.isArray(expected) !== Array.isArray(actual)) {
    return "You returned a single value where a list was expected, or the other way round. Check what the problem statement asks the function to return.";
  }

  if (typeof expected !== typeof actual) {
    return `You returned a ${typeof actual} where a ${typeof expected} was expected — often a number that was turned into text, or text that was never converted.`;
  }

  if (typeof expected === "number" && typeof actual === "number") {
    const difference = actual - expected;
    if (difference === 1 || difference === -1) {
      return "You are out by exactly one, which almost always means a loop that starts or stops one step off.";
    }
    if (expected !== 0 && actual === 0) {
      return "You returned 0. Check the value your running total or counter starts at.";
    }
    return "The number is wrong for this case — work through it by hand and compare each step.";
  }

  if (typeof expected === "string" && typeof actual === "string") {
    if (expected.toLowerCase() === actual.toLowerCase()) {
      return "Your answer differs from the expected one only in capitalisation.";
    }
    if (expected === actual.trim() || expected.trim() === actual) {
      return "Your answer has extra whitespace at the start or end.";
    }
    if (expected === [...actual].reverse().join("")) {
      return "Your answer is the expected one reversed — check the direction you are building the string in.";
    }
    if (actual.length === 0) {
      return "You returned an empty string. Check that the value you build up is actually returned.";
    }
    return null;
  }

  if (typeof expected === "boolean") {
    return "You returned the opposite of what was expected for this case — check the direction of your comparison.";
  }

  return null;
}
