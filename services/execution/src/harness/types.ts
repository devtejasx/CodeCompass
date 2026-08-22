import type { ExecuteRequest, Language } from "../types.js";

/**
 * The language runtime abstraction.
 *
 * Everything a language needs in order to be graded lives behind this
 * interface: what files to write, whether there is a compile step, and what
 * command runs the result. Nothing else in the service knows that Java has a
 * compiler or that Python does not.
 *
 * That containment is the point. Adding a sixth language is one file
 * implementing LanguageRuntime and one line in the registry; it is not a
 * search for every place a command line was spelled out.
 */

/** Where the sandbox keeps everything. Fixed, so no host path is ever in scope. */
export const WORK_DIR = "/work";
/** Read-only, baked into the image: the runner and its precompiled Java harness. */
export const RUNNER_DIR = "/opt/cc";
/** The harness writes one JSON object per graded case here, and nothing else does. */
export const RESULTS_FILE = `${WORK_DIR}/results.jsonl`;

export interface SandboxProgram {
  /**
   * Files to materialise in the work directory, keyed by name. Written by the
   * in-container runner, which is the only thing that touches the filesystem.
   */
  files: Record<string, string>;
  /**
   * The compile command, or null when the language has none. A non-zero exit
   * here is a COMPILE_ERROR and no test case is considered to have run.
   */
  compile: string[] | null;
  /** The command that runs the learner's program. */
  run: string[];
}

export interface LanguageRuntime {
  readonly language: Language;
  /**
   * The toolchain this runtime drives, as it is spelled in the runner image.
   * Reported by the health check so an operator can see what is actually
   * installed rather than what the documentation claims.
   */
  readonly versionCommand: string[];
  build(request: ExecuteRequest): SandboxProgram;
}

/** The argument lists for every case, as the harness will read them. */
export function casesJson(request: ExecuteRequest): string {
  return JSON.stringify(request.tests.map((test) => JSON.parse(test.input) as unknown));
}
