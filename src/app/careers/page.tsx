import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { CareerExplorer } from "@/components/careers/career-explorer";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getCareerSummaries } from "@/lib/careers/queries";
import { ONBOARDING_INTEREST_TO_SLUG } from "@/lib/careers/labels";

export const metadata: Metadata = {
  title: "Explore Careers",
  description:
    "Explore technology careers, understand what each one involves, and find a path that fits you.",
};

export default async function CareersPage() {
  const user = await getCurrentUser();

  const [careers, profile] = await Promise.all([
    getCareerSummaries(),
    user
      ? db.profile.findUnique({
          where: { userId: user.id },
          select: { selectedCareer: true, selectedCareerId: true },
        })
      : null,
  ]);

  // Only suggest when they haven't already committed to something — otherwise
  // the page would be nagging about a decision already made.
  const suggestedSlug = profile?.selectedCareerId
    ? undefined
    : profile?.selectedCareer
      ? ONBOARDING_INTEREST_TO_SLUG[profile.selectedCareer]
      : undefined;

  const suggested = suggestedSlug
    ? careers.find((career) => career.slug === suggestedSlug)
    : undefined;

  const chosen = profile?.selectedCareerId
    ? careers.find((career) => career.id === profile.selectedCareerId)
    : undefined;

  return (
    <div className="relative flex-1 overflow-hidden pb-28 pt-14 sm:pt-20">
      <GridBackdrop className="mask-radial opacity-70" />
      <Glow className="-top-40 left-1/2 size-[34rem] -translate-x-1/2" />

      <Container>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Explore Your Path Into Tech
          </h1>
          <p className="pretty mx-auto mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Not sure where you belong yet? Explore different technology careers,
            understand what they involve, and find a path that fits you.
          </p>
        </div>

        {/* ── Current path / suggestion ────────────────────────── */}
        {chosen ? (
          <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-5">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-label text-emerald-400/80">
                Your current path
              </p>
              <p className="mt-1 text-base font-medium text-foreground">
                {chosen.name}
              </p>
            </div>
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/careers/${chosen.slug}`}>View path</Link>
            </Button>
          </div>
        ) : suggested ? (
          <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-primary/25 bg-primary/[0.07] p-5">
            <p className="flex items-center gap-2 text-xs uppercase tracking-label text-indigo-300">
              <Sparkles className="size-3.5" aria-hidden />
              Based on what you told us
            </p>
            <p className="mt-2 text-base text-foreground">
              <span className="font-medium">{suggested.name}</span> may be a good place
              to start — but it&apos;s only a suggestion, not a decision.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <Link href={`/careers/${suggested.slug}`}>Explore this path</Link>
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <Link href="#catalog">Explore other careers</Link>
              </Button>
            </div>
          </div>
        ) : null}

        {/* ── Catalog ──────────────────────────────────────────── */}
        <div id="catalog" className="mt-14 scroll-mt-24">
          <CareerExplorer careers={careers} />
        </div>

        {/* ── Not sure yet ─────────────────────────────────────── */}
        <div className="surface mx-auto mt-14 max-w-2xl rounded-xl p-6 text-center">
          <span
            aria-hidden
            className="mx-auto grid size-10 place-items-center rounded-lg border border-border bg-surface text-indigo-400"
          >
            <Compass className="size-[18px]" />
          </span>
          <h2 className="mt-4 text-lg font-medium tracking-tight text-foreground">
            Not sure what to choose?
          </h2>
          <p className="pretty mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            That&apos;s okay. You don&apos;t need to know yet. Read a few paths, compare
            two side by side, and come back when something feels right — nothing here
            expires, and you can change your mind later.
          </p>
        </div>
      </Container>
    </div>
  );
}
