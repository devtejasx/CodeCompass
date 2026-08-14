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
 *
 * The blur radius is the expensive part, not the element: a Gaussian blur costs
 * roughly the blurred area times the radius, and at `blur-[120px]` over a 36rem
 * circle this was the single most expensive paint on any page — on a mid-range
 * phone, one that has to be redone on the first scroll of the hero.
 *
 * So the radius scales with the screen instead of being fixed. 64px on a phone
 * over a proportionally smaller element is a fraction of the work and, at that
 * size, indistinguishable: the bloom's job is to lift the top of the page, and
 * it still does. Desktop keeps the original 120px exactly.
 */
export function Glow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -z-10 rounded-full bg-primary/15 blur-[64px] sm:blur-[96px] lg:blur-[120px]",
        className,
      )}
    />
  );
}

export function Divider({ className }: { className?: string }) {
  return <div aria-hidden className={cn("h-px w-full bg-border", className)} />;
}
