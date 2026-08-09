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

const { getActiveRoadmapForCareer, careerHasRoadmap } =
  await import("@/lib/roadmap/queries");
const { derivePhaseStates, summariseProgress } = await import("@/lib/roadmap/progress");
const { requireOnboardedUser } = await import("@/lib/session");
const { selectCareer } = await import("@/app/actions/career");
const { db } = await import("@/lib/db");
const { validateRoadmap } = await import("../prisma/seed/roadmaps/validate");
const { ROADMAPS } = await import("../prisma/seed/roadmaps");

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

async function careerBySlug(slug: string) {
  return db.career.findUniqueOrThrow({ where: { slug } });
}

beforeEach(() => {
  auth.mockReset();
});

describe("roadmap loading", () => {
  it("loads the active roadmap for a career", async () => {
    const career = await careerBySlug("frontend-developer");
    const roadmap = await getActiveRoadmapForCareer(career.id);

    expect(roadmap).not.toBeNull();
    expect(roadmap!.career.id).toBe(career.id);
    expect(roadmap!.title).toBe("Frontend Developer Roadmap");
    expect(roadmap!.version).toBe(1);
    expect(roadmap!.phases.length).toBeGreaterThan(5);
  });

  it("ships a roadmap for each of the three Phase 4 careers", async () => {
    for (const slug of [
      "frontend-developer",
      "backend-developer",
      "full-stack-developer",
    ]) {
      const career = await careerBySlug(slug);
      expect(await careerHasRoadmap(career.id)).toBe(true);
    }
  });

  it("returns null for a career with no roadmap yet, rather than throwing", async () => {
    // 20 careers exist; only three have roadmaps in Phase 4.
    const career = await careerBySlug("game-developer");

    expect(await getActiveRoadmapForCareer(career.id)).toBeNull();
    expect(await careerHasRoadmap(career.id)).toBe(false);
  });

  it("never returns another career's roadmap", async () => {
    const frontend = await careerBySlug("frontend-developer");
    const backend = await careerBySlug("backend-developer");

    const frontendRoadmap = await getActiveRoadmapForCareer(frontend.id);
    const backendRoadmap = await getActiveRoadmapForCareer(backend.id);

    expect(frontendRoadmap!.career.slug).toBe("frontend-developer");
    expect(backendRoadmap!.career.slug).toBe("backend-developer");
    expect(frontendRoadmap!.id).not.toBe(backendRoadmap!.id);
  });
});

describe("ordering", () => {
  it("returns phases in ascending order with no gaps", async () => {
    const career = await careerBySlug("frontend-developer");
    const roadmap = await getActiveRoadmapForCareer(career.id);

    const orders = roadmap!.phases.map((phase) => phase.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    // 1-based and contiguous — the numbering the UI renders.
    expect(orders).toEqual(orders.map((_, index) => index + 1));
  });

  it("returns topics in ascending order within every phase", async () => {
    const career = await careerBySlug("backend-developer");
    const roadmap = await getActiveRoadmapForCareer(career.id);

    for (const phase of roadmap!.phases) {
      const orders = phase.topics.map((topic) => topic.order);
      expect(orders).toEqual(orders.map((_, index) => index + 1));
    }
  });

  it("starts the frontend roadmap with fundamentals, not a framework", async () => {
    const career = await careerBySlug("frontend-developer");
    const roadmap = await getActiveRoadmapForCareer(career.id);

    const titles = roadmap!.phases.map((phase) => phase.title);

    expect(titles[0]).toMatch(/fundamentals/i);
    // The ordering claim the product makes: CSS before JavaScript.
    expect(titles.findIndex((t) => /CSS/.test(t))).toBeLessThan(
      titles.findIndex((t) => /^JavaScript/.test(t)),
    );
    // …and React only after JavaScript.
    expect(titles.findIndex((t) => /^JavaScript/.test(t))).toBeLessThan(
      titles.findIndex((t) => /React/.test(t)),
    );
  });

  it("puts databases before APIs in the backend roadmap", async () => {
    const career = await careerBySlug("backend-developer");
    const roadmap = await getActiveRoadmapForCareer(career.id);
    const titles = roadmap!.phases.map((phase) => phase.title);

    expect(titles.findIndex((t) => /Databases/.test(t))).toBeLessThan(
      titles.findIndex((t) => /APIs/.test(t)),
    );
  });

  it("gives every phase an explanation of why it comes next", async () => {
    for (const slug of [
      "frontend-developer",
      "backend-developer",
      "full-stack-developer",
    ]) {
      const career = await careerBySlug(slug);
      const roadmap = await getActiveRoadmapForCareer(career.id);

      for (const phase of roadmap!.phases) {
        expect(phase.whyThisComesNext.length).toBeGreaterThan(40);
      }
    }
  });
});

describe("prerequisites", () => {
  it("loads prerequisites with resolvable titles", async () => {
    const career = await careerBySlug("frontend-developer");
    const roadmap = await getActiveRoadmapForCareer(career.id);

    const topics = roadmap!.phases.flatMap((phase) => phase.topics);
    const dom = topics.find((topic) => topic.slug === "js-dom");

    expect(dom).toBeDefined();
    expect(dom!.prerequisites.length).toBeGreaterThan(0);
    expect(dom!.prerequisites.map((p) => p.prerequisite.slug)).toContain("js-objects");
    for (const { prerequisite } of dom!.prerequisites) {
      expect(prerequisite.title.length).toBeGreaterThan(0);
    }
  });

  it("only ever points at topics inside the same roadmap", async () => {
    for (const slug of [
      "frontend-developer",
      "backend-developer",
      "full-stack-developer",
    ]) {
      const career = await careerBySlug(slug);
      const roadmap = await getActiveRoadmapForCareer(career.id);

      const ids = new Set(
        roadmap!.phases.flatMap((phase) => phase.topics.map((topic) => topic.id)),
      );

      for (const phase of roadmap!.phases) {
        for (const topic of phase.topics) {
          for (const { prerequisite } of topic.prerequisites) {
            expect(ids.has(prerequisite.id)).toBe(true);
          }
        }
      }
    }
  });

  it("never requires a topic that appears later in the roadmap", async () => {
    const career = await careerBySlug("full-stack-developer");
    const roadmap = await getActiveRoadmapForCareer(career.id);

    // Flattened position of every topic, in the order a learner meets them.
    const position = new Map<string, number>();
    let cursor = 0;
    for (const phase of roadmap!.phases) {
      for (const topic of phase.topics) position.set(topic.id, cursor++);
    }

    for (const phase of roadmap!.phases) {
      for (const topic of phase.topics) {
        for (const { prerequisite } of topic.prerequisites) {
          expect(position.get(prerequisite.id)!).toBeLessThan(position.get(topic.id)!);
        }
      }
    }
  });
});

describe("authored content validation", () => {
  it("accepts every shipped roadmap", () => {
    for (const roadmap of ROADMAPS) {
      expect(validateRoadmap(roadmap)).toEqual([]);
    }
  });

  it("rejects a prerequisite that does not exist", () => {
    const errors = validateRoadmap({
      careerSlug: "frontend-developer",
      title: "T",
      description: "D",
      estimatedDuration: "1 month",
      phases: [
        {
          title: "P",
          description: "D",
          estimatedDuration: "1 week",
          whyThisComesNext: "Because it does.",
          topics: [
            {
              slug: "a",
              title: "A",
              description: "D",
              difficulty: "BEGINNER",
              estimatedTime: "1 hour",
              prerequisites: ["does-not-exist"],
            },
          ],
        },
      ],
    });

    expect(errors.join(" ")).toMatch(/not in this roadmap/i);
  });

  it("rejects a prerequisite that comes later", () => {
    const errors = validateRoadmap({
      careerSlug: "frontend-developer",
      title: "T",
      description: "D",
      estimatedDuration: "1 month",
      phases: [
        {
          title: "P",
          description: "D",
          estimatedDuration: "1 week",
          whyThisComesNext: "Because it does.",
          topics: [
            {
              slug: "first",
              title: "First",
              description: "D",
              difficulty: "BEGINNER",
              estimatedTime: "1 hour",
              prerequisites: ["second"],
            },
            {
              slug: "second",
              title: "Second",
              description: "D",
              difficulty: "BEGINNER",
              estimatedTime: "1 hour",
            },
          ],
        },
      ],
    });

    expect(errors.join(" ")).toMatch(/comes later/i);
  });

  it("rejects duplicate topic slugs and empty phases", () => {
    const errors = validateRoadmap({
      careerSlug: "frontend-developer",
      title: "T",
      description: "D",
      estimatedDuration: "1 month",
      phases: [
        {
          title: "P",
          description: "D",
          estimatedDuration: "1 week",
          whyThisComesNext: "Because it does.",
          topics: [
            {
              slug: "dup",
              title: "A",
              description: "D",
              difficulty: "BEGINNER",
              estimatedTime: "1h",
            },
            {
              slug: "dup",
              title: "B",
              description: "D",
              difficulty: "BEGINNER",
              estimatedTime: "1h",
            },
          ],
        },
        {
          title: "Empty",
          description: "D",
          estimatedDuration: "1 week",
          whyThisComesNext: "Because it does.",
          topics: [],
        },
      ],
    });

    expect(errors.join(" ")).toMatch(/duplicate topic slug/i);
    expect(errors.join(" ")).toMatch(/has no topics/i);
  });

  it("requires an explanation for every phase", () => {
    const errors = validateRoadmap({
      careerSlug: "frontend-developer",
      title: "T",
      description: "D",
      estimatedDuration: "1 month",
      phases: [
        {
          title: "P",
          description: "D",
          estimatedDuration: "1 week",
          whyThisComesNext: "",
          topics: [
            {
              slug: "a",
              title: "A",
              description: "D",
              difficulty: "BEGINNER",
              estimatedTime: "1h",
            },
          ],
        },
      ],
    });

    expect(errors.join(" ")).toMatch(/whyThisComesNext/);
  });
});

describe("phase state", () => {
  it("opens the first phase and locks the rest when nothing is completed", async () => {
    const career = await careerBySlug("frontend-developer");
    const roadmap = await getActiveRoadmapForCareer(career.id);

    const states = derivePhaseStates(roadmap!.phases);

    expect(states.get(roadmap!.phases[0].id)!.state).toBe("AVAILABLE");
    for (const phase of roadmap!.phases.slice(1)) {
      expect(states.get(phase.id)!.state).toBe("LOCKED");
    }
  });

  it("carries a text label alongside the state, never colour alone", async () => {
    const career = await careerBySlug("frontend-developer");
    const roadmap = await getActiveRoadmapForCareer(career.id);

    for (const status of derivePhaseStates(roadmap!.phases).values()) {
      expect(status.label.length).toBeGreaterThan(0);
    }
  });

  it("reports zero progress, because none is recorded yet", async () => {
    const career = await careerBySlug("frontend-developer");
    const roadmap = await getActiveRoadmapForCareer(career.id);

    const progress = summariseProgress(roadmap!);

    expect(progress.percentComplete).toBe(0);
    expect(progress.completedPhases).toBe(0);
    expect(progress.totalPhases).toBe(roadmap!.phases.length);
    expect(progress.currentPhaseTitle).toBe(roadmap!.phases[0].title);
    expect(progress.upcomingPhaseTitles[0]).toBe(roadmap!.phases[1].title);
  });

  it("is ready for Phase 5 progress without changing its consumers", async () => {
    const career = await careerBySlug("frontend-developer");
    const roadmap = await getActiveRoadmapForCareer(career.id);

    // Same function, with completion data the next phase will supply.
    const states = derivePhaseStates(roadmap!.phases, [1, 2]);

    expect(states.get(roadmap!.phases[0].id)!.state).toBe("COMPLETED");
    expect(states.get(roadmap!.phases[1].id)!.state).toBe("COMPLETED");
    expect(states.get(roadmap!.phases[2].id)!.state).toBe("CURRENT");
    expect(states.get(roadmap!.phases[3].id)!.state).toBe("LOCKED");

    const progress = summariseProgress(roadmap!, [1, 2]);
    expect(progress.completedPhases).toBe(2);
    expect(progress.percentComplete).toBeGreaterThan(0);
  });
});

describe("access control", () => {
  it("redirects an unauthenticated visitor to login", async () => {
    auth.mockResolvedValue(null);
    await expect(requireOnboardedUser()).rejects.toThrow(RedirectError);
  });

  it("redirects a user who hasn't finished onboarding", async () => {
    const user = await db.user.create({
      data: {
        name: "Half Way",
        email: "halfway@example.com",
        passwordHash: "$2b$12$abcdefghijklmnopqrstuv",
        profile: { create: { onboardingCompleted: false } },
      },
    });
    signedInAs(user.id);

    await expect(requireOnboardedUser()).rejects.toThrow(/REDIRECT:\/onboarding/);
  });

  it("lets an onboarded user through", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    await expect(requireOnboardedUser()).resolves.toMatchObject({ id: user.id });
  });

  it("leaves a user with no chosen career without a roadmap to load", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { selectedCareerId: true },
    });

    // The page redirects to /careers on exactly this condition.
    expect(profile!.selectedCareerId).toBeNull();
  });
});

describe("career change", () => {
  it("switches which roadmap the user sees", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const frontend = await careerBySlug("frontend-developer");
    const backend = await careerBySlug("backend-developer");

    await selectCareer({ careerId: frontend.id });
    let profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { selectedCareerId: true },
    });
    let roadmap = await getActiveRoadmapForCareer(profile!.selectedCareerId!);
    expect(roadmap!.career.slug).toBe("frontend-developer");

    await selectCareer({ careerId: backend.id });
    profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { selectedCareerId: true },
    });
    roadmap = await getActiveRoadmapForCareer(profile!.selectedCareerId!);
    expect(roadmap!.career.slug).toBe("backend-developer");
  });

  it("does not delete roadmap content when a user changes career", async () => {
    const before = await db.roadmap.count();

    const user = await makeUser();
    signedInAs(user.id);
    const frontend = await careerBySlug("frontend-developer");
    const backend = await careerBySlug("backend-developer");
    await selectCareer({ careerId: frontend.id });
    await selectCareer({ careerId: backend.id });

    expect(await db.roadmap.count()).toBe(before);
  });
});
