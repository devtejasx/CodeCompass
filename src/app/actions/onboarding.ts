"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { onboardingSchema } from "@/lib/validation/onboarding";

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
