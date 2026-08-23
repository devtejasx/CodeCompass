import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Code2,
  GitBranch,
  Hammer,
  ListChecks,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatMinutes } from "@/lib/personalization/plan";
import {
  ACTIVITY_VERB,
  activityHref,
  type ActivityItem,
} from "@/lib/personalization/activity";
import type {
  RecommendationTrack,
  StudyPlan,
  TrackRecommendation,
  WeeklySummary,
} from "@/lib/personalization/types";

/**
 * The secondary dashboard panels.
 *
 * Everything here is deliberately quieter than the next step. A learner who
 * reads only the top of the page has still been told what to do; these answer
 * "and what else is waiting?" without competing for the same attention.
 */

const TRACK_LABEL: Record<RecommendationTrack, string> = {
  LEARNING: "Continue learning",
  PRACTICE: "Practice",
  PROJECT: "Build",
  DEVELOPER_SKILLS: "Developer skills",
  AI_SKILLS: "AI skills",
};

const TRACK_ICON: Record<RecommendationTrack, typeof Code2> = {
  LEARNING: ListChecks,
  PRACTICE: Code2,
  PROJECT: Hammer,
  DEVELOPER_SKILLS: GitBranch,
  AI_SKILLS: Sparkles,
};

/** One card per track, at most one card each. Never a wall of suggestions. */
export function TrackPanels({ tracks }: { tracks: TrackRecommendation[] }) {
  if (tracks.length === 0) return null;

  return (
    <section aria-labelledby="tracks-heading">
      <h2
        id="tracks-heading"
        className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
      >
        Also waiting for you
      </h2>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {tracks.map(({ track, recommendation }) => {
          const Icon = TRACK_ICON[track];

          return (
            <li key={track} className="flex">
              <Link
                href={recommendation.href}
                className="surface-interactive group flex w-full flex-col gap-2 rounded-xl p-5"
              >
                <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-label text-subtle-foreground">
                  <Icon className="size-3.5 text-indigo-400" aria-hidden />
                  {TRACK_LABEL[track]}
                </span>

                <span className="text-sm font-medium text-foreground">
                  {recommendation.title}
                </span>

                <span className="pretty text-sm leading-relaxed text-muted-foreground">
                  {recommendation.reason}
                </span>

                <span className="mt-auto flex items-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                  {recommendation.action}
                  <ArrowRight
                    className="size-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * Today's Plan.
 *
 * Built from work that actually exists and sized to the time the learner said
 * they have. A one-item plan is a legitimate plan — padding it to three would
 * make the total a lie and the plan unfinishable.
 */
export function TodaysPlan({ plan }: { plan: StudyPlan }) {
  if (plan.items.length === 0) return null;

  return (
    <section aria-labelledby="plan-heading" className="surface rounded-xl p-6">
      <h2
        id="plan-heading"
        className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
      >
        Today&apos;s plan
      </h2>

      <ol className="mt-4 flex flex-col gap-2">
        {plan.items.map((item, index) => (
          <li key={`${item.type}-${index}`}>
            <Link
              href={item.href}
              className="tap-target flex items-baseline justify-between gap-4 rounded-lg px-2 py-2 transition-colors hover:bg-surface"
            >
              <span className="flex min-w-0 items-baseline gap-2.5">
                <span className="font-mono text-xs text-subtle-foreground">
                  {index + 1}
                </span>
                <span className="min-w-0 text-sm text-foreground">{item.title}</span>
              </span>
              <span className="shrink-0 font-mono text-xs text-subtle-foreground">
                {item.minutes} min
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">
        Total:{" "}
        <span className="text-foreground">{formatMinutes(plan.totalMinutes)}</span>
        {plan.budgetMinutes ? (
          <span className="text-subtle-foreground">
            {" "}
            {/*
              The first item is always included, even when it alone exceeds the
              budget — dropping the one thing that matters to respect an
              estimate would be the wrong trade. When that happens the copy has
              to say so, rather than claiming a fit it does not have.
            */}
            {plan.totalMinutes > plan.budgetMinutes
              ? `· longer than the ${formatMinutes(plan.budgetMinutes)} a day you told us about — split it across two sittings if you need to`
              : `· built around the ${formatMinutes(plan.budgetMinutes)} a day you told us about`}
          </span>
        ) : null}
      </p>
    </section>
  );
}

/**
 * The last seven days.
 *
 * Built entirely from recorded activity, so it can only report what actually
 * happened. A quiet week is met with a plain, kind sentence — the product does
 * not shame people for the weeks they had other things on, and there is no
 * streak to lose.
 */
export function WeekInReview({ summary }: { summary: WeeklySummary }) {
  const rows = [
    { label: "Topics completed", value: summary.topicsCompleted },
    { label: "Problems solved", value: summary.problemsSolved },
    { label: "Project milestones", value: summary.projectMilestones },
    { label: "Projects completed", value: summary.projectsCompleted },
    { label: "Git exercises", value: summary.gitExercises },
    { label: "AI Academy", value: summary.aiProgress },
  ].filter((row) => row.value > 0);

  return (
    <section aria-labelledby="week-heading" className="surface rounded-xl p-6">
      <h2
        id="week-heading"
        className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
      >
        This week
      </h2>

      {summary.isEmpty ? (
        <p className="pretty mt-3 text-sm leading-relaxed text-muted-foreground">
          Nothing recorded in the last seven days — which is completely fine. Your
          progress is saved exactly where you left it, and you can pick up from your
          next step above.
        </p>
      ) : (
        <dl className="mt-4 flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-4">
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd className="font-mono text-sm text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

/** The activity feed. Factual verbs, no congratulation, no scoring. */
export function RecentActivity({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) return null;

  return (
    <section aria-labelledby="activity-heading" className="surface rounded-xl p-6">
      <h2
        id="activity-heading"
        className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
      >
        Recent activity
      </h2>

      <ul className="mt-4 flex flex-col gap-2.5">
        {activities.map((activity) => {
          const href = activityHref(activity);
          const text = (
            <>
              <span className="text-subtle-foreground">
                {ACTIVITY_VERB[activity.type]}
              </span>{" "}
              {activity.label}
            </>
          );

          return (
            <li key={activity.id} className="text-sm leading-relaxed">
              {href ? (
                <Link
                  href={href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {text}
                </Link>
              ) : (
                <span className="text-muted-foreground">{text}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * A compact link into the Techie Profile.
 *
 * Five numbers and a link, deliberately. The profile itself is where evidence
 * belongs; repeating it here would turn the dashboard into the analytics page
 * it is explicitly not supposed to be.
 */
export function ProfileSummary({
  capabilities,
  projects,
  problemsSolved,
  gitPercent,
  aiPercent,
  careerName,
}: {
  capabilities: number;
  projects: number;
  problemsSolved: number;
  gitPercent: number;
  aiPercent: number;
  careerName: string | null;
}) {
  const stats = [
    { label: "Skills", value: `${capabilities}` },
    { label: "Projects", value: `${projects}` },
    { label: "Practice", value: `${problemsSolved}` },
    { label: "Git", value: `${gitPercent}%` },
    { label: "AI", value: `${aiPercent}%` },
  ];

  return (
    <section
      aria-labelledby="profile-summary-heading"
      className="surface rounded-xl p-6"
    >
      <h2
        id="profile-summary-heading"
        className="flex items-center gap-2 text-xs font-medium uppercase tracking-label text-subtle-foreground"
      >
        <UserRound className="size-3.5 text-indigo-400" aria-hidden />
        Your Techie Profile
      </h2>

      {careerName ? (
        <p className="mt-3 text-sm text-muted-foreground">{careerName}</p>
      ) : null}

      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="text-xs text-subtle-foreground">{stat.label}</dt>
            <dd className="mt-0.5 font-mono text-lg font-medium text-foreground">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5">
        <Button variant="secondary" size="sm" asChild>
          <Link href="/profile">
            View profile
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}

/** A quiet entry point to the mentor. Present whether or not AI is configured. */
export function MentorCard({ available }: { available: boolean }) {
  return (
    <section aria-labelledby="mentor-heading" className="surface rounded-xl p-6">
      <h2
        id="mentor-heading"
        className="flex items-center gap-2 text-xs font-medium uppercase tracking-label text-subtle-foreground"
      >
        <Bot className="size-3.5 text-indigo-400" aria-hidden />
        AI mentor
      </h2>

      <p className="pretty mt-3 text-sm leading-relaxed text-muted-foreground">
        {available
          ? "Ask why something is recommended, get a concept explained differently, or work out what to do when you are stuck. It reads your progress — it does not decide it."
          : "Not configured on this deployment. Your next step, your roadmap and every recommendation on this page are calculated by CodeCompass itself, so nothing here depends on it."}
      </p>

      <div className="mt-5">
        <Button variant="secondary" size="sm" asChild>
          <Link href="/mentor">
            {available ? "Ask your mentor" : "About the mentor"}
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}
