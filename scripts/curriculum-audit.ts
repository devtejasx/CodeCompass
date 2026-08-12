import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Curriculum audit for one career roadmap.
 *
 * Answers the question this phase exists to answer: how far can a learner
 * actually get before the authored content runs out? Run with:
 *
 *   npx tsx scripts/curriculum-audit.ts [career-slug]
 */
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const slug = process.argv[2] ?? "frontend-developer";
  const rm = await db.roadmap.findFirstOrThrow({
    where: { career: { slug }, isActive: true },
    select: {
      title: true,
      phases: {
        orderBy: { order: "asc" },
        select: {
          order: true,
          title: true,
          topics: {
            orderBy: { order: "asc" },
            select: {
              slug: true,
              isRequired: true,
              lesson: {
                select: {
                  _count: { select: { sections: true, knowledgeChecks: true } },
                },
              },
              prerequisites: { select: { prerequisite: { select: { slug: true } } } },
              problems: { select: { problemId: true } },
              projects: { select: { projectId: true } },
            },
          },
        },
      },
    },
  });

  type TopicRow = (typeof rm.phases)[number]["topics"][number];
  const all: TopicRow[] = rm.phases.flatMap((p) => p.topics);
  const completed = new Set<string>();
  const rows: string[] = [];
  let totalChecks = 0;

  console.log(`\n${rm.title}\n${"=".repeat(rm.title.length)}\n`);
  console.log("| Phase | Topics | Lessons | Coverage |");
  console.log("|---|---:|---:|---:|");

  for (const p of rm.phases) {
    const withLesson = p.topics.filter((t) => t.lesson).length;
    const pct = p.topics.length ? Math.round((withLesson / p.topics.length) * 100) : 0;
    console.log(
      `| ${p.order}. ${p.title} | ${p.topics.length} | ${withLesson} | ${pct}% |`,
    );
    for (const t of p.topics) totalChecks += t.lesson?._count.knowledgeChecks ?? 0;
  }

  const withLesson = all.filter((t) => t.lesson).length;
  console.log(
    `| **Total** | **${all.length}** | **${withLesson}** | **${Math.round((withLesson / all.length) * 100)}%** |`,
  );

  // Walk the roadmap the way a learner does: a topic is reachable when every
  // prerequisite is already reachable AND it can actually be completed.
  let reachable = 0;
  let firstBlock: string | null = null;
  let progressed = true;
  while (progressed) {
    progressed = false;
    for (const t of all) {
      if (completed.has(t.slug)) continue;
      const ready = t.prerequisites.every((e) => completed.has(e.prerequisite.slug));
      if (!ready) continue;
      completed.add(t.slug);
      reachable++;
      progressed = true;
    }
  }
  for (const t of all) {
    if (!completed.has(t.slug) && t.isRequired) {
      firstBlock ??= t.slug;
    }
  }

  console.log(`\nTopics: ${all.length} (required ${all.filter((t) => t.isRequired).length})`);
  console.log(`Topics with a lesson: ${withLesson}`);
  console.log(`Topics without a lesson: ${all.length - withLesson}`);
  console.log(`Topics with practice problems: ${all.filter((t) => t.problems.length).length}`);
  console.log(`Topics with projects: ${all.filter((t) => t.projects.length).length}`);
  console.log(`Topics with prerequisites: ${all.filter((t) => t.prerequisites.length).length}`);
  console.log(`Knowledge checks across the roadmap: ${totalChecks}`);

  // Broken prerequisites: an edge pointing at a topic outside this roadmap.
  const known = new Set(all.map((t) => t.slug));
  const broken: string[] = all.flatMap((t: TopicRow) =>
    t.prerequisites
      .filter((e) => !known.has(e.prerequisite.slug))
      .map((e) => `${t.slug} -> ${e.prerequisite.slug}`),
  );
  console.log(`Prerequisites pointing outside this roadmap: ${broken.length}`);
  if (broken.length) console.log("  " + broken.join("\n  "));
  console.log(`Reachable via prerequisite graph: ${reachable}/${all.length}`);
  if (firstBlock) console.log(`Unreachable required topic: ${firstBlock}`);

  // The learner-facing question: how far can they get before hitting a topic
  // with no lesson, following the roadmap in order?
  const done = new Set<string>();
  let walked = 0;
  let stoppedAt: string | null = null;
  outer: for (const p of rm.phases) {
    for (const t of p.topics) {
      const ready = t.prerequisites.every((e) => done.has(e.prerequisite.slug));
      if (!ready) {
        stoppedAt = `${t.slug} (prerequisites not met in roadmap order)`;
        break outer;
      }
      if (!t.lesson) {
        stoppedAt = `${t.slug} (no lesson — completable only by self-attestation)`;
        break outer;
      }
      done.add(t.slug);
      walked++;
    }
  }
  console.log(
    `\nUnbroken authored chain from topic 1: ${walked} topics` +
      (stoppedAt ? `, then ${stoppedAt}` : " — the whole roadmap"),
  );

  await db.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
