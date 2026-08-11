import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Github, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { GridBackdrop } from "@/components/shared/backdrops";
import { DisconnectGitHub } from "@/components/github/disconnect-github";
import { RepositoryList } from "@/components/github/repository-list";
import { requireOnboardedUser } from "@/lib/session";
import { getConnectionView } from "@/lib/github/connection";
import { SCOPE_EXPLANATIONS, githubAvailability } from "@/lib/github/config";

export const metadata: Metadata = {
  title: "GitHub",
  robots: { index: false, follow: false },
};

/** The short codes the OAuth routes hand back, turned into sentences. */
const ERRORS: Record<string, string> = {
  unconfigured:
    "GitHub integration isn't configured on this deployment, so connecting isn't possible here.",
  denied:
    "You cancelled on GitHub's authorisation screen. Nothing was connected, and nothing changed.",
  state:
    "That sign-in attempt couldn't be verified, so it was refused. Start again from this page.",
  exchange: "GitHub didn't complete the sign-in. Try connecting again.",
  profile: "We connected to GitHub but couldn't read your profile. Try again.",
  session: "Your session expired during sign-in. Sign in again, then reconnect.",
};

export default async function GitHubPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; connected?: string }>;
}) {
  const user = await requireOnboardedUser();
  const params = await searchParams;

  const [connection, availability] = await Promise.all([
    getConnectionView(user.id),
    Promise.resolve(githubAvailability()),
  ]);

  const errorMessage = params.error ? (ERRORS[params.error] ?? ERRORS.exchange) : null;
  const justConnected = params.connected === "1" && connection.state === "CONNECTED";

  return (
    <div className="relative flex-1 overflow-hidden pb-24 pt-10 sm:pt-14">
      <GridBackdrop className="mask-fade-b opacity-50" />

      <Container>
        <header className="max-w-3xl">
          <span
            aria-hidden
            className="grid size-12 place-items-center rounded-xl border border-border bg-surface text-indigo-400"
          >
            <Github className="size-5" />
          </span>

          <h1 className="balance mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            GitHub
          </h1>
          <p className="pretty mt-3 text-base leading-relaxed text-muted-foreground">
            Connect your GitHub account to browse your repositories and create one for a
            CodeCompass project. Everything in the{" "}
            <Link
              href="/academy/git"
              className="rounded text-foreground underline-offset-4 hover:underline"
            >
              Git &amp; GitHub Academy
            </Link>{" "}
            works without this.
          </p>
        </header>

        {/* ── Flash messages ───────────────────────────────────── */}
        {errorMessage ? (
          <div
            role="status"
            className="mt-8 max-w-3xl rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4"
          >
            <p className="flex items-start gap-2 text-sm text-amber-300">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {errorMessage}
            </p>
          </div>
        ) : null}

        {justConnected ? (
          <div
            role="status"
            className="mt-8 max-w-3xl rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4"
          >
            <p className="text-sm text-emerald-400">
              Connected as {connection.account?.username}.
            </p>
          </div>
        ) : null}

        {/* ── Connection ───────────────────────────────────────── */}
        <section aria-labelledby="connection-heading" className="mt-8 max-w-3xl">
          <h2 id="connection-heading" className="sr-only">
            Connection status
          </h2>

          {!availability.configured ? (
            <NotConfigured reason={availability.reason} />
          ) : connection.state === "NOT_CONNECTED" ? (
            <NotConnected />
          ) : (
            <Connected
              username={connection.account!.username}
              name={connection.account!.name}
              avatarUrl={connection.account!.avatarUrl}
              profileUrl={connection.account!.profileUrl}
              publicRepos={connection.account!.publicRepos}
              expired={connection.state === "AUTHORIZATION_EXPIRED"}
              connectedAt={connection.connectedAt}
            />
          )}
        </section>

        {/* ── Repositories ─────────────────────────────────────── */}
        {connection.state === "CONNECTED" ? (
          <section aria-labelledby="repositories-heading" className="mt-14">
            <h2
              id="repositories-heading"
              className="text-lg font-medium tracking-tight text-foreground"
            >
              Your repositories
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Loaded from GitHub when you open this page, not stored here.
            </p>
            <div className="mt-5">
              <RepositoryList />
            </div>
          </section>
        ) : null}
      </Container>
    </div>
  );
}

function NotConfigured({ reason }: { reason?: string }) {
  return (
    <div className="surface rounded-xl p-6">
      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
        <AlertTriangle className="size-4 shrink-0 text-amber-400" aria-hidden />
        GitHub integration isn&apos;t configured
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        This deployment has no GitHub OAuth app set up, so connecting isn&apos;t
        possible here. The Academy — curriculum, simulator, exercises and command
        reference — works in full without it.
      </p>
      {reason ? (
        <p className="mt-3 rounded-lg border border-border bg-surface/60 p-3 font-mono text-xs leading-relaxed text-subtle-foreground">
          {reason}
        </p>
      ) : null}
      <div className="mt-5">
        <Button variant="secondary" asChild>
          <Link href="/academy/git">
            Back to the Academy
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function NotConnected() {
  return (
    <div className="surface rounded-xl p-6">
      <h3 className="text-base font-medium tracking-tight text-foreground">
        Connect your GitHub account
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        You&apos;ll be sent to GitHub to authorise CodeCompass, then brought back here.
        We never see your GitHub password.
      </p>

      {/* Say what is being asked for before asking for it. */}
      <div className="mt-5 rounded-lg border border-border bg-surface/60 p-4">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-label text-subtle-foreground">
          <Shield className="size-3.5" aria-hidden />
          What CodeCompass will ask for
        </p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {SCOPE_EXPLANATIONS.map((entry) => (
            <li key={entry.scope} className="text-sm leading-relaxed">
              <code className="rounded bg-surface-raised px-1.5 py-0.5 font-mono text-xs text-indigo-300">
                {entry.scope}
              </code>
              <span className="ml-2 text-muted-foreground">{entry.why}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-subtle-foreground">
          CodeCompass never deletes repositories, never pushes code, and never acts on
          your account without you asking. You can disconnect at any time, and doing so
          leaves your repositories untouched.
        </p>
      </div>

      <div className="mt-5">
        {/* A plain link: OAuth needs a top-level navigation, not a fetch. */}
        <Button asChild>
          <a href="/api/github/connect">
            <Github aria-hidden />
            Connect GitHub
          </a>
        </Button>
      </div>
    </div>
  );
}

function Connected({
  username,
  name,
  avatarUrl,
  profileUrl,
  publicRepos,
  expired,
  connectedAt,
}: {
  username: string;
  name: string | null;
  avatarUrl: string | null;
  profileUrl: string;
  publicRepos: number;
  expired: boolean;
  connectedAt: Date | null;
}) {
  return (
    <div
      className={cnCard(expired)}
    >
      <div className="flex flex-wrap items-start gap-4">
        {avatarUrl ? (
          /*
           * A plain img rather than next/image: the avatar is a per-user URL on
           * GitHub's CDN, and routing it through the optimiser would make our
           * server proxy an arbitrary remote host for no benefit at 56px.
           */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            width={56}
            height={56}
            className="size-14 shrink-0 rounded-full border border-border"
          />
        ) : (
          <span
            aria-hidden
            className="grid size-14 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted-foreground"
          >
            <Github className="size-5" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-base font-medium text-foreground">
            {name ?? username}
            <span className="ml-2 font-mono text-sm font-normal text-subtle-foreground">
              @{username}
            </span>
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {publicRepos} public {publicRepos === 1 ? "repository" : "repositories"}
            {connectedAt ? (
              <>
                {" · connected "}
                <time dateTime={connectedAt.toISOString()}>
                  {connectedAt.toISOString().slice(0, 10)}
                </time>
              </>
            ) : null}
          </p>

          <p className="mt-2">
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded text-sm text-indigo-300 underline-offset-4 hover:underline"
            >
              View profile on GitHub
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </div>
      </div>

      {expired ? (
        <div className="mt-5 rounded-lg border border-amber-500/25 bg-amber-500/[0.06] p-4">
          <p className="flex items-start gap-2 text-sm text-amber-300">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            This connection needs renewing — the authorisation was revoked or has
            expired. Your linked repositories are still recorded and will work again
            once you reconnect.
          </p>
          <div className="mt-4">
            <Button size="sm" asChild>
              <a href="/api/github/connect">
                <Github aria-hidden />
                Reconnect GitHub
              </a>
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 border-t border-border pt-5">
        <DisconnectGitHub username={username} />
      </div>
    </div>
  );
}

function cnCard(expired: boolean): string {
  return expired
    ? "rounded-xl border border-amber-500/25 bg-amber-500/[0.04] p-6"
    : "surface rounded-xl p-6";
}
