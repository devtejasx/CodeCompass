"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ExternalLink,
  Github,
  Loader2,
  Lock,
  Plus,
  Unlink,
} from "lucide-react";

import {
  createRepository,
  linkRepository,
  unlinkRepository,
} from "@/app/actions/github";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RepositoryList } from "@/components/github/repository-list";
import { cn } from "@/lib/utils";
import type { GitHubConnectionState } from "@/lib/github/types";

/**
 * The GitHub panel inside a project workspace.
 *
 * Three states, and the copy differs meaningfully between them: not configured,
 * not connected, connected. When a repository is linked it shows the essentials
 * and gets out of the way — the project page is about building the project, not
 * about GitHub.
 *
 * Phase 7's typed-in repository URL is untouched. A learner who does not use
 * GitHub carries on exactly as before.
 */
export function ProjectRepository({
  projectId,
  projectTitle,
  suggestedName,
  connectionState,
  configured,
  linked,
}: {
  projectId: string;
  projectTitle: string;
  /** Derived from the project slug, so the field opens with something sensible. */
  suggestedName: string;
  connectionState: GitHubConnectionState;
  configured: boolean;
  linked: {
    fullName: string;
    url: string;
    defaultBranch: string;
    isPrivate: boolean;
  } | null;
}) {
  const router = useRouter();
  const [mode, setMode] = React.useState<"idle" | "choose" | "create">("idle");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Create form
  const [name, setName] = React.useState(suggestedName);
  const [description, setDescription] = React.useState(
    `My CodeCompass project: ${projectTitle}`,
  );
  // Private by default, everywhere. A learning project should never be
  // published because a checkbox defaulted the other way.
  const [isPrivate, setIsPrivate] = React.useState(true);
  const [fieldError, setFieldError] = React.useState<string | null>(null);

  const reset = () => {
    setMode("idle");
    setError(null);
    setFieldError(null);
    setPending(false);
  };

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFieldError(null);

    try {
      const result = await createRepository({
        projectId,
        name,
        description,
        isPrivate,
      });
      if (result.ok) {
        reset();
        router.refresh();
      } else {
        setError(result.error ?? "That repository could not be created.");
        setFieldError(result.fieldError ?? null);
        setPending(false);
      }
    } catch {
      setError("That repository could not be created.");
      setPending(false);
    }
  };

  const link = async (fullName: string) => {
    setPending(true);
    setError(null);
    try {
      const result = await linkRepository({ projectId, fullName });
      if (result.ok) {
        reset();
        router.refresh();
      } else {
        setError(result.error ?? "That repository could not be linked.");
        setPending(false);
      }
    } catch {
      setError("That repository could not be linked.");
      setPending(false);
    }
  };

  const unlink = async () => {
    setPending(true);
    setError(null);
    try {
      const result = await unlinkRepository({ projectId });
      if (result.ok) router.refresh();
      else {
        setError(result.error ?? "That could not be unlinked.");
        setPending(false);
      }
    } catch {
      setError("That could not be unlinked.");
      setPending(false);
    }
  };

  // ── Not configured ─────────────────────────────────────────────────────
  if (!configured) {
    return (
      <Panel>
        <p className="text-sm leading-relaxed text-muted-foreground">
          GitHub integration isn&apos;t configured on this deployment. You can still
          record your repository URL by hand above, exactly as before.
        </p>
      </Panel>
    );
  }

  // ── Linked ─────────────────────────────────────────────────────────────
  if (linked) {
    return (
      <Panel>
        <div className="rounded-lg border border-border bg-surface/60 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Github className="size-4 shrink-0 text-indigo-400" aria-hidden />
            <span className="min-w-0 break-all font-mono text-sm text-foreground">
              {linked.fullName}
            </span>
            {linked.isPrivate ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-1.5 py-0.5 text-xs text-subtle-foreground">
                <Lock className="size-3" aria-hidden />
                Private
              </span>
            ) : null}
          </div>

          <p className="mt-2 font-mono text-xs text-subtle-foreground">
            default branch: {linked.defaultBranch}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" asChild>
              <a href={linked.url} target="_blank" rel="noopener noreferrer">
                Open on GitHub
                <ExternalLink aria-hidden />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <Link href={`/github/${linked.fullName}`}>Branches and commits</Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void unlink()}
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : (
                <Unlink aria-hidden />
              )}
              Unlink
            </Button>
          </div>

          <p className="mt-3 text-xs text-subtle-foreground">
            Unlinking removes the link here only. The repository on GitHub is not
            changed.
          </p>
        </div>

        {error ? <Error message={error} /> : null}
      </Panel>
    );
  }

  // ── Connected, nothing linked yet ──────────────────────────────────────
  if (connectionState === "CONNECTED") {
    return (
      <Panel>
        {mode === "idle" ? (
          <>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Link a repository to this project, or create a new one on your GitHub
              account.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setMode("create")}>
                <Plus aria-hidden />
                Create repository
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setMode("choose")}>
                <Github aria-hidden />
                Connect an existing one
              </Button>
            </div>
          </>
        ) : null}

        {mode === "create" ? (
          <form onSubmit={create} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="repo-name"
                className="block text-sm font-medium text-foreground"
              >
                Repository name
              </label>
              <Input
                id="repo-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                invalid={Boolean(fieldError)}
                aria-describedby={fieldError ? "repo-name-error" : undefined}
                className="mt-2"
              />
              {fieldError ? (
                <p id="repo-name-error" className="mt-1.5 text-xs text-rose-300">
                  {fieldError}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="repo-description"
                className="block text-sm font-medium text-foreground"
              >
                Description <span className="text-subtle-foreground">(optional)</span>
              </label>
              <Input
                id="repo-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-2"
              />
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-foreground">
                Visibility
              </legend>
              <div className="mt-2 flex flex-col gap-2">
                {[
                  {
                    value: true,
                    label: "Private",
                    hint: "Only you can see it. Recommended while you are learning.",
                  },
                  {
                    value: false,
                    label: "Public",
                    hint: "Anyone can see it. Make sure it contains no secrets first.",
                  },
                ].map((option) => (
                  <label
                    key={option.label}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                      isPrivate === option.value
                        ? "border-primary/40 bg-primary/[0.06]"
                        : "border-border bg-surface/40",
                    )}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      checked={isPrivate === option.value}
                      onChange={() => setIsPrivate(option.value)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden
                      className={cn(
                        "mt-1 size-3 shrink-0 rounded-full border",
                        isPrivate === option.value
                          ? "border-primary/60 bg-primary"
                          : "border-border",
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {option.hint}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
                Create on GitHub
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={reset}>
                Cancel
              </Button>
            </div>

            <p className="text-xs leading-relaxed text-subtle-foreground">
              A README is added so the repository can be cloned straight away. It will
              be linked to this project automatically.
            </p>

            {error ? <Error message={error} /> : null}
          </form>
        ) : null}

        {mode === "choose" ? (
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Choose a repository to link to this project.
              </p>
              <Button size="sm" variant="ghost" onClick={reset}>
                Cancel
              </Button>
            </div>

            {pending ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-indigo-400" aria-hidden />
                Linking…
              </p>
            ) : (
              <div className="max-h-[26rem] overflow-y-auto pr-1">
                <RepositoryList
                  compact
                  onSelect={(repository) => void link(repository.fullName)}
                />
              </div>
            )}

            {error ? <Error message={error} /> : null}
          </div>
        ) : null}
      </Panel>
    );
  }

  // ── Not connected, or expired ──────────────────────────────────────────
  return (
    <Panel>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {connectionState === "AUTHORIZATION_EXPIRED"
          ? "Your GitHub connection needs renewing before you can link a repository."
          : "Connect your GitHub account to create a repository for this project, or link one you already have."}
      </p>
      <div className="mt-4">
        <Button size="sm" asChild>
          <a href="/api/github/connect">
            <Github aria-hidden />
            {connectionState === "AUTHORIZATION_EXPIRED"
              ? "Reconnect GitHub"
              : "Connect GitHub"}
          </a>
        </Button>
      </div>
    </Panel>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section aria-labelledby="project-github-heading">
      <h3
        id="project-github-heading"
        className="flex items-center gap-2 text-xs font-medium uppercase tracking-label text-subtle-foreground"
      >
        <Github className="size-3.5" aria-hidden />
        GitHub repository
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Error({ message }: { message: string }) {
  return (
    <p role="status" className="mt-3 flex items-start gap-2 text-xs text-amber-300">
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      {message}
    </p>
  );
}
