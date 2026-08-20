import type { SeedProblem } from "../../problems/types";

/**
 * Bit manipulation.
 *
 * Four operators and two shifts, used as tools rather than as tricks. The file
 * is built around the handful of identities that actually come up: XOR is its
 * own inverse and cancels pairs; n & (n - 1) clears the lowest set bit;
 * n & -n isolates it; and an integer can stand in for a set of up to thirty-two
 * things.
 *
 * Every explanation says which identity is doing the work, because the failure
 * mode with bit problems is memorising the line rather than the reason — and a
 * memorised line does not survive the follow-up question.
 *
 * A language note that costs people real interviews: JavaScript's bitwise
 * operators coerce to 32-bit signed integers, so `1 << 31` is negative and
 * `>>>` exists precisely to undo that. Python's integers have no width at all,
 * so a shift never overflows and a negative number has infinitely many leading
 * ones. Both facts are called out where a problem runs into them.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const BIT_MANIPULATION_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "count-the-set-bits",
    title: "Count the Set Bits",
    difficulty: "EASY",
    interviewFrequency: "VERY_HIGH",
    description:
      "Return how many 1s appear in the binary representation of the given " +
      "non-negative number. Zero has none.",
    explanation:
      "Testing each of the thirty-two positions with a shift and a mask works " +
      "and always costs thirty-two steps. The better answer costs one step per " +
      "*set* bit, using the identity that n & (n - 1) clears the lowest set bit " +
      "and nothing else. Subtracting one turns the lowest 1 into a 0 and every " +
      "0 below it into a 1; ANDing with the original therefore keeps every " +
      "higher bit and wipes out that lowest 1 along with the borrowed run " +
      "beneath it. So loop while the number is non-zero, applying it and " +
      "counting. That identity is worth memorising because it turns up " +
      "repeatedly — it is also how you test for a power of two, and how you " +
      "enumerate the subsets of a bitmask. The stated range stops below 2^31 " +
      "for a reason worth knowing: JavaScript's bitwise operators coerce to " +
      "32-bit signed integers, so a larger value would silently go negative and " +
      "the loop would never end.",
    constraints: [
      "The number is between 0 and 2,000,000,000.",
      "Only the 1s in the binary representation are counted.",
      "Zero answers 0.",
    ],
    hints: [
      "Checking all thirty-two positions works but always costs thirty-two steps.",
      "n & (n - 1) removes exactly the lowest set bit.",
      "So the loop runs once per set bit, not once per position.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "countTheSetBits",
      params: [{ name: "number", type: "int" }],
      returns: "int",
    },
    topicSlugs: ["dsa-bit-manipulation", "js-operators", "js-loops"],
    examples: [
      {
        input: "number = 11",
        output: "3",
        explanation: "11 is 1011 in binary.",
      },
      { input: "number = 0", output: "0" },
    ],
    tests: [
      { args: [11], expected: 3 },
      { args: [0], expected: 0 },
      { args: [1], expected: 1 },
      { args: [255], expected: 8, hidden: true },
      { args: [256], expected: 1, hidden: true },
      { args: [1023], expected: 10, hidden: true },
      { args: [2000000000], expected: 13, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let rest = number;
let count = 0;
while (rest !== 0) {
  rest &= rest - 1;
  count += 1;
}
return count;`,
      TYPESCRIPT: `let rest = number;
let count = 0;
while (rest !== 0) {
  rest &= rest - 1;
  count += 1;
}
return count;`,
      PYTHON: `count = 0
rest = number
while rest:
    rest &= rest - 1
    count += 1
return count`,
      JAVA: `long rest = number;
int count = 0;
while (rest != 0) {
    rest &= rest - 1;
    count += 1;
}
return count;`,
      CPP: `long long rest = number;
int count = 0;
while (rest != 0) {
    rest &= rest - 1;
    count += 1;
}
return count;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "the-number-without-a-partner",
    title: "The Number Without a Partner",
    difficulty: "EASY",
    interviewFrequency: "VERY_HIGH",
    description:
      "Every value in the list appears exactly twice, except one which appears " +
      "once. Return that value, using constant extra memory.",
    explanation:
      "A hash map of counts solves it in O(n) time but O(n) memory, and the " +
      "memory is what the question is about. XOR has three properties that " +
      "together settle it: a value XORed with itself is zero, a value XORed with " +
      "zero is itself, and the operation is both associative and commutative — " +
      "so the order the values arrive in does not matter. XOR the whole list " +
      "together and every pair cancels to zero regardless of where the two " +
      "copies sat, leaving only the unpaired value. One accumulator, one pass, " +
      "no memory. It is worth being able to state those three properties rather " +
      "than only the result, because the two-unpaired-values variant later " +
      "cannot be derived without them.",
    constraints: [
      "The list holds an odd number of values, between 1 and 100,000.",
      "Every value appears exactly twice except one, which appears once.",
      "Values are between 0 and 1,000,000.",
    ],
    hints: [
      "Counting works, and uses memory the question is trying to rule out.",
      "A value XORed with itself is zero, and with zero is itself.",
      "XOR does not care what order the values arrive in.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "theNumberWithoutAPartner",
      params: [{ name: "values", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-bit-manipulation", "dsa-hashing", "js-arrays"],
    examples: [
      { input: "values = [4, 1, 2, 1, 2]", output: "4" },
      { input: "values = [7]", output: "7" },
    ],
    tests: [
      { args: [[4, 1, 2, 1, 2]], expected: 4 },
      { args: [[7]], expected: 7 },
      { args: [[2, 2, 1]], expected: 1 },
      { args: [[0, 5, 5]], expected: 0, hidden: true },
      { args: [[1, 1, 3, 3, 9]], expected: 9, hidden: true },
      {
        args: [[1000000, 3, 3]],
        expected: 1000000,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `let alone = 0;
for (const value of values) alone ^= value;
return alone;`,
      TYPESCRIPT: `let alone = 0;
for (const value of values) alone ^= value;
return alone;`,
      PYTHON: `alone = 0
for value in values:
    alone ^= value
return alone`,
      JAVA: `int alone = 0;
for (int value : values) alone ^= value;
return alone;`,
      CPP: `int alone = 0;
for (int value : values) alone ^= value;
return alone;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "is-it-a-power-of-two",
    title: "Is It a Power of Two?",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Report whether the given number is a power of two — that is, whether it " +
      "equals 2 raised to some whole number at or above zero. Zero and negative " +
      "numbers are not.",
    explanation:
      "Dividing by two repeatedly works and takes a loop. The one-line version " +
      "reuses the clear-the-lowest-set-bit identity from the counting problem: a " +
      "power of two is precisely a number with exactly one set bit, so clearing " +
      "that bit must leave zero. The whole test is therefore n > 0 and " +
      "(n & (n - 1)) === 0. The n > 0 guard is not decoration — zero passes the " +
      "second half, since 0 & -1 is 0, and so does every negative number in " +
      "two's complement. Leaving that guard out is the mistake this problem is " +
      "asked to catch, which is why the tests include both zero and a negative.",
    constraints: [
      "The number is between -1,000,000,000 and 1,000,000,000.",
      "Zero and negative numbers are never powers of two.",
      "1 is a power of two, being 2 to the power 0.",
    ],
    hints: [
      "A power of two has exactly one set bit.",
      "Clearing the lowest set bit of such a number must leave zero.",
      "Zero and the negatives sneak past that test — guard for them.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "isItAPowerOfTwo",
      params: [{ name: "number", type: "int" }],
      returns: "bool",
    },
    topicSlugs: ["dsa-bit-manipulation", "js-operators", "js-conditions"],
    examples: [
      { input: "number = 16", output: "true" },
      {
        input: "number = 0",
        output: "false",
        explanation: "Zero passes the bit test but is not a power of two.",
      },
    ],
    tests: [
      { args: [16], expected: true },
      { args: [0], expected: false },
      { args: [1], expected: true },
      { args: [-16], expected: false, hidden: true },
      { args: [3], expected: false, hidden: true },
      { args: [1024], expected: true, hidden: true },
      { args: [1000000000], expected: false, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `return number > 0 && (number & (number - 1)) === 0;`,
      TYPESCRIPT: `return number > 0 && (number & (number - 1)) === 0;`,
      PYTHON: `return number > 0 and (number & (number - 1)) == 0`,
      JAVA: `return number > 0 && (number & (number - 1)) == 0;`,
      CPP: `return number > 0 && (number & (number - 1)) == 0;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "flip-every-meaningful-bit",
    title: "Flip Every Meaningful Bit",
    difficulty: "EASY",
    interviewFrequency: "MEDIUM",
    description:
      "Flip every bit of the number's binary representation, ignoring the " +
      "leading zeros — so 5, which is 101, becomes 010, that is 2. Zero has no " +
      "meaningful bits and becomes 1.",
    explanation:
      "Flipping with ~ gives the wrong answer, because it also flips the leading " +
      "zeros and produces a negative number. What is wanted is a flip confined " +
      "to the bits the number actually uses, and XOR does exactly that against " +
      "the right mask: a run of 1s as long as the number is wide. Build the mask " +
      "by starting at 1 and doubling until it exceeds the number, then subtract " +
      "one — for 5 that gives 8 - 1 = 7, which is 111, and 5 XOR 7 is 2. Zero is " +
      "the special case worth stating: it has no meaningful bits, the mask would " +
      "be empty, and the agreed answer is 1. Choosing the mask rather than " +
      "reaching for ~ is the general lesson here — bitwise complement is almost " +
      "never what a problem means by 'flip'.",
    constraints: [
      "The number is between 0 and 1,000,000,000.",
      "Leading zeros are not flipped.",
      "Zero becomes 1.",
    ],
    hints: [
      "The ~ operator flips the leading zeros too, which is not what is wanted.",
      "XOR against a mask of 1s exactly as wide as the number.",
      "Build the mask by doubling past the number, then subtracting one.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "flipEveryMeaningfulBit",
      params: [{ name: "number", type: "int" }],
      returns: "int",
    },
    topicSlugs: ["dsa-bit-manipulation", "js-operators", "js-loops"],
    examples: [
      {
        input: "number = 5",
        output: "2",
        explanation: "101 flips to 010.",
      },
      { input: "number = 0", output: "1" },
    ],
    tests: [
      { args: [5], expected: 2 },
      { args: [0], expected: 1 },
      { args: [7], expected: 0 },
      { args: [1], expected: 0, hidden: true },
      { args: [10], expected: 5, hidden: true },
      { args: [255], expected: 0, hidden: true },
      { args: [256], expected: 255, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `if (number === 0) return 1;
let mask = 1;
while (mask <= number) mask *= 2;
return (mask - 1) - number;`,
      TYPESCRIPT: `if (number === 0) return 1;
let mask = 1;
while (mask <= number) mask *= 2;
return mask - 1 - number;`,
      PYTHON: `if number == 0:
    return 1
mask = 1
while mask <= number:
    mask *= 2
return (mask - 1) - number`,
      JAVA: `if (number == 0) return 1;
long mask = 1;
while (mask <= number) mask *= 2;
return (int) (mask - 1 - number);`,
      CPP: `if (number == 0) return 1;
long long mask = 1;
while (mask <= number) mask *= 2;
return (int)(mask - 1 - number);`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "the-two-without-partners",
    title: "The Two Without Partners",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Every value appears exactly twice except two, which appear once each. " +
      "Return those two values in increasing order, using constant extra memory.",
    explanation:
      "XORing everything now leaves the XOR of the *two* unpaired values rather " +
      "than one of them, so the problem becomes separating them. Any set bit in " +
      "that combined result marks a position where the two differ — take the " +
      "lowest, which n & -n isolates in one step. Now split the whole list on " +
      "that bit: every paired value goes entirely into one side, since both " +
      "copies agree everywhere, while the two unpaired values are forced apart " +
      "because they differ at exactly that position. XOR each side separately " +
      "and each collapses to one answer. Two passes, two accumulators, no " +
      "memory. Choosing a bit where they are known to differ is the whole idea, " +
      "and it is why the previous problem's three XOR properties had to be " +
      "understood rather than memorised.",
    constraints: [
      "The list holds between 2 and 100,000 values, an even count.",
      "Every value appears twice except two, which appear once each.",
      "Values are between 1 and 1,000,000,000.",
    ],
    hints: [
      "XORing everything leaves the XOR of the two answers.",
      "A set bit in that result is a position where the two differ.",
      "Split the list on that bit and each side reduces to one unpaired value.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "theTwoWithoutPartners",
      params: [{ name: "values", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-bit-manipulation", "dsa-hashing", "js-arrays"],
    examples: [
      {
        input: "values = [1, 2, 1, 3, 2, 5]",
        output: "[3, 5]",
      },
      {
        input: "values = [4, 9]",
        output: "[4, 9]",
        explanation: "Neither has a partner.",
      },
    ],
    tests: [
      { args: [[1, 2, 1, 3, 2, 5]], expected: [3, 5] },
      { args: [[4, 9]], expected: [4, 9] },
      { args: [[9, 4]], expected: [4, 9] },
      { args: [[1, 1, 2, 3]], expected: [2, 3], hidden: true },
      {
        args: [[7, 7, 8, 8, 100, 200]],
        expected: [100, 200],
        hidden: true,
      },
      { args: [[1, 2]], expected: [1, 2], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let both = 0;
for (const value of values) both ^= value;

const lowest = both & -both;
let first = 0;
let second = 0;
for (const value of values) {
  if ((value & lowest) === 0) first ^= value;
  else second ^= value;
}
return first < second ? [first, second] : [second, first];`,
      TYPESCRIPT: `let both = 0;
for (const value of values) both ^= value;

const lowest = both & -both;
let first = 0;
let second = 0;
for (const value of values) {
  if ((value & lowest) === 0) first ^= value;
  else second ^= value;
}
return first < second ? [first, second] : [second, first];`,
      PYTHON: `both = 0
for value in values:
    both ^= value

lowest = both & -both
first = 0
second = 0
for value in values:
    if value & lowest:
        second ^= value
    else:
        first ^= value
return [first, second] if first < second else [second, first]`,
      JAVA: `int both = 0;
for (int value : values) both ^= value;

int lowest = both & -both;
int first = 0;
int second = 0;
for (int value : values) {
    if ((value & lowest) == 0) first ^= value;
    else second ^= value;
}
return first < second ? new int[] {first, second} : new int[] {second, first};`,
      CPP: `int both = 0;
for (int value : values) both ^= value;

int lowest = both & -both;
int first = 0;
int second = 0;
for (int value : values) {
    if ((value & lowest) == 0) first ^= value;
    else second ^= value;
}
if (first < second) return vector<int>{first, second};
return vector<int>{second, first};`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "set-bits-up-to-a-limit",
    title: "Set Bits for Every Number up to a Limit",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Return a list whose entry at position i is the number of 1s in the binary " +
      "representation of i, for every i from 0 up to and including the limit.",
    explanation:
      "Counting each number independently costs O(n log n) and is a fine first " +
      "answer. The linear version is the first dynamic programming most people " +
      "meet in a bit problem: shifting a number right by one drops its lowest " +
      "bit, so the count for i is the count for i >> 1 plus whatever that lowest " +
      "bit was — that is, plus i & 1. Since i >> 1 is always smaller than i, its " +
      "answer is already in the table, and one pass fills everything in O(n). " +
      "The alternative recurrence, count[i] = count[i & (i - 1)] + 1, is equally " +
      "valid and reuses the clear-the-lowest-bit identity instead. Both are " +
      "worth recognising, because which one an interviewer is expecting depends " +
      "entirely on which identity they opened with.",
    constraints: [
      "The limit is between 0 and 100,000.",
      "The answer has limit + 1 entries, starting at 0.",
      "Entry 0 is always 0.",
    ],
    hints: [
      "Counting each number separately is O(n log n) — try to reuse earlier answers.",
      "Shifting right by one drops exactly the lowest bit.",
      "So the count for i is the count for i >> 1 plus that dropped bit.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "setBitsUpToALimit",
      params: [{ name: "limit", type: "int" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-bit-manipulation", "dsa-dp-1d", "js-arrays"],
    examples: [
      {
        input: "limit = 5",
        output: "[0, 1, 1, 2, 1, 2]",
        explanation: "0, 1, 10, 11, 100, 101 in binary.",
      },
      { input: "limit = 0", output: "[0]" },
    ],
    tests: [
      { args: [5], expected: [0, 1, 1, 2, 1, 2] },
      { args: [0], expected: [0] },
      { args: [2], expected: [0, 1, 1] },
      { args: [1], expected: [0, 1], hidden: true },
      {
        args: [8],
        expected: [0, 1, 1, 2, 1, 2, 2, 3, 1],
        hidden: true,
      },
      {
        args: [15],
        expected: [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const counts = new Array(limit + 1).fill(0);
for (let i = 1; i <= limit; i += 1) counts[i] = counts[i >> 1] + (i & 1);
return counts;`,
      TYPESCRIPT: `const counts: number[] = new Array(limit + 1).fill(0);
for (let i = 1; i <= limit; i += 1) counts[i] = counts[i >> 1] + (i & 1);
return counts;`,
      PYTHON: `counts = [0] * (limit + 1)
for i in range(1, limit + 1):
    counts[i] = counts[i >> 1] + (i & 1)
return counts`,
      JAVA: `int[] counts = new int[limit + 1];
for (int i = 1; i <= limit; i += 1) counts[i] = counts[i >> 1] + (i & 1);
return counts;`,
      CPP: `vector<int> counts(limit + 1, 0);
for (int i = 1; i <= limit; i += 1) counts[i] = counts[i >> 1] + (i & 1);
return counts;`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "add-without-adding",
    title: "Add Without the Plus Sign",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Return the sum of two non-negative numbers without using addition or " +
      "subtraction — only bitwise operators and shifts.",
    explanation:
      "Take addition apart into the two things a column of a hand-worked sum " +
      "does. The digits that need no carry are exactly the positions where the " +
      "bits differ, which is XOR. The carries are the positions where both bits " +
      "are 1, which is AND, shifted one place left because a carry belongs in " +
      "the next column. So the sum is (a XOR b) plus (a AND b) shifted left — " +
      "which still contains a plus, and that is the point: repeat the step, " +
      "treating the XOR as the new a and the shifted carry as the new b, until " +
      "the carry is zero. It terminates because each round pushes the carry at " +
      "least one bit further left, so it runs at most as many times as the " +
      "numbers are wide. This is what a hardware adder does, one column at a " +
      "time, in parallel.",
    constraints: [
      "Both numbers are between 0 and 1,000,000.",
      "Only bitwise operators and shifts may be used.",
      "Adding zero to anything returns that thing.",
    ],
    hints: [
      "Split a column of the sum into the part that needs no carry and the carry itself.",
      "XOR gives the first; AND shifted left by one gives the second.",
      "Repeat with those two until the carry runs out.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "addWithoutAdding",
      params: [
        { name: "first", type: "int" },
        { name: "second", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-bit-manipulation", "js-operators", "js-loops"],
    examples: [
      { input: "first = 3, second = 5", output: "8" },
      {
        input: "first = 7, second = 0",
        output: "7",
        explanation: "There is nothing to carry.",
      },
    ],
    tests: [
      { args: [3, 5], expected: 8 },
      { args: [7, 0], expected: 7 },
      { args: [0, 0], expected: 0 },
      { args: [1, 1], expected: 2, hidden: true },
      { args: [999999, 1], expected: 1000000, hidden: true },
      { args: [123456, 654321], expected: 777777, hidden: true },
      { args: [1000000, 1000000], expected: 2000000, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let a = first;
let b = second;
while (b !== 0) {
  const carry = (a & b) << 1;
  a = a ^ b;
  b = carry;
}
return a;`,
      TYPESCRIPT: `let a = first;
let b = second;
while (b !== 0) {
  const carry = (a & b) << 1;
  a = a ^ b;
  b = carry;
}
return a;`,
      PYTHON: `a, b = first, second
while b:
    carry = (a & b) << 1
    a ^= b
    b = carry
return a`,
      JAVA: `int a = first;
int b = second;
while (b != 0) {
    int carry = (a & b) << 1;
    a = a ^ b;
    b = carry;
}
return a;`,
      CPP: `int a = first;
int b = second;
while (b != 0) {
    int carry = (a & b) << 1;
    a = a ^ b;
    b = carry;
}
return a;`,
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "the-largest-xor-of-any-pair",
    title: "The Largest XOR of Any Pair",
    difficulty: "HARD",
    interviewFrequency: "MEDIUM",
    description:
      "Return the largest value obtainable by XORing two different entries of " +
      "the list together. The list always holds at least two values.",
    explanation:
      "Every pair is O(n²) and too slow at the stated size. Build the answer " +
      "one bit at a time from the top down, keeping a running candidate. At each " +
      "position, optimistically assume that bit can be a 1 and ask whether any " +
      "two prefixes achieve it — which is the same as asking whether some " +
      "prefix XORed with the candidate is also a prefix, using the fact that " +
      "a XOR b = c implies a XOR c = b. A hash set of the prefixes answers that " +
      "in O(n) per bit, so the whole thing is O(32n). Keep the bit if the answer " +
      "is yes and drop it if not, and the greedy is safe because a 1 at a higher " +
      "position outweighs every combination below it. The equivalent solution " +
      "walks a trie of the bits, taking the opposite branch at every step, which " +
      "is why this problem sits next to the trie topic.",
    constraints: [
      "The list holds between 2 and 200,000 values.",
      "Values are between 0 and 2,000,000,000.",
      "The two entries chosen must be at different positions.",
    ],
    hints: [
      "Build the answer from the highest bit down, assuming each bit can be 1.",
      "a XOR b = c means a XOR c = b, which turns the check into a set lookup.",
      "A higher bit always beats every combination of lower ones, so greedy is safe.",
    ],
    estimatedTime: "45 min",
    timeLimitMs: 5000,
    signature: {
      name: "theLargestXorOfAnyPair",
      params: [{ name: "values", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-bit-manipulation", "dsa-trie", "dsa-hashing"],
    examples: [
      {
        input: "values = [3, 10, 5, 25, 2, 8]",
        output: "28",
        explanation: "5 XOR 25 is 28.",
      },
      { input: "values = [0, 0]", output: "0" },
    ],
    tests: [
      { args: [[3, 10, 5, 25, 2, 8]], expected: 28 },
      { args: [[0, 0]], expected: 0 },
      { args: [[1, 2]], expected: 3 },
      { args: [[8, 10, 2]], expected: 10, hidden: true },
      { args: [[14, 70, 53, 83, 49, 91, 36, 80, 92, 51]], expected: 127, hidden: true },
      { args: [[2147483647, 0]], expected: 2147483647, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let best = 0;
for (let bit = 31; bit >= 0; bit -= 1) {
  const candidate = best * 2 + 1;
  const prefixes = new Set();
  for (const value of values) prefixes.add(Math.floor(value / Math.pow(2, bit)));
  let reachable = false;
  for (const prefix of prefixes) {
    if (prefixes.has(prefix ^ candidate)) {
      reachable = true;
      break;
    }
  }
  best = reachable ? candidate : candidate - 1;
}
return best;`,
      TYPESCRIPT: `let best = 0;
for (let bit = 31; bit >= 0; bit -= 1) {
  const candidate = best * 2 + 1;
  const prefixes = new Set<number>();
  for (const value of values) prefixes.add(Math.floor(value / Math.pow(2, bit)));
  let reachable = false;
  for (const prefix of prefixes) {
    if (prefixes.has(prefix ^ candidate)) {
      reachable = true;
      break;
    }
  }
  best = reachable ? candidate : candidate - 1;
}
return best;`,
      PYTHON: `best = 0
for bit in range(31, -1, -1):
    candidate = best * 2 + 1
    prefixes = {value >> bit for value in values}
    reachable = any((prefix ^ candidate) in prefixes for prefix in prefixes)
    best = candidate if reachable else candidate - 1
return best`,
      JAVA: `long best = 0;
for (int bit = 31; bit >= 0; bit -= 1) {
    long candidate = best * 2 + 1;
    Set<Long> prefixes = new HashSet<>();
    for (int value : values) prefixes.add((long) value >> bit);
    boolean reachable = false;
    for (long prefix : prefixes) {
        if (prefixes.contains(prefix ^ candidate)) {
            reachable = true;
            break;
        }
    }
    best = reachable ? candidate : candidate - 1;
}
return (int) best;`,
      CPP: `long long best = 0;
for (int bit = 31; bit >= 0; bit -= 1) {
    long long candidate = best * 2 + 1;
    unordered_set<long long> prefixes;
    for (int value : values) prefixes.insert((long long)value >> bit);
    bool reachable = false;
    for (long long prefix : prefixes) {
        if (prefixes.count(prefix ^ candidate)) {
            reachable = true;
            break;
        }
    }
    best = reachable ? candidate : candidate - 1;
}
return (int)best;`,
    },
  },
];
