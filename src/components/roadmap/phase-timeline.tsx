"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Clock3, Compass, Hammer, Lock } from "lucide-react";

import { TopicList } from "@/components/roadmap/topic-list";
import { PhaseMarker, PhaseStateBadge } from "@/components/roadmap/phase-state-badge";
import { PhaseProjects } from "@/components/projects/phase-projects";
import { cn } from "@/lib/utils";
import type { PhaseStatus } from "@/lib/roadmap/progress";
import type { TopicState } from "@/lib/learn/progress";
import type { RoadmapPhaseDetail } from "@/lib/roadmap/queries";
import type { ProjectListItem } from "@/lib/projects/queries";

interface PhaseTimelineProps {
  phases: RoadmapPhaseDetail[];
  /** Keyed by phase id. Derived on the server; see lib/roadmap/progress.ts. */
  states: Record<string, PhaseStatus>;
  /** Keyed by topic id; derived from real learner progress. */
  topicStates: Record<string, TopicState>;
  /** Topic ids that have an authored lesson. */
  topicsWithLessons: string[];
  /** Keyed by phase id. Projects whose last prerequisite lands in that phase. */
  phaseProjects?: Record<string, ProjectListItem[]>;
}

/**
 * The roadmap itself: a vertical, connected sequence of expandable phases.
 *
 * The only client-side state is which phases are open. Everything else —
 * content, ordering, state — is computed on the server and passed down.
 *
 * Locked phases still expand. Hiding their contents would defeat the point of
 * the page, which is to let someone understand the whole journey before
 * starting it; "locked" here communicates sequence, not secrecy.
 */
export function PhaseTimeline({
  phases,
  states,
  topicStates,
  topicsWithLessons,
  phaseProjects = {},
}: PhaseTimelineProps) {
  const reduced = useReducedMotion();

  // The phase the learner starts on opens by default; the rest stay collapsed
  // so the page is scannable as a sequence first.
  const initiallyOpen = phases.find(
    (phase) =>
      states[phase.id]?.state === "AVAILABLE" || states[phase.id]?.state === "CURRENT",
  );
  const [open, setOpen] = React.useState<string[]>(
    initiallyOpen ? [initiallyOpen.id] : [],
  );

  const toggle = (id: string) =>
    setOpen((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );

  return (
    <ol className="relative flex flex-col gap-4">
      {phases.map((phase, index) => {
        const status = states[phase.id] ?? {
          state: "LOCKED" as const,
          label: "Locked",
        };
        const isOpen = open.includes(phase.id);
        const isLast = index === phases.length - 1;
        const isMilestone = phase.kind === "PROJECT_MILESTONE";
        const highlighted = status.state === "AVAILABLE" || status.state === "CURRENT";

        return (
          <li key={phase.id} className="relative">
            {/* Connector to the next phase — the "↓" between steps. */}
            {!isLast ? (
              <span
                aria-hidden
                className="absolute left-[21px] top-12 h-[calc(100%+1rem)] w-px bg-border"
              />
            ) : null}

            <div className="flex gap-4">
              <PhaseMarker state={status.state} order={phase.order} />

              <div
                className={cn(
                  "min-w-0 flex-1 rounded-xl border transition-colors duration-200",
                  highlighted
                    ? "border-primary/30 bg-primary/[0.04]"
                    : "border-border bg-surface/50",
                )}
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => toggle(phase.id)}
                    aria-expanded={isOpen}
                    aria-controls={`phase-panel-${phase.id}`}
                    className="flex w-full items-start justify-between gap-4 rounded-xl p-5 text-left"
                  >
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-medium tracking-tight text-foreground">
                          {phase.title}
                        </span>
                        <PhaseStateBadge state={status.state} label={status.label} />
                        {isMilestone ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-muted-foreground">
                            <Hammer className="size-3.5" aria-hidden />
                            Milestones
                          </span>
                        ) : null}
                      </span>

                      <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                        {phase.description}
                      </span>

                      <span className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-subtle-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="size-3.5" aria-hidden />
                          {phase.estimatedDuration}
                        </span>
                        <span>
                          {phase.topics.length}{" "}
                          {phase.topics.length === 1 ? "topic" : "topics"}
                        </span>
                      </span>
                    </span>

                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "mt-1 size-4 shrink-0 text-subtle-foreground transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      id={`phase-panel-${phase.id}`}
                      initial={{ height: reduced ? "auto" : 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: reduced ? "auto" : 0, opacity: 0 }}
                      transition={{
                        duration: reduced ? 0 : 0.24,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border p-5">
                        {/*
                          The differentiator: not just what comes next, but why
                          it comes next. Shown for every phase, not only the
                          current one, so the whole sequence is explicable.
                        */}
                        <div className="mb-5 flex gap-3 rounded-lg border border-border bg-surface/60 p-4">
                          <Compass
                            className="mt-0.5 size-4 shrink-0 text-indigo-400"
                            aria-hidden
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
                              Why this comes next
                            </p>
                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                              {phase.whyThisComesNext}
                            </p>
                          </div>
                        </div>

                        <TopicList
                          topics={phase.topics}
                          states={topicStates}
                          topicsWithLessons={topicsWithLessons}
                        />

                        {/* Learn the topics, then build with them. */}
                        <PhaseProjects projects={phaseProjects[phase.id] ?? []} />

                        {status.state === "LOCKED" ? (
                          <p className="mt-4 flex items-center gap-2 text-xs text-subtle-foreground">
                            <Lock className="size-3.5 shrink-0" aria-hidden />
                            Locked for now — finish the earlier phases first. You can
                            still read everything here.
                          </p>
                        ) : null}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
