import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { DEPTH_FLOOR } from "../prisma/seed/lessons/coverage";
import { DELEGATED_TOPICS } from "../src/lib/learn/delegation";

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
                  sections: { select: { code: true } },
                  resources: { select: { id: true } },
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

  // A topic taught in an Academy is covered, not missing. Counting delegation
  // as a gap would overstate the work left and understate what a learner can
  // actually reach.
  const delegated = all.filter((t) => !t.lesson && t.slug in DELEGATED_TOPICS);
  const missing = all.filter((t) => !t.lesson && !(t.slug in DELEGATED_TOPICS));

  console.log(`\nTopics: ${all.length} (required ${all.filter((t) => t.isRequired).length})`);
  console.log(`Taught by a Frontend lesson: ${withLesson}`);
  console.log(
    `Delegated to an Academy: ${delegated.length}` +
      (delegated.length ? ` (${delegated.map((t) => t.slug).join(", ")})` : ""),
  );
  console.log(`Genuinely missing a lesson: ${missing.length}`);
  console.log(
    `Covered one way or the other: ${withLesson + delegated.length}/${all.length}` +
      ` (${Math.round(((withLesson + delegated.length) / all.length) * 100)}%)`,
  );
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

  // A cycle would make every topic in it permanently locked, so it is worth
  // reporting explicitly rather than inferring it from the reachability count.
  const edges = new Map(
    all.map((t) => [t.slug, t.prerequisites.map((e) => e.prerequisite.slug)]),
  );
  const cycles: string[] = [];
  const state = new Map<string, "open" | "done">();
  const walk = (slug: string, trail: string[]) => {
    if (state.get(slug) === "done") return;
    if (state.get(slug) === "open") {
      cycles.push([...trail.slice(trail.indexOf(slug)), slug].join(" -> "));
      return;
    }
    state.set(slug, "open");
    for (const next of edges.get(slug) ?? []) walk(next, [...trail, slug]);
    state.set(slug, "done");
  };
  for (const t of all) walk(t.slug, []);
  console.log(`Circular prerequisites: ${cycles.length}`);
  if (cycles.length) console.log("  " + cycles.join("\n  "));

  // ── Content depth ────────────────────────────────────────────────────
  // Coverage means nothing if a "covered" topic is a stub, so the same floors
  // the test suite enforces are reported here against the seeded rows.
  const lessons = all.filter((t) => t.lesson);
  const shallow = lessons.filter(
    (t) =>
      t.lesson!._count.sections < DEPTH_FLOOR.sections ||
      t.lesson!._count.knowledgeChecks < DEPTH_FLOOR.knowledgeChecks,
  );
  const checkCounts = lessons.map((t) => t.lesson!._count.knowledgeChecks);
  const sectionCounts = lessons.map((t) => t.lesson!._count.sections);
  const avg = (xs: number[]) =>
    xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1) : "0";

  console.log(
    `\nKnowledge checks per lesson: min ${Math.min(...checkCounts)}, avg ${avg(checkCounts)}, max ${Math.max(...checkCounts)}`,
  );
  console.log(
    `Sections per lesson: min ${Math.min(...sectionCounts)}, avg ${avg(sectionCounts)}, max ${Math.max(...sectionCounts)}`,
  );
  console.log(`Lessons below the depth floor: ${shallow.length}`);
  if (shallow.length) console.log("  " + shallow.map((t) => t.slug).join(", "));

  // Code and resources are expectations rather than hard rules — a conceptual
  // topic legitimately needs neither — so these are listed, not failed.
  const noCode = lessons.filter((t) => t.lesson!.sections.every((s) => !s.code));
  const noResources = lessons.filter((t) => t.lesson!.resources.length === 0);
  console.log(`Lessons with no code example: ${noCode.length}`);
  if (noCode.length) console.log("  " + noCode.map((t) => t.slug).join(", "));
  console.log(`Lessons with no linked resource: ${noResources.length}`);
  if (noResources.length) console.log("  " + noResources.map((t) => t.slug).join(", "));

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
      // Delegation is not a stop: the learner keeps going, in an Academy.
      if (!t.lesson && !(t.slug in DELEGATED_TOPICS)) {
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
