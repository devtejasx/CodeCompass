import "dotenv/config";
import { beforeEach, afterAll } from "vitest";

// Every import of @/lib/db must resolve to the test database, so this is set
// before any module that reads DATABASE_URL is loaded.
if (!process.env.TEST_DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL is not set — refusing to run tests.");
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

const { db } = await import("@/lib/db");

beforeEach(async () => {
  // Cascades to profiles.
  await db.user.deleteMany();
});

afterAll(async () => {
  await db.user.deleteMany();
  await db.$disconnect();
});
