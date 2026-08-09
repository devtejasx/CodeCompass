import type { CodeLanguage, ProblemDifficulty } from "@/generated/prisma/client";

/**
 * Language presentation, in one place so the selector, the editor and the
 * submission history can never disagree about what to call something.
 */

export const LANGUAGE_LABEL: Record<CodeLanguage, string> = {
  JAVASCRIPT: "JavaScript",
  TYPESCRIPT: "TypeScript",
  PYTHON: "Python",
  JAVA: "Java",
  CPP: "C++",
};

/** Monaco's own language ids. Not the same strings as ours, hence the map. */
export const MONACO_LANGUAGE: Record<CodeLanguage, string> = {
  JAVASCRIPT: "javascript",
  TYPESCRIPT: "typescript",
  PYTHON: "python",
  JAVA: "java",
  CPP: "cpp",
};

/**
 * Preferred display order. A learner scanning a dropdown should see the same
 * order every time, and it should not depend on database ordering.
 */
export const LANGUAGE_ORDER: readonly CodeLanguage[] = [
  "JAVASCRIPT",
  "PYTHON",
  "TYPESCRIPT",
  "JAVA",
  "CPP",
];

export function sortLanguages(languages: CodeLanguage[]): CodeLanguage[] {
  return [...languages].sort(
    (a, b) => LANGUAGE_ORDER.indexOf(a) - LANGUAGE_ORDER.indexOf(b),
  );
}

/**
 * Maps the language a learner told us about during onboarding onto a practice
 * language, so their first problem opens in something familiar. Anything we
 * cannot map falls through to the problem's default.
 */
export function preferredLanguageFor(
  onboardingChoice: string | null | undefined,
): CodeLanguage | null {
  switch (onboardingChoice) {
    case "JAVASCRIPT_TYPESCRIPT":
      return "JAVASCRIPT";
    case "PYTHON":
      return "PYTHON";
    case "JAVA":
      return "JAVA";
    case "CPP":
      return "CPP";
    default:
      return null;
  }
}

export const DIFFICULTY_LABEL: Record<ProblemDifficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

/** Reuses the shared badge variants rather than inventing practice-only colours. */
export const DIFFICULTY_BADGE: Record<
  ProblemDifficulty,
  "beginner" | "intermediate" | "advanced"
> = {
  EASY: "beginner",
  MEDIUM: "intermediate",
  HARD: "advanced",
};
