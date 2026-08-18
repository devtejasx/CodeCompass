import type { SeedProblem } from "../../problems/types";

/**
 * The interview catalog, one file per pattern.
 *
 * Split by *pattern* rather than by difficulty, unlike the original easy/medium
 * split next door. What makes these problems a set is the technique they
 * practise: a file opens with the easiest problem that teaches the pattern and
 * ends with the hardest that combines it, which is also the order a learner
 * should meet them in. Difficulty is a filter on the page, not an organising
 * principle for the content.
 *
 * The order of this array is the order of the catalog — `sortOrder` comes from
 * array position at seed time — so it follows the roadmap's phases: data
 * shapes, scanning, order and search, linear structures, greedy, recursion,
 * trees, heaps, graphs, specialised structures, dynamic programming.
 */
export const INTERVIEW_PROBLEMS: SeedProblem[] = [];
