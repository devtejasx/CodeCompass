import { config } from "./config.js";
import { isLanguage, type ExecuteRequest, type WireTestCase } from "./types.js";

/**
 * Request validation.
 *
 * Hand-written and dependency-free on purpose. This service has no npm
 * dependencies at all: its whole job is to be the thing standing between
 * hostile input and a container runtime, and every package it installed would
 * be another author with a commit bit on that boundary. A hundred lines of
 * explicit checks is a fair price for a lockfile with nothing in it.
 *
 * Validation is total. A request either produces an ExecuteRequest with every
 * field present, in range and of the right type, or it produces a reason -
 * there is no partial acceptance and no coercion of a nearly-right value.
 */

export type Validation =
  { ok: true; request: ExecuteRequest } | { ok: false; reason: string };

function bad(reason: string): Validation {
  return { ok: false, reason };
}

/** Bytes, not characters: the limit exists to bound memory, and UTF-8 varies. */
function byteLength(value: string): number {
  return Buffer.byteLength(value, "utf8");
}

function asInt(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (!Number.isInteger(value)) return null;
  return value;
}

export function validateExecuteRequest(body: unknown): Validation {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return bad("body must be a JSON object");
  }
  const raw = body as Record<string, unknown>;

  if (!isLanguage(raw.language)) return bad("language is not a supported language");

  if (typeof raw.code !== "string") return bad("code must be a string");
  if (raw.code.length === 0) return bad("code must not be empty");
  if (byteLength(raw.code) > config.limits.maxCodeBytes) {
    return bad("code exceeds the size limit");
  }

  if (typeof raw.entryPoint !== "string") return bad("entryPoint must be a string");
  // The entry point is interpolated into generated source in five languages. A
  // name that is not an identifier is the one input that could turn harness
  // generation into code injection, so it is checked against the shape all five
  // languages agree on rather than escaped per language.
  if (!/^[A-Za-z_][A-Za-z0-9_]{0,63}$/.test(raw.entryPoint)) {
    return bad("entryPoint is not a plain identifier");
  }

  const timeLimitMs = asInt(raw.timeLimitMs);
  if (timeLimitMs === null || timeLimitMs <= 0) {
    return bad("timeLimitMs must be a positive integer");
  }
  const memoryLimitMb = asInt(raw.memoryLimitMb);
  if (memoryLimitMb === null || memoryLimitMb <= 0) {
    return bad("memoryLimitMb must be a positive integer");
  }

  if (!Array.isArray(raw.tests)) return bad("tests must be an array");
  if (raw.tests.length === 0) return bad("tests must not be empty");
  if (raw.tests.length > config.limits.maxTests) return bad("too many tests");

  const tests: WireTestCase[] = [];
  const seen = new Set<number>();

  for (const entry of raw.tests) {
    if (typeof entry !== "object" || entry === null) {
      return bad("a test is not an object");
    }
    const test = entry as Record<string, unknown>;

    const order = asInt(test.order);
    if (order === null || order < 0) return bad("a test has no usable order");
    // Duplicate orders would make the response ambiguous: the application keys
    // outcomes by order, so two cases sharing one would silently drop a result.
    if (seen.has(order)) return bad("two tests share an order");
    seen.add(order);

    if (typeof test.input !== "string") return bad("a test input is not a string");
    if (typeof test.expectedOutput !== "string") {
      return bad("a test expectedOutput is not a string");
    }
    if (
      byteLength(test.input) > config.limits.maxTestBytes ||
      byteLength(test.expectedOutput) > config.limits.maxTestBytes
    ) {
      return bad("a test case exceeds the size limit");
    }

    // Both are JSON by contract, and the harness embeds them in generated
    // source. Parsing here means a malformed case fails as a bad request rather
    // than as a compile error blamed on the learner.
    let parsedInput: unknown;
    try {
      parsedInput = JSON.parse(test.input);
    } catch {
      return bad("a test input is not valid JSON");
    }
    if (!Array.isArray(parsedInput)) return bad("a test input is not a JSON array");
    try {
      JSON.parse(test.expectedOutput);
    } catch {
      return bad("a test expectedOutput is not valid JSON");
    }

    tests.push({ order, input: test.input, expectedOutput: test.expectedOutput });
  }

  return {
    ok: true,
    request: {
      language: raw.language,
      code: raw.code,
      entryPoint: raw.entryPoint,
      tests,
      // Clamped rather than rejected. The application clamps these too; a
      // request asking for more is a misconfiguration on its side, not an
      // attack, and refusing it would take Practice down over a wrong number.
      timeLimitMs: Math.min(timeLimitMs, config.limits.maxTimeLimitMs),
      memoryLimitMb: Math.min(memoryLimitMb, config.limits.maxMemoryLimitMb),
    },
  };
}
