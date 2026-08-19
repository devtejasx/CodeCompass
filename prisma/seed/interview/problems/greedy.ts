import type { SeedProblem } from "../../problems/types";

/**
 * Greedy choices.
 *
 * A greedy algorithm takes the best-looking step now and never reconsiders. It
 * is the shortest correct solution when it works and confidently wrong when it
 * does not, so every explanation here spends its second half on *why the step
 * is safe* rather than on the loop, which is usually three lines. Two arguments
 * recur: an exchange argument, which turns any optimal answer into the greedy
 * one without making it worse, and a reachability argument, where the greedy
 * quantity provably dominates every alternative at each step.
 *
 * The file also carries the counter-lesson. Handing out sweets looks like a
 * single greedy sweep and is not — one pass cannot satisfy a constraint that
 * points both ways — and it sits last so that the learner has seen enough
 * working greedy to feel the difference.
 *
 * These come before dynamic programming on purpose: half of learning DP is
 * recognising the problems where greedy already suffices.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const GREEDY_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "assign-cookies-to-children",
    title: "Hand Out the Cookies",
    difficulty: "EASY",
    interviewFrequency: "MEDIUM",
    description:
      "Each child will only be satisfied by a cookie at least as big as their " +
      "appetite, and each child gets at most one cookie. Given the children's " +
      "appetites and the cookie sizes, return the largest number of children you " +
      "can satisfy.",
    explanation:
      "Sort both lists and walk them together with two pointers. Offer the " +
      "smallest remaining cookie to the least demanding remaining child: if it " +
      "fits, both move on; if it does not, no child will accept it, so discard " +
      "it and keep the child. The exchange argument is short. Suppose an optimal " +
      "assignment satisfies the least demanding child with some larger cookie. " +
      "Swapping in the smallest cookie that fits them still satisfies them, and " +
      "frees a bigger cookie for someone else — so the answer never gets worse. " +
      "Repeat down the list and the greedy assignment is optimal.",
    constraints: [
      "Between 0 and 50,000 children and between 0 and 50,000 cookies.",
      "Appetites and sizes are between 1 and 1,000,000,000.",
      "A child accepts a cookie whose size is at least their appetite.",
    ],
    hints: [
      "Sort both lists first — the order they arrive in carries no information.",
      "Always try the smallest cookie on the least demanding unfed child.",
      "A cookie nobody currently unfed will take is a cookie nobody will ever take.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "assignCookiesToChildren",
      params: [
        { name: "appetites", type: "int[]" },
        { name: "sizes", type: "int[]" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-greedy", "dsa-sorting", "dsa-two-pointers"],
    examples: [
      {
        input: "appetites = [1, 2, 3], sizes = [1, 1]",
        output: "1",
        explanation: "Only the child with appetite 1 can be satisfied.",
      },
      {
        input: "appetites = [1, 2], sizes = [1, 2, 3]",
        output: "2",
        explanation: "There are enough cookies for both children.",
      },
    ],
    tests: [
      {
        args: [
          [1, 2, 3],
          [1, 1],
        ],
        expected: 1,
      },
      {
        args: [
          [1, 2],
          [1, 2, 3],
        ],
        expected: 2,
      },
      { args: [[5], [1, 2, 3]], expected: 0 },
      { args: [[], [1, 2]], expected: 0, hidden: true },
      { args: [[1, 1, 1], []], expected: 0, hidden: true },
      {
        args: [
          [10, 9, 8, 7],
          [5, 6, 7, 8],
        ],
        expected: 2,
        hidden: true,
      },
      {
        args: [
          [2, 2, 2],
          [2, 2, 2],
        ],
        expected: 3,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const children = [...appetites].sort((a, b) => a - b);
const cookies = [...sizes].sort((a, b) => a - b);
let child = 0;
let cookie = 0;
while (child < children.length && cookie < cookies.length) {
  if (cookies[cookie] >= children[child]) child += 1;
  cookie += 1;
}
return child;`,
      TYPESCRIPT: `const children = [...appetites].sort((a, b) => a - b);
const cookies = [...sizes].sort((a, b) => a - b);
let child = 0;
let cookie = 0;
while (child < children.length && cookie < cookies.length) {
  if (cookies[cookie] >= children[child]) child += 1;
  cookie += 1;
}
return child;`,
      PYTHON: `children = sorted(appetites)
cookies = sorted(sizes)
child = 0
cookie = 0
while child < len(children) and cookie < len(cookies):
    if cookies[cookie] >= children[child]:
        child += 1
    cookie += 1
return child`,
      JAVA: `int[] children = appetites.clone();
int[] cookies = sizes.clone();
Arrays.sort(children);
Arrays.sort(cookies);
int child = 0;
int cookie = 0;
while (child < children.length && cookie < cookies.length) {
    if (cookies[cookie] >= children[child]) child += 1;
    cookie += 1;
}
return child;`,
      CPP: `vector<int> children = appetites;
vector<int> cookies = sizes;
sort(children.begin(), children.end());
sort(cookies.begin(), cookies.end());
size_t child = 0, cookie = 0;
while (child < children.size() && cookie < cookies.size()) {
    if (cookies[cookie] >= children[child]) child += 1;
    cookie += 1;
}
return (int)child;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "plant-without-crowding",
    title: "Plant Without Crowding",
    difficulty: "EASY",
    interviewFrequency: "MEDIUM",
    description:
      "A flowerbed is a row of plots, each 1 if planted and 0 if empty. No two " +
      "planted plots may be adjacent. Given the bed and a number of new flowers, " +
      "report whether they can all be planted without breaking that rule.",
    explanation:
      "Sweep left to right and plant in the first empty plot whose neighbours are " +
      "also empty — treating the ends of the bed as empty, since there is no plot " +
      "there to crowd. Planting as early as possible is safe: a flower placed at " +
      "the leftmost legal plot blocks only the plot to its right, whereas any " +
      "later choice blocks a plot to its left as well without freeing anything. " +
      "So the early choice never rules out a placement the later choice would " +
      "have allowed. Mark each planted plot as you go — the sweep has to see its " +
      "own work, or two flowers land side by side in a long run of zeros. Stop " +
      "as soon as enough are planted.",
    constraints: [
      "The bed has between 1 and 20,000 plots.",
      "Every plot is 0 or 1, and no two 1s start out adjacent.",
      "The number of flowers to plant is between 0 and the number of plots.",
    ],
    hints: [
      "Planting at the earliest legal plot never costs you a later one.",
      "The ends of the bed have no neighbour on the outside — treat that as empty.",
      "Record each planting immediately, or the next plot will not know about it.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "plantWithoutCrowding",
      params: [
        { name: "bed", type: "int[]" },
        { name: "flowers", type: "int" },
      ],
      returns: "bool",
    },
    topicSlugs: ["dsa-greedy", "js-arrays", "js-loops"],
    examples: [
      {
        input: "bed = [1, 0, 0, 0, 1], flowers = 1",
        output: "true",
        explanation: "The middle plot is free and neither neighbour is planted.",
      },
      {
        input: "bed = [1, 0, 0, 0, 1], flowers = 2",
        output: "false",
        explanation: "Only one plot in that gap can ever be used.",
      },
    ],
    tests: [
      { args: [[1, 0, 0, 0, 1], 1], expected: true },
      { args: [[1, 0, 0, 0, 1], 2], expected: false },
      { args: [[0, 0, 0], 2], expected: true },
      { args: [[0], 1], expected: true, hidden: true },
      { args: [[1], 1], expected: false, hidden: true },
      { args: [[0, 0], 1], expected: true, hidden: true },
      { args: [[0, 0], 2], expected: false, hidden: true },
      { args: [[1, 0, 1, 0, 1], 0], expected: true, hidden: true },
      { args: [[0, 0, 1, 0, 0], 2], expected: true, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const plots = [...bed];
let planted = 0;
for (let i = 0; i < plots.length && planted < flowers; i += 1) {
  const leftFree = i === 0 || plots[i - 1] === 0;
  const rightFree = i === plots.length - 1 || plots[i + 1] === 0;
  if (plots[i] === 0 && leftFree && rightFree) {
    plots[i] = 1;
    planted += 1;
  }
}
return planted >= flowers;`,
      TYPESCRIPT: `const plots = [...bed];
let planted = 0;
for (let i = 0; i < plots.length && planted < flowers; i += 1) {
  const leftFree = i === 0 || plots[i - 1] === 0;
  const rightFree = i === plots.length - 1 || plots[i + 1] === 0;
  if (plots[i] === 0 && leftFree && rightFree) {
    plots[i] = 1;
    planted += 1;
  }
}
return planted >= flowers;`,
      PYTHON: `plots = list(bed)
planted = 0
for i in range(len(plots)):
    if planted >= flowers:
        break
    left_free = i == 0 or plots[i - 1] == 0
    right_free = i == len(plots) - 1 or plots[i + 1] == 0
    if plots[i] == 0 and left_free and right_free:
        plots[i] = 1
        planted += 1
return planted >= flowers`,
      JAVA: `int[] plots = bed.clone();
int planted = 0;
for (int i = 0; i < plots.length && planted < flowers; i += 1) {
    boolean leftFree = i == 0 || plots[i - 1] == 0;
    boolean rightFree = i == plots.length - 1 || plots[i + 1] == 0;
    if (plots[i] == 0 && leftFree && rightFree) {
        plots[i] = 1;
        planted += 1;
    }
}
return planted >= flowers;`,
      CPP: `vector<int> plots = bed;
int planted = 0;
for (int i = 0; i < (int)plots.size() && planted < flowers; i += 1) {
    bool leftFree = i == 0 || plots[i - 1] == 0;
    bool rightFree = i == (int)plots.size() - 1 || plots[i + 1] == 0;
    if (plots[i] == 0 && leftFree && rightFree) {
        plots[i] = 1;
        planted += 1;
    }
}
return planted >= flowers;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "can-reach-the-end",
    title: "Can You Reach the End?",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "You start on the first square of a row. The number written on a square is " +
      "the furthest you may jump forwards from it — you may jump any distance up " +
      "to that. Report whether the last square is reachable.",
    explanation:
      "The tempting approach is to search every sequence of jumps, which is " +
      "exponential and unnecessary. Track one number instead: the furthest index " +
      "reachable so far. Walk left to right, and at each square first check that " +
      "the square is reachable at all — if the index has already passed the " +
      "furthest reach, there is a gap nothing can cross and the answer is no. " +
      "Otherwise widen the reach to the larger of itself and index + jump. This " +
      "works because reachability is downward closed: if you can land on index i " +
      "you can land on everything before it, so a single frontier describes the " +
      "whole reachable set. Reaching or passing the last index at any point " +
      "means yes.",
    constraints: [
      "The row holds between 1 and 100,000 squares.",
      "Each written number is between 0 and 100,000.",
      "A row of one square is already finished, so the answer is yes.",
    ],
    hints: [
      "You never need to know *which* jumps were taken, only how far you can get.",
      "Carry one number: the furthest index reached so far.",
      "If the loop index ever passes that frontier, there is an uncrossable gap.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "canReachTheEnd",
      params: [{ name: "jumps", type: "int[]" }],
      returns: "bool",
    },
    topicSlugs: ["dsa-greedy", "js-arrays", "js-loops"],
    examples: [
      {
        input: "jumps = [2, 3, 1, 1, 4]",
        output: "true",
        explanation: "Jump one to index 1, then four to the end.",
      },
      {
        input: "jumps = [3, 2, 1, 0, 4]",
        output: "false",
        explanation: "Every route lands on the 0 at index 3 and stops there.",
      },
    ],
    tests: [
      { args: [[2, 3, 1, 1, 4]], expected: true },
      { args: [[3, 2, 1, 0, 4]], expected: false },
      { args: [[0]], expected: true },
      { args: [[1, 0]], expected: true, hidden: true },
      { args: [[0, 1]], expected: false, hidden: true },
      { args: [[2, 0, 0]], expected: true, hidden: true },
      { args: [[1, 1, 1, 1, 1]], expected: true, hidden: true },
      { args: [[5, 0, 0, 0, 0, 0]], expected: true, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let reach = 0;
for (let i = 0; i < jumps.length; i += 1) {
  if (i > reach) return false;
  if (i + jumps[i] > reach) reach = i + jumps[i];
}
return true;`,
      TYPESCRIPT: `let reach = 0;
for (let i = 0; i < jumps.length; i += 1) {
  if (i > reach) return false;
  if (i + jumps[i] > reach) reach = i + jumps[i];
}
return true;`,
      PYTHON: `reach = 0
for i, jump in enumerate(jumps):
    if i > reach:
        return False
    reach = max(reach, i + jump)
return True`,
      JAVA: `int reach = 0;
for (int i = 0; i < jumps.length; i += 1) {
    if (i > reach) return false;
    reach = Math.max(reach, i + jumps[i]);
}
return true;`,
      CPP: `long long reach = 0;
for (int i = 0; i < (int)jumps.size(); i += 1) {
    if (i > reach) return false;
    reach = max(reach, (long long)i + jumps[i]);
}
return true;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "fewest-jumps-to-the-end",
    title: "Fewest Jumps to the End",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Same row of squares, and the last one is guaranteed reachable. Return the " +
      "smallest number of jumps needed to get from the first square to the last.",
    explanation:
      "Think in levels, exactly like a breadth-first search but without the " +
      "queue. Everything reachable in one jump forms a stretch of the row; " +
      "everything reachable in two jumps forms the next stretch, and so on. So " +
      "carry two frontiers: the end of the current level, and the furthest index " +
      "any square in the current level can reach. Sweep forwards widening the " +
      "second; when the index arrives at the end of the current level, one jump " +
      "has been spent and the next level runs to the furthest reach. Stop the " +
      "sweep before the last index — arriving there costs nothing more — which " +
      "also prevents counting a phantom extra jump at the finish.",
    constraints: [
      "The row holds between 1 and 10,000 squares.",
      "Each written number is between 0 and 1,000.",
      "The last square is always reachable.",
    ],
    hints: [
      "Group the squares by how many jumps it takes to reach them.",
      "Track where the current group ends and how far the whole group can reach.",
      "Do not step onto the last index in the loop, or you will count one jump too many.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "fewestJumpsToTheEnd",
      params: [{ name: "jumps", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-greedy", "js-arrays", "js-loops"],
    examples: [
      {
        input: "jumps = [2, 3, 1, 1, 4]",
        output: "2",
        explanation: "One jump to index 1, then a jump of four straight to the end.",
      },
      {
        input: "jumps = [1, 1, 1]",
        output: "2",
        explanation: "Only single steps are available, so it takes two of them.",
      },
    ],
    tests: [
      { args: [[2, 3, 1, 1, 4]], expected: 2 },
      { args: [[1, 1, 1]], expected: 2 },
      { args: [[7]], expected: 0 },
      { args: [[1, 2]], expected: 1, hidden: true },
      { args: [[2, 1]], expected: 1, hidden: true },
      { args: [[1, 1, 1, 1, 1, 1]], expected: 5, hidden: true },
      { args: [[5, 1, 1, 1, 1, 1]], expected: 1, hidden: true },
      { args: [[2, 3, 0, 1, 4]], expected: 2, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let steps = 0;
let levelEnd = 0;
let furthest = 0;
for (let i = 0; i < jumps.length - 1; i += 1) {
  if (i + jumps[i] > furthest) furthest = i + jumps[i];
  if (i === levelEnd) {
    steps += 1;
    levelEnd = furthest;
  }
}
return steps;`,
      TYPESCRIPT: `let steps = 0;
let levelEnd = 0;
let furthest = 0;
for (let i = 0; i < jumps.length - 1; i += 1) {
  if (i + jumps[i] > furthest) furthest = i + jumps[i];
  if (i === levelEnd) {
    steps += 1;
    levelEnd = furthest;
  }
}
return steps;`,
      PYTHON: `steps = 0
level_end = 0
furthest = 0
for i in range(len(jumps) - 1):
    furthest = max(furthest, i + jumps[i])
    if i == level_end:
        steps += 1
        level_end = furthest
return steps`,
      JAVA: `int steps = 0;
int levelEnd = 0;
int furthest = 0;
for (int i = 0; i < jumps.length - 1; i += 1) {
    furthest = Math.max(furthest, i + jumps[i]);
    if (i == levelEnd) {
        steps += 1;
        levelEnd = furthest;
    }
}
return steps;`,
      CPP: `int steps = 0;
int levelEnd = 0;
int furthest = 0;
for (int i = 0; i + 1 < (int)jumps.size(); i += 1) {
    furthest = max(furthest, i + jumps[i]);
    if (i == levelEnd) {
        steps += 1;
        levelEnd = furthest;
    }
}
return steps;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "complete-the-fuel-loop",
    title: "Complete the Fuel Loop",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Stations sit around a circular route. Station i offers fuel[i] units, and " +
      "driving from it to the next station costs cost[i]. Starting empty at some " +
      "station, return the index you must start from to get all the way round, " +
      "or -1 if no start works. At most one start can succeed.",
    explanation:
      "Two observations solve it in one pass. First, if the total fuel is less " +
      "than the total cost the loop is impossible, and if it is not less then " +
      "some start does work — so a single sum settles whether the answer is -1. " +
      "Second, if you run dry partway between start s and station i, then no " +
      "station between them works either: each of those was reached with " +
      "non-negative fuel in hand, so starting there empty can only be worse. " +
      "That lets you skip the whole stretch and restart the candidate at i + 1 " +
      "rather than at s + 1. One sweep accumulates the running tank, resets it " +
      "to zero whenever it goes negative, and moves the candidate — O(n) with no " +
      "wrap-around simulation at all.",
    constraints: [
      "Between 1 and 100,000 stations.",
      "Fuel offered and travel costs are between 0 and 100,000.",
      "At most one starting station can complete the loop.",
    ],
    hints: [
      "Compare the total fuel with the total cost before anything else.",
      "If you run dry going from s to i, every station in between also fails.",
      "So the next candidate start is i + 1, not s + 1.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "completeTheFuelLoop",
      params: [
        { name: "fuel", type: "int[]" },
        { name: "cost", type: "int[]" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-greedy", "dsa-prefix-sum", "js-arrays"],
    examples: [
      {
        input: "fuel = [1, 2, 3, 4, 5], cost = [3, 4, 5, 1, 2]",
        output: "3",
        explanation:
          "Starting at index 3 you gain 4 against a cost of 1 and never run dry.",
      },
      {
        input: "fuel = [2, 3, 4], cost = [3, 4, 3]",
        output: "-1",
        explanation: "Total fuel is 9 against a total cost of 10, so it is impossible.",
      },
    ],
    tests: [
      {
        args: [
          [1, 2, 3, 4, 5],
          [3, 4, 5, 1, 2],
        ],
        expected: 3,
      },
      {
        args: [
          [2, 3, 4],
          [3, 4, 3],
        ],
        expected: -1,
      },
      { args: [[5], [4]], expected: 0 },
      { args: [[3], [5]], expected: -1, hidden: true },
      {
        args: [
          [1, 1, 1],
          [1, 1, 1],
        ],
        expected: 0,
        hidden: true,
      },
      {
        args: [
          [5, 1, 2, 3, 4],
          [4, 4, 1, 5, 1],
        ],
        expected: 4,
        hidden: true,
      },
      {
        args: [
          [0, 0, 0],
          [0, 0, 1],
        ],
        expected: -1,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `let total = 0;
let tank = 0;
let start = 0;
for (let i = 0; i < fuel.length; i += 1) {
  const gain = fuel[i] - cost[i];
  total += gain;
  tank += gain;
  if (tank < 0) {
    start = i + 1;
    tank = 0;
  }
}
return total < 0 ? -1 : start;`,
      TYPESCRIPT: `let total = 0;
let tank = 0;
let start = 0;
for (let i = 0; i < fuel.length; i += 1) {
  const gain = fuel[i] - cost[i];
  total += gain;
  tank += gain;
  if (tank < 0) {
    start = i + 1;
    tank = 0;
  }
}
return total < 0 ? -1 : start;`,
      PYTHON: `total = 0
tank = 0
start = 0
for i in range(len(fuel)):
    gain = fuel[i] - cost[i]
    total += gain
    tank += gain
    if tank < 0:
        start = i + 1
        tank = 0
return -1 if total < 0 else start`,
      JAVA: `long total = 0;
long tank = 0;
int start = 0;
for (int i = 0; i < fuel.length; i += 1) {
    int gain = fuel[i] - cost[i];
    total += gain;
    tank += gain;
    if (tank < 0) {
        start = i + 1;
        tank = 0;
    }
}
return total < 0 ? -1 : start;`,
      CPP: `long long total = 0;
long long tank = 0;
int start = 0;
for (int i = 0; i < (int)fuel.size(); i += 1) {
    int gain = fuel[i] - cost[i];
    total += gain;
    tank += gain;
    if (tank < 0) {
        start = i + 1;
        tank = 0;
    }
}
return total < 0 ? -1 : start;`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "split-into-single-letter-blocks",
    title: "Split So No Letter Is Shared",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Cut the text into as many pieces as possible so that no letter appears in " +
      "more than one piece. Joining the pieces back in order must reproduce the " +
      "text. Return the lengths of the pieces, in order.",
    explanation:
      "A piece cannot end before the last occurrence of every letter it contains, " +
      "so record where each letter last appears — one pass over the text. Then " +
      "sweep again, carrying the furthest last-occurrence seen inside the current " +
      "piece. When the sweep index reaches that furthest position, no letter in " +
      "the piece appears later, so the piece can be closed — and closing it as " +
      "early as legally possible is what makes the number of pieces maximal, " +
      "since any later cut would merge two valid pieces into one. Record the " +
      "length, start the next piece, and continue. Two linear passes and a " +
      "26-entry table.",
    constraints: [
      "The text holds between 1 and 100,000 lowercase letters.",
      "Every letter of the text must appear in exactly one piece.",
      "The pieces are returned as lengths, in left-to-right order.",
    ],
    hints: [
      "A piece must extend at least to the last occurrence of every letter it holds.",
      "Record the last position of each letter before you start cutting.",
      "Close the piece the moment the sweep reaches the furthest last position.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "splitIntoSingleLetterBlocks",
      params: [{ name: "text", type: "string" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-greedy", "dsa-hashing", "dsa-strings"],
    examples: [
      {
        input: 'text = "ababcbacadefegdehijhklij"',
        output: "[9, 7, 8]",
        explanation:
          "The first nine characters hold every a, b and c; the next seven hold every d, e, f and g.",
      },
      {
        input: 'text = "abc"',
        output: "[1, 1, 1]",
        explanation: "No letter repeats, so every character is its own piece.",
      },
    ],
    tests: [
      { args: ["ababcbacadefegdehijhklij"], expected: [9, 7, 8] },
      { args: ["abc"], expected: [1, 1, 1] },
      { args: ["aaa"], expected: [3] },
      { args: ["a"], expected: [1], hidden: true },
      { args: ["abab"], expected: [4], hidden: true },
      { args: ["abcabc"], expected: [6], hidden: true },
      { args: ["eccbbbbdec"], expected: [10], hidden: true },
      { args: ["qiejxqfnqceocmy"], expected: [13, 1, 1], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const lastSeen = new Map();
for (let i = 0; i < text.length; i += 1) lastSeen.set(text[i], i);

const lengths = [];
let start = 0;
let furthest = 0;
for (let i = 0; i < text.length; i += 1) {
  const last = lastSeen.get(text[i]);
  if (last > furthest) furthest = last;
  if (i === furthest) {
    lengths.push(i - start + 1);
    start = i + 1;
  }
}
return lengths;`,
      TYPESCRIPT: `const lastSeen = new Map<string, number>();
for (let i = 0; i < text.length; i += 1) lastSeen.set(text[i], i);

const lengths: number[] = [];
let start = 0;
let furthest = 0;
for (let i = 0; i < text.length; i += 1) {
  const last = lastSeen.get(text[i]) as number;
  if (last > furthest) furthest = last;
  if (i === furthest) {
    lengths.push(i - start + 1);
    start = i + 1;
  }
}
return lengths;`,
      PYTHON: `last_seen = {letter: i for i, letter in enumerate(text)}

lengths = []
start = 0
furthest = 0
for i, letter in enumerate(text):
    furthest = max(furthest, last_seen[letter])
    if i == furthest:
        lengths.append(i - start + 1)
        start = i + 1
return lengths`,
      JAVA: `int[] lastSeen = new int[26];
for (int i = 0; i < text.length(); i += 1) lastSeen[text.charAt(i) - 'a'] = i;

List<Integer> lengths = new ArrayList<>();
int start = 0;
int furthest = 0;
for (int i = 0; i < text.length(); i += 1) {
    furthest = Math.max(furthest, lastSeen[text.charAt(i) - 'a']);
    if (i == furthest) {
        lengths.add(i - start + 1);
        start = i + 1;
    }
}
int[] answer = new int[lengths.size()];
for (int i = 0; i < answer.length; i += 1) answer[i] = lengths.get(i);
return answer;`,
      CPP: `vector<int> lastSeen(26, 0);
for (int i = 0; i < (int)text.size(); i += 1) lastSeen[text[i] - 'a'] = i;

vector<int> lengths;
int start = 0;
int furthest = 0;
for (int i = 0; i < (int)text.size(); i += 1) {
    furthest = max(furthest, lastSeen[text[i] - 'a']);
    if (i == furthest) {
        lengths.push_back(i - start + 1);
        start = i + 1;
    }
}
return lengths;`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "schedule-with-cooldown",
    title: "Schedule With a Cooldown",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Each task takes one time unit, and two runs of the same task must be " +
      "separated by at least the given cooldown. Idle time units are allowed. " +
      "Return the shortest total time in which every task can be run.",
    explanation:
      "Only the most frequent task can force idling, so build the schedule " +
      "around it. If it runs m times it creates m - 1 gaps, each of which must " +
      "span the cooldown plus the task itself, giving a skeleton of " +
      "(m - 1) × (cooldown + 1) time units, plus one final run for each task " +
      "tied at that frequency. Every other task is rarer, so it can be slotted " +
      "into the gaps without lengthening the skeleton. The only way that " +
      "estimate can be wrong is when there are so many distinct tasks that the " +
      "gaps all fill up and no idling happens at all — in which case the answer " +
      "is simply the number of tasks. Taking the larger of the two covers both, " +
      "so the whole thing is a frequency count and one formula.",
    constraints: [
      "Between 1 and 100,000 tasks, each identified by a small integer.",
      "Task identifiers are between 0 and 25.",
      "The cooldown is between 0 and 100.",
    ],
    hints: [
      "Only the most frequent task can force you to idle — build around it.",
      "m runs of that task create m - 1 gaps that must each hold the cooldown.",
      "With enough distinct tasks nothing idles, so the answer cannot fall below the task count.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "scheduleWithCooldown",
      params: [
        { name: "tasks", type: "int[]" },
        { name: "cooldown", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-greedy", "dsa-hashing", "js-arrays"],
    examples: [
      {
        input: "tasks = [0, 0, 0, 1, 1, 1], cooldown = 2",
        output: "8",
        explanation:
          "Three runs of task 0 leave two gaps of three units each, plus a final task 1.",
      },
      {
        input: "tasks = [0, 0, 0, 1, 1, 1], cooldown = 0",
        output: "6",
        explanation: "With no cooldown there is never a reason to idle.",
      },
    ],
    tests: [
      { args: [[0, 0, 0, 1, 1, 1], 2], expected: 8 },
      { args: [[0, 0, 0, 1, 1, 1], 0], expected: 6 },
      { args: [[0], 5], expected: 1 },
      { args: [[0, 0], 3], expected: 5, hidden: true },
      { args: [[0, 1, 2, 3, 4], 2], expected: 5, hidden: true },
      {
        args: [[0, 0, 0, 0, 1, 2, 3, 4], 2],
        expected: 10,
        hidden: true,
      },
      { args: [[0, 0, 1, 1, 2, 2], 2], expected: 6, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const counts = new Map();
for (const task of tasks) counts.set(task, (counts.get(task) ?? 0) + 1);

let busiest = 0;
for (const count of counts.values()) if (count > busiest) busiest = count;

let tied = 0;
for (const count of counts.values()) if (count === busiest) tied += 1;

const skeleton = (busiest - 1) * (cooldown + 1) + tied;
return Math.max(tasks.length, skeleton);`,
      TYPESCRIPT: `const counts = new Map<number, number>();
for (const task of tasks) counts.set(task, (counts.get(task) ?? 0) + 1);

let busiest = 0;
for (const count of counts.values()) if (count > busiest) busiest = count;

let tied = 0;
for (const count of counts.values()) if (count === busiest) tied += 1;

const skeleton = (busiest - 1) * (cooldown + 1) + tied;
return Math.max(tasks.length, skeleton);`,
      PYTHON: `counts = {}
for task in tasks:
    counts[task] = counts.get(task, 0) + 1

busiest = max(counts.values())
tied = sum(1 for count in counts.values() if count == busiest)

skeleton = (busiest - 1) * (cooldown + 1) + tied
return max(len(tasks), skeleton)`,
      JAVA: `Map<Integer, Integer> counts = new HashMap<>();
for (int task : tasks) counts.merge(task, 1, Integer::sum);

int busiest = 0;
for (int count : counts.values()) busiest = Math.max(busiest, count);

int tied = 0;
for (int count : counts.values()) if (count == busiest) tied += 1;

int skeleton = (busiest - 1) * (cooldown + 1) + tied;
return Math.max(tasks.length, skeleton);`,
      CPP: `unordered_map<int, int> counts;
for (int task : tasks) counts[task] += 1;

int busiest = 0;
for (const auto& entry : counts) busiest = max(busiest, entry.second);

int tied = 0;
for (const auto& entry : counts) if (entry.second == busiest) tied += 1;

int skeleton = (busiest - 1) * (cooldown + 1) + tied;
return max((int)tasks.size(), skeleton);`,
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "sweets-for-the-class",
    title: "Sweets for the Class",
    difficulty: "HARD",
    interviewFrequency: "HIGH",
    description:
      "Children sit in a row, each with a score. Every child must get at least " +
      "one sweet, and any child scoring higher than the neighbour beside them " +
      "must get more sweets than that neighbour. Return the smallest total number " +
      "of sweets that satisfies both rules.",
    explanation:
      "This looks greedy and defeats a single greedy sweep, which is exactly why " +
      "it is here. The constraint points both ways: a child must beat their left " +
      "neighbour *and* their right one, and a left-to-right sweep cannot know " +
      "about a descent that has not happened yet. The fix is to satisfy one " +
      "direction at a time. Give everybody one sweet. Sweep left to right, and " +
      "wherever a score rises, set that child to one more than the child before. " +
      "Sweep right to left doing the same for falling scores, but take the " +
      "*larger* of the existing count and the new requirement, so the first " +
      "sweep's work is never undone. Both rules now hold, and because every " +
      "increase was the minimum one forced by a neighbour, the total is minimal. " +
      "Two passes in opposite directions is the standard answer to a constraint " +
      "that reaches both ways.",
    constraints: [
      "Between 1 and 50,000 children.",
      "Scores are between 0 and 100,000.",
      "Children with equal scores have no requirement between them.",
    ],
    hints: [
      "One left-to-right sweep cannot work — the rule also points right to left.",
      "Start everyone at one sweet, then fix the rising runs, then the falling ones.",
      "On the second sweep take the larger of what is there and what is now required.",
    ],
    estimatedTime: "40 min",
    signature: {
      name: "sweetsForTheClass",
      params: [{ name: "scores", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-greedy", "js-arrays", "js-loops"],
    examples: [
      {
        input: "scores = [1, 0, 2]",
        output: "5",
        explanation: "Two, one and two sweets satisfies both neighbours.",
      },
      {
        input: "scores = [1, 2, 2]",
        output: "4",
        explanation:
          "One, two and one — the equal pair at the end imposes no requirement.",
      },
    ],
    tests: [
      { args: [[1, 0, 2]], expected: 5 },
      { args: [[1, 2, 2]], expected: 4 },
      { args: [[1]], expected: 1 },
      { args: [[5, 5, 5]], expected: 3, hidden: true },
      { args: [[1, 2, 3, 4]], expected: 10, hidden: true },
      { args: [[4, 3, 2, 1]], expected: 10, hidden: true },
      { args: [[1, 3, 2, 2, 1]], expected: 7, hidden: true },
      { args: [[1, 2, 87, 87, 87, 2, 1]], expected: 13, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const sweets = new Array(scores.length).fill(1);
for (let i = 1; i < scores.length; i += 1) {
  if (scores[i] > scores[i - 1]) sweets[i] = sweets[i - 1] + 1;
}
for (let i = scores.length - 2; i >= 0; i -= 1) {
  if (scores[i] > scores[i + 1] && sweets[i] <= sweets[i + 1]) {
    sweets[i] = sweets[i + 1] + 1;
  }
}
let total = 0;
for (const count of sweets) total += count;
return total;`,
      TYPESCRIPT: `const sweets: number[] = new Array(scores.length).fill(1);
for (let i = 1; i < scores.length; i += 1) {
  if (scores[i] > scores[i - 1]) sweets[i] = sweets[i - 1] + 1;
}
for (let i = scores.length - 2; i >= 0; i -= 1) {
  if (scores[i] > scores[i + 1] && sweets[i] <= sweets[i + 1]) {
    sweets[i] = sweets[i + 1] + 1;
  }
}
let total = 0;
for (const count of sweets) total += count;
return total;`,
      PYTHON: `sweets = [1] * len(scores)
for i in range(1, len(scores)):
    if scores[i] > scores[i - 1]:
        sweets[i] = sweets[i - 1] + 1
for i in range(len(scores) - 2, -1, -1):
    if scores[i] > scores[i + 1]:
        sweets[i] = max(sweets[i], sweets[i + 1] + 1)
return sum(sweets)`,
      JAVA: `int[] sweets = new int[scores.length];
Arrays.fill(sweets, 1);
for (int i = 1; i < scores.length; i += 1) {
    if (scores[i] > scores[i - 1]) sweets[i] = sweets[i - 1] + 1;
}
for (int i = scores.length - 2; i >= 0; i -= 1) {
    if (scores[i] > scores[i + 1]) sweets[i] = Math.max(sweets[i], sweets[i + 1] + 1);
}
int total = 0;
for (int count : sweets) total += count;
return total;`,
      CPP: `vector<int> sweets(scores.size(), 1);
for (int i = 1; i < (int)scores.size(); i += 1) {
    if (scores[i] > scores[i - 1]) sweets[i] = sweets[i - 1] + 1;
}
for (int i = (int)scores.size() - 2; i >= 0; i -= 1) {
    if (scores[i] > scores[i + 1]) sweets[i] = max(sweets[i], sweets[i + 1] + 1);
}
int total = 0;
for (int count : sweets) total += count;
return total;`,
    },
  },
];
