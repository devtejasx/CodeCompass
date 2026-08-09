import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { signInSchema } from "@/lib/validation/auth";

/**
 * A real bcrypt hash of a value nobody will submit. When an email doesn't
 * exist we still run a comparison against it so "unknown email" and "wrong
 * password" take the same amount of time — otherwise response timing leaks
 * which addresses are registered.
 */
const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.4iVXjmqLZ0YEjbBSMTPTPFP1AhiOtiu";

export const BCRYPT_ROUNDS = 12;

export interface VerifiedUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

/**
 * Validates credentials against the database.
 *
 * Returns null for every failure mode — bad input, unknown email, wrong
 * password — so callers cannot accidentally surface which one occurred.
 */
export async function verifyCredentials(
  credentials: unknown,
): Promise<VerifiedUser | null> {
  const parsed = signInSchema.safeParse(credentials);
  if (!parsed.success) return null;

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    return null;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  // The password hash never leaves this function.
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
  };
}
