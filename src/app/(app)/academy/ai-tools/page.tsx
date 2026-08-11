import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GitCompare,
  Route,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { ToolCard } from "@/components/ai-tools/tool-card";
import { ToolExplorer } from "@/components/ai-tools/tool-explorer";
import { requireOnboardedUser } from "@/lib/session";
import {
  getAIProgressSummary,
  getCareerRecommendations,
  listCategories,
  listTools,
} from "@/lib/ai-tools/queries";
import { USE_CASE_LABEL } from "@/lib/ai-tools/labels";

export const metadata: Metadata = {
  title: "AI Tools Academy",
  description:
    "Understand what today's AI tools do, when to use them, and how technology professionals use them effectively.",
  robots: { index: false, follow: false },
};

/**
 * The AI Tools Academy landing page.
 *
 * A server component. The catalog, the categories and the recommendations are
 * all loaded here and only the card-sized summaries cross into the one client
 * island — the explorer — which owns search and filtering and nothing else. The
 * prose that makes up most of this Academy never becomes JavaScript.
 */
export default async function AIToolsPage() {
  const user = await requireOnboardedUser();

  const [tools, categories, recommendations, progress] = await Promise.all([
    listTools(user.id),
    listCategories(),
    getCareerRecommendations(user.id, 4),
    getAIProgressSummary(user.id),
  ]);

  if (tools.length === 0) {
    return (
      <div className="flex flex-1 items-center py-24">
        <Container>
          <p className="text-center text-sm text-muted-foreground">
            The AI tool catalog hasn&apos;t been seeded on this deployment yet.
          </p>
        </Container>
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden pb-24 pt-10 sm:pt-14">
      <GridBackdrop className="mask-fade-b opacity-50" />
      <Glow className="-top-40 left-1/2 size-[30rem] -translate-x-1/2" />

      <Container>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <header className="max-w-3xl">
          <span
            aria-hidden
            className="grid size-12 place-items-center rounded-xl border border-border bg-surface text-indigo-400"
          >
            <Sparkles className="size-5" />
          </span>

          <h1 className="balance mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Learn the AI tools shaping modern technology.
          </h1>
          <p className="pretty mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Understand what today&apos;s AI tools do, when to use them, and how
            technology professionals use them effectively.
          </p>

          <p className="pretty mt-4 max-w-prose text-sm leading-relaxed text-subtle-foreground">
            AI is a tool, not a replacement for understanding. Everything here is
            built around one loop: understand the problem, think, ask, verify, test,
            improve — and end up knowing more than you did, not less.
          </p>
        </header>

        {/* ── Progress ─────────────────────────────────────────── */}
        <section aria-labelledby="ai-progress-heading" className="mt-8 max-w-3xl">
          <h2 id="ai-progress-heading" className="sr-only">
            Your progress
          </h2>

          <div className="surface rounded-xl p-5">
            <dl className="flex flex-wrap gap-x-10 gap-y-3">
              <div>
                <dt className="text-xs text-subtle-foreground">AI tools learned</dt>
                <dd className="mt-0.5 font-mono text-2xl font-medium text-foreground">
                  {progress.toolsLearned}
                  <span className="ml-1 font-sans text-sm font-normal text-subtle-foreground">
                    / {progress.totalTools}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-subtle-foreground">In progress</dt>
                <dd className="mt-0.5 font-mono text-2xl font-medium text-foreground">
                  {progress.toolsInProgress}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-subtle-foreground">Workflows completed</dt>
                <dd className="mt-0.5 font-mono text-2xl font-medium text-foreground">
                  {progress.workflowsCompleted}
                  <span className="ml-1 font-sans text-sm font-normal text-subtle-foreground">
                    / {progress.totalWorkflows}
                  </span>
                </dd>
              </div>
            </dl>

            {progress.current ? (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button size="sm" asChild>
                  <Link href={`/academy/ai-tools/${progress.current.slug}`}>
                    Continue learning
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
                <span className="text-sm text-subtle-foreground">
                  {progress.current.name} · {progress.current.percentComplete}%
                </span>
              </div>
            ) : progress.toolsLearned > 0 ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 className="size-4" aria-hidden />
                Nothing in progress. Pick a tool below to start another path.
              </p>
            ) : null}
          </div>
        </section>

        {/* ── Ways in ──────────────────────────────────────────── */}
        <nav aria-label="Academy sections" className="mt-4">
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <EntryPoint
              href="/academy/ai-tools/choose"
              icon={<Wand2 className="size-4" aria-hidden />}
              title="Which tool should I use?"
              description="Answer two questions and get a shortlist, chosen by rules rather than by an AI."
            />
            <EntryPoint
              href="/academy/ai-tools/workflows"
              icon={<Route className="size-4" aria-hidden />}
              title="Developer AI workflows"
              description="Ten processes — debugging, testing, refactoring — with example prompts and what to verify."
            />
            <EntryPoint
              href="/academy/ai-tools/compare"
              icon={<GitCompare className="size-4" aria-hidden />}
              title="Compare tools"
              description="Two or three side by side. No winner, because different tools do different jobs."
            />
            <EntryPoint
              href="/academy/ai-tools/responsible"
              icon={<ShieldCheck className="size-4" aria-hidden />}
              title="Responsible AI use"
              description="Verification, secrets, licences, security — the part that stays yours."
            />
          </ul>
        </nav>

        {/* ── Recommended ──────────────────────────────────────── */}
        {recommendations.career && recommendations.recommendations.length > 0 ? (
          <section aria-labelledby="ai-recommended-heading" className="mt-12">
            <h2
              id="ai-recommended-heading"
              className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
            >
              Recommended for you
            </h2>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
              Because you chose{" "}
              <span className="font-medium text-foreground">
                {recommendations.career.name}
              </span>
              . These are the tools that do real work on that path — each one with the
              reason it is here.
            </p>

            <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {recommendations.recommendations.map((entry) => (
                <li key={entry.tool.slug} className="flex">
                  <ToolCard
                    tool={entry.tool}
                    reason={`${USE_CASE_LABEL[entry.useCase]} — ${entry.reason}`}
                    className="w-full"
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section className="surface mt-12 rounded-xl p-6">
            <h2 className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
              Recommended for you
            </h2>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
              Choose a career path and this section will show the AI tools that do real
              work on it, with the reason for each. Until then, the whole catalog is
              below — nothing is hidden from you.
            </p>
            <div className="mt-5">
              <Button variant="secondary" size="sm" asChild>
                <Link href="/careers">
                  Explore career paths
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </div>
          </section>
        )}

        {/* ── Catalog ──────────────────────────────────────────── */}
        <section aria-labelledby="ai-catalog-heading" className="mt-12">
          <h2
            id="ai-catalog-heading"
            className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
          >
            Tool catalog
          </h2>
          <p className="mt-2 flex max-w-prose items-start gap-2 text-sm leading-relaxed text-muted-foreground">
            <BookOpen
              className="mt-0.5 size-3.5 shrink-0 text-indigo-400"
              aria-hidden
            />
            Every entry was checked against the tool&apos;s own site or documentation,
            and each detail page says when. Tools that have been renamed or
            discontinued are kept and labelled rather than deleted — if you have heard
            a name, you should be able to find out what happened to it.
          </p>

          <div className="mt-6">
            <ToolExplorer tools={tools} categories={categories} />
          </div>
        </section>
      </Container>
    </div>
  );
}

function EntryPoint({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <li className="flex">
      <Link
        href={href}
        className="surface-interactive group flex w-full flex-col gap-2 rounded-xl p-5"
      >
        <span
          aria-hidden
          className="grid size-9 place-items-center rounded-lg border border-border bg-surface text-indigo-400"
        >
          {icon}
        </span>
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="pretty text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <span className="mt-auto flex items-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          Open
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </Link>
    </li>
  );
}
