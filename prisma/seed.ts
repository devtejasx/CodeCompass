import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import type { CapabilitySourceKind } from "../src/generated/prisma/client";
// The Git exercises live in code rather than in the database — see the note in
// src/lib/git/exercises — so the capability validator gets their slugs here.
import { GIT_EXERCISE_SLUGS } from "../src/lib/git/exercises";
import { CAREERS } from "./seed/careers";
import { ROADMAPS } from "./seed/roadmaps";
import { assertValidRoadmaps } from "./seed/roadmaps/validate";
import { LESSONS } from "./seed/lessons";
import { ACADEMY_LESSONS, ACADEMY_ROADMAPS } from "./seed/academy";
import {
  assertDestructiveSeedAllowed,
  countLearnerDataAtRisk,
  describeLearnerDataAtRisk,
  DestructiveSeedBlocked,
} from "./seed/guard";
import { positionOptions } from "./seed/lessons/shuffle";
import { assertValidLessons } from "./seed/lessons/validate";
import { PROBLEMS } from "./seed/problems";
import { assertValidProblems } from "./seed/problems/validate";
import { renderSource, renderStarter } from "./seed/problems/starter";
import type { SeedLanguage } from "./seed/problems/types";
import { PROJECTS } from "./seed/projects";
import { assertValidProjects } from "./seed/projects/validate";
import {
  AI_ACADEMY_LESSONS,
  AI_ACADEMY_ROADMAPS,
  AI_CATEGORIES,
  AI_TOOLS,
  AI_WORKFLOWS,
  CAREER_AI_TOOLS,
} from "./seed/ai";
import { assertValidAIContent } from "./seed/ai/validate";
import { CAPABILITIES } from "./seed/capabilities";
import { assertValidCapabilities } from "./seed/capabilities/validate";

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
  // ── Safety ──────────────────────────────────────────────────────────────
  // First, before a single write. Seeding rebuilds the catalog, and catalog
  // rows cascade into learner progress — see ./seed/guard.ts.
  assertDestructiveSeedAllowed(process.env);

  const atRisk = await countLearnerDataAtRisk(db);
  const warning = describeLearnerDataAtRisk(atRisk);
  if (warning) {
    console.warn(`\n${warning}\n`);
  }

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
  // Last: the AI tool catalog links its learning paths to topics, so every
  // roadmap must already exist.
  await seedAITools();
  // Later still: capabilities reference topics, projects, exercises, tools and
  // workflows, so everything they can point at has to exist first.
  await seedCapabilities();

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

  const [aiCategories, aiTools, aiPaths, aiPathLessons, aiWorkflows, careerLinks] =
    await Promise.all([
      db.aIToolCategory.count(),
      db.aITool.count(),
      db.aIToolLearningPath.count(),
      db.aIToolLesson.count(),
      db.aIWorkflow.count(),
      db.careerAITool.count(),
    ]);

  console.log(
    `Seeded ${aiCategories} AI categories, ${aiTools} AI tools, ` +
      `${aiPaths} learning paths, ${aiPathLessons} path lessons, ` +
      `${aiWorkflows} workflows, ${careerLinks} career→tool links.`,
  );

  const [capabilities, capabilitySources] = await Promise.all([
    db.capability.count(),
    db.capabilitySource.count(),
  ]);

  console.log(
    `Seeded ${capabilities} capabilities with ${capabilitySources} evidence sources.`,
  );
}

/**
 * Replaces the capability catalog.
 *
 * Sources are deleted and recreated because `order` comes from array position,
 * and the Capability row itself is upserted rather than deleted — although in
 * this case nothing user-owned cascades from it, because there is no stored
 * evidence to lose. Evidence is derived on read from the learner's actual
 * progress, which is the whole point: re-seeding the catalog cannot alter
 * anybody's record of what they have done.
 *
 * Every `ref` is resolved against real content before anything is written. A
 * slug naming nothing fails the seed loudly rather than producing a capability
 * that could never be earned — the guarantee a foreign key would have given,
 * enforced at authoring time because nothing at runtime writes these rows.
 */
async function seedCapabilities() {
  assertValidCapabilities(CAPABILITIES);

  const [topics, projects, aiTools, aiWorkflows] = await Promise.all([
    db.topic.findMany({ select: { slug: true } }),
    db.project.findMany({ select: { slug: true } }),
    db.aITool.findMany({ select: { slug: true } }),
    db.aIWorkflow.findMany({ select: { slug: true } }),
  ]);

  assertValidCapabilities(CAPABILITIES, {
    topicSlugs: new Set(topics.map((topic) => topic.slug)),
    projectSlugs: new Set(projects.map((project) => project.slug)),
    gitExerciseSlugs: new Set(GIT_EXERCISE_SLUGS),
    aiToolSlugs: new Set(aiTools.map((tool) => tool.slug)),
    aiWorkflowSlugs: new Set(aiWorkflows.map((workflow) => workflow.slug)),
  });

  for (const [index, capability] of CAPABILITIES.entries()) {
    const data = {
      name: capability.name,
      description: capability.description,
      longDescription: capability.longDescription,
      category: capability.category,
      icon: capability.icon,
      sortOrder: index,
    };

    const row = await db.capability.upsert({
      where: { slug: capability.slug },
      create: { slug: capability.slug, ...data },
      update: data,
      select: { id: true },
    });

    await db.capabilitySource.deleteMany({ where: { capabilityId: row.id } });

    const sources: { kind: CapabilitySourceKind; ref: string }[] = [
      ...(capability.topics ?? []).map((ref) => ({
        kind: "TOPIC" as const,
        ref,
      })),
      ...(capability.practiceTopics ?? []).map((ref) => ({
        kind: "PRACTICE_TOPIC" as const,
        ref,
      })),
      ...(capability.projects ?? []).map((ref) => ({
        kind: "PROJECT" as const,
        ref,
      })),
      ...(capability.gitExercises ?? []).map((ref) => ({
        kind: "GIT_EXERCISE" as const,
        ref,
      })),
      ...(capability.aiTools ?? []).map((ref) => ({
        kind: "AI_TOOL" as const,
        ref,
      })),
      ...(capability.aiWorkflows ?? []).map((ref) => ({
        kind: "AI_WORKFLOW" as const,
        ref,
      })),
    ];

    if (sources.length > 0) {
      await db.capabilitySource.createMany({
        data: sources.map((source, order) => ({
          capabilityId: row.id,
          kind: source.kind,
          ref: source.ref,
          order,
        })),
      });
    }
  }
}

/**
 * Replaces the AI tool catalog wholesale.
 *
 * Same reasoning as every other content seeder: capabilities, use cases,
 * resources and path lessons derive their `order` from array position, so a
 * reordering has to be able to drop the old rows or the unique constraints
 * would fight it.
 *
 * The AITool row itself is upserted rather than deleted, so learner progress
 * survives a content edit — UserAIToolProgress cascades from AITool, and
 * wiping somebody's progress because a limitation was reworded would be
 * indefensible. Learning paths *are* replaced, which is deliberate: a path is
 * an ordering, and progress lives on the Topic behind each step rather than on
 * the step, so re-seeding a path loses nothing a learner did.
 *
 * A tool removed from the catalog does lose its progress rows, which is
 * correct — but the intended way to retire a tool is `status: "DEPRECATED"`
 * with a successor, not deletion. See seed/ai/tools-coding.ts for the worked
 * example.
 */
async function seedAITools() {
  assertValidAIContent({
    categories: AI_CATEGORIES,
    tools: AI_TOOLS,
    workflows: AI_WORKFLOWS,
    careerTools: CAREER_AI_TOOLS,
  });

  // ── Categories ──────────────────────────────────────────────────────────
  for (const [index, category] of AI_CATEGORIES.entries()) {
    const data = {
      name: category.name,
      description: category.description,
      icon: category.icon,
      order: index,
    };

    await db.aIToolCategory.upsert({
      where: { slug: category.slug },
      create: { slug: category.slug, ...data },
      update: data,
    });
  }

  // ── Tools ───────────────────────────────────────────────────────────────
  for (const [index, tool] of AI_TOOLS.entries()) {
    const category = await db.aIToolCategory.findUniqueOrThrow({
      where: { slug: tool.categorySlug },
      select: { id: true },
    });

    const existing = await db.aITool.findUnique({
      where: { slug: tool.slug },
      select: { id: true },
    });

    if (existing) {
      await db.aIToolCapability.deleteMany({ where: { toolId: existing.id } });
      await db.aIToolUseCase.deleteMany({ where: { toolId: existing.id } });
      await db.aIToolResource.deleteMany({ where: { toolId: existing.id } });
      await db.aIToolLearningPath.deleteMany({ where: { toolId: existing.id } });
      await db.careerAITool.deleteMany({ where: { toolId: existing.id } });
      await db.aIWorkflowTool.deleteMany({ where: { toolId: existing.id } });
    }

    const data = {
      name: tool.name,
      description: tool.description,
      longDescription: tool.longDescription,
      whatItIs: tool.whatItIs,
      whenToUse: tool.whenToUse,
      whenNotToUse: tool.whenNotToUse,
      limitations: tool.limitations,
      howDevelopersUseIt: tool.howDevelopersUseIt,
      officialUrl: tool.officialUrl,
      docsUrl: tool.docsUrl ?? null,
      categoryId: category.id,
      status: tool.status ?? ("ACTIVE" as const),
      difficulty: tool.difficulty,
      primaryUse: tool.primaryUse,
      environments: tool.environments,
      iconIdentifier: tool.icon,
      // Parsed from the authored ISO date rather than `new Date()`: this
      // records when a human checked the record, not when the seed last ran.
      lastVerifiedAt: new Date(`${tool.verifiedOn}T00:00:00.000Z`),
      verificationSource: tool.verificationSource,
      supersededBySlug: tool.supersededBySlug ?? null,
      statusNote: tool.statusNote ?? null,
      sortOrder: index,
    };

    const row = await db.aITool.upsert({
      where: { slug: tool.slug },
      create: { slug: tool.slug, ...data },
      update: data,
      select: { id: true },
    });

    for (const [order, capability] of tool.capabilities.entries()) {
      await db.aIToolCapability.create({
        data: {
          toolId: row.id,
          capability: capability.capability,
          detail: capability.detail ?? null,
          order: order + 1,
        },
      });
    }

    for (const [order, useCase] of tool.useCases.entries()) {
      await db.aIToolUseCase.create({
        data: {
          toolId: row.id,
          useCase: useCase.useCase,
          note: useCase.note,
          order: order + 1,
        },
      });
    }

    for (const [order, resource] of tool.resources.entries()) {
      await db.aIToolResource.create({
        data: {
          toolId: row.id,
          title: resource.title,
          url: resource.url,
          type: resource.type,
          description: resource.description ?? null,
          source: resource.source,
          order: order + 1,
        },
      });
    }

    const path = tool.learningPath;
    const createdPath = await db.aIToolLearningPath.create({
      data: {
        toolId: row.id,
        slug: path.slug,
        title: path.title,
        description: path.description,
        difficulty: path.difficulty,
        estimatedTime: path.estimatedTime,
        order: 0,
      },
      select: { id: true },
    });

    for (const [order, lesson] of path.lessons.entries()) {
      let topicId: string | null = null;

      if (lesson.topicSlug) {
        const topic = await db.topic.findUnique({
          where: { slug: lesson.topicSlug },
          select: { id: true },
        });

        // A typo here would silently produce a path step that teaches nothing.
        if (!topic) {
          throw new Error(
            `AI tool "${tool.slug}" path step "${lesson.title}" targets topic "${lesson.topicSlug}", which is not in any roadmap.`,
          );
        }

        topicId = topic.id;
      }

      await db.aIToolLesson.create({
        data: {
          learningPathId: createdPath.id,
          title: lesson.title,
          description: lesson.description,
          estimatedTime: lesson.estimatedTime,
          topicId,
          order: order + 1,
        },
      });
    }
  }

  // ── Workflows ───────────────────────────────────────────────────────────
  for (const [index, workflow] of AI_WORKFLOWS.entries()) {
    const existing = await db.aIWorkflow.findUnique({
      where: { slug: workflow.slug },
      select: { id: true },
    });

    if (existing) {
      await db.aIWorkflowStep.deleteMany({ where: { workflowId: existing.id } });
      await db.aIWorkflowPrompt.deleteMany({ where: { workflowId: existing.id } });
      await db.aIWorkflowTool.deleteMany({ where: { workflowId: existing.id } });
    }

    const data = {
      title: workflow.title,
      goal: workflow.goal,
      summary: workflow.summary,
      category: workflow.category,
      difficulty: workflow.difficulty,
      estimatedTime: workflow.estimatedTime,
      whatToVerify: workflow.whatToVerify,
      commonMistakes: workflow.commonMistakes,
      sortOrder: index,
    };

    const row = await db.aIWorkflow.upsert({
      where: { slug: workflow.slug },
      create: { slug: workflow.slug, ...data },
      update: data,
      select: { id: true },
    });

    for (const [order, step] of workflow.steps.entries()) {
      await db.aIWorkflowStep.create({
        data: {
          workflowId: row.id,
          title: step.title,
          detail: step.detail,
          isHumanStep: step.isHumanStep ?? true,
          order: order + 1,
        },
      });
    }

    for (const [order, prompt] of workflow.prompts.entries()) {
      await db.aIWorkflowPrompt.create({
        data: {
          workflowId: row.id,
          label: prompt.label,
          goal: prompt.goal,
          context: prompt.context,
          request: prompt.request,
          whyItWorks: prompt.whyItWorks,
          order: order + 1,
        },
      });
    }

    for (const [order, toolSlug] of workflow.toolSlugs.entries()) {
      const tool = await db.aITool.findUniqueOrThrow({
        where: { slug: toolSlug },
        select: { id: true },
      });

      await db.aIWorkflowTool.create({
        data: { workflowId: row.id, toolId: tool.id, sortOrder: order },
      });
    }
  }

  // ── Career recommendations ──────────────────────────────────────────────
  for (const entry of CAREER_AI_TOOLS) {
    const career = await db.career.findUnique({
      where: { slug: entry.careerSlug },
      select: { id: true },
    });

    // A typo in careerSlug would silently drop the whole set of
    // recommendations for that path.
    if (!career) {
      throw new Error(
        `AI tool recommendations target career "${entry.careerSlug}", which is not in the catalog.`,
      );
    }

    await db.careerAITool.deleteMany({ where: { careerId: career.id } });

    for (const [order, link] of entry.tools.entries()) {
      const tool = await db.aITool.findUniqueOrThrow({
        where: { slug: link.toolSlug },
        select: { id: true },
      });

      await db.careerAITool.create({
        data: {
          careerId: career.id,
          toolId: tool.id,
          useCase: link.useCase,
          reason: link.reason,
          sortOrder: order,
        },
      });
    }
  }
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
  const all = [...LESSONS, ...ACADEMY_LESSONS, ...AI_ACADEMY_LESSONS];
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

      // Rotated, not stored as authored: lessons are written with the answer
      // first so they can be reviewed, and seeding that verbatim made "always
      // pick option one" a correct strategy for the entire curriculum. See
      // ./seed/lessons/shuffle.ts.
      for (const [optionIndex, option] of positionOptions(check).entries()) {
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
  const all = [...ROADMAPS, ...ACADEMY_ROADMAPS, ...AI_ACADEMY_ROADMAPS];
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
    // A blocked seed is a correct outcome, not a crash. It gets its message
    // without a stack trace, because the stack tells the reader nothing and
    // buries the part explaining what to do instead.
    if (error instanceof DestructiveSeedBlocked) {
      console.error(`\n${error.message}\n`);
    } else {
      console.error(error);
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
