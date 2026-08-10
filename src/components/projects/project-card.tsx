import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, CircleDot } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  DIFFICULTY_BADGE,
  DIFFICULTY_LABEL,
  TYPE_LABEL,
} from "@/lib/projects/progress";
import { cn } from "@/lib/utils";
import type { ProjectListItem } from "@/lib/projects/queries";

/**
 * One project in a list.
 *
 * Status is carried by an icon and a word as well as by colour, so "completed"
 * is never something a learner has to infer from a hue. Progress only appears
 * once there is progress — an empty bar on every card is noise.
 */
export function ProjectCard({
  project,
  reason,
  className,
}: {
  project: ProjectListItem;
  /** Why this is being shown, when it is being recommended. */
  reason?: string;
  className?: string;
}) {
  const completed = project.status === "COMPLETED";
  const inProgress = project.status === "IN_PROGRESS";

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "surface-interactive group flex flex-col gap-3 rounded-xl p-5",
        completed && "border-emerald-500/20",
        inProgress && "border-primary/25",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-foreground">{project.title}</h3>
        {completed ? (
          <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden />
        ) : inProgress ? (
          <CircleDot className="size-4 shrink-0 text-indigo-400" aria-hidden />
        ) : null}
      </div>

      {reason ? <p className="text-xs text-indigo-300">{reason}</p> : null}

      <p className="pretty text-sm leading-relaxed text-muted-foreground">
        {project.shortDescription}
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <Badge variant={DIFFICULTY_BADGE[project.difficulty]}>
          {DIFFICULTY_LABEL[project.difficulty]}
        </Badge>
        <span className="inline-flex items-center gap-1.5 text-xs text-subtle-foreground">
          <Clock3 className="size-3.5" aria-hidden />
          {project.estimatedDuration}
        </span>
        <span className="text-xs text-subtle-foreground">
          {TYPE_LABEL[project.type]}
        </span>
      </div>

      {project.technologies.length > 0 ? (
        <p className="text-xs text-subtle-foreground">
          {project.technologies
            .slice(0, 4)
            .map((technology) => technology.name)
            .join(" · ")}
        </p>
      ) : null}

      {/* Progress appears only once something has actually been done. */}
      {inProgress && project.totalMilestones > 0 ? (
        <div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-surface-raised"
            role="progressbar"
            aria-valuenow={project.percentComplete}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${project.title} progress`}
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${project.percentComplete}%` }}
            />
          </div>
          <p className="mt-1.5 font-mono text-xs text-subtle-foreground">
            {project.completedMilestones}/{project.totalMilestones} milestones ·{" "}
            {project.percentComplete}%
          </p>
        </div>
      ) : null}

      <p className="mt-auto flex items-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
        {completed ? "View project" : inProgress ? "Continue building" : "View project"}
        <ArrowRight
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </p>
    </Link>
  );
}
