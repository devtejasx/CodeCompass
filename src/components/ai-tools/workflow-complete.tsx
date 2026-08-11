"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";

import { setWorkflowComplete } from "@/app/actions/ai-tools";
import { cn } from "@/lib/utils";

/**
 * Self-reported "I have used this workflow".
 *
 * The label says "I have used this", not "completed", because CodeCompass
 * cannot watch somebody debug — this is the learner's own assertion, exactly
 * like a project's self-evaluation, and the UI never implies it was verified.
 *
 * It un-ticks as well as ticks: a checkbox that only goes one way is a trap
 * rather than a record.
 */
export function WorkflowComplete({
  workflowSlug,
  initiallyCompleted,
}: {
  workflowSlug: string;
  initiallyCompleted: boolean;
}) {
  const router = useRouter();
  const [done, setDone] = React.useState(initiallyCompleted);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function toggle() {
    const next = !done;
    setDone(next); // optimistic
    setError(null);

    startTransition(async () => {
      const result = await setWorkflowComplete({
        workflowSlug,
        completed: next,
      });

      if (!result.ok) {
        setDone(!next); // roll back rather than lie about what was saved
        setError(result.error ?? "Something went wrong.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={done}
        className={cn(
          "flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-sm transition-colors duration-200",
          done
            ? "border-emerald-500/25 bg-emerald-500/[0.06] text-emerald-300"
            : "border-border bg-surface/60 text-muted-foreground hover:text-foreground",
          pending && "opacity-70",
        )}
      >
        {done ? (
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
        ) : (
          <Circle className="size-4 shrink-0" aria-hidden />
        )}
        {done ? "You have used this workflow" : "I have used this workflow"}
      </button>

      <p className="mt-2 max-w-prose text-xs text-subtle-foreground">
        This is your own record. CodeCompass does not check your work — ticking it is
        a note to yourself about what you have actually practised.
      </p>

      {error ? (
        <p role="status" className="mt-2 text-sm text-rose-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
