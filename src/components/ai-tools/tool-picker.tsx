"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { MAX_COMPARE } from "@/lib/ai-tools/compare";
import { cn } from "@/lib/utils";

/**
 * Chooses which two or three tools to compare.
 *
 * The selection lives in the URL rather than in component state, so a
 * comparison can be linked to, bookmarked and shared — and so the table itself
 * stays a server component. This island owns the picker and nothing else.
 *
 * It deliberately does NOT call useSearchParams: the page has already resolved
 * the selection server-side and passes it in as `selected`. Reading it again on
 * the client would only add a Suspense requirement for a value we are already
 * holding.
 *
 * The cap comes from lib/ai-tools/compare so the server page and this component
 * agree on it — see the note there about why it cannot live in this file.
 */

export function ToolPicker({
  tools,
  selected,
}: {
  tools: { slug: string; name: string; category: string }[];
  selected: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const apply = React.useCallback(
    (next: string[]) => {
      const query = next.length > 0 ? `?tools=${next.join(",")}` : "";

      startTransition(() => {
        router.replace(`/academy/ai-tools/compare${query}`, { scroll: false });
      });
    },
    [router],
  );

  function toggle(slug: string) {
    if (selected.includes(slug)) {
      apply(selected.filter((entry) => entry !== slug));
      return;
    }
    if (selected.length >= MAX_COMPARE) return;
    apply([...selected, slug]);
  }

  const full = selected.length >= MAX_COMPARE;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {selected.length === 0
            ? `Pick two or three tools to compare.`
            : `${selected.length} of ${MAX_COMPARE} selected`}
        </p>
        {selected.length > 0 ? (
          <button
            type="button"
            onClick={() => apply([])}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" aria-hidden />
            Clear
          </button>
        ) : null}
      </div>

      <ul className="mt-3 flex flex-wrap gap-2">
        {tools.map((tool) => {
          const active = selected.includes(tool.slug);
          // Disabling the rest at the cap is clearer than silently ignoring a
          // click, and the reason is announced rather than left to be inferred.
          const disabled = !active && full;

          return (
            <li key={tool.slug}>
              <button
                type="button"
                aria-pressed={active}
                disabled={disabled || pending}
                onClick={() => toggle(tool.slug)}
                title={
                  disabled
                    ? `Deselect one of the ${MAX_COMPARE} first`
                    : `${tool.name} — ${tool.category}`
                }
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm transition-colors duration-200",
                  active
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-border bg-surface/60 text-muted-foreground hover:text-foreground",
                  disabled && "cursor-not-allowed opacity-40 hover:text-muted-foreground",
                )}
              >
                {tool.name}
              </button>
            </li>
          );
        })}
      </ul>

      {full ? (
        <p aria-live="polite" className="mt-2 text-xs text-subtle-foreground">
          That is the maximum. Deselect one to swap it for another.
        </p>
      ) : null}
    </div>
  );
}
