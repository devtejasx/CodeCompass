import { cache } from "react";

import { db } from "@/lib/db";
import { GIT_EXERCISE_SLUGS } from "@/lib/git/exercises";
import type { CapabilityCategory, CapabilityLevel } from "@/generated/prisma/client";

import { calculateLevel, emptyEvidence, nextLevelHint, type CapabilityEvidence } from "./levels";

/**
 * Capability evidence, assembled from what the learner has actually done.
 *
 * There is no stored evidence table. A capability's sources are authored
 * content; a learner's evidence is the intersection of those sources with their
 * real progress, computed on read. Completing a lesson changes the level on the
 * next page load, with nothing to invalidate and no possibility of the profile
 * disagreeing with the progress tables it is summarising.
 *
 * The cost is that this file has to be careful about queries. It is: everything
 * is loaded in a fixed number of bulk reads — nineteen capabilities do not
 * produce nineteen round trips — and the intersection happens in memory against
 * maps built once.
 */

export interface CapabilityView {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  category: CapabilityCategory;
  icon: string;
  sortOrder: number;

  level: CapabilityLevel | null;
  evidence: CapabilityEvidence;
  /** The next rung and what would reach it. Null at the top. */
  next: { level: CapabilityLevel; requirement: string } | null;
}

/** One named piece of evidence, for the detail page. */
export interface EvidenceItem {
  kind: "TOPIC" | "PRACTICE" | "PROJECT" | "GIT" | "AI_TOOL" | "AI_WORKFLOW";
  title: string;
  /** Where to go and see it. Null when the item has no page. */
  href: string | null;
  done: boolean;
}

/**
 * Every capability, with this learner's evidence folded in.
 *
 * Six bulk reads regardless of how many capabilities exist. The alternative —
 * asking per capability — would be nineteen queries on the profile page today
 * and more with every capability added, which is exactly the N+1 the profile
 * is most at risk of.
 */
export const getCapabilities = cache(async function getCapabilities(
  userId: string,
): Promise<CapabilityView[]> {
  const capabilities = await db.capability.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      slug: true,
      name: true,
      description: true,
      longDescription: true,
      category: true,
      icon: true,
      sortOrder: true,
      sources: {
        orderBy: { order: "asc" },
        select: { kind: true, ref: true },
      },
    },
  });

  const progress = await loadProgress(userId, capabilities);

  return capabilities.map((capability) => {
    const evidence = countEvidence(capability.sources, progress);
    const level = calculateLevel(evidence);

    return {
      slug: capability.slug,
      name: capability.name,
      description: capability.description,
      longDescription: capability.longDescription,
      category: capability.category,
      icon: capability.icon,
      sortOrder: capability.sortOrder,
      level,
      evidence,
      next: nextLevelHint(level, evidence),
    };
  });
});

/**
 * How many capabilities this learner has reached a level in.
 *
 * The dashboard shows this as a single number next to four others, and asking
 * `getCapabilities` for it meant loading every capability's `description` and
 * `longDescription` — several kilobytes of authored prose — into a server render
 * that discards all of it. The levels themselves genuinely need the evidence, so
 * the progress reads are the same ones; what this drops is the payload, and it
 * shares `loadProgress`, `countEvidence` and `calculateLevel` so the count can
 * never disagree with the profile page it links to.
 */
export const countEarnedCapabilities = cache(async function countEarnedCapabilities(
  userId: string,
): Promise<{ earned: number; total: number }> {
  const capabilities = await db.capability.findMany({
    select: { sources: { select: { kind: true, ref: true } } },
  });

  const progress = await loadProgress(userId, capabilities);

  const earned = capabilities.filter(
    (capability) => calculateLevel(countEvidence(capability.sources, progress)) !== null,
  ).length;

  return { earned, total: capabilities.length };
});

/** One capability in full, with each piece of evidence named. */
export async function getCapabilityDetail(userId: string, slug: string) {
  const capability = await db.capability.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      description: true,
      longDescription: true,
      category: true,
      icon: true,
      sortOrder: true,
      sources: {
        orderBy: { order: "asc" },
        select: { kind: true, ref: true },
      },
    },
  });

  if (!capability) return null;

  const progress = await loadProgress(userId, [capability]);
  const evidence = countEvidence(capability.sources, progress);
  const level = calculateLevel(evidence);

  /** Each source resolved to a title, a link and whether it is done. */
  const items: EvidenceItem[] = [];

  for (const source of capability.sources) {
    switch (source.kind) {
      case "TOPIC": {
        const topic = progress.topicsBySlug.get(source.ref);
        if (!topic) break;
        items.push({
          kind: "TOPIC",
          title: topic.title,
          href: topic.hasLesson ? `/learn/${source.ref}` : "/roadmap",
          done: progress.completedTopicIds.has(topic.id),
        });
        break;
      }
      case "PRACTICE_TOPIC": {
        // Practice is attached by topic, so the evidence item is each problem
        // on that topic rather than the topic itself.
        for (const problem of progress.problemsByTopicSlug.get(source.ref) ?? []) {
          if (items.some((item) => item.kind === "PRACTICE" && item.title === problem.title)) {
            continue;
          }
          items.push({
            kind: "PRACTICE",
            title: problem.title,
            href: `/practice/${problem.slug}`,
            done: progress.solvedProblemIds.has(problem.id),
          });
        }
        break;
      }
      case "PROJECT": {
        const project = progress.projectsBySlug.get(source.ref);
        if (!project) break;
        items.push({
          kind: "PROJECT",
          title: project.title,
          href: `/projects/${source.ref}`,
          done: progress.completedProjectIds.has(project.id),
        });
        break;
      }
      case "GIT_EXERCISE": {
        items.push({
          kind: "GIT",
          title: gitExerciseTitle(source.ref),
          href: "/academy/git",
          done: progress.completedGitExercises.has(source.ref),
        });
        break;
      }
      case "AI_TOOL": {
        const tool = progress.aiToolsBySlug.get(source.ref);
        if (!tool) break;
        items.push({
          kind: "AI_TOOL",
          title: tool.name,
          href: `/academy/ai-tools/${source.ref}`,
          done: progress.completedAIToolIds.has(tool.id),
        });
        break;
      }
      case "AI_WORKFLOW": {
        const workflow = progress.aiWorkflowsBySlug.get(source.ref);
        if (!workflow) break;
        items.push({
          kind: "AI_WORKFLOW",
          title: workflow.title,
          href: `/academy/ai-tools/workflows/${source.ref}`,
          done: progress.completedAIWorkflowIds.has(workflow.id),
        });
        break;
      }
    }
  }

  return {
    ...capability,
    level,
    evidence,
    next: nextLevelHint(level, evidence),
    // Completed first: the profile's job is to show what somebody can do, and
    // burying their evidence under a list of things they have not done yet
    // inverts that.
    items: dedupeByTitle(items).sort((a, b) => Number(b.done) - Number(a.done)),
  };
}

/**
 * Collapses evidence that shares a title.
 *
 * Capabilities span roadmaps on purpose — `responsive-design` on the frontend
 * path and `fs-responsive` on the full-stack one teach the same thing, and
 * listing both means whichever a learner followed counts. They are different
 * topics, but to a reader they are one line, and showing "Responsive design"
 * twice looks like a rendering fault rather than thoroughness.
 *
 * Done wins: covering the concept on either path is covering the concept.
 */
function dedupeByTitle(items: EvidenceItem[]): EvidenceItem[] {
  const byKey = new Map<string, EvidenceItem>();

  for (const item of items) {
    const key = `${item.kind}:${item.title}`;
    const existing = byKey.get(key);

    if (!existing) {
      byKey.set(key, item);
      continue;
    }

    // Keep the one the learner has actually done, and its link with it.
    if (item.done && !existing.done) byKey.set(key, item);
  }

  return [...byKey.values()];
}

export type CapabilityDetail = NonNullable<
  Awaited<ReturnType<typeof getCapabilityDetail>>
>;

/** Everything the intersection needs, loaded once. */
interface ProgressMaps {
  topicsBySlug: Map<string, { id: string; title: string; hasLesson: boolean }>;
  completedTopicIds: Set<string>;
  inProgressTopicIds: Set<string>;
  problemsByTopicSlug: Map<string, { id: string; slug: string; title: string }[]>;
  solvedProblemIds: Set<string>;
  attemptedProblemIds: Set<string>;
  projectsBySlug: Map<string, { id: string; title: string }>;
  completedProjectIds: Set<string>;
  inProgressProjectIds: Set<string>;
  completedGitExercises: Set<string>;
  aiToolsBySlug: Map<string, { id: string; name: string }>;
  completedAIToolIds: Set<string>;
  aiWorkflowsBySlug: Map<string, { id: string; title: string }>;
  completedAIWorkflowIds: Set<string>;
}

/**
 * Loads only the content the given capabilities actually reference, plus this
 * learner's progress against it.
 *
 * Narrowing by the referenced slugs matters: the profile must not load every
 * lesson and every coding problem in the catalog to render nineteen cards.
 */
async function loadProgress(
  userId: string,
  capabilities: { sources: { kind: string; ref: string }[] }[],
): Promise<ProgressMaps> {
  const refs = (kind: string) => [
    ...new Set(
      capabilities.flatMap((capability) =>
        capability.sources.filter((s) => s.kind === kind).map((s) => s.ref),
      ),
    ),
  ];

  const topicSlugs = [...new Set([...refs("TOPIC"), ...refs("PRACTICE_TOPIC")])];
  const practiceTopicSlugs = refs("PRACTICE_TOPIC");
  const projectSlugs = refs("PROJECT");
  const gitSlugs = refs("GIT_EXERCISE");
  const toolSlugs = refs("AI_TOOL");
  const workflowSlugs = refs("AI_WORKFLOW");

  const [topics, practiceLinks, projects, tools, workflows] = await Promise.all([
    topicSlugs.length
      ? db.topic.findMany({
          where: { slug: { in: topicSlugs } },
          select: { id: true, slug: true, title: true, lesson: { select: { id: true } } },
        })
      : Promise.resolve([]),
    practiceTopicSlugs.length
      ? db.problemTopic.findMany({
          where: { topic: { slug: { in: practiceTopicSlugs } } },
          select: {
            topic: { select: { slug: true } },
            problem: { select: { id: true, slug: true, title: true } },
          },
        })
      : Promise.resolve([]),
    projectSlugs.length
      ? db.project.findMany({
          where: { slug: { in: projectSlugs } },
          select: { id: true, slug: true, title: true },
        })
      : Promise.resolve([]),
    toolSlugs.length
      ? db.aITool.findMany({
          where: { slug: { in: toolSlugs } },
          select: { id: true, slug: true, name: true },
        })
      : Promise.resolve([]),
    workflowSlugs.length
      ? db.aIWorkflow.findMany({
          where: { slug: { in: workflowSlugs } },
          select: { id: true, slug: true, title: true },
        })
      : Promise.resolve([]),
  ]);

  const topicIds = topics.map((topic) => topic.id);
  const problemIds = [...new Set(practiceLinks.map((link) => link.problem.id))];
  const projectIds = projects.map((project) => project.id);
  const toolIds = tools.map((tool) => tool.id);
  const workflowIds = workflows.map((workflow) => workflow.id);

  const [topicProgress, problemProgress, projectProgress, gitProgress, toolProgress, workflowProgress] =
    await Promise.all([
      topicIds.length
        ? db.userTopicProgress.findMany({
            where: { userId, topicId: { in: topicIds } },
            select: { topicId: true, status: true },
          })
        : Promise.resolve([]),
      problemIds.length
        ? db.userProblemProgress.findMany({
            where: { userId, problemId: { in: problemIds } },
            select: { problemId: true, status: true },
          })
        : Promise.resolve([]),
      projectIds.length
        ? db.userProject.findMany({
            where: { userId, projectId: { in: projectIds } },
            select: { projectId: true, status: true },
          })
        : Promise.resolve([]),
      gitSlugs.length
        ? db.userGitExercise.findMany({
            where: { userId, exerciseSlug: { in: gitSlugs }, status: "COMPLETED" },
            select: { exerciseSlug: true },
          })
        : Promise.resolve([]),
      toolIds.length
        ? db.userAIToolProgress.findMany({
            where: { userId, toolId: { in: toolIds }, status: "COMPLETED" },
            select: { toolId: true },
          })
        : Promise.resolve([]),
      workflowIds.length
        ? db.userAIWorkflowProgress.findMany({
            where: { userId, workflowId: { in: workflowIds } },
            select: { workflowId: true },
          })
        : Promise.resolve([]),
    ]);

  const problemsByTopicSlug = new Map<
    string,
    { id: string; slug: string; title: string }[]
  >();
  for (const link of practiceLinks) {
    const list = problemsByTopicSlug.get(link.topic.slug) ?? [];
    list.push(link.problem);
    problemsByTopicSlug.set(link.topic.slug, list);
  }

  return {
    topicsBySlug: new Map(
      topics.map((topic) => [
        topic.slug,
        { id: topic.id, title: topic.title, hasLesson: topic.lesson !== null },
      ]),
    ),
    completedTopicIds: new Set(
      topicProgress.filter((row) => row.status === "COMPLETED").map((row) => row.topicId),
    ),
    inProgressTopicIds: new Set(
      topicProgress
        .filter((row) => row.status === "IN_PROGRESS")
        .map((row) => row.topicId),
    ),
    problemsByTopicSlug,
    solvedProblemIds: new Set(
      problemProgress.filter((row) => row.status === "SOLVED").map((row) => row.problemId),
    ),
    attemptedProblemIds: new Set(
      problemProgress
        .filter((row) => row.status === "ATTEMPTED")
        .map((row) => row.problemId),
    ),
    projectsBySlug: new Map(
      projects.map((project) => [project.slug, { id: project.id, title: project.title }]),
    ),
    completedProjectIds: new Set(
      projectProgress.filter((row) => row.status === "COMPLETED").map((row) => row.projectId),
    ),
    inProgressProjectIds: new Set(
      projectProgress
        .filter((row) => row.status === "IN_PROGRESS")
        .map((row) => row.projectId),
    ),
    completedGitExercises: new Set(gitProgress.map((row) => row.exerciseSlug)),
    aiToolsBySlug: new Map(
      tools.map((tool) => [tool.slug, { id: tool.id, name: tool.name }]),
    ),
    completedAIToolIds: new Set(toolProgress.map((row) => row.toolId)),
    aiWorkflowsBySlug: new Map(
      workflows.map((workflow) => [workflow.slug, { id: workflow.id, title: workflow.title }]),
    ),
    completedAIWorkflowIds: new Set(workflowProgress.map((row) => row.workflowId)),
  };
}

/**
 * Counts one capability's evidence against the loaded progress.
 *
 * A source naming content that does not exist contributes nothing rather than
 * throwing — the seed validator already refuses those, so this is a belt to
 * that braces, and a profile page is the wrong place to discover a content bug.
 */
function countEvidence(
  sources: { kind: string; ref: string }[],
  progress: ProgressMaps,
): CapabilityEvidence {
  const evidence = emptyEvidence();
  /** A problem on two of a capability's topics must only be counted once. */
  const seenProblems = new Set<string>();

  for (const source of sources) {
    switch (source.kind) {
      case "TOPIC": {
        const topic = progress.topicsBySlug.get(source.ref);
        if (!topic) break;
        evidence.topicsTotal += 1;
        if (progress.completedTopicIds.has(topic.id)) evidence.topicsCompleted += 1;
        else if (progress.inProgressTopicIds.has(topic.id)) evidence.topicsInProgress += 1;
        break;
      }
      case "PRACTICE_TOPIC": {
        for (const problem of progress.problemsByTopicSlug.get(source.ref) ?? []) {
          if (seenProblems.has(problem.id)) continue;
          seenProblems.add(problem.id);

          evidence.problemsTotal += 1;
          if (progress.solvedProblemIds.has(problem.id)) evidence.problemsSolved += 1;
          else if (progress.attemptedProblemIds.has(problem.id)) {
            evidence.problemsAttempted += 1;
          }
        }
        break;
      }
      case "PROJECT": {
        const project = progress.projectsBySlug.get(source.ref);
        if (!project) break;
        evidence.projectsTotal += 1;
        if (progress.completedProjectIds.has(project.id)) evidence.projectsCompleted += 1;
        else if (progress.inProgressProjectIds.has(project.id)) {
          evidence.projectsInProgress += 1;
        }
        break;
      }
      case "GIT_EXERCISE": {
        evidence.gitExercisesTotal += 1;
        if (progress.completedGitExercises.has(source.ref)) {
          evidence.gitExercisesCompleted += 1;
        }
        break;
      }
      case "AI_TOOL": {
        const tool = progress.aiToolsBySlug.get(source.ref);
        if (!tool) break;
        evidence.aiToolsTotal += 1;
        if (progress.completedAIToolIds.has(tool.id)) evidence.aiToolsCompleted += 1;
        break;
      }
      case "AI_WORKFLOW": {
        const workflow = progress.aiWorkflowsBySlug.get(source.ref);
        if (!workflow) break;
        evidence.aiWorkflowsTotal += 1;
        if (progress.completedAIWorkflowIds.has(workflow.id)) {
          evidence.aiWorkflowsCompleted += 1;
        }
        break;
      }
    }
  }

  return evidence;
}

/**
 * The Git exercises live in code rather than the database, so their titles are
 * looked up here rather than joined.
 */
function gitExerciseTitle(slug: string): string {
  return GIT_EXERCISE_TITLES.get(slug) ?? slug;
}

const GIT_EXERCISE_TITLES = new Map<string, string>(
  GIT_EXERCISE_SLUGS.map((slug) => [
    slug,
    slug.replace(/-/g, " ").replace(/^./, (char) => char.toUpperCase()),
  ]),
);
