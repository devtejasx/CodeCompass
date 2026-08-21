"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { ProblemCard } from "@/components/practice/problem-card";
import { cn } from "@/lib/utils";
import type { ProblemListItem } from "@/lib/practice/queries";
import {
  PROBLEM_FILTERS,
  countByFilter,
  matchesFilter,
  type ProblemFilter,
} from "@/lib/practice/filter";

/**
 * The problem catalog, filtered in the browser.
 *
 * Still filtered in memory at three hundred problems, because what is shipped
 * is metadata — a title, a difficulty, a few topic names — and not the
 * statements. See listProblems for what is deliberately left out. Filtering
 * here rather than server-side keeps typing instant.
 *
 * The rule itself lives in lib/practice/filter, which is what makes it
 * testable: while it was a local function in this client component, the only
 * way to assert "the Hard tab shows exactly the Hard problems" was to
 * reimplement the predicate in the test and watch the copy agree with itself.
 * This component now owns the two pieces of state and the markup, and nothing
 * about which problems match.
 *
 * "Hard" joins the difficulty filters now that the catalog has forty of them.
 * It is the same filter the other two already were, not a new kind of control.
 */

export function PracticeBrowser({ problems }: { problems: ProblemListItem[] }) {
  const [filter, setFilter] = React.useState<ProblemFilter>("ALL");
  const [query, setQuery] = React.useState("");

  const visible = React.useMemo(
    () => problems.filter((problem) => matchesFilter(problem, filter, query)),
    [problems, filter, query],
  );

  const counts = React.useMemo(() => countByFilter(problems), [problems]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="tablist"
          aria-label="Filter problems"
          className="flex flex-wrap gap-1"
        >
          {PROBLEM_FILTERS.map((entry) => {
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
