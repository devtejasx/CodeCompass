import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.fn();
vi.mock("@/auth", () => ({ auth, signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

class RedirectError extends Error {
  constructor(public target: string) {
    super(`REDIRECT:${target}`);
  }
}
vi.mock("next/navigation", () => ({
  redirect: (target: string) => {
    throw new RedirectError(target);
  },
}));

const {
  getProblemExplanation,
  getProblemForPractice,
  getProblemsForTopic,
  getProblemProgress,
  getPracticeStats,
  getPracticeSummary,
  getRecommendedProblems,
  getSubmission,
  listProblems,
  listSubmissions,
} = await import("@/lib/practice/queries");

const { startSubmission, runSubmission, getSubmissionState, getSubmissionCode } =
  await import("@/app/actions/practice");

const { recommendProblems, currentTopicId } = await import("@/lib/practice/recommend");
const { buildFeedback, isTerminal, STATUS_LABEL } =
  await import("@/lib/practice/feedback");
const {
  EXECUTION_LIMITS,
  MockExecutionService,
  HttpExecutionService,
  UnavailableExecutionService,
  __setExecutionServiceForTests,
  getExecutionService,
  sanitiseMessage,
  sanitiseOutput,
} = await import("@/lib/practice/execution");

const { requireUser } = await import("@/lib/session");
const { db } = await import("@/lib/db");

const { PROBLEMS } = await import("../prisma/seed/problems");
const { validateProblem, validateProblemSet, LANGUAGE_MINIMUMS } =
  await import("../prisma/seed/problems/validate");
const { renderStarter, renderSource, toSnakeCase } =
  await import("../prisma/seed/problems/starter");

// ── Helpers ────────────────────────────────────────────────────────────────

async function makeUser(email = "coder@example.com") {
  return db.user.create({
    data: {
      name: "Test Coder",
      email,
      passwordHash: "$2b$12$abcdefghijklmnopqrstuv",
      profile: { create: { onboardingCompleted: true } },
    },
  });
}

function signedInAs(id: string) {
  auth.mockResolvedValue({ user: { id } });
}

/** The authored reference solution — the mock provider's "correct" answer. */
async function referenceSolution(slug: string, language = "JAVASCRIPT" as const) {
  const row = await db.practiceLanguage.findFirstOrThrow({
    where: { problem: { slug }, language },
    select: { solutionTemplate: true },
  });
  return row.solutionTemplate!;
}

async function problemBySlug(slug: string) {
  return db.practiceProblem.findUniqueOrThrow({
    where: { slug },
    select: { id: true, slug: true },
  });
}

/** Runs one submission end to end and returns the terminal view. */
async function submit(
  problemId: string,
  code: string,
  {
    kind = "SUBMIT",
    language = "JAVASCRIPT",
  }: { kind?: "RUN" | "SUBMIT"; language?: "JAVASCRIPT" | "PYTHON" } = {},
) {
  const started = await startSubmission({ problemId, language, kind, code });
  expect(started.ok, started.error).toBe(true);
  const ran = await runSubmission({ submissionId: started.submissionId! });
  return { started, ran };
}

beforeEach(() => {
  auth.mockReset();
  // Every test that does not say otherwise runs against the mock provider.
  __setExecutionServiceForTests(new MockExecutionService());
});

// ── 1. Problem listing ─────────────────────────────────────────────────────

describe("problem listing", () => {
  it("lists the seeded catalog with this user's status folded in", async () => {
    const user = await makeUser();
    const problems = await listProblems(user.id);

    expect(problems.length).toBe(PROBLEMS.length);
    expect(problems.every((problem) => problem.status === "NOT_STARTED")).toBe(true);
    expect(problems[0].sortOrder).toBe(0);
  });

  it("seeds at least the required number of problems", async () => {
    expect(await db.practiceProblem.count()).toBeGreaterThanOrEqual(31);
  });

  it("weights the catalog toward Easy, as a beginner product should", async () => {
    const easy = await db.practiceProblem.count({ where: { difficulty: "EASY" } });
    const medium = await db.practiceProblem.count({ where: { difficulty: "MEDIUM" } });

    expect(easy).toBeGreaterThan(medium);
  });

  it("gives every problem examples, visible tests and hidden tests", async () => {
    const problems = await db.practiceProblem.findMany({
      select: {
        slug: true,
        _count: { select: { examples: true, languages: true } },
        testCases: { select: { isHidden: true } },
      },
    });

    for (const problem of problems) {
      expect(problem._count.examples, problem.slug).toBeGreaterThan(0);
      expect(problem._count.languages, problem.slug).toBeGreaterThan(0);
      expect(
        problem.testCases.filter((test) => !test.isHidden).length,
        problem.slug,
      ).toBeGreaterThan(0);
      expect(
        problem.testCases.filter((test) => test.isHidden).length,
        problem.slug,
      ).toBeGreaterThan(0);
    }
  });
});

// ── 2. Filtering ───────────────────────────────────────────────────────────

describe("problem filtering", () => {
  it("separates easy from medium", async () => {
    const user = await makeUser();
    const problems = await listProblems(user.id);

    const easy = problems.filter((problem) => problem.difficulty === "EASY");
    const medium = problems.filter((problem) => problem.difficulty === "MEDIUM");

    expect(easy.length).toBeGreaterThanOrEqual(5);
    expect(medium.length).toBeGreaterThanOrEqual(3);
    expect(easy.length + medium.length).toBe(problems.length);
  });

  it("matches problems by title and by topic", async () => {
    const user = await makeUser();
    const problems = await listProblems(user.id);

    const byTitle = problems.filter((problem) =>
      problem.title.toLowerCase().includes("largest"),
    );
    expect(byTitle.length).toBeGreaterThan(0);

    const byTopic = problems.filter((problem) =>
      problem.topics.some((topic) => topic.slug === "js-arrays"),
    );
    expect(byTopic.length).toBeGreaterThan(0);
  });
});

// ── 3. Problem detail ──────────────────────────────────────────────────────

describe("problem detail", () => {
  it("loads a problem with everything the workspace needs", async () => {
    const problem = await getProblemForPractice("find-maximum");

    expect(problem).not.toBeNull();
    expect(problem!.examples.length).toBeGreaterThan(0);
    expect(problem!.constraints.length).toBeGreaterThan(0);
    expect(problem!.hints.length).toBeGreaterThan(0);
    expect(problem!.functionName).toBe("findMaximum");
    expect(problem!.timeLimitMs).toBeGreaterThan(0);
  });

  it("withholds the explanation from the page payload entirely", async () => {
    const problem = await getProblemForPractice("find-maximum");

    // Withheld by not being fetched, not by being hidden in the UI — otherwise
    // "unlocks after your first attempt" is a claim view-source disproves.
    expect(problem).not.toHaveProperty("explanation");

    const explanation = await getProblemExplanation(problem!.id);
    expect(explanation!.length).toBeGreaterThan(100);
  });

  it("returns null for a slug that does not exist", async () => {
    expect(await getProblemForPractice("not-a-real-problem")).toBeNull();
  });
});

// ── 4. Problem ↔ topic relationship ────────────────────────────────────────

describe("problem to topic relationship", () => {
  it("connects every problem to at least one real roadmap topic", async () => {
    const problems = await db.practiceProblem.findMany({
      select: { slug: true, _count: { select: { topics: true } } },
    });

    for (const problem of problems) {
      expect(problem._count.topics, problem.slug).toBeGreaterThan(0);
    }
  });

  it("finds the problems that practise a topic", async () => {
    const topic = await db.topic.findUniqueOrThrow({
      where: { slug: "js-arrays" },
      select: { id: true },
    });

    const problems = await getProblemsForTopic(topic.id);

    expect(problems.length).toBeGreaterThan(0);
    expect(problems.map((problem) => problem.slug)).toContain("find-maximum");
  });

  it("returns nothing for a topic with no problems, rather than filler", async () => {
    const topic = await db.topic.findUniqueOrThrow({
      where: { slug: "css-grid" },
      select: { id: true },
    });

    expect(await getProblemsForTopic(topic.id)).toEqual([]);
  });

  it("folds this user's status into a topic's problems", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const problem = await problemBySlug("find-maximum");
    await submit(problem.id, await referenceSolution("find-maximum"));

    const topic = await db.topic.findUniqueOrThrow({
      where: { slug: "js-arrays" },
      select: { id: true },
    });
    const problems = await getProblemsForTopic(topic.id, user.id);

    expect(problems.find((entry) => entry.slug === "find-maximum")!.status).toBe(
      "SOLVED",
    );
  });
});

// ── 5. Authentication ──────────────────────────────────────────────────────

describe("authentication", () => {
  it("redirects an unauthenticated visitor to login", async () => {
    auth.mockResolvedValue(null);
    await expect(requireUser("/practice/find-maximum")).rejects.toThrow(
      /REDIRECT:\/login/,
    );
  });

  it("refuses every practice mutation when signed out", async () => {
    auth.mockResolvedValue(null);
    const problem = await problemBySlug("find-maximum");

    expect(
      (
        await startSubmission({
          problemId: problem.id,
          language: "JAVASCRIPT",
          kind: "SUBMIT",
          code: "x",
        })
      ).ok,
    ).toBe(false);
    expect((await runSubmission({ submissionId: "x" })).ok).toBe(false);
    expect((await getSubmissionState({ submissionId: "x" })).ok).toBe(false);
    expect((await getSubmissionCode({ submissionId: "x" })).ok).toBe(false);
  });
});

// ── 6. Starter code ────────────────────────────────────────────────────────

describe("starter code", () => {
  it("stores generated starter code for every offered language", async () => {
    const problem = await getProblemForPractice("find-maximum");
    const languages = problem!.languages;

    expect(languages.length).toBeGreaterThan(1);
    for (const entry of languages) {
      expect(entry.starterCode.length, entry.language).toBeGreaterThan(10);
      expect(entry.starterCode, entry.language).toMatch(/solution here/i);
    }
  });

  it("generates an idiomatic shell per language from one signature", () => {
    const signature = {
      name: "findMaximum",
      params: [{ name: "numbers", type: "int[]" as const }],
      returns: "int" as const,
    };

    expect(renderStarter(signature, "JAVASCRIPT")).toContain(
      "function findMaximum(numbers)",
    );
    expect(renderStarter(signature, "TYPESCRIPT")).toContain(
      "function findMaximum(numbers: number[]): number",
    );
    // Python gets the snake_case name a Python developer would actually write.
    expect(renderStarter(signature, "PYTHON")).toContain(
      "def find_maximum(numbers: list[int]) -> int:",
    );
    expect(renderStarter(signature, "JAVA")).toContain(
      "public static int findMaximum(int[] numbers)",
    );
    expect(renderStarter(signature, "CPP")).toContain(
      "int findMaximum(const vector<int>& numbers)",
    );
  });

  it("wraps starter code and the reference solution in the same shell", () => {
    const signature = {
      name: "addTwoNumbers",
      params: [
        { name: "a", type: "int" as const },
        { name: "b", type: "int" as const },
      ],
      returns: "int" as const,
    };

    const starter = renderStarter(signature, "JAVASCRIPT");
    const solved = renderSource(signature, "JAVASCRIPT", "return a + b;");

    expect(starter.split("\n")[0]).toBe(solved.split("\n")[0]);
    expect(solved).toContain("return a + b;");
  });

  it("converts camelCase to snake_case for Python entry points", () => {
    expect(toSnakeCase("findMaximum")).toBe("find_maximum");
    expect(toSnakeCase("isEven")).toBe("is_even");
    expect(toSnakeCase("factorial")).toBe("factorial");
  });

  it("never ships the reference solution to the browser", async () => {
    const problem = await getProblemForPractice("find-maximum");

    for (const entry of problem!.languages) {
      expect(entry).not.toHaveProperty("solutionTemplate");
    }
  });
});

// ── 7. Language selection ──────────────────────────────────────────────────

describe("language selection", () => {
  it("meets the per-language catalog minimums", async () => {
    for (const [language, minimum] of Object.entries(LANGUAGE_MINIMUMS)) {
      const easy = await db.practiceLanguage.count({
        where: { language: language as never, problem: { difficulty: "EASY" } },
      });
      const medium = await db.practiceLanguage.count({
        where: { language: language as never, problem: { difficulty: "MEDIUM" } },
      });

      expect(easy, `${language} easy`).toBeGreaterThanOrEqual(minimum.easy);
      expect(medium, `${language} medium`).toBeGreaterThanOrEqual(minimum.medium);
    }
  });

  it("refuses a language the problem does not offer", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    // FizzBuzz returns a list of strings and is not authored for C++.
    const problem = await problemBySlug("fizzbuzz-sequence");
    const result = await startSubmission({
      problemId: problem.id,
      language: "CPP",
      kind: "SUBMIT",
      code: "int main() {}",
    });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/not available in this language/i);
  });

  it("refuses a language the execution service cannot run", async () => {
    __setExecutionServiceForTests(new UnavailableExecutionService());

    const user = await makeUser();
    signedInAs(user.id);
    const problem = await problemBySlug("find-maximum");

    const result = await startSubmission({
      problemId: problem.id,
      language: "JAVASCRIPT",
      kind: "SUBMIT",
      code: "function findMaximum() {}",
    });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/temporarily unavailable/i);
  });

  it("advertises no language at all when nothing can run", () => {
    expect(new UnavailableExecutionService().supportedLanguages()).toEqual([]);
  });
});

// ── 8-9. Submission creation and ownership ─────────────────────────────────

describe("submission creation", () => {
  it("creates a queued submission owned by the session user", async () => {
    const user = await makeUser();
    signedInAs(user.id);
    const problem = await problemBySlug("find-maximum");

    const started = await startSubmission({
      problemId: problem.id,
      language: "JAVASCRIPT",
      kind: "SUBMIT",
      code: "function findMaximum(numbers) { return 0; }",
    });

    expect(started.ok).toBe(true);

    const row = await db.submission.findUniqueOrThrow({
      where: { id: started.submissionId! },
    });
    expect(row.userId).toBe(user.id);
    expect(row.status).toBe("QUEUED");
  });

  it("ignores a userId supplied by the client", async () => {
    const alice = await makeUser("alice-p@example.com");
    const bob = await makeUser("bob-p@example.com");
    signedInAs(alice.id);

    const problem = await problemBySlug("find-maximum");
    const started = await startSubmission({
      problemId: problem.id,
      language: "JAVASCRIPT",
      kind: "SUBMIT",
      code: "function findMaximum(n) { return 1; }",
      userId: bob.id,
    });

    const row = await db.submission.findUniqueOrThrow({
      where: { id: started.submissionId! },
    });
    expect(row.userId).toBe(alice.id);
    expect(await db.submission.count({ where: { userId: bob.id } })).toBe(0);
  });

  it("rejects empty code and code larger than the limit", async () => {
    const user = await makeUser();
    signedInAs(user.id);
    const problem = await problemBySlug("find-maximum");

    expect(
      (
        await startSubmission({
          problemId: problem.id,
          language: "JAVASCRIPT",
          kind: "SUBMIT",
          code: "",
        })
      ).ok,
    ).toBe(false);

    expect(
      (
        await startSubmission({
          problemId: problem.id,
          language: "JAVASCRIPT",
          kind: "SUBMIT",
          code: "a".repeat(EXECUTION_LIMITS.maxCodeBytes + 1),
        })
      ).ok,
    ).toBe(false);
  });

  it("rejects a problem id that does not exist", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const result = await startSubmission({
      problemId: "not-a-problem",
      language: "JAVASCRIPT",
      kind: "SUBMIT",
      code: "x",
    });
    expect(result.ok).toBe(false);
  });
});

describe("submission ownership", () => {
  it("will not run another user's submission", async () => {
    const alice = await makeUser("alice-o@example.com");
    const bob = await makeUser("bob-o@example.com");

    signedInAs(alice.id);
    const problem = await problemBySlug("find-maximum");
    const started = await startSubmission({
      problemId: problem.id,
      language: "JAVASCRIPT",
      kind: "SUBMIT",
      code: "function findMaximum(n) { return 1; }",
    });

    signedInAs(bob.id);
    const stolen = await runSubmission({ submissionId: started.submissionId! });

    expect(stolen.ok).toBe(false);
    expect(stolen.error).toMatch(/could not be found/i);

    // Untouched: still queued, still Alice's.
    const row = await db.submission.findUniqueOrThrow({
      where: { id: started.submissionId! },
    });
    expect(row.status).toBe("QUEUED");
  });

  it("will not read another user's result or source", async () => {
    const alice = await makeUser("alice-r@example.com");
    const bob = await makeUser("bob-r@example.com");

    signedInAs(alice.id);
    const problem = await problemBySlug("find-maximum");
    const { started } = await submit(
      problem.id,
      "function findMaximum(n) { return 1; }",
    );

    signedInAs(bob.id);
    expect((await getSubmissionState({ submissionId: started.submissionId! })).ok).toBe(
      false,
    );
    expect((await getSubmissionCode({ submissionId: started.submissionId! })).ok).toBe(
      false,
    );
    expect(await getSubmission(bob.id, started.submissionId!)).toBeNull();
  });

  it("keeps two learners' submission histories separate", async () => {
    const alice = await makeUser("alice-h@example.com");
    const bob = await makeUser("bob-h@example.com");
    const problem = await problemBySlug("find-maximum");

    signedInAs(alice.id);
    await submit(problem.id, await referenceSolution("find-maximum"));

    signedInAs(bob.id);
    await submit(problem.id, "function findMaximum(n) { return 0; }");

    expect(await listSubmissions(alice.id, problem.id)).toHaveLength(1);
    expect(await listSubmissions(bob.id, problem.id)).toHaveLength(1);
    expect((await listSubmissions(alice.id, problem.id))[0].status).toBe("ACCEPTED");
    expect((await listSubmissions(bob.id, problem.id))[0].status).not.toBe("ACCEPTED");
  });

  it("returns a learner their own code", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const problem = await problemBySlug("find-maximum");
    const code = "function findMaximum(numbers) { return numbers[0]; }";
    const { started } = await submit(problem.id, code);

    const result = await getSubmissionCode({ submissionId: started.submissionId! });
    expect(result.ok).toBe(true);
    expect(result.code).toBe(code);
  });
});

// ── 10-14. Result states ───────────────────────────────────────────────────

describe("accepted submission", () => {
  it("accepts the reference solution and marks the problem solved", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const problem = await problemBySlug("find-maximum");
    const { ran } = await submit(problem.id, await referenceSolution("find-maximum"));

    expect(ran.ok).toBe(true);
    expect(ran.submission!.status).toBe("ACCEPTED");
    expect(ran.submission!.passedTests).toBe(ran.submission!.totalTests);
    expect(ran.submission!.solved).toBe(true);

    const progress = await getProblemProgress(user.id, problem.id);
    expect(progress!.status).toBe("SOLVED");
    expect(progress!.solvedAt).not.toBeNull();
    expect(progress!.solvedLanguage).toBe("JAVASCRIPT");
  });

  it("runs hidden tests on submit and only sample tests on run", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const problem = await problemBySlug("find-maximum");
    const solution = await referenceSolution("find-maximum");

    const run = await submit(problem.id, solution, { kind: "RUN" });
    const submitted = await submit(problem.id, solution, { kind: "SUBMIT" });

    const visible = await db.practiceTestCase.count({
      where: { problemId: problem.id, isHidden: false },
    });
    const all = await db.practiceTestCase.count({ where: { problemId: problem.id } });

    expect(run.ran.submission!.totalTests).toBe(visible);
    expect(submitted.ran.submission!.totalTests).toBe(all);
    expect(all).toBeGreaterThan(visible);
  });

  it("does not change progress for a Run", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const problem = await problemBySlug("find-maximum");
    await submit(problem.id, await referenceSolution("find-maximum"), {
      kind: "RUN",
    });

    // Run is a scratch check against the samples, not a graded attempt.
    expect(await getProblemProgress(user.id, problem.id)).toBeNull();
  });
});

describe("wrong answer", () => {
  it("records an attempt and explains the failure", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const problem = await problemBySlug("find-maximum");
    const { ran } = await submit(
      problem.id,
      "// @mock:wrong\nfunction findMaximum(numbers) { return numbers[0]; }",
    );

    expect(ran.submission!.status).toBe("WRONG_ANSWER");
    expect(ran.submission!.passedTests).toBeLessThan(ran.submission!.totalTests);
    expect(ran.submission!.feedback).toBeTruthy();
    expect(ran.submission!.solved).toBe(false);

    const progress = await getProblemProgress(user.id, problem.id);
    expect(progress!.status).toBe("ATTEMPTED");
    expect(progress!.attempts).toBe(1);
    expect(progress!.solvedAt).toBeNull();
  });

  it("tells a learner who has not written anything yet", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const problem = await problemBySlug("find-maximum");
    const starter = await db.practiceLanguage.findFirstOrThrow({
      where: { problemId: problem.id, language: "JAVASCRIPT" },
      select: { starterCode: true },
    });

    const { ran } = await submit(problem.id, starter.starterCode);

    expect(ran.submission!.status).toBe("WRONG_ANSWER");
    expect(ran.submission!.feedback).toMatch(/starter code/i);
  });
});

describe("compile, runtime, timeout and memory failures", () => {
  const cases = [
    { marker: "compile-error", status: "COMPILE_ERROR", feedback: /didn't compile/i },
    { marker: "runtime-error", status: "RUNTIME_ERROR", feedback: /stopped part-way/i },
    { marker: "timeout", status: "TIME_LIMIT", feedback: /still running/i },
    { marker: "memory", status: "MEMORY_LIMIT", feedback: /memory/i },
  ] as const;

  for (const entry of cases) {
    it(`records ${entry.status} with a usable explanation`, async () => {
      const user = await makeUser(`${entry.marker}@example.com`);
      signedInAs(user.id);

      const problem = await problemBySlug("find-maximum");
      const { ran } = await submit(
        problem.id,
        `// @mock:${entry.marker}\nfunction findMaximum(n) { return 0; }`,
      );

      expect(ran.submission!.status).toBe(entry.status);
      expect(ran.submission!.feedback).toMatch(entry.feedback);

      const progress = await getProblemProgress(user.id, problem.id);
      expect(progress!.status).toBe("ATTEMPTED");
    });
  }

  it("reports a compile error with no tests passed", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const problem = await problemBySlug("find-maximum");
    const { ran } = await submit(
      problem.id,
      "// @mock:compile-error\nfunction findMaximum(",
    );

    expect(ran.submission!.passedTests).toBe(0);
    expect(ran.submission!.message).toMatch(/line/i);
    // The failing-case block is for wrong answers; a compile error has none.
    expect(ran.submission!.failure).toBeNull();
  });

  it("does not count a service outage as a learner attempt", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const problem = await problemBySlug("find-maximum");
    const { ran } = await submit(
      problem.id,
      "// @mock:system-error\nfunction findMaximum(n) { return 0; }",
    );

    expect(ran.submission!.status).toBe("SYSTEM_ERROR");
    expect(ran.submission!.feedback).toMatch(/not been lost/i);
    expect(await getProblemProgress(user.id, problem.id)).toBeNull();
  });
});

// ── 15-16. Progress ────────────────────────────────────────────────────────

describe("problem progress", () => {
  it("never un-solves a problem after a later failure", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const problem = await problemBySlug("find-maximum");
    await submit(problem.id, await referenceSolution("find-maximum"));
    const solvedAt = (await getProblemProgress(user.id, problem.id))!.solvedAt;

    await submit(problem.id, "// @mock:wrong\nfunction findMaximum(n) { return -1; }");

    const progress = await getProblemProgress(user.id, problem.id);
    expect(progress!.status).toBe("SOLVED");
    expect(progress!.attempts).toBe(2);
    // The moment they first solved it, not the most recent success.
    expect(progress!.solvedAt).toEqual(solvedAt);
  });

  it("survives a completely fresh read, because the database is authoritative", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const problem = await problemBySlug("find-maximum");
    await submit(problem.id, await referenceSolution("find-maximum"));

    const reread = await db.userProblemProgress.findUnique({
      where: { userId_problemId: { userId: user.id, problemId: problem.id } },
    });

    expect(reread!.status).toBe("SOLVED");
    expect(reread!.solvedAt).not.toBeNull();
  });

  it("counts solved problems by difficulty for the dashboard", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const easy = await problemBySlug("find-maximum");
    const medium = await problemBySlug("balanced-brackets");

    await submit(easy.id, await referenceSolution("find-maximum"));
    await submit(medium.id, await referenceSolution("balanced-brackets"));
    await submit(
      (await problemBySlug("reverse-a-string")).id,
      "// @mock:wrong\nfunction reverseString(t) { return t; }",
    );

    const stats = await getPracticeStats(user.id);
    expect(stats.solved).toBe(2);
    expect(stats.easySolved).toBe(1);
    expect(stats.mediumSolved).toBe(1);
    expect(stats.attempted).toBe(1);
    expect(stats.totalProblems).toBeGreaterThanOrEqual(31);
  });

  it("surfaces an in-flight problem for 'continue practice'", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const problem = await problemBySlug("count-vowels");
    await submit(problem.id, "// @mock:wrong\nfunction countVowels(t) { return 0; }");

    const summary = await getPracticeSummary(user.id);
    expect(summary.solved).toBe(0);
    expect(summary.inFlight!.problem.slug).toBe("count-vowels");
  });

  it("keeps two learners' progress separate", async () => {
    const alice = await makeUser("alice-pg@example.com");
    const bob = await makeUser("bob-pg@example.com");
    const problem = await problemBySlug("find-maximum");

    signedInAs(alice.id);
    await submit(problem.id, await referenceSolution("find-maximum"));

    signedInAs(bob.id);
    expect(await getProblemProgress(bob.id, problem.id)).toBeNull();

    await submit(problem.id, "// @mock:wrong\nfunction findMaximum(n) { return 0; }");

    expect((await getProblemProgress(alice.id, problem.id))!.status).toBe("SOLVED");
    expect((await getProblemProgress(bob.id, problem.id))!.status).toBe("ATTEMPTED");
  });
});

// ── 17. Recommendation ─────────────────────────────────────────────────────

describe("recommendation logic", () => {
  const problems = [
    {
      id: "a",
      slug: "a",
      difficulty: "MEDIUM" as const,
      sortOrder: 1,
      topicIds: ["t1"],
      status: "NOT_STARTED" as const,
    },
    {
      id: "b",
      slug: "b",
      difficulty: "EASY" as const,
      sortOrder: 2,
      topicIds: ["t1"],
      status: "NOT_STARTED" as const,
    },
    {
      id: "c",
      slug: "c",
      difficulty: "EASY" as const,
      sortOrder: 3,
      topicIds: ["t2"],
      status: "NOT_STARTED" as const,
    },
    {
      id: "d",
      slug: "d",
      difficulty: "EASY" as const,
      sortOrder: 4,
      topicIds: ["t1"],
      status: "SOLVED" as const,
    },
    {
      id: "e",
      slug: "e",
      difficulty: "EASY" as const,
      sortOrder: 5,
      topicIds: ["t9"],
      status: "NOT_STARTED" as const,
    },
  ];

  it("puts the current topic first and Easy before Medium", () => {
    const result = recommendProblems({
      currentTopicId: "t1",
      completedTopicIds: ["t2"],
      problems,
    });

    expect(result.map((entry) => entry.problem.id)).toEqual(["b", "a", "c"]);
    expect(result[0].reason).toBe("CURRENT_TOPIC");
    expect(result[2].reason).toBe("RECENTLY_LEARNED");
  });

  it("removes solved problems", () => {
    const result = recommendProblems({
      currentTopicId: "t1",
      completedTopicIds: [],
      problems,
    });
    expect(result.map((entry) => entry.problem.id)).not.toContain("d");
  });

  it("never recommends an unrelated problem just to fill the screen", () => {
    const result = recommendProblems({
      currentTopicId: "t1",
      completedTopicIds: [],
      problems,
    });
    // "e" practises a topic they have neither reached nor finished.
    expect(result.map((entry) => entry.problem.id)).not.toContain("e");
  });

  it("returns nothing rather than filler when no topic matches", () => {
    expect(
      recommendProblems({
        currentTopicId: "unknown",
        completedTopicIds: [],
        problems,
      }),
    ).toEqual([]);
  });

  it("orders completed topics by how recently they were finished", () => {
    const result = recommendProblems({
      currentTopicId: null,
      completedTopicIds: ["t2", "t1"],
      problems,
    });
    // t2 was completed most recently, so its problem leads.
    expect(result[0].problem.id).toBe("c");
  });

  it("picks the first incomplete required topic as current", () => {
    const topics = [
      { id: "a", isRequired: true },
      { id: "b", isRequired: false },
      { id: "c", isRequired: true },
    ];

    expect(currentTopicId(topics, [])).toBe("a");
    expect(currentTopicId(topics, ["a"])).toBe("c");
    expect(currentTopicId(topics, ["a", "c"])).toBeNull();
  });

  it("recommends real problems once a learner has a career and a topic", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const career = await db.career.findUniqueOrThrow({
      where: { slug: "frontend-developer" },
      select: { id: true },
    });
    await db.profile.update({
      where: { userId: user.id },
      data: { selectedCareerId: career.id },
    });

    const { recommendations, currentTopic, careerName } = await getRecommendedProblems(
      user.id,
    );

    expect(careerName).toBe("Frontend Developer");
    expect(currentTopic).not.toBeNull();
    // Whatever the first topic is, every recommendation must be *for* a topic
    // the learner has reached — never a random problem.
    for (const entry of recommendations) {
      expect(["CURRENT_TOPIC", "RECENTLY_LEARNED"]).toContain(entry.reason);
    }
  });

  it("recommends nothing at all when the learner has no career yet", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const result = await getRecommendedProblems(user.id);
    expect(result.recommendations).toEqual([]);
    expect(result.careerName).toBeNull();
  });
});

// ── 18. Hidden tests never reach the client ────────────────────────────────

describe("hidden test cases", () => {
  it("are excluded from the problem page payload", async () => {
    const problem = await getProblemForPractice("find-maximum");

    const hidden = await db.practiceTestCase.count({
      where: { problem: { slug: "find-maximum" }, isHidden: true },
    });

    expect(hidden).toBeGreaterThan(0);
    expect(problem!.testCases.length).toBe(problem!._count.testCases - hidden);
    for (const test of problem!.testCases) {
      expect(test).not.toHaveProperty("isHidden");
    }

    // The serialised payload must not contain any hidden case's data.
    const hiddenRows = await db.practiceTestCase.findMany({
      where: { problem: { slug: "find-maximum" }, isHidden: true },
      select: { input: true, expectedOutput: true },
    });
    const payload = JSON.stringify(problem);
    for (const row of hiddenRows) {
      expect(payload).not.toContain(row.input);
    }
  });

  it("withholds a hidden case's data when it is the one that failed", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const problem = await problemBySlug("find-maximum");
    const visible = await db.practiceTestCase.count({
      where: { problemId: problem.id, isHidden: false },
    });

    // The mock's "wrong" marker fails only the last case, which is hidden.
    const { ran } = await submit(
      problem.id,
      "// @mock:wrong\nfunction findMaximum(n) { return 0; }",
    );

    const failure = ran.submission!.failure!;
    expect(failure.order).toBeGreaterThan(visible);
    expect(failure.isHidden).toBe(true);
    expect(failure.input).toBeNull();
    expect(failure.expectedOutput).toBeNull();
    expect(failure.actualOutput).toBeNull();

    // And nothing about it was written to the row either.
    const row = await db.submission.findUniqueOrThrow({
      where: { id: ran.submission!.id },
    });
    expect(row.failedInput).toBeNull();
    expect(row.expectedOutput).toBeNull();
  });

  it("does show a visible case's data when a visible case fails", () => {
    const tests = [
      { order: 1, input: "[[1,2]]", expectedOutput: "2", isHidden: false },
      { order: 2, input: "[[9]]", expectedOutput: "9", isHidden: true },
    ];

    const { failure, feedback } = buildFeedback(
      {
        status: "WRONG_ANSWER",
        passedTests: 0,
        totalTests: 2,
        executionTime: null,
        memoryUsed: null,
        message: null,
        simulated: false,
        outcomes: [
          { order: 1, passed: false, actualOutput: "1", isHidden: false },
          { order: 2, passed: false, actualOutput: "9", isHidden: true },
        ],
      },
      tests,
      { timeLimitMs: 2000, memoryLimitMb: 128 },
    );

    expect(failure!.input).toBe("[[1,2]]");
    expect(failure!.expectedOutput).toBe("2");
    expect(failure!.actualOutput).toBe("1");
    expect(feedback).toBeTruthy();
  });
});

// ── Execution boundary ─────────────────────────────────────────────────────

describe("execution boundary", () => {
  it("never sends the reference solution to the HTTP provider", async () => {
    const captured: { body: string }[] = [];
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      captured.push({ body: String(init.body) });
      return new Response(
        JSON.stringify({ status: "ACCEPTED", outcomes: [{ order: 1, passed: true }] }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const service = new HttpExecutionService("https://exec.test/v1", "secret");
    await service.execute({
      language: "JAVASCRIPT",
      code: "function f() {}",
      entryPoint: "f",
      tests: [{ order: 1, input: "[]", expectedOutput: "1", isHidden: false }],
      timeLimitMs: 2000,
      memoryLimitMb: 128,
      development: {
        starterCode: "function f() {}",
        referenceSolution: "THE_SECRET_ANSWER_KEY",
      },
    });

    expect(captured[0].body).not.toContain("THE_SECRET_ANSWER_KEY");
    expect(captured[0].body).not.toContain("development");
    expect(captured[0].body).not.toContain("isHidden");

    vi.unstubAllGlobals();
  });

  it("treats a malformed service response as a system error, not a pass", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("not json at all", { status: 200 })),
    );

    const service = new HttpExecutionService("https://exec.test/v1", undefined);
    const result = await service.execute({
      language: "JAVASCRIPT",
      code: "x",
      entryPoint: "f",
      tests: [{ order: 1, input: "[]", expectedOutput: "1", isHidden: false }],
      timeLimitMs: 2000,
      memoryLimitMb: 128,
    });

    expect(result.status).toBe("SYSTEM_ERROR");
    expect(result.passedTests).toBe(0);

    vi.unstubAllGlobals();
  });

  it("will not let a service response invent extra passing tests", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              status: "ACCEPTED",
              outcomes: [
                { order: 1, passed: true },
                { order: 99, passed: true },
                { order: 100, passed: true },
              ],
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          ),
      ),
    );

    const service = new HttpExecutionService("https://exec.test/v1", undefined);
    const result = await service.execute({
      language: "JAVASCRIPT",
      code: "x",
      entryPoint: "f",
      tests: [
        { order: 1, input: "[]", expectedOutput: "1", isHidden: false },
        { order: 2, input: "[]", expectedOutput: "2", isHidden: true },
      ],
      timeLimitMs: 2000,
      memoryLimitMb: 128,
    });

    // Two tests exist; only the one we asked about and got an answer for passes.
    expect(result.totalTests).toBe(2);
    expect(result.passedTests).toBe(1);

    vi.unstubAllGlobals();
  });

  it("defaults to a provider that runs nothing", () => {
    __setExecutionServiceForTests(undefined);
    const previous = process.env.CODE_EXECUTION_PROVIDER;
    delete process.env.CODE_EXECUTION_PROVIDER;

    expect(getExecutionService().name).toBe("none");

    __setExecutionServiceForTests(undefined);
    process.env.CODE_EXECUTION_PROVIDER = previous;
  });

  it("marks every simulated verdict as simulated", async () => {
    const service = new MockExecutionService();
    const result = await service.execute({
      language: "PYTHON",
      code: "# @mock:accepted",
      entryPoint: "f",
      tests: [{ order: 1, input: "[]", expectedOutput: "1", isHidden: false }],
      timeLimitMs: 2000,
      memoryLimitMb: 128,
    });

    expect(result.simulated).toBe(true);
    expect(result.status).toBe("ACCEPTED");
  });
});

// ── Message scrubbing ──────────────────────────────────────────────────────

describe("output sanitisation", () => {
  it("strips paths, URLs, addresses and container ids", () => {
    const scrubbed = sanitiseMessage(
      [
        "SyntaxError: unexpected token",
        "  at /srv/sandbox/run/abc/main.js:7:1",
        "worker c3ab8ff13720e8ad9047dd39466b3c89 at http://exec.internal:9000/run",
        "connected to 10.0.3.14:5432",
        "DATABASE_URL=postgres://user:pw@db/app",
      ].join("\n"),
    );

    expect(scrubbed).toContain("SyntaxError");
    expect(scrubbed).not.toContain("/srv/sandbox");
    expect(scrubbed).not.toContain("exec.internal");
    expect(scrubbed).not.toContain("10.0.3.14");
    expect(scrubbed).not.toContain("c3ab8ff13720e8ad9047dd39466b3c89");
    expect(scrubbed).not.toContain("postgres://");
  });

  it("returns nothing rather than a message made only of placeholders", () => {
    expect(sanitiseMessage("/srv/sandbox/run/x")).toBeNull();
    expect(sanitiseMessage("")).toBeNull();
    expect(sanitiseMessage(null)).toBeNull();
  });

  it("caps a program that produces enormous output", () => {
    const capped = sanitiseOutput("x".repeat(500_000));
    expect(capped!.length).toBeLessThan(EXECUTION_LIMITS.maxOutputChars + 100);
  });
});

// ── Deterministic feedback ─────────────────────────────────────────────────

describe("deterministic feedback", () => {
  const tests = [{ order: 1, input: "[[1]]", expectedOutput: "10", isHidden: false }];

  function feedbackFor(expected: string, actual: string | null) {
    return buildFeedback(
      {
        status: "WRONG_ANSWER",
        passedTests: 3,
        totalTests: 5,
        executionTime: null,
        memoryUsed: null,
        message: null,
        simulated: false,
        outcomes: [{ order: 1, passed: false, actualOutput: actual, isHidden: false }],
      },
      [{ order: 1, input: "[[1]]", expectedOutput: expected, isHidden: false }],
      { timeLimitMs: 1000, memoryLimitMb: 128 },
    ).feedback;
  }

  it("reports how many of how many passed", () => {
    expect(feedbackFor("10", "8")).toMatch(/3 of 5/);
  });

  it("names an off-by-one", () => {
    expect(feedbackFor("10", "11")).toMatch(/out by exactly one/i);
  });

  it("names right values in the wrong order", () => {
    expect(feedbackFor("[1,2,3]", "[3,2,1]")).toMatch(/order is wrong/i);
  });

  it("names a length mismatch", () => {
    expect(feedbackFor("[1,2,3]", "[1,2]")).toMatch(/2 values where 3 were expected/i);
  });

  it("names a case-only difference", () => {
    expect(feedbackFor('"Hello"', '"hello"')).toMatch(/capitalisation/i);
  });

  it("names a reversed string", () => {
    expect(feedbackFor('"abc"', '"cba"')).toMatch(/reversed/i);
  });

  it("names a missing return", () => {
    expect(feedbackFor("10", null)).toMatch(/returned nothing/i);
  });

  it("says nothing specific it cannot justify", () => {
    // Two unequal strings with no recognisable relationship: the count sentence
    // is still there, but nothing is invented about why.
    const feedback = feedbackFor('"apple"', '"orange"');
    expect(feedback).toMatch(/3 of 5/);
    expect(feedback).not.toMatch(/capitalisation|reversed|order/i);
  });

  it("says nothing at all when the answer is accepted", () => {
    const { feedback, failure } = buildFeedback(
      {
        status: "ACCEPTED",
        passedTests: 5,
        totalTests: 5,
        executionTime: 12,
        memoryUsed: 900,
        message: null,
        simulated: false,
        outcomes: [],
      },
      tests,
      { timeLimitMs: 1000, memoryLimitMb: 128 },
    );

    expect(feedback).toBeNull();
    expect(failure).toBeNull();
  });

  it("labels every status and knows which are terminal", () => {
    expect(STATUS_LABEL.ACCEPTED).toBe("Accepted");
    expect(STATUS_LABEL.TIME_LIMIT).toBe("Time Limit Exceeded");
    expect(isTerminal("QUEUED")).toBe(false);
    expect(isTerminal("RUNNING")).toBe(false);
    expect(isTerminal("WRONG_ANSWER")).toBe(true);
  });
});

// ── Submission lifecycle ───────────────────────────────────────────────────

describe("submission lifecycle", () => {
  it("moves a submission from queued through to a terminal status", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const problem = await problemBySlug("find-maximum");
    const started = await startSubmission({
      problemId: problem.id,
      language: "JAVASCRIPT",
      kind: "SUBMIT",
      code: await referenceSolution("find-maximum"),
    });

    const queued = await getSubmissionState({ submissionId: started.submissionId! });
    expect(queued.submission!.status).toBe("QUEUED");
    expect(isTerminal(queued.submission!.status)).toBe(false);

    const ran = await runSubmission({ submissionId: started.submissionId! });
    expect(isTerminal(ran.submission!.status)).toBe(true);

    const polled = await getSubmissionState({ submissionId: started.submissionId! });
    expect(polled.submission!.status).toBe("ACCEPTED");
  });

  it("does not re-run an already finished submission", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const problem = await problemBySlug("find-maximum");
    const { started } = await submit(
      problem.id,
      "// @mock:wrong\nfunction findMaximum(n) { return 0; }",
    );

    await runSubmission({ submissionId: started.submissionId! });

    // One graded attempt, not two, however many times run is called.
    expect((await getProblemProgress(user.id, problem.id))!.attempts).toBe(1);
  });

  it("shows submissions newest first, and only real submissions", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const problem = await problemBySlug("find-maximum");
    await submit(problem.id, "// @mock:wrong\nfunction findMaximum(n) { return 0; }");
    await submit(problem.id, await referenceSolution("find-maximum"), { kind: "RUN" });
    await submit(problem.id, await referenceSolution("find-maximum"));

    const history = await listSubmissions(user.id, problem.id);

    // The RUN is not history — it is a scratch check.
    expect(history).toHaveLength(2);
    expect(history[0].status).toBe("ACCEPTED");
    expect(history[1].status).toBe("WRONG_ANSWER");
  });
});

// ── Authored content validation ────────────────────────────────────────────

describe("authored practice content", () => {
  it("accepts every shipped problem", () => {
    for (const problem of PROBLEMS) {
      expect(validateProblem(problem), problem.slug).toEqual([]);
    }
    expect(validateProblemSet(PROBLEMS)).toEqual([]);
  });

  it("rejects a problem with no hidden test cases", () => {
    const errors = validateProblem({
      ...PROBLEMS[0],
      tests: PROBLEMS[0].tests.map((test) => ({ ...test, hidden: false })),
    });
    expect(errors.join(" ")).toMatch(/no hidden test cases/i);
  });

  it("rejects a problem connected to no topic", () => {
    const errors = validateProblem({ ...PROBLEMS[0], topicSlugs: [] });
    expect(errors.join(" ")).toMatch(/not connected to any topic/i);
  });

  it("rejects a test whose arguments do not match the signature", () => {
    const errors = validateProblem({
      ...PROBLEMS[0],
      tests: [{ args: [1, 2, 3], expected: 6, hidden: true }, ...PROBLEMS[0].tests],
    });
    expect(errors.join(" ")).toMatch(/arguments but the signature takes/i);
  });

  it("rejects a problem offered in no language", () => {
    const errors = validateProblem({ ...PROBLEMS[0], solutions: {} });
    expect(errors.join(" ")).toMatch(/no reference solution/i);
  });

  it("catches a language dropping below its catalog minimum", () => {
    const errors = validateProblemSet(
      PROBLEMS.map((problem) => ({ ...problem, solutions: { PYTHON: "pass" } })),
    );
    expect(errors.join(" ")).toMatch(/JAVASCRIPT: 0 easy/i);
  });

  it("stores test data as JSON the harness can run in any language", async () => {
    const cases = await db.practiceTestCase.findMany({
      where: { problem: { slug: "find-maximum" } },
      select: { input: true, expectedOutput: true },
    });

    for (const entry of cases) {
      expect(Array.isArray(JSON.parse(entry.input))).toBe(true);
      expect(() => JSON.parse(entry.expectedOutput)).not.toThrow();
    }
  });
});

// ── Phase 5 integration ────────────────────────────────────────────────────

describe("learning system integration", () => {
  it("does not disturb topic progress", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const topic = await db.topic.findUniqueOrThrow({
      where: { slug: "js-arrays" },
      select: { id: true },
    });
    await db.userTopicProgress.create({
      data: {
        userId: user.id,
        topicId: topic.id,
        status: "COMPLETED",
        percentComplete: 100,
      },
    });

    const problem = await problemBySlug("find-maximum");
    await submit(problem.id, await referenceSolution("find-maximum"));

    const progress = await db.userTopicProgress.findUniqueOrThrow({
      where: { userId_topicId: { userId: user.id, topicId: topic.id } },
    });
    expect(progress.status).toBe("COMPLETED");
    expect(progress.percentComplete).toBe(100);
  });

  it("recommends practice for a topic the learner just completed", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const career = await db.career.findUniqueOrThrow({
      where: { slug: "frontend-developer" },
      select: { id: true },
    });
    await db.profile.update({
      where: { userId: user.id },
      data: { selectedCareerId: career.id },
    });

    // Complete every required topic up to and including js-arrays, so
    // js-arrays is genuinely behind them and the next one is current.
    const roadmap = await db.roadmap.findFirstOrThrow({
      where: { careerId: career.id, isActive: true },
      select: {
        phases: {
          orderBy: { order: "asc" },
          select: {
            topics: {
              orderBy: { order: "asc" },
              select: { id: true, slug: true, isRequired: true },
            },
          },
        },
      },
    });
    const ordered = roadmap.phases.flatMap((phase) => phase.topics);
    const upTo = ordered.findIndex((topic) => topic.slug === "js-arrays");

    for (const topic of ordered.slice(0, upTo + 1)) {
      await db.userTopicProgress.create({
        data: {
          userId: user.id,
          topicId: topic.id,
          status: "COMPLETED",
          percentComplete: 100,
          completedAt: new Date(),
        },
      });
    }

    const { recommendations } = await getRecommendedProblems(user.id, 12);
    const slugs = recommendations.map((entry) => entry.problem.slug);

    // Array problems are attached to js-arrays, which they have now finished.
    expect(slugs).toContain("find-maximum");
  });
});
