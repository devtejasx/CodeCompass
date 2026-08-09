import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.fn();
vi.mock("@/auth", () => ({ auth, signIn: vi.fn(), signOut: vi.fn() }));

/**
 * next/navigation's redirect() throws to unwind rendering. The stub throws a
 * tagged error so tests can assert both *that* a redirect happened and where
 * it went.
 */
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

const { getCurrentUser, requireUser, requireOnboardedUser } =
  await import("@/lib/session");
const { db } = await import("@/lib/db");

async function makeUser(onboardingCompleted: boolean) {
  return db.user.create({
    data: {
      name: "Test Learner",
      email: `user-${Math.random().toString(36).slice(2)}@example.com`,
      passwordHash: "$2b$12$abcdefghijklmnopqrstuv",
      profile: { create: { onboardingCompleted } },
    },
  });
}

async function expectRedirect(fn: () => Promise<unknown>, target: string) {
  await expect(fn()).rejects.toThrow(RedirectError);
  await fn().catch((error: unknown) => {
    expect((error as RedirectError).target).toBe(target);
  });
}

beforeEach(() => {
  auth.mockReset();
});

describe("protected routes", () => {
  it("sends an unauthenticated visitor to /login", async () => {
    auth.mockResolvedValue(null);
    await expectRedirect(() => requireUser(), "/login");
  });

  it("preserves where they were heading", async () => {
    auth.mockResolvedValue(null);
    await expectRedirect(
      () => requireUser("/dashboard"),
      "/login?callbackUrl=%2Fdashboard",
    );
  });

  it("treats a session whose user no longer exists as signed out", async () => {
    auth.mockResolvedValue({ user: { id: "deleted-user-id" } });

    expect(await getCurrentUser()).toBeNull();
    await expectRedirect(() => requireUser(), "/login");
  });
});

describe("onboarding gate", () => {
  it("sends an authenticated user with incomplete onboarding to /onboarding", async () => {
    const user = await makeUser(false);
    auth.mockResolvedValue({ user: { id: user.id } });

    await expectRedirect(() => requireOnboardedUser(), "/onboarding");
  });

  it("lets a user with completed onboarding through to the dashboard", async () => {
    const user = await makeUser(true);
    auth.mockResolvedValue({ user: { id: user.id } });

    const result = await requireOnboardedUser();

    expect(result.id).toBe(user.id);
    expect(result.onboardingCompleted).toBe(true);
  });

  it("reads completion from the database, not from the session token", async () => {
    const user = await makeUser(false);
    auth.mockResolvedValue({ user: { id: user.id } });

    expect((await getCurrentUser())!.onboardingCompleted).toBe(false);

    // Simulates onboarding finishing without the JWT being reissued.
    await db.profile.update({
      where: { userId: user.id },
      data: { onboardingCompleted: true },
    });

    expect((await getCurrentUser())!.onboardingCompleted).toBe(true);
    await expect(requireOnboardedUser()).resolves.toMatchObject({ id: user.id });
  });

  it("never exposes the password hash to callers", async () => {
    const user = await makeUser(true);
    auth.mockResolvedValue({ user: { id: user.id } });

    expect(await getCurrentUser()).not.toHaveProperty("passwordHash");
  });
});
