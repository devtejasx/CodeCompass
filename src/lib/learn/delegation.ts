import { db } from "@/lib/db";

/**
 * Topics a career roadmap names but does not teach itself.
 *
 * The Frontend roadmap lists seven Git topics. CodeCompass already teaches Git
 * properly, in the Git & GitHub Academy — ten authored modules with lessons,
 * knowledge checks, a simulator and exercises. Writing seven more Git lessons
 * inside the Frontend curriculum would mean two sets of Git content to keep
 * correct, and the second set would be worse.
 *
 * So the roadmap *delegates*. A delegated topic has no lesson of its own and
 * never will: it points at the Academy, and it is satisfied when the Academy
 * work behind it is genuinely complete.
 *
 * Two properties make this safe.
 *
 * **Nothing is duplicated.** The mapping is slugs, not content. The Academy
 * stays the single source of Git teaching, and a change there is immediately
 * reflected here.
 *
 * **Nothing is faked.** Satisfaction is *derived* on read from real
 * `UserTopicProgress` rows for the Academy topics — the same table, the same
 * completion rules, the same server-side grading. There is no second progress
 * record to write, nothing to keep in sync, and no way to mark a delegated
 * topic complete without actually passing the Academy lessons behind it.
 * Opening the Academy satisfies nothing.
 */

export interface Delegation {
  /** Where the canonical teaching lives. */
  academyHref: string;
  academyName: string;
  /** Shown on the bridge so the learner knows what this stands in for. */
  summary: string;
  /**
   * Academy topic slugs that must all be COMPLETED before the delegating topic
   * counts as satisfied. Deliberately the specific modules that cover it, not
   * the whole Academy — finishing open-source contribution is not a
   * prerequisite for understanding what a commit is.
   */
  requires: string[];
}

/**
 * Frontend roadmap Git topics → the Academy modules that teach them.
 *
 * The mapping was taken from the seeded content of both, module by module. It
 * is intentionally many-to-one in places: "Merging and conflicts" and
 * "Branches" are one Academy module, because that is how the Academy teaches
 * them and splitting it here would misrepresent what the learner has to do.
 */
export const DELEGATED_TOPICS: Record<string, Delegation> = {
  "git-fundamentals": {
    academyHref: "/academy/git",
    academyName: "Git & GitHub Academy",
    summary:
      "What version control is, why it exists, and getting Git set up on your machine.",
    requires: ["git-academy-version-control", "git-academy-git-basics"],
  },
  "git-repository": {
    academyHref: "/academy/git",
    academyName: "Git & GitHub Academy",
    summary:
      "Turning a folder into a repository, and the three places your work can live.",
    requires: ["git-academy-git-basics", "git-academy-workflow"],
  },
  "git-commit": {
    academyHref: "/academy/git",
    academyName: "Git & GitHub Academy",
    summary: "Recording work as commits, and reading a history somebody else wrote.",
    requires: ["git-academy-commits"],
  },
  "git-branch": {
    academyHref: "/academy/git",
    academyName: "Git & GitHub Academy",
    summary: "Working on something without touching what already works.",
    requires: ["git-academy-branches"],
  },
  "git-merge": {
    academyHref: "/academy/git",
    academyName: "Git & GitHub Academy",
    summary:
      "Bringing a branch back, and resolving a conflict when two changes collide.",
    requires: ["git-academy-branches", "git-academy-remotes"],
  },
  "git-pull-request": {
    academyHref: "/academy/git",
    academyName: "Git & GitHub Academy",
    summary: "Proposing a change on GitHub and having it reviewed.",
    requires: ["git-academy-github", "git-academy-collaboration"],
  },
  "github-workflow": {
    academyHref: "/academy/git",
    academyName: "Git & GitHub Academy",
    summary: "The loop professional teams actually run, day to day.",
    requires: ["git-academy-github", "git-academy-professional-workflow"],
  },
};

/** Whether a topic is taught elsewhere. */
export function delegationFor(topicSlug: string): Delegation | null {
  return DELEGATED_TOPICS[topicSlug] ?? null;
}

export const DELEGATED_TOPIC_SLUGS = Object.keys(DELEGATED_TOPICS);

/** Every Academy topic slug any delegation depends on, deduplicated. */
const REQUIRED_ACADEMY_SLUGS = [
  ...new Set(Object.values(DELEGATED_TOPICS).flatMap((entry) => entry.requires)),
];

export interface DelegationStatus extends Delegation {
  topicSlug: string;
  satisfied: boolean;
  /** Per-module state, so the bridge can show what is left rather than a bare percentage. */
  modules: { slug: string; title: string; completed: boolean }[];
}

/**
 * Resolves every delegation for one learner in a single query.
 *
 * One query rather than one per topic: the whole set of Academy topics behind
 * every delegation is small and fixed, so fetching it once and grouping in
 * memory beats seven round trips on a page that renders all of them.
 */
export async function getDelegationStatuses(
  userId: string,
): Promise<Map<string, DelegationStatus>> {
  const academyTopics = await db.topic.findMany({
    where: { slug: { in: REQUIRED_ACADEMY_SLUGS } },
    select: {
      slug: true,
      title: true,
      progress: { where: { userId }, select: { status: true } },
    },
  });

  const byslug = new Map(
    academyTopics.map((topic) => [
      topic.slug,
      { title: topic.title, completed: topic.progress[0]?.status === "COMPLETED" },
    ]),
  );

  const out = new Map<string, DelegationStatus>();

  for (const [topicSlug, delegation] of Object.entries(DELEGATED_TOPICS)) {
    const modules = delegation.requires.map((slug) => ({
      slug,
      title: byslug.get(slug)?.title ?? slug,
      completed: byslug.get(slug)?.completed ?? false,
    }));

    out.set(topicSlug, {
      ...delegation,
      topicSlug,
      modules,
      // Every required module, not most of them. A partially finished Academy
      // has genuinely not taught the topic yet.
      satisfied: modules.length > 0 && modules.every((module) => module.completed),
    });
  }

  return out;
}

/**
 * Topic ids that count as complete because the Academy work behind them is
 * done, given the roadmap topics already loaded by the caller.
 *
 * Returned as ids to union into an existing `completedTopicIds` list, which is
 * how delegation reaches prerequisites, the roadmap, progress percentages and
 * the recommendation engine without any of them knowing it exists.
 */
export async function satisfiedDelegatedTopicIds(
  userId: string,
  topics: { id: string; slug: string }[],
): Promise<string[]> {
  const delegated = topics.filter((topic) => topic.slug in DELEGATED_TOPICS);
  if (delegated.length === 0) return [];

  const statuses = await getDelegationStatuses(userId);

  return delegated
    .filter((topic) => statuses.get(topic.slug)?.satisfied)
    .map((topic) => topic.id);
}
