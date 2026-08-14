import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { ProfileSettings } from "@/components/profile/profile-settings";
import { requireOnboardedUser } from "@/lib/session";
import { db } from "@/lib/db";
import { appOrigin } from "@/lib/github/config";

export const metadata: Metadata = {
  title: "Profile settings",
  robots: { index: false, follow: false },
};

/**
 * Profile settings: username, public visibility and export.
 *
 * A server component that loads the learner's own settings and hands them to
 * one client island. Settings are read with `where: { userId }`, so there is no
 * path that could load somebody else's.
 */
export default async function ProfileSettingsPage() {
  const user = await requireOnboardedUser();

  const profile = await db.profile.findUniqueOrThrow({
    where: { userId: user.id },
    select: {
      username: true,
      isPublic: true,
      publicShowSkills: true,
      publicShowProjects: true,
      publicShowProgress: true,
      publicShowGitHub: true,
    },
  });

  return (
    <div className="relative flex-1 overflow-hidden pb-24 pt-10 sm:pt-14">
      <GridBackdrop className="mask-fade-b opacity-40" />
      <Glow className="-top-40 left-1/2 size-[30rem] -translate-x-1/2" />

      <Container>
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-3.5 rotate-180" aria-hidden />
          Techie Profile
        </Link>

        <header className="mt-6 max-w-3xl">
          <h1 className="balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Profile settings
          </h1>
          <p className="pretty mt-3 text-base leading-relaxed text-muted-foreground">
            Your profile is private. Everything below is off until you turn it on, and
            you choose each section separately.
          </p>
        </header>

        <div className="mt-10">
          <ProfileSettings
            initialUsername={profile.username}
            initialSettings={{
              isPublic: profile.isPublic,
              publicShowSkills: profile.publicShowSkills,
              publicShowProjects: profile.publicShowProjects,
              publicShowProgress: profile.publicShowProgress,
              publicShowGitHub: profile.publicShowGitHub,
            }}
            origin={appOrigin()}
          />
        </div>

        {/* ── Export ───────────────────────────────────────────── */}
        <section
          aria-labelledby="export-heading"
          className="surface mt-6 max-w-2xl rounded-xl p-5"
        >
          <h2 id="export-heading" className="text-sm font-medium text-foreground">
            Export your learning record
          </h2>
          <p className="pretty mt-1.5 text-sm leading-relaxed text-muted-foreground">
            A JSON file of what you have learned, practised and built — your
            capabilities and the evidence behind them, your completed topics, your
            practice history and your projects. It contains nothing about your account:
            no email, no password, no tokens.
          </p>

          <div className="mt-4">
            <Button variant="secondary" size="sm" asChild>
              <a href="/api/profile/export" download>
                <Download aria-hidden />
                Download JSON
              </a>
            </Button>
          </div>
        </section>
      </Container>
    </div>
  );
}
