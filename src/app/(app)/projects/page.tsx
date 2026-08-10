import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Hammer, Lock, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { GridBackdrop } from "@/components/shared/backdrops";
import { ProjectBrowser } from "@/components/projects/project-browser";
import { ProjectCard } from "@/components/projects/project-card";
import { requireOnboardedUser } from "@/lib/session";
import { DIFFICULTY_BADGE, DIFFICULTY_LABEL } from "@/lib/projects/progress";
import { getProjectRecommendations, listProjects } from "@/lib/projects/queries";

export const metadata: Metadata = {
  title: "Projects",
  description: "Build what you learn.",
  robots: { index: false, follow: false },
};

/**
 * The project explorer.
 *
 * Recommended comes first because it answers the question the page exists for:
 * what should I build next? When nothing is ready, "coming up" says what stands
 * in the way instead — which is information, where a row of projects the
 * learner cannot start would just be noise.
 */
export default async function ProjectsPage() {
  const user = await requireOnboardedUser();

  const [projects, { recommendations, upcoming }] = await Promise.all([
    listProjects(user.id),
    getProjectRecommendations(user.id),
  ]);

  const completed = projects.filter((project) => project.status === "COMPLETED");
  const inProgress = projects.filter((project) => project.status === "IN_PROGRESS");

  const summary = [
    { label: "Projects completed", value: completed.length, icon: CheckCircle2 },
    { label: "In progress", value: inProgress.length, icon: Hammer },
    { label: "Available to build", value: projects.length, icon: Sparkles },
  ];

  return (
    <div className="relative flex-1 overflow-hidden py-12 sm:py-16">
      <GridBackdrop className="mask-fade-b opacity-50" />

      <Container>
        <header>
          <h1 className="balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Projects
          </h1>
          <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-muted-foreground">
            Build what you learn.
          </p>
        </header>

        {/* ── Progress ─────────────────────────────────────────── */}
        <dl className="mt-10 grid gap-3 sm:grid-cols-3">
          {summary.map((item) => (
            <div
              key={item.label}
              className="surface flex items-start gap-3 rounded-xl p-4"
            >
              <span
                aria-hidden
                className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-surface text-muted-foreground"
              >
                <item.icon className="size-4" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs text-subtle-foreground">{item.label}</dt>
                <dd className="mt-0.5 font-mono text-lg font-medium text-foreground">
                  {item.value}
                </dd>
              </div>
            </div>
          ))}
        </dl>

        {/* ── Recommended ──────────────────────────────────────── */}
        <section aria-labelledby="recommended-heading" className="mt-14">
          <h2
            id="recommended-heading"
            className="text-lg font-medium tracking-tight text-foreground"
          >
            Recommended for you
          </h2>

          {recommendations.length > 0 ? (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {recommendations.map(({ project, reason }) => (
                <li key={project.slug} className="flex">
                  <ProjectCard
                    className="w-full"
                    project={project}
                    reason={
                      reason === "CONTINUE"
                        ? "You've already started this"
                        : "You've learned everything this needs"
                    }
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="surface mt-5 rounded-xl p-6 text-sm leading-relaxed text-muted-foreground">
              Nothing is ready to build yet — every project here needs a few topics
              finished first. Keep going with your roadmap and the first one will appear
              below as soon as you unlock it.
            </p>
          )}
        </section>

        {/* ── Coming up ────────────────────────────────────────── */}
        {upcoming.length > 0 ? (
          <section aria-labelledby="upcoming-heading" className="mt-12">
            <h2
              id="upcoming-heading"
              className="text-lg font-medium tracking-tight text-foreground"
            >
              Coming up
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Not ready yet — here is exactly what stands between you and each one.
            </p>

            <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {upcoming.map(({ project, missingTopics }) => (
                <li key={project.slug} className="surface rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-medium text-foreground">
                      {project.title}
                    </h3>
                    <Lock
                      className="size-3.5 shrink-0 text-subtle-foreground"
                      aria-hidden
                    />
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <Badge variant={DIFFICULTY_BADGE[project.difficulty]}>
                      {DIFFICULTY_LABEL[project.difficulty]}
                    </Badge>
                    <span className="text-xs text-subtle-foreground">
                      {project.estimatedDuration}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-subtle-foreground">
                    Finish {missingTopics.length}{" "}
                    {missingTopics.length === 1 ? "topic" : "topics"} first:
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {missingTopics.slice(0, 4).map((topic) => (
                      <li key={topic.id}>
                        <Link
                          href={`/learn/${topic.slug}`}
                          className="inline-block rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {topic.title}
                        </Link>
                      </li>
                    ))}
                    {missingTopics.length > 4 ? (
                      <li className="px-1 py-0.5 text-xs text-subtle-foreground">
                        +{missingTopics.length - 4} more
                      </li>
                    ) : null}
                  </ul>
                </li>
              ))}
            </ul>

            <Button variant="secondary" size="sm" className="mt-5" asChild>
              <Link href="/roadmap">
                Back to your roadmap
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </section>
        ) : null}

        {/* ── Catalog ──────────────────────────────────────────── */}
        <section aria-labelledby="catalog-heading" className="mt-14">
          <h2
            id="catalog-heading"
            className="mb-5 text-lg font-medium tracking-tight text-foreground"
          >
            All projects
          </h2>
          <ProjectBrowser projects={projects} />
        </section>
      </Container>
    </div>
  );
}
