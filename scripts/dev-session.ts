/**
 * Prints an Auth.js session cookie for a local development user.
 *
 * A development affordance for inspecting the authenticated pages — in a
 * browser at real viewport widths, or with curl — without a sign-in round trip
 * for every check. It signs a JWT with the project's own AUTH_SECRET for a user
 * id that must already exist; nothing is written, and no account is created.
 *
 *   npx tsx scripts/dev-session.ts <userId>
 *
 * Refuses to run against a non-local database, because the output is a bearer
 * credential for whoever holds it and there is no reason to mint one for a
 * deployed environment.
 */
import "dotenv/config";
import { encode } from "@auth/core/jwt";

/** The development cookie name — no __Secure- prefix, since dev is over http. */
const COOKIE = "authjs.session-token";

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    throw new Error("usage: npx tsx scripts/dev-session.ts <userId>");
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set.");

  const url = process.env.DATABASE_URL ?? "";
  if (!/@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url)) {
    throw new Error(
      "Refusing to mint a session: DATABASE_URL does not point at a local database.",
    );
  }

  const token = await encode({
    token: { id: userId, sub: userId },
    secret,
    salt: COOKIE,
    maxAge: 30 * 24 * 60 * 60,
  });

  console.log(`${COOKIE}=${token}`);
}

void main();
