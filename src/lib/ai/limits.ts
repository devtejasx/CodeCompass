import "server-only";

import { db } from "@/lib/db";
import type { AIRequestKind } from "@/generated/prisma/client";

import {
  MAX_CONVERSATION_TURNS,
  MAX_INPUT_TOKENS,
  MAX_MESSAGE_CHARS,
  RATE_LIMIT_PER_HOUR,
  RATE_WINDOW_MS,
} from "./constants";
import { AIError, estimateTokens, type AIMessage } from "./types";

/**
 * Cost controls — the enforcement.
 *
 * AI calls cost money per token and can be triggered in a loop by anybody with
 * a keyboard, so every limit here is a hard refusal rather than a warning. The
 * numbers themselves live in ./constants, which the composer also reads so the
 * textarea caps at the same length the server refuses; this module is
 * `server-only` and does the refusing.
 *
 * All of it is enforced on the server, before anything is sent. A limit
 * implemented in the browser is a suggestion.
 */

// Re-exported so server callers import limits from one place.
export {
  MAX_CONVERSATION_MESSAGES,
  MAX_CONVERSATION_TURNS,
  MAX_INPUT_TOKENS,
  MAX_MESSAGE_CHARS,
  MAX_OUTPUT_TOKENS,
  RATE_LIMIT_PER_HOUR,
  RATE_WINDOW_MS,
  REQUEST_TIMEOUT_MS,
} from "./constants";

/**
 * Whether this learner may make another AI request.
 *
 * Counts rows in a rolling window rather than keeping an in-memory counter:
 * slower, and correct across restarts and multiple instances. For a per-learner
 * limit measured in requests per hour that is unambiguously the right trade.
 *
 * Failed requests count. Otherwise a provider outage becomes an unlimited retry
 * loop, which is exactly when a runaway bill happens.
 */
export async function checkRateLimit(userId: string): Promise<void> {
  const since = new Date(Date.now() - RATE_WINDOW_MS);

  const used = await db.aIUsage.count({
    where: { userId, createdAt: { gte: since } },
  });

  if (used >= RATE_LIMIT_PER_HOUR) {
    throw new AIError(
      "RATE_LIMITED",
      "You have reached the hourly limit for AI guidance. Everything else in CodeCompass still works — try again shortly.",
      `rate limit: ${used}/${RATE_LIMIT_PER_HOUR}`,
    );
  }
}

/** How many requests this learner has left in the current window. */
export async function remainingRequests(userId: string): Promise<number> {
  const since = new Date(Date.now() - RATE_WINDOW_MS);
  const used = await db.aIUsage.count({
    where: { userId, createdAt: { gte: since } },
  });
  return Math.max(0, RATE_LIMIT_PER_HOUR - used);
}

/**
 * Refuses an oversized request before it is sent.
 *
 * Two separate checks on purpose: one message being enormous is a different
 * problem from a conversation that has grown past the budget, and the learner
 * can act on the first.
 */
export function assertWithinInputLimits({
  system,
  messages,
}: {
  system: string;
  messages: AIMessage[];
}): void {
  const latest = messages[messages.length - 1];

  if (latest && latest.content.length > MAX_MESSAGE_CHARS) {
    throw new AIError(
      "INVALID_REQUEST",
      `That message is too long. Please keep it under ${MAX_MESSAGE_CHARS.toLocaleString()} characters.`,
      "message exceeds MAX_MESSAGE_CHARS",
    );
  }

  const total =
    estimateTokens(system) +
    messages.reduce((sum, message) => sum + estimateTokens(message.content), 0);

  if (total > MAX_INPUT_TOKENS) {
    throw new AIError(
      "INVALID_REQUEST",
      "This conversation has grown too long for the mentor to work with. Start a new one to continue.",
      `input ~${total} tokens exceeds MAX_INPUT_TOKENS`,
    );
  }
}

/**
 * Keeps only the most recent turns.
 *
 * Dropped rather than summarised: summarising costs a model call of its own,
 * and a mentor grounded in current learner state does not need last week's
 * conversation to answer today's question. The state is re-attached on every
 * request, so nothing important is lost by forgetting the middle.
 */
export function trimConversation(messages: AIMessage[]): AIMessage[] {
  return messages.slice(-MAX_CONVERSATION_TURNS);
}

/**
 * Records one call.
 *
 * Never throws: failing to write a usage row must not fail the request the
 * learner is waiting on. It does mean a lost row is a free request, which is
 * acceptable — the alternative is losing the answer.
 */
export async function recordUsage(input: {
  userId: string;
  kind: AIRequestKind;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  ok: boolean;
}): Promise<void> {
  try {
    await db.aIUsage.create({ data: input });
  } catch {
    console.error("[recordUsage] failed to record AI usage");
  }
}
