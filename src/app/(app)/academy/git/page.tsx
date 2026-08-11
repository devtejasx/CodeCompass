import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GitBranch,
  Github,
  Terminal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { AcademyTabs } from "@/components/git/academy-tabs";
import { requireOnboardedUser } from "@/lib/session";
import { getGitAcademy, listExercises } from "@/lib/git/queries";
import { getConnectionView } from "@/lib/github/connection";
import { githubAvailability } from "@/lib/github/config";

export const metadata: Metadata = {
  title: "Git & GitHub",
  description: "How professional developers actually manage code.",
  robots: { index: false, follow: false },
};

/**
 * The Git & GitHub Academy.
 *
 * A server component that loads the curriculum and hands the interactive parts
 * — simulator, exercises, reference, walkthroughs — to one client island. The
 * curriculum itself, which is most of the page, never becomes JavaScript.
 */
export default async function GitAcademyPage() {
  const user = await requireOnboardedUser();

  const [academy, exercises, connection] = await Promise.all([
    getGitAcademy(user.id),
    listExercises(user.id),
    getConnectionView(user.id),
  ]);

  const availability = githubAvailability();

  if (!academy) {
    return (
      <div className="flex flex-1 items-center py-24">
        <Container>
          <p className="text-center text-sm text-muted-foreground">
            The Git &amp; GitHub curriculum hasn&apos;t been seeded on this deployment
            yet.
          </p>
        </Container>
      </div>
    );
  }

  const nextModule = academy.modules.find((module) => !module.isComplete);
  const nextTopic = nextModule?.topics.find((topic) => topic.status !== "COMPLETED");

  return (
    <div className="relative flex-1 overflow-hidden pb-24 pt-10 sm:pt-14">
      <GridBackdrop className="mask-fade-b opacity-50" />
      <Glow className="-top-40 left-1/2 size-[30rem] -translate-x-1/2" />

      <Container>
        {/* ── Header ───────────────────────────────────────────── */}
        <header className="max-w-3xl">
          <span
            aria-hidden
            className="grid size-12 place-items-center rounded-xl border border-border bg-surface text-indigo-400"
          >
            <GitBranch className="size-5" />
          </span>

          <h1 className="balance mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Git &amp; GitHub
          </h1>
          <p className="pretty mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {academy.description}
          </p>

          <dl className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <div className="flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-subtle-foreground" aria-hidden />
              <dt className="sr-only">Modules</dt>
              <dd className="text-muted-foreground">
                {academy.totalModules} modules · {exercises.length} exercises
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock3 className="size-3.5 text-subtle-foreground" aria-hidden />
              <dt className="sr-only">Estimated time</dt>
              <dd className="text-muted-foreground">{academy.estimatedDuration}</dd>
            </div>
          </dl>
        </header>

        {/* ── Git is not GitHub ────────────────────────────────── */}
        <section
          aria-labelledby="distinction-heading"
          className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-2"
        >
          <h2 id="distinction-heading" className="sr-only">
            The difference between Git and GitHub
          </h2>

          <div className="surface rounded-xl p-5">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Terminal className="size-4 text-indigo-400" aria-hidden />
              Git
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A version control system. It runs on your machine, works with no internet
              connection, and belongs to no company.
            </p>
          </div>

          <div className="surface rounded-xl p-5">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Github className="size-4 text-indigo-400" aria-hidden />
              GitHub
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A company that hosts Git repositories and adds collaboration around them —
              pull requests, reviews, issues. You can use Git without it.
            </p>
          </div>
        </section>

        {/* ── Progress ─────────────────────────────────────────── */}
        <section aria-labelledby="progress-heading" className="mt-8 max-w-3xl">
          <h2 id="progress-heading" className="sr-only">
            Your progress
          </h2>

          <div className="surface rounded-xl p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">
                {academy.completedModules} of {academy.totalModules} modules complete
              </span>
              <span className="font-mono text-sm text-foreground">
                {academy.percentComplete}%
              </span>
            </div>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-raised"
              role="progressbar"
              aria-valuenow={academy.percentComplete}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Git and GitHub progress"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${academy.percentComplete}%` }}
              />
            </div>

            {nextTopic ? (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button size="sm" asChild>
                  <Link href={`/learn/${nextTopic.slug}`}>
                    {academy.completedModules === 0 ? "Start learning" : "Continue"}
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
                <span className="text-sm text-subtle-foreground">
                  Next: {nextTopic.title}
                </span>
              </div>
            ) : (
              <p className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 className="size-4" aria-hidden />
                Every module complete.
              </p>
            )}
          </div>
        </section>

        {/* ── Modules, simulator, exercises, reference ─────────── */}
        <div className="mt-12">
          <AcademyTabs
            modules={academy.modules}
            exercises={exercises}
            github={{
              configured: availability.configured,
              state: connection.state,
              username: connection.account?.username ?? null,
            }}
          />
        </div>
      </Container>
    </div>
  );
}
