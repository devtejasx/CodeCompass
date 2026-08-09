import { db } from "@/lib/db";

/**
 * Career reads. Career content is public and identical for everyone, so these
 * run on the server and ship no query code to the browser.
 */

/** Everything the explorer grid and comparison picker need — nothing more. */
export const CAREER_SUMMARY_SELECT = {
  id: true,
  slug: true,
  name: true,
  shortDescription: true,
  mainFocus: true,
  icon: true,
  category: true,
  difficulty: true,
  estimatedLearningTime: true,
  demandLevel: true,
} as const;

export type CareerSummary = Awaited<ReturnType<typeof getCareerSummaries>>[number];

export async function getCareerSummaries() {
  return db.career.findMany({
    select: CAREER_SUMMARY_SELECT,
    orderBy: { sortOrder: "asc" },
  });
}

/**
 * Full detail for one career, including technologies and related careers.
 * Returns null for an unknown slug so the page can render a proper 404 rather
 * than throwing.
 */
export async function getCareerBySlug(slug: string) {
  return db.career.findUnique({
    where: { slug },
    include: {
      technologies: {
        orderBy: { sortOrder: "asc" },
        select: { technology: { select: { id: true, name: true, slug: true } } },
      },
      relatedTo: {
        orderBy: { sortOrder: "asc" },
        select: { relatedCareer: { select: CAREER_SUMMARY_SELECT } },
      },
    },
  });
}

export type CareerDetail = NonNullable<Awaited<ReturnType<typeof getCareerBySlug>>>;

/**
 * Careers for the comparison view, in the order the caller asked for them —
 * `findMany` returns database order, which would silently reshuffle columns.
 */
export async function getCareersForComparison(slugs: string[]) {
  if (slugs.length === 0) return [];

  const careers = await db.career.findMany({
    where: { slug: { in: slugs } },
    select: {
      ...CAREER_SUMMARY_SELECT,
      learningAreas: true,
      suitedFor: true,
      technologies: {
        orderBy: { sortOrder: "asc" },
        take: 6,
        select: { technology: { select: { id: true, name: true } } },
      },
    },
  });

  const bySlug = new Map(careers.map((career) => [career.slug, career]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((career): career is NonNullable<typeof career> => Boolean(career));
}

export type CareerComparison = Awaited<
  ReturnType<typeof getCareersForComparison>
>[number];

/** Slugs only — used to validate a career selection without loading content. */
export async function careerExists(id: string) {
  const career = await db.career.findUnique({ where: { id }, select: { id: true } });
  return Boolean(career);
}
