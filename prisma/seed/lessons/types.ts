/**
 * Authored lesson content.
 *
 * Lessons live here as data, not as JSX, so adding or revising a lesson is a
 * seed change rather than a frontend change. The renderer switches on
 * `type` — see src/components/learn/section-renderer.tsx.
 */

export type SeedSectionType =
  "TEXT" | "HEADING" | "LIST" | "CALLOUT" | "WARNING" | "CODE" | "EXAMPLE";

export type SeedResourceType = "ARTICLE" | "DOCUMENTATION" | "VIDEO" | "REFERENCE";

export interface SeedSection {
  type: SeedSectionType;
  /** Optional — a CODE or CALLOUT block often needs no heading of its own. */
  title?: string;
  /** Prose, or the lead-in for a CODE block. */
  content: string;
  /** LIST only. */
  items?: string[];
  /** CODE only. */
  code?: string;
  language?: string;
}

export interface SeedKnowledgeCheck {
  question: string;
  /** Shown after answering — feedback should teach, not just score. */
  explanation: string;
  options: { text: string; isCorrect?: boolean }[];
}

export interface SeedResource {
  title: string;
  url: string;
  /** Shown to the reader so they know where a link goes before clicking. */
  source: string;
  type: SeedResourceType;
  description?: string;
}

export interface SeedLesson {
  /** Must match an existing Topic.slug. Lessons never create topics. */
  topicSlug: string;
  title: string;
  description: string;
  estimatedTime: string;
  sections: SeedSection[];
  knowledgeChecks: SeedKnowledgeCheck[];
  resources?: SeedResource[];
}
