import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  GitBranch,
  GitCommitHorizontal,
  Lock,
  Shield,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { requireOnboardedUser } from "@/lib/session";
import { withGitHub } from "@/lib/github/connection";
import { GitHubError } from "@/lib/github/types";
import type { GitHubBranch, GitHubCommit, GitHubRepository } from "@/lib/github/types";

export const metadata: Metadata = {
  title: "Repository",
  robots: { index: false, follow: false },
};

/**
 * One repository: its details, branches and recent commits.
 *
 * Not a GitHub clone, and deliberately read-only. It exists so a learner can
 * see the ideas from the Academy — a default branch, a list of branches, a
 * history of commits with messages and short SHAs — in their own real
 * repository, immediately after learning what those words mean.
 *
 * Fetched on the server so the token never approaches the browser.
 */
export default async function RepositoryPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = await params;
  const user = await requireOnboardedUser();

  const fullName = `${owner}/${repo}`;

  let repository: GitHubRepository | null = null;
  let branches: GitHubBranch[] = [];
  let commits: GitHubCommit[] = [];
  let error: { message: string; reconnect: boolean } | null = null;

  try {
    // One round trip through the connection seam, three calls inside it.
    const result = await withGitHub(user.id, async (service) => {
      const detail = await service.getRepository(fullName);
      const [branchList, commitList] = await Promise.all([
        service.listBranches(fullName),
        service.listCommits(fullName),
      ]);
      return { detail, branchList, commitList };
    });

    repository = result.detail;
    branches = result.branchList;
    commits = result.commitList;
  } catch (caught) {
    error =
      caught instanceof GitHubError
        ? {
            message: caught.userMessage,
            reconnect:
              caught.kind === "AUTHORIZATION_EXPIRED" || caught.kind === "NOT_CONNECTED",
          }
        : { message: "That repository could not be loaded.", reconnect: false };
  }

  return (
    <div className="relative flex-1 pb-24 pt-10 sm:pt-14">
      <Container>
        <Link
          href="/github"
          className="inline-flex items-center gap-1.5 rounded text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to GitHub
        </Link>

        {error || !repository ? (
          <div className="mt-8 max-w-2xl rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-5">
            <p className="flex items-start gap-2 text-sm text-amber-300">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {error?.message ?? "That repository could not be loaded."}
            </p>
            <div className="mt-4">
              {error?.reconnect ? (
                <Button size="sm" asChild>
                  <a href="/api/github/connect">Reconnect GitHub</a>
                </Button>
              ) : (
                <Button size="sm" variant="secondary" asChild>
                  <Link href="/github">Back to your repositories</Link>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* ── Header ─────────────────────────────────────── */}
            <header className="mt-6 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-mono text-2xl font-semibold tracking-tight text-foreground">
                  {repository.fullName}
                </h1>
                {repository.isPrivate ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-subtle-foreground">
                    <Lock className="size-3" aria-hidden />
                    Private
                  </span>
                ) : (
                  <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-subtle-foreground">
                    Public
                  </span>
                )}
              </div>

              {repository.description ? (
                <p className="pretty mt-3 text-base leading-relaxed text-muted-foreground">
                  {repository.description}
                </p>
              ) : null}

              <dl className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                {repository.language ? (
                  <div className="flex items-center gap-1.5">
                    <dt className="sr-only">Language</dt>
                    <dd className="text-muted-foreground">{repository.language}</dd>
                  </div>
                ) : null}
                <div className="flex items-center gap-1.5">
                  <GitBranch className="size-3.5 text-subtle-foreground" aria-hidden />
                  <dt className="sr-only">Default branch</dt>
                  <dd className="font-mono text-muted-foreground">
                    {repository.defaultBranch}
                  </dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="size-3.5 text-subtle-foreground" aria-hidden />
                  <dt className="sr-only">Stars</dt>
                  <dd className="text-muted-foreground">{repository.stars}</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Last updated</dt>
                  <dd className="text-muted-foreground">
                    Updated{" "}
                    <time dateTime={repository.updatedAt.toISOString()}>
                      {repository.updatedAt.toISOString().slice(0, 10)}
                    </time>
                  </dd>
                </div>
              </dl>

              <div className="mt-5">
                <Button variant="secondary" asChild>
                  <a
                    href={repository.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open on GitHub
                    <ExternalLink aria-hidden />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </Button>
              </div>
            </header>

            <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
              {/* ── Commits ──────────────────────────────────── */}
              <section aria-labelledby="commits-heading" className="min-w-0">
                <h2
                  id="commits-heading"
                  className="text-lg font-medium tracking-tight text-foreground"
                >
                  Recent commits
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  The history you built in the Academy, in a real repository. Each short
                  SHA is the first seven characters of the commit&apos;s full identifier.
                </p>

                {commits.length === 0 ? (
                  <p className="mt-5 text-sm text-subtle-foreground">
                    No commits yet — this repository is empty.
                  </p>
                ) : (
                  <ol className="mt-5 flex flex-col gap-2">
                    {commits.map((commit) => (
                      <li key={commit.sha}>
                        <a
                          href={commit.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="surface-interactive flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg p-3.5"
                        >
                          <GitCommitHorizontal
                            className="size-3.5 shrink-0 self-center text-indigo-400"
                            aria-hidden
                          />
                          <span className="font-mono text-xs text-subtle-foreground">
                            {commit.shortSha}
                          </span>
                          <span className="min-w-0 flex-1 text-sm text-foreground">
                            {commit.message}
                          </span>
                          <span className="text-xs text-subtle-foreground">
                            {commit.authorName} ·{" "}
                            <time dateTime={commit.committedAt.toISOString()}>
                              {commit.committedAt.toISOString().slice(0, 10)}
                            </time>
                          </span>
                          <span className="sr-only">(opens on GitHub in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              {/* ── Branches ─────────────────────────────────── */}
              <aside>
                <h2 className="text-lg font-medium tracking-tight text-foreground">
                  Branches
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Each of these is a label pointing at a commit — the same thing you
                  created in the simulator.
                </p>

                <ul className="mt-5 flex flex-col gap-2">
                  {branches.map((branch) => (
                    <li
                      key={branch.name}
                      className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-border bg-surface/50 p-3"
                    >
                      <GitBranch
                        className="size-3.5 shrink-0 text-subtle-foreground"
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
                        {branch.name}
                      </span>
                      {branch.isDefault ? (
                        <span className="rounded-md border border-primary/25 bg-primary/[0.08] px-1.5 py-0.5 text-xs text-indigo-300">
                          default
                        </span>
                      ) : null}
                      {branch.isProtected ? (
                        <span className="inline-flex items-center gap-1 text-xs text-subtle-foreground">
                          <Shield className="size-3" aria-hidden />
                          protected
                        </span>
                      ) : null}
                      <span className="w-full font-mono text-xs text-subtle-foreground">
                        {branch.sha}
                      </span>
                    </li>
                  ))}
                </ul>

                {branches.some((branch) => branch.isProtected) ? (
                  <p className="mt-4 text-xs leading-relaxed text-subtle-foreground">
                    A protected branch cannot be pushed to directly — changes have to
                    arrive through a pull request. That is the rule most teams put on
                    main.
                  </p>
                ) : null}
              </aside>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
