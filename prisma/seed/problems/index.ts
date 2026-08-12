import { EASY_PROBLEMS } from "./easy";
import { MEDIUM_PROBLEMS } from "./medium";
import { REACT_PROBLEMS } from "./react";
import type { SeedProblem } from "./types";

/**
 * The authored practice catalog: 36 problems, 23 easy and 13 medium.
 *
 * Weighted deliberately toward easy. A beginner who has just finished their
 * first lesson on arrays needs somewhere to land, not a wall of hard problems.
 * Hard is supported by the data model and is intentionally empty for now.
 *
 * The general catalog is split by difficulty. The React set is split by *phase*
 * instead, and holds both difficulties, because what makes those problems a set
 * is the topic they practise rather than how hard they are — see ./react.ts for
 * why they exist at all given that the engine cannot render a component.
 *
 * Adding a problem means adding an entry here and re-seeding. No frontend
 * change is required: starter code is generated from the signature and the
 * page renders whatever the database holds.
 */
export const PROBLEMS: SeedProblem[] = [
  ...EASY_PROBLEMS,
  ...MEDIUM_PROBLEMS,
  ...REACT_PROBLEMS,
];

export { EASY_PROBLEMS, MEDIUM_PROBLEMS, REACT_PROBLEMS };
export type { SeedProblem };
