import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.fn();
vi.mock("@/auth", () => ({ auth, signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const {
  getNextProblemFor,
  getPracticeContext,
  getPracticeProfile,
  getPracticeStats,
  getRecommendedProblems,
  listProblems,
  listProblemsForRanking,
} = await import("@/lib/practice/queries");

const { getActiveRoadmapForCareer, getRoadmapTopicOrder } =
  await import("@/lib/roadmap/queries");

const { db } = await import("@/lib/db");

/**
 * The reads behind Practice, checked for what they cost as well as what they
 * say.
 *
 * Everything here is a correctness test with a performance motive. Three of the
 * queries below were rewritten to stop loading data the page never rendered -
 * the whole roadmap tree to find one topic id, the whole catalog to name one
 * "next" link, a second pass over progress rows to count what the first pass
 * already knew. A rewrite like that is only safe if something pins the answer,
 * because a cheaper query that returns a *different* answer is not an
 * optimisation, it is a bug with a stopwatch attached.
 *
 * Deliberately no timing assertions. A test that fails when a laptop is busy
 * teaches everyone to ignore it.
 */

async function makeUser(email: string) {
  return db.user.create({
    data: {
      name: "Perf Learner",
      email,
      passwordHash: "$2b$12$abcdefghijklmnopqrstuv",
      profile: { create: { onboardingCompleted: true } },
    },
  });
}

/** A learner with a career, so the roadmap-shaped reads actually do something. */
async function makeLearnerOnACareer(email: string) {
  const user = await makeUser(email);
  const career = await db.career.findFirstOrThrow({
    where: { roadmaps: { some: { isActive: true } } },
    select: { id: true },
  });
  await db.profile.update({
    where: { userId: user.id },
    data: { selectedCareerId: career.id },
  });
  return { user, careerId: career.id };
}

beforeEach(() => {
  auth.mockReset();
});

// ── The lean roadmap read ──────────────────────────────────────────────────

describe("roadmap topic order", () => {
  it("names the same topics, in the same order, as the whole tree does", async () => {
    // This is the assertion the cheap read exists for. currentTopicId walks
    // this list and takes the first required topic the learner has not
    // finished, so if the order ever differed from the roadmap page's, the two
    // would tell a learner they are on different topics.
    const career = await db.career.findFirstOrThrow({
      where: { roadmaps: { some: { isActive: true } } },
      select: { id: true },
    });

    const [tree, lean] = await Promise.all([
      getActiveRoadmapForCareer(career.id),
      getRoadmapTopicOrder(career.id),
    ]);

    expect(tree).not.toBeNull();
    expect(lean).not.toBeNull();
    expect(lean!.id).toBe(tree!.id);

    const fromTree = tree!.phases.flatMap((phase) =>
      phase.topics.map((topic) => ({ id: topic.id, isRequired: topic.isRequired })),
    );
    const fromLean = lean!.topics.map((topic) => ({
      id: topic.id,
      isRequired: topic.isRequired,
    }));

    expect(fromLean).toEqual(fromTree);
    expect(fromLean.length).toBeGreaterThan(0);
  });

  it("returns null for a career with no roadmap, rather than failing", async () => {
    const orphan = await db.career.findFirst({
      where: { roadmaps: { none: {} } },
      select: { id: true },
    });
    if (!orphan) return; // every seeded career has one; nothing to check
    expect(await getRoadmapTopicOrder(orphan.id)).toBeNull();
  });
});

// ── The lean catalog projection ────────────────────────────────────────────

describe("the ranking projection", () => {
  it("covers the whole catalog", async () => {
    const user = await makeUser("ranking-covers@example.com");
    const [full, lean] = await Promise.all([
      listProblems(user.id),
      listProblemsForRanking(user.id),
    ]);

    expect(lean).toHaveLength(full.length);
    expect(lean.map((problem) => problem.slug)).toEqual(
      full.map((problem) => problem.slug),
    );
  });

  it("carries exactly what ranking and a link need, and nothing else", async () => {
    // The point of the projection. If a field creeps back in, three hundred
    // rows of it come with it, on a page that renders none of it.
    const user = await makeUser("ranking-shape@example.com");
    const [first] = await listProblemsForRanking(user.id);

    expect(Object.keys(first!).sort()).toEqual([
      "difficulty",
      "id",
      "slug",
      "sortOrder",
      "status",
      "title",
      "topicIds",
    ]);
    expect(Array.isArray(first!.topicIds)).toBe(true);
    expect(first!.topicIds.length).toBeGreaterThan(0);
  });

  it("agrees with the catalog about status and topics", async () => {
    const user = await makeUser("ranking-agrees@example.com");
    const problem = await db.practiceProblem.findFirstOrThrow({
      orderBy: { sortOrder: "asc" },
      select: { id: true },
    });
    await db.userProblemProgress.create({
      data: { userId: user.id, problemId: problem.id, status: "SOLVED", attempts: 1 },
    });

    const [full, lean] = await Promise.all([
      listProblems(user.id),
      listProblemsForRanking(user.id),
    ]);

    const fullRow = full.find((entry) => entry.id === problem.id)!;
    const leanRow = lean.find((entry) => entry.id === problem.id)!;

    expect(leanRow.status).toBe("SOLVED");
    expect(leanRow.status).toBe(fullRow.status);
    expect([...leanRow.topicIds].sort()).toEqual(
      fullRow.topics.map((topic) => topic.id).sort(),
    );
  });
});

// ── Statistics, now counted from the catalog ───────────────────────────────

describe("practice statistics", () => {
  it("counts the catalog rather than trusting a number written down", async () => {
    const user = await makeUser("stats-total@example.com");
    const [stats, problems] = await Promise.all([
      getPracticeStats(user.id),
      listProblems(user.id),
    ]);

    expect(stats.totalProblems).toBe(problems.length);
    expect(stats.totalProblems).toBe(await db.practiceProblem.count());
  });

  it("splits solved by difficulty exactly as the progress rows say", async () => {
    const user = await makeUser("stats-split@example.com");

    const [easy, medium, hard] = await Promise.all([
      db.practiceProblem.findFirstOrThrow({ where: { difficulty: "EASY" } }),
      db.practiceProblem.findFirstOrThrow({ where: { difficulty: "MEDIUM" } }),
      db.practiceProblem.findFirstOrThrow({ where: { difficulty: "HARD" } }),
    ]);

    await db.userProblemProgress.createMany({
      data: [
        { userId: user.id, problemId: easy.id, status: "SOLVED", attempts: 1 },
        { userId: user.id, problemId: medium.id, status: "SOLVED", attempts: 1 },
        { userId: user.id, problemId: hard.id, status: "ATTEMPTED", attempts: 3 },
      ],
    });

    const stats = await getPracticeStats(user.id);

    expect(stats.solved).toBe(2);
    expect(stats.attempted).toBe(1);
    expect(stats.easySolved).toBe(1);
    expect(stats.mediumSolved).toBe(1);
    expect(stats.hardSolved).toBe(0);
  });

  it("keeps one learner's counts out of another's", async () => {
    const [mine, theirs] = await Promise.all([
      makeUser("stats-mine@example.com"),
      makeUser("stats-theirs@example.com"),
    ]);
    const problem = await db.practiceProblem.findFirstOrThrow();
    await db.userProblemProgress.create({
      data: { userId: theirs.id, problemId: problem.id, status: "SOLVED", attempts: 1 },
    });

    expect((await getPracticeStats(mine.id)).solved).toBe(0);
    expect((await getPracticeStats(theirs.id)).solved).toBe(1);
  });
});

// ── The next problem ───────────────────────────────────────────────────────

describe("the problem to open next", () => {
  it("never suggests the problem the learner is already on", async () => {
    const { user } = await makeLearnerOnACareer("next-not-current@example.com");
    const current = await db.practiceProblem.findFirstOrThrow({
      orderBy: { sortOrder: "asc" },
      select: { id: true, slug: true },
    });

    const next = await getNextProblemFor(user.id, current.id);

    expect(next).not.toBeNull();
    expect(next!.slug).not.toBe(current.slug);
  });

  it("prefers the recommendation a learner would have been shown", async () => {
    // The page used to rank this from the catalog projection and now ranks it
    // from the lean one. Same ranking, same answer - which is what this pins.
    const { user } = await makeLearnerOnACareer("next-matches@example.com");
    const current = await db.practiceProblem.findFirstOrThrow({
      orderBy: { sortOrder: "asc" },
      select: { id: true },
    });

    const { recommendations } = await getRecommendedProblems(user.id, 5);
    const expected = recommendations.find(
      ({ problem }) => problem.id !== current.id,
    )?.problem;

    const next = await getNextProblemFor(user.id, current.id);

    if (expected) {
      expect(next).toEqual({ slug: expected.slug, title: expected.title });
    } else {
      // No recommendation applies, so the fallback answers instead.
      expect(next).not.toBeNull();
    }
  });

  it("falls back to the first unsolved problem in authored order", async () => {
    // No career, so nothing can be recommended. The learner still gets
    // somewhere to go rather than a dead end.
    const user = await makeUser("next-fallback@example.com");
    const problems = await db.practiceProblem.findMany({
      orderBy: { sortOrder: "asc" },
      take: 3,
      select: { id: true, slug: true, title: true },
    });

    await db.userProblemProgress.create({
      data: {
        userId: user.id,
        problemId: problems[1]!.id,
        status: "SOLVED",
        attempts: 1,
      },
    });

    // Standing on the first problem, with the second solved, the third is next.
    const next = await getNextProblemFor(user.id, problems[0]!.id);

    expect(next).toEqual({ slug: problems[2]!.slug, title: problems[2]!.title });
  });

  it("returns null when there is nowhere left to go", async () => {
    const user = await makeUser("next-nowhere@example.com");
    const problems = await db.practiceProblem.findMany({ select: { id: true } });

    await db.userProblemProgress.createMany({
      data: problems.map((problem) => ({
        userId: user.id,
        problemId: problem.id,
        status: "SOLVED" as const,
        attempts: 1,
      })),
    });

    expect(await getNextProblemFor(user.id, problems[0]!.id)).toBeNull();
  });

  it("says nothing about hidden tests or reference solutions", async () => {
    // It ranks from a projection that never selects them, and it returns two
    // strings. Pinned because "the next link" is a payload that reaches the
    // browser, and payloads are where answer keys leak.
    const { user } = await makeLearnerOnACareer("next-safe@example.com");
    const current = await db.practiceProblem.findFirstOrThrow({ select: { id: true } });

    const next = await getNextProblemFor(user.id, current.id);

    expect(Object.keys(next ?? {}).sort()).toEqual(["slug", "title"]);
  });
});

// ── The shared profile read ────────────────────────────────────────────────

describe("the practice profile", () => {
  it("answers both questions the render used to ask separately", async () => {
    const { user, careerId } = await makeLearnerOnACareer("profile-shared@example.com");
    await db.profile.update({
      where: { userId: user.id },
      data: { selectedLanguage: "PYTHON" },
    });

    const profile = await getPracticeProfile(user.id);

    expect(profile?.selectedLanguage).toBe("PYTHON");
    expect(profile?.chosenCareer?.id).toBe(careerId);
  });

  it("returns null for a learner with no profile row", async () => {
    const user = await db.user.create({
      data: {
        name: "No Profile",
        email: "profile-none@example.com",
        passwordHash: "$2b$12$abcdefghijklmnopqrstuv",
      },
    });
    expect(await getPracticeProfile(user.id)).toBeNull();
  });
});

// ── The context, which now shares that read ────────────────────────────────

describe("practice context", () => {
  it("names the same current topic the recommendation does", async () => {
    const { user } = await makeLearnerOnACareer("context-agrees@example.com");

    const [context, recommended] = await Promise.all([
      getPracticeContext(user.id),
      getRecommendedProblems(user.id),
    ]);

    expect(context.currentTopic?.id).toBe(recommended.currentTopic?.id);
    expect(context.careerName).toBe(recommended.careerName);
  });

  it("returns nulls for a learner with no career, rather than failing", async () => {
    const user = await makeUser("context-no-career@example.com");
    expect(await getPracticeContext(user.id)).toEqual({
      careerName: null,
      currentTopic: null,
    });
  });
});

// ── Saved source, one row per language ─────────────────────────────────────

describe("restoring a learner's work", () => {
  it("keeps the most recent source for each language and no more", async () => {
    // The page used to take twenty-five rows and keep the first per language;
    // at most five are ever used, so twenty whole source files crossed the wire
    // to be discarded. `distinct` asks for what is used.
    const user = await makeUser("saved-code@example.com");
    const problem = await db.practiceProblem.findFirstOrThrow({ select: { id: true } });

    for (const [index, code] of ["first", "second", "third"].entries()) {
      await db.submission.create({
        data: {
          userId: user.id,
          problemId: problem.id,
          language: "JAVASCRIPT",
          kind: "SUBMIT",
          status: "WRONG_ANSWER",
          code,
          createdAt: new Date(Date.now() + index * 1000),
        },
      });
    }
    await db.submission.create({
      data: {
        userId: user.id,
        problemId: problem.id,
        language: "PYTHON",
        kind: "SUBMIT",
        status: "ACCEPTED",
        code: "python one",
      },
    });

    const rows = await db.submission.findMany({
      where: { userId: user.id, problemId: problem.id },
      orderBy: { createdAt: "desc" },
      distinct: ["language"],
      select: { language: true, code: true },
    });

    expect(rows).toHaveLength(2);
    expect(rows.find((row) => row.language === "JAVASCRIPT")?.code).toBe("third");
    expect(rows.find((row) => row.language === "PYTHON")?.code).toBe("python one");
  });

  it("never restores another learner's source", async () => {
    const [mine, theirs] = await Promise.all([
      makeUser("saved-mine@example.com"),
      makeUser("saved-theirs@example.com"),
    ]);
    const problem = await db.practiceProblem.findFirstOrThrow({ select: { id: true } });

    await db.submission.create({
      data: {
        userId: theirs.id,
        problemId: problem.id,
        language: "JAVASCRIPT",
        kind: "SUBMIT",
        status: "ACCEPTED",
        code: "THEIR SECRET SOLUTION",
      },
    });

    const rows = await db.submission.findMany({
      where: { userId: mine.id, problemId: problem.id },
      orderBy: { createdAt: "desc" },
      distinct: ["language"],
      select: { code: true },
    });

    expect(rows).toEqual([]);
  });
});
