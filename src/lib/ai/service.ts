import "server-only";

import type { AIRequestKind } from "@/generated/prisma/client";
import type { Guidance } from "@/lib/personalization/service";

import {
  assertWithinInputLimits,
  checkRateLimit,
  MAX_OUTPUT_TOKENS,
  recordUsage,
  REQUEST_TIMEOUT_MS,
  trimConversation,
} from "./limits";
import { buildContext, SYSTEM_PROMPT } from "./mentor";
import { getAIProvider } from "./provider";
import { AIError, type AIMessage } from "./types";

/**
 * The AI service.
 *
 * The single door between CodeCompass and a language model. Every call goes
 * through `run`, which enforces the same order every time: is a provider
 * configured, is this learner within their allowance, is the request within
 * size limits, send it, record what it cost. Skipping any of those is not
 * possible from outside this file, because nothing outside it holds a provider.
 *
 * Every method returns a discriminated result rather than throwing. AI is an
 * enhancement here, never a dependency: a caller that forgets to handle a
 * failure gets a typed value it has to unwrap, not an exception that takes a
 * page down.
 */

export type AIResult =
  | { ok: true; text: string }
  | { ok: false; kind: AIError["kind"]; message: string };

/**
 * Runs one request with every control applied.
 *
 * Failures are recorded as usage too. Otherwise a provider outage becomes an
 * unlimited retry loop, which is exactly the situation a rate limit exists for.
 */
async function run({
  userId,
  kind,
  system,
  messages,
}: {
  userId: string;
  kind: AIRequestKind;
  system: string;
  messages: AIMessage[];
}): Promise<AIResult> {
  const provider = getAIProvider();

  if (!provider) {
    return {
      ok: false,
      kind: "NOT_CONFIGURED",
      message:
        "Your AI mentor isn't available on this deployment. Everything else in CodeCompass — your roadmap, your next step, your practice and projects — works exactly as normal.",
    };
  }

  const trimmed = trimConversation(messages);

  try {
    await checkRateLimit(userId);
    assertWithinInputLimits({ system, messages: trimmed });
  } catch (error) {
    if (error instanceof AIError) {
      // A refusal before sending costs nothing, so it is not recorded as
      // usage — only requests that reached a provider are.
      return { ok: false, kind: error.kind, message: error.userMessage };
    }
    throw error;
  }

  try {
    const response = await provider.generate({
      system,
      messages: trimmed,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      timeoutMs: REQUEST_TIMEOUT_MS,
    });

    await recordUsage({
      userId,
      kind,
      provider: response.provider,
      model: response.model,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      ok: true,
    });

    return { ok: true, text: response.text };
  } catch (error) {
    await recordUsage({
      userId,
      kind,
      provider: provider.name,
      model: provider.model,
      inputTokens: 0,
      outputTokens: 0,
      ok: false,
    });

    if (error instanceof AIError) {
      return { ok: false, kind: error.kind, message: error.userMessage };
    }

    // Anything unexpected becomes the same calm sentence. The real detail is
    // logged without the payload; it never reaches a page.
    console.error("[AIService] unexpected provider failure");
    return {
      ok: false,
      kind: "UNAVAILABLE",
      message: "Your AI mentor is temporarily unavailable. Please try again shortly.",
    };
  }
}

/**
 * A mentor turn, grounded in the learner's state.
 *
 * The context is rebuilt on every request rather than carried in the
 * conversation, so the mentor is always talking about the learner's progress
 * *now* — a conversation started yesterday does not describe yesterday's
 * position.
 */
export async function generateGuidance({
  userId,
  firstName,
  guidance,
  history,
}: {
  userId: string;
  firstName: string;
  guidance: Guidance;
  /** Prior turns, oldest first. Trimmed here, not by the caller. */
  history: AIMessage[];
}): Promise<AIResult> {
  return run({
    userId,
    kind: "MENTOR",
    system: `${SYSTEM_PROMPT}\n\n${buildContext({ guidance, firstName })}`,
    messages: history,
  });
}

/**
 * Explains a concept at the learner's level, in a requested style.
 *
 * The style is chosen from a fixed set by the UI rather than typed by the
 * learner, so "explain differently" cannot become a way to write instructions
 * into the prompt.
 */
export type ExplanationStyle =
  | "SIMPLE"
  | "ANALOGY"
  | "EXAMPLES"
  | "STEP_BY_STEP"
  | "DEEPER";

const STYLE_INSTRUCTION: Record<ExplanationStyle, string> = {
  SIMPLE: "Explain it as simply as possible, assuming very little prior knowledge.",
  ANALOGY: "Explain it using a real-world analogy, then connect the analogy back to the code.",
  EXAMPLES: "Explain it through two or three small, concrete examples.",
  STEP_BY_STEP: "Walk through it step by step, in order, one idea at a time.",
  DEEPER: "Go deeper than an introduction: cover the mechanism and the edge cases.",
};

export async function explainConcept({
  userId,
  firstName,
  guidance,
  concept,
  style,
}: {
  userId: string;
  firstName: string;
  guidance: Guidance;
  concept: string;
  style: ExplanationStyle;
}): Promise<AIResult> {
  return run({
    userId,
    kind: "EXPLANATION",
    system: `${SYSTEM_PROMPT}\n\n${buildContext({ guidance, firstName })}`,
    messages: [
      {
        role: "user",
        content: `Explain this concept: ${concept}\n\n${STYLE_INSTRUCTION[style]}`,
      },
    ],
  });
}

/**
 * Helps a learner understand why a submission failed.
 *
 * Given the failure, never the answer: the point is that they fix it. The
 * learner's source is not sent — the mentor works from the described failure,
 * which is enough to explain a class of mistake and keeps submitted code out
 * of a third-party request.
 */
export async function explainMistake({
  userId,
  firstName,
  guidance,
  problemTitle,
  failureSummary,
}: {
  userId: string;
  firstName: string;
  guidance: Guidance;
  problemTitle: string;
  failureSummary: string;
}): Promise<AIResult> {
  return run({
    userId,
    kind: "EXPLANATION",
    system: `${SYSTEM_PROMPT}\n\n${buildContext({ guidance, firstName })}`,
    messages: [
      {
        role: "user",
        content: `I'm working on the practice problem "${problemTitle}" and my submission failed. Here is what happened:\n\n${failureSummary}\n\nHelp me understand what kind of mistake this suggests and what I should check. Do not give me the solution.`,
      },
    ],
  });
}

/**
 * Turns the deterministic plan into a short encouraging note.
 *
 * The plan itself is computed by lib/personalization/plan — the AI is only
 * writing the sentence around it. Passing the plan in rather than asking the
 * model to invent one is the difference between guidance and fiction.
 */
export async function createStudyPlanNote({
  userId,
  firstName,
  guidance,
}: {
  userId: string;
  firstName: string;
  guidance: Guidance;
}): Promise<AIResult> {
  const items = guidance.plan.items
    .map((item, index) => `${index + 1}. ${item.title} (${item.minutes} min)`)
    .join("\n");

  if (guidance.plan.items.length === 0) {
    return {
      ok: false,
      kind: "INVALID_REQUEST",
      message: "There is nothing outstanding to plan right now.",
    };
  }

  return run({
    userId,
    kind: "STUDY_PLAN",
    system: `${SYSTEM_PROMPT}\n\n${buildContext({ guidance, firstName })}`,
    messages: [
      {
        role: "user",
        content: `CodeCompass has built me this plan for today:\n\n${items}\n\nIn two or three sentences, tell me why this order makes sense for where I am. Do not change the plan or add to it.`,
      },
    ],
  });
}

export { aiAvailability } from "./provider";
export type { AIMessage };
