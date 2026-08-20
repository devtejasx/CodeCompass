import type { SeedProblem } from "../../problems/types";

/**
 * Advanced dynamic programming.
 *
 * The last topic in the curriculum, and the one where the hard part is never
 * the recurrence. In every problem here the table is easy once the state is
 * right, and finding the state is the entire exercise — so each explanation
 * spends its first half on what a table entry means and only then says how it
 * is filled.
 *
 * Three state shapes that a position index cannot express:
 *
 *   A state machine, where the answer depends on what you are in the middle of
 *   doing — holding, resting, having traded twice. The state is a mode, not a
 *   place.
 *
 *   An interval, where an entry describes a stretch and depends on shorter
 *   stretches inside it, so the table is filled by increasing length rather
 *   than by row. Choosing what the interval means — often "everything inside
 *   here is already gone" — is the whole trick.
 *
 *   A bitmask, where an entry is indexed by a *set*. This is what makes a
 *   travelling-salesman-shaped problem 2^n · n² instead of n!, and it is the
 *   only place in this curriculum where an exponential answer is the good one.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const DP_ADVANCED_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "trade-with-a-cooldown",
    title: "Trade With a Cooldown",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Given daily prices, buy and sell any number of times to make the largest " +
      "profit, holding at most one unit at a time and never buying on the day " +
      "straight after a sale. Return that profit, which is 0 if no trade helps.",
    explanation:
      "A position index cannot express this, because two days with the same " +
      "price are not the same situation — one may be a cooldown day. The state " +
      "is a *mode*, and there are three: holding, resting because you just sold, " +
      "and free to buy. Each day, the best value in each mode follows from " +
      "yesterday's: holding is either still holding or bought today from free; " +
      "resting is holding minus today's price, that is, sold today; and free is " +
      "either still free or yesterday's resting having now elapsed. The answer " +
      "is the better of resting and free on the last day, since ending while " +
      "holding is never optimal. Recognising 'the answer depends on what I am in " +
      "the middle of' as a state-machine DP is the transferable part, and every " +
      "variant — a fee, a limit on trades — is the same three lines with a term " +
      "changed.",
    constraints: [
      "Between 0 and 5,000 daily prices.",
      "Each price is between 0 and 1,000.",
      "You may not buy on the day immediately after selling.",
    ],
    hints: [
      "The day number is not enough state — what matters is what you are doing.",
      "Three modes: holding, resting after a sale, and free to buy.",
      "Ending while still holding is never the best answer.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "tradeWithACooldown",
      params: [{ name: "prices", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-advanced", "dsa-dp-1d", "js-arrays"],
    examples: [
      {
        input: "prices = [1, 2, 3, 0, 2]",
        output: "3",
        explanation: "Buy at 1, sell at 2, cool down, buy at 0, sell at 2.",
      },
      { input: "prices = [1]", output: "0" },
    ],
    tests: [
      { args: [[1, 2, 3, 0, 2]], expected: 3 },
      { args: [[1]], expected: 0 },
      { args: [[]], expected: 0 },
      { args: [[5, 4, 3, 2, 1]], expected: 0, hidden: true },
      { args: [[1, 2]], expected: 1, hidden: true },
      { args: [[1, 2, 4]], expected: 3, hidden: true },
      { args: [[6, 1, 3, 2, 4, 7]], expected: 6, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let holding = -Infinity;
let resting = 0;
let free = 0;
for (const price of prices) {
  const heldBefore = holding;
  holding = Math.max(holding, free - price);
  free = Math.max(free, resting);
  resting = heldBefore + price;
}
return Math.max(resting, free, 0);`,
      TYPESCRIPT: `let holding = -Infinity;
let resting = 0;
let free = 0;
for (const price of prices) {
  const heldBefore = holding;
  holding = Math.max(holding, free - price);
  free = Math.max(free, resting);
  resting = heldBefore + price;
}
return Math.max(resting, free, 0);`,
      PYTHON: `holding = float("-inf")
resting = 0
free = 0
for price in prices:
    held_before = holding
    holding = max(holding, free - price)
    free = max(free, resting)
    resting = held_before + price
return int(max(resting, free, 0))`,
      JAVA: `long holding = Long.MIN_VALUE / 4;
long resting = 0;
long free = 0;
for (int price : prices) {
    long heldBefore = holding;
    holding = Math.max(holding, free - price);
    free = Math.max(free, resting);
    resting = heldBefore + price;
}
return (int) Math.max(Math.max(resting, free), 0);`,
      CPP: `long long holding = LLONG_MIN / 4;
long long resting = 0;
long long free = 0;
for (int price : prices) {
    long long heldBefore = holding;
    holding = max(holding, free - price);
    free = max(free, resting);
    resting = heldBefore + price;
}
return (int)max(max(resting, free), 0LL);`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "trade-at-most-twice",
    title: "Trade at Most Twice",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Given daily prices, make the largest profit using at most two complete " +
      "buy-and-sell rounds, never holding more than one unit at a time. Return " +
      "that profit, which is 0 if no trade helps.",
    explanation:
      "Same idea as the cooldown problem with a different mode set. Any trading " +
      "history collapses into one of four states: bought once, sold once, bought " +
      "twice, sold twice. Track the best value achievable in each, and each day " +
      "update them in order — the first buy spends today's price, the first sale " +
      "adds it back, the second buy spends it again out of the first sale's " +
      "proceeds, and the second sale adds it once more. The answer is the best " +
      "after two sales, which is never worse than after one because a second " +
      "round may always be skipped. The general form, for at most k rounds, is " +
      "the same recurrence in a loop over k, which is worth mentioning as the " +
      "follow-up: this problem is that one with k pinned to two and the loop " +
      "unrolled into four named variables.",
    constraints: [
      "Between 0 and 100,000 daily prices.",
      "Each price is between 0 and 100,000.",
      "The second buy must come after the first sale.",
    ],
    hints: [
      "Every history reduces to one of four states, not to a day number.",
      "Update them in order within each day: buy, sell, buy again, sell again.",
      "Doing fewer rounds is always allowed, so two is never worse than one.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "tradeAtMostTwice",
      params: [{ name: "prices", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-advanced", "dsa-dp-1d", "js-arrays"],
    examples: [
      {
        input: "prices = [3, 3, 5, 0, 0, 3, 1, 4]",
        output: "6",
        explanation: "Buy at 0 and sell at 3, then buy at 1 and sell at 4.",
      },
      {
        input: "prices = [7, 6, 4, 3, 1]",
        output: "0",
        explanation: "The price only falls.",
      },
    ],
    tests: [
      { args: [[3, 3, 5, 0, 0, 3, 1, 4]], expected: 6 },
      { args: [[7, 6, 4, 3, 1]], expected: 0 },
      { args: [[1, 2, 3, 4, 5]], expected: 4 },
      { args: [[]], expected: 0, hidden: true },
      { args: [[5]], expected: 0, hidden: true },
      { args: [[1, 2, 3, 0, 2]], expected: 4, hidden: true },
      { args: [[6, 1, 3, 2, 4, 7]], expected: 7, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let boughtOnce = -Infinity;
let soldOnce = 0;
let boughtTwice = -Infinity;
let soldTwice = 0;
for (const price of prices) {
  boughtOnce = Math.max(boughtOnce, -price);
  soldOnce = Math.max(soldOnce, boughtOnce + price);
  boughtTwice = Math.max(boughtTwice, soldOnce - price);
  soldTwice = Math.max(soldTwice, boughtTwice + price);
}
return soldTwice;`,
      TYPESCRIPT: `let boughtOnce = -Infinity;
let soldOnce = 0;
let boughtTwice = -Infinity;
let soldTwice = 0;
for (const price of prices) {
  boughtOnce = Math.max(boughtOnce, -price);
  soldOnce = Math.max(soldOnce, boughtOnce + price);
  boughtTwice = Math.max(boughtTwice, soldOnce - price);
  soldTwice = Math.max(soldTwice, boughtTwice + price);
}
return soldTwice;`,
      PYTHON: `bought_once = float("-inf")
sold_once = 0
bought_twice = float("-inf")
sold_twice = 0
for price in prices:
    bought_once = max(bought_once, -price)
    sold_once = max(sold_once, bought_once + price)
    bought_twice = max(bought_twice, sold_once - price)
    sold_twice = max(sold_twice, bought_twice + price)
return int(sold_twice)`,
      JAVA: `long boughtOnce = Long.MIN_VALUE / 4;
long soldOnce = 0;
long boughtTwice = Long.MIN_VALUE / 4;
long soldTwice = 0;
for (int price : prices) {
    boughtOnce = Math.max(boughtOnce, -price);
    soldOnce = Math.max(soldOnce, boughtOnce + price);
    boughtTwice = Math.max(boughtTwice, soldOnce - price);
    soldTwice = Math.max(soldTwice, boughtTwice + price);
}
return (int) soldTwice;`,
      CPP: `long long boughtOnce = LLONG_MIN / 4;
long long soldOnce = 0;
long long boughtTwice = LLONG_MIN / 4;
long long soldTwice = 0;
for (int price : prices) {
    boughtOnce = max(boughtOnce, (long long)-price);
    soldOnce = max(soldOnce, boughtOnce + price);
    boughtTwice = max(boughtTwice, soldOnce - price);
    soldTwice = max(soldTwice, boughtTwice + price);
}
return (int)soldTwice;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "longest-evenly-spaced-run",
    title: "The Longest Evenly Spaced Run",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Return the length of the longest subsequence — values in order, not " +
      "necessarily adjacent — in which consecutive values differ by the same " +
      "amount throughout. Any two values form such a run.",
    explanation:
      "The state has to carry the gap, because a run ending at index i is not " +
      "one thing: index i may end a run stepping by 3 and a different run " +
      "stepping by -1, and they are unrelated. So the table is indexed by " +
      "(position, gap), which cannot be a fixed-size array — the gaps come from " +
      "the data — so it is a map per position. For each pair j < i, the gap is " +
      "values[i] - values[j], and the run ending at i with that gap is one " +
      "longer than the run ending at j with the same gap, defaulting to 2 when " +
      "there is none. That is O(n²) entries and O(n²) time. Indexing a DP table " +
      "by a value drawn from the input rather than by a position is the idea " +
      "worth taking away, and a hash map is what makes it practical.",
    constraints: [
      "The list holds between 0 and 1,000 values.",
      "Values are between -1,000,000 and 1,000,000.",
      "Any one or two values already form an evenly spaced run.",
    ],
    hints: [
      "A run ending at index i is not a single thing — it depends on the gap.",
      "So index the table by position *and* gap, which means a map per position.",
      "Two values always form a run, so entries start at 2.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "longestEvenlySpacedRun",
      params: [{ name: "values", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-advanced", "dsa-hashing", "dsa-dp-1d"],
    examples: [
      {
        input: "values = [3, 6, 9, 12]",
        output: "4",
        explanation: "Every step is 3.",
      },
      {
        input: "values = [9, 4, 7, 2, 10]",
        output: "3",
        explanation: "4, 7, 10 steps by 3.",
      },
    ],
    tests: [
      { args: [[3, 6, 9, 12]], expected: 4 },
      { args: [[9, 4, 7, 2, 10]], expected: 3 },
      { args: [[]], expected: 0 },
      { args: [[5]], expected: 1, hidden: true },
      { args: [[1, 2]], expected: 2, hidden: true },
      { args: [[20, 1, 15, 3, 10, 5, 8]], expected: 4, hidden: true },
      { args: [[7, 7, 7, 7]], expected: 4, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `if (values.length === 0) return 0;
const runs = values.map(() => new Map());
let best = 1;
for (let i = 0; i < values.length; i += 1) {
  for (let j = 0; j < i; j += 1) {
    const gap = values[i] - values[j];
    const extended = (runs[j].get(gap) ?? 1) + 1;
    if (extended > (runs[i].get(gap) ?? 0)) runs[i].set(gap, extended);
    if (extended > best) best = extended;
  }
}
return best;`,
      TYPESCRIPT: `if (values.length === 0) return 0;
const runs: Map<number, number>[] = values.map(() => new Map<number, number>());
let best = 1;
for (let i = 0; i < values.length; i += 1) {
  for (let j = 0; j < i; j += 1) {
    const gap = values[i] - values[j];
    const extended = (runs[j].get(gap) ?? 1) + 1;
    if (extended > (runs[i].get(gap) ?? 0)) runs[i].set(gap, extended);
    if (extended > best) best = extended;
  }
}
return best;`,
      PYTHON: `if not values:
    return 0
runs = [dict() for _ in values]
best = 1
for i in range(len(values)):
    for j in range(i):
        gap = values[i] - values[j]
        extended = runs[j].get(gap, 1) + 1
        if extended > runs[i].get(gap, 0):
            runs[i][gap] = extended
        best = max(best, extended)
return best`,
      JAVA: `if (values.length == 0) return 0;
List<Map<Integer, Integer>> runs = new ArrayList<>();
for (int i = 0; i < values.length; i += 1) runs.add(new HashMap<>());

int best = 1;
for (int i = 0; i < values.length; i += 1) {
    for (int j = 0; j < i; j += 1) {
        int gap = values[i] - values[j];
        int extended = runs.get(j).getOrDefault(gap, 1) + 1;
        if (extended > runs.get(i).getOrDefault(gap, 0)) runs.get(i).put(gap, extended);
        best = Math.max(best, extended);
    }
}
return best;`,
      CPP: `if (values.empty()) return 0;
vector<unordered_map<int, int>> runs(values.size());
int best = 1;
for (int i = 0; i < (int)values.size(); i += 1) {
    for (int j = 0; j < i; j += 1) {
        int gap = values[i] - values[j];
        auto found = runs[j].find(gap);
        int extended = (found == runs[j].end() ? 1 : found->second) + 1;
        auto here = runs[i].find(gap);
        if (here == runs[i].end() || extended > here->second) runs[i][gap] = extended;
        best = max(best, extended);
    }
}
return best;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "burst-all-the-balloons",
    title: "Burst All the Balloons",
    difficulty: "HARD",
    interviewFrequency: "HIGH",
    description:
      "Each balloon holds a number. Bursting one earns its number multiplied by " +
      "the numbers of the balloons currently on either side of it, treating a " +
      "missing neighbour as 1; the burst balloon then disappears and its " +
      "neighbours become adjacent. Return the most that can be earned by " +
      "bursting all of them.",
    explanation:
      "The obvious state — which balloon to burst first — fails, because after " +
      "the first burst the remaining balloons are no longer a contiguous stretch " +
      "and the subproblem is not the same shape as the original. Reversing the " +
      "question fixes it: ask which balloon in a stretch is burst *last*. That " +
      "one still has the two balloons just outside the stretch as its " +
      "neighbours, whatever happened inside, so its score is known — and the two " +
      "sides of it become independent stretches that never interact. So define " +
      "best[i][j] as the most earnable from the balloons strictly between i and " +
      "j, try every k inside as the last burst, and take the best of " +
      "best[i][k] + values[i]·values[k]·values[j] + best[k][j]. Pad the list " +
      "with 1s at both ends so the missing neighbours need no special case, and " +
      "fill by increasing stretch length. Choosing 'last' rather than 'first' is " +
      "the entire problem.",
    constraints: [
      "Between 0 and 300 balloons.",
      "Each number is between 0 and 100.",
      "A missing neighbour counts as 1.",
    ],
    hints: [
      "Deciding what to burst first leaves a subproblem that is not the same shape.",
      "Ask instead which balloon in a stretch is burst last.",
      "Pad both ends with 1 and fill the table by increasing stretch length.",
    ],
    estimatedTime: "50 min",
    timeLimitMs: 5000,
    signature: {
      name: "burstAllTheBalloons",
      params: [{ name: "values", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-advanced", "dsa-dp-2d", "js-arrays"],
    examples: [
      {
        input: "values = [3, 1, 5, 8]",
        output: "167",
        explanation: "Burst the 1, then the 5, then the 3, then the 8.",
      },
      {
        input: "values = [1, 5]",
        output: "10",
        explanation: "Burst the 1 for 5, then the 5 for 5.",
      },
    ],
    tests: [
      { args: [[3, 1, 5, 8]], expected: 167 },
      { args: [[1, 5]], expected: 10 },
      { args: [[7]], expected: 7 },
      { args: [[]], expected: 0, hidden: true },
      { args: [[0, 0]], expected: 0, hidden: true },
      { args: [[2, 3]], expected: 9, hidden: true },
      { args: [[1, 2, 3]], expected: 12, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const padded = [1, ...values, 1];
const n = padded.length;
const best = Array.from({ length: n }, () => new Array(n).fill(0));

for (let span = 2; span < n; span += 1) {
  for (let i = 0; i + span < n; i += 1) {
    const j = i + span;
    for (let k = i + 1; k < j; k += 1) {
      const score = best[i][k] + padded[i] * padded[k] * padded[j] + best[k][j];
      if (score > best[i][j]) best[i][j] = score;
    }
  }
}
return best[0][n - 1];`,
      TYPESCRIPT: `const padded = [1, ...values, 1];
const n = padded.length;
const best: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

for (let span = 2; span < n; span += 1) {
  for (let i = 0; i + span < n; i += 1) {
    const j = i + span;
    for (let k = i + 1; k < j; k += 1) {
      const score = best[i][k] + padded[i] * padded[k] * padded[j] + best[k][j];
      if (score > best[i][j]) best[i][j] = score;
    }
  }
}
return best[0][n - 1];`,
      PYTHON: `padded = [1] + list(values) + [1]
n = len(padded)
best = [[0] * n for _ in range(n)]

for span in range(2, n):
    for i in range(0, n - span):
        j = i + span
        for k in range(i + 1, j):
            score = best[i][k] + padded[i] * padded[k] * padded[j] + best[k][j]
            if score > best[i][j]:
                best[i][j] = score
return best[0][n - 1]`,
      JAVA: `int[] padded = new int[values.length + 2];
padded[0] = 1;
padded[padded.length - 1] = 1;
for (int i = 0; i < values.length; i += 1) padded[i + 1] = values[i];

int n = padded.length;
int[][] best = new int[n][n];
for (int span = 2; span < n; span += 1) {
    for (int i = 0; i + span < n; i += 1) {
        int j = i + span;
        for (int k = i + 1; k < j; k += 1) {
            int score = best[i][k] + padded[i] * padded[k] * padded[j] + best[k][j];
            if (score > best[i][j]) best[i][j] = score;
        }
    }
}
return best[0][n - 1];`,
      CPP: `vector<int> padded;
padded.push_back(1);
for (int value : values) padded.push_back(value);
padded.push_back(1);

int n = (int)padded.size();
vector<vector<int>> best(n, vector<int>(n, 0));
for (int span = 2; span < n; span += 1) {
    for (int i = 0; i + span < n; i += 1) {
        int j = i + span;
        for (int k = i + 1; k < j; k += 1) {
            int score = best[i][k] + padded[i] * padded[k] * padded[j] + best[k][j];
            if (score > best[i][j]) best[i][j] = score;
        }
    }
}
return best[0][n - 1];`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "shortest-tour-of-every-city",
    title: "The Shortest Tour of Every City",
    difficulty: "HARD",
    interviewFrequency: "MEDIUM",
    description:
      "There are n cities and the grid gives the distance from each to each " +
      "other. Starting at city 0, visit every city exactly once and return the " +
      "shortest total distance travelled. There is no need to return to the " +
      "start.",
    explanation:
      "Trying every order is n! and hopeless past about ten cities. The saving " +
      "comes from noticing that two different orders visiting the same *set* of " +
      "cities and finishing at the same city are interchangeable — whatever " +
      "happens next depends only on those two facts, not on how the set was " +
      "assembled. So the state is (set of visited cities, current city), and a " +
      "set of up to twenty cities is an integer whose bits say which are " +
      "visited. That collapses n! orders into 2^n · n states, each extended in " +
      "O(n), for 2^n · n² overall — still exponential, but the difference " +
      "between 20 cities being impossible and being routine. Reading a subset " +
      "as an integer is the whole technique, and it is worth practising the two " +
      "operations it needs: testing bit i with mask & (1 << i), and adding it " +
      "with mask | (1 << i).",
    constraints: [
      "Between 1 and 12 cities, given as an n by n distance grid.",
      "Distances are between 0 and 10,000 and need not be symmetric.",
      "Start at city 0, visit every city once, and do not return to the start.",
    ],
    hints: [
      "Two orders covering the same cities and ending in the same place behave identically.",
      "So the state is which cities are visited plus where you are — and a set is an integer.",
      "Test membership with mask & (1 << i) and add with mask | (1 << i).",
    ],
    estimatedTime: "50 min",
    timeLimitMs: 5000,
    signature: {
      name: "shortestTourOfEveryCity",
      params: [{ name: "distances", type: "int[][]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-advanced", "dsa-bit-manipulation", "dsa-shortest-path"],
    examples: [
      {
        input: "distances = [[0, 1, 15], [2, 0, 7], [9, 6, 0]]",
        output: "8",
        explanation: "0 → 1 → 2 costs 1 + 7.",
      },
      {
        input: "distances = [[0]]",
        output: "0",
        explanation: "One city needs no travel.",
      },
    ],
    tests: [
      {
        args: [
          [
            [0, 1, 15],
            [2, 0, 7],
            [9, 6, 0],
          ],
        ],
        expected: 8,
      },
      { args: [[[0]]], expected: 0 },
      {
        args: [
          [
            [0, 5],
            [5, 0],
          ],
        ],
        expected: 5,
      },
      {
        args: [
          [
            [0, 10, 15, 20],
            [10, 0, 35, 25],
            [15, 35, 0, 30],
            [20, 25, 30, 0],
          ],
        ],
        // 55 is the classic *closed* tour; this problem does not return to
        // the start, so 0 -> 1 -> 3 -> 2 at 65 is the answer.
        expected: 65,
        hidden: true,
      },
      {
        args: [
          [
            [0, 1, 1],
            [1, 0, 1],
            [1, 1, 0],
          ],
        ],
        expected: 2,
        hidden: true,
      },
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
    ],
    solutions: {
      JAVASCRIPT: `const n = distances.length;
if (n === 1) return 0;
const FULL = 1 << n;
const IMPOSSIBLE = Infinity;
const best = Array.from({ length: FULL }, () => new Array(n).fill(IMPOSSIBLE));
best[1][0] = 0;

for (let visited = 1; visited < FULL; visited += 1) {
  for (let at = 0; at < n; at += 1) {
    if (best[visited][at] === IMPOSSIBLE) continue;
    if ((visited & (1 << at)) === 0) continue;
    for (let next = 0; next < n; next += 1) {
      if (visited & (1 << next)) continue;
      const after = visited | (1 << next);
      const candidate = best[visited][at] + distances[at][next];
      if (candidate < best[after][next]) best[after][next] = candidate;
    }
  }
}

let shortest = IMPOSSIBLE;
for (let at = 0; at < n; at += 1) {
  if (best[FULL - 1][at] < shortest) shortest = best[FULL - 1][at];
}
return shortest;`,
      TYPESCRIPT: `const n = distances.length;
if (n === 1) return 0;
const FULL = 1 << n;
const IMPOSSIBLE = Infinity;
const best: number[][] = Array.from({ length: FULL }, () =>
  new Array(n).fill(IMPOSSIBLE),
);
best[1][0] = 0;

for (let visited = 1; visited < FULL; visited += 1) {
  for (let at = 0; at < n; at += 1) {
    if (best[visited][at] === IMPOSSIBLE) continue;
    if ((visited & (1 << at)) === 0) continue;
    for (let next = 0; next < n; next += 1) {
      if (visited & (1 << next)) continue;
      const after = visited | (1 << next);
      const candidate = best[visited][at] + distances[at][next];
      if (candidate < best[after][next]) best[after][next] = candidate;
    }
  }
}

let shortest = IMPOSSIBLE;
for (let at = 0; at < n; at += 1) {
  if (best[FULL - 1][at] < shortest) shortest = best[FULL - 1][at];
}
return shortest;`,
      PYTHON: `n = len(distances)
if n == 1:
    return 0
full = 1 << n
impossible = float("inf")
best = [[impossible] * n for _ in range(full)]
best[1][0] = 0

for visited in range(1, full):
    for at in range(n):
        if best[visited][at] == impossible:
            continue
        if not (visited & (1 << at)):
            continue
        for following in range(n):
            if visited & (1 << following):
                continue
            after = visited | (1 << following)
            candidate = best[visited][at] + distances[at][following]
            if candidate < best[after][following]:
                best[after][following] = candidate

return int(min(best[full - 1]))`,
      JAVA: `int n = distances.length;
if (n == 1) return 0;
int full = 1 << n;
final int IMPOSSIBLE = Integer.MAX_VALUE / 4;
int[][] best = new int[full][n];
for (int[] row : best) Arrays.fill(row, IMPOSSIBLE);
best[1][0] = 0;

for (int visited = 1; visited < full; visited += 1) {
    for (int at = 0; at < n; at += 1) {
        if (best[visited][at] == IMPOSSIBLE) continue;
        if ((visited & (1 << at)) == 0) continue;
        for (int next = 0; next < n; next += 1) {
            if ((visited & (1 << next)) != 0) continue;
            int after = visited | (1 << next);
            int candidate = best[visited][at] + distances[at][next];
            if (candidate < best[after][next]) best[after][next] = candidate;
        }
    }
}

int shortest = IMPOSSIBLE;
for (int at = 0; at < n; at += 1) shortest = Math.min(shortest, best[full - 1][at]);
return shortest;`,
      CPP: `int n = (int)distances.size();
if (n == 1) return 0;
int full = 1 << n;
const int IMPOSSIBLE = INT_MAX / 4;
vector<vector<int>> best(full, vector<int>(n, IMPOSSIBLE));
best[1][0] = 0;

for (int visited = 1; visited < full; visited += 1) {
    for (int at = 0; at < n; at += 1) {
        if (best[visited][at] == IMPOSSIBLE) continue;
        if ((visited & (1 << at)) == 0) continue;
        for (int following = 0; following < n; following += 1) {
            if (visited & (1 << following)) continue;
            int after = visited | (1 << following);
            int candidate = best[visited][at] + distances[at][following];
            if (candidate < best[after][following]) best[after][following] = candidate;
        }
    }
}

int shortest = IMPOSSIBLE;
for (int at = 0; at < n; at += 1) shortest = min(shortest, best[full - 1][at]);
return shortest;`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "count-the-distinct-subsequences",
    title: "Count the Distinct Subsequences",
    difficulty: "HARD",
    interviewFrequency: "MEDIUM",
    description:
      "Count the ways the second text appears as a subsequence of the first — " +
      "characters taken in order but not necessarily adjacent. Two ways differing " +
      "in any chosen position count separately. Return the count modulo " +
      "1,000,000,007.",
    explanation:
      "State: ways[i][j] is the number of ways the first j characters of the " +
      "target appear inside the first i of the source. Look at source character " +
      "i. Whatever it is, every way that ignores it still counts, contributing " +
      "ways[i-1][j]. If it happens to equal target character j, it may also be " +
      "*used* for that position, contributing ways[i-1][j-1] on top. So matching " +
      "characters add two terms and mismatching ones add one — note this is not " +
      "the usual 'take the better of two' but a sum, because the question counts " +
      "rather than optimises, and mixing those up is the standard error here. " +
      "The empty target has exactly one occurrence in any source, which seeds " +
      "the first column with 1s. Rolling the table down to one row works, " +
      "provided the sweep runs backwards so ways[i-1][j-1] is not overwritten " +
      "before it is read.",
    constraints: [
      "The source holds between 0 and 1,000 lowercase letters.",
      "The target holds between 0 and 200 lowercase letters.",
      "Return the count modulo 1,000,000,007.",
    ],
    hints: [
      "Entry [i][j] counts occurrences of the first j of the target in the first i of the source.",
      "The current source character may be ignored, and if it matches, also used.",
      "Those two options are added, not maximised — this is a counting problem.",
    ],
    estimatedTime: "45 min",
    signature: {
      name: "countTheDistinctSubsequences",
      params: [
        { name: "source", type: "string" },
        { name: "target", type: "string" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-advanced", "dsa-dp-2d", "dsa-strings"],
    examples: [
      {
        input: 'source = "rabbbit", target = "rabbit"',
        output: "3",
        explanation: "Any one of the three b-runs can supply the two needed bs.",
      },
      {
        input: 'source = "abc", target = ""',
        output: "1",
        explanation: "The empty target occurs once, by taking nothing.",
      },
    ],
    tests: [
      { args: ["rabbbit", "rabbit"], expected: 3 },
      { args: ["abc", ""], expected: 1 },
      { args: ["", "a"], expected: 0 },
      { args: ["babgbag", "bag"], expected: 5, hidden: true },
      { args: ["aaa", "a"], expected: 3, hidden: true },
      { args: ["abc", "abc"], expected: 1, hidden: true },
      { args: ["abc", "cba"], expected: 0, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const MOD = 1000000007;
const n = target.length;
const ways = new Array(n + 1).fill(0);
ways[0] = 1;

for (const letter of source) {
  for (let j = n; j >= 1; j -= 1) {
    if (target[j - 1] === letter) ways[j] = (ways[j] + ways[j - 1]) % MOD;
  }
}
return ways[n];`,
      TYPESCRIPT: `const MOD = 1000000007;
const n = target.length;
const ways: number[] = new Array(n + 1).fill(0);
ways[0] = 1;

for (const letter of source) {
  for (let j = n; j >= 1; j -= 1) {
    if (target[j - 1] === letter) ways[j] = (ways[j] + ways[j - 1]) % MOD;
  }
}
return ways[n];`,
      PYTHON: `MOD = 1000000007
n = len(target)
ways = [0] * (n + 1)
ways[0] = 1

for letter in source:
    for j in range(n, 0, -1):
        if target[j - 1] == letter:
            ways[j] = (ways[j] + ways[j - 1]) % MOD
return ways[n]`,
      JAVA: `final long MOD = 1000000007L;
int n = target.length();
long[] ways = new long[n + 1];
ways[0] = 1;

for (int i = 0; i < source.length(); i += 1) {
    char letter = source.charAt(i);
    for (int j = n; j >= 1; j -= 1) {
        if (target.charAt(j - 1) == letter) ways[j] = (ways[j] + ways[j - 1]) % MOD;
    }
}
return (int) ways[n];`,
      CPP: `const long long MOD = 1000000007LL;
int n = (int)target.size();
vector<long long> ways(n + 1, 0);
ways[0] = 1;

for (char letter : source) {
    for (int j = n; j >= 1; j -= 1) {
        if (target[j - 1] == letter) ways[j] = (ways[j] + ways[j - 1]) % MOD;
    }
}
return (int)ways[n];`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "split-into-groups-fairly",
    title: "Split Into Groups Fairly",
    difficulty: "HARD",
    interviewFrequency: "HIGH",
    description:
      "Cut the list into exactly the given number of contiguous non-empty " +
      "groups, so that the largest group total is as small as possible. Return " +
      "that largest total.",
    explanation:
      "There is a DP — best[i][g] as the answer for the first i values in g " +
      "groups, minimised over where the last group starts — and it is O(n²k), " +
      "which is worth writing once. The better answer inverts the problem. " +
      "Instead of computing the smallest possible largest total, *guess* it and " +
      "ask whether it is achievable: sweep the list greedily, starting a new " +
      "group whenever adding the next value would exceed the guess, and count " +
      "the groups needed. That count is non-increasing as the guess rises, so " +
      "the guesses that work form an unbroken upper range and binary search " +
      "finds the boundary. The range runs from the largest single value — no " +
      "group can be smaller than its biggest member — to the total. That gives " +
      "O(n log(total)). Binary searching an answer whose feasibility is " +
      "monotonic is the technique, and it is the same one the eating-speed and " +
      "shipping-capacity problems introduced in the binary-search topic.",
    constraints: [
      "The list holds between 1 and 1,000 non-negative values.",
      "Each value is between 0 and 1,000,000, and the group count is between 1 and the length.",
      "Groups must be contiguous and non-empty.",
    ],
    hints: [
      "Do not compute the answer — guess it and test whether that guess is achievable.",
      "Testing a guess is one greedy sweep counting how many groups it needs.",
      "The guess range runs from the largest single value up to the total.",
    ],
    estimatedTime: "45 min",
    signature: {
      name: "splitIntoGroupsFairly",
      params: [
        { name: "values", type: "int[]" },
        { name: "groups", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-advanced", "dsa-binary-search", "dsa-greedy"],
    examples: [
      {
        input: "values = [7, 2, 5, 10, 8], groups = 2",
        output: "18",
        explanation: "[7,2,5] and [10,8] give 14 and 18.",
      },
      {
        input: "values = [1, 2, 3, 4, 5], groups = 2",
        output: "9",
        explanation: "[1,2,3,4] and [5] would give 10; [1,2,3] and [4,5] gives 9.",
      },
    ],
    tests: [
      { args: [[7, 2, 5, 10, 8], 2], expected: 18 },
      { args: [[1, 2, 3, 4, 5], 2], expected: 9 },
      { args: [[1, 4, 4], 3], expected: 4 },
      { args: [[5], 1], expected: 5, hidden: true },
      { args: [[1, 1, 1, 1], 4], expected: 1, hidden: true },
      { args: [[1, 1, 1, 1], 1], expected: 4, hidden: true },
      { args: [[0, 0, 0], 2], expected: 0, hidden: true },
      { args: [[2, 3, 1, 2, 4, 3], 5], expected: 4, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let low = 0;
let high = 0;
for (const value of values) {
  if (value > low) low = value;
  high += value;
}

function groupsNeeded(limit) {
  let count = 1;
  let running = 0;
  for (const value of values) {
    if (running + value > limit) {
      count += 1;
      running = value;
    } else {
      running += value;
    }
  }
  return count;
}

while (low < high) {
  const middle = Math.floor((low + high) / 2);
  if (groupsNeeded(middle) <= groups) high = middle;
  else low = middle + 1;
}
return low;`,
      TYPESCRIPT: `let low = 0;
let high = 0;
for (const value of values) {
  if (value > low) low = value;
  high += value;
}

function groupsNeeded(limit: number): number {
  let count = 1;
  let running = 0;
  for (const value of values) {
    if (running + value > limit) {
      count += 1;
      running = value;
    } else {
      running += value;
    }
  }
  return count;
}

while (low < high) {
  const middle = Math.floor((low + high) / 2);
  if (groupsNeeded(middle) <= groups) high = middle;
  else low = middle + 1;
}
return low;`,
      PYTHON: `low = max(values)
high = sum(values)

def groups_needed(limit):
    count = 1
    running = 0
    for value in values:
        if running + value > limit:
            count += 1
            running = value
        else:
            running += value
    return count

while low < high:
    middle = (low + high) // 2
    if groups_needed(middle) <= groups:
        high = middle
    else:
        low = middle + 1
return low`,
      JAVA: `long low = 0;
long high = 0;
for (int value : values) {
    low = Math.max(low, value);
    high += value;
}

class Check {
    int groupsNeeded(long limit) {
        int count = 1;
        long running = 0;
        for (int value : values) {
            if (running + value > limit) {
                count += 1;
                running = value;
            } else {
                running += value;
            }
        }
        return count;
    }
}

Check check = new Check();
while (low < high) {
    long middle = (low + high) / 2;
    if (check.groupsNeeded(middle) <= groups) high = middle;
    else low = middle + 1;
}
return (int) low;`,
      CPP: `long long low = 0;
long long high = 0;
for (int value : values) {
    low = max(low, (long long)value);
    high += value;
}

auto groupsNeeded = [&](long long limit) {
    int count = 1;
    long long running = 0;
    for (int value : values) {
        if (running + value > limit) {
            count += 1;
            running = value;
        } else {
            running += value;
        }
    }
    return count;
};

while (low < high) {
    long long middle = (low + high) / 2;
    if (groupsNeeded(middle) <= groups) high = middle;
    else low = middle + 1;
}
return (int)low;`,
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "take-from-either-end",
    title: "Take From Either End",
    difficulty: "HARD",
    interviewFrequency: "HIGH",
    description:
      "Two players take turns removing the value at either end of the list, " +
      "keeping it. Both play to maximise their own total. You go first. Return " +
      "your total minus your opponent's, assuming both play perfectly.",
    explanation:
      "Two things make this awkward at first and both are dissolved by choosing " +
      "the right quantity. Tracking whose turn it is doubles the state, and " +
      "tracking two totals means the table holds a pair. Both disappear if each " +
      "entry holds the *difference* the player about to move can force from that " +
      "stretch, because the game is symmetric: whatever the opponent can force " +
      "from the remaining stretch is the same function, subtracted. So " +
      "best[i][j] = max(values[i] - best[i+1][j], values[j] - best[i][j-1]), " +
      "with a single value forcing itself. No turn flag, no pair, and the answer " +
      "is best over the whole list. Choosing a state that folds the symmetry in " +
      "rather than modelling it explicitly is the technique, and it applies to " +
      "most two-player perfect-information questions. The stretch state means " +
      "filling by increasing length, as in the balloon problem.",
    constraints: [
      "The list holds between 1 and 1,000 values.",
      "Each value is between 0 and 10,000.",
      "Both players play perfectly, and only the two ends may be taken.",
    ],
    hints: [
      "Do not track two totals — track the difference the mover can force.",
      "The opponent then faces the same function on the remaining stretch.",
      "That removes the turn flag entirely.",
    ],
    estimatedTime: "45 min",
    signature: {
      name: "takeFromEitherEnd",
      params: [{ name: "values", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-advanced", "dsa-dp-2d", "js-arrays"],
    examples: [
      {
        input: "values = [1, 5, 2]",
        output: "-2",
        explanation: "Whatever you take, the opponent can secure the 5.",
      },
      {
        input: "values = [1, 5, 233, 7]",
        output: "222",
      },
    ],
    tests: [
      { args: [[1, 5, 2]], expected: -2 },
      { args: [[1, 5, 233, 7]], expected: 222 },
      { args: [[7]], expected: 7 },
      { args: [[1, 1]], expected: 0, hidden: true },
      { args: [[2, 1]], expected: 1, hidden: true },
      { args: [[1, 2, 3, 4]], expected: 2, hidden: true },
      { args: [[0, 0, 0]], expected: 0, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const n = values.length;
const best = Array.from({ length: n }, () => new Array(n).fill(0));
for (let i = 0; i < n; i += 1) best[i][i] = values[i];

for (let span = 2; span <= n; span += 1) {
  for (let i = 0; i + span - 1 < n; i += 1) {
    const j = i + span - 1;
    best[i][j] = Math.max(values[i] - best[i + 1][j], values[j] - best[i][j - 1]);
  }
}
return best[0][n - 1];`,
      TYPESCRIPT: `const n = values.length;
const best: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
for (let i = 0; i < n; i += 1) best[i][i] = values[i];

for (let span = 2; span <= n; span += 1) {
  for (let i = 0; i + span - 1 < n; i += 1) {
    const j = i + span - 1;
    best[i][j] = Math.max(values[i] - best[i + 1][j], values[j] - best[i][j - 1]);
  }
}
return best[0][n - 1];`,
      PYTHON: `n = len(values)
best = [[0] * n for _ in range(n)]
for i in range(n):
    best[i][i] = values[i]

for span in range(2, n + 1):
    for i in range(0, n - span + 1):
        j = i + span - 1
        best[i][j] = max(values[i] - best[i + 1][j], values[j] - best[i][j - 1])
return best[0][n - 1]`,
      JAVA: `int n = values.length;
int[][] best = new int[n][n];
for (int i = 0; i < n; i += 1) best[i][i] = values[i];

for (int span = 2; span <= n; span += 1) {
    for (int i = 0; i + span - 1 < n; i += 1) {
        int j = i + span - 1;
        best[i][j] = Math.max(values[i] - best[i + 1][j], values[j] - best[i][j - 1]);
    }
}
return best[0][n - 1];`,
      CPP: `int n = (int)values.size();
vector<vector<int>> best(n, vector<int>(n, 0));
for (int i = 0; i < n; i += 1) best[i][i] = values[i];

for (int span = 2; span <= n; span += 1) {
    for (int i = 0; i + span - 1 < n; i += 1) {
        int j = i + span - 1;
        best[i][j] = max(values[i] - best[i + 1][j], values[j] - best[i][j - 1]);
    }
}
return best[0][n - 1];`,
    },
  },

  // ── 9 ───────────────────────────────────────────────────────────────────
  {
    slug: "match-with-dot-and-star",
    title: "Match With Dots and Stars",
    difficulty: "HARD",
    interviewFrequency: "HIGH",
    description:
      "The pattern holds lowercase letters, full stops and stars. A full stop " +
      "matches any single character. A star always follows a letter or a full " +
      "stop, and means that item repeats zero or more times. Report whether the " +
      "pattern matches the whole text.",
    explanation:
      "Unlike the wildcard star, this star belongs to the item before it, so the " +
      "pattern must be consumed two characters at a time whenever a star " +
      "follows. State: matches[i][j] is true when the first i of the text are " +
      "matched by the first j of the pattern. If pattern position j is not a " +
      "star, it consumes one character of each and must agree. If it is a star, " +
      "there are two readings: the item appears zero times, so skip both pattern " +
      "characters and use matches[i][j-2]; or it appears at least once, which " +
      "requires the preceding item to match the current text character and then " +
      "leaves matches[i-1][j] — the star stays available for more. Looking " +
      "*backwards* at j-1 to find the item a star governs is the part people get " +
      "wrong, and the zero-times arm is why an empty text can be matched by a " +
      "long pattern.",
    constraints: [
      "The text holds between 0 and 200 lowercase letters.",
      "The pattern holds between 0 and 200 characters and never starts with a star.",
      "A star always follows a letter or a full stop.",
    ],
    hints: [
      "A star belongs to the item before it, so read the pattern two characters at a time.",
      "The star's item may appear zero times — skip both pattern characters.",
      "Or at least once, which consumes a text character and leaves the star in place.",
    ],
    estimatedTime: "50 min",
    signature: {
      name: "matchWithDotAndStar",
      params: [
        { name: "text", type: "string" },
        { name: "pattern", type: "string" },
      ],
      returns: "bool",
    },
    topicSlugs: ["dsa-dp-advanced", "dsa-dp-2d", "dsa-strings"],
    examples: [
      {
        input: 'text = "aab", pattern = "c*a*b"',
        output: "true",
        explanation: 'The "c*" matches nothing and the "a*" matches "aa".',
      },
      {
        input: 'text = "mississippi", pattern = "mis*is*p*."',
        output: "false",
      },
    ],
    tests: [
      { args: ["aab", "c*a*b"], expected: true },
      { args: ["mississippi", "mis*is*p*."], expected: false },
      { args: ["aa", "a"], expected: false },
      { args: ["aa", "a*"], expected: true, hidden: true },
      { args: ["ab", ".*"], expected: true, hidden: true },
      { args: ["", "a*"], expected: true, hidden: true },
      { args: ["", ""], expected: true, hidden: true },
      { args: ["abc", "a.c"], expected: true, hidden: true },
      { args: ["ab", "a*b"], expected: true, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const m = text.length;
const n = pattern.length;
const matches = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
matches[0][0] = true;

for (let j = 1; j <= n; j += 1) {
  if (pattern[j - 1] === "*") matches[0][j] = matches[0][j - 2];
}

for (let i = 1; i <= m; i += 1) {
  for (let j = 1; j <= n; j += 1) {
    const p = pattern[j - 1];
    if (p === "*") {
      const item = pattern[j - 2];
      const itemMatches = item === "." || item === text[i - 1];
      matches[i][j] = matches[i][j - 2] || (itemMatches && matches[i - 1][j]);
    } else if (p === "." || p === text[i - 1]) {
      matches[i][j] = matches[i - 1][j - 1];
    }
  }
}
return matches[m][n];`,
      TYPESCRIPT: `const m = text.length;
const n = pattern.length;
const matches: boolean[][] = Array.from({ length: m + 1 }, () =>
  new Array(n + 1).fill(false),
);
matches[0][0] = true;

for (let j = 1; j <= n; j += 1) {
  if (pattern[j - 1] === "*") matches[0][j] = matches[0][j - 2];
}

for (let i = 1; i <= m; i += 1) {
  for (let j = 1; j <= n; j += 1) {
    const p = pattern[j - 1];
    if (p === "*") {
      const item = pattern[j - 2];
      const itemMatches = item === "." || item === text[i - 1];
      matches[i][j] = matches[i][j - 2] || (itemMatches && matches[i - 1][j]);
    } else if (p === "." || p === text[i - 1]) {
      matches[i][j] = matches[i - 1][j - 1];
    }
  }
}
return matches[m][n];`,
      PYTHON: `m, n = len(text), len(pattern)
matches = [[False] * (n + 1) for _ in range(m + 1)]
matches[0][0] = True

for j in range(1, n + 1):
    if pattern[j - 1] == "*":
        matches[0][j] = matches[0][j - 2]

for i in range(1, m + 1):
    for j in range(1, n + 1):
        p = pattern[j - 1]
        if p == "*":
            item = pattern[j - 2]
            item_matches = item == "." or item == text[i - 1]
            matches[i][j] = matches[i][j - 2] or (item_matches and matches[i - 1][j])
        elif p == "." or p == text[i - 1]:
            matches[i][j] = matches[i - 1][j - 1]
return matches[m][n]`,
      JAVA: `int m = text.length();
int n = pattern.length();
boolean[][] matches = new boolean[m + 1][n + 1];
matches[0][0] = true;

for (int j = 1; j <= n; j += 1) {
    if (pattern.charAt(j - 1) == '*') matches[0][j] = matches[0][j - 2];
}

for (int i = 1; i <= m; i += 1) {
    for (int j = 1; j <= n; j += 1) {
        char p = pattern.charAt(j - 1);
        if (p == '*') {
            char item = pattern.charAt(j - 2);
            boolean itemMatches = item == '.' || item == text.charAt(i - 1);
            matches[i][j] = matches[i][j - 2] || (itemMatches && matches[i - 1][j]);
        } else if (p == '.' || p == text.charAt(i - 1)) {
            matches[i][j] = matches[i - 1][j - 1];
        }
    }
}
return matches[m][n];`,
      CPP: `int m = (int)text.size();
int n = (int)pattern.size();
vector<vector<bool>> matches(m + 1, vector<bool>(n + 1, false));
matches[0][0] = true;

for (int j = 1; j <= n; j += 1) {
    if (pattern[j - 1] == '*') matches[0][j] = matches[0][j - 2];
}

for (int i = 1; i <= m; i += 1) {
    for (int j = 1; j <= n; j += 1) {
        char p = pattern[j - 1];
        if (p == '*') {
            char item = pattern[j - 2];
            bool itemMatches = item == '.' || item == text[i - 1];
            matches[i][j] = matches[i][j - 2] || (itemMatches && matches[i - 1][j]);
        } else if (p == '.' || p == text[i - 1]) {
            matches[i][j] = matches[i - 1][j - 1];
        }
    }
}
return matches[m][n];`,
    },
  },

  // ── 10 ──────────────────────────────────────────────────────────────────
  {
    slug: "seat-everyone-cheaply",
    title: "Seat Everyone Cheaply",
    difficulty: "HARD",
    interviewFrequency: "MEDIUM",
    description:
      "There are n people and n seats, and the grid gives what it costs to put " +
      "each person in each seat. Every person takes exactly one seat and every " +
      "seat holds exactly one person. Return the smallest possible total cost.",
    explanation:
      "Assigning people to seats one person at a time, the only thing that " +
      "matters about the past is *which seats are gone* — the order they were " +
      "filled in changes nothing. So the state is a set of used seats, an " +
      "integer whose bits mark them, and the number of people already seated is " +
      "not extra state because it equals the number of set bits. Fill a table " +
      "indexed by that mask: for each mask, the next person to seat is the one " +
      "numbered by its bit count, and each free seat gives one candidate. That " +
      "is 2^n · n, and the trick of deriving one coordinate from another rather " +
      "than storing it is worth noticing — it is what keeps the table " +
      "one-dimensional. Greedy is wrong here for the same reason it is wrong in " +
      "knapsack: the cheapest seat for the first person can force an expensive " +
      "one on somebody with no alternative.",
    constraints: [
      "Between 1 and 12 people and the same number of seats.",
      "Each cost is between 0 and 10,000.",
      "Every person takes exactly one seat and every seat is used once.",
    ],
    hints: [
      "Seat people in a fixed order; only which seats are gone matters.",
      "A set of seats is an integer, and its bit count says how many people are seated.",
      "So the number of people seated need not be stored — it is derivable.",
    ],
    estimatedTime: "50 min",
    timeLimitMs: 5000,
    signature: {
      name: "seatEveryoneCheaply",
      params: [{ name: "costs", type: "int[][]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-advanced", "dsa-bit-manipulation", "dsa-greedy"],
    examples: [
      {
        input: "costs = [[3, 1], [2, 4]]",
        output: "3",
        explanation: "Person 0 takes seat 1 for 1, person 1 takes seat 0 for 2.",
      },
      { input: "costs = [[5]]", output: "5" },
    ],
    tests: [
      {
        args: [
          [
            [3, 1],
            [2, 4],
          ],
        ],
        expected: 3,
      },
      { args: [[[5]]], expected: 5 },
      {
        args: [
          [
            [1, 2, 3],
            [3, 1, 2],
            [2, 3, 1],
          ],
        ],
        expected: 3,
      },
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
            [10, 1],
            [1, 10],
          ],
        ],
        expected: 2,
        hidden: true,
      },
      {
        args: [
          [
            [1, 100, 100],
            [1, 1, 100],
            [1, 1, 1],
          ],
        ],
        expected: 3,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const n = costs.length;
const FULL = 1 << n;
const IMPOSSIBLE = Infinity;
const best = new Array(FULL).fill(IMPOSSIBLE);
best[0] = 0;

function bitCount(mask) {
  let count = 0;
  let rest = mask;
  while (rest !== 0) {
    rest &= rest - 1;
    count += 1;
  }
  return count;
}

for (let used = 0; used < FULL; used += 1) {
  if (best[used] === IMPOSSIBLE) continue;
  const person = bitCount(used);
  if (person === n) continue;
  for (let seat = 0; seat < n; seat += 1) {
    if (used & (1 << seat)) continue;
    const after = used | (1 << seat);
    const candidate = best[used] + costs[person][seat];
    if (candidate < best[after]) best[after] = candidate;
  }
}
return best[FULL - 1];`,
      TYPESCRIPT: `const n = costs.length;
const FULL = 1 << n;
const IMPOSSIBLE = Infinity;
const best: number[] = new Array(FULL).fill(IMPOSSIBLE);
best[0] = 0;

function bitCount(mask: number): number {
  let count = 0;
  let rest = mask;
  while (rest !== 0) {
    rest &= rest - 1;
    count += 1;
  }
  return count;
}

for (let used = 0; used < FULL; used += 1) {
  if (best[used] === IMPOSSIBLE) continue;
  const person = bitCount(used);
  if (person === n) continue;
  for (let seat = 0; seat < n; seat += 1) {
    if (used & (1 << seat)) continue;
    const after = used | (1 << seat);
    const candidate = best[used] + costs[person][seat];
    if (candidate < best[after]) best[after] = candidate;
  }
}
return best[FULL - 1];`,
      PYTHON: `n = len(costs)
full = 1 << n
impossible = float("inf")
best = [impossible] * full
best[0] = 0

for used in range(full):
    if best[used] == impossible:
        continue
    person = bin(used).count("1")
    if person == n:
        continue
    for seat in range(n):
        if used & (1 << seat):
            continue
        after = used | (1 << seat)
        candidate = best[used] + costs[person][seat]
        if candidate < best[after]:
            best[after] = candidate
return int(best[full - 1])`,
      JAVA: `int n = costs.length;
int full = 1 << n;
final int IMPOSSIBLE = Integer.MAX_VALUE / 4;
int[] best = new int[full];
Arrays.fill(best, IMPOSSIBLE);
best[0] = 0;

for (int used = 0; used < full; used += 1) {
    if (best[used] == IMPOSSIBLE) continue;
    int person = Integer.bitCount(used);
    if (person == n) continue;
    for (int seat = 0; seat < n; seat += 1) {
        if ((used & (1 << seat)) != 0) continue;
        int after = used | (1 << seat);
        int candidate = best[used] + costs[person][seat];
        if (candidate < best[after]) best[after] = candidate;
    }
}
return best[full - 1];`,
      CPP: `int n = (int)costs.size();
int full = 1 << n;
const int IMPOSSIBLE = INT_MAX / 4;
vector<int> best(full, IMPOSSIBLE);
best[0] = 0;

for (int used = 0; used < full; used += 1) {
    if (best[used] == IMPOSSIBLE) continue;
    int person = __builtin_popcount(used);
    if (person == n) continue;
    for (int seat = 0; seat < n; seat += 1) {
        if (used & (1 << seat)) continue;
        int after = used | (1 << seat);
        int candidate = best[used] + costs[person][seat];
        if (candidate < best[after]) best[after] = candidate;
    }
}
return best[full - 1];`,
    },
  },
];
