import { BACKEND_ROADMAP } from "./backend";
import { FRONTEND_ROADMAP } from "./frontend";
import { FULLSTACK_ROADMAP } from "./fullstack";
import type { SeedRoadmap } from "./types";

/**
 * Every authored roadmap. Phase 4 ships three; the explorer already lists 20
 * careers, and the remaining ones fall back to the "still building this path"
 * empty state until a roadmap is added here.
 */
export const ROADMAPS: SeedRoadmap[] = [
  FRONTEND_ROADMAP,
  BACKEND_ROADMAP,
  FULLSTACK_ROADMAP,
];

export { BACKEND_ROADMAP, FRONTEND_ROADMAP, FULLSTACK_ROADMAP };
export type { SeedRoadmap };
