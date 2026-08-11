import "server-only";

import { AIError, estimateTokens, type AIProvider, type AIRequest, type AIResponse } from "./types";

/**
 * The Anthropic adapter.
 *
 * The only file in the application that knows what Anthropic's API looks like.
 * Everything above it talks to the AIProvider interface, so replacing this with
 * another vendor is one new file and one environment variable.
 *
 * Written against the HTTP API with `fetch` rather than the SDK, deliberately:
 * one request shape and one response shape is less code than a dependency, and
 * it keeps the provider surface small enough to read in full — which is what
 * makes "the key never leaves this file" checkable rather than asserted.
 */

const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";

/** Overridable so a deployment can pin a model without a code change. */
const DEFAULT_MODEL = "claude-sonnet-5";

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  readonly model: string;

  /**
   * An ECMAScript private field, not a TypeScript `private` one.
   *
   * The difference is the whole point. TypeScript's `private` is erased at
   * compile time, so the key would remain an ordinary enumerable property —
   * `JSON.stringify(provider)` would print it, and so would any log line,
   * error serialiser or accidental prop that touched the object. A `#field` is
   * genuinely inaccessible from outside the class and is invisible to
   * serialisation, which turns "the key never leaks" from a convention into a
   * language guarantee. There is a test asserting exactly this.
   */
  readonly #apiKey: string;

  constructor(apiKey: string, model?: string) {
    this.#apiKey = apiKey;
    this.model = model ?? DEFAULT_MODEL;
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    // AbortController rather than Promise.race: race leaves the request
    // running and still costing money after we stop waiting for it.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), request.timeoutMs);

    let response: Response;

    try {
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": this.#apiKey,
          "anthropic-version": API_VERSION,
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: request.maxOutputTokens,
          system: request.system,
          messages: request.messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
        signal: controller.signal,
        cache: "no-store",
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new AIError(
          "TIMEOUT",
          "Your AI mentor took too long to respond. Please try again.",
          "request aborted after timeout",
        );
      }
      throw new AIError(
        "UNAVAILABLE",
        "Your AI mentor is temporarily unavailable.",
        "network error reaching provider",
      );
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      // The provider's own body is deliberately not read into the error. It
      // can carry endpoints, organisation ids and request fragments, and none
      // of that belongs anywhere near a page.
      throw new AIError(
        response.status === 429 ? "RATE_LIMITED" : "UNAVAILABLE",
        response.status === 429
          ? "The AI service is busy right now. Please try again shortly."
          : "Your AI mentor is temporarily unavailable.",
        `provider responded ${response.status}`,
      );
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new AIError(
        "UNAVAILABLE",
        "Your AI mentor is temporarily unavailable.",
        "provider returned an unreadable body",
      );
    }

    const text = extractText(body);

    if (!text) {
      throw new AIError(
        "UNAVAILABLE",
        "Your AI mentor is temporarily unavailable.",
        "provider returned no text content",
      );
    }

    const usage = extractUsage(body);

    return {
      text,
      inputTokens: usage.input ?? estimateInput(request),
      outputTokens: usage.output ?? estimateTokens(text),
      provider: this.name,
      model: this.model,
    };
  }
}

/**
 * Pulls the text out of a Messages response.
 *
 * Defensive rather than trusting: an unexpected shape becomes "no text", which
 * the caller turns into an unavailable message, instead of a runtime crash on
 * a page a learner is looking at.
 */
function extractText(body: unknown): string {
  if (typeof body !== "object" || body === null) return "";

  const content = (body as { content?: unknown }).content;
  if (!Array.isArray(content)) return "";

  return content
    .filter(
      (block): block is { type: string; text: string } =>
        typeof block === "object" &&
        block !== null &&
        (block as { type?: unknown }).type === "text" &&
        typeof (block as { text?: unknown }).text === "string",
    )
    .map((block) => block.text)
    .join("")
    .trim();
}

function extractUsage(body: unknown): { input: number | null; output: number | null } {
  if (typeof body !== "object" || body === null) return { input: null, output: null };

  const usage = (body as { usage?: unknown }).usage;
  if (typeof usage !== "object" || usage === null) return { input: null, output: null };

  const input = (usage as { input_tokens?: unknown }).input_tokens;
  const output = (usage as { output_tokens?: unknown }).output_tokens;

  return {
    input: typeof input === "number" ? input : null,
    output: typeof output === "number" ? output : null,
  };
}

function estimateInput(request: AIRequest): number {
  return (
    estimateTokens(request.system) +
    request.messages.reduce((sum, message) => sum + estimateTokens(message.content), 0)
  );
}
