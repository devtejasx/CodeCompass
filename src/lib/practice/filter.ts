import type { ProblemDifficulty, ProblemStatus } from "@/generated/prisma/client";

/**
 * Which problems the catalog shows for a given tab and search box.
 *
 * This is the rule the Practice page has always applied; what is new is that it
 * is reachable from a test. It used to live inside PracticeBrowser, a client
 * component, where the only way to check "does the Hard tab show exactly the
 * Hard problems?" was to reimplement the predicate in the test and assert that
 * the copy agreed with itself. Moving it here is the same trick recommend.ts
 * already uses: the ranking is pure and lives in lib, the component renders it.
 *
 * Deliberately structural rather than typed against ProblemListItem, so the
 * catalog projection can gain or lose a column without this file caring.
 */

export type ProblemFilter =
  | "ALL"
  | "EASY"
  | "MEDIUM"
  | "HARD"
  | "SOLVED"
  | "ATTEMPTED";

export interface FilterableProblem {
  title: string;
  difficulty: ProblemDifficulty;
  status: ProblemStatus;
  /** Topic titles are searched too, so "graph" finds a pattern's problems. */
  topics: { title: string }[];
}

/** The tabs, in the order they are shown. */
export const PROBLEM_FILTERS: { id: ProblemFilter; label: string }[] = [
  { id: "ALL", label: "All problems" },
  { id: "EASY", label: "Easy" },
  { id: "MEDIUM", label: "Medium" },
  { id: "HARD", label: "Hard" },
  { id: "SOLVED", label: "Solved" },
  { id: "ATTEMPTED", label: "Attempted" },
];

/**
 * Whether one problem survives the current tab and query.
 *
 * Difficulty tabs read the difficulty the database gave the problem, and the
 * two progress tabs read the status folded in by listProblems — no second
 * notion of solved lives here.
 */
export function matchesFilter(
  problem: FilterableProblem,
  filter: ProblemFilter,
  query: string,
): boolean {
  const passesFilter =
    filter === "ALL" ||
    (filter === "EASY" && problem.difficulty === "EASY") ||
    (filter === "MEDIUM" && problem.difficulty === "MEDIUM") ||
    (filter === "HARD" && problem.difficulty === "HARD") ||
    (filter === "SOLVED" && problem.status === "SOLVED") ||
    (filter === "ATTEMPTED" && problem.status === "ATTEMPTED");

  if (!passesFilter) return false;

  const needle = query.trim().toLowerCase();
  if (needle.length === 0) return true;

  // Both sides are lowercased, so the search is case-insensitive in each
  // direction — typing "DYNAMIC" finds the same problems as "dynamic".
  return (
    problem.title.toLowerCase().includes(needle) ||
    problem.topics.some((topic) => topic.title.toLowerCase().includes(needle))
  );
}

/** The number beside each tab. Counts ignore the search box, as the UI does. */
export function countByFilter(
  problems: FilterableProblem[],
): Record<ProblemFilter, number> {
  return {
    ALL: problems.length,
    EASY: problems.filter((problem) => problem.difficulty === "EASY").length,
    MEDIUM: problems.filter((problem) => problem.difficulty === "MEDIUM").length,
    HARD: problems.filter((problem) => problem.difficulty === "HARD").length,
    SOLVED: problems.filter((problem) => problem.status === "SOLVED").length,
    ATTEMPTED: problems.filter((problem) => problem.status === "ATTEMPTED").length,
  };
}
