import { describe, expect, it } from "vitest";

const {
  assertDestructiveSeedAllowed,
  seedBlockReason,
  DestructiveSeedBlocked,
  countLearnerDataAtRisk,
  describeLearnerDataAtRisk,
} = await import("../prisma/seed/guard");
const { db } = await import("@/lib/db");

/**
 * The seed is destructive by design, and that design is only safe as long as
 * it cannot run anywhere that holds real learner progress.
 *
 * Rebuilding the catalog deletes and recreates roadmaps so ordering stays
 * authoritative. `UserTopicProgress` cascades from `Topic`, and
 * `UserSectionProgress` from `LessonSection`, so a seed takes every learner's
 * progress with it. On a development database that is the point. On production
 * it is unrecoverable, triggered by a command people type without thinking.
 */

async function makeLearnerWithProgress(email: string) {
  const user = await db.user.create({
    data: {
      name: "Seed Safety Learner",
      email,
      passwordHash: "$2b$12$abcdefghijklmnopqrstuv",
      profile: { create: { onboardingCompleted: true } },
    },
  });

  const topic = await db.topic.findFirstOrThrow({
    where: { lesson: { isNot: null } },
    select: { id: true, lesson: { select: { sections: { take: 1, select: { id: true } } } } },
  });

  await db.userTopicProgress.create({
    data: {
      userId: user.id,
      topicId: topic.id,
      status: "COMPLETED",
      percentComplete: 100,
      bestScore: 100,
      attempts: 1,
      completedAt: new Date(),
    },
  });

  await db.userSectionProgress.create({
    data: { userId: user.id, sectionId: topic.lesson!.sections[0].id },
  });

  return { user, topicId: topic.id };
}

describe("destructive seed guard", () => {
  it("refuses to run when NODE_ENV is production", () => {
    expect(seedBlockReason({ NODE_ENV: "production" })).toMatch(/NODE_ENV/);
    expect(() => assertDestructiveSeedAllowed({ NODE_ENV: "production" })).toThrow(
      DestructiveSeedBlocked,
    );
  });

  it("refuses on a deployed platform environment, including preview", () => {
    // A preview deployment is somebody's real database. Preview data is still
    // not ours to delete.
    for (const VERCEL_ENV of ["production", "preview"]) {
      expect(seedBlockReason({ VERCEL_ENV }), VERCEL_ENV).toMatch(/VERCEL_ENV/);
      expect(() => assertDestructiveSeedAllowed({ VERCEL_ENV }), VERCEL_ENV).toThrow(
        DestructiveSeedBlocked,
      );
    }
  });

  it("allows the environments a seed is meant for", () => {
    // Development, the test runner, and a bare shell with nothing set.
    for (const env of [
      { NODE_ENV: "development" },
      { NODE_ENV: "test" },
      { NODE_ENV: "development", VERCEL_ENV: "development" },
      {},
    ]) {
      expect(seedBlockReason(env), JSON.stringify(env)).toBeNull();
      expect(() => assertDestructiveSeedAllowed(env)).not.toThrow();
    }
  });

  it("explains what would have been destroyed, and what to run instead", () => {
    const error = new DestructiveSeedBlocked("NODE_ENV is production");

    // The message has to answer the two questions the reader will have.
    expect(error.message).toMatch(/disabled in production/i);
    expect(error.message).toMatch(/learner/i);
    expect(error.message).toMatch(/Nothing has been written/i);
    expect(error.message).toMatch(/db:deploy/);
  });

  it("offers no override flag", () => {
    // The guard reads two variables and nothing else. An escape hatch is what
    // people reach for at 2am, which is exactly when they are pointed at
    // production — so any env var that is not one of these two is ignored.
    for (const env of [
      { NODE_ENV: "production", FORCE_SEED: "1" },
      { NODE_ENV: "production", ALLOW_DESTRUCTIVE_SEED: "true" },
      { NODE_ENV: "production", CI: "true" },
    ] as Record<string, string>[]) {
      expect(seedBlockReason(env)).toMatch(/NODE_ENV/);
    }
  });
});

describe("initialising a production database", () => {
  /**
   * The environment check alone left production with no way to be seeded at
   * all, which meant a deployed application with an empty catalog: no careers,
   * no roadmap, no lessons. Every page rendered and every query returned
   * nothing.
   *
   * The resolution is not a bypass. The guard exists to protect learner data,
   * and a database with no users and no progress has none — so seeding is
   * allowed exactly while there is demonstrably nothing to lose, and refused
   * the moment there is.
   */
  const counts = (n: number) => ({ count: async () => n });
  const database = ({ users = 0, progress = 0 } = {}) => ({
    user: counts(users),
    userTopicProgress: counts(progress),
    userSectionProgress: counts(0),
    userProjectMilestone: counts(0),
    userProjectRequirement: counts(0),
  });

  it("allows a first production seed when nothing can be lost", async () => {
    const { decideSeed } = await import("../prisma/seed/guard");

    for (const env of [{ NODE_ENV: "production" }, { VERCEL_ENV: "production" }]) {
      const decision = await decideSeed(env, database());

      expect(decision.allowed, JSON.stringify(env)).toBe(true);
      expect(decision.allowed && decision.mode).toBe("production-initialise");
    }
  });

  it("refuses once anybody has signed up, even with no progress yet", async () => {
    const { decideSeed } = await import("../prisma/seed/guard");

    // A user with no progress is still somebody's account. The catalog rebuild
    // would not delete them, but the database is no longer demonstrably empty
    // and the seed is no longer a first-time initialisation.
    const decision = await decideSeed({ NODE_ENV: "production" }, database({ users: 1 }));

    expect(decision.allowed).toBe(false);
    expect(!decision.allowed && decision.reason).toMatch(/in use/i);
  });

  it("refuses when progress exists, and says how much", async () => {
    const { decideSeed } = await import("../prisma/seed/guard");

    const decision = await decideSeed(
      { VERCEL_ENV: "production" },
      database({ users: 12, progress: 340 }),
    );

    expect(decision.allowed).toBe(false);
    expect(!decision.allowed && decision.reason).toMatch(/12 users/);
    expect(!decision.allowed && decision.reason).toMatch(/340 progress rows/);
  });

  it("still ignores an override flag on a database in use", async () => {
    const { decideSeed } = await import("../prisma/seed/guard");

    // Emptiness is derived from the database, never asserted by the caller —
    // so there is nothing to set that would force this through.
    const decision = await decideSeed(
      {
        NODE_ENV: "production",
        FORCE_SEED: "1",
        ALLOW_DESTRUCTIVE_SEED: "true",
      } as Record<string, string>,
      database({ users: 5 }),
    );

    expect(decision.allowed).toBe(false);
  });

  it("leaves development alone, whatever the database holds", async () => {
    const { decideSeed } = await import("../prisma/seed/guard");

    const decision = await decideSeed(
      { NODE_ENV: "development" },
      database({ users: 3, progress: 90 }),
    );

    expect(decision.allowed).toBe(true);
    expect(decision.allowed && decision.mode).toBe("development");
  });

  it("throws rather than returning when the seed may not run", async () => {
    const { assertSeedAllowed, DestructiveSeedBlocked } = await import(
      "../prisma/seed/guard"
    );

    await expect(
      assertSeedAllowed({ NODE_ENV: "production" }, database({ users: 1 })),
    ).rejects.toBeInstanceOf(DestructiveSeedBlocked);

    await expect(
      assertSeedAllowed({ NODE_ENV: "production" }, database()),
    ).resolves.toMatchObject({ allowed: true, mode: "production-initialise" });
  });
});

describe("learner data the seed would destroy", () => {
  it("counts progress that a reseed would take with it", async () => {
    const before = await countLearnerDataAtRisk(db);
    await makeLearnerWithProgress("at-risk@example.com");
    const after = await countLearnerDataAtRisk(db);

    expect(after.topicProgress).toBe(before.topicProgress + 1);
    expect(after.sectionProgress).toBe(before.sectionProgress + 1);
    expect(after.total).toBe(before.total + 2);
  });

  it("says nothing when there is nothing to lose", () => {
    expect(
      describeLearnerDataAtRisk({
        topicProgress: 0,
        sectionProgress: 0,
        projectMilestones: 0,
        projectRequirements: 0,
        total: 0,
      }),
    ).toBeNull();
  });

  it("names each kind of progress when there is", () => {
    const warning = describeLearnerDataAtRisk({
      topicProgress: 12,
      sectionProgress: 34,
      projectMilestones: 5,
      projectRequirements: 6,
      total: 57,
    });

    expect(warning).toMatch(/12 topic progress/);
    expect(warning).toMatch(/34 section progress/);
    expect(warning).toMatch(/5 project milestone/);
    expect(warning).toMatch(/6 project requirement/);
  });

  it("leaves learner progress untouched when a production seed is refused", async () => {
    const { user, topicId } = await makeLearnerWithProgress("protected@example.com");

    // The seed's own first act, with a production environment.
    expect(() => assertDestructiveSeedAllowed({ NODE_ENV: "production" })).toThrow(
      DestructiveSeedBlocked,
    );

    // Refused before any write, so everything is exactly where it was.
    const progress = await db.userTopicProgress.findUniqueOrThrow({
      where: { userId_topicId: { userId: user.id, topicId } },
    });
    expect(progress.status).toBe("COMPLETED");
    expect(progress.bestScore).toBe(100);

    expect(
      await db.userSectionProgress.count({ where: { userId: user.id } }),
    ).toBe(1);
    // And the catalog it would have rebuilt is still standing.
    expect(await db.roadmap.count()).toBeGreaterThan(0);
  });
});

describe("what a seed actually cascades into", () => {
  it("keeps learner progress attached to catalog rows that cascade", async () => {
    // This is the property that makes the guard necessary, asserted rather
    // than assumed: if these relations ever stop cascading, the guard is
    // still correct but the reasoning behind it has changed, and somebody
    // should notice.
    const { user, topicId } = await makeLearnerWithProgress("cascade@example.com");

    const rows: { table_name: string; delete_rule: string }[] = await db.$queryRawUnsafe(`
      SELECT tc.table_name, rc.delete_rule
      FROM information_schema.table_constraints tc
      JOIN information_schema.referential_constraints rc
        ON tc.constraint_name = rc.constraint_name
      WHERE tc.table_name IN ('user_topic_progress', 'user_section_progress')
        AND tc.constraint_type = 'FOREIGN KEY'
    `);

    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.delete_rule, `${row.table_name}`).toBe("CASCADE");
    }

    // Sanity: the learner really is hanging off a catalog row.
    expect(
      await db.userTopicProgress.count({ where: { userId: user.id, topicId } }),
    ).toBe(1);
  });
});
