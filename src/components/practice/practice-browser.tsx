"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { ProblemCard } from "@/components/practice/problem-card";
import { cn } from "@/lib/utils";
import type { ProblemListItem } from "@/lib/practice/queries";

/**
 * The problem catalog, filtered in the browser.
 *
 * Still filtered in memory at three hundred problems, because what is shipped
 * is metadata — a title, a difficulty, a few topic names — and not the
 * statements. See listProblems for what is deliberately left out. Filtering
 * here rather than server-side keeps typing instant; the predicates live in
 * `matches` below so they stay easy to move if the catalog grows again.
 *
 * "Hard" joins the difficulty filters now that the catalog has forty of them.
 * It is the same filter the other two already were, not a new kind of control.
 */

type Filter = "ALL" | "EASY" | "MEDIUM" | "HARD" | "SOLVED" | "ATTEMPTED";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "ALL", label: "All problems" },
  { id: "EASY", label: "Easy" },
  { id: "MEDIUM", label: "Medium" },
  { id: "HARD", label: "Hard" },
  { id: "SOLVED", label: "Solved" },
  { id: "ATTEMPTED", label: "Attempted" },
];

function matches(problem: ProblemListItem, filter: Filter, query: string): boolean {
  const passesFilter =
    filter === "ALL" ||
    (filter === "EASY" && problem.difficulty === "EASY") ||
    (filter === "MEDIUM" && problem.difficulty === "MEDIUM") ||
    (filter === "HARD" && problem.difficulty === "HARD") ||
    (filter === "SOLVED" && problem.status === "SOLVED") ||
    (filter === "ATTEMPTED" && problem.status === "ATTEMPTED");

  if (!passesFilter) return false;
  if (query.trim().length === 0) return true;

  // Topic titles are searched as well as problem titles, so "graph", "sliding
  // window" or "dynamic programming" find a pattern's problems without the
  // learner having to know any of their names.
  const needle = query.trim().toLowerCase();
  return (
    problem.title.toLowerCase().includes(needle) ||
    problem.topics.some((topic) => topic.title.toLowerCase().includes(needle))
  );
}

export function PracticeBrowser({ problems }: { problems: ProblemListItem[] }) {
  const [filter, setFilter] = React.useState<Filter>("ALL");
  const [query, setQuery] = React.useState("");

  const visible = React.useMemo(
    () => problems.filter((problem) => matches(problem, filter, query)),
    [problems, filter, query],
  );

  const counts = React.useMemo(
    () => ({
      ALL: problems.length,
      EASY: problems.filter((problem) => problem.difficulty === "EASY").length,
      MEDIUM: problems.filter((problem) => problem.difficulty === "MEDIUM").length,
      HARD: problems.filter((problem) => problem.difficulty === "HARD").length,
      SOLVED: problems.filter((problem) => problem.status === "SOLVED").length,
      ATTEMPTED: problems.filter((problem) => problem.status === "ATTEMPTED").length,
    }),
    [problems],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="tablist"
          aria-label="Filter problems"
          className="flex flex-wrap gap-1"
        >
          {FILTERS.map((entry) => {
            const active = filter === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(entry.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors duration-200",
                  active
                    ? "bg-surface-raised text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {entry.label}
                <span className="ml-1.5 font-mono text-xs text-subtle-foreground">
                  {counts[entry.id]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative ml-auto w-full sm:w-56">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle-foreground"
            aria-hidden
          />
          <label htmlFor="problem-search" className="sr-only">
            Search problems
          </label>
          <input
            id="problem-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search problems"
            className="h-9 w-full rounded-lg border border-border bg-surface/60 pl-9 pr-3 text-sm text-foreground placeholder:text-subtle-foreground"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No problems match that. Try a different filter or clear the search.
        </p>
      ) : (
        <ul
          // Announced so a screen-reader user knows the list changed under them.
          aria-live="polite"
          className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          {visible.map((problem) => (
            <li key={problem.slug} className="flex">
              <ProblemCard problem={problem} className="w-full" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
