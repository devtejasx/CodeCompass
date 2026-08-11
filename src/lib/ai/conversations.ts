import { db } from "@/lib/db";

import { MAX_CONVERSATION_MESSAGES } from "./limits";
import type { AIMessage } from "./types";

/**
 * Mentor conversation storage.
 *
 * Every function takes a userId derived from the session, and every query
 * carries it in the where clause rather than checking ownership afterwards.
 * That is not a stylistic preference: a conversation belonging to somebody else
 * is *not found*, so there is no loaded row that a later branch could forget to
 * reject.
 */

/** Conversation list for the sidebar. */
export async function listConversations(userId: string, take = 20) {
  return db.mentorConversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take,
    select: {
      id: true,
      title: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  });
}

export type ConversationSummary = Awaited<ReturnType<typeof listConversations>>[number];

/**
 * One conversation with its messages, or null.
 *
 * `userId` is part of the lookup, so another learner's conversation returns
 * null rather than being found and then rejected.
 */
export async function getConversation(userId: string, conversationId: string) {
  return db.mentorConversation.findFirst({
    where: { id: conversationId, userId },
    select: {
      id: true,
      title: true,
      createdAt: true,
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true, createdAt: true },
      },
    },
  });
}

export type ConversationDetail = NonNullable<
  Awaited<ReturnType<typeof getConversation>>
>;

/** The learner's most recent conversation, for landing on /mentor. */
export async function getLatestConversation(userId: string) {
  const latest = await db.mentorConversation.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  return latest ? getConversation(userId, latest.id) : null;
}

/**
 * A title derived from the first question.
 *
 * The learner's own words rather than a generated summary: it costs nothing,
 * it is always accurate, and it is what they will recognise in a list.
 */
export function deriveTitle(firstMessage: string): string {
  const clean = firstMessage.trim().replace(/\s+/g, " ");
  return clean.length <= 60 ? clean : `${clean.slice(0, 57)}…`;
}

/** Turns stored messages into the shape the provider expects. */
export function toAIMessages(
  messages: { role: "USER" | "ASSISTANT"; content: string }[],
): AIMessage[] {
  return messages.map((message) => ({
    role: message.role === "USER" ? ("user" as const) : ("assistant" as const),
    content: message.content,
  }));
}

/**
 * Whether a conversation has room for another exchange.
 *
 * A cap rather than unbounded growth: an endless thread costs more on every
 * turn and is worse to use than a fresh one, because the mentor's grounding is
 * rebuilt each request anyway and nothing of value lives in the middle of it.
 */
export function isFull(messageCount: number): boolean {
  return messageCount >= MAX_CONVERSATION_MESSAGES;
}
