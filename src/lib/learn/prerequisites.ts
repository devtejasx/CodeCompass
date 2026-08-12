import { db } from "@/lib/db";

import { DELEGATED_TOPICS, satisfiedDelegatedTopicIds } from "./delegation";

/**
 * Prerequisite enforcement.
 *
 * The roadmap already *renders* a locked topic as locked, but rendering is
 * presentation: a learner who types the URL, or replays a request, reaches the
 * same lesson. Recording a completion is the thing that has to be defended, so
 * the check lives here and is called by every action that can mark a topic
 * done.
 *
 * Two deliberate boundaries:
 *
 *   **Reading ahead is allowed.** Nothing here stops a learner opening a lesson
 *   out of order — curiosity is not an attack, and a curriculum that refuses to
 *   let someone look forward is patronising. What is refused is *recording
 *   progress* they have not earned, because every recommendation, capability
 *   and piece of profile evidence downstream is computed from that record.
 *
 *   **Only direct prerequisites are checked.** They are transitive by
 *   construction: B cannot be complete unless A was, so checking B's immediate
 *   parents is checking the whole chain, at one query instead of a graph walk.
 */

export interface OutstandingPrerequisite {
  id: string;
  slug: string;
  title: string;
}

/**
 * The prerequisites of `topicId` this learner has not completed.
 *
 * Empty means they may record progress on the topic.
 */
export async function outstandingPrerequisites(
  userId: string,
  topicId: string,
): Promise<OutstandingPrerequisite[]> {
  const links = await db.topicPrerequisite.findMany({
    where: { topicId },
    select: {
      prerequisite: {
        select: {
          id: true,
          slug: true,
          title: true,
          // The learner's own row for the prerequisite, or none. Scoped by
          // userId inside the relation so this stays a single query.
          progress: {
            where: { userId },
            select: { status: true },
          },
        },
      },
    },
  });

  const outstanding = links
    .filter(({ prerequisite }) => prerequisite.progress[0]?.status !== "COMPLETED")
    .map(({ prerequisite }) => ({
      id: prerequisite.id,
      slug: prerequisite.slug,
      title: prerequisite.title,
    }));

  // A prerequisite the roadmap delegates has no progress row of its own — it is
  // satisfied by the Academy work behind it. Without this, finishing Git in the
  // Academy would leave every topic after it permanently locked.
  const delegated = outstanding.filter((topic) => topic.slug in DELEGATED_TOPICS);
  if (delegated.length === 0) return outstanding;

  const satisfied = new Set(await satisfiedDelegatedTopicIds(userId, delegated));

  return outstanding.filter((topic) => !satisfied.has(topic.id));
}

/**
 * A sentence naming what is outstanding.
 *
 * Written for the learner rather than for a log: it says what to do next, and
 * never implies they did something wrong by arriving here.
 */
export function prerequisiteMessage(missing: OutstandingPrerequisite[]): string {
  const titles = missing.map((topic) => topic.title);

  const list =
    titles.length === 1
      ? titles[0]
      : `${titles.slice(0, -1).join(", ")} and ${titles[titles.length - 1]}`;

  return titles.length === 1
    ? `Finish ${list} first — this topic builds directly on it. You can still read ahead.`
    : `Finish ${list} first — this topic builds directly on them. You can still read ahead.`;
}
