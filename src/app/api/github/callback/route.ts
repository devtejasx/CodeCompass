import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/session";
import { GITHUB_ACCESS_TOKEN, appOrigin, githubConfig } from "@/lib/github/config";
import {
  OAUTH_STATE_COOKIE,
  clearedStateCookieOptions,
  verifyState,
} from "@/lib/github/oauth-state";
import { saveConnection } from "@/lib/github/connection";
import { GitHubService } from "@/lib/github/service";

/**
 * Where GitHub sends the learner back.
 *
 * Every failure ends the same way: the state cookie is cleared and the learner
 * lands on /github with a short code in the query string, which that page turns
 * into a sentence. Nothing here renders GitHub's own error text, and nothing
 * logs the code or the token.
 */

/** The reason codes /github knows how to explain. */
type Failure = "unconfigured" | "denied" | "state" | "exchange" | "profile" | "session";

function fail(reason: Failure) {
  const response = NextResponse.redirect(
    new URL(`/github?error=${reason}`, appOrigin()),
  );
  // Always burn the state cookie, whatever went wrong. A state that survives a
  // failed attempt is a state that can be replayed.
  response.cookies.set(OAUTH_STATE_COOKIE, "", clearedStateCookieOptions());
  return response;
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return fail("session");

  const config = githubConfig();
  if (!config) return fail("unconfigured");

  const params = request.nextUrl.searchParams;

  // The learner pressed Cancel on GitHub's consent screen. Not an error.
  if (params.get("error")) return fail("denied");

  const store = await cookies();
  const check = verifyState({
    cookieValue: store.get(OAUTH_STATE_COOKIE)?.value,
    callbackState: params.get("state"),
    sessionUserId: user.id,
  });

  if (!check.ok) {
    // The reason is logged for an operator and never shown: telling a caller
    // *why* their forged state failed only helps them forge a better one.
    console.error(`[github] oauth state rejected: ${check.reason}`);
    return fail("state");
  }

  const code = params.get("code");
  if (!code) return fail("exchange");

  // ── Exchange the code for a token ────────────────────────────────────
  let accessToken: string;
  let scope: string;

  try {
    const response = await fetch(GITHUB_ACCESS_TOKEN, {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.callbackUrl,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[github] token exchange returned ${response.status}`);
      return fail("exchange");
    }

    const payload = (await response.json()) as {
      access_token?: string;
      scope?: string;
      error?: string;
    };

    // GitHub reports exchange failures with a 200 and an error field, so the
    // status code alone is not enough to trust.
    if (!payload.access_token) {
      console.error("[github] token exchange returned no access token");
      return fail("exchange");
    }

    accessToken = payload.access_token;
    scope = payload.scope ?? "";
  } catch {
    console.error("[github] token exchange failed");
    return fail("exchange");
  }

  // ── Identify the account and store it ────────────────────────────────
  try {
    const account = await new GitHubService(accessToken).getCurrentUser();
    await saveConnection({ userId: user.id, account, accessToken, scope });
  } catch {
    // Deliberately no detail: this catch can see a token, and an error message
    // built from it would be the one place it could escape.
    console.error("[github] failed to load or store the GitHub profile");
    return fail("profile");
  }

  const response = NextResponse.redirect(new URL("/github?connected=1", appOrigin()));
  response.cookies.set(OAUTH_STATE_COOKIE, "", clearedStateCookieOptions());
  return response;
}
