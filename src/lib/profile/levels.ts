import type { CapabilityLevel } from "@/generated/prisma/client";

/**
 * How a capability level is decided.
 *
 * Deterministic rules over counted evidence. No model is consulted, and that is
 * not a performance decision: a level is a claim CodeCompass makes about what
 * somebody can do, and it has to be defensible by pointing at the specific work
 * that produced it. "The AI thought you seemed confident" is not defensible.
 *
 * The rules are deliberately hard to satisfy at the top. CONFIDENT requires
 * completed topics, solved practice *and* more than one finished project —
 * which most learners will not reach on most capabilities, and should not.
 * Telling a beginner they are an expert is not encouragement; it is setting
 * them up to be caught out in a room full of people who are.
 *
 * Kept pure so every rule is testable without a database.
 */

/**
 * What a learner has actually done towards one capability.
 *
 * Every field is a count of real records: completed topics, solved problems,
 * finished projects. Nothing is weighted, scaled or estimated — the numbers are
 * shown to the learner as their evidence, so they have to be literally true.
 */
export interface CapabilityEvidence {
  topicsCompleted: number;
  topicsTotal: number;
  /** Topics started but not finished. Counts towards EXPLORING only. */
  topicsInProgress: number;

  problemsSolved: number;
  problemsTotal: number;
  /** Attempted but not solved. Counts towards EXPLORING only. */
  problemsAttempted: number;

  projectsCompleted: number;
  projectsTotal: number;
  projectsInProgress: number;

  gitExercisesCompleted: number;
  gitExercisesTotal: number;

  aiToolsCompleted: number;
  aiToolsTotal: number;
  aiWorkflowsCompleted: number;
  aiWorkflowsTotal: number;
}

/**
 * A fresh zeroed record.
 *
 * A function rather than a shared constant on purpose: the counter accumulates
 * into it, and a module-level object would be mutated across every capability
 * on the page.
 */
export function emptyEvidence(): CapabilityEvidence {
  return {
    topicsCompleted: 0,
    topicsTotal: 0,
    topicsInProgress: 0,
    problemsSolved: 0,
    problemsTotal: 0,
    problemsAttempted: 0,
    projectsCompleted: 0,
    projectsTotal: 0,
    projectsInProgress: 0,
    gitExercisesCompleted: 0,
    gitExercisesTotal: 0,
    aiToolsCompleted: 0,
    aiToolsTotal: 0,
    aiWorkflowsCompleted: 0,
    aiWorkflowsTotal: 0,
  };
}

/** Practice needed before a capability counts as practised rather than read. */
const PRACTICE_THRESHOLD = 2;

/**
 * The level, or null when there is no evidence at all.
 *
 * Null is a real answer and is rendered as "not started" rather than as
 * EXPLORING — a capability somebody has never touched should not appear on
 * their profile as though they had begun it.
 *
 * The ladder:
 *
 *   EXPLORING   something started, nothing finished
 *   LEARNING    the knowledge: at least one topic (or Git/AI item) completed
 *   PRACTICING  + applied it in exercises: solved problems, Git exercises,
 *               or AI workflows actually used
 *   APPLYING    + built something with it: a finished project, or — for
 *               capabilities with no projects — everything else complete
 *   CONFIDENT   + more than one finished project, and all the knowledge done
 *
 * Capabilities differ in which dimensions they even have: Git has exercises but
 * no projects, Project Development has projects but no topics. Each rung
 * therefore asks "is there evidence of this *kind* of work", and a capability
 * with no sources of a kind is not penalised for it.
 */
export function calculateLevel(evidence: CapabilityEvidence): CapabilityLevel | null {
  const {
    topicsCompleted,
    topicsTotal,
    topicsInProgress,
    problemsSolved,
    problemsTotal,
    problemsAttempted,
    projectsCompleted,
    projectsInProgress,
    projectsTotal,
    gitExercisesCompleted,
    aiToolsCompleted,
    aiWorkflowsCompleted,
  } = evidence;

  const started =
    topicsCompleted +
      topicsInProgress +
      problemsSolved +
      problemsAttempted +
      projectsCompleted +
      projectsInProgress +
      gitExercisesCompleted +
      aiToolsCompleted +
      aiWorkflowsCompleted >
    0;

  if (!started) return null;

  // Knowledge: a completed topic, or — for capabilities that have no topics,
  // like Project Development — a completed tool path or Git exercise.
  const hasKnowledge =
    topicsCompleted > 0 || aiToolsCompleted > 0 || gitExercisesCompleted > 0;

  if (!hasKnowledge && projectsCompleted === 0) return "EXPLORING";

  // Practice: exercising the knowledge rather than only reading it. Different
  // kinds of capability are practised differently, so any of these counts.
  //
  // Tracked separately from the project signal because the two are used for
  // different questions below, and conflating them lets a project unlock its
  // own gate.
  const hasNonProjectPractice =
    problemsSolved >= PRACTICE_THRESHOLD ||
    gitExercisesCompleted >= PRACTICE_THRESHOLD ||
    aiWorkflowsCompleted >= PRACTICE_THRESHOLD;

  // Building something with a technology is the most direct practice there is,
  // so a finished project counts towards PRACTICING on its own.
  const hasPractice = hasNonProjectPractice || projectsCompleted > 0;

  // Application: something finished and shippable.
  //
  // A completed project is not on its own enough when the capability has
  // material to cover. The ladder is cumulative — APPLYING claims "I learned
  // it, practised it and built with it" — so somebody who finished a portfolio
  // without completing a single HTML or CSS topic is PRACTICING, not APPLYING.
  // Reading "Applying" beside "0/13 topics" is the kind of overclaim that makes
  // a learner stop trusting the rest of the page.
  //
  // A capability with no material of its own is the exception: Project
  // Development has only projects, so a finished project is the strongest
  // evidence that exists for it.
  const hasMaterial = topicsTotal > 0 || problemsTotal > 0;
  // Note `hasNonProjectPractice`, not `hasPractice`: the project must be
  // backed by something other than itself.
  const appliedByProject =
    projectsCompleted > 0 && (!hasMaterial || hasKnowledge || hasNonProjectPractice);

  const appliedWithoutProjects =
    projectsTotal === 0 &&
    hasPractice &&
    topicsTotal > 0 &&
    topicsCompleted >= topicsTotal;

  const hasApplication = appliedByProject || appliedWithoutProjects;

  if (!hasPractice && !hasApplication) return "LEARNING";
  if (!hasApplication) return "PRACTICING";

  // The top rung is deliberately narrow: more than one finished project *and*
  // the knowledge actually complete. Anything less is APPLYING, which is
  // already a strong and honest claim.
  const allKnowledgeDone = topicsTotal === 0 || topicsCompleted >= topicsTotal;
  if (projectsCompleted >= 2 && allKnowledgeDone && hasPractice) return "CONFIDENT";

  return "APPLYING";
}

export const LEVEL_LABEL: Record<CapabilityLevel, string> = {
  EXPLORING: "Exploring",
  LEARNING: "Learning",
  PRACTICING: "Practicing",
  APPLYING: "Applying",
  CONFIDENT: "Confident",
};

/** What each level actually claims, so the word is never ambiguous. */
export const LEVEL_DESCRIPTION: Record<CapabilityLevel, string> = {
  EXPLORING: "You have started looking at this.",
  LEARNING: "You have completed the material and understand the ideas.",
  PRACTICING: "You have applied it in exercises, not only read about it.",
  APPLYING: "You have used it to build something that works.",
  CONFIDENT: "You have built with it more than once, and covered the material.",
};

/** Rank, for sorting strongest first. */
export const LEVEL_RANK: Record<CapabilityLevel, number> = {
  EXPLORING: 1,
  LEARNING: 2,
  PRACTICING: 3,
  APPLYING: 4,
  CONFIDENT: 5,
};

/**
 * A rough progress figure for the level bar.
 *
 * Presentational only — the evidence counts underneath are the real answer, and
 * they are always shown next to it. A single percentage for "how much of React
 * can you do" would be a made-up number, so this maps the rungs of a ladder the
 * learner can see rather than pretending to measure a continuum.
 */
export const LEVEL_PERCENT: Record<CapabilityLevel, number> = {
  EXPLORING: 15,
  LEARNING: 40,
  PRACTICING: 60,
  APPLYING: 80,
  CONFIDENT: 100,
};

/**
 * The next rung, and what would reach it.
 *
 * Returned as structured data rather than a sentence so the caller can render
 * it beside a real link. Null when the learner is already at the top.
 */
export function nextLevelHint(
  level: CapabilityLevel | null,
  evidence: CapabilityEvidence,
): { level: CapabilityLevel; requirement: string } | null {
  if (level === "CONFIDENT") return null;

  if (level === null || level === "EXPLORING") {
    return {
      level: "LEARNING",
      requirement:
        evidence.topicsTotal > 0
          ? "Complete a topic that covers this."
          : "Complete one of the linked learning paths.",
    };
  }

  if (level === "LEARNING") {
    if (evidence.problemsTotal > 0) {
      return {
        level: "PRACTICING",
        requirement: `Solve ${PRACTICE_THRESHOLD} practice problems on this.`,
      };
    }
    if (evidence.gitExercisesTotal > 0) {
      return {
        level: "PRACTICING",
        requirement: `Complete ${PRACTICE_THRESHOLD} of the Git exercises.`,
      };
    }
    return {
      level: "PRACTICING",
      requirement: `Use ${PRACTICE_THRESHOLD} of the linked AI workflows.`,
    };
  }

  if (level === "PRACTICING") {
    // A learner who finished a project without covering the material is held
    // at PRACTICING by the *knowledge*, not by the project — so telling them
    // to build something they have already built would be useless advice.
    const projectDone = evidence.projectsCompleted > 0;
    const knowledgeMissing =
      evidence.topicsTotal > 0 && evidence.topicsCompleted === 0;

    if (projectDone && knowledgeMissing) {
      return {
        level: "APPLYING",
        requirement:
          "Complete a topic that covers this — you have built with it, but not yet studied it.",
      };
    }

    return {
      level: "APPLYING",
      requirement:
        evidence.projectsTotal > 0
          ? "Complete a project that uses this."
          : "Finish the remaining material for this capability.",
    };
  }

  // APPLYING → CONFIDENT
  const remainingTopics = Math.max(0, evidence.topicsTotal - evidence.topicsCompleted);
  return {
    level: "CONFIDENT",
    requirement:
      remainingTopics > 0
        ? `Complete a second project and the remaining ${remainingTopics} ${remainingTopics === 1 ? "topic" : "topics"}.`
        : "Complete a second project that uses this.",
  };
}
