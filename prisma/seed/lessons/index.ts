import { BACKEND_LESSONS } from "./backend";
import { FRONTEND_LESSONS } from "./frontend";
import { FULLSTACK_LESSONS } from "./fullstack";
import type { SeedLesson } from "./types";

/**
 * Every authored lesson. Twelve today, against 154 topics — the rest render
 * "learning content coming soon" rather than a broken page.
 *
 * Adding a lesson means adding an entry here and re-seeding. No frontend
 * change is required: the renderer switches on section type.
 */
export const LESSONS: SeedLesson[] = [
  ...FRONTEND_LESSONS,
  ...BACKEND_LESSONS,
  ...FULLSTACK_LESSONS,
];

export { BACKEND_LESSONS, FRONTEND_LESSONS, FULLSTACK_LESSONS };
export type { SeedLesson };
