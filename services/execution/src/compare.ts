/**
 * Answer comparison.
 *
 * This mirrors `equalValues` in the application repository's
 * scripts/verify-solutions.ts, and that is a requirement rather than a
 * coincidence: that script is what certifies the three hundred reference
 * solutions against their own test cases, so a rule this service applies more
 * strictly would fail submissions the answer key itself would fail.
 *
 * The rules, all of them:
 *
 *   Two integers are equal when they are the same integer. No tolerance - a
 *   count that is off by one is wrong, and calling it close is not a kindness.
 *
 *   A comparison where either side is a non-integer number is within tolerance
 *   at 1e-6. Floating point arrives at slightly different answers in five
 *   languages doing the same arithmetic, and a problem about geometry should
 *   not be a problem about IEEE 754.
 *
 *   Arrays are compared element-wise and in order, so a problem whose answer is
 *   a set must say so in its statement and sort before returning. The catalog
 *   does; changing that here would silently accept wrong answers for every
 *   problem that legitimately cares about order.
 *
 *   Everything else - strings, booleans, null, objects - is compared by its
 *   JSON encoding, which is exact.
 */

const EPSILON = 1e-6;

export function equalValues(expected: unknown, actual: unknown): boolean {
  if (typeof expected === "number" && typeof actual === "number") {
    if (Number.isInteger(expected) && Number.isInteger(actual)) {
      return expected === actual;
    }
    // NaN and the infinities fall through to the tolerance check and fail it,
    // which is the same answer scripts/verify-solutions.ts gives and the right
    // one: JSON can encode neither, so a harness that produced one has an
    // answer no expected value can match. Every harness here encodes them as
    // null for that reason, and null is compared exactly.
    return Math.abs(expected - actual) <= EPSILON;
  }
  if (Array.isArray(expected) && Array.isArray(actual)) {
    return (
      expected.length === actual.length &&
      expected.every((value, index) => equalValues(value, actual[index]))
    );
  }
  return JSON.stringify(expected) === JSON.stringify(actual);
}

/**
 * Compares one case's JSON-encoded expected value against the JSON the harness
 * produced.
 *
 * Either side failing to parse is a mismatch, not a crash. Unparseable output
 * means the sandbox printed something the harness did not write - which is a
 * failure, and the one thing it must never be is a pass.
 */
export function matches(expectedJson: string, actualJson: string): boolean {
  let expected: unknown;
  let actual: unknown;
  try {
    expected = JSON.parse(expectedJson);
  } catch {
    return false;
  }
  try {
    actual = JSON.parse(actualJson);
  } catch {
    return false;
  }
  return equalValues(expected, actual);
}
