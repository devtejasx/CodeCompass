import type { SeedLesson } from "../lessons/types";
import type { SeedRoadmap } from "../roadmaps/types";

import { GIT_ACADEMY_ROADMAP } from "./git-roadmap";
import { GIT_COLLABORATION_LESSONS } from "./git-lessons-collaboration";
import { GIT_FOUNDATION_LESSONS } from "./git-lessons-foundations";

/**
 * The Git & GitHub Academy: one ACADEMY roadmap and ten authored lessons.
 *
 * Both are ordinary roadmap and lesson content, which is the point — they go
 * through the same validators, the same seeding path and the same progress
 * tracking as every career roadmap. The Academy is a different *kind* of
 * curriculum, not a different system.
 */
export const ACADEMY_ROADMAPS: SeedRoadmap[] = [GIT_ACADEMY_ROADMAP];

export const ACADEMY_LESSONS: SeedLesson[] = [
  ...GIT_FOUNDATION_LESSONS,
  ...GIT_COLLABORATION_LESSONS,
];

/** The Academy's own slug, used to look it up without a career. */
export const GIT_ACADEMY_SLUG = "git-github";

export { GIT_ACADEMY_ROADMAP, GIT_FOUNDATION_LESSONS, GIT_COLLABORATION_LESSONS };
