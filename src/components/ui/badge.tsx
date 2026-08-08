import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-border bg-surface text-muted-foreground",
        beginner: "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400",
        intermediate: "border-amber-500/20 bg-amber-500/[0.08] text-amber-400",
        advanced: "border-rose-500/20 bg-rose-500/[0.08] text-rose-400",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/** Maps a difficulty onto its badge variant so callers never hardcode it. */
export const DIFFICULTY_VARIANT: Record<
  Difficulty,
  "beginner" | "intermediate" | "advanced"
> = {
  Beginner: "beginner",
  Intermediate: "intermediate",
  Advanced: "advanced",
};

export { Badge, badgeVariants };
