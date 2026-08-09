import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDot } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  DIFFICULTY_BADGE,
  DIFFICULTY_LABEL,
  LANGUAGE_LABEL,
  sortLanguages,
} from "@/lib/practice/languages";
import { cn } from "@/lib/utils";
import type {
  CodeLanguage,
  ProblemDifficulty,
  ProblemStatus,
} from "@/generated/prisma/client";

export interface ProblemCardData {
  slug: string;
  title: string;
  difficulty: ProblemDifficulty;
  estimatedTime: string;
  status: ProblemStatus;
  attempts?: number;
  languages?: CodeLanguage[];
  topics?: { id: string; title: string }[];
}

/**
 * One problem in a list.
 *
 * Solved and attempted are marked, and that is as far as the gamification goes:
 * no points, no streaks, no badges. The signal a learner needs from this card is
 * "have I done this, and is it the right size for me right now".
 */
export function ProblemCard({
  problem,
  reason,
  className,
}: {
  problem: ProblemCardData;
  /** Optional "because you just finished X" line. */
  reason?: string;
  className?: string;
}) {
  const solved = problem.status === "SOLVED";
  const attempted = problem.status === "ATTEMPTED";

  return (
    <Link
      href={`/practice/${problem.slug}`}
      className={cn(
        "surface-interactive group flex flex-col gap-3 rounded-xl p-4",
        solved && "border-emerald-500/20",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-foreground">{problem.title}</h3>
        {solved ? (
          <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden />
        ) : attempted ? (
          <CircleDot className="size-4 shrink-0 text-amber-400" aria-hidden />
        ) : null}
      </div>

      {reason ? <p className="text-xs text-indigo-300">{reason}</p> : null}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <Badge variant={DIFFICULTY_BADGE[problem.difficulty]}>
          {DIFFICULTY_LABEL[problem.difficulty]}
        </Badge>
        <span className="text-xs text-subtle-foreground">{problem.estimatedTime}</span>
        {problem.topics && problem.topics.length > 0 ? (
          <span className="min-w-0 truncate text-xs text-subtle-foreground">
            {problem.topics[0].title}
          </span>
        ) : null}
      </div>

      {problem.languages && problem.languages.length > 0 ? (
        <p className="text-xs text-subtle-foreground">
          {sortLanguages(problem.languages)
            .map((language) => LANGUAGE_LABEL[language])
            .join(" · ")}
        </p>
      ) : null}

      <p className="mt-auto flex items-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
        {solved
          ? "Solve again"
          : attempted
            ? `Continue${problem.attempts ? ` · ${problem.attempts} attempt${problem.attempts === 1 ? "" : "s"}` : ""}`
            : "Solve"}
        <ArrowRight
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </p>
    </Link>
  );
}
