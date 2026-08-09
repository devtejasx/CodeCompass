"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GitCompareArrows, Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CareerCard } from "@/components/careers/career-card";
import { filterCareers } from "@/lib/careers/filter";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  DIFFICULTY_ORDER,
  DIFFICULTY_SHORT,
} from "@/lib/careers/labels";
import { cn } from "@/lib/utils";
import type { CareerSummary } from "@/lib/careers/queries";
import type { CareerCategory, CareerDifficulty } from "@/generated/prisma/client";

const MAX_COMPARE = 3;
const MIN_COMPARE = 2;

interface CareerExplorerProps {
  careers: CareerSummary[];
}

/**
 * The whole catalog is passed in from the server and filtered in memory.
 *
 * At 20 careers that is far cheaper and more responsive than a request per
 * keystroke; if the catalog ever outgrows this, the same component can move to
 * a debounced server query without changing the page around it.
 */
export function CareerExplorer({ careers }: CareerExplorerProps) {
  const router = useRouter();
  const reduced = useReducedMotion();

  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<CareerCategory | "ALL">("ALL");
  const [difficulty, setDifficulty] = React.useState<CareerDifficulty | "ALL">("ALL");
  const [compare, setCompare] = React.useState<string[]>([]);

  const results = React.useMemo(
    () => filterCareers(careers, { query, category, difficulty }),
    [careers, category, difficulty, query],
  );

  const filtersActive = category !== "ALL" || difficulty !== "ALL" || query !== "";

  const clearFilters = () => {
    setQuery("");
    setCategory("ALL");
    setDifficulty("ALL");
  };

  const toggleCompare = (slug: string) => {
    setCompare((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : prev.length >= MAX_COMPARE
          ? prev
          : [...prev, slug],
    );
  };

  const openComparison = () => {
    router.push(`/careers/compare?ids=${compare.join(",")}`);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* ── Search ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <label htmlFor="career-search" className="sr-only">
            Search careers
          </label>
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
          />
          <input
            id="career-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search careers — try frontend, data, security…"
            className={cn(
              "h-12 w-full rounded-xl border border-border bg-surface/60 pl-10 pr-4 text-sm text-foreground",
              "placeholder:text-subtle-foreground",
              "transition-colors duration-200 hover:border-white/15 focus:border-primary/50",
            )}
          />
        </div>

        {/* ── Filters ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-label text-subtle-foreground">
            <SlidersHorizontal className="size-3.5" aria-hidden />
            Filters
          </div>

          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Filter by category</legend>
            <FilterChip
              active={category === "ALL"}
              onClick={() => setCategory("ALL")}
              label="All areas"
            />
            {CATEGORY_ORDER.map((value) => (
              <FilterChip
                key={value}
                active={category === value}
                onClick={() => setCategory(value)}
                label={CATEGORY_LABEL[value]}
              />
            ))}
          </fieldset>

          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Filter by difficulty</legend>
            <FilterChip
              active={difficulty === "ALL"}
              onClick={() => setDifficulty("ALL")}
              label="Any level"
            />
            {DIFFICULTY_ORDER.map((value) => (
              <FilterChip
                key={value}
                active={difficulty === value}
                onClick={() => setDifficulty(value)}
                label={DIFFICULTY_SHORT[value]}
              />
            ))}
          </fieldset>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Announced so filtering isn't a silent change for screen readers. */}
          <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
            {results.length === careers.length
              ? `${careers.length} careers`
              : `${results.length} of ${careers.length} careers`}
          </p>

          {filtersActive ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X aria-hidden />
              Clear filters
            </Button>
          ) : null}
        </div>
      </div>

      {/* ── Results ────────────────────────────────────────────── */}
      {results.length === 0 ? (
        <div className="surface flex flex-col items-center gap-3 rounded-xl px-6 py-16 text-center">
          <p className="text-base font-medium text-foreground">
            No careers match that search.
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Try a broader term like &ldquo;data&rdquo; or &ldquo;web&rdquo;, or clear
            the filters to see the whole catalog.
          </p>
          <Button variant="secondary" size="sm" onClick={clearFilters} className="mt-2">
            Clear filters
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((career) => (
            <li key={career.id} className="min-w-0">
              <CareerCard
                career={career}
                action={
                  <CompareToggle
                    checked={compare.includes(career.slug)}
                    disabled={
                      !compare.includes(career.slug) && compare.length >= MAX_COMPARE
                    }
                    onChange={() => toggleCompare(career.slug)}
                    careerName={career.name}
                  />
                }
              />
            </li>
          ))}
        </ul>
      )}

      {/* ── Comparison tray ────────────────────────────────────── */}
      <AnimatePresence>
        {compare.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : 16 }}
            transition={{ duration: reduced ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4"
          >
            <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-raised/95 p-3 pl-4 backdrop-blur-xl">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {compare.length} selected
                </span>
                {compare.length < MIN_COMPARE ? " — pick one more to compare" : null}
              </p>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setCompare([])}>
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={openComparison}
                  disabled={compare.length < MIN_COMPARE}
                >
                  <GitCompareArrows aria-hidden />
                  Compare
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-sm transition-colors duration-200",
        active
          ? "bg-primary/12 border-primary/50 text-foreground"
          : "border-border bg-surface/60 text-muted-foreground hover:border-white/15 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function CompareToggle({
  checked,
  disabled,
  onChange,
  careerName,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
  careerName: string;
}) {
  return (
    <label
      className={cn(
        "inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text-xs",
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background",
        disabled && "cursor-not-allowed opacity-40",
        checked ? "text-indigo-300" : "text-subtle-foreground hover:text-foreground",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="size-3.5 accent-indigo-500"
      />
      Compare
      <span className="sr-only">{careerName}</span>
    </label>
  );
}
