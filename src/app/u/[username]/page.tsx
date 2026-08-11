import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Github } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { Logo } from "@/components/shared/logo";
import { getPublicProfile } from "@/lib/profile/public";
import { capabilityIcon } from "@/lib/profile/icons";
import { LEVEL_LABEL } from "@/lib/profile/levels";
import { cn } from "@/lib/utils";

/**
 * A learner's public profile.
 *
 * Outside the authenticated layout on purpose: this page must render for
 * somebody with no account, so it cannot sit under a shell that requires one.
 *
 * Everything shown is explicitly opted into. A private profile, an unknown
 * username and an unfinished onboarding all produce the same 404 — telling
 * them apart would let anybody enumerate which usernames exist.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    return { title: "Profile not found", robots: { index: false, follow: false } };
  }

  return {
    // Just the name: the root layout's template appends "· CodeCompass".
    title: profile.displayName,
    description: profile.careerName
      ? `${profile.displayName} is learning ${profile.careerName} on CodeCompass.`
      : `${profile.displayName} is learning on CodeCompass.`,
    // A learner opting into a shareable link has not opted into being indexed.
    robots: { index: false, follow: false },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) notFound();

  const joined = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(profile.joinedAt);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pb-24 pt-10 sm:pt-14">
      <GridBackdrop className="mask-fade-b opacity-40" />
      <Glow className="-top-40 left-1/2 size-[30rem] -translate-x-1/2" />

      <Container>
        <Link href="/" aria-label="CodeCompass" className="inline-flex">
          <Logo />
        </Link>

        {/* ── Header ───────────────────────────────────────────── */}
        <header className="mt-10 max-w-3xl">
          <h1 className="balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {profile.displayName}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {profile.careerName ? `Learning ${profile.careerName} · ` : ""}
            Since {joined}
          </p>

          {profile.github ? (
            <a
              href={profile.github.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-indigo-300 transition-colors hover:text-indigo-200"
            >
              <Github className="size-3.5" aria-hidden />
              {profile.github.username}
              <ExternalLink className="size-3" aria-hidden />
            </a>
          ) : null}
        </header>

        {/* ── Progress ─────────────────────────────────────────── */}
        {profile.progress ? (
          <section aria-labelledby="progress-heading" className="mt-10 max-w-md">
            <h2
              id="progress-heading"
              className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
            >
              Learning progress
            </h2>

            <dl className="mt-3 flex flex-col gap-3">
              {profile.progress.map((bar) => (
                <div key={bar.label}>
                  <div className="flex items-baseline justify-between">
                    <dt className="text-sm text-muted-foreground">{bar.label}</dt>
                    <dd className="font-mono text-sm text-muted-foreground">
                      {bar.percent}%
                    </dd>
                  </div>
                  <div
                    className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-raised"
                    role="progressbar"
                    aria-valuenow={bar.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${bar.label}: ${bar.percent}%`}
                  >
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${bar.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {/* ── Capabilities ─────────────────────────────────────── */}
        {profile.capabilities && profile.capabilities.length > 0 ? (
          <section aria-labelledby="capabilities-heading" className="mt-12">
            <h2
              id="capabilities-heading"
              className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
            >
              Capabilities
            </h2>

            <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {profile.capabilities.map((capability) => {
                const Icon = capabilityIcon(capability.icon);

                return (
                  <li
                    key={capability.slug}
                    className={cn(
                      "surface rounded-xl p-5",
                      capability.level === "CONFIDENT" && "border-emerald-500/25",
                      capability.level === "APPLYING" && "border-primary/25",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          aria-hidden
                          className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-surface text-indigo-400"
                        >
                          <Icon className="size-4" />
                        </span>
                        <h3 className="min-w-0 truncate text-sm font-medium text-foreground">
                          {capability.name}
                        </h3>
                      </div>

                      {/* A word, never colour alone. */}
                      <span
                        className={cn(
                          "shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium",
                          capability.level === "CONFIDENT"
                            ? "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-400"
                            : capability.level === "APPLYING"
                              ? "border-primary/30 bg-primary/10 text-indigo-300"
                              : "border-border bg-surface text-muted-foreground",
                        )}
                      >
                        {LEVEL_LABEL[capability.level]}
                      </span>
                    </div>

                    <p className="pretty mt-3 text-sm leading-relaxed text-muted-foreground">
                      {capability.description}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {/* ── Projects ─────────────────────────────────────────── */}
        {profile.projects && profile.projects.length > 0 ? (
          <section aria-labelledby="public-projects-heading" className="mt-12">
            <h2
              id="public-projects-heading"
              className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
            >
              Projects built
            </h2>

            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {profile.projects.map((project) => (
                <li key={project.slug} className="surface rounded-xl p-5">
                  <h3 className="text-sm font-medium text-foreground">
                    {project.title}
                  </h3>
                  <p className="pretty mt-2 text-sm leading-relaxed text-muted-foreground">
                    {project.shortDescription}
                  </p>
                  {project.technologies.length > 0 ? (
                    <p className="mt-3 text-xs text-subtle-foreground">
                      {project.technologies.slice(0, 5).join(" · ")}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer className="mt-16 max-w-prose border-t border-border pt-6">
          <p className="text-sm leading-relaxed text-subtle-foreground">
            This is a record of what {profile.displayName.split(/\s+/)[0]} has learned
            and built on CodeCompass. It is not a certification, and CodeCompass makes
            no claim about their employability.
          </p>
          <Link
            href="/"
            className="mt-3 inline-flex text-sm text-indigo-300 transition-colors hover:text-indigo-200"
          >
            What is CodeCompass?
          </Link>
        </footer>
      </Container>
    </div>
  );
}
