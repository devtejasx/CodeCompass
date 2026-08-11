import Link from "next/link";
import { ArrowRight, Clock3, Compass, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Recommendation } from "@/lib/personalization/types";

/**
 * "What should I do next?"
 *
 * The most important component in the product, and the reason the dashboard was
 * rebuilt around it. It is first on the page, largest on the page, and it
 * carries exactly one call to action — on mobile a learner should see this and
 * nothing else without scrolling.
 *
 * The `reason` is not decoration. Every recommendation is computed from the
 * learner's real progress, and showing the working is what makes this guidance
 * rather than an instruction. It comes from the rules engine, never from AI.
 */
export function NextStep({ recommendation }: { recommendation: Recommendation }) {
  return (
    <section
      aria-labelledby="next-step-heading"
      className="relative overflow-hidden rounded-2xl border border-primary/25 bg-primary/[0.04] p-6 sm:p-8"
    >
      <h2
        id="next-step-heading"
        className="flex items-center gap-2 text-xs font-medium uppercase tracking-label text-indigo-300"
      >
        <Compass className="size-3.5" aria-hidden />
        What should I do next?
      </h2>

      <p className="balance mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {recommendation.title}
      </p>

      <div className="mt-4 max-w-prose">
        <p className="flex items-start gap-2 text-xs font-medium uppercase tracking-label text-subtle-foreground">
          <HelpCircle className="size-3.5 shrink-0" aria-hidden />
          Why this?
        </p>
        <p className="pretty mt-2 text-sm leading-relaxed text-muted-foreground">
          {recommendation.reason}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button size="lg" asChild>
          <Link href={recommendation.href}>
            {recommendation.action}
            <ArrowRight aria-hidden />
          </Link>
        </Button>

        {recommendation.estimatedTime ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-subtle-foreground">
            <Clock3 className="size-3.5" aria-hidden />
            {recommendation.estimatedTime}
          </span>
        ) : null}
      </div>
    </section>
  );
}
