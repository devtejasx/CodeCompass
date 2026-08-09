"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { buildFeedback, type FailureDetail } from "@/lib/practice/feedback";
import {
  EXECUTION_LIMITS,
  getExecutionService,
  type ExecutionRequest,
} from "@/lib/practice/execution";
import type { CodeLanguage, SubmissionStatus } from "@/generated/prisma/client";

/**
 * Every practice mutation.
 *
 * Three rules hold throughout:
 *
 *   1. The user comes from the session. A client cannot name whose submission
 *      to create, run or read.
 *   2. Hidden test cases and reference solutions are loaded *here* and nowhere
 *      else, and neither is ever part of a return value.
 *   3. This file never executes the submitted code. It hands it to the
 *      configured execution service and stores what comes back.
 */

const GENERIC_ERROR = "Something went wrong. Please try again in a moment.";
const UNAVAILABLE_ERROR =
  "Code execution is temporarily unavailable. Your code has not been lost.";

export interface PracticeResult {
  ok: boolean;
  error?: string;
}

/** What the workspace renders after a run or a submit. */
export interface SubmissionView {
  id: string;
  kind: "RUN" | "SUBMIT";
  language: CodeLanguage;
  status: SubmissionStatus;
  passedTests: number;
  totalTests: number;
  executionTime: number | null;
  memoryUsed: number | null;
  /** Sanitised compiler/runtime text. */
  message: string | null;
  /** Deterministic teaching note. */
  feedback: string | null;
  failure: FailureDetail | null;
  simulated: boolean;
  /** True when this submission is what marked the problem solved. */
  solved: boolean;
}

export interface StartSubmissionResult extends PracticeResult {
  submissionId?: string;
}

export interface RunSubmissionResult extends PracticeResult {
  submission?: SubmissionView;
}

const LANGUAGES = [
  "JAVASCRIPT",
  "TYPESCRIPT",
  "PYTHON",
  "JAVA",
  "CPP",
] as const satisfies readonly CodeLanguage[];

const startInput = z.object({
  problemId: z.string().min(1),
  language: z.enum(LANGUAGES),
  kind: z.enum(["RUN", "SUBMIT"]),
  code: z
    .string()
    .min(1, "Write some code before running it.")
    // Bounded before it is stored, let alone before it is sent anywhere.
    .max(EXECUTION_LIMITS.maxCodeBytes, "That's larger than a solution needs to be."),
});

/**
 * Creates a QUEUED submission and returns its id.
 *
 * Deliberately separate from running it: the row exists before any execution is
 * attempted, so a learner's code survives a service outage, a closed tab, or a
 * crash mid-run. The client then calls runSubmission, which is what moves it to
 * RUNNING and then to a terminal status.
 */
export async function startSubmission(input: unknown): Promise<StartSubmissionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to run your code." };

  const parsed = startInput.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "That submission could not be read.",
    };
  }

  const { problemId, language, kind, code } = parsed.data;

  try {
    // The problem must exist and must offer this language. Both are checked
    // against the database, never taken from the client's word for it.
    const configured = await db.practiceLanguage.findFirst({
      where: { problemId, language },
      select: { id: true },
    });

    if (!configured) {
      return { ok: false, error: "That problem is not available in this language." };
    }

    if (!getExecutionService().supportedLanguages().includes(language)) {
      return { ok: false, error: UNAVAILABLE_ERROR };
    }

    const submission = await db.submission.create({
      data: { userId: user.id, problemId, language, kind, code, status: "QUEUED" },
      select: { id: true },
    });

    return { ok: true, submissionId: submission.id };
  } catch {
    console.error("[startSubmission] failed to queue submission");
    return { ok: false, error: GENERIC_ERROR };
  }
}

const runInput = z.object({ submissionId: z.string().min(1) });

/**
 * Runs a queued submission and records the verdict.
 *
 * QUEUED → RUNNING → terminal. The intermediate state is written before the
 * service is called, so a poll from another tab (or after a refresh) sees an
 * honest "running" rather than a stale "queued".
 */
export async function runSubmission(input: unknown): Promise<RunSubmissionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to run your code." };

  const parsed = runInput.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "That submission could not be found." };

  try {
    // Ownership is part of the lookup: another user's submission simply is not
    // found, rather than being found and then rejected.
    const submission = await db.submission.findFirst({
      where: { id: parsed.data.submissionId, userId: user.id },
      select: {
        id: true,
        kind: true,
        language: true,
        code: true,
        status: true,
        problemId: true,
      },
    });

    if (!submission) return { ok: false, error: "That submission could not be found." };

    // Already finished — return what we have rather than running it twice.
    if (submission.status !== "QUEUED") {
      const view = await readSubmissionView(user.id, submission.id);
      return view
        ? { ok: true, submission: view }
        : { ok: false, error: GENERIC_ERROR };
    }

    const problem = await db.practiceProblem.findUnique({
      where: { id: submission.problemId },
      select: {
        id: true,
        functionName: true,
        timeLimitMs: true,
        memoryLimitMb: true,
        // Run checks the samples only; Submit runs everything. This where
        // clause is the only place hidden cases are read.
        testCases: {
          where: submission.kind === "RUN" ? { isHidden: false } : {},
          orderBy: { order: "asc" },
          select: { order: true, input: true, expectedOutput: true, isHidden: true },
        },
        languages: {
          where: { language: submission.language },
          select: { starterCode: true, solutionTemplate: true },
        },
      },
    });

    const config = problem?.languages[0];
    if (!problem || !config) {
      await db.submission.update({
        where: { id: submission.id },
        data: { status: "SYSTEM_ERROR" },
      });
      return { ok: false, error: UNAVAILABLE_ERROR };
    }

    await db.submission.update({
      where: { id: submission.id },
      data: { status: "RUNNING" },
    });

    const service = getExecutionService();

    const request: ExecutionRequest = {
      language: submission.language,
      code: submission.code,
      entryPoint: entryPointFor(problem.functionName, submission.language),
      tests: problem.testCases.map((test) => ({
        order: test.order,
        input: test.input,
        expectedOutput: test.expectedOutput,
        isHidden: test.isHidden,
      })),
      timeLimitMs: Math.min(problem.timeLimitMs, EXECUTION_LIMITS.maxTimeLimitMs),
      memoryLimitMb: Math.min(problem.memoryLimitMb, EXECUTION_LIMITS.maxMemoryLimitMb),
      // Development provider only. The HTTP provider never forwards this.
      development: {
        starterCode: config.starterCode,
        referenceSolution: config.solutionTemplate,
      },
    };

    const result = await service.execute(request);

    const { feedback, failure } = buildFeedback(result, problem.testCases, {
      timeLimitMs: problem.timeLimitMs,
      memoryLimitMb: problem.memoryLimitMb,
    });

    await db.submission.update({
      where: { id: submission.id },
      data: {
        status: result.status,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
        message: result.message,
        feedback,
        // Only ever populated for a visible case — see buildFeedback.
        failedTestOrder: failure?.order ?? null,
        failedInput: failure?.input ?? null,
        expectedOutput: failure?.expectedOutput ?? null,
        actualOutput: failure?.actualOutput ?? null,
        simulated: result.simulated,
      },
    });

    const solved =
      submission.kind === "SUBMIT" &&
      (await recordProgress({
        userId: user.id,
        problemId: problem.id,
        status: result.status,
        language: submission.language,
      }));

    if (submission.kind === "SUBMIT") {
      revalidatePath("/practice");
      revalidatePath("/dashboard");
    }

    const view = await readSubmissionView(user.id, submission.id);
    if (!view) return { ok: false, error: GENERIC_ERROR };

    return { ok: true, submission: { ...view, solved: Boolean(solved) } };
  } catch {
    console.error("[runSubmission] execution failed");
    return { ok: false, error: UNAVAILABLE_ERROR };
  }
}

const resultInput = z.object({ submissionId: z.string().min(1) });

/**
 * Reads a submission's current state.
 *
 * Used to poll while a run is in flight and to restore the last result after a
 * refresh. Ownership is enforced by the query, so this is also the answer to
 * "can I read somebody else's submission?" — no, it returns not-found.
 */
export async function getSubmissionState(input: unknown): Promise<RunSubmissionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to see your results." };

  const parsed = resultInput.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "That submission could not be found." };

  try {
    const view = await readSubmissionView(user.id, parsed.data.submissionId);
    if (!view) return { ok: false, error: "That submission could not be found." };
    return { ok: true, submission: view };
  } catch {
    console.error("[getSubmissionState] read failed");
    return { ok: false, error: GENERIC_ERROR };
  }
}

const codeInput = z.object({ submissionId: z.string().min(1) });

export interface SubmissionCodeResult extends PracticeResult {
  code?: string;
  language?: CodeLanguage;
}

/** The learner's own source for one of their own submissions. Never anyone else's. */
export async function getSubmissionCode(input: unknown): Promise<SubmissionCodeResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to see your code." };

  const parsed = codeInput.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "That submission could not be found." };

  try {
    const row = await db.submission.findFirst({
      where: { id: parsed.data.submissionId, userId: user.id },
      select: { code: true, language: true },
    });

    if (!row) return { ok: false, error: "That submission could not be found." };
    return { ok: true, code: row.code, language: row.language };
  } catch {
    console.error("[getSubmissionCode] read failed");
    return { ok: false, error: GENERIC_ERROR };
  }
}

// ── Internals ──────────────────────────────────────────────────────────────

/** Python problems expose snake_case; every other language keeps camelCase. */
function entryPointFor(functionName: string, language: CodeLanguage): string {
  if (language !== "PYTHON") return functionName;
  return functionName.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

/**
 * Applies a graded submission to the learner's progress.
 *
 * Solved is permanent: a later failure moves nothing backwards. A service error
 * is not the learner's fault and does not count as an attempt.
 *
 * Returns true when this submission is the one that solved the problem.
 */
async function recordProgress({
  userId,
  problemId,
  status,
  language,
}: {
  userId: string;
  problemId: string;
  status: SubmissionStatus;
  language: CodeLanguage;
}): Promise<boolean> {
  if (status === "SYSTEM_ERROR") return false;

  const existing = await db.userProblemProgress.findUnique({
    where: { userId_problemId: { userId, problemId } },
    select: { status: true, solvedAt: true },
  });

  const alreadySolved = existing?.status === "SOLVED";
  const accepted = status === "ACCEPTED";

  await db.userProblemProgress.upsert({
    where: { userId_problemId: { userId, problemId } },
    create: {
      userId,
      problemId,
      status: accepted ? "SOLVED" : "ATTEMPTED",
      attempts: 1,
      solvedAt: accepted ? new Date() : null,
      solvedLanguage: accepted ? language : null,
    },
    update: {
      status: accepted || alreadySolved ? "SOLVED" : "ATTEMPTED",
      attempts: { increment: 1 },
      // Keep the moment they *first* solved it, not the most recent success.
      solvedAt: existing?.solvedAt ?? (accepted ? new Date() : null),
      solvedLanguage: alreadySolved ? undefined : accepted ? language : undefined,
    },
  });

  return accepted && !alreadySolved;
}

/** Reads one of the session user's submissions into the client-facing shape. */
async function readSubmissionView(
  userId: string,
  submissionId: string,
): Promise<SubmissionView | null> {
  const row = await db.submission.findFirst({
    where: { id: submissionId, userId },
    select: {
      id: true,
      kind: true,
      language: true,
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
      problemId: true,
    },
  });

  if (!row) return null;

  const progress = await db.userProblemProgress.findUnique({
    where: { userId_problemId: { userId, problemId: row.problemId } },
    select: { status: true },
  });

  return {
    id: row.id,
    kind: row.kind,
    language: row.language,
    status: row.status,
    passedTests: row.passedTests,
    totalTests: row.totalTests,
    executionTime: row.executionTime,
    memoryUsed: row.memoryUsed,
    message: row.message,
    feedback: row.feedback,
    failure:
      row.failedTestOrder === null
        ? null
        : {
            order: row.failedTestOrder,
            input: row.failedInput,
            expectedOutput: row.expectedOutput,
            actualOutput: row.actualOutput,
            // A stored failure with no input is a hidden case by construction.
            isHidden: row.failedInput === null,
          },
    simulated: row.simulated,
    solved: progress?.status === "SOLVED",
  };
}
