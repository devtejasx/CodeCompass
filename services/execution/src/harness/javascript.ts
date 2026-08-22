import type { ExecuteRequest } from "../types.js";
import {
  casesJson,
  RESULTS_FILE,
  WORK_DIR,
  type LanguageRuntime,
  type SandboxProgram,
} from "./types.js";

/**
 * JavaScript and TypeScript.
 *
 * One harness, two runtimes: TypeScript is transpiled to the same module and
 * then runs through the same node command, which is exactly the relationship
 * the two have everywhere else in CodeCompass.
 *
 * The harness writes return values to a *file* rather than to stdout, and that
 * is deliberate. A learner debugging with console.log should be able to leave
 * the console.log in; if results shared a channel with their printing, every
 * stray log would corrupt the grading protocol and be reported as a wrong
 * answer they could not explain.
 *
 * Arguments are cloned per case for the same reason the reference-solution
 * verifier clones them: a solution that sorts its input in place must not be
 * able to turn one bug into five by corrupting the cases that follow it.
 */

function harness(entryPoint: string): string {
  return [
    `const { openSync, writeSync, closeSync, readFileSync } = require("node:fs");`,
    `const __ccCases = JSON.parse(readFileSync("${WORK_DIR}/cases.json", "utf8"));`,
    `const __ccOut = openSync("${RESULTS_FILE}", "w");`,
    `for (let __ccI = 0; __ccI < __ccCases.length; __ccI += 1) {`,
    `  const __ccValue = ${entryPoint}(...structuredClone(__ccCases[__ccI]));`,
    // undefined has no JSON encoding, and a function that falls off the end
    // returns it. Recording null is what the other four languages do for their
    // own equivalent, so the learner sees one wrong answer, not five shapes.
    `  writeSync(__ccOut, JSON.stringify({ i: __ccI, v: __ccValue === undefined ? null : __ccValue }) + "\\n");`,
    `}`,
    `closeSync(__ccOut);`,
    ``,
  ].join("\n");
}

/**
 * CommonJS, not ESM, and the reason is the learner's source rather than ours.
 * Starter code is a bare `function name(...)` declaration, which is a script
 * and not a module; requiring it to be a module would make every solution that
 * used top-level `await` or omitted an export behave differently from the one
 * the verifier certified.
 */
function nodeCommand(memoryLimitMb: number, entry: string): string[] {
  return [
    "node",
    // The container's memory cap is the real limit; this makes V8 give up at
    // the same number rather than being OOM-killed mid-collection, which is
    // what turns "memory limit" into a clean verdict instead of a signal.
    `--max-old-space-size=${memoryLimitMb}`,
    entry,
  ];
}

export const javascriptRuntime: LanguageRuntime = {
  language: "JAVASCRIPT",
  versionCommand: ["node", "--version"],
  build(request: ExecuteRequest): SandboxProgram {
    return {
      files: {
        "main.js": `${request.code}\n${harness(request.entryPoint)}`,
        "cases.json": casesJson(request),
      },
      /*
       * A syntax check, so that a missing bracket is a COMPILE_ERROR.
       *
       * JavaScript has no compiler, which is exactly why this is here: without
       * it, a typo and a crash halfway through the third test case are the same
       * verdict, and the feedback for one is useless advice for the other. The
       * check parses and exits; it runs nothing.
       */
      compile: ["node", "--check", `${WORK_DIR}/main.js`],
      run: nodeCommand(request.memoryLimitMb, `${WORK_DIR}/main.js`),
    };
  },
};

export const typescriptRuntime: LanguageRuntime = {
  language: "TYPESCRIPT",
  versionCommand: ["esbuild", "--version"],
  build(request: ExecuteRequest): SandboxProgram {
    return {
      files: {
        "main.ts": `${request.code}\n${harness(request.entryPoint)}`,
        "cases.json": casesJson(request),
      },
      /*
       * Transpiled, not type-checked, and that matches the convention the
       * repository already set in scripts/verify-solutions.ts, which runs the
       * authored TypeScript solutions through tsx. Two consequences worth
       * being explicit about, because a learner will meet both:
       *
       *   A syntax error is a COMPILE_ERROR, because esbuild refuses to parse.
       *   A *type* error is not - it is erased, and the program runs. If it
       *   then does something a type would have prevented, that surfaces as a
       *   runtime error or a wrong answer.
       *
       * Type-checking here instead would mean running tsc against a strict
       * config the starter code was not written for, and failing submissions
       * the reference solutions themselves have never been checked against.
       */
      compile: [
        "esbuild",
        `${WORK_DIR}/main.ts`,
        "--format=cjs",
        "--platform=node",
        "--target=node20",
        `--outfile=${WORK_DIR}/main.js`,
        "--log-level=warning",
      ],
      run: nodeCommand(request.memoryLimitMb, `${WORK_DIR}/main.js`),
    };
  },
};
