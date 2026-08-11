"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { startTool } from "@/app/actions/ai-tools";

/**
 * Starts a tool's learning path and sends the learner to its first lesson.
 *
 * Two things happen in one click on purpose: recording the start is what makes
 * "continue learning" work on the dashboard, and navigating is what the learner
 * actually wanted. If the record fails we still navigate — losing a progress
 * row is annoying, but blocking somebody from a lesson over it would be worse.
 */
export function StartToolButton({
  toolSlug,
  nextLessonSlug,
  label,
}: {
  toolSlug: string;
  /** The first unfinished topic, or null when the path has no lesson yet. */
  nextLessonSlug: string | null;
  label: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function handleClick() {
    setError(null);

    startTransition(async () => {
      const result = await startTool({ toolSlug });

      if (!result.ok && !nextLessonSlug) {
        setError(result.error ?? "Something went wrong.");
        return;
      }

      if (nextLessonSlug) {
        router.push(`/learn/${nextLessonSlug}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div>
      <Button onClick={handleClick} disabled={pending}>
        {pending ? "Starting…" : label}
        <ArrowRight aria-hidden />
      </Button>

      {error ? (
        <p role="status" className="mt-2 text-sm text-rose-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
