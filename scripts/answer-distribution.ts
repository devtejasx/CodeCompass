import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Where the correct answer sits, per knowledge check, across every roadmap.
 *
 * The question this answers is an assessment-integrity one: if the correct
 * option is always in the same position, a learner can pass every check in a
 * course without reading a question. Options are rotated at seed time to
 * prevent that (see prisma/seed/lessons/shuffle.ts), and this reports the
 * result from the *database* rather than from the authored content, because
 * the seeding path is what decides what a learner actually sees.
 *
 * Grouped by roadmap so a course seeded through a different path cannot hide
 * inside a healthy overall average.
 *
 *   npx tsx scripts/answer-distribution.ts
 */
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const LETTERS = ["A", "B", "C", "D", "E", "F"];

interface Bucket {
  label: string;
  positions: number[];
}

function report(bucket: Bucket): { worst: number; total: number } {
  const counts = new Map<number, number>();
  for (const position of bucket.positions) {
    counts.set(position, (counts.get(position) ?? 0) + 1);
  }

  const total = bucket.positions.length;
  if (total === 0) {
    console.log(`\n${bucket.label}: no knowledge checks`);
    return { worst: 0, total: 0 };
  }

  const rows = [...counts.entries()].sort((a, b) => a[0] - b[0]);
  const worst = Math.max(...rows.map(([, count]) => count / total));

  console.log(`\n${bucket.label} — ${total} questions`);
  for (const [position, count] of rows) {
    const share = (count / total) * 100;
    const bar = "█".repeat(Math.round(share / 2));
    console.log(
      `  ${LETTERS[position] ?? position + 1}: ${String(count).padStart(3)}  ${share.toFixed(1).padStart(5)}%  ${bar}`,
    );
  }
  console.log(`  worst position share: ${(worst * 100).toFixed(1)}%`);

  return { worst, total };
}

async function main() {
  const checks = await db.knowledgeCheck.findMany({
    select: {
      options: { orderBy: { order: "asc" }, select: { isCorrect: true } },
      lesson: {
        select: {
          topic: {
            select: {
              phase: {
                select: {
                  roadmap: {
                    select: {
                      title: true,
                      kind: true,
                      career: { select: { slug: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const buckets = new Map<string, number[]>();

  for (const check of checks) {
    const roadmap = check.lesson.topic.phase.roadmap;
    const label =
      roadmap.kind === "ACADEMY"
        ? `${roadmap.title} (academy)`
        : `${roadmap.title} (${roadmap.career?.slug ?? "career"})`;

    const position = check.options.findIndex((option) => option.isCorrect);
    if (position < 0) continue;

    if (!buckets.has(label)) buckets.set(label, []);
    buckets.get(label)!.push(position);
  }

  console.log(`Correct-answer position, from the seeded database`);
  console.log("=".repeat(46));

  let failed = false;
  for (const [label, positions] of [...buckets].sort()) {
    const { worst } = report({ label, positions });
    if (worst > 0.5) failed = true;
  }

  const everything = [...buckets.values()].flat();
  report({ label: "ALL ROADMAPS", positions: everything });

  console.log(
    `\n${failed ? "FAIL" : "OK"}: no course may have more than half its answers in one position.`,
  );

  await db.$disconnect();
  if (failed) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
