import { CheckCircle2, CirclePlay, Lock, PlayCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PhaseState } from "@/lib/roadmap/progress";

/**
 * State is communicated three ways at once — icon, text and colour — because
 * colour alone excludes anyone who can't distinguish it, and "locked" is
 * exactly the kind of thing a learner must not have to guess at.
 */
const STYLES: Record<
  PhaseState,
  { icon: typeof CheckCircle2; className: string; srPrefix: string }
> = {
  COMPLETED: {
    icon: CheckCircle2,
    className: "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-400",
    srPrefix: "Phase completed:",
  },
  CURRENT: {
    icon: CirclePlay,
    className: "border-primary/40 bg-primary/[0.12] text-indigo-300",
    srPrefix: "Phase in progress:",
  },
  AVAILABLE: {
    icon: PlayCircle,
    className: "border-primary/40 bg-primary/[0.12] text-indigo-300",
    srPrefix: "Phase available to start:",
  },
  LOCKED: {
    icon: Lock,
    className: "border-border bg-surface text-subtle-foreground",
    srPrefix: "Phase locked:",
  },
};

export function PhaseStateBadge({
  state,
  label,
  className,
}: {
  state: PhaseState;
  label: string;
  className?: string;
}) {
  const { icon: Icon, className: tone } = STYLES[state];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        tone,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}

/** The numbered marker on the timeline rail. */
export function PhaseMarker({ state, order }: { state: PhaseState; order: number }) {
  const { icon: Icon, srPrefix } = STYLES[state];

  return (
    <span
      className={cn(
        "relative z-10 grid size-11 shrink-0 place-items-center rounded-xl border font-mono text-sm font-semibold",
        state === "LOCKED"
          ? "border-border bg-surface text-subtle-foreground"
          : state === "COMPLETED"
            ? "border-emerald-500/30 bg-emerald-500/[0.10] text-emerald-400"
            : "border-primary/40 bg-primary/[0.14] text-indigo-300",
      )}
    >
      <span className="sr-only">{srPrefix}</span>
      {state === "COMPLETED" || state === "LOCKED" ? (
        <Icon className="size-4" aria-hidden />
      ) : (
        String(order).padStart(2, "0")
      )}
    </span>
  );
}
