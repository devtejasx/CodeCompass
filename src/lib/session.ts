import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  onboardingCompleted: boolean;
}

/**
 * Reads the session and re-reads the user from the database.
 *
 * Going back to Postgres on every protected render is deliberate: it means a
 * deleted user or a just-completed onboarding is reflected immediately, rather
 * than whenever the JWT happens to be reissued.
 *
 * Wrapped in React's `cache`, which memoises per *request* rather than across
 * them, so that guarantee is untouched — a new request still re-reads the row.
 * What it removes is a duplicate: the authenticated layout proves who the user
 * is, and so does every page beneath it, and React renders those concurrently.
 * Uncached that was two `auth()` calls and two `user.findUnique` round trips on
 * every single authenticated render, before any of the page's own data. Nested
 * layouts and server actions calling this in the same request collapse onto the
 * same read for the same reason.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      profile: { select: { onboardingCompleted: true } },
    },
  });

  if (!user) return null; // session outlived the account

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    onboardingCompleted: user.profile?.onboardingCompleted ?? false,
  };
});

/** Require a signed-in user, or bounce to login. */
export async function requireUser(callbackUrl?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    const target = callbackUrl
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/login";
    redirect(target);
  }
  return user;
}

/** Require a signed-in user who has finished onboarding. */
export async function requireOnboardedUser(): Promise<CurrentUser> {
  const user = await requireUser("/dashboard");
  if (!user.onboardingCompleted) {
    redirect("/onboarding");
  }
  return user;
}
