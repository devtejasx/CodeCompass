import type { ProjectDifficulty, ProjectStatus } from "@/generated/prisma/client";

/**
 * Which project a learner should build next.
 *
 * Deterministic rules, no AI. The one that matters most is negative: a project
 * is never recommended to someone who has not finished what it is built on.
 * Suggesting an API project to a learner who has just written their first for
 * loop does not stretch them, it tells them they are behind.
 *
 * Because prerequisites are topics, and topics belong to exactly one roadmap,
 * career filtering falls out for free — a frontend learner can never satisfy a
 * backend project's prerequisites, so it never surfaces.
 *
 * Kept pure so the ordering is unit-testable without a database.
 */

const DIFFICULTY_RANK: Record<ProjectDifficulty, number> = {
  BEGINNER: 0,
  INTERMEDIATE: 1,
  ADVANCED: 2,
};

export interface RecommendableProject {
  id: string;
  slug: string;
  difficulty: ProjectDifficulty;
  sortOrder: number;
  /** Topic ids that must be completed before this is recommended. */
  prerequisiteTopicIds: string[];
  status: ProjectStatus;
}

/** Why a project is being shown. Surfaced to the learner, never inferred by them. */
export type RecommendationReason =
  /** Already started — finishing it beats starting another. */
  | "CONTINUE"
  /** Everything it builds on is complete. */
  | "READY";

export interface Recommendation<T extends RecommendableProject> {
  project: T;
  reason: RecommendationReason;
  /** Prerequisites still outstanding. Always empty for a recommendation. */
  missingTopicIds: string[];
}

/** A project the learner is not ready for yet, and what stands in the way. */
export interface UpcomingProject<T extends RecommendableProject> {
  project: T;
  missingTopicIds: string[];
}

export interface RecommendationInput<T extends RecommendableProject> {
  /** Topics the learner has completed, most recently completed first. */
  completedTopicIds: string[];
  projects: T[];
  limit?: number;
}

/**
 * Projects the learner can start right now.
 *
 * 1. Anything already in progress, so a half-built project is not abandoned.
 * 2. Projects whose every prerequisite topic is complete.
 * 3. Completed projects are removed.
 * 4. Easiest first, then most recently unlocked, then authored order.
 */
export function recommendProjects<T extends RecommendableProject>({
  completedTopicIds,
  projects,
  limit = 4,
}: RecommendationInput<T>): Recommendation<T>[] {
  const completed = new Set(completedTopicIds);
  // Position in the completed list is the recency signal: a project unlocked by
  // the topic they finished this morning should outrank one unlocked last month.
  const recency = new Map(completedTopicIds.map((id, index) => [id, index]));

  const candidates: (Recommendation<T> & { rank: number; recency: number })[] = [];

  for (const project of projects) {
    if (project.status === "COMPLETED") continue;

    const missing = project.prerequisiteTopicIds.filter((id) => !completed.has(id));
    if (missing.length > 0) continue;

    const bestRecency = project.prerequisiteTopicIds
      .map((id) => recency.get(id))
      .filter((value): value is number => value !== undefined)
      .sort((a, b) => a - b)[0];

    candidates.push({
      project,
      reason: project.status === "IN_PROGRESS" ? "CONTINUE" : "READY",
      missingTopicIds: [],
      rank: project.status === "IN_PROGRESS" ? 0 : 1,
      recency: bestRecency ?? Number.MAX_SAFE_INTEGER,
    });
  }

  candidates.sort(
    (a, b) =>
      a.rank - b.rank ||
      a.recency - b.recency ||
      DIFFICULTY_RANK[a.project.difficulty] - DIFFICULTY_RANK[b.project.difficulty] ||
      a.project.sortOrder - b.project.sortOrder,
  );

  return candidates.slice(0, limit).map(({ project, reason, missingTopicIds }) => ({
    project,
    reason,
    missingTopicIds,
  }));
}

/**
 * The projects closest to becoming available, and what is still missing.
 *
 * Shown under a heading that says plainly they are not ready. This is not the
 * same as recommending them: naming what stands between a learner and a project
 * they want to build is information, whereas dropping it into "recommended"
 * alongside things they can actually start would be noise.
 */
export function upcomingProjects<T extends RecommendableProject>({
  completedTopicIds,
  projects,
  limit = 3,
}: RecommendationInput<T>): UpcomingProject<T>[] {
  const completed = new Set(completedTopicIds);

  return projects
    .filter((project) => project.status === "NOT_STARTED")
    .map((project) => ({
      project,
      missingTopicIds: project.prerequisiteTopicIds.filter((id) => !completed.has(id)),
    }))
    .filter((entry) => entry.missingTopicIds.length > 0)
    .sort(
      (a, b) =>
        a.missingTopicIds.length - b.missingTopicIds.length ||
        DIFFICULTY_RANK[a.project.difficulty] - DIFFICULTY_RANK[b.project.difficulty] ||
        a.project.sortOrder - b.project.sortOrder,
    )
    .slice(0, limit);
}

/** Whether every prerequisite for one project is complete. */
export function isReady(
  prerequisiteTopicIds: string[],
  completedTopicIds: string[],
): boolean {
  const completed = new Set(completedTopicIds);
  return prerequisiteTopicIds.every((id) => completed.has(id));
}
