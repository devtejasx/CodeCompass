import { db } from "@/lib/db";
import { getLearnerState, type LearnerState } from "@/lib/personalization/state";
import { getGuidance } from "@/lib/personalization/service";
import { listRecentActivity } from "@/lib/personalization/activity";
import type { ActivityType, CapabilityCategory } from "@/generated/prisma/client";

import { getCapabilities, type CapabilityView } from "./capabilities";
import { LEVEL_RANK } from "./levels";

/**
 * The Techie Profile.
 *
 * Answers "what can I actually do?" from evidence, never from a percentage.
 * Everything here is derived from progress the other phases already record, and
 * the recommendation it ends on comes from Phase 10's engine rather than a
 * second copy of that logic — a profile that disagreed with the dashboard about
 * what to do next would be worse than no profile.
 *
 * Nothing is fabricated. Where there is not enough evidence to say something,
 * the answer is that there is not enough evidence, which the UI renders as
 * such.
 */

export interface Strength {
  slug: string;
  name: string;
  /** The evidence, in a sentence built from real counts. */
  evidence: string;
}

export interface Improvement {
  slug: string;
  name: string;
  /** Why this is worth attention, from real counts. */
  reason: string;
  /** What would move it. */
  next: string;
  href: string;
}

export interface Milestone {
  key: string;
  title: string;
  achievedAt: Date | null;
}

export interface TimelineEntry {
  type: ActivityType | "JOINED";
  label: string;
  at: Date;
  href: string | null;
}

export interface ProfileCompletionItem {
  key: string;
  label: string;
  done: boolean;
  href: string;
}

export interface TechieProfile {
  displayName: string;
  username: string | null;
  isPublic: boolean;
  joinedAt: Date;
  state: LearnerState;

  /** One sentence, assembled from the learner's own strongest evidence. */
  summary: string;

  capabilities: CapabilityView[];
  /** Only categories with something in them, in career-appropriate order. */
  categories: { category: CapabilityCategory; capabilities: CapabilityView[] }[];

  strengths: Strength[];
  improvements: Improvement[];
  milestones: Milestone[];
  timeline: TimelineEntry[];
  completion: { items: ProfileCompletionItem[]; done: number; total: number };

  projects: {
    slug: string;
    title: string;
    shortDescription: string;
    difficulty: string;
    completedAt: Date | null;
    status: string;
    technologies: string[];
    milestonesCompleted: number;
    milestonesTotal: number;
    requirementsConfirmed: number;
    requirementsTotal: number;
    repositoryUrl: string | null;
    githubRepoFullName: string | null;
    deployedUrl: string | null;
  }[];

  practice: {
    solved: number;
    attempted: number;
    total: number;
    byDifficulty: { EASY: number; MEDIUM: number; HARD: number };
    languages: string[];
    /** Evidence-based observations, or an empty list when there is too little. */
    insights: string[];
  };

  /** The next action, from Phase 10's engine. Never recomputed here. */
  nextAction: { title: string; reason: string; href: string; action: string } | null;
}

/**
 * Builds the whole profile.
 *
 * Assembled from bulk reads: the capability engine loads only the content its
 * sources reference, and the project and practice sections are one query each.
 * A profile page must not load every lesson and every problem in the catalog.
 */
export async function getTechieProfile(userId: string): Promise<TechieProfile> {
  const [user, capabilities, state, guidance, activities] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        name: true,
        createdAt: true,
        profile: {
          select: { username: true, isPublic: true },
        },
      },
    }),
    getCapabilities(userId),
    getLearnerState(userId),
    getGuidance(userId),
    listRecentActivity(userId, 40),
  ]);

  const [projects, practice, milestoneFacts] = await Promise.all([
    loadProjects(userId),
    loadPractice(userId),
    loadMilestoneFacts(userId),
  ]);

  const strengths = detectStrengths(capabilities);
  const improvements = detectImprovements(capabilities);

  // loadProjects returns everything the learner has touched, in progress as
  // well as finished. Anything that counts *completed* projects has to filter,
  // or the profile claims work that has not been done.
  const completedProjects = projects.filter(
    (project) => project.status === "COMPLETED",
  ).length;

  return {
    displayName: user.name,
    username: user.profile?.username ?? null,
    isPublic: user.profile?.isPublic ?? false,
    joinedAt: user.createdAt,
    state,
    summary: buildSummary({ state, capabilities, completedProjects }),
    capabilities,
    categories: groupByCategory(capabilities),
    strengths,
    improvements,
    milestones: detectMilestones(milestoneFacts, activities, user.createdAt),
    timeline: buildTimeline(activities, user.createdAt),
    completion: profileCompletion(state, completedProjects),
    projects,
    practice,
    nextAction: guidance.next
      ? {
          title: guidance.next.title,
          reason: guidance.next.reason,
          href: guidance.next.href,
          action: guidance.next.action,
        }
      : null,
  };
}

/**
 * One sentence describing what the learner is building towards.
 *
 * Assembled from their own strongest capabilities rather than generated, so it
 * can never name a skill they have no evidence for. A learner with nothing yet
 * gets an honest sentence about starting rather than an invented one.
 */
function buildSummary({
  state,
  capabilities,
  completedProjects,
}: {
  state: LearnerState;
  capabilities: CapabilityView[];
  /** Finished projects only. Naming it plainly is what stops the sentence
   * claiming an in-progress build as a completed one. */
  completedProjects: number;
}): string {
  const career = state.career?.name;

  const named = capabilities
    .filter((capability) => capability.level && LEVEL_RANK[capability.level] >= 2)
    .sort((a, b) => LEVEL_RANK[b.level!] - LEVEL_RANK[a.level!])
    .slice(0, 5)
    .map((capability) => capability.name);

  if (!career && named.length === 0) {
    return "You have not chosen a path yet. Once you do, this is where your capabilities and the evidence behind them will appear.";
  }

  if (named.length === 0) {
    return `You are building toward ${career}. Your capabilities will appear here as you complete topics, solve problems and finish projects — everything on this page is evidence, so it fills in as you do the work.`;
  }

  const list =
    named.length === 1
      ? named[0]
      : `${named.slice(0, -1).join(", ")} and ${named[named.length - 1]}`;

  const built =
    completedProjects > 0
      ? ` You have completed ${completedProjects} ${completedProjects === 1 ? "project" : "projects"}.`
      : "";

  return career
    ? `You are building toward ${career}, with evidence in ${list}.${built}`
    : `You have evidence in ${list}.${built}`;
}

/**
 * Capabilities with enough evidence to call a strength.
 *
 * APPLYING or above only — meaning they have built something with it. Calling
 * something a strength on the basis of a completed lesson would make the word
 * meaningless, and a learner would rightly stop believing the rest of the page.
 */
export function detectStrengths(capabilities: CapabilityView[]): Strength[] {
  return capabilities
    .filter((capability) => capability.level && LEVEL_RANK[capability.level] >= 4)
    .sort((a, b) => LEVEL_RANK[b.level!] - LEVEL_RANK[a.level!])
    .slice(0, 4)
    .map((capability) => ({
      slug: capability.slug,
      name: capability.name,
      evidence: evidenceSentence(capability),
    }));
}

/**
 * Where a small amount of work would make the most difference.
 *
 * Chosen as the capabilities closest to their next rung, so every entry has a
 * concrete next step rather than a vague "do more". Nothing here is phrased as
 * a shortcoming: the reason states what has been done and the next step states
 * what would follow it.
 */
export function detectImprovements(capabilities: CapabilityView[]): Improvement[] {
  return (
    capabilities
      .filter((capability) => capability.level !== null && capability.next !== null)
      // Furthest along first: somebody one project away from APPLYING is a better
      // suggestion than somebody who has just opened a topic.
      .sort((a, b) => LEVEL_RANK[b.level!] - LEVEL_RANK[a.level!])
      .slice(0, 4)
      .map((capability) => ({
        slug: capability.slug,
        name: capability.name,
        reason: evidenceSentence(capability),
        next: capability.next!.requirement,
        href: `/profile/skills/${capability.slug}`,
      }))
  );
}

/** "1 project" / "2 projects", so the evidence never reads as a placeholder. */
function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/** A factual sentence from the counts. Never an adjective about the person. */
function evidenceSentence(capability: CapabilityView): string {
  const { evidence } = capability;
  const parts: string[] = [];

  if (evidence.topicsCompleted > 0) {
    parts.push(
      `${evidence.topicsCompleted} of ${plural(evidence.topicsTotal, "topic")} completed`,
    );
  }
  if (evidence.problemsSolved > 0) {
    parts.push(`${plural(evidence.problemsSolved, "practice problem")} solved`);
  }
  if (evidence.projectsCompleted > 0) {
    parts.push(`${plural(evidence.projectsCompleted, "project")} completed`);
  }
  if (evidence.gitExercisesCompleted > 0) {
    parts.push(`${plural(evidence.gitExercisesCompleted, "Git exercise")} solved`);
  }
  if (evidence.aiWorkflowsCompleted > 0) {
    parts.push(`${plural(evidence.aiWorkflowsCompleted, "AI workflow")} used`);
  }
  if (evidence.aiToolsCompleted > 0) {
    parts.push(`${plural(evidence.aiToolsCompleted, "AI learning path")} completed`);
  }

  if (parts.length === 0) return "You have started looking at this.";

  return parts.length === 1
    ? `${parts[0]}.`
    : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}.`;
}

/** Only categories the learner has something in, in catalog order. */
function groupByCategory(capabilities: CapabilityView[]) {
  const order: CapabilityCategory[] = [
    "PROGRAMMING",
    "WEB_DEVELOPMENT",
    "FRAMEWORKS",
    "DATA",
    "VERSION_CONTROL",
    "DEVELOPER_TOOLS",
    "AI_SKILLS",
    "PROJECT_DELIVERY",
  ];

  return (
    order
      .map((category) => ({
        category,
        capabilities: capabilities
          .filter((capability) => capability.category === category)
          .sort(
            (a, b) =>
              (b.level ? LEVEL_RANK[b.level] : 0) -
                (a.level ? LEVEL_RANK[a.level] : 0) || a.sortOrder - b.sortOrder,
          ),
      }))
      // An empty category is not rendered: a heading with nothing under it reads
      // as something broken rather than as something not started.
      .filter((group) =>
        group.capabilities.some((capability) => capability.level !== null),
      )
  );
}

/** The projects a learner has actually engaged with, newest first. */
async function loadProjects(userId: string) {
  const rows = await db.userProject.findMany({
    where: { userId, status: { in: ["IN_PROGRESS", "COMPLETED"] } },
    orderBy: [{ completedAt: "desc" }, { updatedAt: "desc" }],
    select: {
      status: true,
      completedAt: true,
      repositoryUrl: true,
      deployedUrl: true,
      githubRepoFullName: true,
      _count: {
        select: { milestones: { where: { status: "COMPLETED" } }, confirmations: true },
      },
      project: {
        select: {
          slug: true,
          title: true,
          shortDescription: true,
          difficulty: true,
          technologies: { orderBy: { order: "asc" }, select: { name: true } },
          _count: {
            select: { milestones: true, requirements: { where: { isRequired: true } } },
          },
        },
      },
    },
  });

  return rows.map((row) => ({
    slug: row.project.slug,
    title: row.project.title,
    shortDescription: row.project.shortDescription,
    difficulty: row.project.difficulty,
    status: row.status,
    completedAt: row.completedAt,
    technologies: row.project.technologies.map((technology) => technology.name),
    milestonesCompleted: row._count.milestones,
    milestonesTotal: row.project._count.milestones,
    requirementsConfirmed: row._count.confirmations,
    requirementsTotal: row.project._count.requirements,
    repositoryUrl: row.repositoryUrl,
    githubRepoFullName: row.githubRepoFullName,
    deployedUrl: row.deployedUrl,
  }));
}

/** Practice history, plus observations only where the data supports them. */
async function loadPractice(userId: string) {
  const [rows, total] = await Promise.all([
    db.userProblemProgress.findMany({
      where: { userId },
      select: {
        status: true,
        solvedLanguage: true,
        problem: {
          select: {
            difficulty: true,
            topics: { select: { topic: { select: { title: true } } } },
          },
        },
      },
    }),
    db.practiceProblem.count(),
  ]);

  const solved = rows.filter((row) => row.status === "SOLVED");
  const attempted = rows.filter((row) => row.status === "ATTEMPTED");

  const byDifficulty = {
    EASY: solved.filter((row) => row.problem.difficulty === "EASY").length,
    MEDIUM: solved.filter((row) => row.problem.difficulty === "MEDIUM").length,
    HARD: solved.filter((row) => row.problem.difficulty === "HARD").length,
  };

  const languages = [
    ...new Set(
      solved
        .map((row) => row.solvedLanguage)
        .filter((language): language is NonNullable<typeof language> =>
          Boolean(language),
        ),
    ),
  ];

  return {
    solved: solved.length,
    attempted: attempted.length,
    total,
    byDifficulty,
    languages,
    insights: practiceInsights(solved, attempted),
  };
}

/** Minimum solved problems before any observation is worth making. */
const INSIGHT_THRESHOLD = 5;

/**
 * Observations from practice history.
 *
 * Returns an empty list below the threshold rather than reaching for something
 * to say. "You are strongest in arrays" after three problems is not an insight,
 * it is a coincidence presented as a finding — and a learner who notices that
 * once will discount everything else on the page.
 */
function practiceInsights(
  solved: { problem: { topics: { topic: { title: string } }[] } }[],
  attempted: { problem: { topics: { topic: { title: string } }[] } }[],
): string[] {
  if (solved.length < INSIGHT_THRESHOLD) return [];

  const insights: string[] = [];

  const countByTopic = (
    rows: { problem: { topics: { topic: { title: string } }[] } }[],
  ) => {
    const counts = new Map<string, number>();
    for (const row of rows) {
      for (const link of row.problem.topics) {
        counts.set(link.topic.title, (counts.get(link.topic.title) ?? 0) + 1);
      }
    }
    return counts;
  };

  const solvedByTopic = countByTopic(solved);
  const attemptedByTopic = countByTopic(attempted);

  const strongest = [...solvedByTopic.entries()].sort((a, b) => b[1] - a[1])[0];
  if (strongest && strongest[1] >= 3) {
    insights.push(
      `Most of your solved problems are in ${strongest[0]} — ${strongest[1]} of them.`,
    );
  }

  const stuck = [...attemptedByTopic.entries()]
    .filter(([topic, count]) => count >= 2 && (solvedByTopic.get(topic) ?? 0) === 0)
    .sort((a, b) => b[1] - a[1])[0];
  if (stuck) {
    insights.push(
      `You have open attempts on ${stuck[1]} ${stuck[0]} problems that are not solved yet.`,
    );
  }

  return insights;
}

/**
 * Whether each milestone has actually happened, read from the tables that own
 * the answer.
 *
 * One query per milestone, each one a cheap indexed existence check.
 */
async function loadMilestoneFacts(userId: string) {
  const [career, topic, problem, project, git, ai] = await Promise.all([
    db.profile.findFirst({
      where: { userId, selectedCareerId: { not: null } },
      select: { updatedAt: true },
    }),
    db.userTopicProgress.findFirst({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "asc" },
      select: { completedAt: true },
    }),
    db.userProblemProgress.findFirst({
      where: { userId, status: "SOLVED" },
      orderBy: { solvedAt: "asc" },
      select: { solvedAt: true },
    }),
    db.userProject.findFirst({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "asc" },
      select: { completedAt: true },
    }),
    db.userGitExercise.findFirst({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "asc" },
      select: { completedAt: true },
    }),
    // A row here *is* the completion — the workflow table has no pending
    // state, so existence is the fact and completedAt is never null.
    db.userAIWorkflowProgress.findFirst({
      where: { userId },
      orderBy: { completedAt: "asc" },
      select: { completedAt: true },
    }),
  ]);

  return {
    career: Boolean(career),
    topic: topic?.completedAt ?? null,
    topicDone: Boolean(topic),
    problem: problem?.solvedAt ?? null,
    problemDone: Boolean(problem),
    project: project?.completedAt ?? null,
    projectDone: Boolean(project),
    git: git?.completedAt ?? null,
    gitDone: Boolean(git),
    ai: ai?.completedAt ?? null,
    aiDone: Boolean(ai),
  };
}

/**
 * Meaningful firsts.
 *
 * Six of them, not sixty. Each one marks a genuine change in what somebody can
 * do — the first time they finished a project is different in kind from the
 * fourteenth topic — and there is no points system, no badge wall and nothing
 * to collect.
 *
 * **Whether** a milestone happened comes from the entity tables; the activity
 * log only supplies **when**, and only as a fallback where the owning table has
 * no timestamp of its own. That split matters: `recordActivity` deliberately
 * swallows its own failures, so a log-only derivation meant one failed insert
 * permanently told a learner they had never chosen a career or finished a
 * project — while the rest of the same page showed both.
 *
 * A milestone that is real but whose timestamp was lost shows as achieved with
 * the learner's join date behind it, which is honest: it happened, and the
 * exact moment is not worth inventing.
 */
export function detectMilestones(
  facts: Awaited<ReturnType<typeof loadMilestoneFacts>>,
  activities: { type: ActivityType; createdAt: Date }[],
  joinedAt: Date,
): Milestone[] {
  const firstOf = (type: ActivityType) => {
    const matching = activities
      .filter((activity) => activity.type === type)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return matching[0]?.createdAt ?? null;
  };

  /** Achieved-at for something we know happened, best timestamp available. */
  const when = (done: boolean, owned: Date | null, type: ActivityType) =>
    done ? (owned ?? firstOf(type) ?? joinedAt) : null;

  return [
    { key: "joined", title: "Started CodeCompass", achievedAt: joinedAt },
    {
      key: "career",
      title: "Chose a career path",
      // Profile has no "chose at" column, so the activity row is the only real
      // timestamp; the *fact* still comes from selectedCareerId being set.
      achievedAt: when(facts.career, null, "CAREER_SELECTED"),
    },
    {
      key: "topic",
      title: "Completed a first topic",
      achievedAt: when(facts.topicDone, facts.topic, "LESSON_COMPLETED"),
    },
    {
      key: "problem",
      title: "Solved a first coding problem",
      achievedAt: when(facts.problemDone, facts.problem, "PROBLEM_SOLVED"),
    },
    {
      key: "project",
      title: "Completed a first project",
      achievedAt: when(facts.projectDone, facts.project, "PROJECT_COMPLETED"),
    },
    {
      key: "git",
      title: "Solved a first Git exercise",
      achievedAt: when(facts.gitDone, facts.git, "GIT_EXERCISE_COMPLETED"),
    },
    {
      key: "ai",
      title: "Used a first AI workflow",
      achievedAt: when(facts.aiDone, facts.ai, "AI_WORKFLOW_COMPLETED"),
    },
  ];
}

/** The journey, oldest first, from real activity. */
function buildTimeline(
  activities: {
    type: ActivityType;
    label: string;
    entitySlug: string | null;
    createdAt: Date;
  }[],
  joinedAt: Date,
): TimelineEntry[] {
  // Only the events that mark progress. Starting a lesson is noise in a
  // timeline; finishing one is the story.
  const interesting = new Set<ActivityType>([
    "CAREER_SELECTED",
    "LESSON_COMPLETED",
    "PROBLEM_SOLVED",
    "PROJECT_STARTED",
    "PROJECT_COMPLETED",
    "GIT_EXERCISE_COMPLETED",
    "AI_TOOL_STARTED",
    "AI_WORKFLOW_COMPLETED",
  ]);

  const entries: TimelineEntry[] = activities
    .filter((activity) => interesting.has(activity.type))
    .map((activity) => ({
      type: activity.type,
      label: activity.label,
      at: activity.createdAt,
      href: null,
    }));

  entries.push({
    type: "JOINED",
    label: "Started CodeCompass",
    at: joinedAt,
    href: null,
  });

  return entries.sort((a, b) => a.at.getTime() - b.at.getTime()).slice(-12);
}

/**
 * Profile completion — useful setup, not a checklist of every feature.
 *
 * Everything here is something that genuinely improves the product for the
 * learner. A public profile is deliberately absent: it is optional, and putting
 * it in a completion bar would be pressure to make something public.
 */
export function profileCompletion(
  state: LearnerState,
  projectsCompleted: number,
): { items: ProfileCompletionItem[]; done: number; total: number } {
  const items: ProfileCompletionItem[] = [
    {
      key: "career",
      label: "Chose a career path",
      done: state.career !== null,
      href: "/careers",
    },
    {
      key: "language",
      label: "Picked a programming language",
      done: state.language !== null && state.language !== "NOT_SURE",
      href: "/onboarding",
    },
    {
      key: "roadmap",
      label: "Started the roadmap",
      done: state.completedTopicIds.length > 0,
      href: "/roadmap",
    },
    {
      key: "practice",
      label: "Solved a coding problem",
      done: state.practice.solved > 0,
      href: "/practice",
    },
    {
      key: "project",
      label: "Completed a project",
      done: projectsCompleted > 0,
      href: "/projects",
    },
    {
      key: "git",
      label: "Started Git & GitHub",
      done: state.git.completedModules > 0,
      href: "/academy/git",
    },
    {
      key: "ai",
      label: "Started the AI Academy",
      done: state.ai.toolsLearned > 0 || state.ai.toolsInProgress > 0,
      href: "/academy/ai-tools",
    },
  ];

  return {
    items,
    done: items.filter((item) => item.done).length,
    total: items.length,
  };
}

export { getCapabilities, getCapabilityDetail } from "./capabilities";
