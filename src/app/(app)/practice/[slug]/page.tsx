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
  getNextProblemFor,
  getPracticeProfile,
  getProblemExplanation,
  getProblemForPractice,
  getProblemProgress,
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
   *
   * The next problem is no longer among them; see below.
   */
  const [attempt, submissions, profile, savedRows] = await Promise.all([
    getProblemProgress(user.id, problem.id).then(async (progress) => ({
      progress,
      // Withheld until they have attempted, so "unlocks after your first
      // submission" is true of the payload and not just of the UI.
      explanation:
        (progress?.attempts ?? 0) > 0 ? await getProblemExplanation(problem.id) : null,
    })),
    listSubmissions(user.id, problem.id),
    // Shared with the recommendation below rather than read separately: one
    // profile row answers both "which language does the editor open in" and
    // "which career ranks their next problem".
    getPracticeProfile(user.id),
    // Their last source per language, so returning restores the work rather
    // than resetting it. Only ever this user's own submissions.
    //
    // `distinct` rather than a page of history: five languages means at most
    // five rows are ever used, and taking twenty-five pulled twenty-five whole
    // source files across the wire to throw twenty of them away.
    db.submission.findMany({
      where: { userId: user.id, problemId: problem.id },
      orderBy: { createdAt: "desc" },
      distinct: ["language"],
      select: { language: true, code: true },
    }),
  ]);

  const { progress, explanation } = attempt;
  const solved = progress?.status === "SOLVED";

  /*
   * Where to go next — fetched only when it is going to be shown.
   *
   * The "problem solved" card is the only thing on this page that uses it, and
   * that card appears once the learner has solved the problem. Ranking it on
   * every visit meant every first-time opener of every problem paid for a
   * roadmap read and a full catalog scan to produce a link that was never
   * rendered.
   *
   * One consequence, stated because it is a real difference: on the submission
   * that *first* solves a problem, the card appears immediately from client
   * state and its "Next: …" button arrives a moment later, with the
   * router.refresh() the workspace already performs after a SUBMIT. Everything
   * else about the card is unchanged.
   */
  const nextProblem = solved ? await getNextProblemFor(user.id, problem.id) : null;

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
          // A standalone navigation control rather than a link inside a
          // sentence, so it is sized as one. WCAG's target-size rule exempts
          // links in a block of text precisely because an overlay there would
          // sit on top of the lines around it; this is not that.
          className="tap-target inline-flex items-center gap-1.5 rounded text-sm text-muted-foreground transition-colors hover:text-foreground"
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
            solved={solved}
            nextProblem={nextProblem}
            executionUnavailable={executionUnavailable}
            executionSimulated={getExecutionService().simulated}
          />
        </div>
      </Container>
    </div>
  );
}
