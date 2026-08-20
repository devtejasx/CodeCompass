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
 * node and tsx, Python through python3, C++ through g++. Java is skipped
 * unless a JDK is present, and the summary says so rather than implying a
 * clean run covered it.
 */

type Verdict =
  | { ok: true }
  | {
      ok: false;
      reason: string;
      caseIndex?: number;
      expected?: string;
      actual?: string;
    };

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
      reason: `harness produced ${produced.length} results for ${problem.tests.length} cases`,
    };
  }
  for (const [index, test] of problem.tests.entries()) {
    if (!equalValues(test.expected, produced[index])) {
      return {
        ok: false,
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
): { ok: boolean; stdout: string; stderr: string } {
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
  // a spawn *error* is retried; a non-zero exit status is not.
  //
  // The backoff escalates because the contention is worst during a full-catalog
  // run, when three hundred freshly compiled executables are handed to the
  // scanner in a few minutes. A fixed 200ms was enough for a single problem and
  // demonstrably not enough for the whole set: a full run left nine solutions
  // reported as failures that all passed when run again, which is the failure
  // mode this retry exists to prevent in the first place.
  let result = spawnSync(command, args, options);
  for (let attempt = 0; attempt < 8 && result.error; attempt += 1) {
    pause(200 * 2 ** Math.min(attempt, 4));
    result = spawnSync(command, args, options);
  }

  return {
    ok: result.status === 0,
    stdout: result.stdout ?? "",
    stderr: (result.stderr ?? "") + (result.error ? String(result.error.message) : ""),
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
      reason: `harness printed something that is not JSON: ${line.slice(0, 120)}`,
    };
  }
  if (!Array.isArray(produced)) {
    return { ok: false, reason: "harness did not print an array of results" };
  }
  return compareRun(problem, produced);
}

function verify(problem: SeedProblem, language: SeedLanguage, dir: string): Verdict {
  const body = problem.solutions[language];
  if (!body) return { ok: true };

  const source = renderSource(problem.signature, language, body);
  const stem = `${problem.slug}-${language.toLowerCase()}`;

  switch (language) {
    case "JAVASCRIPT": {
      const file = path.join(dir, `${stem}.mjs`);
      writeFileSync(file, javascriptHarness(problem, source));
      const run = runProcess(process.execPath, [file], dir);
      if (!run.ok)
        return { ok: false, reason: run.stderr.trim().split("\n")[0] ?? "run failed" };
      return parseAndCompare(problem, run.stdout);
    }
    case "TYPESCRIPT": {
      const file = path.join(dir, `${stem}.ts`);
      writeFileSync(file, typescriptHarness(problem, source));
      const run = runProcess("npx", ["tsx", file], dir);
      if (!run.ok)
        return { ok: false, reason: run.stderr.trim().split("\n")[0] ?? "run failed" };
      return parseAndCompare(problem, run.stdout);
    }
    case "PYTHON": {
      const file = path.join(dir, `${stem}.py`);
      writeFileSync(file, pythonHarness(problem, source));
      const run = runProcess(PYTHON_COMMAND, [file], dir);
      if (!run.ok)
        return {
          ok: false,
          reason: run.stderr.trim().split("\n").pop() ?? "run failed",
        };
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
        return {
          ok: false,
          reason: `compile error: ${compiled.stderr.trim().split("\n")[0] ?? ""}`,
        };
      }
      const run = runProcess(binary, [], dir);
      if (!run.ok)
        return { ok: false, reason: run.stderr.trim().split("\n")[0] ?? "run failed" };
      return parseAndCompare(problem, run.stdout);
    }
    case "JAVA":
      // Verified only where a JDK exists. Reported as skipped, never as passed.
      return { ok: true };
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

  const failures: string[] = [];
  const checked: Record<string, number> = {};
  const skipped: Record<string, number> = {};

  for (const problem of problems) {
    for (const language of languages) {
      if (!(language in problem.solutions)) continue;

      if (!toolchain[language]) {
        skipped[language] = (skipped[language] ?? 0) + 1;
        continue;
      }
      if (language === "JAVA") {
        // A JDK exists but this script has no Java harness yet; say so rather
        // than counting it as verified.
        skipped[language] = (skipped[language] ?? 0) + 1;
        continue;
      }

      const verdict = verify(problem, language, WORK_DIR);
      checked[language] = (checked[language] ?? 0) + 1;

      if (!verdict.ok) {
        const where =
          verdict.caseIndex === undefined
            ? ""
            : ` (case ${verdict.caseIndex + 1}: expected ${verdict.expected}, got ${verdict.actual})`;
        failures.push(`${problem.slug} [${language}] ${verdict.reason}${where}`);
        process.stdout.write("x");
      } else {
        process.stdout.write(".");
      }
    }
  }

  process.stdout.write("\n\n");

  const verified = Object.entries(checked)
    .map(([language, count]) => `${language} ${count}`)
    .join(", ");
  console.log(`Verified: ${verified || "nothing"}`);

  const notVerified = Object.entries(skipped)
    .map(([language, count]) => `${language} ${count}`)
    .join(", ");
  if (notVerified)
    console.log(`Not verified (no harness or no toolchain): ${notVerified}`);

  if (failures.length > 0) {
    console.error(`\n${failures.length} failing solution(s):`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }

  console.log(`\nAll checked reference solutions agree with their test cases.`);
}

main();
