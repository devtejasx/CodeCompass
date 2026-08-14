import { db } from "@/lib/db";

import { getCapabilities } from "./capabilities";

/**
 * The learning-record export.
 *
 * A learner's record of what they did, in a format they can keep. Built by
 * naming every field, exactly like the public profile and for the same reason:
 * an export assembled by removing sensitive keys from a larger object leaks the
 * moment somebody adds a field upstream.
 *
 * Never included: password hash, email, session data, GitHub access tokens or
 * scopes, mentor conversations, AI usage, knowledge gaps, or any internal id.
 * Content is identified by slug — the identifier that is already public in
 * every URL — so the file is useful without carrying database keys.
 */

export interface LearningRecord {
  exportedAt: string;
  /** So a future reader knows what shape they are looking at. */
  formatVersion: 1;

  learner: {
    displayName: string;
    joinedAt: string;
    career: string | null;
    experienceLevel: string | null;
    preferredLanguage: string | null;
  };

  capabilities: {
    slug: string;
    name: string;
    category: string;
    level: string | null;
    evidence: {
      topicsCompleted: number;
      topicsTotal: number;
      problemsSolved: number;
      projectsCompleted: number;
      gitExercisesCompleted: number;
      aiToolsCompleted: number;
      aiWorkflowsCompleted: number;
    };
  }[];

  learning: { slug: string; title: string; completedAt: string | null }[];

  practice: {
    solved: number;
    attempted: number;
    problems: {
      slug: string;
      title: string;
      difficulty: string;
      solvedAt: string | null;
    }[];
  };

  projects: {
    slug: string;
    title: string;
    status: string;
    completedAt: string | null;
    technologies: string[];
    milestonesCompleted: number;
    milestonesTotal: number;
  }[];

  git: { exercisesCompleted: string[]; modulesCompleted: string[] };

  ai: { toolsCompleted: string[]; workflowsUsed: string[] };
}

/**
 * Builds one learner's record.
 *
 * Scoped by userId throughout — every query carries it, so there is no path
 * that could assemble somebody else's record even if a caller passed the wrong
 * id. The caller always derives it from the session.
 */
export async function buildLearningRecord(userId: string): Promise<LearningRecord> {
  const [
    user,
    capabilities,
    topics,
    problems,
    projects,
    gitExercises,
    aiTools,
    aiWorkflows,
  ] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        name: true,
        createdAt: true,
        profile: {
          select: {
            experienceLevel: true,
            selectedLanguage: true,
            chosenCareer: { select: { name: true } },
          },
        },
      },
    }),
    getCapabilities(userId),
    db.userTopicProgress.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "asc" },
      select: {
        completedAt: true,
        topic: { select: { slug: true, title: true } },
      },
    }),
    db.userProblemProgress.findMany({
      where: { userId },
      orderBy: { solvedAt: "asc" },
      select: {
        status: true,
        solvedAt: true,
        problem: { select: { slug: true, title: true, difficulty: true } },
      },
    }),
    db.userProject.findMany({
      where: { userId },
      orderBy: { completedAt: "asc" },
      select: {
        status: true,
        completedAt: true,
        _count: { select: { milestones: { where: { status: "COMPLETED" } } } },
        project: {
          select: {
            slug: true,
            title: true,
            technologies: { orderBy: { order: "asc" }, select: { name: true } },
            _count: { select: { milestones: true } },
          },
        },
      },
    }),
    db.userGitExercise.findMany({
      where: { userId, status: "COMPLETED" },
      select: { exerciseSlug: true },
    }),
    db.userAIToolProgress.findMany({
      where: { userId, status: "COMPLETED" },
      select: { tool: { select: { slug: true } } },
    }),
    db.userAIWorkflowProgress.findMany({
      where: { userId },
      select: { workflow: { select: { slug: true } } },
    }),
  ]);

  const gitModules = await db.userTopicProgress.findMany({
    where: {
      userId,
      status: "COMPLETED",
      topic: { phase: { roadmap: { slug: "git-github" } } },
    },
    select: { topic: { select: { slug: true } } },
  });

  return {
    exportedAt: new Date().toISOString(),
    formatVersion: 1,

    learner: {
      displayName: user.name,
      joinedAt: user.createdAt.toISOString(),
      career: user.profile?.chosenCareer?.name ?? null,
      experienceLevel: user.profile?.experienceLevel ?? null,
      preferredLanguage: user.profile?.selectedLanguage ?? null,
    },

    capabilities: capabilities.map((capability) => ({
      slug: capability.slug,
      name: capability.name,
      category: capability.category,
      level: capability.level,
      evidence: {
        topicsCompleted: capability.evidence.topicsCompleted,
        topicsTotal: capability.evidence.topicsTotal,
        problemsSolved: capability.evidence.problemsSolved,
        projectsCompleted: capability.evidence.projectsCompleted,
        gitExercisesCompleted: capability.evidence.gitExercisesCompleted,
        aiToolsCompleted: capability.evidence.aiToolsCompleted,
        aiWorkflowsCompleted: capability.evidence.aiWorkflowsCompleted,
      },
    })),

    learning: topics.map((row) => ({
      slug: row.topic.slug,
      title: row.topic.title,
      completedAt: row.completedAt?.toISOString() ?? null,
    })),

    practice: {
      solved: problems.filter((row) => row.status === "SOLVED").length,
      attempted: problems.filter((row) => row.status === "ATTEMPTED").length,
      problems: problems.map((row) => ({
        slug: row.problem.slug,
        title: row.problem.title,
        difficulty: row.problem.difficulty,
        solvedAt: row.solvedAt?.toISOString() ?? null,
      })),
    },

    projects: projects.map((row) => ({
      slug: row.project.slug,
      title: row.project.title,
      status: row.status,
      completedAt: row.completedAt?.toISOString() ?? null,
      technologies: row.project.technologies.map((technology) => technology.name),
      milestonesCompleted: row._count.milestones,
      milestonesTotal: row.project._count.milestones,
    })),

    git: {
      exercisesCompleted: gitExercises.map((row) => row.exerciseSlug),
      modulesCompleted: gitModules.map((row) => row.topic.slug),
    },

    ai: {
      toolsCompleted: aiTools.map((row) => row.tool.slug),
      workflowsUsed: aiWorkflows.map((row) => row.workflow.slug),
    },
  };
}

/**
 * A filename that is safe to put in a Content-Disposition header.
 *
 * The display name is deliberately not used: it is learner-supplied, and a
 * quote or a newline in a header is a response-splitting problem rather than a
 * cosmetic one.
 */
export function exportFilename(now = new Date()): string {
  const date = now.toISOString().slice(0, 10);
  return `codecompass-learning-record-${date}.json`;
}
