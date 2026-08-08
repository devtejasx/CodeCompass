import { cn } from "@/lib/utils";

/** Compass mark, inline SVG. The site ships no image files. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-surface",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-[18px]" aria-hidden>
        <defs>
          <linearGradient id="cc-needle" x1="4" y1="4" x2="20" y2="20">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="55%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <circle
          cx="12"
          cy="12"
          r="8.5"
          stroke="currentColor"
          strokeOpacity="0.4"
          strokeWidth="1.4"
        />
        <path d="M15.6 8.4 13.9 13.9 8.4 15.6 10.1 10.1z" fill="url(#cc-needle)" />
        <circle cx="12" cy="12" r="1.1" fill="currentColor" />
      </svg>
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-foreground", className)}>
      <LogoMark />
      <span className="text-[0.9375rem] font-semibold tracking-tight">CodeCompass</span>
    </span>
  );
}
