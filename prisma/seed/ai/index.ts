import type { SeedLesson } from "../lessons/types";
import type { SeedRoadmap } from "../roadmaps/types";

import { AI_CATEGORIES } from "./categories";
import { AI_ACADEMY_ROADMAP } from "./roadmap";
import { ASSISTANT_TOOLS } from "./tools-assistants";
import { CODING_TOOLS } from "./tools-coding";
import { BUILDER_TOOLS } from "./tools-builders";
import { PLATFORM_TOOLS } from "./tools-platforms";
import { AI_WORKFLOWS } from "./workflows";
import { CAREER_AI_TOOLS } from "./career-tools";
import { AI_FOUNDATION_LESSONS } from "./lessons-foundations";
import { AI_PRACTICE_LESSONS } from "./lessons-practice";
import { AI_ADVANCED_LESSONS } from "./lessons-advanced";
import { AI_RESPONSIBILITY_LESSONS } from "./lessons-responsibility";
import type { SeedAITool } from "./types";

/**
 * The AI Tools Academy, assembled.
 *
 * Two halves that meet at the Topic. The *curriculum* is an ordinary ACADEMY
 * roadmap and ordinary lessons, so it goes through the same validators and the
 * same seeding path as everything since Phase 4 — and gets UserTopicProgress
 * for free. The *catalog* is Phase 9's own data, and each tool's learning path
 * is an ordering over those same topics rather than a second content library.
 *
 * That is what keeps the two systems honest with each other: finishing
 * "Debugging with AI" counts towards every tool whose path includes it,
 * because there is only one of it.
 */

/** The curriculum, as an ACADEMY roadmap. */
export const AI_ACADEMY_ROADMAPS: SeedRoadmap[] = [AI_ACADEMY_ROADMAP];

/** Its lessons, in curriculum order. */
export const AI_ACADEMY_LESSONS: SeedLesson[] = [
  ...AI_FOUNDATION_LESSONS,
  ...AI_PRACTICE_LESSONS,
  ...AI_ADVANCED_LESSONS,
  ...AI_RESPONSIBILITY_LESSONS,
];

/**
 * The tool catalog.
 *
 * Ordered by the shape of the learner's journey rather than alphabetically:
 * assistants first because they are where everybody starts, then the tools that
 * live in an editor, then the ones that generate whole applications, then the
 * APIs underneath. `sortOrder` is assigned from this position at seed time.
 */
export const AI_TOOLS: SeedAITool[] = [
  ...ASSISTANT_TOOLS,
  ...CODING_TOOLS,
  ...BUILDER_TOOLS,
  ...PLATFORM_TOOLS,
];

/** The Academy's own slug, used to look the roadmap up without a career. */
export const AI_ACADEMY_SLUG = "ai-tools";

export { AI_CATEGORIES, AI_WORKFLOWS, CAREER_AI_TOOLS, AI_ACADEMY_ROADMAP };
