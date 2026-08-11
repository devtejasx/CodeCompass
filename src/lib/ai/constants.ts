/**
 * AI limits, as plain numbers.
 *
 * Separate from ./limits — which enforces them — because the composer needs to
 * cap a textarea at the same length the server refuses, and ./limits is
 * `server-only`. Importing it from a client component is a build error, which
 * is exactly the guarantee that module exists to provide; the fix is a neutral
 * module both sides can read, not a weaker guard.
 *
 * These are the *values*. Nothing here reads the environment, touches the
 * database or knows an API key exists.
 */

/** Longest single message a learner may send. */
export const MAX_MESSAGE_CHARS = 4_000;

/** Ceiling on everything sent in one request, including the system prompt. */
export const MAX_INPUT_TOKENS = 8_000;

/** Ceiling on the reply. */
export const MAX_OUTPUT_TOKENS = 900;

/** Abandon a request after this long, so a hung provider cannot hang a page. */
export const REQUEST_TIMEOUT_MS = 20_000;

/** Turns kept from a conversation. Older ones are dropped, not summarised. */
export const MAX_CONVERSATION_TURNS = 12;

/** Messages allowed in one conversation before it must be started fresh. */
export const MAX_CONVERSATION_MESSAGES = 60;

/** Requests per learner per rolling hour. */
export const RATE_LIMIT_PER_HOUR = 30;
export const RATE_WINDOW_MS = 60 * 60 * 1000;
