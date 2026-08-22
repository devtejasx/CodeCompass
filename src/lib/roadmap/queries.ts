import { cache } from "react";

import { db } from "@/lib/db";

/**
 * Roadmap reads.
 *
 * One query loads the whole tree for a career, ordered at the database level so
 * the UI never sorts. Nothing user-specific is fetched here — roadmap content
 * is identical for everyone, which is why it can be rendered on the server and
 * cached freely.
 */

/**
 * The active roadmap for a career, with phases, topics and prerequisites.
 * Returns null when a career has no roadmap yet — the caller renders the
 * "still building this path" state rather than failing.
 *
 * This is the largest read in the application — phases, then every topic, then
 * every prerequisite edge — and several features want it in the same render:
 * the roadmap page loads it directly while the learner state behind the sidebar
 * loads it again. Memoised per request so one render costs one tree.
 */
export const getActiveRoadmapForCareer = cache(async function getActiveRoadmapForCareer(
  careerId: string,
) {
  return db.roadmap.findFirst({
    where: { careerId, isActive: true },
    orderBy: { version: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      version: true,
      estimatedDuration: true,
      career: { select: { id: true, slug: true, name: true, icon: true } },
      phases: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          order: true,
          estimatedDuration: true,
          kind: true,
          whyThisComesNext: true,
          topics: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              order: true,
              difficulty: true,
              estimatedTime: true,
              isRequired: true,
              /// Whether an authored lesson exists, so the roadmap can link only where
              /// there is something to open.
              lesson: { select: { id: true } },
              prerequisites: {
                select: {
                  prerequisite: { select: { id: true, slug: true, title: true } },
                },
              },
            },
          },
        },
      },
    },
  });
});

/**
 * Just the topics, in roadmap order, with nothing hanging off them.
 *
 * The full tree above is the right read for the roadmap page, which renders
 * every phase description, every prerequisite edge and whether a topic has a
 * lesson. It is the wrong read for the two features that only need to know
 * *where the learner is* - practice recommendations and the practice context -
 * because "which topic am I on?" is answered by an ordered list of ids and one
 * boolean, and loading the tree to get it cost seven queries and a payload
 * measured in tens of kilobytes on every practice render.
 *
 * Same ordering as the tree: phase order, then topic order, flattened. That is
 * load-bearing rather than incidental - currentTopicId walks this list and
 * takes the first required topic the learner has not finished, so a different
 * order would name a different topic than the roadmap page does.
 */
export const getRoadmapTopicOrder = cache(async function getRoadmapTopicOrder(
  careerId: string,
) {
  const roadmap = await db.roadmap.findFirst({
    where: { careerId, isActive: true },
    orderBy: { version: "desc" },
    select: {
      id: true,
      phases: {
        orderBy: { order: "asc" },
        select: {
          topics: {
            orderBy: { order: "asc" },
            select: { id: true, slug: true, title: true, isRequired: true },
          },
        },
      },
    },
  });

  if (!roadmap) return null;
  return { id: roadmap.id, topics: roadmap.phases.flatMap((phase) => phase.topics) };
});

export type RoadmapTopicOrder = NonNullable<
  Awaited<ReturnType<typeof getRoadmapTopicOrder>>
>;

export type RoadmapDetail = NonNullable<
  Awaited<ReturnType<typeof getActiveRoadmapForCareer>>
>;
export type RoadmapPhaseDetail = RoadmapDetail["phases"][number];
export type RoadmapTopicDetail = RoadmapPhaseDetail["topics"][number];

/** Cheap existence check used by tests and by the dashboard summary. */
export async function careerHasRoadmap(careerId: string) {
  const count = await db.roadmap.count({ where: { careerId, isActive: true } });
  return count > 0;
}
