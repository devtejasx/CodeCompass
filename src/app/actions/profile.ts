"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import {
  normaliseUsername,
  USERNAME_MAX,
  USERNAME_MESSAGE,
  validateUsername,
} from "@/lib/profile/username";

/**
 * Profile mutations.
 *
 * Every action derives the learner from the session and writes with
 * `where: { userId: user.id }`. No action accepts a user id, so there is no
 * request shape that could modify somebody else's profile, username or privacy
 * settings.
 *
 * Publishing is treated as consequential: it is off by default, each section
 * has its own switch, and turning the master switch off is enough to make the
 * public page a 404 without having to unwind the individual settings.
 */

export interface ProfileResult {
  ok: boolean;
  error?: string;
  username?: string;
}

const GENERIC_ERROR = "Something went wrong. Please try again in a moment.";

const usernameInput = z.object({
  username: z.string().trim().min(1).max(USERNAME_MAX),
});

/**
 * Claims a username.
 *
 * Uniqueness is checked, and then relied on at the database level: two people
 * submitting the same name in the same instant is a race a lookup cannot win,
 * so the unique constraint is what actually decides and the violation is
 * translated back into the same message.
 */
export async function setUsername(input: unknown): Promise<ProfileResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in." };

  const parsed = usernameInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: USERNAME_MESSAGE.INVALID_CHARACTERS };
  }

  const username = normaliseUsername(parsed.data.username);
  const problem = validateUsername(username);
  if (problem) return { ok: false, error: USERNAME_MESSAGE[problem] };

  try {
    const taken = await db.profile.findFirst({
      where: { username, NOT: { userId: user.id } },
      select: { id: true },
    });
    if (taken) return { ok: false, error: "That username is already taken." };

    await db.profile.update({
      where: { userId: user.id },
      data: { username },
    });

    revalidatePath("/profile");
    revalidatePath(`/u/${username}`);

    return { ok: true, username };
  } catch (error) {
    // P2002 is the unique constraint doing the job a lookup cannot: two people
    // claiming the same name at the same moment.
    if (
      typeof error === "object" &&
      error !== null &&
      (error as { code?: string }).code === "P2002"
    ) {
      return { ok: false, error: "That username is already taken." };
    }

    console.error("[setUsername] failed to set username");
    return { ok: false, error: GENERIC_ERROR };
  }
}

const visibilityInput = z.object({
  isPublic: z.boolean().optional(),
  publicShowProjects: z.boolean().optional(),
  publicShowSkills: z.boolean().optional(),
  publicShowProgress: z.boolean().optional(),
  publicShowGitHub: z.boolean().optional(),
});

/**
 * Updates privacy settings.
 *
 * Every field is optional so a single toggle sends one field rather than the
 * whole object — which means a stale form cannot silently re-enable something
 * the learner turned off in another tab.
 *
 * Publishing requires a username, because there would otherwise be no address
 * for the profile and "public" would be a setting with no observable effect.
 */
export async function setProfileVisibility(input: unknown): Promise<ProfileResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in." };

  const parsed = visibilityInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That setting could not be understood." };

  try {
    if (parsed.data.isPublic === true) {
      const profile = await db.profile.findUnique({
        where: { userId: user.id },
        select: { username: true },
      });

      if (!profile?.username) {
        return {
          ok: false,
          error: "Choose a username before making your profile public.",
        };
      }
    }

    const updated = await db.profile.update({
      where: { userId: user.id },
      data: parsed.data,
      select: { username: true },
    });

    revalidatePath("/profile");
    revalidatePath("/profile/settings");
    if (updated.username) revalidatePath(`/u/${updated.username}`);

    return { ok: true };
  } catch {
    console.error("[setProfileVisibility] failed to update visibility");
    return { ok: false, error: GENERIC_ERROR };
  }
}
