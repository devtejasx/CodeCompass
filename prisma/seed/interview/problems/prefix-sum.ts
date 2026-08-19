import type { SeedProblem } from "../../problems/types";

/**
 * Prefix sums.
 *
 * One idea, applied five ways: if you know the total up to every position, any
 * range answers by subtraction. The first two problems use that literally. The
 * rest use the version that actually shows up in interviews — pair a prefix sum
 * with a hash map and you can count ranges with a property, because two
 * positions sharing a prefix value bracket a range whose sum is zero, or whose
 * sum is k, or whose remainder is the same.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const PREFIX_SUM_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "pivot-index",
    title: "The Balance Point",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Find the position where the numbers strictly to its left add up to the " +
      "same total as the numbers strictly to its right. The value at the " +
      "position itself belongs to neither side. Return the leftmost such " +
      "position, or -1 if there is none.",
    explanation:
      "Compute the grand total first. Then walk left to right keeping the sum " +
      "of everything before the current position: the sum to the right is " +
      "total minus that running sum minus the current value, so each position " +
      "is checked in constant time and the whole thing is two passes. An empty " +
      "side sums to zero, which is why position 0 can be the answer — and " +
      "forgetting that is the usual reason a solution misses [2, 1, -1].",
    constraints: [
      "The list has between 1 and 100,000 numbers.",
      "Each number is between -1,000 and 1,000.",
      "Return the leftmost balance point, or -1.",
    ],
    hints: [
      "The total tells you the right-hand sum without another loop.",
      "Right sum = total - leftSum - current value.",
      "An empty side sums to zero, so position 0 is allowed.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "pivotIndex",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-prefix-sum", "js-arrays", "data-structures"],
    examples: [
      {
        input: "numbers = [1, 7, 3, 6, 5, 6]",
        output: "3",
        explanation: "1 + 7 + 3 is 11, and 5 + 6 is 11.",
      },
      { input: "numbers = [1, 2, 3]", output: "-1" },
    ],
    tests: [
      { args: [[1, 7, 3, 6, 5, 6]], expected: 3 },
      { args: [[1, 2, 3]], expected: -1 },
      { args: [[2, 1, -1]], expected: 0 },
      { args: [[0]], expected: 0, hidden: true },
      { args: [[-1, -1, -1, 0, 1, 1]], expected: 0, hidden: true },
      { args: [[1, 1]], expected: -1, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let total = 0;
for (const value of numbers) total += value;
let leftSum = 0;
for (let i = 0; i < numbers.length; i += 1) {
  if (leftSum === total - leftSum - numbers[i]) return i;
  leftSum += numbers[i];
}
return -1;`,
      TYPESCRIPT: `let total = 0;
for (const value of numbers) total += value;
let leftSum = 0;
for (let i = 0; i < numbers.length; i += 1) {
  if (leftSum === total - leftSum - numbers[i]) return i;
  leftSum += numbers[i];
}
return -1;`,
      PYTHON: `total = sum(numbers)
left_sum = 0
for i, value in enumerate(numbers):
    if left_sum == total - left_sum - value:
        return i
    left_sum += value
return -1`,
      JAVA: `int total = 0;
for (int value : numbers) total += value;
int leftSum = 0;
for (int i = 0; i < numbers.length; i += 1) {
    if (leftSum == total - leftSum - numbers[i]) return i;
    leftSum += numbers[i];
}
return -1;`,
      CPP: `int total = 0;
for (int value : numbers) total += value;
int leftSum = 0;
for (int i = 0; i < (int)numbers.size(); i += 1) {
    if (leftSum == total - leftSum - numbers[i]) return i;
    leftSum += numbers[i];
}
return -1;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "range-sum-queries",
    title: "Answer Many Range Sums",
    difficulty: "EASY",
    interviewFrequency: "MEDIUM",
    description:
      "Given a list of numbers and a set of [start, end] ranges (both ends " +
      "included), return the total of each range. There can be far more " +
      "queries than numbers, so answering each one by looping is too slow.",
    explanation:
      "Build one array where position i holds the total of everything before i " +
      "— so it is one longer than the input, and its first entry is 0. Then the " +
      "sum of a range is prefix[end + 1] minus prefix[start], in constant time, " +
      "however long the range is. That extra leading zero is what removes the " +
      "special case for ranges beginning at 0, and it is worth adopting as a " +
      "habit: nearly every off-by-one in prefix-sum code comes from trying to " +
      "save that one slot.",
    constraints: [
      "The list has between 1 and 50,000 numbers.",
      "There are between 1 and 50,000 queries.",
      "Each query is [start, end] with 0 ≤ start ≤ end < length.",
    ],
    hints: [
      "Precompute totals once, then answer every query by subtraction.",
      "Make the prefix array one longer, starting with 0.",
      "Range [start, end] is prefix[end + 1] - prefix[start].",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "rangeSums",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "queries", type: "int[][]" },
      ],
      returns: "int[]",
    },
    topicSlugs: ["dsa-prefix-sum", "js-arrays"],
    examples: [
      {
        input: "numbers = [-2, 0, 3, -5, 2, -1], queries = [[0, 2], [2, 5]]",
        output: "[1, -1]",
        explanation: "-2 + 0 + 3 is 1; 3 - 5 + 2 - 1 is -1.",
      },
      { input: "numbers = [1], queries = [[0, 0]]", output: "[1]" },
    ],
    tests: [
      {
        args: [
          [-2, 0, 3, -5, 2, -1],
          [
            [0, 2],
            [2, 5],
            [0, 5],
          ],
        ],
        expected: [1, -1, -3],
      },
      { args: [[1], [[0, 0]]], expected: [1] },
      {
        args: [
          [1, 2, 3],
          [
            [1, 1],
            [0, 2],
          ],
        ],
        expected: [2, 6],
      },
      {
        args: [
          [5, 5],
          [
            [0, 1],
            [1, 1],
          ],
        ],
        expected: [10, 5],
        hidden: true,
      },
      {
        args: [[-1, -1, -1], [[0, 2]]],
        expected: [-3],
        hidden: true,
      },
      {
        args: [
          [0, 0, 0],
          [
            [0, 0],
            [0, 2],
          ],
        ],
        expected: [0, 0],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const prefix = new Array(numbers.length + 1).fill(0);
for (let i = 0; i < numbers.length; i += 1) {
  prefix[i + 1] = prefix[i] + numbers[i];
}
return queries.map((query) => prefix[query[1] + 1] - prefix[query[0]]);`,
      TYPESCRIPT: `const prefix: number[] = new Array(numbers.length + 1).fill(0);
for (let i = 0; i < numbers.length; i += 1) {
  prefix[i + 1] = prefix[i] + numbers[i];
}
return queries.map((query) => prefix[query[1] + 1] - prefix[query[0]]);`,
      PYTHON: `prefix = [0] * (len(numbers) + 1)
for i, value in enumerate(numbers):
    prefix[i + 1] = prefix[i] + value
return [prefix[end + 1] - prefix[start] for start, end in queries]`,
      JAVA: `int[] prefix = new int[numbers.length + 1];
for (int i = 0; i < numbers.length; i += 1) {
    prefix[i + 1] = prefix[i] + numbers[i];
}
int[] result = new int[queries.length];
for (int i = 0; i < queries.length; i += 1) {
    result[i] = prefix[queries[i][1] + 1] - prefix[queries[i][0]];
}
return result;`,
      CPP: `vector<int> prefix(numbers.size() + 1, 0);
for (int i = 0; i < (int)numbers.size(); i += 1) {
    prefix[i + 1] = prefix[i] + numbers[i];
}
vector<int> result;
for (const auto& query : queries) {
    result.push_back(prefix[query[1] + 1] - prefix[query[0]]);
}
return result;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "count-subarrays-with-sum",
    title: "Count Subarrays Adding to k",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Count the runs of neighbouring numbers whose total is exactly k. Runs " +
      "are counted by position, so two different runs with the same values both " +
      "count. The numbers may be negative.",
    explanation:
      "A sliding window does not work here, because negative numbers mean " +
      "adding an element can lower the total — there is no rule for when to " +
      "shrink. Prefix sums plus a hash map do work. If the running total at " +
      "position j is S, then a run ending at j sums to k exactly when some " +
      "earlier prefix equals S - k. So keep a map from prefix value to how many " +
      "times it has occurred, and at each step add the count of S - k to the " +
      "answer. The map starts holding {0: 1}, standing for the empty prefix, " +
      "which is what lets a run starting at position 0 be counted.",
    constraints: [
      "The list has between 1 and 20,000 numbers.",
      "Each number is between -1,000 and 1,000.",
      "k is between -10,000,000 and 10,000,000.",
    ],
    hints: [
      "Negative numbers rule out a sliding window.",
      "A run summing to k means two prefix sums differing by k.",
      "Seed the map with {0: 1} for the empty prefix.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "countSubarraysWithSum",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "k", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-prefix-sum", "dsa-hashing"],
    examples: [
      { input: "numbers = [1, 1, 1], k = 2", output: "2" },
      {
        input: "numbers = [1, -1, 0], k = 0",
        output: "3",
        explanation: "[1, -1], [1, -1, 0] and [0] all total zero.",
      },
    ],
    tests: [
      { args: [[1, 1, 1], 2], expected: 2 },
      { args: [[1, 2, 3], 3], expected: 2 },
      { args: [[1, -1, 0], 0], expected: 3 },
      { args: [[3, 4, 7, 2, -3, 1, 4, 2], 7], expected: 4, hidden: true },
      { args: [[1], 0], expected: 0, hidden: true },
      { args: [[0, 0, 0], 0], expected: 6, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const seen = new Map();
seen.set(0, 1);
let running = 0;
let total = 0;
for (const value of numbers) {
  running += value;
  total += seen.get(running - k) ?? 0;
  seen.set(running, (seen.get(running) ?? 0) + 1);
}
return total;`,
      TYPESCRIPT: `const seen = new Map<number, number>();
seen.set(0, 1);
let running = 0;
let total = 0;
for (const value of numbers) {
  running += value;
  total += seen.get(running - k) ?? 0;
  seen.set(running, (seen.get(running) ?? 0) + 1);
}
return total;`,
      PYTHON: `seen = {0: 1}
running = 0
total = 0
for value in numbers:
    running += value
    total += seen.get(running - k, 0)
    seen[running] = seen.get(running, 0) + 1
return total`,
      JAVA: `Map<Integer, Integer> seen = new HashMap<>();
seen.put(0, 1);
int running = 0;
int total = 0;
for (int value : numbers) {
    running += value;
    total += seen.getOrDefault(running - k, 0);
    seen.put(running, seen.getOrDefault(running, 0) + 1);
}
return total;`,
      CPP: `unordered_map<int, int> seen;
seen[0] = 1;
int running = 0;
int total = 0;
for (int value : numbers) {
    running += value;
    auto found = seen.find(running - k);
    if (found != seen.end()) total += found->second;
    seen[running] += 1;
}
return total;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "subarray-sum-multiple",
    title: "A Run Whose Total Divides Evenly",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Return true if the list contains a run of at least two neighbouring " +
      "numbers whose total is a multiple of k. Zero counts as a multiple of " +
      "every k.",
    explanation:
      "Two prefix sums with the same remainder when divided by k bracket a run " +
      "whose total is a multiple of k — that is the entire insight, and it turns " +
      "an O(n²) scan into one pass. Keep a map from remainder to the earliest " +
      "position where it was seen, and when a remainder repeats, check that the " +
      "two positions are at least two apart to satisfy the length rule. Store " +
      "the *earliest* position only, because that gives the longest candidate " +
      "run and therefore the best chance of clearing the length requirement.",
    constraints: [
      "The list has between 1 and 100,000 non-negative numbers.",
      "Each number is between 0 and 1,000,000,000.",
      "k is between 1 and 1,000,000,000.",
    ],
    hints: [
      "Equal remainders mean the run between them divides evenly.",
      "Record the earliest position for each remainder.",
      "Check the length rule before returning true.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "hasMultipleSumRun",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "k", type: "int" },
      ],
      returns: "bool",
    },
    topicSlugs: ["dsa-prefix-sum", "dsa-hashing"],
    examples: [
      {
        input: "numbers = [23, 2, 4, 6, 7], k = 6",
        output: "true",
        explanation: "2 + 4 is 6.",
      },
      { input: "numbers = [23, 2, 6, 4, 7], k = 13", output: "false" },
    ],
    tests: [
      { args: [[23, 2, 4, 6, 7], 6], expected: true },
      { args: [[23, 2, 6, 4, 7], 13], expected: false },
      { args: [[1, 2, 3], 5], expected: true },
      { args: [[23, 2, 6, 4, 7], 6], expected: true, hidden: true },
      { args: [[1, 1], 3], expected: false, hidden: true },
      { args: [[0, 0], 1], expected: true, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const firstSeen = new Map();
firstSeen.set(0, -1);
let running = 0;
for (let i = 0; i < numbers.length; i += 1) {
  running = (running + numbers[i]) % k;
  const earlier = firstSeen.get(running);
  if (earlier === undefined) firstSeen.set(running, i);
  else if (i - earlier >= 2) return true;
}
return false;`,
      TYPESCRIPT: `const firstSeen = new Map<number, number>();
firstSeen.set(0, -1);
let running = 0;
for (let i = 0; i < numbers.length; i += 1) {
  running = (running + numbers[i]) % k;
  const earlier = firstSeen.get(running);
  if (earlier === undefined) firstSeen.set(running, i);
  else if (i - earlier >= 2) return true;
}
return false;`,
      PYTHON: `first_seen = {0: -1}
running = 0
for i, value in enumerate(numbers):
    running = (running + value) % k
    if running not in first_seen:
        first_seen[running] = i
    elif i - first_seen[running] >= 2:
        return True
return False`,
      JAVA: `Map<Integer, Integer> firstSeen = new HashMap<>();
firstSeen.put(0, -1);
long running = 0;
for (int i = 0; i < numbers.length; i += 1) {
    running = (running + numbers[i]) % k;
    int remainder = (int) running;
    if (!firstSeen.containsKey(remainder)) firstSeen.put(remainder, i);
    else if (i - firstSeen.get(remainder) >= 2) return true;
}
return false;`,
      CPP: `unordered_map<long long, int> firstSeen;
firstSeen[0] = -1;
long long running = 0;
for (int i = 0; i < (int)numbers.size(); i += 1) {
    running = (running + numbers[i]) % k;
    auto found = firstSeen.find(running);
    if (found == firstSeen.end()) firstSeen[running] = i;
    else if (i - found->second >= 2) return true;
}
return false;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "longest-balanced-binary-run",
    title: "Longest Run With Equal 0s and 1s",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "The list contains only 0s and 1s. Return the length of the longest run " +
      "of neighbouring values holding exactly as many 0s as 1s. If no such run " +
      "exists, return 0.",
    explanation:
      "Count a 0 as -1 and a 1 as +1, and the question becomes 'the longest run " +
      "summing to zero'. A run sums to zero exactly when the running total is " +
      "the same at both of its ends, so keep a map from running total to the " +
      "earliest position where it appeared: meeting that total again gives a " +
      "balanced run, and using the earliest position makes it the longest one " +
      "for that total. Seed the map with total 0 at position -1 so that a run " +
      "starting at the very beginning is measured correctly.",
    constraints: [
      "The list has between 1 and 100,000 values.",
      "Every value is 0 or 1.",
      "Return 0 when nothing balances.",
    ],
    hints: [
      "Turn 0 into -1 and the question becomes 'sums to zero'.",
      "Equal running totals bracket a balanced run.",
      "Keep the earliest position for each total, and seed 0 at -1.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "longestBalancedRun",
      params: [{ name: "bits", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-prefix-sum", "dsa-hashing"],
    examples: [
      { input: "bits = [0, 1]", output: "2" },
      {
        input: "bits = [0, 0, 1, 0, 0, 0, 1, 1]",
        output: "6",
        explanation: "The last six values hold three 0s and three 1s.",
      },
    ],
    tests: [
      { args: [[0, 1]], expected: 2 },
      { args: [[0, 1, 0]], expected: 2 },
      { args: [[0, 0, 1, 0, 0, 0, 1, 1]], expected: 6 },
      { args: [[1, 1, 1]], expected: 0, hidden: true },
      { args: [[0, 1, 1, 0]], expected: 4, hidden: true },
      { args: [[1]], expected: 0, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const firstSeen = new Map();
firstSeen.set(0, -1);
let running = 0;
let best = 0;
for (let i = 0; i < bits.length; i += 1) {
  running += bits[i] === 1 ? 1 : -1;
  const earlier = firstSeen.get(running);
  if (earlier === undefined) firstSeen.set(running, i);
  else if (i - earlier > best) best = i - earlier;
}
return best;`,
      TYPESCRIPT: `const firstSeen = new Map<number, number>();
firstSeen.set(0, -1);
let running = 0;
let best = 0;
for (let i = 0; i < bits.length; i += 1) {
  running += bits[i] === 1 ? 1 : -1;
  const earlier = firstSeen.get(running);
  if (earlier === undefined) firstSeen.set(running, i);
  else if (i - earlier > best) best = i - earlier;
}
return best;`,
      PYTHON: `first_seen = {0: -1}
running = 0
best = 0
for i, bit in enumerate(bits):
    running += 1 if bit == 1 else -1
    if running not in first_seen:
        first_seen[running] = i
    else:
        best = max(best, i - first_seen[running])
return best`,
      JAVA: `Map<Integer, Integer> firstSeen = new HashMap<>();
firstSeen.put(0, -1);
int running = 0;
int best = 0;
for (int i = 0; i < bits.length; i += 1) {
    running += bits[i] == 1 ? 1 : -1;
    if (!firstSeen.containsKey(running)) firstSeen.put(running, i);
    else best = Math.max(best, i - firstSeen.get(running));
}
return best;`,
      CPP: `unordered_map<int, int> firstSeen;
firstSeen[0] = -1;
int running = 0;
int best = 0;
for (int i = 0; i < (int)bits.size(); i += 1) {
    running += bits[i] == 1 ? 1 : -1;
    auto found = firstSeen.find(running);
    if (found == firstSeen.end()) firstSeen[running] = i;
    else best = max(best, i - found->second);
}
return best;`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "count-subarrays-divisible-by-k",
    title: "Count Runs Divisible by k",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Count the runs of neighbouring numbers whose total divides evenly by k. " +
      "The numbers may be negative, and every run is counted separately even if " +
      "two runs hold the same values.",
    explanation:
      "Same remainder idea as the divisibility problem, but counting rather " +
      "than detecting: every *pair* of positions sharing a remainder is a run " +
      "that divides evenly, so keep how many times each remainder has occurred " +
      "and add that count to the answer before recording the current one. The " +
      "trap is negative numbers, where most languages give a negative " +
      "remainder: -1 % 5 is -1, not 4, so -1 and 4 look like different " +
      "remainders when they are the same class. Normalise with ((r % k) + k) % k " +
      "and the counting works again.",
    constraints: [
      "The list has between 1 and 30,000 numbers.",
      "Each number is between -10,000 and 10,000.",
      "k is between 2 and 10,000.",
    ],
    hints: [
      "Every pair of equal remainders is one qualifying run.",
      "Count remainders as you go, adding the running count to the answer.",
      "Normalise negative remainders before using them as keys.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "countRunsDivisibleByK",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "k", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-prefix-sum", "dsa-hashing"],
    examples: [
      {
        input: "numbers = [4, 5, 0, -2, -3, 1], k = 5",
        output: "7",
        explanation: "Seven runs have a total divisible by 5.",
      },
      { input: "numbers = [5], k = 9", output: "0" },
    ],
    tests: [
      { args: [[4, 5, 0, -2, -3, 1], 5], expected: 7 },
      { args: [[5], 9], expected: 0 },
      { args: [[1, 2, 3], 3], expected: 3 },
      { args: [[-1, 2, 9], 2], expected: 2, hidden: true },
      { args: [[2, -2, 2, -4], 6], expected: 2, hidden: true },
      { args: [[0, 0], 3], expected: 3, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const counts = new Map();
counts.set(0, 1);
let running = 0;
let total = 0;
for (const value of numbers) {
  running = (((running + value) % k) + k) % k;
  const seen = counts.get(running) ?? 0;
  total += seen;
  counts.set(running, seen + 1);
}
return total;`,
      TYPESCRIPT: `const counts = new Map<number, number>();
counts.set(0, 1);
let running = 0;
let total = 0;
for (const value of numbers) {
  running = (((running + value) % k) + k) % k;
  const seen = counts.get(running) ?? 0;
  total += seen;
  counts.set(running, seen + 1);
}
return total;`,
      PYTHON: `counts = {0: 1}
running = 0
total = 0
for value in numbers:
    running = (running + value) % k
    seen = counts.get(running, 0)
    total += seen
    counts[running] = seen + 1
return total`,
      JAVA: `Map<Integer, Integer> counts = new HashMap<>();
counts.put(0, 1);
int running = 0;
int total = 0;
for (int value : numbers) {
    running = (((running + value) % k) + k) % k;
    int seen = counts.getOrDefault(running, 0);
    total += seen;
    counts.put(running, seen + 1);
}
return total;`,
      CPP: `unordered_map<int, int> counts;
counts[0] = 1;
int running = 0;
int total = 0;
for (int value : numbers) {
    running = (((running + value) % k) + k) % k;
    int seen = counts[running];
    total += seen;
    counts[running] = seen + 1;
}
return total;`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "matrix-region-sums",
    title: "Rectangle Sums in a Grid",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Given a grid of numbers and a set of rectangles written as [topRow, " +
      "leftColumn, bottomRow, rightColumn] with all four edges included, return " +
      "the total inside each rectangle. There can be many more rectangles than " +
      "cells.",
    explanation:
      "The one-dimensional idea, one dimension up. Build a table where entry " +
      "(r, c) holds the total of the whole rectangle from the top-left corner " +
      "down to (r - 1, c - 1); an extra leading row and column of zeros again " +
      "removes the edge cases. Then any rectangle is four lookups: the big " +
      "corner, minus the strip above, minus the strip to the left, plus the " +
      "top-left overlap that has now been subtracted twice. That " +
      "inclusion-exclusion step is the whole problem, and drawing it once on " +
      "paper is faster than deriving it in your head.",
    constraints: [
      "The grid has between 1 and 200 rows and between 1 and 200 columns.",
      "There are between 1 and 10,000 rectangles.",
      "Every rectangle is inside the grid, with topRow ≤ bottomRow and leftColumn ≤ rightColumn.",
    ],
    hints: [
      "Build a table of top-left-corner totals with an extra row and column of zeros.",
      "A rectangle is big corner - above - left + overlap.",
      "Sketch the four rectangles once and the signs stop being guesswork.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "matrixRegionSums",
      params: [
        { name: "matrix", type: "int[][]" },
        { name: "regions", type: "int[][]" },
      ],
      returns: "int[]",
    },
    topicSlugs: ["dsa-prefix-sum", "dsa-arrays"],
    examples: [
      {
        input: "matrix = [[1, 2], [3, 4]], regions = [[0, 0, 1, 1]]",
        output: "[10]",
        explanation: "The whole grid totals 10.",
      },
      {
        input: "matrix = [[1, 2], [3, 4]], regions = [[1, 0, 1, 1]]",
        output: "[7]",
      },
    ],
    tests: [
      {
        args: [
          [
            [1, 2],
            [3, 4],
          ],
          [[0, 0, 1, 1]],
        ],
        expected: [10],
      },
      {
        args: [
          [
            [3, 0, 1, 4, 2],
            [5, 6, 3, 2, 1],
            [1, 2, 0, 1, 5],
            [4, 1, 0, 1, 7],
            [1, 0, 3, 0, 5],
          ],
          [
            [2, 1, 4, 3],
            [1, 1, 2, 2],
            [1, 2, 2, 4],
          ],
        ],
        expected: [8, 11, 12],
      },
      { args: [[[1]], [[0, 0, 0, 0]]], expected: [1] },
      {
        args: [
          [
            [1, 2],
            [3, 4],
          ],
          [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
          ],
        ],
        expected: [1, 4],
        hidden: true,
      },
      {
        args: [
          [
            [-1, -1],
            [-1, -1],
          ],
          [[0, 0, 1, 1]],
        ],
        expected: [-4],
        hidden: true,
      },
      {
        args: [[[5, 5, 5]], [[0, 1, 0, 2]]],
        expected: [10],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const rows = matrix.length;
const cols = matrix[0].length;
const table = [];
for (let r = 0; r <= rows; r += 1) table.push(new Array(cols + 1).fill(0));
for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < cols; c += 1) {
    table[r + 1][c + 1] =
      matrix[r][c] + table[r][c + 1] + table[r + 1][c] - table[r][c];
  }
}
return regions.map((region) => {
  const [top, left, bottom, right] = region;
  return (
    table[bottom + 1][right + 1] -
    table[top][right + 1] -
    table[bottom + 1][left] +
    table[top][left]
  );
});`,
      TYPESCRIPT: `const rows = matrix.length;
const cols = matrix[0].length;
const table: number[][] = [];
for (let r = 0; r <= rows; r += 1) table.push(new Array(cols + 1).fill(0));
for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < cols; c += 1) {
    table[r + 1][c + 1] =
      matrix[r][c] + table[r][c + 1] + table[r + 1][c] - table[r][c];
  }
}
return regions.map((region) => {
  const [top, left, bottom, right] = region;
  return (
    table[bottom + 1][right + 1] -
    table[top][right + 1] -
    table[bottom + 1][left] +
    table[top][left]
  );
});`,
      PYTHON: `rows = len(matrix)
cols = len(matrix[0])
table = [[0] * (cols + 1) for _ in range(rows + 1)]
for r in range(rows):
    for c in range(cols):
        table[r + 1][c + 1] = matrix[r][c] + table[r][c + 1] + table[r + 1][c] - table[r][c]
result = []
for top, left, bottom, right in regions:
    result.append(
        table[bottom + 1][right + 1]
        - table[top][right + 1]
        - table[bottom + 1][left]
        + table[top][left]
    )
return result`,
      JAVA: `int rows = matrix.length;
int cols = matrix[0].length;
int[][] table = new int[rows + 1][cols + 1];
for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < cols; c += 1) {
        table[r + 1][c + 1] =
            matrix[r][c] + table[r][c + 1] + table[r + 1][c] - table[r][c];
    }
}
int[] result = new int[regions.length];
for (int i = 0; i < regions.length; i += 1) {
    int top = regions[i][0];
    int left = regions[i][1];
    int bottom = regions[i][2];
    int right = regions[i][3];
    result[i] = table[bottom + 1][right + 1]
        - table[top][right + 1]
        - table[bottom + 1][left]
        + table[top][left];
}
return result;`,
      CPP: `int rows = (int)matrix.size();
int cols = (int)matrix[0].size();
vector<vector<int>> table(rows + 1, vector<int>(cols + 1, 0));
for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < cols; c += 1) {
        table[r + 1][c + 1] =
            matrix[r][c] + table[r][c + 1] + table[r + 1][c] - table[r][c];
    }
}
vector<int> result;
for (const auto& region : regions) {
    int top = region[0];
    int left = region[1];
    int bottom = region[2];
    int right = region[3];
    result.push_back(table[bottom + 1][right + 1]
        - table[top][right + 1]
        - table[bottom + 1][left]
        + table[top][left]);
}
return result;`,
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "count-balanced-splits",
    title: "Ways to Split the List",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Count the positions where you can cut the list into two non-empty " +
      "pieces so that the left piece's total is at least the right piece's " +
      "total. A cut after position i keeps 0 through i on the left.",
    explanation:
      "Every cut is decided by one number: the running total to its left. The " +
      "right-hand total is the grand total minus that, so one pass with a " +
      "running sum answers every cut in constant time, and the loop stops one " +
      "short of the end because the right piece may not be empty. Interviewers " +
      "like this one because the naive version — recomputing both sides for " +
      "every cut — is O(n²) and looks perfectly reasonable until the input is " +
      "large.",
    constraints: [
      "The list has between 2 and 100,000 numbers.",
      "Each number is between -100,000 and 100,000.",
      "Both pieces must be non-empty.",
    ],
    hints: [
      "The right-hand total is the grand total minus the left-hand total.",
      "One running sum answers every cut.",
      "Stop one position before the end so the right piece is never empty.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "countBalancedSplits",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-prefix-sum", "js-arrays"],
    examples: [
      {
        input: "numbers = [10, 4, -8, 7]",
        output: "2",
        explanation: "Cutting after the first or second value works.",
      },
      { input: "numbers = [2, 3, 1, 0]", output: "2" },
    ],
    tests: [
      { args: [[10, 4, -8, 7]], expected: 2 },
      { args: [[2, 3, 1, 0]], expected: 2 },
      { args: [[1, 2, 3]], expected: 1 },
      { args: [[1, -1]], expected: 1, hidden: true },
      { args: [[0, 0]], expected: 1, hidden: true },
      { args: [[-1, 5]], expected: 0, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let total = 0;
for (const value of numbers) total += value;
let left = 0;
let ways = 0;
for (let i = 0; i < numbers.length - 1; i += 1) {
  left += numbers[i];
  if (left >= total - left) ways += 1;
}
return ways;`,
      TYPESCRIPT: `let total = 0;
for (const value of numbers) total += value;
let left = 0;
let ways = 0;
for (let i = 0; i < numbers.length - 1; i += 1) {
  left += numbers[i];
  if (left >= total - left) ways += 1;
}
return ways;`,
      PYTHON: `total = sum(numbers)
left = 0
ways = 0
for i in range(len(numbers) - 1):
    left += numbers[i]
    if left >= total - left:
        ways += 1
return ways`,
      JAVA: `long total = 0;
for (int value : numbers) total += value;
long left = 0;
int ways = 0;
for (int i = 0; i < numbers.length - 1; i += 1) {
    left += numbers[i];
    if (left >= total - left) ways += 1;
}
return ways;`,
      CPP: `long long total = 0;
for (int value : numbers) total += value;
long long left = 0;
int ways = 0;
for (int i = 0; i + 1 < (int)numbers.size(); i += 1) {
    left += numbers[i];
    if (left >= total - left) ways += 1;
}
return ways;`,
    },
  },
];
