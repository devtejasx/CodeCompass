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
 * Persists the four onboarding answers and marks onboarding complete.
 *
 * Answers arrive as a plain object from the client wizard, but nothing is
 * trusted: the session is re-read server-side and every value is re-parsed
 * against the database enums.
 */
export async function completeOnboarding(input: unknown): Promise<OnboardingResult> {
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
      create: { userId: user.id, ...parsed.data, onboardingCompleted: true },
      update: { ...parsed.data, onboardingCompleted: true },
    });
  } catch {
    console.error("[completeOnboarding] failed to persist profile");
    return {
      ok: false,
      error: "We couldn't save your answers. Please try again in a moment.",
    };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
