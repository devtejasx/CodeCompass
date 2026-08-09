import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { CAREERS } from "./seed/careers";
import { ROADMAPS } from "./seed/roadmaps";
import { assertValidRoadmaps } from "./seed/roadmaps/validate";
import { LESSONS } from "./seed/lessons";
import { assertValidLessons } from "./seed/lessons/validate";

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

  await seedRoadmaps();
  await seedLessons();

  const [careers, roadmaps, phases, topics, lessons, sections, checks] =
    await Promise.all([
      db.career.count(),
      db.roadmap.count(),
      db.roadmapPhase.count(),
      db.topic.count(),
      db.lesson.count(),
      db.lessonSection.count(),
      db.knowledgeCheck.count(),
    ]);

  console.log(
    `Seeded ${careers} careers, ${roadmaps} roadmaps, ${phases} phases, ` +
      `${topics} topics, ${lessons} lessons, ${sections} sections, ` +
      `${checks} knowledge checks.`,
  );
}

/**
 * Replaces each authored lesson wholesale.
 *
 * Section and question order come from array position, so a reordering has to
 * be able to drop the old rows — the unique (lessonId, order) constraints
 * would otherwise collide. Deleting the Lesson cascades to sections, checks,
 * options and resources, making that one statement.
 *
 * Learner progress is NOT touched by content reseeding: UserTopicProgress
 * points at Topic, which survives. UserSectionProgress does reference sections,
 * so re-seeding clears section ticks — acceptable while content is still being
 * authored, and noted in the README as debt.
 */
async function seedLessons() {
  assertValidLessons(LESSONS);

  for (const lesson of LESSONS) {
    const topic = await db.topic.findUnique({
      where: { slug: lesson.topicSlug },
      select: { id: true },
    });

    if (!topic) {
      throw new Error(
        `Lesson "${lesson.title}" targets topic "${lesson.topicSlug}", which is not in any roadmap.`,
      );
    }

    await db.lesson.deleteMany({ where: { topicId: topic.id } });

    const created = await db.lesson.create({
      data: {
        topicId: topic.id,
        title: lesson.title,
        description: lesson.description,
        estimatedTime: lesson.estimatedTime,
      },
      select: { id: true },
    });

    for (const [index, section] of lesson.sections.entries()) {
      await db.lessonSection.create({
        data: {
          lessonId: created.id,
          title: section.title ?? null,
          type: section.type,
          content: section.content,
          items: section.items ?? [],
          code: section.code ?? null,
          language: section.language ?? null,
          order: index + 1,
        },
      });
    }

    for (const [index, check] of lesson.knowledgeChecks.entries()) {
      const createdCheck = await db.knowledgeCheck.create({
        data: {
          lessonId: created.id,
          question: check.question,
          explanation: check.explanation,
          order: index + 1,
        },
        select: { id: true },
      });

      for (const [optionIndex, option] of check.options.entries()) {
        await db.knowledgeCheckOption.create({
          data: {
            knowledgeCheckId: createdCheck.id,
            text: option.text,
            isCorrect: option.isCorrect ?? false,
            order: optionIndex + 1,
          },
        });
      }
    }

    for (const [index, resource] of (lesson.resources ?? []).entries()) {
      await db.resource.create({
        data: {
          lessonId: created.id,
          title: resource.title,
          url: resource.url,
          source: resource.source,
          type: resource.type,
          description: resource.description ?? null,
          order: index + 1,
        },
      });
    }
  }
}

/**
 * Roadmaps are validated as a set before anything is written, then each one is
 * replaced wholesale.
 *
 * Phases and topics are deleted and recreated rather than merged: `order` is
 * derived from array position, so a reordering in the source has to be able to
 * remove the old rows or the unique (roadmapId, order) constraint would fight
 * it. The cascade from Roadmap → Phase → Topic → Prerequisite makes that one
 * delete. User data is never touched — profiles reference Career, not Roadmap.
 */
async function seedRoadmaps() {
  assertValidRoadmaps(ROADMAPS);

  for (const roadmap of ROADMAPS) {
    const career = await db.career.findUnique({
      where: { slug: roadmap.careerSlug },
      select: { id: true },
    });

    if (!career) {
      throw new Error(
        `Roadmap "${roadmap.title}" targets career "${roadmap.careerSlug}", which is not in the catalog.`,
      );
    }

    const version = roadmap.version ?? 1;

    // Replacing the whole version keeps ordering authoritative.
    await db.roadmap.deleteMany({ where: { careerId: career.id, version } });

    const created = await db.roadmap.create({
      data: {
        careerId: career.id,
        title: roadmap.title,
        description: roadmap.description,
        version,
        isActive: true,
        estimatedDuration: roadmap.estimatedDuration,
      },
      select: { id: true },
    });

    // Any other version for this career stands down, so exactly one is active.
    await db.roadmap.updateMany({
      where: { careerId: career.id, id: { not: created.id } },
      data: { isActive: false },
    });

    /** Topic slug → database id, for wiring prerequisites afterwards. */
    const topicIds = new Map<string, string>();

    for (const [phaseIndex, phase] of roadmap.phases.entries()) {
      const createdPhase = await db.roadmapPhase.create({
        data: {
          roadmapId: created.id,
          title: phase.title,
          description: phase.description,
          order: phaseIndex + 1,
          estimatedDuration: phase.estimatedDuration,
          kind: phase.kind ?? "LEARNING",
          whyThisComesNext: phase.whyThisComesNext,
        },
        select: { id: true },
      });

      for (const [topicIndex, topic] of phase.topics.entries()) {
        const createdTopic = await db.topic.create({
          data: {
            phaseId: createdPhase.id,
            slug: topic.slug,
            title: topic.title,
            description: topic.description,
            order: topicIndex + 1,
            difficulty: topic.difficulty,
            estimatedTime: topic.estimatedTime,
            isRequired: topic.isRequired ?? true,
          },
          select: { id: true },
        });

        topicIds.set(topic.slug, createdTopic.id);
      }
    }

    // Prerequisites last: every topic in the roadmap now exists.
    for (const phase of roadmap.phases) {
      for (const topic of phase.topics) {
        for (const prerequisiteSlug of topic.prerequisites ?? []) {
          await db.topicPrerequisite.create({
            data: {
              topicId: topicIds.get(topic.slug)!,
              prerequisiteId: topicIds.get(prerequisiteSlug)!,
            },
          });
        }
      }
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
