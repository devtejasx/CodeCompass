/**
 * Authored coding-practice content.
 *
 * Problems live here as data, not as JSX or as rows typed by hand, so adding a
 * problem is a seed change. Starter code is *generated* from `signature` rather
 * than authored per language — see ./starter.ts — which is what makes adding a
 * sixth language one template instead of thirty-two edits.
 *
 * Every statement here is original. Nothing is copied from LeetCode, CodeChef,
 * HackerRank or Codeforces.
 */

export type SeedLanguage = "JAVASCRIPT" | "TYPESCRIPT" | "PYTHON" | "JAVA" | "CPP";

export type SeedProblemDifficulty = "EASY" | "MEDIUM" | "HARD";

/**
 * The value types the signature generator knows how to spell in each language.
 * Deliberately small: a problem that needs a type outside this set is a signal
 * that the problem is too advanced for the practice engine as it stands.
 */
export type ValueType =
  "int" | "float" | "string" | "bool" | "int[]" | "float[]" | "string[]";

export interface SeedSignature {
  /** camelCase. The Python harness receives the snake_case form. */
  name: string;
  params: { name: string; type: ValueType }[];
  returns: ValueType;
}

/** A worked example in the problem statement. Teaches; does not grade. */
export interface SeedExample {
  input: string;
  output: string;
  explanation?: string;
}

/**
 * A graded case. `args` is the argument list the harness spreads into the
 * learner's function, so the same case runs in every language unchanged.
 *
 * Hidden cases never leave the server.
 */
export interface SeedTestCase {
  args: unknown[];
  expected: unknown;
  hidden?: boolean;
}

export interface SeedProblem {
  slug: string;
  title: string;
  difficulty: SeedProblemDifficulty;
  /** Plain prose. Written for someone who has just finished the topic. */
  description: string;
  /** Shown after an attempt — teaches the approach, not just the answer. */
  explanation: string;
  constraints: string[];
  /** Progressive. Hint 1 nudges, hint 3 nearly gives the shape away. */
  hints: string[];
  estimatedTime: string;

  /** Overrides for problems that legitimately need more room. */
  timeLimitMs?: number;
  memoryLimitMb?: number;

  signature: SeedSignature;

  /** Topic slugs this practises. Every one must exist in a seeded roadmap. */
  topicSlugs: string[];

  examples: SeedExample[];
  tests: SeedTestCase[];

  /**
   * Reference solution *bodies*, keyed by language. The keys are what decides
   * which languages a problem is offered in — a language with no body is not
   * shown, so the engine can never present a language it has no answer key for.
   *
   * Bodies are written at zero indentation; the generator indents them into the
   * same shell the starter code uses.
   */
  solutions: Partial<Record<SeedLanguage, string>>;
}
