import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 reads the Migrate connection URL from here rather than from the
 * schema. The runtime client gets its connection separately, through the pg
 * driver adapter in src/lib/db.ts.
 *
 * Tests point Migrate at a throwaway database by setting DATABASE_URL to
 * TEST_DATABASE_URL before invoking the CLI (see vitest.globalSetup.ts).
 */
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
