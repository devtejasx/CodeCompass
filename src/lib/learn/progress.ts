/**
 * Progress arithmetic, kept in one place so the dashboard, the roadmap and the
 * topic page can never disagree about what "12%" means.
 */

/** Fraction of a topic earned by reading; the rest is the knowledge check. */
const SECTION_WEIGHT = 0.9;

/** Score needed to complete a topic. Generous on purpose — see below. */
export const PASSING_SCORE = 70;

/**
 * Percent complete for a single topic.
 *
 * Sections are worth 90% and the knowledge check the last 10%, so a learner
 * who has read everything but not yet been tested sees 90 rather than 100 —
 * honest about what is left without implying they've barely started.
 */
export function topicPercent({
  totalSections,
  completedSections,
  passed,
}: {
  totalSections: number;
  completedSections: number;
  passed: boolean;
}): number {
  if (passed) return 100;
  if (totalSections === 0) return 0;

  const ratio = Math.min(completedSections, totalSections) / totalSections;
  return Math.round(ratio * SECTION_WEIGHT * 100);
}

/**
 * Grades a knowledge-check attempt.
 *
 * 70% to pass, and a failure is never punitive: the learner keeps their best
 * score, can retry immediately, and is told which questions to revisit.
 */
export function gradeAttempt(
  correctByQuestion: { questionId: string; isCorrect: boolean }[],
): { score: number; passed: boolean; correctCount: number; total: number } {
  const total = correctByQuestion.length;
  const correctCount = correctByQuestion.filter((entry) => entry.isCorrect).length;
  const score = total === 0 ? 0 : Math.round((correctCount / total) * 100);

  return { score, passed: score >= PASSING_SCORE, correctCount, total };
}

/**
 * Roadmap progress: completed *required* topics over all required topics.
 *
 * Optional topics are enrichment, so counting them would make a learner who
 * skipped them look permanently unfinished.
 */
export function roadmapPercent({
  requiredTopicIds,
  completedTopicIds,
}: {
  requiredTopicIds: string[];
  completedTopicIds: string[];
}): number {
  if (requiredTopicIds.length === 0) return 0;

  const completed = new Set(completedTopicIds);
  const done = requiredTopicIds.filter((id) => completed.has(id)).length;

  return Math.round((done / requiredTopicIds.length) * 100);
}

export type TopicState = "COMPLETED" | "CURRENT" | "AVAILABLE" | "LOCKED";

export const TOPIC_STATE_LABEL: Record<TopicState, string> = {
  COMPLETED: "Completed",
  CURRENT: "Current",
  AVAILABLE: "Available",
  LOCKED: "Locked",
};

interface TopicNode {
  id: string;
  isRequired: boolean;
  prerequisiteIds: string[];
}

/**
 * Derives each topic's state from real progress.
 *
 * A topic is available once its prerequisites are done — that is the whole
 * point of having modelled prerequisites. The first available, incomplete
 * topic in roadmap order is marked CURRENT so the learner has exactly one
 * obvious next action.
 */
export function deriveTopicStates(
  topicsInOrder: TopicNode[],
  completedTopicIds: string[],
): Map<string, TopicState> {
  const completed = new Set(completedTopicIds);
  const states = new Map<string, TopicState>();
  let currentAssigned = false;

  for (const topic of topicsInOrder) {
    if (completed.has(topic.id)) {
      states.set(topic.id, "COMPLETED");
      continue;
    }

    const ready = topic.prerequisiteIds.every((id) => completed.has(id));

    if (!ready) {
      states.set(topic.id, "LOCKED");
      continue;
    }

    if (!currentAssigned) {
      states.set(topic.id, "CURRENT");
      currentAssigned = true;
    } else {
      states.set(topic.id, "AVAILABLE");
    }
  }

  return states;
}

/**
 * Which phases count as complete: every *required* topic in them is done.
 * Returned as orders so it drops straight into the Phase 4 phase-state logic.
 */
export function completedPhaseOrders(
  phases: { order: number; topics: { id: string; isRequired: boolean }[] }[],
  completedTopicIds: string[],
): number[] {
  const completed = new Set(completedTopicIds);

  return phases
    .filter((phase) => {
      const required = phase.topics.filter((topic) => topic.isRequired);
      return required.length > 0 && required.every((topic) => completed.has(topic.id));
    })
    .map((phase) => phase.order);
}
