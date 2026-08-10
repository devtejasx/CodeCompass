/**
 * Authored roadmap content.
 *
 * Roadmaps are seeded, not hand-inserted, so the catalog is reproducible:
 * `prisma/seed.ts` upserts by (careerSlug, version) and rebuilds phases and
 * topics, and `validateRoadmap` rejects malformed structures before anything
 * reaches the database.
 */

export type SeedTopicDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface SeedTopic {
  /** Unique within its roadmap. "Functions" exists in several roadmaps. */
  slug: string;
  title: string;
  description: string;
  difficulty: SeedTopicDifficulty;
  estimatedTime: string;
  /** Optional topics are enrichment; skipping them still leaves you ready. */
  isRequired?: boolean;
  /** Slugs of topics in the same roadmap that should come first. */
  prerequisites?: string[];
}

export interface SeedPhase {
  title: string;
  description: string;
  estimatedDuration: string;
  kind?: "LEARNING" | "PROJECT_MILESTONE";
  /**
   * Why this phase sits here rather than earlier or later. This is the part
   * that turns an ordered list into an explanation, so it is required.
   */
  whyThisComesNext: string;
  topics: SeedTopic[];
}

export interface SeedRoadmap {
  /**
   * Must match a career in the Phase 3 catalog. Omitted for an ACADEMY
   * roadmap — Git and GitHub belong to no single career.
   */
  careerSlug?: string;
  /**
   * Required for an ACADEMY roadmap, which has no career to be looked up by.
   * Career roadmaps are found through their career and leave this unset.
   */
  slug?: string;
  kind?: "CAREER" | "ACADEMY";
  title: string;
  description: string;
  version?: number;
  estimatedDuration: string;
  phases: SeedPhase[];
}
