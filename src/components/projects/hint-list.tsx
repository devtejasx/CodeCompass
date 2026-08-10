"use client";

import * as React from "react";
import { Lightbulb } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProjectDetail } from "@/lib/projects/queries";

/**
 * Progressive hints.
 *
 * Revealed one at a time, and deliberately never all at once: a wall of hints
 * is a walkthrough, and a walkthrough is the thing this whole phase exists to
 * avoid. Each hint points at the next question worth asking rather than at the
 * answer, so reading all three still leaves the building to the learner.
 */
export function HintList({ hints }: { hints: ProjectDetail["hints"] }) {
  const [revealed, setRevealed] = React.useState(0);

  if (hints.length === 0) return null;

  return (
    <div>
      <ul className="flex flex-col gap-2">
        {hints.slice(0, revealed).map((hint, index) => (
          <li
            key={hint.id}
            className="flex gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-4"
          >
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-400" aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                <span className="sr-only">Hint {index + 1}: </span>
                {hint.title}
              </p>
              <p className="pretty mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {hint.content}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {revealed < hints.length ? (
        <Button
          variant="secondary"
          size="sm"
          className={revealed > 0 ? "mt-3" : undefined}
          onClick={() => setRevealed((count) => count + 1)}
        >
          <Lightbulb aria-hidden />
          {revealed === 0
            ? "Show a hint"
            : `Show hint ${revealed + 1} of ${hints.length}`}
        </Button>
      ) : (
        <p className="mt-3 text-xs leading-relaxed text-subtle-foreground">
          That&apos;s every hint. From here the useful move is to try something and see
          what breaks — a failing attempt tells you more than a fourth hint would.
        </p>
      )}
    </div>
  );
}
