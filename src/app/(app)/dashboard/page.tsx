import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, Code2, Compass, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/session";
import { careerIcon } from "@/lib/careers/icons";
import { getActiveRoadmapForCareer } from "@/lib/roadmap/queries";
import { summariseProgress } from "@/lib/roadmap/progress";
import { completedPhaseOrders, roadmapPercent } from "@/lib/learn/progress";
import { getCompletedTopicIds, getResumeTopic } from "@/lib/learn/queries";
import { getPracticeSummary, getRecommendedProblems } from "@/lib/practice/queries";
import { getProjectRecommendations, getProjectSummary } from "@/lib/projects/queries";
import { getGitProgressSummary } from "@/lib/git/queries";
import { getConnectionView } from "@/lib/github/connection";
import { githubAvailability } from "@/lib/github/config";
import {
  CAREER_LABEL,
  EXPERIENCE_LABEL,
  LANGUAGE_LABEL,
  TIME_LABEL,
} from "@/lib/onboarding/options";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

/**
 * Phase 2 placeholder. Its only job is to prove that authentication and
 * onboarding actually worked and that the answers came back out of Postgres.
 * The real dashboard is a later phase.
 */
export default async function DashboardPage() {
  const user = await requireOnboardedUser();

  const profile = await db.profile.findUnique({
    where: { userId: user.id },
    select: {
      experienceLevel: true,
      selectedCareer: true,
      dailyLearningTime: true,
      selectedLanguage: true,
      chosenCareer: {
        select: {
          id: true,
          slug: true,
          name: true,
          shortDescription: true,
          icon: true,
        },
      },
    },
  });

  const chosenCareer = profile?.chosenCareer ?? null;
  const ChosenIcon = chosenCareer ? careerIcon(chosenCareer.icon) : null;

  // Only the shape needed for the summary — not the whole roadmap tree.
  const roadmap = chosenCareer
    ? await getActiveRoadmapForCareer(chosenCareer.id)
    : null;

  // Real learning progress, computed with the same helpers the roadmap page
  // uses, so the two views can never report different numbers.
  const completedTopicIds = roadmap
    ? await getCompletedTopicIds(user.id, roadmap.id)
    : [];
  const resume = roadmap ? await getResumeTopic(user.id, roadmap.id) : null;

  const progress = roadmap
    ? {
        ...summariseProgress(
          roadmap,
          completedPhaseOrders(roadmap.phases, completedTopicIds),
        ),
        percentComplete: roadmapPercent({
          requiredTopicIds: roadmap.phases
            .flatMap((phase) => phase.topics)
            .filter((topic) => topic.isRequired)
            .map((topic) => topic.id),
          completedTopicIds,
        }),
        topicsCompleted: completedTopicIds.length,
      }
    : null;

  // Practice, kept to two numbers and one next action. The dashboard is a
  // starting point, not a statistics page.
  const [practice, recommended, projects, projectRecommendations, git, github] =
    await Promise.all([
      getPracticeSummary(user.id),
      getRecommendedProblems(user.id, 1),
      getProjectSummary(user.id),
      getProjectRecommendations(user.id, 1),
      getGitProgressSummary(user.id),
      getConnectionView(user.id),
    ]);

  const githubConfigured = githubAvailability().configured;
  const projectsWithGitHub = await db.userProject.count({
    where: { userId: user.id, githubRepoFullName: { not: null } },
  });

  const nextPractice =
    practice.inFlight?.problem ?? recommended.recommendations[0]?.problem ?? null;

  const nextProject = projectRecommendations.recommendations[0]?.project ?? null;

  const summary = [
    {
      label: "Experience",
      value: profile?.experienceLevel ? EXPERIENCE_LABEL[profile.experienceLevel] : "—",
      icon: Compass,
    },
    {
      label: "Career interest",
      value: profile?.selectedCareer ? CAREER_LABEL[profile.selectedCareer] : "—",
      icon: Sparkles,
    },
    {
      label: "Learning time",
      value: profile?.dailyLearningTime ? TIME_LABEL[profile.dailyLearningTime] : "—",
      icon: Clock3,
    },
    {
      label: "Language",
      value: profile?.selectedLanguage ? LANGUAGE_LABEL[profile.selectedLanguage] : "—",
      icon: Code2,
    },
  ];

  const firstName = user.name.split(/\s+/)[0] || user.name;

  return (
    <div className="relative flex-1 overflow-hidden py-14 sm:py-20">
      <GridBackdrop className="mask-fade-b opacity-60" />
      <Glow className="-top-40 left-1/2 size-[30rem] -translate-x-1/2" />

      <Container>
        <div className="mx-auto max-w-3xl">
          <h1 className="balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Welcome to CodeCompass, {firstName}.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Your journey starts here.
          </p>

          <h2 className="mt-12 text-xs font-medium uppercase tracking-label text-subtle-foreground">
            What you told us
          </h2>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
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
                  <dd className="mt-0.5 text-sm font-medium text-foreground">
                    {item.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          {chosenCareer && ChosenIcon ? (
            <div className="surface mt-8 rounded-xl p-6">
              <h2 className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
                Your path
              </h2>

              <div className="mt-4 flex items-start gap-3">
                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-surface text-indigo-400"
                >
                  <ChosenIcon className="size-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-medium text-foreground">
                    {chosenCareer.name}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {chosenCareer.shortDescription}
                  </p>
                </div>
              </div>

              {progress ? (
                <>
                  <div className="mt-6">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-muted-foreground">
                        Roadmap progress
                      </span>
                      <span className="font-mono text-sm text-foreground">
                        {progress.percentComplete}%
                      </span>
                    </div>
                    <div
                      className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-raised"
                      role="progressbar"
                      aria-valuenow={progress.percentComplete}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${chosenCareer.name} roadmap progress`}
                    >
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${progress.percentComplete}%` }}
                      />
                    </div>
                  </div>

                  <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                    {progress.currentPhaseTitle ? (
                      <div>
                        <dt className="text-xs text-subtle-foreground">
                          Current phase
                        </dt>
                        <dd className="mt-0.5 font-medium text-foreground">
                          {progress.currentPhaseTitle}
                        </dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className="text-xs text-subtle-foreground">
                        Topics completed
                      </dt>
                      <dd className="mt-0.5 font-medium text-foreground">
                        {progress.topicsCompleted}
                      </dd>
                    </div>
                    {resume ? (
                      <div>
                        <dt className="text-xs text-subtle-foreground">
                          Current topic
                        </dt>
                        <dd className="mt-0.5 font-medium text-foreground">
                          {resume.topic.title}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </>
              ) : (
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  We&apos;re still building the roadmap for this path. Your choice is
                  saved — check back soon.
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                {progress ? (
                  <Button asChild>
                    <Link href={resume ? `/learn/${resume.topic.slug}` : "/roadmap"}>
                      Continue Your Journey
                      <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                ) : null}
                <Button variant="secondary" asChild>
                  <Link href={`/careers/${chosenCareer.slug}`}>View this path</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/careers">Change Career</Link>
                </Button>
              </div>
            </div>
          ) : null}

          {/* ── Practice ───────────────────────────────────────── */}
          <div className="surface mt-4 rounded-xl p-6">
            <h2 className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
              Coding practice
            </h2>

            <p className="mt-4 font-mono text-2xl font-medium text-foreground">
              {practice.solved}
              <span className="ml-2 font-sans text-sm font-normal text-muted-foreground">
                {practice.solved === 1 ? "problem solved" : "problems solved"}
              </span>
            </p>

            {nextPractice ? (
              <>
                <p className="mt-4 text-sm text-muted-foreground">
                  {practice.inFlight ? "Current practice" : "Next up"}:{" "}
                  <span className="font-medium text-foreground">
                    {nextPractice.title}
                  </span>
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href={`/practice/${nextPractice.slug}`}>
                      {practice.inFlight ? "Continue Practice" : "Start Practice"}
                      <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/practice">All problems</Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="mt-5">
                <Button variant="secondary" asChild>
                  <Link href="/practice">
                    Browse practice problems
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* ── Projects ───────────────────────────────────────── */}
          <div className="surface mt-4 rounded-xl p-6">
            <h2 className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
              Projects
            </h2>

            <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-3">
              <div>
                <dt className="text-xs text-subtle-foreground">Completed</dt>
                <dd className="mt-0.5 font-mono text-2xl font-medium text-foreground">
                  {projects.completed}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-subtle-foreground">In progress</dt>
                <dd className="mt-0.5 font-mono text-2xl font-medium text-foreground">
                  {projects.inProgress}
                </dd>
              </div>
            </dl>

            {projects.current ? (
              <>
                <div className="mt-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">
                      Current project ·{" "}
                      <span className="font-medium text-foreground">
                        {projects.current.title}
                      </span>
                    </span>
                    <span className="font-mono text-sm text-foreground">
                      {projects.current.percentComplete}%
                    </span>
                  </div>
                  <div
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-raised"
                    role="progressbar"
                    aria-valuenow={projects.current.percentComplete}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${projects.current.title} progress`}
                  >
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${projects.current.percentComplete}%` }}
                    />
                  </div>
                  <p className="mt-1.5 font-mono text-xs text-subtle-foreground">
                    {projects.current.completedMilestones}/
                    {projects.current.totalMilestones} milestones
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href={`/projects/${projects.current.slug}/workspace`}>
                      Continue Project
                      <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/projects">All projects</Link>
                  </Button>
                </div>
              </>
            ) : nextProject ? (
              <>
                <p className="mt-5 text-sm text-muted-foreground">
                  Ready to build:{" "}
                  <span className="font-medium text-foreground">
                    {nextProject.title}
                  </span>
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href={`/projects/${nextProject.slug}`}>
                      Start a project
                      <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/projects">All projects</Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="mt-5">
                <Button variant="secondary" asChild>
                  <Link href="/projects">
                    Browse projects
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* ── Git & GitHub ───────────────────────────────────── */}
          <div className="surface mt-4 rounded-xl p-6">
            <h2 className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
              Git &amp; GitHub
            </h2>

            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">
                  {git.completedModules} of {git.totalModules} modules ·{" "}
                  {git.exercisesCompleted}/{git.totalExercises} exercises
                </span>
                <span className="font-mono text-sm text-foreground">
                  {git.percentComplete}%
                </span>
              </div>
              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-raised"
                role="progressbar"
                aria-valuenow={git.percentComplete}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Git and GitHub progress"
              >
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${git.percentComplete}%` }}
                />
              </div>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              GitHub:{" "}
              <span className="font-medium text-foreground">
                {!githubConfigured
                  ? "not configured on this deployment"
                  : github.state === "CONNECTED"
                    ? `connected as ${github.account?.username}`
                    : github.state === "AUTHORIZATION_EXPIRED"
                      ? "needs reconnecting"
                      : "not connected"}
              </span>
              {github.state === "CONNECTED" && projectsWithGitHub > 0 ? (
                <>
                  {" · "}
                  {projectsWithGitHub}{" "}
                  {projectsWithGitHub === 1 ? "project" : "projects"} linked
                </>
              ) : null}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/academy/git">
                  {git.completedModules === 0 ? "Start Git & GitHub" : "Continue"}
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              {githubConfigured ? (
                <Button variant="ghost" asChild>
                  <Link href="/github">
                    {github.state === "CONNECTED" ? "Manage GitHub" : "Connect GitHub"}
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>

          {!chosenCareer || !ChosenIcon ? (
            <div className="surface mt-4 rounded-xl p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                You haven&apos;t chosen a path yet — and there&apos;s no rush. Explore
                what different careers actually involve, compare a couple, and pick one
                when it feels right.
              </p>

              <div className="mt-5">
                <Button asChild>
                  <Link href="/careers">
                    Explore your path
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
