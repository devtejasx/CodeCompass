/**
 * Submission URL validation.
 *
 * Two things this deliberately does NOT do.
 *
 * It does not fetch the URL. Asking the server to request an arbitrary address
 * a user supplied is server-side request forgery — it would let someone use
 * CodeCompass to probe our own internal network, and it would leak whether a
 * private host exists from the timing alone. The URL is stored as text.
 *
 * And it does not claim the link works. Nothing here has visited it; the UI
 * says "as provided by you" rather than implying verification. Phase 8 is where
 * GitHub actually gets involved, and it will do so through GitHub's API with
 * the user's own authorisation, not by us fetching arbitrary addresses.
 */

/** Longer than any legitimate repository or deployment URL. */
const MAX_URL_LENGTH = 2_048;

export interface UrlCheck {
  ok: boolean;
  /** Normalised URL, when valid. */
  value?: string;
  error?: string;
}

/**
 * Accepts a plausible https URL and rejects everything else.
 *
 * http is refused as well as the obviously dangerous schemes: a learner
 * publishing their work should be publishing it over TLS, and accepting http
 * teaches the opposite.
 */
export function checkUrl(raw: string, label: string): UrlCheck {
  const trimmed = raw.trim();

  if (trimmed.length === 0) return { ok: true, value: undefined };

  if (trimmed.length > MAX_URL_LENGTH) {
    return { ok: false, error: `That ${label} is too long to be a real URL.` };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      ok: false,
      error: `That doesn't look like a URL. It should start with https://`,
    };
  }

  // An allowlist, not a blocklist: javascript:, data:, file: and every other
  // scheme somebody invents are refused by default rather than by enumeration.
  if (parsed.protocol !== "https:") {
    return {
      ok: false,
      error: `The ${label} must start with https:// — http and other schemes aren't accepted.`,
    };
  }

  if (!parsed.hostname.includes(".") || parsed.hostname.endsWith(".")) {
    return { ok: false, error: `That ${label} doesn't have a valid domain name.` };
  }

  // Credentials in a URL are almost always an accident, and storing them would
  // mean storing a secret we were never meant to see.
  if (parsed.username || parsed.password) {
    return {
      ok: false,
      error: `Remove the username and password from the ${label} before saving it.`,
    };
  }

  return { ok: true, value: parsed.toString() };
}

/** Recognises the common forges, for display only. Never used to gate anything. */
export function hostLabel(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
