/**
 * Comparison rules, shared by the server page and the client picker.
 *
 * This constant lives here rather than in the picker component for a reason
 * worth remembering: importing a plain value from a `"use client"` module into
 * a Server Component does NOT give you the value. Next replaces client-module
 * exports with client *references*, so `slice(0, MAX_COMPARE)` silently
 * became `slice(0, NaN)` — an empty selection, with no error anywhere. A
 * neutral module is importable from both sides and gets the real value to each.
 */

/**
 * Three is the cap because a fourth column stops being readable on a laptop,
 * and because a comparison of everything is just the catalog again.
 */
export const MAX_COMPARE = 3;

/**
 * Parses the `?tools=` parameter into a bounded list of slugs.
 *
 * Defensive by design: a hand-edited URL should narrow the selection, never
 * produce a broken page or an unbounded query. Duplicates are dropped so
 * `?tools=cursor,cursor` renders one column rather than two identical ones.
 */
export function parseComparisonSlugs(raw: string | undefined): string[] {
  return [
    ...new Set(
      (raw ?? "")
        .split(",")
        .map((slug) => slug.trim())
        .filter(Boolean),
    ),
  ].slice(0, MAX_COMPARE);
}
