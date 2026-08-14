import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { db } from "@/lib/db";
import { Container } from "@/components/shared/container";
import { ProblemWorkspace } from "@/components/practice/problem-workspace";
import { requireUser } from "@/lib/session";
import { getExecutionService } from "@/lib/practice/execution";
import { preferredLanguageFor, sortLanguages } from "@/lib/practice/languages";
import {
  availableLanguages,
  getProblemExplanation,
  getProblemForPractice,
  getProblemProgress,
  getRecommendedProblems,
  listProblems,
  listSubmissions,
} from "@/lib/practice/queries";
import type { CodeLanguage } from "@/generated/prisma/client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const problem = await getProblemForPractice(slug);

  // Describes the problem only — never the reader's progress on it.
  return problem
    ? {
        title: problem.title,
        description: problem.description.slice(0, 155),
        robots: { index: false },
      }
    : { title: "Problem not found", robots: { index: false } };
}

export default async function PracticeProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Authentication first: practice is behind a session.
  const user = await requireUser(`/practice/${slug}`);
  const problem = await getProblemForPractice(slug);

  if (!problem) notFound();

  /*
   * Everything this page needs beyond the problem itself, in one round trip's
   * worth of latency.
   *
   * This was five sequential awaits — progress, then saved source, then the
   * explanation, then the next problem — and none of them depends on the
   * result of another. On a problem page that already has to download Monaco,
   * the server was spending four avoidable round trips before it sent a byte.
   *
   * The explanation still hangs off the progress read, because whether to fetch
   * it at all depends on the attempt count — but that two-step chain now runs
   * *alongside* the other reads instead of after all of them, so it costs
   * nothing extra and an unattempted problem still never loads it.
   */
  const [attempt, submissions, profile, savedRows, nextProblem] = await Promise.all([
    getProblemProgress(user.id, problem.id).then(async (progress) => ({
      progress,
      // Withheld until they have attempted, so "unlocks after your first
      // submission" is true of the payload and not just of the UI.
      explanation:
        (progress?.attempts ?? 0) > 0 ? await getProblemExplanation(problem.id) : null,
    })),
    listSubmissions(user.id, problem.id),
    db.profile.findUnique({
      where: { userId: user.id },
      select: { selectedLanguage: true },
    }),
    // Their last source per language, so returning restores the work rather
    // than resetting it. Only ever this user's own submissions.
    db.submission.findMany({
      where: { userId: user.id, problemId: problem.id },
      orderBy: { createdAt: "desc" },
      select: { language: true, code: true },
      take: 25,
    }),
    findNextProblem(user.id, problem.id),
  ]);

  const { progress, explanation } = attempt;

  const problemLanguages = sortLanguages(
    problem.languages.map((entry) => entry.language),
  );
  const runnable = sortLanguages(availableLanguages(problemLanguages));

  // Nothing can run: still show the problem and the editor, with Run and Submit
  // disabled and an honest explanation. Losing a learner's work because of our
  // configuration would be the worse failure.
  const executionUnavailable = runnable.length === 0;
  const offered = executionUnavailable ? problemLanguages : runnable;

  const preferred = preferredLanguageFor(profile?.selectedLanguage);
  const initialLanguage: CodeLanguage =
    (progress?.solvedLanguage && offered.includes(progress.solvedLanguage)
      ? progress.solvedLanguage
      : null) ??
    (preferred && offered.includes(preferred) ? preferred : null) ??
    offered[0];

  const savedCode: Partial<Record<CodeLanguage, string>> = {};
  for (const row of savedRows) savedCode[row.language] ??= row.code;

  const hiddenTestCount = problem._count.testCases - problem.testCases.length;

  return (
    <div className="relative flex-1 py-6 sm:py-8">
      <Container className="max-w-[100rem]">
        <Link
          href="/practice"
          className="inline-flex items-center gap-1.5 rounded text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to practice
        </Link>

        <div className="mt-6">
          <ProblemWorkspace
            problem={problem}
            hiddenTestCount={hiddenTestCount}
            explanation={explanation}
            languages={offered}
            initialLanguage={initialLanguage}
            savedCode={savedCode}
            submissions={submissions}
            solved={progress?.status === "SOLVED"}
            nextProblem={nextProblem}
            executionUnavailable={executionUnavailable}
            executionSimulated={getExecutionService().simulated}
          />
        </div>
      </Container>
    </div>
  );
}

/**
 * Where to go after solving this one: the strongest recommendation that isn't
 * the problem just finished, so the learner stays on what they are studying.
 *
 * Falls back to the next unsolved problem in authored order — a learner who has
 * no career yet still gets somewhere to go rather than a dead end.
 */
async function findNextProblem(userId: string, currentProblemId: string) {
  const { recommendations } = await getRecommendedProblems(userId, 5);

  const recommended = recommendations.find(
    ({ problem }) => problem.id !== currentProblemId,
  );
  if (recommended) {
    return { slug: recommended.problem.slug, title: recommended.problem.title };
  }

  const problems = await listProblems(userId);
  const fallback = problems.find(
    (problem) => problem.id !== currentProblemId && problem.status !== "SOLVED",
  );
  return fallback ? { slug: fallback.slug, title: fallback.title } : null;
}
