import type { SeedProblem } from "../../problems/types";

/**
 * One-dimensional dynamic programming.
 *
 * Every problem here is answered by one array, where entry i is the answer for
 * a prefix, a position, or an amount. The work is never the loop — it is
 * naming the state. So every explanation here says, in one sentence, what
 * entry i *means* before it says how to fill it in, because a candidate who
 * can state that has essentially finished, and one who cannot will write a
 * recurrence that is subtly about the wrong thing.
 *
 * Two shapes recur and are worth separating in your head. Answers indexed by
 * *position* — stairs, robbing, rising runs — build forwards from earlier
 * positions. Answers indexed by *amount* — coins, sums — build up from smaller
 * amounts, and the order of the two loops there decides whether combinations or
 * orderings are being counted, which is the single most common DP mistake in
 * interviews and gets a problem of its own.
 *
 * Several of these need only the last one or two entries, and the explanations
 * say so: dropping the array to a couple of variables is the follow-up
 * interviewers reach for once the table is on the board.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const DP_1D_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "count-ways-to-climb",
    title: "Count the Ways to Climb",
    difficulty: "EASY",
    interviewFrequency: "VERY_HIGH",
    description:
      "A staircase has the given number of steps, and you may climb one or two " +
      "at a time. Return how many distinct ways there are to reach the top. A " +
      "staircase of zero steps has exactly one way — do nothing.",
    explanation:
      "State first: ways[i] is the number of ways to reach step i. The last move " +
      "onto step i was either a single step from i-1 or a double from i-2, and " +
      "those two sets of routes are disjoint and cover everything, so " +
      "ways[i] = ways[i-1] + ways[i-2]. That is the Fibonacci sequence, offset " +
      "by one, which is worth noticing but is not the point — the point is that " +
      "the recurrence came from asking what the *last* move was, and that " +
      "question is what unlocks most one-dimensional DP. Base cases are " +
      "ways[0] = 1 and ways[1] = 1. Since only the previous two entries are ever " +
      "read, the array collapses to two variables and the memory drops to O(1).",
    constraints: [
      "The number of steps is between 0 and 45.",
      "Each move climbs exactly one or two steps.",
      "Zero steps has one way, namely doing nothing.",
    ],
    hints: [
      "Say what entry i means before writing anything.",
      "Ask what the final move onto step i must have been.",
      "Only the last two entries are ever read.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "countWaysToClimb",
      params: [{ name: "steps", type: "int" }],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-1d", "dsa-recursion", "js-loops"],
    examples: [
      {
        input: "steps = 3",
        output: "3",
        explanation: "1+1+1, 1+2 and 2+1.",
      },
      { input: "steps = 0", output: "1" },
    ],
    tests: [
      { args: [3], expected: 3 },
      { args: [0], expected: 1 },
      { args: [2], expected: 2 },
      { args: [1], expected: 1, hidden: true },
      { args: [10], expected: 89, hidden: true },
      { args: [45], expected: 1836311903, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let twoBack = 1;
let oneBack = 1;
for (let i = 2; i <= steps; i += 1) {
  const here = oneBack + twoBack;
  twoBack = oneBack;
  oneBack = here;
}
return steps === 0 ? 1 : oneBack;`,
      TYPESCRIPT: `let twoBack = 1;
let oneBack = 1;
for (let i = 2; i <= steps; i += 1) {
  const here = oneBack + twoBack;
  twoBack = oneBack;
  oneBack = here;
}
return steps === 0 ? 1 : oneBack;`,
      PYTHON: `two_back = 1
one_back = 1
for _i in range(2, steps + 1):
    two_back, one_back = one_back, one_back + two_back
return 1 if steps == 0 else one_back`,
      JAVA: `long twoBack = 1;
long oneBack = 1;
for (int i = 2; i <= steps; i += 1) {
    long here = oneBack + twoBack;
    twoBack = oneBack;
    oneBack = here;
}
return steps == 0 ? 1 : (int) oneBack;`,
      CPP: `long long twoBack = 1;
long long oneBack = 1;
for (int i = 2; i <= steps; i += 1) {
    long long here = oneBack + twoBack;
    twoBack = oneBack;
    oneBack = here;
}
return steps == 0 ? 1 : (int)oneBack;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "cheapest-way-up-the-stairs",
    title: "The Cheapest Way Up the Stairs",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Standing on a step costs what is written on it. You may start on either " +
      "of the first two steps and climb one or two at a time. Return the least " +
      "you can pay to get past the top step.",
    explanation:
      "The state is the same as before with the meaning changed: cost[i] is the " +
      "least you can pay to *arrive* at step i, and arriving means paying for it. " +
      "So cost[i] = costs[i] + min(cost[i-1], cost[i-2]). The two starting steps " +
      "cost only themselves. The detail that catches people is the finish: you " +
      "must get *past* the top, which is one position beyond the last step, so " +
      "the answer is the smaller of the last two arrival costs rather than the " +
      "last one. Defining the state as 'arrive at' rather than 'stand on and " +
      "then leave' is what keeps that clean — the other definition works too but " +
      "moves the awkwardness to the base cases instead of the end.",
    constraints: [
      "The staircase has between 2 and 1,000 steps.",
      "Each cost is between 0 and 999.",
      "You may start on either of the first two steps, and finish past the last.",
    ],
    hints: [
      "Let entry i be the least cost of arriving at step i, having paid for it.",
      "You arrive at i from either i - 1 or i - 2.",
      "The finish is past the last step, not on it.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "cheapestWayUpTheStairs",
      params: [{ name: "costs", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-1d", "js-arrays", "js-loops"],
    examples: [
      {
        input: "costs = [10, 15, 20]",
        output: "15",
        explanation: "Start on the 15 and take two steps straight past the top.",
      },
      {
        input: "costs = [1, 100, 1, 1, 1, 100, 1, 1, 100, 1]",
        output: "6",
      },
    ],
    tests: [
      { args: [[10, 15, 20]], expected: 15 },
      { args: [[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]], expected: 6 },
      { args: [[0, 0]], expected: 0 },
      { args: [[5, 5]], expected: 5, hidden: true },
      { args: [[1, 2, 3]], expected: 2, hidden: true },
      { args: [[0, 1, 2, 2]], expected: 2, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let twoBack = costs[0];
let oneBack = costs[1];
for (let i = 2; i < costs.length; i += 1) {
  const here = costs[i] + Math.min(oneBack, twoBack);
  twoBack = oneBack;
  oneBack = here;
}
return Math.min(oneBack, twoBack);`,
      TYPESCRIPT: `let twoBack = costs[0];
let oneBack = costs[1];
for (let i = 2; i < costs.length; i += 1) {
  const here = costs[i] + Math.min(oneBack, twoBack);
  twoBack = oneBack;
  oneBack = here;
}
return Math.min(oneBack, twoBack);`,
      PYTHON: `two_back = costs[0]
one_back = costs[1]
for i in range(2, len(costs)):
    two_back, one_back = one_back, costs[i] + min(one_back, two_back)
return min(one_back, two_back)`,
      JAVA: `int twoBack = costs[0];
int oneBack = costs[1];
for (int i = 2; i < costs.length; i += 1) {
    int here = costs[i] + Math.min(oneBack, twoBack);
    twoBack = oneBack;
    oneBack = here;
}
return Math.min(oneBack, twoBack);`,
      CPP: `int twoBack = costs[0];
int oneBack = costs[1];
for (int i = 2; i < (int)costs.size(); i += 1) {
    int here = costs[i] + min(oneBack, twoBack);
    twoBack = oneBack;
    oneBack = here;
}
return min(oneBack, twoBack);`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "take-without-taking-neighbours",
    title: "Take Without Taking Neighbours",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Each house on a street holds an amount. Choose a set of houses with the " +
      "largest possible total, never choosing two houses next to each other. " +
      "Return that total.",
    explanation:
      "State: best[i] is the largest total obtainable from the first i houses. " +
      "For house i there are exactly two options — skip it, leaving best[i-1], " +
      "or take it, which forbids house i-1 and gives values[i] + best[i-2]. " +
      "Take the larger. That is the whole recurrence, and the reason greedy " +
      "fails here is worth stating: taking the largest remaining house first can " +
      "block two houses whose sum beats it, as [2, 7, 9, 3, 1] shows. Base cases " +
      "are best[0] = 0 and best[1] = values[0]. Only the previous two entries " +
      "are read, so this reduces to two variables — and once it is two " +
      "variables, the shape 'take or skip, and taking excludes the neighbour' " +
      "becomes recognisable in problems that do not mention houses at all.",
    constraints: [
      "Between 0 and 100,000 houses.",
      "Each amount is between 0 and 10,000.",
      "No two chosen houses may be adjacent.",
    ],
    hints: [
      "Entry i is the best total from the first i houses.",
      "House i is either skipped or taken, and taking it rules out house i - 1.",
      "Greedy on the largest amount is wrong — find a list where it loses.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "takeWithoutTakingNeighbours",
      params: [{ name: "values", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-1d", "dsa-greedy", "js-arrays"],
    examples: [
      {
        input: "values = [1, 2, 3, 1]",
        output: "4",
        explanation: "Take the first and third.",
      },
      {
        input: "values = [2, 7, 9, 3, 1]",
        output: "12",
        explanation: "2 + 9 + 1 beats taking the 7.",
      },
    ],
    tests: [
      { args: [[1, 2, 3, 1]], expected: 4 },
      { args: [[2, 7, 9, 3, 1]], expected: 12 },
      { args: [[]], expected: 0 },
      { args: [[5]], expected: 5, hidden: true },
      { args: [[2, 1]], expected: 2, hidden: true },
      { args: [[0, 0, 0]], expected: 0, hidden: true },
      { args: [[1, 3, 1, 3, 100]], expected: 103, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let twoBack = 0;
let oneBack = 0;
for (const value of values) {
  const here = Math.max(oneBack, twoBack + value);
  twoBack = oneBack;
  oneBack = here;
}
return oneBack;`,
      TYPESCRIPT: `let twoBack = 0;
let oneBack = 0;
for (const value of values) {
  const here = Math.max(oneBack, twoBack + value);
  twoBack = oneBack;
  oneBack = here;
}
return oneBack;`,
      PYTHON: `two_back = 0
one_back = 0
for value in values:
    two_back, one_back = one_back, max(one_back, two_back + value)
return one_back`,
      JAVA: `int twoBack = 0;
int oneBack = 0;
for (int value : values) {
    int here = Math.max(oneBack, twoBack + value);
    twoBack = oneBack;
    oneBack = here;
}
return oneBack;`,
      CPP: `int twoBack = 0;
int oneBack = 0;
for (int value : values) {
    int here = max(oneBack, twoBack + value);
    twoBack = oneBack;
    oneBack = here;
}
return oneBack;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "take-without-neighbours-in-a-ring",
    title: "The Same, Around a Ring",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "The houses now stand in a ring, so the first and the last are neighbours " +
      "too. Choose a set with the largest total, never taking two adjacent " +
      "houses. Return that total.",
    explanation:
      "The ring adds exactly one constraint — the first and last cannot both be " +
      "taken — and rather than complicating the recurrence, split on it. Any " +
      "valid selection either leaves out the first house or leaves out the last " +
      "one (or both, which both cases cover). So run the straight-line solution " +
      "twice, once on the houses without the first and once on the houses " +
      "without the last, and take the larger answer. Neither run can produce an " +
      "invalid selection, because in each the two ends are no longer adjacent. " +
      "Splitting a circular problem into two linear ones is the general " +
      "technique and is worth more than this problem — the alternative, carrying " +
      "'did I take the first house' through the recurrence, doubles the state " +
      "for no benefit. A single house is the one case needing care, since " +
      "removing either end leaves nothing.",
    constraints: [
      "Between 0 and 100,000 houses arranged in a ring.",
      "Each amount is between 0 and 10,000.",
      "The first and last houses count as neighbours.",
    ],
    hints: [
      "A valid selection must leave out the first house or the last one.",
      "So solve the straight-line version twice and take the better answer.",
      "One house is a special case — dropping either end leaves nothing.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "takeWithoutNeighboursInARing",
      params: [{ name: "values", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-1d", "dsa-greedy", "js-arrays"],
    examples: [
      {
        input: "values = [2, 3, 2]",
        output: "3",
        explanation: "The two 2s are neighbours around the ring, so only the 3 can be taken.",
      },
      {
        input: "values = [1, 2, 3, 1]",
        output: "4",
      },
    ],
    tests: [
      { args: [[2, 3, 2]], expected: 3 },
      { args: [[1, 2, 3, 1]], expected: 4 },
      { args: [[5]], expected: 5 },
      { args: [[]], expected: 0, hidden: true },
      { args: [[1, 2]], expected: 2, hidden: true },
      { args: [[1, 2, 3]], expected: 3, hidden: true },
      { args: [[200, 3, 140, 20, 10]], expected: 340, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `function straight(from, to) {
  let twoBack = 0;
  let oneBack = 0;
  for (let i = from; i < to; i += 1) {
    const here = Math.max(oneBack, twoBack + values[i]);
    twoBack = oneBack;
    oneBack = here;
  }
  return oneBack;
}

if (values.length === 0) return 0;
if (values.length === 1) return values[0];
return Math.max(straight(0, values.length - 1), straight(1, values.length));`,
      TYPESCRIPT: `function straight(from: number, to: number): number {
  let twoBack = 0;
  let oneBack = 0;
  for (let i = from; i < to; i += 1) {
    const here = Math.max(oneBack, twoBack + values[i]);
    twoBack = oneBack;
    oneBack = here;
  }
  return oneBack;
}

if (values.length === 0) return 0;
if (values.length === 1) return values[0];
return Math.max(straight(0, values.length - 1), straight(1, values.length));`,
      PYTHON: `def straight(start, end):
    two_back = 0
    one_back = 0
    for i in range(start, end):
        two_back, one_back = one_back, max(one_back, two_back + values[i])
    return one_back

if not values:
    return 0
if len(values) == 1:
    return values[0]
return max(straight(0, len(values) - 1), straight(1, len(values)))`,
      JAVA: `class Line {
    int straight(int from, int to) {
        int twoBack = 0;
        int oneBack = 0;
        for (int i = from; i < to; i += 1) {
            int here = Math.max(oneBack, twoBack + values[i]);
            twoBack = oneBack;
            oneBack = here;
        }
        return oneBack;
    }
}

if (values.length == 0) return 0;
if (values.length == 1) return values[0];
Line line = new Line();
return Math.max(line.straight(0, values.length - 1), line.straight(1, values.length));`,
      CPP: `auto straight = [&](int from, int to) {
    int twoBack = 0;
    int oneBack = 0;
    for (int i = from; i < to; i += 1) {
        int here = max(oneBack, twoBack + values[i]);
        twoBack = oneBack;
        oneBack = here;
    }
    return oneBack;
};

if (values.empty()) return 0;
if (values.size() == 1) return values[0];
int n = (int)values.size();
return max(straight(0, n - 1), straight(1, n));`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "fewest-coins-to-make",
    title: "The Fewest Coins",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Given coin values available in unlimited supply, return the fewest coins " +
      "that add up to exactly the amount, or -1 if no combination does. An " +
      "amount of zero needs no coins.",
    explanation:
      "State: fewest[a] is the smallest number of coins totalling exactly a. To " +
      "fill it, ask what the *last* coin was — for each coin worth c that is no " +
      "larger than a, the answer could be 1 + fewest[a - c], and the smallest of " +
      "those wins. Start fewest[0] = 0 and everything else at an impossible " +
      "value, and an amount still holding that value at the end is unreachable. " +
      "Greedy — always taking the largest coin that fits — is wrong and the " +
      "tests prove it: with coins 1, 3 and 4, making 6 greedily gives 4+1+1, " +
      "three coins, while 3+3 is two. That failure is the reason this is a DP " +
      "problem at all, and being able to produce that counterexample matters " +
      "more in an interview than the code does.",
    constraints: [
      "Between 1 and 20 distinct coin values, each between 1 and 10,000.",
      "The amount is between 0 and 20,000.",
      "Each coin may be used any number of times.",
    ],
    hints: [
      "Entry a is the fewest coins making exactly a.",
      "Ask which coin was the last one added.",
      "Greedy fails — find coins where taking the largest first loses.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "fewestCoinsToMake",
      params: [
        { name: "coins", type: "int[]" },
        { name: "amount", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-1d", "dsa-greedy", "js-arrays"],
    examples: [
      {
        input: "coins = [1, 2, 5], amount = 11",
        output: "3",
        explanation: "5 + 5 + 1.",
      },
      {
        input: "coins = [2], amount = 3",
        output: "-1",
        explanation: "Only even amounts can be made.",
      },
    ],
    tests: [
      { args: [[1, 2, 5], 11], expected: 3 },
      { args: [[2], 3], expected: -1 },
      { args: [[1], 0], expected: 0 },
      { args: [[1, 3, 4], 6], expected: 2, hidden: true },
      { args: [[5], 5], expected: 1, hidden: true },
      { args: [[7, 11], 1], expected: -1, hidden: true },
      { args: [[1, 2, 5], 100], expected: 20, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const IMPOSSIBLE = amount + 1;
const fewest = new Array(amount + 1).fill(IMPOSSIBLE);
fewest[0] = 0;
for (let a = 1; a <= amount; a += 1) {
  for (const coin of coins) {
    if (coin > a) continue;
    if (fewest[a - coin] + 1 < fewest[a]) fewest[a] = fewest[a - coin] + 1;
  }
}
return fewest[amount] === IMPOSSIBLE ? -1 : fewest[amount];`,
      TYPESCRIPT: `const IMPOSSIBLE = amount + 1;
const fewest: number[] = new Array(amount + 1).fill(IMPOSSIBLE);
fewest[0] = 0;
for (let a = 1; a <= amount; a += 1) {
  for (const coin of coins) {
    if (coin > a) continue;
    if (fewest[a - coin] + 1 < fewest[a]) fewest[a] = fewest[a - coin] + 1;
  }
}
return fewest[amount] === IMPOSSIBLE ? -1 : fewest[amount];`,
      PYTHON: `impossible = amount + 1
fewest = [impossible] * (amount + 1)
fewest[0] = 0
for a in range(1, amount + 1):
    for coin in coins:
        if coin <= a:
            fewest[a] = min(fewest[a], fewest[a - coin] + 1)
return -1 if fewest[amount] == impossible else fewest[amount]`,
      JAVA: `int impossible = amount + 1;
int[] fewest = new int[amount + 1];
Arrays.fill(fewest, impossible);
fewest[0] = 0;
for (int a = 1; a <= amount; a += 1) {
    for (int coin : coins) {
        if (coin > a) continue;
        fewest[a] = Math.min(fewest[a], fewest[a - coin] + 1);
    }
}
return fewest[amount] == impossible ? -1 : fewest[amount];`,
      CPP: `int impossible = amount + 1;
vector<int> fewest(amount + 1, impossible);
fewest[0] = 0;
for (int a = 1; a <= amount; a += 1) {
    for (int coin : coins) {
        if (coin > a) continue;
        fewest[a] = min(fewest[a], fewest[a - coin] + 1);
    }
}
return fewest[amount] == impossible ? -1 : fewest[amount];`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "ways-to-make-the-amount",
    title: "The Ways to Make the Amount",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Given coin values available in unlimited supply, count the distinct " +
      "combinations that add up to exactly the amount. Two combinations using " +
      "the same coins in a different order count as one. An amount of zero has " +
      "exactly one combination — take nothing.",
    explanation:
      "State: ways[a] is the number of combinations making a. The recurrence " +
      "looks like the previous problem's but the *loop order* decides what is " +
      "being counted, and that is the entire lesson. Put the coins on the " +
      "outside and the amounts inside: for each coin in turn, add ways[a - coin] " +
      "into ways[a] for every a. Because a coin is only ever considered once, " +
      "and always after every smaller-indexed coin, each combination is built in " +
      "exactly one order and counted once. Swap the loops — amounts outside, " +
      "coins inside — and 1+2 and 2+1 are both counted, which answers a " +
      "different question entirely. Being able to say which loop order counts " +
      "combinations and which counts orderings is the thing interviewers " +
      "actually probe here.",
    constraints: [
      "Between 0 and 100 distinct coin values, each between 1 and 5,000.",
      "The amount is between 0 and 5,000, and the answer fits in a 32-bit integer.",
      "Order does not matter, so 1+2 and 2+1 are the same combination.",
    ],
    hints: [
      "Entry a is the number of combinations making a.",
      "Loop over the coins on the outside and the amounts on the inside.",
      "Swapping the loops counts orderings instead — make sure you know which you wrote.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "waysToMakeTheAmount",
      params: [
        { name: "coins", type: "int[]" },
        { name: "amount", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-1d", "js-arrays", "js-loops"],
    examples: [
      {
        input: "coins = [1, 2, 5], amount = 5",
        output: "4",
        explanation: "5, 2+2+1, 2+1+1+1 and 1+1+1+1+1.",
      },
      { input: "coins = [2], amount = 3", output: "0" },
    ],
    tests: [
      { args: [[1, 2, 5], 5], expected: 4 },
      { args: [[2], 3], expected: 0 },
      { args: [[10], 10], expected: 1 },
      { args: [[], 0], expected: 1, hidden: true },
      { args: [[], 5], expected: 0, hidden: true },
      { args: [[1, 2], 4], expected: 3, hidden: true },
      { args: [[1, 2, 3], 4], expected: 4, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const ways = new Array(amount + 1).fill(0);
ways[0] = 1;
for (const coin of coins) {
  for (let a = coin; a <= amount; a += 1) ways[a] += ways[a - coin];
}
return ways[amount];`,
      TYPESCRIPT: `const ways: number[] = new Array(amount + 1).fill(0);
ways[0] = 1;
for (const coin of coins) {
  for (let a = coin; a <= amount; a += 1) ways[a] += ways[a - coin];
}
return ways[amount];`,
      PYTHON: `ways = [0] * (amount + 1)
ways[0] = 1
for coin in coins:
    for a in range(coin, amount + 1):
        ways[a] += ways[a - coin]
return ways[amount]`,
      JAVA: `int[] ways = new int[amount + 1];
ways[0] = 1;
for (int coin : coins) {
    for (int a = coin; a <= amount; a += 1) ways[a] += ways[a - coin];
}
return ways[amount];`,
      CPP: `vector<int> ways(amount + 1, 0);
ways[0] = 1;
for (int coin : coins) {
    for (int a = coin; a <= amount; a += 1) ways[a] += ways[a - coin];
}
return ways[amount];`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "can-the-text-be-split",
    title: "Can the Text Be Split Into Words?",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Report whether the text can be cut into a sequence of pieces, each of " +
      "which appears in the given dictionary. A dictionary word may be used any " +
      "number of times. Empty text can always be split, into nothing.",
    explanation:
      "State: reachable[i] is true when the first i characters can be split. " +
      "reachable[0] is true — no characters need no words. For each later " +
      "position, look backwards: if some earlier position j is reachable and the " +
      "piece from j to i is in the dictionary, then i is reachable too. That is " +
      "O(n²) piece tests, each costing a hash-set lookup. The reason the plain " +
      "recursive search is unacceptable is worth being explicit about: without " +
      "memoisation it re-solves the same suffix along every path that reaches " +
      "it, which is exponential on inputs like a long run of 'a's ending in a " +
      "'b'. The DP is that same search with the answers written down, which is " +
      "all memoisation ever is.",
    constraints: [
      "The text holds between 0 and 300 lowercase letters.",
      "Between 0 and 1,000 dictionary words, each between 1 and 20 lowercase letters.",
      "Words may be reused any number of times.",
    ],
    hints: [
      "Entry i says whether the first i characters can be split.",
      "For each i, look back for a reachable j where the piece between them is a word.",
      "Put the dictionary in a hash set so each piece test is constant time.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "canTheTextBeSplit",
      params: [
        { name: "text", type: "string" },
        { name: "dictionary", type: "string[]" },
      ],
      returns: "bool",
    },
    topicSlugs: ["dsa-dp-1d", "dsa-hashing", "dsa-strings"],
    examples: [
      {
        input: 'text = "applepen", dictionary = ["apple", "pen"]',
        output: "true",
      },
      {
        input: 'text = "catsandog", dictionary = ["cats", "dog", "sand", "and", "cat"]',
        output: "false",
        explanation: 'Every split leaves an "og" or an "andog" that is not a word.',
      },
    ],
    tests: [
      { args: ["applepen", ["apple", "pen"]], expected: true },
      {
        args: ["catsandog", ["cats", "dog", "sand", "and", "cat"]],
        expected: false,
      },
      { args: ["", ["a"]], expected: true },
      { args: ["a", []], expected: false, hidden: true },
      { args: ["aaaaab", ["a", "aa", "aaa"]], expected: false, hidden: true },
      { args: ["aaaaa", ["a", "aa", "aaa"]], expected: true, hidden: true },
      { args: ["abcd", ["ab", "cd"]], expected: true, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const known = new Set(dictionary);
const reachable = new Array(text.length + 1).fill(false);
reachable[0] = true;
for (let i = 1; i <= text.length; i += 1) {
  for (let j = 0; j < i; j += 1) {
    if (reachable[j] && known.has(text.slice(j, i))) {
      reachable[i] = true;
      break;
    }
  }
}
return reachable[text.length];`,
      TYPESCRIPT: `const known = new Set<string>(dictionary);
const reachable: boolean[] = new Array(text.length + 1).fill(false);
reachable[0] = true;
for (let i = 1; i <= text.length; i += 1) {
  for (let j = 0; j < i; j += 1) {
    if (reachable[j] && known.has(text.slice(j, i))) {
      reachable[i] = true;
      break;
    }
  }
}
return reachable[text.length];`,
      PYTHON: `known = set(dictionary)
reachable = [False] * (len(text) + 1)
reachable[0] = True
for i in range(1, len(text) + 1):
    for j in range(i):
        if reachable[j] and text[j:i] in known:
            reachable[i] = True
            break
return reachable[len(text)]`,
      JAVA: `Set<String> known = new HashSet<>(Arrays.asList(dictionary));
boolean[] reachable = new boolean[text.length() + 1];
reachable[0] = true;
for (int i = 1; i <= text.length(); i += 1) {
    for (int j = 0; j < i; j += 1) {
        if (reachable[j] && known.contains(text.substring(j, i))) {
            reachable[i] = true;
            break;
        }
    }
}
return reachable[text.length()];`,
      CPP: `unordered_set<string> known(dictionary.begin(), dictionary.end());
vector<bool> reachable(text.size() + 1, false);
reachable[0] = true;
for (size_t i = 1; i <= text.size(); i += 1) {
    for (size_t j = 0; j < i; j += 1) {
        if (reachable[j] && known.count(text.substr(j, i - j))) {
            reachable[i] = true;
            break;
        }
    }
}
return reachable[text.size()];`,
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "longest-rising-run",
    title: "The Longest Rising Run",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Return the length of the longest strictly increasing subsequence — values " +
      "taken in order but not necessarily next to each other, each larger than " +
      "the one before.",
    explanation:
      "State: best[i] is the length of the longest rising run *ending at* index " +
      "i. Ending at, not 'within the first i', and that distinction is what " +
      "makes the recurrence work: best[i] is one more than the largest best[j] " +
      "over every earlier j whose value is smaller, or 1 if there is none. The " +
      "answer is the maximum over the whole table, not its last entry — a " +
      "consequence of the state being anchored at i. That is O(n²) and is a good " +
      "answer. The O(n log n) one is worth knowing and is not an optimisation of " +
      "this table at all: keep a list where entry k is the smallest value that " +
      "can end a run of length k+1, and binary search each incoming value into " +
      "it. That list is not itself a valid subsequence — only its length is " +
      "meaningful — which is the detail people get wrong when they try to " +
      "reconstruct the run from it.",
    constraints: [
      "The list holds between 0 and 2,500 values.",
      "Values are between -10,000 and 10,000.",
      "The run must be strictly increasing.",
    ],
    hints: [
      "Let entry i be the longest run *ending at* i.",
      "The answer is the largest entry, not the last one.",
      "There is an O(n log n) version keeping the smallest tail for each length.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "longestRisingRun",
      params: [{ name: "values", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-1d", "dsa-binary-search", "js-arrays"],
    examples: [
      {
        input: "values = [10, 9, 2, 5, 3, 7, 101, 18]",
        output: "4",
        explanation: "2, 3, 7, 101.",
      },
      {
        input: "values = [7, 7, 7]",
        output: "1",
        explanation: "Equal values do not count as rising.",
      },
    ],
    tests: [
      { args: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4 },
      { args: [[7, 7, 7]], expected: 1 },
      { args: [[]], expected: 0 },
      { args: [[1]], expected: 1, hidden: true },
      { args: [[5, 4, 3, 2, 1]], expected: 1, hidden: true },
      { args: [[1, 2, 3, 4, 5]], expected: 5, hidden: true },
      { args: [[0, 1, 0, 3, 2, 3]], expected: 4, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const tails = [];
for (const value of values) {
  let low = 0;
  let high = tails.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (tails[middle] < value) low = middle + 1;
    else high = middle;
  }
  tails[low] = value;
}
return tails.length;`,
      TYPESCRIPT: `const tails: number[] = [];
for (const value of values) {
  let low = 0;
  let high = tails.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (tails[middle] < value) low = middle + 1;
    else high = middle;
  }
  tails[low] = value;
}
return tails.length;`,
      PYTHON: `import bisect

tails = []
for value in values:
    at = bisect.bisect_left(tails, value)
    if at == len(tails):
        tails.append(value)
    else:
        tails[at] = value
return len(tails)`,
      JAVA: `List<Integer> tails = new ArrayList<>();
for (int value : values) {
    int low = 0;
    int high = tails.size();
    while (low < high) {
        int middle = (low + high) >>> 1;
        if (tails.get(middle) < value) low = middle + 1;
        else high = middle;
    }
    if (low == tails.size()) tails.add(value);
    else tails.set(low, value);
}
return tails.size();`,
      CPP: `vector<int> tails;
for (int value : values) {
    auto at = lower_bound(tails.begin(), tails.end(), value);
    if (at == tails.end()) tails.push_back(value);
    else *at = value;
}
return (int)tails.size();`,
    },
  },

  // ── 9 ───────────────────────────────────────────────────────────────────
  {
    slug: "ways-to-decode",
    title: "Ways to Decode the Digits",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Letters were encoded as numbers, A as 1 through Z as 26, and the numbers " +
      "were written down with no separators. Count the ways the digits could be " +
      "read back as letters. A piece starting with 0 decodes to nothing, so it " +
      "is never valid.",
    explanation:
      "State: ways[i] is the number of decodings of the first i digits. The last " +
      "letter used either one digit or two, so ways[i] = ways[i-1] when digit i " +
      "is not '0', plus ways[i-2] when the two digits ending at i form a number " +
      "between 10 and 26. Same shape as climbing stairs with the moves made " +
      "conditional, which is a useful way to see it. All the difficulty is in " +
      "the zeros, and they are worth enumerating: a lone '0' is never a letter, " +
      "'06' is not a valid two-digit piece because 6 has a leading zero, and a " +
      "'0' that cannot pair with the digit before it makes the whole decoding " +
      "impossible from there on — which the recurrence handles by leaving " +
      "ways[i] at zero and letting that propagate.",
    constraints: [
      "The text holds between 1 and 100 digits.",
      "A piece with a leading zero is never valid.",
      "The answer fits in a 32-bit signed integer.",
    ],
    hints: [
      "Entry i counts the decodings of the first i digits.",
      "The last letter took one digit or two — both are conditional.",
      "Work through what '0', '06' and '10' each mean before writing the code.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "waysToDecode",
      params: [{ name: "digits", type: "string" }],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-1d", "dsa-strings", "js-loops"],
    examples: [
      {
        input: 'digits = "226"',
        output: "3",
        explanation: '"BZ", "VF" and "BBF".',
      },
      {
        input: 'digits = "06"',
        output: "0",
        explanation: "Nothing starts with a zero.",
      },
    ],
    tests: [
      { args: ["226"], expected: 3 },
      { args: ["06"], expected: 0 },
      { args: ["12"], expected: 2 },
      { args: ["0"], expected: 0, hidden: true },
      { args: ["10"], expected: 1, hidden: true },
      { args: ["27"], expected: 1, hidden: true },
      { args: ["100"], expected: 0, hidden: true },
      { args: ["1111"], expected: 5, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const n = digits.length;
let twoBack = 1;
let oneBack = digits[0] === "0" ? 0 : 1;
for (let i = 1; i < n; i += 1) {
  let here = 0;
  if (digits[i] !== "0") here += oneBack;
  const pair = Number(digits.slice(i - 1, i + 1));
  if (pair >= 10 && pair <= 26) here += twoBack;
  twoBack = oneBack;
  oneBack = here;
}
return oneBack;`,
      TYPESCRIPT: `const n = digits.length;
let twoBack = 1;
let oneBack = digits[0] === "0" ? 0 : 1;
for (let i = 1; i < n; i += 1) {
  let here = 0;
  if (digits[i] !== "0") here += oneBack;
  const pair = Number(digits.slice(i - 1, i + 1));
  if (pair >= 10 && pair <= 26) here += twoBack;
  twoBack = oneBack;
  oneBack = here;
}
return oneBack;`,
      PYTHON: `two_back = 1
one_back = 0 if digits[0] == "0" else 1
for i in range(1, len(digits)):
    here = 0
    if digits[i] != "0":
        here += one_back
    pair = int(digits[i - 1 : i + 1])
    if 10 <= pair <= 26:
        here += two_back
    two_back, one_back = one_back, here
return one_back`,
      JAVA: `int n = digits.length();
int twoBack = 1;
int oneBack = digits.charAt(0) == '0' ? 0 : 1;
for (int i = 1; i < n; i += 1) {
    int here = 0;
    if (digits.charAt(i) != '0') here += oneBack;
    int pair = Integer.parseInt(digits.substring(i - 1, i + 1));
    if (pair >= 10 && pair <= 26) here += twoBack;
    twoBack = oneBack;
    oneBack = here;
}
return oneBack;`,
      CPP: `int n = (int)digits.size();
int twoBack = 1;
int oneBack = digits[0] == '0' ? 0 : 1;
for (int i = 1; i < n; i += 1) {
    int here = 0;
    if (digits[i] != '0') here += oneBack;
    int pair = (digits[i - 1] - '0') * 10 + (digits[i] - '0');
    if (pair >= 10 && pair <= 26) here += twoBack;
    twoBack = oneBack;
    oneBack = here;
}
return oneBack;`,
    },
  },

  // ── 10 ──────────────────────────────────────────────────────────────────
  {
    slug: "fewest-squares-adding-up",
    title: "The Fewest Squares That Add Up",
    difficulty: "HARD",
    interviewFrequency: "MEDIUM",
    description:
      "Return the fewest perfect squares — 1, 4, 9, 16 and so on — that add up " +
      "to exactly the given number. Squares may be repeated. Zero needs none.",
    explanation:
      "Structurally this is the coin problem with the coins being every square " +
      "up to the target: fewest[v] is one more than the smallest fewest[v - s] " +
      "over every square s that fits, which is O(n√n) and entirely adequate. " +
      "What makes it worth a hard slot is what happens when an interviewer asks " +
      "for better. Lagrange's four-square theorem says the answer is never more " +
      "than four, and Legendre's three-square theorem says it is exactly four " +
      "precisely when the number has the form 4^a(8b+7). So the answer is 1 if " +
      "the number is itself a square, 2 if it is a sum of two squares — testable " +
      "in O(√n) — 4 if it matches that form, and 3 otherwise, in O(√n) overall. " +
      "Knowing the DP is the expected answer; knowing that a number-theoretic " +
      "shortcut exists is what distinguishes a strong one.",
    constraints: [
      "The number is between 0 and 10,000.",
      "Squares may be used more than once.",
      "Zero needs no squares at all.",
    ],
    hints: [
      "This is the coin problem where the coins are the squares below the number.",
      "Entry v is the fewest squares summing to exactly v.",
      "The answer is never more than four — that is Lagrange's theorem.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "fewestSquaresAddingUp",
      params: [{ name: "number", type: "int" }],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-1d", "js-loops", "js-operators"],
    examples: [
      {
        input: "number = 12",
        output: "3",
        explanation: "4 + 4 + 4; nothing shorter works.",
      },
      {
        input: "number = 13",
        output: "2",
        explanation: "9 + 4.",
      },
    ],
    tests: [
      { args: [12], expected: 3 },
      { args: [13], expected: 2 },
      { args: [0], expected: 0 },
      { args: [1], expected: 1, hidden: true },
      { args: [4], expected: 1, hidden: true },
      { args: [7], expected: 4, hidden: true },
      { args: [100], expected: 1, hidden: true },
      { args: [9999], expected: 4, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const fewest = new Array(number + 1).fill(number + 1);
fewest[0] = 0;
for (let v = 1; v <= number; v += 1) {
  for (let root = 1; root * root <= v; root += 1) {
    const candidate = fewest[v - root * root] + 1;
    if (candidate < fewest[v]) fewest[v] = candidate;
  }
}
return fewest[number];`,
      TYPESCRIPT: `const fewest: number[] = new Array(number + 1).fill(number + 1);
fewest[0] = 0;
for (let v = 1; v <= number; v += 1) {
  for (let root = 1; root * root <= v; root += 1) {
    const candidate = fewest[v - root * root] + 1;
    if (candidate < fewest[v]) fewest[v] = candidate;
  }
}
return fewest[number];`,
      PYTHON: `fewest = [number + 1] * (number + 1)
fewest[0] = 0
for v in range(1, number + 1):
    root = 1
    while root * root <= v:
        fewest[v] = min(fewest[v], fewest[v - root * root] + 1)
        root += 1
return fewest[number]`,
      JAVA: `int[] fewest = new int[number + 1];
Arrays.fill(fewest, number + 1);
fewest[0] = 0;
for (int v = 1; v <= number; v += 1) {
    for (int root = 1; root * root <= v; root += 1) {
        fewest[v] = Math.min(fewest[v], fewest[v - root * root] + 1);
    }
}
return fewest[number];`,
      CPP: `vector<int> fewest(number + 1, number + 1);
fewest[0] = 0;
for (int v = 1; v <= number; v += 1) {
    for (int root = 1; root * root <= v; root += 1) {
        fewest[v] = min(fewest[v], fewest[v - root * root] + 1);
    }
}
return fewest[number];`,
    },
  },
];
