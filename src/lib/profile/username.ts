/**
 * Public usernames.
 *
 * A username is the only public identifier CodeCompass exposes. Database ids
 * are never used in a URL: `/u/<cuid>` would publish the key that appears in
 * every other table, and once a URL like that exists somewhere it is permanent.
 *
 * Kept pure so the rules are testable without a database. Uniqueness is the one
 * check that needs one, and it lives in the action.
 */

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;

/** Lowercase letters, digits, hyphen and underscore. No leading punctuation. */
const USERNAME_PATTERN = /^[a-z0-9][a-z0-9_-]{1,28}[a-z0-9]$/;

/**
 * Names that would collide with a route, imply an official account, or be
 * confusing on a support ticket.
 *
 * Reserved rather than merely discouraged: `/u/admin` looking like an official
 * page is a social-engineering problem, not an aesthetic one.
 */
export const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "api",
  "app",
  "auth",
  "careers",
  "codecompass",
  "dashboard",
  "help",
  "login",
  "logout",
  "moderator",
  "new",
  "official",
  "onboarding",
  "practice",
  "profile",
  "projects",
  "roadmap",
  "root",
  "settings",
  "signup",
  "staff",
  "support",
  "system",
  "team",
  "u",
  "user",
  "users",
]);

export type UsernameError =
  "TOO_SHORT" | "TOO_LONG" | "INVALID_CHARACTERS" | "RESERVED";

export const USERNAME_MESSAGE: Record<UsernameError, string> = {
  TOO_SHORT: `Usernames need at least ${USERNAME_MIN} characters.`,
  TOO_LONG: `Usernames can be at most ${USERNAME_MAX} characters.`,
  INVALID_CHARACTERS:
    "Use lowercase letters, numbers, hyphens and underscores, starting and ending with a letter or number.",
  RESERVED: "That username isn't available.",
};

/**
 * Normalises then validates.
 *
 * Case is folded rather than rejected, because "Tejas" and "tejas" being
 * different accounts is a phishing surface, not a feature.
 */
export function normaliseUsername(input: string): string {
  return input.trim().toLowerCase();
}

export function validateUsername(input: string): UsernameError | null {
  const username = normaliseUsername(input);

  if (username.length < USERNAME_MIN) return "TOO_SHORT";
  if (username.length > USERNAME_MAX) return "TOO_LONG";
  if (!USERNAME_PATTERN.test(username)) return "INVALID_CHARACTERS";
  if (RESERVED_USERNAMES.has(username)) return "RESERVED";

  return null;
}
