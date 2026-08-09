import { beforeEach, describe, expect, it, vi } from "vitest";

// getCurrentUser reads the Auth.js session; the tests drive it directly.
const auth = vi.fn();
vi.mock("@/auth", () => ({ auth, signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { saveOnboardingAnswers, finishOnboarding } =
  await import("@/app/actions/onboarding");

/** The two-step flow the wizard performs: save answers, then confirm. */
async function completeOnboarding(input: unknown) {
  const saved = await saveOnboardingAnswers(input);
  if (!saved.ok) return saved;
  return finishOnboarding();
}
const { db } = await import("@/lib/db");

const ANSWERS = {
  experienceLevel: "NEW_TO_TECH",
  selectedCareer: "FRONTEND",
  dailyLearningTime: "MINUTES_30_60",
  selectedLanguage: "JAVASCRIPT_TYPESCRIPT",
} as const;

async function makeUser(email = "learner@example.com") {
  return db.user.create({
    data: {
      name: "Test Learner",
      email,
      passwordHash: "$2b$12$abcdefghijklmnopqrstuv",
      profile: { create: {} },
    },
    include: { profile: true },
  });
}

function signedInAs(id: string) {
  auth.mockResolvedValue({ user: { id } });
}

beforeEach(() => {
  auth.mockReset();
});

describe("onboarding submission", () => {
  it("persists every answer and marks onboarding complete", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const result = await completeOnboarding(ANSWERS);
    expect(result.ok).toBe(true);

    const profile = await db.profile.findUnique({ where: { userId: user.id } });

    expect(profile).toMatchObject({
      experienceLevel: "NEW_TO_TECH",
      selectedCareer: "FRONTEND",
      dailyLearningTime: "MINUTES_30_60",
      selectedLanguage: "JAVASCRIPT_TYPESCRIPT",
      onboardingCompleted: true,
    });
  });

  it("survives a re-read from the database", async () => {
    const user = await makeUser();
    signedInAs(user.id);
    await completeOnboarding(ANSWERS);

    // Fresh query, no cached objects — this is what /dashboard renders from.
    const reread = await db.user.findUnique({
      where: { id: user.id },
      select: { profile: true },
    });

    expect(reread!.profile!.onboardingCompleted).toBe(true);
    expect(reread!.profile!.selectedCareer).toBe("FRONTEND");
  });

  it("stores 'not sure' answers rather than forcing a choice", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const result = await completeOnboarding({
      ...ANSWERS,
      selectedCareer: "NOT_SURE",
      selectedLanguage: "NOT_SURE",
    });

    expect(result.ok).toBe(true);

    const profile = await db.profile.findUnique({ where: { userId: user.id } });
    expect(profile!.selectedCareer).toBe("NOT_SURE");
    expect(profile!.selectedLanguage).toBe("NOT_SURE");
    expect(profile!.onboardingCompleted).toBe(true);
  });

  it("rejects an unauthenticated submission", async () => {
    auth.mockResolvedValue(null);

    const result = await completeOnboarding(ANSWERS);

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/session/i);
    expect(await db.profile.count({ where: { onboardingCompleted: true } })).toBe(0);
  });

  it("rejects a value that is not in the database enum", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const result = await completeOnboarding({
      ...ANSWERS,
      selectedCareer: "PROFESSIONAL_WIZARD",
    });

    expect(result.ok).toBe(false);

    const profile = await db.profile.findUnique({ where: { userId: user.id } });
    expect(profile!.onboardingCompleted).toBe(false);
  });

  it("rejects an incomplete submission", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const result = await completeOnboarding({ experienceLevel: "NEW_TO_TECH" });

    expect(result.ok).toBe(false);

    const profile = await db.profile.findUnique({ where: { userId: user.id } });
    expect(profile!.onboardingCompleted).toBe(false);
  });

  it("does not let one user write another user's profile", async () => {
    const alice = await makeUser("alice@example.com");
    const bob = await makeUser("bob@example.com");

    signedInAs(alice.id);
    await completeOnboarding(ANSWERS);

    const bobProfile = await db.profile.findUnique({ where: { userId: bob.id } });
    expect(bobProfile!.onboardingCompleted).toBe(false);
  });
});

/**
 * Saving and completing are separate steps so the "You're all set" screen
 * actually gets shown. If saving also completed the profile, the server
 * action's re-render of /onboarding would hit the page guard and redirect
 * straight to /dashboard, skipping that screen for every user.
 */
describe("two-step completion", () => {
  it("saves the answers without marking onboarding complete", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const result = await saveOnboardingAnswers(ANSWERS);
    expect(result.ok).toBe(true);

    const profile = await db.profile.findUnique({ where: { userId: user.id } });

    // Answers are safe…
    expect(profile!.selectedCareer).toBe("FRONTEND");
    // …but the guard must not fire yet, or the success screen is skipped.
    expect(profile!.onboardingCompleted).toBe(false);
  });

  it("completes only once the user confirms", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    await saveOnboardingAnswers(ANSWERS);
    const result = await finishOnboarding();

    expect(result.ok).toBe(true);

    const profile = await db.profile.findUnique({ where: { userId: user.id } });
    expect(profile!.onboardingCompleted).toBe(true);
  });

  it("refuses to complete when answers are missing", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    // Straight to confirmation without ever saving answers.
    const result = await finishOnboarding();

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/missing/i);

    const profile = await db.profile.findUnique({ where: { userId: user.id } });
    expect(profile!.onboardingCompleted).toBe(false);
  });

  it("refuses to complete for an unauthenticated caller", async () => {
    auth.mockResolvedValue(null);
    expect((await finishOnboarding()).ok).toBe(false);
  });
});
