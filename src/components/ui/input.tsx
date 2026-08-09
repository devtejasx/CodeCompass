import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-11 w-full rounded-lg border border-border bg-surface/60 px-3.5 text-sm text-foreground",
        "placeholder:text-subtle-foreground",
        "transition-colors duration-200 ease-out-expo",
        "hover:border-border focus:border-primary/50",
        "disabled:cursor-not-allowed disabled:opacity-60",
        invalid && "border-rose-500/50 focus:border-rose-500/70",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-sm font-medium text-foreground", className)}
    {...props}
  />
));
Label.displayName = "Label";

/**
 * Error text wired to its input via aria-describedby by the caller.
 * `role="alert"` so it is announced when it appears after a submit.
 */
function FieldError({ id, children }: { id: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="text-sm text-rose-400">
      {children}
    </p>
  );
}

export { Input, Label, FieldError };
