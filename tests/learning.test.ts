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
const {
  startTopic,
  setSectionComplete,
  submitKnowledgeCheck,
  markTopicUnderstood,
} = await import("@/app/actions/learn");
const { outstandingPrerequisites } = await import("@/lib/learn/prerequisites");
const { DELEGATED_TOPIC_SLUGS } = await import("@/lib/learn/delegation");
const { requireUser } = await import("@/lib/session");
const { db } = await import("@/lib/db");
const { validateLesson } = await import("../prisma/seed/lessons/validate");
const { LESSONS } = await import("../prisma/seed/lessons");
const { findShallowLessons } = await import("../prisma/seed/lessons/coverage");

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

/**
 * Marks every transitive prerequisite of a topic complete.
 *
 * submitKnowledgeCheck refuses an out-of-order completion, so a test that wants
 * to exercise `js-functions` has to put the learner where a real one would be
 * by the time they reach it. Written against the database directly: this is
 * arranging a starting position, not the behaviour under test.
 */
async function unlock(userId: string, topicSlug: string) {
  const seen = new Set<string>();
  const queue = [topicSlug];

  while (queue.length > 0) {
    const slug = queue.shift()!;
    const topic = await db.topic.findUnique({
      where: { slug },
      select: {
        prerequisites: {
          select: { prerequisite: { select: { id: true, slug: true } } },
        },
      },
    });
    if (!topic) continue;

    for (const { prerequisite } of topic.prerequisites) {
      if (seen.has(prerequisite.id)) continue;
      seen.add(prerequisite.id);
      queue.push(prerequisite.slug);

      await db.userTopicProgress.upsert({
        where: { userId_topicId: { userId, topicId: prerequisite.id } },
        create: {
          userId,
          topicId: prerequisite.id,
          status: "COMPLETED",
          percentComplete: 100,
          completedAt: new Date(),
        },
        update: { status: "COMPLETED", percentComplete: 100 },
      });
    }
  }
}

/**
 * Answers every question in a lesson, optionally getting some wrong.
 *
 * Unlocks the topic's prerequisites for this learner first, so the test is
 * about grading rather than about ordering. The tests that are specifically
 * about ordering call submitKnowledgeCheck without going through here.
 */
async function answerAll(userId: string, topicSlug: string, { wrong = 0 } = {}) {
  await unlock(userId, topicSlug);

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
    expect(topic!.phase.roadmap.career!.slug).toBe("frontend-developer");
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
    // Most topics are still in this state, and which ones changes as the
    // curriculum is authored — so the topic is found, not named.
    const unwritten = await db.topic.findFirstOrThrow({
      where: { lesson: { is: null } },
      select: { slug: true },
    });

    const topic = await getTopicForLearning(unwritten.slug);

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

  it("ships no lesson too thin to learn from", () => {
    // Coverage is only worth counting if each covered topic actually teaches.
    // This is the guard against adding stubs to move a percentage.
    expect(findShallowLessons(LESSONS)).toEqual([]);
  });

  it("gives every lesson a worked example or a code sample where it claims one", () => {
    for (const lesson of LESSONS) {
      for (const section of lesson.sections) {
        if (section.type === "CODE" || section.type === "EXAMPLE") {
          // An EXAMPLE without code is prose wearing a label.
          expect(Boolean(section.code), `${lesson.topicSlug}: ${section.title}`).toBe(
            true,
          );
        }
      }
    }
  });

  it("keeps the Frontend roadmap learnable from its first topic without gaps", async () => {
    // The property that actually matters, asserted as a property rather than a
    // number: walking the roadmap in order, a learner must not meet a topic
    // whose prerequisites are unmet, and the authored run must reach at least
    // the end of JavaScript. Authoring more content can only improve this.
    const roadmap = await db.roadmap.findFirstOrThrow({
      where: { career: { slug: "frontend-developer" }, isActive: true },
      select: {
        phases: {
          orderBy: { order: "asc" },
          select: {
            title: true,
            topics: {
              orderBy: { order: "asc" },
              select: {
                slug: true,
                lesson: { select: { id: true } },
                prerequisites: {
                  select: { prerequisite: { select: { slug: true } } },
                },
              },
            },
          },
        },
      },
    });

    const done = new Set<string>();
    const reached: string[] = [];

    for (const phase of roadmap.phases) {
      for (const topic of phase.topics) {
        const ready = topic.prerequisites.every((edge) =>
          done.has(edge.prerequisite.slug),
        );
        // A topic whose prerequisites are not met by everything before it in
        // roadmap order means the ordering and the graph disagree.
        expect(ready, `${topic.slug} is unreachable in roadmap order`).toBe(true);
        if (!topic.lesson) break;
        done.add(topic.slug);
        reached.push(topic.slug);
      }
      if (phase.topics.some((topic) => !topic.lesson)) break;
    }

    // Foundations, HTML, CSS and JavaScript are authored, so the chain must
    // run at least to the end of the JavaScript phase.
    expect(reached).toContain("html-fundamentals");
    expect(reached).toContain("css-fundamentals");
    expect(reached).toContain("js-dom");
    expect(reached).toContain("fetch-api");
  });

  it("renders every inline convention the authored prose actually uses", async () => {
    const { INLINE_PATTERN } = await import("@/lib/learn/inline");
    const tokens = (text: string) => text.match(new RegExp(INLINE_PATTERN)) ?? [];

    // The three the renderer supports.
    expect(tokens("use `map` here")).toEqual(["`map`"]);
    expect(tokens("this is **important**")).toEqual(["**important**"]);
    expect(tokens("it is *derived* data")).toEqual(["*derived*"]);

    // `**strong**` must win over emphasis, or a double asterisk would be read
    // as an empty emphasis wrapping a stray one.
    expect(tokens("**Local UI state** — an open menu")).toEqual([
      "**Local UI state**",
    ]);

    // And prose with two unrelated asterisks must not have the middle
    // swallowed: the delimiters have to hug their text.
    expect(tokens("2 * 3 and 4 * 5")).toEqual([]);
  });

  it("leaves no emphasis in the curriculum that would render as literal asterisks", () => {
    // Every lesson file uses `*emphasis*`, and for a long time the renderer
    // handled only backticks and `**strong**`, so those spans reached the page
    // with their asterisks showing. This asserts the convention is closed:
    // whatever the prose opens, the renderer can close.
    const unrendered: string[] = [];

    for (const lesson of LESSONS) {
      for (const section of lesson.sections) {
        const text = [
          section.title ?? "",
          section.content,
          ...(section.items ?? []),
        ].join("\n\n");

        // Strip everything the renderer understands; a leftover asterisk that
        // is not part of a pair is prose, and fine.
        const remaining = text.replace(
          /`[^`]+`|\*\*[^*]+\*\*|\*\S(?:[^*\n]*\S)?\*/g,
          "",
        );
        const orphanPairs = remaining.match(/\*[^*\n]*\*/g) ?? [];

        for (const orphan of orphanPairs) {
          unrendered.push(`${lesson.topicSlug}: ${orphan}`);
        }
      }
    }

    expect(unrendered).toEqual([]);
  });

  it("cannot be passed by always choosing the same option position", async () => {
    const { answerPositions } = await import("../prisma/seed/lessons/shuffle");

    // Lessons are authored with the correct option first so a reviewer can
    // check the answer key by reading down the page. Seeded verbatim, that
    // made "always pick the first option" a correct strategy for every
    // knowledge check in the product — 228 of them — which is not an
    // assessment. Options are rotated at seed time; this is the assertion
    // that they are.
    const positions = answerPositions(LESSONS.flatMap((lesson) => lesson.knowledgeChecks));

    expect(positions.length).toBeGreaterThan(200);

    // No single position may account for most of the answers. With four
    // options and a rotation keyed off the question, each lands near a
    // quarter; the bar is set well below that so the test fails on a real
    // regression rather than on the distribution being slightly lumpy.
    const counts = new Map<number, number>();
    for (const position of positions) {
      counts.set(position, (counts.get(position) ?? 0) + 1);
    }

    for (const [position, count] of counts) {
      expect(
        count / positions.length,
        `option ${position + 1} holds the answer ${count}/${positions.length} times`,
      ).toBeLessThan(0.5);
    }

    // And every position must actually be used, or the rotation is not
    // distributing at all.
    expect(counts.size).toBeGreaterThan(1);
  });

  it("rotates options deterministically, so a re-seed does not move them", async () => {
    const { positionOptions } = await import("../prisma/seed/lessons/shuffle");

    const check = LESSONS[0].knowledgeChecks[0];

    // Same input, same output — a learner's course must not reshuffle under
    // them because someone re-ran the seed.
    expect(positionOptions(check)).toEqual(positionOptions(check));

    // A rotation, not a shuffle: options are often written as a sequence, and
    // every option keeps its neighbours.
    const rotated = positionOptions(check).map((option) => option.text);
    const authored = check.options.map((option) => option.text);
    const offset = authored.indexOf(rotated[0]);

    expect(rotated).toEqual([
      ...authored.slice(offset),
      ...authored.slice(0, offset),
    ]);
  });

  it("links only to https resources, with a named source", () => {
    for (const lesson of LESSONS) {
      for (const resource of lesson.resources ?? []) {
        expect(resource.url.startsWith("https://"), resource.url).toBe(true);
        expect(resource.source.length, resource.title).toBeGreaterThan(1);
      }
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

    const { topicId, answers } = await answerAll(user.id, "js-functions");
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

    const { topicId, answers } = await answerAll(user.id, "js-functions", { wrong: 2 });
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
    const { topicId, answers } = await answerAll(user.id, "js-functions", { wrong: 4 });
    const result = await submitKnowledgeCheck({ topicId, answers });

    expect(result.passed).toBe(false);

    const progress = await getTopicProgress(user.id, topicId);
    expect(progress!.status).toBe("IN_PROGRESS");
    expect(progress!.completedAt).toBeNull();
  });

  it("allows a retry, and completes on the passing attempt", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const failed = await answerAll(user.id, "js-arrays", { wrong: 4 });
    await submitKnowledgeCheck({ topicId: failed.topicId, answers: failed.answers });

    const passed = await answerAll(user.id, "js-arrays");
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

    const good = await answerAll(user.id, "js-variables");
    await submitKnowledgeCheck({ topicId: good.topicId, answers: good.answers });

    const bad = await answerAll(user.id, "js-variables", { wrong: 4 });
    await submitKnowledgeCheck({ topicId: bad.topicId, answers: bad.answers });

    const progress = await getTopicProgress(user.id, good.topicId);
    expect(progress!.status).toBe("COMPLETED");
    expect(progress!.bestScore).toBe(100);
  });

  it("counts an unanswered question as wrong rather than shrinking the total", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const { topicId, answers } = await answerAll(user.id, "js-functions");
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

    const { topicId, answers } = await answerAll(user.id, "js-functions");
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

    const { topicId, answers } = await answerAll(user.id, "js-functions");
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

describe("prerequisites", () => {
  it("refuses a knowledge check whose prerequisites are outstanding", async () => {
    const user = await makeUser("ahead@example.com");
    signedInAs(user.id);

    // Deliberately no unlock(): js-functions comes after js-loops.
    const lesson = await db.lesson.findFirstOrThrow({
      where: { topic: { slug: "js-functions" } },
      select: {
        topicId: true,
        knowledgeChecks: {
          select: { id: true, options: { select: { id: true, isCorrect: true } } },
        },
      },
    });
    const answers = lesson.knowledgeChecks.map((check) => ({
      questionId: check.id,
      optionId: check.options.find((option) => option.isCorrect)!.id,
    }));

    const result = await submitKnowledgeCheck({ topicId: lesson.topicId, answers });

    expect(result.ok).toBe(false);
    // Names what is outstanding, and does not scold them for looking ahead.
    expect(result.error).toMatch(/finish/i);
    expect(result.error).toMatch(/read ahead/i);
    expect(await getTopicProgress(user.id, lesson.topicId)).toBeNull();
  });

  it("accepts the same attempt once the prerequisites are done", async () => {
    const user = await makeUser("inorder@example.com");
    signedInAs(user.id);

    const { topicId, answers } = await answerAll(user.id, "js-functions");
    const result = await submitKnowledgeCheck({ topicId, answers });

    expect(result.ok).toBe(true);
    expect(result.passed).toBe(true);
  });

  it("lets a learner mark a lesson-less topic as understood, unlocking what follows", async () => {
    const user = await makeUser("understood@example.com");
    signedInAs(user.id);

    // Found rather than named: as lessons are authored, any given slug stops
    // being lesson-less. The behaviour under test is about topics that have no
    // lesson, whichever those currently are.
    //
    // Delegated topics are excluded on purpose. They are also lesson-less, but
    // their content exists in an Academy, so self-attestation is refused for
    // them — that is its own test in git.test.ts.
    const topic = await db.topic.findFirstOrThrow({
      where: {
        lesson: { is: null },
        requiredBy: { some: {} },
        slug: { notIn: DELEGATED_TOPIC_SLUGS },
      },
      select: {
        id: true,
        slug: true,
        requiredBy: { take: 1, select: { topicId: true } },
      },
    });
    const nextId = topic.requiredBy[0].topicId;

    await unlock(user.id, topic.slug);
    expect((await markTopicUnderstood({ topicId: topic.id })).ok).toBe(true);

    const progress = await getTopicProgress(user.id, topic.id);
    expect(progress!.status).toBe("COMPLETED");
    expect(progress!.percentComplete).toBe(100);

    // Which is the whole point: it no longer holds up what depends on it.
    // The dependent may have other prerequisites of its own; this one is done.
    const stillOutstanding = await outstandingPrerequisites(user.id, nextId);
    expect(stillOutstanding.map((entry) => entry.id)).not.toContain(topic.id);
  });

  it("refuses to mark a topic understood when it has a real lesson", async () => {
    const user = await makeUser("shortcut@example.com");
    signedInAs(user.id);

    const topic = await db.topic.findUniqueOrThrow({
      where: { slug: "js-variables" },
      select: { id: true },
    });

    const result = await markTopicUnderstood({ topicId: topic.id });

    // Otherwise this would be a one-click bypass of every knowledge check.
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/knowledge check/i);
    expect(await getTopicProgress(user.id, topic.id)).toBeNull();
  });

  it("refuses to mark a topic understood out of order", async () => {
    const user = await makeUser("skipahead@example.com");
    signedInAs(user.id);

    // A lesson-less, non-delegated topic that does have prerequisites, none of
    // them met — so the refusal under test is the prerequisite rule, not the
    // separate delegation rule.
    const topic = await db.topic.findFirstOrThrow({
      where: {
        lesson: { is: null },
        prerequisites: { some: {} },
        slug: { notIn: DELEGATED_TOPIC_SLUGS },
      },
      select: { id: true },
    });

    expect((await markTopicUnderstood({ topicId: topic.id })).ok).toBe(false);
    expect(await getTopicProgress(user.id, topic.id)).toBeNull();
  });

  it("never downgrades a topic completed the proper way", async () => {
    const user = await makeUser("noregress@example.com");
    signedInAs(user.id);

    const { topicId, answers } = await answerAll(user.id, "js-variables");
    await submitKnowledgeCheck({ topicId, answers });

    // Refused because the topic has a lesson, and the pass stands regardless.
    await markTopicUnderstood({ topicId });

    const progress = await getTopicProgress(user.id, topicId);
    expect(progress!.status).toBe("COMPLETED");
    expect(progress!.bestScore).toBe(100);
  });

  it("requires a session", async () => {
    auth.mockResolvedValue(null);
    const topic = await db.topic.findUniqueOrThrow({
      where: { slug: "how-computers-work" },
      select: { id: true },
    });

    expect((await markTopicUnderstood({ topicId: topic.id })).ok).toBe(false);
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

    const { topicId, answers } = await answerAll(alice.id, "js-functions");
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
    const a = await answerAll(alice.id, "js-functions");
    await submitKnowledgeCheck({ topicId: a.topicId, answers: a.answers });

    signedInAs(bob.id);
    expect(await getTopicProgress(bob.id, a.topicId)).toBeNull();

    const b = await answerAll(bob.id, "js-functions", { wrong: 4 });
    await submitKnowledgeCheck({ topicId: b.topicId, answers: b.answers });

    expect((await getTopicProgress(alice.id, a.topicId))!.status).toBe("COMPLETED");
    expect((await getTopicProgress(bob.id, a.topicId))!.status).toBe("IN_PROGRESS");
  });
});
