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
