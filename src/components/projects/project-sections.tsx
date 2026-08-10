import Link from "next/link";
import { BookOpen, CheckCircle2, ExternalLink } from "lucide-react";

import { REQUIREMENT_CATEGORY_LABEL } from "@/lib/projects/progress";
import type { RequirementCategory } from "@/generated/prisma/client";
import type { ProjectDetail } from "@/lib/projects/queries";

/**
 * The read-only halves of a project page: requirements, concepts and resources.
 *
 * Server components — none of this is interactive, so none of it needs to reach
 * the browser as JavaScript.
 */

/**
 * What the finished thing has to do.
 *
 * Grouped into functional and technical because they answer different questions
 * — "does it work?" and "is it built well?" — and a learner benefits from being
 * asked both. Specific enough to guide, and deliberately silent on how.
 */
export function RequirementList({
  requirements,
}: {
  requirements: ProjectDetail["requirements"];
}) {
  const grouped = new Map<RequirementCategory, ProjectDetail["requirements"]>();
  for (const requirement of requirements) {
    grouped.set(requirement.category, [
      ...(grouped.get(requirement.category) ?? []),
      requirement,
    ]);
  }

  return (
    <div className="flex flex-col gap-6">
      {[...grouped.entries()].map(([category, items]) => (
        <div key={category}>
          <h3 className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
            {REQUIREMENT_CATEGORY_LABEL[category]}
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {items.map((requirement) => (
              <li key={requirement.id} className="flex gap-2.5">
                <span
                  aria-hidden
                  className="mt-[7px] size-1.5 shrink-0 rounded-full bg-border"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {requirement.title}
                    {!requirement.isRequired ? (
                      <span className="ml-2 text-xs font-normal text-subtle-foreground">
                        Optional
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {requirement.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * The concepts this project exercises, linked back to their lessons.
 *
 * Prerequisites are marked as such: this is the page answering "why is this
 * recommended to me?" and "what do I need first?" in the same place.
 */
export function ConceptList({
  concepts,
  completedTopicIds,
}: {
  concepts: ProjectDetail["concepts"];
  completedTopicIds: string[];
}) {
  if (concepts.length === 0) return null;

  const completed = new Set(completedTopicIds);
  const prerequisites = concepts.filter((entry) => entry.isPrerequisite);
  const related = concepts.filter((entry) => !entry.isPrerequisite);

  const render = (entries: ProjectDetail["concepts"], title: string) =>
    entries.length === 0 ? null : (
      <div>
        <h3 className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
          {title}
        </h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {entries.map((entry) => {
            const isComplete = completed.has(entry.topic.id);
            const linkable = entry.topic.lesson !== null;

            const body = (
              <>
                {isComplete ? (
                  <CheckCircle2
                    className="size-3.5 shrink-0 text-emerald-400"
                    aria-hidden
                  />
                ) : null}
                {entry.topic.title}
                {/* Never colour alone. */}
                {isComplete ? <span className="sr-only"> (completed)</span> : null}
              </>
            );

            return (
              <li key={entry.topic.id}>
                {linkable ? (
                  <Link
                    href={`/learn/${entry.topic.slug}`}
                    className="surface-interactive inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    {body}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface/50 px-3 py-1.5 text-xs text-muted-foreground">
                    {body}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );

  return (
    <div className="flex flex-col gap-5">
      {render(prerequisites, "You'll need these first")}
      {render(related, "You'll also practise")}
    </div>
  );
}

/**
 * Curated documentation.
 *
 * Reference material, not a tutorial to follow — every one of these is official
 * documentation for something the project uses, shown with its source so nobody
 * clicks a link blind.
 */
export function ResourceList({ resources }: { resources: ProjectDetail["resources"] }) {
  if (resources.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2">
      {resources.map((resource) => (
        <li key={resource.id}>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="surface-interactive flex items-start gap-3 rounded-lg p-3.5"
          >
            <BookOpen className="mt-0.5 size-4 shrink-0 text-indigo-400" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground">
                {resource.title}
              </span>
              <span className="mt-0.5 block text-xs text-subtle-foreground">
                {resource.source}
              </span>
            </span>
            <ExternalLink
              className="mt-0.5 size-3.5 shrink-0 text-subtle-foreground"
              aria-hidden
            />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
