"use client";

import * as React from "react";
import { Info, RotateCcw } from "lucide-react";

import { ToolCard } from "@/components/ai-tools/tool-card";
import { decide, environmentsFor, reasonFor } from "@/lib/ai-tools/decide";
import type { DecisionAnswer } from "@/lib/ai-tools/decide";
import {
  ENVIRONMENT_LABEL,
  USE_CASE_LABEL,
  USE_CASE_ORDER,
} from "@/lib/ai-tools/labels";
import { cn } from "@/lib/utils";
import type { AIToolListItem } from "@/lib/ai-tools/queries";

/**
 * "Which AI tool should I use?"
 *
 * Two questions, answered by deterministic rules over the catalog — no model is
 * called. That is the correct design, not a shortcut: the answer is a lookup
 * over relationships CodeCompass already stores, so it is reproducible, free,
 * explainable, and cannot invent a tool that does not exist.
 *
 * The second question's options are derived from what actually matches the
 * first, so the interface never offers a route that leads to an empty result.
 */
export function DecisionHelper({ tools }: { tools: AIToolListItem[] }) {
  const [answers, setAnswers] = React.useState<DecisionAnswer>({
    useCase: null,
    environment: null,
  });

  const environments = React.useMemo(
    () => environmentsFor(tools, answers.useCase),
    [tools, answers.useCase],
  );

  const result = React.useMemo(() => decide({ tools, answers }), [tools, answers]);

  const started = answers.useCase !== null;

  return (
    <div>
      {/* ── Question 1 ───────────────────────────────────────── */}
      <fieldset className="surface rounded-xl p-5">
        <legend className="px-1 text-sm font-medium text-foreground">
          What are you trying to do?
        </legend>

        <div className="mt-3 flex flex-wrap gap-2">
          {USE_CASE_ORDER.map((useCase) => {
            const active = answers.useCase === useCase;
            return (
              <button
                key={useCase}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setAnswers({
                    // Changing the goal invalidates the environment answer,
                    // because the options for it are derived from the goal.
                    useCase: active ? null : useCase,
                    environment: null,
                  })
                }
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm transition-colors duration-200",
                  active
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-border bg-surface/60 text-muted-foreground hover:text-foreground",
                )}
              >
                {USE_CASE_LABEL[useCase]}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* ── Question 2 ───────────────────────────────────────── */}
      {started && environments.length > 0 ? (
        <fieldset className="surface mt-3 rounded-xl p-5">
          <legend className="px-1 text-sm font-medium text-foreground">
            Where do you want to work?
          </legend>
          <p className="mt-1 px-1 text-xs text-subtle-foreground">
            Only the places that have tools for this job are offered.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {environments.map((environment) => {
              const active = answers.environment === environment;
              return (
                <button
                  key={environment}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setAnswers((current) => ({
                      ...current,
                      environment: active ? null : environment,
                    }))
                  }
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm transition-colors duration-200",
                    active
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-border bg-surface/60 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {ENVIRONMENT_LABEL[environment]}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {/* ── Result ───────────────────────────────────────────── */}
      <div className="mt-6">
        <p
          aria-live="polite"
          className="flex max-w-prose items-start gap-2 text-sm leading-relaxed text-muted-foreground"
        >
          <Info className="mt-0.5 size-3.5 shrink-0 text-indigo-400" aria-hidden />
          {result.explanation}
        </p>

        {result.relaxedEnvironment ? (
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-amber-300">
            The results below ignore your second answer, because nothing matched both.
          </p>
        ) : null}

        {result.tools.length > 0 ? (
          <>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {result.tools.map((tool) => (
                <li key={tool.slug} className="flex">
                  <ToolCard
                    tool={tool}
                    reason={reasonFor(tool, answers.useCase) ?? undefined}
                    className="w-full"
                  />
                </li>
              ))}
            </ul>

            <p className="pretty mt-5 max-w-prose text-sm leading-relaxed text-subtle-foreground">
              This is a shortlist, not a ranking. These tools do overlapping jobs in
              different ways, and the right one depends on things a rule cannot know —
              what your team already uses, what your employer permits, and what you can
              review competently.
            </p>
          </>
        ) : null}

        {started ? (
          <button
            type="button"
            onClick={() => setAnswers({ useCase: null, environment: null })}
            className="mt-5 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Start again
          </button>
        ) : null}
      </div>
    </div>
  );
}
