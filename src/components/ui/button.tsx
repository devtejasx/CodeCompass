import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-out-expo disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[0_1px_0_0_hsl(0_0%_100%/0.16)_inset] hover:bg-primary/90 active:translate-y-px",
        secondary:
          "border border-border bg-surface/60 text-foreground hover:border-border hover:bg-surface-raised active:translate-y-px",
        ghost: "text-muted-foreground hover:bg-surface hover:text-foreground",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      /*
       * `tap-target` on the compact sizes only: sm is 32px and icon is 40px,
       * which are both under a dependable thumb target, and on a phone these
       * are the buttons in toolbars and card footers where a near miss is most
       * likely. It extends the hit area to 44px on touch devices without
       * changing the rendered size, so the desktop density is preserved. md and
       * lg are already 40 and 44px tall with generous padding.
       */
      size: {
        sm: "tap-target h-8 px-3",
        // 40px, which is four short of the figure both platform guidelines
        // land on. The utility adds the missing hit area on coarse pointers
        // and leaves the geometry alone, so Run and Submit are comfortable on
        // a phone without growing on a desktop. See globals.css.
        md: "tap-target h-10 px-4",
        lg: "h-11 px-5 text-[0.9375rem]",
        icon: "tap-target size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
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
