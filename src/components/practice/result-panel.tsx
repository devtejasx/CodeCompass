"use client";

import {
  AlertTriangle,
  CheckCircle2,
  CircleSlash,
  Loader2,
  XCircle,
} from "lucide-react";

import { STATUS_LABEL, STATUS_TONE } from "@/lib/practice/feedback";
import { cn } from "@/lib/utils";
import type { SubmissionView } from "@/app/actions/practice";

/**
 * The verdict.
 *
 * Two rules shape this component. Failure has to teach — status, counts, the
 * failing case and a plain-English explanation of what went wrong. And a hidden
 * test case is described by its number and nothing else, because the input and
 * expected output for a hidden case never reach the browser in the first place.
 */
export function ResultPanel({
  submission,
  running,
  error,
}: {
  submission: SubmissionView | null;
  running: boolean;
  error: string | null;
}) {
  if (running) {
    return (
      <div
        className="flex items-center gap-2.5 rounded-lg border border-border bg-surface/50 p-4"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="size-4 animate-spin text-indigo-400" aria-hidden />
        <p className="text-sm text-muted-foreground">Running your code…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-lg border border-amber-500/25 bg-amber-500/[0.06] p-4"
        role="status"
        aria-live="polite"
      >
        <p className="flex items-center gap-2 text-sm text-amber-300">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          {error}
        </p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface/30 p-4">
        <p className="text-sm text-subtle-foreground">
          Run your code to check it against the sample tests, or submit to run every
          test including the hidden ones.
        </p>
      </div>
    );
  }

  const tone = STATUS_TONE[submission.status];
  const Icon =
    tone === "success" ? CheckCircle2 : tone === "failure" ? XCircle : CircleSlash;

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        tone === "success" && "border-emerald-500/25 bg-emerald-500/[0.06]",
        tone === "failure" && "border-rose-500/25 bg-rose-500/[0.06]",
        tone === "neutral" && "border-amber-500/25 bg-amber-500/[0.06]",
      )}
      role="status"
      aria-live="polite"
    >
      {/* ── Status line ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p
          className={cn(
            "flex items-center gap-2 text-sm font-medium",
            tone === "success" && "text-emerald-400",
            tone === "failure" && "text-rose-400",
            tone === "neutral" && "text-amber-300",
          )}
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          {STATUS_LABEL[submission.status]}
          {submission.kind === "RUN" ? (
            <span className="font-normal text-subtle-foreground">
              (sample tests only)
            </span>
          ) : null}
        </p>

        {submission.totalTests > 0 ? (
          <p className="font-mono text-xs text-muted-foreground">
            {submission.passedTests} / {submission.totalTests} tests passed
          </p>
        ) : null}
      </div>

      {/* ── Measurements ────────────────────────────────────────── */}
      {submission.executionTime !== null || submission.memoryUsed !== null ? (
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-subtle-foreground">
          {submission.executionTime !== null ? (
            <div className="flex gap-1.5">
              <dt>Time</dt>
              <dd className="text-muted-foreground">{submission.executionTime}ms</dd>
            </div>
          ) : null}
          {submission.memoryUsed !== null ? (
            <div className="flex gap-1.5">
              <dt>Memory</dt>
              <dd className="text-muted-foreground">
                {formatMemory(submission.memoryUsed)}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {/* ── Compiler / runtime message ──────────────────────────── */}
      {submission.message ? (
        <pre className="mt-3 max-h-40 overflow-auto rounded-md border border-border bg-[#0B0B0F] p-3 font-mono text-xs leading-relaxed text-rose-200">
          {submission.message}
        </pre>
      ) : null}

      {/* ── Failing case ────────────────────────────────────────── */}
      {submission.failure ? (
        <div className="mt-3 rounded-md border border-border bg-surface/60 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Failed on test {submission.failure.order}
            {submission.failure.isHidden ? " (hidden)" : ""}
          </p>

          {submission.failure.isHidden ? (
            <p className="mt-2 text-xs leading-relaxed text-subtle-foreground">
              Hidden tests aren&apos;t shown — they&apos;re what stops a solution that
              only works on the examples. The sample cases above are the same shape.
            </p>
          ) : (
            <dl className="mt-2 grid gap-2 font-mono text-xs">
              {submission.failure.input !== null ? (
                <div className="flex gap-2">
                  <dt className="shrink-0 text-subtle-foreground">Input</dt>
                  <dd className="min-w-0 break-all text-foreground">
                    {submission.failure.input}
                  </dd>
                </div>
              ) : null}
              <div className="flex gap-2">
                <dt className="shrink-0 text-subtle-foreground">Expected</dt>
                <dd className="min-w-0 break-all text-emerald-300">
                  {submission.failure.expectedOutput ?? "—"}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 text-subtle-foreground">Received</dt>
                <dd className="min-w-0 break-all text-rose-300">
                  {submission.failure.actualOutput ?? "nothing"}
                </dd>
              </div>
            </dl>
          )}
        </div>
      ) : null}

      {/* ── Teaching note ───────────────────────────────────────── */}
      {submission.feedback ? (
        <p className="pretty mt-3 text-sm leading-relaxed text-muted-foreground">
          {submission.feedback}
        </p>
      ) : null}

      {submission.status === "ACCEPTED" && submission.kind === "SUBMIT" ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Every test passed. Read the explanation on the left to see why the intended
          approach works — even when yours already does.
        </p>
      ) : null}

      {submission.simulated ? (
        <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-amber-300/90">
          This verdict was <strong>simulated</strong> by the development execution
          provider. No code was executed.
        </p>
      ) : null}
    </div>
  );
}

function formatMemory(kilobytes: number): string {
  return kilobytes >= 1024 ? `${(kilobytes / 1024).toFixed(1)}MB` : `${kilobytes}KB`;
}
