"use client";

import * as React from "react";
import { AlertTriangle, Search } from "lucide-react";

import {
  COMMAND_CATEGORIES,
  searchCommands,
  type CommandCategory,
} from "@/lib/git/commands";
import { cn } from "@/lib/utils";

/**
 * The searchable command reference.
 *
 * Filtered in the browser over twenty-eight entries — a request per keystroke
 * would be absurd at this size. The search covers the mistake text as well as
 * the command and its purpose, so looking up "force" or "secrets" finds the
 * entries that warn about them rather than only the ones named after them.
 */
export function CommandReference() {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<CommandCategory | "All">("All");

  const results = React.useMemo(
    () => searchCommands(query, category),
    [query, category],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="tablist"
          aria-label="Command category"
          className="flex flex-wrap gap-1"
        >
          {(["All", ...COMMAND_CATEGORIES] as const).map((entry) => {
            const active = category === entry;
            return (
              <button
                key={entry}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(entry)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors duration-200",
                  active
                    ? "bg-surface-raised text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {entry}
              </button>
            );
          })}
        </div>

        <div className="relative ml-auto w-full sm:w-60">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle-foreground"
            aria-hidden
          />
          <label htmlFor="command-search" className="sr-only">
            Search commands
          </label>
          <input
            id="command-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search commands"
            className="h-9 w-full rounded-lg border border-border bg-surface/60 pl-9 pr-3 text-sm text-foreground placeholder:text-subtle-foreground"
          />
        </div>
      </div>

      {results.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Nothing matches that. Try a different word, or clear the filter.
        </p>
      ) : (
        <ul aria-live="polite" className="mt-6 grid gap-3 lg:grid-cols-2">
          {results.map((entry) => (
            <li
              key={entry.command}
              className="surface flex flex-col gap-3 rounded-xl p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <code className="rounded-md border border-border bg-[#0B0B0F] px-2 py-1 font-mono text-sm text-indigo-300">
                  {entry.command}
                </code>
                <span className="text-xs text-subtle-foreground">{entry.category}</span>
                {entry.destructive ? (
                  // Named in words, not just coloured — this one matters.
                  <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/25 bg-rose-500/[0.08] px-2 py-0.5 text-xs font-medium text-rose-300">
                    <AlertTriangle className="size-3" aria-hidden />
                    Can destroy work
                  </span>
                ) : null}
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {entry.purpose}
              </p>

              <pre className="overflow-x-auto rounded-lg border border-border bg-[#0B0B0F] p-3 font-mono text-xs leading-relaxed text-white/85">
                {entry.example}
              </pre>

              <p className="text-xs leading-relaxed text-amber-300/90">
                <span className="font-medium">Common mistake: </span>
                {entry.mistake}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
