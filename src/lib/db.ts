import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 7 connects through a driver adapter rather than a URL in the schema.
 *
 * The client is created lazily, on first use, and cached on globalThis so
 * Next's dev-mode hot reload doesn't open a new connection pool on every
 * recompile.
 *
 * Laziness is what makes the app buildable without a database. `next build`
 * imports every route to collect its configuration; constructing the client at
 * module load meant a missing DATABASE_URL failed the *build* with "Failed to
 * collect page data for /careers", which points at the wrong thing entirely.
 * Deferring it means a build needs no database and a genuine misconfiguration
 * still fails loudly — at the first query, where the message makes sense.
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

type Client = ReturnType<typeof createClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: Client | undefined;
};

/**
 * Memoised unconditionally, including in production.
 *
 * The usual Next.js guard caches on globalThis only outside production,
 * because there the client is a module-level constant that Node evaluates
 * once. Here it is not: it is built inside this function, which the proxy
 * below calls on *every property access*. Skipping the cache in production
 * therefore meant `db.user.findUnique(...)` and `db.topic.findMany(...)` each
 * constructed a fresh PrismaClient with a fresh pg connection pool, so a
 * single page render opened one pool per query and Postgres refused new
 * clients within a few requests (P2037). Development was unaffected, which is
 * why it survived this long.
 *
 * One client per process is what the pool is for, so caching it always is both
 * the fix and the intended behaviour.
 */
function client(): Client {
  const existing = globalForPrisma.prisma;
  if (existing) return existing;

  const created = createClient();
  globalForPrisma.prisma = created;
  return created;
}

/**
 * The Prisma client, behind a proxy that builds it on first property access.
 *
 * Call sites are unchanged — `db.user.findUnique(...)`, `db.$disconnect()` and
 * `db.$transaction(...)` all behave exactly as before. Methods are bound to the
 * real client so `this` survives the indirection.
 */
export const db: Client = new Proxy({} as Client, {
  get(_target, property) {
    const instance = client();
    const value = Reflect.get(instance, property, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
