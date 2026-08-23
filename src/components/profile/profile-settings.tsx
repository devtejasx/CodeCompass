"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Globe, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { setProfileVisibility, setUsername } from "@/app/actions/profile";
import { USERNAME_MAX } from "@/lib/profile/username";
import { cn } from "@/lib/utils";

/**
 * Public profile controls.
 *
 * Everything defaults to off, and the master switch is separate from the
 * section switches so turning the profile private is one click rather than
 * five. Each toggle sends only the field it changed, so a stale tab cannot
 * silently re-enable something turned off elsewhere.
 *
 * The copy states plainly what is never published, because the most useful
 * thing a privacy screen can do is tell you what it is not doing.
 */
export function ProfileSettings({
  initialUsername,
  initialSettings,
  origin,
}: {
  initialUsername: string | null;
  initialSettings: {
    isPublic: boolean;
    publicShowSkills: boolean;
    publicShowProjects: boolean;
    publicShowProgress: boolean;
    publicShowGitHub: boolean;
  };
  /** For showing the real URL rather than a placeholder. */
  origin: string;
}) {
  const router = useRouter();

  const [username, setUsernameValue] = React.useState(initialUsername ?? "");
  const [savedUsername, setSavedUsername] = React.useState(initialUsername);
  const [settings, setSettings] = React.useState(initialSettings);

  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  function submitUsername(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await setUsername({ username });

      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }

      setSavedUsername(result.username ?? username);
      setUsernameValue(result.username ?? username);
      setSaved(true);
      router.refresh();
    });
  }

  function toggle(key: keyof typeof settings, value: boolean) {
    setError(null);
    const previous = settings;
    setSettings((current) => ({ ...current, [key]: value }));

    startTransition(async () => {
      const result = await setProfileVisibility({ [key]: value });

      if (!result.ok) {
        // Roll back rather than leave the switch showing a state that was
        // never saved.
        setSettings(previous);
        setError(result.error ?? "Something went wrong.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {/* ── Username ─────────────────────────────────────────── */}
      <section aria-labelledby="username-heading" className="surface rounded-xl p-5">
        <h2 id="username-heading" className="text-sm font-medium text-foreground">
          Your username
        </h2>
        <p className="pretty mt-1.5 text-sm leading-relaxed text-muted-foreground">
          This is the only public identifier CodeCompass uses. Your account id is never
          part of a public address.
        </p>

        <form onSubmit={submitUsername} className="mt-4">
          <label htmlFor="username" className="sr-only">
            Username
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-subtle-foreground">{origin}/u/</span>
            <input
              id="username"
              value={username}
              onChange={(event) => setUsernameValue(event.target.value)}
              maxLength={USERNAME_MAX}
              placeholder="your-name"
              autoComplete="off"
              spellCheck={false}
              className="tap-target h-9 min-w-0 flex-1 rounded-lg border border-border bg-surface/60 px-3 text-base text-foreground placeholder:text-subtle-foreground sm:text-sm"
            />
            <Button type="submit" size="sm" disabled={pending || !username.trim()}>
              {savedUsername ? "Update" : "Claim"}
            </Button>
          </div>
        </form>

        {saved ? (
          <p
            role="status"
            className="mt-2 flex items-center gap-1.5 text-sm text-emerald-400"
          >
            <Check className="size-3.5" aria-hidden />
            Saved.
          </p>
        ) : null}
      </section>

      {/* ── Visibility ───────────────────────────────────────── */}
      <section aria-labelledby="visibility-heading" className="surface rounded-xl p-5">
        <h2 id="visibility-heading" className="text-sm font-medium text-foreground">
          Public profile
        </h2>
        <p className="pretty mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Off by default. With it off, your address is not found at all — even by
          somebody who knows your username.
        </p>

        <div className="mt-4 flex flex-col gap-1">
          <Toggle
            id="isPublic"
            label="Make my profile public"
            description={
              savedUsername
                ? `Anyone with the link can see ${origin}/u/${savedUsername}`
                : "Claim a username first"
            }
            checked={settings.isPublic}
            disabled={pending || !savedUsername}
            onChange={(value) => toggle("isPublic", value)}
          />
        </div>

        <div
          className={cn(
            "mt-4 flex flex-col gap-1 border-t border-border pt-4 transition-opacity",
            !settings.isPublic && "opacity-50",
          )}
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-label text-subtle-foreground">
            What to show
          </p>

          <Toggle
            id="publicShowSkills"
            label="Capabilities"
            description="Your capability names and levels. Never the counts behind them."
            checked={settings.publicShowSkills}
            disabled={pending || !settings.isPublic}
            onChange={(value) => toggle("publicShowSkills", value)}
          />
          <Toggle
            id="publicShowProjects"
            label="Completed projects"
            description="Finished projects only. Work in progress stays private."
            checked={settings.publicShowProjects}
            disabled={pending || !settings.isPublic}
            onChange={(value) => toggle("publicShowProjects", value)}
          />
          <Toggle
            id="publicShowProgress"
            label="Learning progress"
            description="Three rounded percentages. Never anything resembling a readiness score."
            checked={settings.publicShowProgress}
            disabled={pending || !settings.isPublic}
            onChange={(value) => toggle("publicShowProgress", value)}
          />
          <Toggle
            id="publicShowGitHub"
            label="GitHub username"
            description="Your handle and profile link only."
            checked={settings.publicShowGitHub}
            disabled={pending || !settings.isPublic}
            onChange={(value) => toggle("publicShowGitHub", value)}
          />
        </div>
      </section>

      {/* ── What is never published ──────────────────────────── */}
      <section aria-labelledby="never-heading" className="surface rounded-xl p-5">
        <h2
          id="never-heading"
          className="flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <Lock className="size-4 text-indigo-400" aria-hidden />
          Never published, at any setting
        </h2>

        <ul className="mt-3 flex flex-col gap-1.5">
          {[
            "Your email address and anything about your account",
            "Your GitHub access token, private repositories or granted scopes",
            "Your activity, your conversations with the mentor, and how many attempts anything took",
            "Projects you have not completed, and any repository or demo link",
            "Where CodeCompass thinks you are struggling",
          ].map((item) => (
            <li key={item} className="text-sm leading-relaxed text-muted-foreground">
              {item}
            </li>
          ))}
        </ul>
      </section>

      {error ? (
        <p role="status" className="text-sm text-rose-400">
          {error}
        </p>
      ) : null}

      {settings.isPublic && savedUsername ? (
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Globe className="size-3.5 text-emerald-400" aria-hidden />
          Your profile is public at{" "}
          <a
            href={`/u/${savedUsername}`}
            className="text-indigo-300 transition-colors hover:text-indigo-200"
          >
            /u/{savedUsername}
          </a>
        </p>
      ) : null}
    </div>
  );
}

function Toggle({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm text-foreground">
          {label}
        </label>
        <p className="pretty mt-0.5 text-xs leading-relaxed text-subtle-foreground">
          {description}
        </p>
      </div>

      {/* A real checkbox: keyboard, screen readers and form semantics for free. */}
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="tap-target-square mt-0.5 size-4 shrink-0 accent-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}
