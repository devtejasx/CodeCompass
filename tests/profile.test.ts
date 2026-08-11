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

const { calculateLevel, emptyEvidence, nextLevelHint, LEVEL_RANK, LEVEL_LABEL } =
  await import("@/lib/profile/levels");
const { getCapabilities, getCapabilityDetail } = await import(
  "@/lib/profile/capabilities"
);
const {
  getTechieProfile,
  detectStrengths,
  detectImprovements,
  detectMilestones,
  profileCompletion,
} = await import("@/lib/profile/service");
const {
  validateUsername,
  normaliseUsername,
  RESERVED_USERNAMES,
  USERNAME_MIN,
} = await import("@/lib/profile/username");
const { getPublicProfile } = await import("@/lib/profile/public");
const { buildLearningRecord, exportFilename } = await import("@/lib/profile/export");

const { setUsername, setProfileVisibility } = await import("@/app/actions/profile");
const { requireUser } = await import("@/lib/session");
const { db } = await import("@/lib/db");

// ── Helpers ────────────────────────────────────────────────────────────────

async function makeUser(email = "techie@example.com", name = "Test Techie") {
  return db.user.create({
    data: {
      name,
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
  await db.profile.update({ where: { userId }, data: { selectedCareerId: career.id } });
}

/** Completes the topics behind a capability, the way the learning system does. */
async function completeTopics(userId: string, slugs: string[]) {
  for (const slug of slugs) {
    const topic = await db.topic.findUnique({ where: { slug }, select: { id: true } });
    if (!topic) continue;

    await db.userTopicProgress.upsert({
      where: { userId_topicId: { userId, topicId: topic.id } },
      create: {
        userId,
        topicId: topic.id,
        status: "COMPLETED",
        percentComplete: 100,
        completedAt: new Date(),
      },
      update: { status: "COMPLETED", percentComplete: 100 },
    });
  }
}

/** Solves n problems attached to the given topics. */
async function solveProblemsFor(userId: string, topicSlugs: string[], count: number) {
  const links = await db.problemTopic.findMany({
    where: { topic: { slug: { in: topicSlugs } } },
    select: { problemId: true },
    take: count,
  });

  for (const link of links) {
    await db.userProblemProgress.upsert({
      where: { userId_problemId: { userId, problemId: link.problemId } },
      create: {
        userId,
        problemId: link.problemId,
        status: "SOLVED",
        attempts: 1,
        solvedAt: new Date(),
        solvedLanguage: "JAVASCRIPT",
      },
      update: { status: "SOLVED" },
    });
  }

  return links.length;
}

/** Completes a project by slug. */
async function completeProject(userId: string, slug: string) {
  const project = await db.project.findUniqueOrThrow({
    where: { slug },
    select: { id: true },
  });

  await db.userProject.upsert({
    where: { userId_projectId: { userId, projectId: project.id } },
    create: {
      userId,
      projectId: project.id,
      status: "COMPLETED",
      startedAt: new Date(),
      completedAt: new Date(),
    },
    update: { status: "COMPLETED", completedAt: new Date() },
  });
}

beforeEach(() => {
  auth.mockReset();
});

// ── 1. Level calculation ───────────────────────────────────────────────────

describe("capability levels", () => {
  it("returns null when nothing has been started", () => {
    // Not the same as EXPLORING: a capability nobody has touched should not
    // appear on a profile as though they had begun it.
    expect(calculateLevel(emptyEvidence())).toBeNull();
  });

  it("is EXPLORING once something is started but nothing finished", () => {
    expect(
      calculateLevel({ ...emptyEvidence(), topicsTotal: 4, topicsInProgress: 1 }),
    ).toBe("EXPLORING");
    expect(
      calculateLevel({ ...emptyEvidence(), problemsTotal: 4, problemsAttempted: 2 }),
    ).toBe("EXPLORING");
  });

  it("is LEARNING once a topic is completed", () => {
    expect(
      calculateLevel({ ...emptyEvidence(), topicsTotal: 4, topicsCompleted: 1 }),
    ).toBe("LEARNING");
  });

  it("is PRACTICING once the knowledge has been exercised", () => {
    expect(
      calculateLevel({
        ...emptyEvidence(),
        topicsTotal: 4,
        topicsCompleted: 2,
        problemsTotal: 6,
        problemsSolved: 2,
      }),
    ).toBe("PRACTICING");
  });

  it("counts Git exercises and AI workflows as practice", () => {
    expect(
      calculateLevel({
        ...emptyEvidence(),
        topicsTotal: 3,
        topicsCompleted: 1,
        gitExercisesTotal: 5,
        gitExercisesCompleted: 2,
      }),
    ).toBe("PRACTICING");

    expect(
      calculateLevel({
        ...emptyEvidence(),
        topicsTotal: 3,
        topicsCompleted: 1,
        aiWorkflowsTotal: 5,
        aiWorkflowsCompleted: 2,
      }),
    ).toBe("PRACTICING");
  });

  it("is APPLYING once something has been built with it", () => {
    expect(
      calculateLevel({
        ...emptyEvidence(),
        topicsTotal: 4,
        topicsCompleted: 2,
        problemsTotal: 6,
        problemsSolved: 3,
        projectsTotal: 3,
        projectsCompleted: 1,
      }),
    ).toBe("APPLYING");
  });

  it("reaches CONFIDENT only with two projects and the material complete", () => {
    const almost = {
      ...emptyEvidence(),
      topicsTotal: 4,
      topicsCompleted: 3,
      problemsTotal: 6,
      problemsSolved: 4,
      projectsTotal: 3,
      projectsCompleted: 2,
    };
    // Two projects but a topic outstanding: still APPLYING.
    expect(calculateLevel(almost)).toBe("APPLYING");

    expect(calculateLevel({ ...almost, topicsCompleted: 4 })).toBe("CONFIDENT");
  });

  it("does not award CONFIDENT for one project", () => {
    expect(
      calculateLevel({
        ...emptyEvidence(),
        topicsTotal: 2,
        topicsCompleted: 2,
        problemsTotal: 4,
        problemsSolved: 4,
        projectsTotal: 4,
        projectsCompleted: 1,
      }),
    ).toBe("APPLYING");
  });

  it("does not award APPLYING for a project alone when there is material to cover", () => {
    // Regression: finishing a portfolio without completing a single HTML or
    // CSS topic showed "Applying" beside "0/13 topics". The ladder is
    // cumulative, and reading an overclaim like that is how a learner stops
    // trusting the rest of the page.
    expect(
      calculateLevel({
        ...emptyEvidence(),
        topicsTotal: 13,
        topicsCompleted: 0,
        projectsTotal: 2,
        projectsCompleted: 1,
      }),
    ).toBe("PRACTICING");

    // With any knowledge behind it, the project does count.
    expect(
      calculateLevel({
        ...emptyEvidence(),
        topicsTotal: 13,
        topicsCompleted: 1,
        projectsTotal: 2,
        projectsCompleted: 1,
      }),
    ).toBe("APPLYING");
  });

  it("still awards APPLYING for a project when the capability has no material", () => {
    // Project Development has only projects, so a finished project is the
    // strongest evidence that exists for it.
    expect(
      calculateLevel({
        ...emptyEvidence(),
        projectsTotal: 24,
        projectsCompleted: 1,
      }),
    ).toBe("APPLYING");
  });

  it("lets a capability with no projects reach APPLYING by completing everything else", () => {
    // Git has exercises but no projects; it must still be able to top out.
    expect(
      calculateLevel({
        ...emptyEvidence(),
        topicsTotal: 3,
        topicsCompleted: 3,
        gitExercisesTotal: 4,
        gitExercisesCompleted: 4,
      }),
    ).toBe("APPLYING");
  });

  it("never uses expert or master vocabulary", () => {
    const words = Object.values(LEVEL_LABEL).join(" ").toLowerCase();

    for (const forbidden of ["expert", "master", "professional", "certified", "guru"]) {
      expect(words).not.toContain(forbidden);
    }
  });

  it("ranks levels in ascending order", () => {
    expect(LEVEL_RANK.EXPLORING).toBeLessThan(LEVEL_RANK.LEARNING);
    expect(LEVEL_RANK.LEARNING).toBeLessThan(LEVEL_RANK.PRACTICING);
    expect(LEVEL_RANK.PRACTICING).toBeLessThan(LEVEL_RANK.APPLYING);
    expect(LEVEL_RANK.APPLYING).toBeLessThan(LEVEL_RANK.CONFIDENT);
  });

  it("names the next rung and what would reach it", () => {
    const hint = nextLevelHint("LEARNING", {
      ...emptyEvidence(),
      topicsTotal: 4,
      topicsCompleted: 1,
      problemsTotal: 6,
    });

    expect(hint?.level).toBe("PRACTICING");
    expect(hint?.requirement).toMatch(/practice problems/i);

    // Nothing above the top.
    expect(nextLevelHint("CONFIDENT", emptyEvidence())).toBeNull();
  });

  it("names the real blocker when a project is done but the material is not", () => {
    // Regression: this said "complete a project that uses this" to somebody
    // who had already completed one. What is holding them at PRACTICING is
    // the knowledge, and the hint has to say so to be worth reading.
    const hint = nextLevelHint("PRACTICING", {
      ...emptyEvidence(),
      topicsTotal: 13,
      topicsCompleted: 0,
      projectsTotal: 2,
      projectsCompleted: 1,
    });

    expect(hint?.level).toBe("APPLYING");
    expect(hint?.requirement).toMatch(/topic/i);
    expect(hint?.requirement).not.toMatch(/complete a project/i);
  });
});

// ── 2. Evidence from real progress ─────────────────────────────────────────

describe("capability evidence", () => {
  it("gives a new learner capabilities with no level", async () => {
    const user = await makeUser();
    const capabilities = await getCapabilities(user.id);

    expect(capabilities.length).toBeGreaterThanOrEqual(15);
    expect(capabilities.every((capability) => capability.level === null)).toBe(true);
  });

  it("derives evidence from completed topics, with no stored evidence table", async () => {
    const user = await makeUser();
    await chooseCareer(user.id, "frontend-developer");

    await completeTopics(user.id, ["html-fundamentals", "css-fundamentals", "flexbox"]);

    const capabilities = await getCapabilities(user.id);
    const htmlCss = capabilities.find((entry) => entry.slug === "html-css")!;

    expect(htmlCss.evidence.topicsCompleted).toBe(3);
    expect(htmlCss.level).toBe("LEARNING");
  });

  it("recalculates immediately, with nothing to invalidate", async () => {
    const user = await makeUser();
    await completeTopics(user.id, ["html-fundamentals"]);

    const before = await getCapabilities(user.id);
    await completeTopics(user.id, ["css-fundamentals", "flexbox", "css-grid"]);
    const after = await getCapabilities(user.id);

    const find = (list: typeof before) =>
      list.find((entry) => entry.slug === "html-css")!.evidence.topicsCompleted;

    expect(find(after)).toBeGreaterThan(find(before));
  });

  it("counts practice evidence", async () => {
    const user = await makeUser();
    await completeTopics(user.id, ["js-arrays", "js-objects"]);
    const solved = await solveProblemsFor(user.id, ["js-arrays", "js-objects"], 3);

    const capabilities = await getCapabilities(user.id);
    const javascript = capabilities.find((entry) => entry.slug === "javascript")!;

    expect(javascript.evidence.problemsSolved).toBe(solved);
    if (solved >= 2) expect(javascript.level).toBe("PRACTICING");
  });

  it("counts project evidence", async () => {
    const user = await makeUser();
    await completeProject(user.id, "weather-dashboard");

    const capabilities = await getCapabilities(user.id);
    const delivery = capabilities.find((entry) => entry.slug === "project-development")!;

    expect(delivery.evidence.projectsCompleted).toBe(1);
    expect(delivery.level).toBe("APPLYING");
  });

  it("counts Git evidence", async () => {
    const user = await makeUser();
    await completeTopics(user.id, ["git-academy-git-basics", "git-academy-commits"]);
    await db.userGitExercise.createMany({
      data: [
        { userId: user.id, exerciseSlug: "stage-two-files", status: "COMPLETED" },
        { userId: user.id, exerciseSlug: "first-commit", status: "COMPLETED" },
      ],
    });

    const capabilities = await getCapabilities(user.id);
    const git = capabilities.find((entry) => entry.slug === "git")!;

    expect(git.evidence.topicsCompleted).toBe(2);
    expect(git.evidence.gitExercisesCompleted).toBe(2);
    expect(git.level).toBe("PRACTICING");
  });

  it("counts AI evidence", async () => {
    const user = await makeUser();
    await completeTopics(user.id, [
      "ai-academy-prompting-fundamentals",
      "ai-academy-debugging",
    ]);

    const workflows = await db.aIWorkflow.findMany({
      where: { slug: { in: ["debug-a-bug", "write-tests"] } },
      select: { id: true },
    });
    await db.userAIWorkflowProgress.createMany({
      data: workflows.map((workflow) => ({ userId: user.id, workflowId: workflow.id })),
    });

    const capabilities = await getCapabilities(user.id);
    const ai = capabilities.find((entry) => entry.slug === "ai-assisted-development")!;

    expect(ai.evidence.topicsCompleted).toBe(2);
    expect(ai.evidence.aiWorkflowsCompleted).toBe(2);
    expect(ai.level).toBe("PRACTICING");
  });

  it("counts a shared problem only once within a capability", async () => {
    const user = await makeUser();
    const capabilities = await getCapabilities(user.id);
    const javascript = capabilities.find((entry) => entry.slug === "javascript")!;

    // The capability lists several practice topics that can share problems.
    const distinct = await db.problemTopic.findMany({
      where: { topic: { slug: { in: ["js-arrays", "js-objects", "js-async", "js-promises"] } } },
      select: { problemId: true },
      distinct: ["problemId"],
    });

    expect(javascript.evidence.problemsTotal).toBe(distinct.length);
  });

  it("names each piece of evidence on the detail view", async () => {
    const user = await makeUser();
    await completeTopics(user.id, ["html-fundamentals"]);

    const detail = await getCapabilityDetail(user.id, "html-css");

    expect(detail).not.toBeNull();
    expect(detail!.items.length).toBeGreaterThan(0);
    expect(detail!.items.some((item) => item.done)).toBe(true);
    // Completed evidence first: the profile's job is to show what somebody can do.
    expect(detail!.items[0].done).toBe(true);
  });

  it("returns null for a capability that does not exist", async () => {
    const user = await makeUser();
    expect(await getCapabilityDetail(user.id, "not-a-capability")).toBeNull();
  });

  it("lists a shared concept once, even when several roadmaps teach it", async () => {
    // Regression: html-css lists both `responsive-design` (frontend) and
    // `fs-responsive` (full-stack), which share a title. Rendering both showed
    // "Responsive design" twice and collided React keys — it reads as a
    // rendering fault rather than as thoroughness.
    const user = await makeUser();
    const detail = await getCapabilityDetail(user.id, "html-css");

    const keys = detail!.items.map((item) => `${item.kind}:${item.title}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("counts a concept as done when either roadmap's version was completed", async () => {
    const user = await makeUser();
    // Only the full-stack version, not the frontend one.
    await completeTopics(user.id, ["fs-responsive"]);

    const detail = await getCapabilityDetail(user.id, "html-css");
    const responsive = detail!.items.find((item) => /responsive/i.test(item.title));

    expect(responsive?.done).toBe(true);
  });

  it("gives every capability at least one source, so none is unearnable", async () => {
    const capabilities = await db.capability.findMany({
      select: { slug: true, _count: { select: { sources: true } } },
    });

    expect(capabilities.length).toBeGreaterThan(0);
    for (const capability of capabilities) {
      expect(capability._count.sources, capability.slug).toBeGreaterThan(0);
    }
  });
});

// ── 3. Strengths and improvements ──────────────────────────────────────────

describe("strengths and improvements", () => {
  const capability = (slug: string, level: string | null, evidence = {}) =>
    ({
      slug,
      name: slug,
      description: "",
      longDescription: "",
      category: "PROGRAMMING",
      icon: "Code2",
      sortOrder: 0,
      level,
      evidence: { ...emptyEvidence(), ...evidence },
      next: level === "CONFIDENT" ? null : { level: "APPLYING", requirement: "Do a thing." },
    }) as unknown as Parameters<typeof detectStrengths>[0][number];

  it("only calls something a strength once it has been built with", () => {
    const strengths = detectStrengths([
      capability("learned", "LEARNING", { topicsCompleted: 3, topicsTotal: 3 }),
      capability("practised", "PRACTICING", { problemsSolved: 5 }),
      capability("applied", "APPLYING", { projectsCompleted: 1, topicsCompleted: 4 }),
    ]);

    // A completed lesson is not a strength; calling it one would make the word
    // meaningless and the rest of the page less believable.
    expect(strengths.map((entry) => entry.slug)).toEqual(["applied"]);
  });

  it("states the evidence factually, never as an adjective about the person", () => {
    const strengths = detectStrengths([
      capability("applied", "APPLYING", {
        topicsCompleted: 4,
        topicsTotal: 6,
        problemsSolved: 12,
        projectsCompleted: 2,
      }),
    ]);

    const evidence = strengths[0].evidence;
    expect(evidence).toContain("4 of 6 topics");
    expect(evidence).toContain("12 practice problems");
    expect(evidence).toContain("2 projects");

    for (const forbidden of ["excellent", "great", "impressive", "expert", "talented"]) {
      expect(evidence.toLowerCase()).not.toContain(forbidden);
    }
  });

  it("pluralises evidence counts", () => {
    // Regression: "1 Git exercises solved" and "1 of 13 topics completed" both
    // read as placeholder text rather than as a real record.
    const one = detectStrengths([
      capability("solo", "APPLYING", {
        topicsCompleted: 1,
        topicsTotal: 1,
        projectsCompleted: 1,
        gitExercisesCompleted: 1,
        aiWorkflowsCompleted: 1,
      }),
    ])[0].evidence;

    expect(one).toContain("1 of 1 topic completed");
    expect(one).toContain("1 project completed");
    expect(one).toContain("1 Git exercise solved");
    expect(one).toContain("1 AI workflow used");
    expect(one).not.toContain("exercises");
    expect(one).not.toContain("workflows");

    const many = detectStrengths([
      capability("plural", "APPLYING", {
        topicsCompleted: 2,
        topicsTotal: 5,
        projectsCompleted: 3,
      }),
    ])[0].evidence;

    expect(many).toContain("2 of 5 topics completed");
    expect(many).toContain("3 projects completed");
  });

  it("suggests improvements furthest along first, each with a next step", () => {
    const improvements = detectImprovements([
      capability("barely", "EXPLORING"),
      capability("close", "APPLYING", { projectsCompleted: 1 }),
      capability("mid", "PRACTICING", { problemsSolved: 3 }),
    ]);

    expect(improvements[0].slug).toBe("close");
    for (const improvement of improvements) {
      expect(improvement.next.length).toBeGreaterThan(5);
      expect(improvement.href).toContain("/profile/skills/");
    }
  });

  it("never suggests improving something with no evidence at all", () => {
    const improvements = detectImprovements([capability("untouched", null)]);
    expect(improvements).toHaveLength(0);
  });
});

// ── 4. Milestones and completion ───────────────────────────────────────────

describe("milestones and profile completion", () => {
  it("marks a milestone only when the activity exists", () => {
    const joined = new Date("2026-01-01");
    const milestones = detectMilestones(
      [{ type: "LESSON_COMPLETED", createdAt: new Date("2026-02-01") }],
      joined,
    );

    const topic = milestones.find((entry) => entry.key === "topic")!;
    const project = milestones.find((entry) => entry.key === "project")!;

    expect(topic.achievedAt).toEqual(new Date("2026-02-01"));
    // Never fabricated: no activity means no milestone.
    expect(project.achievedAt).toBeNull();
  });

  it("uses the earliest occurrence of each milestone", () => {
    const milestones = detectMilestones(
      [
        { type: "PROBLEM_SOLVED", createdAt: new Date("2026-03-01") },
        { type: "PROBLEM_SOLVED", createdAt: new Date("2026-02-01") },
      ],
      new Date("2026-01-01"),
    );

    expect(milestones.find((entry) => entry.key === "problem")!.achievedAt).toEqual(
      new Date("2026-02-01"),
    );
  });

  it("keeps milestones to a meaningful handful, not a badge wall", () => {
    const milestones = detectMilestones([], new Date());
    expect(milestones.length).toBeLessThanOrEqual(8);
  });

  it("measures useful setup and never requires a public profile", async () => {
    const user = await makeUser();
    const { getLearnerState } = await import("@/lib/personalization/state");
    const state = await getLearnerState(user.id);

    const completion = profileCompletion(state, 0);

    expect(completion.total).toBeGreaterThan(0);
    expect(completion.done).toBe(0);
    // Publishing is optional; putting it in a completion bar would be pressure.
    expect(completion.items.some((item) => /public|username/i.test(item.label))).toBe(
      false,
    );
  });
});

// ── 5. The profile end to end ──────────────────────────────────────────────

describe("techie profile", () => {
  it("loads for a brand-new learner without inventing anything", async () => {
    const user = await makeUser();
    const profile = await getTechieProfile(user.id);

    expect(profile.displayName).toBe("Test Techie");
    expect(profile.strengths).toHaveLength(0);
    expect(profile.projects).toHaveLength(0);
    expect(profile.practice.solved).toBe(0);
    // No data means no insight, rather than a made-up one.
    expect(profile.practice.insights).toHaveLength(0);
    expect(profile.summary.length).toBeGreaterThan(20);
  });

  it("summarises from the learner's own strongest evidence", async () => {
    const user = await makeUser();
    await chooseCareer(user.id, "frontend-developer");
    await completeTopics(user.id, [
      "html-fundamentals",
      "css-fundamentals",
      "flexbox",
      "css-grid",
    ]);

    const profile = await getTechieProfile(user.id);

    expect(profile.summary).toContain("Frontend Developer");
    expect(profile.summary).toContain("HTML & CSS");
  });

  it("never names a capability the learner has no evidence for", async () => {
    const user = await makeUser();
    await chooseCareer(user.id, "frontend-developer");
    await completeTopics(user.id, ["html-fundamentals"]);

    const profile = await getTechieProfile(user.id);

    expect(profile.summary).not.toContain("React");
    expect(profile.summary).not.toContain("TypeScript");
  });

  it("hides categories the learner has nothing in", async () => {
    const user = await makeUser();
    await completeTopics(user.id, ["html-fundamentals", "css-fundamentals"]);

    const profile = await getTechieProfile(user.id);
    const categories = profile.categories.map((group) => group.category);

    expect(categories).toContain("WEB_DEVELOPMENT");
    // An empty heading reads as broken rather than as not-started.
    expect(categories).not.toContain("AI_SKILLS");
  });

  it("reports project evidence with counts rather than an opinion", async () => {
    const user = await makeUser();
    await completeProject(user.id, "weather-dashboard");

    const profile = await getTechieProfile(user.id);
    const project = profile.projects[0];

    expect(project.title).toBeTruthy();
    expect(project.milestonesTotal).toBeGreaterThan(0);
    expect(project).not.toHaveProperty("quality");
    expect(project).not.toHaveProperty("rating");
    expect(project).not.toHaveProperty("score");
  });

  it("withholds practice insights below the evidence threshold", async () => {
    const user = await makeUser();
    await solveProblemsFor(user.id, ["js-arrays"], 2);

    const profile = await getTechieProfile(user.id);
    expect(profile.practice.insights).toHaveLength(0);
  });

  it("uses the Phase 10 engine for the next action rather than a second copy", async () => {
    const user = await makeUser();
    await chooseCareer(user.id, "frontend-developer");

    const { getGuidance } = await import("@/lib/personalization/service");
    const [profile, guidance] = await Promise.all([
      getTechieProfile(user.id),
      getGuidance(user.id),
    ]);

    expect(profile.nextAction?.title).toBe(guidance.next?.title);
    expect(profile.nextAction?.href).toBe(guidance.next?.href);
  });

  it("issues no certificates and makes no readiness claim", async () => {
    const user = await makeUser();
    await completeProject(user.id, "weather-dashboard");

    const serialised = JSON.stringify(await getTechieProfile(user.id)).toLowerCase();

    for (const forbidden of [
      "certified",
      "certificate",
      "job ready",
      "job-ready",
      "industry ready",
      "employab",
      "guaranteed",
    ]) {
      expect(serialised).not.toContain(forbidden);
    }
  });
});

// ── 6. Usernames ───────────────────────────────────────────────────────────

describe("usernames", () => {
  it("folds case rather than treating names as distinct", () => {
    // Two accounts differing only by case is a phishing surface.
    expect(normaliseUsername("  TeJaS  ")).toBe("tejas");
  });

  it("enforces length and characters", () => {
    expect(validateUsername("ab")).toBe("TOO_SHORT");
    expect(validateUsername("a".repeat(40))).toBe("TOO_LONG");
    expect(validateUsername("has spaces")).toBe("INVALID_CHARACTERS");
    expect(validateUsername("has.dots")).toBe("INVALID_CHARACTERS");
    expect(validateUsername("-leading")).toBe("INVALID_CHARACTERS");
    expect(validateUsername("trailing-")).toBe("INVALID_CHARACTERS");
    expect(validateUsername("good-name_1")).toBeNull();
    expect(validateUsername("a".repeat(USERNAME_MIN))).toBeNull();
  });

  it("reserves names that would impersonate or collide with a route", () => {
    for (const reserved of ["admin", "support", "codecompass", "profile", "settings"]) {
      expect(validateUsername(reserved), reserved).toBe("RESERVED");
      expect(RESERVED_USERNAMES.has(reserved)).toBe(true);
    }
  });

  it("claims a username for the session user", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const result = await setUsername({ username: "Tejas-Dev" });
    expect(result.ok).toBe(true);
    expect(result.username).toBe("tejas-dev");

    const profile = await db.profile.findUniqueOrThrow({ where: { userId: user.id } });
    expect(profile.username).toBe("tejas-dev");
  });

  it("refuses a username already taken by somebody else", async () => {
    const alice = await makeUser("alice-u@example.com");
    const bob = await makeUser("bob-u@example.com");

    signedInAs(alice.id);
    await setUsername({ username: "shared-name" });

    signedInAs(bob.id);
    const result = await setUsername({ username: "shared-name" });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/taken/i);
  });

  it("lets a learner keep their own username when updating", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    await setUsername({ username: "mine" });
    expect((await setUsername({ username: "mine" })).ok).toBe(true);
  });

  it("refuses a reserved name through the action", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    expect((await setUsername({ username: "admin" })).ok).toBe(false);
  });

  it("refuses when signed out", async () => {
    auth.mockResolvedValue(null);
    expect((await setUsername({ username: "anything" })).ok).toBe(false);
    expect((await setProfileVisibility({ isPublic: true })).ok).toBe(false);
  });
});

// ── 7. Public profile privacy ──────────────────────────────────────────────

describe("public profile", () => {
  async function publish(userId: string, username: string, settings = {}) {
    await db.profile.update({
      where: { userId },
      data: { username, isPublic: true, ...settings },
    });
  }

  it("is private by default", async () => {
    const user = await makeUser();
    const profile = await db.profile.findUniqueOrThrow({ where: { userId: user.id } });

    expect(profile.isPublic).toBe(false);
    expect(profile.username).toBeNull();
    // GitHub is off even though the others default on: a handle is an identity
    // elsewhere.
    expect(profile.publicShowGitHub).toBe(false);
  });

  it("is not found while private, even with a known username", async () => {
    const user = await makeUser();
    await db.profile.update({
      where: { userId: user.id },
      data: { username: "hidden-person" },
    });

    expect(await getPublicProfile("hidden-person")).toBeNull();
  });

  it("returns null for an unknown username, indistinguishably from a private one", async () => {
    expect(await getPublicProfile("no-such-person")).toBeNull();
    expect(await getPublicProfile("")).toBeNull();
  });

  it("loads once published", async () => {
    const user = await makeUser("public@example.com", "Public Person");
    await chooseCareer(user.id, "frontend-developer");
    await publish(user.id, "public-person");

    const profile = await getPublicProfile("public-person");

    expect(profile).not.toBeNull();
    expect(profile!.displayName).toBe("Public Person");
    expect(profile!.careerName).toBe("Frontend Developer");
  });

  it("is found case-insensitively", async () => {
    const user = await makeUser();
    await publish(user.id, "case-test");

    expect(await getPublicProfile("CASE-TEST")).not.toBeNull();
  });

  it("respects each section switch independently", async () => {
    const user = await makeUser();
    await completeTopics(user.id, ["html-fundamentals"]);
    await completeProject(user.id, "weather-dashboard");

    await publish(user.id, "selective", {
      publicShowSkills: false,
      publicShowProjects: true,
      publicShowProgress: false,
      publicShowGitHub: false,
    });

    const profile = await getPublicProfile("selective");

    expect(profile!.capabilities).toBeNull();
    expect(profile!.progress).toBeNull();
    expect(profile!.github).toBeNull();
    expect(profile!.projects).not.toBeNull();
  });

  it("shows only completed projects, and no repository or demo links", async () => {
    const user = await makeUser();

    const inProgress = await db.project.findFirstOrThrow({
      where: { slug: "calculator" },
      select: { id: true },
    });
    await db.userProject.create({
      data: {
        userId: user.id,
        projectId: inProgress.id,
        status: "IN_PROGRESS",
        repositoryUrl: "https://github.com/secret/private-repo",
      },
    });
    await completeProject(user.id, "weather-dashboard");

    await publish(user.id, "projects-person");
    const profile = await getPublicProfile("projects-person");

    expect(profile!.projects).toHaveLength(1);
    expect(profile!.projects![0].slug).toBe("weather-dashboard");

    const serialised = JSON.stringify(profile);
    expect(serialised).not.toContain("private-repo");
    expect(serialised).not.toContain("repositoryUrl");
    expect(serialised).not.toContain("deployedUrl");
  });

  it("shows only earned capabilities, without the evidence counts", async () => {
    const user = await makeUser();
    await completeTopics(user.id, ["html-fundamentals"]);
    await publish(user.id, "skills-person");

    const profile = await getPublicProfile("skills-person");

    expect(profile!.capabilities!.length).toBeGreaterThan(0);
    expect(profile!.capabilities!.every((entry) => entry.level !== null)).toBe(true);
    // How many attempts something took is nobody else's business.
    expect(profile!.capabilities![0]).not.toHaveProperty("evidence");
  });

  it("shows only the GitHub handle, never the token or scopes", async () => {
    const user = await makeUser();
    await db.gitHubConnection.create({
      data: {
        userId: user.id,
        githubUserId: BigInt(99),
        username: "octolearner",
        profileUrl: "https://github.com/octolearner",
        accessTokenCipher: "CIPHERTEXT-MUST-NOT-APPEAR",
        accessTokenIv: "IV-MUST-NOT-APPEAR",
        accessTokenTag: "TAG-MUST-NOT-APPEAR",
        scope: "repo read:user",
      },
    });

    await publish(user.id, "github-person", { publicShowGitHub: true });
    const profile = await getPublicProfile("github-person");

    expect(profile!.github?.username).toBe("octolearner");

    const serialised = JSON.stringify(profile);
    for (const forbidden of [
      "CIPHERTEXT-MUST-NOT-APPEAR",
      "IV-MUST-NOT-APPEAR",
      "TAG-MUST-NOT-APPEAR",
      "read:user",
      "accessToken",
      "scope",
    ]) {
      expect(serialised, forbidden).not.toContain(forbidden);
    }
  });

  it("never leaks an email, a password hash or an internal id", async () => {
    const user = await makeUser("very-private@example.com");
    await completeTopics(user.id, ["html-fundamentals"]);
    await completeProject(user.id, "weather-dashboard");
    await publish(user.id, "leak-check", { publicShowGitHub: true });

    const serialised = JSON.stringify(await getPublicProfile("leak-check"));

    for (const forbidden of [
      "very-private@example.com",
      "$2b$12$",
      user.id,
      "passwordHash",
      "email",
    ]) {
      expect(serialised, forbidden).not.toContain(forbidden);
    }
  });

  it("publishes no activity, conversations or personalization internals", async () => {
    const user = await makeUser();
    await db.userActivity.create({
      data: { userId: user.id, type: "PROBLEM_SOLVED", label: "PRIVATE-ACTIVITY-LABEL" },
    });
    await db.mentorConversation.create({
      data: { userId: user.id, title: "PRIVATE-CONVERSATION-TITLE" },
    });

    await publish(user.id, "internals-check");
    const serialised = JSON.stringify(await getPublicProfile("internals-check"));

    expect(serialised).not.toContain("PRIVATE-ACTIVITY-LABEL");
    expect(serialised).not.toContain("PRIVATE-CONVERSATION-TITLE");
    expect(serialised).not.toContain("gaps");
    expect(serialised).not.toContain("recommendation");
  });

  it("publishes no readiness or employability claim", async () => {
    const user = await makeUser();
    await completeProject(user.id, "weather-dashboard");
    // A username deliberately free of the forbidden words, so the fixture
    // cannot satisfy its own assertion.
    await publish(user.id, "claims-check");

    const profile = await getPublicProfile("claims-check");
    const serialised = JSON.stringify(profile).toLowerCase();

    for (const forbidden of [
      "readiness",
      "employab",
      "score",
      "certified",
      "certificate",
      "job ready",
      "hireab",
    ]) {
      expect(serialised, forbidden).not.toContain(forbidden);
    }

    // The public shape is progress bars, not a rating.
    expect(profile!.progress?.every((bar) => bar.label !== "Readiness")).toBe(true);
  });

  it("requires a username before it can be published", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const refused = await setProfileVisibility({ isPublic: true });
    expect(refused.ok).toBe(false);
    expect(refused.error).toMatch(/username/i);

    await setUsername({ username: "now-i-have-one" });
    expect((await setProfileVisibility({ isPublic: true })).ok).toBe(true);
  });

  it("goes private again with one switch", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    await setUsername({ username: "toggle-me" });
    await setProfileVisibility({ isPublic: true });
    expect(await getPublicProfile("toggle-me")).not.toBeNull();

    await setProfileVisibility({ isPublic: false });
    expect(await getPublicProfile("toggle-me")).toBeNull();
  });

  it("only ever changes the session user's settings", async () => {
    const alice = await makeUser("alice-v@example.com");
    const bob = await makeUser("bob-v@example.com");

    signedInAs(bob.id);
    await setUsername({ username: "bobs-name" });
    await setProfileVisibility({ isPublic: true, publicShowGitHub: true });

    const alices = await db.profile.findUniqueOrThrow({ where: { userId: alice.id } });
    expect(alices.isPublic).toBe(false);
    expect(alices.username).toBeNull();
    expect(alices.publicShowGitHub).toBe(false);
  });
});

// ── 8. Export ──────────────────────────────────────────────────────────────

describe("learning record export", () => {
  it("includes the learner's own work", async () => {
    const user = await makeUser();
    await chooseCareer(user.id, "frontend-developer");
    await completeTopics(user.id, ["html-fundamentals", "css-fundamentals"]);
    await solveProblemsFor(user.id, ["js-arrays"], 2);
    await completeProject(user.id, "weather-dashboard");

    const record = await buildLearningRecord(user.id);

    expect(record.formatVersion).toBe(1);
    expect(record.learner.career).toBe("Frontend Developer");
    expect(record.learning.length).toBe(2);
    expect(record.projects.length).toBe(1);
    expect(record.capabilities.length).toBeGreaterThan(0);
  });

  it("contains no credential, token or internal id", async () => {
    const user = await makeUser("export-privacy@example.com");
    await db.gitHubConnection.create({
      data: {
        userId: user.id,
        githubUserId: BigInt(7),
        username: "octolearner",
        profileUrl: "https://github.com/octolearner",
        accessTokenCipher: "EXPORT-CIPHER-MUST-NOT-APPEAR",
        accessTokenIv: "EXPORT-IV",
        accessTokenTag: "EXPORT-TAG",
        scope: "repo",
      },
    });

    const serialised = JSON.stringify(await buildLearningRecord(user.id));

    for (const forbidden of [
      "export-privacy@example.com",
      "$2b$12$",
      "EXPORT-CIPHER-MUST-NOT-APPEAR",
      "EXPORT-IV",
      "EXPORT-TAG",
      "passwordHash",
      user.id,
    ]) {
      expect(serialised, forbidden).not.toContain(forbidden);
    }
  });

  it("identifies content by slug rather than by database id", async () => {
    const user = await makeUser();
    await completeTopics(user.id, ["html-fundamentals"]);

    const record = await buildLearningRecord(user.id);

    expect(record.learning[0].slug).toBe("html-fundamentals");
    expect(record.learning[0]).not.toHaveProperty("id");
    expect(record.learning[0]).not.toHaveProperty("topicId");
  });

  it("builds a filename from the date, never from learner text", () => {
    const filename = exportFilename(new Date("2026-08-11T12:00:00Z"));

    expect(filename).toBe("codecompass-learning-record-2026-08-11.json");
    // A quote or newline in a Content-Disposition header is response splitting.
    expect(filename).not.toMatch(/["\r\n]/);
  });

  it("exports only the requested learner's record", async () => {
    const alice = await makeUser("alice-e@example.com", "Alice");
    const bob = await makeUser("bob-e@example.com", "Bob");

    await completeTopics(alice.id, ["html-fundamentals"]);

    const bobsRecord = await buildLearningRecord(bob.id);

    expect(bobsRecord.learner.displayName).toBe("Bob");
    expect(bobsRecord.learning).toHaveLength(0);
  });
});

// ── 9. Isolation and access control ────────────────────────────────────────

describe("profile isolation", () => {
  it("never mixes two learners' capabilities", async () => {
    const alice = await makeUser("alice-c@example.com");
    const bob = await makeUser("bob-c@example.com");

    await completeTopics(alice.id, ["html-fundamentals", "css-fundamentals"]);

    const alices = await getCapabilities(alice.id);
    const bobs = await getCapabilities(bob.id);

    expect(alices.find((entry) => entry.slug === "html-css")!.level).not.toBeNull();
    expect(bobs.find((entry) => entry.slug === "html-css")!.level).toBeNull();
  });

  it("never mixes two learners' profiles", async () => {
    const alice = await makeUser("alice-pr@example.com", "Alice");
    const bob = await makeUser("bob-pr@example.com", "Bob");

    await completeProject(alice.id, "weather-dashboard");

    const bobsProfile = await getTechieProfile(bob.id);

    expect(bobsProfile.displayName).toBe("Bob");
    expect(bobsProfile.projects).toHaveLength(0);
    expect(bobsProfile.strengths).toHaveLength(0);
  });

  it("redirects an unauthenticated visitor away from the profile", async () => {
    auth.mockResolvedValue(null);
    await expect(requireUser("/profile")).rejects.toThrow(/REDIRECT:\/login/);
  });

  it("redirects an unauthenticated visitor away from profile settings", async () => {
    auth.mockResolvedValue(null);
    await expect(requireUser("/profile/settings")).rejects.toThrow(/REDIRECT:\/login/);
  });
});
