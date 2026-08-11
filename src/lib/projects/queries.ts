import { db } from "@/lib/db";

import { milestonePercent } from "./progress";
import { recommendProjects, upcomingProjects } from "./recommend";

/**
 * Project reads.
 *
 * The split that runs through this file: project *definitions* are application
 * data, identical for everyone and safe to render anywhere; UserProject and
 * everything hanging off it is personal, and every query that touches it is
 * scoped by userId in its where clause rather than filtered afterwards.
 *
 * List queries deliberately select summaries only. The full project — every
 * requirement, milestone, hint and resource — is loaded on the detail and
 * workspace pages, where it is actually rendered.
 */

/** Card-sized. Used by the explorer, the dashboard and the roadmap. */
const PROJECT_SUMMARY_SELECT = {
  id: true,
  slug: true,
  title: true,
  shortDescription: true,
  difficulty: true,
  type: true,
  estimatedDuration: true,
  sortOrder: true,
  technologies: {
    orderBy: { order: "asc" },
    select: { name: true, category: true },
  },
  concepts: {
    select: {
      isPrerequisite: true,
      topic: { select: { id: true, slug: true, title: true } },
    },
  },
  _count: { select: { milestones: true } },
} as const;

/**
 * Every project, with this learner's status and milestone progress folded in.
 *
 * One query for projects and one for progress rather than a per-project join:
 * 24 projects is small, and this keeps the shape simple.
 */
export async function listProjects(userId: string) {
  const [projects, userProjects] = await Promise.all([
    db.project.findMany({
      orderBy: { sortOrder: "asc" },
      select: PROJECT_SUMMARY_SELECT,
    }),
    db.userProject.findMany({
      where: { userId },
      select: {
        projectId: true,
        status: true,
        startedAt: true,
        completedAt: true,
        repositoryUrl: true,
        deployedUrl: true,
        _count: { select: { milestones: { where: { status: "COMPLETED" } } } },
      },
    }),
  ]);

  const byProject = new Map(userProjects.map((entry) => [entry.projectId, entry]));

  return projects.map((project) => {
    const mine = byProject.get(project.id);
    const totalMilestones = project._count.milestones;
    const completedMilestones = mine?._count.milestones ?? 0;

    return {
      id: project.id,
      slug: project.slug,
      title: project.title,
      shortDescription: project.shortDescription,
      difficulty: project.difficulty,
      type: project.type,
      estimatedDuration: project.estimatedDuration,
      sortOrder: project.sortOrder,
      technologies: project.technologies,
      concepts: project.concepts.map((entry) => ({
        ...entry.topic,
        isPrerequisite: entry.isPrerequisite,
      })),
      prerequisiteTopicIds: project.concepts
        .filter((entry) => entry.isPrerequisite)
        .map((entry) => entry.topic.id),
      status: mine?.status ?? ("NOT_STARTED" as const),
      startedAt: mine?.startedAt ?? null,
      completedAt: mine?.completedAt ?? null,
      repositoryUrl: mine?.repositoryUrl ?? null,
      deployedUrl: mine?.deployedUrl ?? null,
      totalMilestones,
      completedMilestones,
      percentComplete: milestonePercent({
        total: totalMilestones,
        completed: completedMilestones,
      }),
    };
  });
}

export type ProjectListItem = Awaited<ReturnType<typeof listProjects>>[number];

/** One project in full: everything the detail and workspace pages render. */
export async function getProjectDetail(slug: string) {
  return db.project.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      shortDescription: true,
      description: true,
      difficulty: true,
      type: true,
      estimatedDuration: true,
      whyBuildThis: true,
      whatYouBuild: true,
      technologies: {
        orderBy: { order: "asc" },
        select: { id: true, name: true, category: true },
      },
      requirements: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          isRequired: true,
          order: true,
        },
      },
      milestones: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          estimatedTime: true,
          concepts: true,
          order: true,
        },
      },
      hints: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, content: true, order: true },
      },
      resources: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, url: true, source: true, type: true },
      },
      concepts: {
        select: {
          isPrerequisite: true,
          topic: {
            select: {
              id: true,
              slug: true,
              title: true,
              lesson: { select: { id: true } },
            },
          },
        },
      },
    },
  });
}

export type ProjectDetail = NonNullable<Awaited<ReturnType<typeof getProjectDetail>>>;

/**
 * This learner's run at one project, or null if they have not started it.
 *
 * userId is part of the lookup, so another learner's record is not found rather
 * than found-and-then-rejected.
 */
export async function getUserProject(userId: string, projectId: string) {
  return db.userProject.findUnique({
    where: { userId_projectId: { userId, projectId } },
    select: {
      id: true,
      status: true,
      startedAt: true,
      completedAt: true,
      repositoryUrl: true,
      deployedUrl: true,
      notes: true,
      updatedAt: true,
      // The GitHub link (Phase 8). Denormalised on the row, so rendering the
      // workspace needs no API call.
      githubRepoFullName: true,
      githubRepoUrl: true,
      githubDefaultBranch: true,
      githubRepoPrivate: true,
      milestones: {
        select: { milestoneId: true, status: true, completedAt: true },
      },
      confirmations: { select: { requirementId: true } },
    },
  });
}

export type UserProjectDetail = NonNullable<Awaited<ReturnType<typeof getUserProject>>>;

/**
 * Every topic id in the learner's active roadmap.
 *
 * Empty when they have not chosen a career yet, which callers read as "do not
 * filter" rather than "nothing is reachable".
 */
export async function getRoadmapTopicIds(userId: string): Promise<Set<string>> {
  const profile = await db.profile.findUnique({
    where: { userId },
    select: { selectedCareerId: true },
  });

  if (!profile?.selectedCareerId) return new Set();

  const topics = await db.topic.findMany({
    where: {
      phase: {
        roadmap: { careerId: profile.selectedCareerId, isActive: true },
      },
    },
    select: { id: true },
  });

  return new Set(topics.map((topic) => topic.id));
}

/** Completed topic ids for this learner, most recently completed first. */
export async function getCompletedTopicIdsForUser(userId: string) {
  const rows = await db.userTopicProgress.findMany({
    where: { userId, status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
    select: { topicId: true },
  });
  return rows.map((row) => row.topicId);
}

/**
 * "What should I build next?" plus "what is nearly within reach?".
 *
 * Returns both, because an empty recommended section with nothing else on the
 * page tells a learner nothing about how to change that.
 */
export async function getProjectRecommendations(userId: string, limit = 4) {
  const [projects, completedTopicIds, roadmapTopicIds] = await Promise.all([
    listProjects(userId),
    getCompletedTopicIdsForUser(userId),
    getRoadmapTopicIds(userId),
  ]);

  /**
   * Only projects the learner could actually reach on their chosen path.
   *
   * Recommendations already filter themselves — a frontend learner can never
   * complete a backend project's prerequisites — but "coming up" would happily
   * tell them to go and learn SQL, which is not their path and is exactly the
   * irrelevant noise this system is supposed to avoid.
   */
  const reachable =
    roadmapTopicIds.size === 0
      ? projects
      : projects.filter(
          (project) =>
            project.prerequisiteTopicIds.length > 0 &&
            project.prerequisiteTopicIds.every((id) => roadmapTopicIds.has(id)),
        );

  const recommendations = recommendProjects({
    completedTopicIds,
    projects: reachable,
    limit,
  });

  const upcoming = upcomingProjects({
    completedTopicIds,
    projects: reachable,
    limit: 3,
  });

  // Resolve the missing topic ids into titles so the UI can name what is
  // standing in the way rather than showing an opaque count.
  const missingIds = [...new Set(upcoming.flatMap((entry) => entry.missingTopicIds))];
  const topics = missingIds.length
    ? await db.topic.findMany({
        where: { id: { in: missingIds } },
        select: { id: true, slug: true, title: true },
      })
    : [];
  const topicById = new Map(topics.map((topic) => [topic.id, topic]));

  return {
    recommendations,
    upcoming: upcoming.map((entry) => ({
      project: entry.project,
      missingTopics: entry.missingTopicIds
        .map((id) => topicById.get(id))
        .filter((topic): topic is (typeof topics)[number] => Boolean(topic)),
    })),
    completedTopicIds,
  };
}

/** Projects that build on one topic, for the learning page's hand-off. */
export async function getProjectsForTopic(topicId: string, userId?: string) {
  const rows = await db.projectConcept.findMany({
    where: { topicId, isPrerequisite: true },
    select: {
      project: {
        select: {
          id: true,
          slug: true,
          title: true,
          shortDescription: true,
          difficulty: true,
          estimatedDuration: true,
          sortOrder: true,
        },
      },
    },
  });

  const projects = rows
    .map((row) => row.project)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (!userId || projects.length === 0) {
    return projects.map((project) => ({
      ...project,
      status: "NOT_STARTED" as const,
    }));
  }

  const mine = await db.userProject.findMany({
    where: { userId, projectId: { in: projects.map((project) => project.id) } },
    select: { projectId: true, status: true },
  });
  const statusByProject = new Map(mine.map((row) => [row.projectId, row.status]));

  return projects.map((project) => ({
    ...project,
    status: statusByProject.get(project.id) ?? ("NOT_STARTED" as const),
  }));
}

/**
 * Projects grouped by the roadmap phase they belong to.
 *
 * A project belongs to the phase of its *last* prerequisite topic — the point
 * in the roadmap by which a learner has everything the project needs. Derived
 * rather than stored, so re-ordering a roadmap moves its projects with it.
 */
export async function getProjectsByPhase(userId: string, roadmapId: string) {
  const roadmap = await db.roadmapPhase.findMany({
    where: { roadmapId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      order: true,
      topics: { select: { id: true } },
    },
  });

  const phaseOfTopic = new Map<string, { id: string; order: number }>();
  for (const phase of roadmap) {
    for (const topic of phase.topics) {
      phaseOfTopic.set(topic.id, { id: phase.id, order: phase.order });
    }
  }

  const projects = await listProjects(userId);
  const byPhase = new Map<string, ProjectListItem[]>();

  for (const project of projects) {
    const phases = project.prerequisiteTopicIds
      .map((id) => phaseOfTopic.get(id))
      .filter((phase): phase is { id: string; order: number } => Boolean(phase));

    // A project whose prerequisites are not in this roadmap belongs to another
    // career and is simply not shown here.
    if (phases.length !== project.prerequisiteTopicIds.length || phases.length === 0) {
      continue;
    }

    const last = phases.reduce((a, b) => (b.order > a.order ? b : a));
    byPhase.set(last.id, [...(byPhase.get(last.id) ?? []), project]);
  }

  return byPhase;
}

/** Counts and the current project, for the dashboard. */
export async function getProjectSummary(userId: string) {
  const [completed, inProgressCount, current] = await Promise.all([
    db.userProject.count({ where: { userId, status: "COMPLETED" } }),
    db.userProject.count({ where: { userId, status: "IN_PROGRESS" } }),
    db.userProject.findFirst({
      where: { userId, status: "IN_PROGRESS" },
      orderBy: { updatedAt: "desc" },
      select: {
        _count: { select: { milestones: { where: { status: "COMPLETED" } } } },
        project: {
          select: {
            slug: true,
            title: true,
            difficulty: true,
            _count: { select: { milestones: true } },
          },
        },
      },
    }),
  ]);

  return {
    completed,
    inProgress: inProgressCount,
    current: current
      ? {
          slug: current.project.slug,
          title: current.project.title,
          difficulty: current.project.difficulty,
          completedMilestones: current._count.milestones,
          totalMilestones: current.project._count.milestones,
          percentComplete: milestonePercent({
            total: current.project._count.milestones,
            completed: current._count.milestones,
          }),
        }
      : null,
  };
}
