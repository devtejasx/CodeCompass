import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDot } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_BADGE, DIFFICULTY_SHORT } from "@/lib/careers/labels";
import { aiToolIcon } from "@/lib/ai-tools/icons";
import { ENVIRONMENT_SHORT, STATUS_LABEL } from "@/lib/ai-tools/labels";
import { cn } from "@/lib/utils";
import type { AIToolListItem } from "@/lib/ai-tools/queries";

/**
 * One AI tool in a list.
 *
 * Status is carried by a word as well as by colour — a superseded tool says
 * "Superseded", it is not merely tinted differently — because a learner should
 * never have to infer that a tool is out of date from a hue.
 *
 * The glyph is a generic icon, never a product logo: brand assets carry
 * licences, and an approximated logo misrepresents a company using its own
 * identity. The name is always beside it in text, so nothing depends on
 * recognising the shape.
 */
export function ToolCard({
  tool,
  reason,
  className,
}: {
  tool: AIToolListItem;
  /** Why this is being shown, when it is being recommended. */
  reason?: string;
  className?: string;
}) {
  const Icon = aiToolIcon(tool.iconIdentifier);
  const deprecated = tool.status === "DEPRECATED";
  const complete = tool.progressStatus === "COMPLETED";
  const started = tool.progressStatus === "IN_PROGRESS";

  return (
    <Link
      href={`/academy/ai-tools/${tool.slug}`}
      className={cn(
        "surface-interactive group flex flex-col gap-3 rounded-xl p-5",
        complete && "border-emerald-500/20",
        started && "border-primary/25",
        deprecated && "border-amber-500/20",
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
            {tool.name}
          </h3>
        </div>

        {complete ? (
          <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden />
        ) : started ? (
          <CircleDot className="size-4 shrink-0 text-indigo-400" aria-hidden />
        ) : null}
      </div>

      {reason ? <p className="pretty text-xs text-indigo-300">{reason}</p> : null}

      <p className="pretty text-sm leading-relaxed text-muted-foreground">
        {tool.description}
      </p>

      <dl className="flex flex-col gap-1 text-xs">
        <div className="flex gap-1.5">
          <dt className="text-subtle-foreground">Category</dt>
          <dd className="min-w-0 truncate text-muted-foreground">{tool.category.name}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-subtle-foreground">Best for</dt>
          <dd className="min-w-0 truncate text-muted-foreground">{tool.primaryUse}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <Badge variant={DIFFICULTY_BADGE[tool.difficulty]}>
          {DIFFICULTY_SHORT[tool.difficulty]}
        </Badge>

        {/* Never colour alone: the status is spelled out. */}
        {tool.status !== "ACTIVE" ? (
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 text-xs font-medium",
              deprecated
                ? "border-amber-500/20 bg-amber-500/[0.08] text-amber-400"
                : "border-cyan-500/20 bg-cyan-500/[0.08] text-cyan-300",
            )}
          >
            {STATUS_LABEL[tool.status]}
          </span>
        ) : null}

        {tool.environments.length > 0 ? (
          <span className="text-xs text-subtle-foreground">
            {tool.environments.map((env) => ENVIRONMENT_SHORT[env]).join(" · ")}
          </span>
        ) : null}
      </div>

      {started && tool.percentComplete > 0 ? (
        <div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-surface-raised"
            role="progressbar"
            aria-valuenow={tool.percentComplete}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${tool.name} learning progress`}
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${tool.percentComplete}%` }}
            />
          </div>
          <p className="mt-1.5 font-mono text-xs text-subtle-foreground">
            {tool.percentComplete}% of the learning path
          </p>
        </div>
      ) : null}

      <p className="mt-auto flex items-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
        {complete ? "Review" : started ? "Continue" : "Explore"}
        <ArrowRight
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </p>
    </Link>
  );
}
