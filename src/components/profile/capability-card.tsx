import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { capabilityIcon } from "@/lib/profile/icons";
import { LEVEL_LABEL, LEVEL_PERCENT } from "@/lib/profile/levels";
import { cn } from "@/lib/utils";
import type { CapabilityView } from "@/lib/profile/capabilities";

/**
 * One capability, with its evidence.
 *
 * The level is always a word, never only a bar or a colour — "Applying" is the
 * claim, and the bar is decoration for it. The counts sit underneath because
 * they are the actual answer to "how do you know?", and a card that showed a
 * percentage without them would be exactly the thing this phase exists to
 * replace.
 */
export function CapabilityCard({
  capability,
  className,
}: {
  capability: CapabilityView;
  className?: string;
}) {
  const Icon = capabilityIcon(capability.icon);
  const { evidence, level } = capability;

  /** Only dimensions this capability actually has. */
  const counts: string[] = [];
  if (evidence.topicsTotal > 0) {
    counts.push(`${evidence.topicsCompleted}/${evidence.topicsTotal} topics`);
  }
  if (evidence.problemsTotal > 0) {
    counts.push(`${evidence.problemsSolved}/${evidence.problemsTotal} problems`);
  }
  if (evidence.projectsTotal > 0) {
    counts.push(`${evidence.projectsCompleted}/${evidence.projectsTotal} projects`);
  }
  if (evidence.gitExercisesTotal > 0) {
    counts.push(
      `${evidence.gitExercisesCompleted}/${evidence.gitExercisesTotal} exercises`,
    );
  }
  if (evidence.aiWorkflowsTotal > 0) {
    counts.push(
      `${evidence.aiWorkflowsCompleted}/${evidence.aiWorkflowsTotal} workflows`,
    );
  }

  const percent = level ? LEVEL_PERCENT[level] : 0;

  return (
    <Link
      href={`/profile/skills/${capability.slug}`}
      className={cn(
        "surface-interactive group flex flex-col gap-3 rounded-xl p-5",
        level === "CONFIDENT" && "border-emerald-500/25",
        level === "APPLYING" && "border-primary/25",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-surface text-indigo-400"
          >
            <Icon className="size-4" />
          </span>
          <h3 className="min-w-0 truncate text-sm font-medium text-foreground">
            {capability.name}
          </h3>
        </div>

        {/* A word, always. The level is never carried by colour alone. */}
        <span
          className={cn(
            "shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium",
            level === "CONFIDENT"
              ? "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-400"
              : level === "APPLYING"
                ? "border-primary/30 bg-primary/10 text-indigo-300"
                : "border-border bg-surface text-muted-foreground",
          )}
        >
          {level ? LEVEL_LABEL[level] : "Not started"}
        </span>
      </div>

      <p className="pretty text-sm leading-relaxed text-muted-foreground">
        {capability.description}
      </p>

      <div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-surface-raised"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${capability.name}: ${level ? LEVEL_LABEL[level] : "not started"}${
            counts.length > 0 ? ` — ${counts.join(", ")}` : ""
          }`}
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-500",
              level === "CONFIDENT" ? "bg-emerald-500" : "bg-primary",
            )}
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* The evidence. This is the part that matters. */}
        {counts.length > 0 ? (
          <p className="mt-2 font-mono text-xs text-subtle-foreground">
            {counts.join(" · ")}
          </p>
        ) : null}
      </div>

      <p className="mt-auto flex items-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
        View evidence
        <ArrowRight
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </p>
    </Link>
  );
}
