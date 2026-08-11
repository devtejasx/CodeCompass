import type { SeedResourceType } from "../lessons/types";

/**
 * Authored AI Tools Academy content.
 *
 * AI tooling changes faster than anything else CodeCompass teaches, so the
 * catalog is authored as data and seeded — never written into a component. A
 * tool being renamed, deprecated or gaining a capability is an edit to one of
 * these objects.
 *
 * Two rules govern what may be written here, and `validate.ts` enforces both:
 *
 *   1. Every claim about a product must have been checked against that
 *      product's own site or documentation. `verifiedOn` and
 *      `verificationSource` record when and against what.
 *   2. Nothing is deleted when a tool changes. A discontinued or renamed tool
 *      keeps its row, gains `status: "DEPRECATED"` and points at whatever
 *      replaced it — a learner who has heard the old name still deserves an
 *      answer.
 */

export type SeedAIToolStatus = "ACTIVE" | "BETA" | "DEPRECATED";

export type SeedDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type SeedAIUseCase =
  | "WRITE_CODE"
  | "UNDERSTAND_CODE"
  | "DEBUG"
  | "TEST"
  | "DOCUMENT"
  | "REFACTOR"
  | "RESEARCH"
  | "LEARN"
  | "DESIGN_UI"
  | "BUILD_APP"
  | "AUTOMATE"
  | "BUILD_WITH_AI"
  | "ANALYSE_DATA"
  | "ARCHITECTURE";

export type SeedAIEnvironment = "IDE" | "BROWSER" | "TERMINAL" | "API" | "PLATFORM";

export type SeedAIWorkflowCategory =
  | "DEBUGGING"
  | "LEARNING"
  | "UNDERSTANDING"
  | "TESTING"
  | "DOCUMENTATION"
  | "REFACTORING"
  | "RESEARCH"
  | "ARCHITECTURE"
  | "PLANNING"
  | "REVIEW";

export interface SeedAICategory {
  slug: string;
  name: string;
  description: string;
  /** Lucide icon name, resolved through a registry at render time. */
  icon: string;
}

export interface SeedAICapability {
  capability: string;
  /** What it means for somebody who has never used the tool. */
  detail?: string;
}

export interface SeedAIToolUseCase {
  useCase: SeedAIUseCase;
  /** Why this tool suits this job. Shown wherever the match is surfaced. */
  note: string;
}

export interface SeedAIResource {
  title: string;
  url: string;
  source: string;
  type: SeedResourceType;
  description?: string;
}

/** One level of a tool's path. `topicSlug` points at the Topic that teaches it. */
export interface SeedAIToolLesson {
  title: string;
  description: string;
  estimatedTime: string;
  /**
   * A Topic in the AI Academy roadmap. Optional so a level can be sketched
   * before its lesson exists — the UI then says "coming soon" rather than
   * linking nowhere.
   */
  topicSlug?: string;
}

export interface SeedAIToolLearningPath {
  slug: string;
  title: string;
  description: string;
  difficulty: SeedDifficulty;
  estimatedTime: string;
  lessons: SeedAIToolLesson[];
}

export interface SeedAITool {
  slug: string;
  name: string;
  categorySlug: string;

  /** One line for the card. */
  description: string;
  /** A paragraph for the detail hero. */
  longDescription: string;
  /** Section 1: what it actually does, without marketing language. */
  whatItIs: string;

  /** Sections 2, 3 and 5 of the detail page. All three are required. */
  whenToUse: string[];
  whenNotToUse: string[];
  limitations: string[];

  /** Section 6: how developers actually work with it. */
  howDevelopersUseIt: string;

  officialUrl: string;
  docsUrl?: string;

  status?: SeedAIToolStatus;
  difficulty: SeedDifficulty;
  primaryUse: string;
  environments: SeedAIEnvironment[];
  /** Lucide icon name. Never a downloaded or invented logo. */
  icon: string;

  /**
   * ISO date the record was last checked against the official source, and the
   * URL it was checked against. Both required — a catalog that cannot say when
   * it was last true is a catalog that will quietly go stale.
   */
  verifiedOn: string;
  verificationSource: string;

  /** DEPRECATED only: where the learner should go, and one sentence on why. */
  supersededBySlug?: string;
  statusNote?: string;

  capabilities: SeedAICapability[];
  useCases: SeedAIToolUseCase[];
  resources: SeedAIResource[];
  learningPath: SeedAIToolLearningPath;
}

export interface SeedAIWorkflowStep {
  title: string;
  detail: string;
  /** False only for the step where the AI is actually asked something. */
  isHumanStep?: boolean;
}

export interface SeedAIWorkflowPrompt {
  label: string;
  goal: string;
  context: string;
  request: string;
  /** The teaching: why this beats "fix my code". */
  whyItWorks: string;
}

export interface SeedAIWorkflow {
  slug: string;
  title: string;
  goal: string;
  summary: string;
  category: SeedAIWorkflowCategory;
  difficulty: SeedDifficulty;
  estimatedTime: string;
  steps: SeedAIWorkflowStep[];
  prompts: SeedAIWorkflowPrompt[];
  whatToVerify: string[];
  commonMistakes: string[];
  /** Tools this workflow is realistic with. Not exclusive, not an endorsement. */
  toolSlugs: string[];
}

/** One career → tool edge, with the reason it exists. */
export interface SeedCareerAITool {
  careerSlug: string;
  tools: { toolSlug: string; useCase: SeedAIUseCase; reason: string }[];
}
