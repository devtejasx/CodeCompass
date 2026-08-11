"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getGuidance } from "@/lib/personalization/service";
import {
  deriveTitle,
  getConversation,
  isFull,
  toAIMessages,
} from "@/lib/ai/conversations";
import { MAX_MESSAGE_CHARS } from "@/lib/ai/limits";
import {
  explainConcept,
  generateGuidance,
  type ExplanationStyle,
} from "@/lib/ai/service";

/**
 * Mentor mutations.
 *
 * Three rules run through every action here.
 *
 * **Identity comes from the session, never from the client.** No action accepts
 * a userId, and every database call carries the session user in its where
 * clause — so a crafted request cannot read or append to somebody else's
 * conversation.
 *
 * **The learner's message is data, not instruction.** It is stored and sent as
 * a user turn; it never modifies the system prompt, and the system prompt tells
 * the model to treat message content as a question from a person.
 *
 * **A failed AI call is a normal outcome.** It returns a message the UI can
 * render, and it never leaves a half-written conversation behind — see the
 * ordering in `sendMentorMessage`.
 */

export interface MentorResult {
  ok: boolean;
  error?: string;
  conversationId?: string;
  reply?: string;
}

const GENERIC_ERROR = "Something went wrong. Please try again in a moment.";

const sendInput = z.object({
  /** Omitted to start a new conversation. */
  conversationId: z.string().min(1).max(64).optional(),
  message: z.string().trim().min(1).max(MAX_MESSAGE_CHARS),
});

/**
 * Sends a message and returns the mentor's reply.
 *
 * The ordering matters. The learner's message is persisted first so their
 * question is never lost, then the AI is called, and the reply is only stored
 * if one came back. A failed call therefore leaves a conversation whose last
 * turn is the learner's question — which is exactly right, because retrying
 * should not duplicate it.
 */
export async function sendMentorMessage(input: unknown): Promise<MentorResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to use the mentor." };

  const parsed = sendInput.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: `Please write a question of up to ${MAX_MESSAGE_CHARS.toLocaleString()} characters.`,
    };
  }

  try {
    // Scoped by userId in the lookup, so another learner's conversation is not
    // found rather than found-and-rejected.
    let conversation = parsed.data.conversationId
      ? await getConversation(user.id, parsed.data.conversationId)
      : null;

    if (parsed.data.conversationId && !conversation) {
      return { ok: false, error: "That conversation could not be found." };
    }

    if (conversation && isFull(conversation.messages.length)) {
      return {
        ok: false,
        error:
          "This conversation has reached its length limit. Start a new one to carry on.",
        conversationId: conversation.id,
      };
    }

    if (!conversation) {
      const created = await db.mentorConversation.create({
        data: { userId: user.id, title: deriveTitle(parsed.data.message) },
        select: { id: true },
      });
      conversation = await getConversation(user.id, created.id);
    }

    if (!conversation) return { ok: false, error: GENERIC_ERROR };

    await db.mentorMessage.create({
      data: {
        conversationId: conversation.id,
        role: "USER",
        content: parsed.data.message,
      },
    });

    // Rebuilt on every turn rather than carried in the conversation, so the
    // mentor always describes where the learner is now.
    const guidance = await getGuidance(user.id);
    const firstName = user.name.split(/\s+/)[0] || user.name;

    const history = [
      ...toAIMessages(conversation.messages),
      { role: "user" as const, content: parsed.data.message },
    ];

    const result = await generateGuidance({
      userId: user.id,
      firstName,
      guidance,
      history,
    });

    if (!result.ok) {
      // The question stays saved; nothing pretends an answer arrived.
      await db.mentorConversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });
      revalidatePath("/mentor");
      return { ok: false, error: result.message, conversationId: conversation.id };
    }

    await db.mentorMessage.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: result.text,
      },
    });

    await db.mentorConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    revalidatePath("/mentor");

    return { ok: true, conversationId: conversation.id, reply: result.text };
  } catch {
    console.error("[sendMentorMessage] failed");
    return { ok: false, error: GENERIC_ERROR };
  }
}

const explainInput = z.object({
  concept: z.string().trim().min(1).max(200),
  style: z.enum(["SIMPLE", "ANALOGY", "EXAMPLES", "STEP_BY_STEP", "DEEPER"]),
});

/**
 * "Explain this differently."
 *
 * The style is one of a fixed set chosen by the UI, never free text, so this
 * cannot become a way to write instructions into the prompt. The result is not
 * stored — it is a one-off reframing of something the learner is looking at,
 * not a conversation.
 */
export async function explainDifferently(input: unknown): Promise<MentorResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to use the mentor." };

  const parsed = explainInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That request could not be understood." };

  try {
    const guidance = await getGuidance(user.id);
    const firstName = user.name.split(/\s+/)[0] || user.name;

    const result = await explainConcept({
      userId: user.id,
      firstName,
      guidance,
      concept: parsed.data.concept,
      style: parsed.data.style as ExplanationStyle,
    });

    if (!result.ok) return { ok: false, error: result.message };
    return { ok: true, reply: result.text };
  } catch {
    console.error("[explainDifferently] failed");
    return { ok: false, error: GENERIC_ERROR };
  }
}

const deleteInput = z.object({ conversationId: z.string().min(1).max(64) });

/** Deletes one of the learner's own conversations. */
export async function deleteConversation(input: unknown): Promise<MentorResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in." };

  const parsed = deleteInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That conversation could not be found." };

  try {
    // deleteMany scoped by userId: another learner's conversation matches
    // nothing rather than being deleted.
    await db.mentorConversation.deleteMany({
      where: { id: parsed.data.conversationId, userId: user.id },
    });

    revalidatePath("/mentor");
    return { ok: true };
  } catch {
    console.error("[deleteConversation] failed");
    return { ok: false, error: GENERIC_ERROR };
  }
}

const policyInput = z.object({
  policy: z.enum(["HINTS_ONLY", "ALLOW_SOLUTIONS"]),
});

/** Changes how much help the mentor gives on practice problems. */
export async function setMentorSolutionPolicy(input: unknown): Promise<MentorResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in." };

  const parsed = policyInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That setting could not be understood." };

  try {
    await db.profile.update({
      where: { userId: user.id },
      data: { mentorSolutionPolicy: parsed.data.policy },
    });

    revalidatePath("/mentor");
    return { ok: true };
  } catch {
    console.error("[setMentorSolutionPolicy] failed");
    return { ok: false, error: GENERIC_ERROR };
  }
}
