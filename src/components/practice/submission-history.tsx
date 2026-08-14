"use client";

import * as React from "react";
import { Code2, Loader2 } from "lucide-react";

import { getSubmissionCode } from "@/app/actions/practice";
import { Button } from "@/components/ui/button";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/practice/feedback";
import { LANGUAGE_LABEL } from "@/lib/practice/languages";
import { cn } from "@/lib/utils";
import type { SubmissionSummary } from "@/lib/practice/queries";

interface SubmissionHistoryProps {
  submissions: SubmissionSummary[];
  /** Puts the chosen submission's source back in the editor. */
  onLoadCode: (code: string, language: SubmissionSummary["language"]) => void;
}

/**
 * This learner's own submissions for this problem.
 *
 * "Own" is enforced on the server — the query is scoped by session user id, and
 * so is the action that loads the source behind "View code". Nothing here can
 * be pointed at somebody else's row.
 *
 * Memoised for the same reason as the problem panel: the list only changes when
 * a submission completes, but it lives inside a component that re-renders on
 * every keystroke. Its callback is a `useCallback` at the call site, without
 * which this memo would never hit.
 */
export const SubmissionHistory = React.memo(function SubmissionHistory({
  submissions,
  onLoadCode,
}: SubmissionHistoryProps) {
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  if (submissions.length === 0) {
    return (
      <p className="text-sm text-subtle-foreground">
        No submissions yet. Your attempts will appear here so you can come back to them.
      </p>
    );
  }

  const load = async (id: string) => {
    setLoadingId(id);
    setError(null);
    try {
      const result = await getSubmissionCode({ submissionId: id });
      if (result.ok && result.code && result.language) {
        onLoadCode(result.code, result.language);
      } else {
        setError(result.error ?? "That code could not be loaded.");
      }
    } catch {
      setError("That code could not be loaded.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <ul className="flex flex-col gap-1.5">
        {submissions.map((submission, index) => {
          const tone = STATUS_TONE[submission.status];

          return (
            <li
              key={submission.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border bg-surface/40 px-3 py-2"
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  tone === "success" && "text-emerald-400",
                  tone === "failure" && "text-rose-400",
                  tone === "neutral" && "text-amber-300",
                  tone === "pending" && "text-muted-foreground",
                )}
              >
                {index === 0 ? (
                  <span className="sr-only">Latest submission: </span>
                ) : null}
                {STATUS_LABEL[submission.status]}
              </span>

              <span className="text-xs text-subtle-foreground">
                {LANGUAGE_LABEL[submission.language]}
              </span>

              {submission.totalTests > 0 ? (
                <span className="font-mono text-xs text-subtle-foreground">
                  {submission.passedTests}/{submission.totalTests}
                </span>
              ) : null}

              <span className="ml-auto flex items-center gap-2">
                <time
                  dateTime={submission.createdAt.toISOString()}
                  // "3s ago" is computed from the reader's clock, so the server
                  // pass and the hydration pass legitimately differ. The
                  // dateTime attribute carries the exact instant either way.
                  suppressHydrationWarning
                  className="text-xs text-subtle-foreground"
                >
                  {relativeTime(submission.createdAt)}
                </time>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => load(submission.id)}
                  disabled={loadingId !== null}
                >
                  {loadingId === submission.id ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Code2 className="size-3.5" aria-hidden />
                  )}
                  View code
                  <span className="sr-only">
                    {" "}
                    from this {STATUS_LABEL[submission.status]} submission
                  </span>
                </Button>
              </span>
            </li>
          );
        })}
      </ul>

      {error ? (
        <p className="mt-2 text-xs text-rose-300" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
});

/** Coarse and deliberately imprecise — nobody needs "4m 12s ago". */
function relativeTime(date: Date): string {
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
