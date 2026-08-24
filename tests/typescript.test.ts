import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.fn();
vi.mock("@/auth", () => ({ auth, signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { getTopicForLearning } = await import("@/lib/learn/queries");
const { submitKnowledgeCheck, markTopicUnderstood, startTopic } = await import(
  "@/app/actions/learn"
);
const { getGuidance } = await import("@/lib/personalization/service");
const { db } = await import("@/lib/db");
const { LESSONS } = await import("../prisma/seed/lessons");
const { measureLesson, DEPTH_FLOOR } = await import(
  "../prisma/seed/lessons/coverage"
);
const { CAPABILITIES } = await import("../prisma/seed/capabilities");

/**
 * The TypeScript phase of the Frontend roadmap.
 *
 * TypeScript is the first phase that is *entirely* a build on earlier work —
 * it introduces no new runtime concept, only a way of describing the React and
 * JavaScript a learner already writes. So alongside the usual coverage and
 * journey properties, these tests pin the seams: that the phase opens on the
 * JavaScript it needs, that its last topic genuinely depends on React, and
 * that finishing it hands the learner to the next phase rather than to a dead
 * end.
 */

const TS_SLUGS = [
  "ts-types",
  "ts-interfaces",
  "ts-unions",
  "ts-narrowing",
  "ts-generics",
  "react-typescript",
];

async function typescriptTopics() {
  return db.topic.findMany({
    where: {
      phase: {
        title: "TypeScript",
        roadmap: { career: { slug: "frontend-developer" }, isActive: true },
      },
    },
    orderBy: { order: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      isRequired: true,
      lesson: {
        select: {
          id: true,
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
      name: "TypeScript Learner",
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

describe("TypeScript curriculum coverage", () => {
  it("teaches every topic in the phase, in roadmap order", async () => {
    const topics = await typescriptTopics();

    expect(topics.map((topic) => topic.slug)).toEqual(TS_SLUGS);

    for (const topic of topics) {
      expect(topic.lesson, `${topic.slug} has no lesson`).not.toBeNull();
    }
  });

  it("holds every TypeScript lesson to the curriculum's depth floor", async () => {
    const topics = await typescriptTopics();

    for (const topic of topics) {
      expect(topic.lesson!._count.sections, topic.slug).toBeGreaterThanOrEqual(
        DEPTH_FLOOR.sections,
      );
      expect(
        topic.lesson!._count.knowledgeChecks,
        topic.slug,
      ).toBeGreaterThanOrEqual(DEPTH_FLOOR.knowledgeChecks);
      // A TypeScript lesson with no code is describing a type system rather
      // than teaching one.
      expect(
        topic.lesson!.sections.some((section) => section.code),
        `${topic.slug} has no code example`,
      ).toBe(true);
      expect(topic.lesson!.resources.length, topic.slug).toBeGreaterThan(0);
    }
  });

  it("writes enough prose in each lesson to teach from", () => {
    const authored = LESSONS.filter((lesson) => TS_SLUGS.includes(lesson.topicSlug));

    expect(authored).toHaveLength(TS_SLUGS.length);

    for (const lesson of authored) {
      expect(measureLesson(lesson).contentChars, lesson.topicSlug).toBeGreaterThanOrEqual(
        DEPTH_FLOOR.contentChars,
      );
    }
  });

  it("never sends the answer key for a TypeScript lesson to the browser", async () => {
    for (const slug of TS_SLUGS) {
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
    // The rotation is shared, and this is the assertion that it reached the
    // newest content rather than only the content it was written against.
    const { answerPositions } = await import("../prisma/seed/lessons/shuffle");

    const positions = answerPositions(
      LESSONS.filter((lesson) => TS_SLUGS.includes(lesson.topicSlug)).flatMap(
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

describe("TypeScript prerequisites", () => {
  it("opens on the JavaScript it needs and builds one chain", async () => {
    const topics = await typescriptTopics();
    const prerequisitesOf = new Map(
      topics.map((topic) => [
        topic.slug,
        topic.prerequisites.map((edge) => edge.prerequisite.slug),
      ]),
    );

    // Objects, because describing data is what the first lesson is about.
    expect(prerequisitesOf.get("ts-types")).toContain("js-objects");
    expect(prerequisitesOf.get("ts-interfaces")).toContain("ts-types");
    expect(prerequisitesOf.get("ts-unions")).toContain("ts-interfaces");
    expect(prerequisitesOf.get("ts-narrowing")).toContain("ts-unions");
    expect(prerequisitesOf.get("ts-generics")).toContain("ts-narrowing");
  });

  it("makes the React topic genuinely depend on React", async () => {
    const topics = await typescriptTopics();
    const reactTypescript = topics.find((topic) => topic.slug === "react-typescript")!;
    const prerequisites = reactTypescript.prerequisites.map(
      (edge) => edge.prerequisite.slug,
    );

    // Both halves: the TypeScript it applies, and the React it applies it to.
    // Without the second edge a learner could reach it having never seen a hook.
    expect(prerequisites).toEqual(
      expect.arrayContaining(["ts-generics", "react-hooks"]),
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
        if (!TS_SLUGS.includes(topic.slug)) continue;
        for (const edge of topic.prerequisites) {
          expect(
            phaseOf.get(edge.prerequisite.slug)!,
            `${topic.slug} depends on ${edge.prerequisite.slug}, which comes later`,
          ).toBeLessThanOrEqual(phase.order);
        }
      }
    }
  });

  it("has no cycle inside the chain", async () => {
    const topics = await typescriptTopics();
    const edges = new Map(
      topics.map((topic) => [
        topic.slug,
        topic.prerequisites
          .map((edge) => edge.prerequisite.slug)
          .filter((slug) => TS_SLUGS.includes(slug)),
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
    for (const slug of TS_SLUGS) walk(slug, []);

    expect(cycles).toEqual([]);
  });
});

describe("TypeScript capability and projects", () => {
  it("counts every phase topic towards the TypeScript capability", async () => {
    const capability = CAPABILITIES.find((entry) => entry.slug === "typescript")!;

    for (const slug of TS_SLUGS) {
      expect(capability.topics, slug).toContain(slug);
    }
  });

  it("gives the phase a project to apply it to", async () => {
    const topics = await typescriptTopics();
    const withProject = topics.filter((topic) => topic.projects.length > 0);

    // Not every topic needs one; the phase does.
    expect(withProject.length).toBeGreaterThan(0);

    const project = await db.project.findFirstOrThrow({
      where: {
        concepts: {
          some: { topic: { slug: "react-typescript" }, isPrerequisite: true },
        },
      },
      select: { slug: true },
    });

    expect(project.slug).toBeTruthy();
  });

  it("records that the phase has no practice, rather than pretending otherwise", async () => {
    // The practice engine grades pure functions against return values, and
    // starter code is generated from the signature — so a "TypeScript problem"
    // would be an ordinary problem with the types already written in. Nothing
    // about typing is gradable there.
    //
    // The capability declares no practiceTopics for TypeScript, so this is an
    // absence rather than a dangling evidence source. Asserted so that if
    // practice is ever added, this test fails and the claim gets revisited.
    const capability = CAPABILITIES.find((entry) => entry.slug === "typescript")!;
    expect(capability.practiceTopics ?? []).toEqual([]);

    const topics = await typescriptTopics();
    for (const topic of topics) {
      expect(topic.problems, topic.slug).toEqual([]);
    }
  });
});

describe("progressing through TypeScript", () => {
  it("completes a topic when the knowledge check is passed", async () => {
    const user = await makeUser("ts-pass@example.com");
    signedInAs(user.id);
    await reach(user.id, "ts-types");

    const { topicId, answers } = await answersFor("ts-types");
    await startTopic({ topicId });

    const result = await submitKnowledgeCheck({ topicId, answers });

    expect(result.ok).toBe(true);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);

    const progress = await db.userTopicProgress.findUniqueOrThrow({
      where: { userId_topicId: { userId: user.id, topicId } },
    });
    expect(progress.status).toBe("COMPLETED");
    expect(progress.percentComplete).toBe(100);
  });

  it("does not complete on a failed attempt, and completes on a retry", async () => {
    const user = await makeUser("ts-fail@example.com");
    signedInAs(user.id);
    await reach(user.id, "ts-interfaces");

    const wrong = await answersFor("ts-interfaces", { wrong: 4 });
    const failed = await submitKnowledgeCheck({
      topicId: wrong.topicId,
      answers: wrong.answers,
    });

    expect(failed.ok).toBe(true);
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

    const right = await answersFor("ts-interfaces");
    expect((await submitKnowledgeCheck({ topicId: right.topicId, answers: right.answers })).passed).toBe(true);

    const afterRetry = await db.userTopicProgress.findUniqueOrThrow({
      where: { userId_topicId: { userId: user.id, topicId: wrong.topicId } },
    });
    expect(afterRetry.status).toBe("COMPLETED");
    expect(afterRetry.attempts).toBe(2);
  });

  it("refuses to grade a topic whose prerequisites are outstanding", async () => {
    const user = await makeUser("ts-skipahead@example.com");
    signedInAs(user.id);
    // Deliberately nothing completed: generics is four topics deep.

    const { topicId, answers } = await answersFor("ts-generics");
    const result = await submitKnowledgeCheck({ topicId, answers });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/first|before|complete/i);
    expect(
      await db.userTopicProgress.findUnique({
        where: { userId_topicId: { userId: user.id, topicId } },
      }),
    ).toBeNull();
  });

  it("refuses to let a TypeScript topic be claimed as understood", async () => {
    const user = await makeUser("ts-attest@example.com");
    signedInAs(user.id);
    await reach(user.id, "ts-types");

    const topic = await db.topic.findFirstOrThrow({
      where: {
        slug: "ts-types",
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
    const alice = await makeUser("ts-alice@example.com");
    const mallory = await makeUser("ts-mallory@example.com");
    await reach(alice.id, "ts-types");
    await reach(mallory.id, "ts-types");

    signedInAs(mallory.id);
    const { topicId, answers } = await answersFor("ts-types");
    await submitKnowledgeCheck({ topicId, answers });

    expect(
      await db.userTopicProgress.findUnique({
        where: { userId_topicId: { userId: alice.id, topicId } },
      }),
    ).toBeNull();
  });
});

describe("what CodeCompass recommends around TypeScript", () => {
  it("sends a learner who has finished React into the first TypeScript topic", async () => {
    const user = await makeUser("ts-before@example.com");
    signedInAs(user.id);
    await reach(user.id, "ts-types");

    const guidance = await getGuidance(user.id);
    expect(guidance.state.currentTopic?.slug).toBe("ts-types");

    expect(guidance.state.currentTopic?.phaseTitle).toBe("TypeScript");
  });

  it("moves to the next incomplete topic partway through the phase", async () => {
    const user = await makeUser("ts-during@example.com");
    signedInAs(user.id);
    await reach(user.id, "ts-narrowing");

    const guidance = await getGuidance(user.id);
    expect(guidance.state.currentTopic?.slug).toBe("ts-narrowing");
  });

  it("hands the learner to the next phase once TypeScript is done", async () => {
    const user = await makeUser("ts-after@example.com");
    signedInAs(user.id);

    const topics = await typescriptTopics();
    await reach(user.id, "ts-types");
    await complete(user.id, topics.map((topic) => topic.id));

    const guidance = await getGuidance(user.id);

    // Asserted as "not TypeScript" rather than as a slug, so authoring the
    // next phase cannot break it.
    expect(guidance.state.currentTopic).not.toBeNull();
    expect(TS_SLUGS).not.toContain(guidance.state.currentTopic!.slug);
    expect(guidance.state.currentTopic!.phaseTitle).not.toBe("TypeScript");
  });

  it("counts TypeScript towards the roadmap and the capability", async () => {
    const user = await makeUser("ts-progress@example.com");
    signedInAs(user.id);
    await reach(user.id, "ts-types");

    const before = await getGuidance(user.id);

    const { topicId, answers } = await answersFor("ts-types");
    await submitKnowledgeCheck({ topicId, answers });

    const after = await getGuidance(user.id);

    expect(after.state.progress.roadmap).toBeGreaterThan(before.state.progress.roadmap);
    expect(after.state.completedTopicIds).toContain(topicId);
  });
});
