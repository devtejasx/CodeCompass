import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock3,
  Download,
  ExternalLink,
  Github,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { CapabilityCard } from "@/components/profile/capability-card";
import { requireOnboardedUser } from "@/lib/session";
import { getTechieProfile } from "@/lib/profile/service";
import { CATEGORY_LABEL } from "@/lib/profile/icons";
import { careerIcon } from "@/lib/careers/icons";
import { DIFFICULTY_BADGE } from "@/lib/projects/progress";
import { EXPERIENCE_LABEL } from "@/lib/onboarding/options";
import type { ProjectDifficulty } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Techie Profile",
  robots: { index: false, follow: false },
};

/**
 * The Techie Profile.
 *
 * Answers "what can I actually do?" with evidence rather than a completion
 * percentage. Every capability level, strength and improvement on this page is
 * computed from work the learner genuinely did, and the counts that produced it
 * are shown next to it — a claim CodeCompass cannot support is not made.
 *
 * A server component. All the aggregation happens here in bulk reads; nothing
 * about the capability model reaches the browser.
 */
export default async function ProfilePage() {
  const user = await requireOnboardedUser();
  const profile = await getTechieProfile(user.id);

  // The career's name and icon both arrive with the learner state, so there is
  // no second lookup for them.
  const career = profile.state.career;
  const CareerIcon = career ? careerIcon(career.icon) : null;

  const joined = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(profile.joinedAt);

  const earned = profile.capabilities.filter((entry) => entry.level !== null);

  return (
    <div className="relative flex-1 overflow-hidden pb-24 pt-10 sm:pt-14">
      <GridBackdrop className="mask-fade-b opacity-40" />
      <Glow className="-top-40 left-1/2 size-[30rem] -translate-x-1/2" />

      <Container>
        {/* ── Header ───────────────────────────────────────────── */}
        <header className="max-w-3xl">
          <h1 className="balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {profile.displayName}
          </h1>

          <dl className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            {career && CareerIcon ? (
              <div className="flex items-center gap-1.5">
                <CareerIcon className="size-4 text-indigo-400" aria-hidden />
                <dt className="sr-only">Career</dt>
                <dd className="text-muted-foreground">{career.name}</dd>
              </div>
            ) : null}

            {profile.state.experienceLevel ? (
              <div className="flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-subtle-foreground" aria-hidden />
                <dt className="sr-only">Experience when joining</dt>
                <dd className="text-muted-foreground">
                  {EXPERIENCE_LABEL[profile.state.experienceLevel]}
                </dd>
              </div>
            ) : null}

            <div className="flex items-center gap-1.5">
              <Clock3 className="size-3.5 text-subtle-foreground" aria-hidden />
              <dt className="sr-only">Learning since</dt>
              <dd className="text-muted-foreground">Learning since {joined}</dd>
            </div>
          </dl>

          <p className="pretty mt-5 text-base leading-relaxed text-muted-foreground">
            {profile.summary}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href="/profile/settings">
                <Settings aria-hidden />
                Profile settings
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              {/* A plain link, not a fetch: the browser saves the file. */}
              <a href="/api/profile/export" download>
                <Download aria-hidden />
                Export record
              </a>
            </Button>
            {profile.isPublic && profile.username ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/u/${profile.username}`}>
                  <ExternalLink aria-hidden />
                  View public profile
                </Link>
              </Button>
            ) : null}
          </div>
        </header>

        {/* ── Overall picture ──────────────────────────────────── */}
        <section aria-labelledby="overview-heading" className="mt-12">
          <h2
            id="overview-heading"
            className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
          >
            Learning progress
          </h2>
          {/* Named "learning progress" deliberately — never job readiness. */}
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-subtle-foreground">
            How far through each part of CodeCompass you are. This measures the work you
            have done here, not your employability.
          </p>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Capabilities"
              value={`${earned.length}`}
              detail={`of ${profile.capabilities.length}`}
            />
            <Stat
              label="Projects"
              value={`${profile.projects.filter((p) => p.status === "COMPLETED").length}`}
              detail="completed"
            />
            <Stat
              label="Practice"
              value={`${profile.practice.solved}`}
              detail={`of ${profile.practice.total} solved`}
            />
            <Stat
              label="Profile setup"
              value={`${profile.completion.done}/${profile.completion.total}`}
              detail="steps done"
            />
          </dl>
        </section>

        {/* ── Strengths ────────────────────────────────────────── */}
        {profile.strengths.length > 0 ? (
          <section aria-labelledby="strengths-heading" className="mt-12">
            <h2
              id="strengths-heading"
              className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
            >
              Your strengths
            </h2>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-subtle-foreground">
              Capabilities you have actually built something with — not just read about.
            </p>

            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {profile.strengths.map((strength) => (
                <li key={strength.slug}>
                  <Link
                    href={`/profile/skills/${strength.slug}`}
                    className="surface-interactive group block rounded-xl p-5"
                  >
                    <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <CheckCircle2 className="size-4 text-emerald-400" aria-hidden />
                      {strength.name}
                    </p>
                    <p className="pretty mt-2 text-sm leading-relaxed text-muted-foreground">
                      {strength.evidence}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ── Areas to improve ─────────────────────────────────── */}
        {profile.improvements.length > 0 ? (
          <section aria-labelledby="improve-heading" className="mt-10">
            <h2
              id="improve-heading"
              className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
            >
              Where a little more work goes furthest
            </h2>

            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {profile.improvements.map((improvement) => (
                <li key={improvement.slug}>
                  <Link
                    href={improvement.href}
                    className="surface-interactive group block rounded-xl p-5"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {improvement.name}
                    </p>
                    <p className="pretty mt-2 text-sm leading-relaxed text-muted-foreground">
                      {improvement.reason}
                    </p>
                    <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-indigo-300">
                      <ArrowRight className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                      {improvement.next}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ── Skills ───────────────────────────────────────────── */}
        <section aria-labelledby="skills-heading" className="mt-12">
          <h2
            id="skills-heading"
            className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
          >
            My skills
          </h2>

          {profile.categories.length === 0 ? (
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
              Nothing here yet — capabilities appear once you have completed topics,
              solved problems or finished projects. Everything on this page is evidence,
              so it fills in as you do the work rather than being set up in advance.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-8">
              {profile.categories.map((group) => (
                <div key={group.category}>
                  <h3 className="text-sm font-medium text-foreground">
                    {CATEGORY_LABEL[group.category]}
                  </h3>
                  <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {group.capabilities
                      .filter((capability) => capability.level !== null)
                      .map((capability) => (
                        <li key={capability.slug} className="flex">
                          <CapabilityCard capability={capability} className="w-full" />
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Projects ─────────────────────────────────────────── */}
        {profile.projects.length > 0 ? (
          <section aria-labelledby="projects-heading" className="mt-12">
            <h2
              id="projects-heading"
              className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
            >
              Projects I&apos;ve built
            </h2>

            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {profile.projects.map((project) => (
                <li key={project.slug}>
                  <div className="surface rounded-xl p-5">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="text-sm font-medium text-foreground transition-colors hover:text-indigo-300"
                      >
                        {project.title}
                      </Link>
                      <span
                        className={
                          project.status === "COMPLETED"
                            ? "shrink-0 text-xs text-emerald-400"
                            : "shrink-0 text-xs text-subtle-foreground"
                        }
                      >
                        {project.status === "COMPLETED" ? "Completed" : "In progress"}
                      </span>
                    </div>

                    <p className="pretty mt-2 text-sm leading-relaxed text-muted-foreground">
                      {project.shortDescription}
                    </p>

                    {/* Counts, never an opinion about quality. */}
                    <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs">
                      <div className="flex gap-1.5">
                        <dt className="text-subtle-foreground">Milestones</dt>
                        <dd className="font-mono text-muted-foreground">
                          {project.milestonesCompleted}/{project.milestonesTotal}
                        </dd>
                      </div>
                      <div className="flex gap-1.5">
                        <dt className="text-subtle-foreground">Requirements</dt>
                        <dd className="font-mono text-muted-foreground">
                          {project.requirementsConfirmed}/{project.requirementsTotal}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <Badge
                        variant={
                          DIFFICULTY_BADGE[project.difficulty as ProjectDifficulty]
                        }
                      >
                        {project.difficulty.toLowerCase()}
                      </Badge>
                      {project.technologies.length > 0 ? (
                        <span className="text-xs text-subtle-foreground">
                          {project.technologies.slice(0, 4).join(" · ")}
                        </span>
                      ) : null}
                    </div>

                    {project.githubRepoFullName || project.deployedUrl ? (
                      <p className="mt-3 flex flex-wrap gap-x-4 text-xs text-subtle-foreground">
                        {project.githubRepoFullName ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Github className="size-3" aria-hidden />
                            Repository connected
                          </span>
                        ) : null}
                        {project.deployedUrl ? (
                          <span className="inline-flex items-center gap-1.5">
                            <ExternalLink className="size-3" aria-hidden />
                            Demo provided
                          </span>
                        ) : null}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ── Practice ─────────────────────────────────────────── */}
        <section aria-labelledby="practice-heading" className="mt-12">
          <h2
            id="practice-heading"
            className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
          >
            Coding practice
          </h2>

          <div className="surface mt-4 rounded-xl p-5">
            <dl className="flex flex-wrap gap-x-10 gap-y-3">
              <div>
                <dt className="text-xs text-subtle-foreground">Solved</dt>
                <dd className="mt-0.5 font-mono text-2xl font-medium text-foreground">
                  {profile.practice.solved}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-subtle-foreground">Attempted</dt>
                <dd className="mt-0.5 font-mono text-2xl font-medium text-foreground">
                  {profile.practice.attempted}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-subtle-foreground">By difficulty</dt>
                <dd className="mt-0.5 font-mono text-sm text-muted-foreground">
                  {profile.practice.byDifficulty.EASY} easy ·{" "}
                  {profile.practice.byDifficulty.MEDIUM} medium ·{" "}
                  {profile.practice.byDifficulty.HARD} hard
                </dd>
              </div>
              {profile.practice.languages.length > 0 ? (
                <div>
                  <dt className="text-xs text-subtle-foreground">Languages</dt>
                  <dd className="mt-0.5 text-sm text-muted-foreground">
                    {profile.practice.languages.join(", ").toLowerCase()}
                  </dd>
                </div>
              ) : null}
            </dl>

            {/* Observations only where there is enough data to support them. */}
            {profile.practice.insights.length > 0 ? (
              <ul className="mt-5 flex flex-col gap-1.5 border-t border-border pt-4">
                {profile.practice.insights.map((insight) => (
                  <li
                    key={insight}
                    className="text-sm leading-relaxed text-muted-foreground"
                  >
                    {insight}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 border-t border-border pt-4 text-sm text-subtle-foreground">
                Not enough practice data yet to say anything useful about patterns.
              </p>
            )}
          </div>
        </section>

        {/* ── Milestones ───────────────────────────────────────── */}
        <section aria-labelledby="milestones-heading" className="mt-12">
          <h2
            id="milestones-heading"
            className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
          >
            Milestones
          </h2>

          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {profile.milestones.map((milestone) => (
              <li
                key={milestone.key}
                className="flex items-start gap-2.5 rounded-lg border border-border bg-surface/40 p-4"
              >
                {milestone.achievedAt ? (
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-emerald-400"
                    aria-hidden
                  />
                ) : (
                  <Circle
                    className="mt-0.5 size-4 shrink-0 text-subtle-foreground"
                    aria-hidden
                  />
                )}
                <div className="min-w-0">
                  <p
                    className={
                      milestone.achievedAt
                        ? "text-sm text-foreground"
                        : "text-sm text-subtle-foreground"
                    }
                  >
                    {milestone.title}
                  </p>
                  <p className="mt-0.5 text-xs text-subtle-foreground">
                    {milestone.achievedAt
                      ? new Intl.DateTimeFormat("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }).format(milestone.achievedAt)
                      : "Not yet"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Timeline ─────────────────────────────────────────── */}
        {profile.timeline.length > 1 ? (
          <section aria-labelledby="timeline-heading" className="mt-12 max-w-2xl">
            <h2
              id="timeline-heading"
              className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
            >
              Your journey
            </h2>

            <ol className="mt-4 border-l border-border pl-5">
              {profile.timeline.map((entry, index) => (
                <li key={`${entry.type}-${index}`} className="relative pb-5 last:pb-0">
                  <span
                    aria-hidden
                    className="absolute -left-[1.4rem] top-1.5 size-2 rounded-full bg-primary"
                  />
                  <p className="text-sm text-foreground">{entry.label}</p>
                  <p className="mt-0.5 text-xs text-subtle-foreground">
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(entry.at)}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {/* ── Profile completion ───────────────────────────────── */}
        <section aria-labelledby="completion-heading" className="mt-12 max-w-2xl">
          <h2
            id="completion-heading"
            className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
          >
            Getting set up
          </h2>

          <ul className="mt-4 flex flex-col gap-1.5">
            {profile.completion.items.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-surface"
                >
                  {item.done ? (
                    <CheckCircle2
                      className="size-4 shrink-0 text-emerald-400"
                      aria-hidden
                    />
                  ) : (
                    <Circle
                      className="size-4 shrink-0 text-subtle-foreground"
                      aria-hidden
                    />
                  )}
                  <span
                    className={item.done ? "text-muted-foreground" : "text-foreground"}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Next step, from the Phase 10 engine ──────────────── */}
        {profile.nextAction ? (
          <section
            aria-labelledby="next-heading"
            className="mt-12 max-w-2xl rounded-xl border border-primary/25 bg-primary/[0.04] p-6"
          >
            <h2
              id="next-heading"
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-label text-indigo-300"
            >
              <Sparkles className="size-3.5" aria-hidden />
              Your next step
            </h2>
            <p className="mt-3 text-base font-medium text-foreground">
              {profile.nextAction.title}
            </p>
            <p className="pretty mt-2 text-sm leading-relaxed text-muted-foreground">
              {profile.nextAction.reason}
            </p>
            <div className="mt-5">
              <Button asChild>
                <Link href={profile.nextAction.href}>
                  {profile.nextAction.action}
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </div>
          </section>
        ) : null}
      </Container>
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="surface rounded-xl p-4">
      <dt className="text-xs text-subtle-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-2xl font-medium text-foreground">
        {value}
        <span className="ml-1.5 font-sans text-xs font-normal text-subtle-foreground">
          {detail}
        </span>
      </dd>
    </div>
  );
}
