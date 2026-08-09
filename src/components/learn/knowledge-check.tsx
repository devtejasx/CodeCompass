"use client";

import * as React from "react";
import { CheckCircle2, Loader2, RotateCcw, XCircle } from "lucide-react";

import { submitKnowledgeCheck, type QuestionResult } from "@/app/actions/learn";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { KnowledgeCheckView } from "@/lib/learn/queries";

interface KnowledgeCheckProps {
  topicId: string;
  questions: KnowledgeCheckView[];
  passingScore: number;
  /** True when a previous attempt already passed. */
  alreadyPassed: boolean;
  onPassed: () => void;
}

/**
 * The end-of-topic check.
 *
 * Options are plain radio inputs so arrow keys, focus and announcement come
 * from the platform. Correctness is not present in the props — the answer key
 * lives on the server and arrives only in the graded response.
 */
export function KnowledgeCheck({
  topicId,
  questions,
  passingScore,
  alreadyPassed,
  onPassed,
}: KnowledgeCheckProps) {
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [results, setResults] = React.useState<QuestionResult[] | null>(null);
  const [score, setScore] = React.useState<number | null>(null);
  const [passed, setPassed] = React.useState(alreadyPassed);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const resultRef = React.useRef<HTMLDivElement>(null);
  const answeredAll = questions.every((question) => answers[question.id]);

  const submit = async () => {
    setPending(true);
    setError(null);

    const response = await submitKnowledgeCheck({
      topicId,
      answers: Object.entries(answers).map(([questionId, optionId]) => ({
        questionId,
        optionId,
      })),
    });

    setPending(false);

    if (!response.ok) {
      setError(response.error ?? "Something went wrong. Please try again.");
      return;
    }

    setResults(response.results ?? null);
    setScore(response.score ?? 0);
    setPassed(Boolean(response.passed));
    if (response.passed) onPassed();

    // Move focus to the outcome so it isn't missed by keyboard users.
    requestAnimationFrame(() => resultRef.current?.focus());
  };

  const retry = () => {
    setAnswers({});
    setResults(null);
    setScore(null);
    setError(null);
  };

  const resultFor = (questionId: string) =>
    results?.find((result) => result.questionId === questionId);

  return (
    <section aria-labelledby="check-heading" className="mt-16">
      <h2
        id="check-heading"
        className="text-2xl font-semibold tracking-tight text-foreground"
      >
        Knowledge check
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {questions.length} questions. {passingScore}% to pass — and you can retry as
        many times as you like.
      </p>

      <ol className="mt-8 flex flex-col gap-8">
        {questions.map((question, index) => {
          const result = resultFor(question.id);

          return (
            <li key={question.id}>
              <fieldset>
                <legend className="text-base font-medium text-foreground">
                  <span className="mr-2 font-mono text-sm text-subtle-foreground">
                    {index + 1}.
                  </span>
                  {question.question}
                </legend>

                <div className="mt-4 flex flex-col gap-2">
                  {question.options.map((option) => {
                    const selected = answers[question.id] === option.id;
                    const isAnswerKey = result && result.correctOptionId === option.id;
                    const chosenWrong = result && selected && !result.isCorrect;

                    return (
                      <label
                        key={option.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors duration-200",
                          "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background",
                          !result && selected && "border-primary/50 bg-primary/[0.08]",
                          !result &&
                            !selected &&
                            "border-border bg-surface/50 hover:border-white/15",
                          isAnswerKey && "border-emerald-500/40 bg-emerald-500/[0.08]",
                          chosenWrong && "border-rose-500/40 bg-rose-500/[0.08]",
                          result &&
                            !isAnswerKey &&
                            !chosenWrong &&
                            "border-border bg-surface/40",
                        )}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option.id}
                          checked={selected}
                          disabled={Boolean(result)}
                          onChange={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [question.id]: option.id,
                            }))
                          }
                          className="mt-0.5 size-4 shrink-0 accent-indigo-500"
                        />
                        <span className="min-w-0 flex-1 text-sm text-foreground">
                          {option.text}
                        </span>

                        {/* Icon + text, never colour alone. */}
                        {isAnswerKey ? (
                          <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-emerald-400">
                            <CheckCircle2 className="size-4" aria-hidden />
                            Correct answer
                          </span>
                        ) : null}
                        {chosenWrong ? (
                          <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-rose-400">
                            <XCircle className="size-4" aria-hidden />
                            Your answer
                          </span>
                        ) : null}
                      </label>
                    );
                  })}
                </div>

                {result ? (
                  <div
                    className={cn(
                      "mt-3 rounded-lg border p-4",
                      result.isCorrect
                        ? "border-emerald-500/25 bg-emerald-500/[0.06]"
                        : "border-amber-500/25 bg-amber-500/[0.06]",
                    )}
                  >
                    <p
                      className={cn(
                        "flex items-center gap-2 text-xs font-medium uppercase tracking-label",
                        result.isCorrect ? "text-emerald-400" : "text-amber-400",
                      )}
                    >
                      {result.isCorrect ? (
                        <CheckCircle2 className="size-3.5" aria-hidden />
                      ) : (
                        <XCircle className="size-3.5" aria-hidden />
                      )}
                      {result.isCorrect ? "Correct" : "Not quite"}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {result.explanation}
                    </p>
                  </div>
                ) : null}
              </fieldset>
            </li>
          );
        })}
      </ol>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-rose-500/30 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-300"
        >
          {error}
        </p>
      ) : null}

      {results === null ? (
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button onClick={submit} disabled={!answeredAll || pending} size="lg">
            {pending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Checking…
              </>
            ) : (
              "Check my answers"
            )}
          </Button>
          {!answeredAll ? (
            <p className="text-sm text-subtle-foreground">
              Answer every question to continue.
            </p>
          ) : null}
        </div>
      ) : (
        <div
          ref={resultRef}
          tabIndex={-1}
          role="status"
          className={cn(
            "mt-8 rounded-xl border p-6 outline-none",
            passed
              ? "border-emerald-500/30 bg-emerald-500/[0.07]"
              : "border-amber-500/30 bg-amber-500/[0.07]",
          )}
        >
          <p className="text-lg font-semibold text-foreground">
            {passed ? "You passed." : "You're close."}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {passed
              ? `You scored ${score}%. Read the explanations above for anything you missed, then move on.`
              : `You scored ${score}% and need ${passingScore}% to pass. The explanations above cover what to revisit — nothing is locked, so try again whenever you're ready.`}
          </p>

          {!passed ? (
            <Button variant="secondary" onClick={retry} className="mt-5">
              <RotateCcw aria-hidden />
              Try again
            </Button>
          ) : null}
        </div>
      )}
    </section>
  );
}
