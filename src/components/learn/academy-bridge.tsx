import Link from "next/link";
import { ArrowRight, Check, Circle, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DelegationStatus } from "@/lib/learn/delegation";

/**
 * What a delegated topic shows instead of a lesson.
 *
 * The Frontend roadmap names seven Git topics; the Git & GitHub Academy teaches
 * them. Rather than a dead end or a second copy of the content, this hands the
 * learner over — and, crucially, shows exactly which Academy modules stand
 * behind this topic and which of them they have finished.
 *
 * It never claims progress the learner has not made. Opening the Academy is a
 * link, not a completion: the tick beside a module appears only once that
 * module's own lesson has actually been passed.
 */
export function AcademyBridge({ status }: { status: DelegationStatus }) {
  const done = status.modules.filter((module) => module.completed).length;

  return (
    <section
      aria-labelledby="academy-bridge-heading"
      className="surface max-w-[60ch] rounded-xl p-8"
    >
      <span
        aria-hidden
        className="grid size-10 place-items-center rounded-lg border border-primary/40 bg-primary/15 text-indigo-300"
      >
        <GraduationCap className="size-5" />
      </span>

      <h2
        id="academy-bridge-heading"
        className="mt-4 text-lg font-medium tracking-tight text-foreground"
      >
        {status.satisfied
          ? "You have covered this in the Git & GitHub Academy"
          : "This one is taught in the Git & GitHub Academy"}
      </h2>

      <p className="pretty mt-2 text-sm leading-relaxed text-muted-foreground">
        {status.summary} CodeCompass teaches Git in one place rather than
        repeating it inside every career path, so this topic is covered by the
        Academy — your progress there counts here.
      </p>

      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-subtle-foreground">
          {status.satisfied
            ? "Modules behind this topic"
            : `Modules behind this topic — ${done} of ${status.modules.length} done`}
        </p>

        <ul className="mt-3 flex flex-col gap-2">
          {status.modules.map((module) => (
            <li key={module.slug} className="flex items-start gap-2.5 text-sm">
              {/*
                State is carried by the icon and the text, never by colour
                alone — the same rule the roadmap's topic list follows.
              */}
              {module.completed ? (
                <Check
                  className="mt-0.5 size-4 shrink-0 text-emerald-400"
                  aria-hidden
                />
              ) : (
                <Circle
                  className="mt-0.5 size-4 shrink-0 text-subtle-foreground"
                  aria-hidden
                />
              )}
              <span
                className={
                  module.completed ? "text-muted-foreground" : "text-foreground"
                }
              >
                {module.title}
                <span className="ml-2 text-xs text-subtle-foreground">
                  {module.completed ? "Completed" : "Not yet"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        <Button asChild>
          <Link href={status.academyHref}>
            {status.satisfied
              ? "Revisit the Git Academy"
              : done > 0
                ? "Continue in the Git Academy"
                : "Start the Git Academy"}
            <ArrowRight aria-hidden />
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/roadmap">Back to roadmap</Link>
        </Button>
      </div>

      {status.satisfied ? (
        <p className="mt-4 text-xs leading-relaxed text-emerald-400">
          Every module behind this topic is complete, so your roadmap has moved
          on. Nothing further is needed here.
        </p>
      ) : (
        <p className="mt-4 max-w-[52ch] text-xs leading-relaxed text-subtle-foreground">
          Opening the Academy does not tick this off. This topic is satisfied
          once you have actually completed the modules listed above.
        </p>
      )}
    </section>
  );
}
