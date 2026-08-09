import type { ProblemDifficulty, ProblemStatus } from "@/generated/prisma/client";

/**
 * Which problems to put in front of a learner right now.
 *
 * Deterministic rules, no AI, and — more importantly — no filler. If the topic
 * a learner is on has no problems yet, the answer is an honest "coming soon",
 * not three unrelated problems chosen to fill a row. Recommending something
 * irrelevant is worse than recommending nothing, because it teaches the learner
 * that the recommendations are noise.
 *
 * Kept pure so the ordering can be unit-tested without a database.
 */

const DIFFICULTY_RANK: Record<ProblemDifficulty, number> = {
  EASY: 0,
  MEDIUM: 1,
  HARD: 2,
};

export interface RecommendableProblem {
  id: string;
  slug: string;
  difficulty: ProblemDifficulty;
  sortOrder: number;
  /** Topics this problem practises. */
  topicIds: string[];
  status: ProblemStatus;
}

export interface RecommendationInput {
  /** The topic the learner is on right now, if the roadmap could name one. */
  currentTopicId: string | null;
  /** Topics they have finished, most recently finished first. */
  completedTopicIds: string[];
  problems: RecommendableProblem[];
  limit?: number;
}

export interface Recommendation<T extends RecommendableProblem> {
  problem: T;
  /** Why this problem is being suggested — shown to the learner. */
  reason: "CURRENT_TOPIC" | "RECENTLY_LEARNED";
}

/**
 * Ranks problems for the "what should I practise now?" section.
 *
 * 1. Problems for the topic they are on.
 * 2. Problems for topics they have already completed, most recent first.
 * 3. Solved problems are removed — they have been done.
 * 4. Easy before Medium before Hard, then authored order.
 *
 * A problem attached to several topics is only ever recommended once, under the
 * strongest reason that applies.
 */
export function recommendProblems<T extends RecommendableProblem>({
  currentTopicId,
  completedTopicIds,
  problems,
  limit = 6,
}: RecommendationInput & { problems: T[] }): Recommendation<T>[] {
  // Position in the completed list is the recency signal, so a topic finished
  // an hour ago outranks one finished last week.
  const recency = new Map(completedTopicIds.map((id, index) => [id, index]));

  const candidates: (Recommendation<T> & { rank: number; recency: number })[] = [];

  for (const problem of problems) {
    if (problem.status === "SOLVED") continue;

    const onCurrent =
      currentTopicId !== null && problem.topicIds.includes(currentTopicId);

    const bestRecency = problem.topicIds
      .map((id) => recency.get(id))
      .filter((value): value is number => value !== undefined)
      .sort((a, b) => a - b)[0];

    if (!onCurrent && bestRecency === undefined) continue;

    candidates.push({
      problem,
      reason: onCurrent ? "CURRENT_TOPIC" : "RECENTLY_LEARNED",
      rank: onCurrent ? 0 : 1,
      recency: bestRecency ?? -1,
    });
  }

  candidates.sort(
    (a, b) =>
      a.rank - b.rank ||
      a.recency - b.recency ||
      DIFFICULTY_RANK[a.problem.difficulty] - DIFFICULTY_RANK[b.problem.difficulty] ||
      a.problem.sortOrder - b.problem.sortOrder,
  );

  return candidates.slice(0, limit).map(({ problem, reason }) => ({ problem, reason }));
}

/**
 * The topic a learner is currently on: the first required topic, in roadmap
 * order, that they have not completed.
 *
 * Mirrors how deriveTopicStates picks CURRENT in the learning system, so the
 * roadmap and the practice recommendation always name the same topic.
 */
export function currentTopicId(
  topicsInOrder: { id: string; isRequired: boolean }[],
  completedTopicIds: string[],
): string | null {
  const completed = new Set(completedTopicIds);
  const next = topicsInOrder.find(
    (topic) => topic.isRequired && !completed.has(topic.id),
  );
  return next?.id ?? null;
}
