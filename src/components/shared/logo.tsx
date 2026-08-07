import { cn } from "@/lib/utils";

/**
 * Compass mark drawn as inline SVG — no raster assets anywhere on the site.
 * The needle uses the brand gradient so the logo carries the palette.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/25 via-violet-500/15 to-cyan-500/20",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-5"
        aria-hidden
        focusable="false"
      >
        <defs>
          <linearGradient id="cc-needle" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="55%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="1.4"
        />
        <path
          d="M15.6 8.4 13.9 13.9 8.4 15.6 10.1 10.1z"
          fill="url(#cc-needle)"
        />
        <circle cx="12" cy="12" r="1.15" fill="#fff" />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {showWordmark ? (
        <span className="text-[0.98rem] font-semibold tracking-tight text-white">
          Code<span className="text-white/55">Compass</span>
        </span>
      ) : null}
    </span>
  );
}
