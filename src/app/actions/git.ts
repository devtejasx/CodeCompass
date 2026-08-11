"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { findExercise } from "@/lib/git/exercises";

/**
 * Git exercise progress.
 *
 * Completion is decided on the server by re-running the exercise's own
 * predicate against the state the client submits. That is not because the
 * client is untrusted with its own learning — nobody gains anything by cheating
 * here — but because the predicate is the definition of done, and having two
 * copies of it would let them drift.
 */

const GENERIC_ERROR = "Something went wrong. Please try again in a moment.";

export interface GitResult {
  ok: boolean;
  error?: string;
  completed?: boolean;
}

const attemptInput = z.object({
  slug: z.string().min(1),
  /** The simulator state the learner reached. Validated by shape, then by predicate. */
  state: z.unknown(),
  hintsUsed: z.number().int().min(0).max(10).optional(),
});

/**
 * Records an attempt, and marks the exercise complete when the submitted state
 * actually satisfies its goal.
 */
export async function recordExerciseAttempt(input: unknown): Promise<GitResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to save your progress." };

  const parsed = attemptInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That exercise could not be found." };

  const exercise = findExercise(parsed.data.slug);
  if (!exercise) return { ok: false, error: "That exercise could not be found." };

  let completed = false;
  try {
    // The predicate is written against the simulator's shape; anything else
    // simply fails it rather than throwing.
    completed = exercise.isComplete(
      parsed.data.state as Parameters<typeof exercise.isComplete>[0],
    );
  } catch {
    completed = false;
  }

  try {
    const existing = await db.userGitExercise.findUnique({
      where: { userId_exerciseSlug: { userId: user.id, exerciseSlug: exercise.slug } },
      select: { status: true, hintsUsed: true },
    });

    const alreadyDone = existing?.status === "COMPLETED";

    await db.userGitExercise.upsert({
      where: { userId_exerciseSlug: { userId: user.id, exerciseSlug: exercise.slug } },
      create: {
        userId: user.id,
        exerciseSlug: exercise.slug,
        status: completed ? "COMPLETED" : "ATTEMPTED",
        attempts: 1,
        hintsUsed: parsed.data.hintsUsed ?? 0,
        completedAt: completed ? new Date() : null,
      },
      update: {
        // Solved stays solved; a later fiddle never un-completes it.
        status: completed || alreadyDone ? "COMPLETED" : "ATTEMPTED",
        attempts: { increment: 1 },
        hintsUsed: Math.max(existing?.hintsUsed ?? 0, parsed.data.hintsUsed ?? 0),
        completedAt: alreadyDone ? undefined : completed ? new Date() : null,
      },
    });

    revalidatePath("/academy/git");
    revalidatePath("/dashboard");

    return { ok: true, completed };
  } catch {
    console.error("[recordExerciseAttempt] failed to record attempt");
    return { ok: false, error: GENERIC_ERROR };
  }
}
