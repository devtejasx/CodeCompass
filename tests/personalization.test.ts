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

process.env.GITHUB_TOKEN_ENCRYPTION_KEY ??= Buffer.alloc(32, 7).toString("base64");

const { getLearnerState } = await import("@/lib/personalization/state");
const {
  buildRecommendations,
  byTrack,
  nextAction,
  reasonForTopic,
  PRIORITY,
} = await import("@/lib/personalization/recommend");
const { detectGaps } = await import("@/lib/personalization/gaps");
const { buildStudyPlan, estimateMinutes, budgetMinutes, summariseWeek, formatMinutes } =
  await import("@/lib/personalization/plan");
const { getGuidance, getWeeklySummary, getKnowledgeGaps } =
  await import("@/lib/personalization/service");
const {
  recordActivity,
  recordActivityOnce,
  listRecentActivity,
  activityHref,
} = await import("@/lib/personalization/activity");

const { requireUser } = await import("@/lib/session");
const { db } = await import("@/lib/db");
const { selectCareer } = await import("@/app/actions/career");
const { startTopic, submitKnowledgeCheck } = await import("@/app/actions/learn");

// ── Helpers ────────────────────────────────────────────────────────────────

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

async function chooseCareer(userId: string, slug: string) {
  const career = await db.career.findUniqueOrThrow({
    where: { slug },
    select: { id: true },
  });
  await db.profile.update({
    where: { userId },
    data: { selectedCareerId: career.id },
  });
  return career.id;
}

/** Completes a topic the way the learning system does. */
async function completeTopic(userId: string, topicId: string) {
  await db.userTopicProgress.upsert({
    where: { userId_topicId: { userId, topicId } },
    create: {
      userId,
      topicId,
      status: "COMPLETED",
      percentComplete: 100,
      completedAt: new Date(),
    },
    update: { status: "COMPLETED", percentComplete: 100, completedAt: new Date() },
  });
}

/** The frontend roadmap's topics, in order. */
async function frontendTopics() {
  const roadmap = await db.roadmap.findFirstOrThrow({
    where: { career: { slug: "frontend-developer" }, isActive: true },
    select: {
      id: true,
      phases: {
        orderBy: { order: "asc" },
        select: {
          topics: {
            orderBy: { order: "asc" },
            select: { id: true, slug: true, title: true, isRequired: true },
          },
        },
      },
    },
  });

  return {
    roadmapId: roadmap.id,
    topics: roadmap.phases.flatMap((phase) => phase.topics),
  };
}

beforeEach(() => {
  auth.mockReset();
  delete process.env.AI_PROVIDER;
  delete process.env.ANTHROPIC_API_KEY;
});

// ── 1. Learner state ───────────────────────────────────────────────────────

describe("learner state", () => {
  it("is real but mostly empty for a learner with no career", async () => {
    const user = await makeUser();
    const state = await getLearnerState(user.id);

    expect(state.career).toBeNull();
    expect(state.roadmap).toBeNull();
    expect(state.currentTopic).toBeNull();
    expect(state.completedTopicIds).toEqual([]);
    expect(state.progress.roadmap).toBe(0);
    // Catalogue totals are still real — nothing is faked to zero.
    expect(state.practice.total).toBeGreaterThan(0);
    expect(state.git.totalModules).toBeGreaterThan(0);
  });

  it("is derived from existing tables, not from a stored profile", async () => {
    const user = await makeUser();
    await chooseCareer(user.id, "frontend-developer");

    const before = await getLearnerState(user.id);
    const { topics } = await frontendTopics();
    await completeTopic(user.id, topics[0].id);
    const after = await getLearnerState(user.id);

    // No sync step, no cache invalidation: the next read is simply correct.
    expect(after.completedTopicIds).toHaveLength(before.completedTopicIds.length + 1);
    expect(after.progress.roadmap).toBeGreaterThan(before.progress.roadmap);
  });

  it("names the current topic the same way the roadmap does", async () => {
    const user = await makeUser();
    await chooseCareer(user.id, "frontend-developer");

    const { topics } = await frontendTopics();
    const firstRequired = topics.find((topic) => topic.isRequired)!;

    const state = await getLearnerState(user.id);
    expect(state.currentTopic?.id).toBe(firstRequired.id);

    await completeTopic(user.id, firstRequired.id);

    const moved = await getLearnerState(user.id);
    expect(moved.currentTopic?.id).not.toBe(firstRequired.id);
  });

  it("prefers an in-progress topic for resuming", async () => {
    const user = await makeUser();
    await chooseCareer(user.id, "frontend-developer");
    const { topics } = await frontendTopics();

    await db.userTopicProgress.create({
      data: {
        userId: user.id,
        topicId: topics[0].id,
        status: "IN_PROGRESS",
        percentComplete: 45,
        startedAt: new Date(),
      },
    });

    const state = await getLearnerState(user.id);
    expect(state.resumeTopic?.id).toBe(topics[0].id);
    expect(state.resumeTopic?.percentComplete).toBe(45);
  });

  it("reports every track's progress", async () => {
    const user = await makeUser();
    await chooseCareer(user.id, "frontend-developer");

    const state = await getLearnerState(user.id);

    for (const key of ["roadmap", "learning", "practice", "projects", "git", "ai"] as const) {
      expect(state.progress[key], key).toBeGreaterThanOrEqual(0);
      expect(state.progress[key], key).toBeLessThanOrEqual(100);
    }
  });
});

// ── 2. Recommendation rules ────────────────────────────────────────────────

/** A minimal state, so the rules can be exercised without a database. */
function fakeState(overrides: Record<string, unknown> = {}) {
  return {
    userId: "u1",
    career: { id: "c1", slug: "frontend-developer", name: "Frontend Developer" },
    experienceLevel: null,
    language: null,
    studyTime: null,
    mentorSolutionPolicy: "HINTS_ONLY",
    roadmap: { id: "r1", title: "Frontend", estimatedDuration: "8 months" },
    currentTopic: {
      id: "t2",
      slug: "javascript-functions",
      title: "JavaScript Functions",
      description: "",
      estimatedTime: "45 minutes",
      isRequired: true,
      hasLesson: true,
      phaseTitle: "JavaScript",
      phaseOrder: 2,
      phaseReason: "Functions are the building block everything later depends on.",
    },
    resumeTopic: null,
    nextTopic: null,
    completedTopicIds: ["t1"],
    pendingRequiredTopicIds: ["t2"],
    totalRequiredTopics: 10,
    practice: { solved: 0, attempted: 0, total: 30, pendingForCurrentTopic: 0 },
    projects: { completed: 0, inProgress: 0, total: 24, current: null },
    git: {
      completedModules: 0,
      totalModules: 10,
      percentComplete: 0,
      exercisesCompleted: 0,
      totalExercises: 6,
    },
    ai: {
      toolsLearned: 0,
      toolsInProgress: 0,
      totalTools: 19,
      workflowsCompleted: 0,
      totalWorkflows: 10,
      current: null,
    },
    progress: { roadmap: 10, learning: 10, practice: 0, projects: 0, git: 0, ai: 0 },
    lastActiveAt: null,
    ...overrides,
  } as unknown as Parameters<typeof buildRecommendations>[0]["state"];
}

function input(overrides: Record<string, unknown> = {}) {
  return {
    state: fakeState(),
    practiceCandidates: [],
    projectCandidates: [],
    aiToolCandidate: null,
    gaps: [],
    githubConfigured: false,
    githubConnected: false,
    ...overrides,
  } as Parameters<typeof buildRecommendations>[0];
}

describe("recommendation rules", () => {
  it("sends a learner with no career to the explorer, and nothing else", () => {
    const results = buildRecommendations(
      input({ state: fakeState({ career: null, roadmap: null, currentTopic: null }) }),
    );

    expect(results).toHaveLength(1);
    expect(results[0].type).toBe("START_CAREER");
    expect(results[0].priority).toBe(PRIORITY.NO_CAREER);
  });

  it("recommends the current topic when nothing is half-finished", () => {
    const next = nextAction(buildRecommendations(input()));

    expect(next?.type).toBe("CONTINUE_LESSON");
    expect(next?.href).toBe("/learn/javascript-functions");
  });

  it("calls it START_ROADMAP for a learner who has completed nothing", () => {
    const next = nextAction(
      buildRecommendations(input({ state: fakeState({ completedTopicIds: [] }) })),
    );

    expect(next?.type).toBe("START_ROADMAP");
  });

  it("prefers finishing something already open", () => {
    const next = nextAction(
      buildRecommendations(
        input({
          state: fakeState({
            resumeTopic: {
              id: "t1",
              slug: "javascript-variables",
              title: "JavaScript Variables",
              description: "",
              estimatedTime: "30 minutes",
              isRequired: true,
              hasLesson: true,
              phaseTitle: "JavaScript",
              phaseOrder: 2,
              phaseReason: "…",
              percentComplete: 60,
            },
          }),
        }),
      ),
    );

    expect(next?.type).toBe("CONTINUE_LESSON");
    expect(next?.href).toBe("/learn/javascript-variables");
    expect(next?.reason).toContain("60%");
  });

  it("puts practice for a completed topic above the next topic", () => {
    const results = buildRecommendations(
      input({
        practiceCandidates: [
          {
            id: "p1",
            slug: "reverse-a-string",
            title: "Reverse a String",
            estimatedTime: "10 min",
            topicId: "t1",
            topicTitle: "JavaScript Variables",
          },
        ],
      }),
    );

    expect(results[0].type).toBe("PRACTICE_TOPIC");
    expect(results[0].priority).toBeGreaterThan(PRIORITY.NEXT_TOPIC);
    // The next topic is still offered, just not first.
    expect(results.some((entry) => entry.type === "CONTINUE_LESSON")).toBe(true);
  });

  it("puts a strong knowledge gap above everything except having no career", () => {
    const results = buildRecommendations(
      input({
        gaps: [
          {
            topicId: "t1",
            topicSlug: "javascript-arrays",
            topicTitle: "JavaScript Arrays",
            evidence: "You have made 5 attempts across 2 JavaScript Arrays problems.",
            strength: "STRONG",
          },
        ],
      }),
    );

    expect(results[0].type).toBe("REVIEW_TOPIC");
    expect(results[0].href).toBe("/learn/javascript-arrays");
  });

  it("ignores a weak gap", () => {
    const results = buildRecommendations(
      input({
        gaps: [
          {
            topicId: "t1",
            topicSlug: "javascript-arrays",
            topicTitle: "JavaScript Arrays",
            evidence: "…",
            strength: "WEAK",
          },
        ],
      }),
    );

    expect(results.some((entry) => entry.type === "REVIEW_TOPIC")).toBe(false);
  });

  it("only suggests Git once the learner is building something", () => {
    const withoutProjects = buildRecommendations(input());
    expect(withoutProjects.some((entry) => entry.type === "LEARN_GIT")).toBe(false);

    const withProject = buildRecommendations(
      input({
        state: fakeState({
          projects: { completed: 1, inProgress: 0, total: 24, current: null },
        }),
      }),
    );
    expect(withProject.some((entry) => entry.type === "LEARN_GIT")).toBe(true);
  });

  it("only suggests connecting GitHub when it is configured and they know what a repo is", () => {
    const notConfigured = buildRecommendations(
      input({
        state: fakeState({
          git: {
            completedModules: 5,
            totalModules: 10,
            percentComplete: 50,
            exercisesCompleted: 2,
            totalExercises: 6,
          },
        }),
        githubConfigured: false,
      }),
    );
    expect(notConfigured.some((entry) => entry.type === "CONNECT_GITHUB")).toBe(false);

    const tooEarly = buildRecommendations(input({ githubConfigured: true }));
    expect(tooEarly.some((entry) => entry.type === "CONNECT_GITHUB")).toBe(false);

    const ready = buildRecommendations(
      input({
        state: fakeState({
          git: {
            completedModules: 5,
            totalModules: 10,
            percentComplete: 50,
            exercisesCompleted: 2,
            totalExercises: 6,
          },
        }),
        githubConfigured: true,
        githubConnected: false,
      }),
    );
    expect(ready.some((entry) => entry.type === "CONNECT_GITHUB")).toBe(true);
  });

  it("recommends a project only when its prerequisites are met", () => {
    const notReady = buildRecommendations(
      input({
        projectCandidates: [
          {
            id: "pr1",
            slug: "weather-dashboard",
            title: "Weather Dashboard",
            estimatedDuration: "4–6 hours",
            isReady: false,
          },
        ],
      }),
    );
    expect(notReady.some((entry) => entry.type === "START_PROJECT")).toBe(false);

    const ready = buildRecommendations(
      input({
        projectCandidates: [
          {
            id: "pr1",
            slug: "weather-dashboard",
            title: "Weather Dashboard",
            estimatedDuration: "4–6 hours",
            isReady: true,
          },
        ],
      }),
    );
    expect(ready.some((entry) => entry.type === "START_PROJECT")).toBe(true);
  });

  it("prefers finishing a project over starting one", () => {
    const results = buildRecommendations(
      input({
        state: fakeState({
          projects: {
            completed: 0,
            inProgress: 1,
            total: 24,
            current: { slug: "weather-dashboard", title: "Weather Dashboard", percentComplete: 40 },
          },
        }),
        projectCandidates: [
          {
            id: "pr2",
            slug: "another",
            title: "Another Project",
            estimatedDuration: "3 hours",
            isReady: true,
          },
        ],
      }),
    );

    const project = results.find((entry) => entry.type.includes("PROJECT"));
    expect(project?.type).toBe("CONTINUE_PROJECT");
    expect(results.some((entry) => entry.type === "START_PROJECT")).toBe(false);
  });

  it("recommends an AI tool only from the curated career set", () => {
    const withoutCandidate = buildRecommendations(input());
    expect(withoutCandidate.some((entry) => entry.type === "LEARN_AI_TOOL")).toBe(false);

    const withCandidate = buildRecommendations(
      input({
        aiToolCandidate: {
          slug: "cursor",
          name: "Cursor",
          reason: "Component work spreads across files.",
        },
      }),
    );
    const ai = withCandidate.find((entry) => entry.type === "LEARN_AI_TOOL");
    expect(ai?.href).toBe("/academy/ai-tools/cursor");
    expect(ai?.reason).toContain("Component work spreads across files.");
  });

  it("returns everything sorted by priority, highest first", () => {
    const results = buildRecommendations(
      input({
        practiceCandidates: [
          {
            id: "p1",
            slug: "s",
            title: "T",
            estimatedTime: "10 min",
            topicId: "t1",
            topicTitle: "Arrays",
          },
        ],
        projectCandidates: [
          {
            id: "pr1",
            slug: "p",
            title: "P",
            estimatedDuration: "3 hours",
            isReady: true,
          },
        ],
        aiToolCandidate: { slug: "cursor", name: "Cursor", reason: "…" },
      }),
    );

    for (let i = 1; i < results.length; i += 1) {
      expect(results[i - 1].priority).toBeGreaterThanOrEqual(results[i].priority);
    }
  });

  it("gives every recommendation a reason built from learner data", () => {
    const results = buildRecommendations(
      input({
        practiceCandidates: [
          {
            id: "p1",
            slug: "s",
            title: "Reverse a String",
            estimatedTime: "10 min",
            topicId: "t1",
            topicTitle: "JavaScript Variables",
          },
        ],
      }),
    );

    for (const entry of results) {
      expect(entry.reason.length, entry.type).toBeGreaterThan(30);
      // Never attributed to AI — these come from rules over real progress.
      expect(entry.reason.toLowerCase()).not.toContain("ai thinks");
    }
  });

  it("shows at most one recommendation per track, excluding the primary", () => {
    const results = buildRecommendations(
      input({
        practiceCandidates: [
          { id: "p1", slug: "s", title: "T", estimatedTime: "10 min", topicId: "t1", topicTitle: "Arrays" },
        ],
        projectCandidates: [
          { id: "pr1", slug: "p", title: "P", estimatedDuration: "3 hours", isReady: true },
        ],
        aiToolCandidate: { slug: "cursor", name: "Cursor", reason: "…" },
      }),
    );

    const primary = nextAction(results);
    const tracks = byTrack(results, primary);
    const seen = tracks.map((entry) => entry.track);

    expect(new Set(seen).size).toBe(seen.length);
    expect(tracks.every((entry) => entry.recommendation !== primary)).toBe(true);
  });
});

// ── 3. "Why am I learning this?" ───────────────────────────────────────────

describe("recommendation explanations", () => {
  it("names the roadmap for a learner at the very start", () => {
    const reason = reasonForTopic(fakeState({ completedTopicIds: [] }), {
      title: "HTML Basics",
      phaseTitle: "Foundations",
      phaseReason: "Everything on the web is HTML underneath.",
      isRequired: true,
    });

    expect(reason).toContain("first topic");
    expect(reason).toContain("Frontend Developer");
    expect(reason).toContain("Everything on the web is HTML underneath.");
  });

  it("combines what they have done, where this sits, and why the phase is here", () => {
    const reason = reasonForTopic(
      fakeState({ completedTopicIds: ["t1", "t2", "t3"] }),
      {
        title: "React Fundamentals",
        phaseTitle: "React",
        phaseReason: "React only makes sense once JavaScript does.",
        isRequired: true,
      },
    );

    expect(reason).toContain("3 topics");
    expect(reason).toContain("React Fundamentals");
    expect(reason).toContain("next required topic");
    expect(reason).toContain("React only makes sense once JavaScript does.");
  });

  it("says so when a topic is optional", () => {
    const reason = reasonForTopic(fakeState(), {
      title: "CSS Animations",
      phaseTitle: "CSS",
      phaseReason: "…",
      isRequired: false,
    });

    expect(reason).toContain("optional");
  });
});

// ── 4. Knowledge gaps ──────────────────────────────────────────────────────

describe("knowledge gap detection", () => {
  const base = {
    topicId: "t1",
    topicSlug: "javascript-arrays",
    topicTitle: "JavaScript Arrays",
    attempts: 0,
    bestScore: null,
    completed: false,
    unsolvedProblems: 0,
    problemAttempts: 0,
  };

  it("finds nothing without evidence", () => {
    expect(detectGaps([base])).toHaveLength(0);
    // Never having tried is not evidence of difficulty.
    expect(detectGaps([{ ...base, attempts: 0, unsolvedProblems: 0 }])).toHaveLength(0);
  });

  it("flags a repeatedly failed knowledge check", () => {
    const gaps = detectGaps([{ ...base, attempts: 4, bestScore: 40 }]);

    expect(gaps).toHaveLength(1);
    expect(gaps[0].strength).toBe("STRONG");
    expect(gaps[0].evidence).toContain("4 times");
    expect(gaps[0].evidence).toContain("40%");
  });

  it("does not flag a check they eventually passed", () => {
    // Getting there after several attempts is what learning looks like.
    expect(detectGaps([{ ...base, attempts: 5, bestScore: 90, completed: true }])).toHaveLength(0);
  });

  it("flags repeated unsolved problems on one topic", () => {
    const gaps = detectGaps([{ ...base, unsolvedProblems: 2, problemAttempts: 5 }]);

    expect(gaps[0].strength).toBe("STRONG");
    expect(gaps[0].evidence).toContain("5 attempts");
  });

  it("treats a single struggle as weak, not strong", () => {
    const gaps = detectGaps([{ ...base, unsolvedProblems: 1, problemAttempts: 2 }]);

    expect(gaps).toHaveLength(1);
    expect(gaps[0].strength).toBe("WEAK");
  });

  it("describes the evidence and never characterises the person", () => {
    const gaps = detectGaps([
      { ...base, attempts: 4, bestScore: 30 },
      {
        ...base,
        topicId: "t2",
        topicSlug: "loops",
        topicTitle: "Loops",
        unsolvedProblems: 3,
        problemAttempts: 7,
      },
    ]);

    for (const gap of gaps) {
      const text = gap.evidence.toLowerCase();
      for (const forbidden of ["bad at", "weak", "poor", "struggling", "failing", "you are not"]) {
        expect(text, gap.evidence).not.toContain(forbidden);
      }
      // Factual: it cites a number.
      expect(/\d/.test(gap.evidence)).toBe(true);
    }
  });

  it("sorts strong evidence first", () => {
    const gaps = detectGaps([
      { ...base, unsolvedProblems: 1, problemAttempts: 2 },
      {
        ...base,
        topicId: "t2",
        topicSlug: "loops",
        topicTitle: "Loops",
        unsolvedProblems: 3,
        problemAttempts: 8,
      },
    ]);

    expect(gaps[0].strength).toBe("STRONG");
  });
});

// ── 5. Study plan ──────────────────────────────────────────────────────────

describe("study plan", () => {
  it("maps onboarding study time onto realistic minutes", () => {
    expect(budgetMinutes(null)).toBeNull();
    expect(budgetMinutes("MINUTES_15_30")).toBeLessThan(budgetMinutes("HOURS_1_2")!);
    // The lower end of each band, so a plan that fits gets finished.
    expect(budgetMinutes("MINUTES_15_30")).toBeLessThanOrEqual(30);
  });

  it("parses display estimates, including ranges and hours", () => {
    expect(estimateMinutes("45 minutes")).toBe(45);
    expect(estimateMinutes("1 hour")).toBe(60);
    expect(estimateMinutes("4–6 hours")).toBe(240);
    expect(estimateMinutes("~10 min")).toBe(10);
    // Unparseable falls back rather than guessing wildly.
    expect(estimateMinutes(null)).toBeGreaterThan(0);
    expect(estimateMinutes("a while")).toBeGreaterThan(0);
  });

  it("fits the plan into the learner's stated time", () => {
    const recommendations = buildRecommendations(
      input({
        practiceCandidates: [
          { id: "p1", slug: "s", title: "T", estimatedTime: "20 min", topicId: "t1", topicTitle: "Arrays" },
        ],
      }),
    );

    const short = buildStudyPlan({ recommendations, studyTime: "MINUTES_15_30" });
    const long = buildStudyPlan({ recommendations, studyTime: "HOURS_2_4" });

    expect(short.totalMinutes).toBeLessThanOrEqual(long.totalMinutes);
    expect(long.items.length).toBeGreaterThanOrEqual(short.items.length);
  });

  it("always includes the most important item, even if it alone exceeds the budget", () => {
    const recommendations = buildRecommendations(input());
    const plan = buildStudyPlan({ recommendations, studyTime: "MINUTES_15_30" });

    expect(plan.items).not.toHaveLength(0);
    expect(plan.items[0].title).toBe(recommendations[0].title);
  });

  it("never invents a task", () => {
    const plan = buildStudyPlan({ recommendations: [], studyTime: "HOURS_2_4" });

    expect(plan.items).toHaveLength(0);
    expect(plan.totalMinutes).toBe(0);
  });

  it("caps a project at a session rather than planning the whole build", () => {
    const recommendations = buildRecommendations(
      input({
        state: fakeState({
          currentTopic: null,
          projects: {
            completed: 0,
            inProgress: 1,
            total: 24,
            current: { slug: "weather", title: "Weather Dashboard", percentComplete: 20 },
          },
        }),
      }),
    );

    const plan = buildStudyPlan({ recommendations, studyTime: "HOURS_2_4" });
    const projectItem = plan.items.find((item) => item.type === "CONTINUE_PROJECT");

    expect(projectItem?.minutes).toBeLessThanOrEqual(45);
    expect(projectItem?.title).toContain("session");
  });

  it("formats totals the way a person would say them", () => {
    expect(formatMinutes(45)).toBe("45 minutes");
    expect(formatMinutes(60)).toBe("1 hour");
    expect(formatMinutes(90)).toBe("1h 30m");
  });
});

// ── 6. Weekly summary ──────────────────────────────────────────────────────

describe("weekly summary", () => {
  it("counts only what actually happened", () => {
    const summary = summariseWeek({
      activities: [
        { type: "LESSON_COMPLETED", createdAt: new Date() },
        { type: "LESSON_COMPLETED", createdAt: new Date() },
        { type: "PROBLEM_SOLVED", createdAt: new Date() },
        { type: "LESSON_STARTED", createdAt: new Date() },
      ],
      from: new Date(),
      to: new Date(),
    });

    expect(summary.topicsCompleted).toBe(2);
    expect(summary.problemsSolved).toBe(1);
    expect(summary.projectMilestones).toBe(0);
    expect(summary.isEmpty).toBe(false);
  });

  it("reports an empty week honestly", () => {
    const summary = summariseWeek({ activities: [], from: new Date(), to: new Date() });

    expect(summary.isEmpty).toBe(true);
    expect(summary.topicsCompleted).toBe(0);
  });

  it("reads real activity from the database", async () => {
    const user = await makeUser();

    await recordActivity({
      userId: user.id,
      type: "LESSON_COMPLETED",
      entityId: "t1",
      entitySlug: "html-basics",
      label: "HTML Basics",
    });

    const summary = await getWeeklySummary(user.id);
    expect(summary.topicsCompleted).toBe(1);
    expect(summary.isEmpty).toBe(false);
  });

  it("ignores activity outside the window", async () => {
    const user = await makeUser();

    const old = await db.userActivity.create({
      data: { userId: user.id, type: "LESSON_COMPLETED", label: "Old" },
    });
    await db.userActivity.update({
      where: { id: old.id },
      data: { createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const summary = await getWeeklySummary(user.id);
    expect(summary.isEmpty).toBe(true);
  });
});

// ── 7. Activity ────────────────────────────────────────────────────────────

describe("activity recording", () => {
  it("records an event", async () => {
    const user = await makeUser();

    expect(
      await recordActivity({
        userId: user.id,
        type: "PROBLEM_SOLVED",
        entityId: "p1",
        entitySlug: "reverse-a-string",
        label: "Reverse a String",
      }),
    ).toBe(true);

    const feed = await listRecentActivity(user.id);
    expect(feed).toHaveLength(1);
    expect(feed[0].label).toBe("Reverse a String");
  });

  it("deduplicates a repeated event against the latest row", async () => {
    const user = await makeUser();

    await recordActivityOnce({
      userId: user.id,
      type: "LESSON_STARTED",
      entityId: "t1",
      label: "HTML",
    });
    await recordActivityOnce({
      userId: user.id,
      type: "LESSON_STARTED",
      entityId: "t1",
      label: "HTML",
    });

    expect(await listRecentActivity(user.id)).toHaveLength(1);
  });

  it("records a genuinely different event after another", async () => {
    const user = await makeUser();

    await recordActivityOnce({ userId: user.id, type: "LESSON_STARTED", entityId: "t1", label: "A" });
    await recordActivityOnce({ userId: user.id, type: "LESSON_STARTED", entityId: "t2", label: "B" });

    expect(await listRecentActivity(user.id)).toHaveLength(2);
  });

  it("stores nothing beyond the type, subject, label and time", async () => {
    const user = await makeUser();
    await recordActivity({ userId: user.id, type: "PROBLEM_SOLVED", label: "X" });

    const row = await db.userActivity.findFirstOrThrow({ where: { userId: user.id } });

    // An open metadata blob is how an activity log quietly becomes the most
    // sensitive table in an application.
    expect(row).not.toHaveProperty("metadata");
    expect(Object.keys(row).sort()).toEqual(
      ["createdAt", "entityId", "entitySlug", "id", "label", "type", "userId"].sort(),
    );
  });

  it("truncates an overlong label rather than storing a document", async () => {
    const user = await makeUser();
    await recordActivity({ userId: user.id, type: "PROBLEM_SOLVED", label: "x".repeat(500) });

    const row = await db.userActivity.findFirstOrThrow({ where: { userId: user.id } });
    expect(row.label.length).toBeLessThanOrEqual(120);
  });

  it("links an activity to the page it belongs to", () => {
    expect(activityHref({ type: "LESSON_COMPLETED", entitySlug: "html" })).toBe("/learn/html");
    expect(activityHref({ type: "PROBLEM_SOLVED", entitySlug: "rev" })).toBe("/practice/rev");
    expect(activityHref({ type: "AI_TOOL_STARTED", entitySlug: "cursor" })).toBe(
      "/academy/ai-tools/cursor",
    );
    expect(activityHref({ type: "PROBLEM_SOLVED", entitySlug: null })).toBeNull();
  });

  it("is recorded by the real learning flow", async () => {
    const user = await makeUser();
    signedInAs(user.id);
    await chooseCareer(user.id, "frontend-developer");

    const { topics } = await frontendTopics();
    await startTopic({ topicId: topics[0].id });

    const feed = await listRecentActivity(user.id);
    expect(feed.some((entry) => entry.type === "LESSON_STARTED")).toBe(true);
  });

  it("records completing a lesson exactly once", async () => {
    const user = await makeUser();
    signedInAs(user.id);
    await chooseCareer(user.id, "frontend-developer");

    const lesson = await db.lesson.findFirstOrThrow({
      where: { topic: { phase: { roadmap: { career: { slug: "frontend-developer" } } } } },
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

    await submitKnowledgeCheck({ topicId: lesson.topicId, answers });
    await submitKnowledgeCheck({ topicId: lesson.topicId, answers });

    const completions = await db.userActivity.count({
      where: { userId: user.id, type: "LESSON_COMPLETED" },
    });
    // Retaking a check you already passed is revision, not new progress.
    expect(completions).toBe(1);
  });

  it("is recorded when a career is chosen", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const career = await db.career.findUniqueOrThrow({
      where: { slug: "backend-developer" },
      select: { id: true },
    });

    await selectCareer({ careerId: career.id });

    const feed = await listRecentActivity(user.id);
    expect(feed[0].type).toBe("CAREER_SELECTED");
  });
});

// ── 8. Guidance end to end ─────────────────────────────────────────────────

describe("guidance", () => {
  it("produces a next action for a brand-new learner", async () => {
    const user = await makeUser();
    const guidance = await getGuidance(user.id);

    expect(guidance.next?.type).toBe("START_CAREER");
    expect(guidance.next?.href).toBe("/careers");
  });

  it("produces a roadmap action once a career is chosen", async () => {
    const user = await makeUser();
    await chooseCareer(user.id, "frontend-developer");

    const guidance = await getGuidance(user.id);

    expect(guidance.next?.type).toBe("START_ROADMAP");
    expect(guidance.next?.reason.length).toBeGreaterThan(30);
    // Links to the lesson where one is authored, and to the roadmap where one
    // is not — never to a page that would render "content coming soon".
    expect(guidance.next?.href).toMatch(
      guidance.state.currentTopic?.hasLesson ? /^\/learn\// : /^\/roadmap$/,
    );
  });

  it("sends a learner to the roadmap when the next topic has no lesson yet", () => {
    const next = nextAction(
      buildRecommendations(
        input({
          state: fakeState({
            currentTopic: {
              id: "t2",
              slug: "unwritten-topic",
              title: "Unwritten Topic",
              description: "",
              estimatedTime: "45 minutes",
              isRequired: true,
              hasLesson: false,
              phaseTitle: "JavaScript",
              phaseOrder: 2,
              phaseReason: "…",
            },
          }),
        }),
      ),
    );

    // A link to /learn/unwritten-topic would render "content coming soon",
    // which is a worse answer than pointing at the roadmap.
    expect(next?.href).toBe("/roadmap");
    expect(next?.action).toBe("View roadmap");
  });

  it("recalculates after progress, with no cache to invalidate", async () => {
    const user = await makeUser();
    await chooseCareer(user.id, "frontend-developer");

    const before = await getGuidance(user.id);
    await completeTopic(user.id, before.state.currentTopic!.id);
    const after = await getGuidance(user.id);

    expect(after.next?.title).not.toBe(before.next?.title);
  });

  it("recalculates when the career changes, without deleting history", async () => {
    const user = await makeUser();
    signedInAs(user.id);
    await chooseCareer(user.id, "frontend-developer");

    const { topics } = await frontendTopics();
    await completeTopic(user.id, topics[0].id);

    const frontend = await getGuidance(user.id);

    const backend = await db.career.findUniqueOrThrow({
      where: { slug: "backend-developer" },
      select: { id: true },
    });
    await selectCareer({ careerId: backend.id });

    const after = await getGuidance(user.id);

    expect(after.state.career?.slug).toBe("backend-developer");
    expect(after.next?.title).not.toBe(frontend.next?.title);
    // Historical progress survives: the row is still there, it just belongs to
    // a roadmap they are no longer following.
    expect(
      await db.userTopicProgress.count({ where: { userId: user.id, status: "COMPLETED" } }),
    ).toBe(1);
  });

  it("leaves unrelated progress alone when the language preference changes", async () => {
    const user = await makeUser();
    await chooseCareer(user.id, "frontend-developer");
    const { topics } = await frontendTopics();
    await completeTopic(user.id, topics[0].id);

    await db.profile.update({
      where: { userId: user.id },
      data: { selectedLanguage: "PYTHON" },
    });

    const guidance = await getGuidance(user.id);

    expect(guidance.state.language).toBe("PYTHON");
    // Git, HTML and everything else remain exactly as they were.
    expect(guidance.state.completedTopicIds).toHaveLength(1);
    expect(guidance.state.git.percentComplete).toBe(0);
  });

  it("builds a plan and gaps alongside the recommendations", async () => {
    const user = await makeUser();
    await chooseCareer(user.id, "frontend-developer");

    const guidance = await getGuidance(user.id);

    expect(guidance.plan.items.length).toBeGreaterThan(0);
    expect(Array.isArray(guidance.gaps)).toBe(true);
    expect(guidance.recommendations.length).toBeGreaterThan(0);
  });

  it("finds a real knowledge gap from recorded attempts", async () => {
    const user = await makeUser();
    await chooseCareer(user.id, "frontend-developer");

    const { topics } = await frontendTopics();
    await db.userTopicProgress.create({
      data: {
        userId: user.id,
        topicId: topics[0].id,
        status: "IN_PROGRESS",
        attempts: 4,
        bestScore: 35,
      },
    });

    const state = await getLearnerState(user.id);
    const gaps = await getKnowledgeGaps(user.id, state);

    expect(gaps.some((gap) => gap.strength === "STRONG")).toBe(true);
  });
});

// ── 9. Isolation ───────────────────────────────────────────────────────────

describe("learner data isolation", () => {
  it("never mixes two learners' state", async () => {
    const alice = await makeUser("alice-p@example.com");
    const bob = await makeUser("bob-p@example.com");

    await chooseCareer(alice.id, "frontend-developer");
    const { topics } = await frontendTopics();
    await completeTopic(alice.id, topics[0].id);

    const alices = await getLearnerState(alice.id);
    const bobs = await getLearnerState(bob.id);

    expect(alices.completedTopicIds).toHaveLength(1);
    expect(bobs.completedTopicIds).toHaveLength(0);
    expect(bobs.career).toBeNull();
  });

  it("never shows one learner another's activity", async () => {
    const alice = await makeUser("alice-a@example.com");
    const bob = await makeUser("bob-a@example.com");

    await recordActivity({ userId: alice.id, type: "PROBLEM_SOLVED", label: "Secret" });

    expect(await listRecentActivity(bob.id)).toHaveLength(0);
    expect((await getWeeklySummary(bob.id)).isEmpty).toBe(true);
  });

  it("redirects an unauthenticated visitor away from the dashboard", async () => {
    auth.mockResolvedValue(null);
    await expect(requireUser("/dashboard")).rejects.toThrow(/REDIRECT:\/login/);
  });

  it("redirects an unauthenticated visitor away from the mentor", async () => {
    auth.mockResolvedValue(null);
    await expect(requireUser("/mentor")).rejects.toThrow(/REDIRECT:\/login/);
  });
});
