import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { CAREERS } from "./seed/careers";

/**
 * Seeds the career catalog.
 *
 * Idempotent by design: everything is upserted by slug and join rows are
 * rebuilt, so running this repeatedly always converges on exactly the catalog
 * declared in seed/careers.ts. It never touches user data.
 */

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env first.");
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/**
 * `+` and `#` must be spelled out before stripping punctuation, otherwise
 * C, C++ and C# all collapse onto the same slug.
 */
function slugifyTechnology(name: string) {
  return name
    .replace(/\+/g, "plus")
    .replace(/#/g, "sharp")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  // ── Technologies ────────────────────────────────────────────────────────
  const technologyNames = [...new Set(CAREERS.flatMap((c) => c.technologies))];

  for (const name of technologyNames) {
    const slug = slugifyTechnology(name);
    await db.technology.upsert({
      where: { slug },
      create: { slug, name },
      update: { name },
    });
  }

  // ── Careers ─────────────────────────────────────────────────────────────
  for (const [index, career] of CAREERS.entries()) {
    const data = {
      name: career.name,
      shortDescription: career.shortDescription,
      description: career.description,
      mainFocus: career.mainFocus,
      icon: career.icon,
      category: career.category,
      difficulty: career.difficulty,
      estimatedLearningTime: career.estimatedLearningTime,
      demandLevel: career.demandLevel,
      builds: career.builds,
      learningAreas: career.learningAreas,
      suitedFor: career.suitedFor,
      challenges: career.challenges,
      sortOrder: index,
    };

    await db.career.upsert({
      where: { slug: career.slug },
      create: { slug: career.slug, ...data },
      update: data,
    });
  }

  // ── Join rows ───────────────────────────────────────────────────────────
  // Rebuilt rather than merged so removing an entry from the catalog actually
  // removes it from the database.
  for (const career of CAREERS) {
    const row = await db.career.findUniqueOrThrow({
      where: { slug: career.slug },
      select: { id: true },
    });

    await db.careerTechnology.deleteMany({ where: { careerId: row.id } });

    for (const [order, name] of career.technologies.entries()) {
      const technology = await db.technology.findUniqueOrThrow({
        where: { slug: slugifyTechnology(name) },
        select: { id: true },
      });
      await db.careerTechnology.create({
        data: { careerId: row.id, technologyId: technology.id, sortOrder: order },
      });
    }
  }

  // Relations run last: every career must exist before edges can point at it.
  for (const career of CAREERS) {
    const row = await db.career.findUniqueOrThrow({
      where: { slug: career.slug },
      select: { id: true },
    });

    await db.careerRelation.deleteMany({ where: { careerId: row.id } });

    for (const [order, relatedSlug] of career.related.entries()) {
      const related = await db.career.findUnique({
        where: { slug: relatedSlug },
        select: { id: true },
      });

      // A typo in `related` should be loud, not a silently missing link.
      if (!related) {
        throw new Error(
          `Career "${career.slug}" lists related career "${relatedSlug}", which is not in the catalog.`,
        );
      }

      await db.careerRelation.create({
        data: { careerId: row.id, relatedCareerId: related.id, sortOrder: order },
      });
    }
  }

  const [careers, technologies] = await Promise.all([
    db.career.count(),
    db.technology.count(),
  ]);

  console.log(`Seeded ${careers} careers and ${technologies} technologies.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
