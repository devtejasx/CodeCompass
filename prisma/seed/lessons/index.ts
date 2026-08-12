import { BACKEND_LESSONS } from "./backend";
import { FRONTEND_LESSONS as FRONTEND_CORE_LESSONS } from "./frontend";
import { FRONTEND_FOUNDATION_LESSONS } from "./frontend-foundations";
import { FRONTEND_CSS_LESSONS } from "./frontend-css";
import { FRONTEND_HTML_LESSONS } from "./frontend-html";
import { FRONTEND_JAVASCRIPT_LESSONS } from "./frontend-javascript";
import { FRONTEND_JS_BROWSER_LESSONS } from "./frontend-javascript-browser";
import { FRONTEND_REACT_LESSONS } from "./frontend-react";
import { FRONTEND_REACT_APPLICATION_LESSONS } from "./frontend-react-applications";
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
  ...FRONTEND_CSS_LESSONS,
  ...FRONTEND_JAVASCRIPT_LESSONS,
  ...FRONTEND_JS_BROWSER_LESSONS,
  ...FRONTEND_REACT_LESSONS,
  ...FRONTEND_REACT_APPLICATION_LESSONS,
  ...FRONTEND_CORE_LESSONS,
];

export const LESSONS: SeedLesson[] = [
  ...FRONTEND_LESSONS,
  ...BACKEND_LESSONS,
  ...FULLSTACK_LESSONS,
];

export { BACKEND_LESSONS, FRONTEND_FOUNDATION_LESSONS, FULLSTACK_LESSONS };
export type { SeedLesson };
