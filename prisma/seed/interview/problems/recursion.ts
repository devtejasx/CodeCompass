import type { SeedProblem } from "../../problems/types";

/**
 * Recursion.
 *
 * The point of this file is not that these problems need recursion — several
 * are shorter as loops, and the explanations say so. The point is the habit:
 * name the base case, describe the answer for size n in terms of size n-1, and
 * then *trust the call* instead of tracing it. Learners who cannot do the last
 * part end up unable to write six lines of tree code, which is what the next
 * phase is made of.
 *
 * So the file starts where the recursion is obviously overkill (reversing text)
 * and ends where the iterative version is the harder one to get right (Hanoi,
 * grouped reversal). Halving recursion appears in the middle, because "solve
 * half the problem" is the shape binary search already taught and the shape
 * divide-and-conquer will reuse.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const RECURSION_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "reverse-text-recursively",
    title: "Reverse Text, Recursively",
    difficulty: "EASY",
    interviewFrequency: "MEDIUM",
    description:
      "Return the text with its characters in the opposite order. Write it as a " +
      "recursion rather than a loop — the exercise is the shape of the solution, " +
      "not the result.",
    explanation:
      "Every recursion is the same two questions. What is the smallest input " +
      "whose answer you already know? Empty text, or text of one character, " +
      "which is its own reverse. And how does the answer for size n follow from " +
      "the answer for something smaller? Reversed text is the reverse of " +
      "everything after the first character, with that first character stuck on " +
      "the end. Write those two facts down and the function is finished; there " +
      "is no third step where you trace the calls. Note the cost: rebuilding a " +
      "string at every level makes this O(n²), which is why the loop really is " +
      "better here. Recursion is a way of thinking first and a technique second.",
    constraints: [
      "The text holds between 0 and 500 characters.",
      "Any printable characters may appear.",
      "Empty text reverses to empty text.",
    ],
    hints: [
      "Which input is so small that you already know its answer?",
      "Reversed text is the first character moved to the very end of the rest, reversed.",
      "Write the base case and the step, then stop — do not trace the calls.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "reverseTextRecursively",
      params: [{ name: "text", type: "string" }],
      returns: "string",
    },
    topicSlugs: ["dsa-recursion", "dsa-strings", "js-functions"],
    examples: [
      { input: 'text = "hello"', output: '"olleh"' },
      {
        input: 'text = "a"',
        output: '"a"',
        explanation: "One character is already its own reverse — a base case.",
      },
    ],
    tests: [
      { args: ["hello"], expected: "olleh" },
      { args: ["a"], expected: "a" },
      { args: ["ab"], expected: "ba" },
      { args: [""], expected: "", hidden: true },
      { args: ["racecar"], expected: "racecar", hidden: true },
      { args: ["step on no pets"], expected: "step on no pets", hidden: true },
      { args: ["CodeCompass"], expected: "ssapmoCedoC", hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `if (text.length <= 1) return text;
return reverseTextRecursively(text.slice(1)) + text[0];`,
      TYPESCRIPT: `if (text.length <= 1) return text;
return reverseTextRecursively(text.slice(1)) + text[0];`,
      PYTHON: `if len(text) <= 1:
    return text
return reverse_text_recursively(text[1:]) + text[0]`,
      JAVA: `if (text.length() <= 1) return text;
return reverseTextRecursively(text.substring(1)) + text.charAt(0);`,
      CPP: `if (text.size() <= 1) return text;
return reverseTextRecursively(text.substr(1)) + text[0];`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "greatest-common-divisor",
    title: "Greatest Common Divisor",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Return the largest whole number that divides both of the given " +
      "non-negative numbers exactly. The divisor of a number and zero is the " +
      "number itself, and both being zero gives zero.",
    explanation:
      "Testing every candidate downwards works and is far too slow. Euclid's " +
      "observation is that any number dividing both a and b also divides their " +
      "remainder, and the reverse holds too — so the pair (a, b) and the pair " +
      "(b, a mod b) have exactly the same set of common divisors, and therefore " +
      "the same largest one. That gives a recursion whose second argument " +
      "shrinks fast: gcd(a, b) is gcd(b, a mod b), with gcd(a, 0) = a as the " +
      "base case. It finishes in O(log min(a, b)) steps, and it is the rare " +
      "recursion where the step is a *fact about the problem* rather than a " +
      "restatement of it. That is why it is worth knowing by name.",
    constraints: [
      "Both numbers are between 0 and 1,000,000,000.",
      "The divisor of any number and zero is that number.",
      "gcd(0, 0) is defined here as 0.",
    ],
    hints: [
      "Any number dividing both a and b also divides what is left when you divide a by b.",
      "So the pair (a, b) has the same common divisors as (b, a mod b).",
      "The base case is when the second number reaches zero.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "greatestCommonDivisor",
      params: [
        { name: "first", type: "int" },
        { name: "second", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-recursion", "js-functions", "js-operators"],
    examples: [
      {
        input: "first = 12, second = 18",
        output: "6",
        explanation: "12 and 18 share 1, 2, 3 and 6; the largest is 6.",
      },
      {
        input: "first = 7, second = 0",
        output: "7",
        explanation: "Every number divides zero, so the answer is the other number.",
      },
    ],
    tests: [
      { args: [12, 18], expected: 6 },
      { args: [7, 0], expected: 7 },
      { args: [13, 17], expected: 1 },
      { args: [0, 0], expected: 0, hidden: true },
      { args: [0, 5], expected: 5, hidden: true },
      { args: [100, 100], expected: 100, hidden: true },
      { args: [1071, 462], expected: 21, hidden: true },
      { args: [1000000000, 2], expected: 2, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `if (second === 0) return first;
return greatestCommonDivisor(second, first % second);`,
      TYPESCRIPT: `if (second === 0) return first;
return greatestCommonDivisor(second, first % second);`,
      PYTHON: `if second == 0:
    return first
return greatest_common_divisor(second, first % second)`,
      JAVA: `if (second == 0) return first;
return greatestCommonDivisor(second, first % second);`,
      CPP: `if (second == 0) return first;
return greatestCommonDivisor(second, first % second);`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "digit-sum-until-single",
    title: "Add the Digits Until One Is Left",
    difficulty: "EASY",
    interviewFrequency: "MEDIUM",
    description:
      "Add up the digits of the number. If the total still has more than one " +
      "digit, add its digits too, and keep going until a single digit remains. " +
      "Return that digit.",
    explanation:
      "The recursion writes itself: if the number is already below ten, it is " +
      "the answer; otherwise sum its digits and ask the same question of the " +
      "total. Summing the digits is itself a natural recursion — the last digit " +
      "is n mod 10 and the rest is n divided by 10 — so this problem is two " +
      "small recursions stacked, which is a useful thing to have written once. " +
      "There is also a closed form: the result cycles with period 9, so for a " +
      "positive n the answer is 1 + (n - 1) mod 9. Deriving that is a nice " +
      "aside, but the recursion is the point, and an interviewer asking this is " +
      "usually checking that you notice the base case rather than that you " +
      "remember modular arithmetic.",
    constraints: [
      "The number is between 0 and 2,000,000,000.",
      "A number already below ten is returned unchanged.",
      "The process always terminates, because each round shrinks the number.",
    ],
    hints: [
      "When is the answer immediate? When the number already has one digit.",
      "The last digit is the remainder after dividing by ten; the rest is the quotient.",
      "Sum the digits, then ask the very same question of the sum.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "digitSumUntilSingle",
      params: [{ name: "number", type: "int" }],
      returns: "int",
    },
    topicSlugs: ["dsa-recursion", "js-functions", "js-operators"],
    examples: [
      {
        input: "number = 38",
        output: "2",
        explanation: "3 + 8 is 11, and 1 + 1 is 2.",
      },
      {
        input: "number = 5",
        output: "5",
        explanation: "It is already a single digit.",
      },
    ],
    tests: [
      { args: [38], expected: 2 },
      { args: [5], expected: 5 },
      { args: [0], expected: 0 },
      { args: [9], expected: 9, hidden: true },
      { args: [10], expected: 1, hidden: true },
      { args: [9875], expected: 2, hidden: true },
      { args: [999999999], expected: 9, hidden: true },
      { args: [199], expected: 1, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `if (number < 10) return number;
let total = 0;
let rest = number;
while (rest > 0) {
  total += rest % 10;
  rest = Math.floor(rest / 10);
}
return digitSumUntilSingle(total);`,
      TYPESCRIPT: `if (number < 10) return number;
let total = 0;
let rest = number;
while (rest > 0) {
  total += rest % 10;
  rest = Math.floor(rest / 10);
}
return digitSumUntilSingle(total);`,
      PYTHON: `if number < 10:
    return number
total = 0
rest = number
while rest > 0:
    total += rest % 10
    rest //= 10
return digit_sum_until_single(total)`,
      JAVA: `if (number < 10) return number;
int total = 0;
int rest = number;
while (rest > 0) {
    total += rest % 10;
    rest /= 10;
}
return digitSumUntilSingle(total);`,
      CPP: `if (number < 10) return number;
int total = 0;
int rest = number;
while (rest > 0) {
    total += rest % 10;
    rest /= 10;
}
return digitSumUntilSingle(total);`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "write-number-in-binary",
    title: "Write the Number in Binary",
    difficulty: "EASY",
    interviewFrequency: "MEDIUM",
    description:
      "Return the binary representation of a non-negative number as text, with " +
      "no leading zeros. Zero itself is written as a single \"0\".",
    explanation:
      "The digits come out of the number backwards — n mod 2 is the last one — " +
      "which is exactly the situation recursion handles better than a loop does. " +
      "Ask for the binary text of n divided by two *first*, then append the last " +
      "digit. Because the recursive call finishes before the append happens, the " +
      "digits land in the right order without a reversal step at the end. That " +
      "ordering trick — do the work on the way back up rather than on the way " +
      "down — is worth recognising; it is the same reason a postorder tree walk " +
      "can compute something about a node from its children. The base case has " +
      "to be n < 2 rather than n == 0, or the leading digit of every number " +
      "would be a spurious zero.",
    constraints: [
      "The number is between 0 and 1,000,000,000.",
      "The result has no leading zeros.",
      "Zero is written as \"0\", not as an empty string.",
    ],
    hints: [
      "The last binary digit is the remainder after dividing by two.",
      "Recurse on the halved number first, then append the digit you just found.",
      "Stopping at zero rather than below two would put a stray 0 in front.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "writeNumberInBinary",
      params: [{ name: "number", type: "int" }],
      returns: "string",
    },
    topicSlugs: ["dsa-recursion", "dsa-bit-manipulation", "dsa-strings"],
    examples: [
      { input: "number = 5", output: '"101"' },
      {
        input: "number = 0",
        output: '"0"',
        explanation: "The one case where a lone zero is correct.",
      },
    ],
    tests: [
      { args: [5], expected: "101" },
      { args: [0], expected: "0" },
      { args: [1], expected: "1" },
      { args: [2], expected: "10", hidden: true },
      { args: [255], expected: "11111111", hidden: true },
      { args: [1024], expected: "10000000000", hidden: true },
      { args: [37], expected: "100101", hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `if (number < 2) return String(number);
return writeNumberInBinary(Math.floor(number / 2)) + String(number % 2);`,
      TYPESCRIPT: `if (number < 2) return String(number);
return writeNumberInBinary(Math.floor(number / 2)) + String(number % 2);`,
      PYTHON: `if number < 2:
    return str(number)
return write_number_in_binary(number // 2) + str(number % 2)`,
      JAVA: `if (number < 2) return String.valueOf(number);
return writeNumberInBinary(number / 2) + String.valueOf(number % 2);`,
      CPP: `if (number < 2) return string(1, (char)('0' + number));
return writeNumberInBinary(number / 2) + string(1, (char)('0' + number % 2));`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "power-with-halving",
    title: "Raise to a Power by Halving",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Compute base raised to the exponent, reported modulo the given modulus. " +
      "The exponent can be very large, so multiplying one factor at a time will " +
      "not finish in time.",
    explanation:
      "Multiplying `exponent` times is O(exponent). Halving turns it into " +
      "O(log exponent) using one identity: base to an even power is (base to " +
      "half that power), squared. So compute the half power once, square it, and " +
      "multiply by one extra base if the exponent was odd. Computing the half " +
      "*once* and reusing it is the whole trick — writing it as half times half " +
      "with two recursive calls silently makes the algorithm linear again, and " +
      "that mistake is worth making once deliberately. Reduce modulo the modulus " +
      "after every multiplication rather than at the end, so the intermediate " +
      "values stay small. This is the same divide-and-conquer shape as binary " +
      "search: throw away half the work each step.",
    constraints: [
      "The base is between 0 and 1,000,000.",
      "The exponent is between 0 and 1,000,000,000.",
      "The modulus is between 2 and 1,000,000. Anything to the power 0 is 1.",
    ],
    hints: [
      "An even power is the square of the half power.",
      "Compute the half power once and reuse it — two recursive calls undo the saving.",
      "Reduce by the modulus after each multiplication, not at the end.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "powerWithHalving",
      params: [
        { name: "base", type: "int" },
        { name: "exponent", type: "int" },
        { name: "modulus", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-recursion", "dsa-binary-search", "js-operators"],
    examples: [
      {
        input: "base = 2, exponent = 10, modulus = 1000",
        output: "24",
        explanation: "2 to the 10th is 1024, and 1024 modulo 1000 is 24.",
      },
      {
        input: "base = 5, exponent = 0, modulus = 7",
        output: "1",
        explanation: "Anything to the power zero is one.",
      },
    ],
    tests: [
      { args: [2, 10, 1000], expected: 24 },
      { args: [5, 0, 7], expected: 1 },
      { args: [3, 3, 100], expected: 27 },
      { args: [0, 5, 13], expected: 0, hidden: true },
      { args: [1, 1000000000, 999983], expected: 1, hidden: true },
      { args: [7, 123456789, 1000000], expected: 429607, hidden: true },
      { args: [123456, 7, 999983], expected: 20254, hidden: true },
      { args: [999999, 999999999, 1000000], expected: 999999, hidden: true },
      { args: [2, 31, 1000000], expected: 483648, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `if (exponent === 0) return 1 % modulus;
const half = powerWithHalving(base, Math.floor(exponent / 2), modulus);
const squared = (half * half) % modulus;
return exponent % 2 === 0 ? squared : (squared * (base % modulus)) % modulus;`,
      TYPESCRIPT: `if (exponent === 0) return 1 % modulus;
const half = powerWithHalving(base, Math.floor(exponent / 2), modulus);
const squared = (half * half) % modulus;
return exponent % 2 === 0 ? squared : (squared * (base % modulus)) % modulus;`,
      PYTHON: `if exponent == 0:
    return 1 % modulus
half = power_with_halving(base, exponent // 2, modulus)
squared = (half * half) % modulus
return squared if exponent % 2 == 0 else (squared * (base % modulus)) % modulus`,
      JAVA: `if (exponent == 0) return 1 % modulus;
long half = powerWithHalving(base, exponent / 2, modulus);
long squared = (half * half) % modulus;
if (exponent % 2 == 0) return (int) squared;
return (int) ((squared * (base % modulus)) % modulus);`,
      CPP: `if (exponent == 0) return 1 % modulus;
long long half = powerWithHalving(base, exponent / 2, modulus);
long long squared = (half * half) % modulus;
if (exponent % 2 == 0) return (int)squared;
return (int)((squared * (base % modulus)) % modulus);`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "single-bit-change-order",
    title: "An Order Where One Bit Changes",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "List every number from 0 up to 2^bits - 1, each exactly once, arranged so " +
      "that consecutive entries differ in exactly one binary digit. The list must " +
      "start at 0. Return the arrangement built by the construction below, which " +
      "is one valid answer.",
    explanation:
      "Build it from the answer one bit shorter. Take that shorter list, then " +
      "append it again reversed with the new high bit switched on. Within the " +
      "first half neighbours differ in one bit because the shorter list already " +
      "did; the same holds in the second half; and at the seam the two entries " +
      "are the same shorter value differing only in the new high bit — which is " +
      "exactly why the second half has to be reversed. The base case is the " +
      "one-element list [0]. This is a construction you cannot really derive " +
      "under interview pressure without having seen the mirror-and-prefix idea, " +
      "which is the honest reason to meet it here: it is the cleanest example of " +
      "a recursion that builds an object rather than computing a number.",
    constraints: [
      "The number of bits is between 0 and 16.",
      "Zero bits gives the single-entry list [0].",
      "The list holds 2^bits entries, every value exactly once, starting at 0.",
    ],
    hints: [
      "Build the answer for n bits out of the answer for n - 1 bits.",
      "Reuse the shorter list, then reuse it again backwards with the new bit set.",
      "Reversing the second copy is what keeps the join between the halves valid.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "singleBitChangeOrder",
      params: [{ name: "bits", type: "int" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-recursion", "dsa-bit-manipulation", "js-arrays"],
    examples: [
      {
        input: "bits = 2",
        output: "[0, 1, 3, 2]",
        explanation:
          "In binary 00, 01, 11, 10 — each step flips exactly one digit.",
      },
      {
        input: "bits = 0",
        output: "[0]",
        explanation: "With no bits there is only the value zero.",
      },
    ],
    tests: [
      { args: [2], expected: [0, 1, 3, 2] },
      { args: [0], expected: [0] },
      { args: [1], expected: [0, 1] },
      {
        args: [3],
        expected: [0, 1, 3, 2, 6, 7, 5, 4],
        hidden: true,
      },
      {
        args: [4],
        expected: [0, 1, 3, 2, 6, 7, 5, 4, 12, 13, 15, 14, 10, 11, 9, 8],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `if (bits === 0) return [0];
const shorter = singleBitChangeOrder(bits - 1);
const order = [...shorter];
const highBit = 1 << (bits - 1);
for (let i = shorter.length - 1; i >= 0; i -= 1) order.push(shorter[i] | highBit);
return order;`,
      TYPESCRIPT: `if (bits === 0) return [0];
const shorter = singleBitChangeOrder(bits - 1);
const order: number[] = [...shorter];
const highBit = 1 << (bits - 1);
for (let i = shorter.length - 1; i >= 0; i -= 1) order.push(shorter[i] | highBit);
return order;`,
      PYTHON: `if bits == 0:
    return [0]
shorter = single_bit_change_order(bits - 1)
high_bit = 1 << (bits - 1)
return shorter + [value | high_bit for value in reversed(shorter)]`,
      JAVA: `if (bits == 0) return new int[] {0};
int[] shorter = singleBitChangeOrder(bits - 1);
int[] order = new int[shorter.length * 2];
int highBit = 1 << (bits - 1);
for (int i = 0; i < shorter.length; i += 1) {
    order[i] = shorter[i];
    order[shorter.length + i] = shorter[shorter.length - 1 - i] | highBit;
}
return order;`,
      CPP: `if (bits == 0) return vector<int>{0};
vector<int> shorter = singleBitChangeOrder(bits - 1);
vector<int> order = shorter;
int highBit = 1 << (bits - 1);
for (int i = (int)shorter.size() - 1; i >= 0; i -= 1) {
    order.push_back(shorter[i] | highBit);
}
return order;`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "move-the-tower",
    title: "Move the Tower",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Discs of decreasing size sit stacked on peg 1, and you must rebuild the " +
      "stack on peg 3 using peg 2 as scratch space. Only one disc moves at a " +
      "time, always from the top of a peg, and a larger disc may never rest on a " +
      "smaller one. Return the moves as [from, to] pairs, in order.",
    explanation:
      "The iterative solution exists and nobody derives it under pressure; the " +
      "recursive one is three lines because it refuses to think about the middle. " +
      "To move n discs from a source to a target: move the top n-1 discs out of " +
      "the way onto the spare peg, move the single largest disc straight to the " +
      "target, then move those n-1 discs from the spare onto the target. Both " +
      "sub-moves are the same problem one size smaller, with the roles of the " +
      "pegs permuted — and permuting the roles is the only bookkeeping. Trusting " +
      "the recursive call rather than tracing it is the entire skill being " +
      "practised, and it is the same trust the tree phase will ask for. The move " +
      "count is 2^n - 1, which the structure makes obvious.",
    constraints: [
      "The number of discs is between 0 and 12.",
      "Pegs are numbered 1, 2 and 3; discs start on peg 1 and finish on peg 3.",
      "Zero discs produces an empty list of moves.",
    ],
    hints: [
      "Do not think about the middle of the process. Think about the largest disc.",
      "To free the largest disc, the other n - 1 must all be on the spare peg.",
      "The two sub-problems are the same problem with the peg roles swapped around.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "moveTheTower",
      params: [{ name: "discs", type: "int" }],
      returns: "int[][]",
    },
    topicSlugs: ["dsa-recursion", "js-arrays", "js-functions"],
    examples: [
      {
        input: "discs = 1",
        output: "[[1, 3]]",
        explanation: "A single disc goes straight across.",
      },
      {
        input: "discs = 2",
        output: "[[1, 2], [1, 3], [2, 3]]",
        explanation:
          "Park the small disc on peg 2, move the large one, then bring the small one back on top.",
      },
    ],
    tests: [
      { args: [1], expected: [[1, 3]] },
      {
        args: [2],
        expected: [
          [1, 2],
          [1, 3],
          [2, 3],
        ],
      },
      { args: [0], expected: [] },
      {
        args: [3],
        expected: [
          [1, 3],
          [1, 2],
          [3, 2],
          [1, 3],
          [2, 1],
          [2, 3],
          [1, 3],
        ],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const moves = [];
function shift(count, from, to, spare) {
  if (count === 0) return;
  shift(count - 1, from, spare, to);
  moves.push([from, to]);
  shift(count - 1, spare, to, from);
}
shift(discs, 1, 3, 2);
return moves;`,
      TYPESCRIPT: `const moves: number[][] = [];
function shift(count: number, from: number, to: number, spare: number): void {
  if (count === 0) return;
  shift(count - 1, from, spare, to);
  moves.push([from, to]);
  shift(count - 1, spare, to, from);
}
shift(discs, 1, 3, 2);
return moves;`,
      PYTHON: `moves = []

def shift(count, source, target, spare):
    if count == 0:
        return
    shift(count - 1, source, spare, target)
    moves.append([source, target])
    shift(count - 1, spare, target, source)

shift(discs, 1, 3, 2)
return moves`,
      JAVA: `List<int[]> moves = new ArrayList<>();
class Tower {
    void shift(int count, int from, int to, int spare) {
        if (count == 0) return;
        shift(count - 1, from, spare, to);
        moves.add(new int[] {from, to});
        shift(count - 1, spare, to, from);
    }
}
new Tower().shift(discs, 1, 3, 2);
return moves.toArray(new int[0][]);`,
      CPP: `vector<vector<int>> moves;
function<void(int, int, int, int)> shift = [&](int count, int from, int to, int spare) {
    if (count == 0) return;
    shift(count - 1, from, spare, to);
    moves.push_back(vector<int>{from, to});
    shift(count - 1, spare, to, from);
};
shift(discs, 1, 3, 2);
return moves;`,
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "reverse-in-groups",
    title: "Reverse in Groups",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Reverse the first group of the given size, then the next group, and so on " +
      "along the whole list. If fewer than a full group is left at the end, leave " +
      "those values as they are. Return the rebuilt list.",
    explanation:
      "The recursive statement is almost the problem read aloud: reverse the " +
      "first group, then hand the rest of the list to the same function. That " +
      "makes the two awkward parts fall out cleanly. The short tail is a base " +
      "case — fewer than a full group remaining means return it unchanged — and " +
      "the joining of groups is just concatenation, so no index arithmetic " +
      "spanning group boundaries is ever needed. The iterative version is faster " +
      "and reverses each block in place, but it is also where the off-by-one " +
      "errors live, which is exactly the trade this file exists to show. This is " +
      "the array form of a linked-list question interviewers ask constantly.",
    constraints: [
      "The list holds between 0 and 500 integers.",
      "The group size is between 1 and 500.",
      "A trailing group shorter than the group size is left in its original order.",
    ],
    hints: [
      "Reverse the first group, then ask the same function to handle what is left.",
      "The base case is having fewer values left than a whole group.",
      "Nothing needs to reach across a group boundary if you build the answer by joining.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "reverseInGroups",
      params: [
        { name: "values", type: "int[]" },
        { name: "size", type: "int" },
      ],
      returns: "int[]",
    },
    topicSlugs: ["dsa-recursion", "dsa-linked-list", "js-arrays"],
    examples: [
      {
        input: "values = [1, 2, 3, 4, 5], size = 2",
        output: "[2, 1, 4, 3, 5]",
        explanation: "The lone 5 at the end is not a full group, so it stays put.",
      },
      {
        input: "values = [1, 2, 3, 4, 5, 6], size = 3",
        output: "[3, 2, 1, 6, 5, 4]",
        explanation: "Two complete groups, each reversed in place.",
      },
    ],
    tests: [
      { args: [[1, 2, 3, 4, 5], 2], expected: [2, 1, 4, 3, 5] },
      { args: [[1, 2, 3, 4, 5, 6], 3], expected: [3, 2, 1, 6, 5, 4] },
      { args: [[1, 2, 3], 1], expected: [1, 2, 3] },
      { args: [[], 3], expected: [], hidden: true },
      { args: [[1, 2], 5], expected: [1, 2], hidden: true },
      { args: [[1, 2, 3, 4], 4], expected: [4, 3, 2, 1], hidden: true },
      {
        args: [[1, 2, 3, 4, 5, 6, 7], 3],
        expected: [3, 2, 1, 6, 5, 4, 7],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `if (values.length < size) return [...values];
const head = values.slice(0, size).reverse();
const tail = reverseInGroups(values.slice(size), size);
return [...head, ...tail];`,
      TYPESCRIPT: `if (values.length < size) return [...values];
const head = values.slice(0, size).reverse();
const tail = reverseInGroups(values.slice(size), size);
return [...head, ...tail];`,
      PYTHON: `if len(values) < size:
    return list(values)
head = values[:size][::-1]
return head + reverse_in_groups(values[size:], size)`,
      JAVA: `if (values.length < size) return values.clone();
int[] rest = Arrays.copyOfRange(values, size, values.length);
int[] tail = reverseInGroups(rest, size);
int[] answer = new int[values.length];
for (int i = 0; i < size; i += 1) answer[i] = values[size - 1 - i];
for (int i = 0; i < tail.length; i += 1) answer[size + i] = tail[i];
return answer;`,
      CPP: `if ((int)values.size() < size) return values;
vector<int> answer(values.begin(), values.begin() + size);
reverse(answer.begin(), answer.end());
vector<int> rest(values.begin() + size, values.end());
vector<int> tail = reverseInGroups(rest, size);
answer.insert(answer.end(), tail.begin(), tail.end());
return answer;`,
    },
  },
];
