import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.fn();
vi.mock("@/auth", () => ({ auth, signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { getCareerSummaries, getCareerBySlug, getCareersForComparison } =
  await import("@/lib/careers/queries");
const { filterCareers } = await import("@/lib/careers/filter");
const { selectCareer, clearSelectedCareer } = await import("@/app/actions/career");
const { db } = await import("@/lib/db");

async function makeUser(email = "explorer@example.com") {
  return db.user.create({
    data: {
      name: "Test Explorer",
      email,
      passwordHash: "$2b$12$abcdefghijklmnopqrstuv",
      profile: { create: { onboardingCompleted: true } },
    },
  });
}

function signedInAs(id: string) {
  auth.mockResolvedValue({ user: { id } });
}

beforeEach(() => {
  auth.mockReset();
});

describe("career catalog", () => {
  it("loads the seeded catalog in a stable order", async () => {
    const careers = await getCareerSummaries();

    expect(careers.length).toBeGreaterThanOrEqual(20);

    const slugs = careers.map((c) => c.slug);
    expect(slugs).toContain("frontend-developer");
    expect(slugs).toContain("solutions-architect");
    expect(new Set(slugs).size).toBe(slugs.length); // no duplicates
  });

  it("loads a career detail page with technologies and related careers", async () => {
    const career = await getCareerBySlug("frontend-developer");

    expect(career).not.toBeNull();
    expect(career!.name).toBe("Frontend Developer");

    // The content sections the detail page renders must not be empty.
    expect(career!.description.length).toBeGreaterThan(80);
    expect(career!.builds.length).toBeGreaterThan(0);
    expect(career!.learningAreas.length).toBeGreaterThan(0);
    expect(career!.suitedFor.length).toBeGreaterThan(0);
    expect(career!.challenges.length).toBeGreaterThan(0);

    expect(career!.technologies.map((t) => t.technology.name)).toContain("React");
    expect(career!.relatedTo.length).toBeGreaterThan(0);
  });

  it("returns null for an unknown slug rather than throwing", async () => {
    expect(await getCareerBySlug("astronaut")).toBeNull();
    expect(await getCareerBySlug("")).toBeNull();
  });

  it("links related careers to real, resolvable careers", async () => {
    const career = await getCareerBySlug("frontend-developer");
    const relatedSlugs = career!.relatedTo.map((edge) => edge.relatedCareer.slug);

    expect(relatedSlugs).toContain("full-stack-developer");

    for (const slug of relatedSlugs) {
      expect(await getCareerBySlug(slug)).not.toBeNull();
    }
  });

  it("returns comparison careers in the order requested", async () => {
    const ordered = await getCareersForComparison([
      "backend-developer",
      "frontend-developer",
    ]);

    expect(ordered.map((c) => c.slug)).toEqual([
      "backend-developer",
      "frontend-developer",
    ]);
  });

  it("silently drops unknown slugs from a comparison", async () => {
    const careers = await getCareersForComparison(["frontend-developer", "nonsense"]);
    expect(careers.map((c) => c.slug)).toEqual(["frontend-developer"]);
  });
});

describe("search and filtering", () => {
  it("matches on name, case-insensitively", async () => {
    const careers = await getCareerSummaries();

    const upper = filterCareers(careers, { query: "FRONTEND" });
    const lower = filterCareers(careers, { query: "frontend" });

    expect(upper.map((c) => c.slug)).toEqual(lower.map((c) => c.slug));
    expect(lower.map((c) => c.slug)).toContain("frontend-developer");
  });

  it("matches beyond the name, so broad terms still find things", async () => {
    const careers = await getCareerSummaries();

    // "security" is the category label for the cybersecurity career.
    expect(filterCareers(careers, { query: "security" }).length).toBeGreaterThan(0);
    // "data" should surface the whole Data & AI group.
    expect(filterCareers(careers, { query: "data" }).length).toBeGreaterThan(2);
  });

  it("ignores surrounding whitespace", async () => {
    const careers = await getCareerSummaries();
    expect(filterCareers(careers, { query: "  cloud  " }).length).toBeGreaterThan(0);
  });

  it("returns nothing for a term that matches no career", async () => {
    const careers = await getCareerSummaries();
    expect(filterCareers(careers, { query: "underwater basket weaving" })).toEqual([]);
  });

  it("filters by category", async () => {
    const careers = await getCareerSummaries();
    const results = filterCareers(careers, { category: "SECURITY" });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((c) => c.category === "SECURITY")).toBe(true);
  });

  it("filters by difficulty", async () => {
    const careers = await getCareerSummaries();
    const results = filterCareers(careers, { difficulty: "BEGINNER" });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((c) => c.difficulty === "BEGINNER")).toBe(true);
  });

  it("combines search and filters", async () => {
    const careers = await getCareerSummaries();
    const results = filterCareers(careers, {
      query: "developer",
      difficulty: "BEGINNER",
    });

    expect(results.every((c) => c.difficulty === "BEGINNER")).toBe(true);
    expect(results.every((c) => /developer/i.test(c.name))).toBe(true);
  });

  it("returns the whole catalog with no filters applied", async () => {
    const careers = await getCareerSummaries();
    expect(filterCareers(careers, {})).toHaveLength(careers.length);
  });
});

describe("career selection", () => {
  it("persists the chosen career to the signed-in user's profile", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const career = await db.career.findUniqueOrThrow({
      where: { slug: "frontend-developer" },
    });

    const result = await selectCareer({ careerId: career.id });
    expect(result.ok).toBe(true);

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { selectedCareerId: true, chosenCareer: { select: { slug: true } } },
    });

    expect(profile!.selectedCareerId).toBe(career.id);
    expect(profile!.chosenCareer!.slug).toBe("frontend-developer");
  });

  it("lets a user change their mind", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const first = await db.career.findUniqueOrThrow({
      where: { slug: "frontend-developer" },
    });
    const second = await db.career.findUniqueOrThrow({
      where: { slug: "data-analyst" },
    });

    await selectCareer({ careerId: first.id });
    await selectCareer({ careerId: second.id });

    const profile = await db.profile.findUnique({ where: { userId: user.id } });
    expect(profile!.selectedCareerId).toBe(second.id);
  });

  it("can clear the selection back to undecided", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const career = await db.career.findUniqueOrThrow({
      where: { slug: "frontend-developer" },
    });
    await selectCareer({ careerId: career.id });

    const result = await clearSelectedCareer();
    expect(result.ok).toBe(true);

    const profile = await db.profile.findUnique({ where: { userId: user.id } });
    expect(profile!.selectedCareerId).toBeNull();
  });

  it("refuses an unauthenticated selection", async () => {
    auth.mockResolvedValue(null);

    const career = await db.career.findUniqueOrThrow({
      where: { slug: "frontend-developer" },
    });

    const result = await selectCareer({ careerId: career.id });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/signed in/i);
    expect(await db.profile.count({ where: { selectedCareerId: { not: null } } })).toBe(
      0,
    );
  });

  it("refuses an unauthenticated clear", async () => {
    auth.mockResolvedValue(null);
    const result = await clearSelectedCareer();
    expect(result.ok).toBe(false);
  });

  it("rejects a career id that does not exist", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const result = await selectCareer({ careerId: "not-a-real-career-id" });

    expect(result.ok).toBe(false);
    const profile = await db.profile.findUnique({ where: { userId: user.id } });
    expect(profile!.selectedCareerId).toBeNull();
  });

  it("rejects a malformed payload", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    expect((await selectCareer({})).ok).toBe(false);
    expect((await selectCareer(null)).ok).toBe(false);
    expect((await selectCareer({ careerId: "" })).ok).toBe(false);
  });

  it("only ever writes the session user's profile, never one named by the client", async () => {
    const alice = await makeUser("alice@example.com");
    const bob = await makeUser("bob@example.com");

    signedInAs(alice.id);

    const career = await db.career.findUniqueOrThrow({
      where: { slug: "frontend-developer" },
    });

    // A hostile payload naming Bob's profile alongside the career id.
    await selectCareer({ careerId: career.id, userId: bob.id });

    const bobProfile = await db.profile.findUnique({ where: { userId: bob.id } });
    const aliceProfile = await db.profile.findUnique({ where: { userId: alice.id } });

    expect(bobProfile!.selectedCareerId).toBeNull();
    expect(aliceProfile!.selectedCareerId).toBe(career.id);
  });

  it("leaves the career catalog untouched when a user picks a path", async () => {
    const before = await db.career.count();

    const user = await makeUser();
    signedInAs(user.id);
    const career = await db.career.findUniqueOrThrow({
      where: { slug: "frontend-developer" },
    });
    await selectCareer({ careerId: career.id });

    expect(await db.career.count()).toBe(before);
  });
});
