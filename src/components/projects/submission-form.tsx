"use client";

import * as React from "react";
import { Check, ExternalLink, Loader2 } from "lucide-react";

import { saveSubmission } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Where the learner records what they built.
 *
 * The links are stored as text and nothing else happens to them. CodeCompass
 * does not visit them — asking a server to fetch an address a user supplied is
 * request forgery, not verification — so the wording never claims the links
 * have been checked. Phase 8 is where GitHub genuinely enters the picture.
 */
export function SubmissionForm({
  projectId,
  initialRepositoryUrl,
  initialDeployedUrl,
  initialNotes,
}: {
  projectId: string;
  initialRepositoryUrl: string | null;
  initialDeployedUrl: string | null;
  initialNotes: string | null;
}) {
  const [repositoryUrl, setRepositoryUrl] = React.useState(initialRepositoryUrl ?? "");
  const [deployedUrl, setDeployedUrl] = React.useState(initialDeployedUrl ?? "");
  const [notes, setNotes] = React.useState(initialNotes ?? "");

  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<{
    repositoryUrl?: string;
    deployedUrl?: string;
  }>({});

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});
    setSaved(false);

    try {
      const result = await saveSubmission({
        projectId,
        repositoryUrl,
        deployedUrl,
        notes,
      });

      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error ?? "That could not be saved.");
        setFieldErrors(result.fieldErrors ?? {});
      }
    } catch {
      setError("That could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="repositoryUrl"
          className="block text-sm font-medium text-foreground"
        >
          Repository URL
        </label>
        <p className="mt-1 text-xs text-subtle-foreground">
          Where the code lives. Needed before you can mark the project complete.
        </p>
        <Input
          id="repositoryUrl"
          type="url"
          inputMode="url"
          value={repositoryUrl}
          onChange={(event) => setRepositoryUrl(event.target.value)}
          placeholder="https://github.com/you/weather-dashboard"
          invalid={Boolean(fieldErrors.repositoryUrl)}
          aria-describedby={
            fieldErrors.repositoryUrl ? "repositoryUrl-error" : undefined
          }
          className="mt-2"
        />
        {fieldErrors.repositoryUrl ? (
          <p id="repositoryUrl-error" className="mt-1.5 text-xs text-rose-300">
            {fieldErrors.repositoryUrl}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="deployedUrl"
          className="block text-sm font-medium text-foreground"
        >
          Live demo URL <span className="text-subtle-foreground">(optional)</span>
        </label>
        <p className="mt-1 text-xs text-subtle-foreground">
          Where it is running, if you have deployed it.
        </p>
        <Input
          id="deployedUrl"
          type="url"
          inputMode="url"
          value={deployedUrl}
          onChange={(event) => setDeployedUrl(event.target.value)}
          placeholder="https://weather-dashboard.example.com"
          invalid={Boolean(fieldErrors.deployedUrl)}
          aria-describedby={fieldErrors.deployedUrl ? "deployedUrl-error" : undefined}
          className="mt-2"
        />
        {fieldErrors.deployedUrl ? (
          <p id="deployedUrl-error" className="mt-1.5 text-xs text-rose-300">
            {fieldErrors.deployedUrl}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-foreground">
          Notes <span className="text-subtle-foreground">(optional)</span>
        </label>
        <p className="mt-1 text-xs text-subtle-foreground">
          What you are pleased with, what you found hard, what you would do differently.
          Worth writing while it is fresh — it is the reflection step.
        </p>
        <textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          maxLength={5000}
          placeholder="I implemented responsive layouts and API error handling. Next time I'd separate the fetching from the rendering earlier."
          className="mt-2 w-full rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-subtle-foreground"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="animate-spin" aria-hidden /> : null}
          Save submission
        </Button>

        <span aria-live="polite" className="text-xs">
          {saved ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <Check className="size-3.5" aria-hidden />
              Saved
            </span>
          ) : error ? (
            <span className="text-rose-300">{error}</span>
          ) : null}
        </span>
      </div>

      {/* Honest about what these links are: stored, not checked. */}
      {initialRepositoryUrl || initialDeployedUrl ? (
        <div className="rounded-lg border border-border bg-surface/40 p-3">
          <p className="text-xs text-subtle-foreground">
            Saved links, as you entered them. CodeCompass stores these but does not
            visit or verify them.
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {[
              { label: "Repository", url: initialRepositoryUrl },
              { label: "Live demo", url: initialDeployedUrl },
            ]
              .filter((entry): entry is { label: string; url: string } =>
                Boolean(entry.url),
              )
              .map((entry) => (
                <li key={entry.label}>
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded text-xs text-muted-foreground",
                      "underline-offset-4 hover:text-foreground hover:underline",
                    )}
                  >
                    {entry.label}
                    <ExternalLink className="size-3" aria-hidden />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
          </ul>
        </div>
      ) : null}
    </form>
  );
}
