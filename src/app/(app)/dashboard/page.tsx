import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { NextStep } from "@/components/dashboard/next-step";
import { ProgressOverview } from "@/components/dashboard/progress-overview";
import {
  MentorCard,
  RecentActivity,
  TodaysPlan,
  TrackPanels,
  WeekInReview,
} from "@/components/dashboard/dashboard-panels";
import { requireOnboardedUser } from "@/lib/session";
import { careerIcon } from "@/lib/careers/icons";
import { getGuidance, getWeeklySummary } from "@/lib/personalization/service";
import { listRecentActivity } from "@/lib/personalization/activity";
import { aiAvailability } from "@/lib/ai/provider";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

/**
 * The personalized command center.
 *
 * Rebuilt in Phase 10 around one question: what should I do next? That answer
 * is first, largest, and carries a single call to action — everything else on
 * the page is secondary by construction, and on a phone the learner sees the
 * next step and nothing else before scrolling.
 *
 * A server component. All the personalization runs here, in one `getGuidance`
 * call, and the components below render structured data — no recommendation
 * logic reaches the browser, and none of it lives in a component.
 *
 * This page never depends on AI. Every recommendation, percentage and plan item
 * is computed by the deterministic engine; the mentor card is an entry point,
 * not a source.
 */
export default async function DashboardPage() {
  const user = await requireOnboardedUser();

  const [guidance, weekly, activities] = await Promise.all([
    getGuidance(user.id),
    getWeeklySummary(user.id),
    listRecentActivity(user.id, 6),
  ]);

  const { state, next, tracks, plan } = guidance;

  const career = state.career
    ? await db.career.findUnique({
        where: { id: state.career.id },
        select: { slug: true, name: true, shortDescription: true, icon: true },
      })
    : null;

  const CareerIcon = career ? careerIcon(career.icon) : null;
  const firstName = user.name.split(/\s+/)[0] || user.name;
  const ai = aiAvailability();

  return (
    <div className="relative flex-1 overflow-hidden py-10 sm:py-14">
      <GridBackdrop className="mask-fade-b opacity-50" />
      <Glow className="-top-40 left-1/2 size-[30rem] -translate-x-1/2" />

      <Container>
        <div className="mx-auto max-w-4xl">
          {/* ── Welcome ────────────────────────────────────────── */}
          <header>
            <h1 className="balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {greeting()}, {firstName}.
            </h1>

            {career && CareerIcon ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <CareerIcon className="size-4 text-indigo-400" aria-hidden />
                {career.name}
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                You haven&apos;t chosen a path yet — and there&apos;s no rush.
              </p>
            )}
          </header>

          {/* ── The one thing that matters ─────────────────────── */}
          <div className="mt-8">
            {next ? (
              <NextStep recommendation={next} />
            ) : (
              <section
                aria-labelledby="nothing-heading"
                className="surface rounded-2xl p-6 sm:p-8"
              >
                <h2
                  id="nothing-heading"
                  className="flex items-center gap-2 text-xs font-medium uppercase tracking-label text-subtle-foreground"
                >
                  <Compass className="size-3.5" aria-hidden />
                  What should I do next?
                </h2>
                <p className="pretty mt-4 max-w-prose text-sm leading-relaxed text-muted-foreground">
                  There is nothing outstanding we can point you at right now. That
                  usually means your roadmap has no content authored for it yet —
                  exploring careers or the Git and AI academies is a good use of the
                  time in the meantime.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href="/careers">
                      Explore careers
                      <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/academy/git">Git &amp; GitHub</Link>
                  </Button>
                </div>
              </section>
            )}
          </div>

          {/* ── Secondary recommendations ──────────────────────── */}
          <div className="mt-10">
            <TrackPanels tracks={tracks} />
          </div>

          {/* ── Plan and progress ──────────────────────────────── */}
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <TodaysPlan plan={plan} />
            <ProgressOverview state={state} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <WeekInReview summary={weekly} />
            <RecentActivity activities={activities} />
          </div>

          <div className="mt-4">
            <MentorCard available={ai.configured} />
          </div>

          {/* ── Path controls ──────────────────────────────────── */}
          {career ? (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/roadmap">View your roadmap</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/careers/${career.slug}`}>About this path</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/careers">Change career</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </Container>
    </div>
  );
}

/**
 * Time-of-day greeting.
 *
 * Uses the server's clock, which is approximate for a learner in another
 * timezone — acceptable for a greeting, and the reason nothing else on this
 * page is derived from it.
 */
function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
