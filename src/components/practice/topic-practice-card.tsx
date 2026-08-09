import Link from "next/link";
import { ArrowRight, CheckCircle2, Code2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DIFFICULTY_BADGE, DIFFICULTY_LABEL } from "@/lib/practice/languages";
import type { ProblemDifficulty, ProblemStatus } from "@/generated/prisma/client";

export interface TopicPracticeProblem {
  slug: string;
  title: string;
  difficulty: ProblemDifficulty;
  estimatedTime: string;
  status: ProblemStatus;
}

/**
 * "Practise this topic", shown on the learning page.
 *
 * The problems come from the database via the ProblemTopic join — nothing here
 * is hardcoded, so authoring a problem against a topic slug is all it takes for
 * this card to appear on that topic.
 */
export function TopicPracticeCard({
  topicTitle,
  problems,
  learningComplete,
}: {
  topicTitle: string;
  problems: TopicPracticeProblem[];
  learningComplete: boolean;
}) {
  if (problems.length === 0) return null;

  const solved = problems.filter((problem) => problem.status === "SOLVED").length;
  const first = problems.find((problem) => problem.status !== "SOLVED") ?? problems[0];

  return (
    <section aria-labelledby="practice-heading" className="surface rounded-xl p-6">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-label text-indigo-300">
        <Code2 className="size-3.5" aria-hidden />
        Practice
      </p>

      <h2
        id="practice-heading"
        className="mt-3 text-lg font-medium tracking-tight text-foreground"
      >
        Practise {topicTitle}
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {learningComplete
          ? "You've finished the lesson. Writing the code is what makes it stick."
          : "Reading explains it; writing it is what makes it stick."}{" "}
        <span className="text-foreground">
          {problems.length} problem{problems.length === 1 ? "" : "s"} available
        </span>
        {solved > 0 ? `, ${solved} solved` : ""}.
      </p>

      <ul className="mt-4 flex flex-col gap-1.5">
        {problems.slice(0, 4).map((problem) => (
          <li key={problem.slug}>
            <Link
              href={`/practice/${problem.slug}`}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              {problem.status === "SOLVED" ? (
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
              <span className="min-w-0 flex-1">{problem.title}</span>
              <Badge variant={DIFFICULTY_BADGE[problem.difficulty]}>
                {DIFFICULTY_LABEL[problem.difficulty]}
              </Badge>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild>
          <Link href={`/practice/${first.slug}`}>
            {solved === problems.length ? "Practise again" : "Start practice"}
            <ArrowRight aria-hidden />
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/practice">All practice</Link>
        </Button>
      </div>
    </section>
  );
}
