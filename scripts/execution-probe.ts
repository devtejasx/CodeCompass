import { PROBLEMS } from "../prisma/seed/problems";
import { entryPointFor, renderSource } from "../prisma/seed/problems/starter";
import type { SeedLanguage } from "../prisma/seed/problems/types";

/**
 * Sends authored problems to a running execution service.
 *
 *   npx tsx scripts/execution-probe.ts --url http://127.0.0.1:8080/v1/execute \
 *     --token dev-secret [--slug two-sum,depth-of-tree] [--languages PY,CPP]
 *
 * This is the manual counterpart to tests/execution-sandbox.test.ts: the same
 * traffic, driven by hand, for the times when the question is "what did the
 * sandbox actually say about this one problem" rather than "does the suite
 * pass". It sends a problem's *reference solution*, so a failure here is a
 * failure of the executor - the answer key has already been checked against
 * these same cases by scripts/verify-solutions.ts.
 *
 * It is a development script. It opens no database connection, and nothing in
 * src/ imports it.
 */

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

const ALL: SeedLanguage[] = ["JAVASCRIPT", "TYPESCRIPT", "PYTHON", "JAVA", "CPP"];

function arg(name: string): string | undefined {
  const argv = process.argv.slice(2);
  const index = argv.indexOf(`--${name}`);
  return index >= 0 ? argv[index + 1] : undefined;
}

async function main(): Promise<void> {
  const url = arg("url") ?? "http://127.0.0.1:8080/v1/execute";
  const verbose = process.argv.includes("--verbose");
  const token = arg("token") ?? process.env.CODE_EXECUTION_TOKEN ?? "";

  const slugs = arg("slug")
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const languages =
    arg("languages")
      ?.split(",")
      .map((entry) => LANGUAGE_ALIASES[entry.trim().toLowerCase()])
      .filter((entry): entry is SeedLanguage => Boolean(entry)) ?? ALL;

  const problems = slugs
    ? PROBLEMS.filter((problem) => slugs.includes(problem.slug))
    : PROBLEMS;

  if (problems.length === 0) {
    console.error("No problem matched.");
    process.exit(1);
  }

  // Matched to the service's own concurrency ceiling by default. Sending more
  // than it will run does not make the sweep faster, it just fills the queue.
  const concurrency = Number(arg("concurrency") ?? "4") || 4;

  const jobs: { problem: (typeof PROBLEMS)[number]; language: SeedLanguage }[] = [];
  for (const problem of problems) {
    for (const language of languages) {
      if (problem.solutions[language]) jobs.push({ problem, language });
    }
  }

  let failed = 0;
  let next = 0;

  async function worker(): Promise<void> {
    while (next < jobs.length) {
      const job = jobs[next++];
      const { problem, language } = job;
      const body = problem.solutions[language]!;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          language,
          code: renderSource(problem.signature, language, body),
          entryPoint: entryPointFor(problem.signature.name, language),
          timeLimitMs: problem.timeLimitMs ?? 2000,
          memoryLimitMb: problem.memoryLimitMb ?? 128,
          tests: problem.tests.map((test, index) => ({
            order: index + 1,
            input: JSON.stringify(test.args),
            expectedOutput: JSON.stringify(test.expected),
          })),
        }),
      });

      if (!response.ok) {
        failed += 1;
        console.error(`${problem.slug} [${language}] HTTP ${response.status}`);
        continue;
      }

      const result = (await response.json()) as {
        status: string;
        executionTime: number | null;
        memoryUsed: number | null;
        message: string | null;
        outcomes: { order: number; passed: boolean; actualOutput: string | null }[];
      };

      const passed = result.outcomes.filter((entry) => entry.passed).length;
      const line =
        `${problem.slug.padEnd(28)} ${language.padEnd(11)} ${result.status.padEnd(14)} ` +
        `${passed}/${problem.tests.length}  ${result.executionTime ?? "-"}ms  ` +
        `${result.memoryUsed ?? "-"}kb`;

      if (result.status === "ACCEPTED") {
        if (verbose) console.log(line);
        else process.stdout.write(".");
      } else {
        failed += 1;
        if (!verbose) process.stdout.write("\n");
        console.error(line);
        if (result.message) console.error(`  ${result.message.split("\n")[0]}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, () => worker()));
  if (!verbose) process.stdout.write("\n");

  console.log(
    `${jobs.length - failed} of ${jobs.length} sent solutions were accepted.`,
  );

  if (failed > 0) {
    console.error(`${failed} did not. Each is listed above.`);
    process.exit(1);
  }
}

void main();
