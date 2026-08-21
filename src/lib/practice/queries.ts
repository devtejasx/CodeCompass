import { cache } from "react";

import { db } from "@/lib/db";
import { getActiveRoadmapForCareer } from "@/lib/roadmap/queries";
import type { CodeLanguage } from "@/generated/prisma/client";

import { getExecutionService } from "./execution";
import { currentTopicId, recommendProblems } from "./recommend";

/**
 * Practice reads.
 *
 * Note what is *not* selected anywhere in this file: hidden test cases, and
 * PracticeLanguage.solutionTemplate. Both are answer keys. They are fetched in
 * exactly one place — the submission path in @/app/actions/practice — and never
 * by a query whose result is rendered into a page.
 *
 * PracticeProblem.explanation is treated the same way. It is withheld until a
 * learner has actually attempted the problem, and withheld by *not fetching it*
 * rather than by hiding it in the UI — otherwise "unlocks after your first
 * attempt" is a claim view-source disproves.
 */

/** Only ever the visible cases. Hidden ones do not appear in a page payload. */
const VISIBLE_TEST_SELECT = {
  where: { isHidden: false },
  orderBy: { order: "asc" },
  select: { id: true, input: true, expectedOutput: true, order: true },
} as const;

/**
 * One problem, everything the workspace needs to render.
 *
 * `languages` deliberately omits solutionTemplate — the browser gets starter
 * code and nothing else.
 *
 * Memoised per request: `generateMetadata` needs the title and the page needs
 * the whole problem, and Next.js runs both for one navigation. Without this the
 * examples, test cases, starter code and topic tree were loaded twice to render
 * one page.
 */
export const getProblemForPractice = cache(async function getProblemForPractice(
  slug: string,
) {
  return db.practiceProblem.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      difficulty: true,
      // explanation is deliberately absent — see getProblemExplanation.
      constraints: true,
      hints: true,
      functionName: true,
      timeLimitMs: true,
      memoryLimitMb: true,
      estimatedTime: true,
      examples: {
        orderBy: { order: "asc" },
        select: { id: true, input: true, output: true, explanation: true, order: true },
      },
      testCases: VISIBLE_TEST_SELECT,
      languages: {
        orderBy: { language: "asc" },
        select: { language: true, starterCode: true },
      },
      topics: {
        // Primary first — the problem page's breadcrumb follows topics[0], and
        // one link per problem is marked primary precisely so that trail is a
        // decision rather than a row order.
        orderBy: { isPrimary: "desc" },
        select: {
          topic: {
            select: {
              id: true,
              slug: true,
              title: true,
              phase: {
                select: {
                  title: true,
                  // career is null for an ACADEMY roadmap; the title stands in.
                  roadmap: {
                    select: { title: true, career: { select: { name: true } } },
                  },
                },
              },
            },
          },
        },
      },
      _count: { select: { testCases: true } },
    },
  });
});

export type PracticeProblemDetail = NonNullable<
  Awaited<ReturnType<typeof getProblemForPractice>>
>;

/**
 * The teaching explanation, fetched only once a learner has attempted the
 * problem.
 *
 * A separate query on purpose: the point of "the explanation unlocks after your
 * first submission" is that reading the approach before trying teaches nothing.
 * A UI-only gate would leave it sitting in the page source, so the server
 * simply does not send it until it is earned.
 */
export async function getProblemExplanation(problemId: string) {
  const row = await db.practiceProblem.findUnique({
    where: { id: problemId },
    select: { explanation: true },
  });
  return row?.explanation ?? null;
}

/**
 * Every problem in the catalog, with this user's status folded in.
 *
 * Deliberately *not* the whole problem: no description, no explanation, no
 * examples and no test cases. At three hundred problems the difference between
 * this projection and the full row is the difference between a catalog page
 * that loads and one that ships a book to the browser. The full statement is
 * fetched only when a learner opens one, by getProblemForPractice.
 *
 * Memoised per request because the page renders the catalog and the
 * recommendation panel from the same data, and Next.js would otherwise run
 * this twice for one navigation.
 */
export const listProblems = cache(async function listProblems(userId: string) {
  const [problems, progress] = await Promise.all([
    db.practiceProblem.findMany({
      orderBy: [{ sortOrder: "asc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        estimatedTime: true,
        sortOrder: true,
        interviewFrequency: true,
        languages: { select: { language: true } },
        topics: {
          // Primary first: the card shows topics[0] as the problem's pattern,
          // and without this that is whichever row Postgres happened to return
          // — "Objects" instead of "Hash Maps and Sets" for Two Sum. It has
          // been right so far only because the seed inserts the primary link
          // first and nothing has since rewritten the table.
          orderBy: { isPrimary: "desc" },
          select: { topic: { select: { id: true, slug: true, title: true } } },
        },
      },
    }),
    db.userProblemProgress.findMany({
      where: { userId },
      select: { problemId: true, status: true, attempts: true, solvedAt: true },
    }),
  ]);

  const byProblem = new Map(progress.map((row) => [row.problemId, row]));

  return problems.map((problem) => {
    const row = byProblem.get(problem.id);
    return {
      ...problem,
      languages: problem.languages.map((entry) => entry.language),
      topics: problem.topics.map((entry) => entry.topic),
      status: row?.status ?? ("NOT_STARTED" as const),
      attempts: row?.attempts ?? 0,
      solvedAt: row?.solvedAt ?? null,
    };
  });
});

export type ProblemListItem = Awaited<ReturnType<typeof listProblems>>[number];

/**
 * Solved/attempted counts for the practice dashboard, split by difficulty.
 *
 * `totalProblems` is counted rather than written down anywhere, so the figure
 * the page prints is whatever the database actually holds. The two reads are
 * issued together — the count does not depend on the progress rows, and making
 * it wait for them was a round trip spent on nothing.
 */
export async function getPracticeStats(userId: string) {
  const [rows, totalProblems] = await Promise.all([
    db.userProblemProgress.findMany({
      where: { userId },
      select: { status: true, problem: { select: { difficulty: true } } },
    }),
    db.practiceProblem.count(),
  ]);

  const solved = rows.filter((row) => row.status === "SOLVED");

  return {
    solved: solved.length,
    attempted: rows.filter((row) => row.status === "ATTEMPTED").length,
    easySolved: solved.filter((row) => row.problem.difficulty === "EASY").length,
    mediumSolved: solved.filter((row) => row.problem.difficulty === "MEDIUM").length,
    hardSolved: solved.filter((row) => row.problem.difficulty === "HARD").length,
    totalProblems,
  };
}

export interface PracticeContext {
  careerName: string | null;
  currentTopic: { id: string; slug: string; title: string } | null;
}

/**
 * The learner's place in their roadmap, expressed in the terms the practice
 * pages need. Returns nulls rather than failing when they have no career yet.
 */
export async function getPracticeContext(userId: string): Promise<PracticeContext> {
  const profile = await db.profile.findUnique({
    where: { userId },
    select: { chosenCareer: { select: { id: true, name: true } } },
  });

  const career = profile?.chosenCareer ?? null;
  if (!career) return { careerName: null, currentTopic: null };

  const roadmap = await getActiveRoadmapForCareer(career.id);
  if (!roadmap) return { careerName: career.name, currentTopic: null };

  const completed = await db.userTopicProgress.findMany({
    where: { userId, status: "COMPLETED", topic: { phase: { roadmapId: roadmap.id } } },
    orderBy: { completedAt: "desc" },
    select: { topicId: true },
  });

  const topicsInOrder = roadmap.phases.flatMap((phase) => phase.topics);
  const currentId = currentTopicId(
    topicsInOrder,
    completed.map((row) => row.topicId),
  );
  const current = topicsInOrder.find((topic) => topic.id === currentId) ?? null;

  return {
    careerName: career.name,
    currentTopic: current
      ? { id: current.id, slug: current.slug, title: current.title }
      : null,
  };
}

/**
 * "What should I practise right now?"
 *
 * Reads the learner's roadmap position, then ranks with the pure function in
 * ./recommend. An empty array means exactly that — no relevant problems yet.
 */
export async function getRecommendedProblems(userId: string, limit = 6) {
  const profile = await db.profile.findUnique({
    where: { userId },
    select: { chosenCareer: { select: { id: true, name: true } } },
  });

  const career = profile?.chosenCareer ?? null;
  if (!career) return { recommendations: [], currentTopic: null, careerName: null };

  const roadmap = await getActiveRoadmapForCareer(career.id);
  if (!roadmap) {
    return { recommendations: [], currentTopic: null, careerName: career.name };
  }

  const completed = await db.userTopicProgress.findMany({
    where: { userId, status: "COMPLETED", topic: { phase: { roadmapId: roadmap.id } } },
    orderBy: { completedAt: "desc" },
    select: { topicId: true },
  });
  const completedTopicIds = completed.map((row) => row.topicId);

  const topicsInOrder = roadmap.phases.flatMap((phase) => phase.topics);
  const currentId = currentTopicId(topicsInOrder, completedTopicIds);
  const current = topicsInOrder.find((topic) => topic.id === currentId) ?? null;

  const problems = await listProblems(userId);

  const recommendations = recommendProblems({
    currentTopicId: currentId,
    completedTopicIds,
    problems: problems.map((problem) => ({
      ...problem,
      topicIds: problem.topics.map((topic) => topic.id),
    })),
    limit,
  });

  return {
    recommendations,
    currentTopic: current
      ? { id: current.id, slug: current.slug, title: current.title }
      : null,
    careerName: career.name,
  };
}

/** Problems attached to one topic, for the "practise this topic" card. */
export async function getProblemsForTopic(topicId: string, userId?: string) {
  const rows = await db.problemTopic.findMany({
    where: { topicId },
    select: {
      problem: {
        select: {
          id: true,
          slug: true,
          title: true,
          difficulty: true,
          estimatedTime: true,
          sortOrder: true,
        },
      },
    },
  });

  const problems = rows
    .map((row) => row.problem)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (!userId || problems.length === 0) {
    return problems.map((problem) => ({ ...problem, status: "NOT_STARTED" as const }));
  }

  const progress = await db.userProblemProgress.findMany({
    where: { userId, problemId: { in: problems.map((problem) => problem.id) } },
    select: { problemId: true, status: true },
  });
  const byProblem = new Map(progress.map((row) => [row.problemId, row.status]));

  return problems.map((problem) => ({
    ...problem,
    status: byProblem.get(problem.id) ?? ("NOT_STARTED" as const),
  }));
}

/** This user's progress on one problem. Scoped by userId, always. */
export async function getProblemProgress(userId: string, problemId: string) {
  return db.userProblemProgress.findUnique({
    where: { userId_problemId: { userId, problemId } },
    select: {
      status: true,
      attempts: true,
      solvedAt: true,
      solvedLanguage: true,
    },
  });
}

/**
 * Recent submissions for one problem, for the history panel.
 *
 * Scoped by userId in the where clause rather than filtered afterwards, so
 * another learner's submissions are never loaded in the first place.
 */
export async function listSubmissions(userId: string, problemId: string, take = 10) {
  return db.submission.findMany({
    where: { userId, problemId, kind: "SUBMIT" },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      language: true,
      status: true,
      passedTests: true,
      totalTests: true,
      executionTime: true,
      memoryUsed: true,
      simulated: true,
      createdAt: true,
    },
  });
}

export type SubmissionSummary = Awaited<ReturnType<typeof listSubmissions>>[number];

/**
 * One submission in full, including its source.
 *
 * The userId is part of the lookup, not a check afterwards: a request for
 * somebody else's submission finds nothing rather than finding a row we then
 * have to remember to reject.
 */
export async function getSubmission(userId: string, submissionId: string) {
  return db.submission.findFirst({
    where: { id: submissionId, userId },
    select: {
      id: true,
      problemId: true,
      language: true,
      code: true,
      kind: true,
      status: true,
      passedTests: true,
      totalTests: true,
      executionTime: true,
      memoryUsed: true,
      message: true,
      feedback: true,
      failedTestOrder: true,
      failedInput: true,
      expectedOutput: true,
      actualOutput: true,
      simulated: true,
      createdAt: true,
    },
  });
}

export type SubmissionDetail = NonNullable<Awaited<ReturnType<typeof getSubmission>>>;

/**
 * The last code this learner sent for a problem in a given language, so
 * reopening the page restores their work instead of resetting it.
 */
export async function getLatestCode(
  userId: string,
  problemId: string,
  language: CodeLanguage,
) {
  const row = await db.submission.findFirst({
    where: { userId, problemId, language },
    orderBy: { createdAt: "desc" },
    select: { code: true },
  });
  return row?.code ?? null;
}

/**
 * Languages a problem can actually be attempted in: it has starter code for
 * them AND the configured execution service can run them. Never advertise a
 * language that cannot execute.
 */
export function availableLanguages(problemLanguages: CodeLanguage[]): CodeLanguage[] {
  const supported = new Set(getExecutionService().supportedLanguages());
  return problemLanguages.filter((language) => supported.has(language));
}

/** For the dashboard: solved count plus the problem they were last working on. */
export async function getPracticeSummary(userId: string) {
  const [solved, inFlight] = await Promise.all([
    db.userProblemProgress.count({ where: { userId, status: "SOLVED" } }),
    db.userProblemProgress.findFirst({
      where: { userId, status: "ATTEMPTED" },
      orderBy: { updatedAt: "desc" },
      select: {
        attempts: true,
        problem: { select: { slug: true, title: true, difficulty: true } },
      },
    }),
  ]);

  return { solved, inFlight };
}
