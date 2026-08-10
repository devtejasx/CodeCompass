/**
 * The shapes CodeCompass uses to talk about GitHub.
 *
 * Deliberately narrower than GitHub's own responses. Only what the product
 * actually renders crosses this boundary, so a change in their payload is one
 * mapping function to update rather than a hunt through components — and no
 * field we never asked for ends up in a page by accident.
 */

/** Every state the connection can be in, including the two that never persist. */
export type GitHubConnectionState =
  /** No connection has ever been made, or it was removed. */
  | "NOT_CONNECTED"
  | "CONNECTED"
  /** The token was revoked or expired. The row survives so links do too. */
  | "AUTHORIZATION_EXPIRED";

export interface GitHubAccount {
  githubUserId: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  profileUrl: string;
  publicRepos: number;
}

export interface GitHubRepository {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  isPrivate: boolean;
  htmlUrl: string;
  defaultBranch: string;
  language: string | null;
  stars: number;
  updatedAt: Date;
}

export interface GitHubBranch {
  name: string;
  isDefault: boolean;
  /** Short SHA of the branch tip. */
  sha: string;
  isProtected: boolean;
}

export interface GitHubCommit {
  /** Already shortened to seven characters, as Git itself displays them. */
  shortSha: string;
  sha: string;
  message: string;
  authorName: string;
  authorAvatarUrl: string | null;
  committedAt: Date;
  htmlUrl: string;
}

export interface CreateRepositoryInput {
  name: string;
  description?: string;
  /** Defaults to true at every layer. A learning project is private by default. */
  isPrivate: boolean;
  /** A README makes the repository clonable immediately. */
  autoInit: boolean;
}

/**
 * Why a GitHub call failed, in terms the product can act on.
 *
 * Mapping GitHub's status codes onto these once, at the boundary, is what lets
 * every caller show a useful sentence without any of them parsing an API error
 * — and is what guarantees a raw GitHub message never reaches a page.
 */
export type GitHubErrorKind =
  /** No connection, or no key to decrypt the stored token with. */
  | "NOT_CONNECTED"
  /** 401 — token revoked or expired. The connection is marked accordingly. */
  | "AUTHORIZATION_EXPIRED"
  /** 403 with a rate-limit header. Carries when it resets. */
  | "RATE_LIMITED"
  /** 403 without rate limiting — the granted scopes do not cover this. */
  | "INSUFFICIENT_SCOPE"
  | "NOT_FOUND"
  /** 422 — GitHub rejected the input, e.g. a repository name already taken. */
  | "INVALID_REQUEST"
  /** Network failure, timeout, 5xx, or a response we could not parse. */
  | "UNAVAILABLE";

export class GitHubError extends Error {
  constructor(
    readonly kind: GitHubErrorKind,
    /** Safe to show a learner. Never contains a token or a raw API body. */
    readonly userMessage: string,
    readonly retryAt?: Date,
  ) {
    super(kind);
    this.name = "GitHubError";
  }
}

/** Whether the GitHub integration is configured at all on this deployment. */
export interface GitHubAvailability {
  configured: boolean;
  /** Why not, phrased for an operator rather than a learner. */
  reason?: string;
}
