import "server-only";

import { isEncryptionConfigured } from "./crypto";
import type { GitHubAvailability } from "./types";

/**
 * GitHub OAuth configuration.
 *
 * The integration is entirely optional and fails closed. With nothing set, the
 * Academy still works in full — curriculum, simulator, exercises, reference —
 * and the connection UI says so plainly rather than offering a button that
 * cannot work.
 */

/**
 * The scopes CodeCompass asks for, and why each one is needed.
 *
 *   read:user  — the username, avatar and profile link shown on /github. Note
 *                this does NOT include email; there is no reason to read it.
 *   repo       — listing the learner's repositories, reading branches and
 *                commits, and creating a repository for a project.
 *
 * `repo` is broader than we would like. GitHub's classic OAuth model has no
 * narrower scope that permits creating or reading a *private* repository, and
 * repositories are created private by default because a learning project
 * should not be published by accident. The alternatives that would narrow this
 * — a GitHub App with fine-grained repository permissions, or fine-grained
 * PATs — are a different authorisation model and are noted as Phase 9 work in
 * docs/github-integration.md.
 *
 * What we deliberately do NOT request: delete_repo, admin:org, workflow,
 * user:email, gist, notifications.
 */
export const GITHUB_SCOPES = ["read:user", "repo"] as const;

export const GITHUB_SCOPE_STRING = GITHUB_SCOPES.join(" ");

/** Human-readable justification, shown to the learner before they authorise. */
export const SCOPE_EXPLANATIONS: { scope: string; why: string }[] = [
  {
    scope: "read:user",
    why: "Read your username, avatar and profile link, so this page can show whose account is connected.",
  },
  {
    scope: "repo",
    why: "List your repositories, read their branches and commits, and create a repository when you ask for one. GitHub has no narrower scope that covers private repositories.",
  },
];

export interface GitHubOAuthConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

/** The origin used to build the callback URL. */
export function appOrigin(): string {
  const configured = process.env.APP_URL?.trim() || process.env.AUTH_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return "http://localhost:3000";
}

export function callbackUrl(): string {
  return `${appOrigin()}/api/github/callback`;
}

/**
 * Returns the OAuth configuration, or null when the integration is not set up.
 *
 * Null is a first-class answer: callers render "not configured" rather than
 * throwing, because an unconfigured deployment is a normal state and not a bug.
 */
export function githubConfig(): GitHubOAuthConfig | null {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) return null;
  // Refusing to run without an encryption key is the point: it is what stops a
  // deployment from storing tokens in plaintext because a variable was missed.
  if (!isEncryptionConfigured()) return null;

  return { clientId, clientSecret, callbackUrl: callbackUrl() };
}

/** Whether the integration can be used, and what an operator should fix if not. */
export function githubAvailability(): GitHubAvailability {
  const hasClient =
    Boolean(process.env.GITHUB_CLIENT_ID?.trim()) &&
    Boolean(process.env.GITHUB_CLIENT_SECRET?.trim());

  if (!hasClient) {
    return {
      configured: false,
      reason:
        "GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are not set. Register an OAuth app and add them to the environment.",
    };
  }

  if (!isEncryptionConfigured()) {
    return {
      configured: false,
      reason:
        "GITHUB_TOKEN_ENCRYPTION_KEY is missing or is not 32 bytes. Tokens will not be stored without it.",
    };
  }

  return { configured: true };
}

export const GITHUB_API = "https://api.github.com";
export const GITHUB_AUTHORIZE = "https://github.com/login/oauth/authorize";
export const GITHUB_ACCESS_TOKEN = "https://github.com/login/oauth/access_token";
