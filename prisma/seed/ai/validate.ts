import type {
  SeedAICategory,
  SeedAITool,
  SeedAIWorkflow,
  SeedCareerAITool,
} from "./types";

/**
 * Structural validation for the AI Tools Academy, run before anything is
 * written.
 *
 * The checks a type system cannot express are the ones that matter here, and
 * they fall into three groups.
 *
 * Honesty: every tool must carry a verification date and an https source, no
 * URL may be invented (only https is accepted), and a DEPRECATED tool must say
 * what happened to it. A catalog that cannot say when it was last true will
 * quietly become false.
 *
 * Completeness: `whenNotToUse` and `limitations` are required on every tool,
 * and `whatToVerify` and `commonMistakes` on every workflow. These are the
 * sections that make the difference between teaching judgement and teaching
 * copy-and-paste, so a record without them is rejected rather than shipped
 * half-useful.
 *
 * Routing: no tool slug may collide with one of the Academy's own static
 * routes, because /academy/ai-tools/compare must never be ambiguous.
 */

/** Static segments under /academy/ai-tools. A tool slug may not shadow one. */
export const RESERVED_TOOL_SLUGS = [
  "compare",
  "choose",
  "workflows",
  "responsible",
] as const;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isHttps(url: string): boolean {
  return /^https:\/\/[^\s]+$/.test(url);
}

export function validateCategory(category: SeedAICategory): string[] {
  const errors: string[] = [];
  const where = category.slug || "(missing slug)";

  if (!SLUG_PATTERN.test(category.slug)) {
    errors.push(`[${where}] Category slug must be kebab-case.`);
  }
  if (!category.name) errors.push(`[${where}] Category has no name.`);
  if ((category.description ?? "").length < 40) {
    errors.push(`[${where}] Category description is too short to be useful.`);
  }
  if (!category.icon) errors.push(`[${where}] Category has no icon.`);

  return errors;
}

export function validateTool(tool: SeedAITool, categorySlugs: Set<string>): string[] {
  const errors: string[] = [];
  const where = tool.slug || "(missing slug)";

  if (!SLUG_PATTERN.test(tool.slug)) {
    errors.push(`[${where}] Tool slug must be kebab-case.`);
  }
  if ((RESERVED_TOOL_SLUGS as readonly string[]).includes(tool.slug)) {
    // Next resolves static segments before dynamic ones, so this would not
    // crash — the tool page would simply become unreachable, silently.
    errors.push(
      `[${where}] Slug collides with a reserved Academy route (${RESERVED_TOOL_SLUGS.join(", ")}).`,
    );
  }
  if (!tool.name) errors.push(`[${where}] Tool has no name.`);
  if (!categorySlugs.has(tool.categorySlug)) {
    errors.push(`[${where}] Category "${tool.categorySlug}" is not in the taxonomy.`);
  }

  if ((tool.description ?? "").length < 30) {
    errors.push(`[${where}] Card description is too short.`);
  }
  if ((tool.longDescription ?? "").length < 80) {
    errors.push(`[${where}] longDescription is too short.`);
  }
  if ((tool.whatItIs ?? "").length < 80) {
    errors.push(`[${where}] "What is it" must actually explain the tool.`);
  }
  if ((tool.howDevelopersUseIt ?? "").length < 80) {
    errors.push(`[${where}] "How developers use it" must describe a real workflow.`);
  }
  if (!tool.primaryUse) errors.push(`[${where}] Tool has no primaryUse.`);

  if (tool.whenToUse.length === 0) errors.push(`[${where}] Tool lists no use cases.`);
  // The two sections that separate teaching from advertising.
  if (tool.whenNotToUse.length < 2) {
    errors.push(
      `[${where}] Every tool needs at least 2 "when not to use" entries — this is the section that builds judgement.`,
    );
  }
  if (tool.limitations.length < 3) {
    errors.push(
      `[${where}] Every tool has limitations; at least 3 must be stated. None is not a credible answer.`,
    );
  }

  if (!isHttps(tool.officialUrl)) {
    errors.push(`[${where}] officialUrl must be an https URL.`);
  }
  if (tool.docsUrl && !isHttps(tool.docsUrl)) {
    errors.push(`[${where}] docsUrl must be an https URL.`);
  }

  // Freshness. A record that cannot say when it was checked cannot be trusted
  // later, and a fake date would be worse than none.
  if (!ISO_DATE.test(tool.verifiedOn)) {
    errors.push(`[${where}] verifiedOn must be an ISO date (YYYY-MM-DD).`);
  } else if (Number.isNaN(Date.parse(tool.verifiedOn))) {
    errors.push(`[${where}] verifiedOn is not a real date.`);
  }
  if (!isHttps(tool.verificationSource)) {
    errors.push(`[${where}] verificationSource must be the https URL that was checked.`);
  }

  if (tool.status === "DEPRECATED" && !tool.statusNote) {
    errors.push(
      `[${where}] A DEPRECATED tool must explain what happened to it — a badge alone tells a learner nothing.`,
    );
  }
  if (tool.supersededBySlug && tool.status !== "DEPRECATED") {
    errors.push(`[${where}] supersededBySlug is only meaningful on a DEPRECATED tool.`);
  }

  if (tool.environments.length === 0) {
    errors.push(`[${where}] Tool declares no environment, so the decision helper cannot place it.`);
  }
  if (tool.capabilities.length === 0) {
    errors.push(`[${where}] Tool lists no capabilities.`);
  }
  if (tool.useCases.length === 0) {
    errors.push(`[${where}] Tool maps to no use case, so nothing will ever recommend it.`);
  }

  const seenUseCases = new Set<string>();
  for (const entry of tool.useCases) {
    if (seenUseCases.has(entry.useCase)) {
      errors.push(`[${where}] Duplicate use case "${entry.useCase}".`);
    }
    seenUseCases.add(entry.useCase);
    if (!entry.note) {
      errors.push(`[${where}] Use case "${entry.useCase}" has no explanation.`);
    }
  }

  tool.resources.forEach((resource, index) => {
    const at = `${where} › resource ${index + 1}`;
    if (!resource.title) errors.push(`[${at}] Resource has no title.`);
    if (!resource.source) errors.push(`[${at}] Resource has no source name.`);
    if (!isHttps(resource.url)) errors.push(`[${at}] Resource URL must be an https link.`);
  });

  const path = tool.learningPath;
  if (!SLUG_PATTERN.test(path.slug)) {
    errors.push(`[${where}] Learning path slug must be kebab-case.`);
  }
  if (path.lessons.length === 0) {
    errors.push(`[${where}] Learning path has no lessons.`);
  }
  path.lessons.forEach((lesson, index) => {
    const at = `${where} › path lesson ${index + 1}`;
    if (!lesson.title) errors.push(`[${at}] Lesson has no title.`);
    if (!lesson.description) errors.push(`[${at}] Lesson has no description.`);
    if (!lesson.estimatedTime) errors.push(`[${at}] Lesson has no estimatedTime.`);
  });

  return errors;
}

export function validateWorkflow(workflow: SeedAIWorkflow, toolSlugs: Set<string>): string[] {
  const errors: string[] = [];
  const where = workflow.slug || "(missing slug)";

  if (!SLUG_PATTERN.test(workflow.slug)) {
    errors.push(`[${where}] Workflow slug must be kebab-case.`);
  }
  if (!workflow.title) errors.push(`[${where}] Workflow has no title.`);
  if ((workflow.goal ?? "").length < 20) errors.push(`[${where}] Workflow goal is too vague.`);
  if ((workflow.summary ?? "").length < 60) {
    errors.push(`[${where}] Workflow summary is too short.`);
  }

  if (workflow.steps.length < 3) {
    errors.push(`[${where}] A workflow with fewer than 3 steps is not a workflow.`);
  }
  workflow.steps.forEach((step, index) => {
    const at = `${where} › step ${index + 1}`;
    if (!step.title) errors.push(`[${at}] Step has no title.`);
    if ((step.detail ?? "").length < 30) errors.push(`[${at}] Step detail is too thin.`);
  });

  // The point of the library: AI is a step inside a process the human owns.
  if (!workflow.steps.some((step) => step.isHumanStep === false)) {
    errors.push(
      `[${where}] No step is marked as the AI step, so the division of labour is invisible.`,
    );
  }
  if (!workflow.steps.some((step) => step.isHumanStep !== false)) {
    errors.push(`[${where}] Every step is an AI step. That is not a developer workflow.`);
  }

  if (workflow.prompts.length === 0) {
    errors.push(`[${where}] Workflow has no example prompt.`);
  }
  workflow.prompts.forEach((prompt, index) => {
    const at = `${where} › prompt ${index + 1}`;
    if (!prompt.label) errors.push(`[${at}] Prompt has no label.`);
    if (!prompt.goal) errors.push(`[${at}] Prompt has no goal.`);
    if (!prompt.context) errors.push(`[${at}] Prompt has no context.`);
    if (!prompt.request) errors.push(`[${at}] Prompt has no request.`);
    if ((prompt.whyItWorks ?? "").length < 60) {
      // A prompt without its explanation is a magic string, which teaches
      // nothing transferable.
      errors.push(`[${at}] Prompt must explain why it works, at length.`);
    }
  });

  if (workflow.whatToVerify.length < 2) {
    errors.push(`[${where}] Workflow must say what to verify — at least 2 things.`);
  }
  if (workflow.commonMistakes.length < 2) {
    errors.push(`[${where}] Workflow must list at least 2 common mistakes.`);
  }

  if (workflow.toolSlugs.length === 0) {
    errors.push(`[${where}] Workflow names no tools it is realistic with.`);
  }
  for (const slug of workflow.toolSlugs) {
    if (!toolSlugs.has(slug)) {
      errors.push(`[${where}] References tool "${slug}", which is not in the catalog.`);
    }
  }

  return errors;
}

export function validateCareerLinks(
  entry: SeedCareerAITool,
  toolSlugs: Set<string>,
): string[] {
  const errors: string[] = [];
  const where = entry.careerSlug || "(missing careerSlug)";

  if (entry.tools.length === 0) {
    errors.push(`[${where}] Career lists no AI tools; omit the entry instead.`);
  }
  if (entry.tools.length > 6) {
    // Twelve recommendations is the same as none.
    errors.push(`[${where}] ${entry.tools.length} recommendations is too many to be useful.`);
  }

  const seen = new Set<string>();
  for (const link of entry.tools) {
    if (!toolSlugs.has(link.toolSlug)) {
      errors.push(`[${where}] References tool "${link.toolSlug}", which is not in the catalog.`);
    }
    if (seen.has(link.toolSlug)) {
      errors.push(`[${where}] Tool "${link.toolSlug}" is listed twice.`);
    }
    seen.add(link.toolSlug);

    if ((link.reason ?? "").length < 30) {
      // An unexplained recommendation is a logo wall.
      errors.push(`[${where}] Tool "${link.toolSlug}" has no real reason attached.`);
    }
  }

  return errors;
}

/** Throws with every problem at once, so one seed run reports them all. */
export function assertValidAIContent({
  categories,
  tools,
  workflows,
  careerTools,
}: {
  categories: SeedAICategory[];
  tools: SeedAITool[];
  workflows: SeedAIWorkflow[];
  careerTools: SeedCareerAITool[];
}): void {
  const errors: string[] = [];

  const categorySlugs = new Set(categories.map((category) => category.slug));
  if (categorySlugs.size !== categories.length) {
    errors.push("Duplicate category slug.");
  }
  errors.push(...categories.flatMap(validateCategory));

  const toolSlugs = new Set(tools.map((tool) => tool.slug));
  if (toolSlugs.size !== tools.length) {
    const slugs = tools.map((tool) => tool.slug);
    const duplicates = [...new Set(slugs.filter((s, i) => slugs.indexOf(s) !== i))];
    errors.push(`Duplicate tool slug: ${duplicates.join(", ")}.`);
  }
  errors.push(...tools.flatMap((tool) => validateTool(tool, categorySlugs)));

  const pathSlugs = tools.map((tool) => tool.learningPath.slug);
  const duplicatePaths = [...new Set(pathSlugs.filter((s, i) => pathSlugs.indexOf(s) !== i))];
  if (duplicatePaths.length > 0) {
    errors.push(`Duplicate learning path slug: ${duplicatePaths.join(", ")}.`);
  }

  // A category nobody is in produces a filter that returns nothing, which reads
  // to a learner as a broken page rather than an empty one.
  for (const category of categories) {
    if (!tools.some((tool) => tool.categorySlug === category.slug)) {
      errors.push(`Category "${category.slug}" has no tools in it.`);
    }
  }

  // A superseded tool must point at something real, or the "see instead" link
  // goes nowhere.
  for (const tool of tools) {
    if (tool.supersededBySlug && !toolSlugs.has(tool.supersededBySlug)) {
      errors.push(
        `[${tool.slug}] supersededBySlug "${tool.supersededBySlug}" is not in the catalog.`,
      );
    }
  }

  const workflowSlugs = new Set(workflows.map((workflow) => workflow.slug));
  if (workflowSlugs.size !== workflows.length) {
    errors.push("Duplicate workflow slug.");
  }
  errors.push(...workflows.flatMap((workflow) => validateWorkflow(workflow, toolSlugs)));

  const careerSlugs = new Set(careerTools.map((entry) => entry.careerSlug));
  if (careerSlugs.size !== careerTools.length) {
    errors.push("A career appears twice in the AI tool recommendations.");
  }
  errors.push(...careerTools.flatMap((entry) => validateCareerLinks(entry, toolSlugs)));

  if (errors.length > 0) {
    throw new Error(`Invalid AI Tools Academy content:\n  - ${errors.join("\n  - ")}`);
  }
}
