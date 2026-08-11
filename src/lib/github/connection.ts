import "server-only";

import { db } from "@/lib/db";

import { githubConfig } from "./config";
import { openToken, sealToken } from "./crypto";
import { GitHubService } from "./service";
import { GitHubError, type GitHubAccount, type GitHubConnectionState } from "./types";

/**
 * Everything that reads or writes a stored GitHub authorisation.
 *
 * The token never leaves this file except into a GitHubService, which is also
 * server-only. There is deliberately no exported function that returns one.
 */

/** What a page is allowed to know about a connection. No token, ever. */
export interface ConnectionView {
  state: GitHubConnectionState;
  account: GitHubAccount | null;
  scope: string | null;
  connectedAt: Date | null;
  lastVerifiedAt: Date | null;
}

const DISCONNECTED: ConnectionView = {
  state: "NOT_CONNECTED",
  account: null,
  scope: null,
  connectedAt: null,
  lastVerifiedAt: null,
};

/**
 * The connection as a page should see it.
 *
 * Note the select: the three token columns are not in it. A page cannot leak
 * what it was never given, which is a stronger guarantee than remembering to
 * strip it.
 */
export async function getConnectionView(userId: string): Promise<ConnectionView> {
  const row = await db.gitHubConnection.findUnique({
    where: { userId },
    select: {
      githubUserId: true,
      username: true,
      name: true,
      avatarUrl: true,
      profileUrl: true,
      publicRepos: true,
      scope: true,
      status: true,
      connectedAt: true,
      lastVerifiedAt: true,
    },
  });

  if (!row) return DISCONNECTED;

  return {
    state: row.status,
    account: {
      githubUserId: String(row.githubUserId),
      username: row.username,
      name: row.name,
      avatarUrl: row.avatarUrl,
      profileUrl: row.profileUrl,
      publicRepos: row.publicRepos,
    },
    scope: row.scope,
    connectedAt: row.connectedAt,
    lastVerifiedAt: row.lastVerifiedAt,
  };
}

/** Stores a fresh authorisation, replacing any previous one for this learner. */
export async function saveConnection({
  userId,
  account,
  accessToken,
  scope,
}: {
  userId: string;
  account: GitHubAccount;
  accessToken: string;
  scope: string;
}): Promise<void> {
  const sealed = sealToken(accessToken);

  const data = {
    githubUserId: BigInt(account.githubUserId),
    username: account.username,
    name: account.name,
    avatarUrl: account.avatarUrl,
    profileUrl: account.profileUrl,
    publicRepos: account.publicRepos,
    accessTokenCipher: sealed.cipher,
    accessTokenIv: sealed.iv,
    accessTokenTag: sealed.tag,
    keyVersion: sealed.keyVersion,
    scope,
    // Reconnecting after an expiry clears the expiry, which is the whole point
    // of keeping the row rather than deleting it.
    status: "CONNECTED" as const,
    lastVerifiedAt: new Date(),
  };

  await db.gitHubConnection.upsert({
    where: { userId },
    create: { userId, connectedAt: new Date(), ...data },
    update: data,
  });
}

/**
 * Marks a connection as needing re-authorisation.
 *
 * The row survives so repositories already linked to projects keep working and
 * the UI can say "reconnect" rather than "connect".
 */
export async function markAuthorizationExpired(userId: string): Promise<void> {
  await db.gitHubConnection.updateMany({
    where: { userId },
    data: { status: "AUTHORIZATION_EXPIRED" },
  });
}

/**
 * Removes the connection and asks GitHub to forget the grant.
 *
 * Revocation is attempted first but never blocks: a learner who clicked
 * disconnect must end up disconnected here whatever GitHub answers. Repository
 * links on projects are left alone — deleting somebody's recorded work because
 * they unlinked an account would be indefensible.
 */
export async function disconnect(userId: string): Promise<{ revoked: boolean }> {
  const row = await db.gitHubConnection.findUnique({
    where: { userId },
    select: { accessTokenCipher: true, accessTokenIv: true, accessTokenTag: true },
  });

  let revoked = false;

  if (row) {
    const config = githubConfig();
    if (config) {
      try {
        const service = new GitHubService(
          openToken({
            cipher: row.accessTokenCipher,
            iv: row.accessTokenIv,
            tag: row.accessTokenTag,
          }),
        );
        revoked = await service.revoke(config.clientId, config.clientSecret);
      } catch {
        // An undecryptable token cannot be revoked, and there is nothing the
        // learner can do about it. Delete our copy and move on.
        revoked = false;
      }
    }
  }

  await db.gitHubConnection.deleteMany({ where: { userId } });
  return { revoked };
}

/**
 * Runs an operation against GitHub as this learner.
 *
 * The single seam through which every GitHub call passes, so the token is
 * decrypted in exactly one place and a 401 updates the stored status exactly
 * once — callers get a typed error and never have to think about either.
 */
export async function withGitHub<T>(
  userId: string,
  operation: (service: GitHubService) => Promise<T>,
): Promise<T> {
  const row = await db.gitHubConnection.findUnique({
    where: { userId },
    select: {
      status: true,
      accessTokenCipher: true,
      accessTokenIv: true,
      accessTokenTag: true,
    },
  });

  if (!row) {
    throw new GitHubError("NOT_CONNECTED", "Connect your GitHub account to use this.");
  }

  let token: string;
  try {
    token = openToken({
      cipher: row.accessTokenCipher,
      iv: row.accessTokenIv,
      tag: row.accessTokenTag,
    });
  } catch {
    // The key changed, or the row was tampered with. Either way the token is
    // unusable and the learner needs to reconnect.
    await markAuthorizationExpired(userId);
    throw new GitHubError(
      "AUTHORIZATION_EXPIRED",
      "Your GitHub connection needs to be renewed. Reconnect to continue.",
    );
  }

  try {
    const result = await operation(new GitHubService(token));

    // A call that worked proves the token is good, so an earlier expiry flag
    // can be cleared without making the learner reconnect twice.
    if (row.status === "AUTHORIZATION_EXPIRED") {
      await db.gitHubConnection.updateMany({
        where: { userId },
        data: { status: "CONNECTED", lastVerifiedAt: new Date() },
      });
    }

    return result;
  } catch (error) {
    if (error instanceof GitHubError && error.kind === "AUTHORIZATION_EXPIRED") {
      await markAuthorizationExpired(userId);
    }
    throw error;
  }
}
