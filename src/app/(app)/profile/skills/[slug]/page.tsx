import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { requireOnboardedUser } from "@/lib/session";
import { getCapabilityDetail } from "@/lib/profile/capabilities";
import { capabilityIcon, CATEGORY_LABEL } from "@/lib/profile/icons";
import { LEVEL_DESCRIPTION, LEVEL_LABEL, LEVEL_PERCENT } from "@/lib/profile/levels";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Skill",
  robots: { index: false, follow: false },
};

const EVIDENCE_GROUP_LABEL: Record<string, string> = {
  TOPIC: "Learning",
  PRACTICE: "Practice",
  PROJECT: "Projects",
  GIT: "Git exercises",
  AI_TOOL: "AI learning paths",
  AI_WORKFLOW: "AI workflows",
};

/**
 * One capability, and every piece of evidence behind it.
 *
 * This page is the answer to "how do you know?". A learner who does not believe
 * their level should be able to come here and see exactly which topics,
 * problems and projects produced it — including the ones still outstanding,
 * which is what makes the next level concrete rather than mysterious.
 */
export default async function SkillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireOnboardedUser();
  const { slug } = await params;

  const capability = await getCapabilityDetail(user.id, slug);
  if (!capability) notFound();

  const Icon = capabilityIcon(capability.icon);
  const percent = capability.level ? LEVEL_PERCENT[capability.level] : 0;

  /** Grouped so evidence reads by kind rather than as one long list. */
  const groups = ["TOPIC", "PRACTICE", "PROJECT", "GIT", "AI_TOOL", "AI_WORKFLOW"]
    .map((kind) => ({
      kind,
      items: capability.items.filter((item) => item.kind === kind),
    }))
    .filter((group) => group.items.length > 0);

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
          <div className="flex items-start gap-4">
            <span
              aria-hidden
              className="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-surface text-indigo-400"
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <h1 className="balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {capability.name}
              </h1>
              <p className="mt-1 text-sm text-subtle-foreground">
                {CATEGORY_LABEL[capability.category]}
              </p>
            </div>
          </div>

          <p className="pretty mt-5 text-base leading-relaxed text-muted-foreground">
            {capability.longDescription}
          </p>
        </header>

        {/* ── Level ────────────────────────────────────────────── */}
        <section aria-labelledby="level-heading" className="mt-8 max-w-2xl">
          <h2 id="level-heading" className="sr-only">
            Your level
          </h2>

          <div className="surface rounded-xl p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-lg font-medium text-foreground">
                {capability.level ? LEVEL_LABEL[capability.level] : "Not started"}
              </p>
              <p className="text-sm text-subtle-foreground">
                {capability.level
                  ? LEVEL_DESCRIPTION[capability.level]
                  : "You have not worked on this yet."}
              </p>
            </div>

            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-raised"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${capability.name}: ${
                capability.level ? LEVEL_LABEL[capability.level] : "not started"
              }`}
            >
              <div
                className={cn(
                  "h-full rounded-full",
                  capability.level === "CONFIDENT" ? "bg-emerald-500" : "bg-primary",
                )}
                style={{ width: `${percent}%` }}
              />
            </div>

            {capability.next ? (
              <p className="mt-4 flex items-start gap-2 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
                <ArrowRight
                  className="mt-0.5 size-3.5 shrink-0 text-indigo-400"
                  aria-hidden
                />
                <span>
                  To reach{" "}
                  <span className="font-medium text-foreground">
                    {LEVEL_LABEL[capability.next.level]}
                  </span>
                  : {capability.next.requirement}
                </span>
              </p>
            ) : (
              <p className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm text-emerald-400">
                <CheckCircle2 className="size-4" aria-hidden />
                This is the highest level CodeCompass records.
              </p>
            )}
          </div>
        </section>

        {/* ── Evidence ─────────────────────────────────────────── */}
        <section aria-labelledby="evidence-heading" className="mt-10 max-w-2xl">
          <h2
            id="evidence-heading"
            className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
          >
            The evidence
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-subtle-foreground">
            Everything that counts towards this capability, and whether you have done
            it. Nothing here is inferred — each item is a real record of work.
          </p>

          <div className="mt-5 flex flex-col gap-6">
            {groups.map((group) => (
              <div key={group.kind}>
                <h3 className="text-sm font-medium text-foreground">
                  {EVIDENCE_GROUP_LABEL[group.kind]}
                  <span className="ml-2 font-mono text-xs font-normal text-subtle-foreground">
                    {group.items.filter((item) => item.done).length}/
                    {group.items.length}
                  </span>
                </h3>

                <ul className="mt-2 flex flex-col gap-1">
                  {group.items.map((item) => {
                    const content = (
                      <>
                        {item.done ? (
                          <CheckCircle2
                            className="size-3.5 shrink-0 text-emerald-400"
                            aria-hidden
                          />
                        ) : (
                          <Circle
                            className="size-3.5 shrink-0 text-subtle-foreground"
                            aria-hidden
                          />
                        )}
                        <span
                          className={cn(
                            "min-w-0",
                            item.done
                              ? "text-muted-foreground"
                              : "text-subtle-foreground",
                          )}
                        >
                          {item.title}
                        </span>
                        {/* Status in words as well as by icon. */}
                        <span className="ml-auto shrink-0 text-xs text-subtle-foreground">
                          {item.done ? "Done" : "Not yet"}
                        </span>
                      </>
                    );

                    return (
                      <li key={`${item.kind}-${item.title}`}>
                        {item.href ? (
                          <Link
                            href={item.href}
                            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-surface"
                          >
                            {content}
                          </Link>
                        ) : (
                          <span className="flex items-center gap-2.5 px-2 py-1.5 text-sm">
                            {content}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10">
          <Button variant="secondary" asChild>
            <Link href="/profile">
              Back to your profile
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}
