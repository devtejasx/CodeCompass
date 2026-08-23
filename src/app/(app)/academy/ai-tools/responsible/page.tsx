import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { requireOnboardedUser } from "@/lib/session";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Responsible AI use",
  robots: { index: false, follow: false },
};

/**
 * The Responsible AI module.
 *
 * A hub rather than a lecture: the actual teaching lives in two lessons —
 * "Responsible AI use" and "AI security for developers" — which are ordinary
 * Topics with sections and knowledge checks, so they carry progress like
 * everything else. This page states the principles briefly and sends the
 * learner to them.
 *
 * The summaries here are deliberately practical. A module about responsibility
 * that stays abstract gets read once and changes nothing.
 */

const PRINCIPLES = [
  {
    title: "You are the author",
    body: "Committing code asserts that it should be in the codebase. Publishing documentation asserts that it is true. Where the text came from does not change that — and 'the AI wrote it' has never been accepted in a post-mortem.",
  },
  {
    title: "Verify in proportion to consequence",
    body: "An explanation you will test anyway needs a glance. Anything touching authentication, payments, permissions or deletion gets reviewed as if a stranger wrote it, because one did.",
  },
  {
    title: "Secrets never go into prompts",
    body: "API keys, tokens, connection strings, customer data, production logs. Replace them with placeholders first — it takes four seconds. If it happens anyway, rotate the credential immediately and tell whoever owns it.",
  },
  {
    title: "Untrusted content is untrusted input",
    body: "A model cannot reliably tell instructions from data. Anything it reads from a web page, a document or a tool result may contain instructions it follows. The defence is least privilege and human approval, not a cleverer prompt.",
  },
  {
    title: "Generated code carries generated vulnerabilities",
    body: "Concatenated SQL, missing authorisation, unescaped input, secrets in source. These are common patterns, and common is what a model produces. Review for them specifically.",
  },
  {
    title: "Keep the skills you would need without it",
    body: "Skills you never exercise fade, and the tool's constant presence hides that from you. Read what you accept, ask for hints before answers while learning, and occasionally work without it.",
  },
];

export default async function ResponsibleAIPage() {
  const user = await requireOnboardedUser();

  // The two lessons this module is really made of, with their real progress.
  const topics = await db.topic.findMany({
    where: { slug: { in: ["ai-academy-responsible-ai", "ai-academy-ai-security"] } },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      estimatedTime: true,
      lesson: { select: { id: true } },
      progress: {
        where: { userId: user.id },
        select: { status: true, percentComplete: true },
      },
    },
  });

  // Ordered as the curriculum orders them: responsibility before security.
  const ordered = ["ai-academy-responsible-ai", "ai-academy-ai-security"]
    .map((slug) => topics.find((topic) => topic.slug === slug))
    .filter((topic): topic is (typeof topics)[number] => Boolean(topic));

  return (
    <div className="relative flex-1 overflow-hidden pb-24 pt-10 sm:pt-14">
      <GridBackdrop className="mask-fade-b opacity-50" />
      <Glow className="-top-40 left-1/2 size-[30rem] -translate-x-1/2" />

      <Container>
        <Link
          href="/academy/ai-tools"
          className="tap-target inline-flex items-center gap-1.5 rounded text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-3.5 rotate-180" aria-hidden />
          AI Tools Academy
        </Link>

        <header className="mt-6 max-w-3xl">
          <span
            aria-hidden
            className="grid size-12 place-items-center rounded-xl border border-border bg-surface text-indigo-400"
          >
            <ShieldCheck className="size-5" />
          </span>

          <h1 className="balance mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Responsible AI use
          </h1>
          <p className="pretty mt-3 text-base leading-relaxed text-muted-foreground">
            Practical, not philosophical. Every item here is something that has cost a
            working developer real money, real trust or a real job — and what to do
            instead.
          </p>
        </header>

        {/* ── Principles ───────────────────────────────────────── */}
        <section aria-labelledby="principles-heading" className="mt-12">
          <h2
            id="principles-heading"
            className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
          >
            The principles
          </h2>

          <ul className="mt-4 grid max-w-4xl gap-3 sm:grid-cols-2">
            {PRINCIPLES.map((principle) => (
              <li key={principle.title} className="surface rounded-xl p-5">
                <h3 className="flex items-start gap-2 text-sm font-medium text-foreground">
                  <ShieldAlert
                    className="mt-0.5 size-3.5 shrink-0 text-indigo-400"
                    aria-hidden
                  />
                  {principle.title}
                </h3>
                <p className="pretty mt-2 text-sm leading-relaxed text-muted-foreground">
                  {principle.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Never paste ──────────────────────────────────────── */}
        <section aria-labelledby="never-paste-heading" className="mt-10 max-w-3xl">
          <h2
            id="never-paste-heading"
            className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
          >
            Never paste into an AI tool
          </h2>

          <div className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-5">
            <p className="flex items-center gap-2 text-sm font-medium text-rose-300">
              <KeyRound className="size-4 shrink-0" aria-hidden />
              On any plan, in any tier
            </p>
            <ul className="mt-3 flex flex-col gap-1.5">
              {[
                "API keys, tokens, passwords, private keys, connection strings",
                "Real customer data — names, emails, addresses, anything identifying",
                "Production logs, which contain all of the above whether or not you expected them to",
                "Proprietary code your employer has not cleared for the tool you are using",
                "Anything under a confidentiality obligation you would struggle to explain breaking",
              ].map((entry) => (
                <li
                  key={entry}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  {entry}
                </li>
              ))}
            </ul>
            <p className="pretty mt-4 text-sm leading-relaxed text-muted-foreground">
              The mitigation is trivial: replace real values with placeholders before
              pasting. It is the difference between a support request and an incident.
            </p>
          </div>
        </section>

        {/* ── The lessons ──────────────────────────────────────── */}
        <section aria-labelledby="lessons-heading" className="mt-12 max-w-3xl">
          <h2
            id="lessons-heading"
            className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
          >
            The full lessons
          </h2>
          <p className="pretty mt-2 text-sm leading-relaxed text-muted-foreground">
            These are ordinary Academy lessons with worked examples and knowledge
            checks, and they count towards your progress like everything else.
          </p>

          <ul className="mt-4 flex flex-col gap-2">
            {ordered.map((topic) => {
              const progress = topic.progress[0];
              const done = progress?.status === "COMPLETED";

              return (
                <li key={topic.slug}>
                  <Link
                    href={`/learn/${topic.slug}`}
                    className={cn(
                      "surface-interactive group flex flex-col gap-2 rounded-xl p-5",
                      done && "border-emerald-500/20",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-medium text-foreground">
                        {topic.title}
                      </h3>
                      {done ? (
                        <CheckCircle2
                          className="size-4 shrink-0 text-emerald-400"
                          aria-hidden
                        />
                      ) : null}
                    </div>

                    <p className="pretty text-sm leading-relaxed text-muted-foreground">
                      {topic.description}
                    </p>

                    <p className="flex flex-wrap items-center gap-x-3 text-xs text-subtle-foreground">
                      <span>{topic.estimatedTime}</span>
                      <span className={done ? "text-emerald-400" : undefined}>
                        {done
                          ? "Complete"
                          : (progress?.percentComplete ?? 0) > 0
                            ? `${progress!.percentComplete}% done`
                            : "Not started"}
                      </span>
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>

          {ordered.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              These lessons haven&apos;t been seeded on this deployment yet.
            </p>
          ) : null}
        </section>

        <div className="mt-12">
          <Button variant="secondary" asChild>
            <Link href="/academy/ai-tools/workflows">
              See the workflows that put this into practice
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}
