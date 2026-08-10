import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/session";
import {
  GITHUB_AUTHORIZE,
  GITHUB_SCOPE_STRING,
  appOrigin,
  githubConfig,
} from "@/lib/github/config";
import { randomToken } from "@/lib/github/crypto";
import { OAUTH_STATE_COOKIE, stateCookieOptions } from "@/lib/github/oauth-state";

/**
 * Starts the GitHub OAuth flow.
 *
 * A GET that causes a redirect, which GitHub's flow requires. The CSRF defence
 * is the `state` parameter: a random value stored in a short-lived httpOnly
 * cookie and compared on the way back, so a callback the learner did not
 * initiate has nothing to match against.
 *
 * The cookie is httpOnly and SameSite=Lax — Lax rather than Strict because the
 * callback arrives as a top-level navigation *from github.com*, and Strict
 * would withhold the cookie exactly when it is needed.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(
      new URL("/login?callbackUrl=%2Fgithub", appOrigin()),
    );
  }

  const config = githubConfig();
  if (!config) {
    // Unconfigured is a normal state, not an error worth a stack trace.
    return NextResponse.redirect(new URL("/github?error=unconfigured", appOrigin()));
  }

  const state = randomToken();

  // The state is bound to the session user as well as to the cookie, so a
  // callback replayed into a different account cannot succeed.
  const store = await cookies();
  store.set(OAUTH_STATE_COOKIE, `${user.id}:${state}`, stateCookieOptions());

  const authorize = new URL(GITHUB_AUTHORIZE);
  authorize.searchParams.set("client_id", config.clientId);
  authorize.searchParams.set("redirect_uri", config.callbackUrl);
  authorize.searchParams.set("scope", GITHUB_SCOPE_STRING);
  authorize.searchParams.set("state", state);
  // Re-prompt so a learner reconnecting can see and change which account they
  // are authorising rather than being silently re-linked to the previous one.
  authorize.searchParams.set("allow_signup", "false");

  return NextResponse.redirect(authorize);
}
