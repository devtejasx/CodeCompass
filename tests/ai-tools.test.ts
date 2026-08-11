import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.fn();
vi.mock("@/auth", () => ({ auth, signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

class RedirectError extends Error {
  constructor(public target: string) {
    super(`REDIRECT:${target}`);
  }
}
vi.mock("next/navigation", () => ({
  redirect: (target: string) => {
    throw new RedirectError(target);
  },
}));

const {
  listTools,
  listCategories,
  getToolDetail,
  getCareerRecommendations,
  listWorkflows,
  getWorkflowDetail,
  getComparison,
  getAIProgressSummary,
} = await import("@/lib/ai-tools/queries");

const { filterTools, categoryCounts, matchesFilters, EMPTY_FILTERS } =
  await import("@/lib/ai-tools/filter");
const { decide, environmentsFor, reasonFor } = await import("@/lib/ai-tools/decide");
const { parseComparisonSlugs, MAX_COMPARE } = await import("@/lib/ai-tools/compare");
const { toolPercent, syncToolProgress, syncToolsForTopic } =
  await import("@/lib/ai-tools/progress");
const { formatVerified, USE_CASE_LABEL, STATUS_LABEL } =
  await import("@/lib/ai-tools/labels");
const { aiToolIcon } = await import("@/lib/ai-tools/icons");

const { startTool, setWorkflowComplete } = await import("@/app/actions/ai-tools");
const { submitKnowledgeCheck } = await import("@/app/actions/learn");

const { requireUser } = await import("@/lib/session");
const { db } = await import("@/lib/db");

// ── Helpers ────────────────────────────────────────────────────────────────

async function makeUser(email = "ai-learner@example.com") {
  return db.user.create({
    data: {
      name: "Test AI Learner",
      email,
      passwordHash: "$2b$12$abcdefghijklmnopqrstuv",
      profile: { create: { onboardingCompleted: true } },
    },
  });
}

function signedInAs(id: string) {
  auth.mockResolvedValue({ user: { id } });
}

/** Marks a topic complete the same way the learning system does. */
async function completeTopic(userId: string, topicSlug: string) {
  const topic = await db.topic.findUniqueOrThrow({
    where: { slug: topicSlug },
    select: { id: true },
  });

  await db.userTopicProgress.upsert({
    where: { userId_topicId: { userId, topicId: topic.id } },
    create: {
      userId,
      topicId: topic.id,
      status: "COMPLETED",
      percentComplete: 100,
      completedAt: new Date(),
    },
    update: { status: "COMPLETED", percentComplete: 100 },
  });

  return topic.id;
}

async function chooseCareer(userId: string, slug: string) {
  const career = await db.career.findUniqueOrThrow({
    where: { slug },
    select: { id: true },
  });
  await db.profile.update({
    where: { userId },
    data: { selectedCareerId: career.id },
  });
  return career.id;
}

beforeEach(() => {
  auth.mockReset();
});

// ── 1. Catalog ─────────────────────────────────────────────────────────────

describe("AI tool catalog", () => {
  it("loads every seeded tool with its category", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    expect(tools.length).toBeGreaterThanOrEqual(15);
    expect(tools.every((tool) => tool.category.name.length > 0)).toBe(true);
    expect(tools.every((tool) => tool.slug.length > 0)).toBe(true);
  });

  it("gives every tool the sections that teach judgement, not just features", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    for (const summary of tools) {
      const tool = await getToolDetail(summary.slug, user.id);

      // "When not to use" and "limitations" are what separate an education
      // from a brochure, so every record must carry them.
      expect(tool!.whenNotToUse.length, tool!.slug).toBeGreaterThanOrEqual(2);
      expect(tool!.limitations.length, tool!.slug).toBeGreaterThanOrEqual(3);
      expect(tool!.whenToUse.length, tool!.slug).toBeGreaterThan(0);
      expect(tool!.whatItIs.length, tool!.slug).toBeGreaterThan(80);
      expect(tool!.howDevelopersUseIt.length, tool!.slug).toBeGreaterThan(80);
    }
  });

  it("orders categories and leaves none of them empty", async () => {
    const categories = await listCategories();

    expect(categories.length).toBeGreaterThanOrEqual(6);
    // An empty category renders a filter that returns nothing, which reads as
    // a broken page rather than an empty one.
    expect(categories.every((category) => category._count.tools > 0)).toBe(true);
  });

  it("records when each tool was last verified, and against what", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    for (const summary of tools) {
      const tool = await getToolDetail(summary.slug, user.id);
      expect(tool!.lastVerifiedAt, tool!.slug).not.toBeNull();
      expect(tool!.verificationSource, tool!.slug).toMatch(/^https:\/\//);
    }
  });

  it("never invents a URL — every external link is https", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    for (const summary of tools) {
      const tool = await getToolDetail(summary.slug, user.id);

      expect(tool!.officialUrl, tool!.slug).toMatch(/^https:\/\//);
      if (tool!.docsUrl) expect(tool!.docsUrl, tool!.slug).toMatch(/^https:\/\//);

      for (const resource of tool!.resources) {
        expect(resource.url, `${tool!.slug} → ${resource.title}`).toMatch(
          /^https:\/\//,
        );
        // The source is named so a reader knows where a link goes first.
        expect(resource.source.length).toBeGreaterThan(0);
      }
    }
  });

  it("names no tool after a reserved Academy route", async () => {
    const slugs = (await db.aITool.findMany({ select: { slug: true } })).map(
      (tool) => tool.slug,
    );

    // Next resolves static segments first, so a collision would not crash —
    // the tool page would silently become unreachable.
    for (const reserved of ["compare", "choose", "workflows", "responsible"]) {
      expect(slugs).not.toContain(reserved);
    }
  });
});

// ── 2. Search ──────────────────────────────────────────────────────────────

describe("tool search", () => {
  it("is case-insensitive", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    const lower = filterTools(tools, { ...EMPTY_FILTERS, query: "chatgpt" });
    const upper = filterTools(tools, { ...EMPTY_FILTERS, query: "ChatGPT" });
    const mixed = filterTools(tools, { ...EMPTY_FILTERS, query: "cHaTgPt" });

    expect(lower).toHaveLength(upper.length);
    expect(lower).toHaveLength(mixed.length);
    expect(lower.some((tool) => tool.slug === "chatgpt")).toBe(true);
  });

  it("searches past the name into what a tool is actually for", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    // None of these words is a product name.
    for (const term of ["coding", "research", "automation", "design"]) {
      const results = filterTools(tools, { ...EMPTY_FILTERS, query: term });
      expect(results.length, term).toBeGreaterThan(0);
    }
  });

  it("finds a superseded tool by its old name", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    // The whole reason renamed tools are kept rather than deleted. Searching
    // the old name finds both the historical record and the successor that
    // names it, which is exactly the trail somebody should be able to follow.
    const results = filterTools(tools, { ...EMPTY_FILTERS, query: "windsurf" });
    const slugs = results.map((tool) => tool.slug);

    expect(slugs).toContain("windsurf");
    expect(slugs).toContain("devin-desktop");
    expect(results.find((tool) => tool.slug === "windsurf")!.status).toBe(
      "DEPRECATED",
    );
  });

  it("returns nothing for a term that matches nothing, without throwing", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    expect(
      filterTools(tools, { ...EMPTY_FILTERS, query: "zzzz-not-a-tool" }),
    ).toHaveLength(0);
  });

  it("ignores surrounding whitespace", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    expect(filterTools(tools, { ...EMPTY_FILTERS, query: "   " })).toHaveLength(
      tools.length,
    );
    expect(
      filterTools(tools, { ...EMPTY_FILTERS, query: "  cursor  " }).some(
        (tool) => tool.slug === "cursor",
      ),
    ).toBe(true);
  });
});

// ── 3. Filters ─────────────────────────────────────────────────────────────

describe("tool filters", () => {
  it("filters by category", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    const assistants = filterTools(tools, {
      ...EMPTY_FILTERS,
      category: "ai-assistants",
    });

    expect(assistants.length).toBeGreaterThan(0);
    expect(assistants.every((tool) => tool.category.slug === "ai-assistants")).toBe(
      true,
    );
  });

  it("filters by use case, difficulty, environment and status", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    const debugging = filterTools(tools, { ...EMPTY_FILTERS, useCase: "DEBUG" });
    expect(debugging.every((tool) => tool.useCaseKinds.includes("DEBUG"))).toBe(true);
    expect(debugging.length).toBeGreaterThan(0);

    const beginner = filterTools(tools, { ...EMPTY_FILTERS, difficulty: "BEGINNER" });
    expect(beginner.every((tool) => tool.difficulty === "BEGINNER")).toBe(true);

    const inEditor = filterTools(tools, { ...EMPTY_FILTERS, environment: "IDE" });
    expect(inEditor.every((tool) => tool.environments.includes("IDE"))).toBe(true);
    expect(inEditor.length).toBeGreaterThan(0);

    const deprecated = filterTools(tools, { ...EMPTY_FILTERS, status: "DEPRECATED" });
    expect(deprecated.every((tool) => tool.status === "DEPRECATED")).toBe(true);
  });

  it("combines filters rather than replacing them", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    const combined = filterTools(tools, {
      ...EMPTY_FILTERS,
      useCase: "WRITE_CODE",
      environment: "IDE",
    });

    expect(
      combined.every(
        (tool) =>
          tool.useCaseKinds.includes("WRITE_CODE") && tool.environments.includes("IDE"),
      ),
    ).toBe(true);
  });

  it("counts categories against the other filters, not the current view", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    const counts = categoryCounts(tools, {
      ...EMPTY_FILTERS,
      category: "ai-assistants",
    });

    // The category filter is ignored when counting, so the counts answer
    // "what would I get if I clicked this?".
    expect(counts.ALL).toBe(tools.length);
    expect(counts["ai-coding-assistants"]).toBeGreaterThan(0);
  });

  it("matchesFilters agrees with filterTools on a single tool", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);
    const cursor = tools.find((tool) => tool.slug === "cursor")!;

    expect(matchesFilters(cursor, { ...EMPTY_FILTERS, query: "cursor" })).toBe(true);
    expect(matchesFilters(cursor, { ...EMPTY_FILTERS, category: "ai-automation" })).toBe(
      false,
    );
  });
});

// ── 4. Detail page ─────────────────────────────────────────────────────────

describe("tool detail", () => {
  it("loads one tool in full", async () => {
    const user = await makeUser();
    const tool = await getToolDetail("cursor", user.id);

    expect(tool).not.toBeNull();
    expect(tool!.name).toBe("Cursor");
    expect(tool!.capabilities.length).toBeGreaterThan(0);
    expect(tool!.resources.length).toBeGreaterThan(0);
    expect(tool!.learningPaths.length).toBe(1);
  });

  it("returns null for a slug that is not in the catalog", async () => {
    const user = await makeUser();
    expect(await getToolDetail("not-a-real-tool", user.id)).toBeNull();
  });

  it("resolves a superseded tool's successor so the link can be named", async () => {
    const user = await makeUser();
    const tool = await getToolDetail("windsurf", user.id);

    expect(tool!.status).toBe("DEPRECATED");
    expect(tool!.statusNote).toBeTruthy();
    expect(tool!.successor?.slug).toBe("devin-desktop");
    expect(tool!.successor?.name).toBe("Devin Desktop");
  });
});

// ── 5. Learning paths ──────────────────────────────────────────────────────

describe("learning paths", () => {
  it("gives every tool a path whose steps point at real lessons", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    for (const summary of tools) {
      const tool = await getToolDetail(summary.slug, user.id);
      const path = tool!.learningPaths[0];

      expect(path, tool!.slug).toBeDefined();
      expect(path.lessons.length, tool!.slug).toBeGreaterThan(0);
      expect(
        path.lessons.every((lesson) => lesson.hasLesson),
        `${tool!.slug} has a path step with no lesson`,
      ).toBe(true);
    }
  });

  it("does not give every tool the same curriculum", async () => {
    const user = await makeUser();

    const chatgpt = await getToolDetail("chatgpt", user.id);
    const n8n = await getToolDetail("n8n", user.id);
    const openrouter = await getToolDetail("openrouter", user.id);

    const slugs = (tool: NonNullable<typeof chatgpt>) =>
      tool.learningPaths[0].lessons.map((lesson) => lesson.topicSlug).join(",");

    expect(slugs(chatgpt!)).not.toBe(slugs(n8n!));
    expect(slugs(n8n!)).not.toBe(slugs(openrouter!));
  });

  it("points at the first unfinished step", async () => {
    const user = await makeUser();

    const before = await getToolDetail("chatgpt", user.id);
    const firstSlug = before!.learningPaths[0].lessons[0].topicSlug;
    expect(before!.nextLesson?.topicSlug).toBe(firstSlug);

    await completeTopic(user.id, firstSlug!);

    const after = await getToolDetail("chatgpt", user.id);
    expect(after!.nextLesson?.topicSlug).not.toBe(firstSlug);
  });
});

// ── 6. Progress ────────────────────────────────────────────────────────────

describe("AI progress", () => {
  it("computes a percentage that cannot leave 0–100", () => {
    expect(toolPercent({ total: 0, completed: 0 })).toBe(0);
    expect(toolPercent({ total: 4, completed: 0 })).toBe(0);
    expect(toolPercent({ total: 4, completed: 2 })).toBe(50);
    expect(toolPercent({ total: 4, completed: 4 })).toBe(100);
    // A miscount can never produce a nonsense figure.
    expect(toolPercent({ total: 4, completed: 9 })).toBe(100);
    expect(toolPercent({ total: 0, completed: 5 })).toBe(0);
  });

  it("persists progress and recomputes it from topics", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    expect((await startTool({ toolSlug: "perplexity" })).ok).toBe(true);

    const started = await getToolDetail("perplexity", user.id);
    expect(started!.progress.status).toBe("IN_PROGRESS");
    expect(started!.progress.percentComplete).toBe(0);

    for (const lesson of started!.learningPaths[0].lessons) {
      await completeTopic(user.id, lesson.topicSlug!);
    }
    await syncToolProgress({
      userId: user.id,
      toolId: (await db.aITool.findUniqueOrThrow({
        where: { slug: "perplexity" },
        select: { id: true },
      })).id,
    });

    const done = await getToolDetail("perplexity", user.id);
    expect(done!.progress.percentComplete).toBe(100);
    expect(done!.progress.status).toBe("COMPLETED");
    expect(done!.nextLesson).toBeNull();
  });

  it("keeps the stored projection in step with the derived figure", async () => {
    const user = await makeUser();
    const tool = await db.aITool.findUniqueOrThrow({
      where: { slug: "perplexity" },
      select: { id: true },
    });

    const detail = await getToolDetail("perplexity", user.id);
    await completeTopic(user.id, detail!.learningPaths[0].lessons[0].topicSlug!);
    await syncToolProgress({ userId: user.id, toolId: tool.id });

    const stored = await db.userAIToolProgress.findUniqueOrThrow({
      where: { userId_toolId: { userId: user.id, toolId: tool.id } },
    });
    const derived = await getToolDetail("perplexity", user.id);

    // The row is a projection of the topics, so the two can never disagree.
    expect(stored.percentComplete).toBe(derived!.progress.percentComplete);
  });

  it("moves every tool that teaches a shared topic, whichever door was used", async () => {
    const user = await makeUser();

    // Both paths include the prompting lesson.
    const topicId = await completeTopic(user.id, "ai-academy-prompting-fundamentals");
    const touched = await syncToolsForTopic({ userId: user.id, topicId });

    expect(touched).toBeGreaterThan(1);

    const chatgpt = await getToolDetail("chatgpt", user.id);
    const cursor = await getToolDetail("cursor", user.id);

    expect(chatgpt!.progress.percentComplete).toBeGreaterThan(0);
    expect(cursor!.progress.percentComplete).toBeGreaterThan(0);
  });

  it("syncs tool progress when a knowledge check is passed from the lesson page", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const lesson = await db.lesson.findFirstOrThrow({
      where: { topic: { slug: "ai-academy-what-ai-tools-are" } },
      select: {
        topicId: true,
        knowledgeChecks: {
          orderBy: { order: "asc" },
          select: { id: true, options: { select: { id: true, isCorrect: true } } },
        },
      },
    });

    const answers = lesson.knowledgeChecks.map((check) => ({
      questionId: check.id,
      optionId: check.options.find((option) => option.isCorrect)!.id,
    }));

    const result = await submitKnowledgeCheck({ topicId: lesson.topicId, answers });
    expect(result.ok).toBe(true);
    expect(result.passed).toBe(true);

    // The Academy learned about it without the learner visiting a tool page.
    const chatgpt = await getToolDetail("chatgpt", user.id);
    expect(chatgpt!.progress.percentComplete).toBeGreaterThan(0);
  });

  it("summarises progress for the dashboard", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const before = await getAIProgressSummary(user.id);
    expect(before.toolsLearned).toBe(0);
    expect(before.toolsInProgress).toBe(0);
    expect(before.totalTools).toBeGreaterThan(0);
    expect(before.current).toBeNull();

    await startTool({ toolSlug: "perplexity" });

    const after = await getAIProgressSummary(user.id);
    expect(after.toolsInProgress).toBe(1);
    expect(after.current?.slug).toBe("perplexity");
  });

  it("excludes superseded tools from the total worth learning", async () => {
    const user = await makeUser();
    const summary = await getAIProgressSummary(user.id);
    const all = await db.aITool.count();

    expect(summary.totalTools).toBeLessThan(all);
  });

  it("refuses every write when signed out", async () => {
    auth.mockResolvedValue(null);

    expect((await startTool({ toolSlug: "chatgpt" })).ok).toBe(false);
    expect(
      (await setWorkflowComplete({ workflowSlug: "debug-a-bug", completed: true })).ok,
    ).toBe(false);
  });

  it("rejects a tool or workflow that does not exist", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    expect((await startTool({ toolSlug: "made-up-tool" })).ok).toBe(false);
    expect((await startTool({ toolSlug: "" })).ok).toBe(false);
    expect(
      (await setWorkflowComplete({ workflowSlug: "nope", completed: true })).ok,
    ).toBe(false);
  });
});

// ── 7. Privacy ─────────────────────────────────────────────────────────────

describe("progress privacy", () => {
  it("keeps two learners' AI progress separate", async () => {
    const alice = await makeUser("alice-ai@example.com");
    const bob = await makeUser("bob-ai@example.com");

    signedInAs(alice.id);
    await startTool({ toolSlug: "cursor" });
    await setWorkflowComplete({ workflowSlug: "debug-a-bug", completed: true });

    const alicesView = await getToolDetail("cursor", alice.id);
    const bobsView = await getToolDetail("cursor", bob.id);

    expect(alicesView!.progress.status).toBe("IN_PROGRESS");
    expect(bobsView!.progress.status).toBe("NOT_STARTED");

    expect((await getAIProgressSummary(bob.id)).toolsInProgress).toBe(0);
    expect((await listWorkflows(bob.id)).every((w) => w.completedAt === null)).toBe(
      true,
    );
  });

  it("only ever writes progress for the session user", async () => {
    const alice = await makeUser("alice-write@example.com");
    const bob = await makeUser("bob-write@example.com");

    signedInAs(bob.id);
    await startTool({ toolSlug: "claude" });

    expect(
      await db.userAIToolProgress.count({ where: { userId: alice.id } }),
    ).toBe(0);
    expect(await db.userAIToolProgress.count({ where: { userId: bob.id } })).toBe(1);
  });
});

// ── 8. Career recommendations ──────────────────────────────────────────────

describe("career recommendations", () => {
  it("returns nothing until a career is chosen, rather than guessing", async () => {
    const user = await makeUser();
    const result = await getCareerRecommendations(user.id);

    expect(result.career).toBeNull();
    expect(result.recommendations).toHaveLength(0);
  });

  it("recommends different tools for different careers, each with a reason", async () => {
    const frontend = await makeUser("fe@example.com");
    const dataScientist = await makeUser("ds@example.com");

    await chooseCareer(frontend.id, "frontend-developer");
    await chooseCareer(dataScientist.id, "data-scientist");

    const feResult = await getCareerRecommendations(frontend.id);
    const dsResult = await getCareerRecommendations(dataScientist.id);

    expect(feResult.career!.slug).toBe("frontend-developer");
    expect(feResult.recommendations.length).toBeGreaterThan(0);

    const feSlugs = feResult.recommendations.map((entry) => entry.tool.slug);
    const dsSlugs = dsResult.recommendations.map((entry) => entry.tool.slug);
    expect(feSlugs).not.toEqual(dsSlugs);

    // A recommendation without a reason is a logo wall.
    for (const entry of [...feResult.recommendations, ...dsResult.recommendations]) {
      expect(entry.reason.length).toBeGreaterThan(29);
      expect(USE_CASE_LABEL[entry.useCase]).toBeTruthy();
    }
  });

  it("recommends a UI generator to a frontend developer and not to a data scientist", async () => {
    const frontend = await makeUser("fe2@example.com");
    const dataScientist = await makeUser("ds2@example.com");
    await chooseCareer(frontend.id, "frontend-developer");
    await chooseCareer(dataScientist.id, "data-scientist");

    const feSlugs = (await getCareerRecommendations(frontend.id)).recommendations.map(
      (entry) => entry.tool.slug,
    );
    const dsSlugs = (
      await getCareerRecommendations(dataScientist.id)
    ).recommendations.map((entry) => entry.tool.slug);

    expect(feSlugs).toContain("v0");
    expect(dsSlugs).not.toContain("v0");
    expect(dsSlugs).toContain("notebooklm");
  });

  it("respects the requested limit", async () => {
    const user = await makeUser();
    await chooseCareer(user.id, "ai-engineer");

    const result = await getCareerRecommendations(user.id, 2);
    expect(result.recommendations).toHaveLength(2);
  });

  it("never recommends a superseded tool on any career path", async () => {
    const links = await db.careerAITool.findMany({
      select: { tool: { select: { slug: true, status: true } } },
    });

    expect(links.length).toBeGreaterThan(0);
    expect(links.every((link) => link.tool.status !== "DEPRECATED")).toBe(true);
  });
});

// ── 9. Comparison ──────────────────────────────────────────────────────────

describe("tool comparison", () => {
  it("compares two tools and preserves the requested order", async () => {
    const compared = await getComparison(["cursor", "github-copilot"]);

    expect(compared).toHaveLength(2);
    expect(compared.map((tool) => tool.slug)).toEqual(["cursor", "github-copilot"]);
    expect(compared.every((tool) => tool.capabilities.length > 0)).toBe(true);
    expect(compared.every((tool) => tool.limitations.length > 0)).toBe(true);
  });

  it("compares three tools", async () => {
    const compared = await getComparison(["chatgpt", "claude", "gemini"]);
    expect(compared).toHaveLength(3);
  });

  it("drops a slug that does not exist rather than rendering a blank column", async () => {
    const compared = await getComparison(["cursor", "not-a-tool"]);

    expect(compared).toHaveLength(1);
    expect(compared[0].slug).toBe("cursor");
  });

  it("returns nothing for an empty selection", async () => {
    expect(await getComparison([])).toHaveLength(0);
  });

  it("parses the ?tools= parameter defensively", () => {
    // Regression: MAX_COMPARE originally lived in the client picker module, so
    // the server page received a client *reference* rather than the number 3
    // and slice(0, MAX_COMPARE) silently returned nothing — the table rendered
    // empty with no error anywhere. The cap now lives in a neutral module.
    expect(MAX_COMPARE).toBe(3);
    expect(typeof MAX_COMPARE).toBe("number");

    expect(parseComparisonSlugs("cursor,github-copilot")).toEqual([
      "cursor",
      "github-copilot",
    ]);
    expect(parseComparisonSlugs(undefined)).toEqual([]);
    expect(parseComparisonSlugs("")).toEqual([]);
    expect(parseComparisonSlugs(" cursor , claude ")).toEqual(["cursor", "claude"]);
    expect(parseComparisonSlugs("cursor,,claude")).toEqual(["cursor", "claude"]);
    // Duplicates collapse rather than rendering two identical columns.
    expect(parseComparisonSlugs("cursor,cursor")).toEqual(["cursor"]);
    // A hand-edited URL narrows the selection; it never runs an unbounded query.
    expect(parseComparisonSlugs("a,b,c,d,e,f")).toHaveLength(MAX_COMPARE);
  });

  it("carries no ranking or score of any kind", async () => {
    const compared = await getComparison(["cursor", "github-copilot"]);

    // Different tools suit different purposes; a winner column would be a
    // claim CodeCompass has no basis to make.
    for (const tool of compared) {
      expect(tool).not.toHaveProperty("score");
      expect(tool).not.toHaveProperty("rank");
      expect(tool).not.toHaveProperty("rating");
    }
  });
});

// ── 10. Decision helper ────────────────────────────────────────────────────

describe("decision helper", () => {
  it("asks for a goal before answering", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    const result = decide({ tools, answers: { useCase: null, environment: null } });

    expect(result.tools).toHaveLength(0);
    expect(result.explanation.length).toBeGreaterThan(0);
  });

  it("narrows by goal, then by environment", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    const byGoal = decide({
      tools,
      answers: { useCase: "WRITE_CODE", environment: null },
    });
    expect(byGoal.tools.length).toBeGreaterThan(0);

    const byBoth = decide({
      tools,
      answers: { useCase: "WRITE_CODE", environment: "IDE" },
    });
    expect(byBoth.tools.every((tool) => tool.environments.includes("IDE"))).toBe(true);
    expect(byBoth.tools.length).toBeLessThanOrEqual(byGoal.tools.length);
  });

  it("recommends editor tools for writing code in an IDE", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    const slugs = decide({
      tools,
      answers: { useCase: "WRITE_CODE", environment: "IDE" },
    }).tools.map((tool) => tool.slug);

    expect(slugs).toContain("cursor");
    expect(slugs).toContain("github-copilot");
  });

  it("recommends research tools for researching in a browser", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    const slugs = decide({
      tools,
      answers: { useCase: "RESEARCH", environment: "BROWSER" },
    }).tools.map((tool) => tool.slug);

    expect(slugs).toContain("perplexity");
  });

  it("is deterministic — the same answers always give the same shortlist", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);
    const answers = { useCase: "DEBUG" as const, environment: "IDE" as const };

    const first = decide({ tools, answers }).tools.map((tool) => tool.slug);
    const second = decide({ tools, answers }).tools.map((tool) => tool.slug);
    const third = decide({ tools, answers }).tools.map((tool) => tool.slug);

    expect(first).toEqual(second);
    expect(second).toEqual(third);
  });

  it("never recommends a superseded tool", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    for (const useCase of ["WRITE_CODE", "DEBUG", "REFACTOR"] as const) {
      const result = decide({ tools, answers: { useCase, environment: null } });
      expect(result.tools.every((tool) => tool.status !== "DEPRECATED")).toBe(true);
    }
  });

  it("widens rather than returning nothing, and says that it did", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    // Nothing designs interfaces from a terminal.
    const result = decide({
      tools,
      answers: { useCase: "DESIGN_UI", environment: "TERMINAL" },
    });

    expect(result.relaxedEnvironment).toBe(true);
    expect(result.tools.length).toBeGreaterThan(0);
    expect(result.explanation).toMatch(/wherever they run/i);
  });

  it("only offers environments that lead somewhere", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);

    for (const environment of environmentsFor(tools, "DEBUG")) {
      const result = decide({
        tools,
        answers: { useCase: "DEBUG", environment },
      });
      expect(result.relaxedEnvironment, environment).toBe(false);
      expect(result.tools.length, environment).toBeGreaterThan(0);
    }
  });

  it("explains why a tool appeared, using its own authored note", async () => {
    const user = await makeUser();
    const tools = await listTools(user.id);
    const cursor = tools.find((tool) => tool.slug === "cursor")!;

    expect(reasonFor(cursor, "WRITE_CODE")).toBeTruthy();
    expect(reasonFor(cursor, null)).toBeNull();
    // A use case this tool does not claim gets no invented reason.
    expect(reasonFor(cursor, "AUTOMATE")).toBeNull();
  });
});

// ── 11. Workflow library ───────────────────────────────────────────────────

describe("workflow library", () => {
  it("loads every workflow with its steps and tools", async () => {
    const user = await makeUser();
    const workflows = await listWorkflows(user.id);

    expect(workflows.length).toBeGreaterThanOrEqual(8);
    expect(workflows.every((workflow) => workflow.stepCount >= 3)).toBe(true);
    expect(workflows.every((workflow) => workflow.tools.length > 0)).toBe(true);
  });

  it("gives every workflow what to verify and what usually goes wrong", async () => {
    const user = await makeUser();

    for (const summary of await listWorkflows(user.id)) {
      const workflow = await getWorkflowDetail(summary.slug, user.id);

      // Without these a workflow teaches copy-and-paste.
      expect(workflow!.whatToVerify.length, workflow!.slug).toBeGreaterThanOrEqual(2);
      expect(workflow!.commonMistakes.length, workflow!.slug).toBeGreaterThanOrEqual(2);
    }
  });

  it("gives every workflow a prompt broken into its parts, with an explanation", async () => {
    const user = await makeUser();

    for (const summary of await listWorkflows(user.id)) {
      const workflow = await getWorkflowDetail(summary.slug, user.id);
      expect(workflow!.prompts.length, workflow!.slug).toBeGreaterThan(0);

      for (const prompt of workflow!.prompts) {
        expect(prompt.goal, workflow!.slug).toBeTruthy();
        expect(prompt.context, workflow!.slug).toBeTruthy();
        expect(prompt.request, workflow!.slug).toBeTruthy();
        // The structure is the teaching; a magic string is not.
        expect(prompt.whyItWorks.length, workflow!.slug).toBeGreaterThan(60);
      }
    }
  });

  it("marks who does each step, and never leaves the human a single rubber stamp", async () => {
    const user = await makeUser();

    for (const summary of await listWorkflows(user.id)) {
      const workflow = await getWorkflowDetail(summary.slug, user.id);

      const aiSteps = workflow!.steps.filter((step) => !step.isHumanStep);
      const humanSteps = workflow!.steps.filter((step) => step.isHumanStep);

      expect(aiSteps.length, workflow!.slug).toBeGreaterThan(0);
      // Two or more, so the human is doing real work on both sides of the ask
      // rather than approving whatever came back.
      expect(humanSteps.length, workflow!.slug).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps AI a minority of the work across the library", async () => {
    const user = await makeUser();
    const workflows = await Promise.all(
      (await listWorkflows(user.id)).map((summary) =>
        getWorkflowDetail(summary.slug, user.id),
      ),
    );

    const steps = workflows.flatMap((workflow) => workflow!.steps);
    const aiSteps = steps.filter((step) => !step.isHumanStep).length;

    // A per-workflow rule would be wrong — understanding code is legitimately
    // a run of four questions. Across the library, though, the balance is the
    // claim the whole section makes, so it is worth asserting.
    expect(aiSteps).toBeLessThan(steps.length - aiSteps);
  });

  it("records and clears a self-reported completion", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    expect(
      (await setWorkflowComplete({ workflowSlug: "debug-a-bug", completed: true })).ok,
    ).toBe(true);

    let workflow = await getWorkflowDetail("debug-a-bug", user.id);
    expect(workflow!.completedAt).not.toBeNull();

    // A checkbox that only goes one way is a trap, not a record.
    await setWorkflowComplete({ workflowSlug: "debug-a-bug", completed: false });
    workflow = await getWorkflowDetail("debug-a-bug", user.id);
    expect(workflow!.completedAt).toBeNull();
  });

  it("returns null for a workflow that does not exist", async () => {
    const user = await makeUser();
    expect(await getWorkflowDetail("no-such-workflow", user.id)).toBeNull();
  });

  it("counts completed workflows in the summary", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    await setWorkflowComplete({ workflowSlug: "write-tests", completed: true });
    await setWorkflowComplete({ workflowSlug: "refactor-code", completed: true });

    const summary = await getAIProgressSummary(user.id);
    expect(summary.workflowsCompleted).toBe(2);
    expect(summary.totalWorkflows).toBeGreaterThanOrEqual(8);
  });
});

// ── 12. Curriculum ─────────────────────────────────────────────────────────

describe("AI curriculum", () => {
  it("is an ACADEMY roadmap belonging to no career", async () => {
    const roadmap = await db.roadmap.findUniqueOrThrow({
      where: { slug: "ai-tools" },
      select: { kind: true, careerId: true, phases: { select: { id: true } } },
    });

    expect(roadmap.kind).toBe("ACADEMY");
    expect(roadmap.careerId).toBeNull();
    expect(roadmap.phases.length).toBeGreaterThanOrEqual(6);
  });

  it("does not appear as a career roadmap, so the explorer never offers it", async () => {
    const careerRoadmaps = await db.roadmap.findMany({
      where: { kind: "CAREER" },
      select: { careerId: true },
    });

    expect(careerRoadmaps.every((roadmap) => roadmap.careerId !== null)).toBe(true);
  });

  it("reuses the ordinary lesson stack rather than a second content system", async () => {
    const topic = await db.topic.findUniqueOrThrow({
      where: { slug: "ai-academy-debugging" },
      select: {
        lesson: {
          select: {
            _count: {
              select: { sections: true, knowledgeChecks: true, resources: true },
            },
          },
        },
      },
    });

    expect(topic.lesson!._count.sections).toBeGreaterThan(4);
    expect(topic.lesson!._count.knowledgeChecks).toBeGreaterThanOrEqual(3);
    expect(topic.lesson!._count.resources).toBeGreaterThan(0);
  });

  it("explains why each phase comes where it does", async () => {
    const phases = await db.roadmapPhase.findMany({
      where: { roadmap: { slug: "ai-tools" } },
      select: { title: true, whyThisComesNext: true },
    });

    for (const phase of phases) {
      expect(phase.whyThisComesNext.length, phase.title).toBeGreaterThan(40);
    }
  });

  it("teaches when not to use AI, not only how to use it", async () => {
    const responsible = await db.topic.findUnique({
      where: { slug: "ai-academy-responsible-ai" },
      select: { id: true },
    });
    const security = await db.topic.findUnique({
      where: { slug: "ai-academy-ai-security" },
      select: { id: true },
    });

    expect(responsible).not.toBeNull();
    expect(security).not.toBeNull();
  });
});

// ── 13. Labels and presentation ────────────────────────────────────────────

describe("presentation helpers", () => {
  it("formats a verification date, and says so when there is none", () => {
    expect(formatVerified(new Date("2026-08-11T00:00:00.000Z"))).toMatch(/2026/);
    // Never a fake date — the absence is the information.
    expect(formatVerified(null)).toBe("Not verified");
  });

  it("gives every status a word, so colour is never the only signal", () => {
    expect(STATUS_LABEL.ACTIVE).toBeTruthy();
    expect(STATUS_LABEL.BETA).toBeTruthy();
    expect(STATUS_LABEL.DEPRECATED).toBeTruthy();
  });

  it("resolves an icon name, and falls back rather than crashing", () => {
    expect(aiToolIcon("Sparkles")).toBeTruthy();
    expect(aiToolIcon("NotAnIconName")).toBeTruthy();
  });
});

// ── 14. Access control ─────────────────────────────────────────────────────

describe("access control", () => {
  it("redirects an unauthenticated visitor away from the Academy", async () => {
    auth.mockResolvedValue(null);
    await expect(requireUser("/academy/ai-tools")).rejects.toThrow(/REDIRECT:\/login/);
  });
});
