import type { CodeLanguage, SubmissionStatus } from "@/generated/prisma/client";

/**
 * The contract between CodeCompass and whatever runs learner code.
 *
 * The application deliberately knows nothing about *how* execution happens. It
 * hands over a request and receives a result; whether that was a container, a
 * WASM runtime or a third-party judge is not its business. That is what makes
 * the provider swappable, and it is also what keeps the rule enforceable:
 * nothing on this side of the interface may ever run the code itself.
 *
 * Non-negotiable: no implementation of CodeExecutionService that lives inside
 * this repository may use eval, new Function, vm, child_process, worker_threads
 * or any equivalent. User code is hostile input.
 */

/** A status an execution can *finish* in. QUEUED and RUNNING are ours, not the service's. */
export type ExecutionStatus = Exclude<SubmissionStatus, "QUEUED" | "RUNNING">;

export interface ExecutionTestCase {
  /** 1-based, matching PracticeTestCase.order. */
  order: number;
  /** JSON array of arguments. */
  input: string;
  /** JSON value. */
  expectedOutput: string;
  /**
   * Whether this case is hidden from the learner. The service is told so it can
   * withhold detail; the application never sends hidden cases to the browser
   * regardless of what the service returns.
   */
  isHidden: boolean;
}

export interface ExecutionRequest {
  language: CodeLanguage;
  /** Untrusted. Treat as hostile at every layer below this one. */
  code: string;
  /** The function the harness must call — camelCase, or snake_case for Python. */
  entryPoint: string;
  tests: ExecutionTestCase[];
  timeLimitMs: number;
  memoryLimitMb: number;

  /**
   * Development provider only, and never transmitted: the HTTP provider builds
   * its payload field by field precisely so this cannot ride along. It exists
   * because the mock provider has no way to *run* anything and must compare
   * against something to produce a deterministic verdict.
   */
  development?: {
    starterCode: string;
    /** The answer key. Must not leave the server under any circumstances. */
    referenceSolution: string | null;
  };
}

export interface ExecutionTestOutcome {
  order: number;
  passed: boolean;
  /**
   * What the learner's function actually returned, JSON-encoded. Null when the
   * case never ran (a compile error, or a timeout that ended the batch).
   */
  actualOutput: string | null;
  isHidden: boolean;
}

export interface ExecutionResult {
  status: ExecutionStatus;
  passedTests: number;
  totalTests: number;
  /** Wall-clock milliseconds, or null when the provider cannot measure it. */
  executionTime: number | null;
  /** Peak kilobytes, or null when the provider cannot measure it. */
  memoryUsed: number | null;
  /** Already sanitised: no paths, hosts, or internal identifiers. */
  message: string | null;
  outcomes: ExecutionTestOutcome[];
  /** True when the verdict was simulated rather than executed. */
  simulated: boolean;
}

export interface CodeExecutionService {
  /** Short identifier, for logs and the development banner. */
  readonly name: string;
  /** Whether verdicts from this provider are simulated rather than real. */
  readonly simulated: boolean;
  /** Languages this provider can actually run. Never advertise more. */
  supportedLanguages(): readonly CodeLanguage[];
  execute(request: ExecutionRequest): Promise<ExecutionResult>;
}

/** Hard ceilings applied before a request ever leaves the application. */
export const EXECUTION_LIMITS = {
  /** Longest source we will accept. Generous for a practice problem, tiny for an attack. */
  maxCodeBytes: 64 * 1024,
  /** Longest single captured output we will store or display. */
  maxOutputChars: 2_000,
  /** Longest sanitised compiler/runtime message we will store or display. */
  maxMessageChars: 1_000,
  /** Ceiling on a per-problem time limit, whatever the content says. */
  maxTimeLimitMs: 10_000,
  /** Ceiling on a per-problem memory limit, whatever the content says. */
  maxMemoryLimitMb: 512,
  /** How long we wait on the execution service before giving up on it. */
  serviceTimeoutMs: 20_000,
  /**
   * Runs one learner may start in a rolling window.
   *
   * Execution is the most expensive thing a learner can trigger and the easiest
   * to trigger in a loop, so the ceiling is enforced before a submission row is
   * created rather than inside the sandbox. Set well above honest use: hammering
   * Run while debugging is normal, and 60 an hour is roughly one every minute
   * without pause.
   */
  maxRunsPerWindow: 60,
  runWindowMs: 60 * 60 * 1000,
} as const;
