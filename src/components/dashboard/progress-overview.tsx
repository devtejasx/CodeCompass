import type { LearnerState } from "@/lib/personalization/state";

/**
 * The journey, as six bars.
 *
 * Each bar carries the counts it was computed from, so a percentage is never
 * more precise than the data behind it — "60%" beside "3 of 5 modules" is
 * honest, whereas "60%" alone invites the reader to imagine a measurement that
 * does not exist.
 *
 * Progress is never the loudest thing on the dashboard. It sits below the next
 * action deliberately: the purpose of this page is action, not analytics.
 */
export function ProgressOverview({ state }: { state: LearnerState }) {
  const bars = [
    {
      label: "Roadmap",
      percent: state.progress.roadmap,
      detail: state.roadmap
        ? `${state.completedTopicIds.length} of ${state.totalRequiredTopics} required topics`
        : "No roadmap yet",
    },
    {
      label: "Practice",
      percent: state.progress.practice,
      detail: `${state.practice.solved} of ${state.practice.total} problems solved`,
    },
    {
      label: "Projects",
      percent: state.progress.projects,
      detail: `${state.projects.completed} of ${state.projects.total} completed`,
    },
    {
      label: "Git & GitHub",
      percent: state.progress.git,
      detail: `${state.git.completedModules} of ${state.git.totalModules} modules`,
    },
    {
      label: "AI Tools",
      percent: state.progress.ai,
      detail: `${state.ai.toolsLearned} of ${state.ai.totalTools} tools learned`,
    },
  ];

  return (
    <section aria-labelledby="journey-heading" className="surface rounded-xl p-6">
      <h2
        id="journey-heading"
        className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
      >
        Your journey
      </h2>

      <dl className="mt-5 flex flex-col gap-4">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-sm text-foreground">{bar.label}</dt>
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
              aria-label={`${bar.label}: ${bar.detail}`}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${bar.percent}%` }}
              />
            </div>

            {/* The counts behind the number, so the percentage cannot imply
                a precision the data does not have. */}
            <p className="mt-1 text-xs text-subtle-foreground">{bar.detail}</p>
          </div>
        ))}
      </dl>
    </section>
  );
}
