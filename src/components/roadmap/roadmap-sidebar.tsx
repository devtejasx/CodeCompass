import Link from "next/link";
import { ArrowRight, Code2, Compass, Layers, Repeat2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LANGUAGE_LABEL } from "@/lib/onboarding/options";
import type { RoadmapProgress } from "@/lib/roadmap/progress";
import type { ProgrammingLanguage } from "@/generated/prisma/client";

interface RoadmapSidebarProps {
  careerName: string;
  progress: RoadmapProgress;
  /** From onboarding. Shown as context — Phase 4 has no language variants yet. */
  selectedLanguage: ProgrammingLanguage | null;
  /**
   * The AI tools curated for this career, if any (Phase 9). A career with no
   * curated set simply omits the section rather than showing an empty one.
   */
  aiTools?: { slug: string; name: string }[];
}

export function RoadmapSidebar({
  careerName,
  progress,
  selectedLanguage,
  aiTools = [],
}: RoadmapSidebarProps) {
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
      <section aria-labelledby="your-path-heading" className="surface rounded-xl p-5">
        <h2
          id="your-path-heading"
          className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
        >
          Your path
        </h2>

        <p className="mt-2 flex items-center gap-2 text-base font-medium text-foreground">
          <Layers className="size-4 shrink-0 text-indigo-400" aria-hidden />
          {careerName}
        </p>

        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="font-mono text-sm text-foreground">
              {progress.percentComplete}%
            </span>
          </div>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-raised"
            role="progressbar"
            aria-valuenow={progress.percentComplete}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${careerName} roadmap progress`}
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress.percentComplete}%` }}
            />
          </div>
          {/*
            The caption has to describe the number above it. The percentage is
            completed *required topics*, so leading with phases made the two
            disagree — 1% beside "0 of 9 phases" reads like a bug.
          */}
          <p className="mt-2 text-xs text-subtle-foreground">
            {progress.completedRequiredTopics} of {progress.totalRequiredTopics}{" "}
            required topics · {progress.completedPhases} of {progress.totalPhases}{" "}
            phases
          </p>
        </div>

        {selectedLanguage ? (
          <p className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
            <Code2 className="size-4 shrink-0 text-subtle-foreground" aria-hidden />
            {selectedLanguage === "NOT_SURE" ? (
              <>Language: we&apos;ll help you choose</>
            ) : (
              <>Language: {LANGUAGE_LABEL[selectedLanguage]}</>
            )}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="whats-next-heading" className="surface rounded-xl p-5">
        <h2
          id="whats-next-heading"
          className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
        >
          What&apos;s next
        </h2>

        {progress.currentPhaseTitle ? (
          <div className="mt-3">
            <p className="text-xs text-subtle-foreground">Start here</p>
            <p className="mt-0.5 flex items-start gap-2 text-sm font-medium text-foreground">
              <Compass className="mt-0.5 size-4 shrink-0 text-indigo-400" aria-hidden />
              {progress.currentPhaseTitle}
            </p>
          </div>
        ) : null}

        {progress.upcomingPhaseTitles.length > 0 ? (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs text-subtle-foreground">Then</p>
            <ol className="mt-2 flex flex-col gap-1.5">
              {progress.upcomingPhaseTitles.map((title) => (
                <li key={title} className="text-sm text-muted-foreground">
                  {title}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </section>

      {/*
        The AI Academy alongside the roadmap rather than inside it. Modern
        development is part of this path, but the Academy is career-independent
        and reachable on its own — so this is a signpost, not a phase.
      */}
      {aiTools.length > 0 ? (
        <section aria-labelledby="ai-tools-heading" className="surface rounded-xl p-5">
          <h2
            id="ai-tools-heading"
            className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
          >
            AI tools on this path
          </h2>

          <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-indigo-400" aria-hidden />
            Modern development includes knowing which AI tools help, and when they do
            not.
          </p>

          <ul className="mt-3 flex flex-col gap-1.5">
            {aiTools.slice(0, 4).map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={`/academy/ai-tools/${tool.slug}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/academy/ai-tools"
            className="tap-target mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-300 transition-colors hover:text-indigo-200"
          >
            AI Tools Academy
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </section>
      ) : null}

      <Button variant="secondary" asChild>
        <Link href="/careers">
          <Repeat2 aria-hidden />
          Change career
        </Link>
      </Button>
    </aside>
  );
}
