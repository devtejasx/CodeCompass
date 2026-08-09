import { EASY_PROBLEMS } from "./easy";
import { MEDIUM_PROBLEMS } from "./medium";
import type { SeedProblem } from "./types";

/**
 * The authored practice catalog: 32 problems, 20 easy and 12 medium.
 *
 * Weighted deliberately toward easy. A beginner who has just finished their
 * first lesson on arrays needs somewhere to land, not a wall of hard problems.
 * Hard is supported by the data model and is intentionally empty for now.
 *
 * Adding a problem means adding an entry here and re-seeding. No frontend
 * change is required: starter code is generated from the signature and the
 * page renders whatever the database holds.
 */
export const PROBLEMS: SeedProblem[] = [...EASY_PROBLEMS, ...MEDIUM_PROBLEMS];

export { EASY_PROBLEMS, MEDIUM_PROBLEMS };
export type { SeedProblem };
