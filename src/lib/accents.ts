import type { Accent } from "@/types";

/**
 * Accents tint icons and nothing else. Large coloured fills and per-card glows
 * were deliberately dropped — the design direction calls for restraint, so
 * colour marks category rather than decorating the surface.
 */
export const ACCENT_CLASSES: Record<Accent, string> = {
  indigo: "text-indigo-400",
  violet: "text-violet-400",
  cyan: "text-cyan-400",
};

export function accentClass(accent: Accent): string {
  return ACCENT_CLASSES[accent];
}
