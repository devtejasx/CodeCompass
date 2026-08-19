import type { SeedProblem } from "../../problems/types";

import { ARRAY_PROBLEMS } from "./arrays";
import { BINARY_SEARCH_PROBLEMS } from "./binary-search";
import { HASHING_PROBLEMS } from "./hashing";
import { LINKED_LIST_PROBLEMS } from "./linked-list";
import { PREFIX_SUM_PROBLEMS } from "./prefix-sum";
import { SLIDING_WINDOW_PROBLEMS } from "./sliding-window";
import { SORTING_PROBLEMS } from "./sorting";
import { STACK_PROBLEMS } from "./stack";
import { STRING_PROBLEMS } from "./strings";
import { TWO_POINTER_PROBLEMS } from "./two-pointers";

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
export const INTERVIEW_PROBLEMS: SeedProblem[] = [
  // Data you can hold
  ...ARRAY_PROBLEMS,
  ...HASHING_PROBLEMS,
  ...STRING_PROBLEMS,

  // Scanning techniques
  ...TWO_POINTER_PROBLEMS,
  ...SLIDING_WINDOW_PROBLEMS,
  ...PREFIX_SUM_PROBLEMS,

  // Order and search
  ...SORTING_PROBLEMS,
  ...BINARY_SEARCH_PROBLEMS,

  // Linear structures
  ...LINKED_LIST_PROBLEMS,
  ...STACK_PROBLEMS,
];
