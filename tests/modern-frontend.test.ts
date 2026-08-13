import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.fn();
vi.mock("@/auth", () => ({ auth, signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { getTopicForLearning } = await import("@/lib/learn/queries");
const { submitKnowledgeCheck, markTopicUnderstood, startTopic } = await import(
  "@/app/actions/learn"
);
const { getGuidance } = await import("@/lib/personalization/service");
const { buildContext } = await import("@/lib/ai/mentor");
const { db } = await import("@/lib/db");
const { LESSONS } = await import("../prisma/seed/lessons");
const { measureLesson, DEPTH_FLOOR } = await import(
  "../prisma/seed/lessons/coverage"
);
const { CAPABILITIES } = await import("../prisma/seed/capabilities");

/**
 * The Modern Frontend phase of the Frontend roadmap.
 *
 * This is the first phase whose topics do not form a single line. Next.js
 * opens two branches — rendering and routing — and rendering opens two more —
 * data fetching and performance — while accessibility and testing hang off
 * work from much earlier phases. That shape is deliberate and it is the thing
 * most likely to be broken by a well-meaning edit, so it gets asserted rather
 * than assumed.
 *
 * The phase also exposed a real gap in the capability catalog, and one test
 * records it rather than papering over it. See "capability coverage" below.
 */

const PHASE_SLUGS = [
  "nextjs",
  "rendering-strategies",
  "app-routing",
  "data-fetching",
  "auth-concepts",
  "frontend-performance",
  "accessibility-practice",
  "frontend-testing",
];

async function phaseTopics() {
  return db.topic.findMany({
    where: {
      phase: {
        title: "Modern Frontend",
        roadmap: { career: { slug: "frontend-developer" }, isActive: true },
      },
    },
    orderBy: { order: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      lesson: {
        select: {
          _count: { select: { sections: true, knowledgeChecks: true } },
          sections: { select: { code: true } },
          resources: { select: { id: true } },
        },
      },
      prerequisites: { select: { prerequisite: { select: { slug: true } } } },
      problems: { select: { problemId: true } },
      projects: { select: { projectId: true } },
    },
  });
}

async function makeUser(email: string) {
  const career = await db.career.findUniqueOrThrow({
    where: { slug: "frontend-developer" },
    select: { id: true },
  });

  return db.user.create({
    data: {
      name: "Modern Frontend Learner",
      email,
      passwordHash: "$2b$12$abcdefghijklmnopqrstuv",
      profile: {
        create: { onboardingCompleted: true, selectedCareerId: career.id },
      },
    },
  });
}

function signedInAs(id: string) {
  auth.mockResolvedValue({ user: { id } });
}

async function complete(userId: string, topicIds: string[]) {
  for (const topicId of topicIds) {
    await db.userTopicProgress.upsert({
      where: { userId_topicId: { userId, topicId } },
      create: {
        userId,
        topicId,
        status: "COMPLETED",
        percentComplete: 100,
        completedAt: new Date(),
      },
      update: { status: "COMPLETED", percentComplete: 100 },
    });
  }
}

/** Everything in roadmap order before `upToSlug`, plus the Git Academy work. */
async function reach(userId: string, upToSlug: string) {
  const roadmap = await db.roadmap.findFirstOrThrow({
    where: { career: { slug: "frontend-developer" }, isActive: true },
    select: {
      phases: {
        orderBy: { order: "asc" },
        select: {
          topics: { orderBy: { order: "asc" }, select: { id: true, slug: true } },
        },
      },
    },
  });

  const inOrder = roadmap.phases.flatMap((phase) => phase.topics);
  const stopAt = inOrder.findIndex((topic) => topic.slug === upToSlug);
  const { DELEGATED_TOPICS } = await import("@/lib/learn/delegation");

  await complete(
    userId,
    inOrder
      .slice(0, stopAt)
      .filter((topic) => !(topic.slug in DELEGATED_TOPICS))
      .map((topic) => topic.id),
  );

  const academySlugs = [
    ...new Set(Object.values(DELEGATED_TOPICS).flatMap((entry) => entry.requires)),
  ];
  const academyTopics = await db.topic.findMany({
    where: { slug: { in: academySlugs } },
    select: { id: true },
  });
  await complete(userId, academyTopics.map((topic) => topic.id));
}

async function answersFor(topicSlug: string, { wrong = 0 } = {}) {
  const lesson = await db.lesson.findFirstOrThrow({
    where: {
      topic: {
        slug: topicSlug,
        phase: { roadmap: { career: { slug: "frontend-developer" } } },
      },
    },
    select: {
      topicId: true,
      knowledgeChecks: {
        orderBy: { order: "asc" },
        select: { id: true, options: { select: { id: true, isCorrect: true } } },
      },
    },
  });

  const answers = lesson.knowledgeChecks.map((check, index) => {
    const correct = check.options.find((option) => option.isCorrect)!;
    const incorrect = check.options.find((option) => !option.isCorrect)!;
    return {
      questionId: check.id,
      optionId: index < wrong ? incorrect.id : correct.id,
    };
  });

  return { topicId: lesson.topicId, answers };
}

beforeEach(() => {
  auth.mockReset();
});

describe("Modern Frontend coverage", () => {
  it("teaches every topic in the phase, in roadmap order", async () => {
    const topics = await phaseTopics();

    expect(topics.map((topic) => topic.slug)).toEqual(PHASE_SLUGS);

    for (const topic of topics) {
      expect(topic.lesson, `${topic.slug} has no lesson`).not.toBeNull();
    }
  });

  it("holds every lesson to the curriculum's depth floor", async () => {
    const topics = await phaseTopics();

    for (const topic of topics) {
      expect(topic.lesson!._count.sections, topic.slug).toBeGreaterThanOrEqual(
        DEPTH_FLOOR.sections,
      );
      expect(
        topic.lesson!._count.knowledgeChecks,
        topic.slug,
      ).toBeGreaterThanOrEqual(DEPTH_FLOOR.knowledgeChecks);
      // Every topic here is about writing something, including the ones that
      // are mostly judgement — a lesson with no code is describing practice
      // rather than teaching it.
      expect(
        topic.lesson!.sections.some((section) => section.code),
        `${topic.slug} has no code example`,
      ).toBe(true);
      expect(topic.lesson!.resources.length, topic.slug).toBeGreaterThan(0);
    }
  });

  it("writes enough prose in each lesson to teach from", () => {
    const authored = LESSONS.filter((lesson) =>
      PHASE_SLUGS.includes(lesson.topicSlug),
    );

    expect(authored).toHaveLength(PHASE_SLUGS.length);

    for (const lesson of authored) {
      expect(
        measureLesson(lesson).contentChars,
        lesson.topicSlug,
      ).toBeGreaterThanOrEqual(DEPTH_FLOOR.contentChars);
    }
  });

  it("never sends the answer key to the browser", async () => {
    for (const slug of PHASE_SLUGS) {
      const topic = await getTopicForLearning(slug);

      for (const check of topic!.lesson!.knowledgeChecks) {
        expect(check, slug).not.toHaveProperty("explanation");
        for (const option of check.options) {
          expect(option, slug).not.toHaveProperty("isCorrect");
        }
      }
    }
  });

  it("does not leave the phase answerable by picking one position", async () => {
    const { answerPositions } = await import("../prisma/seed/lessons/shuffle");

    const positions = answerPositions(
      LESSONS.filter((lesson) => PHASE_SLUGS.includes(lesson.topicSlug)).flatMap(
        (lesson) => lesson.knowledgeChecks,
      ),
    );

    const counts = new Map<number, number>();
    for (const position of positions) {
      counts.set(position, (counts.get(position) ?? 0) + 1);
    }

    for (const [position, count] of counts) {
      expect(
        count / positions.length,
        `option ${position + 1} holds ${count}/${positions.length}`,
      ).toBeLessThan(0.5);
    }
    expect(counts.size).toBeGreaterThan(1);
  });
});

describe("Modern Frontend prerequisites", () => {
  it("opens on both React and TypeScript, because the phase needs both", async () => {
    const topics = await phaseTopics();
    const nextjs = topics.find((topic) => topic.slug === "nextjs")!;
    const prerequisites = nextjs.prerequisites.map((edge) => edge.prerequisite.slug);

    // Routing, because file-based routing is only meaningful against the
    // hand-configured version. TypeScript, because every example is typed.
    expect(prerequisites).toEqual(
      expect.arrayContaining(["react-routing", "react-typescript"]),
    );
  });

  it("branches rather than running in a line, and every branch is rooted", async () => {
    const topics = await phaseTopics();
    const prerequisitesOf = new Map(
      topics.map((topic) => [
        topic.slug,
        topic.prerequisites.map((edge) => edge.prerequisite.slug),
      ]),
    );

    // Next.js opens two branches.
    expect(prerequisitesOf.get("rendering-strategies")).toContain("nextjs");
    expect(prerequisitesOf.get("app-routing")).toContain("nextjs");

    // Rendering opens two more — caching and performance both depend on
    // understanding when a page is built.
    expect(prerequisitesOf.get("data-fetching")).toContain("rendering-strategies");
    expect(prerequisitesOf.get("frontend-performance")).toContain(
      "rendering-strategies",
    );

    expect(prerequisitesOf.get("auth-concepts")).toContain("data-fetching");

    // These two hang off earlier phases rather than off Next.js, which is
    // correct: neither is a framework topic.
    expect(prerequisitesOf.get("accessibility-practice")).toEqual(
      expect.arrayContaining(["accessibility-basics", "react-forms"]),
    );
    expect(prerequisitesOf.get("frontend-testing")).toContain(
      "react-api-integration",
    );
  });

  it("does not depend on anything authored after it", async () => {
    const roadmap = await db.roadmap.findFirstOrThrow({
      where: { career: { slug: "frontend-developer" }, isActive: true },
      select: {
        phases: {
          orderBy: { order: "asc" },
          select: {
            order: true,
            topics: {
              orderBy: { order: "asc" },
              select: {
                slug: true,
                prerequisites: {
                  select: { prerequisite: { select: { slug: true } } },
                },
              },
            },
          },
        },
      },
    });

    const phaseOf = new Map<string, number>();
    for (const phase of roadmap.phases) {
      for (const topic of phase.topics) phaseOf.set(topic.slug, phase.order);
    }

    for (const phase of roadmap.phases) {
      for (const topic of phase.topics) {
        if (!PHASE_SLUGS.includes(topic.slug)) continue;
        for (const edge of topic.prerequisites) {
          expect(
            phaseOf.get(edge.prerequisite.slug)!,
            `${topic.slug} depends on ${edge.prerequisite.slug}, which comes later`,
          ).toBeLessThanOrEqual(phase.order);
        }
      }
    }
  });

  it("has no cycle inside the phase", async () => {
    const topics = await phaseTopics();
    const edges = new Map(
      topics.map((topic) => [
        topic.slug,
        topic.prerequisites
          .map((edge) => edge.prerequisite.slug)
          .filter((slug) => PHASE_SLUGS.includes(slug)),
      ]),
    );

    const state = new Map<string, "open" | "done">();
    const cycles: string[] = [];
    const walk = (slug: string, trail: string[]) => {
      if (state.get(slug) === "done") return;
      if (state.get(slug) === "open") {
        cycles.push([...trail.slice(trail.indexOf(slug)), slug].join(" -> "));
        return;
      }
      state.set(slug, "open");
      for (const next of edges.get(slug) ?? []) walk(next, [...trail, slug]);
      state.set(slug, "done");
    };
    for (const slug of PHASE_SLUGS) walk(slug, []);

    expect(cycles).toEqual([]);
  });
});

describe("Modern Frontend capability coverage", () => {
  /**
   * Three of the eight topics feed a capability. Five do not, and this test
   * records which — deliberately, rather than quietly.
   *
   * The catalog has no capability for a framework, for authentication or for
   * performance, and the gap is not confined to this phase: `fs-auth`,
   * `fs-auth-flow`, `authentication` and `authorization` in the other two
   * roadmaps are equally unclaimed, as are `fs-performance` and
   * `indexes-and-performance`. Closing it properly means adding capabilities
   * that span three roadmaps, which is a change to the capability model rather
   * than to this curriculum, so it was reported instead of bundled in here.
   *
   * The consequence a learner sees: completing five of these eight topics
   * moves the roadmap but adds nothing to their profile.
   *
   * This test fails the moment somebody fixes that, which is the intent —
   * the claim should be revisited, not silently left behind.
   */
  it("records which topics feed a capability and which do not", async () => {
    const claimed = new Set(
      CAPABILITIES.flatMap((capability) => capability.topics ?? []),
    );

    const covered = PHASE_SLUGS.filter((slug) => claimed.has(slug));
    const uncovered = PHASE_SLUGS.filter((slug) => !claimed.has(slug));

    expect(covered.sort()).toEqual([
      "accessibility-practice",
      "data-fetching",
      "frontend-testing",
    ]);

    expect(uncovered.sort()).toEqual([
      "app-routing",
      "auth-concepts",
      "frontend-performance",
      "nextjs",
      "rendering-strategies",
    ]);
  });

  it("connects the phase to a project to apply it in", async () => {
    const topics = await phaseTopics();
    const withProject = topics.filter((topic) => topic.projects.length > 0);

    // Four of the eight, including the two that most need somewhere to land.
    expect(withProject.map((topic) => topic.slug).sort()).toEqual([
      "accessibility-practice",
      "data-fetching",
      "frontend-performance",
      "frontend-testing",
    ]);
  });

  it("has no practice, because the engine cannot grade any of it", async () => {
    // Every topic here is a judgement or an architecture question — where the
    // client boundary goes, whether a page may be static, what a test should
    // assert. The practice engine runs a pure function against test cases,
    // which can express none of that, so forcing a problem in would mean
    // inventing one that tests something else and labelling it Next.js.
    //
    // Asserted so that if practice is ever added, this is revisited rather
    // than assumed to have always been fine.
    const topics = await phaseTopics();

    for (const topic of topics) {
      expect(topic.problems, topic.slug).toEqual([]);
    }
  });
});

describe("progressing through Modern Frontend", () => {
  it("completes a topic when the knowledge check is passed", async () => {
    const user = await makeUser("mf-pass@example.com");
    signedInAs(user.id);
    await reach(user.id, "nextjs");

    const { topicId, answers } = await answersFor("nextjs");
    await startTopic({ topicId });

    const result = await submitKnowledgeCheck({ topicId, answers });

    expect(result.ok).toBe(true);
    expect(result.passed).toBe(true);

    const progress = await db.userTopicProgress.findUniqueOrThrow({
      where: { userId_topicId: { userId: user.id, topicId } },
    });
    expect(progress.status).toBe("COMPLETED");
    expect(progress.percentComplete).toBe(100);
  });

  it("does not complete on a failed attempt, and completes on a retry", async () => {
    const user = await makeUser("mf-fail@example.com");
    signedInAs(user.id);
    await reach(user.id, "nextjs");

    const wrong = await answersFor("nextjs", { wrong: 5 });
    const failed = await submitKnowledgeCheck({
      topicId: wrong.topicId,
      answers: wrong.answers,
    });

    expect(failed.passed).toBe(false);
    for (const question of failed.results!) {
      expect(question.explanation.length).toBeGreaterThan(20);
      expect(question.correctOptionId).not.toBe("");
    }

    const afterFailure = await db.userTopicProgress.findUniqueOrThrow({
      where: { userId_topicId: { userId: user.id, topicId: wrong.topicId } },
    });
    expect(afterFailure.status).toBe("IN_PROGRESS");
    expect(afterFailure.completedAt).toBeNull();

    const right = await answersFor("nextjs");
    expect(
      (await submitKnowledgeCheck({ topicId: right.topicId, answers: right.answers }))
        .passed,
    ).toBe(true);

    const afterRetry = await db.userTopicProgress.findUniqueOrThrow({
      where: { userId_topicId: { userId: user.id, topicId: wrong.topicId } },
    });
    expect(afterRetry.status).toBe("COMPLETED");
    expect(afterRetry.attempts).toBe(2);
  });

  it("refuses to grade a topic whose prerequisites are outstanding", async () => {
    const user = await makeUser("mf-skipahead@example.com");
    signedInAs(user.id);

    const { topicId, answers } = await answersFor("auth-concepts");
    const result = await submitKnowledgeCheck({ topicId, answers });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/first|before|complete/i);
    expect(
      await db.userTopicProgress.findUnique({
        where: { userId_topicId: { userId: user.id, topicId } },
      }),
    ).toBeNull();
  });

  it("refuses to let a topic be claimed as understood", async () => {
    const user = await makeUser("mf-attest@example.com");
    signedInAs(user.id);
    await reach(user.id, "nextjs");

    const topic = await db.topic.findFirstOrThrow({
      where: {
        slug: "nextjs",
        phase: { roadmap: { career: { slug: "frontend-developer" } } },
      },
      select: { id: true },
    });

    const result = await markTopicUnderstood({ topicId: topic.id });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/knowledge check/i);
    expect(
      await db.userTopicProgress.findUnique({
        where: { userId_topicId: { userId: user.id, topicId: topic.id } },
      }),
    ).toBeNull();
  });

  it("cannot be completed for somebody else", async () => {
    const alice = await makeUser("mf-alice@example.com");
    const mallory = await makeUser("mf-mallory@example.com");
    await reach(alice.id, "nextjs");
    await reach(mallory.id, "nextjs");

    signedInAs(mallory.id);
    const { topicId, answers } = await answersFor("nextjs");
    await submitKnowledgeCheck({ topicId, answers });

    expect(
      await db.userTopicProgress.findUnique({
        where: { userId_topicId: { userId: alice.id, topicId } },
      }),
    ).toBeNull();
  });
});

describe("what CodeCompass recommends around Modern Frontend", () => {
  it("sends a learner who has finished TypeScript into Next.js", async () => {
    const user = await makeUser("mf-before@example.com");
    signedInAs(user.id);
    await reach(user.id, "nextjs");

    const guidance = await getGuidance(user.id);
    expect(guidance.state.currentTopic?.slug).toBe("nextjs");

    const context = buildContext({ guidance, firstName: "Sam" });
    expect(context).toContain("Current phase: Modern Frontend");
  });

  it("moves to the next incomplete topic partway through the phase", async () => {
    const user = await makeUser("mf-during@example.com");
    signedInAs(user.id);
    await reach(user.id, "data-fetching");

    const guidance = await getGuidance(user.id);
    expect(guidance.state.currentTopic?.slug).toBe("data-fetching");
  });

  it("hands the learner to the next phase once the phase is done", async () => {
    const user = await makeUser("mf-after@example.com");
    signedInAs(user.id);

    const topics = await phaseTopics();
    await reach(user.id, "nextjs");
    await complete(user.id, topics.map((topic) => topic.id));

    const guidance = await getGuidance(user.id);

    expect(guidance.state.currentTopic).not.toBeNull();
    expect(PHASE_SLUGS).not.toContain(guidance.state.currentTopic!.slug);
    expect(guidance.state.currentTopic!.phaseTitle).not.toBe("Modern Frontend");
  });

  it("counts the phase towards the roadmap", async () => {
    const user = await makeUser("mf-progress@example.com");
    signedInAs(user.id);
    await reach(user.id, "nextjs");

    const before = await getGuidance(user.id);

    const { topicId, answers } = await answersFor("nextjs");
    await submitKnowledgeCheck({ topicId, answers });

    const after = await getGuidance(user.id);

    expect(after.state.progress.roadmap).toBeGreaterThan(
      before.state.progress.roadmap,
    );
    expect(after.state.completedTopicIds).toContain(topicId);
  });
});
