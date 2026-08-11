import { db } from "@/lib/db";

/**
 * AI tool progress.
 *
 * The rule this file exists to enforce: a tool's percentage is *derived* from
 * the UserTopicProgress rows behind its learning path, never independently
 * accumulated. UserAIToolProgress is a projection of those topics, rewritten by
 * `syncToolProgress` whenever anything could have changed it, so the two can
 * never disagree.
 *
 * The alternative — incrementing a counter when a lesson is finished — drifts
 * the moment a path is re-seeded, a topic is completed from the roadmap rather
 * than from the Academy, or two tools share a lesson. All three of which happen
 * routinely, because sharing lessons between paths is the entire design.
 */

/** Percentage of a path's steps completed. Kept pure so it can be tested. */
export function toolPercent({
  total,
  completed,
}: {
  total: number;
  completed: number;
}): number {
  if (total <= 0) return 0;
  const percent = Math.round((Math.min(completed, total) / total) * 100);
  return Math.max(0, Math.min(100, percent));
}

/**
 * Recomputes one learner's progress for one tool from its topics, and writes
 * the projection.
 *
 * Called after a lesson is completed and when a learner starts a tool. Returns
 * the recomputed figures so a caller does not have to read them back.
 *
 * A tool whose path has no steps yet stays at 0% and NOT_STARTED unless the
 * learner explicitly started it — "complete" would otherwise be true of a tool
 * with no curriculum, which is the wrong answer.
 */
export async function syncToolProgress({
  userId,
  toolId,
  touch = false,
}: {
  userId: string;
  toolId: string;
  /** True when the learner actively did something, which starts the tool. */
  touch?: boolean;
}) {
  const lessons = await db.aIToolLesson.findMany({
    where: { learningPath: { toolId }, topicId: { not: null } },
    select: { topicId: true },
  });

  const topicIds = lessons
    .map((lesson) => lesson.topicId)
    .filter((id): id is string => Boolean(id));

  const completedTopics = topicIds.length
    ? await db.userTopicProgress.count({
        where: { userId, topicId: { in: topicIds }, status: "COMPLETED" },
      })
    : 0;

  const total = topicIds.length;
  const percentComplete = toolPercent({ total, completed: completedTopics });

  const existing = await db.userAIToolProgress.findUnique({
    where: { userId_toolId: { userId, toolId } },
    select: { status: true, startedAt: true, completedAt: true },
  });

  const hasStarted = touch || completedTopics > 0 || existing !== null;
  const isComplete = total > 0 && completedTopics >= total;

  const status = isComplete
    ? ("COMPLETED" as const)
    : hasStarted
      ? ("IN_PROGRESS" as const)
      : ("NOT_STARTED" as const);

  const now = new Date();

  await db.userAIToolProgress.upsert({
    where: { userId_toolId: { userId, toolId } },
    create: {
      userId,
      toolId,
      status,
      percentComplete,
      startedAt: hasStarted ? now : null,
      completedAt: isComplete ? now : null,
      lastAccessedAt: now,
    },
    update: {
      status,
      percentComplete,
      // Never overwritten: the first start is the one worth recording.
      startedAt: existing?.startedAt ?? (hasStarted ? now : null),
      // A tool can genuinely become incomplete again if its path grows, so this
      // is not one-way — but an already-complete tool keeps its original date.
      completedAt: isComplete ? (existing?.completedAt ?? now) : null,
      lastAccessedAt: now,
    },
  });

  return { status, percentComplete, completedTopics, totalTopics: total };
}

/**
 * Re-syncs every tool whose learning path includes a given topic.
 *
 * This is the hook that keeps the Academy honest with the rest of the app: when
 * a learner completes "Debugging with AI" from the roadmap, from the topic page
 * or from any tool's path, every tool that teaches it moves at once. Without
 * this, progress would depend on which door the learner came through.
 */
export async function syncToolsForTopic({
  userId,
  topicId,
}: {
  userId: string;
  topicId: string;
}) {
  const paths = await db.aIToolLesson.findMany({
    where: { topicId },
    select: { learningPath: { select: { toolId: true } } },
  });

  const toolIds = [...new Set(paths.map((entry) => entry.learningPath.toolId))];

  for (const toolId of toolIds) {
    await syncToolProgress({ userId, toolId });
  }

  return toolIds.length;
}
