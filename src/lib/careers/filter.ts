import { CATEGORY_LABEL } from "@/lib/careers/labels";
import type { CareerCategory, CareerDifficulty } from "@/generated/prisma/client";

/** The subset of a career the filter reads — keeps this usable in tests. */
export interface FilterableCareer {
  name: string;
  shortDescription: string;
  mainFocus: string;
  category: CareerCategory;
  difficulty: CareerDifficulty;
}

export interface CareerFilters {
  query?: string;
  category?: CareerCategory | "ALL";
  difficulty?: CareerDifficulty | "ALL";
}

/**
 * Pure, synchronous catalog filtering.
 *
 * Kept out of the component so the matching rules can be tested directly, and
 * so the explorer could later swap to a server query without the behaviour
 * changing underneath it.
 *
 * Search is case-insensitive and also matches the career's focus and category
 * label, so "security" or "interface" find something sensible rather than only
 * exact name hits.
 */
export function filterCareers<T extends FilterableCareer>(
  careers: T[],
  { query = "", category = "ALL", difficulty = "ALL" }: CareerFilters,
): T[] {
  const needle = query.trim().toLowerCase();

  return careers.filter((career) => {
    if (category !== "ALL" && career.category !== category) return false;
    if (difficulty !== "ALL" && career.difficulty !== difficulty) return false;
    if (!needle) return true;

    const haystack = [
      career.name,
      career.shortDescription,
      career.mainFocus,
      CATEGORY_LABEL[career.category],
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(needle);
  });
}
