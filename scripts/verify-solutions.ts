import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { PROBLEMS } from "../prisma/seed/problems";
import { entryPointFor, renderSource } from "../prisma/seed/problems/starter";
import type {
  SeedLanguage,
  SeedProblem,
  SeedTestCase,
  ValueType,
} from "../prisma/seed/problems/types";
import {
  classifyFailure,
  isTimeout,
  shouldRetrySpawn,
  type FailureKind,
  type Verdict,
} from "./verify/verdicts";

/**
 * Runs every authored reference solution against that problem's own test cases.
 *
 *   npx tsx scripts/verify-solutions.ts [--slug two-sum,three-sum] [--languages JS,PY]
 *
 * Why this exists
 * ───────────────
 * A practice problem is three things that must agree: a statement, a set of
 * expected outputs, and an answer key. Nothing in the seed pipeline checks that
 * the third produces the second. `assertValidProblems` checks shape — a hidden
 * case exists, the argument count matches the signature — and shape is not
 * correctness. A catalog of three hundred problems with hand-computed expected
 * values will contain wrong ones, and every wrong one is a learner told their
 * correct solution is wrong.
 *
 * This is a development script, not part of the application, and the
 * distinction is the whole point. The rule the application lives under is that
 * *learner* code is never executed inside CodeCompass — it is hostile input,
 * and it goes to the sandboxed execution service behind CodeExecutionService.
 * What runs here is content from this repository, on a developer's machine,
 * before it is ever seeded. Nothing in src/ imports this file, and it opens no
 * database connection.
 *
 * Coverage is four of the five languages: JavaScript and TypeScript through
 * node and tsx, Python through python3, C++ through g++.
 *
 * Java is skipped in all cases, and the reason is worth stating precisely
 * rather than as "no JDK": this script has no Java harness at all, so even on a
 * machine with a JDK installed it would still have nothing to run. The summary
 * reports Java as authored-and-skipped with that reason attached, and `verify`
 * throws if it is ever reached for Java, because the one thing this script must
 * never do is let a language it did not execute appear in the passed column.
 */

interface Options {
  slug?: string;
  languages: SeedLanguage[];
  problems: SeedProblem[];
}

/**
 * Authoring a pattern file means re-checking thirty problems, not one or all
 * of them, so --slug takes a comma-separated list. A slug that matches nothing
 * is an error rather than a silent no-op — a typo there would otherwise look
 * exactly like a clean run.
 */
function selectProblems(slugs: string[]): SeedProblem[] {
  const wanted = new Set(slugs);
  const found = PROBLEMS.filter((problem) => wanted.has(problem.slug));
  const missing = slugs.filter(
    (slug) => !found.some((problem) => problem.slug === slug),
  );
  if (missing.length > 0) {
    console.error(`No problem with slug ${missing.map((s) => `"${s}"`).join(", ")}.`);
    process.exit(1);
  }
  return found;
}

const ALL_LANGUAGES: SeedLanguage[] = [
  "JAVASCRIPT",
  "TYPESCRIPT",
  "PYTHON",
  "JAVA",
  "CPP",
];

const LANGUAGE_ALIASES: Record<string, SeedLanguage> = {
  js: "JAVASCRIPT",
  javascript: "JAVASCRIPT",
  ts: "TYPESCRIPT",
  typescript: "TYPESCRIPT",
  py: "PYTHON",
  python: "PYTHON",
  java: "JAVA",
  cpp: "CPP",
  "c++": "CPP",
};

const WORK_DIR = path.join(tmpdir(), "codecompass-verify");

/** Floats are compared with a tolerance; everything else is exact. */
const EPSILON = 1e-6;

// ── Value comparison ────────────────────────────────────────────────────────

function equalValues(expected: unknown, actual: unknown): boolean {
  if (typeof expected === "number" && typeof actual === "number") {
    if (Number.isInteger(expected) && Number.isInteger(actual)) {
      return expected === actual;
    }
    return Math.abs(expected - actual) <= EPSILON;
  }
  if (Array.isArray(expected) && Array.isArray(actual)) {
    return (
      expected.length === actual.length &&
      expected.every((value, index) => equalValues(value, actual[index]))
    );
  }
  return JSON.stringify(expected) === JSON.stringify(actual);
}

/** Compares a whole run: one produced value per test case, in order. */
function compareRun(problem: SeedProblem, produced: unknown[]): Verdict {
  if (produced.length !== problem.tests.length) {
    return {
      ok: false,
      kind: "OUTPUT",
      reason: `harness produced ${produced.length} results for ${problem.tests.length} cases`,
    };
  }
  for (const [index, test] of problem.tests.entries()) {
    if (!equalValues(test.expected, produced[index])) {
      return {
        ok: false,
        kind: "WRONG_ANSWER",
        reason: "wrong answer",
        caseIndex: index,
        expected: JSON.stringify(test.expected),
        actual: JSON.stringify(produced[index]),
      };
    }
  }
  return { ok: true };
}

// ── Harness generation ──────────────────────────────────────────────────────

function casesJson(tests: SeedTestCase[]): string {
  return JSON.stringify(tests.map((test) => test.args));
}

function javascriptHarness(problem: SeedProblem, source: string): string {
  const entry = entryPointFor(problem.signature.name, "JAVASCRIPT");
  return (
    `${source}\n` +
    `const CASES = ${casesJson(problem.tests)};\n` +
    // structuredClone per call: a solution that mutates its argument must not
    // be able to corrupt a later case and turn one bug into five.
    `const out = CASES.map((args) => ${entry}(...structuredClone(args)));\n` +
    `console.log(JSON.stringify(out));\n`
  );
}

function typescriptHarness(problem: SeedProblem, source: string): string {
  const entry = entryPointFor(problem.signature.name, "TYPESCRIPT");
  return (
    `${source}\n` +
    `const CASES: unknown[][] = ${casesJson(problem.tests)};\n` +
    `const call = ${entry} as unknown as (...args: unknown[]) => unknown;\n` +
    `const out = CASES.map((args) => call(...structuredClone(args)));\n` +
    `console.log(JSON.stringify(out));\n` +
    `export {};\n`
  );
}

function pythonHarness(problem: SeedProblem, source: string): string {
  const entry = entryPointFor(problem.signature.name, "PYTHON");
  return (
    `import json\n` +
    `${source}\n` +
    `CASES = json.loads(${JSON.stringify(casesJson(problem.tests))})\n` +
    `print(json.dumps([${entry}(*args) for args in CASES], separators=(",", ":")))\n`
  );
}

/**
 * C++ needs its arguments as literals rather than as JSON, so the harness is
 * generated from the signature: each parameter type knows how to spell itself,
 * and the return type knows how to print itself back as JSON.
 */
function cppLiteral(type: ValueType, value: unknown): string {
  switch (type) {
    case "int":
      return String(value);
    case "float":
      return Number(value).toPrecision(17);
    case "bool":
      return value ? "true" : "false";
    case "string":
      return JSON.stringify(String(value));
    case "int[]":
      return `vector<int>{${(value as number[]).join(", ")}}`;
    case "float[]":
      return `vector<double>{${(value as number[]).map((n) => n.toPrecision(17)).join(", ")}}`;
    case "string[]":
      return `vector<string>{${(value as string[]).map((s) => JSON.stringify(s)).join(", ")}}`;
    case "int[][]":
      return `vector<vector<int>>{${(value as number[][])
        .map((row) => `{${row.join(", ")}}`)
        .join(", ")}}`;
    case "int?[]":
      return `vector<optional<int>>{${(value as (number | null)[])
        .map((entry) => (entry === null ? "nullopt" : `optional<int>(${entry})`))
        .join(", ")}}`;
  }
}

/** Emits C++ that prints one returned value as JSON. */
function cppPrinter(type: ValueType, expression: string): string {
  switch (type) {
    case "int":
      return `cout << ${expression};`;
    case "float":
      return `cout << setprecision(12) << (double)(${expression});`;
    case "bool":
      return `cout << ((${expression}) ? "true" : "false");`;
    case "string":
      return `printString(${expression});`;
    case "int[]":
      return `printIntVector(${expression});`;
    case "float[]":
      return `printDoubleVector(${expression});`;
    case "string[]":
      return `printStringVector(${expression});`;
    case "int[][]":
      return `printIntMatrix(${expression});`;
    case "int?[]":
      return `printOptionalVector(${expression});`;
  }
}

const CPP_HELPERS = `
#include <iomanip>
#include <iostream>

static void printString(const string& value) {
  cout << '"';
  for (char c : value) {
    if (c == '"' || c == '\\\\') cout << '\\\\' << c;
    else if (c == '\\n') cout << "\\\\n";
    else cout << c;
  }
  cout << '"';
}
static void printIntVector(const vector<int>& values) {
  cout << '[';
  for (size_t i = 0; i < values.size(); ++i) { if (i) cout << ','; cout << values[i]; }
  cout << ']';
}
static void printDoubleVector(const vector<double>& values) {
  cout << '[';
  for (size_t i = 0; i < values.size(); ++i) { if (i) cout << ','; cout << setprecision(12) << values[i]; }
  cout << ']';
}
static void printStringVector(const vector<string>& values) {
  cout << '[';
  for (size_t i = 0; i < values.size(); ++i) { if (i) cout << ','; printString(values[i]); }
  cout << ']';
}
static void printIntMatrix(const vector<vector<int>>& rows) {
  cout << '[';
  for (size_t i = 0; i < rows.size(); ++i) { if (i) cout << ','; printIntVector(rows[i]); }
  cout << ']';
}
static void printOptionalVector(const vector<optional<int>>& values) {
  cout << '[';
  for (size_t i = 0; i < values.size(); ++i) {
    if (i) cout << ',';
    if (values[i].has_value()) cout << *values[i]; else cout << "null";
  }
  cout << ']';
}
`;

function cppHarness(problem: SeedProblem, source: string): string {
  const calls = problem.tests
    .map((test) => {
      const args = problem.signature.params
        .map((param, index) => cppLiteral(param.type, test.args[index]))
        .join(", ");
      return (
        `  { auto result = ${problem.signature.name}(${args});\n` +
        `    ${cppPrinter(problem.signature.returns, "result")} }\n`
      );
    })
    .join("  cout << ',';\n");

  return (
    `${source}\n${CPP_HELPERS}\n` +
    `int main() {\n  cout << '[';\n${calls}  cout << ']' << endl;\n  return 0;\n}\n`
  );
}

// ── Runners ─────────────────────────────────────────────────────────────────

/** A synchronous pause. Everything else here is synchronous; this matches. */
function pause(milliseconds: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function runProcess(
  command: string,
  args: string[],
  cwd: string,
): {
  ok: boolean;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  spawnFailed: boolean;
} {
  // Windows needs a shell to resolve `npx`, `g++` and friends from PATH, but a
  // shell also re-splits an absolute path on its spaces — which is how
  // "C:\Program Files\nodejs\node.exe" becomes the command "C:\Program". So the
  // shell is used only for bare command names, never for a path we already hold.
  const isPath = path.isAbsolute(command);
  const options = {
    cwd,
    encoding: "utf8" as const,
    timeout: 60_000,
    shell: !isPath && process.platform === "win32",
  };

  // Windows occasionally fails to start a freshly written executable with an
  // opaque UNKNOWN error — a virus scanner or the file system still holding the
  // file it was handed a moment ago. It is not a verdict about the solution, so
  // it is worth one more attempt; a non-zero exit status and a timeout are not
  // retried at all. shouldRetrySpawn owns that rule and is tested on its own.
  let result = spawnSync(command, args, options);
  for (let attempt = 0; shouldRetrySpawn(result, attempt); attempt += 1) {
    pause(250);
    result = spawnSync(command, args, options);
  }

  if (isTimeout(result)) {
    return {
      ok: false,
      stdout: result.stdout ?? "",
      stderr: `timed out after ${options.timeout}ms`,
      timedOut: true,
      spawnFailed: false,
    };
  }

  return {
    ok: result.status === 0,
    stdout: result.stdout ?? "",
    stderr: (result.stderr ?? "") + (result.error ? String(result.error.message) : ""),
    timedOut: false,
    // Every retry above is exhausted by this point, so an error still standing
    // means the process could not be started at all — distinct from a process
    // that ran and exited non-zero.
    spawnFailed: Boolean(result.error),
  };
}


function parseAndCompare(problem: SeedProblem, stdout: string): Verdict {
  const line = stdout.trim().split("\n").pop() ?? "";
  let produced: unknown;
  try {
    produced = JSON.parse(line);
  } catch {
    return {
      ok: false,
      kind: "OUTPUT",
      reason: `harness printed something that is not JSON: ${line.slice(0, 120)}`,
    };
  }
  if (!Array.isArray(produced)) {
    return {
      ok: false,
      kind: "OUTPUT",
      reason: "harness did not print an array of results",
    };
  }
  return compareRun(problem, produced);
}

function verify(problem: SeedProblem, language: SeedLanguage, dir: string): Verdict {
  const body = problem.solutions[language];
  if (!body) return { ok: true };

  const source = renderSource(problem.signature, language, body);
  const stem = `${problem.slug}-${language.toLowerCase()}`;

  /** A failed process, named by how it failed rather than that it did. */
  const failed = classifyFailure;

  switch (language) {
    case "JAVASCRIPT": {
      const file = path.join(dir, `${stem}.mjs`);
      writeFileSync(file, javascriptHarness(problem, source));
      const run = runProcess(process.execPath, [file], dir);
      if (!run.ok) return failed(run, "RUNTIME");
      return parseAndCompare(problem, run.stdout);
    }
    case "TYPESCRIPT": {
      const file = path.join(dir, `${stem}.ts`);
      writeFileSync(file, typescriptHarness(problem, source));
      const run = runProcess("npx", ["tsx", file], dir);
      if (!run.ok) return failed(run, "RUNTIME");
      return parseAndCompare(problem, run.stdout);
    }
    case "PYTHON": {
      const file = path.join(dir, `${stem}.py`);
      writeFileSync(file, pythonHarness(problem, source));
      const run = runProcess(PYTHON_COMMAND, [file], dir);
      if (!run.ok) return failed(run, "RUNTIME", true);
      return parseAndCompare(problem, run.stdout);
    }
    case "CPP": {
      const file = path.join(dir, `${stem}.cpp`);
      const binary = path.join(dir, `${stem}.exe`);
      writeFileSync(file, cppHarness(problem, source));
      const compiled = runProcess(
        "g++",
        ["-std=c++17", "-O2", "-o", binary, file],
        dir,
      );
      if (!compiled.ok) {
        const verdict = failed(compiled, "COMPILE");
        return verdict.ok
          ? verdict
          : { ...verdict, reason: `compile error: ${verdict.reason}` };
      }
      const run = runProcess(binary, [], dir);
      if (!run.ok) return failed(run, "RUNTIME");
      return parseAndCompare(problem, run.stdout);
    }
    case "JAVA":
      // Unreachable: main() skips JAVA before reaching here, because this
      // script has no Java harness. It throws rather than returning ok, so that
      // removing that guard fails loudly instead of silently reporting every
      // authored Java solution as verified — which is precisely the claim this
      // tooling must never make on a machine with no JDK.
      throw new Error(
        "verify() has no Java harness; JAVA must be skipped by the caller.",
      );
  }
}

// ── Toolchain detection ─────────────────────────────────────────────────────

const PYTHON_COMMAND = detectPython();

function detectPython(): string {
  for (const candidate of ["python3", "python"]) {
    const probe = spawnSync(candidate, ["--version"], {
      encoding: "utf8",
      shell: process.platform === "win32",
    });
    if (probe.status === 0) return candidate;
  }
  return "python3";
}

function available(command: string, args: string[]): boolean {
  const probe = spawnSync(command, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  return probe.status === 0;
}

// ── Entry point ─────────────────────────────────────────────────────────────

function parseOptions(): Options {
  const argv = process.argv.slice(2);
  let slug: string | undefined;
  let languages = ALL_LANGUAGES;

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--slug") slug = argv[i + 1];
    if (argv[i] === "--languages") {
      languages = (argv[i + 1] ?? "")
        .split(",")
        .map((entry) => LANGUAGE_ALIASES[entry.trim().toLowerCase()])
        .filter((entry): entry is SeedLanguage => Boolean(entry));
    }
  }

  const problems = slug
    ? selectProblems(
        slug
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean),
      )
    : PROBLEMS;

  return { slug, languages, problems };
}

/** One reportable line for a failure: what, where, and the failing case. */
function describe(
  problem: SeedProblem,
  language: SeedLanguage,
  verdict: Extract<Verdict, { ok: false }>,
): string {
  const where =
    verdict.caseIndex === undefined
      ? ""
      : ` (case ${verdict.caseIndex + 1}: expected ${verdict.expected}, got ${verdict.actual})`;
  return `${problem.slug} [${language}] ${verdict.kind}: ${verdict.reason}${where}`;
}

function main(): void {
  const { slug, languages, problems } = parseOptions();

  if (problems.length === 0) {
    console.error(slug ? `No problem with slug "${slug}".` : "No problems to verify.");
    process.exit(1);
  }

  rmSync(WORK_DIR, { recursive: true, force: true });
  mkdirSync(WORK_DIR, { recursive: true });

  const toolchain: Record<SeedLanguage, boolean> = {
    JAVASCRIPT: true,
    TYPESCRIPT: true,
    PYTHON: available(PYTHON_COMMAND, ["--version"]),
    JAVA: available("javac", ["-version"]),
    CPP: available("g++", ["--version"]),
  };

  const failures: {
    line: string;
    kind: FailureKind;
    problem: SeedProblem;
    language: SeedLanguage;
    recovered?: boolean;
  }[] = [];
  /** Per language: how many were authored, run, passed, failed and skipped. */
  const tally: Record<string, Record<string, number>> = {};
  const count = (language: string, column: string) => {
    tally[language] ??= { authored: 0, verified: 0, passed: 0, failed: 0, skipped: 0 };
    tally[language][column] += 1;
  };
  const reasonFor = (language: SeedLanguage) =>
    !toolchain[language]
      ? language === "JAVA"
        ? "JDK unavailable"
        : "toolchain unavailable"
      : "no harness in this script";
  const skipReason: Record<string, string> = {};

  for (const problem of problems) {
    for (const language of languages) {
      if (!(language in problem.solutions)) continue;
      count(language, "authored");

      // Two separate reasons to skip, reported as one: the toolchain is
      // missing, or it is present and this script cannot drive it. Either way
      // the solution is unverified, and unverified is never printed as passed.
      if (!toolchain[language] || language === "JAVA") {
        count(language, "skipped");
        skipReason[language] = reasonFor(language);
        continue;
      }

      const verdict = verify(problem, language, WORK_DIR);
      count(language, "verified");

      if (!verdict.ok) {
        count(language, "failed");
        failures.push({
          kind: verdict.kind,
          problem,
          language,
          line: describe(problem, language, verdict),
        });
        process.stdout.write("x");
      } else {
        count(language, "passed");
        process.stdout.write(".");
      }
    }
  }

  process.stdout.write("\n");

  // ── Recovery pass ────────────────────────────────────────────────────────
  //
  // Exactly one extra attempt for the failures that never started a process,
  // run after the whole catalog rather than inline. The contention that causes
  // them is at its worst while three hundred freshly compiled executables are
  // being handed to the scanner; by the time the run is over it has passed, and
  // the same binary starts first time. This is the manual "re-run the reported
  // slugs" step, automated — and it is one pass, not a loop, so the worst case
  // is bounded at two attempts per solution.
  const flaked = failures.filter((entry) => entry.kind === "ENVIRONMENT");
  if (flaked.length > 0) {
    console.log(`\nRetrying ${flaked.length} that never started a process…`);
    for (const entry of flaked) {
      pause(500);
      const verdict = verify(entry.problem, entry.language, WORK_DIR);
      if (verdict.ok) {
        entry.recovered = true;
        tally[entry.language].failed -= 1;
        tally[entry.language].passed += 1;
      } else {
        entry.kind = verdict.kind;
        entry.line = describe(entry.problem, entry.language, verdict);
      }
    }
    const recovered = flaked.filter((entry) => entry.recovered).length;
    console.log(
      `${recovered} of ${flaked.length} passed on a second attempt — ` +
        `environment flakes, not solution failures.`,
    );
  }

  const remaining = failures.filter((entry) => !entry.recovered);

  console.log();

  // A table rather than a sentence, because the question being asked of this
  // script is per language and "verified" and "passed" are not the same column.
  const pad = (value: string | number, width: number) => String(value).padEnd(width);
  console.log(
    `${pad("Language", 13)}${pad("Authored", 11)}${pad("Verified", 11)}` +
      `${pad("Passed", 9)}${pad("Failed", 9)}Skipped`,
  );
  for (const language of ALL_LANGUAGES) {
    const row = tally[language];
    if (!row) continue;
    console.log(
      `${pad(language, 13)}${pad(row.authored, 11)}${pad(row.verified, 11)}` +
        `${pad(row.passed, 9)}${pad(row.failed, 9)}${row.skipped}`,
    );
  }

  for (const [language, reason] of Object.entries(skipReason)) {
    console.log(`\n${language}: ${tally[language].skipped} skipped — ${reason}.`);
  }

  if (remaining.length > 0) {
    // Grouped by kind: a run that is eleven flakes and one wrong answer is a
    // different problem from twelve wrong answers, and the flat list hid that.
    const kinds = [...new Set(remaining.map((failure) => failure.kind))];
    console.error(
      `\n${remaining.length} unresolved: ` +
        kinds
          .map((kind) => `${remaining.filter((f) => f.kind === kind).length} ${kind}`)
          .join(", "),
    );
    for (const kind of kinds) {
      for (const failure of remaining.filter((entry) => entry.kind === kind)) {
        console.error(`  - ${failure.line}`);
      }
    }

    // Both exit non-zero, because in both cases the catalog has not been shown
    // to be correct — but they are different claims and are worded as such.
    // Calling a solution wrong when the machine simply refused to start it is
    // the mistake this whole distinction exists to prevent.
    const environment = remaining.filter((entry) => entry.kind === "ENVIRONMENT");
    console.error(
      environment.length === remaining.length
        ? `\nNone of these is a solution failure: the process never started, ` +
            `twice. They are unverified, not wrong.`
        : `\n${remaining.length - environment.length} of these are real ` +
            `solution failures and need the content or the answer key fixed.`,
    );
    process.exit(1);
  }

  console.log(`\nAll checked reference solutions agree with their test cases.`);
}

main();
