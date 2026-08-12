import Link from "next/link";
import { ArrowRight, Check, Circle, Clock3, GitBranch, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_BADGE, DIFFICULTY_SHORT } from "@/lib/careers/labels";
import { TOPIC_STATE_LABEL, type TopicState } from "@/lib/learn/progress";
import { cn } from "@/lib/utils";
import type { RoadmapTopicDetail } from "@/lib/roadmap/queries";

interface TopicListProps {
  topics: RoadmapTopicDetail[];
  /** Keyed by topic id; derived on the server from real progress. */
  states: Record<string, TopicState>;
  /** Topic ids that have an authored lesson. Others aren't linked. */
  topicsWithLessons: string[];
}

const STATE_ICON: Record<TopicState, typeof Check> = {
  COMPLETED: Check,
  CURRENT: ArrowRight,
  AVAILABLE: Circle,
  LOCKED: Lock,
};

/**
 * Topics inside an expanded roadmap phase.
 *
 * Every unlocked topic links to its page, including the ones whose lesson has
 * not been written yet — that page is where a learner says "I already know
 * this" and moves on. Linking only lesson-bearing topics is what used to leave
 * a new learner staring at a roadmap with nothing to click.
 *
 * State is shown with an icon and a text label as well as colour — "locked" is
 * not something a learner should have to infer from a hue.
 */
export function TopicList({ topics, states, topicsWithLessons }: TopicListProps) {
  const hasLesson = new Set(topicsWithLessons);

  return (
    <ol className="flex flex-col gap-2.5">
      {topics.map((topic) => {
        const state = states[topic.id] ?? "LOCKED";
        const StateIcon = STATE_ICON[state];
        const linkable = state !== "LOCKED";

        const body = (
          <>
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <h4 className="flex min-w-0 items-start gap-2.5 text-sm font-medium text-foreground">
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                    state === "COMPLETED" &&
                      "border-emerald-500/50 bg-emerald-500/20 text-emerald-400",
                    state === "CURRENT" &&
                      "border-primary/50 bg-primary/20 text-indigo-300",
                    state === "AVAILABLE" && "border-border text-subtle-foreground",
                    state === "LOCKED" && "border-border text-subtle-foreground",
                  )}
                >
                  <StateIcon className="size-2.5" />
                </span>
                <span className="min-w-0">
                  {topic.title}
                  {!topic.isRequired ? (
                    <span className="ml-2 text-xs font-normal text-subtle-foreground">
                      Optional
                    </span>
                  ) : null}
                  {/* Text label, so state never depends on colour alone. */}
                  <span
                    className={cn(
                      "ml-2 text-xs font-normal",
                      state === "COMPLETED"
                        ? "text-emerald-400"
                        : "text-subtle-foreground",
                    )}
                  >
                    {TOPIC_STATE_LABEL[state]}
                  </span>
                </span>
              </h4>

              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={DIFFICULTY_BADGE[topic.difficulty]}>
                  {DIFFICULTY_SHORT[topic.difficulty]}
                </Badge>
                <span className="inline-flex items-center gap-1.5 text-xs text-subtle-foreground">
                  <Clock3 className="size-3.5" aria-hidden />
                  {topic.estimatedTime}
                </span>
              </div>
            </div>

            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {topic.description}
            </p>

            {topic.prerequisites.length > 0 ? (
              <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-subtle-foreground">
                <GitBranch className="size-3.5 shrink-0" aria-hidden />
                <span>Comes after</span>
                {topic.prerequisites.map(({ prerequisite }, index) => (
                  <span key={prerequisite.id} className="text-muted-foreground">
                    {prerequisite.title}
                    {index < topic.prerequisites.length - 1 ? "," : ""}
                  </span>
                ))}
              </p>
            ) : null}
          </>
        );

        return (
          <li key={topic.id}>
            {linkable ? (
              <Link
                href={`/learn/${topic.slug}`}
                className={cn(
                  "block rounded-lg border p-4 transition-colors duration-200",
                  state === "COMPLETED"
                    ? "border-emerald-500/20 bg-emerald-500/[0.04] hover:border-emerald-500/40"
                    : "border-border bg-surface/50 hover:border-white/20 hover:bg-surface-raised",
                )}
              >
                {body}
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300">
                  {!hasLesson.has(topic.id)
                    ? "Lesson coming soon — open to continue"
                    : state === "COMPLETED"
                      ? "Review lesson"
                      : "Start learning"}
                  <ArrowRight className="size-3.5" aria-hidden />
                </span>
              </Link>
            ) : (
              <div className="rounded-lg border border-border bg-surface/50 p-4">
                {body}
                {!hasLesson.has(topic.id) ? (
                  <p className="mt-3 text-xs text-subtle-foreground">
                    Lesson coming soon
                  </p>
                ) : null}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
