"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { ProjectCard } from "@/components/projects/project-card";
import { cn } from "@/lib/utils";
import type { ProjectListItem } from "@/lib/projects/queries";

/**
 * The project catalog, filtered in the browser.
 *
 * Same call as the career explorer and the practice browser: 24 projects is
 * small enough that filtering in memory beats a request per keystroke, and the
 * predicate lives in one function so it could move server-side unchanged.
 */

type Filter =
  "ALL" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "IN_PROGRESS" | "COMPLETED";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "ALL", label: "All projects" },
  { id: "BEGINNER", label: "Beginner" },
  { id: "INTERMEDIATE", label: "Intermediate" },
  { id: "ADVANCED", label: "Advanced" },
  { id: "IN_PROGRESS", label: "In progress" },
  { id: "COMPLETED", label: "Completed" },
];

function matches(project: ProjectListItem, filter: Filter, query: string): boolean {
  const passesFilter =
    filter === "ALL" ||
    filter === project.difficulty ||
    (filter === "IN_PROGRESS" && project.status === "IN_PROGRESS") ||
    (filter === "COMPLETED" && project.status === "COMPLETED");

  if (!passesFilter) return false;
  if (query.trim().length === 0) return true;

  const needle = query.trim().toLowerCase();
  return (
    project.title.toLowerCase().includes(needle) ||
    project.shortDescription.toLowerCase().includes(needle) ||
    project.technologies.some((technology) =>
      technology.name.toLowerCase().includes(needle),
    )
  );
}

export function ProjectBrowser({ projects }: { projects: ProjectListItem[] }) {
  const [filter, setFilter] = React.useState<Filter>("ALL");
  const [query, setQuery] = React.useState("");

  const visible = React.useMemo(
    () => projects.filter((project) => matches(project, filter, query)),
    [projects, filter, query],
  );

  const counts = React.useMemo(
    () => ({
      ALL: projects.length,
      BEGINNER: projects.filter((p) => p.difficulty === "BEGINNER").length,
      INTERMEDIATE: projects.filter((p) => p.difficulty === "INTERMEDIATE").length,
      ADVANCED: projects.filter((p) => p.difficulty === "ADVANCED").length,
      IN_PROGRESS: projects.filter((p) => p.status === "IN_PROGRESS").length,
      COMPLETED: projects.filter((p) => p.status === "COMPLETED").length,
    }),
    [projects],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="tablist"
          aria-label="Filter projects"
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
          <label htmlFor="project-search" className="sr-only">
            Search projects
          </label>
          <input
            id="project-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects"
            className="h-9 w-full rounded-lg border border-border bg-surface/60 pl-9 pr-3 text-sm text-foreground placeholder:text-subtle-foreground"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No projects match that. Try a different filter or clear the search.
        </p>
      ) : (
        <ul
          aria-live="polite"
          className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          {visible.map((project) => (
            <li key={project.slug} className="flex">
              <ProjectCard project={project} className="w-full" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
