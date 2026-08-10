import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { CAREERS } from "./seed/careers";
import { ROADMAPS } from "./seed/roadmaps";
import { assertValidRoadmaps } from "./seed/roadmaps/validate";
import { LESSONS } from "./seed/lessons";
import { ACADEMY_LESSONS, ACADEMY_ROADMAPS } from "./seed/academy";
import { assertValidLessons } from "./seed/lessons/validate";
import { PROBLEMS } from "./seed/problems";
import { assertValidProblems } from "./seed/problems/validate";
import { renderSource, renderStarter } from "./seed/problems/starter";
import type { SeedLanguage } from "./seed/problems/types";
import { PROJECTS } from "./seed/projects";
import { assertValidProjects } from "./seed/projects/validate";

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
  await seedProblems();
  await seedProjects();

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

  const [problems, testCases, problemLanguages, problemTopics] = await Promise.all([
    db.practiceProblem.count(),
    db.practiceTestCase.count(),
    db.practiceLanguage.count(),
    db.problemTopic.count(),
  ]);

  console.log(
    `Seeded ${careers} careers, ${roadmaps} roadmaps, ${phases} phases, ` +
      `${topics} topics, ${lessons} lessons, ${sections} sections, ` +
      `${checks} knowledge checks.`,
  );
  console.log(
    `Seeded ${problems} practice problems, ${problemLanguages} language configs, ` +
      `${testCases} test cases, ${problemTopics} problem→topic links.`,
  );

  const [projects, requirements, milestones, projectConcepts] = await Promise.all([
    db.project.count(),
    db.projectRequirement.count(),
    db.projectMilestone.count(),
    db.projectConcept.count(),
  ]);

  console.log(
    `Seeded ${projects} projects, ${requirements} requirements, ` +
      `${milestones} milestones, ${projectConcepts} project→topic links.`,
  );
}

/**
 * Replaces each authored project's content wholesale.
 *
 * Same reasoning as lessons and problems: requirements, milestones and the rest
 * derive their `order` from array position, so a reordering has to be able to
 * drop the old rows or the unique (projectId, order) constraints would fight it.
 *
 * The Project row itself is updated rather than deleted, so learner data
 * survives a content edit — UserProject cascades from Project, and blowing it
 * away because a description was reworded would be indefensible.
 *
 * Milestone ticks are the exception: UserProjectMilestone references
 * ProjectMilestone, which is replaced. Re-seeding therefore clears milestone
 * progress, which is acceptable while content is still being authored and is
 * recorded as debt in the README.
 */
async function seedProjects() {
  assertValidProjects(PROJECTS);

  for (const [index, project] of PROJECTS.entries()) {
    /** Topic slug → id, resolved before any write so a typo fails loudly. */
    const conceptIds = new Map<string, boolean>();

    for (const slug of project.prerequisiteTopicSlugs) {
      conceptIds.set(slug, true);
    }
    for (const slug of project.relatedTopicSlugs ?? []) {
      conceptIds.set(slug, false);
    }

    const topics = new Map<string, string>();
    for (const slug of conceptIds.keys()) {
      const topic = await db.topic.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!topic) {
        throw new Error(
          `Project "${project.slug}" targets topic "${slug}", which is not in any roadmap.`,
        );
      }

      topics.set(slug, topic.id);
    }

    const existing = await db.project.findUnique({
      where: { slug: project.slug },
      select: { id: true },
    });

    if (existing) {
      await db.projectRequirement.deleteMany({ where: { projectId: existing.id } });
      await db.projectMilestone.deleteMany({ where: { projectId: existing.id } });
      await db.projectTechnology.deleteMany({ where: { projectId: existing.id } });
      await db.projectHint.deleteMany({ where: { projectId: existing.id } });
      await db.projectResource.deleteMany({ where: { projectId: existing.id } });
      await db.projectConcept.deleteMany({ where: { projectId: existing.id } });
    }

    const data = {
      title: project.title,
      shortDescription: project.shortDescription,
      description: project.description,
      difficulty: project.difficulty,
      type: project.type,
      estimatedDuration: project.estimatedDuration,
      whyBuildThis: project.whyBuildThis,
      whatYouBuild: project.whatYouBuild,
      sortOrder: index,
    };

    const row = await db.project.upsert({
      where: { slug: project.slug },
      create: { slug: project.slug, ...data },
      update: data,
      select: { id: true },
    });

    for (const [order, requirement] of project.requirements.entries()) {
      await db.projectRequirement.create({
        data: {
          projectId: row.id,
          title: requirement.title,
          description: requirement.description,
          category: requirement.category ?? "FUNCTIONAL",
          isRequired: requirement.isRequired ?? true,
          order: order + 1,
        },
      });
    }

    for (const [order, milestone] of project.milestones.entries()) {
      await db.projectMilestone.create({
        data: {
          projectId: row.id,
          title: milestone.title,
          description: milestone.description,
          estimatedTime: milestone.estimatedTime,
          concepts: milestone.concepts ?? [],
          order: order + 1,
        },
      });
    }

    for (const [order, technology] of project.technologies.entries()) {
      await db.projectTechnology.create({
        data: {
          projectId: row.id,
          name: technology.name,
          category: technology.category,
          order: order + 1,
        },
      });
    }

    for (const [order, hint] of project.hints.entries()) {
      await db.projectHint.create({
        data: {
          projectId: row.id,
          title: hint.title,
          content: hint.content,
          order: order + 1,
        },
      });
    }

    for (const [order, resource] of project.resources.entries()) {
      await db.projectResource.create({
        data: {
          projectId: row.id,
          title: resource.title,
          url: resource.url,
          source: resource.source,
          type: resource.type ?? "DOCUMENTATION",
          order: order + 1,
        },
      });
    }

    for (const [slug, isPrerequisite] of conceptIds) {
      await db.projectConcept.create({
        data: {
          projectId: row.id,
          topicId: topics.get(slug)!,
          isPrerequisite,
        },
      });
    }
  }
}

/**
 * Replaces each authored problem wholesale.
 *
 * Same reasoning as lessons: examples and test cases derive their `order` from
 * array position, so a reordering has to be able to drop the old rows or the
 * unique (problemId, order) constraints would fight it. Deleting the problem
 * cascades to examples, test cases, language configs and topic links.
 *
 * Learner data is NOT wiped: UserProblemProgress and Submission cascade from
 * PracticeProblem, so a problem whose slug survives keeps its progress. Removing
 * a problem from the catalog does remove the progress that pointed at it, which
 * is the correct behaviour — there is nothing left to have solved.
 */
async function seedProblems() {
  assertValidProblems(PROBLEMS);

  for (const [index, problem] of PROBLEMS.entries()) {
    const topicIds: string[] = [];

    for (const topicSlug of problem.topicSlugs) {
      const topic = await db.topic.findUnique({
        where: { slug: topicSlug },
        select: { id: true },
      });

      // A typo in topicSlugs would silently make the problem unrecommendable.
      if (!topic) {
        throw new Error(
          `Problem "${problem.slug}" targets topic "${topicSlug}", which is not in any roadmap.`,
        );
      }

      topicIds.push(topic.id);
    }

    const existing = await db.practiceProblem.findUnique({
      where: { slug: problem.slug },
      select: { id: true },
    });

    if (existing) {
      // Content is replaced; progress and submissions survive because the
      // problem row itself is updated rather than deleted.
      await db.practiceExample.deleteMany({ where: { problemId: existing.id } });
      await db.practiceTestCase.deleteMany({ where: { problemId: existing.id } });
      await db.practiceLanguage.deleteMany({ where: { problemId: existing.id } });
      await db.problemTopic.deleteMany({ where: { problemId: existing.id } });
    }

    const data = {
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      explanation: problem.explanation,
      constraints: problem.constraints,
      hints: problem.hints,
      functionName: problem.signature.name,
      timeLimitMs: problem.timeLimitMs ?? 2000,
      memoryLimitMb: problem.memoryLimitMb ?? 128,
      estimatedTime: problem.estimatedTime,
      sortOrder: index,
    };

    const row = await db.practiceProblem.upsert({
      where: { slug: problem.slug },
      create: { slug: problem.slug, ...data },
      update: data,
      select: { id: true },
    });

    for (const [order, example] of problem.examples.entries()) {
      await db.practiceExample.create({
        data: {
          problemId: row.id,
          input: example.input,
          output: example.output,
          explanation: example.explanation ?? null,
          order: order + 1,
        },
      });
    }

    for (const [order, test] of problem.tests.entries()) {
      await db.practiceTestCase.create({
        data: {
          problemId: row.id,
          // The harness contract: arguments as a JSON array, expected as a
          // JSON value. Language-agnostic on purpose.
          input: JSON.stringify(test.args),
          expectedOutput: JSON.stringify(test.expected),
          isHidden: test.hidden ?? false,
          order: order + 1,
        },
      });
    }

    for (const language of Object.keys(problem.solutions) as SeedLanguage[]) {
      await db.practiceLanguage.create({
        data: {
          problemId: row.id,
          language,
          starterCode: renderStarter(problem.signature, language),
          solutionTemplate: renderSource(
            problem.signature,
            language,
            problem.solutions[language]!,
          ),
        },
      });
    }

    for (const topicId of topicIds) {
      await db.problemTopic.create({ data: { problemId: row.id, topicId } });
    }
  }
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
  const all = [...LESSONS, ...ACADEMY_LESSONS];
  assertValidLessons(all);

  for (const lesson of all) {
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
  const all = [...ROADMAPS, ...ACADEMY_ROADMAPS];
  assertValidRoadmaps(all);

  for (const roadmap of all) {
    const isAcademy = (roadmap.kind ?? "CAREER") === "ACADEMY";

    // A career roadmap is identified by its career; an academy by its own slug.
    let careerId: string | null = null;

    if (!isAcademy) {
      const career = await db.career.findUnique({
        where: { slug: roadmap.careerSlug },
        select: { id: true },
      });

      if (!career) {
        throw new Error(
          `Roadmap "${roadmap.title}" targets career "${roadmap.careerSlug}", which is not in the catalog.`,
        );
      }

      careerId = career.id;
    }

    const version = roadmap.version ?? 1;

    // Replacing the whole version keeps ordering authoritative. The two kinds
    // are deleted by different keys, so they are two statements rather than one
    // clever ternary TypeScript cannot narrow.
    if (isAcademy) {
      await db.roadmap.deleteMany({ where: { slug: roadmap.slug } });
    } else {
      await db.roadmap.deleteMany({ where: { careerId: careerId!, version } });
    }

    const created = await db.roadmap.create({
      data: {
        careerId,
        kind: isAcademy ? "ACADEMY" : "CAREER",
        slug: isAcademy ? roadmap.slug : null,
        title: roadmap.title,
        description: roadmap.description,
        version,
        isActive: true,
        estimatedDuration: roadmap.estimatedDuration,
      },
      select: { id: true },
    });

    // Any other version for this career stands down, so exactly one is active.
    // Academy roadmaps have no sibling versions to retire.
    if (!isAcademy) {
      await db.roadmap.updateMany({
        where: { careerId: careerId!, id: { not: created.id } },
        data: { isActive: false },
      });
    }

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
