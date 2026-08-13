/**
 * The gate in front of a destructive seed.
 *
 * `prisma db seed` rebuilds the catalog, and rebuilding the catalog is not a
 * read-only act. Roadmaps are deleted and recreated so that ordering stays
 * authoritative, and because `Topic.userProgress` and `LessonSection.progress`
 * cascade from those rows, a seed takes every learner's topic and section
 * progress with it. The same is true of project milestones and requirements.
 *
 * That is a perfectly reasonable trade for a development database that exists
 * to be rebuilt. Run against production it is unrecoverable data loss, caused
 * by a command a developer types every day without thinking about it.
 *
 * So the seed refuses to start in a production environment. It refuses
 * *before* the first write rather than skipping operations part-way, because a
 * half-seeded catalog is its own outage.
 *
 * There is deliberately no override flag. An escape hatch is the thing people
 * reach for at 2am when the seed is refusing and the reason it is refusing is
 * that they are pointed at production. Seeding a production catalog is a
 * separate problem that needs a non-destructive path, not a way to force this
 * one.
 */

/** Just the variables the decision depends on, so it can be tested as data. */
export interface SeedEnvironment {
  NODE_ENV?: string;
  /**
   * Set automatically by the deployment platform this app targets. "preview"
   * counts as production for this purpose: a preview deployment is somebody's
   * real database, and preview data is still not ours to delete.
   */
  VERCEL_ENV?: string;
}

export class DestructiveSeedBlocked extends Error {
  constructor(reason: string) {
    super(
      `Destructive database seed is disabled in production.\n\n` +
        `  Reason: ${reason}\n\n` +
        `This command deletes and recreates the catalog. Roadmap, topic and\n` +
        `lesson rows cascade into learner progress, so running it here would\n` +
        `destroy every learner's topic progress, section progress and project\n` +
        `milestones. Nothing has been written.\n\n` +
        `To seed a development database, run it with NODE_ENV=development (or\n` +
        `unset) and no production platform environment.\n` +
        `To apply schema changes to production, use \`npm run db:deploy\`,\n` +
        `which runs migrations and touches no learner data.`,
    );
    this.name = "DestructiveSeedBlocked";
  }
}

/**
 * Why this environment may not be seeded, or null when it may be.
 *
 * Two signals, checked in order of how definite they are. `NODE_ENV` is the
 * one every Node process has; the platform variable catches the case where a
 * deploy shell has not set `NODE_ENV` but is unambiguously not a laptop.
 *
 * Deliberately *not* checked: the database host. Matching hostnames would mean
 * either hardcoding production infrastructure into the repository or guessing
 * from the shape of a URL, and a developer running against a hosted
 * development database would be blocked by the guess. Environment is the thing
 * that actually distinguishes the two.
 */
export function seedBlockReason(env: SeedEnvironment): string | null {
  if (env.NODE_ENV === "production") {
    return "NODE_ENV is production";
  }

  // Unset locally, set to development/preview/production on the platform.
  if (env.VERCEL_ENV && env.VERCEL_ENV !== "development") {
    return `VERCEL_ENV is ${env.VERCEL_ENV}`;
  }

  return null;
}

/** Throws before any write when the environment must not be seeded. */
export function assertDestructiveSeedAllowed(env: SeedEnvironment): void {
  const reason = seedBlockReason(env);
  if (reason) throw new DestructiveSeedBlocked(reason);
}

/**
 * Learner-owned rows a seed of this database would destroy.
 *
 * The guard stops the catastrophic case; this covers the ordinary one. A
 * developer reseeding a database they have been clicking through all afternoon
 * deserves to be told what they are about to lose, in the terminal, rather
 * than discovering it when their test learner is back at zero.
 *
 * Counted, never deleted here — the seed's own operations do the deleting.
 */
export interface LearnerDataAtRisk {
  topicProgress: number;
  sectionProgress: number;
  projectMilestones: number;
  projectRequirements: number;
  total: number;
}

interface CountableClient {
  userTopicProgress: { count(): Promise<number> };
  userSectionProgress: { count(): Promise<number> };
  userProjectMilestone: { count(): Promise<number> };
  userProjectRequirement: { count(): Promise<number> };
  user: { count(): Promise<number> };
}

export async function countLearnerDataAtRisk(
  db: CountableClient,
): Promise<LearnerDataAtRisk> {
  const [topicProgress, sectionProgress, projectMilestones, projectRequirements] =
    await Promise.all([
      db.userTopicProgress.count(),
      db.userSectionProgress.count(),
      db.userProjectMilestone.count(),
      db.userProjectRequirement.count(),
    ]);

  return {
    topicProgress,
    sectionProgress,
    projectMilestones,
    projectRequirements,
    total:
      topicProgress + sectionProgress + projectMilestones + projectRequirements,
  };
}

/**
 * The decision the seed actually makes, combining environment with what is in
 * the database.
 *
 * The environment check on its own left production with no way to be
 * initialised at all: a freshly provisioned database has no catalog, seeding is
 * how the catalog gets there, and the guard refused. The result was a deployed
 * application whose pages rendered but whose every query returned nothing —
 * no careers to choose, no roadmap, no lessons.
 *
 * The resolution is not a bypass flag. It is to notice that the guard exists to
 * protect *learner data*, and an empty database has none: no users, no
 * progress, nothing a seed could destroy. So a production seed is allowed
 * exactly when there is demonstrably nothing to lose, and refused the moment
 * there is — which is the same rule as before, stated against the database
 * rather than against the environment.
 *
 * The emptiness check is a snapshot, so a signup landing between the check and
 * the writes is theoretically possible. That is acceptable for a one-time
 * initialisation of a database nobody has been given the URL to yet, and it is
 * a far smaller risk than having no supported way to publish the catalog.
 */
export type SeedAllowed = { allowed: true; mode: "development" | "production-initialise" };
export type SeedDecision = SeedAllowed | { allowed: false; reason: string };

export async function decideSeed(
  env: SeedEnvironment,
  db: CountableClient,
): Promise<SeedDecision> {
  const reason = seedBlockReason(env);
  if (!reason) return { allowed: true, mode: "development" };

  const [atRisk, users] = await Promise.all([
    countLearnerDataAtRisk(db),
    db.user.count(),
  ]);

  if (atRisk.total === 0 && users === 0) {
    return { allowed: true, mode: "production-initialise" };
  }

  return {
    allowed: false,
    reason:
      `${reason}, and this database is in use ` +
      `(${users} user${users === 1 ? "" : "s"}, ${atRisk.total} progress row${atRisk.total === 1 ? "" : "s"})`,
  };
}

/** Throws unless this database may be seeded. Returns how it was allowed. */
export async function assertSeedAllowed(
  env: SeedEnvironment,
  db: CountableClient,
): Promise<SeedAllowed> {
  const decision = await decideSeed(env, db);
  if (!decision.allowed) throw new DestructiveSeedBlocked(decision.reason);
  return decision;
}

/** One line per kind, or null when there is nothing to lose. */
export function describeLearnerDataAtRisk(at: LearnerDataAtRisk): string | null {
  if (at.total === 0) return null;

  return [
    `This database holds learner progress that reseeding will delete:`,
    `  ${at.topicProgress} topic progress rows`,
    `  ${at.sectionProgress} section progress rows`,
    `  ${at.projectMilestones} project milestone rows`,
    `  ${at.projectRequirements} project requirement rows`,
  ].join("\n");
}
