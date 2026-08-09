import { EXECUTION_LIMITS } from "./types";

/**
 * Output scrubbing.
 *
 * A compiler message is genuinely useful to a learner, and a raw one is a leak:
 * it carries the sandbox's filesystem layout, its hostname, sometimes an
 * internal URL. Everything coming back from the execution service passes
 * through here before it is stored, let alone rendered.
 *
 * The rule is subtractive — we remove what we recognise as infrastructure and
 * keep the rest — so a message we fail to recognise is truncated and generic
 * rather than helpfully detailed about our internals.
 */

/** Ordered: earlier patterns must not be broken by later ones. */
const REDACTIONS: { pattern: RegExp; replacement: string }[] = [
  // Absolute POSIX paths, including the temporary directory a sandbox uses.
  { pattern: /(?:\/[\w.@+-]+){2,}\/?/g, replacement: "<path>" },
  // Windows paths.
  { pattern: /[A-Za-z]:\\[^\s"')]+/g, replacement: "<path>" },
  // Any URL — an internal service address is the worst thing to echo back.
  { pattern: /\b[a-z][a-z0-9+.-]*:\/\/[^\s"')]+/gi, replacement: "<url>" },
  // Bare IPv4, with or without a port.
  { pattern: /\b\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?\b/g, replacement: "<address>" },
  // Container and pod identifiers (long hex runs).
  { pattern: /\b[0-9a-f]{12,}\b/gi, replacement: "<id>" },
  // Anything shaped like an assignment of a secret.
  {
    pattern: /\b([A-Z][A-Z0-9_]{2,}(?:KEY|TOKEN|SECRET|PASSWORD|URL))\s*=\s*\S+/g,
    replacement: "$1=<redacted>",
  },
];

/**
 * Stack frames that only describe the harness, not the learner's code. Kept
 * separate from REDACTIONS because whole lines go, not fragments.
 */
const HARNESS_LINE = /^\s*(?:at\s+|File\s+"|\s{4}from\s)/;

/**
 * Cleans a compiler or runtime message for display.
 *
 * Returns null for a message that is entirely infrastructure — better to show
 * nothing than to show "<path>: <id>".
 */
export function sanitiseMessage(raw: string | null | undefined): string | null {
  if (!raw) return null;

  const lines = raw
    .split(/\r?\n/)
    // Harness frames are noise to a beginner and detail to an attacker.
    .filter((line) => !HARNESS_LINE.test(line))
    .map((line) => {
      let cleaned = line;
      for (const { pattern, replacement } of REDACTIONS) {
        cleaned = cleaned.replace(pattern, replacement);
      }
      return cleaned.trimEnd();
    })
    .filter((line) => line.trim().length > 0);

  const message = lines.join("\n").trim();
  if (message.length === 0) return null;
  // A message that is nothing but placeholders tells the learner nothing and
  // confirms to an attacker that they hit something.
  if (/^(?:<path>|<url>|<address>|<id>|[\s:,-])+$/.test(message)) return null;

  return truncate(message, EXECUTION_LIMITS.maxMessageChars);
}

/**
 * Caps a captured value for storage and display. A program that prints a
 * gigabyte should cost us a kilobyte.
 */
export function sanitiseOutput(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;
  return truncate(raw, EXECUTION_LIMITS.maxOutputChars);
}

function truncate(value: string, limit: number): string {
  return value.length <= limit ? value : `${value.slice(0, limit)}\n… truncated`;
}
