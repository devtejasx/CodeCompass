import type { Accent } from "@/types";

interface AccentTokens {
  /** Icon / label foreground. */
  text: string;
  /** Soft fill behind an icon tile. */
  tile: string;
  /** Border used on hover. */
  border: string;
  /** Radial glow that blooms behind a hovered card. */
  glow: string;
  /** Solid gradient for progress bars and pills. */
  bar: string;
}

export const ACCENTS: Record<Accent, AccentTokens> = {
  indigo: {
    text: "text-indigo-300",
    tile: "bg-indigo-500/10",
    border: "group-hover:border-indigo-400/40",
    glow: "bg-indigo-500/20",
    bar: "from-indigo-500 to-violet-500",
  },
  violet: {
    text: "text-violet-300",
    tile: "bg-violet-500/10",
    border: "group-hover:border-violet-400/40",
    glow: "bg-violet-500/20",
    bar: "from-violet-500 to-fuchsia-500",
  },
  cyan: {
    text: "text-cyan-300",
    tile: "bg-cyan-500/10",
    border: "group-hover:border-cyan-400/40",
    glow: "bg-cyan-500/20",
    bar: "from-cyan-500 to-sky-500",
  },
  emerald: {
    text: "text-emerald-300",
    tile: "bg-emerald-500/10",
    border: "group-hover:border-emerald-400/40",
    glow: "bg-emerald-500/20",
    bar: "from-emerald-500 to-teal-500",
  },
  amber: {
    text: "text-amber-300",
    tile: "bg-amber-500/10",
    border: "group-hover:border-amber-400/40",
    glow: "bg-amber-500/20",
    bar: "from-amber-500 to-orange-500",
  },
  rose: {
    text: "text-rose-300",
    tile: "bg-rose-500/10",
    border: "group-hover:border-rose-400/40",
    glow: "bg-rose-500/20",
    bar: "from-rose-500 to-pink-500",
  },
};

export function accent(key: Accent): AccentTokens {
  return ACCENTS[key];
}
