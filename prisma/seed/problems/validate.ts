import type { SeedLanguage, SeedProblem } from "./types";

/**
 * Content validation, run before anything is written.
 *
 * Same principle as the roadmap and lesson validators: a problem that cannot
 * grade itself, cannot be practised in any language, or hides no test cases is
 * a content bug, and it should be loud at seed time rather than confusing at
 * 11pm on the problem page.
 */

/**
 * Minimum catalog coverage per language, as Phase 6 requires. Asserted over the
 * whole set so removing a problem cannot quietly drop a language below the bar.
 */
export const LANGUAGE_MINIMUMS: Record<SeedLanguage, { easy: number; medium: number }> =
  {
    JAVASCRIPT: { easy: 5, medium: 3 },
    PYTHON: { easy: 5, medium: 3 },
    JAVA: { easy: 3, medium: 2 },
    TYPESCRIPT: { easy: 3, medium: 2 },
    CPP: { easy: 3, medium: 2 },
  };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Errors for one problem. An empty array means it is publishable. */
export function validateProblem(problem: SeedProblem): string[] {
  const errors: string[] = [];
  const where = `Problem "${problem.slug}"`;

  if (!SLUG_PATTERN.test(problem.slug)) {
    errors.push(`${where}: slug must be lower-case words separated by hyphens.`);
  }
  if (problem.title.trim().length === 0) errors.push(`${where}: has no title.`);
  if (problem.description.trim().length < 60) {
    errors.push(`${where}: description is too short to explain the task.`);
  }
  // The explanation is the teaching half of the product; a stub is worse than
  // nothing because it looks like content.
  if (problem.explanation.trim().length < 120) {
    errors.push(`${where}: explanation is too short to teach the approach.`);
  }
  if (problem.constraints.length === 0) errors.push(`${where}: has no constraints.`);
  if (problem.hints.length < 1 || problem.hints.length > 3) {
    errors.push(`${where}: must have between 1 and 3 hints.`);
  }
  if (problem.topicSlugs.length === 0) {
    // A problem with no topic can never be recommended, which defeats the point.
    errors.push(`${where}: is not connected to any topic.`);
  }
  if (problem.examples.length === 0) errors.push(`${where}: has no worked examples.`);

  // ── Test cases ────────────────────────────────────────────────────────
  const visible = problem.tests.filter((test) => !test.hidden);
  const hidden = problem.tests.filter((test) => test.hidden);

  if (visible.length === 0) {
    errors.push(`${where}: has no visible test cases, so Run has nothing to check.`);
  }
  if (hidden.length === 0) {
    // Without hidden cases, a solution hardcoded against the samples passes.
    errors.push(`${where}: has no hidden test cases.`);
  }

  for (const [index, test] of problem.tests.entries()) {
    if (test.args.length !== problem.signature.params.length) {
      errors.push(
        `${where}: test ${index + 1} passes ${test.args.length} arguments but the ` +
          `signature takes ${problem.signature.params.length}.`,
      );
    }
    try {
      JSON.stringify({ args: test.args, expected: test.expected });
    } catch {
      errors.push(`${where}: test ${index + 1} is not JSON-serialisable.`);
    }
  }

  // ── Languages ─────────────────────────────────────────────────────────
  const languages = Object.keys(problem.solutions) as SeedLanguage[];

  if (languages.length === 0) {
    errors.push(`${where}: has no reference solution, so no language can be offered.`);
  }
  for (const language of languages) {
    if ((problem.solutions[language] ?? "").trim().length === 0) {
      errors.push(`${where}: reference solution for ${language} is empty.`);
    }
  }

  // ── Limits ────────────────────────────────────────────────────────────
  if (problem.timeLimitMs !== undefined && problem.timeLimitMs > 10_000) {
    errors.push(`${where}: time limit above 10s — the sandbox will not honour it.`);
  }
  if (problem.memoryLimitMb !== undefined && problem.memoryLimitMb > 512) {
    errors.push(`${where}: memory limit above 512MB.`);
  }

  return errors;
}

/** Errors across the whole set: duplicate slugs and per-language coverage. */
export function validateProblemSet(problems: SeedProblem[]): string[] {
  const errors: string[] = [];

  const seen = new Set<string>();
  for (const problem of problems) {
    if (seen.has(problem.slug))
      errors.push(`Duplicate problem slug "${problem.slug}".`);
    seen.add(problem.slug);
  }

  for (const [language, minimum] of Object.entries(LANGUAGE_MINIMUMS) as [
    SeedLanguage,
    { easy: number; medium: number },
  ][]) {
    const available = problems.filter((problem) => language in problem.solutions);
    const easy = available.filter((problem) => problem.difficulty === "EASY").length;
    const medium = available.filter(
      (problem) => problem.difficulty === "MEDIUM",
    ).length;

    if (easy < minimum.easy) {
      errors.push(`${language}: ${easy} easy problems, ${minimum.easy} required.`);
    }
    if (medium < minimum.medium) {
      errors.push(
        `${language}: ${medium} medium problems, ${minimum.medium} required.`,
      );
    }
  }

  return errors;
}

/** Throws with every problem listed at once, rather than failing on the first. */
export function assertValidProblems(problems: SeedProblem[]): void {
  const errors = [
    ...problems.flatMap(validateProblem),
    ...validateProblemSet(problems),
  ];

  if (errors.length > 0) {
    throw new Error(`Invalid practice content:\n  - ${errors.join("\n  - ")}`);
  }
}
