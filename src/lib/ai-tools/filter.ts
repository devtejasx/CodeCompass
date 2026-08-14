import type {
  AIToolEnvironment,
  AIToolStatus,
  AIUseCase,
  CareerDifficulty,
} from "@/generated/prisma/client";

import { USE_CASE_LABEL } from "./labels";
import type { AIToolListItem } from "./queries";

/**
 * Search and filtering for the tool explorer.
 *
 * Kept as a pure function over an already-loaded list, exactly like the career
 * explorer and the project browser. Twenty tools is small enough that filtering
 * in memory beats a request per keystroke — which is also why the explorer
 * makes no network request as you type — and keeping the predicate in one
 * function means it could move server-side unchanged if the catalog ever grew
 * past the point where that trade-off holds.
 */

export interface AIToolFilters {
  /** Free text. Case-insensitive, matched against several fields. */
  query: string;
  /** Category slug, or "ALL". */
  category: string;
  useCase: AIUseCase | "ALL";
  difficulty: CareerDifficulty | "ALL";
  environment: AIToolEnvironment | "ALL";
  status: AIToolStatus | "ALL";
}

export const EMPTY_FILTERS: AIToolFilters = {
  query: "",
  category: "ALL",
  useCase: "ALL",
  difficulty: "ALL",
  environment: "ALL",
  status: "ALL",
};

/**
 * Whether one tool survives the current filters.
 *
 * The search deliberately reaches past the name into the description, the
 * primary use, the category and the use-case labels, so typing "agents",
 * "design" or "research" finds the right tools even though none of those words
 * appears in a product name. Searching for a superseded name — "windsurf" —
 * finds its record, which is the entire reason the record is kept.
 */
export function matchesFilters(tool: AIToolListItem, filters: AIToolFilters): boolean {
  if (filters.category !== "ALL" && tool.category.slug !== filters.category)
    return false;
  if (filters.difficulty !== "ALL" && tool.difficulty !== filters.difficulty)
    return false;
  if (filters.status !== "ALL" && tool.status !== filters.status) return false;

  if (filters.useCase !== "ALL" && !tool.useCaseKinds.includes(filters.useCase)) {
    return false;
  }

  if (
    filters.environment !== "ALL" &&
    !tool.environments.includes(filters.environment)
  ) {
    return false;
  }

  const needle = filters.query.trim().toLowerCase();
  if (needle.length === 0) return true;

  const haystack = [
    tool.name,
    tool.slug,
    tool.description,
    tool.primaryUse,
    tool.category.name,
    ...tool.useCaseKinds.map((useCase) => USE_CASE_LABEL[useCase]),
    ...tool.useCases.map((entry) => entry.note),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(needle);
}

/** Applies the filters, preserving catalog order. */
export function filterTools(
  tools: AIToolListItem[],
  filters: AIToolFilters,
): AIToolListItem[] {
  return tools.filter((tool) => matchesFilters(tool, filters));
}

/**
 * How many tools each category would show under the *other* current filters.
 *
 * Counting with the category filter itself removed is what makes the counts
 * useful: they answer "what would I get if I clicked this?", not "what am I
 * looking at now?".
 */
export function categoryCounts(
  tools: AIToolListItem[],
  filters: AIToolFilters,
): Record<string, number> {
  const withoutCategory: AIToolFilters = { ...filters, category: "ALL" };
  const counts: Record<string, number> = { ALL: 0 };

  for (const tool of tools) {
    if (!matchesFilters(tool, withoutCategory)) continue;
    counts.ALL += 1;
    counts[tool.category.slug] = (counts[tool.category.slug] ?? 0) + 1;
  }

  return counts;
}
