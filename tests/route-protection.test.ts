import { beforeEach, describe, expect, it, vi } from "vitest";

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const auth = vi.fn();
vi.mock("@/auth", () => ({ auth, signIn: vi.fn(), signOut: vi.fn() }));

/**
 * next/navigation's redirect() throws to unwind rendering. The stub throws a
 * tagged error so tests can assert both *that* a redirect happened and where
 * it went.
 */
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

const { getCurrentUser, requireUser, requireOnboardedUser } =
  await import("@/lib/session");
const { db } = await import("@/lib/db");

async function makeUser(onboardingCompleted: boolean) {
  return db.user.create({
    data: {
      name: "Test Learner",
      email: `user-${Math.random().toString(36).slice(2)}@example.com`,
      passwordHash: "$2b$12$abcdefghijklmnopqrstuv",
      profile: { create: { onboardingCompleted } },
    },
  });
}

async function expectRedirect(fn: () => Promise<unknown>, target: string) {
  await expect(fn()).rejects.toThrow(RedirectError);
  await fn().catch((error: unknown) => {
    expect((error as RedirectError).target).toBe(target);
  });
}

beforeEach(() => {
  auth.mockReset();
});

describe("protected routes", () => {
  it("sends an unauthenticated visitor to /login", async () => {
    auth.mockResolvedValue(null);
    await expectRedirect(() => requireUser(), "/login");
  });

  it("preserves where they were heading", async () => {
    auth.mockResolvedValue(null);
    await expectRedirect(
      () => requireUser("/dashboard"),
      "/login?callbackUrl=%2Fdashboard",
    );
  });

  it("treats a session whose user no longer exists as signed out", async () => {
    auth.mockResolvedValue({ user: { id: "deleted-user-id" } });

    expect(await getCurrentUser()).toBeNull();
    await expectRedirect(() => requireUser(), "/login");
  });
});

describe("onboarding gate", () => {
  it("sends an authenticated user with incomplete onboarding to /onboarding", async () => {
    const user = await makeUser(false);
    auth.mockResolvedValue({ user: { id: user.id } });

    await expectRedirect(() => requireOnboardedUser(), "/onboarding");
  });

  it("lets a user with completed onboarding through to the dashboard", async () => {
    const user = await makeUser(true);
    auth.mockResolvedValue({ user: { id: user.id } });

    const result = await requireOnboardedUser();

    expect(result.id).toBe(user.id);
    expect(result.onboardingCompleted).toBe(true);
  });

  it("reads completion from the database, not from the session token", async () => {
    const user = await makeUser(false);
    auth.mockResolvedValue({ user: { id: user.id } });

    expect((await getCurrentUser())!.onboardingCompleted).toBe(false);

    // Simulates onboarding finishing without the JWT being reissued.
    await db.profile.update({
      where: { userId: user.id },
      data: { onboardingCompleted: true },
    });

    expect((await getCurrentUser())!.onboardingCompleted).toBe(true);
    await expect(requireOnboardedUser()).resolves.toMatchObject({ id: user.id });
  });

  it("never exposes the password hash to callers", async () => {
    const user = await makeUser(true);
    auth.mockResolvedValue({ user: { id: user.id } });

    expect(await getCurrentUser()).not.toHaveProperty("passwordHash");
  });
});

/**
 * Why a routing-shape test lives in the test suite at all.
 *
 * `/practice/does-not-exist` answered HTTP 200. The page called `notFound()`
 * and the right not-found UI was rendered, so nothing looked broken from a
 * browser — but a dead link told every crawler and every uptime check that it
 * was fine.
 *
 * The cause was one file: a `loading.tsx` on the (app) route group. Next.js
 * turns that into a Suspense boundary wrapping every route beneath it, and once
 * a boundary above the page can render a fallback, the response is flushed —
 * status and all — before the page has decided whether the thing exists.
 * `notFound()` then arrives too late to be anything but UI.
 *
 * The fix was to move the boundaries below the fork, so no segment that can
 * 404 has one above it. That is an invariant about where files sit, and it is
 * invisible in every other test: nothing fails, a status code just quietly
 * goes wrong. Adding one `loading.tsx` in the wrong place would silently undo
 * it, which is exactly what this asserts against.
 */
describe("not-found routing", () => {
  const APP = path.join(process.cwd(), "src", "app");

  /** Every page.tsx under src/app that can answer notFound(). */
  function pagesThatCan404(dir: string): string[] {
    const found: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) found.push(...pagesThatCan404(full));
      else if (entry.name === "page.tsx" && readFileSync(full, "utf8").includes("notFound()")) {
        found.push(full);
      }
    }
    return found;
  }

  /** The segment directories Next.js renders above this page, page's own first. */
  function segmentsAbove(page: string): string[] {
    const chain: string[] = [];
    let dir = path.dirname(page);
    while (dir.startsWith(APP)) {
      chain.push(dir);
      dir = path.dirname(dir);
    }
    return chain;
  }

  const pages = pagesThatCan404(APP);

  it("finds the pages that can 404, so the check below is not vacuous", () => {
    // If this ever drops to zero the two tests after it pass by doing nothing.
    expect(pages.length).toBeGreaterThanOrEqual(7);
    expect(
      pages.some((page) => page.includes(`practice${path.sep}[slug]`)),
      "the practice problem page must be among them",
    ).toBe(true);
  });

  it("puts no loading boundary above a page that can 404", () => {
    const shadowed = pages.flatMap((page) =>
      segmentsAbove(page)
        .filter((segment) => existsSync(path.join(segment, "loading.tsx")))
        .map(
          (segment) =>
            `${path.relative(APP, page)} is behind ${path.relative(APP, segment)}/loading.tsx`,
        ),
    );

    // Each entry here is a route whose missing-resource URL answers 200.
    expect(shadowed).toEqual([]);
  });

  it("still gives the routes that cannot 404 their loading skeleton", () => {
    // The fix must not have been "delete every loading.tsx". Boundaries were
    // moved down, not removed, and route groups keep them off the [slug] pages
    // without changing a single URL.
    function loadingFiles(dir: string): string[] {
      const found: string[] = [];
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) found.push(...loadingFiles(full));
        else if (entry.name === "loading.tsx") found.push(full);
      }
      return found;
    }

    const boundaries = loadingFiles(APP);
    expect(boundaries.length).toBeGreaterThanOrEqual(10);

    // The catalog is the slowest page in the app and keeps its skeleton.
    expect(
      boundaries.some((file) => file.includes(`practice${path.sep}(index)`)),
      "/practice should still have a loading boundary of its own",
    ).toBe(true);
  });
});
