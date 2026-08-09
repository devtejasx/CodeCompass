import type {
  CareerCategory,
  CareerDifficulty,
  DemandLevel,
} from "@/generated/prisma/client";

/** Display strings for the database enums — never hardcoded in components. */

export const CATEGORY_LABEL: Record<CareerCategory, string> = {
  SOFTWARE_DEVELOPMENT: "Software Development",
  DATA_AND_AI: "Data & AI",
  INFRASTRUCTURE_AND_CLOUD: "Infrastructure & Cloud",
  SECURITY: "Security",
  DESIGN_AND_PRODUCT: "Design & Product",
  OTHER_TECHNOLOGY: "Other Technology",
};

/** Explorer filter order — broadest first, catch-all last. */
export const CATEGORY_ORDER: CareerCategory[] = [
  "SOFTWARE_DEVELOPMENT",
  "DATA_AND_AI",
  "INFRASTRUCTURE_AND_CLOUD",
  "SECURITY",
  "DESIGN_AND_PRODUCT",
  "OTHER_TECHNOLOGY",
];

export const DIFFICULTY_LABEL: Record<CareerDifficulty, string> = {
  BEGINNER: "Beginner friendly",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

/** Short form for tight spaces such as the comparison table. */
export const DIFFICULTY_SHORT: Record<CareerDifficulty, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export const DIFFICULTY_ORDER: CareerDifficulty[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
];

export const DIFFICULTY_BADGE: Record<
  CareerDifficulty,
  "beginner" | "intermediate" | "advanced"
> = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
};

export const DEMAND_LABEL: Record<DemandLevel, string> = {
  MODERATE: "Steady demand",
  HIGH: "High demand",
  VERY_HIGH: "Very high demand",
};

/**
 * Maps the Phase 2 onboarding interest onto a career slug so the explorer can
 * say "based on what you told us…". Deliberately a suggestion only — the user
 * is never locked into it.
 *
 * Onboarding values with no single obvious career (OTHER, NOT_SURE) map to
 * nothing, which is the correct answer rather than a guess.
 */
export const ONBOARDING_INTEREST_TO_SLUG: Record<string, string | undefined> = {
  FRONTEND: "frontend-developer",
  BACKEND: "backend-developer",
  FULL_STACK: "full-stack-developer",
  AI_ENGINEERING: "ai-engineer",
  MACHINE_LEARNING: "machine-learning-engineer",
  DATA_SCIENCE: "data-scientist",
  DATA_ANALYTICS: "data-analyst",
  CYBERSECURITY: "cybersecurity-engineer",
  DEVOPS: "devops-engineer",
  CLOUD: "cloud-engineer",
  MOBILE: "mobile-app-developer",
  GAME_DEV: "game-developer",
  OTHER: undefined,
  NOT_SURE: undefined,
};
