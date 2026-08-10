import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDot, Clock3, Hammer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DIFFICULTY_BADGE, DIFFICULTY_LABEL } from "@/lib/projects/progress";
import type { ProjectDifficulty, ProjectStatus } from "@/generated/prisma/client";

export interface TopicProject {
  slug: string;
  title: string;
  shortDescription: string;
  difficulty: ProjectDifficulty;
  estimatedDuration: string;
  status: ProjectStatus;
}

/**
 * "Build with what you learned", shown on the learning page.
 *
 * Sourced from the ProjectConcept join, so authoring a project against a topic
 * slug is all it takes for this to appear on that topic — nothing here is
 * hardcoded.
 *
 * It sits after practice for a reason: a problem exercises one idea, a project
 * combines several. Offering the project before the learner has practised the
 * parts would be setting them up to flail.
 */
export function TopicProjectCard({
  topicTitle,
  projects,
  learningComplete,
}: {
  topicTitle: string;
  projects: TopicProject[];
  learningComplete: boolean;
}) {
  if (projects.length === 0) return null;

  const completed = projects.filter((project) => project.status === "COMPLETED").length;
  const next =
    projects.find((project) => project.status === "IN_PROGRESS") ??
    projects.find((project) => project.status === "NOT_STARTED") ??
    projects[0];

  return (
    <section aria-labelledby="build-heading" className="surface rounded-xl p-6">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-label text-indigo-300">
        <Hammer className="size-3.5" aria-hidden />
        Build
      </p>

      <h2
        id="build-heading"
        className="mt-3 text-lg font-medium tracking-tight text-foreground"
      >
        Build with what you learned
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {learningComplete
          ? `${topicTitle} shows up in real projects. Here's where it goes.`
          : `${topicTitle} is part of these projects — worth knowing where it's heading.`}{" "}
        <span className="text-foreground">
          {projects.length} project{projects.length === 1 ? "" : "s"}
        </span>
        {completed > 0 ? `, ${completed} completed` : ""}.
      </p>

      <ul className="mt-4 flex flex-col gap-1.5">
        {projects.slice(0, 3).map((project) => (
          <li key={project.slug}>
            <Link
              href={`/projects/${project.slug}`}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              {project.status === "COMPLETED" ? (
                <CheckCircle2
                  className="size-3.5 shrink-0 text-emerald-400"
                  aria-hidden
                />
              ) : project.status === "IN_PROGRESS" ? (
                <CircleDot className="size-3.5 shrink-0 text-indigo-400" aria-hidden />
              ) : (
                <span
                  aria-hidden
                  className="size-3.5 shrink-0 rounded-full border border-border"
                />
              )}
              <span className="min-w-0 flex-1">{project.title}</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-subtle-foreground">
                <Clock3 className="size-3" aria-hidden />
                {project.estimatedDuration}
              </span>
              <Badge variant={DIFFICULTY_BADGE[project.difficulty]}>
                {DIFFICULTY_LABEL[project.difficulty]}
              </Badge>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild>
          <Link href={`/projects/${next.slug}`}>
            {next.status === "IN_PROGRESS" ? "Continue building" : "Build this project"}
            <ArrowRight aria-hidden />
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/projects">All projects</Link>
        </Button>
      </div>
    </section>
  );
}
