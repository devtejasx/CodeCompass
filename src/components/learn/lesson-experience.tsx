"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";

import { setSectionComplete } from "@/app/actions/learn";
import { Button } from "@/components/ui/button";
import { KnowledgeCheck } from "@/components/learn/knowledge-check";
import { SectionRenderer } from "@/components/learn/section-renderer";
import { cn } from "@/lib/utils";
import type { LearningTopic } from "@/lib/learn/queries";

interface LessonExperienceProps {
  topic: LearningTopic;
  lesson: NonNullable<LearningTopic["lesson"]>;
  initialCompletedSectionIds: string[];
  initiallyCompleted: boolean;
  passingScore: number;
  nextTopic: { slug: string; title: string } | null;
}

/**
 * The interactive half of the learning page.
 *
 * The server renders the content; this component owns only what has to be
 * interactive — which sections are ticked, the knowledge check, and the
 * completion state. Section ticks are written to the database immediately, so
 * leaving and returning lands the learner in the right place. Local state is
 * an optimistic mirror, never the source of truth.
 */
export function LessonExperience({
  topic,
  lesson,
  initialCompletedSectionIds,
  initiallyCompleted,
  passingScore,
  nextTopic,
}: LessonExperienceProps) {
  const router = useRouter();

  const [completedSections, setCompletedSections] = React.useState<Set<string>>(
    () => new Set(initialCompletedSectionIds),
  );
  const [completed, setCompleted] = React.useState(initiallyCompleted);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const total = lesson.sections.length;
  const done = lesson.sections.filter((section) =>
    completedSections.has(section.id),
  ).length;

  // The first unread section — what "continue where you left off" points at.
  const nextUnread = lesson.sections.find(
    (section) => !completedSections.has(section.id),
  );

  const toggleSection = async (sectionId: string) => {
    const wasComplete = completedSections.has(sectionId);

    // Optimistic: the tick should feel instant.
    setCompletedSections((prev) => {
      const next = new Set(prev);
      if (wasComplete) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });

    const rollback = () =>
      setCompletedSections((prev) => {
        const next = new Set(prev);
        if (wasComplete) next.add(sectionId);
        else next.delete(sectionId);
        return next;
      });

    try {
      const result = await setSectionComplete({
        sectionId,
        completed: !wasComplete,
      });

      // The database is authoritative — put the UI back if the write failed.
      if (!result.ok) rollback();
    } catch {
      // A rejected action (network loss, a server-side throw) must roll back
      // too, otherwise the tick claims progress that was never saved.
      rollback();
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_17rem] lg:gap-12">
      <div className="min-w-0">
        {/* Resume prompt — only when they've started but not finished. */}
        {done > 0 && done < total && nextUnread ? (
          <div className="mb-10 rounded-xl border border-primary/25 bg-primary/[0.07] p-5">
            <p className="text-xs font-medium uppercase tracking-label text-indigo-300">
              Continue where you left off
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              You were learning{" "}
              <span className="font-medium text-foreground">
                {nextUnread.title ?? `section ${nextUnread.order}`}
              </span>
              .
            </p>
            <Button size="sm" asChild className="mt-4">
              <a href={`#section-${nextUnread.id}`}>Continue learning</a>
            </Button>
          </div>
        ) : null}

        {/* ── Lesson body ─────────────────────────────────────── */}
        <article className="flex max-w-[68ch] flex-col gap-8">
          {lesson.sections.map((section) => {
            const isComplete = completedSections.has(section.id);

            return (
              <section
                key={section.id}
                id={`section-${section.id}`}
                className="scroll-mt-24"
              >
                <SectionRenderer section={section} />

                <div className="mt-5 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    aria-pressed={isComplete}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors duration-200",
                      isComplete
                        ? "border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-400"
                        : "border-border bg-surface/60 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-4 place-items-center rounded border",
                        isComplete
                          ? "border-emerald-500/50 bg-emerald-500/20"
                          : "border-border",
                      )}
                    >
                      {isComplete ? <Check className="size-3" /> : null}
                    </span>
                    {isComplete ? "Marked as read" : "Mark as read"}
                  </button>
                </div>
              </section>
            );
          })}
        </article>

        {/* ── Resources ───────────────────────────────────────── */}
        {lesson.resources.length > 0 ? (
          <section aria-labelledby="resources-heading" className="mt-14 max-w-[68ch]">
            <h2
              id="resources-heading"
              className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
            >
              Go deeper
            </h2>
            <ul className="mt-4 flex flex-col gap-2">
              {lesson.resources.map((resource) => (
                <li key={resource.id}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="surface-interactive flex items-start gap-3 rounded-lg p-4"
                  >
                    <BookOpen
                      className="mt-0.5 size-4 shrink-0 text-indigo-400"
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">
                        {resource.title}
                      </span>
                      {/* The source is shown so nobody clicks a link blind. */}
                      <span className="mt-0.5 block text-xs text-subtle-foreground">
                        {resource.source}
                        {resource.description ? ` — ${resource.description}` : ""}
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
          </section>
        ) : null}

        {/* ── Knowledge check ─────────────────────────────────── */}
        {lesson.knowledgeChecks.length > 0 ? (
          <div className="max-w-[68ch]">
            <KnowledgeCheck
              topicId={topic.id}
              questions={lesson.knowledgeChecks}
              passingScore={passingScore}
              alreadyPassed={initiallyCompleted}
              onPassed={() => {
                setCompleted(true);
                router.refresh();
              }}
            />
          </div>
        ) : null}

        {/* ── Completion ──────────────────────────────────────── */}
        {completed ? (
          <section
            aria-labelledby="complete-heading"
            className="mt-12 max-w-[68ch] rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] p-6"
          >
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-label text-emerald-400">
              <CheckCircle2 className="size-4" aria-hidden />
              Topic complete
            </p>
            <h2
              id="complete-heading"
              className="mt-3 text-xl font-semibold tracking-tight text-foreground"
            >
              You completed {topic.title}
            </h2>

            {nextTopic ? (
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  Next up:{" "}
                  <span className="font-medium text-foreground">{nextTopic.title}</span>
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href={`/learn/${nextTopic.slug}`}>
                      Continue to {nextTopic.title}
                      <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link href="/roadmap">Back to roadmap</Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="mt-5">
                <Button asChild>
                  <Link href="/roadmap">Back to roadmap</Link>
                </Button>
              </div>
            )}
          </section>
        ) : null}
      </div>

      {/* ── Sidebar (desktop) / drawer (mobile) ───────────────── */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <button
          type="button"
          onClick={() => setDrawerOpen((open) => !open)}
          aria-expanded={drawerOpen}
          aria-controls="lesson-contents"
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface/60 p-4 text-sm text-foreground lg:hidden"
        >
          <span className="flex items-center gap-2">
            {drawerOpen ? (
              <X className="size-4" aria-hidden />
            ) : (
              <Menu className="size-4" aria-hidden />
            )}
            Lesson contents
          </span>
          <span className="font-mono text-xs text-subtle-foreground">
            {done}/{total}
          </span>
        </button>

        <div
          id="lesson-contents"
          className={cn(
            "mt-3 rounded-xl border border-border bg-surface/50 p-5 lg:mt-0 lg:block",
            drawerOpen ? "block" : "hidden",
          )}
        >
          <p className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
            Sections
          </p>

          <div className="mt-3">
            <div
              className="h-1.5 overflow-hidden rounded-full bg-surface-raised"
              role="progressbar"
              aria-valuenow={total === 0 ? 0 : Math.round((done / total) * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Sections read"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${total === 0 ? 0 : (done / total) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-subtle-foreground">
              {done} of {total} sections read
            </p>
          </div>

          <ol className="mt-4 flex flex-col gap-1">
            {lesson.sections.map((section) => {
              const isComplete = completedSections.has(section.id);
              const label = section.title ?? sectionFallbackLabel(section.type);

              return (
                <li key={section.id}>
                  <a
                    href={`#section-${section.id}`}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-1 grid size-3.5 shrink-0 place-items-center rounded-full border",
                        isComplete
                          ? "border-emerald-500/50 bg-emerald-500/25"
                          : "border-border",
                      )}
                    >
                      {isComplete ? (
                        <Check className="size-2 text-emerald-400" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      {label}
                      {isComplete ? <span className="sr-only"> (read)</span> : null}
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>

          {lesson.knowledgeChecks.length > 0 ? (
            <p className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
              <span
                aria-hidden
                className={cn(
                  "grid size-3.5 shrink-0 place-items-center rounded-full border",
                  completed
                    ? "border-emerald-500/50 bg-emerald-500/25"
                    : "border-border",
                )}
              >
                {completed ? <Check className="size-2 text-emerald-400" /> : null}
              </span>
              Knowledge check
            </p>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

/** Sections like CODE or CALLOUT often have no title of their own. */
function sectionFallbackLabel(type: string) {
  switch (type) {
    case "CODE":
      return "Code example";
    case "CALLOUT":
      return "Key point";
    case "WARNING":
      return "Common mistakes";
    case "EXAMPLE":
      return "Example";
    case "LIST":
      return "Summary";
    default:
      return "Section";
  }
}
