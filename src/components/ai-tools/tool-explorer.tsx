"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import { ToolCard } from "@/components/ai-tools/tool-card";
import { aiToolIcon } from "@/lib/ai-tools/icons";
import {
  categoryCounts,
  EMPTY_FILTERS,
  filterTools,
  type AIToolFilters,
} from "@/lib/ai-tools/filter";
import {
  ENVIRONMENT_ORDER,
  ENVIRONMENT_SHORT,
  STATUS_LABEL,
  USE_CASE_LABEL,
  USE_CASE_ORDER,
} from "@/lib/ai-tools/labels";
import { DIFFICULTY_ORDER, DIFFICULTY_SHORT } from "@/lib/careers/labels";
import { cn } from "@/lib/utils";
import type { AIToolCategoryItem, AIToolListItem } from "@/lib/ai-tools/queries";

/**
 * The tool catalog, searched and filtered in the browser.
 *
 * Same call as the career explorer and the project browser: twenty tools is
 * small enough that filtering in memory beats a request per keystroke, so
 * typing here makes no network request at all. The predicate itself lives in
 * lib/ai-tools/filter so it is testable on its own and could move server-side
 * unchanged if the catalog ever outgrew that trade-off.
 *
 * Only the summary of each tool reaches the browser — the prose, capabilities
 * and limitations stay on the server until a detail page needs them.
 */
export function ToolExplorer({
  tools,
  categories,
}: {
  tools: AIToolListItem[];
  categories: AIToolCategoryItem[];
}) {
  const [filters, setFilters] = React.useState<AIToolFilters>(EMPTY_FILTERS);

  const visible = React.useMemo(() => filterTools(tools, filters), [tools, filters]);
  const counts = React.useMemo(() => categoryCounts(tools, filters), [tools, filters]);

  const update = React.useCallback(
    <K extends keyof AIToolFilters>(key: K, value: AIToolFilters[K]) => {
      setFilters((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const isFiltered =
    filters.query.trim().length > 0 ||
    filters.category !== "ALL" ||
    filters.useCase !== "ALL" ||
    filters.difficulty !== "ALL" ||
    filters.environment !== "ALL" ||
    filters.status !== "ALL";

  return (
    <div>
      {/* ── Search ───────────────────────────────────────────── */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
          aria-hidden
        />
        <label htmlFor="ai-tool-search" className="sr-only">
          Search AI tools
        </label>
        <input
          id="ai-tool-search"
          type="search"
          value={filters.query}
          onChange={(event) => update("query", event.target.value)}
          placeholder="Search tools, categories or what you want to do…"
          className="h-11 w-full rounded-xl border border-border bg-surface/60 pl-10 pr-4 text-sm text-foreground placeholder:text-subtle-foreground"
        />
      </div>

      {/* ── Categories ───────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Filter by category"
        className="mt-4 flex flex-wrap gap-1"
      >
        <CategoryTab
          active={filters.category === "ALL"}
          count={counts.ALL ?? 0}
          label="All tools"
          onSelect={() => update("category", "ALL")}
        />
        {categories.map((category) => {
          const Icon = aiToolIcon(category.icon);
          return (
            <CategoryTab
              key={category.slug}
              active={filters.category === category.slug}
              count={counts[category.slug] ?? 0}
              label={category.name}
              icon={<Icon className="size-3.5 shrink-0" aria-hidden />}
              onSelect={() => update("category", category.slug)}
            />
          );
        })}
      </div>

      {/* ── Secondary filters ────────────────────────────────── */}
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <Select
          id="ai-filter-use-case"
          label="Use case"
          value={filters.useCase}
          onChange={(value) => update("useCase", value as AIToolFilters["useCase"])}
          options={[
            { value: "ALL", label: "Any use case" },
            ...USE_CASE_ORDER.map((useCase) => ({
              value: useCase,
              label: USE_CASE_LABEL[useCase],
            })),
          ]}
        />

        <Select
          id="ai-filter-environment"
          label="Where"
          value={filters.environment}
          onChange={(value) =>
            update("environment", value as AIToolFilters["environment"])
          }
          options={[
            { value: "ALL", label: "Anywhere" },
            ...ENVIRONMENT_ORDER.map((environment) => ({
              value: environment,
              label: ENVIRONMENT_SHORT[environment],
            })),
          ]}
        />

        <Select
          id="ai-filter-difficulty"
          label="Difficulty"
          value={filters.difficulty}
          onChange={(value) => update("difficulty", value as AIToolFilters["difficulty"])}
          options={[
            { value: "ALL", label: "Any level" },
            ...DIFFICULTY_ORDER.map((difficulty) => ({
              value: difficulty,
              label: DIFFICULTY_SHORT[difficulty],
            })),
          ]}
        />

        <Select
          id="ai-filter-status"
          label="Status"
          value={filters.status}
          onChange={(value) => update("status", value as AIToolFilters["status"])}
          options={[
            { value: "ALL", label: "Any status" },
            { value: "ACTIVE", label: STATUS_LABEL.ACTIVE },
            { value: "BETA", label: STATUS_LABEL.BETA },
            { value: "DEPRECATED", label: STATUS_LABEL.DEPRECATED },
          ]}
        />

        {isFiltered ? (
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" aria-hidden />
            Clear filters
          </button>
        ) : null}
      </div>

      {/* ── Results ──────────────────────────────────────────── */}
      <p aria-live="polite" className="mt-6 text-sm text-subtle-foreground">
        {visible.length === 0
          ? "No tools match that."
          : `${visible.length} ${visible.length === 1 ? "tool" : "tools"}`}
      </p>

      {visible.length === 0 ? (
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Try a broader search, or clear the filters. The catalog is deliberately
          small — every tool in it has been checked against its own documentation
          rather than collected from a list.
        </p>
      ) : (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((tool) => (
            <li key={tool.slug} className="flex">
              <ToolCard tool={tool} className="w-full" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryTab({
  active,
  count,
  label,
  icon,
  onSelect,
}: {
  active: boolean;
  count: number;
  label: string;
  icon?: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onSelect}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors duration-200",
        active
          ? "bg-surface-raised text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
      <span className="font-mono text-xs text-subtle-foreground">{count}</span>
    </button>
  );
}

function Select({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="block text-xs font-medium uppercase tracking-label text-subtle-foreground"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-9 rounded-lg border border-border bg-surface/60 px-2.5 text-sm text-foreground"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
