import { cache } from "react";

import { db } from "@/lib/db";
import { getActiveRoadmapForCareer } from "@/lib/roadmap/queries";
import { deriveTopicStates, roadmapPercent } from "@/lib/learn/progress";
import { delegationFor, satisfiedDelegatedTopicIds } from "@/lib/learn/delegation";
import { getGitProgressSummary } from "@/lib/git/queries";
import { getAIProgressSummary } from "@/lib/ai-tools/queries";
import { GIT_EXERCISE_SLUGS } from "@/lib/git/exercises";
import type {
  DailyLearningTime,
  ExperienceLevel,
  MentorSolutionPolicy,
  ProgrammingLanguage,
} from "@/generated/prisma/client";

/**
 * The learner's current position, assembled from what the application already
 * knows.
 *
 * This is the one object every Phase 10 feature reads: the recommendation
 * engine, the study plan, the weekly summary and the AI mentor's context all
 * start here. Building it in one place is what stops the dashboard and the
 * mentor disagreeing about what topic somebody is on.
 *
 * It is **derived, never stored**. Every field comes from a table that Phases 3
 * to 9 already maintain, so there is no summary row to keep in sync and no way
 * for it to go stale — finishing a lesson changes the answer on the next read.
 * A `LearnerProfile` table would have been faster and wrong.
 *
 * Nothing here is invented. Where the data cannot answer a question the field
 * is null and the caller says so, rather than guessing: a learner with no
 * career has `career: null`, not a default one.
 */

export interface LearnerTopic {
  id: string;
  slug: string;
  title: string;
  description: string;
  estimatedTime: string;
  isRequired: boolean;
  hasLesson: boolean;
  /**
   * Where this topic is taught, when the roadmap names it but an Academy owns
   * the content. Null for ordinary topics.
   */
  delegatedTo: { href: string; name: string } | null;
  phaseTitle: string;
  phaseOrder: number;
  /** Why this phase sits where it does — authored, not generated. */
  phaseReason: string;
}

export interface LearnerState {
  userId: string;

  career: { id: string; slug: string; name: string } | null;
  experienceLevel: ExperienceLevel | null;
  language: ProgrammingLanguage | null;
  studyTime: DailyLearningTime | null;
  mentorSolutionPolicy: MentorSolutionPolicy;

  /** Null when the learner has no career, or their career has no roadmap yet. */
  roadmap: { id: string; title: string; estimatedDuration: string } | null;

  /**
   * The first required topic, in roadmap order, that is not complete. This is
   * the single definition of "where you are" — the roadmap page, the practice
   * recommendation and the mentor all resolve it the same way.
   */
  currentTopic: LearnerTopic | null;
  /** In progress but not finished, if any. Beats currentTopic for "resume". */
  resumeTopic: (LearnerTopic & { percentComplete: number }) | null;
  /** What comes after the current topic, for "why am I learning this". */
  nextTopic: LearnerTopic | null;

  completedTopicIds: string[];
  /** Required topics not yet done, in roadmap order. */
  pendingRequiredTopicIds: string[];
  totalRequiredTopics: number;

  practice: {
    solved: number;
    attempted: number;
    total: number;
    /** Problems attached to the current topic that are not solved yet. */
    pendingForCurrentTopic: number;
  };

  projects: {
    completed: number;
    inProgress: number;
    total: number;
    current: { slug: string; title: string; percentComplete: number } | null;
  };

  git: {
    completedModules: number;
    totalModules: number;
    percentComplete: number;
    exercisesCompleted: number;
    totalExercises: number;
  };

  ai: {
    toolsLearned: number;
    toolsInProgress: number;
    totalTools: number;
    workflowsCompleted: number;
    totalWorkflows: number;
    current: { slug: string; name: string; percentComplete: number } | null;
  };

  /** Percentages, each honest about the data behind it. */
  progress: {
    roadmap: number;
    learning: number;
    practice: number;
    projects: number;
    git: number;
    ai: number;
  };

  /** When the learner last did anything at all. Null for a brand-new account. */
  lastActiveAt: Date | null;
}

/**
 * Assembles the learner's state.
 *
 * Six queries, run concurrently, plus the roadmap tree. Deliberately not one
 * enormous include: the roadmap is shared content that every learner on a
 * career hits identically, while the progress rows are per-user, and keeping
 * them apart is what stops this becoming an N+1 as the roadmap grows.
 *
 * Memoised per request with React's `cache`. "Derived, never stored" is about
 * durability, not about recomputing it twice in one render — and it was being
 * recomputed twice: the profile page asks for the state *and* for guidance, and
 * guidance builds the state itself, so a single profile render ran the roadmap
 * tree, both academy summaries and every progress query twice over. A new
 * request still starts from scratch, so finishing a lesson still changes the
 * answer on the next read.
 */
export const getLearnerState = cache(async function getLearnerState(
  userId: string,
): Promise<LearnerState> {
  const profile = await db.profile.findUnique({
    where: { userId },
    select: {
      experienceLevel: true,
      selectedLanguage: true,
      dailyLearningTime: true,
      mentorSolutionPolicy: true,
      chosenCareer: { select: { id: true, slug: true, name: true } },
    },
  });

  const career = profile?.chosenCareer ?? null;

  const [gitSummary, aiSummary, practiceRows, projectRows, lastActivity] =
    await Promise.all([
      getGitProgressSummary(userId),
      getAIProgressSummary(userId),
      db.userProblemProgress.findMany({
        where: { userId },
        select: { status: true, problemId: true },
      }),
      db.userProject.findMany({
        where: { userId },
        select: {
          status: true,
          updatedAt: true,
          project: {
            select: { slug: true, title: true, _count: { select: { milestones: true } } },
          },
          _count: { select: { milestones: { where: { status: "COMPLETED" } } } },
        },
      }),
      db.userActivity.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

  const [totalProblems, totalProjects] = await Promise.all([
    db.practiceProblem.count(),
    db.project.count(),
  ]);

  const solved = practiceRows.filter((row) => row.status === "SOLVED").length;
  const attempted = practiceRows.filter((row) => row.status === "ATTEMPTED").length;

  const completedProjects = projectRows.filter((row) => row.status === "COMPLETED");
  const inProgressProjects = projectRows
    .filter((row) => row.status === "IN_PROGRESS")
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const currentProject = inProgressProjects[0] ?? null;
  const currentProjectTotal = currentProject?.project._count.milestones ?? 0;

  // ── No career: the state is real, it is just mostly empty ───────────────
  if (!career) {
    return emptyRoadmapState({
      userId,
      profile,
      career: null,
      roadmap: null,
      gitSummary,
      aiSummary,
      practice: { solved, attempted, total: totalProblems, pendingForCurrentTopic: 0 },
      projects: {
        completed: completedProjects.length,
        inProgress: inProgressProjects.length,
        total: totalProjects,
        current: currentProject
          ? {
              slug: currentProject.project.slug,
              title: currentProject.project.title,
              percentComplete:
                currentProjectTotal === 0
                  ? 0
                  : Math.round(
                      (currentProject._count.milestones / currentProjectTotal) * 100,
                    ),
            }
          : null,
      },
      lastActiveAt: lastActivity?.createdAt ?? null,
    });
  }

  const roadmap = await getActiveRoadmapForCareer(career.id);

  if (!roadmap) {
    return emptyRoadmapState({
      userId,
      profile,
      career,
      roadmap: null,
      gitSummary,
      aiSummary,
      practice: { solved, attempted, total: totalProblems, pendingForCurrentTopic: 0 },
      projects: {
        completed: completedProjects.length,
        inProgress: inProgressProjects.length,
        total: totalProjects,
        current: currentProject
          ? {
              slug: currentProject.project.slug,
              title: currentProject.project.title,
              percentComplete:
                currentProjectTotal === 0
                  ? 0
                  : Math.round(
                      (currentProject._count.milestones / currentProjectTotal) * 100,
                    ),
            }
          : null,
      },
      lastActiveAt: lastActivity?.createdAt ?? null,
    });
  }

  const topicProgress = await db.userTopicProgress.findMany({
    where: { userId, topic: { phase: { roadmapId: roadmap.id } } },
    orderBy: { completedAt: "desc" },
    select: {
      topicId: true,
      status: true,
      percentComplete: true,
      lastAccessedAt: true,
    },
  });

  // Delegated topics (the Git ones, taught in the Academy) have no progress row
  // of their own, so they are folded in here from the Academy work behind them.
  // Doing it at the state level means the dashboard, the study plan and the
  // mentor's context all agree without each re-deriving it.
  const delegatedComplete = await satisfiedDelegatedTopicIds(
    userId,
    roadmap.phases.flatMap((phase) =>
      phase.topics.map((topic) => ({ id: topic.id, slug: topic.slug })),
    ),
  );

  const completedTopicIds = [
    ...new Set([
      ...topicProgress
        .filter((row) => row.status === "COMPLETED")
        .map((row) => row.topicId),
      ...delegatedComplete,
    ]),
  ];

  /** Flattened in roadmap order, carrying the phase context each topic needs. */
  const topicsInOrder: LearnerTopic[] = roadmap.phases.flatMap((phase) =>
    phase.topics.map((topic) => ({
      id: topic.id,
      slug: topic.slug,
      title: topic.title,
      description: topic.description,
      estimatedTime: topic.estimatedTime,
      isRequired: topic.isRequired,
      hasLesson: topic.lesson !== null,
      delegatedTo: delegationFor(topic.slug)
        ? {
            href: delegationFor(topic.slug)!.academyHref,
            name: delegationFor(topic.slug)!.academyName,
          }
        : null,
      phaseTitle: phase.title,
      phaseOrder: phase.order,
      phaseReason: phase.whyThisComesNext,
    })),
  );

  // The same helper the roadmap page uses, so CURRENT is the same topic in
  // both places rather than two implementations that agree by coincidence.
  const states = deriveTopicStates(
    roadmap.phases.flatMap((phase) =>
      phase.topics.map((topic) => ({
        id: topic.id,
        isRequired: topic.isRequired,
        prerequisiteIds: topic.prerequisites.map((edge) => edge.prerequisite.id),
      })),
    ),
    completedTopicIds,
  );

  const currentTopic =
    topicsInOrder.find((topic) => states.get(topic.id) === "CURRENT") ?? null;

  const currentIndex = currentTopic
    ? topicsInOrder.findIndex((topic) => topic.id === currentTopic.id)
    : -1;
  const nextTopic =
    currentIndex >= 0
      ? (topicsInOrder.slice(currentIndex + 1).find((topic) => topic.isRequired) ?? null)
      : null;

  // An in-progress topic beats the derived CURRENT for "resume", because it is
  // where the learner actually stopped.
  const inFlight = topicProgress
    .filter((row) => row.status === "IN_PROGRESS")
    .sort((a, b) => b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime())[0];

  const resumeTopicBase = inFlight
    ? (topicsInOrder.find((topic) => topic.id === inFlight.topicId) ?? null)
    : null;

  const requiredTopicIds = topicsInOrder
    .filter((topic) => topic.isRequired)
    .map((topic) => topic.id);
  const completedSet = new Set(completedTopicIds);
  const pendingRequiredTopicIds = requiredTopicIds.filter((id) => !completedSet.has(id));

  // How much practice is outstanding for the topic they are on. Zero is a
  // meaningful answer here and drives a real branch in the recommendation
  // engine, so it is computed rather than inferred.
  const pendingForCurrentTopic = currentTopic
    ? await db.problemTopic.count({
        where: {
          topicId: currentTopic.id,
          problem: {
            progress: { none: { userId, status: "SOLVED" } },
          },
        },
      })
    : 0;

  const roadmapPercentComplete = roadmapPercent({
    requiredTopicIds,
    completedTopicIds,
  });

  return {
    userId,
    career,
    experienceLevel: profile?.experienceLevel ?? null,
    language: profile?.selectedLanguage ?? null,
    studyTime: profile?.dailyLearningTime ?? null,
    mentorSolutionPolicy: profile?.mentorSolutionPolicy ?? "HINTS_ONLY",
    roadmap: {
      id: roadmap.id,
      title: roadmap.title,
      estimatedDuration: roadmap.estimatedDuration,
    },
    currentTopic,
    resumeTopic: resumeTopicBase
      ? { ...resumeTopicBase, percentComplete: inFlight!.percentComplete }
      : null,
    nextTopic,
    completedTopicIds,
    pendingRequiredTopicIds,
    totalRequiredTopics: requiredTopicIds.length,
    practice: {
      solved,
      attempted,
      total: totalProblems,
      pendingForCurrentTopic,
    },
    projects: {
      completed: completedProjects.length,
      inProgress: inProgressProjects.length,
      total: totalProjects,
      current: currentProject
        ? {
            slug: currentProject.project.slug,
            title: currentProject.project.title,
            percentComplete:
              currentProjectTotal === 0
                ? 0
                : Math.round(
                    (currentProject._count.milestones / currentProjectTotal) * 100,
                  ),
          }
        : null,
    },
    git: gitSummary,
    ai: aiSummary,
    progress: {
      roadmap: roadmapPercentComplete,
      // Learning and roadmap are the same measure by design. Two subtly
      // different percentages for "how far through the curriculum am I" would
      // be a bug the learner has to reconcile.
      learning: roadmapPercentComplete,
      practice: percentOf(solved, totalProblems),
      projects: percentOf(completedProjects.length, totalProjects),
      git: gitSummary.percentComplete,
      ai: percentOf(aiSummary.toolsLearned, aiSummary.totalTools),
    },
    lastActiveAt: lastActivity?.createdAt ?? null,
  };
});

/**
 * Percentage, floored at 0 and capped at 100.
 *
 * Rounded to a whole number on purpose: a decimal place would imply a precision
 * the underlying counts do not have.
 */
function percentOf(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
}

/**
 * The state for a learner with no career, or a career whose roadmap has not
 * been authored yet.
 *
 * Everything outside the roadmap is still real — they may have solved practice
 * problems or worked through the Git Academy — so those figures are carried
 * through rather than zeroed. Only the roadmap-shaped fields are empty.
 */
function emptyRoadmapState({
  userId,
  profile,
  career,
  roadmap,
  gitSummary,
  aiSummary,
  practice,
  projects,
  lastActiveAt,
}: {
  userId: string;
  profile: {
    experienceLevel: ExperienceLevel | null;
    selectedLanguage: ProgrammingLanguage | null;
    dailyLearningTime: DailyLearningTime | null;
    mentorSolutionPolicy: MentorSolutionPolicy;
  } | null;
  career: LearnerState["career"];
  roadmap: LearnerState["roadmap"];
  gitSummary: LearnerState["git"];
  aiSummary: LearnerState["ai"];
  practice: LearnerState["practice"];
  projects: LearnerState["projects"];
  lastActiveAt: Date | null;
}): LearnerState {
  return {
    userId,
    career,
    experienceLevel: profile?.experienceLevel ?? null,
    language: profile?.selectedLanguage ?? null,
    studyTime: profile?.dailyLearningTime ?? null,
    mentorSolutionPolicy: profile?.mentorSolutionPolicy ?? "HINTS_ONLY",
    roadmap,
    currentTopic: null,
    resumeTopic: null,
    nextTopic: null,
    completedTopicIds: [],
    pendingRequiredTopicIds: [],
    totalRequiredTopics: 0,
    practice,
    projects,
    git: gitSummary,
    ai: aiSummary,
    progress: {
      roadmap: 0,
      learning: 0,
      practice: percentOf(practice.solved, practice.total),
      projects: percentOf(projects.completed, projects.total),
      git: gitSummary.percentComplete,
      ai: percentOf(aiSummary.toolsLearned, aiSummary.totalTools),
    },
    lastActiveAt,
  };
}

/** Total Git exercises, exported so callers do not re-derive the constant. */
export const TOTAL_GIT_EXERCISES = GIT_EXERCISE_SLUGS.length;
