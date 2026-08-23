import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  ExternalLink,
  GitCompare,
  Info,
  Route,
  ShieldAlert,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { StartToolButton } from "@/components/ai-tools/start-tool-button";
import { requireOnboardedUser } from "@/lib/session";
import { getToolDetail } from "@/lib/ai-tools/queries";
import { aiToolIcon } from "@/lib/ai-tools/icons";
import {
  ENVIRONMENT_LABEL,
  STATUS_DESCRIPTION,
  STATUS_LABEL,
  USE_CASE_LABEL,
  WORKFLOW_CATEGORY_LABEL,
  formatVerified,
} from "@/lib/ai-tools/labels";
import { DIFFICULTY_BADGE, DIFFICULTY_LABEL } from "@/lib/careers/labels";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "AI tool",
  robots: { index: false, follow: false },
};

/**
 * One AI tool, in full.
 *
 * A server component: this page is mostly prose, and none of it needs to be
 * JavaScript. The only client island is the start button, which writes progress
 * and navigates.
 *
 * The section order is the argument. "What is it" comes before "when to use it",
 * which comes before "when NOT to use it" — and that third section is placed
 * high, above capabilities, on purpose. A catalog that lists what a tool can do
 * before establishing when it is the wrong choice is a brochure.
 */
export default async function AIToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireOnboardedUser();
  const { slug } = await params;

  const tool = await getToolDetail(slug, user.id);
  if (!tool) notFound();

  const Icon = aiToolIcon(tool.iconIdentifier);
  const path = tool.learningPaths[0] ?? null;
  const deprecated = tool.status === "DEPRECATED";

  return (
    <div className="relative flex-1 overflow-hidden pb-24 pt-10 sm:pt-14">
      <GridBackdrop className="mask-fade-b opacity-50" />
      <Glow className="-top-40 left-1/2 size-[30rem] -translate-x-1/2" />

      <Container>
        <Link
          href="/academy/ai-tools"
          className="tap-target inline-flex items-center gap-1.5 rounded text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-3.5 rotate-180" aria-hidden />
          All AI tools
        </Link>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <header className="mt-6 max-w-3xl">
          <div className="flex items-start gap-4">
            <span
              aria-hidden
              className="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-surface text-indigo-400"
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <h1 className="balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {tool.name}
              </h1>
              <p className="mt-1 text-sm text-subtle-foreground">
                {tool.category.name}
              </p>
            </div>
          </div>

          <p className="pretty mt-5 text-base leading-relaxed text-muted-foreground">
            {tool.longDescription}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Badge variant={DIFFICULTY_BADGE[tool.difficulty]}>
              {DIFFICULTY_LABEL[tool.difficulty]}
            </Badge>

            {/* Status is a word, not a colour. */}
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-xs font-medium",
                tool.status === "ACTIVE"
                  ? "border-border bg-surface text-muted-foreground"
                  : deprecated
                    ? "border-amber-500/20 bg-amber-500/[0.08] text-amber-400"
                    : "border-cyan-500/20 bg-cyan-500/[0.08] text-cyan-300",
              )}
              title={STATUS_DESCRIPTION[tool.status]}
            >
              {STATUS_LABEL[tool.status]}
            </span>

            <span className="text-xs text-subtle-foreground">
              Best for: {tool.primaryUse}
            </span>
          </div>

          {tool.environments.length > 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Used{" "}
              {tool.environments
                .map((e) => ENVIRONMENT_LABEL[e].toLowerCase())
                .join(", ")}
              .
            </p>
          ) : null}

          {/* Official links only — never an invented or unofficial URL. */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <ExternalLinkRow href={tool.officialUrl} label="Official website" />
            {tool.docsUrl ? (
              <ExternalLinkRow href={tool.docsUrl} label="Documentation" />
            ) : null}
          </div>

          {/* Freshness, stated honestly rather than implied. */}
          <p className="mt-4 text-xs text-subtle-foreground">
            Checked against the official source on{" "}
            <span className="font-medium text-muted-foreground">
              {formatVerified(tool.lastVerifiedAt)}
            </span>
            . AI tools change quickly — treat this page as a starting point and the
            official documentation as authoritative.
          </p>
        </header>

        {/* ── Superseded banner ────────────────────────────────── */}
        {deprecated && tool.statusNote ? (
          <div className="mt-8 max-w-3xl rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
            <p className="flex items-start gap-2 text-sm font-medium text-amber-300">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              This is no longer the current product under this name
            </p>
            <p className="pretty mt-2 text-sm leading-relaxed text-muted-foreground">
              {tool.statusNote}
            </p>
            {tool.successor ? (
              <div className="mt-4">
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/academy/ai-tools/${tool.successor.slug}`}>
                    Go to {tool.successor.name}
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* ── Learning path progress + start ───────────────────── */}
        {path ? (
          <section aria-labelledby="path-heading" className="mt-8 max-w-3xl">
            <div className="surface rounded-xl p-5">
              <h2 id="path-heading" className="text-base font-medium text-foreground">
                {path.title}
              </h2>
              <p className="pretty mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {path.description}
              </p>

              <dl className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <Route className="size-3.5 text-subtle-foreground" aria-hidden />
                  <dt className="sr-only">Levels</dt>
                  <dd className="text-muted-foreground">
                    {path.totalLessons} {path.totalLessons === 1 ? "level" : "levels"}
                  </dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock3 className="size-3.5 text-subtle-foreground" aria-hidden />
                  <dt className="sr-only">Estimated time</dt>
                  <dd className="text-muted-foreground">{path.estimatedTime}</dd>
                </div>
              </dl>

              <div className="mt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">
                    {tool.progress.completedLessons} of {tool.progress.totalLessons}{" "}
                    complete
                  </span>
                  <span className="font-mono text-sm text-foreground">
                    {tool.progress.percentComplete}%
                  </span>
                </div>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-raised"
                  role="progressbar"
                  aria-valuenow={tool.progress.percentComplete}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${tool.name} learning path progress`}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300"
                    style={{ width: `${tool.progress.percentComplete}%` }}
                  />
                </div>
              </div>

              <div className="mt-5">
                {tool.nextLesson ? (
                  <StartToolButton
                    toolSlug={tool.slug}
                    nextLessonSlug={
                      tool.nextLesson.hasLesson ? tool.nextLesson.topicSlug : null
                    }
                    label={
                      tool.progress.completedLessons === 0
                        ? "Start learning"
                        : "Continue learning"
                    }
                  />
                ) : (
                  <p className="flex items-center gap-2 text-sm text-emerald-400">
                    <CheckCircle2 className="size-4" aria-hidden />
                    You have completed this learning path.
                  </p>
                )}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── Section 1: What is it? ───────────────────────────── */}
        <Section id="what-it-is" title="What is it?" className="mt-12">
          <p className="pretty max-w-prose text-sm leading-relaxed text-muted-foreground">
            {tool.whatItIs}
          </p>
        </Section>

        {/* ── Section 2: When should I use it? ─────────────────── */}
        <Section id="when-to-use" title="When should I use it?" className="mt-10">
          <ul className="flex max-w-prose flex-col gap-2">
            {tool.whenToUse.map((entry) => (
              <li
                key={entry}
                className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
              >
                <CheckCircle2
                  className="mt-0.5 size-3.5 shrink-0 text-emerald-400"
                  aria-hidden
                />
                {entry}
              </li>
            ))}
          </ul>
        </Section>

        {/* ── Section 3: When should I NOT use it? ─────────────── */}
        <Section
          id="when-not-to-use"
          title="When should I not use it?"
          className="mt-10"
        >
          <p className="pretty mb-3 max-w-prose text-sm leading-relaxed text-subtle-foreground">
            The most important section on this page. Knowing when a tool is the wrong
            choice is what makes you the person deciding, rather than the person
            following.
          </p>
          <ul className="flex max-w-prose flex-col gap-2">
            {tool.whenNotToUse.map((entry) => (
              <li
                key={entry}
                className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
              >
                <ShieldAlert
                  className="mt-0.5 size-3.5 shrink-0 text-amber-400"
                  aria-hidden
                />
                {entry}
              </li>
            ))}
          </ul>
        </Section>

        {/* ── Section 4: Capabilities ──────────────────────────── */}
        <Section id="capabilities" title="Capabilities" className="mt-10">
          <p className="pretty mb-3 max-w-prose text-sm leading-relaxed text-subtle-foreground">
            Only what this tool&apos;s own documentation states. Nothing here is
            inferred from what similar products do.
          </p>
          <ul className="grid max-w-3xl gap-2 sm:grid-cols-2">
            {tool.capabilities.map((capability) => (
              <li key={capability.id} className="surface rounded-lg p-4">
                <p className="text-sm font-medium text-foreground">
                  {capability.capability}
                </p>
                {capability.detail ? (
                  <p className="pretty mt-1 text-sm leading-relaxed text-muted-foreground">
                    {capability.detail}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>

        {/* ── Section 5: Limitations ───────────────────────────── */}
        <Section id="limitations" title="Limitations" className="mt-10">
          <p className="pretty mb-3 max-w-prose text-sm leading-relaxed text-subtle-foreground">
            Every tool has these. A page that claimed otherwise would be advertising.
          </p>
          <ul className="flex max-w-prose flex-col gap-2">
            {tool.limitations.map((entry) => (
              <li
                key={entry}
                className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
              >
                <Info
                  className="mt-0.5 size-3.5 shrink-0 text-subtle-foreground"
                  aria-hidden
                />
                {entry}
              </li>
            ))}
          </ul>
        </Section>

        {/* ── Section 6: How developers use it ─────────────────── */}
        <Section
          id="how-developers-use-it"
          title="How developers use it"
          className="mt-10"
        >
          <p className="pretty max-w-prose text-sm leading-relaxed text-muted-foreground">
            {tool.howDevelopersUseIt}
          </p>
          <p className="pretty mt-4 flex max-w-prose gap-2 rounded-lg border border-border bg-surface/60 p-4 text-sm leading-relaxed text-muted-foreground">
            <Wrench className="mt-0.5 size-3.5 shrink-0 text-indigo-400" aria-hidden />
            AI helps you investigate. You remain responsible for the solution.
          </p>
        </Section>

        {/* ── What it is good for ──────────────────────────────── */}
        {tool.useCases.length > 0 ? (
          <Section id="use-cases" title="What it is used for" className="mt-10">
            <ul className="grid max-w-3xl gap-2 sm:grid-cols-2">
              {tool.useCases.map((entry) => (
                <li key={entry.useCase} className="surface rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground">
                    {USE_CASE_LABEL[entry.useCase]}
                  </p>
                  <p className="pretty mt-1 text-sm leading-relaxed text-muted-foreground">
                    {entry.note}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {/* ── Learning path detail ─────────────────────────────── */}
        {path && path.lessons.length > 0 ? (
          <Section id="learning-path" title="Learning path" className="mt-10">
            <p className="pretty mb-4 max-w-prose text-sm leading-relaxed text-subtle-foreground">
              These levels are shared across the Academy, so finishing one counts
              towards every tool whose path includes it — there is only one copy of each
              lesson.
            </p>

            <ol className="flex max-w-3xl flex-col gap-2">
              {path.lessons.map((lesson) => {
                const done = lesson.status === "COMPLETED";

                const inner = (
                  <>
                    <span className="flex items-center gap-2.5">
                      {done ? (
                        <CheckCircle2
                          className="size-4 shrink-0 text-emerald-400"
                          aria-hidden
                        />
                      ) : (
                        <span
                          aria-hidden
                          className="size-4 shrink-0 rounded-full border border-border"
                        />
                      )}
                      <span className="font-mono text-xs text-subtle-foreground">
                        {String(lesson.order).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 text-sm font-medium text-foreground">
                        {lesson.title}
                      </span>
                    </span>

                    <span className="mt-1.5 block pl-[26px] text-sm leading-relaxed text-muted-foreground">
                      {lesson.description}
                    </span>

                    <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 pl-[26px] text-xs text-subtle-foreground">
                      <span>{lesson.estimatedTime}</span>
                      {/* Status in words, never colour alone. */}
                      <span className={done ? "text-emerald-400" : undefined}>
                        {done
                          ? "Complete"
                          : lesson.percentComplete > 0
                            ? `${lesson.percentComplete}% done`
                            : lesson.hasLesson
                              ? "Not started"
                              : "Lesson coming soon"}
                      </span>
                    </span>
                  </>
                );

                return (
                  <li key={lesson.id}>
                    {lesson.hasLesson && lesson.topicSlug ? (
                      <Link
                        href={`/learn/${lesson.topicSlug}`}
                        className={cn(
                          "block rounded-xl border p-4 transition-colors",
                          done
                            ? "border-emerald-500/20 bg-emerald-500/[0.04] hover:border-emerald-500/30"
                            : "border-border bg-surface/50 hover:bg-surface",
                        )}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div className="rounded-xl border border-border bg-surface/30 p-4">
                        {inner}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </Section>
        ) : null}

        {/* ── Related workflows ────────────────────────────────── */}
        {tool.workflows.length > 0 ? (
          <Section id="workflows" title="Workflows using this tool" className="mt-10">
            <ul className="grid max-w-3xl gap-2 sm:grid-cols-2">
              {tool.workflows.map((workflow) => (
                <li key={workflow.slug} className="flex">
                  <Link
                    href={`/academy/ai-tools/workflows/${workflow.slug}`}
                    className="surface-interactive group flex w-full flex-col gap-1.5 rounded-lg p-4"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {workflow.title}
                    </span>
                    <span className="pretty text-sm leading-relaxed text-muted-foreground">
                      {workflow.goal}
                    </span>
                    <span className="text-xs text-subtle-foreground">
                      {WORKFLOW_CATEGORY_LABEL[workflow.category]} ·{" "}
                      {workflow.estimatedTime}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {/* ── Official resources ───────────────────────────────── */}
        {tool.resources.length > 0 ? (
          <Section id="resources" title="Official sources" className="mt-10">
            <p className="pretty mb-3 max-w-prose text-sm leading-relaxed text-subtle-foreground">
              Nothing here is scraped or embedded. Each link opens the source itself,
              which is the authority on what this tool does today.
            </p>
            <ul className="flex max-w-3xl flex-col gap-2">
              {tool.resources.map((resource) => (
                <li key={resource.id}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="surface-interactive group flex items-start justify-between gap-4 rounded-lg p-4"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">
                        {resource.title}
                      </span>
                      {resource.description ? (
                        <span className="pretty mt-1 block text-sm leading-relaxed text-muted-foreground">
                          {resource.description}
                        </span>
                      ) : null}
                      {/* The source is named so the reader knows where a link goes. */}
                      <span className="mt-1 block text-xs text-subtle-foreground">
                        {resource.source}
                      </span>
                    </span>
                    <ExternalLink
                      className="mt-0.5 size-3.5 shrink-0 text-subtle-foreground"
                      aria-hidden
                    />
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {/* ── Next ─────────────────────────────────────────────── */}
        <div className="mt-12 flex flex-wrap gap-2">
          <Button variant="secondary" asChild>
            <Link href={`/academy/ai-tools/compare?tools=${tool.slug}`}>
              <GitCompare aria-hidden />
              Compare with another tool
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/academy/ai-tools/responsible">
              <BookOpen aria-hidden />
              Responsible AI use
            </Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}

function Section({
  id,
  title,
  className,
  children,
}: {
  id: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className={className}>
      <h2
        id={`${id}-heading`}
        className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
      >
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function ExternalLinkRow({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-indigo-300 transition-colors hover:text-indigo-200"
    >
      {label}
      <ExternalLink className="size-3.5" aria-hidden />
    </a>
  );
}
