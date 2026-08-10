"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

import { completeProject, setRequirementConfirmed } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { canComplete, REQUIREMENT_CATEGORY_LABEL } from "@/lib/projects/progress";
import { cn } from "@/lib/utils";
import type { RequirementCategory } from "@/generated/prisma/client";
import type { ProjectDetail } from "@/lib/projects/queries";

/**
 * The self-evaluation checklist and the button that finishes the project.
 *
 * The word "self" is doing real work. CodeCompass has not seen the code, cannot
 * run it, and does not claim to have judged it — every tick is the learner
 * asserting something about their own work, and the copy says exactly that.
 *
 * What the system *can* insist on is that they went through the list and
 * recorded where the work lives. That check runs again on the server; the
 * disabled button here is a courtesy, not the rule.
 */
export function SelfEvaluation({
  projectId,
  requirements,
  initialConfirmedIds,
  repositoryUrl,
  alreadyComplete,
}: {
  projectId: string;
  requirements: ProjectDetail["requirements"];
  initialConfirmedIds: string[];
  repositoryUrl: string | null;
  alreadyComplete: boolean;
}) {
  const router = useRouter();

  const [confirmed, setConfirmed] = React.useState<Set<string>>(
    () => new Set(initialConfirmedIds),
  );
  const [completing, setCompleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const grouped = React.useMemo(() => {
    const map = new Map<RequirementCategory, ProjectDetail["requirements"]>();
    for (const requirement of requirements) {
      map.set(requirement.category, [
        ...(map.get(requirement.category) ?? []),
        requirement,
      ]);
    }
    return map;
  }, [requirements]);

  const requiredIds = requirements
    .filter((requirement) => requirement.isRequired)
    .map((requirement) => requirement.id);

  const readiness = canComplete({
    requiredRequirementIds: requiredIds,
    confirmedRequirementIds: [...confirmed],
    repositoryUrl,
  });

  const toggle = async (requirementId: string) => {
    const wasConfirmed = confirmed.has(requirementId);

    setConfirmed((previous) => {
      const next = new Set(previous);
      if (wasConfirmed) next.delete(requirementId);
      else next.add(requirementId);
      return next;
    });
    setError(null);

    const rollback = () =>
      setConfirmed((previous) => {
        const next = new Set(previous);
        if (wasConfirmed) next.add(requirementId);
        else next.delete(requirementId);
        return next;
      });

    try {
      const result = await setRequirementConfirmed({
        projectId,
        requirementId,
        confirmed: !wasConfirmed,
      });
      if (!result.ok) rollback();
    } catch {
      rollback();
    }
  };

  const finish = async () => {
    setCompleting(true);
    setError(null);
    try {
      const result = await completeProject({ projectId });
      if (result.ok) router.refresh();
      else setError(result.error ?? "That could not be completed.");
    } catch {
      setError("That could not be completed. Please try again.");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Go through this yourself against your running project. These are your own
        answers — nothing here has been checked by CodeCompass, and the point is the
        honest review rather than the ticks.
      </p>

      <div className="mt-5 flex flex-col gap-6">
        {[...grouped.entries()].map(([category, items]) => (
          <fieldset key={category}>
            <legend className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
              {REQUIREMENT_CATEGORY_LABEL[category]}
            </legend>

            <ul className="mt-3 flex flex-col gap-1.5">
              {items.map((requirement) => {
                const isConfirmed = confirmed.has(requirement.id);

                return (
                  <li key={requirement.id}>
                    <label
                      htmlFor={`requirement-${requirement.id}`}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors duration-200",
                        isConfirmed
                          ? "border-emerald-500/25 bg-emerald-500/[0.05]"
                          : "border-border bg-surface/40",
                      )}
                    >
                      <input
                        type="checkbox"
                        id={`requirement-${requirement.id}`}
                        checked={isConfirmed}
                        disabled={alreadyComplete}
                        onChange={() => void toggle(requirement.id)}
                        className="sr-only"
                      />
                      <span
                        aria-hidden
                        className={cn(
                          "mt-0.5 grid size-4 shrink-0 place-items-center rounded border",
                          isConfirmed
                            ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                            : "border-border text-transparent",
                        )}
                      >
                        <Check className="size-2.5" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground">
                          {requirement.title}
                          {!requirement.isRequired ? (
                            <span className="ml-2 text-xs font-normal text-subtle-foreground">
                              Optional
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                          {requirement.description}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ))}
      </div>

      {!alreadyComplete ? (
        <div className="mt-6 border-t border-border pt-5">
          <Button onClick={() => void finish()} disabled={!readiness.ok || completing}>
            {completing ? <Loader2 className="animate-spin" aria-hidden /> : null}
            Mark project complete
          </Button>

          <p aria-live="polite" className="mt-2.5 text-xs">
            {error ? (
              <span className="text-rose-300">{error}</span>
            ) : readiness.ok ? (
              <span className="text-subtle-foreground">
                You are confirming that you built this and that it does what the
                requirements describe.
              </span>
            ) : (
              <span className="text-subtle-foreground">{readiness.reason}</span>
            )}
          </p>
        </div>
      ) : null}
    </div>
  );
}
