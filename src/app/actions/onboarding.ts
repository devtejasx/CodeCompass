"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { onboardingSchema, partialOnboardingSchema } from "@/lib/validation/onboarding";

export interface OnboardingResult {
  ok: boolean;
  error?: string;
}

/**
 * Onboarding completes in two steps, and the split is deliberate.
 *
 * A server action re-renders the route it was called from. If the final answer
 * also set onboardingCompleted, that re-render would hit the /onboarding page
 * guard, see a completed profile, and redirect straight to /dashboard — the
 * "You're all set" screen would never be shown to anyone.
 *
 * So the answers are saved first (nothing is lost if the user wanders off) and
 * the profile is only marked complete when they actually click through.
 */

/**
 * Persists whatever has been answered so far. Does NOT mark onboarding
 * complete, and never fails loudly.
 *
 * Called as the learner moves between steps, so closing the tab at question
 * three does not discard questions one and two. It is a convenience, not the
 * commit — `saveOnboardingAnswers` still writes the full set at the end, so a
 * dropped partial save costs nothing but the re-answering it was meant to
 * prevent. That is why the result is deliberately ignored by the caller.
 */
export async function saveOnboardingProgress(
  input: unknown,
): Promise<OnboardingResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session has expired." };

  const parsed = partialOnboardingSchema.safeParse(input);
  // Each field is checked against the same enum as the final submission, so an
  // early save can never smuggle in a value the last step would have refused.
  if (!parsed.success) return { ok: false, error: "That answer could not be read." };

  const answers = Object.fromEntries(
    Object.entries(parsed.data).filter(([, value]) => value !== undefined),
  );
  if (Object.keys(answers).length === 0) return { ok: true };

  try {
    await db.profile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...answers },
      update: answers,
    });
  } catch {
    console.error("[saveOnboardingProgress] failed to persist partial answers");
    return { ok: false, error: "We couldn't save that just yet." };
  }

  return { ok: true };
}

/** Persists the four answers. Does NOT mark onboarding complete. */
export async function saveOnboardingAnswers(input: unknown): Promise<OnboardingResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }

  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Some answers were missing or invalid. Please review your choices.",
    };
  }

  try {
    await db.profile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...parsed.data },
      update: parsed.data,
    });
  } catch {
    console.error("[saveOnboardingAnswers] failed to persist profile");
    return {
      ok: false,
      error: "We couldn't save your answers. Please try again in a moment.",
    };
  }

  return { ok: true };
}

/**
 * Marks onboarding complete. Refuses if the answers aren't all there, so the
 * flag can never claim more than the profile actually holds.
 */
export async function finishOnboarding(): Promise<OnboardingResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }

  try {
    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: {
        experienceLevel: true,
        selectedCareer: true,
        dailyLearningTime: true,
        selectedLanguage: true,
      },
    });

    if (!profile || !onboardingSchema.safeParse(profile).success) {
      return {
        ok: false,
        error: "Some answers are still missing. Please complete every step.",
      };
    }

    await db.profile.update({
      where: { userId: user.id },
      data: { onboardingCompleted: true },
    });
  } catch {
    console.error("[finishOnboarding] failed to complete onboarding");
    return {
      ok: false,
      error: "We couldn't finish setting up your account. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
