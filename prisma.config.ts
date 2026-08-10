import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 reads the Migrate connection URL from here rather than from the
 * schema. The runtime client gets its connection separately, through the pg
 * driver adapter in src/lib/db.ts.
 *
 * Tests point Migrate at a throwaway database by setting DATABASE_URL to
 * TEST_DATABASE_URL before invoking the CLI (see tests/global-setup.ts).
 *
 * NOTE on `process.env` rather than Prisma's `env()` helper: `env()` resolves
 * eagerly and *throws while loading this file* when a variable is missing. That
 * makes `prisma generate` — which needs no database at all — fail on any build
 * host that has no `.env` and no reason to set SHADOW_DATABASE_URL. Reading the
 * variables directly keeps generate working everywhere, and the commands that
 * genuinely need a URL still fail loudly when it is absent, just at the point
 * they actually use it.
 */
const databaseUrl = process.env.DATABASE_URL ?? "";

/**
 * Throwaway database Prisma replays migrations into when diffing. Only needed
 * by `migrate diff --from-migrations`, which is how migrations are authored
 * here since the CLI's interactive `migrate dev` cannot run in this
 * environment. Never needed by `migrate deploy`, so it stays optional.
 */
const shadowDatabaseUrl = process.env.SHADOW_DATABASE_URL;

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
    ...(shadowDatabaseUrl ? { shadowDatabaseUrl } : {}),
  },
});
