import type { RoadmapDetail } from "@/lib/roadmap/queries";

/**
 * Phase state.
 *
 * Phase 4 has no learner progress — there is no table recording what anyone has
 * finished, and inventing one here would be fabricating data. So state is
 * *derived*, and deliberately conservative: the first phase is available to
 * start, everything after it is locked.
 *
 * COMPLETED exists in the union because the UI must already render it. When
 * Phase 5 adds real progress, only this function changes; every component that
 * consumes it stays as it is.
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
 * Derives each phase's state by position.
 *
 * @param completedPhaseOrders Reserved for Phase 5. Empty today, which is what
 *   makes the first phase "start here" and the rest locked.
 */
export function derivePhaseStates(
  phases: Pick<RoadmapDetail["phases"][number], "id" | "order">[],
  completedPhaseOrders: number[] = [],
): Map<string, PhaseStatus> {
  const completed = new Set(completedPhaseOrders);
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
    } else {
      state = "LOCKED";
    }

    states.set(phase.id, { state, label: PHASE_STATE_LABEL[state] });
  }

  return states;
}

export interface RoadmapProgress {
  /** 0–100. Always 0 in Phase 4 — there is nothing recorded to count. */
  percentComplete: number;
  totalPhases: number;
  completedPhases: number;
  totalTopics: number;
  /** The phase the learner should open first. */
  currentPhaseTitle: string | null;
  upcomingPhaseTitles: string[];
}

export function summariseProgress(
  roadmap: Pick<RoadmapDetail, "phases">,
  completedPhaseOrders: number[] = [],
): RoadmapProgress {
  const totalPhases = roadmap.phases.length;
  const completedPhases = completedPhaseOrders.length;
  const totalTopics = roadmap.phases.reduce(
    (sum, phase) => sum + phase.topics.length,
    0,
  );

  const completed = new Set(completedPhaseOrders);
  const remaining = roadmap.phases.filter((phase) => !completed.has(phase.order));

  return {
    percentComplete:
      totalPhases === 0 ? 0 : Math.round((completedPhases / totalPhases) * 100),
    totalPhases,
    completedPhases,
    totalTopics,
    currentPhaseTitle: remaining[0]?.title ?? null,
    upcomingPhaseTitles: remaining.slice(1, 5).map((phase) => phase.title),
  };
}
