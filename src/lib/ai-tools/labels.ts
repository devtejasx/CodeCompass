import type {
  AIToolEnvironment,
  AIToolStatus,
  AIUseCase,
  AIWorkflowCategory,
} from "@/generated/prisma/client";

/** Display strings for the Phase 9 enums — never hardcoded in components. */

export const USE_CASE_LABEL: Record<AIUseCase, string> = {
  WRITE_CODE: "Write code",
  UNDERSTAND_CODE: "Understand code",
  DEBUG: "Debug",
  TEST: "Write tests",
  DOCUMENT: "Write documentation",
  REFACTOR: "Refactor",
  RESEARCH: "Research a topic",
  LEARN: "Learn something",
  DESIGN_UI: "Design an interface",
  BUILD_APP: "Build an app",
  AUTOMATE: "Automate a process",
  BUILD_WITH_AI: "Build with AI",
  ANALYSE_DATA: "Analyse data",
  ARCHITECTURE: "Design a system",
};

/**
 * Order for the use-case filter and the decision helper's first question.
 * Roughly by how common the job is for somebody entering the field.
 */
export const USE_CASE_ORDER: AIUseCase[] = [
  "WRITE_CODE",
  "UNDERSTAND_CODE",
  "DEBUG",
  "TEST",
  "REFACTOR",
  "DOCUMENT",
  "LEARN",
  "RESEARCH",
  "DESIGN_UI",
  "BUILD_APP",
  "AUTOMATE",
  "ARCHITECTURE",
  "ANALYSE_DATA",
  "BUILD_WITH_AI",
];

export const ENVIRONMENT_LABEL: Record<AIToolEnvironment, string> = {
  IDE: "In my code editor",
  BROWSER: "In a browser",
  TERMINAL: "In a terminal",
  API: "From my own code",
  PLATFORM: "On a hosted platform",
};

/** Short form for cards and comparison rows, where the sentence is too long. */
export const ENVIRONMENT_SHORT: Record<AIToolEnvironment, string> = {
  IDE: "Editor",
  BROWSER: "Browser",
  TERMINAL: "Terminal",
  API: "API",
  PLATFORM: "Platform",
};

export const ENVIRONMENT_ORDER: AIToolEnvironment[] = [
  "IDE",
  "BROWSER",
  "TERMINAL",
  "API",
  "PLATFORM",
];

export const STATUS_LABEL: Record<AIToolStatus, string> = {
  ACTIVE: "Active",
  BETA: "Beta",
  DEPRECATED: "Superseded",
};

/**
 * What the status actually means for the reader, shown alongside the badge.
 *
 * Status is never communicated by colour alone: the badge carries a word, and
 * a DEPRECATED tool also renders its own statusNote explaining what happened.
 */
export const STATUS_DESCRIPTION: Record<AIToolStatus, string> = {
  ACTIVE: "Current and generally available.",
  BETA: "Available, but still changing. Expect features and pricing to move.",
  DEPRECATED:
    "No longer the current product under this name. Kept so the name still leads somewhere.",
};

export const WORKFLOW_CATEGORY_LABEL: Record<AIWorkflowCategory, string> = {
  DEBUGGING: "Debugging",
  LEARNING: "Learning",
  UNDERSTANDING: "Understanding code",
  TESTING: "Testing",
  DOCUMENTATION: "Documentation",
  REFACTORING: "Refactoring",
  RESEARCH: "Research",
  ARCHITECTURE: "Architecture",
  PLANNING: "Planning",
  REVIEW: "Review",
};

/**
 * Formats a verification date for display.
 *
 * Deliberately explicit about what the date means: it is when a person last
 * checked the record against the official source, not when the page was built.
 * Null renders as "not verified" rather than being hidden, because a record
 * nobody has checked is exactly the thing a reader should know about.
 */
export function formatVerified(date: Date | null): string {
  if (!date) return "Not verified";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
