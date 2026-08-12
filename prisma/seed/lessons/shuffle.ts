import type { SeedKnowledgeCheck } from "./types";

/**
 * Where a question's correct answer sits among its options.
 *
 * Lessons are authored with the correct option written first, which is the
 * only sane way to write and review them — a reviewer can check the answer
 * key by reading down the left edge. Seeded verbatim, though, that habit
 * became a defect: across the whole curriculum the answer was option one
 * every single time, so a learner who noticed could pass every knowledge
 * check in CodeCompass without reading a question.
 *
 * The options are therefore rotated when they are seeded, and the *stored*
 * order is what varies. Nothing downstream changes: the query still orders by
 * `order`, the page still renders them in that order, and grading still
 * compares option ids, so this is invisible to every other layer.
 *
 * Two properties make the rotation safe.
 *
 * **Deterministic.** The offset comes from the question text, so the same
 * question always lands the same way. Re-seeding does not reshuffle a course
 * under a learner mid-way, and a screenshot in a bug report still matches.
 *
 * **Order-preserving.** It is a rotation, not a shuffle. Options are often
 * written to read as a sequence — three plausible near-misses after the
 * answer, or a numeric progression — and a true shuffle would scramble that
 * into nonsense. Rotating keeps every option's neighbours intact and only
 * changes where the list starts.
 */

/**
 * FNV-1a. Small, dependency-free, and good enough to spread short strings
 * across a handful of buckets — this decides where an answer sits, not
 * anything a person could gain from predicting.
 */
function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

/** The authored options, rotated by an offset derived from the question. */
export function positionOptions(
  check: SeedKnowledgeCheck,
): SeedKnowledgeCheck["options"] {
  const { options, question } = check;
  if (options.length < 2) return options;

  const offset = hash(question) % options.length;
  if (offset === 0) return options;

  return [...options.slice(offset), ...options.slice(0, offset)];
}

/**
 * Which option index holds the answer, per question — for the test that
 * asserts the whole curriculum is not answerable by picking the same
 * position every time.
 */
export function answerPositions(checks: SeedKnowledgeCheck[]): number[] {
  return checks.map((check) =>
    positionOptions(check).findIndex((option) => option.isCorrect),
  );
}
