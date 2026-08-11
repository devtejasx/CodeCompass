import { db } from "@/lib/db";
import type { ActivityType } from "@/generated/prisma/client";

/**
 * The activity log.
 *
 * Records *that* something happened and *when*, so the weekly summary and the
 * recent-activity feed have a sequence to read. The existing tables record
 * that things are complete, which is not the same question — reconstructing an
 * ordered week from a dozen timestamp columns across six tables would be both
 * slow and fragile.
 *
 * Two disciplines run through this file.
 *
 * **Recording never breaks the thing it records.** Every write is wrapped: if
 * the activity insert fails, the lesson is still completed and the problem is
 * still solved. A logging table is not allowed to take down the feature it
 * observes.
 *
 * **Nothing sensitive is written.** The type, the subject, a display label and
 * a timestamp. No submitted code, no scores, no free-form blob — an activity
 * log that accepts arbitrary metadata is how it quietly becomes the most
 * sensitive table in the application.
 */

export interface RecordActivityInput {
  userId: string;
  type: ActivityType;
  /** The topic, problem, project or tool. */
  entityId?: string | null;
  /** For linking, where the subject has a page. */
  entitySlug?: string | null;
  /** Human-readable, captured now so the feed survives a later rename. */
  label: string;
}

/** Labels are display strings, not documents. */
const MAX_LABEL = 120;

/**
 * Writes one activity row. Never throws.
 *
 * Returns whether it was recorded, so a caller that genuinely cares can check —
 * but no caller in the application does, which is the point.
 */
export async function recordActivity(input: RecordActivityInput): Promise<boolean> {
  try {
    await db.userActivity.create({
      data: {
        userId: input.userId,
        type: input.type,
        entityId: input.entityId ?? null,
        entitySlug: input.entitySlug ?? null,
        label: input.label.slice(0, MAX_LABEL),
      },
    });
    return true;
  } catch {
    // Deliberately swallowed, and deliberately not logged with the payload.
    console.error("[recordActivity] failed to record activity");
    return false;
  }
}

/**
 * Records an activity only if the same event is not already the most recent
 * one for this learner.
 *
 * Opening a lesson page repeatedly should not produce ten LESSON_STARTED rows.
 * Deduplicating against the latest row rather than a time window keeps it
 * simple and means a genuine second attempt after doing something else still
 * registers.
 */
export async function recordActivityOnce(input: RecordActivityInput): Promise<boolean> {
  try {
    const latest = await db.userActivity.findFirst({
      where: { userId: input.userId },
      orderBy: { createdAt: "desc" },
      select: { type: true, entityId: true },
    });

    if (latest && latest.type === input.type && latest.entityId === (input.entityId ?? null)) {
      return false;
    }

    return await recordActivity(input);
  } catch {
    console.error("[recordActivityOnce] failed to record activity");
    return false;
  }
}

/**
 * Recent activity for the dashboard feed.
 *
 * Scoped by userId in the where clause rather than filtered afterwards, so
 * another learner's activity is never loaded in the first place.
 */
export async function listRecentActivity(userId: string, take = 8) {
  return db.userActivity.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      type: true,
      label: true,
      entitySlug: true,
      createdAt: true,
    },
  });
}

export type ActivityItem = Awaited<ReturnType<typeof listRecentActivity>>[number];

/** Activity within a window, for the weekly summary. */
export async function listActivityBetween(userId: string, from: Date, to: Date) {
  return db.userActivity.findMany({
    where: { userId, createdAt: { gte: from, lte: to } },
    orderBy: { createdAt: "desc" },
    select: { type: true, label: true, createdAt: true },
  });
}

/** Where an activity points, or null when it has no page of its own. */
export function activityHref(activity: {
  type: ActivityType;
  entitySlug: string | null;
}): string | null {
  if (!activity.entitySlug) return null;

  switch (activity.type) {
    case "LESSON_STARTED":
    case "LESSON_COMPLETED":
      return `/learn/${activity.entitySlug}`;
    case "PROBLEM_ATTEMPTED":
    case "PROBLEM_SOLVED":
      return `/practice/${activity.entitySlug}`;
    case "PROJECT_STARTED":
    case "PROJECT_MILESTONE_COMPLETED":
    case "PROJECT_COMPLETED":
      return `/projects/${activity.entitySlug}`;
    case "AI_TOOL_STARTED":
      return `/academy/ai-tools/${activity.entitySlug}`;
    case "AI_WORKFLOW_COMPLETED":
      return `/academy/ai-tools/workflows/${activity.entitySlug}`;
    case "GIT_EXERCISE_COMPLETED":
      return "/academy/git";
    case "CAREER_SELECTED":
      return `/careers/${activity.entitySlug}`;
  }
}

/** Verb for the feed. Past tense, factual, never congratulatory. */
export const ACTIVITY_VERB: Record<ActivityType, string> = {
  CAREER_SELECTED: "Chose",
  LESSON_STARTED: "Started",
  LESSON_COMPLETED: "Completed",
  PROBLEM_ATTEMPTED: "Attempted",
  PROBLEM_SOLVED: "Solved",
  PROJECT_STARTED: "Started building",
  PROJECT_MILESTONE_COMPLETED: "Finished a milestone in",
  PROJECT_COMPLETED: "Completed",
  GIT_EXERCISE_COMPLETED: "Solved Git exercise",
  AI_TOOL_STARTED: "Started learning",
  AI_WORKFLOW_COMPLETED: "Used workflow",
};
