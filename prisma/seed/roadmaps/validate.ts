import type { SeedRoadmap } from "./types";

/**
 * Structural validation for authored roadmaps.
 *
 * Runs before anything is written, so a malformed roadmap fails the seed loudly
 * instead of producing a half-broken path a learner would have to discover.
 *
 * Phase and topic `order` are assigned from array position by the seed, so the
 * interesting checks here are the ones arrays can't guarantee: duplicate slugs,
 * prerequisites pointing at nothing, prerequisites that come *later* than the
 * topic needing them, and cycles.
 */
export function validateRoadmap(roadmap: SeedRoadmap): string[] {
  const errors: string[] = [];
  const kind = roadmap.kind ?? "CAREER";
  const where = roadmap.careerSlug || roadmap.slug || `(missing identifier)`;

  // A roadmap is identified either by the career it belongs to or, for an
  // academy, by its own slug. Exactly one applies, and neither is optional.
  if (kind === "CAREER") {
    if (!roadmap.careerSlug) errors.push("Career roadmap is missing careerSlug.");
    if (roadmap.slug) {
      errors.push(`[${where}] Career roadmaps are found through their career; drop the slug.`);
    }
  } else {
    if (!roadmap.slug) errors.push("Academy roadmap is missing slug.");
    if (roadmap.careerSlug) {
      errors.push(`[${where}] Academy roadmaps belong to no career; drop careerSlug.`);
    }
  }

  if (!roadmap.title) errors.push(`[${where}] Roadmap is missing a title.`);
  if (!roadmap.description) errors.push(`[${where}] Roadmap is missing a description.`);
  if ((roadmap.version ?? 1) < 1) errors.push(`[${where}] Version must be >= 1.`);
  if (roadmap.phases.length === 0) {
    errors.push(`[${where}] Roadmap has no phases.`);
    return errors;
  }

  /** Position of each topic in the flattened roadmap, for the ordering check. */
  const position = new Map<string, number>();
  let cursor = 0;

  roadmap.phases.forEach((phase, phaseIndex) => {
    const phaseLabel = `${where} › phase ${phaseIndex + 1}`;

    if (!phase.title) errors.push(`[${phaseLabel}] Phase is missing a title.`);
    if (!phase.description)
      errors.push(`[${phaseLabel}] Phase is missing a description.`);
    if (!phase.whyThisComesNext) {
      // Required on purpose: the explanation is the product, not decoration.
      errors.push(`[${phaseLabel}] Phase is missing whyThisComesNext.`);
    }
    if (!phase.estimatedDuration) {
      errors.push(`[${phaseLabel}] Phase is missing estimatedDuration.`);
    }
    if (phase.topics.length === 0) {
      errors.push(`[${phaseLabel}] Phase "${phase.title}" has no topics.`);
    }

    phase.topics.forEach((topic) => {
      const topicLabel = `${phaseLabel} › ${topic.slug || "(missing slug)"}`;

      if (!topic.slug) errors.push(`[${topicLabel}] Topic is missing a slug.`);
      if (!topic.title) errors.push(`[${topicLabel}] Topic is missing a title.`);
      if (!topic.description)
        errors.push(`[${topicLabel}] Topic is missing a description.`);
      if (!topic.estimatedTime)
        errors.push(`[${topicLabel}] Topic is missing estimatedTime.`);

      if (topic.slug) {
        if (position.has(topic.slug)) {
          errors.push(`[${where}] Duplicate topic slug "${topic.slug}".`);
        } else {
          position.set(topic.slug, cursor);
        }
      }
      cursor += 1;
    });
  });

  // Prerequisites: must exist, must not be self-referential, and must appear
  // earlier in the roadmap — a prerequisite you meet later is not a sequence.
  for (const phase of roadmap.phases) {
    for (const topic of phase.topics) {
      const self = position.get(topic.slug);
      for (const prerequisite of topic.prerequisites ?? []) {
        if (prerequisite === topic.slug) {
          errors.push(
            `[${where}] Topic "${topic.slug}" lists itself as a prerequisite.`,
          );
          continue;
        }

        const at = position.get(prerequisite);
        if (at === undefined) {
          errors.push(
            `[${where}] Topic "${topic.slug}" requires "${prerequisite}", which is not in this roadmap.`,
          );
          continue;
        }

        if (self !== undefined && at > self) {
          errors.push(
            `[${where}] Topic "${topic.slug}" requires "${prerequisite}", which comes later in the roadmap.`,
          );
        }
      }
    }
  }

  errors.push(...findCycles(roadmap, where));

  return errors;
}

/**
 * Depth-first cycle detection. The "prerequisite must come earlier" rule makes
 * a cycle nearly impossible, but ordering can be edited independently of
 * prerequisites, so this stays as a backstop.
 */
function findCycles(roadmap: SeedRoadmap, where: string): string[] {
  const graph = new Map<string, string[]>();
  for (const phase of roadmap.phases) {
    for (const topic of phase.topics) {
      graph.set(topic.slug, topic.prerequisites ?? []);
    }
  }

  const state = new Map<string, "visiting" | "done">();
  const errors: string[] = [];

  const visit = (slug: string, trail: string[]): void => {
    const current = state.get(slug);
    if (current === "done") return;
    if (current === "visiting") {
      errors.push(`[${where}] Prerequisite cycle: ${[...trail, slug].join(" → ")}.`);
      return;
    }

    state.set(slug, "visiting");
    for (const next of graph.get(slug) ?? []) {
      if (graph.has(next)) visit(next, [...trail, slug]);
    }
    state.set(slug, "done");
  };

  for (const slug of graph.keys()) visit(slug, []);

  return errors;
}

/** Throws with every problem at once, so one seed run reports them all. */
export function assertValidRoadmaps(roadmaps: SeedRoadmap[]): void {
  const errors = roadmaps.flatMap(validateRoadmap);

  const slugs = roadmaps.map((r) => `${r.careerSlug}@v${r.version ?? 1}`);
  const duplicates = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (duplicates.length > 0) {
    errors.push(`Duplicate roadmap versions: ${[...new Set(duplicates)].join(", ")}.`);
  }

  if (errors.length > 0) {
    throw new Error(`Invalid roadmap content:\n  - ${errors.join("\n  - ")}`);
  }
}
