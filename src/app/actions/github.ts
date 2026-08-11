"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { disconnect, withGitHub } from "@/lib/github/connection";
import { GitHubError, type GitHubRepository } from "@/lib/github/types";

/**
 * Every GitHub mutation and every fetch a client component needs.
 *
 * No action here returns a token, and none can: the token is decrypted inside
 * withGitHub, used, and discarded. What crosses this boundary is the mapped
 * repository shape and a plain sentence when something fails.
 *
 * As everywhere else in the application, the user comes from the session — a
 * userId in a payload is ignored.
 */

const GENERIC_ERROR = "Something went wrong. Please try again in a moment.";

export interface GitHubResult {
  ok: boolean;
  error?: string;
  /** Set when the failure is one the learner can act on by reconnecting. */
  needsReconnect?: boolean;
}

/** Turns a typed GitHub failure into something safe to render. */
function toResult(error: unknown): GitHubResult {
  if (error instanceof GitHubError) {
    return {
      ok: false,
      error: error.userMessage,
      needsReconnect:
        error.kind === "AUTHORIZATION_EXPIRED" || error.kind === "NOT_CONNECTED",
    };
  }
  console.error("[github action] unexpected failure");
  return { ok: false, error: GENERIC_ERROR };
}

// ── Disconnect ─────────────────────────────────────────────────────────────

/**
 * Removes the GitHub connection.
 *
 * Repositories are never touched: GitHub is asked to forget the grant, our row
 * is deleted, and the learner's repositories carry on existing. Project links
 * survive too — deleting somebody's recorded work because they unlinked an
 * account would be indefensible.
 */
export async function disconnectGitHub(): Promise<GitHubResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  try {
    await disconnect(user.id);
    revalidatePath("/github");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch {
    console.error("[disconnectGitHub] failed");
    return { ok: false, error: GENERIC_ERROR };
  }
}

// ── Repositories ───────────────────────────────────────────────────────────

export interface RepositoryListResult extends GitHubResult {
  repositories?: GitHubRepository[];
}

export async function listRepositories(): Promise<RepositoryListResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  try {
    const repositories = await withGitHub(user.id, (service) =>
      service.listRepositories(),
    );
    return { ok: true, repositories };
  } catch (error) {
    return toResult(error);
  }
}

const createInput = z.object({
  projectId: z.string().min(1).optional(),
  name: z
    .string()
    .min(1, "Give the repository a name.")
    .max(100, "That name is too long for GitHub.")
    // GitHub's own rule. Checked here so the learner gets a useful message
    // rather than a 422 from an API they never asked to talk to.
    .regex(
      /^[A-Za-z0-9._-]+$/,
      "Use letters, numbers, dots, hyphens and underscores only.",
    ),
  description: z.string().max(350).optional(),
  isPrivate: z.boolean(),
});

export interface CreateRepositoryResult extends GitHubResult {
  repository?: GitHubRepository;
  fieldError?: string;
}

/**
 * Creates a repository on the learner's GitHub account, and links it to a
 * project when one was named.
 *
 * Private is the default at every layer — the form, the schema and the service
 * — because a learning project should never be published by an accident of
 * defaulting.
 */
export async function createRepository(
  input: unknown,
): Promise<CreateRepositoryResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const parsed = createInput.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the repository details and try again.",
      fieldError: parsed.error.issues[0]?.message,
    };
  }

  try {
    const repository = await withGitHub(user.id, (service) =>
      service.createRepository({
        name: parsed.data.name,
        description: parsed.data.description,
        isPrivate: parsed.data.isPrivate,
        // A README makes the repository clonable straight away, which is what
        // the next step of the workflow needs.
        autoInit: true,
      }),
    );

    if (parsed.data.projectId) {
      await linkRepositoryToProject(user.id, parsed.data.projectId, repository);
    }

    revalidatePath("/github");
    revalidatePath("/projects");
    return { ok: true, repository };
  } catch (error) {
    return toResult(error);
  }
}

const linkInput = z.object({
  projectId: z.string().min(1),
  fullName: z.string().min(1).max(200),
});

/**
 * Links an existing repository to a project.
 *
 * The repository is re-read from GitHub rather than trusted from the client, so
 * a crafted payload cannot record a repository the learner cannot actually see
 * — GitHub answers 404 for those, which becomes a plain "not found".
 */
export async function linkRepository(input: unknown): Promise<GitHubResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const parsed = linkInput.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "That repository could not be read." };

  try {
    const repository = await withGitHub(user.id, (service) =>
      service.getRepository(parsed.data.fullName),
    );

    await linkRepositoryToProject(user.id, parsed.data.projectId, repository);

    revalidatePath("/projects");
    return { ok: true };
  } catch (error) {
    return toResult(error);
  }
}

const unlinkInput = z.object({ projectId: z.string().min(1) });

/** Removes the link. The repository on GitHub is untouched. */
export async function unlinkRepository(input: unknown): Promise<GitHubResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const parsed = unlinkInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That project could not be found." };

  try {
    // Scoped by userId, so another learner's project is not found rather than
    // found and then rejected.
    const updated = await db.userProject.updateMany({
      where: { userId: user.id, projectId: parsed.data.projectId },
      data: {
        githubRepoId: null,
        githubRepoFullName: null,
        githubRepoUrl: null,
        githubDefaultBranch: null,
        githubRepoPrivate: null,
        githubLinkedAt: null,
      },
    });

    if (updated.count === 0) {
      return { ok: false, error: "That project could not be found." };
    }

    revalidatePath("/projects");
    return { ok: true };
  } catch {
    console.error("[unlinkRepository] failed");
    return { ok: false, error: GENERIC_ERROR };
  }
}

// ── Internals ──────────────────────────────────────────────────────────────

/**
 * Writes the repository snapshot onto the learner's own UserProject.
 *
 * updateMany scoped by userId rather than a lookup then an update: another
 * learner's project simply matches nothing.
 */
async function linkRepositoryToProject(
  userId: string,
  projectId: string,
  repository: GitHubRepository,
): Promise<void> {
  await db.userProject.updateMany({
    where: { userId, projectId },
    data: {
      githubRepoId: BigInt(repository.id),
      githubRepoFullName: repository.fullName,
      githubRepoUrl: repository.htmlUrl,
      githubDefaultBranch: repository.defaultBranch,
      githubRepoPrivate: repository.isPrivate,
      githubLinkedAt: new Date(),
    },
  });

  // Phase 7's typed-in URL is filled in only when it is empty, so a learner who
  // deliberately recorded a different address keeps it.
  await db.userProject.updateMany({
    where: { userId, projectId, repositoryUrl: null },
    data: { repositoryUrl: repository.htmlUrl },
  });
}
