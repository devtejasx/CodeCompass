import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  Lightbulb,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { WorkflowComplete } from "@/components/ai-tools/workflow-complete";
import { requireOnboardedUser } from "@/lib/session";
import { getWorkflowDetail } from "@/lib/ai-tools/queries";
import { WORKFLOW_CATEGORY_LABEL } from "@/lib/ai-tools/labels";
import { DIFFICULTY_BADGE, DIFFICULTY_SHORT } from "@/lib/careers/labels";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "AI workflow",
  robots: { index: false, follow: false },
};

/**
 * One developer AI workflow.
 *
 * The layout carries the argument: every step is labelled as a human step or an
 * AI step, so the division of labour is visible at a glance rather than implied
 * by the prose. Most workflows have exactly one AI step, which is the point.
 *
 * Prompts are broken into goal, context and request rather than shown as a
 * copyable blob, because the teaching is the structure — a learner who copies a
 * magic string has learned nothing they can reuse on their own problem.
 */
export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireOnboardedUser();
  const { slug } = await params;

  const workflow = await getWorkflowDetail(slug, user.id);
  if (!workflow) notFound();

  return (
    <div className="relative flex-1 overflow-hidden pb-24 pt-10 sm:pt-14">
      <GridBackdrop className="mask-fade-b opacity-50" />
      <Glow className="-top-40 left-1/2 size-[30rem] -translate-x-1/2" />

      <Container>
        <Link
          href="/academy/ai-tools/workflows"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-3.5 rotate-180" aria-hidden />
          All workflows
        </Link>

        <header className="mt-6 max-w-3xl">
          <h1 className="balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {workflow.title}
          </h1>

          <p className="pretty mt-3 text-base leading-relaxed text-foreground">
            {workflow.goal}
          </p>
          <p className="pretty mt-3 text-sm leading-relaxed text-muted-foreground">
            {workflow.summary}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Badge variant={DIFFICULTY_BADGE[workflow.difficulty]}>
              {DIFFICULTY_SHORT[workflow.difficulty]}
            </Badge>
            <span className="text-xs text-subtle-foreground">
              {WORKFLOW_CATEGORY_LABEL[workflow.category]}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-subtle-foreground">
              <Clock3 className="size-3.5" aria-hidden />
              {workflow.estimatedTime}
            </span>
          </div>
        </header>

        {/* ── Steps ────────────────────────────────────────────── */}
        <section aria-labelledby="steps-heading" className="mt-12 max-w-3xl">
          <h2
            id="steps-heading"
            className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
          >
            Steps
          </h2>
          <p className="pretty mt-2 text-sm leading-relaxed text-subtle-foreground">
            Each step is labelled with who does it. The AI steps are the ones where you
            ask a question; everything else is yours.
          </p>

          <ol className="mt-4 flex flex-col gap-2">
            {workflow.steps.map((step) => (
              <li key={step.id}>
                <div
                  className={cn(
                    "rounded-xl border p-4",
                    step.isHumanStep
                      ? "border-border bg-surface/50"
                      : "border-primary/25 bg-primary/[0.04]",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <h3 className="flex min-w-0 items-baseline gap-2.5 text-sm font-medium text-foreground">
                      <span className="font-mono text-xs text-subtle-foreground">
                        {String(step.order).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">{step.title}</span>
                    </h3>

                    {/* Words, not just an icon or a tint. */}
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
                        step.isHumanStep
                          ? "border-border bg-surface text-muted-foreground"
                          : "border-primary/30 bg-primary/10 text-indigo-300",
                      )}
                    >
                      {step.isHumanStep ? (
                        <User className="size-3" aria-hidden />
                      ) : (
                        <Bot className="size-3" aria-hidden />
                      )}
                      {step.isHumanStep ? "You" : "Ask AI"}
                    </span>
                  </div>

                  <p className="pretty mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Prompts ──────────────────────────────────────────── */}
        {workflow.prompts.length > 0 ? (
          <section aria-labelledby="prompts-heading" className="mt-12 max-w-3xl">
            <h2
              id="prompts-heading"
              className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
            >
              Example prompt
            </h2>
            <p className="pretty mt-2 text-sm leading-relaxed text-subtle-foreground">
              Broken into its parts on purpose. The structure is what transfers to your
              own problem — the exact words will not.
            </p>

            {workflow.prompts.map((prompt) => (
              <article key={prompt.id} className="surface mt-4 rounded-xl p-5">
                <h3 className="text-sm font-medium text-foreground">{prompt.label}</h3>

                <dl className="mt-4 flex flex-col gap-4">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
                      Goal
                    </dt>
                    <dd className="pretty mt-1 text-sm leading-relaxed text-muted-foreground">
                      {prompt.goal}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
                      Context
                    </dt>
                    <dd className="mt-1.5">
                      {/* Overflows scroll inside the block, never the page. */}
                      <pre className="overflow-x-auto rounded-lg border border-border bg-surface/80 p-3 text-xs leading-relaxed text-muted-foreground">
                        <code className="whitespace-pre-wrap break-words">
                          {prompt.context}
                        </code>
                      </pre>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
                      Request
                    </dt>
                    <dd className="mt-1.5">
                      <pre className="overflow-x-auto rounded-lg border border-border bg-surface/80 p-3 text-xs leading-relaxed text-foreground">
                        <code className="whitespace-pre-wrap break-words">
                          {prompt.request}
                        </code>
                      </pre>
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 rounded-lg border border-border bg-surface/60 p-4">
                  <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-label text-subtle-foreground">
                    <Lightbulb className="size-3.5 text-indigo-400" aria-hidden />
                    Why this works
                  </p>
                  <p className="pretty mt-2 text-sm leading-relaxed text-muted-foreground">
                    {prompt.whyItWorks}
                  </p>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {/* ── Verify ───────────────────────────────────────────── */}
        <section aria-labelledby="verify-heading" className="mt-12 max-w-3xl">
          <h2
            id="verify-heading"
            className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
          >
            What to verify
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {workflow.whatToVerify.map((entry) => (
              <li
                key={entry}
                className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
              >
                <CheckCircle2
                  className="mt-0.5 size-3.5 shrink-0 text-emerald-400"
                  aria-hidden
                />
                {entry}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Mistakes ─────────────────────────────────────────── */}
        <section aria-labelledby="mistakes-heading" className="mt-10 max-w-3xl">
          <h2
            id="mistakes-heading"
            className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
          >
            Common mistakes
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {workflow.commonMistakes.map((entry) => (
              <li
                key={entry}
                className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
              >
                <AlertTriangle
                  className="mt-0.5 size-3.5 shrink-0 text-amber-400"
                  aria-hidden
                />
                {entry}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Tools ────────────────────────────────────────────── */}
        {workflow.tools.length > 0 ? (
          <section aria-labelledby="tools-heading" className="mt-10 max-w-3xl">
            <h2
              id="tools-heading"
              className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
            >
              Tools this works with
            </h2>
            <p className="pretty mt-2 text-sm leading-relaxed text-subtle-foreground">
              Not an endorsement and not exclusive — this workflow is about the process,
              and the process works with whichever of these you have.
            </p>

            <ul className="mt-3 flex flex-wrap gap-2">
              {workflow.tools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/academy/ai-tools/${tool.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface/60 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {tool.name}
                    {tool.status === "DEPRECATED" ? (
                      <span className="text-xs text-amber-400">superseded</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ── Self-report ──────────────────────────────────────── */}
        <div className="mt-12 max-w-3xl">
          <WorkflowComplete
            workflowSlug={workflow.slug}
            initiallyCompleted={Boolean(workflow.completedAt)}
          />
        </div>
      </Container>
    </div>
  );
}
