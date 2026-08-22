/**
 * Message scrubbing, on this side of the boundary.
 *
 * The application scrubs everything it receives as well, and that is not
 * redundancy for its own sake: the two sides know different things. The
 * application knows what its own infrastructure looks like; this service knows
 * what the *sandbox* looks like - that the work directory is /work, that the
 * runner lives in /opt/cc, that a container id is a long hex run. A compiler
 * error naming those is scrubbed here, where the knowledge is, and scrubbed
 * again there, where a different set of secrets lives.
 *
 * What survives is genuinely useful. A beginner needs the compiler's line
 * number and its complaint; throwing those away to be safe would make
 * compilation errors unactionable, which is the failure mode this whole
 * distinction exists to avoid.
 */

const REDACTIONS: { pattern: RegExp; replacement: string }[] = [
  // The learner's own file, named first and specifically, so the generic path
  // rule below cannot reduce "/work/main.cpp:12:5: error" to "<path>: error"
  // and lose the fact that the error was in their code at all.
  { pattern: /\/work\/(?:main|Main|Solution)\.[A-Za-z]+/g, replacement: "your code" },
  { pattern: /\/opt\/cc\/\S*/g, replacement: "<runner>" },
  { pattern: /\/work\/\S*/g, replacement: "<file>" },
  // Any other absolute path: a compiler quoting its own include tree is
  // describing the image's filesystem, which is not the learner's business.
  { pattern: /(?:\/[\w.@+-]+){2,}\/?/g, replacement: "<path>" },
  { pattern: /\b[a-z][a-z0-9+.-]*:\/\/[^\s"')]+/gi, replacement: "<url>" },
  { pattern: /\b\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?\b/g, replacement: "<address>" },
  // Container and image ids.
  { pattern: /\b[0-9a-f]{12,}\b/gi, replacement: "<id>" },
];

/** Nothing but placeholders and punctuation left. */
const EMPTY = /^(?:<path>|<url>|<address>|<id>|<file>|<runner>|[\s:,-])+$/;

/**
 * Cleans and caps a compiler or runtime message.
 *
 * Returns null when nothing useful survives, because "<path>: <id>" tells a
 * learner nothing and tells an attacker that they hit something.
 */
export function scrub(raw: string | null | undefined, maxChars = 4_000): string | null {
  if (!raw) return null;

  const lines = raw
    .split(/\r?\n/)
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
  if (EMPTY.test(message)) return null;

  return message.length <= maxChars
    ? message
    : `${message.slice(0, maxChars)}\n[truncated]`;
}

/** Caps one captured return value before it goes into a response. */
export function capValue(value: string, limit = 2_000): string {
  return value.length <= limit ? value : `${value.slice(0, limit)}[truncated]`;
}
