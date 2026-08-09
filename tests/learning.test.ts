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
  getTopicForLearning,
  getTopicProgress,
  getCompletedSectionIds,
  getNextTopic,
  getCompletedTopicIds,
  getResumeTopic,
} = await import("@/lib/learn/queries");
const {
  topicPercent,
  gradeAttempt,
  roadmapPercent,
  deriveTopicStates,
  completedPhaseOrders,
  PASSING_SCORE,
} = await import("@/lib/learn/progress");
const { startTopic, setSectionComplete, submitKnowledgeCheck } =
  await import("@/app/actions/learn");
const { requireUser } = await import("@/lib/session");
const { db } = await import("@/lib/db");
const { validateLesson } = await import("../prisma/seed/lessons/validate");
const { LESSONS } = await import("../prisma/seed/lessons");

async function makeUser(email = "learner@example.com") {
  return db.user.create({
    data: {
      name: "Test Learner",
      email,
      passwordHash: "$2b$12$abcdefghijklmnopqrstuv",
      profile: { create: { onboardingCompleted: true } },
    },
  });
}

function signedInAs(id: string) {
  auth.mockResolvedValue({ user: { id } });
}

/** Answers every question in a lesson, optionally getting some wrong. */
async function answerAll(topicSlug: string, { wrong = 0 } = {}) {
  const lesson = await db.lesson.findFirstOrThrow({
    where: { topic: { slug: topicSlug } },
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

describe("lesson loading", () => {
  it("loads a lesson with sections, questions and resources", async () => {
    const topic = await getTopicForLearning("js-functions");

    expect(topic).not.toBeNull();
    expect(topic!.lesson).not.toBeNull();
    expect(topic!.lesson!.sections.length).toBeGreaterThan(5);
    expect(topic!.lesson!.knowledgeChecks.length).toBeGreaterThanOrEqual(3);
    expect(topic!.lesson!.resources.length).toBeGreaterThan(0);
    expect(topic!.phase.roadmap.career.slug).toBe("frontend-developer");
  });

  it("returns sections in order", async () => {
    const topic = await getTopicForLearning("js-arrays");
    const orders = topic!.lesson!.sections.map((section) => section.order);

    expect(orders).toEqual(orders.map((_, index) => index + 1));
  });

  it("never sends the answer key to the browser", async () => {
    const topic = await getTopicForLearning("js-functions");

    for (const check of topic!.lesson!.knowledgeChecks) {
      // Grading happens server-side; isCorrect must not be selectable here.
      expect(check).not.toHaveProperty("explanation");
      for (const option of check.options) {
        expect(option).not.toHaveProperty("isCorrect");
      }
    }
  });

  it("returns null for a topic slug that does not exist", async () => {
    expect(await getTopicForLearning("not-a-real-topic")).toBeNull();
  });

  it("returns a topic with no lesson rather than failing", async () => {
    // 154 topics, 12 lessons — most topics are in this state.
    const topic = await getTopicForLearning("css-grid");

    expect(topic).not.toBeNull();
    expect(topic!.lesson).toBeNull();
  });

  it("has a lesson for every topic slug the content targets", async () => {
    for (const lesson of LESSONS) {
      const topic = await db.topic.findUnique({
        where: { slug: lesson.topicSlug },
        select: { id: true },
      });
      expect(topic, `missing topic for ${lesson.topicSlug}`).not.toBeNull();
    }
  });
});

describe("authored content validation", () => {
  it("accepts every shipped lesson", () => {
    for (const lesson of LESSONS) {
      expect(validateLesson(lesson), lesson.topicSlug).toEqual([]);
    }
  });

  it("rejects a question with no correct answer", () => {
    const errors = validateLesson({
      topicSlug: "js-functions",
      title: "T",
      description: "D",
      estimatedTime: "1 hour",
      sections: [{ type: "TEXT", content: "Something." }],
      knowledgeChecks: [
        {
          question: "Q?",
          explanation: "Because.",
          options: [{ text: "A" }, { text: "B" }],
        },
        {
          question: "Q2?",
          explanation: "Because.",
          options: [{ text: "A", isCorrect: true }, { text: "B" }],
        },
        {
          question: "Q3?",
          explanation: "Because.",
          options: [{ text: "A", isCorrect: true }, { text: "B" }],
        },
      ],
    });

    expect(errors.join(" ")).toMatch(/exactly 1 correct option/i);
  });

  it("rejects a question with no explanation, since feedback must teach", () => {
    const errors = validateLesson({
      topicSlug: "js-functions",
      title: "T",
      description: "D",
      estimatedTime: "1 hour",
      sections: [{ type: "TEXT", content: "Something." }],
      knowledgeChecks: [
        {
          question: "Q?",
          explanation: "",
          options: [{ text: "A", isCorrect: true }, { text: "B" }],
        },
        {
          question: "Q2?",
          explanation: "Because.",
          options: [{ text: "A", isCorrect: true }, { text: "B" }],
        },
        {
          question: "Q3?",
          explanation: "Because.",
          options: [{ text: "A", isCorrect: true }, { text: "B" }],
        },
      ],
    });

    expect(errors.join(" ")).toMatch(/no explanation/i);
  });

  it("rejects a code section with no code and non-https resources", () => {
    const errors = validateLesson({
      topicSlug: "js-functions",
      title: "T",
      description: "D",
      estimatedTime: "1 hour",
      sections: [{ type: "CODE", content: "Look:" }],
      knowledgeChecks: [
        {
          question: "Q?",
          explanation: "B.",
          options: [{ text: "A", isCorrect: true }, { text: "B" }],
        },
        {
          question: "Q2?",
          explanation: "B.",
          options: [{ text: "A", isCorrect: true }, { text: "B" }],
        },
        {
          question: "Q3?",
          explanation: "B.",
          options: [{ text: "A", isCorrect: true }, { text: "B" }],
        },
      ],
      resources: [
        { title: "X", url: "http://insecure.example", source: "X", type: "ARTICLE" },
      ],
    });

    expect(errors.join(" ")).toMatch(/CODE section has no code/i);
    expect(errors.join(" ")).toMatch(/https link/i);
  });
});

describe("progress arithmetic", () => {
  it("counts sections toward 90% and the check for the last 10%", () => {
    expect(
      topicPercent({ totalSections: 10, completedSections: 0, passed: false }),
    ).toBe(0);
    expect(
      topicPercent({ totalSections: 10, completedSections: 5, passed: false }),
    ).toBe(45);
    // Everything read but not yet tested — honest about what remains.
    expect(
      topicPercent({ totalSections: 10, completedSections: 10, passed: false }),
    ).toBe(90);
    expect(
      topicPercent({ totalSections: 10, completedSections: 0, passed: true }),
    ).toBe(100);
  });

  it("grades an attempt against the passing score", () => {
    const results = (correct: number, total: number) =>
      Array.from({ length: total }, (_, index) => ({
        questionId: `q${index}`,
        isCorrect: index < correct,
      }));

    expect(gradeAttempt(results(4, 4))).toMatchObject({ score: 100, passed: true });
    expect(gradeAttempt(results(3, 4))).toMatchObject({ score: 75, passed: true });
    expect(gradeAttempt(results(2, 4))).toMatchObject({ score: 50, passed: false });
    expect(PASSING_SCORE).toBe(70);
  });

  it("counts only required topics toward roadmap progress", () => {
    expect(
      roadmapPercent({
        requiredTopicIds: ["a", "b", "c", "d"],
        completedTopicIds: ["a"],
      }),
    ).toBe(25);
    // An optional topic being completed must not inflate the number.
    expect(
      roadmapPercent({
        requiredTopicIds: ["a", "b"],
        completedTopicIds: ["a", "optional"],
      }),
    ).toBe(50);
    expect(roadmapPercent({ requiredTopicIds: [], completedTopicIds: [] })).toBe(0);
  });

  it("unlocks a topic once its prerequisites are complete", () => {
    const topics = [
      { id: "a", isRequired: true, prerequisiteIds: [] },
      { id: "b", isRequired: true, prerequisiteIds: ["a"] },
      { id: "c", isRequired: true, prerequisiteIds: ["b"] },
    ];

    const none = deriveTopicStates(topics, []);
    expect(none.get("a")).toBe("CURRENT");
    expect(none.get("b")).toBe("LOCKED");

    const first = deriveTopicStates(topics, ["a"]);
    expect(first.get("a")).toBe("COMPLETED");
    expect(first.get("b")).toBe("CURRENT");
    expect(first.get("c")).toBe("LOCKED");
  });

  it("marks a phase complete only when every required topic is done", () => {
    const phases = [
      {
        order: 1,
        topics: [
          { id: "a", isRequired: true },
          { id: "b", isRequired: true },
          { id: "opt", isRequired: false },
        ],
      },
    ];

    expect(completedPhaseOrders(phases, ["a"])).toEqual([]);
    // The optional topic is not needed for the phase to count as done.
    expect(completedPhaseOrders(phases, ["a", "b"])).toEqual([1]);
  });
});

describe("starting and reading", () => {
  it("records a topic as started", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const topic = await db.topic.findUniqueOrThrow({ where: { slug: "js-functions" } });
    const result = await startTopic({ topicId: topic.id });

    expect(result.ok).toBe(true);

    const progress = await getTopicProgress(user.id, topic.id);
    expect(progress!.status).toBe("IN_PROGRESS");
    expect(progress!.startedAt).not.toBeNull();
  });

  it("persists section progress and updates the percentage", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const lesson = await db.lesson.findFirstOrThrow({
      where: { topic: { slug: "js-functions" } },
      select: {
        id: true,
        topicId: true,
        sections: { orderBy: { order: "asc" }, select: { id: true } },
      },
    });

    await setSectionComplete({ sectionId: lesson.sections[0].id, completed: true });
    await setSectionComplete({ sectionId: lesson.sections[1].id, completed: true });

    // Read back fresh — this is what the page renders on return.
    const completed = await getCompletedSectionIds(user.id, lesson.id);
    expect(completed).toHaveLength(2);

    const progress = await getTopicProgress(user.id, lesson.topicId);
    expect(progress!.percentComplete).toBeGreaterThan(0);
    expect(progress!.status).toBe("IN_PROGRESS");
  });

  it("lets a section be un-ticked", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const lesson = await db.lesson.findFirstOrThrow({
      where: { topic: { slug: "js-variables" } },
      select: { id: true, sections: { take: 1, select: { id: true } } },
    });

    await setSectionComplete({ sectionId: lesson.sections[0].id, completed: true });
    expect(await getCompletedSectionIds(user.id, lesson.id)).toHaveLength(1);

    await setSectionComplete({ sectionId: lesson.sections[0].id, completed: false });
    expect(await getCompletedSectionIds(user.id, lesson.id)).toHaveLength(0);
  });

  it("surfaces an in-progress topic for 'continue where you left off'", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const topic = await db.topic.findUniqueOrThrow({
      where: { slug: "js-functions" },
      select: { id: true, phase: { select: { roadmapId: true } } },
    });
    await startTopic({ topicId: topic.id });

    const resume = await getResumeTopic(user.id, topic.phase.roadmapId);
    expect(resume!.topic.slug).toBe("js-functions");
  });
});

describe("knowledge check", () => {
  it("completes the topic when the learner passes", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const { topicId, answers } = await answerAll("js-functions");
    const result = await submitKnowledgeCheck({ topicId, answers });

    expect(result.ok).toBe(true);
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);

    const progress = await getTopicProgress(user.id, topicId);
    expect(progress!.status).toBe("COMPLETED");
    expect(progress!.percentComplete).toBe(100);
    expect(progress!.completedAt).not.toBeNull();
  });

  it("returns an explanation for every question, right or wrong", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const { topicId, answers } = await answerAll("js-functions", { wrong: 2 });
    const result = await submitKnowledgeCheck({ topicId, answers });

    expect(result.results!.length).toBe(answers.length);
    for (const entry of result.results!) {
      expect(entry.explanation.length).toBeGreaterThan(20);
      expect(entry.correctOptionId).not.toBe("");
    }
  });

  it("does not complete the topic when the learner fails", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    // 5 questions, 4 wrong → 20%.
    const { topicId, answers } = await answerAll("js-functions", { wrong: 4 });
    const result = await submitKnowledgeCheck({ topicId, answers });

    expect(result.passed).toBe(false);

    const progress = await getTopicProgress(user.id, topicId);
    expect(progress!.status).toBe("IN_PROGRESS");
    expect(progress!.completedAt).toBeNull();
  });

  it("allows a retry, and completes on the passing attempt", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const failed = await answerAll("js-arrays", { wrong: 4 });
    await submitKnowledgeCheck({ topicId: failed.topicId, answers: failed.answers });

    const passed = await answerAll("js-arrays");
    const result = await submitKnowledgeCheck({
      topicId: passed.topicId,
      answers: passed.answers,
    });

    expect(result.passed).toBe(true);

    const progress = await getTopicProgress(user.id, passed.topicId);
    expect(progress!.status).toBe("COMPLETED");
    expect(progress!.attempts).toBe(2);
    expect(progress!.bestScore).toBe(100);
  });

  it("never un-completes a topic after a later failed attempt", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const good = await answerAll("js-variables");
    await submitKnowledgeCheck({ topicId: good.topicId, answers: good.answers });

    const bad = await answerAll("js-variables", { wrong: 4 });
    await submitKnowledgeCheck({ topicId: bad.topicId, answers: bad.answers });

    const progress = await getTopicProgress(user.id, good.topicId);
    expect(progress!.status).toBe("COMPLETED");
    expect(progress!.bestScore).toBe(100);
  });

  it("counts an unanswered question as wrong rather than shrinking the total", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const { topicId, answers } = await answerAll("js-functions");
    // Submit only the first answer.
    const result = await submitKnowledgeCheck({ topicId, answers: [answers[0]] });

    expect(result.total).toBe(answers.length);
    expect(result.correctCount).toBe(1);
    expect(result.passed).toBe(false);
  });
});

describe("progress persistence and integration", () => {
  it("survives a fresh read, because the database is authoritative", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const { topicId, answers } = await answerAll("js-functions");
    await submitKnowledgeCheck({ topicId, answers });

    // Completely fresh query — what a page load after a refresh would do.
    const reread = await db.userTopicProgress.findUnique({
      where: { userId_topicId: { userId: user.id, topicId } },
    });

    expect(reread!.status).toBe("COMPLETED");
    expect(reread!.percentComplete).toBe(100);
  });

  it("updates roadmap progress once a topic is completed", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const topic = await db.topic.findUniqueOrThrow({
      where: { slug: "js-functions" },
      select: { phase: { select: { roadmapId: true } } },
    });

    expect(await getCompletedTopicIds(user.id, topic.phase.roadmapId)).toHaveLength(0);

    const { topicId, answers } = await answerAll("js-functions");
    await submitKnowledgeCheck({ topicId, answers });

    const completed = await getCompletedTopicIds(user.id, topic.phase.roadmapId);
    expect(completed).toContain(topicId);
  });

  it("derives the next topic from roadmap order, not from the frontend", async () => {
    const functions = await db.topic.findUniqueOrThrow({
      where: { slug: "js-functions" },
      select: { id: true },
    });

    const next = await getNextTopic(functions.id);

    // js-arrays follows js-functions in the authored roadmap.
    expect(next!.slug).toBe("js-arrays");
  });

  it("crosses into the next phase when a phase ends", async () => {
    // The last topic of the JavaScript phase should lead into Git & GitHub.
    const lastOfPhase = await db.topic.findFirstOrThrow({
      where: { slug: "fetch-api" },
      select: { id: true },
    });

    const next = await getNextTopic(lastOfPhase.id);
    expect(next).not.toBeNull();
    expect(next!.slug).toBe("git-fundamentals");
  });
});

describe("access control", () => {
  it("redirects an unauthenticated visitor to login", async () => {
    auth.mockResolvedValue(null);
    await expect(requireUser("/learn/js-functions")).rejects.toThrow(
      /REDIRECT:\/login/,
    );
  });

  it("refuses every mutation when signed out", async () => {
    auth.mockResolvedValue(null);

    const topic = await db.topic.findUniqueOrThrow({ where: { slug: "js-functions" } });

    expect((await startTopic({ topicId: topic.id })).ok).toBe(false);
    expect((await setSectionComplete({ sectionId: "x", completed: true })).ok).toBe(
      false,
    );
    expect(
      (
        await submitKnowledgeCheck({
          topicId: topic.id,
          answers: [{ questionId: "a", optionId: "b" }],
        })
      ).ok,
    ).toBe(false);
  });

  it("writes only the session user's progress, never one named by the client", async () => {
    const alice = await makeUser("alice@example.com");
    const bob = await makeUser("bob@example.com");

    signedInAs(alice.id);

    const { topicId, answers } = await answerAll("js-functions");
    // A hostile payload naming Bob alongside a valid topic.
    await submitKnowledgeCheck({ topicId, answers, userId: bob.id });

    expect(await getTopicProgress(bob.id, topicId)).toBeNull();
    expect((await getTopicProgress(alice.id, topicId))!.status).toBe("COMPLETED");
  });

  it("rejects a topic or section id that does not exist", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    expect((await startTopic({ topicId: "nope" })).ok).toBe(false);
    expect((await setSectionComplete({ sectionId: "nope", completed: true })).ok).toBe(
      false,
    );
    expect((await startTopic({})).ok).toBe(false);
  });

  it("keeps two learners' progress separate", async () => {
    const alice = await makeUser("alice2@example.com");
    const bob = await makeUser("bob2@example.com");

    signedInAs(alice.id);
    const a = await answerAll("js-functions");
    await submitKnowledgeCheck({ topicId: a.topicId, answers: a.answers });

    signedInAs(bob.id);
    expect(await getTopicProgress(bob.id, a.topicId)).toBeNull();

    const b = await answerAll("js-functions", { wrong: 4 });
    await submitKnowledgeCheck({ topicId: b.topicId, answers: b.answers });

    expect((await getTopicProgress(alice.id, a.topicId))!.status).toBe("COMPLETED");
    expect((await getTopicProgress(bob.id, a.topicId))!.status).toBe("IN_PROGRESS");
  });
});
