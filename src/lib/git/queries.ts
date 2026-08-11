import { db } from "@/lib/db";

import { GIT_EXERCISES, GIT_EXERCISE_SLUGS } from "./exercises";

/**
 * Academy reads.
 *
 * The curriculum is ordinary roadmap content, so this file is thin on purpose —
 * it asks the same tables the career roadmaps use and folds in the same
 * UserTopicProgress. The only Academy-specific store is exercise progress.
 */

export const GIT_ACADEMY_SLUG = "git-github";

/** The Academy with its modules, topics and this learner's progress. */
export async function getGitAcademy(userId: string) {
  const roadmap = await db.roadmap.findUnique({
    where: { slug: GIT_ACADEMY_SLUG },
    select: {
      id: true,
      title: true,
      description: true,
      estimatedDuration: true,
      phases: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          order: true,
          estimatedDuration: true,
          whyThisComesNext: true,
          topics: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              estimatedTime: true,
              difficulty: true,
              lesson: { select: { id: true } },
            },
          },
        },
      },
    },
  });

  if (!roadmap) return null;

  const topicIds = roadmap.phases.flatMap((phase) =>
    phase.topics.map((topic) => topic.id),
  );

  const progress = await db.userTopicProgress.findMany({
    where: { userId, topicId: { in: topicIds } },
    select: { topicId: true, status: true, percentComplete: true },
  });
  const byTopic = new Map(progress.map((row) => [row.topicId, row]));

  const modules = roadmap.phases.map((phase) => {
    const topics = phase.topics.map((topic) => {
      const mine = byTopic.get(topic.id);
      return {
        ...topic,
        hasLesson: topic.lesson !== null,
        status: mine?.status ?? ("NOT_STARTED" as const),
        percentComplete: mine?.percentComplete ?? 0,
      };
    });

    return {
      id: phase.id,
      title: phase.title,
      description: phase.description,
      order: phase.order,
      estimatedDuration: phase.estimatedDuration,
      whyThisComesNext: phase.whyThisComesNext,
      topics,
      isComplete: topics.length > 0 && topics.every((t) => t.status === "COMPLETED"),
    };
  });

  const total = modules.length;
  const completed = modules.filter((module) => module.isComplete).length;

  return {
    id: roadmap.id,
    title: roadmap.title,
    description: roadmap.description,
    estimatedDuration: roadmap.estimatedDuration,
    modules,
    completedModules: completed,
    totalModules: total,
    percentComplete: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export type GitAcademy = NonNullable<Awaited<ReturnType<typeof getGitAcademy>>>;

/** Exercise progress for this learner, folded into the authored exercise list. */
export async function listExercises(userId: string) {
  const rows = await db.userGitExercise.findMany({
    where: { userId, exerciseSlug: { in: GIT_EXERCISE_SLUGS } },
    select: { exerciseSlug: true, status: true, attempts: true, completedAt: true },
  });
  const bySlug = new Map(rows.map((row) => [row.exerciseSlug, row]));

  return GIT_EXERCISES.map((exercise) => {
    const mine = bySlug.get(exercise.slug);
    return {
      slug: exercise.slug,
      title: exercise.title,
      brief: exercise.brief,
      goal: exercise.goal,
      topicSlug: exercise.topicSlug,
      hintCount: exercise.hints.length,
      status: mine?.status ?? ("NOT_STARTED" as const),
      attempts: mine?.attempts ?? 0,
      completedAt: mine?.completedAt ?? null,
    };
  });
}

export type ExerciseListItem = Awaited<ReturnType<typeof listExercises>>[number];

/** Counts for the Academy header and the dashboard. */
export async function getGitProgressSummary(userId: string) {
  const academy = await getGitAcademy(userId);
  const solved = await db.userGitExercise.count({
    where: { userId, status: "COMPLETED", exerciseSlug: { in: GIT_EXERCISE_SLUGS } },
  });

  return {
    completedModules: academy?.completedModules ?? 0,
    totalModules: academy?.totalModules ?? 0,
    percentComplete: academy?.percentComplete ?? 0,
    exercisesCompleted: solved,
    totalExercises: GIT_EXERCISE_SLUGS.length,
  };
}
