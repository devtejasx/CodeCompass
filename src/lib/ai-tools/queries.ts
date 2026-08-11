import { db } from "@/lib/db";

import { toolPercent } from "./progress";

/**
 * AI Tools Academy reads.
 *
 * The split that runs through this file is the same one as everywhere else in
 * CodeCompass: tool *definitions* are application data, identical for everyone
 * and safe to render anywhere; UserAIToolProgress and UserAIWorkflowProgress
 * are personal, and every query touching them is scoped by userId in its where
 * clause rather than filtered afterwards.
 *
 * List queries select summaries only. The full tool — capabilities,
 * limitations, resources, learning path — is loaded on the detail page, where
 * it is actually rendered, so the explorer does not ship twenty tools' worth of
 * prose to the browser to filter six cards.
 */

/** Card-sized. Used by the explorer, the comparison picker and the dashboard. */
const TOOL_SUMMARY_SELECT = {
  id: true,
  slug: true,
  name: true,
  description: true,
  primaryUse: true,
  difficulty: true,
  status: true,
  statusNote: true,
  supersededBySlug: true,
  environments: true,
  iconIdentifier: true,
  sortOrder: true,
  officialUrl: true,
  docsUrl: true,
  lastVerifiedAt: true,
  category: { select: { slug: true, name: true, icon: true } },
  useCases: {
    orderBy: { order: "asc" },
    select: { useCase: true, note: true },
  },
} as const;

/**
 * Every tool, with this learner's progress folded in.
 *
 * One query for tools and one for progress rather than a per-tool join: twenty
 * tools is small, and this keeps the shape simple. DEPRECATED tools are
 * included — they are labelled, not hidden, because somebody searching for an
 * old name deserves an answer.
 */
export async function listTools(userId: string) {
  const [tools, progress] = await Promise.all([
    db.aITool.findMany({
      orderBy: { sortOrder: "asc" },
      select: TOOL_SUMMARY_SELECT,
    }),
    db.userAIToolProgress.findMany({
      where: { userId },
      select: { toolId: true, status: true, percentComplete: true },
    }),
  ]);

  const byTool = new Map(progress.map((row) => [row.toolId, row]));

  return tools.map((tool) => {
    const mine = byTool.get(tool.id);

    return {
      ...tool,
      useCaseKinds: tool.useCases.map((entry) => entry.useCase),
      status: tool.status,
      progressStatus: mine?.status ?? ("NOT_STARTED" as const),
      percentComplete: mine?.percentComplete ?? 0,
    };
  });
}

export type AIToolListItem = Awaited<ReturnType<typeof listTools>>[number];

/** The categories, in authored order, with how many tools each holds. */
export async function listCategories() {
  return db.aIToolCategory.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      icon: true,
      _count: { select: { tools: true } },
    },
  });
}

export type AIToolCategoryItem = Awaited<ReturnType<typeof listCategories>>[number];

/**
 * One tool in full, plus this learner's progress through its path.
 *
 * The learning path's lessons resolve to Topics, so the per-step status comes
 * from ordinary UserTopicProgress — the same rows the roadmap and the Git
 * Academy read. There is no second progress system to keep in sync.
 */
export async function getToolDetail(slug: string, userId: string) {
  const tool = await db.aITool.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      longDescription: true,
      whatItIs: true,
      whenToUse: true,
      whenNotToUse: true,
      limitations: true,
      howDevelopersUseIt: true,
      officialUrl: true,
      docsUrl: true,
      status: true,
      statusNote: true,
      supersededBySlug: true,
      difficulty: true,
      primaryUse: true,
      environments: true,
      iconIdentifier: true,
      lastVerifiedAt: true,
      verificationSource: true,
      category: { select: { slug: true, name: true, icon: true, description: true } },
      capabilities: {
        orderBy: { order: "asc" },
        select: { id: true, capability: true, detail: true },
      },
      useCases: {
        orderBy: { order: "asc" },
        select: { useCase: true, note: true },
      },
      resources: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, url: true, source: true, type: true, description: true },
      },
      learningPaths: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          difficulty: true,
          estimatedTime: true,
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
              estimatedTime: true,
              order: true,
              topic: {
                select: { id: true, slug: true, lesson: { select: { id: true } } },
              },
            },
          },
        },
      },
      workflows: {
        orderBy: { sortOrder: "asc" },
        select: {
          workflow: {
            select: {
              slug: true,
              title: true,
              goal: true,
              category: true,
              estimatedTime: true,
            },
          },
        },
      },
    },
  });

  if (!tool) return null;

  const topicIds = tool.learningPaths
    .flatMap((path) => path.lessons)
    .map((lesson) => lesson.topic?.id)
    .filter((id): id is string => Boolean(id));

  const [topicProgress, mine, successor] = await Promise.all([
    topicIds.length > 0
      ? db.userTopicProgress.findMany({
          where: { userId, topicId: { in: topicIds } },
          select: { topicId: true, status: true, percentComplete: true },
        })
      : Promise.resolve([]),
    db.userAIToolProgress.findUnique({
      where: { userId_toolId: { userId, toolId: tool.id } },
      select: { status: true, percentComplete: true, startedAt: true, completedAt: true },
    }),
    // Resolved so the UI can link by name rather than printing a raw slug. A
    // successor that is not in the catalog simply yields null and the banner
    // renders without a link, which is why this is a lookup and not a relation.
    tool.supersededBySlug
      ? db.aITool.findUnique({
          where: { slug: tool.supersededBySlug },
          select: { slug: true, name: true },
        })
      : Promise.resolve(null),
  ]);

  const byTopic = new Map(topicProgress.map((row) => [row.topicId, row]));

  const learningPaths = tool.learningPaths.map((path) => {
    const lessons = path.lessons.map((lesson) => {
      const progress = lesson.topic ? byTopic.get(lesson.topic.id) : undefined;

      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        estimatedTime: lesson.estimatedTime,
        order: lesson.order,
        topicSlug: lesson.topic?.slug ?? null,
        // A path step with no topic, or a topic with no lesson, renders as
        // "coming soon" rather than a link to nowhere.
        hasLesson: Boolean(lesson.topic?.lesson),
        status: progress?.status ?? ("NOT_STARTED" as const),
        percentComplete: progress?.percentComplete ?? 0,
      };
    });

    const completed = lessons.filter((lesson) => lesson.status === "COMPLETED").length;

    return {
      ...path,
      lessons,
      completedLessons: completed,
      totalLessons: lessons.length,
      percentComplete: toolPercent({ total: lessons.length, completed }),
    };
  });

  const allLessons = learningPaths.flatMap((path) => path.lessons);
  const completedCount = allLessons.filter(
    (lesson) => lesson.status === "COMPLETED",
  ).length;

  return {
    ...tool,
    learningPaths,
    workflows: tool.workflows.map((entry) => entry.workflow),
    successor,
    progress: {
      status: mine?.status ?? ("NOT_STARTED" as const),
      startedAt: mine?.startedAt ?? null,
      completedAt: mine?.completedAt ?? null,
      completedLessons: completedCount,
      totalLessons: allLessons.length,
      // Derived from the topics rather than read from the stored column, so a
      // stale projection can never be what the learner is shown.
      percentComplete: toolPercent({
        total: allLessons.length,
        completed: completedCount,
      }),
    },
    /** The next unfinished step, or null when the path is complete. */
    nextLesson: allLessons.find((lesson) => lesson.status !== "COMPLETED") ?? null,
  };
}

export type AIToolDetail = NonNullable<Awaited<ReturnType<typeof getToolDetail>>>;

/**
 * Tools recommended for this learner's chosen career, with the reason.
 *
 * Returns an empty list when they have not chosen a career, which callers read
 * as "show the catalog" rather than "there is nothing for you" — an empty
 * recommendation block with no explanation teaches a learner nothing.
 */
export async function getCareerRecommendations(userId: string, limit = 6) {
  const profile = await db.profile.findUnique({
    where: { userId },
    select: {
      selectedCareerId: true,
      chosenCareer: { select: { slug: true, name: true } },
    },
  });

  if (!profile?.selectedCareerId || !profile.chosenCareer) {
    return { career: null, recommendations: [] };
  }

  const links = await db.careerAITool.findMany({
    where: { careerId: profile.selectedCareerId },
    orderBy: { sortOrder: "asc" },
    take: limit,
    select: {
      useCase: true,
      reason: true,
      tool: { select: TOOL_SUMMARY_SELECT },
    },
  });

  const toolIds = links.map((link) => link.tool.id);
  const progress = toolIds.length
    ? await db.userAIToolProgress.findMany({
        where: { userId, toolId: { in: toolIds } },
        select: { toolId: true, status: true, percentComplete: true },
      })
    : [];
  const byTool = new Map(progress.map((row) => [row.toolId, row]));

  return {
    career: profile.chosenCareer,
    recommendations: links.map((link) => {
      const mine = byTool.get(link.tool.id);

      return {
        useCase: link.useCase,
        reason: link.reason,
        tool: {
          ...link.tool,
          useCaseKinds: link.tool.useCases.map((entry) => entry.useCase),
          progressStatus: mine?.status ?? ("NOT_STARTED" as const),
          percentComplete: mine?.percentComplete ?? 0,
        },
      };
    }),
  };
}

export type CareerRecommendations = Awaited<ReturnType<typeof getCareerRecommendations>>;

/** The workflow library, with this learner's ticks folded in. */
export async function listWorkflows(userId: string) {
  const [workflows, completed] = await Promise.all([
    db.aIWorkflow.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        goal: true,
        summary: true,
        category: true,
        difficulty: true,
        estimatedTime: true,
        _count: { select: { steps: true } },
        tools: {
          orderBy: { sortOrder: "asc" },
          select: { tool: { select: { slug: true, name: true } } },
        },
      },
    }),
    db.userAIWorkflowProgress.findMany({
      where: { userId },
      select: { workflowId: true, completedAt: true },
    }),
  ]);

  const done = new Map(completed.map((row) => [row.workflowId, row.completedAt]));

  return workflows.map((workflow) => ({
    ...workflow,
    tools: workflow.tools.map((entry) => entry.tool),
    stepCount: workflow._count.steps,
    completedAt: done.get(workflow.id) ?? null,
  }));
}

export type AIWorkflowListItem = Awaited<ReturnType<typeof listWorkflows>>[number];

/** One workflow in full: steps, prompts, verification and mistakes. */
export async function getWorkflowDetail(slug: string, userId: string) {
  const workflow = await db.aIWorkflow.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      goal: true,
      summary: true,
      category: true,
      difficulty: true,
      estimatedTime: true,
      whatToVerify: true,
      commonMistakes: true,
      steps: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, detail: true, order: true, isHumanStep: true },
      },
      prompts: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          label: true,
          goal: true,
          context: true,
          request: true,
          whyItWorks: true,
        },
      },
      tools: {
        orderBy: { sortOrder: "asc" },
        select: {
          tool: {
            select: { slug: true, name: true, primaryUse: true, status: true },
          },
        },
      },
    },
  });

  if (!workflow) return null;

  const mine = await db.userAIWorkflowProgress.findUnique({
    where: { userId_workflowId: { userId, workflowId: workflow.id } },
    select: { completedAt: true },
  });

  return {
    ...workflow,
    tools: workflow.tools.map((entry) => entry.tool),
    completedAt: mine?.completedAt ?? null,
  };
}

export type AIWorkflowDetail = NonNullable<Awaited<ReturnType<typeof getWorkflowDetail>>>;

/**
 * Two or three tools side by side.
 *
 * Deliberately returns them in the order asked for and adds no ranking of any
 * kind: different tools are useful for different purposes, and a "winner"
 * column would be a claim CodeCompass has no basis to make.
 */
export async function getComparison(slugs: string[]) {
  if (slugs.length === 0) return [];

  const tools = await db.aITool.findMany({
    where: { slug: { in: slugs } },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      primaryUse: true,
      difficulty: true,
      status: true,
      statusNote: true,
      environments: true,
      iconIdentifier: true,
      officialUrl: true,
      docsUrl: true,
      lastVerifiedAt: true,
      limitations: true,
      whenToUse: true,
      whenNotToUse: true,
      category: { select: { slug: true, name: true } },
      capabilities: {
        orderBy: { order: "asc" },
        select: { capability: true, detail: true },
      },
      useCases: { orderBy: { order: "asc" }, select: { useCase: true, note: true } },
      learningPaths: {
        orderBy: { order: "asc" },
        take: 1,
        select: { difficulty: true, estimatedTime: true, _count: { select: { lessons: true } } },
      },
    },
  });

  const bySlug = new Map(tools.map((tool) => [tool.slug, tool]));

  // Preserve the requested order; drop slugs that do not exist rather than
  // rendering a blank column for a typo in the URL.
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((tool): tool is (typeof tools)[number] => Boolean(tool));
}

export type ComparisonTool = Awaited<ReturnType<typeof getComparison>>[number];

/**
 * Counts for the Academy header and the dashboard.
 *
 * "Tools learned" counts tools whose whole path is complete. "In progress"
 * counts the ones started but not finished, so a learner who has begun three
 * things sees three rather than zero.
 */
export async function getAIProgressSummary(userId: string) {
  const [totalTools, rows, workflowsCompleted, totalWorkflows] = await Promise.all([
    db.aITool.count({ where: { status: { not: "DEPRECATED" } } }),
    db.userAIToolProgress.findMany({
      where: { userId },
      orderBy: { lastAccessedAt: "desc" },
      select: {
        status: true,
        percentComplete: true,
        tool: { select: { slug: true, name: true } },
      },
    }),
    db.userAIWorkflowProgress.count({ where: { userId } }),
    db.aIWorkflow.count(),
  ]);

  const completed = rows.filter((row) => row.status === "COMPLETED");
  const inProgress = rows.filter((row) => row.status === "IN_PROGRESS");

  return {
    toolsLearned: completed.length,
    toolsInProgress: inProgress.length,
    totalTools,
    workflowsCompleted,
    totalWorkflows,
    /** Most recently touched unfinished tool, for "continue learning". */
    current: inProgress[0]
      ? {
          slug: inProgress[0].tool.slug,
          name: inProgress[0].tool.name,
          percentComplete: inProgress[0].percentComplete,
        }
      : null,
  };
}

export type AIProgressSummary = Awaited<ReturnType<typeof getAIProgressSummary>>;
