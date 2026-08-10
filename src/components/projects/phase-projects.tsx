import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDot, Clock3, Hammer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  DIFFICULTY_BADGE,
  DIFFICULTY_LABEL,
  PROJECT_STATUS_LABEL,
} from "@/lib/projects/progress";
import { cn } from "@/lib/utils";
import type { ProjectListItem } from "@/lib/projects/queries";

/**
 * Projects shown inside an expanded roadmap phase, after its topics.
 *
 * A project belongs to the phase containing the last topic it builds on — the
 * point by which a learner has everything it needs. That is derived rather than
 * authored, so re-ordering a roadmap moves its projects with it.
 *
 * This extends the roadmap rather than redesigning it: the phase timeline and
 * topic list are untouched, and this renders below them.
 */
export function PhaseProjects({ projects }: { projects: ProjectListItem[] }) {
  if (projects.length === 0) return null;

  return (
    <section
      aria-label="Projects for this phase"
      className="mt-5 border-t border-border pt-5"
    >
      <h4 className="flex items-center gap-2 text-xs font-medium uppercase tracking-label text-subtle-foreground">
        <Hammer className="size-3.5" aria-hidden />
        Build
      </h4>

      <ol className="mt-3 flex flex-col gap-2">
        {projects.map((project) => {
          const isComplete = project.status === "COMPLETED";
          const inProgress = project.status === "IN_PROGRESS";

          return (
            <li key={project.slug}>
              <Link
                href={`/projects/${project.slug}`}
                className={cn(
                  "block rounded-lg border p-4 transition-colors duration-200",
                  isComplete
                    ? "border-emerald-500/20 bg-emerald-500/[0.04] hover:border-emerald-500/40"
                    : inProgress
                      ? "border-primary/25 bg-primary/[0.04] hover:border-primary/40"
                      : "border-border bg-surface/50 hover:border-white/20 hover:bg-surface-raised",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                  <h5 className="flex min-w-0 items-start gap-2.5 text-sm font-medium text-foreground">
                    <span
                      aria-hidden
                      className={cn(
                        "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                        isComplete &&
                          "border-emerald-500/50 bg-emerald-500/20 text-emerald-400",
                        inProgress && "border-primary/50 bg-primary/20 text-indigo-300",
                        !isComplete && !inProgress && "border-border",
                      )}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="size-2.5" />
                      ) : inProgress ? (
                        <CircleDot className="size-2.5" />
                      ) : null}
                    </span>
                    <span className="min-w-0">
                      {project.title}
                      {/* Status in words too — never colour alone. */}
                      <span
                        className={cn(
                          "ml-2 text-xs font-normal",
                          isComplete
                            ? "text-emerald-400"
                            : inProgress
                              ? "text-indigo-300"
                              : "text-subtle-foreground",
                        )}
                      >
                        {PROJECT_STATUS_LABEL[project.status]}
                      </span>
                    </span>
                  </h5>

                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={DIFFICULTY_BADGE[project.difficulty]}>
                      {DIFFICULTY_LABEL[project.difficulty]}
                    </Badge>
                    <span className="inline-flex items-center gap-1.5 text-xs text-subtle-foreground">
                      <Clock3 className="size-3.5" aria-hidden />
                      {project.estimatedDuration}
                    </span>
                  </div>
                </div>

                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {project.shortDescription}
                </p>

                {inProgress && project.totalMilestones > 0 ? (
                  <p className="mt-2.5 font-mono text-xs text-indigo-300">
                    {project.completedMilestones}/{project.totalMilestones} milestones ·{" "}
                    {project.percentComplete}%
                  </p>
                ) : null}

                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300">
                  {isComplete
                    ? "View your work"
                    : inProgress
                      ? "Continue building"
                      : "View project"}
                  <ArrowRight className="size-3.5" aria-hidden />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
