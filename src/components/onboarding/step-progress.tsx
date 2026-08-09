import { cn } from "@/lib/utils";

interface StepProgressProps {
  current: number; // 1-based
  total: number;
}

/**
 * Segmented progress. Exposed as a progressbar with a text label so the step
 * position is available to assistive tech, not just visually.
 */
export function StepProgress({ current, total }: StepProgressProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
          Step {current} of {total}
        </p>
      </div>

      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={`Step ${current} of ${total}`}
        className="flex gap-1.5"
      >
        {Array.from({ length: total }, (_, i) => {
          const index = i + 1;
          const done = index < current;
          const active = index === current;
          return (
            <span
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300 ease-out-expo",
                done && "bg-primary",
                active && "bg-primary/70",
                !done && !active && "bg-surface-raised",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
