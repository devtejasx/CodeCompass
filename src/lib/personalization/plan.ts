import type { DailyLearningTime } from "@/generated/prisma/client";

import type { PlanItem, Recommendation, StudyPlan, WeeklySummary } from "./types";

/**
 * Today's Plan, and the weekly summary.
 *
 * Both are built entirely from work that actually exists. Nothing is invented
 * to fill a slot: a learner with one outstanding lesson and thirty minutes gets
 * a one-item plan, not three items padded to look busy. A plan containing a
 * task the learner cannot find in the product is worse than no plan.
 *
 * Kept pure so the budgeting arithmetic is testable without a database.
 */

/**
 * Onboarding's study-time answer, as a working number of minutes.
 *
 * The lower end of each band on purpose. A plan that fits is finished, and a
 * finished plan is the thing that gets somebody to come back tomorrow;
 * planning for the optimistic end of "1–2 hours" produces a plan that reliably
 * fails by 20%.
 */
const MINUTES: Record<DailyLearningTime, number> = {
  MINUTES_15_30: 20,
  MINUTES_30_60: 40,
  HOURS_1_2: 75,
  HOURS_2_4: 130,
  HOURS_4_PLUS: 180,
};

/** Used when a recommendation carries no estimate of its own. */
const DEFAULT_ITEM_MINUTES = 25;

export function budgetMinutes(studyTime: DailyLearningTime | null): number | null {
  return studyTime ? MINUTES[studyTime] : null;
}

/**
 * Parses a display estimate like "45 minutes", "1 hour" or "4–6 hours".
 *
 * Content stores these as prose because they are describing effort rather than
 * promising a duration, so this reads the first number it can find and takes
 * the *lower* bound of a range. Anything it cannot parse falls back rather than
 * guessing — a wrong number here makes the plan lie about its total.
 */
export function estimateMinutes(estimate: string | null): number {
  if (!estimate) return DEFAULT_ITEM_MINUTES;

  const match = estimate.match(/(\d+)/);
  if (!match) return DEFAULT_ITEM_MINUTES;

  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_ITEM_MINUTES;

  // "1 hour", "4–6 hours", "2h" — anything mentioning hours is scaled.
  return /hour|hr\b|\dh\b/i.test(estimate) ? value * 60 : value;
}

/**
 * Builds a plan that fits the time the learner said they have.
 *
 * Takes recommendations in priority order and adds them while they fit, so the
 * most important thing is always first and always included — even when it
 * alone exceeds the budget, because omitting the one thing that matters to
 * respect an estimate would be the wrong trade.
 *
 * A project is never put in a daily plan as a whole: "build the Weather
 * Dashboard, 6 hours" is not a task, it is a wish. Projects appear as a
 * capped session instead.
 */
export function buildStudyPlan({
  recommendations,
  studyTime,
  maxItems = 3,
}: {
  recommendations: Recommendation[];
  studyTime: DailyLearningTime | null;
  maxItems?: number;
}): StudyPlan {
  const budget = budgetMinutes(studyTime);
  const items: PlanItem[] = [];
  let total = 0;

  for (const recommendation of recommendations) {
    if (items.length >= maxItems) break;

    const isProject =
      recommendation.type === "START_PROJECT" ||
      recommendation.type === "CONTINUE_PROJECT";

    // Projects are open-ended, so a plan commits to a session on one rather
    // than to finishing it.
    const minutes = isProject
      ? Math.min(45, budget ?? 45)
      : estimateMinutes(recommendation.estimatedTime);

    const isFirst = items.length === 0;
    const fits = budget === null || total + minutes <= budget;

    if (!isFirst && !fits) continue;

    items.push({
      type: recommendation.type,
      title: isProject
        ? `${recommendation.title} — a focused session`
        : recommendation.title,
      href: recommendation.href,
      minutes,
    });
    total += minutes;
  }

  return { budgetMinutes: budget, items, totalMinutes: total };
}

/** Rounds a total into something a person would say out loud. */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (rest === 0) return hours === 1 ? "1 hour" : `${hours} hours`;
  return `${hours}h ${rest}m`;
}

/**
 * Turns a week of recorded activity into counts.
 *
 * Every figure comes from UserActivity rows, so the summary can only ever
 * report things that actually happened. `isEmpty` exists so a quiet week is
 * met with something kind rather than a grid of zeroes — the product does not
 * shame people for the weeks they had other things on.
 */
export function summariseWeek({
  activities,
  from,
  to,
}: {
  activities: { type: string; createdAt: Date }[];
  from: Date;
  to: Date;
}): WeeklySummary {
  const count = (type: string) =>
    activities.filter((activity) => activity.type === type).length;

  const topicsCompleted = count("LESSON_COMPLETED");
  const problemsSolved = count("PROBLEM_SOLVED");
  const projectMilestones = count("PROJECT_MILESTONE_COMPLETED");
  const projectsCompleted = count("PROJECT_COMPLETED");
  const gitExercises = count("GIT_EXERCISE_COMPLETED");
  const aiProgress = count("AI_TOOL_STARTED") + count("AI_WORKFLOW_COMPLETED");

  return {
    from,
    to,
    topicsCompleted,
    problemsSolved,
    projectMilestones,
    projectsCompleted,
    gitExercises,
    aiProgress,
    isEmpty:
      topicsCompleted +
        problemsSolved +
        projectMilestones +
        projectsCompleted +
        gitExercises +
        aiProgress ===
      0,
  };
}
