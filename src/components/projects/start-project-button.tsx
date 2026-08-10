"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

import { startProject } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";

/**
 * Starts a project and moves the learner into the workspace.
 *
 * Idempotent on the server, so a double click or a stale tab cannot create a
 * second record or reset milestones — this button only has to worry about not
 * firing twice while the first call is in flight.
 */
export function StartProjectButton({
  projectId,
  slug,
  label = "Start Project",
}: {
  projectId: string;
  slug: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const start = async () => {
    setPending(true);
    setError(null);
    try {
      const result = await startProject({ projectId });
      if (result.ok) {
        router.push(`/projects/${slug}/workspace`);
      } else {
        setError(result.error ?? "That could not be started.");
        setPending(false);
      }
    } catch {
      setError("That could not be started. Please try again.");
      setPending(false);
    }
  };

  return (
    <div>
      <Button onClick={() => void start()} disabled={pending}>
        {pending ? (
          <Loader2 className="animate-spin" aria-hidden />
        ) : (
          <ArrowRight aria-hidden />
        )}
        {label}
      </Button>
      {error ? (
        <p className="mt-2 text-xs text-rose-300" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
