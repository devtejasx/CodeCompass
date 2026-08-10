"use client";

import * as React from "react";
import { Check, Clock3 } from "lucide-react";

import { setMilestoneComplete } from "@/app/actions/projects";
import { milestonePercent } from "@/lib/projects/progress";
import { cn } from "@/lib/utils";
import type { ProjectDetail } from "@/lib/projects/queries";

/**
 * The milestone checklist.
 *
 * Nothing here ticks itself. A milestone is complete because the learner said
 * so, which is the only signal CodeCompass actually has — it cannot see their
 * editor, and pretending otherwise would make the progress bar a lie.
 *
 * Every milestone is available from the moment the project starts. Locking step
 * five until step four is ticked would force people to misreport the order they
 * really worked in, and building is rarely linear.
 */
export function MilestoneList({
  projectId,
  milestones,
  initialCompletedIds,
  onProgressChange,
}: {
  projectId: string;
  milestones: ProjectDetail["milestones"];
  initialCompletedIds: string[];
  /** Lets the workspace header show the same number without a round trip. */
  onProgressChange?: (completed: number, total: number) => void;
}) {
  const [completed, setCompleted] = React.useState<Set<string>>(
    () => new Set(initialCompletedIds),
  );
  const [pending, setPending] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const total = milestones.length;
  const done = milestones.filter((milestone) => completed.has(milestone.id)).length;
  const percent = milestonePercent({ total, completed: done });

  const toggle = async (milestoneId: string) => {
    const wasComplete = completed.has(milestoneId);

    const next = new Set(completed);
    if (wasComplete) next.delete(milestoneId);
    else next.add(milestoneId);

    const nextDone = milestones.filter((milestone) => next.has(milestone.id)).length;

    // Optimistic: ticking a box should feel instant.
    //
    // Both setState calls happen here in the event handler, never inside a
    // state updater. Calling the parent's setter from within our own updater
    // is a "cannot update a component while rendering a different component"
    // warning waiting to happen — React may run an updater during render.
    setCompleted(next);
    onProgressChange?.(nextDone, total);
    setPending(milestoneId);
    setError(null);

    const rollback = () => {
      setCompleted(new Set(completed));
      onProgressChange?.(done, total);
      setError("That change could not be saved. Please try again.");
    };

    try {
      const result = await setMilestoneComplete({
        projectId,
        milestoneId,
        completed: !wasComplete,
      });
      // The database is authoritative — put the tick back if the write failed.
      if (!result.ok) rollback();
    } catch {
      rollback();
    } finally {
      setPending(null);
    }
  };

  return (
    <div>
      {/* ── Progress ─────────────────────────────────────────────── */}
      <div className="mb-5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">
            {done} of {total} milestones
          </span>
          <span className="font-mono text-sm text-foreground">{percent}%</span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-raised"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Project milestones complete"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <ol className="flex flex-col gap-2">
        {milestones.map((milestone, index) => {
          const isComplete = completed.has(milestone.id);
          const isPending = pending === milestone.id;

          return (
            <li key={milestone.id}>
              <div
                className={cn(
                  "rounded-lg border p-4 transition-colors duration-200",
                  isComplete
                    ? "border-emerald-500/25 bg-emerald-500/[0.05]"
                    : "border-border bg-surface/50",
                )}
              >
                <div className="flex items-start gap-3">
                  {/*
                    A real checkbox: keyboard-operable, announced correctly, and
                    labelled by the milestone title rather than by position.
                  */}
                  <input
                    type="checkbox"
                    id={`milestone-${milestone.id}`}
                    checked={isComplete}
                    disabled={isPending}
                    onChange={() => void toggle(milestone.id)}
                    className="sr-only"
                  />
                  <label
                    htmlFor={`milestone-${milestone.id}`}
                    className="flex min-w-0 flex-1 cursor-pointer items-start gap-3"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-0.5 grid size-5 shrink-0 place-items-center rounded border transition-colors",
                        isComplete
                          ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                          : "border-border text-transparent",
                        isPending && "opacity-50",
                      )}
                    >
                      <Check className="size-3" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-mono text-xs text-subtle-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isComplete
                              ? "text-muted-foreground line-through decoration-emerald-500/40"
                              : "text-foreground",
                          )}
                        >
                          {milestone.title}
                        </span>
                        {/* Status in words, never colour alone. */}
                        <span
                          className={cn(
                            "text-xs",
                            isComplete ? "text-emerald-400" : "text-subtle-foreground",
                          )}
                        >
                          {isComplete ? "Done" : "To do"}
                        </span>
                      </span>

                      <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                        {milestone.description}
                      </span>

                      <span className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-subtle-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="size-3.5" aria-hidden />
                          {milestone.estimatedTime}
                        </span>
                        {milestone.concepts.map((concept) => (
                          <span key={concept}>{concept}</span>
                        ))}
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {error ? (
        <p className="mt-3 text-xs text-rose-300" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
