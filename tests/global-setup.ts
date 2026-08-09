import { execSync } from "node:child_process";
import "dotenv/config";

/**
 * Applies migrations to the dedicated test database once per run.
 *
 * TEST_DATABASE_URL is copied into DATABASE_URL for the CLI so Prisma Migrate
 * targets the throwaway database and can never touch the development one.
 */
export default function globalSetup() {
  const url = process.env.TEST_DATABASE_URL;

  if (!url) {
    throw new Error(
      "TEST_DATABASE_URL is not set. Copy .env.example to .env and fill it in.",
    );
  }

  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
}
