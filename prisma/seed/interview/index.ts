import type { SeedProblem } from "../problems/types";
import type { SeedRoadmap } from "../roadmaps/types";

import { INTERVIEW_DSA_ROADMAP } from "./roadmap";
import { INTERVIEW_PROBLEMS } from "./problems";

/**
 * The interview DSA curriculum: one ACADEMY roadmap and the problems that
 * practise it.
 *
 * The two halves meet at the Topic. The roadmap contributes the pattern names
 * and their order; the problems attach to those patterns and to the career
 * topics they also serve, which is what keeps a frontend learner's practice
 * recommendations working while the DSA progression exists underneath.
 *
 * Problems are exported into the ordinary PROBLEMS aggregate rather than being
 * seeded separately — they are practice problems, validated by the same
 * validator and written to the same tables. Nothing here is a second system.
 */
export const INTERVIEW_ROADMAPS: SeedRoadmap[] = [INTERVIEW_DSA_ROADMAP];

export const INTERVIEW_CATALOG: SeedProblem[] = INTERVIEW_PROBLEMS;

/** Slug of the academy roadmap, for queries that need to name it. */
export const INTERVIEW_DSA_SLUG = "interview-dsa";

export { INTERVIEW_DSA_ROADMAP, INTERVIEW_PROBLEMS };
