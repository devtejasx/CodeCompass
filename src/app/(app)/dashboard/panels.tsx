import {
  MentorCard,
  ProfileSummary,
  RecentActivity,
  WeekInReview,
} from "@/components/dashboard/dashboard-panels";
import { aiAvailability } from "@/lib/ai/provider";
import { getGuidance, getWeeklySummary } from "@/lib/personalization/service";
import { listRecentActivity } from "@/lib/personalization/activity";
import { countEarnedCapabilities } from "@/lib/profile/capabilities";

/**
 * The dashboard's deferred panels.
 *
 * Each one is an async server component behind its own Suspense boundary, so
 * the page can send the greeting and the next step as soon as those are known
 * and let the rest arrive when it arrives. Before this, the slowest read on the
 * page set the time-to-first-paint for all of it: the capability count alone is
 * a dozen progress queries, and it exists to render one number in a card three
 * screens down.
 *
 * Splitting them out of `page.tsx` keeps the file's existing shape — data is
 * fetched by a server component and the components in `components/dashboard`
 * stay presentational, receiving structured data and rendering it. These are the
 * fetch half; they own no markup beyond the component they delegate to.
 *
 * `getGuidance` and `getLearnerState` are memoised per request, so a panel that
 * needs the learner state re-reads nothing — it gets the same object the page
 * above it already awaited.
 */

/** The last seven days. One activity query. */
export async function WeeklyPanel({ userId }: { userId: string }) {
  return <WeekInReview summary={await getWeeklySummary(userId)} />;
}

/** The activity feed. One indexed read of the six most recent rows. */
export async function ActivityPanel({ userId }: { userId: string }) {
  return <RecentActivity activities={await listRecentActivity(userId, 6)} />;
}

/**
 * The profile summary.
 *
 * The reason this file exists. Four of its five numbers come from the learner
 * state the page already has; the fifth — how many capabilities have been
 * reached — needs every progress table intersected against the capability
 * sources, and that was blocking the greeting.
 */
export async function ProfilePanel({ userId }: { userId: string }) {
  const [capabilities, { state }] = await Promise.all([
    countEarnedCapabilities(userId),
    getGuidance(userId),
  ]);

  return (
    <ProfileSummary
      capabilities={capabilities.earned}
      projects={state.projects.completed}
      problemsSolved={state.practice.solved}
      gitPercent={state.progress.git}
      aiPercent={state.progress.ai}
      careerName={state.career?.name ?? null}
    />
  );
}

/** No data of its own — only whether a provider is configured. */
export function MentorPanel() {
  return <MentorCard available={aiAvailability().configured} />;
}

/**
 * Placeholder for a deferred panel.
 *
 * Sized to the panel it stands in for rather than to a generic box: the real
 * cards are a 6-unit-padded surface with a label and a few rows, so this is the
 * same surface at the same padding with the same number of rows. The point is
 * that when the content arrives nothing below it moves — a skeleton that is the
 * wrong height trades a blank area for a layout shift, which is worse.
 *
 * `aria-hidden` on the shapes with the status text carrying the meaning, so a
 * screen reader hears "loading" once instead of reading out empty boxes.
 */
export function PanelSkeleton({ rows = 3, label }: { rows?: number; label: string }) {
  return (
    <div className="surface rounded-xl p-6" role="status" aria-live="polite">
      <span className="sr-only">Loading {label}…</span>
      <div aria-hidden className="animate-pulse">
        <div className="h-3 w-24 rounded bg-surface-raised/70" />
        <div className="mt-5 flex flex-col gap-3">
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className="flex items-baseline justify-between gap-4">
              <div className="h-3.5 w-2/5 rounded bg-surface-raised/60" />
              <div className="h-3.5 w-8 rounded bg-surface-raised/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
