import type { ExecuteRequest } from "../types.js";
import {
  casesJson,
  RESULTS_FILE,
  WORK_DIR,
  type LanguageRuntime,
  type SandboxProgram,
} from "./types.js";

/**
 * Python.
 *
 * Every name the harness introduces is prefixed, because the learner's source
 * shares this module's namespace and a solution that happens to define `out`
 * or `cases` must not break grading. The prefix is ugly on purpose: it is
 * meant to be unlikely, not pretty.
 *
 * `copy.deepcopy` per case is Python's version of the clone the JavaScript
 * harness does, and for the identical reason - a solution that sorts its input
 * in place should fail one case, not every case after it.
 */

function harness(entryPoint: string): string {
  return [
    ``,
    `def __cc_main():`,
    `    import copy as __cc_copy`,
    `    import json as __cc_json`,
    `    with open("${WORK_DIR}/cases.json", "r", encoding="utf-8") as __cc_f:`,
    `        __cc_cases = __cc_json.load(__cc_f)`,
    `    with open("${RESULTS_FILE}", "w", encoding="utf-8") as __cc_out:`,
    `        for __cc_i, __cc_args in enumerate(__cc_cases):`,
    `            __cc_value = ${entryPoint}(*__cc_copy.deepcopy(__cc_args))`,
    `            __cc_out.write(`,
    `                __cc_json.dumps(`,
    `                    {"i": __cc_i, "v": __cc_value}, separators=(",", ":"), allow_nan=False`,
    `                )`,
    `                + "\\n"`,
    `            )`,
    `            __cc_out.flush()`,
    ``,
    ``,
    `__cc_main()`,
    ``,
  ].join("\n");
}

export const pythonRuntime: LanguageRuntime = {
  language: "PYTHON",
  versionCommand: ["python3", "--version"],
  build(request: ExecuteRequest): SandboxProgram {
    return {
      files: {
        "main.py": `${request.code}\n${harness(request.entryPoint)}`,
        "cases.json": casesJson(request),
      },
      // Compiled to bytecode first, purely so that a syntax error is reported
      // as a compilation error rather than as a crash on the first test case.
      // Python is happy to be told to do this and it costs a few milliseconds.
      compile: ["python3", "-m", "py_compile", `${WORK_DIR}/main.py`],
      // -B suppresses further .pyc writes: the work directory is a small tmpfs
      // and is also the disk limit, so nothing should write to it that was not
      // asked for. -u keeps stderr unbuffered, so a traceback survives a kill.
      run: ["python3", "-B", "-u", `${WORK_DIR}/main.py`],
    };
  },
};
