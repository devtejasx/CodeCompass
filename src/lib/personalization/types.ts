/**
 * The vocabulary Phase 10 speaks in.
 *
 * Kept in its own module because the recommendation rules, the queries that
 * feed them, the React components that render them and the AI mentor that
 * explains them all need these types, and none of them should import each
 * other to get them.
 */

/**
 * Every action CodeCompass can recommend.
 *
 * A closed set on purpose. Each value corresponds to a real destination in the
 * product and a rule that can produce it; adding one means adding both, which
 * is the check that stops this becoming a list of vague intentions.
 */
export type NextActionType =
  | "START_CAREER"
  | "START_ROADMAP"
  | "CONTINUE_LESSON"
  | "PRACTICE_TOPIC"
  | "SOLVE_PROBLEM"
  | "START_PROJECT"
  | "CONTINUE_PROJECT"
  | "LEARN_GIT"
  | "CONNECT_GITHUB"
  | "LEARN_AI_TOOL"
  | "REVIEW_TOPIC"
  | "COMPLETE_ROADMAP_PHASE";

/**
 * A structured recommendation.
 *
 * `reason` is the part that matters and it is never optional. A recommendation
 * a learner cannot interrogate is an instruction, and the whole argument of
 * this phase is that the system should be able to show its working — built
 * from their actual progress, not from a model's opinion.
 *
 * The frontend renders these; it never computes them.
 */
export interface Recommendation {
  type: NextActionType;
  /** The topic, problem, project or tool this points at. Null for a route. */
  entityId: string | null;
  /** What to do, as a heading: "Continue JavaScript Functions". */
  title: string;
  /** Why, in the learner's own data. Shown under "Why this?". */
  reason: string;
  /** Button label. */
  action: string;
  href: string;
  /** Higher wins. See PRIORITY in ./recommend for the scale and its ordering. */
  priority: number;
  /** Display string from the content, never a computed guess. */
  estimatedTime: string | null;
}

/** Which of the six tracks a recommendation belongs to, for the secondary rows. */
export type RecommendationTrack =
  "LEARNING" | "PRACTICE" | "PROJECT" | "DEVELOPER_SKILLS" | "AI_SKILLS";

export interface TrackRecommendation {
  track: RecommendationTrack;
  recommendation: Recommendation;
}

/**
 * A concept the evidence suggests is worth revisiting.
 *
 * Deliberately about *evidence*, not ability. The wording rule this type
 * exists to enforce: describe what happened ("three attempts on array
 * problems"), never characterise the person ("you are bad at arrays").
 */
export interface KnowledgeGap {
  topicId: string;
  topicSlug: string;
  topicTitle: string;
  /** What was observed. Rendered verbatim, so it has to be factual. */
  evidence: string;
  /** How much evidence there is. Only STRONG produces a primary action. */
  strength: "WEAK" | "STRONG";
}

/** One item in Today's Plan. */
export interface PlanItem {
  /** Reuses the recommendation vocabulary so a plan item is always actionable. */
  type: NextActionType;
  title: string;
  href: string;
  minutes: number;
}

export interface StudyPlan {
  /** Minutes the learner said they have, from onboarding. Null if never asked. */
  budgetMinutes: number | null;
  items: PlanItem[];
  totalMinutes: number;
}

export interface WeeklySummary {
  from: Date;
  to: Date;
  topicsCompleted: number;
  problemsSolved: number;
  projectMilestones: number;
  projectsCompleted: number;
  gitExercises: number;
  aiProgress: number;
  /** True when nothing at all happened, so the UI can say so kindly. */
  isEmpty: boolean;
}
