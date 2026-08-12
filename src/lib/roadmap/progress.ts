import type { RoadmapDetail } from "@/lib/roadmap/queries";

/**
 * Phase state.
 *
 * Derived rather than stored: a phase is complete when every *required* topic
 * in it is complete, and the first phase that is not complete is where the
 * learner stands. Callers pass in the completed phase orders, which come from
 * real `UserTopicProgress` rows via `completedPhaseOrders` in lib/learn.
 *
 * Nothing here is cached, so a phase changes state the moment the topic that
 * finished it is recorded.
 */
export type PhaseState = "COMPLETED" | "CURRENT" | "AVAILABLE" | "LOCKED";

export interface PhaseStatus {
  state: PhaseState;
  /** Short label paired with the icon, so state is never colour-only. */
  label: string;
}

export const PHASE_STATE_LABEL: Record<PhaseState, string> = {
  COMPLETED: "Completed",
  CURRENT: "In progress",
  AVAILABLE: "Start here",
  LOCKED: "Locked",
};

/**
 * Derives each phase's state.
 *
 * Position decides which phase is *current*; the topics decide which are
 * *locked*. Those are different questions, and conflating them produced a real
 * contradiction: phase 5 of the Frontend roadmap was drawn as "Locked" while
 * its first topic had no prerequisites and was genuinely available to start.
 * The badge said one thing and the topic list beneath it said another.
 *
 * A phase is locked only when every topic in it is locked. That keeps the badge
 * honest about what the learner can actually do, and it is the truthful answer
 * for Git in particular — Git does not depend on JavaScript, so a learner who
 * wants it early is not doing anything wrong.
 *
 * @param completedPhaseOrders Orders of the phases whose required topics are
 *   all complete.
 * @param openPhaseIds Phases containing at least one topic that is not locked.
 *   Omit to fall back to position alone, which is what callers without topic
 *   states get.
 */
export function derivePhaseStates(
  phases: Pick<RoadmapDetail["phases"][number], "id" | "order">[],
  completedPhaseOrders: number[] = [],
  openPhaseIds?: Iterable<string>,
): Map<string, PhaseStatus> {
  const completed = new Set(completedPhaseOrders);
  const open = openPhaseIds ? new Set(openPhaseIds) : null;
  const states = new Map<string, PhaseStatus>();

  // The first phase that has not been completed is where the learner stands.
  const firstOpen = phases.find((phase) => !completed.has(phase.order));

  for (const phase of phases) {
    let state: PhaseState;

    if (completed.has(phase.order)) {
      state = "COMPLETED";
    } else if (phase.id === firstOpen?.id) {
      // "Available" rather than "current": nothing has been started yet, and
      // claiming otherwise would be a progress lie.
      state = completed.size > 0 ? "CURRENT" : "AVAILABLE";
    } else if (open?.has(phase.id)) {
      // Later in the roadmap, but something inside it is genuinely startable.
      state = "AVAILABLE";
    } else {
      state = "LOCKED";
    }

    states.set(phase.id, { state, label: PHASE_STATE_LABEL[state] });
  }

  return states;
}

export interface RoadmapProgress {
  /**
   * Completed phases over total phases, 0–100.
   *
   * The roadmap page replaces this with the required-topic figure from
   * `roadmapPercent`, which is what the dashboard and the profile also use.
   * Phase completion is coarse — nine phases means the bar can only move in
   * 11% steps — so it survives as a secondary count, not as *the* number.
   */
  percentComplete: number;
  totalPhases: number;
  completedPhases: number;
  totalTopics: number;
  /** Denominator of the headline percentage, so a caption can match it. */
  totalRequiredTopics: number;
  completedRequiredTopics: number;
  /** The phase the learner should open first. */
  currentPhaseTitle: string | null;
  upcomingPhaseTitles: string[];
}

export function summariseProgress(
  roadmap: Pick<RoadmapDetail, "phases">,
  completedPhaseOrders: number[] = [],
  completedTopicIds: string[] = [],
): RoadmapProgress {
  const totalPhases = roadmap.phases.length;
  const completedPhases = completedPhaseOrders.length;
  const allTopics = roadmap.phases.flatMap((phase) => phase.topics);
  const requiredTopics = allTopics.filter((topic) => topic.isRequired);

  const doneTopics = new Set(completedTopicIds);
  const completed = new Set(completedPhaseOrders);
  const remaining = roadmap.phases.filter((phase) => !completed.has(phase.order));

  return {
    percentComplete:
      totalPhases === 0 ? 0 : Math.round((completedPhases / totalPhases) * 100),
    totalPhases,
    completedPhases,
    totalTopics: allTopics.length,
    totalRequiredTopics: requiredTopics.length,
    completedRequiredTopics: requiredTopics.filter((topic) => doneTopics.has(topic.id))
      .length,
    currentPhaseTitle: remaining[0]?.title ?? null,
    upcomingPhaseTitles: remaining.slice(1, 5).map((phase) => phase.title),
  };
}
