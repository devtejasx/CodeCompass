import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Hammer,
  Route,
  TrendingUp,
  UserCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { CareerCard } from "@/components/careers/career-card";
import { ChoosePathButton } from "@/components/careers/choose-path-button";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getCareerBySlug } from "@/lib/careers/queries";
import { careerHasRoadmap } from "@/lib/roadmap/queries";
import { careerIcon } from "@/lib/careers/icons";
import {
  CATEGORY_LABEL,
  DEMAND_LABEL,
  DIFFICULTY_BADGE,
  DIFFICULTY_LABEL,
} from "@/lib/careers/labels";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const career = await getCareerBySlug(slug);

  if (!career) return { title: "Career not found" };

  return {
    title: career.name,
    description: career.shortDescription,
  };
}

export default async function CareerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [career, user] = await Promise.all([getCareerBySlug(slug), getCurrentUser()]);

  // Unknown slug renders the 404 page rather than an empty shell.
  if (!career) notFound();

  const profile = user
    ? await db.profile.findUnique({
        where: { userId: user.id },
        select: { selectedCareerId: true },
      })
    : null;

  const Icon = careerIcon(career.icon);
  const isCurrent = profile?.selectedCareerId === career.id;
  const related = career.relatedTo.map((edge) => edge.relatedCareer);

  // Said before the commitment, not after it. Choosing a career with no
  // authored roadmap is allowed — the interest is still worth recording — but
  // the page has to be straight about what happens next.
  const hasRoadmap = await careerHasRoadmap(career.id);

  return (
    <div className="relative flex-1 overflow-hidden pb-24">
      <GridBackdrop className="mask-radial opacity-60" />
      <Glow className="-top-40 left-1/2 size-[32rem] -translate-x-1/2" />

      <Container>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="pt-10 sm:pt-14">
          <Link
            href="/careers"
            className="inline-flex items-center gap-1.5 rounded text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            All careers
          </Link>

          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-2xl">
              <span
                aria-hidden
                className="grid size-12 place-items-center rounded-xl border border-border bg-surface text-indigo-400"
              >
                <Icon className="size-5" />
              </span>

              <h1 className="balance mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {career.name}
              </h1>
              <p className="pretty mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
                {career.shortDescription}
              </p>

              <dl className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="flex items-center gap-2">
                  <dt className="sr-only">Category</dt>
                  <dd className="text-sm text-muted-foreground">
                    {CATEGORY_LABEL[career.category]}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt className="sr-only">Difficulty</dt>
                  <dd>
                    <Badge variant={DIFFICULTY_BADGE[career.difficulty]}>
                      {DIFFICULTY_LABEL[career.difficulty]}
                    </Badge>
                  </dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock3 className="size-3.5 text-subtle-foreground" aria-hidden />
                  <dt className="sr-only">Estimated learning journey</dt>
                  <dd className="text-sm text-muted-foreground">
                    {career.estimatedLearningTime}
                  </dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="size-3.5 text-subtle-foreground" aria-hidden />
                  <dt className="sr-only">Demand</dt>
                  <dd className="text-sm text-muted-foreground">
                    {DEMAND_LABEL[career.demandLevel]}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-2 lg:pt-2">
              <ChoosePathButton
                careerId={career.id}
                careerName={career.name}
                slug={career.slug}
                isAuthenticated={Boolean(user)}
                isCurrent={isCurrent}
              />
              {!hasRoadmap ? (
                <p className="max-w-[26ch] text-xs leading-relaxed text-amber-400">
                  We haven&apos;t written the roadmap for this path yet. You can still
                  choose it — we&apos;ll record the direction — but there is nothing
                  to follow here until it lands.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div className="flex min-w-0 flex-col gap-12">
            {/* ── 1. What is this career ─────────────────────── */}
            <section aria-labelledby="what-heading">
              <h2
                id="what-heading"
                className="text-xl font-semibold tracking-tight text-foreground"
              >
                What is a {career.name}?
              </h2>
              <p className="pretty mt-4 text-base leading-relaxed text-muted-foreground">
                {career.description}
              </p>
            </section>

            {/* ── 2. What do they build ──────────────────────── */}
            <Section
              id="builds"
              icon={Hammer}
              title="What do they build?"
              items={career.builds}
            />

            {/* ── 3. What will you learn (preview only) ──────── */}
            <section aria-labelledby="learn-heading">
              <div className="flex items-center gap-2">
                <Route className="size-4 text-indigo-400" aria-hidden />
                <h2
                  id="learn-heading"
                  className="text-xl font-semibold tracking-tight text-foreground"
                >
                  What will you learn?
                </h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                A high-level preview of the areas this journey covers. Your detailed
                roadmap comes next.
              </p>

              <ol className="mt-5 flex flex-col gap-2">
                {career.learningAreas.map((area, index) => (
                  <li
                    key={area}
                    className="surface flex items-center gap-3 rounded-lg px-4 py-3"
                  >
                    <span
                      aria-hidden
                      className="grid size-6 shrink-0 place-items-center rounded-md border border-border bg-surface font-mono text-[11px] text-subtle-foreground"
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm text-foreground">{area}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* ── 5. Who is this for ─────────────────────────── */}
            <Section
              id="suited"
              icon={UserCheck}
              title={`You may enjoy this if…`}
              items={career.suitedFor}
              tone="positive"
            />

            {/* ── 6. What might be challenging ───────────────── */}
            <section aria-labelledby="challenges-heading">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-400" aria-hidden />
                <h2
                  id="challenges-heading"
                  className="text-xl font-semibold tracking-tight text-foreground"
                >
                  What might be challenging
                </h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Worth knowing before you commit. Every path has these.
              </p>
              <ul className="mt-5 flex flex-col gap-2.5">
                {career.challenges.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400/70"
                    />
                    <span className="text-sm leading-relaxed text-muted-foreground">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* ── 4. Technologies (sidebar) ────────────────────── */}
          <aside className="flex min-w-0 flex-col gap-8 lg:sticky lg:top-24 lg:self-start">
            <section aria-labelledby="tech-heading" className="surface rounded-xl p-5">
              <h2
                id="tech-heading"
                className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
              >
                Technologies
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {career.technologies.map(({ technology }) => (
                  <li
                    key={technology.id}
                    className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {technology.name}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-subtle-foreground">
                Common in this field — you won&apos;t need all of them on day one.
              </p>
            </section>
          </aside>
        </div>

        {/* ── 7. Related careers ─────────────────────────────── */}
        {related.length > 0 ? (
          <section aria-labelledby="related-heading" className="mt-20">
            <h2
              id="related-heading"
              className="text-xl font-semibold tracking-tight text-foreground"
            >
              Related paths
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Close enough that much of what you learn carries over.
            </p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <li key={item.id} className="min-w-0">
                  <CareerCard career={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ── 8. Choose your path ────────────────────────────── */}
        <section
          aria-labelledby="choose-heading"
          className="surface mt-20 rounded-2xl px-6 py-12 text-center sm:px-12"
        >
          <h2
            id="choose-heading"
            className="balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Ready to explore this journey?
          </h2>
          <p className="pretty mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Choosing a path sets your direction. You can change it later — nothing here
            is permanent.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4">
            <ChoosePathButton
              careerId={career.id}
              careerName={career.name}
              slug={career.slug}
              isAuthenticated={Boolean(user)}
              isCurrent={isCurrent}
            />
            <Link
              href="/careers"
              className="rounded text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Not sure yet? Keep exploring
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
}

/** Shared list section for the narrative blocks. */
function Section({
  id,
  icon: Icon,
  title,
  items,
  tone = "neutral",
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  tone?: "neutral" | "positive";
}) {
  return (
    <section aria-labelledby={`${id}-heading`}>
      <div className="flex items-center gap-2">
        <Icon
          className={
            tone === "positive" ? "size-4 text-emerald-400" : "size-4 text-indigo-400"
          }
        />
        <h2
          id={`${id}-heading`}
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          {title}
        </h2>
      </div>
      <ul className="mt-5 flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            {tone === "positive" ? (
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-emerald-400"
                aria-hidden
              />
            ) : (
              <span
                aria-hidden
                className="mt-2 size-1.5 shrink-0 rounded-full bg-indigo-400/70"
              />
            )}
            <span className="text-sm leading-relaxed text-muted-foreground">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
