import "server-only";

import { safeEquals } from "./crypto";

/**
 * The OAuth `state` parameter — the CSRF defence for the connect flow.
 *
 * A random value is written to a short-lived httpOnly cookie before the
 * redirect and compared when GitHub sends the learner back. A callback nobody
 * initiated carries no matching cookie and is refused.
 *
 * The cookie also carries the session user id, so a callback replayed into a
 * different account fails even if the random half were somehow known.
 */

export const OAUTH_STATE_COOKIE = "cc_gh_oauth_state";

/** Long enough to authorise on GitHub, short enough not to linger. */
const STATE_TTL_SECONDS = 10 * 60;

export function stateCookieOptions() {
  return {
    httpOnly: true,
    // JavaScript must never be able to read this, so it is not a target for XSS.
    sameSite: "lax" as const,
    // Lax rather than Strict: the callback is a top-level navigation *from*
    // github.com, and Strict would withhold the cookie exactly when needed.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STATE_TTL_SECONDS,
  };
}

export function clearedStateCookieOptions() {
  return { ...stateCookieOptions(), maxAge: 0 };
}

export interface StateCheck {
  ok: boolean;
  reason?: "missing" | "malformed" | "mismatch" | "wrong_user";
}

/**
 * Verifies a callback's state against the stored cookie.
 *
 * Both halves must match: the random value (compared in constant time) and the
 * user the flow was started by.
 */
export function verifyState({
  cookieValue,
  callbackState,
  sessionUserId,
}: {
  cookieValue: string | undefined;
  callbackState: string | null;
  sessionUserId: string;
}): StateCheck {
  if (!cookieValue || !callbackState) return { ok: false, reason: "missing" };

  const separator = cookieValue.indexOf(":");
  if (separator <= 0) return { ok: false, reason: "malformed" };

  const userId = cookieValue.slice(0, separator);
  const expected = cookieValue.slice(separator + 1);

  if (expected.length === 0) return { ok: false, reason: "malformed" };
  if (!safeEquals(expected, callbackState)) return { ok: false, reason: "mismatch" };
  if (userId !== sessionUserId) return { ok: false, reason: "wrong_user" };

  return { ok: true };
}
