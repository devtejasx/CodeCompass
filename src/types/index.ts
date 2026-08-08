import type { LucideIcon } from "lucide-react";

/**
 * Phase 1 types describe *presentation* only — what the marketing page renders.
 *
 * Later phases introduce persisted domain entities (Career, Roadmap,
 * RoadmapPhase, Topic, Lesson, Resource, PracticeProblem, Project, AITool,
 * UserProgress). Those names are deliberately left free here: the view models
 * below are suffixed so a real `Career` type can be added alongside
 * `CareerPathCard` without a rename or a breaking merge.
 */

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

/** Restrained accent set — used for icon tint only, never for large fills. */
export type Accent = "indigo" | "violet" | "cyan";

export interface NavLink {
  label: string;
  href: string;
}

export interface FooterGroup {
  title: string;
  links: NavLink[];
}

export interface SocialLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** A card in the "Explore the world of technology" grid. Informational only. */
export interface CareerPathCard {
  /** Stable key; becomes the route slug when careers get real pages. */
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  difficulty: Difficulty;
  accent: Accent;
}

/** A numbered step in the "How CodeCompass works" section. */
export interface WorkStep {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

/** A node in the journey roadmap visualisation. */
export interface JourneyNode {
  title: string;
  description: string;
  icon: LucideIcon;
}

/** A card in the "What you'll learn" grid. */
export interface LearningArea {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: Accent;
}

/**
 * An AI tool shown in the Phase 1 visual preview.
 * `mark` + `tint` render a generated monogram — no third-party logo files.
 */
export interface AiToolPreview {
  name: string;
  category: string;
  mark: string;
  tint: string;
}

/** A question beginners actually ask, shown in the problem section. */
export interface BeginnerQuestion {
  text: string;
}
