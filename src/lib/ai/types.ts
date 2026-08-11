/**
 * The AI provider contract.
 *
 * One interface, so the application never knows which model it is talking to.
 * Provider-specific code lives in exactly one adapter file each, and swapping
 * vendors is a new adapter plus an environment variable — not a search for
 * every place a request was assembled by hand.
 *
 * Nothing in this file imports a vendor SDK, reads an environment variable or
 * knows a key exists. That is the whole point of it being separate.
 */

export type AIRole = "user" | "assistant";

export interface AIMessage {
  role: AIRole;
  content: string;
}

export interface AIRequest {
  /** Standing instructions. Never learner-authored — see lib/ai/mentor. */
  system: string;
  /** The conversation, oldest first. Already trimmed by the caller. */
  messages: AIMessage[];
  /** Hard ceiling on the reply. Enforced by the adapter, not suggested. */
  maxOutputTokens: number;
  /** Abandon the request after this long. */
  timeoutMs: number;
}

export interface AIResponse {
  text: string;
  /** Provider-reported where available, estimated otherwise. */
  inputTokens: number;
  outputTokens: number;
  /** Adapter name, for usage records. Never a key or an endpoint. */
  provider: string;
  model: string;
}

/**
 * Why a request failed, in terms the product can act on.
 *
 * Deliberately coarse. The UI shows the same calm sentence for most of these —
 * a learner does not need to know whether their mentor is rate-limited or
 * misconfigured, only that it is unavailable and their roadmap still works.
 */
export type AIFailureKind =
  /** No provider configured on this deployment. Not an error — a state. */
  | "NOT_CONFIGURED"
  /** The learner has used their allowance for now. */
  | "RATE_LIMITED"
  /** Input was too large, or otherwise refused before sending. */
  | "INVALID_REQUEST"
  /** Took too long. */
  | "TIMEOUT"
  /** The provider is down, returned nonsense, or refused. */
  | "UNAVAILABLE";

/**
 * A failure the product can render.
 *
 * `userMessage` is the only thing that ever reaches a page. The provider's own
 * error text is never forwarded: it can contain endpoints, model names,
 * organisation ids and occasionally fragments of the request.
 */
export class AIError extends Error {
  constructor(
    readonly kind: AIFailureKind,
    readonly userMessage: string,
    /** Internal detail. Logged without the payload, never returned. */
    message?: string,
  ) {
    super(message ?? kind);
    this.name = "AIError";
  }
}

export interface AIProvider {
  /** Adapter name, used in usage records. */
  readonly name: string;
  readonly model: string;
  generate(request: AIRequest): Promise<AIResponse>;
}

/**
 * A rough token count, used only for pre-flight size limits and for usage
 * records when a provider does not report its own figures.
 *
 * Four characters per token is the usual English approximation. It is not
 * accurate enough to bill against and is not used for that — it is used to
 * refuse an obviously oversized request before it costs anything.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
