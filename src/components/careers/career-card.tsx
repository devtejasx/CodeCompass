import Link from "next/link";
import { ArrowRight, Clock3, Hourglass } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { careerIcon } from "@/lib/careers/icons";
import {
  CATEGORY_LABEL,
  DIFFICULTY_BADGE,
  DIFFICULTY_SHORT,
} from "@/lib/careers/labels";
import { cn } from "@/lib/utils";
import type { CareerSummary } from "@/lib/careers/queries";

interface CareerCardProps {
  career: CareerSummary;
  /** Secondary action (e.g. the compare checkbox) rendered above the link overlay. */
  action?: React.ReactNode;
  className?: string;
}

/**
 * The whole card is clickable via a stretched link on the career name, so the
 * accessible name stays "Frontend Developer" rather than the entire card body.
 * `action` sits above that overlay so a secondary control remains usable.
 */
export function CareerCard({ career, action, className }: CareerCardProps) {
  const Icon = careerIcon(career.icon);

  return (
    <article
      className={cn(
        "surface-interactive group relative flex h-full flex-col rounded-xl p-5",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-surface text-indigo-400"
        >
          <Icon className="size-[18px]" />
        </span>
        <ArrowRight
          aria-hidden
          className="size-4 shrink-0 text-subtle-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground"
        />
      </div>

      <h3 className="mt-4 font-medium tracking-tight text-foreground">
        <Link
          href={`/careers/${career.slug}`}
          className="rounded outline-none after:absolute after:inset-0 after:content-['']"
        >
          {career.name}
        </Link>
      </h3>

      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {career.shortDescription}
      </p>

      <p className="mt-3 text-xs text-subtle-foreground">
        {CATEGORY_LABEL[career.category]}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <Badge variant={DIFFICULTY_BADGE[career.difficulty]}>
          {DIFFICULTY_SHORT[career.difficulty]}
        </Badge>
        <span className="inline-flex items-center gap-1.5 text-xs text-subtle-foreground">
          <Clock3 className="size-3.5" aria-hidden />
          {career.estimatedLearningTime}
        </span>
        {/*
          Said here rather than discovered after choosing. A learner who picks a
          path only to find an empty roadmap has been let down by the one
          promise this product makes.
        */}
        {career.roadmaps.length === 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/25 bg-amber-500/[0.08] px-2 py-0.5 text-xs text-amber-400">
            <Hourglass className="size-3" aria-hidden />
            Roadmap in progress
          </span>
        ) : null}
      </div>

      {action ? <div className="relative z-10 mt-3">{action}</div> : null}
    </article>
  );
}
