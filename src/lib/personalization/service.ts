import { cache } from "react";

import { db } from "@/lib/db";
import { githubAvailability } from "@/lib/github/config";
import { getCareerRecommendations } from "@/lib/ai-tools/queries";

import { detectGaps, type TopicAttemptEvidence } from "./gaps";
import { buildStudyPlan, summariseWeek } from "./plan";
import {
  buildRecommendations,
  byTrack,
  nextAction,
  type AIToolCandidate,
  type ProblemCandidate,
  type ProjectCandidate,
} from "./recommend";
import { getLearnerState, type LearnerState } from "./state";
import { listActivityBetween, listRecentActivity } from "./activity";
import type {
  KnowledgeGap,
  Recommendation,
  StudyPlan,
  TrackRecommendation,
  WeeklySummary,
} from "./types";

/**
 * The personalization service.
 *
 * Everything Phase 10 offers, behind one object. The rules live in ./recommend,
 * ./gaps and ./plan as pure functions; this file is the part that talks to the
 * database, and keeping the two apart is what makes the rules testable and the
 * queries reviewable.
 *
 * No recommendation is cached or stored *between* requests. They are a pure
 * function of learner state, so caching one across requests would mean deciding
 * when it goes stale — and the entire promise of this phase is that finishing a
 * lesson changes the answer immediately. The cost is a handful of indexed
 * queries per dashboard render, which is the right trade for never showing
 * somebody a next step they already took. Within one request the answer cannot
 * change, so `getGuidance` is memoised for that request and no further.
 *
 * Every method takes a userId that the caller derived from the session. Nothing
 * here accepts an id from a client.
 */

export interface Guidance {
  state: LearnerState;
  recommendations: Recommendation[];
  next: Recommendation | null;
  tracks: TrackRecommendation[];
  gaps: KnowledgeGap[];
  plan: StudyPlan;
}

/**
 * The whole picture, in one call.
 *
 * The dashboard needs all of it and the mentor needs most of it, so computing
 * it once and passing it down beats each component asking for its own slice and
 * re-running the rules. Memoised per request so that "computing it once" holds
 * even when two callers in the same render both ask — the profile page and the
 * streamed dashboard panels do exactly that.
 */
export const getGuidance = cache(async function getGuidance(
  userId: string,
): Promise<Guidance> {
  const state = await getLearnerState(userId);

  const [practiceCandidates, projectCandidates, aiToolCandidate, gaps, connection] =
    await Promise.all([
      getPracticeCandidates(userId, state),
      getProjectCandidates(userId, state),
      getAIToolCandidate(userId),
      getKnowledgeGaps(userId, state),
      getGitHubConnected(userId),
    ]);

  const recommendations = buildRecommendations({
    state,
    practiceCandidates,
    projectCandidates,
    aiToolCandidate,
    gaps,
    githubConfigured: githubAvailability().configured,
    githubConnected: connection,
  });

  const next = nextAction(recommendations);

  return {
    state,
    recommendations,
    next,
    tracks: byTrack(recommendations, next),
    gaps,
    plan: buildStudyPlan({ recommendations, studyTime: state.studyTime }),
  };
});

/** Just the next action, for callers that need nothing else. */
export async function getNextAction(userId: string): Promise<Recommendation | null> {
  return (await getGuidance(userId)).next;
}

/**
 * Unsolved problems for topics the learner has already completed.
 *
 * Ordered by how recently the topic was finished, so "practise what you just
 * learned" names the thing they actually just learned. Topics they have not
 * completed are excluded entirely — recommending practice for a concept
 * somebody has not studied is how a recommendation loses its credibility.
 */
async function getPracticeCandidates(
  userId: string,
  state: LearnerState,
): Promise<ProblemCandidate[]> {
  if (state.completedTopicIds.length === 0) return [];

  const rows = await db.problemTopic.findMany({
    where: {
      topicId: { in: state.completedTopicIds },
      problem: { progress: { none: { userId, status: "SOLVED" } } },
    },
    select: {
      topicId: true,
      topic: { select: { title: true } },
      problem: {
        select: {
          id: true,
          slug: true,
          title: true,
          estimatedTime: true,
          sortOrder: true,
          difficulty: true,
        },
      },
    },
  });

  // completedTopicIds arrives most-recently-completed first, so position in it
  // is the recency signal.
  const recency = new Map(state.completedTopicIds.map((id, index) => [id, index]));
  const difficultyRank = { EASY: 0, MEDIUM: 1, HARD: 2 } as const;

  const seen = new Set<string>();

  return rows
    .sort(
      (a, b) =>
        (recency.get(a.topicId) ?? 0) - (recency.get(b.topicId) ?? 0) ||
        difficultyRank[a.problem.difficulty] - difficultyRank[b.problem.difficulty] ||
        a.problem.sortOrder - b.problem.sortOrder,
    )
    // A problem attached to several completed topics appears once, under the
    // most recent one.
    .filter((row) => {
      if (seen.has(row.problem.id)) return false;
      seen.add(row.problem.id);
      return true;
    })
    .slice(0, 5)
    .map((row) => ({
      id: row.problem.id,
      slug: row.problem.slug,
      title: row.problem.title,
      estimatedTime: row.problem.estimatedTime,
      topicId: row.topicId,
      topicTitle: row.topic.title,
    }));
}

/**
 * Projects the learner could work on: in progress first, then ones whose every
 * prerequisite is complete.
 *
 * Because prerequisites are topics and topics belong to one roadmap, career
 * filtering falls out for free — a frontend learner can never satisfy a backend
 * project's prerequisites, so it never appears.
 */
async function getProjectCandidates(
  userId: string,
  state: LearnerState,
): Promise<ProjectCandidate[]> {
  const projects = await db.project.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      estimatedDuration: true,
      difficulty: true,
      concepts: {
        where: { isPrerequisite: true },
        select: { topicId: true },
      },
      userProjects: {
        where: { userId },
        select: { status: true },
      },
    },
  });

  const completed = new Set(state.completedTopicIds);

  return projects
    .filter((project) => project.userProjects[0]?.status !== "COMPLETED")
    .map((project) => {
      const prerequisites = project.concepts.map((concept) => concept.topicId);

      return {
        id: project.id,
        slug: project.slug,
        title: project.title,
        estimatedDuration: project.estimatedDuration,
        // A project with no prerequisites is not "ready for everyone" — it is
        // unclassified, and recommending it to a learner on day one would be
        // exactly the irrelevant noise the rules exist to avoid.
        isReady:
          prerequisites.length > 0 && prerequisites.every((id) => completed.has(id)),
        inProgress: project.userProjects[0]?.status === "IN_PROGRESS",
      };
    })
    .filter((project) => project.isReady || project.inProgress)
    .sort((a, b) => Number(b.inProgress) - Number(a.inProgress))
    .slice(0, 4)
    .map(({ id, slug, title, estimatedDuration, isReady }) => ({
      id,
      slug,
      title,
      estimatedDuration,
      isReady,
    }));
}

/**
 * An AI tool curated for this learner's career.
 *
 * Reuses the Phase 9 career→tool relation, which already carries the reason,
 * so the recommendation explains itself with a sentence a human wrote about
 * that exact pairing. Returns null rather than a random tool when there is
 * nothing curated.
 */
async function getAIToolCandidate(userId: string): Promise<AIToolCandidate | null> {
  const { recommendations } = await getCareerRecommendations(userId, 3);

  const unstarted = recommendations.find(
    (entry) => entry.tool.progressStatus === "NOT_STARTED",
  );
  const chosen = unstarted ?? recommendations[0];

  if (!chosen) return null;

  return {
    slug: chosen.tool.slug,
    name: chosen.tool.name,
    reason: chosen.reason,
  };
}

/**
 * Gathers the recorded attempts a gap could be inferred from.
 *
 * Only topics on the learner's own roadmap, and only rows that exist — a topic
 * they have never opened contributes nothing, which is correct: never having
 * tried something is not evidence of difficulty with it.
 */
export async function getKnowledgeGaps(
  userId: string,
  state: LearnerState,
): Promise<KnowledgeGap[]> {
  if (!state.roadmap) return [];

  const [topicRows, problemRows] = await Promise.all([
    db.userTopicProgress.findMany({
      where: { userId, topic: { phase: { roadmapId: state.roadmap.id } } },
      select: {
        attempts: true,
        bestScore: true,
        status: true,
        topic: { select: { id: true, slug: true, title: true } },
      },
    }),
    db.userProblemProgress.findMany({
      where: { userId, status: "ATTEMPTED" },
      select: {
        attempts: true,
        problem: {
          select: { topics: { select: { topicId: true } } },
        },
      },
    }),
  ]);

  /** Unsolved problems and total attempts, aggregated per topic. */
  const byTopic = new Map<string, { unsolved: number; attempts: number }>();

  for (const row of problemRows) {
    for (const link of row.problem.topics) {
      const entry = byTopic.get(link.topicId) ?? { unsolved: 0, attempts: 0 };
      entry.unsolved += 1;
      entry.attempts += row.attempts;
      byTopic.set(link.topicId, entry);
    }
  }

  const evidence: TopicAttemptEvidence[] = topicRows.map((row) => {
    const problems = byTopic.get(row.topic.id) ?? { unsolved: 0, attempts: 0 };

    return {
      topicId: row.topic.id,
      topicSlug: row.topic.slug,
      topicTitle: row.topic.title,
      attempts: row.attempts,
      bestScore: row.bestScore,
      completed: row.status === "COMPLETED",
      unsolvedProblems: problems.unsolved,
      problemAttempts: problems.attempts,
    };
  });

  return detectGaps(evidence);
}

async function getGitHubConnected(userId: string): Promise<boolean> {
  const count = await db.gitHubConnection.count({
    where: { userId, status: "CONNECTED" },
  });
  return count > 0;
}

/**
 * The last seven days of recorded activity.
 *
 * Built from UserActivity alone, so it can only report things that actually
 * happened — and a quiet week reports honestly rather than reaching further
 * back to find something to celebrate.
 */
export async function getWeeklySummary(
  userId: string,
  now = new Date(),
): Promise<WeeklySummary> {
  const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const activities = await listActivityBetween(userId, from, now);

  return summariseWeek({ activities, from, to: now });
}

/** Re-exported so callers import the whole service from one place. */
export { getLearnerState, listRecentActivity };
export type { LearnerState };
