import type {
  MilestoneStatus,
  ProjectDifficulty,
  ProjectStatus,
  ProjectType,
  RequirementCategory,
} from "@/generated/prisma/client";

/**
 * Project progress arithmetic and presentation, kept in one place so the
 * workspace, the project list, the roadmap and the dashboard can never disagree
 * about what "62%" means.
 */

/**
 * Percentage of a project's milestones that are complete.
 *
 * Milestones are the only progress signal. Submission URLs and self-evaluation
 * ticks deliberately do not count toward it: they are things a learner does at
 * the end, and folding them in would make the bar jump from 80% to 100% without
 * any building having happened.
 */
export function milestonePercent({
  total,
  completed,
}: {
  total: number;
  completed: number;
}): number {
  if (total === 0) return 0;
  return Math.round((Math.min(completed, total) / total) * 100);
}

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

export const MILESTONE_STATUS_LABEL: Record<MilestoneStatus, string> = {
  LOCKED: "Not started",
  AVAILABLE: "To do",
  COMPLETED: "Done",
};

export const DIFFICULTY_LABEL: Record<ProjectDifficulty, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

/** Reuses the shared badge variants rather than inventing project-only colours. */
export const DIFFICULTY_BADGE: Record<
  ProjectDifficulty,
  "beginner" | "intermediate" | "advanced"
> = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
};

export const TYPE_LABEL: Record<ProjectType, string> = {
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  FULL_STACK: "Full stack",
  DATA: "Data",
  AI: "AI",
  MOBILE: "Mobile",
  OTHER: "Other",
};

export const REQUIREMENT_CATEGORY_LABEL: Record<RequirementCategory, string> = {
  FUNCTIONAL: "Functional requirements",
  TECHNICAL: "Technical requirements",
};

/**
 * Whether a learner may mark a project complete.
 *
 * The bar is deliberately about *attestation*, not verification: CodeCompass
 * cannot run their project, so it does not pretend to. What it can do is refuse
 * to let someone tick "complete" without having confirmed each required
 * behaviour themselves and recorded where the work lives.
 */
export function canComplete({
  requiredRequirementIds,
  confirmedRequirementIds,
  repositoryUrl,
}: {
  requiredRequirementIds: string[];
  confirmedRequirementIds: string[];
  repositoryUrl: string | null;
}): { ok: boolean; reason?: string } {
  if (!repositoryUrl) {
    return {
      ok: false,
      reason: "Add the repository URL before marking this complete.",
    };
  }

  const confirmed = new Set(confirmedRequirementIds);
  const outstanding = requiredRequirementIds.filter((id) => !confirmed.has(id));

  if (outstanding.length > 0) {
    return {
      ok: false,
      reason: `${outstanding.length} required ${
        outstanding.length === 1 ? "item is" : "items are"
      } still unchecked in the self-evaluation.`,
    };
  }

  return { ok: true };
}
