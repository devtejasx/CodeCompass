"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export interface CareerSelectionResult {
  ok: boolean;
  error?: string;
}

const selectSchema = z.object({
  careerId: z.string().min(1, "Choose a career."),
});

/**
 * Records the career a user has committed to.
 *
 * The user is taken from the session, never from the request body — a client
 * cannot name whose profile to update. The careerId is checked against the
 * database so an arbitrary string can't be written into the relation.
 */
export async function selectCareer(input: unknown): Promise<CareerSelectionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      error: "You need to be signed in to choose a path.",
    };
  }

  const parsed = selectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That career could not be found. Please try again." };
  }

  try {
    const career = await db.career.findUnique({
      where: { id: parsed.data.careerId },
      select: { id: true },
    });

    if (!career) {
      return { ok: false, error: "That career could not be found. Please try again." };
    }

    await db.profile.update({
      where: { userId: user.id },
      data: { selectedCareerId: career.id },
    });
  } catch {
    console.error("[selectCareer] failed to persist career selection");
    return {
      ok: false,
      error: "We couldn't save your choice. Please try again in a moment.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/careers");
  return { ok: true };
}

/**
 * Clears the chosen path. "I'm not sure yet" has to be reversible, otherwise
 * the first click becomes a commitment the product promised it wasn't.
 */
export async function clearSelectedCareer(): Promise<CareerSelectionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You need to be signed in to change your path." };
  }

  try {
    await db.profile.update({
      where: { userId: user.id },
      data: { selectedCareerId: null },
    });
  } catch {
    console.error("[clearSelectedCareer] failed to clear career selection");
    return {
      ok: false,
      error: "We couldn't update your choice. Please try again in a moment.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/careers");
  return { ok: true };
}
