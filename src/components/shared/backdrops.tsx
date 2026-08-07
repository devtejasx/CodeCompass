import { cn } from "@/lib/utils";

/** Subtle blueprint grid, faded out so it never competes with content. */
export function GridBackdrop({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "small" | "dots";
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10",
        variant === "default" && "bg-grid",
        variant === "small" && "bg-grid-sm",
        variant === "dots" && "bg-dots",
        className,
      )}
    />
  );
}

/** Soft coloured bloom used to lift sections off the near-black canvas. */
export function Glow({
  className,
  color = "indigo",
  size = "lg",
}: {
  className?: string;
  color?: "indigo" | "violet" | "cyan";
  size?: "sm" | "md" | "lg";
}) {
  const colors = {
    indigo: "bg-indigo-600/25",
    violet: "bg-violet-600/25",
    cyan: "bg-cyan-500/20",
  } as const;

  const sizes = {
    sm: "size-[22rem]",
    md: "size-[34rem]",
    lg: "size-[48rem]",
  } as const;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -z-10 rounded-full blur-[120px]",
        colors[color],
        sizes[size],
        className,
      )}
    />
  );
}

/** Hairline rule that fades at both ends — used between major sections. */
export function Divider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent",
        className,
      )}
    />
  );
}
