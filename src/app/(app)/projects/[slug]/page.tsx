import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { GridBackdrop } from "@/components/shared/backdrops";
import { StartProjectButton } from "@/components/projects/start-project-button";
import {
  ConceptList,
  RequirementList,
  ResourceList,
} from "@/components/projects/project-sections";
import { requireUser } from "@/lib/session";
import {
  DIFFICULTY_BADGE,
  DIFFICULTY_LABEL,
  milestonePercent,
  TYPE_LABEL,
} from "@/lib/projects/progress";
import { isReady } from "@/lib/projects/recommend";
import {
  getCompletedTopicIdsForUser,
  getProjectDetail,
  getUserProject,
} from "@/lib/projects/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectDetail(slug);

  // Describes the project only — never the reader's progress on it.
  return project
    ? {
        title: project.title,
        description: project.shortDescription,
        robots: { index: false },
      }
    : { title: "Project not found", robots: { index: false } };
}

/**
 * The project detail page.
 *
 * Written to answer, in order: what am I building, why, what should it do, what
 * will I practise, and what do I do first. Everything else is secondary and is
 * left to the workspace.
 */
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const user = await requireUser(`/projects/${slug}`);
  const project = await getProjectDetail(slug);

  if (!project) notFound();

  const [userProject, completedTopicIds] = await Promise.all([
    getUserProject(user.id, project.id),
    getCompletedTopicIdsForUser(user.id),
  ]);

  const prerequisiteTopicIds = project.concepts
    .filter((entry) => entry.isPrerequisite)
    .map((entry) => entry.topic.id);

  const ready = isReady(prerequisiteTopicIds, completedTopicIds);
  const missing = project.concepts.filter(
    (entry) => entry.isPrerequisite && !completedTopicIds.includes(entry.topic.id),
  );

  const started = userProject !== null;
  const isComplete = userProject?.status === "COMPLETED";

  const completedMilestones =
    userProject?.milestones.filter((milestone) => milestone.status === "COMPLETED")
      .length ?? 0;
  const percent = milestonePercent({
    total: project.milestones.length,
    completed: completedMilestones,
  });

  return (
    <div className="relative flex-1 overflow-hidden pb-24 pt-10 sm:pt-14">
      <GridBackdrop className="mask-radial opacity-40" />

      <Container>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 rounded text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to projects
        </Link>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <header className="mt-6 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={DIFFICULTY_BADGE[project.difficulty]}>
              {DIFFICULTY_LABEL[project.difficulty]}
            </Badge>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock3 className="size-3.5 text-subtle-foreground" aria-hidden />
              {project.estimatedDuration}
            </span>
            <span className="text-sm text-subtle-foreground">
              {TYPE_LABEL[project.type]}
            </span>
            {isComplete ? (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/[0.08] px-2 py-0.5 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="size-3.5" aria-hidden />
                Completed
              </span>
            ) : null}
          </div>

          <h1 className="balance mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {project.title}
          </h1>
          <p className="pretty mt-3 text-base leading-relaxed text-muted-foreground">
            {project.description}
          </p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {project.technologies.map((technology) => (
              <li
                key={technology.id}
                className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground"
              >
                {technology.name}
              </li>
            ))}
          </ul>

          {/* ── Call to action ─────────────────────────────────── */}
          <div className="mt-8">
            {started ? (
              <div className="flex flex-wrap items-center gap-4">
                <Button asChild>
                  <Link href={`/projects/${project.slug}/workspace`}>
                    {isComplete ? "View your work" : "Continue building"}
                  </Link>
                </Button>
                {!isComplete && project.milestones.length > 0 ? (
                  <span className="font-mono text-sm text-subtle-foreground">
                    {completedMilestones}/{project.milestones.length} milestones ·{" "}
                    {percent}%
                  </span>
                ) : null}
              </div>
            ) : ready ? (
              <StartProjectButton projectId={project.id} slug={project.slug} />
            ) : (
              <div className="rounded-xl border border-border bg-surface/50 p-5">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Lock
                    className="size-4 shrink-0 text-subtle-foreground"
                    aria-hidden
                  />
                  Not ready yet
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  This project builds on {missing.length}{" "}
                  {missing.length === 1 ? "topic you haven't" : "topics you haven't"}{" "}
                  finished. You can read everything here, and start it whenever you like
                  — but it will make much more sense afterwards.
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {missing.map((entry) => (
                    <li key={entry.topic.id}>
                      <Link
                        href={`/learn/${entry.topic.slug}`}
                        className="inline-block rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {entry.topic.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                {/* Offered, never forced. Blocking would be paternalistic. */}
                <div className="mt-4">
                  <StartProjectButton
                    projectId={project.id}
                    slug={project.slug}
                    label="Start it anyway"
                  />
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ── Sections ─────────────────────────────────────────── */}
        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <div className="flex min-w-0 flex-col gap-12">
            <section aria-labelledby="why-heading" className="max-w-[68ch]">
              <h2
                id="why-heading"
                className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
              >
                Why build this?
              </h2>
              <p className="pretty mt-3 text-base leading-relaxed text-muted-foreground">
                {project.whyBuildThis}
              </p>
            </section>

            <section aria-labelledby="what-heading" className="max-w-[68ch]">
              <h2
                id="what-heading"
                className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
              >
                What you will build
              </h2>
              <p className="pretty mt-3 text-base leading-relaxed text-muted-foreground">
                {project.whatYouBuild}
              </p>
            </section>

            <section aria-labelledby="requirements-heading" className="max-w-[68ch]">
              <h2
                id="requirements-heading"
                className="mb-4 text-lg font-medium tracking-tight text-foreground"
              >
                Requirements
              </h2>
              <RequirementList requirements={project.requirements} />
            </section>

            <section aria-labelledby="milestones-heading" className="max-w-[68ch]">
              <h2
                id="milestones-heading"
                className="text-lg font-medium tracking-tight text-foreground"
              >
                Milestones
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                A suggested order. You tick these off yourself in the workspace —
                nothing here marks itself done.
              </p>

              <ol className="mt-5 flex flex-col gap-2">
                {project.milestones.map((milestone, index) => (
                  <li
                    key={milestone.id}
                    className="rounded-lg border border-border bg-surface/50 p-4"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-2.5">
                      <span className="font-mono text-xs text-subtle-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {milestone.title}
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-subtle-foreground">
                        <Clock3 className="size-3.5" aria-hidden />
                        {milestone.estimatedTime}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {milestone.description}
                    </p>
                    {milestone.concepts.length > 0 ? (
                      <p className="mt-2 text-xs text-subtle-foreground">
                        {milestone.concepts.join(" · ")}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* ── Sidebar ────────────────────────────────────────── */}
          <aside className="flex flex-col gap-10 lg:sticky lg:top-24 lg:self-start">
            <section aria-labelledby="practice-heading">
              <h2
                id="practice-heading"
                className="mb-4 text-lg font-medium tracking-tight text-foreground"
              >
                What you will practise
              </h2>
              <ConceptList
                concepts={project.concepts}
                completedTopicIds={completedTopicIds}
              />
            </section>

            {project.resources.length > 0 ? (
              <section aria-labelledby="resources-heading">
                <h2
                  id="resources-heading"
                  className="mb-4 text-lg font-medium tracking-tight text-foreground"
                >
                  Resources
                </h2>
                <ResourceList resources={project.resources} />
              </section>
            ) : null}
          </aside>
        </div>
      </Container>
    </div>
  );
}
