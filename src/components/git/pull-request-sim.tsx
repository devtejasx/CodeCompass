"use client";

import * as React from "react";
import { Check, GitPullRequest, MessageSquare, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A pull request, walked through one step at a time.
 *
 * Entirely local. It touches no repository, opens nothing on GitHub, and could
 * not — the whole thing is an array index and some prose. The point is the
 * shape of the workflow, and in particular that "changes requested" is a normal
 * step rather than a rejection, which is the part beginners find discouraging.
 */

interface Step {
  title: string;
  actor: "You" | "Reviewer";
  detail: string;
  /** What the learner should take from this step. */
  lesson: string;
}

const STEPS: Step[] = [
  {
    title: "Push the feature branch",
    actor: "You",
    detail:
      "feature/weather-search has three commits on it. You push it to the remote, which is what makes a pull request possible — a PR is a proposal about a branch that exists on the server.",
    lesson: "A pull request is about a branch, not about your laptop.",
  },
  {
    title: "Open the pull request",
    actor: "You",
    detail:
      "You propose merging feature/weather-search into main, and write a description saying what the change does and why. The diff already shows what changed; the description is where the why goes.",
    lesson: "The description answers the question the diff cannot.",
  },
  {
    title: "A reviewer reads it",
    actor: "Reviewer",
    detail:
      "A colleague reads the diff and leaves two comments: one asking why you chose to debounce at 300ms, and one pointing out that an empty search still fires a request.",
    lesson: "Most review comments are questions, not objections.",
  },
  {
    title: "Changes requested",
    actor: "Reviewer",
    detail:
      "They mark the review as 'changes requested'. This is not a rejection and it is not a judgement about you — it means the conversation is not finished, which is exactly what review is for.",
    lesson: "Changes requested is a normal step. Almost every PR gets one.",
  },
  {
    title: "Push a fix to the same branch",
    actor: "You",
    detail:
      "You answer the debounce question in a comment and add a commit guarding the empty search. You push it to the same branch — the pull request updates itself, and the whole conversation stays in one place.",
    lesson: "Never open a second PR for review feedback. Same branch, new commit.",
  },
  {
    title: "Approved",
    actor: "Reviewer",
    detail:
      "The reviewer re-reads the new commit and approves. Two people have now read this change, which is the point of the whole exercise.",
    lesson: "Approval means somebody else understands the change too.",
  },
  {
    title: "Merged",
    actor: "You",
    detail:
      "The branch merges into main and is deleted. Its commits are in main now, so the label has done its job — leaving it behind would only clutter the branch list.",
    lesson: "Delete the branch after merging. The work is in main.",
  },
];

export function PullRequestSim() {
  const [step, setStep] = React.useState(0);
  const atEnd = step >= STEPS.length - 1;

  return (
    <div className="surface rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-medium tracking-tight text-foreground">
          <GitPullRequest className="size-4 text-indigo-400" aria-hidden />
          A pull request, start to finish
        </h3>
        <span className="font-mono text-xs text-subtle-foreground">
          {step + 1} / {STEPS.length}
        </span>
      </div>

      <p className="mt-1.5 text-sm text-muted-foreground">
        A walkthrough. Nothing here touches a real repository.
      </p>

      {/* ── Progress rail ───────────────────────────────────────── */}
      <ol className="mt-5 flex flex-wrap gap-1.5" aria-label="Pull request steps">
        {STEPS.map((entry, index) => {
          const done = index < step;
          const current = index === step;

          return (
            <li key={entry.title}>
              <button
                type="button"
                onClick={() => setStep(index)}
                aria-current={current ? "step" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors",
                  current && "border-primary/40 bg-primary/[0.10] text-indigo-200",
                  done && !current && "border-emerald-500/25 bg-emerald-500/[0.06] text-emerald-300",
                  !done && !current && "border-border bg-surface/50 text-subtle-foreground",
                )}
              >
                {done ? <Check className="size-3" aria-hidden /> : null}
                <span className="font-mono">{index + 1}</span>
                <span className="sr-only">{entry.title}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* ── Current step ────────────────────────────────────────── */}
      <div
        role="status"
        aria-live="polite"
        className="mt-5 rounded-lg border border-border bg-surface/60 p-4"
      >
        <p className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-medium",
              STEPS[step].actor === "You"
                ? "bg-primary/15 text-indigo-300"
                : "bg-surface-raised text-muted-foreground",
            )}
          >
            {STEPS[step].actor}
          </span>
          <span className="text-sm font-medium text-foreground">{STEPS[step].title}</span>
        </p>

        <p className="pretty mt-2.5 text-sm leading-relaxed text-muted-foreground">
          {STEPS[step].detail}
        </p>

        <p className="mt-3 flex items-start gap-2 border-t border-border pt-3 text-sm text-indigo-300">
          <MessageSquare className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {STEPS[step].lesson}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setStep((value) => Math.max(0, value - 1))}
          disabled={step === 0}
        >
          Back
        </Button>
        <Button
          size="sm"
          onClick={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))}
          disabled={atEnd}
        >
          Next step
        </Button>
        {atEnd ? (
          <Button size="sm" variant="ghost" onClick={() => setStep(0)}>
            <RotateCcw aria-hidden />
            Start again
          </Button>
        ) : null}
      </div>
    </div>
  );
}
