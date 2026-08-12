import { db } from "@/lib/db";

import { DELEGATED_TOPIC_SLUGS, satisfiedDelegatedTopicIds } from "./delegation";

/**
 * Learning reads.
 *
 * Note what is *not* selected: `isCorrect` never leaves the server. Options are
 * sent to the browser without it, and grading happens in the server action, so
 * the answer key cannot be read out of the page source.
 */

/** A topic plus its lesson, in the roadmap context it belongs to. */
export async function getTopicForLearning(slug: string) {
  return db.topic.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      difficulty: true,
      estimatedTime: true,
      isRequired: true,
      order: true,
      phase: {
        select: {
          id: true,
          title: true,
          order: true,
          roadmap: {
            select: {
              id: true,
              title: true,
              kind: true,
              slug: true,
              // Null for an ACADEMY roadmap — Git and GitHub belong to no single
              // career. Callers show the roadmap title instead.
              career: { select: { id: true, slug: true, name: true } },
            },
          },
        },
      },
      prerequisites: {
        select: {
          prerequisite: { select: { id: true, slug: true, title: true } },
        },
      },
      lesson: {
        select: {
          id: true,
          title: true,
          description: true,
          estimatedTime: true,
          sections: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              type: true,
              content: true,
              items: true,
              code: true,
              language: true,
              order: true,
            },
          },
          knowledgeChecks: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              question: true,
              order: true,
              // explanation and isCorrect are deliberately withheld until the
              // server has graded the attempt.
              options: {
                orderBy: { order: "asc" },
                select: { id: true, text: true, order: true },
              },
            },
          },
          resources: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              url: true,
              source: true,
              type: true,
              description: true,
            },
          },
        },
      },
    },
  });
}

export type LearningTopic = NonNullable<
  Awaited<ReturnType<typeof getTopicForLearning>>
>;
export type LessonSectionView = NonNullable<
  LearningTopic["lesson"]
>["sections"][number];
export type KnowledgeCheckView = NonNullable<
  LearningTopic["lesson"]
>["knowledgeChecks"][number];

/** This user's progress for one topic, or null if they've never opened it. */
export async function getTopicProgress(userId: string, topicId: string) {
  return db.userTopicProgress.findUnique({
    where: { userId_topicId: { userId, topicId } },
    select: {
      status: true,
      percentComplete: true,
      bestScore: true,
      attempts: true,
      startedAt: true,
      completedAt: true,
    },
  });
}

/** Section ids this user has ticked off within one lesson. */
export async function getCompletedSectionIds(userId: string, lessonId: string) {
  const rows = await db.userSectionProgress.findMany({
    where: { userId, section: { lessonId } },
    select: { sectionId: true },
  });
  return rows.map((row) => row.sectionId);
}

/**
 * The next topic a learner should open after this one: the following topic in
 * the same phase, else the first topic of the next phase.
 *
 * Derived from roadmap ordering rather than hardcoded anywhere in the UI.
 */
export async function getNextTopic(topicId: string) {
  const current = await db.topic.findUnique({
    where: { id: topicId },
    select: {
      order: true,
      phase: { select: { id: true, order: true, roadmapId: true } },
    },
  });

  if (!current) return null;

  const nextInPhase = await db.topic.findFirst({
    where: { phaseId: current.phase.id, order: { gt: current.order } },
    orderBy: { order: "asc" },
    select: { slug: true, title: true, lesson: { select: { id: true } } },
  });

  if (nextInPhase) return nextInPhase;

  const nextPhase = await db.roadmapPhase.findFirst({
    where: {
      roadmapId: current.phase.roadmapId,
      order: { gt: current.phase.order },
    },
    orderBy: { order: "asc" },
    select: {
      topics: {
        orderBy: { order: "asc" },
        take: 1,
        select: { slug: true, title: true, lesson: { select: { id: true } } },
      },
    },
  });

  return nextPhase?.topics[0] ?? null;
}

/**
 * Every completed topic id for a user within one roadmap. Used by the roadmap
 * page and the dashboard so both compute progress from the same source.
 *
 * Includes topics the roadmap delegates to an Academy and whose Academy work is
 * finished. Folding that in here rather than at each call site is what lets
 * prerequisites, phase state, progress percentages and the recommendation
 * engine all honour delegation without knowing it exists.
 */
export async function getCompletedTopicIds(userId: string, roadmapId: string) {
  const [rows, roadmapTopics] = await Promise.all([
    db.userTopicProgress.findMany({
      where: {
        userId,
        status: "COMPLETED",
        topic: { phase: { roadmapId } },
      },
      select: { topicId: true },
    }),
    db.topic.findMany({
      where: { phase: { roadmapId }, slug: { in: DELEGATED_TOPIC_SLUGS } },
      select: { id: true, slug: true },
    }),
  ]);

  const delegated = await satisfiedDelegatedTopicIds(userId, roadmapTopics);

  return [...new Set([...rows.map((row) => row.topicId), ...delegated])];
}

/** The topic a learner was last working on, for "continue where you left off". */
export async function getResumeTopic(userId: string, roadmapId: string) {
  return db.userTopicProgress.findFirst({
    where: {
      userId,
      status: "IN_PROGRESS",
      topic: { phase: { roadmapId } },
    },
    orderBy: { lastAccessedAt: "desc" },
    select: {
      percentComplete: true,
      topic: { select: { slug: true, title: true } },
    },
  });
}
