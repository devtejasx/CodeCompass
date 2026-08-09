import { Clock3, GitBranch } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_BADGE, DIFFICULTY_SHORT } from "@/lib/careers/labels";
import type { RoadmapTopicDetail } from "@/lib/roadmap/queries";

/**
 * Topics inside an expanded phase.
 *
 * Preview only — Phase 4 deliberately renders no links. A topic that looked
 * clickable but did nothing would be worse than one that is honestly not ready,
 * and lesson pages are Phase 5.
 */
export function TopicList({ topics }: { topics: RoadmapTopicDetail[] }) {
  return (
    <ol className="flex flex-col gap-2.5">
      {topics.map((topic) => (
        <li
          key={topic.id}
          className="rounded-lg border border-border bg-surface/50 p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <h4 className="min-w-0 text-sm font-medium text-foreground">
              {topic.title}
              {!topic.isRequired ? (
                <span className="ml-2 text-xs font-normal text-subtle-foreground">
                  Optional
                </span>
              ) : null}
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
        </li>
      ))}
    </ol>
  );
}
