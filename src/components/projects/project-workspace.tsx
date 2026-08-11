"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HintList } from "@/components/projects/hint-list";
import { MilestoneList } from "@/components/projects/milestone-list";
import { SelfEvaluation } from "@/components/projects/self-evaluation";
import { SubmissionForm } from "@/components/projects/submission-form";
import { ProjectRepository } from "@/components/github/project-repository";
import {
  ConceptList,
  RequirementList,
  ResourceList,
} from "@/components/projects/project-sections";
import {
  DIFFICULTY_BADGE,
  DIFFICULTY_LABEL,
  milestonePercent,
  PROJECT_STATUS_LABEL,
} from "@/lib/projects/progress";
import { cn } from "@/lib/utils";
import type { ProjectDetail, UserProjectDetail } from "@/lib/projects/queries";
import type { GitHubConnectionState } from "@/lib/github/types";

/**
 * The project workspace.
 *
 * Deliberately not an IDE. The learner builds in their own editor, on their own
 * machine, with their own tools — which is what they will do for the rest of
 * their career. What this page provides is the things that are genuinely hard
 * to hold in your head: what done looks like, what to do next, and where you
 * had got to.
 *
 * Tabs on desktop keep the five concerns separate without hiding any of them;
 * on mobile the same panels stack, because a row of tabs at 375px is worse than
 * scrolling.
 */

type Panel = "milestones" | "requirements" | "hints" | "resources" | "submission";

const PANELS: { id: Panel; label: string }[] = [
  { id: "milestones", label: "Milestones" },
  { id: "requirements", label: "Requirements" },
  { id: "hints", label: "Hints" },
  { id: "resources", label: "Resources" },
  { id: "submission", label: "My submission" },
];

export function ProjectWorkspace({
  project,
  userProject,
  completedTopicIds,
  nextProject,
  github,
}: {
  project: ProjectDetail;
  userProject: UserProjectDetail;
  completedTopicIds: string[];
  nextProject: { slug: string; title: string } | null;
  /** GitHub connection state and any repository already linked (Phase 8). */
  github: {
    configured: boolean;
    state: GitHubConnectionState;
    suggestedName: string;
  };
}) {
  const [panel, setPanel] = React.useState<Panel>("milestones");

  const initialCompleted = userProject.milestones
    .filter((milestone) => milestone.status === "COMPLETED")
    .map((milestone) => milestone.milestoneId);

  const [progress, setProgress] = React.useState({
    completed: initialCompleted.length,
    total: project.milestones.length,
  });

  const percent = milestonePercent(progress);
  const isComplete = userProject.status === "COMPLETED";

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="surface rounded-xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={DIFFICULTY_BADGE[project.difficulty]}>
                {DIFFICULTY_LABEL[project.difficulty]}
              </Badge>
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5 text-xs font-medium",
                  isComplete
                    ? "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-400"
                    : "border-primary/25 bg-primary/[0.08] text-indigo-300",
                )}
              >
                {PROJECT_STATUS_LABEL[userProject.status]}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              {project.title}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {project.shortDescription}
            </p>
          </div>

          <Button variant="secondary" size="sm" asChild>
            <Link href={`/projects/${project.slug}`}>Project overview</Link>
          </Button>
        </div>

        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="font-mono text-sm text-foreground">
              {progress.completed}/{progress.total} · {percent}%
            </span>
          </div>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-raised"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${project.title} progress`}
          >
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-300",
                isComplete ? "bg-emerald-500" : "bg-primary",
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </header>

      {/* ── Completion ──────────────────────────────────────────── */}
      {isComplete ? (
        <CompletionPanel
          project={project}
          userProject={userProject}
          nextProject={nextProject}
        />
      ) : null}

      {/* ── Panels ──────────────────────────────────────────────── */}
      <div className="mt-6">
        <div
          role="tablist"
          aria-label="Workspace sections"
          className="flex flex-wrap gap-1 border-b border-border pb-2"
        >
          {PANELS.map((entry) => {
            const active = panel === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                id={`tab-${entry.id}`}
                aria-selected={active}
                aria-controls={`panel-${entry.id}`}
                onClick={() => setPanel(entry.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors duration-200",
                  active
                    ? "bg-surface-raised text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {entry.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <Section id="milestones" active={panel} title="Milestones">
            <MilestoneList
              projectId={project.id}
              milestones={project.milestones}
              initialCompletedIds={initialCompleted}
              onProgressChange={(completed, total) => setProgress({ completed, total })}
            />
          </Section>

          <Section id="requirements" active={panel} title="Requirements">
            <RequirementList requirements={project.requirements} />
            <div className="mt-8 border-t border-border pt-6">
              <ConceptList
                concepts={project.concepts}
                completedTopicIds={completedTopicIds}
              />
            </div>
          </Section>

          <Section id="hints" active={panel} title="Hints">
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Stuck? Take one hint at a time. They point at the next question worth
              asking rather than at the answer — the building stays yours.
            </p>
            <HintList hints={project.hints} />
          </Section>

          <Section id="resources" active={panel} title="Resources">
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Official documentation for what this project uses. Reference material to
              dip into, not a tutorial to follow.
            </p>
            <ResourceList resources={project.resources} />
          </Section>

          <Section id="submission" active={panel} title="My submission">
            <div className="max-w-[46rem]">
              <SubmissionForm
                projectId={project.id}
                initialRepositoryUrl={userProject.repositoryUrl}
                initialDeployedUrl={userProject.deployedUrl}
                initialNotes={userProject.notes}
              />

              {/*
                GitHub sits below the typed-in URL rather than replacing it.
                Phase 7 worked without GitHub and still does.
              */}
              <div className="mt-8 border-t border-border pt-8">
                <ProjectRepository
                  projectId={project.id}
                  projectTitle={project.title}
                  suggestedName={github.suggestedName}
                  connectionState={github.state}
                  configured={github.configured}
                  linked={
                    userProject.githubRepoFullName && userProject.githubRepoUrl
                      ? {
                          fullName: userProject.githubRepoFullName,
                          url: userProject.githubRepoUrl,
                          defaultBranch: userProject.githubDefaultBranch ?? "main",
                          isPrivate: userProject.githubRepoPrivate ?? true,
                        }
                      : null
                  }
                />
              </div>

              <div className="mt-10 border-t border-border pt-8">
                <h3 className="text-lg font-medium tracking-tight text-foreground">
                  Self-evaluation
                </h3>
                <div className="mt-3">
                  <SelfEvaluation
                    projectId={project.id}
                    requirements={project.requirements}
                    initialConfirmedIds={userProject.confirmations.map(
                      (confirmation) => confirmation.requirementId,
                    )}
                    repositoryUrl={userProject.repositoryUrl}
                    alreadyComplete={isComplete}
                  />
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

/** One tab panel. Hidden rather than unmounted, so state survives switching. */
function Section({
  id,
  active,
  title,
  children,
}: {
  id: Panel;
  active: Panel;
  title: string;
  children: React.ReactNode;
}) {
  const isActive = id === active;

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      hidden={!isActive}
      tabIndex={0}
    >
      <h2 className="sr-only">{title}</h2>
      {children}
    </div>
  );
}

/**
 * Shown once the learner marks a project done.
 *
 * No points, no badge, no confetti. What it does say is the one thing that is
 * actually true and actually matters: they built something real, and here is
 * what it involved.
 */
function CompletionPanel({
  project,
  userProject,
  nextProject,
}: {
  project: ProjectDetail;
  userProject: UserProjectDetail;
  nextProject: { slug: string; title: string } | null;
}) {
  const days =
    userProject.startedAt && userProject.completedAt
      ? Math.max(
          1,
          Math.round(
            (userProject.completedAt.getTime() - userProject.startedAt.getTime()) /
              86_400_000,
          ),
        )
      : null;

  const links = [
    { label: "Repository", url: userProject.repositoryUrl },
    { label: "Live demo", url: userProject.deployedUrl },
  ].filter((entry): entry is { label: string; url: string } => Boolean(entry.url));

  return (
    <section
      aria-labelledby="complete-heading"
      className="mt-6 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-6"
    >
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-label text-emerald-400">
        <CheckCircle2 className="size-4" aria-hidden />
        Project complete
      </p>

      <h2
        id="complete-heading"
        className="mt-3 text-xl font-semibold tracking-tight text-foreground"
      >
        You built something real.
      </h2>
      <p className="pretty mt-2 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
        {project.title} is finished. Not a tutorial you followed — a thing you decided
        the shape of, got stuck on, and made work.
      </p>

      <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm">
        <div>
          <dt className="text-xs text-subtle-foreground">Technologies</dt>
          <dd className="mt-0.5 text-foreground">
            {project.technologies.map((technology) => technology.name).join(" · ")}
          </dd>
        </div>
        {days ? (
          <div>
            <dt className="text-xs text-subtle-foreground">Time taken</dt>
            <dd className="mt-0.5 text-foreground">
              {days} {days === 1 ? "day" : "days"}
            </dd>
          </div>
        ) : null}
        {links.length > 0 ? (
          <div>
            <dt className="text-xs text-subtle-foreground">Links</dt>
            <dd className="mt-0.5 flex flex-wrap gap-3">
              {links.map((entry) => (
                <a
                  key={entry.label}
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1.5 rounded text-foreground underline-offset-4 hover:underline"
                >
                  {entry.label}
                  <ExternalLink className="size-3" aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ))}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-6 flex flex-wrap gap-2">
        {nextProject ? (
          <Button asChild>
            <Link href={`/projects/${nextProject.slug}`}>
              Next: {nextProject.title}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        ) : null}
        <Button variant="secondary" asChild>
          <Link href="/projects">All projects</Link>
        </Button>
      </div>
    </section>
  );
}
