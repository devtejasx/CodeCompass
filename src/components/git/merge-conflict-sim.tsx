"use client";

import * as React from "react";
import { AlertTriangle, Check, GitMerge, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A merge conflict, resolved by hand.
 *
 * The learner sees the markers Git actually writes, chooses a resolution, and
 * is shown what the file becomes. Local and conceptual — no repository is
 * touched, and no Git command is executed.
 *
 * The teaching point is that a conflict is Git declining to guess, not Git
 * failing, and that the resolution is a decision only a person can make.
 */

type Choice = "ours" | "theirs" | "both" | null;

const OURS = 'const title = "Hello";';
const THEIRS = 'const title = "Welcome";';
const BOTH = 'const title = "Welcome, and hello";';

export function MergeConflictSim() {
  const [choice, setChoice] = React.useState<Choice>(null);
  const [committed, setCommitted] = React.useState(false);

  const resolved =
    choice === "ours" ? OURS : choice === "theirs" ? THEIRS : choice === "both" ? BOTH : null;

  return (
    <div className="surface rounded-xl p-5">
      <h3 className="flex items-center gap-2 text-base font-medium tracking-tight text-foreground">
        <GitMerge className="size-4 text-indigo-400" aria-hidden />
        Resolve a merge conflict
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        You ran <code className="font-mono text-xs">git merge feature/greeting</code> and
        both branches changed the same line. Git stopped and left the decision to you —
        that is what a conflict is.
      </p>

      {/* ── The two versions, described in words too ────────────── */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface/60 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Yours — on <span className="font-mono">main</span>
          </p>
          <pre className="mt-2 overflow-x-auto font-mono text-xs text-white/85">{OURS}</pre>
        </div>
        <div className="rounded-lg border border-border bg-surface/60 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Theirs — from <span className="font-mono">feature/greeting</span>
          </p>
          <pre className="mt-2 overflow-x-auto font-mono text-xs text-white/85">{THEIRS}</pre>
        </div>
      </div>

      {/* ── What Git wrote into the file ────────────────────────── */}
      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
          What Git put in the file
        </p>
        <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-[#0B0B0F] p-3 font-mono text-xs leading-relaxed">
          <span className="text-rose-300">{"<<<<<<< HEAD\n"}</span>
          <span className="text-white/85">{`${OURS}\n`}</span>
          <span className="text-subtle-foreground">{"=======\n"}</span>
          <span className="text-white/85">{`${THEIRS}\n`}</span>
          <span className="text-rose-300">{">>>>>>> feature/greeting"}</span>
        </pre>
        <p className="mt-2 text-xs leading-relaxed text-subtle-foreground">
          Between <code className="font-mono">{"<<<<<<<"}</code> and{" "}
          <code className="font-mono">=======</code> is your branch&apos;s version. Between{" "}
          <code className="font-mono">=======</code> and{" "}
          <code className="font-mono">{">>>>>>>"}</code> is the incoming one.
        </p>
      </div>

      {/* ── Choose ──────────────────────────────────────────────── */}
      <fieldset className="mt-5">
        <legend className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
          What should the line say?
        </legend>

        <div className="mt-3 flex flex-col gap-2">
          {(
            [
              { id: "ours", label: "Keep yours", code: OURS },
              { id: "theirs", label: "Take theirs", code: THEIRS },
              { id: "both", label: "Write something new", code: BOTH },
            ] as const
          ).map((option) => (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                choice === option.id
                  ? "border-primary/40 bg-primary/[0.06]"
                  : "border-border bg-surface/40 hover:border-white/20",
              )}
            >
              <input
                type="radio"
                name="conflict-resolution"
                value={option.id}
                checked={choice === option.id}
                onChange={() => {
                  setChoice(option.id);
                  setCommitted(false);
                }}
                className="sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                  choice === option.id
                    ? "border-primary/60 bg-primary/25 text-indigo-200"
                    : "border-border",
                )}
              >
                {choice === option.id ? <Check className="size-2.5" /> : null}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">
                  {option.label}
                </span>
                <span className="mt-0.5 block break-all font-mono text-xs text-muted-foreground">
                  {option.code}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* ── Result ──────────────────────────────────────────────── */}
      {resolved ? (
        <div role="status" className="mt-5">
          <p className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
            The file after you edit it
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg border border-emerald-500/25 bg-[#0B0B0F] p-3 font-mono text-xs text-emerald-200">
            {resolved}
          </pre>

          <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-amber-300">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Every marker line is gone. Leaving one behind commits code that is not valid
            in any language — nothing is resolved until all three have been deleted.
          </p>

          {committed ? (
            <div className="mt-4 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                <Check className="size-4" aria-hidden />
                Conflict resolved
              </p>
              <p className="pretty mt-2 text-sm leading-relaxed text-muted-foreground">
                Nothing was broken and nothing was lost. Git could not know which version
                was right, so it asked the one person who did. That is all a conflict
                ever is — and the way to have fewer of them is shorter branches and
                pulling from main more often, not avoiding branches.
              </p>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setCommitted(true)}>
                git add index.js &amp;&amp; git commit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setChoice(null);
                  setCommitted(false);
                }}
              >
                <RotateCcw aria-hidden />
                Choose again
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
