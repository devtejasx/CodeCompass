"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { gradeAttempt, topicPercent } from "@/lib/learn/progress";

/**
 * Every learning mutation.
 *
 * The user always comes from the session — a client cannot name whose progress
 * to write. Topic and section ids are checked against the database before use,
 * so a crafted request cannot write progress for something that doesn't exist
 * or belong where it claims.
 */

export interface LearnResult {
  ok: boolean;
  error?: string;
}

const GENERIC_ERROR = "Something went wrong. Please try again in a moment.";

/** Recomputes and stores a topic's percentage from its section ticks. */
async function refreshTopicPercent(userId: string, topicId: string) {
  const lesson = await db.lesson.findUnique({
    where: { topicId },
    select: { id: true, _count: { select: { sections: true } } },
  });

  const progress = await db.userTopicProgress.findUnique({
    where: { userId_topicId: { userId, topicId } },
    select: { status: true, bestScore: true },
  });

  if (!lesson || !progress) return;
  if (progress.status === "COMPLETED") return; // already 100

  const completedSections = await db.userSectionProgress.count({
    where: { userId, section: { lessonId: lesson.id } },
  });

  await db.userTopicProgress.update({
    where: { userId_topicId: { userId, topicId } },
    data: {
      percentComplete: topicPercent({
        totalSections: lesson._count.sections,
        completedSections,
        passed: false,
      }),
    },
  });
}

const topicInput = z.object({ topicId: z.string().min(1) });

/**
 * Marks a topic as started. Idempotent — opening a topic again just refreshes
 * lastAccessedAt, which is what drives "continue where you left off".
 */
export async function startTopic(input: unknown): Promise<LearnResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to start learning." };

  const parsed = topicInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That topic could not be found." };

  try {
    const topic = await db.topic.findUnique({
      where: { id: parsed.data.topicId },
      select: { id: true },
    });
    if (!topic) return { ok: false, error: "That topic could not be found." };

    await db.userTopicProgress.upsert({
      where: { userId_topicId: { userId: user.id, topicId: topic.id } },
      create: {
        userId: user.id,
        topicId: topic.id,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
      // Never downgrade a completed topic back to in-progress.
      update: { lastAccessedAt: new Date() },
    });
  } catch {
    console.error("[startTopic] failed to record topic start");
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidatePath("/roadmap");
  return { ok: true };
}

const sectionInput = z.object({
  sectionId: z.string().min(1),
  completed: z.boolean(),
});

/** Ticks or un-ticks a lesson section, then refreshes the topic percentage. */
export async function setSectionComplete(input: unknown): Promise<LearnResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to save your progress." };

  const parsed = sectionInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That section could not be found." };

  try {
    const section = await db.lessonSection.findUnique({
      where: { id: parsed.data.sectionId },
      select: { id: true, lesson: { select: { topicId: true } } },
    });
    if (!section) return { ok: false, error: "That section could not be found." };

    const topicId = section.lesson.topicId;

    // Reading a section implies the topic has been started.
    await db.userTopicProgress.upsert({
      where: { userId_topicId: { userId: user.id, topicId } },
      create: {
        userId: user.id,
        topicId,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
      update: { lastAccessedAt: new Date() },
    });

    if (parsed.data.completed) {
      await db.userSectionProgress.upsert({
        where: { userId_sectionId: { userId: user.id, sectionId: section.id } },
        create: { userId: user.id, sectionId: section.id },
        update: {},
      });
    } else {
      await db.userSectionProgress.deleteMany({
        where: { userId: user.id, sectionId: section.id },
      });
    }

    await refreshTopicPercent(user.id, topicId);
  } catch {
    console.error("[setSectionComplete] failed to record section progress");
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidatePath("/roadmap");
  return { ok: true };
}

const attemptInput = z.object({
  topicId: z.string().min(1),
  answers: z
    .array(z.object({ questionId: z.string().min(1), optionId: z.string().min(1) }))
    .min(1),
});

export interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string;
}

export interface AttemptResult extends LearnResult {
  score?: number;
  passed?: boolean;
  correctCount?: number;
  total?: number;
  results?: QuestionResult[];
}

/**
 * Grades a knowledge-check attempt.
 *
 * Grading is server-side and the correct answers are looked up here, so the
 * key is never present in the page the learner is looking at. The response
 * carries per-question explanations because the feedback is meant to teach,
 * not merely to score.
 */
export async function submitKnowledgeCheck(input: unknown): Promise<AttemptResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to submit your answers." };

  const parsed = attemptInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please answer every question before submitting." };
  }

  try {
    const lesson = await db.lesson.findUnique({
      where: { topicId: parsed.data.topicId },
      select: {
        id: true,
        _count: { select: { sections: true } },
        knowledgeChecks: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            explanation: true,
            options: { select: { id: true, isCorrect: true } },
          },
        },
      },
    });

    if (!lesson || lesson.knowledgeChecks.length === 0) {
      return { ok: false, error: "This topic has no knowledge check yet." };
    }

    const answers = new Map(
      parsed.data.answers.map((answer) => [answer.questionId, answer.optionId]),
    );

    // Grade against every question in the lesson, so omitting a question in
    // the payload counts as wrong rather than shrinking the denominator.
    const results: QuestionResult[] = lesson.knowledgeChecks.map((check) => {
      const correctOption = check.options.find((option) => option.isCorrect);
      const chosen = answers.get(check.id);

      return {
        questionId: check.id,
        isCorrect: Boolean(correctOption && chosen === correctOption.id),
        correctOptionId: correctOption?.id ?? "",
        explanation: check.explanation,
      };
    });

    const { score, passed, correctCount, total } = gradeAttempt(results);

    const existing = await db.userTopicProgress.findUnique({
      where: { userId_topicId: { userId: user.id, topicId: parsed.data.topicId } },
      select: { bestScore: true, attempts: true, status: true },
    });

    const completedSections = await db.userSectionProgress.count({
      where: { userId: user.id, section: { lessonId: lesson.id } },
    });

    const alreadyCompleted = existing?.status === "COMPLETED";
    const bestScore = Math.max(score, existing?.bestScore ?? 0);

    await db.userTopicProgress.upsert({
      where: { userId_topicId: { userId: user.id, topicId: parsed.data.topicId } },
      create: {
        userId: user.id,
        topicId: parsed.data.topicId,
        status: passed ? "COMPLETED" : "IN_PROGRESS",
        percentComplete: topicPercent({
          totalSections: lesson._count.sections,
          completedSections,
          passed,
        }),
        bestScore: score,
        attempts: 1,
        startedAt: new Date(),
        completedAt: passed ? new Date() : null,
      },
      update: {
        // A later failed attempt never un-completes a topic.
        status: passed || alreadyCompleted ? "COMPLETED" : "IN_PROGRESS",
        percentComplete: topicPercent({
          totalSections: lesson._count.sections,
          completedSections,
          passed: passed || alreadyCompleted,
        }),
        bestScore,
        attempts: { increment: 1 },
        completedAt: alreadyCompleted ? undefined : passed ? new Date() : null,
        lastAccessedAt: new Date(),
      },
    });

    revalidatePath("/roadmap");
    revalidatePath("/dashboard");

    return { ok: true, score, passed, correctCount, total, results };
  } catch {
    console.error("[submitKnowledgeCheck] failed to grade attempt");
    return { ok: false, error: GENERIC_ERROR };
  }
}

// NOTE: a "use server" file may export *only* async functions. Re-exporting a
// constant here makes every action in the file fail at runtime with a 500,
// even though it type-checks and builds cleanly. Import PASSING_SCORE from
// @/lib/learn/progress instead.
