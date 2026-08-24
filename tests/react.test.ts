import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.fn();
vi.mock("@/auth", () => ({ auth, signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { getTopicForLearning } = await import("@/lib/learn/queries");
const { submitKnowledgeCheck, markTopicUnderstood, startTopic } = await import(
  "@/app/actions/learn"
);
const { getGuidance, getNextAction } = await import(
  "@/lib/personalization/service"
);
const { db } = await import("@/lib/db");
const { LESSONS } = await import("../prisma/seed/lessons");
const { measureLesson, DEPTH_FLOOR } = await import(
  "../prisma/seed/lessons/coverage"
);
const { CAPABILITIES } = await import("../prisma/seed/capabilities");

/**
 * The React phase of the Frontend roadmap.
 *
 * Two kinds of test live here, and the split is deliberate.
 *
 * The content tests assert properties of the authored curriculum — every React
 * topic teaches, nothing is a stub, the prerequisite chain says what it means.
 * They are properties rather than counts so that authoring more content can
 * only ever make them pass harder.
 *
 * The journey tests assert what a learner can and cannot do. React is the
 * first phase a learner reaches after the Git Academy bridge, so the questions
 * that matter are whether it opens at the right moment, whether a wrong answer
 * is genuinely a wrong answer, and whether anything short of passing can mark
 * a React topic complete. All of it runs against the server actions, because
 * the client is not the authority on any of it.
 */

/** The React phase's topics, in roadmap order. */
async function reactTopics() {
  return db.topic.findMany({
    where: {
      phase: {
        title: { contains: "React" },
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

const REACT_SLUGS = [
  "react-fundamentals",
  "react-components",
  "react-props",
  "react-state",
  "react-hooks",
  "react-forms",
  "react-routing",
  "react-api-integration",
  "state-management",
];

async function makeUser(email: string) {
  const career = await db.career.findUniqueOrThrow({
    where: { slug: "frontend-developer" },
    select: { id: true },
  });

  return db.user.create({
    data: {
      name: "React Learner",
      email,
      passwordHash: "$2b$12$abcdefghijklmnopqrstuv",
      // On the Frontend roadmap, because everything here is about where React
      // sits inside it.
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

/**
 * Everything in the Frontend roadmap before a given topic, marked complete —
 * including the Git Academy modules the delegated Git topics stand for, so the
 * roadmap is satisfied the way a real learner satisfies it rather than by
 * writing progress rows against topics that delegate.
 */
async function reachReact(
  userId: string,
  upToSlug: string,
  { academy = true } = {},
) {
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

  const before = inOrder
    .slice(0, stopAt)
    .filter((topic) => !(topic.slug in DELEGATED_TOPICS));

  await complete(userId, before.map((topic) => topic.id));

  // The Academy modules behind every delegated Git topic. Delegation is derived
  // on read from these rows, so completing them is what makes the Git phase
  // count — there is no progress row on the delegated topic itself.
  //
  // Skipped when a test needs a learner who has reached Git and not done it.
  if (!academy) return;

  const academySlugs = [
    ...new Set(Object.values(DELEGATED_TOPICS).flatMap((entry) => entry.requires)),
  ];
  const academyTopics = await db.topic.findMany({
    where: { slug: { in: academySlugs } },
    select: { id: true },
  });
  await complete(userId, academyTopics.map((topic) => topic.id));
}

/** Answers every question in a topic's check, optionally getting some wrong. */
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

describe("React curriculum coverage", () => {
  it("teaches every topic in the React phase", async () => {
    const topics = await reactTopics();

    expect(topics.map((topic) => topic.slug)).toEqual(REACT_SLUGS);

    // The property that matters: no topic in this phase can be completed by
    // self-attestation, because every one of them has something to learn from.
    for (const topic of topics) {
      expect(topic.lesson, `${topic.slug} has no lesson`).not.toBeNull();
    }
  });

  it("holds every React lesson to the same depth floor as the rest of the curriculum", async () => {
    const topics = await reactTopics();

    for (const topic of topics) {
      expect(topic.lesson!._count.sections, topic.slug).toBeGreaterThanOrEqual(
        DEPTH_FLOOR.sections,
      );
      expect(
        topic.lesson!._count.knowledgeChecks,
        topic.slug,
      ).toBeGreaterThanOrEqual(DEPTH_FLOOR.knowledgeChecks);
      // React is a code topic. A lesson here with no code example would be
      // describing React rather than teaching it.
      expect(
        topic.lesson!.sections.some((section) => section.code),
        `${topic.slug} has no code example`,
      ).toBe(true);
      expect(topic.lesson!.resources.length, topic.slug).toBeGreaterThan(0);
    }
  });

  it("writes enough prose in each React lesson to teach from", () => {
    const authored = LESSONS.filter((lesson) =>
      REACT_SLUGS.includes(lesson.topicSlug),
    );

    expect(authored).toHaveLength(REACT_SLUGS.length);

    for (const lesson of authored) {
      const depth = measureLesson(lesson);
      expect(depth.contentChars, lesson.topicSlug).toBeGreaterThanOrEqual(
        DEPTH_FLOOR.contentChars,
      );
    }
  });

  it("never sends the answer key for a React lesson to the browser", async () => {
    for (const slug of REACT_SLUGS) {
      const topic = await getTopicForLearning(slug);

      for (const check of topic!.lesson!.knowledgeChecks) {
        expect(check, slug).not.toHaveProperty("explanation");
        for (const option of check.options) {
          expect(option, slug).not.toHaveProperty("isCorrect");
        }
      }
    }
  });
});

describe("React prerequisites", () => {
  it("builds one chain from the JavaScript a learner already has", async () => {
    const topics = await reactTopics();
    const prerequisitesOf = new Map(
      topics.map((topic) => [
        topic.slug,
        topic.prerequisites.map((edge) => edge.prerequisite.slug),
      ]),
    );

    // React opens on the JavaScript that makes it comprehensible, not on
    // nothing and not on something later in the roadmap.
    expect(prerequisitesOf.get("react-fundamentals")).toEqual(
      expect.arrayContaining(["js-modules", "js-dom"]),
    );
    expect(prerequisitesOf.get("react-components")).toContain("react-fundamentals");
    expect(prerequisitesOf.get("react-props")).toContain("react-components");
    expect(prerequisitesOf.get("react-state")).toContain("react-props");
    expect(prerequisitesOf.get("react-hooks")).toContain("react-state");

    // Forms reuses the HTML forms topic, and API integration reuses Fetch,
    // rather than re-teaching either inside React.
    expect(prerequisitesOf.get("react-forms")).toEqual(
      expect.arrayContaining(["react-hooks", "html-forms"]),
    );
    expect(prerequisitesOf.get("react-api-integration")).toEqual(
      expect.arrayContaining(["react-hooks", "fetch-api"]),
    );
  });

  it("does not make React wait on anything authored after it", async () => {
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
        if (!REACT_SLUGS.includes(topic.slug)) continue;

        for (const edge of topic.prerequisites) {
          // A dependency on a later phase would lock React permanently, and a
          // learner would never find out why.
          expect(
            phaseOf.get(edge.prerequisite.slug)!,
            `${topic.slug} depends on ${edge.prerequisite.slug}, which comes later`,
          ).toBeLessThanOrEqual(phase.order);
        }
      }
    }
  });

  it("has no cycle inside the React chain", async () => {
    const topics = await reactTopics();
    const edges = new Map(
      topics.map((topic) => [
        topic.slug,
        topic.prerequisites
          .map((edge) => edge.prerequisite.slug)
          .filter((slug) => REACT_SLUGS.includes(slug)),
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

    for (const slug of REACT_SLUGS) walk(slug, []);
    expect(cycles).toEqual([]);
  });
});

describe("Git before React, without pretending React needs Git", () => {
  /**
   * The Frontend roadmap puts Git & GitHub in phase 5 and React in phase 6, but
   * no prerequisite edge connects them — and that is deliberate. React does not
   * technically require Git, so a graph edge would be a lie told to enforce an
   * ordering the roadmap already expresses.
   *
   * What that means in practice is asserted here rather than left implicit,
   * because the behaviour is easy to "fix" into something worse.
   */
  async function statesFor(userId: string) {
    const { deriveTopicStates } = await import("@/lib/learn/progress");
    const { getCompletedTopicIds } = await import("@/lib/learn/queries");

    const roadmap = await db.roadmap.findFirstOrThrow({
      where: { career: { slug: "frontend-developer" }, isActive: true },
      select: {
        id: true,
        phases: {
          orderBy: { order: "asc" },
          select: {
            topics: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                slug: true,
                isRequired: true,
                prerequisites: { select: { prerequisiteId: true } },
              },
            },
          },
        },
      },
    });

    const inOrder = roadmap.phases.flatMap((phase) => phase.topics);
    const completed = await getCompletedTopicIds(userId, roadmap.id);

    const states = deriveTopicStates(
      inOrder.map((topic) => ({
        id: topic.id,
        isRequired: topic.isRequired,
        prerequisiteIds: topic.prerequisites.map((edge) => edge.prerequisiteId),
      })),
      completed,
    );

    return new Map(inOrder.map((topic) => [topic.slug, states.get(topic.id)!]));
  }

  it("makes Git the current step, and React merely available, when Git is unfinished", async () => {
    const user = await makeUser("react-git-order@example.com");
    signedInAs(user.id);
    // Everything up to Git, and no Academy work at all.
    await reachReact(user.id, "git-fundamentals", { academy: false });

    const states = await statesFor(user.id);

    // Git is what CodeCompass says to do next.
    expect(states.get("git-fundamentals")).toBe("CURRENT");

    // React is reachable, because its actual prerequisites are met — but it is
    // not the recommendation. AVAILABLE says "you may" where LOCKED would say
    // "you may not", and only one of those is true.
    expect(states.get("react-fundamentals")).toBe("AVAILABLE");
  });

  it("moves the current step to React once the Academy work behind Git is real", async () => {
    const user = await makeUser("react-git-done@example.com");
    signedInAs(user.id);
    await reachReact(user.id, "react-fundamentals");

    const states = await statesFor(user.id);

    // Delegation is derived from Academy progress, so this transition is proof
    // the Git phase was satisfied by real work rather than by a progress row.
    for (const slug of ["git-fundamentals", "git-commit", "github-workflow"]) {
      expect(states.get(slug), slug).toBe("COMPLETED");
    }
    expect(states.get("react-fundamentals")).toBe("CURRENT");
  });

  it("keeps React free of any prerequisite on a Git topic", async () => {
    const topics = await reactTopics();

    for (const topic of topics) {
      for (const edge of topic.prerequisites) {
        expect(
          edge.prerequisite.slug.startsWith("git"),
          `${topic.slug} depends on ${edge.prerequisite.slug}`,
        ).toBe(false);
      }
    }
  });
});

describe("what the React roadmap tells a learner it covers", () => {
  /**
   * JSX, events, conditional rendering, lists, keys and custom hooks have no
   * topics of their own — they are taught inside the topic that owns them. The
   * roadmap card shows a topic's title and description and nothing else, so the
   * description is the only place a learner can find out they are covered.
   *
   * This test is the decision, written down: nine topics, and the descriptions
   * carry the concepts. Splitting them into their own topics would double the
   * phase's length for concepts that take a section each.
   */
  it("names the concepts that are taught inside a topic rather than beside it", async () => {
    const topics = await reactTopics();
    const describedBy = new Map(
      topics.map((topic) => [topic.slug, topic.description.toLowerCase()]),
    );

    expect(describedBy.get("react-fundamentals")).toContain("jsx");
    expect(describedBy.get("react-components")).toContain("conditional");
    expect(describedBy.get("react-components")).toContain("lists");
    expect(describedBy.get("react-components")).toContain("keys");
    expect(describedBy.get("react-props")).toContain("children");
    expect(describedBy.get("react-state")).toContain("events");
    expect(describedBy.get("react-hooks")).toContain("your own hooks");
  });

  it("keeps the phase at the nine topics the curriculum was authored against", async () => {
    const topics = await reactTopics();

    // A structural change here is a curriculum decision, not a refactor: the
    // lessons, the capability, the projects and the practice all name these
    // slugs. This fails loudly if someone adds topics without the rest.
    expect(topics.map((topic) => topic.slug)).toEqual(REACT_SLUGS);
  });
});

describe("React practice and projects", () => {
  it("connects practice to the topics the React capability claims it for", async () => {
    const react = CAPABILITIES.find((capability) => capability.slug === "react")!;

    // The capability has always named these; before this phase they resolved to
    // nothing, so the evidence source was real and empty.
    for (const slug of react.practiceTopics ?? []) {
      const topic = await db.topic.findFirstOrThrow({
        where: {
          slug,
          phase: { roadmap: { career: { slug: "frontend-developer" } } },
        },
        select: { problems: { select: { problemId: true } } },
      });

      expect(topic.problems.length, `${slug} has no practice`).toBeGreaterThan(0);
    }
  });

  it("offers React practice only in the languages React is written in", async () => {
    const { REACT_PROBLEMS } = await import("../prisma/seed/problems");

    for (const problem of REACT_PROBLEMS) {
      expect(Object.keys(problem.solutions).sort(), problem.slug).toEqual([
        "JAVASCRIPT",
        "TYPESCRIPT",
      ]);
      expect(
        problem.topicSlugs.some((slug) => REACT_SLUGS.includes(slug)),
        `${problem.slug} practises no React topic`,
      ).toBe(true);
    }
  });

  it("gives the React phase a project to apply it to", async () => {
    const topics = await reactTopics();
    const withProject = topics.filter((topic) => topic.projects.length > 0);

    expect(withProject.length).toBeGreaterThan(0);

    // And the project a learner is sent to must not be reachable before the
    // React topics it needs — otherwise "build a React app" arrives before JSX.
    const project = await db.project.findFirstOrThrow({
      where: { concepts: { some: { topic: { slug: "react-state" } } } },
      select: {
        slug: true,
        concepts: {
          where: { isPrerequisite: true },
          select: { topic: { select: { slug: true } } },
        },
      },
    });

    const required = project.concepts.map((concept) => concept.topic.slug);
    expect(required.some((slug) => REACT_SLUGS.includes(slug))).toBe(true);
  });
});

describe("progressing through React", () => {
  it("completes a React topic when the knowledge check is passed", async () => {
    const user = await makeUser("react-pass@example.com");
    signedInAs(user.id);
    await reachReact(user.id, "react-fundamentals");

    const { topicId, answers } = await answersFor("react-fundamentals");
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
    expect(progress.completedAt).not.toBeNull();
  });

  it("does not complete a React topic on a failed attempt, and completes it on a retry", async () => {
    const user = await makeUser("react-fail@example.com");
    signedInAs(user.id);
    await reachReact(user.id, "react-components");

    const wrong = await answersFor("react-components", { wrong: 4 });
    const failed = await submitKnowledgeCheck({
      topicId: wrong.topicId,
      answers: wrong.answers,
    });

    expect(failed.ok).toBe(true);
    expect(failed.passed).toBe(false);

    // Feedback has to teach, so every question comes back with its explanation
    // and the answer that was right — after grading, never before.
    expect(failed.results).toHaveLength(wrong.answers.length);
    for (const question of failed.results!) {
      expect(question.explanation.length).toBeGreaterThan(20);
      expect(question.correctOptionId).not.toBe("");
    }

    const afterFailure = await db.userTopicProgress.findUniqueOrThrow({
      where: { userId_topicId: { userId: user.id, topicId: wrong.topicId } },
    });
    expect(afterFailure.status).toBe("IN_PROGRESS");
    expect(afterFailure.completedAt).toBeNull();

    // Retry, correctly.
    const right = await answersFor("react-components");
    const passed = await submitKnowledgeCheck({
      topicId: right.topicId,
      answers: right.answers,
    });

    expect(passed.passed).toBe(true);

    const afterRetry = await db.userTopicProgress.findUniqueOrThrow({
      where: { userId_topicId: { userId: user.id, topicId: wrong.topicId } },
    });
    expect(afterRetry.status).toBe("COMPLETED");
    expect(afterRetry.attempts).toBe(2);
  });

  it("refuses to grade a React topic whose prerequisites are outstanding", async () => {
    const user = await makeUser("react-skipahead@example.com");
    signedInAs(user.id);
    // Deliberately no reachReact: nothing before react-hooks is complete.

    const { topicId, answers } = await answersFor("react-hooks");
    const result = await submitKnowledgeCheck({ topicId, answers });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/first|before|complete/i);

    // A refused attempt must cost nothing and record nothing.
    expect(
      await db.userTopicProgress.findUnique({
        where: { userId_topicId: { userId: user.id, topicId } },
      }),
    ).toBeNull();
  });

  it("refuses to let a React topic be claimed as understood", async () => {
    const user = await makeUser("react-attest@example.com");
    signedInAs(user.id);
    await reachReact(user.id, "react-fundamentals");

    const topic = await db.topic.findFirstOrThrow({
      where: {
        slug: "react-fundamentals",
        phase: { roadmap: { career: { slug: "frontend-developer" } } },
      },
      select: { id: true },
    });

    const result = await markTopicUnderstood({ topicId: topic.id });

    // Every React topic has a lesson, so self-attestation would be a one-click
    // bypass of the entire phase.
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/knowledge check/i);
    expect(
      await db.userTopicProgress.findUnique({
        where: { userId_topicId: { userId: user.id, topicId: topic.id } },
      }),
    ).toBeNull();
  });

  it("cannot be completed for somebody else", async () => {
    const alice = await makeUser("react-alice@example.com");
    const mallory = await makeUser("react-mallory@example.com");
    await reachReact(alice.id, "react-fundamentals");
    await reachReact(mallory.id, "react-fundamentals");

    // Mallory is signed in and submits a perfect attempt. The action takes the
    // user from the session, so there is no field in which to name Alice.
    signedInAs(mallory.id);
    const { topicId, answers } = await answersFor("react-fundamentals");
    await submitKnowledgeCheck({ topicId, answers });

    expect(
      await db.userTopicProgress.findUnique({
        where: { userId_topicId: { userId: alice.id, topicId } },
      }),
    ).toBeNull();
  });

  it("scores an unanswered question as wrong rather than shrinking the total", async () => {
    const user = await makeUser("react-partial@example.com");
    signedInAs(user.id);
    await reachReact(user.id, "react-props");

    const { topicId, answers } = await answersFor("react-props");

    // A crafted payload holding one correct answer, claiming a perfect score.
    const result = await submitKnowledgeCheck({
      topicId,
      answers: answers.slice(0, 1),
    });

    expect(result.ok).toBe(true);
    expect(result.total).toBe(answers.length);
    expect(result.correctCount).toBe(1);
    expect(result.passed).toBe(false);
  });
});

describe("what CodeCompass recommends around React", () => {
  it("sends a learner who has finished Git into React fundamentals", async () => {
    const user = await makeUser("react-before@example.com");
    signedInAs(user.id);
    await reachReact(user.id, "react-fundamentals");

    const guidance = await getGuidance(user.id);

    expect(guidance.state.currentTopic?.slug).toBe("react-fundamentals");

    // The phase is carried on the derived state, so every surface that names
    // where a learner is reads it from here rather than working it out again.
    expect(guidance.state.currentTopic?.title).toBe("React fundamentals");
    expect(guidance.state.currentTopic?.phaseTitle).toBe("React & Component Thinking");
  });

  it("moves to the next incomplete React topic partway through the phase", async () => {
    const user = await makeUser("react-during@example.com");
    signedInAs(user.id);
    await reachReact(user.id, "react-props");

    const guidance = await getGuidance(user.id);
    expect(guidance.state.currentTopic?.slug).toBe("react-props");

    const action = await getNextAction(user.id);
    expect(action).not.toBeNull();
  });

  it("leaves React for the next real requirement once the phase is done", async () => {
    const user = await makeUser("react-after@example.com");
    signedInAs(user.id);

    const topics = await reactTopics();
    await reachReact(user.id, "react-fundamentals");
    await complete(user.id, topics.map((topic) => topic.id));

    const guidance = await getGuidance(user.id);

    // Whatever the roadmap says comes next — asserted as "not React" rather
    // than as a hardcoded slug, so authoring the next phase cannot break it.
    expect(guidance.state.currentTopic).not.toBeNull();
    expect(REACT_SLUGS).not.toContain(guidance.state.currentTopic!.slug);

    expect(guidance.state.currentTopic!.phaseTitle).not.toBe("");
  });

  it("counts React topics towards the roadmap rather than in a category of their own", async () => {
    const user = await makeUser("react-progress@example.com");
    signedInAs(user.id);
    await reachReact(user.id, "react-fundamentals");

    const before = await getGuidance(user.id);

    const { topicId, answers } = await answersFor("react-fundamentals");
    await submitKnowledgeCheck({ topicId, answers });

    const after = await getGuidance(user.id);

    expect(after.state.progress.roadmap).toBeGreaterThan(
      before.state.progress.roadmap,
    );
    expect(after.state.completedTopicIds).toContain(topicId);
  });
});
