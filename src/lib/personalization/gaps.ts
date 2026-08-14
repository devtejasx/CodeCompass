import { PASSING_SCORE } from "@/lib/learn/progress";

import type { KnowledgeGap } from "./types";

/**
 * Evidence-based knowledge gaps.
 *
 * Two rules govern everything in this file.
 *
 * **Only real evidence counts.** A gap is produced from repeated, recorded
 * attempts — a knowledge check failed several times, or a set of problems on
 * one topic attempted and not solved. Nothing is inferred from how long
 * somebody took, how often they log in, or what they have not done yet.
 *
 * **Describe the evidence, never the person.** The `evidence` string is
 * rendered verbatim, so it is written as an observation: "you have attempted
 * three problems on Arrays without solving one". Never "you are struggling
 * with arrays" and never "you are weak at JavaScript". The difference is the
 * whole reason this is a separate module with its own tests — it is very easy
 * to write a well-meaning sentence that reads as a judgement.
 *
 * Kept pure so both rules can be tested without a database.
 */

/** Failing a check this many times is a signal rather than a bad day. */
const FAILED_ATTEMPTS_THRESHOLD = 3;

/** Unsolved problems on one topic before it is worth mentioning. */
const UNSOLVED_PROBLEMS_THRESHOLD = 2;

/** Total attempts across a topic's problems before it is worth mentioning. */
const PROBLEM_ATTEMPTS_THRESHOLD = 4;

export interface TopicAttemptEvidence {
  topicId: string;
  topicSlug: string;
  topicTitle: string;
  /** Knowledge-check attempts on this topic. */
  attempts: number;
  /** Best knowledge-check score, or null if never attempted. */
  bestScore: number | null;
  /** Whether the topic is recorded as complete. */
  completed: boolean;
  /** Problems on this topic the learner has attempted but not solved. */
  unsolvedProblems: number;
  /** Total submissions across this topic's problems. */
  problemAttempts: number;
}

/**
 * Turns recorded attempts into gaps worth surfacing.
 *
 * Only STRONG gaps ever produce a primary recommendation; WEAK ones are
 * available to the mentor as context but are not put in front of the learner
 * as an instruction, because one bad afternoon is not a knowledge gap.
 *
 * Ordered strongest first so a caller can take the head without re-sorting.
 */
export function detectGaps(evidence: TopicAttemptEvidence[]): KnowledgeGap[] {
  const gaps: KnowledgeGap[] = [];

  for (const row of evidence) {
    // A repeatedly failed knowledge check on a topic that is still not
    // complete. If they eventually passed, there is no gap to report — they
    // got there, which is what learning looks like.
    if (
      !row.completed &&
      row.attempts >= FAILED_ATTEMPTS_THRESHOLD &&
      row.bestScore !== null &&
      row.bestScore < PASSING_SCORE
    ) {
      gaps.push({
        topicId: row.topicId,
        topicSlug: row.topicSlug,
        topicTitle: row.topicTitle,
        evidence: `You have taken the ${row.topicTitle} knowledge check ${row.attempts} times, with a best score of ${row.bestScore}%.`,
        strength: "STRONG",
      });
      continue;
    }

    // Several problems on one topic attempted and not solved. Both thresholds
    // have to be met: two problems opened once each is browsing, whereas four
    // submissions across two unsolved problems is someone genuinely stuck.
    if (
      row.unsolvedProblems >= UNSOLVED_PROBLEMS_THRESHOLD &&
      row.problemAttempts >= PROBLEM_ATTEMPTS_THRESHOLD
    ) {
      gaps.push({
        topicId: row.topicId,
        topicSlug: row.topicSlug,
        topicTitle: row.topicTitle,
        evidence: `You have made ${row.problemAttempts} attempts across ${row.unsolvedProblems} ${row.topicTitle} problems without solving them yet.`,
        strength: "STRONG",
      });
      continue;
    }

    // Enough to mention to the mentor, not enough to redirect the learner.
    if (row.unsolvedProblems >= 1 && row.problemAttempts >= 2) {
      gaps.push({
        topicId: row.topicId,
        topicSlug: row.topicSlug,
        topicTitle: row.topicTitle,
        evidence: `You have attempted ${row.topicTitle} practice without solving it yet.`,
        strength: "WEAK",
      });
    }
  }

  return gaps.sort((a, b) =>
    a.strength === b.strength ? 0 : a.strength === "STRONG" ? -1 : 1,
  );
}
