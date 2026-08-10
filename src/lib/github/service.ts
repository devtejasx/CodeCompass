import "server-only";

import { GITHUB_API } from "./config";
import {
  GitHubError,
  type CreateRepositoryInput,
  type GitHubAccount,
  type GitHubBranch,
  type GitHubCommit,
  type GitHubRepository,
} from "./types";

/**
 * The only place in the application that talks to GitHub.
 *
 * Everything above this file works in terms of GitHubAccount, GitHubRepository
 * and GitHubError. Nothing above it sees a token, a status code or a raw API
 * body — which is what makes "a raw GitHub error never reaches a page" a
 * property of the architecture rather than a rule to remember.
 *
 * Adding pull requests or issues later means adding a method here; no caller
 * changes shape.
 */

/** GitHub is a dependency, not a reason to hang a request forever. */
const REQUEST_TIMEOUT_MS = 10_000;

/** Enough for any learner's repository list without paging forever. */
const MAX_REPOSITORIES = 100;

export class GitHubService {
  /**
   * @param token A decrypted access token. It lives for the lifetime of this
   *   object and is never returned, logged, or included in a thrown error.
   */
  constructor(private readonly token: string) {}

  // ── Requests ───────────────────────────────────────────────────────────

  private async request<T>(
    path: string,
    init: RequestInit & { parse?: boolean } = {},
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(`${GITHUB_API}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          accept: "application/vnd.github+json",
          "x-github-api-version": "2022-11-28",
          "user-agent": "CodeCompass",
          authorization: `Bearer ${this.token}`,
          ...(init.body ? { "content-type": "application/json" } : {}),
          ...init.headers,
        },
        // GitHub data is per-user and changes; never serve it from a shared cache.
        cache: "no-store",
      });
    } catch (error) {
      // Includes the abort. The error object could contain the request URL, so
      // only its name is logged and nothing is passed upward.
      console.error(
        "[github] request failed:",
        error instanceof Error ? error.name : "unknown",
      );
      throw new GitHubError(
        "UNAVAILABLE",
        "GitHub could not be reached. Try again in a moment.",
      );
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) throw this.mapFailure(response);

    if (init.parse === false) return undefined as T;

    try {
      return (await response.json()) as T;
    } catch {
      throw new GitHubError(
        "UNAVAILABLE",
        "GitHub returned something we couldn't read. Try again in a moment.",
      );
    }
  }

  /**
   * Turns an HTTP failure into something the product can act on.
   *
   * The status code is ours to log; the learner gets a plain sentence. GitHub's
   * own message is never forwarded — it can contain the request path and, on
   * some endpoints, repository names the learner may not expect to see echoed.
   */
  private mapFailure(response: Response): GitHubError {
    const remaining = response.headers.get("x-ratelimit-remaining");
    const reset = response.headers.get("x-ratelimit-reset");

    if (response.status === 401) {
      return new GitHubError(
        "AUTHORIZATION_EXPIRED",
        "Your GitHub connection needs to be renewed. Reconnect to continue.",
      );
    }

    if (response.status === 403 || response.status === 429) {
      // A 403 with the remaining budget at zero is rate limiting; a 403
      // without it is a scope or permission problem, and they need different
      // advice.
      if (remaining === "0" || response.status === 429) {
        const retryAt = reset
          ? new Date(Number(reset) * 1000)
          : new Date(Date.now() + 60_000);
        return new GitHubError(
          "RATE_LIMITED",
          "GitHub is temporarily rate limiting us. Try again shortly.",
          retryAt,
        );
      }

      return new GitHubError(
        "INSUFFICIENT_SCOPE",
        "GitHub refused that. Your connection may not have the permissions it needs — reconnecting will re-request them.",
      );
    }

    if (response.status === 404) {
      return new GitHubError(
        "NOT_FOUND",
        "That repository could not be found, or your connection cannot see it.",
      );
    }

    if (response.status === 422) {
      return new GitHubError(
        "INVALID_REQUEST",
        "GitHub rejected that. A repository with the same name may already exist on your account.",
      );
    }

    console.error(`[github] unexpected status ${response.status}`);
    return new GitHubError(
      "UNAVAILABLE",
      "GitHub is having trouble right now. Try again in a moment.",
    );
  }

  // ── Reads ──────────────────────────────────────────────────────────────

  async getCurrentUser(): Promise<GitHubAccount> {
    const raw = await this.request<{
      id: number;
      login: string;
      name: string | null;
      avatar_url: string | null;
      html_url: string;
      public_repos?: number;
    }>("/user");

    return {
      githubUserId: String(raw.id),
      username: raw.login,
      name: raw.name ?? null,
      avatarUrl: raw.avatar_url ?? null,
      profileUrl: raw.html_url,
      publicRepos: raw.public_repos ?? 0,
    };
  }

  /** The learner's repositories, most recently updated first. */
  async listRepositories(): Promise<GitHubRepository[]> {
    const raw = await this.request<RawRepository[]>(
      `/user/repos?per_page=${MAX_REPOSITORIES}&sort=updated&affiliation=owner,collaborator`,
    );
    return raw.map(toRepository);
  }

  async getRepository(fullName: string): Promise<GitHubRepository> {
    return toRepository(await this.request<RawRepository>(`/repos/${fullName}`));
  }

  async listBranches(fullName: string): Promise<GitHubBranch[]> {
    const repository = await this.getRepository(fullName);
    const raw = await this.request<
      { name: string; commit: { sha: string }; protected?: boolean }[]
    >(`/repos/${fullName}/branches?per_page=30`);

    return raw.map((branch) => ({
      name: branch.name,
      isDefault: branch.name === repository.defaultBranch,
      sha: branch.commit.sha.slice(0, 7),
      isProtected: Boolean(branch.protected),
    }));
  }

  async listCommits(fullName: string, limit = 15): Promise<GitHubCommit[]> {
    const raw = await this.request<
      {
        sha: string;
        html_url: string;
        commit: {
          message: string;
          author: { name?: string; date?: string } | null;
        };
        author: { avatar_url?: string } | null;
      }[]
    >(`/repos/${fullName}/commits?per_page=${limit}`);

    return raw.map((entry) => ({
      sha: entry.sha,
      shortSha: entry.sha.slice(0, 7),
      // Only the subject line. A commit body can be long and is not what a
      // history list is for.
      message: entry.commit.message.split("\n")[0],
      authorName: entry.commit.author?.name ?? "Unknown",
      authorAvatarUrl: entry.author?.avatar_url ?? null,
      committedAt: entry.commit.author?.date
        ? new Date(entry.commit.author.date)
        : new Date(0),
      htmlUrl: entry.html_url,
    }));
  }

  // ── Writes ─────────────────────────────────────────────────────────────

  /**
   * Creates a repository on the learner's account.
   *
   * The only write this service performs. There is deliberately no delete, no
   * push, no force-anything: Phase 8 does not do destructive GitHub actions,
   * and not implementing them is a stronger guarantee than guarding them.
   */
  async createRepository(input: CreateRepositoryInput): Promise<GitHubRepository> {
    const raw = await this.request<RawRepository>("/user/repos", {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        description: input.description || undefined,
        // Private unless the learner explicitly said otherwise, at every layer.
        private: input.isPrivate,
        auto_init: input.autoInit,
      }),
    });

    return toRepository(raw);
  }

  /**
   * Tells GitHub to forget this authorisation.
   *
   * Best-effort by design: if it fails we still delete our own row, because a
   * learner who clicked disconnect must end up disconnected here regardless of
   * what GitHub says.
   */
  async revoke(clientId: string, clientSecret: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${GITHUB_API}/applications/${clientId}/grant`,
        {
          method: "DELETE",
          headers: {
            accept: "application/vnd.github+json",
            "user-agent": "CodeCompass",
            authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ access_token: this.token }),
        },
      );
      return response.status === 204;
    } catch {
      console.error("[github] token revocation failed");
      return false;
    }
  }
}

// ── Mapping ──────────────────────────────────────────────────────────────

interface RawRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
}

function toRepository(raw: RawRepository): GitHubRepository {
  return {
    id: String(raw.id),
    name: raw.name,
    fullName: raw.full_name,
    description: raw.description,
    isPrivate: raw.private,
    htmlUrl: raw.html_url,
    defaultBranch: raw.default_branch,
    language: raw.language,
    stars: raw.stargazers_count,
    updatedAt: new Date(raw.updated_at),
  };
}
