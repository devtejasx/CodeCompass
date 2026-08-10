import type { SeedProject } from "./types";

/**
 * Content validation, run before anything is written.
 *
 * The same principle as the roadmap, lesson and practice validators: a project
 * that cannot say what "done" means, or that recommends itself to someone who
 * has learned nothing, is a content bug — and it should be loud at seed time
 * rather than confusing on the project page.
 */

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Errors for one project. An empty array means it is publishable. */
export function validateProject(project: SeedProject): string[] {
  const errors: string[] = [];
  const where = `Project "${project.slug}"`;

  if (!SLUG_PATTERN.test(project.slug)) {
    errors.push(`${where}: slug must be lower-case words separated by hyphens.`);
  }
  if (project.title.trim().length === 0) errors.push(`${where}: has no title.`);
  if (project.shortDescription.trim().length < 20) {
    errors.push(`${where}: short description is too short for a card.`);
  }
  if (project.description.trim().length < 100) {
    errors.push(`${where}: description is too short to explain the project.`);
  }

  // The two narrative sections are the reason the detail page is worth reading.
  // A stub in either is worse than nothing, because it looks like content.
  if (project.whyBuildThis.trim().length < 100) {
    errors.push(`${where}: whyBuildThis is too short to justify the project.`);
  }
  if (project.whatYouBuild.trim().length < 80) {
    errors.push(`${where}: whatYouBuild is too short to describe the outcome.`);
  }

  if (project.technologies.length === 0) {
    errors.push(`${where}: lists no technologies.`);
  }

  // ── Concepts ──────────────────────────────────────────────────────────
  if (project.prerequisiteTopicSlugs.length === 0) {
    // Without prerequisites the recommender cannot tell who is ready for it,
    // so it would be offered to a learner on day one.
    errors.push(
      `${where}: has no prerequisite topics, so it can never be recommended.`,
    );
  }

  const overlap = project.prerequisiteTopicSlugs.filter((slug) =>
    (project.relatedTopicSlugs ?? []).includes(slug),
  );
  if (overlap.length > 0) {
    errors.push(
      `${where}: topic(s) ${overlap.join(", ")} listed as both prerequisite and related.`,
    );
  }

  const duplicatePrerequisites =
    new Set(project.prerequisiteTopicSlugs).size !==
    project.prerequisiteTopicSlugs.length;
  if (duplicatePrerequisites) {
    errors.push(`${where}: has duplicate prerequisite topics.`);
  }

  // ── Requirements ──────────────────────────────────────────────────────
  if (project.requirements.length < 4) {
    errors.push(`${where}: needs at least 4 requirements to define "done".`);
  }
  const functional = project.requirements.filter(
    (requirement) => (requirement.category ?? "FUNCTIONAL") === "FUNCTIONAL",
  );
  const technical = project.requirements.filter(
    (requirement) => requirement.category === "TECHNICAL",
  );
  if (functional.length === 0) {
    errors.push(`${where}: has no functional requirements.`);
  }
  if (technical.length === 0) {
    // The self-evaluation asks both "does it work?" and "is it built well?".
    errors.push(`${where}: has no technical requirements.`);
  }

  // ── Milestones ────────────────────────────────────────────────────────
  if (project.milestones.length < 4) {
    errors.push(`${where}: needs at least 4 milestones to be breakable into steps.`);
  }
  for (const [index, milestone] of project.milestones.entries()) {
    if (milestone.description.trim().length < 30) {
      errors.push(`${where}: milestone ${index + 1} has no useful description.`);
    }
    if (milestone.estimatedTime.trim().length === 0) {
      errors.push(`${where}: milestone ${index + 1} has no estimated time.`);
    }
  }

  // ── Hints ─────────────────────────────────────────────────────────────
  if (project.hints.length < 1 || project.hints.length > 3) {
    errors.push(`${where}: must have between 1 and 3 hints.`);
  }
  for (const hint of project.hints) {
    if (hint.content.trim().length < 40) {
      errors.push(`${where}: hint "${hint.title}" is too short to guide anything.`);
    }
  }

  // ── Resources ─────────────────────────────────────────────────────────
  if (project.resources.length === 0) {
    errors.push(`${where}: has no resources.`);
  }
  for (const resource of project.resources) {
    if (!resource.url.startsWith("https://")) {
      // Sending a beginner to an unencrypted page is a bad habit to teach.
      errors.push(`${where}: resource "${resource.title}" is not an https link.`);
    }
    if (resource.source.trim().length === 0) {
      errors.push(
        `${where}: resource "${resource.title}" has no source, so nobody knows where ` +
          `the link goes before clicking it.`,
      );
    }
  }

  return errors;
}

/** Errors across the whole set: duplicate slugs and difficulty coverage. */
export function validateProjectSet(projects: SeedProject[]): string[] {
  const errors: string[] = [];

  const seen = new Set<string>();
  for (const project of projects) {
    if (seen.has(project.slug))
      errors.push(`Duplicate project slug "${project.slug}".`);
    seen.add(project.slug);
  }

  // Every seeded type must have somewhere to start. A type whose easiest
  // project is ADVANCED is a dead end for the learner who picked that career.
  const types = new Set(projects.map((project) => project.type));
  for (const type of types) {
    const ofType = projects.filter((project) => project.type === type);
    if (!ofType.some((project) => project.difficulty === "BEGINNER")) {
      errors.push(`${type}: has no beginner project to start from.`);
    }
  }

  return errors;
}

/** Throws with every problem listed at once, rather than failing on the first. */
export function assertValidProjects(projects: SeedProject[]): void {
  const errors = [
    ...projects.flatMap(validateProject),
    ...validateProjectSet(projects),
  ];

  if (errors.length > 0) {
    throw new Error(`Invalid project content:\n  - ${errors.join("\n  - ")}`);
  }
}
