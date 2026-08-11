"use client";

import * as React from "react";
import { CheckCircle2, Lightbulb, Target } from "lucide-react";

import { recordExerciseAttempt } from "@/app/actions/git";
import { Button } from "@/components/ui/button";
import { GitSimulator } from "@/components/git/git-simulator";
import { findExercise } from "@/lib/git/exercises";
import { cn } from "@/lib/utils";
import type { SimState } from "@/lib/git/simulator/types";

/**
 * One exercise, driven by the simulator.
 *
 * The learner is given a starting repository and a goal, and works toward it in
 * whatever way they like. Completion is checked structurally — what the
 * repository *is*, not which keys were pressed — so the several legitimate ways
 * to stage two files all count.
 *
 * The server re-runs the same predicate before recording anything, so the two
 * cannot drift.
 */
export function ExerciseRunner({
  slug,
  initiallyCompleted,
}: {
  slug: string;
  initiallyCompleted: boolean;
}) {
  const exercise = React.useMemo(() => findExercise(slug), [slug]);

  const [revealed, setRevealed] = React.useState(0);
  const [solved, setSolved] = React.useState(initiallyCompleted);
  const [justSolved, setJustSolved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Only the first transition to solved is recorded; re-running an exercise
  // should not keep incrementing an attempt counter for no reason.
  const reported = React.useRef(false);

  const onStateChange = React.useCallback(
    async (state: SimState) => {
      if (!exercise || reported.current) return;
      if (!exercise.isComplete(state)) return;

      reported.current = true;
      setSolved(true);
      setJustSolved(true);
      setSaving(true);

      try {
        await recordExerciseAttempt({ slug, state, hintsUsed: revealed });
      } catch {
        // The learner has still solved it; a failed write is not their problem
        // and the next attempt will record it.
      } finally {
        setSaving(false);
      }
    },
    [exercise, revealed, slug],
  );

  if (!exercise) {
    return (
      <p className="text-sm text-muted-foreground">That exercise could not be found.</p>
    );
  }

  return (
    <div>
      {/* ── Brief ───────────────────────────────────────────────── */}
      <div className="surface rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-medium tracking-tight text-foreground">
              {exercise.title}
            </h3>
            <p className="pretty mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {exercise.brief}
            </p>
          </div>

          {solved ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/[0.08] px-2 py-0.5 text-xs font-medium text-emerald-400">
              <CheckCircle2 className="size-3.5" aria-hidden />
              Solved
            </span>
          ) : null}
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-surface/60 p-3 text-sm text-muted-foreground">
          <Target className="mt-0.5 size-3.5 shrink-0 text-indigo-400" aria-hidden />
          <span>
            <span className="font-medium text-foreground">Goal: </span>
            {exercise.goal}
          </span>
        </p>
      </div>

      {/* ── Simulator ───────────────────────────────────────────── */}
      <div className="mt-4">
        <GitSimulator
          initialState={exercise.initial()}
          onStateChange={(state) => void onStateChange(state)}
        />
      </div>

      {/* ── Solved ──────────────────────────────────────────────── */}
      {justSolved ? (
        <div
          role="status"
          className="mt-4 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] p-4"
        >
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-400">
            <CheckCircle2 className="size-4" aria-hidden />
            Solved{saving ? " — saving…" : ""}
          </p>
          <p className="pretty mt-2 text-sm leading-relaxed text-muted-foreground">
            {exercise.debrief}
          </p>
        </div>
      ) : null}

      {/* ── Hints ───────────────────────────────────────────────── */}
      <div className="mt-4">
        <ul className="flex flex-col gap-2">
          {exercise.hints.slice(0, revealed).map((hint, index) => (
            <li
              key={hint}
              className="flex gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-sm leading-relaxed text-muted-foreground"
            >
              <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-amber-400" aria-hidden />
              <span>
                <span className="sr-only">Hint {index + 1}: </span>
                {hint}
              </span>
            </li>
          ))}
        </ul>

        {revealed < exercise.hints.length ? (
          <Button
            variant="secondary"
            size="sm"
            className={cn(revealed > 0 && "mt-2")}
            onClick={() => setRevealed((count) => count + 1)}
          >
            <Lightbulb aria-hidden />
            {revealed === 0
              ? "Stuck? Show a hint"
              : `Show hint ${revealed + 1} of ${exercise.hints.length}`}
          </Button>
        ) : (
          <p className="mt-2 text-xs text-subtle-foreground">
            That&apos;s every hint. Try `git status` — it usually suggests the command
            you want next.
          </p>
        )}
      </div>
    </div>
  );
}
