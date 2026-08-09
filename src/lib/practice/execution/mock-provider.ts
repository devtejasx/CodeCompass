import type { CodeLanguage } from "@/generated/prisma/client";

import type {
  CodeExecutionService,
  ExecutionRequest,
  ExecutionResult,
  ExecutionStatus,
  ExecutionTestOutcome,
} from "./types";

/**
 * The development execution provider.
 *
 * IT DOES NOT RUN CODE. It cannot: running untrusted code inside the
 * application is exactly what Phase 6 forbids, and no amount of "just for dev"
 * makes eval, new Function, vm or child_process acceptable in this process.
 *
 * What it does instead is return a *deterministic, clearly-labelled* verdict so
 * the practice UI, the submission lifecycle and the progress rules can be built
 * and tested end to end without a sandbox. Every result it produces carries
 * `simulated: true`, and the UI shows a permanent banner saying so.
 *
 * The rules, in order:
 *
 *   1. A `@mock:<status>` marker in the source forces that status. This is how
 *      the test suite and a developer exercise every result state — compile
 *      error, timeout, memory limit and so on — without needing a compiler.
 *   2. Source still identical to the starter code fails with nothing passed.
 *   3. Source matching the authored reference solution is accepted.
 *   4. Anything else fails, and says plainly that the development provider
 *      cannot grade arbitrary code.
 *
 * Rule 4 is the honest one. A real sandbox is required before this is a real
 * judge — see docs/code-execution.md.
 */

/** Recognised in a comment, in any of the five languages' comment syntaxes. */
const MARKER =
  /@mock:(accepted|wrong|timeout|memory|compile-error|runtime-error|system-error)\b/i;

const MARKER_STATUS: Record<string, ExecutionStatus> = {
  accepted: "ACCEPTED",
  wrong: "WRONG_ANSWER",
  timeout: "TIME_LIMIT",
  memory: "MEMORY_LIMIT",
  "compile-error": "COMPILE_ERROR",
  "runtime-error": "RUNTIME_ERROR",
  "system-error": "SYSTEM_ERROR",
};

const MARKER_MESSAGE: Partial<Record<ExecutionStatus, string>> = {
  COMPILE_ERROR: "Line 2: unexpected token — simulated compile error.",
  RUNTIME_ERROR: "TypeError: cannot read a property of undefined — simulated.",
  MEMORY_LIMIT: "The program used more memory than the limit allows.",
  TIME_LIMIT: "The program was still running when the time limit was reached.",
  SYSTEM_ERROR: "The execution service reported an internal error.",
};

const ALL_LANGUAGES: readonly CodeLanguage[] = [
  "JAVASCRIPT",
  "TYPESCRIPT",
  "PYTHON",
  "JAVA",
  "CPP",
];

/**
 * Strips comments and collapses whitespace, so "did they change anything?" is
 * not defeated by reformatting or by deleting the placeholder comment.
 */
export function normaliseSource(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/[^\n]*/g, " ")
    .replace(/#[^\n]*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export class MockExecutionService implements CodeExecutionService {
  readonly name = "mock";
  readonly simulated = true;

  supportedLanguages(): readonly CodeLanguage[] {
    return ALL_LANGUAGES;
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const total = request.tests.length;

    const marker = request.code.match(MARKER);
    if (marker) {
      return this.markerResult(request, MARKER_STATUS[marker[1].toLowerCase()]);
    }

    const submitted = normaliseSource(request.code);
    const starter = normaliseSource(request.development?.starterCode ?? "");
    const reference = request.development?.referenceSolution;

    if (starter.length > 0 && submitted === starter) {
      return this.failure(
        request,
        "You haven't changed the starter code yet. Write your solution inside the function, then run it again.",
      );
    }

    if (reference && submitted === normaliseSource(reference)) {
      return {
        status: "ACCEPTED",
        passedTests: total,
        totalTests: total,
        // A simulated run measures nothing, so it reports nothing rather than
        // inventing a plausible-looking number.
        executionTime: null,
        memoryUsed: null,
        message: null,
        outcomes: request.tests.map((test) => ({
          order: test.order,
          passed: true,
          actualOutput: test.expectedOutput,
          isHidden: test.isHidden,
        })),
        simulated: true,
      };
    }

    return this.failure(
      request,
      "The development execution provider cannot run code, so it can only recognise the reference solution. Connect a sandboxed execution service to grade real submissions.",
    );
  }

  private failure(request: ExecutionRequest, message: string): ExecutionResult {
    return {
      status: "WRONG_ANSWER",
      passedTests: 0,
      totalTests: request.tests.length,
      executionTime: null,
      memoryUsed: null,
      message,
      outcomes: request.tests.map((test) => ({
        order: test.order,
        passed: false,
        actualOutput: null,
        isHidden: test.isHidden,
      })),
      simulated: true,
    };
  }

  /**
   * A forced status. Failures pass everything up to the first case and stop
   * there, which is what a real judge does and what the result panel has to
   * render correctly.
   */
  private markerResult(
    request: ExecutionRequest,
    status: ExecutionStatus,
  ): ExecutionResult {
    const total = request.tests.length;

    if (status === "ACCEPTED") {
      return {
        status,
        passedTests: total,
        totalTests: total,
        executionTime: null,
        memoryUsed: null,
        message: null,
        outcomes: request.tests.map((test) => ({
          order: test.order,
          passed: true,
          actualOutput: test.expectedOutput,
          isHidden: test.isHidden,
        })),
        simulated: true,
      };
    }

    // Compile errors never reach the tests at all.
    const failFrom = status === "COMPILE_ERROR" ? 0 : Math.max(total - 1, 0);

    const outcomes: ExecutionTestOutcome[] = request.tests.map((test, index) => ({
      order: test.order,
      passed: index < failFrom,
      actualOutput:
        index < failFrom
          ? test.expectedOutput
          : status === "WRONG_ANSWER"
            ? simulatedWrongOutput(test.expectedOutput)
            : null,
      isHidden: test.isHidden,
    }));

    return {
      status,
      passedTests: outcomes.filter((outcome) => outcome.passed).length,
      totalTests: total,
      executionTime: status === "TIME_LIMIT" ? request.timeLimitMs : null,
      memoryUsed: status === "MEMORY_LIMIT" ? request.memoryLimitMb * 1024 : null,
      message: MARKER_MESSAGE[status] ?? null,
      outcomes,
      simulated: true,
    };
  }
}

/**
 * A wrong-but-plausible value of the right shape, so the result panel's
 * expected-versus-actual rendering can be exercised.
 */
function simulatedWrongOutput(expected: string): string {
  try {
    const value: unknown = JSON.parse(expected);
    if (typeof value === "number") return JSON.stringify(value === 0 ? 1 : 0);
    if (typeof value === "boolean") return JSON.stringify(!value);
    if (typeof value === "string") return JSON.stringify("");
    if (Array.isArray(value)) return JSON.stringify(value.slice(0, -1));
  } catch {
    // Fall through to the generic answer below.
  }
  return JSON.stringify(null);
}
