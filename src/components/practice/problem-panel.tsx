"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, ExternalLink, Lightbulb } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DIFFICULTY_BADGE, DIFFICULTY_LABEL } from "@/lib/practice/languages";
import type { PracticeProblemDetail } from "@/lib/practice/queries";
import { cn } from "@/lib/utils";

interface ProblemPanelProps {
  problem: PracticeProblemDetail;
  hiddenTestCount: number;
  /**
   * Null until the learner has attempted the problem — the server does not send
   * it before then, so this is a real gate rather than a hidden element.
   */
  explanation: string | null;
  solved: boolean;
}

/**
 * The left half of the workspace: statement, examples, constraints, hints and —
 * once the learner has actually attempted the problem — the explanation.
 *
 * Hidden test cases are not here, and cannot be: the query that fed this
 * component never selected them.
 *
 * Memoised, which is worth it here specifically: its props are server data that
 * does not change while somebody is typing, but it sits beside the editor in a
 * component that re-renders on every keystroke — so without this, each
 * character retyped the entire statement, every example, the constraints and
 * the hint list. This is the one component in the workspace where that is true
 * and the subtree is large enough to matter.
 */
export const ProblemPanel = React.memo(function ProblemPanel({
  problem,
  hiddenTestCount,
  explanation,
  solved,
}: ProblemPanelProps) {
  const [revealedHints, setRevealedHints] = React.useState(0);
  const [showExplanation, setShowExplanation] = React.useState(false);

  const topic = problem.topics[0]?.topic ?? null;

  return (
    <div className="flex flex-col gap-8">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={DIFFICULTY_BADGE[problem.difficulty]}>
            {DIFFICULTY_LABEL[problem.difficulty]}
          </Badge>
          <span className="text-xs text-subtle-foreground">
            {problem.estimatedTime}
          </span>
          {solved ? (
            <span className="rounded-md border border-emerald-500/25 bg-emerald-500/[0.08] px-2 py-0.5 text-xs font-medium text-emerald-400">
              Solved
            </span>
          ) : null}
        </div>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          {problem.title}
        </h1>

        {topic ? (
          <p className="mt-2 text-sm text-subtle-foreground">
            {topic.phase.roadmap.career?.name ?? topic.phase.roadmap.title} ·{" "}
            {topic.phase.title} ·{" "}
            <Link
              href={`/learn/${topic.slug}`}
              className="rounded text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {topic.title}
            </Link>
          </p>
        ) : null}
      </header>

      {/* ── Statement ──────────────────────────────────────────── */}
      <section aria-labelledby="statement-heading">
        <h2 id="statement-heading" className="sr-only">
          Problem statement
        </h2>
        <p className="pretty text-sm leading-relaxed text-muted-foreground">
          {problem.description}
        </p>
      </section>

      {/* ── Examples ───────────────────────────────────────────── */}
      {problem.examples.length > 0 ? (
        <section aria-labelledby="examples-heading">
          <h2
            id="examples-heading"
            className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
          >
            Examples
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {problem.examples.map((example) => (
              <li key={example.id} className="surface rounded-lg p-4">
                <dl className="grid gap-2 font-mono text-xs">
                  <div className="flex gap-2">
                    <dt className="shrink-0 text-subtle-foreground">Input</dt>
                    <dd className="min-w-0 break-words text-foreground">
                      {example.input}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="shrink-0 text-subtle-foreground">Output</dt>
                    <dd className="min-w-0 break-words text-emerald-300">
                      {example.output}
                    </dd>
                  </div>
                </dl>
                {example.explanation ? (
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {example.explanation}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ── Constraints ────────────────────────────────────────── */}
      {problem.constraints.length > 0 ? (
        <section aria-labelledby="constraints-heading">
          <h2
            id="constraints-heading"
            className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
          >
            Constraints
          </h2>
          <ul className="mt-3 flex flex-col gap-1.5">
            {problem.constraints.map((constraint) => (
              <li
                key={constraint}
                className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
              >
                <span
                  aria-hidden
                  className="mt-2 size-1 shrink-0 rounded-full bg-border"
                />
                {constraint}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ── Expected behaviour ─────────────────────────────────── */}
      <section
        aria-labelledby="behaviour-heading"
        className="rounded-lg border border-border bg-surface/40 p-4"
      >
        <h2
          id="behaviour-heading"
          className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
        >
          Expected behaviour
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Implement{" "}
          <code className="rounded bg-surface-raised px-1.5 py-0.5 font-mono text-xs text-foreground">
            {problem.functionName}
          </code>{" "}
          and <span className="text-foreground">return</span> the answer — do not print
          it. Your solution is checked against{" "}
          <span className="text-foreground">
            {problem.testCases.length + hiddenTestCount} test cases
          </span>
          {hiddenTestCount > 0 ? (
            <>, {hiddenTestCount} of which are hidden and only run when you submit</>
          ) : null}
          . The time limit is{" "}
          {(problem.timeLimitMs / 1000).toFixed(1).replace(/\.0$/, "")}s and the memory
          limit is {problem.memoryLimitMb}MB.
        </p>
      </section>

      {/* ── Hints ──────────────────────────────────────────────── */}
      {problem.hints.length > 0 ? (
        <section aria-labelledby="hints-heading">
          <h2
            id="hints-heading"
            className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
          >
            Hints
          </h2>

          <ul className="mt-3 flex flex-col gap-2">
            {problem.hints.slice(0, revealedHints).map((hint, index) => (
              <li
                key={hint}
                className="flex gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-sm leading-relaxed text-muted-foreground"
              >
                <Lightbulb
                  className="mt-0.5 size-3.5 shrink-0 text-amber-400"
                  aria-hidden
                />
                <span>
                  <span className="sr-only">Hint {index + 1}: </span>
                  {hint}
                </span>
              </li>
            ))}
          </ul>

          {revealedHints < problem.hints.length ? (
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => setRevealedHints((count) => count + 1)}
            >
              {revealedHints === 0
                ? "Show a hint"
                : `Show hint ${revealedHints + 1} of ${problem.hints.length}`}
            </Button>
          ) : (
            <p className="mt-3 text-xs text-subtle-foreground">
              That&apos;s every hint. Try writing what you know, then run it — a failing
              test tells you more than a fourth hint would.
            </p>
          )}
        </section>
      ) : null}

      {/* ── Explanation ────────────────────────────────────────── */}
      <section aria-labelledby="explanation-heading">
        <h2
          id="explanation-heading"
          className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
        >
          Explanation
        </h2>

        {explanation === null ? (
          // Withheld until they have tried. Reading the approach before making
          // an attempt is the fastest way to learn nothing.
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The explanation unlocks after your first submission. Have a go first —
            getting it wrong is part of how this works.
          </p>
        ) : showExplanation ? (
          <p className="pretty mt-3 text-sm leading-relaxed text-muted-foreground">
            {explanation}
          </p>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => setShowExplanation(true)}
          >
            <BookOpen aria-hidden />
            View explanation
          </Button>
        )}
      </section>

      {/* ── Practise elsewhere ─────────────────────────────────── */}
      <PractiseElsewhere />
    </div>
  );
});

/**
 * Links out, clearly labelled as other people's sites. CodeCompass has no
 * integration with any of them and does not claim one.
 */
const EXTERNAL_PLATFORMS = [
  {
    name: "Exercism",
    url: "https://exercism.org/",
    note: "Free, mentored exercise tracks",
  },
  { name: "Codewars", url: "https://www.codewars.com/", note: "Short community katas" },
  {
    name: "HackerRank",
    url: "https://www.hackerrank.com/",
    note: "Structured practice tracks",
  },
  {
    name: "Codeforces",
    url: "https://codeforces.com/",
    note: "Competitive programming",
  },
];

function PractiseElsewhere({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="elsewhere-heading"
      className={cn("border-t border-border pt-6", className)}
    >
      <h2
        id="elsewhere-heading"
        className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
      >
        Practise elsewhere
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-subtle-foreground">
        These are independent sites, not connected to CodeCompass. Your progress here
        does not sync with them.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {EXTERNAL_PLATFORMS.map((platform) => (
          <li key={platform.name}>
            <a
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target surface-interactive inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground"
              title={platform.note}
            >
              {platform.name}
              <ExternalLink className="size-3" aria-hidden />
              <span className="sr-only">(opens {platform.name} in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
