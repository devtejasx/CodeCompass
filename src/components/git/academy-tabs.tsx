"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Compass,
  Github,
  Terminal,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommandReference } from "@/components/git/command-reference";
import { ExerciseRunner } from "@/components/git/exercise-runner";
import { GitSimulator } from "@/components/git/git-simulator";
import { MergeConflictSim } from "@/components/git/merge-conflict-sim";
import { PullRequestSim } from "@/components/git/pull-request-sim";
import { DIFFICULTY_BADGE, DIFFICULTY_SHORT } from "@/lib/careers/labels";
import { cn } from "@/lib/utils";
import type { ExerciseListItem, GitAcademy } from "@/lib/git/queries";
import type { GitHubConnectionState } from "@/lib/github/types";

/**
 * The interactive half of the Academy.
 *
 * One client island holding five panels. The curriculum content itself is
 * rendered on the server and passed in — this component owns which tab is open
 * and nothing else, so the page does not become a client application to support
 * a row of buttons.
 *
 * Panels are hidden rather than unmounted, so a half-finished exercise survives
 * a trip to the command reference.
 */

type Panel = "modules" | "simulator" | "exercises" | "workflows" | "reference";

const PANELS: { id: Panel; label: string }[] = [
  { id: "modules", label: "Curriculum" },
  { id: "simulator", label: "Simulator" },
  { id: "exercises", label: "Exercises" },
  { id: "workflows", label: "Workflows" },
  { id: "reference", label: "Commands" },
];

export function AcademyTabs({
  modules,
  exercises,
  github,
}: {
  modules: GitAcademy["modules"];
  exercises: ExerciseListItem[];
  github: {
    configured: boolean;
    state: GitHubConnectionState;
    username: string | null;
  };
}) {
  const [panel, setPanel] = React.useState<Panel>("modules");
  const [openExercise, setOpenExercise] = React.useState<string | null>(null);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Academy sections"
        className="flex flex-wrap gap-1 border-b border-border pb-2"
      >
        {PANELS.map((entry) => {
          const active = panel === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              role="tab"
              id={`academy-tab-${entry.id}`}
              aria-selected={active}
              aria-controls={`academy-panel-${entry.id}`}
              onClick={() => setPanel(entry.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition-colors duration-200",
                active
                  ? "bg-surface-raised text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {entry.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {/* ── Curriculum ──────────────────────────────────────── */}
        <Section id="modules" active={panel} title="Curriculum">
          <ol className="flex flex-col gap-3">
            {modules.map((module) => (
              <li key={module.id}>
                <div
                  className={cn(
                    "rounded-xl border p-5",
                    module.isComplete
                      ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                      : "border-border bg-surface/50",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <h3 className="flex min-w-0 items-baseline gap-2.5 text-base font-medium text-foreground">
                      <span className="font-mono text-xs text-subtle-foreground">
                        {String(module.order).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        {module.title}
                        {module.isComplete ? (
                          <span className="ml-2 text-xs font-normal text-emerald-400">
                            Complete
                          </span>
                        ) : null}
                      </span>
                    </h3>

                    <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-subtle-foreground">
                      <Clock3 className="size-3.5" aria-hidden />
                      {module.estimatedDuration}
                    </span>
                  </div>

                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {module.description}
                  </p>

                  {/* The ordering explanation, same as the roadmap. */}
                  <p className="mt-3 flex gap-2 rounded-lg border border-border bg-surface/60 p-3 text-sm leading-relaxed text-muted-foreground">
                    <Compass
                      className="mt-0.5 size-3.5 shrink-0 text-indigo-400"
                      aria-hidden
                    />
                    {module.whyThisComesNext}
                  </p>

                  <ul className="mt-3 flex flex-col gap-1.5">
                    {module.topics.map((topic) => (
                      <li key={topic.id}>
                        {topic.hasLesson ? (
                          <Link
                            href={`/learn/${topic.slug}`}
                            className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                          >
                            {topic.status === "COMPLETED" ? (
                              <CheckCircle2
                                className="size-3.5 shrink-0 text-emerald-400"
                                aria-hidden
                              />
                            ) : (
                              <span
                                aria-hidden
                                className="size-3.5 shrink-0 rounded-full border border-border"
                              />
                            )}
                            <span className="min-w-0 flex-1">{topic.title}</span>
                            {/* Never colour alone. */}
                            <span className="text-xs text-subtle-foreground">
                              {topic.status === "COMPLETED"
                                ? "Complete"
                                : topic.percentComplete > 0
                                  ? `${topic.percentComplete}%`
                                  : "Not started"}
                            </span>
                            <Badge variant={DIFFICULTY_BADGE[topic.difficulty]}>
                              {DIFFICULTY_SHORT[topic.difficulty]}
                            </Badge>
                          </Link>
                        ) : (
                          <span className="block px-2 py-2 text-sm text-subtle-foreground">
                            {topic.title} — lesson coming soon
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* ── Simulator ───────────────────────────────────────── */}
        <Section id="simulator" active={panel} title="Simulator">
          <div className="mb-5 max-w-[68ch]">
            <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
              <Terminal
                className="mt-0.5 size-4 shrink-0 text-indigo-400"
                aria-hidden
              />
              A model of Git you can type into. Nothing here runs on a real machine and
              nothing you do can break anything — try the commands you are unsure about
              and watch which of the three panels your files move between.
            </p>
          </div>
          <GitSimulator />
        </Section>

        {/* ── Exercises ───────────────────────────────────────── */}
        <Section id="exercises" active={panel} title="Exercises">
          <ul className="flex flex-col gap-3">
            {exercises.map((exercise) => {
              const isOpen = openExercise === exercise.slug;
              const done = exercise.status === "COMPLETED";

              return (
                <li key={exercise.slug}>
                  <div
                    className={cn(
                      "rounded-xl border",
                      done
                        ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                        : "border-border bg-surface/50",
                    )}
                  >
                    <h3>
                      <button
                        type="button"
                        onClick={() => setOpenExercise(isOpen ? null : exercise.slug)}
                        aria-expanded={isOpen}
                        aria-controls={`exercise-${exercise.slug}`}
                        className="flex w-full items-start justify-between gap-4 p-5 text-left"
                      >
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2">
                            {done ? (
                              <CheckCircle2
                                className="size-4 shrink-0 text-emerald-400"
                                aria-hidden
                              />
                            ) : null}
                            <span className="text-base font-medium text-foreground">
                              {exercise.title}
                            </span>
                            <span
                              className={cn(
                                "text-xs",
                                done ? "text-emerald-400" : "text-subtle-foreground",
                              )}
                            >
                              {done
                                ? "Solved"
                                : exercise.attempts > 0
                                  ? `${exercise.attempts} attempt${exercise.attempts === 1 ? "" : "s"}`
                                  : "Not started"}
                            </span>
                          </span>
                          <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                            {exercise.brief}
                          </span>
                        </span>

                        <ArrowRight
                          aria-hidden
                          className={cn(
                            "mt-1 size-4 shrink-0 text-subtle-foreground transition-transform duration-200",
                            isOpen && "rotate-90",
                          )}
                        />
                      </button>
                    </h3>

                    {isOpen ? (
                      <div
                        id={`exercise-${exercise.slug}`}
                        className="border-t border-border p-5"
                      >
                        <ExerciseRunner
                          slug={exercise.slug}
                          initiallyCompleted={done}
                        />
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </Section>

        {/* ── Workflows ───────────────────────────────────────── */}
        <Section id="workflows" active={panel} title="Workflows">
          <div className="flex flex-col gap-4">
            <PullRequestSim />
            <MergeConflictSim />

            <div className="surface rounded-xl p-5">
              <h3 className="flex items-center gap-2 text-base font-medium tracking-tight text-foreground">
                <Github className="size-4 text-indigo-400" aria-hidden />
                Your own repositories
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {!github.configured
                  ? "GitHub integration isn't configured on this deployment, so the connection features are unavailable. Everything else in this Academy works without it."
                  : github.state === "CONNECTED"
                    ? `Connected as ${github.username}. You can browse your repositories, and create one for a CodeCompass project.`
                    : github.state === "AUTHORIZATION_EXPIRED"
                      ? "Your GitHub connection needs renewing before repository features will work again."
                      : "Connect your GitHub account to browse your repositories and create one for a project — after you have practised the ideas here."}
              </p>
              <div className="mt-4">
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/github">
                    {github.state === "CONNECTED" ? "Manage GitHub" : "Go to GitHub"}
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Reference ───────────────────────────────────────── */}
        <Section id="reference" active={panel} title="Command reference">
          <CommandReference />
        </Section>
      </div>
    </div>
  );
}

/** Hidden rather than unmounted, so in-progress work survives a tab change. */
function Section({
  id,
  active,
  title,
  children,
}: {
  id: Panel;
  active: Panel;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="tabpanel"
      id={`academy-panel-${id}`}
      aria-labelledby={`academy-tab-${id}`}
      hidden={id !== active}
      tabIndex={0}
    >
      <h2 className="sr-only">{title}</h2>
      {children}
    </div>
  );
}
