import type { SeedProblem } from "../../problems/types";

import { ARRAY_PROBLEMS } from "./arrays";
import { BACKTRACKING_PROBLEMS } from "./backtracking";
import { BINARY_TREE_PROBLEMS } from "./binary-tree";
import { BIT_MANIPULATION_PROBLEMS } from "./bit-manipulation";
import { BST_PROBLEMS } from "./bst";
import { BINARY_SEARCH_PROBLEMS } from "./binary-search";
import { DP_1D_PROBLEMS } from "./dp-1d";
import { DP_2D_PROBLEMS } from "./dp-2d";
import { DP_ADVANCED_PROBLEMS } from "./dp-advanced";
import { GRAPH_BFS_PROBLEMS } from "./graph-bfs";
import { GRAPH_DFS_PROBLEMS } from "./graph-dfs";
import { GREEDY_PROBLEMS } from "./greedy";
import { HASHING_PROBLEMS } from "./hashing";
import { HEAP_PROBLEMS } from "./heap";
import { INTERVAL_PROBLEMS } from "./intervals";
import { LINKED_LIST_PROBLEMS } from "./linked-list";
import { MONOTONIC_STACK_PROBLEMS } from "./monotonic-stack";
import { PREFIX_SUM_PROBLEMS } from "./prefix-sum";
import { QUEUE_DEQUE_PROBLEMS } from "./queue-deque";
import { RECURSION_PROBLEMS } from "./recursion";
import { SHORTEST_PATH_PROBLEMS } from "./shortest-path";
import { SLIDING_WINDOW_PROBLEMS } from "./sliding-window";
import { SORTING_PROBLEMS } from "./sorting";
import { STACK_PROBLEMS } from "./stack";
import { STRING_PROBLEMS } from "./strings";
import { TOPOLOGICAL_SORT_PROBLEMS } from "./topological-sort";
import { TREE_PATH_PROBLEMS } from "./tree-paths";
import { TRIE_PROBLEMS } from "./trie";
import { TREE_TRAVERSAL_PROBLEMS } from "./tree-traversal";
import { TWO_POINTER_PROBLEMS } from "./two-pointers";
import { UNION_FIND_PROBLEMS } from "./union-find";

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
  ...MONOTONIC_STACK_PROBLEMS,
  ...QUEUE_DEQUE_PROBLEMS,

  // Choosing greedily
  ...INTERVAL_PROBLEMS,
  ...GREEDY_PROBLEMS,

  // Recursion and search
  ...RECURSION_PROBLEMS,
  ...BACKTRACKING_PROBLEMS,

  // Trees
  ...BINARY_TREE_PROBLEMS,
  ...TREE_TRAVERSAL_PROBLEMS,
  ...BST_PROBLEMS,
  ...TREE_PATH_PROBLEMS,

  // Priority
  ...HEAP_PROBLEMS,

  // Graphs
  ...GRAPH_DFS_PROBLEMS,
  ...GRAPH_BFS_PROBLEMS,
  ...TOPOLOGICAL_SORT_PROBLEMS,
  ...UNION_FIND_PROBLEMS,
  ...SHORTEST_PATH_PROBLEMS,

  // Specialised structures
  ...TRIE_PROBLEMS,
  ...BIT_MANIPULATION_PROBLEMS,

  // Dynamic programming
  ...DP_1D_PROBLEMS,
  ...DP_2D_PROBLEMS,
  ...DP_ADVANCED_PROBLEMS,
];
