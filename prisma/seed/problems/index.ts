import { INTERVIEW_PROBLEMS } from "../interview/problems";
import { EASY_PROBLEMS } from "./easy";
import { MEDIUM_PROBLEMS } from "./medium";
import { REACT_PROBLEMS } from "./react";
import type { SeedProblem } from "./types";

/**
 * The authored practice catalog.
 *
 * Two sets, seeded as one. The original 36 are the problems a learner meets
 * straight after a lesson — small, language-focused, weighted toward easy so a
 * beginner who has just finished their first lesson on arrays has somewhere to
 * land. The React set is split by phase rather than difficulty, because what
 * makes those a set is the topic they practise; see ./react.ts.
 *
 * The interview catalog next door is the company coding-round curriculum,
 * organised by pattern and ordered by the academy roadmap in
 * prisma/seed/interview/roadmap.ts. It is appended rather than merged so that
 * catalog order stays "learn-first problems, then the DSA progression" —
 * `sortOrder` is array position at seed time.
 *
 * Adding a problem means adding an entry to one of those files. No frontend
 * change is required: starter code is generated from the signature and the page
 * renders whatever the database holds.
 */
export const PROBLEMS: SeedProblem[] = [
  ...EASY_PROBLEMS,
  ...MEDIUM_PROBLEMS,
  ...REACT_PROBLEMS,
  ...INTERVIEW_PROBLEMS,
];

export { EASY_PROBLEMS, MEDIUM_PROBLEMS, REACT_PROBLEMS, INTERVIEW_PROBLEMS };
export type { SeedProblem };
