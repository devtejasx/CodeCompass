import { cache } from "react";

import { db } from "@/lib/db";
import { getRoadmapTopicOrder } from "@/lib/roadmap/queries";
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
 * The problem catalog as the *ranking* needs it, which is far less than the
 * catalog page needs.
 *
 * No languages, no topic titles, no estimated time, no interview frequency -
 * recommendProblems reads difficulty, sortOrder, topic ids and status, and the
 * link it produces needs a slug and a title. Three queries and a few kilobytes
 * instead of five and a few hundred.
 *
 * The catalog page keeps listProblems, because a card genuinely shows all of
 * that. This exists for the problem page, which ranks without rendering cards.
 */
export const listProblemsForRanking = cache(async function listProblemsForRanking(
  userId: string,
) {
  const [problems, progress] = await Promise.all([
    db.practiceProblem.findMany({
      orderBy: [{ sortOrder: "asc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        sortOrder: true,
        topics: { select: { topicId: true } },
      },
    }),
    db.userProblemProgress.findMany({
      where: { userId },
      select: { problemId: true, status: true },
    }),
  ]);

  const byProblem = new Map(progress.map((row) => [row.problemId, row.status]));

  return problems.map((problem) => ({
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty,
    sortOrder: problem.sortOrder,
    topicIds: problem.topics.map((entry) => entry.topicId),
    status: byProblem.get(problem.id) ?? ("NOT_STARTED" as const),
  }));
});

/**
 * The learner's career, read once per request.
 *
 * Three things wanted this row on a practice render - the language the editor
 * opens in, the recommendation ranking and the practice context - and each
 * fetched it separately because each selected different columns. One select
 * covering all three, memoised, is one query instead of three.
 */
export const getPracticeProfile = cache(async function getPracticeProfile(
  userId: string,
) {
  return db.profile.findUnique({
    where: { userId },
    select: {
      selectedLanguage: true,
      chosenCareer: { select: { id: true, name: true } },
    },
  });
});

/**
 * Solved/attempted counts for the practice dashboard, split by difficulty.
 *
 * Counted from the catalog rather than read again. Every figure here - the
 * status of each problem, its difficulty, and how many problems exist - is
 * already in what listProblems returns, and the practice page has always
 * loaded that on the same render. Asking Postgres a second time for a join it
 * had just answered cost two more queries and a round trip to arrive at the
 * same numbers.
 *
 * listProblems is memoised per request, so on the page this is free; called on
 * its own it loads the catalog, which is the honest price of the figures.
 *
 * `totalProblems` is still counted rather than written down anywhere, so the
 * page cannot drift out of step with what is actually seeded.
 */
export async function getPracticeStats(userId: string) {
  const problems = await listProblems(userId);
  const solved = problems.filter((problem) => problem.status === "SOLVED");

  return {
    solved: solved.length,
    attempted: problems.filter((problem) => problem.status === "ATTEMPTED").length,
    easySolved: solved.filter((problem) => problem.difficulty === "EASY").length,
    mediumSolved: solved.filter((problem) => problem.difficulty === "MEDIUM").length,
    hardSolved: solved.filter((problem) => problem.difficulty === "HARD").length,
    totalProblems: problems.length,
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
  const position = await roadmapPosition(userId);
  if (!position) return { careerName: null, currentTopic: null };

  return {
    careerName: position.careerName,
    currentTopic: position.currentTopic,
  };
}

/**
 * Where the learner is in their roadmap, in the two facts practice needs: the
 * topic they are on, and the topics they have finished, most recent first.
 *
 * Extracted because the recommendation and the context were doing the same
 * four reads independently, and because it is where the expensive read used to
 * be: getActiveRoadmapForCareer loads phase descriptions, prerequisite edges
 * and whether each topic has a lesson, none of which is used to answer "which
 * topic am I on?". getRoadmapTopicOrder answers exactly that.
 */
async function roadmapPosition(userId: string) {
  const profile = await getPracticeProfile(userId);
  const career = profile?.chosenCareer ?? null;
  if (!career) return null;

  const roadmap = await getRoadmapTopicOrder(career.id);
  if (!roadmap) {
    return {
      careerName: career.name,
      currentTopic: null,
      currentTopicId: null,
      completedTopicIds: [] as string[],
    };
  }

  const completed = await db.userTopicProgress.findMany({
    where: { userId, status: "COMPLETED", topic: { phase: { roadmapId: roadmap.id } } },
    orderBy: { completedAt: "desc" },
    select: { topicId: true },
  });

  const completedTopicIds = completed.map((row) => row.topicId);
  const currentId = currentTopicId(roadmap.topics, completedTopicIds);
  const current = roadmap.topics.find((topic) => topic.id === currentId) ?? null;

  return {
    careerName: career.name,
    currentTopic: current
      ? { id: current.id, slug: current.slug, title: current.title }
      : null,
    currentTopicId: currentId,
    completedTopicIds,
  };
}

/**
 * "What should I practise right now?"
 *
 * Reads the learner's roadmap position, then ranks with the pure function in
 * ./recommend. An empty array means exactly that — no relevant problems yet.
 */
export async function getRecommendedProblems(userId: string, limit = 6) {
  const position = await roadmapPosition(userId);
  if (!position) return { recommendations: [], currentTopic: null, careerName: null };
  if (position.currentTopicId === null && position.completedTopicIds.length === 0) {
    return {
      recommendations: [],
      currentTopic: position.currentTopic,
      careerName: position.careerName,
    };
  }

  const problems = await listProblems(userId);

  const recommendations = recommendProblems({
    currentTopicId: position.currentTopicId,
    completedTopicIds: position.completedTopicIds,
    problems: problems.map((problem) => ({
      ...problem,
      topicIds: problem.topics.map((topic) => topic.id),
    })),
    limit,
  });

  return {
    recommendations,
    currentTopic: position.currentTopic,
    careerName: position.careerName,
  };
}

/**
 * Where a learner goes after solving one problem.
 *
 * The strongest recommendation that is not the problem they just finished,
 * falling back to the next unsolved problem in authored order - which is what
 * the problem page has always shown, moved here so it can be ranked from the
 * lean projection instead of the catalog one.
 *
 * Called only when the "problem solved" card is actually going to be rendered.
 * That card is the only thing on the page that uses this, and it appears only
 * once a learner has solved the problem, so computing it on every visit meant
 * eight queries and a full catalog read to produce something almost nobody was
 * shown. See the problem page for the one consequence of the change.
 */
export async function getNextProblemFor(userId: string, currentProblemId: string) {
  const problems = await listProblemsForRanking(userId);
  const position = await roadmapPosition(userId);

  if (position) {
    const [best] = recommendProblems({
      currentTopicId: position.currentTopicId,
      completedTopicIds: position.completedTopicIds,
      problems: problems.filter((problem) => problem.id !== currentProblemId),
      limit: 1,
    });
    if (best) return { slug: best.problem.slug, title: best.problem.title };
  }

  const fallback = problems.find(
    (problem) => problem.id !== currentProblemId && problem.status !== "SOLVED",
  );
  return fallback ? { slug: fallback.slug, title: fallback.title } : null;
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
