"use client";

import * as React from "react";
import { CornerDownLeft, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GitGraph } from "@/components/git/git-graph";
import { emptyState, file, run } from "@/lib/git/simulator/engine";
import { cn } from "@/lib/utils";
import type { SimOutputLine, SimState } from "@/lib/git/simulator/types";

/**
 * The interactive Git simulator.
 *
 * Terminal-inspired rather than a terminal: a monospace transcript and a single
 * input, beside panels showing the three places a change can be and the commit
 * graph. Seeing a file move between those panels as you type is the entire
 * point — the concept becomes visible instead of described.
 *
 * There is no shell here. The input is parsed by a pure reducer, and a command
 * it does not recognise produces a message, never an execution.
 */
export function GitSimulator({
  initialState,
  onStateChange,
  className,
}: {
  initialState?: SimState;
  /** Lets an exercise watch for its goal being reached. */
  onStateChange?: (state: SimState) => void;
  className?: string;
}) {
  const start = React.useMemo(
    () =>
      initialState ??
      emptyState([
        file("README.md", "# My project"),
        file("app.js", "console.log('hi')"),
      ]),
    [initialState],
  );

  const [state, setState] = React.useState<SimState>(start);
  const [input, setInput] = React.useState("");
  const [lines, setLines] = React.useState<SimOutputLine[]>([
    { text: "A Git simulator. Nothing here runs on a real machine.", tone: "muted" },
    { text: "Type `git help` to see what it understands.", tone: "hint" },
  ]);
  /** Shell-style history, so Up recalls what you typed. */
  const [past, setPast] = React.useState<string[]>([]);
  const [pastIndex, setPastIndex] = React.useState<number | null>(null);

  const transcript = React.useRef<HTMLDivElement>(null);
  /*
   * Unique per instance. The free simulator and an open exercise are both
   * mounted at once (panels are hidden, not unmounted), and a hard-coded id
   * would put two of them in the document — invalid HTML, and it breaks the
   * label association that makes the input announceable.
   */
  const inputId = React.useId();

  React.useEffect(() => {
    transcript.current?.scrollTo({ top: transcript.current.scrollHeight });
  }, [lines]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const command = input.trim();
    if (command.length === 0) return;

    const result = run(state, command);

    setLines((previous) => [
      ...previous,
      { text: `$ ${command}`, tone: "normal" },
      ...result.output,
    ]);
    setState(result.state);
    setPast((previous) => [...previous, command]);
    setPastIndex(null);
    setInput("");
    onStateChange?.(result.state);
  };

  const recall = (direction: -1 | 1) => {
    if (past.length === 0) return;
    const next =
      pastIndex === null
        ? direction === -1
          ? past.length - 1
          : null
        : Math.min(Math.max(pastIndex + direction, 0), past.length - 1);

    setPastIndex(next);
    setInput(next === null ? "" : past[next]);
  };

  const reset = () => {
    setState(start);
    setLines([{ text: "Reset to the starting state.", tone: "muted" }]);
    setPast([]);
    setPastIndex(null);
    setInput("");
    onStateChange?.(start);
  };

  const untracked = state.files.filter(
    (entry) => !entry.tracked && !state.staged.includes(entry.name),
  );
  const modified = state.files.filter(
    (entry) => entry.tracked && entry.modified && !state.staged.includes(entry.name),
  );

  return (
    <div className={cn("grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]", className)}>
      {/* ── Transcript ──────────────────────────────────────────── */}
      <div className="min-w-0">
        <div
          ref={transcript}
          role="log"
          aria-live="polite"
          aria-label="Simulator output"
          className="h-[19rem] overflow-y-auto rounded-t-lg border border-b-0 border-border bg-[#0B0B0F] p-4 font-mono text-[13px] leading-relaxed"
        >
          {lines.map((entry, index) => (
            <p
              key={index}
              className={cn(
                "whitespace-pre-wrap break-words",
                entry.tone === "normal" && "text-white/85",
                entry.tone === "muted" && "text-subtle-foreground",
                entry.tone === "success" && "text-emerald-300",
                entry.tone === "warning" && "text-amber-300",
                entry.tone === "error" && "text-rose-300",
                entry.tone === "hint" && "text-indigo-300",
              )}
            >
              {entry.text}
            </p>
          ))}
        </div>

        <form
          onSubmit={submit}
          className="flex items-center gap-2 rounded-b-lg border border-border bg-surface-raised px-3 py-2"
        >
          <span aria-hidden className="font-mono text-sm text-indigo-400">
            $
          </span>
          <label htmlFor={inputId} className="sr-only">
            Git command
          </label>
          <input
            id={inputId}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp") {
                event.preventDefault();
                recall(-1);
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                recall(1);
              }
            }}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            placeholder="git status"
            className="min-w-0 flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-subtle-foreground"
          />
          <Button type="submit" size="sm" variant="ghost" className="h-7 px-2">
            <CornerDownLeft className="size-3.5" aria-hidden />
            <span className="sr-only">Run command</span>
            Run
          </Button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Button variant="secondary" size="sm" onClick={reset}>
            <RotateCcw aria-hidden />
            Reset
          </Button>
          <p className="text-xs text-subtle-foreground">
            Up and Down recall previous commands.{" "}
            <code className="font-mono">edit</code> and{" "}
            <code className="font-mono">new</code> stand in for your editor.
          </p>
        </div>
      </div>

      {/* ── The three places ────────────────────────────────────── */}
      <aside className="flex flex-col gap-3">
        <Place
          title="Working directory"
          hint="What is on disk right now"
          items={[
            ...untracked.map((entry) => ({ name: entry.name, note: "untracked" })),
            ...modified.map((entry) => ({ name: entry.name, note: "modified" })),
          ]}
          tone="warning"
        />
        <Place
          title="Staging area"
          hint="Chosen for the next commit"
          items={state.staged.map((name) => ({ name, note: "staged" }))}
          tone="success"
        />
        <Place
          title="Repository"
          hint={state.initialized ? `On branch ${state.head}` : "Not a repository yet"}
          items={
            state.initialized
              ? [
                  {
                    name: `${state.commits.length} commit${state.commits.length === 1 ? "" : "s"}`,
                    note: `${Object.keys(state.branches).length} branch${Object.keys(state.branches).length === 1 ? "" : "es"}`,
                  },
                ]
              : []
          }
          tone="brand"
        />

        {state.commits.length > 0 ? (
          <div className="rounded-lg border border-border bg-surface/50 p-3">
            <h4 className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
              History
            </h4>
            <GitGraph state={state} className="mt-2" />
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function Place({
  title,
  hint,
  items,
  tone,
}: {
  title: string;
  hint: string;
  items: { name: string; note: string }[];
  tone: "warning" | "success" | "brand";
}) {
  return (
    <section
      aria-label={title}
      className={cn(
        "rounded-lg border p-3",
        tone === "warning" && "border-amber-500/20 bg-amber-500/[0.04]",
        tone === "success" && "border-emerald-500/20 bg-emerald-500/[0.04]",
        tone === "brand" && "border-primary/20 bg-primary/[0.04]",
      )}
    >
      <h4 className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
        {title}
      </h4>
      <p className="mt-0.5 text-xs text-subtle-foreground">{hint}</p>

      {items.length === 0 ? (
        <p className="mt-2 font-mono text-xs text-subtle-foreground">empty</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1">
          {items.map((item) => (
            <li
              key={`${item.name}-${item.note}`}
              className="flex items-baseline justify-between gap-2 font-mono text-xs"
            >
              <span className="min-w-0 truncate text-foreground">{item.name}</span>
              <span className="shrink-0 text-subtle-foreground">{item.note}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
