import { BACKEND_PROJECTS } from "./backend";
import { FRONTEND_PROJECTS } from "./frontend";
import { FULLSTACK_PROJECTS } from "./fullstack";
import type { SeedProject } from "./types";

/**
 * The authored project catalog: 24 projects across the three seeded careers.
 *
 * Deliberately not hundreds. A learner needs an obvious next thing to build,
 * not a directory to browse, and every project here carries enough authored
 * detail — requirements, milestones, hints, resources — to be genuinely
 * buildable from the page alone.
 *
 * Adding a project means adding an entry here and re-seeding. No frontend
 * change is required.
 */
export const PROJECTS: SeedProject[] = [
  ...FRONTEND_PROJECTS,
  ...BACKEND_PROJECTS,
  ...FULLSTACK_PROJECTS,
];

export { BACKEND_PROJECTS, FRONTEND_PROJECTS, FULLSTACK_PROJECTS };
export type { SeedProject };
