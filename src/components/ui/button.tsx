import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_10px_30px_-10px_rgba(79,70,229,0.9)] hover:from-indigo-400 hover:to-indigo-600 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.3)_inset,0_16px_40px_-12px_rgba(79,70,229,1)] active:translate-y-px",
        secondary:
          "glass text-white/90 hover:border-white/20 hover:bg-white/[0.07] hover:text-white active:translate-y-px",
        ghost: "text-white/70 hover:bg-white/5 hover:text-white",
        link: "text-indigo-300 underline-offset-4 hover:text-indigo-200 hover:underline",
        outline:
          "border border-white/10 bg-transparent text-white/90 hover:border-white/25 hover:bg-white/5",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-5",
        lg: "h-12 px-7 text-[0.95rem]",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
