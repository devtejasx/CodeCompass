import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Guards for the optimization pass.
 *
 * Performance work is only safe if it cannot quietly change an answer, and two
 * of these changes could have: the dashboard now counts capabilities through a
 * leaner path than the profile page uses, and several reads are memoised for
 * the duration of a request. Both are correct only as long as they agree with
 * what they replaced, which is what these tests pin down.
 *
 * They are behavioural, not benchmarks. Nothing here asserts a duration —
 * timings belong in a profiler, not in a suite that has to pass on every
 * machine. What they assert is that the faster path returns the same answer,
 * and that memoisation is scoped to a request rather than outliving one.
 */

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

const { getCapabilities, countEarnedCapabilities } = await import(
  "@/lib/profile/capabilities"
);
const { getLearnerState } = await import("@/lib/personalization/state");
const { db } = await import("@/lib/db");

// ── Helpers ────────────────────────────────────────────────────────────────

async function makeUser(email = "perf@example.com") {
  return db.user.create({
    data: {
      name: "Perf Learner",
      email,
      passwordHash: "$2b$12$abcdefghijklmnopqrstuv",
      profile: { create: { onboardingCompleted: true } },
    },
  });
}

async function chooseCareer(userId: string, slug: string) {
  const career = await db.career.findUniqueOrThrow({
    where: { slug },
    select: { id: true },
  });
  await db.profile.update({ where: { userId }, data: { selectedCareerId: career.id } });
  return career.id;
}

/** Completes every topic behind the given capability slugs. */
async function completeCapabilitySources(userId: string, capabilitySlugs: string[]) {
  const sources = await db.capabilitySource.findMany({
    where: { capability: { slug: { in: capabilitySlugs } }, kind: "TOPIC" },
    select: { ref: true },
  });

  for (const source of sources) {
    const topic = await db.topic.findUnique({
      where: { slug: source.ref },
      select: { id: true },
    });
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

beforeEach(() => {
  auth.mockReset();
});

// ── The dashboard's capability count ───────────────────────────────────────

describe("countEarnedCapabilities", () => {
  /**
   * The dashboard renders one number where it used to load every capability's
   * name, description and longDescription and count the ones with a level. The
   * lean path shares `loadProgress`, `countEvidence` and `calculateLevel` with
   * the full one precisely so the two cannot drift — this is the test that says
   * so out loud.
   */
  it("agrees with getCapabilities for a learner with no progress", async () => {
    const user = await makeUser();

    const [full, count] = await Promise.all([
      getCapabilities(user.id),
      countEarnedCapabilities(user.id),
    ]);

    expect(count.total).toBe(full.length);
    expect(count.earned).toBe(full.filter((entry) => entry.level !== null).length);
  });

  it("agrees with getCapabilities once real work has been done", async () => {
    const user = await makeUser();
    await chooseCareer(user.id, "frontend-developer");

    // Enough capabilities to make the two paths disagree if either were wrong.
    await completeCapabilitySources(user.id, [
      "html-css",
      "how-the-web-works",
      "dom-and-events",
      "javascript",
    ]);

    const full = await getCapabilities(user.id);
    const count = await countEarnedCapabilities(user.id);

    const earned = full.filter((entry) => entry.level !== null);

    expect(count.total).toBe(full.length);
    expect(count.earned).toBe(earned.length);
    // The scenario is only meaningful if something was actually earned.
    expect(count.earned).toBeGreaterThan(0);
  });

  it("counts every capability, including the ones not yet reached", async () => {
    const user = await makeUser();

    const count = await countEarnedCapabilities(user.id);
    const total = await db.capability.count();

    expect(count.total).toBe(total);
    expect(count.earned).toBeLessThanOrEqual(count.total);
  });
});

// ── Request-scoped memoisation ─────────────────────────────────────────────

describe("request-scoped memoisation", () => {
  /**
   * `getLearnerState` is wrapped in React's `cache`, which is per-request. The
   * point of the wrapper is that two callers in one render share a read; the
   * point of *this* test is the other half — that it never becomes a cache
   * across requests, because the whole design of the personalization engine
   * rests on "finishing a lesson changes the answer on the next read".
   *
   * Outside a React request scope, `cache` degrades to calling straight
   * through, so consecutive calls here are genuinely independent reads and a
   * change made between them must be visible.
   */
  it("does not carry a learner's state across separate reads", async () => {
    const user = await makeUser();
    await chooseCareer(user.id, "frontend-developer");

    const before = await getLearnerState(user.id);
    expect(before.completedTopicIds).toHaveLength(0);

    await completeCapabilitySources(user.id, ["html-css"]);

    const after = await getLearnerState(user.id);
    expect(after.completedTopicIds.length).toBeGreaterThan(0);
  });

  it("reflects a career change immediately", async () => {
    const user = await makeUser();
    await chooseCareer(user.id, "frontend-developer");

    const first = await getLearnerState(user.id);
    expect(first.career?.slug).toBe("frontend-developer");

    await chooseCareer(user.id, "backend-developer");

    const second = await getLearnerState(user.id);
    expect(second.career?.slug).toBe("backend-developer");
  });
});

// ── The learner state's payload ────────────────────────────────────────────

describe("learner state career", () => {
  /**
   * The dashboard and the profile both render the career's icon beside its
   * name, and both used to issue a second `career.findUnique` to get it. The
   * icon now travels with the state; if it stopped, those pages would render no
   * icon rather than fail, which is exactly the kind of silent regression worth
   * a test.
   */
  it("carries the icon so pages need no second career query", async () => {
    const user = await makeUser();
    const careerId = await chooseCareer(user.id, "frontend-developer");

    const state = await getLearnerState(user.id);
    const career = await db.career.findUniqueOrThrow({
      where: { id: careerId },
      select: { icon: true, name: true, slug: true },
    });

    expect(state.career).not.toBeNull();
    expect(state.career?.icon).toBe(career.icon);
    expect(state.career?.name).toBe(career.name);
    expect(state.career?.slug).toBe(career.slug);
  });

  it("is null, rather than a default, for a learner with no career", async () => {
    const user = await makeUser();

    const state = await getLearnerState(user.id);

    expect(state.career).toBeNull();
  });
});
