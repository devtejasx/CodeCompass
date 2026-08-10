/**
 * Authored project content.
 *
 * Projects live here as data, so adding one is a seed change rather than a
 * frontend change — the same rule the roadmap, lesson and practice content
 * follow.
 *
 * What is deliberately absent: source code, scaffolds, starter repositories and
 * solutions. The project system exists to develop problem-solving ability, so
 * the strongest thing it ships is a clear definition of *done* plus hints that
 * point at the next question. The learner writes the code.
 */

export type SeedProjectDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type SeedProjectType =
  "FRONTEND" | "BACKEND" | "FULL_STACK" | "DATA" | "AI" | "MOBILE" | "OTHER";

export type SeedTechnologyCategory =
  "LANGUAGE" | "FRAMEWORK" | "LIBRARY" | "STYLING" | "DATABASE" | "TOOL" | "PLATFORM";

export type SeedRequirementCategory = "FUNCTIONAL" | "TECHNICAL";

export type SeedResourceType = "ARTICLE" | "DOCUMENTATION" | "VIDEO" | "REFERENCE";

export interface SeedProjectRequirement {
  title: string;
  description: string;
  category?: SeedRequirementCategory;
  /** Stretch goals are `false`; they never block completion. */
  isRequired?: boolean;
}

export interface SeedProjectMilestone {
  title: string;
  description: string;
  estimatedTime: string;
  /** Concepts this step exercises, for the milestone's own label. */
  concepts?: string[];
}

export interface SeedProjectTechnology {
  name: string;
  category: SeedTechnologyCategory;
}

export interface SeedProjectHint {
  title: string;
  /** Points at the next question to ask. Never the implementation. */
  content: string;
}

export interface SeedProjectResource {
  title: string;
  /** Must be a real, verified https URL. Invented links are worse than none. */
  url: string;
  source: string;
  type?: SeedResourceType;
}

export interface SeedProject {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;

  difficulty: SeedProjectDifficulty;
  type: SeedProjectType;
  estimatedDuration: string;

  /** Section 1 of the detail page: what the learner gains. */
  whyBuildThis: string;
  /** Section 2: the outcome, described so they can picture it finished. */
  whatYouBuild: string;

  technologies: SeedProjectTechnology[];

  /**
   * Topic slugs this project builds on. Every one must exist in a seeded
   * roadmap. These gate the recommendation — a project is not suggested to
   * someone who has not finished its prerequisites.
   */
  prerequisiteTopicSlugs: string[];
  /**
   * Topic slugs the project also exercises but does not depend on. Shown under
   * "what you will practise" without gating the recommendation.
   */
  relatedTopicSlugs?: string[];

  requirements: SeedProjectRequirement[];
  milestones: SeedProjectMilestone[];
  hints: SeedProjectHint[];
  resources: SeedProjectResource[];
}
