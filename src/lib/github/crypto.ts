import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

/**
 * Encryption for GitHub access tokens at rest.
 *
 * AES-256-GCM, which is authenticated: a ciphertext that has been tampered with
 * fails to decrypt rather than quietly producing wrong plaintext. The key comes
 * from the environment and never from the database, so a database dump on its
 * own does not yield a single usable token.
 *
 * `server-only` at the top is load-bearing. Importing this file from a client
 * component is a build error, not a code-review comment.
 *
 * What this file must never do, and does not: log a token, log a key, include
 * either in a thrown error, or return plaintext to anything that is not the
 * GitHub service.
 */

/** AES-256 needs exactly 32 bytes; GCM's standard nonce is 12. */
const KEY_BYTES = 32;
const IV_BYTES = 12;
/**
 * Full-length GCM tag, stated explicitly on both sides.
 *
 * Without it Node will accept a *shorter* tag on decryption, which weakens the
 * authentication GCM exists to provide — a truncated tag is easier to forge.
 * Pinning it to 16 bytes refuses anything else.
 */
const TAG_BYTES = 16;

/** Bumped when the key changes, so stored rows say which key opened them. */
export const CURRENT_KEY_VERSION = 1;

export interface SealedToken {
  cipher: string;
  iv: string;
  tag: string;
  keyVersion: number;
}

export class TokenCryptoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TokenCryptoError";
  }
}

/**
 * Reads and validates the key.
 *
 * Accepts base64 or hex, and insists on a full 32 bytes — a short key is a
 * configuration mistake that would otherwise silently weaken every token. The
 * key itself is never included in any error raised here.
 */
function key(): Buffer {
  const raw = process.env.GITHUB_TOKEN_ENCRYPTION_KEY?.trim();

  if (!raw) {
    throw new TokenCryptoError(
      "GITHUB_TOKEN_ENCRYPTION_KEY is not set. GitHub integration cannot store tokens without it.",
    );
  }

  const decoded = /^[0-9a-f]{64}$/i.test(raw)
    ? Buffer.from(raw, "hex")
    : Buffer.from(raw, "base64");

  if (decoded.length !== KEY_BYTES) {
    throw new TokenCryptoError(
      `GITHUB_TOKEN_ENCRYPTION_KEY must decode to ${KEY_BYTES} bytes; got ${decoded.length}.`,
    );
  }

  return decoded;
}

/** Whether a usable key is configured. Used to fail closed, never to warn-and-continue. */
export function isEncryptionConfigured(): boolean {
  try {
    key();
    return true;
  } catch {
    return false;
  }
}

/** Encrypts a token for storage. A fresh IV every time — never reused. */
export function sealToken(plaintext: string): SealedToken {
  if (plaintext.length === 0) {
    throw new TokenCryptoError("Refusing to encrypt an empty token.");
  }

  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key(), iv, {
    authTagLength: TAG_BYTES,
  });

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);

  return {
    cipher: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    keyVersion: CURRENT_KEY_VERSION,
  };
}

/**
 * Decrypts a stored token.
 *
 * Throws on a wrong key, a corrupted ciphertext or a tampered auth tag — GCM
 * cannot be fooled into returning something plausible. Callers treat a throw as
 * "this connection needs re-authorising", which is the only honest reading.
 */
export function openToken(sealed: { cipher: string; iv: string; tag: string }): string {
  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      key(),
      Buffer.from(sealed.iv, "base64"),
      { authTagLength: TAG_BYTES },
    );
    decipher.setAuthTag(Buffer.from(sealed.tag, "base64"));

    return Buffer.concat([
      decipher.update(Buffer.from(sealed.cipher, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    // Deliberately opaque: the reason it failed is not the caller's business
    // and would only help somebody probing.
    throw new TokenCryptoError("Stored GitHub token could not be decrypted.");
  }
}

/**
 * Constant-time comparison for the OAuth state parameter.
 *
 * A plain `===` on a secret leaks its prefix through timing. This is cheap
 * insurance on a value that exists specifically to stop CSRF.
 */
export function safeEquals(a: string, b: string): boolean {
  // Hashing first makes both sides a fixed 32 bytes, so timingSafeEqual cannot
  // throw on a length mismatch — and length alone stops leaking.
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

/** A URL-safe random value, for OAuth state. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}
