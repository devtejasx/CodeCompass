import "server-only";

import { AnthropicProvider } from "./anthropic";
import { MockProvider } from "./mock";
import type { AIProvider } from "./types";

/**
 * Resolves which provider this deployment uses.
 *
 * The **only** place an AI API key is read. Everything above receives an
 * `AIProvider`, which has no key on it, so there is exactly one file to check
 * when asking "can a key reach the browser?" — and `server-only` makes
 * importing it from a client component a build error rather than a code review
 * question.
 *
 * The default is `none`. An unconfigured deployment has no mentor and says so,
 * which is the correct behaviour: CodeCompass is a learning platform whose
 * recommendations are deterministic, and the AI is an enhancement on top.
 */

export type ProviderName = "none" | "mock" | "anthropic";

export interface Availability {
  configured: boolean;
  provider: ProviderName;
  /** Why it is unavailable. Never rendered — the UI shows a calm sentence. */
  reason?: string;
}

function configuredName(): ProviderName {
  const raw = (process.env.AI_PROVIDER ?? "none").trim().toLowerCase();

  if (raw === "mock" || raw === "anthropic") return raw;
  // Anything unrecognised is treated as unconfigured rather than guessed at.
  return "none";
}

/**
 * Whether AI guidance can run here, without constructing anything.
 *
 * Called by pages so they can render the fallback without touching a key.
 */
export function aiAvailability(): Availability {
  const provider = configuredName();

  if (provider === "none") {
    return {
      configured: false,
      provider,
      reason: "AI_PROVIDER is not set on this deployment.",
    };
  }

  if (provider === "mock") {
    if (process.env.NODE_ENV === "production") {
      // Simulated guidance that a learner could mistake for real advice is
      // worse than no mentor, so this is refused rather than warned about.
      return {
        configured: false,
        provider: "none",
        reason: "The mock AI provider is refused in production.",
      };
    }
    return { configured: true, provider };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      configured: false,
      provider: "none",
      reason: "AI_PROVIDER=anthropic but ANTHROPIC_API_KEY is not set.",
    };
  }

  return { configured: true, provider };
}

/**
 * Builds the provider, or returns null when none is configured.
 *
 * Null rather than throwing: an unconfigured deployment is a supported state,
 * not an error, and every caller already has a path for "the mentor is
 * unavailable" because that path also handles outages.
 */
export function getAIProvider(): AIProvider | null {
  const availability = aiAvailability();
  if (!availability.configured) return null;

  if (availability.provider === "mock") return new MockProvider();

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  return new AnthropicProvider(key, process.env.ANTHROPIC_MODEL);
}
