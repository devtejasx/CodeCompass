"use client";

import * as React from "react";
import {
  AlertTriangle,
  ExternalLink,
  GitBranch,
  Loader2,
  Lock,
  RefreshCw,
  Star,
} from "lucide-react";

import { listRepositories } from "@/app/actions/github";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GitHubRepository } from "@/lib/github/types";

/**
 * The learner's repositories.
 *
 * Fetched on mount rather than during the page render, so a slow or
 * rate-limited GitHub delays a list rather than the whole page — and so the
 * result is never cached into a shared render. Nothing is stored: this is a
 * view onto GitHub, and closing the tab is the end of it.
 */
export function RepositoryList({
  onSelect,
  selectedFullName,
  compact = false,
}: {
  /** Supplied when the list is being used to pick a repository for a project. */
  onSelect?: (repository: GitHubRepository) => void;
  selectedFullName?: string | null;
  compact?: boolean;
}) {
  const [repositories, setRepositories] = React.useState<GitHubRepository[] | null>(
    null,
  );
  const [error, setError] = React.useState<string | null>(null);
  const [needsReconnect, setNeedsReconnect] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listRepositories();
      if (result.ok && result.repositories) {
        setRepositories(result.repositories);
      } else {
        setError(result.error ?? "Your repositories could not be loaded.");
        setNeedsReconnect(Boolean(result.needsReconnect));
      }
    } catch {
      setError("Your repositories could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const visible = React.useMemo(() => {
    if (!repositories) return [];
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) return repositories;
    return repositories.filter(
      (repository) =>
        repository.name.toLowerCase().includes(needle) ||
        (repository.description ?? "").toLowerCase().includes(needle),
    );
  }, [repositories, query]);

  if (loading) {
    return (
      <p
        role="status"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Loader2 className="size-4 animate-spin text-indigo-400" aria-hidden />
        Loading your repositories from GitHub…
      </p>
    );
  }

  if (error) {
    return (
      <div
        role="status"
        className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4"
      >
        <p className="flex items-start gap-2 text-sm text-amber-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {needsReconnect ? (
            <Button size="sm" asChild>
              <a href="/api/github/connect">Reconnect GitHub</a>
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => void load()}>
              <RefreshCw aria-hidden />
              Try again
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!repositories || repositories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No repositories yet. Create one from a project, or on GitHub directly.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="repo-search" className="sr-only">
          Search repositories
        </label>
        <input
          id="repo-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search repositories"
          className="h-9 w-full rounded-lg border border-border bg-surface/60 px-3 text-sm text-foreground placeholder:text-subtle-foreground sm:w-64"
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => void load()}
          className="ml-auto"
        >
          <RefreshCw aria-hidden />
          Refresh
        </Button>
      </div>

      {visible.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">
          None of your repositories match that.
        </p>
      ) : (
        <ul
          aria-live="polite"
          className={cn(
            "mt-5 grid gap-3",
            compact ? "sm:grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3",
          )}
        >
          {visible.map((repository) => {
            const selected = selectedFullName === repository.fullName;

            const body = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0 font-mono text-sm font-medium text-foreground">
                    {repository.name}
                  </span>
                  {repository.isPrivate ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-surface px-1.5 py-0.5 text-xs text-subtle-foreground">
                      <Lock className="size-3" aria-hidden />
                      Private
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-md border border-border bg-surface px-1.5 py-0.5 text-xs text-subtle-foreground">
                      Public
                    </span>
                  )}
                </div>

                {repository.description ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {repository.description}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-subtle-foreground">No description</p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-subtle-foreground">
                  {repository.language ? <span>{repository.language}</span> : null}
                  <span className="inline-flex items-center gap-1">
                    <GitBranch className="size-3" aria-hidden />
                    {repository.defaultBranch}
                  </span>
                  {repository.stars > 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-3" aria-hidden />
                      {repository.stars}
                    </span>
                  ) : null}
                  <span suppressHydrationWarning>
                    updated {relativeTime(repository.updatedAt)}
                  </span>
                </div>
              </>
            );

            return (
              <li key={repository.id} className="flex">
                {onSelect ? (
                  <button
                    type="button"
                    onClick={() => onSelect(repository)}
                    aria-pressed={selected}
                    className={cn(
                      "surface-interactive w-full rounded-xl p-4 text-left",
                      selected && "border-primary/40 bg-primary/[0.06]",
                    )}
                  >
                    {body}
                    {selected ? (
                      <span className="mt-3 block text-xs font-medium text-indigo-300">
                        Selected
                      </span>
                    ) : null}
                  </button>
                ) : (
                  <a
                    href={repository.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="surface-interactive w-full rounded-xl p-4"
                  >
                    {body}
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300">
                      Open on GitHub
                      <ExternalLink className="size-3" aria-hidden />
                      <span className="sr-only">(opens in a new tab)</span>
                    </span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Coarse, and computed from the reader's clock — hence the suppressed warning. */
function relativeTime(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}
