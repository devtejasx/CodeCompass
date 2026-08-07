import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-white/5 text-white/70",
        beginner: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
        intermediate: "border-amber-400/25 bg-amber-500/10 text-amber-300",
        advanced: "border-rose-400/25 bg-rose-500/10 text-rose-300",
        brand: "border-indigo-400/25 bg-indigo-500/10 text-indigo-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
