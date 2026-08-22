import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Code2, Sparkles, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { GridBackdrop } from "@/components/shared/backdrops";
import { PracticeBrowser } from "@/components/practice/practice-browser";
import { ProblemCard } from "@/components/practice/problem-card";
import { requireOnboardedUser } from "@/lib/session";
import {
  getPracticeStats,
  getRecommendedProblems,
  listProblems,
} from "@/lib/practice/queries";

export const metadata: Metadata = {
  title: "Coding Practice",
  description: "Turn what you learned into code.",
  robots: { index: false, follow: false },
};

/**
 * The practice dashboard.
 *
 * Recommended comes first because it answers the only question that matters
 * here: what should I practise right now? Everything below it is browsing.
 */
export default async function PracticePage() {
  const user = await requireOnboardedUser();

  const [problems, stats, recommended] = await Promise.all([
    listProblems(user.id),
    getPracticeStats(user.id),
    getRecommendedProblems(user.id),
  ]);

  // Every figure here is counted from the database. Nothing about the size of
  // the catalog is written down in the interface, so the page cannot drift out
  // of step with what is actually seeded.
  const summary = [
    {
      label: "Problems solved",
      value: `${stats.solved} / ${stats.totalProblems}`,
      icon: Sparkles,
    },
    { label: "Attempted", value: `${stats.attempted}`, icon: Target },
    { label: "Easy solved", value: `${stats.easySolved}`, icon: Code2 },
    { label: "Medium solved", value: `${stats.mediumSolved}`, icon: Code2 },
    { label: "Hard solved", value: `${stats.hardSolved}`, icon: Code2 },
  ];

  return (
    <div className="relative flex-1 overflow-hidden py-12 sm:py-16">
      <GridBackdrop className="mask-fade-b opacity-50" />

      <Container>
        <header>
          <h1 className="balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Coding Practice
          </h1>
          <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-muted-foreground">
            Turn what you learned into code.
          </p>
        </header>

        {/* ── Progress ─────────────────────────────────────────── */}
        <dl className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2
              id="recommended-heading"
              className="text-lg font-medium tracking-tight text-foreground"
            >
              Recommended for you
            </h2>
            {recommended.currentTopic ? (
              <p className="text-sm text-subtle-foreground">
                You&apos;re on{" "}
                <Link
                  href={`/learn/${recommended.currentTopic.slug}`}
                  className="rounded text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {recommended.currentTopic.title}
                </Link>
              </p>
            ) : null}
          </div>

          {recommended.recommendations.length > 0 ? (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {recommended.recommendations.map(({ problem, reason }) => (
                <li key={problem.slug} className="flex">
                  <ProblemCard
                    className="w-full"
                    problem={problem}
                    // Six at most, and the ones a learner is most likely to
                    // open. Short enough that prefetching them on sight is a
                    // handful of requests rather than a stampede.
                    prefetch
                    reason={
                      reason === "CURRENT_TOPIC"
                        ? "For the topic you're on"
                        : "Practises something you've finished"
                    }
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyRecommendation
              hasCareer={recommended.careerName !== null}
              topicTitle={recommended.currentTopic?.title ?? null}
            />
          )}
        </section>

        {/* ── Catalog ──────────────────────────────────────────── */}
        <section aria-labelledby="catalog-heading" className="mt-14">
          <h2
            id="catalog-heading"
            className="mb-5 text-lg font-medium tracking-tight text-foreground"
          >
            All problems
          </h2>
          <PracticeBrowser problems={problems} />
        </section>
      </Container>
    </div>
  );
}

/**
 * No filler. If we have nothing relevant, we say so — recommending unrelated
 * problems to fill a row teaches the learner that recommendations are noise.
 */
function EmptyRecommendation({
  hasCareer,
  topicTitle,
}: {
  hasCareer: boolean;
  topicTitle: string | null;
}) {
  if (!hasCareer) {
    return (
      <div className="surface mt-5 rounded-xl p-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Choose a career path and we&apos;ll line up practice that matches what
          you&apos;re learning. Until then, everything below is open to you.
        </p>
        <Button className="mt-5" asChild>
          <Link href="/careers">
            Explore your path
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="surface mt-5 rounded-xl p-6">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {topicTitle
          ? `Practice problems for ${topicTitle} are coming soon.`
          : "Practice problems for this topic are coming soon."}{" "}
        You&apos;ve either solved everything we have for where you are, or we
        haven&apos;t written it yet. Browse the full catalog below in the meantime.
      </p>
      <Button variant="secondary" className="mt-5" asChild>
        <Link href="/roadmap">Back to your roadmap</Link>
      </Button>
    </div>
  );
}
