"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Copy, Loader2, Play, RotateCcw, Send } from "lucide-react";

import {
  getSubmissionState,
  runSubmission,
  startSubmission,
  type SubmissionView,
} from "@/app/actions/practice";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/practice/code-editor";
import { ProblemPanel } from "@/components/practice/problem-panel";
import { ResultPanel } from "@/components/practice/result-panel";
import { SubmissionHistory } from "@/components/practice/submission-history";
import { LANGUAGE_LABEL } from "@/lib/practice/languages";
import { isTerminal } from "@/lib/practice/feedback";
import { cn } from "@/lib/utils";
import type { CodeLanguage } from "@/generated/prisma/client";
import type { PracticeProblemDetail, SubmissionSummary } from "@/lib/practice/queries";

/**
 * The coding workspace.
 *
 * Split view on desktop, stacked on mobile. The client owns exactly three
 * things — which language is selected, what is in the buffer, and the state of
 * the current run. Everything else is server state, read on the server and
 * refreshed through router.refresh() when a submission changes it.
 *
 * The buffer is kept per language in a Map, so switching from Python to
 * JavaScript and back does not lose work. It is memory only: the durable copy
 * is the submission row, which is why reopening the page restores the last
 * thing that was actually sent.
 */
interface ProblemWorkspaceProps {
  problem: PracticeProblemDetail;
  hiddenTestCount: number;
  /** Null until they have attempted — the server withholds it, not the UI. */
  explanation: string | null;
  /** Languages this problem offers AND the execution service can run. */
  languages: CodeLanguage[];
  initialLanguage: CodeLanguage;
  /** Last submitted source per language, so returning restores the work. */
  savedCode: Partial<Record<CodeLanguage, string>>;
  submissions: SubmissionSummary[];
  solved: boolean;
  nextProblem: { slug: string; title: string } | null;
  /** True when nothing can run — misconfigured or unconfigured execution. */
  executionUnavailable: boolean;
  /** True when verdicts are simulated rather than executed. */
  executionSimulated: boolean;
}

/** How long the client keeps polling a submission before giving up on it. */
const POLL_TIMEOUT_MS = 45_000;
const POLL_INTERVAL_MS = 700;

export function ProblemWorkspace({
  problem,
  hiddenTestCount,
  explanation,
  languages,
  initialLanguage,
  savedCode,
  submissions,
  solved,
  nextProblem,
  executionUnavailable,
  executionSimulated,
}: ProblemWorkspaceProps) {
  const router = useRouter();

  const starterByLanguage = React.useMemo(() => {
    const map = new Map<CodeLanguage, string>();
    for (const entry of problem.languages) map.set(entry.language, entry.starterCode);
    return map;
  }, [problem.languages]);

  const [language, setLanguage] = React.useState<CodeLanguage>(initialLanguage);

  const [buffers, setBuffers] = React.useState<Map<CodeLanguage, string>>(() => {
    const map = new Map<CodeLanguage, string>();
    for (const entry of problem.languages) {
      map.set(entry.language, savedCode[entry.language] ?? entry.starterCode);
    }
    return map;
  });

  const [result, setResult] = React.useState<SubmissionView | null>(null);
  const [running, setRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [justSolved, setJustSolved] = React.useState(false);

  const code = buffers.get(language) ?? starterByLanguage.get(language) ?? "";
  const starter = starterByLanguage.get(language) ?? "";

  const setCode = React.useCallback(
    (next: string) => {
      setBuffers((previous) => new Map(previous).set(language, next));
    },
    [language],
  );

  const execute = React.useCallback(
    async (kind: "RUN" | "SUBMIT") => {
      if (running || executionUnavailable) return;

      setRunning(true);
      setError(null);
      setResult(null);

      try {
        const started = await startSubmission({
          problemId: problem.id,
          language,
          kind,
          code,
        });

        if (!started.ok || !started.submissionId) {
          setError(started.error ?? "That could not be run.");
          return;
        }

        // QUEUED → RUNNING → terminal. The request is bounded on the server
        // too; this only decides how long the UI waits before saying so.
        const ran = await runSubmission({ submissionId: started.submissionId });

        let view = ran.ok ? (ran.submission ?? null) : null;
        if (!ran.ok) {
          setError(ran.error ?? "That could not be run.");
        }

        // If the run came back still in flight (another tab, a retry), poll.
        const deadline = Date.now() + POLL_TIMEOUT_MS;
        while (view && !isTerminal(view.status) && Date.now() < deadline) {
          await sleep(POLL_INTERVAL_MS);
          const polled = await getSubmissionState({
            submissionId: started.submissionId,
          });
          view = polled.ok ? (polled.submission ?? null) : null;
        }

        if (view && !isTerminal(view.status)) {
          setError(
            "Your code is taking longer than expected. It has been saved — try again in a moment.",
          );
          return;
        }

        setResult(view);

        if (view?.status === "ACCEPTED" && kind === "SUBMIT") {
          setJustSolved(true);
        }

        if (kind === "SUBMIT") {
          // Pull the server's view of progress and history back in.
          router.refresh();
        }
      } catch {
        setError(
          "Code execution is temporarily unavailable. Your code has not been lost.",
        );
      } finally {
        setRunning(false);
      }
    },
    [code, executionUnavailable, language, problem.id, router, running],
  );

  /*
   * Stable identities for the two callbacks handed to children.
   *
   * `loadSubmissionCode` is what makes `SubmissionHistory`'s memo hold: as an
   * inline arrow it was a new function on every keystroke, so the history list
   * re-rendered with it. `reset` follows the same rule for consistency, since
   * both are handed to components that have no other reason to update while the
   * learner types.
   */
  const reset = React.useCallback(() => {
    setCode(starter);
    setResult(null);
    setError(null);
  }, [setCode, starter]);

  const loadSubmissionCode = React.useCallback(
    (loaded: string, loadedLanguage: CodeLanguage) => {
      if (languages.includes(loadedLanguage)) setLanguage(loadedLanguage);
      setBuffers((previous) => new Map(previous).set(loadedLanguage, loaded));
    },
    [languages],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const showSolved = solved || justSolved;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-8">
      {/* ── Problem ─────────────────────────────────────────────── */}
      {/*
        The independently-scrolling problem column is a desktop affordance and
        stays one: below `lg` it is simply part of the page. `dvh` alongside `vh`
        because the split view is reachable on a landscape tablet, where `vh`
        over-measures by the height of the browser chrome.
      */}
      <div className="min-w-0 lg:max-h-[calc(100dvh-9rem)] lg:overflow-y-auto lg:pr-4">
        <ProblemPanel
          problem={problem}
          hiddenTestCount={hiddenTestCount}
          explanation={explanation}
          solved={showSolved}
        />
      </div>

      {/* ── Editor + results ────────────────────────────────────── */}
      <div className="flex min-w-0 flex-col gap-4">
        {executionUnavailable ? (
          <p
            className="rounded-lg border border-amber-500/25 bg-amber-500/[0.06] p-3 text-xs leading-relaxed text-amber-300"
            role="status"
          >
            Code execution isn&apos;t configured on this deployment, so Run and Submit
            are unavailable. You can still read the problem and write a solution —
            nothing you type is lost.
          </p>
        ) : executionSimulated ? (
          <p
            className="rounded-lg border border-amber-500/25 bg-amber-500/[0.06] p-3 text-xs leading-relaxed text-amber-300"
            role="status"
          >
            <strong>Development mode.</strong> Results are simulated, not executed. A
            sandboxed execution service is required before this grades real code.
          </p>
        ) : null}

        {/* ── Toolbar ──────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="language-select" className="sr-only">
            Programming language
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(event) => setLanguage(event.target.value as CodeLanguage)}
            // text-base below `sm`, because iOS Safari zooms the whole page
            // when a control smaller than 16px takes focus — and a page zoomed
            // by the language picker leaves the editor half off-screen.
            className="tap-target h-8 rounded-lg border border-border bg-surface/60 px-2.5 text-base text-foreground transition-colors hover:bg-surface-raised sm:text-sm"
          >
            {languages.map((entry) => (
              <option key={entry} value={entry}>
                {LANGUAGE_LABEL[entry]}
              </option>
            ))}
          </select>

          <span className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={copy}
              className="h-8 px-2 text-xs"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-400" aria-hidden />
              ) : (
                <Copy className="size-3.5" aria-hidden />
              )}
              Copy
              <span className="sr-only"> code to clipboard</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="h-8 px-2 text-xs"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              Reset
              <span className="sr-only"> code to the starter template</span>
            </Button>
          </span>
        </div>

        {/* ── Editor ───────────────────────────────────────────── */}
        {/*
          Sized off the *viewport* on a phone rather than left at a flat 22rem.
          A fixed 352px editor is a reasonable share of a 812px phone and a poor
          one of a 667px phone, where it left barely a hundred pixels for the
          Run button and the result panel below it. `60dvh` keeps the editor
          proportionate at either size and — unlike `vh` — measures the space
          that is actually on screen, so the Run button is never parked under
          the address bar. The floors stop it collapsing on a very short screen,
          and desktop keeps its existing fill-the-window behaviour.
        */}
        <div className="h-[max(18rem,60dvh)] sm:h-[26rem] lg:h-[calc(100dvh-26rem)] lg:min-h-[24rem]">
          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            onRun={() => void execute("RUN")}
            onSubmit={() => void execute("SUBMIT")}
            readOnly={running}
          />
        </div>

        {/* ── Actions ──────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => void execute("RUN")}
            disabled={running || executionUnavailable}
          >
            {running ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <Play aria-hidden />
            )}
            Run
          </Button>
          <Button
            onClick={() => void execute("SUBMIT")}
            disabled={running || executionUnavailable}
          >
            <Send aria-hidden />
            Submit
          </Button>

          <p className="ml-auto hidden text-xs text-subtle-foreground sm:block">
            <kbd className="font-mono">Ctrl</kbd>+<kbd className="font-mono">Enter</kbd>{" "}
            to run · <kbd className="font-mono">Ctrl</kbd>+
            <kbd className="font-mono">Shift</kbd>+
            <kbd className="font-mono">Enter</kbd> to submit
          </p>
        </div>

        {/* ── Result ───────────────────────────────────────────── */}
        <ResultPanel submission={result} running={running} error={error} />

        {/* ── Solved ───────────────────────────────────────────── */}
        {showSolved ? (
          <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] p-4">
            <p className="text-sm font-medium text-emerald-400">Problem solved</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {nextProblem
                ? "Keep the momentum — here's the next one for what you're learning."
                : "That's the last problem we have for this topic. More are on the way."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {nextProblem ? (
                <Button asChild size="sm">
                  {/*
                    One link, and the one a learner who has just solved
                    something is most likely to take. Prefetched on sight
                    because it is exactly one request, not three hundred.
                  */}
                  <Link href={`/practice/${nextProblem.slug}`} prefetch>
                    Next: {nextProblem.title}
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              ) : null}
              <Button variant="secondary" size="sm" asChild>
                <Link href="/practice">Back to practice</Link>
              </Button>
            </div>
          </div>
        ) : null}

        {/* ── History ──────────────────────────────────────────── */}
        <section aria-labelledby="history-heading" className={cn("mt-2")}>
          <h2
            id="history-heading"
            className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
          >
            Your submissions
          </h2>
          <div className="mt-3">
            <SubmissionHistory
              submissions={submissions}
              onLoadCode={loadSubmissionCode}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
