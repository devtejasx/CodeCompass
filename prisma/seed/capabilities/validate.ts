import type { SeedCapability } from "./types";

/**
 * Structural validation for the capability catalog.
 *
 * `CapabilitySource.ref` is a content slug rather than a foreign key, because
 * the six source kinds live in five different tables and a polymorphic pointer
 * keeps this one small table instead of five join tables. That trade is only
 * safe if a typo is loud, which is what this file is for: every ref is resolved
 * against the real content at seed time, and a slug that names nothing fails
 * the seed rather than producing a capability that can never be earned.
 *
 * The structural checks run first and need no database. The reference check
 * runs against the sets the seeder has already loaded.
 */

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateCapability(capability: SeedCapability): string[] {
  const errors: string[] = [];
  const where = capability.slug || "(missing slug)";

  if (!SLUG_PATTERN.test(capability.slug)) {
    errors.push(`[${where}] Capability slug must be kebab-case.`);
  }
  if (!capability.name) errors.push(`[${where}] Capability has no name.`);
  if ((capability.description ?? "").length < 30) {
    errors.push(`[${where}] Card description is too short.`);
  }
  if ((capability.longDescription ?? "").length < 80) {
    // The detail page's job is to say what "being able to do this" means. A
    // one-liner there would be a label, not an explanation.
    errors.push(`[${where}] longDescription must explain what the capability means.`);
  }
  if (!capability.icon) errors.push(`[${where}] Capability has no icon.`);

  const sourceCount =
    (capability.topics?.length ?? 0) +
    (capability.practiceTopics?.length ?? 0) +
    (capability.projects?.length ?? 0) +
    (capability.gitExercises?.length ?? 0) +
    (capability.aiTools?.length ?? 0) +
    (capability.aiWorkflows?.length ?? 0);

  if (sourceCount === 0) {
    // A capability with no sources can never be earned, so it would sit at
    // zero forever while implying there is something to do about it.
    errors.push(`[${where}] Capability has no evidence sources; it could never be earned.`);
  }

  for (const [field, values] of [
    ["topics", capability.topics],
    ["practiceTopics", capability.practiceTopics],
    ["projects", capability.projects],
    ["gitExercises", capability.gitExercises],
    ["aiTools", capability.aiTools],
    ["aiWorkflows", capability.aiWorkflows],
  ] as const) {
    const list = values ?? [];
    const duplicates = list.filter((slug, index) => list.indexOf(slug) !== index);
    if (duplicates.length > 0) {
      errors.push(
        `[${where}] Duplicate ${field}: ${[...new Set(duplicates)].join(", ")}.`,
      );
    }
  }

  return errors;
}

/** Every content slug that exists, so a ref naming nothing can be caught. */
export interface KnownContent {
  topicSlugs: Set<string>;
  projectSlugs: Set<string>;
  gitExerciseSlugs: Set<string>;
  aiToolSlugs: Set<string>;
  aiWorkflowSlugs: Set<string>;
}

/**
 * Resolves every source against real content.
 *
 * Reported as one list rather than throwing on the first miss, so a batch of
 * renamed slugs is fixed in one pass instead of one seed run each.
 */
export function validateReferences(
  capabilities: SeedCapability[],
  known: KnownContent,
): string[] {
  const errors: string[] = [];

  for (const capability of capabilities) {
    const check = (
      field: string,
      slugs: string[] | undefined,
      set: Set<string>,
      what: string,
    ) => {
      for (const slug of slugs ?? []) {
        if (!set.has(slug)) {
          errors.push(
            `[${capability.slug}] ${field} references "${slug}", which is not ${what}.`,
          );
        }
      }
    };

    check("topics", capability.topics, known.topicSlugs, "a topic in any roadmap");
    check(
      "practiceTopics",
      capability.practiceTopics,
      known.topicSlugs,
      "a topic in any roadmap",
    );
    check("projects", capability.projects, known.projectSlugs, "a project");
    check(
      "gitExercises",
      capability.gitExercises,
      known.gitExerciseSlugs,
      "a Git exercise",
    );
    check("aiTools", capability.aiTools, known.aiToolSlugs, "an AI tool");
    check(
      "aiWorkflows",
      capability.aiWorkflows,
      known.aiWorkflowSlugs,
      "an AI workflow",
    );
  }

  return errors;
}

/** Throws with every problem at once, so one seed run reports them all. */
export function assertValidCapabilities(
  capabilities: SeedCapability[],
  known?: KnownContent,
): void {
  const errors = capabilities.flatMap(validateCapability);

  const slugs = capabilities.map((capability) => capability.slug);
  const duplicates = [...new Set(slugs.filter((s, i) => slugs.indexOf(s) !== i))];
  if (duplicates.length > 0) {
    errors.push(`Duplicate capability slug: ${duplicates.join(", ")}.`);
  }

  if (known) errors.push(...validateReferences(capabilities, known));

  if (errors.length > 0) {
    throw new Error(`Invalid capability content:\n  - ${errors.join("\n  - ")}`);
  }
}
