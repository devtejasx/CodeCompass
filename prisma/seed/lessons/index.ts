import { BACKEND_LESSONS } from "./backend";
import { FRONTEND_LESSONS as FRONTEND_CORE_LESSONS } from "./frontend";
import { FRONTEND_FOUNDATION_LESSONS } from "./frontend-foundations";
import { FRONTEND_HTML_LESSONS } from "./frontend-html";
import { FULLSTACK_LESSONS } from "./fullstack";
import type { SeedLesson } from "./types";

/**
 * Every authored lesson.
 *
 * The Frontend curriculum is split by roadmap phase rather than held in one
 * file: phase 1 in ./frontend-foundations, and the lessons authored before the
 * split in ./frontend. They are one list to every consumer — the split is for
 * whoever has to edit them.
 *
 * Adding a lesson means adding an entry here and re-seeding. No frontend
 * change is required: the renderer switches on section type.
 */
export const FRONTEND_LESSONS: SeedLesson[] = [
  ...FRONTEND_FOUNDATION_LESSONS,
  ...FRONTEND_HTML_LESSONS,
  ...FRONTEND_CORE_LESSONS,
];

export const LESSONS: SeedLesson[] = [
  ...FRONTEND_LESSONS,
  ...BACKEND_LESSONS,
  ...FULLSTACK_LESSONS,
];

export { BACKEND_LESSONS, FRONTEND_FOUNDATION_LESSONS, FULLSTACK_LESSONS };
export type { SeedLesson };
