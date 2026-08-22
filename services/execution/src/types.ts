/**
 * The execution service's own vocabulary.
 *
 * Two contracts meet in this file and they are deliberately not the same one.
 *
 *   The *wire* contract (ExecuteRequest / ExecuteResponse) is what CodeCompass
 *   speaks. It is fixed by docs/code-execution.md in the application repository
 *   and must not drift: the application validates every response against it and
 *   re-keys outcomes against its own test list, so a change here that the
 *   application has not agreed to shows up as SYSTEM_ERROR, not as a new
 *   feature.
 *
 *   The *internal* contract (Verdict, SandboxOutcome) is richer. It
 *   distinguishes an output bomb from a fork bomb from a compiler that could
 *   not be started, because those need different logs and different operator
 *   responses even though several of them collapse to the same thing a learner
 *   is shown.
 *
 * Nothing in this service trusts its input. `code` is hostile by assumption,
 * `tests` are ours but arrive over a network, and everything the sandbox prints
 * is output produced by hostile code.
 */

export const LANGUAGES = ["JAVASCRIPT", "TYPESCRIPT", "PYTHON", "JAVA", "CPP"] as const;

export type Language = (typeof LANGUAGES)[number];

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);
}

/** One graded case, exactly as the application sends it. */
export interface WireTestCase {
  /** 1-based, matching PracticeTestCase.order. Echoed back untouched. */
  order: number;
  /** A JSON array of arguments. */
  input: string;
  /** A JSON value. */
  expectedOutput: string;
}

export interface ExecuteRequest {
  language: Language;
  /** Untrusted. Never interpreted, parsed or executed outside a sandbox. */
  code: string;
  /** The function the harness calls - camelCase, or snake_case for Python. */
  entryPoint: string;
  tests: WireTestCase[];
  timeLimitMs: number;
  memoryLimitMb: number;
}

/**
 * The statuses the application's SubmissionStatus enum can store.
 *
 * OUTPUT_LIMIT is the newest and was added to that enum for this service: a
 * program that prints without stopping is a distinct, common and teachable
 * mistake, and reporting it as a runtime error taught the learner nothing.
 */
export type WireStatus =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT"
  | "MEMORY_LIMIT"
  | "OUTPUT_LIMIT"
  | "COMPILE_ERROR"
  | "RUNTIME_ERROR"
  | "SYSTEM_ERROR";

export interface WireOutcome {
  order: number;
  passed: boolean;
  /** JSON-encoded return value, or null when the case never ran. */
  actualOutput: string | null;
}

export interface ExecuteResponse {
  status: WireStatus;
  executionTime: number | null;
  memoryUsed: number | null;
  message: string | null;
  outcomes: WireOutcome[];
}

/**
 * The service's internal verdict, before it is narrowed to something the
 * application's enum can hold.
 *
 * PROCESS_LIMIT, ENVIRONMENT_ERROR and INTERNAL_ERROR exist because an operator
 * reading a log needs to tell "their fork bomb was contained" from "the runner
 * image is missing" from "we have a bug", and all three would otherwise be the
 * same line. See `narrow` below for what each becomes on the wire, and
 * docs/code-execution.md for why the enum was not grown to hold all of them.
 */
export type Verdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "COMPILE_ERROR"
  | "RUNTIME_ERROR"
  | "TIME_LIMIT"
  | "MEMORY_LIMIT"
  | "OUTPUT_LIMIT"
  | "PROCESS_LIMIT"
  | "ENVIRONMENT_ERROR"
  | "INTERNAL_ERROR";

/**
 * Internal verdict to wire status.
 *
 * A process limit is reported as a runtime error because that is what the
 * learner experienced: their program asked for a thread it could not have and
 * died. An environment error and an internal error are both SYSTEM_ERROR, which
 * the application treats as *not the learner's fault* - no attempt is recorded
 * and no progress moves.
 */
export function narrow(verdict: Verdict): WireStatus {
  switch (verdict) {
    case "PROCESS_LIMIT":
      return "RUNTIME_ERROR";
    case "ENVIRONMENT_ERROR":
    case "INTERNAL_ERROR":
      return "SYSTEM_ERROR";
    default:
      return verdict;
  }
}

/** What one case produced, before comparison. */
export interface CaseResult {
  /** 0-based index into the request's test list. */
  index: number;
  /** The JSON-encoded value the learner's function returned. */
  value: string;
}

/** What the sandbox reports back about one whole run. */
export interface SandboxOutcome {
  verdict: Verdict;
  /** Values produced, in order, for as many cases as the program got through. */
  results: CaseResult[];
  /** Wall-clock milliseconds spent running the program (not compiling it). */
  durationMs: number | null;
  /** Peak resident set size in kilobytes, or null when it could not be read. */
  memoryKb: number | null;
  /** Raw compiler or runtime text. Scrubbed before it leaves the service. */
  message: string | null;
}
