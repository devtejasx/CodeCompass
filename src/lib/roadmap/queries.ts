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
