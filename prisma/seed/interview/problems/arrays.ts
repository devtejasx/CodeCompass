import type { SeedProblem } from "../../problems/types";

/**
 * Arrays and traversal — the first pattern, and the one every later pattern is
 * built on top of.
 *
 * Ordered by what each problem teaches rather than by difficulty alone: a
 * running total, then a scan that keeps one running answer, then the two-pass
 * trick that removes division, then the four matrix problems that are really
 * about index arithmetic.
 *
 * Every statement is original prose written for CodeCompass. The *shapes* are
 * the classic interview shapes — they are common property, and pretending
 * otherwise would make the catalog useless for its purpose — but the wording,
 * examples, constraints, hints and explanations are written here.
 *
 * Reference solutions are multi-line template literals rather than the
 * "\n"-escaped strings the original easy/medium files use. A twenty-line
 * dynamic-programming body written as one escaped line is unreviewable, and
 * these have to be reviewable: they are the answer key, and
 * scripts/verify-solutions.ts runs them against the test cases below.
 */
export const ARRAY_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "running-sum",
    title: "Running Sum",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Given a list of numbers, return a new list where the value at each " +
      "position is the total of every number up to and including that " +
      "position. So [1, 2, 3] becomes [1, 3, 6]. The input list is not " +
      "changed.",
    explanation:
      "Carry a running total as you walk the list once: add the current number " +
      "to the total, then record the total. That is O(n) time and one new " +
      "list. The version to avoid is recomputing the sum from the start at " +
      "every position, which is O(n²) and does the same additions again and " +
      "again. This problem is worth doing carefully because it is the prefix " +
      "sum pattern in its simplest form, and prefix sums answer range questions " +
      "for the rest of the curriculum.",
    constraints: [
      "The list has between 1 and 10,000 numbers.",
      "Each number is between -1,000 and 1,000.",
      "Return a new list; do not modify the input.",
    ],
    hints: [
      "One variable holds the total so far.",
      "Add first, then record — the value at position i includes numbers[i].",
    ],
    estimatedTime: "10 min",
    signature: {
      name: "runningSum",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-arrays", "js-arrays", "data-structures"],
    examples: [
      { input: "numbers = [1, 2, 3, 4]", output: "[1, 3, 6, 10]" },
      {
        input: "numbers = [3, -2, 5]",
        output: "[3, 1, 6]",
        explanation: "Negative numbers pull the running total back down.",
      },
    ],
    tests: [
      { args: [[1, 2, 3, 4]], expected: [1, 3, 6, 10] },
      { args: [[1, 1, 1, 1, 1]], expected: [1, 2, 3, 4, 5] },
      { args: [[3, -2, 5]], expected: [3, 1, 6] },
      { args: [[0]], expected: [0], hidden: true },
      { args: [[-1, -1, -1]], expected: [-1, -2, -3], hidden: true },
      { args: [[1000, 1000, 1000]], expected: [1000, 2000, 3000], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const totals = [];
let total = 0;
for (const value of numbers) {
  total += value;
  totals.push(total);
}
return totals;`,
      TYPESCRIPT: `const totals: number[] = [];
let total = 0;
for (const value of numbers) {
  total += value;
  totals.push(total);
}
return totals;`,
      PYTHON: `totals = []
total = 0
for value in numbers:
    total += value
    totals.append(total)
return totals`,
      JAVA: `int[] totals = new int[numbers.length];
int total = 0;
for (int i = 0; i < numbers.length; i += 1) {
    total += numbers[i];
    totals[i] = total;
}
return totals;`,
      CPP: `vector<int> totals;
int total = 0;
for (int value : numbers) {
    total += value;
    totals.push_back(total);
}
return totals;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "richest-account-total",
    title: "Richest Account Total",
    difficulty: "EASY",
    interviewFrequency: "MEDIUM",
    description:
      "A bank stores each customer's balances as one row of a grid: row i holds " +
      "the amounts customer i has in each of their accounts. Return the total " +
      "held by the single richest customer.",
    explanation:
      "Two nested loops: sum each row, keep the largest sum you have seen. The " +
      "point of the problem is the grid itself — a list of lists is the shape " +
      "graphs, dynamic programming tables and image problems all arrive in, and " +
      "getting comfortable indexing rows before columns now saves confusion " +
      "later. Note that you never need to store the row totals: one variable " +
      "for the current row and one for the best so far is enough.",
    constraints: [
      "There is between 1 and 200 customers, each with between 1 and 200 accounts.",
      "Every customer has the same number of accounts.",
      "Each balance is between 0 and 100,000.",
    ],
    hints: [
      "Sum one row at a time.",
      "Keep the best total in a variable rather than building a list of totals.",
    ],
    estimatedTime: "10 min",
    signature: {
      name: "richestAccountTotal",
      params: [{ name: "accounts", type: "int[][]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-arrays", "js-arrays"],
    examples: [
      {
        input: "accounts = [[1, 2, 3], [3, 2, 1]]",
        output: "6",
        explanation: "Both customers hold 6; the answer is that total.",
      },
      { input: "accounts = [[1, 5], [7, 3], [3, 5]]", output: "10" },
    ],
    tests: [
      {
        args: [
          [
            [1, 2, 3],
            [3, 2, 1],
          ],
        ],
        expected: 6,
      },
      {
        args: [
          [
            [1, 5],
            [7, 3],
            [3, 5],
          ],
        ],
        expected: 10,
      },
      {
        args: [
          [
            [2, 8, 7],
            [7, 1, 3],
            [1, 9, 5],
          ],
        ],
        expected: 17,
      },
      { args: [[[10]]], expected: 10, hidden: true },
      {
        args: [
          [
            [0, 0],
            [0, 0],
          ],
        ],
        expected: 0,
        hidden: true,
      },
      {
        args: [
          [
            [1, 1],
            [1, 2],
          ],
        ],
        expected: 3,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `let best = 0;
for (const account of accounts) {
  let total = 0;
  for (const amount of account) total += amount;
  if (total > best) best = total;
}
return best;`,
      TYPESCRIPT: `let best = 0;
for (const account of accounts) {
  let total = 0;
  for (const amount of account) total += amount;
  if (total > best) best = total;
}
return best;`,
      PYTHON: `best = 0
for account in accounts:
    total = 0
    for amount in account:
        total += amount
    if total > best:
        best = total
return best`,
      JAVA: `int best = 0;
for (int[] account : accounts) {
    int total = 0;
    for (int amount : account) total += amount;
    if (total > best) best = total;
}
return best;`,
      CPP: `int best = 0;
for (const auto& account : accounts) {
    int total = 0;
    for (int amount : account) total += amount;
    if (total > best) best = total;
}
return best;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "plus-one-digits",
    title: "Add One to a Digit List",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "A non-negative number is stored as a list of digits, most significant " +
      "first: [1, 2, 3] is 123. Add one to it and return the new digit list. " +
      "The number can be far too large to hold in an integer, so do the " +
      "arithmetic on the digits themselves.",
    explanation:
      "Walk from the last digit backwards. A digit below 9 can absorb the " +
      "increment, so add one and you are finished. A 9 becomes 0 and the carry " +
      "moves left. If you fall off the front, every digit was a 9 — the answer " +
      "is a 1 followed by that many zeros, which is one longer than the input. " +
      "That last case is the whole problem: converting to an integer works on " +
      "the examples and fails the moment the input is longer than the language's " +
      "integer, which is exactly what the interviewer is checking for.",
    constraints: [
      "The list has between 1 and 100 digits.",
      "Each digit is between 0 and 9.",
      "The number has no leading zeros, except the single number 0.",
    ],
    hints: [
      "Start from the last digit and move left.",
      "A digit below 9 ends the work immediately.",
      "If the loop finishes, the answer is one digit longer than the input.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "plusOne",
      params: [{ name: "digits", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-arrays", "js-arrays"],
    examples: [
      { input: "digits = [1, 2, 3]", output: "[1, 2, 4]" },
      {
        input: "digits = [9, 9]",
        output: "[1, 0, 0]",
        explanation: "99 + 1 = 100, which needs one more digit than 99 had.",
      },
    ],
    tests: [
      { args: [[1, 2, 3]], expected: [1, 2, 4] },
      { args: [[4, 9, 9]], expected: [5, 0, 0] },
      { args: [[9, 9]], expected: [1, 0, 0] },
      { args: [[0]], expected: [1], hidden: true },
      { args: [[9]], expected: [1, 0], hidden: true },
      { args: [[1, 9, 9, 9]], expected: [2, 0, 0, 0], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const result = digits.slice();
for (let i = result.length - 1; i >= 0; i -= 1) {
  if (result[i] < 9) {
    result[i] += 1;
    return result;
  }
  result[i] = 0;
}
return [1, ...result];`,
      TYPESCRIPT: `const result: number[] = digits.slice();
for (let i = result.length - 1; i >= 0; i -= 1) {
  if (result[i] < 9) {
    result[i] += 1;
    return result;
  }
  result[i] = 0;
}
return [1, ...result];`,
      PYTHON: `result = list(digits)
for i in range(len(result) - 1, -1, -1):
    if result[i] < 9:
        result[i] += 1
        return result
    result[i] = 0
return [1] + result`,
      JAVA: `int[] result = Arrays.copyOf(digits, digits.length);
for (int i = result.length - 1; i >= 0; i -= 1) {
    if (result[i] < 9) {
        result[i] += 1;
        return result;
    }
    result[i] = 0;
}
int[] carried = new int[result.length + 1];
carried[0] = 1;
return carried;`,
      CPP: `vector<int> result = digits;
for (int i = (int)result.size() - 1; i >= 0; i -= 1) {
    if (result[i] < 9) {
        result[i] += 1;
        return result;
    }
    result[i] = 0;
}
result.insert(result.begin(), 1);
return result;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "missing-number",
    title: "The Missing Number",
    difficulty: "EASY",
    interviewFrequency: "VERY_HIGH",
    description:
      "A list holds n distinct numbers taken from the range 0 to n — which is " +
      "n + 1 possible values, so exactly one is missing. Return the missing " +
      "one. The list is in no particular order.",
    explanation:
      "The numbers 0 to n add up to n × (n + 1) / 2, and that formula does not " +
      "care what order they arrive in. Subtract every number you actually have " +
      "from that total and what is left is the one you do not have. One pass, " +
      "no extra memory, no sorting. A hash set also works and is a perfectly " +
      "good answer, but it costs O(n) memory to avoid arithmetic you already " +
      "know. The XOR solution is a third answer worth knowing once you reach " +
      "bit manipulation.",
    constraints: [
      "The list has between 1 and 10,000 numbers.",
      "Every number is between 0 and n, where n is the length of the list.",
      "No number appears twice.",
    ],
    hints: [
      "You know what the numbers should add up to before you look at them.",
      "Sum the range, subtract the list, and the difference is the answer.",
    ],
    estimatedTime: "10 min",
    signature: {
      name: "missingNumber",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-arrays", "js-arrays", "data-structures"],
    examples: [
      {
        input: "numbers = [3, 0, 1]",
        output: "2",
        explanation: "n is 3, so the values should be 0, 1, 2, 3 — 2 is absent.",
      },
      { input: "numbers = [0, 1]", output: "2" },
    ],
    tests: [
      { args: [[3, 0, 1]], expected: 2 },
      { args: [[0, 1]], expected: 2 },
      { args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expected: 8 },
      { args: [[0]], expected: 1, hidden: true },
      { args: [[1]], expected: 0, hidden: true },
      { args: [[0, 1, 2, 3, 4, 5]], expected: 6, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const n = numbers.length;
let missing = (n * (n + 1)) / 2;
for (const value of numbers) missing -= value;
return missing;`,
      TYPESCRIPT: `const n = numbers.length;
let missing = (n * (n + 1)) / 2;
for (const value of numbers) missing -= value;
return missing;`,
      PYTHON: `n = len(numbers)
missing = n * (n + 1) // 2
for value in numbers:
    missing -= value
return missing`,
      JAVA: `int n = numbers.length;
int missing = n * (n + 1) / 2;
for (int value : numbers) missing -= value;
return missing;`,
      CPP: `int n = (int)numbers.size();
int missing = n * (n + 1) / 2;
for (int value : numbers) missing -= value;
return missing;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "majority-element",
    title: "The Majority Element",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "One value in the list appears more times than all the others put " +
      "together — strictly more than half the length. Return that value. You " +
      "are told it always exists.",
    explanation:
      "Counting occurrences in a hash map works and is the answer most people " +
      "give first. The one interviewers are hoping for is Boyer-Moore voting, " +
      "which uses two variables and no map at all: hold a candidate and a " +
      "count, increase the count when you see the candidate again, decrease it " +
      "otherwise, and adopt a new candidate whenever the count hits zero. It " +
      "works because every non-majority value can cancel at most one majority " +
      "value, and there are not enough of them to cancel them all — so whatever " +
      "survives to the end is the majority.",
    constraints: [
      "The list has between 1 and 50,000 numbers.",
      "A majority element is guaranteed to exist.",
      "Aim for O(n) time and O(1) extra memory.",
    ],
    hints: [
      "A hash map of counts solves it — then try to do it with two variables.",
      "Hold a candidate and a count; reset the candidate when the count reaches zero.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "majorityElement",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-arrays", "js-arrays"],
    examples: [
      { input: "numbers = [3, 2, 3]", output: "3" },
      {
        input: "numbers = [2, 2, 1, 1, 1, 2, 2]",
        output: "2",
        explanation: "2 appears four times out of seven, which is more than half.",
      },
    ],
    tests: [
      { args: [[3, 2, 3]], expected: 3 },
      { args: [[2, 2, 1, 1, 1, 2, 2]], expected: 2 },
      { args: [[1]], expected: 1 },
      { args: [[6, 5, 5]], expected: 5, hidden: true },
      { args: [[4, 4, 4, 2, 2]], expected: 4, hidden: true },
      { args: [[-1, -1, -1, 2, 3]], expected: -1, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let candidate = numbers[0];
let count = 0;
for (const value of numbers) {
  if (count === 0) candidate = value;
  count += value === candidate ? 1 : -1;
}
return candidate;`,
      TYPESCRIPT: `let candidate = numbers[0];
let count = 0;
for (const value of numbers) {
  if (count === 0) candidate = value;
  count += value === candidate ? 1 : -1;
}
return candidate;`,
      PYTHON: `candidate = numbers[0]
count = 0
for value in numbers:
    if count == 0:
        candidate = value
    count += 1 if value == candidate else -1
return candidate`,
      JAVA: `int candidate = numbers[0];
int count = 0;
for (int value : numbers) {
    if (count == 0) candidate = value;
    count += (value == candidate) ? 1 : -1;
}
return candidate;`,
      CPP: `int candidate = numbers[0];
int count = 0;
for (int value : numbers) {
    if (count == 0) candidate = value;
    count += (value == candidate) ? 1 : -1;
}
return candidate;`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "transpose-matrix",
    title: "Transpose a Matrix",
    difficulty: "EASY",
    interviewFrequency: "MEDIUM",
    description:
      "Transposing a grid flips it over its main diagonal: the value at row r, " +
      "column c moves to row c, column r. A 2×3 grid becomes a 3×2 grid. " +
      "Return the transposed grid as a new list of lists.",
    explanation:
      "The whole solution is one line of index arithmetic — result[c][r] = " +
      "matrix[r][c] — wrapped in two loops. What makes it worth practising is " +
      "the shape change: the result has as many rows as the input had columns, " +
      "so you cannot build it by copying the input and swapping in place unless " +
      "the grid is square. Allocating the result with the right dimensions " +
      "first, then filling it, is the habit that makes every later grid problem " +
      "straightforward.",
    constraints: [
      "The grid has between 1 and 1,000 rows and between 1 and 1,000 columns.",
      "Every row has the same length.",
      "Each value is between -10,000 and 10,000.",
    ],
    hints: [
      "The result has as many rows as the input has columns.",
      "result[c][r] is matrix[r][c] — write that down before you write the loops.",
    ],
    estimatedTime: "10 min",
    signature: {
      name: "transposeMatrix",
      params: [{ name: "matrix", type: "int[][]" }],
      returns: "int[][]",
    },
    topicSlugs: ["dsa-arrays", "js-arrays"],
    examples: [
      {
        input: "matrix = [[1, 2, 3], [4, 5, 6]]",
        output: "[[1, 4], [2, 5], [3, 6]]",
        explanation: "Two rows of three become three rows of two.",
      },
      { input: "matrix = [[1, 2], [3, 4]]", output: "[[1, 3], [2, 4]]" },
    ],
    tests: [
      {
        args: [
          [
            [1, 2, 3],
            [4, 5, 6],
          ],
        ],
        expected: [
          [1, 4],
          [2, 5],
          [3, 6],
        ],
      },
      {
        args: [
          [
            [1, 2],
            [3, 4],
          ],
        ],
        expected: [
          [1, 3],
          [2, 4],
        ],
      },
      { args: [[[7]]], expected: [[7]], hidden: true },
      { args: [[[1, 2, 3]]], expected: [[1], [2], [3]], hidden: true },
      {
        args: [[[-1], [0], [1]]],
        expected: [[-1, 0, 1]],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const rows = matrix.length;
const cols = matrix[0].length;
const result = [];
for (let c = 0; c < cols; c += 1) {
  const row = [];
  for (let r = 0; r < rows; r += 1) row.push(matrix[r][c]);
  result.push(row);
}
return result;`,
      TYPESCRIPT: `const rows = matrix.length;
const cols = matrix[0].length;
const result: number[][] = [];
for (let c = 0; c < cols; c += 1) {
  const row: number[] = [];
  for (let r = 0; r < rows; r += 1) row.push(matrix[r][c]);
  result.push(row);
}
return result;`,
      PYTHON: `rows = len(matrix)
cols = len(matrix[0])
return [[matrix[r][c] for r in range(rows)] for c in range(cols)]`,
      JAVA: `int rows = matrix.length;
int cols = matrix[0].length;
int[][] result = new int[cols][rows];
for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < cols; c += 1) {
        result[c][r] = matrix[r][c];
    }
}
return result;`,
      CPP: `int rows = (int)matrix.size();
int cols = (int)matrix[0].size();
vector<vector<int>> result(cols, vector<int>(rows));
for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < cols; c += 1) {
        result[c][r] = matrix[r][c];
    }
}
return result;`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "best-time-to-trade",
    title: "Best Single Trade",
    difficulty: "EASY",
    interviewFrequency: "VERY_HIGH",
    description:
      "You are given the price of one share on each of several consecutive " +
      "days. You may buy on one day and sell on a later day, at most once. " +
      "Return the largest profit available, or 0 if every trade loses money.",
    explanation:
      "The brute force compares every buy day with every later sell day, which " +
      "is O(n²) and passes small tests before timing out on real ones. The " +
      "insight is that when you are standing on a possible sell day, the only " +
      "buy day that matters is the cheapest one so far — you do not need the " +
      "others. So walk forward keeping two numbers: the cheapest price seen and " +
      "the best profit seen. Each day, update the cheapest price, then check " +
      "what selling today would earn. One pass, constant memory. The 0 case " +
      "matters: a falling market means no trade, and no trade is allowed.",
    constraints: [
      "There is between 1 and 100,000 daily prices.",
      "Each price is between 0 and 10,000.",
      "You must buy before you sell; doing nothing earns 0.",
    ],
    hints: [
      "You do not need every earlier price — only the cheapest one.",
      "Track the cheapest price so far and the best profit so far in one pass.",
      "A market that only falls should return 0, not a negative number.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "bestSingleTrade",
      params: [{ name: "prices", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-arrays", "js-arrays", "data-structures"],
    examples: [
      {
        input: "prices = [7, 1, 5, 3, 6, 4]",
        output: "5",
        explanation: "Buy on the day priced 1, sell on the day priced 6.",
      },
      {
        input: "prices = [7, 6, 4, 3, 1]",
        output: "0",
        explanation: "Every later price is lower, so the best move is not to trade.",
      },
    ],
    tests: [
      { args: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { args: [[7, 6, 4, 3, 1]], expected: 0 },
      { args: [[1, 2]], expected: 1 },
      { args: [[2, 4, 1]], expected: 2, hidden: true },
      { args: [[3, 3, 3]], expected: 0, hidden: true },
      { args: [[5]], expected: 0, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let cheapest = prices[0];
let best = 0;
for (const price of prices) {
  if (price < cheapest) cheapest = price;
  else if (price - cheapest > best) best = price - cheapest;
}
return best;`,
      TYPESCRIPT: `let cheapest = prices[0];
let best = 0;
for (const price of prices) {
  if (price < cheapest) cheapest = price;
  else if (price - cheapest > best) best = price - cheapest;
}
return best;`,
      PYTHON: `cheapest = prices[0]
best = 0
for price in prices:
    if price < cheapest:
        cheapest = price
    elif price - cheapest > best:
        best = price - cheapest
return best`,
      JAVA: `int cheapest = prices[0];
int best = 0;
for (int price : prices) {
    if (price < cheapest) cheapest = price;
    else if (price - cheapest > best) best = price - cheapest;
}
return best;`,
      CPP: `int cheapest = prices[0];
int best = 0;
for (int price : prices) {
    if (price < cheapest) cheapest = price;
    else if (price - cheapest > best) best = price - cheapest;
}
return best;`,
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "largest-contiguous-sum",
    title: "Largest Contiguous Sum",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Find the largest total any run of neighbouring numbers can reach. The " +
      "run must be contiguous and must contain at least one number, so a list " +
      "of entirely negative numbers answers with its least negative value.",
    explanation:
      "This is Kadane's algorithm, and the idea is one question asked at every " +
      "position: is the run ending here better off keeping what came before, or " +
      "starting fresh from this number? If the total so far is negative it is " +
      "dragging you down, so start again. Keep that best-run-ending-here value " +
      "and, separately, the best you have ever seen — they are different " +
      "numbers and conflating them is the usual bug. Starting both at the first " +
      "element rather than at 0 is what makes the all-negative case come out " +
      "right.",
    constraints: [
      "The list has between 1 and 100,000 numbers.",
      "Each number is between -10,000 and 10,000.",
      "The run must contain at least one number.",
    ],
    hints: [
      "At each position, either extend the previous run or start a new one.",
      "Extending is only worth it while the running total is positive.",
      "Start your answer at the first element, not at 0.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "largestContiguousSum",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-arrays", "data-structures"],
    examples: [
      {
        input: "numbers = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
        output: "6",
        explanation: "The run [4, -1, 2, 1] totals 6.",
      },
      {
        input: "numbers = [-5, -2, -9]",
        output: "-2",
        explanation: "Every run is negative, so the best is the single -2.",
      },
    ],
    tests: [
      { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { args: [[1]], expected: 1 },
      { args: [[-5, -2, -9]], expected: -2 },
      { args: [[5, 4, -1, 7, 8]], expected: 23, hidden: true },
      { args: [[-1, -2, -3, -4]], expected: -1, hidden: true },
      { args: [[2, -1, 2, -1, 2]], expected: 4, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let best = numbers[0];
let current = numbers[0];
for (let i = 1; i < numbers.length; i += 1) {
  current = Math.max(numbers[i], current + numbers[i]);
  best = Math.max(best, current);
}
return best;`,
      TYPESCRIPT: `let best = numbers[0];
let current = numbers[0];
for (let i = 1; i < numbers.length; i += 1) {
  current = Math.max(numbers[i], current + numbers[i]);
  best = Math.max(best, current);
}
return best;`,
      PYTHON: `best = numbers[0]
current = numbers[0]
for i in range(1, len(numbers)):
    current = max(numbers[i], current + numbers[i])
    best = max(best, current)
return best`,
      JAVA: `int best = numbers[0];
int current = numbers[0];
for (int i = 1; i < numbers.length; i += 1) {
    current = Math.max(numbers[i], current + numbers[i]);
    best = Math.max(best, current);
}
return best;`,
      CPP: `int best = numbers[0];
int current = numbers[0];
for (int i = 1; i < (int)numbers.size(); i += 1) {
    current = max(numbers[i], current + numbers[i]);
    best = max(best, current);
}
return best;`,
    },
  },

  // ── 9 ───────────────────────────────────────────────────────────────────
  {
    slug: "product-except-self",
    title: "Product of Everything Else",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Return a list where each position holds the product of every number in " +
      "the input except the one at that position. Solve it without using " +
      "division — the list can contain zeros, and dividing by one is not an " +
      "option.",
    explanation:
      "Everything except position i is everything to its left multiplied by " +
      "everything to its right. So make two passes. The first walks forwards " +
      "writing the running product of everything before each position; the " +
      "second walks backwards multiplying in the running product of everything " +
      "after it. Two passes, one output list, no division, and zeros need no " +
      "special handling at all — which is the elegant part, because the " +
      "division solution needs a separate branch for one zero and another for " +
      "two.",
    constraints: [
      "The list has between 2 and 10,000 numbers.",
      "Each number is between -30 and 30, and every product fits in a 32-bit integer.",
      "Division is not allowed.",
    ],
    hints: [
      "The answer at i is (everything left of i) × (everything right of i).",
      "One forward pass can fill in the left products in place.",
      "A backward pass then multiplies in the right products with one variable.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "productExceptSelf",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-arrays", "data-structures"],
    examples: [
      {
        input: "numbers = [1, 2, 3, 4]",
        output: "[24, 12, 8, 6]",
        explanation: "24 is 2×3×4, 12 is 1×3×4, and so on.",
      },
      {
        input: "numbers = [1, 0, 3]",
        output: "[0, 3, 0]",
        explanation: "Only the position holding the zero has a non-zero answer.",
      },
    ],
    tests: [
      { args: [[1, 2, 3, 4]], expected: [24, 12, 8, 6] },
      { args: [[2, 3]], expected: [3, 2] },
      { args: [[1, 0, 3]], expected: [0, 3, 0] },
      { args: [[0, 0]], expected: [0, 0], hidden: true },
      { args: [[-1, 1, 0, -3, 3]], expected: [0, 0, 9, 0, 0], hidden: true },
      { args: [[5, 5, 5]], expected: [25, 25, 25], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const n = numbers.length;
const result = new Array(n).fill(1);
let prefix = 1;
for (let i = 0; i < n; i += 1) {
  result[i] = prefix;
  prefix *= numbers[i];
}
let suffix = 1;
for (let i = n - 1; i >= 0; i -= 1) {
  result[i] *= suffix;
  suffix *= numbers[i];
}
return result;`,
      TYPESCRIPT: `const n = numbers.length;
const result: number[] = new Array(n).fill(1);
let prefix = 1;
for (let i = 0; i < n; i += 1) {
  result[i] = prefix;
  prefix *= numbers[i];
}
let suffix = 1;
for (let i = n - 1; i >= 0; i -= 1) {
  result[i] *= suffix;
  suffix *= numbers[i];
}
return result;`,
      PYTHON: `n = len(numbers)
result = [1] * n
prefix = 1
for i in range(n):
    result[i] = prefix
    prefix *= numbers[i]
suffix = 1
for i in range(n - 1, -1, -1):
    result[i] *= suffix
    suffix *= numbers[i]
return result`,
      JAVA: `int n = numbers.length;
int[] result = new int[n];
int prefix = 1;
for (int i = 0; i < n; i += 1) {
    result[i] = prefix;
    prefix *= numbers[i];
}
int suffix = 1;
for (int i = n - 1; i >= 0; i -= 1) {
    result[i] *= suffix;
    suffix *= numbers[i];
}
return result;`,
      CPP: `int n = (int)numbers.size();
vector<int> result(n, 1);
int prefix = 1;
for (int i = 0; i < n; i += 1) {
    result[i] = prefix;
    prefix *= numbers[i];
}
int suffix = 1;
for (int i = n - 1; i >= 0; i -= 1) {
    result[i] *= suffix;
    suffix *= numbers[i];
}
return result;`,
    },
  },

  // ── 10 ──────────────────────────────────────────────────────────────────
  {
    slug: "rotate-array-right",
    title: "Rotate a List to the Right",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Move every element of the list to the right by a given number of steps, " +
      "wrapping the ones that fall off the end back around to the front. " +
      "Return the rotated list. The number of steps can be larger than the " +
      "list itself.",
    explanation:
      "Rotating by the length of the list changes nothing, so the first move is " +
      "always steps % length — otherwise a large step count turns into a large " +
      "amount of pointless work. After that, the element at index i belongs at " +
      "index (i + steps) % length, which is the whole algorithm in one line. " +
      "The interview variant asks for it in place with no extra list, and the " +
      "trick there is reversing the whole list and then reversing the two " +
      "pieces — worth trying once you have this version working.",
    constraints: [
      "The list has between 1 and 100,000 numbers.",
      "The number of steps is between 0 and 1,000,000.",
      "Return a new list; the input is not modified.",
    ],
    hints: [
      "Rotating by exactly the length is the same as not rotating at all.",
      "Reduce the step count with the remainder operator before doing any work.",
      "Element i ends up at (i + steps) % length.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "rotateRight",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "steps", type: "int" },
      ],
      returns: "int[]",
    },
    topicSlugs: ["dsa-arrays", "js-arrays"],
    examples: [
      {
        input: "numbers = [1, 2, 3, 4, 5], steps = 2",
        output: "[4, 5, 1, 2, 3]",
        explanation: "The last two values wrap around to the front.",
      },
      {
        input: "numbers = [1, 2], steps = 3",
        output: "[2, 1]",
        explanation: "Three steps over a list of two is the same as one step.",
      },
    ],
    tests: [
      { args: [[1, 2, 3, 4, 5], 2], expected: [4, 5, 1, 2, 3] },
      { args: [[1, 2], 3], expected: [2, 1] },
      { args: [[1, 2, 3], 0], expected: [1, 2, 3] },
      { args: [[1], 5], expected: [1], hidden: true },
      { args: [[1, 2, 3, 4], 4], expected: [1, 2, 3, 4], hidden: true },
      { args: [[-1, -100, 3, 99], 2], expected: [3, 99, -1, -100], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const n = numbers.length;
const shift = steps % n;
const result = new Array(n).fill(0);
for (let i = 0; i < n; i += 1) {
  result[(i + shift) % n] = numbers[i];
}
return result;`,
      TYPESCRIPT: `const n = numbers.length;
const shift = steps % n;
const result: number[] = new Array(n).fill(0);
for (let i = 0; i < n; i += 1) {
  result[(i + shift) % n] = numbers[i];
}
return result;`,
      PYTHON: `n = len(numbers)
shift = steps % n
result = [0] * n
for i in range(n):
    result[(i + shift) % n] = numbers[i]
return result`,
      JAVA: `int n = numbers.length;
int shift = steps % n;
int[] result = new int[n];
for (int i = 0; i < n; i += 1) {
    result[(i + shift) % n] = numbers[i];
}
return result;`,
      CPP: `int n = (int)numbers.size();
int shift = steps % n;
vector<int> result(n, 0);
for (int i = 0; i < n; i += 1) {
    result[(i + shift) % n] = numbers[i];
}
return result;`,
    },
  },

  // ── 11 ──────────────────────────────────────────────────────────────────
  {
    slug: "spiral-order",
    title: "Spiral Order",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Read every value of a grid in spiral order — left to right along the " +
      "top, down the right side, right to left along the bottom, up the left " +
      "side, then inwards — and return them as a single list.",
    explanation:
      "Track four boundaries: top, bottom, left and right. Walk one edge, then " +
      "move that boundary inwards, and repeat while the boundaries have not " +
      "crossed. The two checks that catch people out are the bottom row and the " +
      "left column: after walking the top row and the right column, a grid with " +
      "one row left would otherwise walk it a second time backwards. Guarding " +
      "each of those two passes with a fresh boundary comparison is what makes " +
      "single-row and single-column grids come out right.",
    constraints: [
      "The grid has between 1 and 100 rows and between 1 and 100 columns.",
      "Every row has the same length.",
      "Each value is between -1,000 and 1,000.",
    ],
    hints: [
      "Keep four boundaries and shrink them as you consume each edge.",
      "Loop while top ≤ bottom and left ≤ right.",
      "Re-check the boundaries before the bottom row and the left column.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "spiralOrder",
      params: [{ name: "matrix", type: "int[][]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-arrays", "js-arrays"],
    examples: [
      {
        input: "matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]",
        output: "[1, 2, 3, 6, 9, 8, 7, 4, 5]",
        explanation: "Around the outside clockwise, then the centre.",
      },
      { input: "matrix = [[1, 2], [3, 4]]", output: "[1, 2, 4, 3]" },
    ],
    tests: [
      {
        args: [
          [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
          ],
        ],
        expected: [1, 2, 3, 6, 9, 8, 7, 4, 5],
      },
      {
        args: [
          [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
          ],
        ],
        expected: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7],
      },
      { args: [[[1]]], expected: [1] },
      {
        args: [
          [
            [1, 2],
            [3, 4],
          ],
        ],
        expected: [1, 2, 4, 3],
        hidden: true,
      },
      { args: [[[1], [2], [3]]], expected: [1, 2, 3], hidden: true },
      { args: [[[1, 2, 3]]], expected: [1, 2, 3], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const result = [];
let top = 0;
let bottom = matrix.length - 1;
let left = 0;
let right = matrix[0].length - 1;
while (top <= bottom && left <= right) {
  for (let c = left; c <= right; c += 1) result.push(matrix[top][c]);
  top += 1;
  for (let r = top; r <= bottom; r += 1) result.push(matrix[r][right]);
  right -= 1;
  if (top <= bottom) {
    for (let c = right; c >= left; c -= 1) result.push(matrix[bottom][c]);
    bottom -= 1;
  }
  if (left <= right) {
    for (let r = bottom; r >= top; r -= 1) result.push(matrix[r][left]);
    left += 1;
  }
}
return result;`,
      TYPESCRIPT: `const result: number[] = [];
let top = 0;
let bottom = matrix.length - 1;
let left = 0;
let right = matrix[0].length - 1;
while (top <= bottom && left <= right) {
  for (let c = left; c <= right; c += 1) result.push(matrix[top][c]);
  top += 1;
  for (let r = top; r <= bottom; r += 1) result.push(matrix[r][right]);
  right -= 1;
  if (top <= bottom) {
    for (let c = right; c >= left; c -= 1) result.push(matrix[bottom][c]);
    bottom -= 1;
  }
  if (left <= right) {
    for (let r = bottom; r >= top; r -= 1) result.push(matrix[r][left]);
    left += 1;
  }
}
return result;`,
      PYTHON: `result = []
top = 0
bottom = len(matrix) - 1
left = 0
right = len(matrix[0]) - 1
while top <= bottom and left <= right:
    for c in range(left, right + 1):
        result.append(matrix[top][c])
    top += 1
    for r in range(top, bottom + 1):
        result.append(matrix[r][right])
    right -= 1
    if top <= bottom:
        for c in range(right, left - 1, -1):
            result.append(matrix[bottom][c])
        bottom -= 1
    if left <= right:
        for r in range(bottom, top - 1, -1):
            result.append(matrix[r][left])
        left += 1
return result`,
      JAVA: `int rows = matrix.length;
int cols = matrix[0].length;
int[] result = new int[rows * cols];
int at = 0;
int top = 0;
int bottom = rows - 1;
int left = 0;
int right = cols - 1;
while (top <= bottom && left <= right) {
    for (int c = left; c <= right; c += 1) result[at++] = matrix[top][c];
    top += 1;
    for (int r = top; r <= bottom; r += 1) result[at++] = matrix[r][right];
    right -= 1;
    if (top <= bottom) {
        for (int c = right; c >= left; c -= 1) result[at++] = matrix[bottom][c];
        bottom -= 1;
    }
    if (left <= right) {
        for (int r = bottom; r >= top; r -= 1) result[at++] = matrix[r][left];
        left += 1;
    }
}
return result;`,
      CPP: `vector<int> result;
int top = 0;
int bottom = (int)matrix.size() - 1;
int left = 0;
int right = (int)matrix[0].size() - 1;
while (top <= bottom && left <= right) {
    for (int c = left; c <= right; c += 1) result.push_back(matrix[top][c]);
    top += 1;
    for (int r = top; r <= bottom; r += 1) result.push_back(matrix[r][right]);
    right -= 1;
    if (top <= bottom) {
        for (int c = right; c >= left; c -= 1) result.push_back(matrix[bottom][c]);
        bottom -= 1;
    }
    if (left <= right) {
        for (int r = bottom; r >= top; r -= 1) result.push_back(matrix[r][left]);
        left += 1;
    }
}
return result;`,
    },
  },

  // ── 12 ──────────────────────────────────────────────────────────────────
  {
    slug: "rotate-image-clockwise",
    title: "Rotate an Image",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "An image is stored as a square grid of pixel values. Rotate it 90 " +
      "degrees clockwise and return the rotated grid: the top row becomes the " +
      "right-hand column, the left column becomes the top row.",
    explanation:
      "Work out where one pixel goes and the rest follows. In an n×n grid, the " +
      "pixel at row r, column c lands at row c, column n - 1 - r. Building a " +
      "fresh grid from that formula is clear and correct, and it is what this " +
      "problem asks for. The follow-up an interviewer usually adds is to do it " +
      "in place, which is two steps rather than one: transpose the grid, then " +
      "reverse each row. Knowing that the second is equivalent to the first is " +
      "the part worth remembering.",
    constraints: [
      "The grid is square, between 1×1 and 200×200.",
      "Each value is between 0 and 255.",
      "Return a new grid rather than modifying the input.",
    ],
    hints: [
      "Rotate one corner by hand and find the index formula.",
      "Row r, column c ends up at row c, column n - 1 - r.",
      "In place, the same rotation is a transpose followed by reversing each row.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "rotateImage",
      params: [{ name: "matrix", type: "int[][]" }],
      returns: "int[][]",
    },
    topicSlugs: ["dsa-arrays", "js-arrays"],
    examples: [
      {
        input: "matrix = [[1, 2], [3, 4]]",
        output: "[[3, 1], [4, 2]]",
        explanation: "3 was bottom-left and is now top-left.",
      },
      {
        input: "matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]",
        output: "[[7, 4, 1], [8, 5, 2], [9, 6, 3]]",
      },
    ],
    tests: [
      {
        args: [
          [
            [1, 2],
            [3, 4],
          ],
        ],
        expected: [
          [3, 1],
          [4, 2],
        ],
      },
      {
        args: [
          [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
          ],
        ],
        expected: [
          [7, 4, 1],
          [8, 5, 2],
          [9, 6, 3],
        ],
      },
      { args: [[[1]]], expected: [[1]], hidden: true },
      {
        args: [
          [
            [5, 1, 9, 11],
            [2, 4, 8, 10],
            [13, 3, 6, 7],
            [15, 14, 12, 16],
          ],
        ],
        expected: [
          [15, 13, 2, 5],
          [14, 3, 4, 1],
          [12, 6, 8, 9],
          [16, 7, 10, 11],
        ],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const n = matrix.length;
const result = [];
for (let r = 0; r < n; r += 1) result.push(new Array(n).fill(0));
for (let r = 0; r < n; r += 1) {
  for (let c = 0; c < n; c += 1) {
    result[c][n - 1 - r] = matrix[r][c];
  }
}
return result;`,
      TYPESCRIPT: `const n = matrix.length;
const result: number[][] = [];
for (let r = 0; r < n; r += 1) result.push(new Array(n).fill(0));
for (let r = 0; r < n; r += 1) {
  for (let c = 0; c < n; c += 1) {
    result[c][n - 1 - r] = matrix[r][c];
  }
}
return result;`,
      PYTHON: `n = len(matrix)
result = [[0] * n for _ in range(n)]
for r in range(n):
    for c in range(n):
        result[c][n - 1 - r] = matrix[r][c]
return result`,
      JAVA: `int n = matrix.length;
int[][] result = new int[n][n];
for (int r = 0; r < n; r += 1) {
    for (int c = 0; c < n; c += 1) {
        result[c][n - 1 - r] = matrix[r][c];
    }
}
return result;`,
      CPP: `int n = (int)matrix.size();
vector<vector<int>> result(n, vector<int>(n, 0));
for (int r = 0; r < n; r += 1) {
    for (int c = 0; c < n; c += 1) {
        result[c][n - 1 - r] = matrix[r][c];
    }
}
return result;`,
    },
  },

  // ── 13 ──────────────────────────────────────────────────────────────────
  {
    slug: "zero-out-rows-and-columns",
    title: "Zero Out Rows and Columns",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Wherever a grid contains a zero, the whole of that cell's row and the " +
      "whole of its column must become zero. Return the resulting grid. A grid " +
      "with no zeros comes back unchanged.",
    explanation:
      "The trap is doing it as you go: zeroing a row immediately creates new " +
      "zeros, and those new zeros then zero their own columns until the grid is " +
      "empty. So the work has two phases. First find which rows and which " +
      "columns contain an original zero and record them. Only then build the " +
      "answer, blanking a cell if its row or its column was marked. The classic " +
      "follow-up is to store those marks in the grid's own first row and column " +
      "to reach constant extra memory — the same two-phase idea, with the marks " +
      "kept somewhere cheaper.",
    constraints: [
      "The grid has between 1 and 200 rows and between 1 and 200 columns.",
      "Each value is between -1,000 and 1,000.",
      "Return a new grid rather than modifying the input.",
    ],
    hints: [
      "Do not blank anything while you are still looking for zeros.",
      "Collect the rows and columns that need blanking first, then build the answer.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "zeroOutRowsAndColumns",
      params: [{ name: "matrix", type: "int[][]" }],
      returns: "int[][]",
    },
    topicSlugs: ["dsa-arrays", "js-arrays"],
    examples: [
      {
        input: "matrix = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]",
        output: "[[1, 0, 1], [0, 0, 0], [1, 0, 1]]",
        explanation: "The single zero blanks the middle row and the middle column.",
      },
      {
        input: "matrix = [[0, 1, 2], [3, 4, 5]]",
        output: "[[0, 0, 0], [0, 4, 5]]",
      },
    ],
    tests: [
      {
        args: [
          [
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 1],
          ],
        ],
        expected: [
          [1, 0, 1],
          [0, 0, 0],
          [1, 0, 1],
        ],
      },
      {
        args: [
          [
            [0, 1, 2],
            [3, 4, 5],
          ],
        ],
        expected: [
          [0, 0, 0],
          [0, 4, 5],
        ],
      },
      { args: [[[1]]], expected: [[1]] },
      { args: [[[0]]], expected: [[0]], hidden: true },
      {
        args: [
          [
            [1, 2],
            [3, 0],
          ],
        ],
        expected: [
          [1, 0],
          [0, 0],
        ],
        hidden: true,
      },
      {
        args: [
          [
            [1, 2, 3],
            [4, 5, 6],
          ],
        ],
        expected: [
          [1, 2, 3],
          [4, 5, 6],
        ],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const rows = matrix.length;
const cols = matrix[0].length;
const zeroRows = new Set();
const zeroCols = new Set();
for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < cols; c += 1) {
    if (matrix[r][c] === 0) {
      zeroRows.add(r);
      zeroCols.add(c);
    }
  }
}
const result = [];
for (let r = 0; r < rows; r += 1) {
  const row = [];
  for (let c = 0; c < cols; c += 1) {
    row.push(zeroRows.has(r) || zeroCols.has(c) ? 0 : matrix[r][c]);
  }
  result.push(row);
}
return result;`,
      TYPESCRIPT: `const rows = matrix.length;
const cols = matrix[0].length;
const zeroRows = new Set<number>();
const zeroCols = new Set<number>();
for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < cols; c += 1) {
    if (matrix[r][c] === 0) {
      zeroRows.add(r);
      zeroCols.add(c);
    }
  }
}
const result: number[][] = [];
for (let r = 0; r < rows; r += 1) {
  const row: number[] = [];
  for (let c = 0; c < cols; c += 1) {
    row.push(zeroRows.has(r) || zeroCols.has(c) ? 0 : matrix[r][c]);
  }
  result.push(row);
}
return result;`,
      PYTHON: `rows = len(matrix)
cols = len(matrix[0])
zero_rows = set()
zero_cols = set()
for r in range(rows):
    for c in range(cols):
        if matrix[r][c] == 0:
            zero_rows.add(r)
            zero_cols.add(c)
result = []
for r in range(rows):
    row = []
    for c in range(cols):
        row.append(0 if r in zero_rows or c in zero_cols else matrix[r][c])
    result.append(row)
return result`,
      JAVA: `int rows = matrix.length;
int cols = matrix[0].length;
boolean[] zeroRows = new boolean[rows];
boolean[] zeroCols = new boolean[cols];
for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < cols; c += 1) {
        if (matrix[r][c] == 0) {
            zeroRows[r] = true;
            zeroCols[c] = true;
        }
    }
}
int[][] result = new int[rows][cols];
for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < cols; c += 1) {
        result[r][c] = (zeroRows[r] || zeroCols[c]) ? 0 : matrix[r][c];
    }
}
return result;`,
      CPP: `int rows = (int)matrix.size();
int cols = (int)matrix[0].size();
vector<bool> zeroRows(rows, false);
vector<bool> zeroCols(cols, false);
for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < cols; c += 1) {
        if (matrix[r][c] == 0) {
            zeroRows[r] = true;
            zeroCols[c] = true;
        }
    }
}
vector<vector<int>> result(rows, vector<int>(cols, 0));
for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < cols; c += 1) {
        result[r][c] = (zeroRows[r] || zeroCols[c]) ? 0 : matrix[r][c];
    }
}
return result;`,
    },
  },

  // ── 14 ──────────────────────────────────────────────────────────────────
  {
    slug: "next-permutation",
    title: "Next Arrangement",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Rearrange the numbers into the next arrangement that is larger when the " +
      "list is read as a sequence — the very next one, with nothing in between. " +
      "If the list is already the largest possible arrangement, return the " +
      "smallest one instead, which is the list sorted ascending.",
    explanation:
      "Scan from the right for the first position whose value is smaller than " +
      "its neighbour — call it the pivot. Everything to its right is descending, " +
      "which means it is already the largest arrangement of those values and " +
      "cannot be nudged up any further. So swap the pivot with the smallest " +
      "value to its right that still beats it, then reverse the tail to make it " +
      "as small as possible. If no pivot exists the whole list was descending, " +
      "and reversing it produces the smallest arrangement. Three steps, one " +
      "pass each, no extra memory.",
    constraints: [
      "The list has between 1 and 1,000 numbers.",
      "Each number is between 0 and 1,000.",
      "Duplicate values are allowed.",
    ],
    hints: [
      "Find the rightmost position where the value rises going left to right.",
      "Swap it with the smallest value to its right that is still bigger than it.",
      "Then reverse everything after the pivot so the tail is as small as possible.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "nextArrangement",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-arrays", "data-structures"],
    examples: [
      { input: "numbers = [1, 2, 3]", output: "[1, 3, 2]" },
      {
        input: "numbers = [3, 2, 1]",
        output: "[1, 2, 3]",
        explanation: "Already the largest arrangement, so it wraps to the smallest.",
      },
    ],
    tests: [
      { args: [[1, 2, 3]], expected: [1, 3, 2] },
      { args: [[3, 2, 1]], expected: [1, 2, 3] },
      { args: [[1, 1, 5]], expected: [1, 5, 1] },
      { args: [[1, 3, 2]], expected: [2, 1, 3], hidden: true },
      { args: [[2, 3, 1]], expected: [3, 1, 2], hidden: true },
      { args: [[1]], expected: [1], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const result = numbers.slice();
let pivot = result.length - 2;
while (pivot >= 0 && result[pivot] >= result[pivot + 1]) pivot -= 1;
if (pivot >= 0) {
  let swapWith = result.length - 1;
  while (result[swapWith] <= result[pivot]) swapWith -= 1;
  const held = result[pivot];
  result[pivot] = result[swapWith];
  result[swapWith] = held;
}
let left = pivot + 1;
let right = result.length - 1;
while (left < right) {
  const held = result[left];
  result[left] = result[right];
  result[right] = held;
  left += 1;
  right -= 1;
}
return result;`,
      TYPESCRIPT: `const result: number[] = numbers.slice();
let pivot = result.length - 2;
while (pivot >= 0 && result[pivot] >= result[pivot + 1]) pivot -= 1;
if (pivot >= 0) {
  let swapWith = result.length - 1;
  while (result[swapWith] <= result[pivot]) swapWith -= 1;
  const held = result[pivot];
  result[pivot] = result[swapWith];
  result[swapWith] = held;
}
let left = pivot + 1;
let right = result.length - 1;
while (left < right) {
  const held = result[left];
  result[left] = result[right];
  result[right] = held;
  left += 1;
  right -= 1;
}
return result;`,
      PYTHON: `result = list(numbers)
pivot = len(result) - 2
while pivot >= 0 and result[pivot] >= result[pivot + 1]:
    pivot -= 1
if pivot >= 0:
    swap_with = len(result) - 1
    while result[swap_with] <= result[pivot]:
        swap_with -= 1
    result[pivot], result[swap_with] = result[swap_with], result[pivot]
left = pivot + 1
right = len(result) - 1
while left < right:
    result[left], result[right] = result[right], result[left]
    left += 1
    right -= 1
return result`,
      JAVA: `int[] result = Arrays.copyOf(numbers, numbers.length);
int pivot = result.length - 2;
while (pivot >= 0 && result[pivot] >= result[pivot + 1]) pivot -= 1;
if (pivot >= 0) {
    int swapWith = result.length - 1;
    while (result[swapWith] <= result[pivot]) swapWith -= 1;
    int held = result[pivot];
    result[pivot] = result[swapWith];
    result[swapWith] = held;
}
int left = pivot + 1;
int right = result.length - 1;
while (left < right) {
    int held = result[left];
    result[left] = result[right];
    result[right] = held;
    left += 1;
    right -= 1;
}
return result;`,
      CPP: `vector<int> result = numbers;
int pivot = (int)result.size() - 2;
while (pivot >= 0 && result[pivot] >= result[pivot + 1]) pivot -= 1;
if (pivot >= 0) {
    int swapWith = (int)result.size() - 1;
    while (result[swapWith] <= result[pivot]) swapWith -= 1;
    int held = result[pivot];
    result[pivot] = result[swapWith];
    result[swapWith] = held;
}
int left = pivot + 1;
int right = (int)result.size() - 1;
while (left < right) {
    int held = result[left];
    result[left] = result[right];
    result[right] = held;
    left += 1;
    right -= 1;
}
return result;`,
    },
  },
];
