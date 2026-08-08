import { cn } from "@/lib/utils";

/** Faint blueprint grid. Always masked so it fades rather than cutting off. */
export function GridBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("bg-grid pointer-events-none absolute inset-0 -z-10", className)}
    />
  );
}

/**
 * A single soft bloom. Used sparingly — hero and final CTA only — so the page
 * reads as a product surface rather than a gradient poster.
 */
export function Glow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -z-10 rounded-full bg-primary/15 blur-[120px]",
        className,
      )}
    />
  );
}

export function Divider({ className }: { className?: string }) {
  return <div aria-hidden className={cn("h-px w-full bg-border", className)} />;
}
