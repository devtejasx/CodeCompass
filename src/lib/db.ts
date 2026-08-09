import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 7 connects through a driver adapter rather than a URL in the schema.
 *
 * The client is cached on globalThis so Next's dev-mode hot reload doesn't open
 * a new connection pool on every recompile.
 */
const createClient = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and fill it in.",
    );
  }

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
