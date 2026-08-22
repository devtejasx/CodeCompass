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

/**
 * How many problems one visit to the catalog may fetch ahead.
 *
 * A learner opens one or two problems from a visit; the budget is set well
 * above that so it never gets in the way of ordinary browsing, and far below
 * three hundred so that dragging a pointer across the grid cannot turn into a
 * hundred server renders. When it runs out, links behave exactly as they did
 * before any of this: fetched on click.
 */
const PREFETCH_BUDGET = 24;

export function PracticeBrowser({ problems }: { problems: ProblemListItem[] }) {
  const [filter, setFilter] = React.useState<ProblemFilter>("ALL");
  const [query, setQuery] = React.useState("");

  /*
   * Shared across the cards, and a ref rather than state because spending a
   * unit of it must not re-render the list.
   */
  const budget = React.useRef(PREFETCH_BUDGET);

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
                  // tap-target: the tabs are 32px tall, which is right for the
                  // density they sit in and about 12px short of a reliable
                  // thumb. The utility grows the hit area on coarse pointers
                  // only, leaving the geometry alone. See globals.css.
                  "tap-target rounded-lg px-3 py-1.5 text-sm transition-colors duration-200",
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
            className="tap-target h-9 w-full rounded-lg border border-border bg-surface/60 pl-9 pr-3 text-base text-foreground placeholder:text-subtle-foreground sm:text-sm"
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
            <CatalogCard key={problem.slug} problem={problem} budget={budget} />
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * One catalog card, which fetches its problem when the learner shows interest.
 *
 * Three hundred links cannot all be prefetched - that would ask the server to
 * render three hundred problem pages so that one could be opened instantly,
 * which is a worse problem than the one prefetching solves. Nor can they be
 * left alone: `/practice/[slug]` deliberately has no loading.tsx (a Suspense
 * boundary above a page turns its notFound() into an HTTP 200), and without one
 * Next.js's default prefetch has nothing to fetch and returns an empty payload.
 * So the choice is a full prefetch or none, per link.
 *
 * Pointer, focus or touch is the earliest honest signal of intent, and it buys
 * most of the round trip: by the time the click lands the payload is usually
 * already in the router cache. Intent is held here rather than in the parent so
 * that hovering one card re-renders one card, not the whole grid.
 */
const CatalogCard = React.memo(function CatalogCard({
  problem,
  budget,
}: {
  problem: ProblemListItem;
  budget: React.RefObject<number>;
}) {
  const [intent, setIntent] = React.useState(false);

  const claim = React.useCallback(() => {
    if (intent || budget.current <= 0) return;
    budget.current -= 1;
    setIntent(true);
  }, [budget, intent]);

  return (
    <li
      className="flex"
      onMouseEnter={claim}
      onTouchStart={claim}
      // Capture, because the focusable element is the link inside the card.
      // Keyboard browsing should prefetch for the same reason pointing does.
      onFocusCapture={claim}
    >
      <ProblemCard problem={problem} className="w-full" prefetch={intent} />
    </li>
  );
});
