import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { GridBackdrop } from "@/components/shared/backdrops";
import { careerIcon } from "@/lib/careers/icons";
import {
  CATEGORY_LABEL,
  DIFFICULTY_BADGE,
  DIFFICULTY_SHORT,
} from "@/lib/careers/labels";
import { getCareersForComparison, type CareerComparison } from "@/lib/careers/queries";

export const metadata: Metadata = {
  title: "Compare Careers",
  description: "Compare technology careers side by side.",
};

const MAX_COMPARE = 3;

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;

  const slugs = (ids ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean)
    .slice(0, MAX_COMPARE);

  const careers = await getCareersForComparison(slugs);

  return (
    <div className="relative flex-1 overflow-hidden pb-24 pt-10 sm:pt-14">
      <GridBackdrop className="mask-radial opacity-50" />

      <Container>
        <Link
          href="/careers"
          className="tap-target inline-flex items-center gap-1.5 rounded text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to careers
        </Link>

        <h1 className="balance mt-8 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Compare careers
        </h1>
        <p className="pretty mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Side by side, so the differences are easier to see than the marketing.
        </p>

        {careers.length < 2 ? (
          <div className="surface mt-12 flex flex-col items-center gap-3 rounded-xl px-6 py-16 text-center">
            <p className="text-base font-medium text-foreground">
              Pick at least two careers to compare.
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Head back to the explorer and tick &ldquo;Compare&rdquo; on two or three
              cards.
            </p>
            <Button variant="secondary" size="sm" asChild className="mt-2">
              <Link href="/careers">Choose careers</Link>
            </Button>
          </div>
        ) : (
          <ComparisonTable careers={careers} />
        )}
      </Container>
    </div>
  );
}

const ROWS: {
  label: string;
  render: (career: CareerComparison) => React.ReactNode;
}[] = [
  {
    label: "Main focus",
    render: (career) => career.mainFocus,
  },
  {
    label: "Category",
    render: (career) => CATEGORY_LABEL[career.category],
  },
  {
    label: "Difficulty",
    render: (career) => (
      <Badge variant={DIFFICULTY_BADGE[career.difficulty]}>
        {DIFFICULTY_SHORT[career.difficulty]}
      </Badge>
    ),
  },
  {
    label: "Learning journey",
    render: (career) => career.estimatedLearningTime,
  },
  {
    label: "Common tools",
    render: (career) => (
      <ul className="flex flex-wrap gap-1.5">
        {career.technologies.map(({ technology }) => (
          <li
            key={technology.id}
            className="rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-muted-foreground"
          >
            {technology.name}
          </li>
        ))}
      </ul>
    ),
  },
  {
    label: "You'll learn",
    render: (career) => (
      <ul className="flex flex-col gap-1">
        {career.learningAreas.slice(0, 5).map((area) => (
          <li key={area} className="text-sm text-muted-foreground">
            {area}
          </li>
        ))}
      </ul>
    ),
  },
  {
    label: "Good for you if",
    render: (career) => (
      <ul className="flex flex-col gap-1">
        {career.suitedFor.slice(0, 3).map((item) => (
          <li key={item} className="text-sm text-muted-foreground">
            {item}
          </li>
        ))}
      </ul>
    ),
  },
];

/**
 * One real <table> for desktop and a stacked card per career for narrow
 * screens. A pinched-down table is unusable on a phone, so the mobile view is
 * a different layout rather than the same one scaled.
 */
function ComparisonTable({ careers }: { careers: CareerComparison[] }) {
  return (
    <>
      {/* Desktop / tablet */}
      <div className="mt-12 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[42rem] border-collapse text-left">
          <caption className="sr-only">
            Comparison of {careers.map((c) => c.name).join(", ")}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-40 pb-4 pr-4 align-bottom">
                <span className="sr-only">Attribute</span>
              </th>
              {careers.map((career) => {
                const Icon = careerIcon(career.icon);
                return (
                  <th key={career.id} scope="col" className="pb-4 pr-4 align-bottom">
                    <span
                      aria-hidden
                      className="grid size-9 place-items-center rounded-lg border border-border bg-surface text-indigo-400"
                    >
                      <Icon className="size-4" />
                    </span>
                    <Link
                      href={`/careers/${career.slug}`}
                      className="mt-3 block rounded text-base font-medium tracking-tight text-foreground underline-offset-4 hover:underline"
                    >
                      {career.name}
                    </Link>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-t border-border align-top">
                <th
                  scope="row"
                  className="py-5 pr-4 text-xs font-medium uppercase tracking-label text-subtle-foreground"
                >
                  {row.label}
                </th>
                {careers.map((career) => (
                  <td
                    key={career.id}
                    className="py-5 pr-4 text-sm text-muted-foreground"
                  >
                    {row.render(career)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="mt-10 flex flex-col gap-4 md:hidden">
        {careers.map((career) => {
          const Icon = careerIcon(career.icon);
          return (
            <section
              key={career.id}
              aria-labelledby={`compare-${career.id}`}
              className="surface rounded-xl p-5"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-surface text-indigo-400"
                >
                  <Icon className="size-4" />
                </span>
                <h2 id={`compare-${career.id}`} className="min-w-0">
                  <Link
                    href={`/careers/${career.slug}`}
                    className="block truncate rounded text-base font-medium tracking-tight text-foreground underline-offset-4 hover:underline"
                  >
                    {career.name}
                  </Link>
                </h2>
              </div>

              <dl className="mt-4 flex flex-col gap-4">
                {ROWS.map((row) => (
                  <div key={row.label}>
                    <dt className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
                      {row.label}
                    </dt>
                    <dd className="mt-1.5 text-sm text-muted-foreground">
                      {row.render(career)}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
      </div>
    </>
  );
}
