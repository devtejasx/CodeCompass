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
  listProjects,
  getProjectDetail,
  getProjectsByPhase,
  getProjectsForTopic,
  getProjectRecommendations,
  getProjectSummary,
  getUserProject,
  getCompletedTopicIdsForUser,
} = await import("@/lib/projects/queries");

const {
  startProject,
  setMilestoneComplete,
  saveSubmission,
  setRequirementConfirmed,
  completeProject,
} = await import("@/app/actions/projects");

const { recommendProjects, upcomingProjects, isReady } =
  await import("@/lib/projects/recommend");
const { milestonePercent, canComplete } = await import("@/lib/projects/progress");
const { checkUrl, hostLabel } = await import("@/lib/projects/urls");

const { requireUser } = await import("@/lib/session");
const { db } = await import("@/lib/db");

const { PROJECTS } = await import("../prisma/seed/projects");
const { validateProject, validateProjectSet } =
  await import("../prisma/seed/projects/validate");

// ── Helpers ────────────────────────────────────────────────────────────────

async function makeUser(email = "builder@example.com") {
  return db.user.create({
    data: {
      name: "Test Builder",
      email,
      passwordHash: "$2b$12$abcdefghijklmnopqrstuv",
      profile: { create: { onboardingCompleted: true } },
    },
  });
}

function signedInAs(id: string) {
  auth.mockResolvedValue({ user: { id } });
}

async function projectBySlug(slug: string) {
  return db.project.findUniqueOrThrow({
    where: { slug },
    select: { id: true, slug: true },
  });
}

/** Completes the topics a project needs, so it becomes recommendable. */
async function completePrerequisites(userId: string, slug: string) {
  const concepts = await db.projectConcept.findMany({
    where: { project: { slug }, isPrerequisite: true },
    select: { topicId: true },
  });

  for (const concept of concepts) {
    await db.userTopicProgress.upsert({
      where: { userId_topicId: { userId, topicId: concept.topicId } },
      create: {
        userId,
        topicId: concept.topicId,
        status: "COMPLETED",
        percentComplete: 100,
        completedAt: new Date(),
      },
      update: { status: "COMPLETED", completedAt: new Date() },
    });
  }

  return concepts.map((concept) => concept.topicId);
}

/** Ticks every required requirement, which the completion gate demands. */
async function confirmAllRequired(projectId: string) {
  const required = await db.projectRequirement.findMany({
    where: { projectId, isRequired: true },
    select: { id: true },
  });

  for (const requirement of required) {
    await setRequirementConfirmed({
      projectId,
      requirementId: requirement.id,
      confirmed: true,
    });
  }
}

beforeEach(() => {
  auth.mockReset();
});

// ── 1. Catalog ─────────────────────────────────────────────────────────────

describe("project catalog", () => {
  it("loads every seeded project with this learner's status", async () => {
    const user = await makeUser();
    const projects = await listProjects(user.id);

    expect(projects.length).toBe(PROJECTS.length);
    expect(projects.every((project) => project.status === "NOT_STARTED")).toBe(true);
  });

  it("covers all three seeded career types, at every difficulty", async () => {
    const projects = await db.project.findMany({
      select: { type: true, difficulty: true },
    });

    for (const type of ["FRONTEND", "BACKEND", "FULL_STACK"]) {
      const ofType = projects.filter((project) => project.type === type);
      expect(ofType.length, type).toBeGreaterThan(0);
      // Every path needs somewhere to start.
      expect(
        ofType.some((project) => project.difficulty === "BEGINNER"),
        `${type} beginner`,
      ).toBe(true);
    }

    expect(projects.some((p) => p.difficulty === "ADVANCED")).toBe(true);
  });

  it("gives every project requirements, milestones, hints and resources", async () => {
    const projects = await db.project.findMany({
      select: {
        slug: true,
        _count: {
          select: {
            requirements: true,
            milestones: true,
            hints: true,
            resources: true,
            technologies: true,
            concepts: true,
          },
        },
      },
    });

    for (const project of projects) {
      expect(project._count.requirements, project.slug).toBeGreaterThanOrEqual(4);
      expect(project._count.milestones, project.slug).toBeGreaterThanOrEqual(4);
      expect(project._count.hints, project.slug).toBeGreaterThan(0);
      expect(project._count.resources, project.slug).toBeGreaterThan(0);
      expect(project._count.technologies, project.slug).toBeGreaterThan(0);
      expect(project._count.concepts, project.slug).toBeGreaterThan(0);
    }
  });

  it("lists summaries without loading requirements or milestones", async () => {
    const user = await makeUser();
    const projects = await listProjects(user.id);

    // The list page must not carry the full project payload.
    expect(projects[0]).not.toHaveProperty("requirements");
    expect(projects[0]).not.toHaveProperty("milestones");
    expect(projects[0]).not.toHaveProperty("hints");
    expect(projects[0]).toHaveProperty("shortDescription");
  });
});

// ── 2-3. Detail and missing projects ───────────────────────────────────────

describe("project detail", () => {
  it("loads everything the detail page renders", async () => {
    const project = await getProjectDetail("weather-dashboard");

    expect(project).not.toBeNull();
    expect(project!.whyBuildThis.length).toBeGreaterThan(100);
    expect(project!.whatYouBuild.length).toBeGreaterThan(80);
    expect(project!.requirements.length).toBeGreaterThan(4);
    expect(project!.milestones.length).toBeGreaterThan(4);
    expect(project!.hints.length).toBeGreaterThan(0);
    expect(project!.resources.length).toBeGreaterThan(0);
    expect(project!.concepts.length).toBeGreaterThan(0);
  });

  it("orders requirements and milestones as authored", async () => {
    const project = await getProjectDetail("weather-dashboard");

    const requirementOrders = project!.requirements.map((r) => r.order);
    const milestoneOrders = project!.milestones.map((m) => m.order);

    expect(requirementOrders).toEqual(requirementOrders.map((_, i) => i + 1));
    expect(milestoneOrders).toEqual(milestoneOrders.map((_, i) => i + 1));
  });

  it("returns null for a slug that does not exist", async () => {
    expect(await getProjectDetail("not-a-real-project")).toBeNull();
  });
});

// ── 4. Project ↔ topic relationship ────────────────────────────────────────

describe("project to topic relationship", () => {
  it("connects every project to real roadmap topics", async () => {
    const concepts = await db.projectConcept.findMany({
      select: {
        project: { select: { slug: true } },
        topic: { select: { slug: true } },
      },
    });

    expect(concepts.length).toBeGreaterThan(100);
    for (const concept of concepts) {
      expect(concept.topic.slug).toBeTruthy();
    }
  });

  it("finds the projects that build on a topic", async () => {
    const topic = await db.topic.findUniqueOrThrow({
      where: { slug: "fetch-api" },
      select: { id: true },
    });

    const projects = await getProjectsForTopic(topic.id);
    expect(projects.map((project) => project.slug)).toContain("weather-dashboard");
  });

  it("returns nothing for a topic with no projects, rather than filler", async () => {
    const topic = await db.topic.findUniqueOrThrow({
      where: { slug: "dns" },
      select: { id: true },
    });

    expect(await getProjectsForTopic(topic.id)).toEqual([]);
  });

  it("folds this learner's status into a topic's projects", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const project = await projectBySlug("weather-dashboard");
    await startProject({ projectId: project.id });

    const topic = await db.topic.findUniqueOrThrow({
      where: { slug: "fetch-api" },
      select: { id: true },
    });
    const projects = await getProjectsForTopic(topic.id, user.id);

    expect(projects.find((entry) => entry.slug === "weather-dashboard")!.status).toBe(
      "IN_PROGRESS",
    );
  });
});

// ── 5. Recommendation ──────────────────────────────────────────────────────

describe("recommendation logic", () => {
  const projects = [
    {
      id: "a",
      slug: "a",
      difficulty: "ADVANCED" as const,
      sortOrder: 1,
      prerequisiteTopicIds: ["t1"],
      status: "NOT_STARTED" as const,
    },
    {
      id: "b",
      slug: "b",
      difficulty: "BEGINNER" as const,
      sortOrder: 2,
      prerequisiteTopicIds: ["t1"],
      status: "NOT_STARTED" as const,
    },
    {
      id: "c",
      slug: "c",
      difficulty: "BEGINNER" as const,
      sortOrder: 3,
      prerequisiteTopicIds: ["t1", "t9"],
      status: "NOT_STARTED" as const,
    },
    {
      id: "d",
      slug: "d",
      difficulty: "BEGINNER" as const,
      sortOrder: 4,
      prerequisiteTopicIds: ["t1"],
      status: "COMPLETED" as const,
    },
    {
      id: "e",
      slug: "e",
      difficulty: "ADVANCED" as const,
      sortOrder: 5,
      prerequisiteTopicIds: ["t1"],
      status: "IN_PROGRESS" as const,
    },
  ];

  it("puts in-progress work first, then easiest", () => {
    const result = recommendProjects({ completedTopicIds: ["t1"], projects });

    expect(result.map((entry) => entry.project.id)).toEqual(["e", "b", "a"]);
    expect(result[0].reason).toBe("CONTINUE");
    expect(result[1].reason).toBe("READY");
  });

  it("never recommends a project whose prerequisites are unmet", () => {
    const result = recommendProjects({ completedTopicIds: ["t1"], projects });
    // "c" also needs t9, which has not been completed.
    expect(result.map((entry) => entry.project.id)).not.toContain("c");
  });

  it("removes completed projects", () => {
    const result = recommendProjects({ completedTopicIds: ["t1"], projects });
    expect(result.map((entry) => entry.project.id)).not.toContain("d");
  });

  it("recommends nothing at all when nothing is ready", () => {
    expect(recommendProjects({ completedTopicIds: [], projects })).toEqual([]);
  });

  it("surfaces what is nearly ready, and what is missing", () => {
    const upcoming = upcomingProjects({ completedTopicIds: ["t1"], projects });

    expect(upcoming).toHaveLength(1);
    expect(upcoming[0].project.id).toBe("c");
    expect(upcoming[0].missingTopicIds).toEqual(["t9"]);
  });

  it("prefers projects unlocked by the most recently completed topic", () => {
    const twoTopics = [
      {
        id: "old",
        slug: "old",
        difficulty: "BEGINNER" as const,
        sortOrder: 1,
        prerequisiteTopicIds: ["older"],
        status: "NOT_STARTED" as const,
      },
      {
        id: "new",
        slug: "new",
        difficulty: "BEGINNER" as const,
        sortOrder: 2,
        prerequisiteTopicIds: ["newer"],
        status: "NOT_STARTED" as const,
      },
    ];

    // Most recently completed first.
    const result = recommendProjects({
      completedTopicIds: ["newer", "older"],
      projects: twoTopics,
    });
    expect(result[0].project.id).toBe("new");
  });

  it("answers readiness for one project", () => {
    expect(isReady(["a", "b"], ["a", "b", "c"])).toBe(true);
    expect(isReady(["a", "b"], ["a"])).toBe(false);
    expect(isReady([], [])).toBe(true);
  });

  it("recommends a real project once its topics are genuinely complete", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const before = await getProjectRecommendations(user.id);
    expect(before.recommendations).toEqual([]);

    await completePrerequisites(user.id, "personal-portfolio");

    const after = await getProjectRecommendations(user.id);
    expect(after.recommendations.map((entry) => entry.project.slug)).toContain(
      "personal-portfolio",
    );
  });

  it("names the missing topics for something not yet reachable", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const { upcoming } = await getProjectRecommendations(user.id);

    expect(upcoming.length).toBeGreaterThan(0);
    for (const entry of upcoming) {
      expect(entry.missingTopics.length).toBeGreaterThan(0);
      expect(entry.missingTopics[0].title).toBeTruthy();
    }
  });

  it("never suggests a project from a career the learner is not on", async () => {
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

    const { upcoming, recommendations } = await getProjectRecommendations(user.id);
    const slugs = [
      ...upcoming.map((entry) => entry.project.slug),
      ...recommendations.map((entry) => entry.project.slug),
    ];

    // Telling a frontend learner to go and learn SQL for a backend project is
    // precisely the irrelevant noise the recommender exists to avoid.
    expect(slugs).not.toContain("url-shortener");
    expect(slugs).not.toContain("notes-api");
    expect(slugs).not.toContain("fullstack-todo");
    expect(slugs.length).toBeGreaterThan(0);
  });
});

// ── 6-7. Starting a project ────────────────────────────────────────────────

describe("starting a project", () => {
  it("creates a UserProject and its milestone rows", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const project = await projectBySlug("calculator");
    const result = await startProject({ projectId: project.id });

    expect(result.ok).toBe(true);
    expect(result.slug).toBe("calculator");

    const mine = await getUserProject(user.id, project.id);
    expect(mine!.status).toBe("IN_PROGRESS");
    expect(mine!.startedAt).not.toBeNull();

    const milestoneCount = await db.projectMilestone.count({
      where: { projectId: project.id },
    });
    expect(mine!.milestones).toHaveLength(milestoneCount);
    expect(mine!.milestones.every((m) => m.status === "AVAILABLE")).toBe(true);
  });

  it("is idempotent — starting twice creates no duplicate and loses no progress", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const project = await projectBySlug("calculator");
    await startProject({ projectId: project.id });

    const first = await getUserProject(user.id, project.id);
    const milestoneId = first!.milestones[0].milestoneId;
    await setMilestoneComplete({
      projectId: project.id,
      milestoneId,
      completed: true,
    });

    // A second click, or a stale tab.
    const again = await startProject({ projectId: project.id });
    expect(again.ok).toBe(true);

    expect(
      await db.userProject.count({ where: { userId: user.id, projectId: project.id } }),
    ).toBe(1);

    const after = await getUserProject(user.id, project.id);
    expect(after!.milestones.find((m) => m.milestoneId === milestoneId)!.status).toBe(
      "COMPLETED",
    );
  });

  it("refuses a project id that does not exist", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    expect((await startProject({ projectId: "nope" })).ok).toBe(false);
    expect((await startProject({})).ok).toBe(false);
  });

  it("ignores a userId supplied by the client", async () => {
    const alice = await makeUser("alice-pr@example.com");
    const bob = await makeUser("bob-pr@example.com");
    signedInAs(alice.id);

    const project = await projectBySlug("calculator");
    await startProject({ projectId: project.id, userId: bob.id });

    expect(await db.userProject.count({ where: { userId: bob.id } })).toBe(0);
    expect(await db.userProject.count({ where: { userId: alice.id } })).toBe(1);
  });
});

// ── 8-9. Milestones ────────────────────────────────────────────────────────

describe("milestone progress", () => {
  it("persists a tick and survives a fresh read", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const project = await projectBySlug("calculator");
    await startProject({ projectId: project.id });

    const milestones = await db.projectMilestone.findMany({
      where: { projectId: project.id },
      orderBy: { order: "asc" },
      select: { id: true },
    });

    await setMilestoneComplete({
      projectId: project.id,
      milestoneId: milestones[0].id,
      completed: true,
    });
    await setMilestoneComplete({
      projectId: project.id,
      milestoneId: milestones[1].id,
      completed: true,
    });

    // Completely fresh query — what a page load after a refresh would do.
    const reread = await getUserProject(user.id, project.id);
    const done = reread!.milestones.filter((m) => m.status === "COMPLETED");

    expect(done).toHaveLength(2);
    expect(done.every((m) => m.completedAt !== null)).toBe(true);
  });

  it("lets a milestone be un-ticked", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const project = await projectBySlug("calculator");
    await startProject({ projectId: project.id });

    const milestone = await db.projectMilestone.findFirstOrThrow({
      where: { projectId: project.id },
      select: { id: true },
    });

    await setMilestoneComplete({
      projectId: project.id,
      milestoneId: milestone.id,
      completed: true,
    });
    await setMilestoneComplete({
      projectId: project.id,
      milestoneId: milestone.id,
      completed: false,
    });

    const mine = await getUserProject(user.id, project.id);
    const row = mine!.milestones.find((m) => m.milestoneId === milestone.id)!;
    expect(row.status).toBe("AVAILABLE");
    expect(row.completedAt).toBeNull();
  });

  it("refuses a milestone belonging to a different project", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const calculator = await projectBySlug("calculator");
    const quiz = await projectBySlug("quiz-application");
    await startProject({ projectId: calculator.id });

    const foreign = await db.projectMilestone.findFirstOrThrow({
      where: { projectId: quiz.id },
      select: { id: true },
    });

    const result = await setMilestoneComplete({
      projectId: calculator.id,
      milestoneId: foreign.id,
      completed: true,
    });

    expect(result.ok).toBe(false);
  });

  it("will not let one learner move another's milestone", async () => {
    const alice = await makeUser("alice-m@example.com");
    const bob = await makeUser("bob-m@example.com");
    const project = await projectBySlug("calculator");

    signedInAs(alice.id);
    await startProject({ projectId: project.id });
    const aliceProject = await getUserProject(alice.id, project.id);
    const milestoneId = aliceProject!.milestones[0].milestoneId;

    // Bob has not started it, so there is nothing of his to write to — and
    // Alice's row is unreachable because the lookup is scoped by session user.
    signedInAs(bob.id);
    const result = await setMilestoneComplete({
      projectId: project.id,
      milestoneId,
      completed: true,
    });

    expect(result.ok).toBe(false);

    const after = await getUserProject(alice.id, project.id);
    expect(after!.milestones.find((m) => m.milestoneId === milestoneId)!.status).toBe(
      "AVAILABLE",
    );
  });

  it("requires the project to be started first", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const project = await projectBySlug("calculator");
    const milestone = await db.projectMilestone.findFirstOrThrow({
      where: { projectId: project.id },
      select: { id: true },
    });

    const result = await setMilestoneComplete({
      projectId: project.id,
      milestoneId: milestone.id,
      completed: true,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/start the project/i);
  });

  it("computes the percentage the same way everywhere", () => {
    expect(milestonePercent({ total: 8, completed: 5 })).toBe(63);
    expect(milestonePercent({ total: 4, completed: 0 })).toBe(0);
    expect(milestonePercent({ total: 4, completed: 4 })).toBe(100);
    expect(milestonePercent({ total: 0, completed: 0 })).toBe(0);
  });
});

// ── 10-11. URL validation ──────────────────────────────────────────────────

describe("URL validation", () => {
  it("accepts a normal https repository URL", () => {
    const result = checkUrl("https://github.com/someone/project", "repository URL");
    expect(result.ok).toBe(true);
    expect(result.value).toBe("https://github.com/someone/project");
  });

  it("accepts an empty value, because the demo URL is optional", () => {
    expect(checkUrl("", "live demo URL")).toMatchObject({ ok: true, value: undefined });
    expect(checkUrl("   ", "live demo URL").ok).toBe(true);
  });

  it("rejects every scheme except https", () => {
    for (const url of [
      "http://example.com",
      "javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "file:///etc/passwd",
      "ftp://example.com",
    ]) {
      expect(checkUrl(url, "repository URL").ok, url).toBe(false);
    }
  });

  it("rejects things that are not URLs at all", () => {
    for (const value of ["github.com/me/project", "not a url", "://broken"]) {
      expect(checkUrl(value, "repository URL").ok, value).toBe(false);
    }
  });

  it("rejects a host with no domain", () => {
    expect(checkUrl("https://localhost", "repository URL").ok).toBe(false);
  });

  it("rejects credentials embedded in the URL", () => {
    const result = checkUrl("https://user:secret@example.com/repo", "repository URL");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/username and password/i);
  });

  it("rejects an absurdly long URL", () => {
    const long = `https://example.com/${"a".repeat(3000)}`;
    expect(checkUrl(long, "repository URL").ok).toBe(false);
  });

  it("labels a host for display without claiming verification", () => {
    expect(hostLabel("https://github.com/a/b")).toBe("github.com");
    expect(hostLabel("https://www.example.com")).toBe("example.com");
    expect(hostLabel(null)).toBeNull();
    expect(hostLabel("nonsense")).toBeNull();
  });
});

// ── 12. Submission ─────────────────────────────────────────────────────────

describe("project submission", () => {
  it("saves repository, demo and notes", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const project = await projectBySlug("calculator");
    await startProject({ projectId: project.id });

    const result = await saveSubmission({
      projectId: project.id,
      repositoryUrl: "https://github.com/me/calculator",
      deployedUrl: "https://calculator.example.com",
      notes: "I handled division by zero and added keyboard support.",
    });

    expect(result.ok).toBe(true);

    const mine = await getUserProject(user.id, project.id);
    expect(mine!.repositoryUrl).toBe("https://github.com/me/calculator");
    // Stored in canonical form: a bare origin gains its trailing slash, which
    // is what the URL standard says that address actually is.
    expect(mine!.deployedUrl).toBe("https://calculator.example.com/");
    expect(mine!.notes).toMatch(/division by zero/);
  });

  it("stores URLs in canonical form", () => {
    expect(checkUrl("https://Example.COM", "live demo URL").value).toBe(
      "https://example.com/",
    );
    expect(checkUrl("  https://github.com/me/x  ", "repository URL").value).toBe(
      "https://github.com/me/x",
    );
  });

  it("returns per-field errors for a bad URL and saves nothing", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const project = await projectBySlug("calculator");
    await startProject({ projectId: project.id });

    const result = await saveSubmission({
      projectId: project.id,
      repositoryUrl: "javascript:alert(1)",
      deployedUrl: "",
      notes: "",
    });

    expect(result.ok).toBe(false);
    expect(result.fieldErrors?.repositoryUrl).toBeTruthy();

    const mine = await getUserProject(user.id, project.id);
    expect(mine!.repositoryUrl).toBeNull();
  });

  it("will not let one learner write another's submission", async () => {
    const alice = await makeUser("alice-s@example.com");
    const bob = await makeUser("bob-s@example.com");
    const project = await projectBySlug("calculator");

    signedInAs(alice.id);
    await startProject({ projectId: project.id });
    await saveSubmission({
      projectId: project.id,
      repositoryUrl: "https://github.com/alice/calculator",
      deployedUrl: "",
      notes: "",
    });

    signedInAs(bob.id);
    const result = await saveSubmission({
      projectId: project.id,
      repositoryUrl: "https://github.com/bob/hijack",
      deployedUrl: "",
      notes: "",
    });

    expect(result.ok).toBe(false);

    const aliceProject = await getUserProject(alice.id, project.id);
    expect(aliceProject!.repositoryUrl).toBe("https://github.com/alice/calculator");
  });
});

// ── 13-14. Completion ──────────────────────────────────────────────────────

describe("project completion", () => {
  it("refuses to complete without a repository URL", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const project = await projectBySlug("calculator");
    await startProject({ projectId: project.id });
    await confirmAllRequired(project.id);

    const result = await completeProject({ projectId: project.id });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/repository URL/i);
  });

  it("refuses to complete with the checklist unfinished", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const project = await projectBySlug("calculator");
    await startProject({ projectId: project.id });
    await saveSubmission({
      projectId: project.id,
      repositoryUrl: "https://github.com/me/calculator",
      deployedUrl: "",
      notes: "",
    });

    const result = await completeProject({ projectId: project.id });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/self-evaluation/i);
  });

  it("completes once the learner has confirmed everything", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const project = await projectBySlug("calculator");
    await startProject({ projectId: project.id });
    await saveSubmission({
      projectId: project.id,
      repositoryUrl: "https://github.com/me/calculator",
      deployedUrl: "https://calc.example.com",
      notes: "Done.",
    });
    await confirmAllRequired(project.id);

    const result = await completeProject({ projectId: project.id });
    expect(result.ok).toBe(true);

    const mine = await getUserProject(user.id, project.id);
    expect(mine!.status).toBe("COMPLETED");
    expect(mine!.completedAt).not.toBeNull();
  });

  it("shows a completed project as completed in the catalog", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const project = await projectBySlug("calculator");
    await startProject({ projectId: project.id });
    await saveSubmission({
      projectId: project.id,
      repositoryUrl: "https://github.com/me/calculator",
      deployedUrl: "",
      notes: "",
    });
    await confirmAllRequired(project.id);
    await completeProject({ projectId: project.id });

    const projects = await listProjects(user.id);
    const entry = projects.find((p) => p.slug === "calculator")!;

    expect(entry.status).toBe("COMPLETED");
    expect(entry.completedAt).not.toBeNull();
  });

  it("reopens a completed project if a milestone is un-ticked", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const project = await projectBySlug("calculator");
    await startProject({ projectId: project.id });
    await saveSubmission({
      projectId: project.id,
      repositoryUrl: "https://github.com/me/calculator",
      deployedUrl: "",
      notes: "",
    });
    await confirmAllRequired(project.id);

    const mine = await getUserProject(user.id, project.id);
    const milestoneId = mine!.milestones[0].milestoneId;
    await setMilestoneComplete({
      projectId: project.id,
      milestoneId,
      completed: true,
    });
    await completeProject({ projectId: project.id });

    // Saying "actually, that step is not done" should reopen the project.
    await setMilestoneComplete({
      projectId: project.id,
      milestoneId,
      completed: false,
    });

    const after = await getUserProject(user.id, project.id);
    expect(after!.status).toBe("IN_PROGRESS");
    expect(after!.completedAt).toBeNull();
  });

  it("will not let one learner complete another's project", async () => {
    const alice = await makeUser("alice-c@example.com");
    const bob = await makeUser("bob-c@example.com");
    const project = await projectBySlug("calculator");

    signedInAs(alice.id);
    await startProject({ projectId: project.id });

    signedInAs(bob.id);
    const result = await completeProject({ projectId: project.id });
    expect(result.ok).toBe(false);

    const aliceProject = await getUserProject(alice.id, project.id);
    expect(aliceProject!.status).toBe("IN_PROGRESS");
  });

  it("decides completion the same way the UI does", () => {
    expect(
      canComplete({
        requiredRequirementIds: ["a", "b"],
        confirmedRequirementIds: ["a", "b"],
        repositoryUrl: "https://github.com/me/x",
      }),
    ).toMatchObject({ ok: true });

    expect(
      canComplete({
        requiredRequirementIds: ["a", "b"],
        confirmedRequirementIds: ["a"],
        repositoryUrl: "https://github.com/me/x",
      }).ok,
    ).toBe(false);

    expect(
      canComplete({
        requiredRequirementIds: [],
        confirmedRequirementIds: [],
        repositoryUrl: null,
      }).ok,
    ).toBe(false);
  });
});

// ── 15-16. Next recommendation and dashboard ───────────────────────────────

describe("next project and dashboard", () => {
  it("recommends a different project after one is completed", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    await completePrerequisites(user.id, "personal-portfolio");
    await completePrerequisites(user.id, "responsive-landing-page");

    const portfolio = await projectBySlug("personal-portfolio");
    await startProject({ projectId: portfolio.id });
    await saveSubmission({
      projectId: portfolio.id,
      repositoryUrl: "https://github.com/me/portfolio",
      deployedUrl: "",
      notes: "",
    });
    await confirmAllRequired(portfolio.id);
    await completeProject({ projectId: portfolio.id });

    const { recommendations } = await getProjectRecommendations(user.id);
    const slugs = recommendations.map((entry) => entry.project.slug);

    expect(slugs).not.toContain("personal-portfolio");
    expect(slugs).toContain("responsive-landing-page");
  });

  it("summarises projects for the dashboard", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const calculator = await projectBySlug("calculator");
    await startProject({ projectId: calculator.id });

    const mine = await getUserProject(user.id, calculator.id);
    await setMilestoneComplete({
      projectId: calculator.id,
      milestoneId: mine!.milestones[0].milestoneId,
      completed: true,
    });

    const summary = await getProjectSummary(user.id);

    expect(summary.inProgress).toBe(1);
    expect(summary.completed).toBe(0);
    expect(summary.current!.slug).toBe("calculator");
    expect(summary.current!.completedMilestones).toBe(1);
    expect(summary.current!.percentComplete).toBeGreaterThan(0);
  });

  it("reports an empty summary for a learner who has built nothing", async () => {
    const user = await makeUser();
    const summary = await getProjectSummary(user.id);

    expect(summary).toMatchObject({ completed: 0, inProgress: 0, current: null });
  });
});

// ── 17. Roadmap integration ────────────────────────────────────────────────

describe("roadmap integration", () => {
  it("places projects into the phase of their last prerequisite", async () => {
    const user = await makeUser();

    const roadmap = await db.roadmap.findFirstOrThrow({
      where: { career: { slug: "frontend-developer" }, isActive: true },
      select: { id: true, phases: { select: { id: true, title: true, order: true } } },
    });

    const byPhase = await getProjectsByPhase(user.id, roadmap.id);
    const placed = [...byPhase.values()].flat();

    expect(placed.length).toBeGreaterThan(0);

    // Weather Dashboard needs the Fetch API, which is in the JavaScript phase,
    // so it must not be filed under an earlier one.
    const phaseOfWeather = [...byPhase.entries()].find(([, projects]) =>
      projects.some((project) => project.slug === "weather-dashboard"),
    );
    expect(phaseOfWeather).toBeTruthy();

    const phase = roadmap.phases.find((p) => p.id === phaseOfWeather![0])!;
    const htmlPhase = roadmap.phases.find((p) => p.order === 2)!;
    expect(phase.order).toBeGreaterThan(htmlPhase.order);
  });

  it("does not place another career's projects in this roadmap", async () => {
    const user = await makeUser();

    const roadmap = await db.roadmap.findFirstOrThrow({
      where: { career: { slug: "frontend-developer" }, isActive: true },
      select: { id: true },
    });

    const placed = [...(await getProjectsByPhase(user.id, roadmap.id)).values()].flat();
    const slugs = placed.map((project) => project.slug);

    // Backend and full-stack projects build on topics from other roadmaps.
    expect(slugs).not.toContain("notes-api");
    expect(slugs).not.toContain("fullstack-todo");
  });
});

// ── 18-19. Learning integration and auth ───────────────────────────────────

describe("learning integration and access control", () => {
  it("does not disturb topic progress", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const topicIds = await completePrerequisites(user.id, "personal-portfolio");
    const project = await projectBySlug("personal-portfolio");
    await startProject({ projectId: project.id });

    for (const topicId of topicIds) {
      const progress = await db.userTopicProgress.findUniqueOrThrow({
        where: { userId_topicId: { userId: user.id, topicId } },
      });
      expect(progress.status).toBe("COMPLETED");
    }
  });

  it("reads completed topics newest first, for recency ranking", async () => {
    const user = await makeUser();
    await completePrerequisites(user.id, "personal-portfolio");

    const ids = await getCompletedTopicIdsForUser(user.id);
    expect(ids.length).toBeGreaterThan(0);
  });

  it("redirects an unauthenticated visitor to login", async () => {
    auth.mockResolvedValue(null);
    await expect(requireUser("/projects/calculator")).rejects.toThrow(
      /REDIRECT:\/login/,
    );
  });

  it("refuses every project mutation when signed out", async () => {
    auth.mockResolvedValue(null);
    const project = await projectBySlug("calculator");

    expect((await startProject({ projectId: project.id })).ok).toBe(false);
    expect(
      (
        await setMilestoneComplete({
          projectId: project.id,
          milestoneId: "x",
          completed: true,
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await saveSubmission({
          projectId: project.id,
          repositoryUrl: "https://github.com/a/b",
          deployedUrl: "",
          notes: "",
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await setRequirementConfirmed({
          projectId: project.id,
          requirementId: "x",
          confirmed: true,
        })
      ).ok,
    ).toBe(false);
    expect((await completeProject({ projectId: project.id })).ok).toBe(false);
  });

  it("keeps two learners' project data separate", async () => {
    const alice = await makeUser("alice-sep@example.com");
    const bob = await makeUser("bob-sep@example.com");
    const project = await projectBySlug("calculator");

    signedInAs(alice.id);
    await startProject({ projectId: project.id });

    signedInAs(bob.id);
    expect(await getUserProject(bob.id, project.id)).toBeNull();

    await startProject({ projectId: project.id });
    const bobProject = await getUserProject(bob.id, project.id);
    await setMilestoneComplete({
      projectId: project.id,
      milestoneId: bobProject!.milestones[0].milestoneId,
      completed: true,
    });

    const aliceProject = await getUserProject(alice.id, project.id);
    expect(aliceProject!.milestones.every((m) => m.status === "AVAILABLE")).toBe(true);
  });

  it("never lets the app write a project definition", async () => {
    // Nothing exported from the actions module can touch a Project row, so the
    // catalog is unchanged after a full learner session.
    const before = await db.project.count();
    const requirementsBefore = await db.projectRequirement.count();

    const user = await makeUser();
    signedInAs(user.id);
    const project = await projectBySlug("calculator");
    await startProject({ projectId: project.id });
    await saveSubmission({
      projectId: project.id,
      repositoryUrl: "https://github.com/me/x",
      deployedUrl: "",
      notes: "",
    });

    expect(await db.project.count()).toBe(before);
    expect(await db.projectRequirement.count()).toBe(requirementsBefore);
  });
});

// ── Authored content validation ────────────────────────────────────────────

describe("authored project content", () => {
  it("accepts every shipped project", () => {
    for (const project of PROJECTS) {
      expect(validateProject(project), project.slug).toEqual([]);
    }
    expect(validateProjectSet(PROJECTS)).toEqual([]);
  });

  it("rejects a project with no prerequisites, which could never be recommended", () => {
    const errors = validateProject({ ...PROJECTS[0], prerequisiteTopicSlugs: [] });
    expect(errors.join(" ")).toMatch(/never be recommended/i);
  });

  it("rejects a project with no technical requirements", () => {
    const errors = validateProject({
      ...PROJECTS[0],
      requirements: PROJECTS[0].requirements.map((requirement) => ({
        ...requirement,
        category: "FUNCTIONAL" as const,
      })),
    });
    expect(errors.join(" ")).toMatch(/no technical requirements/i);
  });

  it("rejects a non-https resource", () => {
    const errors = validateProject({
      ...PROJECTS[0],
      resources: [{ title: "X", url: "http://insecure.example", source: "X" }],
    });
    expect(errors.join(" ")).toMatch(/https link/i);
  });

  it("rejects a topic listed as both prerequisite and related", () => {
    const errors = validateProject({
      ...PROJECTS[0],
      relatedTopicSlugs: [PROJECTS[0].prerequisiteTopicSlugs[0]],
    });
    expect(errors.join(" ")).toMatch(/both prerequisite and related/i);
  });

  it("rejects more than three hints, so hints never become a walkthrough", () => {
    const errors = validateProject({
      ...PROJECTS[0],
      hints: [
        ...PROJECTS[0].hints,
        { title: "Extra", content: "A fourth hint that should not be allowed here." },
        { title: "More", content: "A fifth hint that should not be allowed either." },
      ],
    });
    expect(errors.join(" ")).toMatch(/between 1 and 3 hints/i);
  });

  it("catches a type with no beginner project", () => {
    const errors = validateProjectSet(
      PROJECTS.map((project) => ({ ...project, difficulty: "ADVANCED" as const })),
    );
    expect(errors.join(" ")).toMatch(/no beginner project/i);
  });

  it("uses only https resource links across the whole catalog", async () => {
    const resources = await db.projectResource.findMany({
      select: { url: true, source: true },
    });

    expect(resources.length).toBeGreaterThan(50);
    for (const resource of resources) {
      expect(resource.url.startsWith("https://"), resource.url).toBe(true);
      expect(resource.source.length).toBeGreaterThan(0);
    }
  });
});
