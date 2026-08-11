"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { syncToolProgress } from "@/lib/ai-tools/progress";

/**
 * Every AI Academy mutation.
 *
 * There are only two, and both are small on purpose. The Academy's real
 * progress lives in UserTopicProgress — completing a lesson is an ordinary
 * learning action, handled by actions/learn.ts, which then re-syncs every tool
 * whose path includes that topic. These actions cover the two things that are
 * genuinely tool-level: declaring that you have started one, and ticking off a
 * workflow you have actually used.
 *
 * The user always comes from the session; a client cannot name whose progress
 * to write. Ids are checked against the database before use, so a crafted
 * request cannot write progress for something that does not exist.
 */

export interface AIToolResult {
  ok: boolean;
  error?: string;
}

const GENERIC_ERROR = "Something went wrong. Please try again in a moment.";

const toolInput = z.object({ toolSlug: z.string().min(1).max(100) });

/**
 * Marks a tool as started.
 *
 * Idempotent: starting again just refreshes lastAccessedAt, which is what
 * drives "continue learning" on the dashboard. The percentage is recomputed
 * from the learner's topic progress rather than set here, so a learner who has
 * already completed the shared lessons through another tool's path sees the
 * true figure immediately rather than 0%.
 */
export async function startTool(input: unknown): Promise<AIToolResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to track your progress." };

  const parsed = toolInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That tool could not be found." };

  try {
    const tool = await db.aITool.findUnique({
      where: { slug: parsed.data.toolSlug },
      select: { id: true, slug: true },
    });
    if (!tool) return { ok: false, error: "That tool could not be found." };

    await syncToolProgress({ userId: user.id, toolId: tool.id, touch: true });

    revalidatePath("/academy/ai-tools");
    revalidatePath(`/academy/ai-tools/${tool.slug}`);
    revalidatePath("/dashboard");

    return { ok: true };
  } catch {
    console.error("[startTool] failed to record tool start");
    return { ok: false, error: GENERIC_ERROR };
  }
}

const workflowInput = z.object({
  workflowSlug: z.string().min(1).max(100),
  completed: z.boolean(),
});

/**
 * Ticks or un-ticks a workflow.
 *
 * Self-reported, exactly like a project's self-evaluation. CodeCompass cannot
 * watch somebody debug, so this records the learner's own assertion that they
 * have used the workflow — and the UI says so rather than implying it was
 * verified. Un-ticking is supported because a checkbox that only goes one way
 * is a trap, not a record.
 */
export async function setWorkflowComplete(input: unknown): Promise<AIToolResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to track your progress." };

  const parsed = workflowInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That workflow could not be found." };

  try {
    const workflow = await db.aIWorkflow.findUnique({
      where: { slug: parsed.data.workflowSlug },
      select: { id: true, slug: true },
    });
    if (!workflow) return { ok: false, error: "That workflow could not be found." };

    if (parsed.data.completed) {
      await db.userAIWorkflowProgress.upsert({
        where: {
          userId_workflowId: { userId: user.id, workflowId: workflow.id },
        },
        create: { userId: user.id, workflowId: workflow.id },
        update: {},
      });
    } else {
      // deleteMany rather than delete: scoped by userId, and a missing row is
      // not an error — un-ticking something already un-ticked should succeed.
      await db.userAIWorkflowProgress.deleteMany({
        where: { userId: user.id, workflowId: workflow.id },
      });
    }

    revalidatePath("/academy/ai-tools/workflows");
    revalidatePath(`/academy/ai-tools/workflows/${workflow.slug}`);
    revalidatePath("/dashboard");

    return { ok: true };
  } catch {
    console.error("[setWorkflowComplete] failed to record workflow progress");
    return { ok: false, error: GENERIC_ERROR };
  }
}
