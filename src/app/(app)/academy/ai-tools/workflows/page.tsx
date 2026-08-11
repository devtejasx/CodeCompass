import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Route } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { requireOnboardedUser } from "@/lib/session";
import { listWorkflows } from "@/lib/ai-tools/queries";
import { WORKFLOW_CATEGORY_LABEL } from "@/lib/ai-tools/labels";
import { DIFFICULTY_BADGE, DIFFICULTY_SHORT } from "@/lib/careers/labels";

export const metadata: Metadata = {
  title: "Developer AI workflows",
  robots: { index: false, follow: false },
};

/**
 * The workflow library.
 *
 * Entirely a server component — a list of links needs no JavaScript. The point
 * of the library is that AI is a step *inside* a process the developer owns, so
 * every card leads to a page with steps, a worked prompt, what to verify and
 * the mistakes the workflow exists to prevent.
 */
export default async function WorkflowsPage() {
  const user = await requireOnboardedUser();
  const workflows = await listWorkflows(user.id);

  const completed = workflows.filter((workflow) => workflow.completedAt).length;

  return (
    <div className="relative flex-1 overflow-hidden pb-24 pt-10 sm:pt-14">
      <GridBackdrop className="mask-fade-b opacity-50" />
      <Glow className="-top-40 left-1/2 size-[30rem] -translate-x-1/2" />

      <Container>
        <Link
          href="/academy/ai-tools"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-3.5 rotate-180" aria-hidden />
          AI Tools Academy
        </Link>

        <header className="mt-6 max-w-3xl">
          <span
            aria-hidden
            className="grid size-12 place-items-center rounded-xl border border-border bg-surface text-indigo-400"
          >
            <Route className="size-5" />
          </span>

          <h1 className="balance mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Developer AI workflows
          </h1>
          <p className="pretty mt-3 text-base leading-relaxed text-muted-foreground">
            Ten processes that put AI where it genuinely helps and keep the judgement
            with you. Each has steps, a worked prompt with an explanation of why it
            works, what to verify afterwards, and the mistakes it exists to prevent.
          </p>

          {workflows.length > 0 ? (
            <p className="mt-4 font-mono text-sm text-subtle-foreground">
              {completed}/{workflows.length} marked as used
            </p>
          ) : null}
        </header>

        {workflows.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            The workflow library hasn&apos;t been seeded on this deployment yet.
          </p>
        ) : (
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {workflows.map((workflow) => {
              const done = Boolean(workflow.completedAt);

              return (
                <li key={workflow.slug} className="flex">
                  <Link
                    href={`/academy/ai-tools/workflows/${workflow.slug}`}
                    className={`surface-interactive group flex w-full flex-col gap-3 rounded-xl p-5 ${
                      done ? "border-emerald-500/20" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-sm font-medium text-foreground">
                        {workflow.title}
                      </h2>
                      {done ? (
                        <CheckCircle2
                          className="size-4 shrink-0 text-emerald-400"
                          aria-hidden
                        />
                      ) : null}
                    </div>

                    <p className="pretty text-sm leading-relaxed text-muted-foreground">
                      {workflow.goal}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
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

                    <p className="text-xs text-subtle-foreground">
                      {workflow.stepCount} steps ·{" "}
                      {workflow.tools
                        .slice(0, 3)
                        .map((tool) => tool.name)
                        .join(", ")}
                    </p>

                    <p className="mt-auto flex items-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                      {/* Status in words as well as colour. */}
                      {done ? "Used — review" : "Open workflow"}
                      <ArrowRight
                        className="size-3.5 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </div>
  );
}
