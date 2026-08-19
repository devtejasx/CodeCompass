import type { SeedProblem } from "../../problems/types";

/**
 * Backtracking.
 *
 * Recursion plus undo. Every problem here is the same loop — choose, recurse,
 * un-choose — and what varies is only the pruning: which choices are refused
 * before the recursion is entered. That is deliberate, because the honest
 * summary of backtracking in an interview is "the search is exponential and the
 * skill is cutting branches off it early".
 *
 * Results are returned in a stated order rather than "any order", so the
 * problems can be graded. The order chosen is plain lexicographic — compare
 * entry by entry, and a list that runs out first comes first — because it is
 * what Python's and C++'s default list comparison already do, which keeps the
 * reference solutions honest rather than sorted into agreement afterwards.
 *
 * Duplicate handling is the recurring subtlety and appears three times: sorting
 * first so equal values are adjacent, then skipping an equal sibling at the
 * same depth. It is worth meeting more than once because it is the part
 * candidates reliably get wrong.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const BACKTRACKING_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "every-subset",
    title: "Every Subset",
    difficulty: "EASY",
    interviewFrequency: "VERY_HIGH",
    description:
      "Return every subset of the given distinct values, including the empty " +
      "one and the whole list. Sort the values first, then return the subsets " +
      "sorted: compare them entry by entry, and a subset that runs out first " +
      "comes first.",
    explanation:
      "Each value faces one binary decision — in or out — so there are 2^n " +
      "subsets and no algorithm can beat simply producing them. The shape that " +
      "gets them out in order is not two recursive calls per value but a loop: " +
      "record the partial subset as soon as you arrive, then for each remaining " +
      "value take it, recurse from the *next* index, and un-take it. Starting " +
      "the loop after the value just taken is what stops [1,2] reappearing as " +
      "[2,1], and because the values were sorted the results come out compared " +
      "entry by entry with no final sort. The copy on recording matters: the " +
      "partial keeps being mutated all the way back up, so storing a reference " +
      "gives 2^n identical results, and that bug is why 'choose, recurse, " +
      "un-choose' is written as three separate lines.",
    constraints: [
      "Between 0 and 12 values, all distinct.",
      "Values are between -1,000 and 1,000.",
      "The answer holds 2^n subsets in the stated order.",
    ],
    hints: [
      "Every value is one yes-or-no decision, so there are 2^n answers.",
      "Record the partial subset on arrival, then loop over the values still to the right.",
      "Record a *copy* — the partial subset keeps changing after you store it.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "everySubset",
      params: [{ name: "values", type: "int[]" }],
      returns: "int[][]",
    },
    topicSlugs: ["dsa-backtracking", "dsa-recursion", "js-arrays"],
    examples: [
      {
        input: "values = [1, 2]",
        output: "[[], [1], [1, 2], [2]]",
        explanation:
          "Four subsets, ordered by comparing entries — the empty one runs out immediately, so it is first.",
      },
      {
        input: "values = [0]",
        output: "[[], [0]]",
        explanation: "One value gives two subsets.",
      },
    ],
    tests: [
      {
        args: [[1, 2]],
        expected: [[], [1], [1, 2], [2]],
      },
      { args: [[0]], expected: [[], [0]] },
      { args: [[]], expected: [[]] },
      {
        args: [[1, 2, 3]],
        expected: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]],
        hidden: true,
      },
      {
        args: [[3, 1]],
        expected: [[], [1], [1, 3], [3]],
        hidden: true,
      },
      {
        args: [[-1, 5]],
        expected: [[], [-1], [-1, 5], [5]],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const sorted = [...values].sort((a, b) => a - b);
const subsets = [];
const partial = [];

function explore(start) {
  subsets.push([...partial]);
  for (let i = start; i < sorted.length; i += 1) {
    partial.push(sorted[i]);
    explore(i + 1);
    partial.pop();
  }
}

explore(0);
return subsets;`,
      TYPESCRIPT: `const sorted = [...values].sort((a, b) => a - b);
const subsets: number[][] = [];
const partial: number[] = [];

function explore(start: number): void {
  subsets.push([...partial]);
  for (let i = start; i < sorted.length; i += 1) {
    partial.push(sorted[i]);
    explore(i + 1);
    partial.pop();
  }
}

explore(0);
return subsets;`,
      PYTHON: `sorted_values = sorted(values)
subsets = []
partial = []

def explore(start):
    subsets.append(list(partial))
    for i in range(start, len(sorted_values)):
        partial.append(sorted_values[i])
        explore(i + 1)
        partial.pop()

explore(0)
return subsets`,
      JAVA: `int[] sorted = values.clone();
Arrays.sort(sorted);
List<int[]> subsets = new ArrayList<>();
List<Integer> partial = new ArrayList<>();

class Search {
    void explore(int start) {
        int[] copy = new int[partial.size()];
        for (int i = 0; i < copy.length; i += 1) copy[i] = partial.get(i);
        subsets.add(copy);
        for (int i = start; i < sorted.length; i += 1) {
            partial.add(sorted[i]);
            explore(i + 1);
            partial.remove(partial.size() - 1);
        }
    }
}

new Search().explore(0);
return subsets.toArray(new int[0][]);`,
      CPP: `vector<int> sorted = values;
sort(sorted.begin(), sorted.end());
vector<vector<int>> subsets;
vector<int> partial;

function<void(int)> explore = [&](int start) {
    subsets.push_back(partial);
    for (int i = start; i < (int)sorted.size(); i += 1) {
        partial.push_back(sorted[i]);
        explore(i + 1);
        partial.pop_back();
    }
};

explore(0);
return subsets;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "subsets-with-repeats",
    title: "Subsets When Values Repeat",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "The values may repeat. Return every distinct subset — two subsets holding " +
      "the same multiset of values count as one. Sort the values first, and " +
      "return the subsets compared entry by entry, a shorter run-out coming " +
      "first.",
    explanation:
      "Generating everything and de-duplicating afterwards works and is the " +
      "answer an interviewer will push back on, because the search itself can " +
      "avoid ever producing a duplicate. Sort first so equal values sit " +
      "together, then build subsets by choosing a *starting point* and extending: " +
      "at each level, loop over the remaining values, take one, recurse from the " +
      "next index, and un-take it. The single extra rule is that within one " +
      "level, a value equal to the one just tried is skipped. That is precise " +
      "about what causes duplication — picking the second of two equal values as " +
      "the first choice at a given depth reproduces the branch the first one " +
      "already covered — while still allowing both to appear together deeper in, " +
      "because that is a different index, not a repeated sibling.",
    constraints: [
      "Between 0 and 12 values.",
      "Values are between -10 and 10 and may repeat.",
      "Two subsets are the same when they hold the same values with the same counts.",
    ],
    hints: [
      "Sort first, so equal values become neighbours.",
      "At each level, loop over the remaining values rather than deciding in or out.",
      "Skip a value equal to the previous one *at the same level* — but not deeper down.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "subsetsWithRepeats",
      params: [{ name: "values", type: "int[]" }],
      returns: "int[][]",
    },
    topicSlugs: ["dsa-backtracking", "dsa-sorting", "js-arrays"],
    examples: [
      {
        input: "values = [1, 2, 2]",
        output: "[[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]",
        explanation: "Only one [1,2] appears, even though either 2 could have made it.",
      },
      {
        input: "values = [0]",
        output: "[[], [0]]",
        explanation: "Nothing repeats, so this behaves like the previous problem.",
      },
    ],
    tests: [
      {
        args: [[1, 2, 2]],
        expected: [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]],
      },
      { args: [[0]], expected: [[], [0]] },
      { args: [[]], expected: [[]] },
      {
        args: [[2, 2, 2]],
        expected: [[], [2], [2, 2], [2, 2, 2]],
        hidden: true,
      },
      {
        args: [[4, 4, 1, 1]],
        expected: [[], [1], [1, 1], [1, 1, 4], [1, 1, 4, 4], [1, 4], [1, 4, 4], [4], [4, 4]],
        hidden: true,
      },
      {
        args: [[-1, -1]],
        expected: [[], [-1], [-1, -1]],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const sorted = [...values].sort((a, b) => a - b);
const subsets = [];
const partial = [];

function explore(start) {
  subsets.push([...partial]);
  for (let i = start; i < sorted.length; i += 1) {
    if (i > start && sorted[i] === sorted[i - 1]) continue;
    partial.push(sorted[i]);
    explore(i + 1);
    partial.pop();
  }
}

explore(0);
return subsets;`,
      TYPESCRIPT: `const sorted = [...values].sort((a, b) => a - b);
const subsets: number[][] = [];
const partial: number[] = [];

function explore(start: number): void {
  subsets.push([...partial]);
  for (let i = start; i < sorted.length; i += 1) {
    if (i > start && sorted[i] === sorted[i - 1]) continue;
    partial.push(sorted[i]);
    explore(i + 1);
    partial.pop();
  }
}

explore(0);
return subsets;`,
      PYTHON: `sorted_values = sorted(values)
subsets = []
partial = []

def explore(start):
    subsets.append(list(partial))
    for i in range(start, len(sorted_values)):
        if i > start and sorted_values[i] == sorted_values[i - 1]:
            continue
        partial.append(sorted_values[i])
        explore(i + 1)
        partial.pop()

explore(0)
return subsets`,
      JAVA: `int[] sorted = values.clone();
Arrays.sort(sorted);
List<int[]> subsets = new ArrayList<>();
List<Integer> partial = new ArrayList<>();

class Search {
    void explore(int start) {
        int[] copy = new int[partial.size()];
        for (int i = 0; i < copy.length; i += 1) copy[i] = partial.get(i);
        subsets.add(copy);
        for (int i = start; i < sorted.length; i += 1) {
            if (i > start && sorted[i] == sorted[i - 1]) continue;
            partial.add(sorted[i]);
            explore(i + 1);
            partial.remove(partial.size() - 1);
        }
    }
}

new Search().explore(0);
return subsets.toArray(new int[0][]);`,
      CPP: `vector<int> sorted = values;
sort(sorted.begin(), sorted.end());
vector<vector<int>> subsets;
vector<int> partial;

function<void(int)> explore = [&](int start) {
    subsets.push_back(partial);
    for (int i = start; i < (int)sorted.size(); i += 1) {
        if (i > start && sorted[i] == sorted[i - 1]) continue;
        partial.push_back(sorted[i]);
        explore(i + 1);
        partial.pop_back();
    }
};

explore(0);
return subsets;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "every-arrangement",
    title: "Every Arrangement",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Return every ordering of the given distinct values. Sort the values " +
      "first, and return the orderings compared entry by entry, smallest first.",
    explanation:
      "An arrangement is built by repeatedly choosing which unused value comes " +
      "next, so the state that matters is which values are still available. " +
      "Keep a used-flag per index; at each depth, loop over the values, skip the " +
      "used ones, mark one used, recurse, then unmark it. Recording happens when " +
      "the partial arrangement reaches full length. Because the values were " +
      "sorted and the loop runs left to right, the arrangements come out in " +
      "increasing order for free. The swap-based version is shorter and avoids " +
      "the flag array, but it emits arrangements in an order that depends on the " +
      "swaps rather than on the values — worth knowing, and worth not using when " +
      "the order is specified.",
    constraints: [
      "Between 0 and 7 values, all distinct.",
      "Values are between -100 and 100.",
      "The answer holds n! arrangements in the stated order.",
    ],
    hints: [
      "At each position, choose from whatever has not been used yet.",
      "A used-flag per index is enough state; there is nothing else to remember.",
      "Sorting first plus a left-to-right loop gives the required order without sorting after.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "everyArrangement",
      params: [{ name: "values", type: "int[]" }],
      returns: "int[][]",
    },
    topicSlugs: ["dsa-backtracking", "dsa-recursion", "js-arrays"],
    examples: [
      {
        input: "values = [1, 2, 3]",
        output: "[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]",
        explanation: "Three values give six orderings, listed in increasing order.",
      },
      {
        input: "values = [1]",
        output: "[[1]]",
        explanation: "One value has exactly one ordering.",
      },
    ],
    tests: [
      {
        args: [[1, 2, 3]],
        expected: [
          [1, 2, 3],
          [1, 3, 2],
          [2, 1, 3],
          [2, 3, 1],
          [3, 1, 2],
          [3, 2, 1],
        ],
      },
      { args: [[1]], expected: [[1]] },
      { args: [[]], expected: [[]] },
      {
        args: [[2, 1]],
        expected: [
          [1, 2],
          [2, 1],
        ],
        hidden: true,
      },
      {
        args: [[0, -1]],
        expected: [
          [-1, 0],
          [0, -1],
        ],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const sorted = [...values].sort((a, b) => a - b);
const arrangements = [];
const partial = [];
const used = new Array(sorted.length).fill(false);

function explore() {
  if (partial.length === sorted.length) {
    arrangements.push([...partial]);
    return;
  }
  for (let i = 0; i < sorted.length; i += 1) {
    if (used[i]) continue;
    used[i] = true;
    partial.push(sorted[i]);
    explore();
    partial.pop();
    used[i] = false;
  }
}

explore();
return arrangements;`,
      TYPESCRIPT: `const sorted = [...values].sort((a, b) => a - b);
const arrangements: number[][] = [];
const partial: number[] = [];
const used: boolean[] = new Array(sorted.length).fill(false);

function explore(): void {
  if (partial.length === sorted.length) {
    arrangements.push([...partial]);
    return;
  }
  for (let i = 0; i < sorted.length; i += 1) {
    if (used[i]) continue;
    used[i] = true;
    partial.push(sorted[i]);
    explore();
    partial.pop();
    used[i] = false;
  }
}

explore();
return arrangements;`,
      PYTHON: `sorted_values = sorted(values)
arrangements = []
partial = []
used = [False] * len(sorted_values)

def explore():
    if len(partial) == len(sorted_values):
        arrangements.append(list(partial))
        return
    for i in range(len(sorted_values)):
        if used[i]:
            continue
        used[i] = True
        partial.append(sorted_values[i])
        explore()
        partial.pop()
        used[i] = False

explore()
return arrangements`,
      JAVA: `int[] sorted = values.clone();
Arrays.sort(sorted);
List<int[]> arrangements = new ArrayList<>();
List<Integer> partial = new ArrayList<>();
boolean[] used = new boolean[sorted.length];

class Search {
    void explore() {
        if (partial.size() == sorted.length) {
            int[] copy = new int[partial.size()];
            for (int i = 0; i < copy.length; i += 1) copy[i] = partial.get(i);
            arrangements.add(copy);
            return;
        }
        for (int i = 0; i < sorted.length; i += 1) {
            if (used[i]) continue;
            used[i] = true;
            partial.add(sorted[i]);
            explore();
            partial.remove(partial.size() - 1);
            used[i] = false;
        }
    }
}

new Search().explore();
return arrangements.toArray(new int[0][]);`,
      CPP: `vector<int> sorted = values;
sort(sorted.begin(), sorted.end());
vector<vector<int>> arrangements;
vector<int> partial;
vector<bool> used(sorted.size(), false);

function<void()> explore = [&]() {
    if (partial.size() == sorted.size()) {
        arrangements.push_back(partial);
        return;
    }
    for (int i = 0; i < (int)sorted.size(); i += 1) {
        if (used[i]) continue;
        used[i] = true;
        partial.push_back(sorted[i]);
        explore();
        partial.pop_back();
        used[i] = false;
    }
};

explore();
return arrangements;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "combinations-reaching-a-total",
    title: "Combinations Reaching a Total",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Given distinct positive numbers, find every combination that adds up to " +
      "the target. Each number may be used as many times as you like, and two " +
      "combinations differing only in order count as one. Sort the numbers " +
      "first, and return the combinations compared entry by entry.",
    explanation:
      "Reusing a number means the recursion passes the *same* index down rather " +
      "than the next one — that single detail is the difference between " +
      "unlimited reuse and one-use-each. Order-insensitivity is handled by never " +
      "going backwards: at each level the loop starts from the current index, so " +
      "a combination is always built in non-decreasing order and [2,3] can never " +
      "also appear as [3,2]. Two prunings make this fast enough. Sorting lets " +
      "you break out of the loop the moment a candidate exceeds the remaining " +
      "target, because every later candidate is larger still; and the base case " +
      "records only when the remainder is exactly zero. Without the sort you " +
      "would have to continue rather than break, and would explore branches you " +
      "already know are dead.",
    constraints: [
      "Between 1 and 30 distinct positive numbers.",
      "Numbers are between 2 and 40; the target is between 1 and 40.",
      "Each number may be reused without limit.",
    ],
    hints: [
      "To allow reuse, hand the same index to the recursive call.",
      "Starting each loop at the current index stops the same combination appearing reordered.",
      "Sorted candidates let you break out as soon as one exceeds what is left.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "combinationsReachingATotal",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "target", type: "int" },
      ],
      returns: "int[][]",
    },
    topicSlugs: ["dsa-backtracking", "dsa-recursion", "js-arrays"],
    examples: [
      {
        input: "numbers = [2, 3, 6, 7], target = 7",
        output: "[[2, 2, 3], [7]]",
        explanation: "The 2 is reused twice; [3,2,2] is the same combination reordered.",
      },
      {
        input: "numbers = [2], target = 3",
        output: "[]",
        explanation: "No number of 2s adds to 3.",
      },
    ],
    tests: [
      {
        args: [[2, 3, 6, 7], 7],
        expected: [[2, 2, 3], [7]],
      },
      { args: [[2], 3], expected: [] },
      { args: [[2], 4], expected: [[2, 2]] },
      {
        args: [[2, 3, 5], 8],
        expected: [
          [2, 2, 2, 2],
          [2, 3, 3],
          [3, 5],
        ],
        hidden: true,
      },
      { args: [[7, 3, 2], 6], expected: [[2, 2, 2], [3, 3]], hidden: true },
      { args: [[5], 5], expected: [[5]], hidden: true },
      { args: [[9], 3], expected: [], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const sorted = [...numbers].sort((a, b) => a - b);
const found = [];
const partial = [];

function explore(start, remaining) {
  if (remaining === 0) {
    found.push([...partial]);
    return;
  }
  for (let i = start; i < sorted.length; i += 1) {
    if (sorted[i] > remaining) break;
    partial.push(sorted[i]);
    explore(i, remaining - sorted[i]);
    partial.pop();
  }
}

explore(0, target);
return found;`,
      TYPESCRIPT: `const sorted = [...numbers].sort((a, b) => a - b);
const found: number[][] = [];
const partial: number[] = [];

function explore(start: number, remaining: number): void {
  if (remaining === 0) {
    found.push([...partial]);
    return;
  }
  for (let i = start; i < sorted.length; i += 1) {
    if (sorted[i] > remaining) break;
    partial.push(sorted[i]);
    explore(i, remaining - sorted[i]);
    partial.pop();
  }
}

explore(0, target);
return found;`,
      PYTHON: `sorted_numbers = sorted(numbers)
found = []
partial = []

def explore(start, remaining):
    if remaining == 0:
        found.append(list(partial))
        return
    for i in range(start, len(sorted_numbers)):
        if sorted_numbers[i] > remaining:
            break
        partial.append(sorted_numbers[i])
        explore(i, remaining - sorted_numbers[i])
        partial.pop()

explore(0, target)
return found`,
      JAVA: `int[] sorted = numbers.clone();
Arrays.sort(sorted);
List<int[]> found = new ArrayList<>();
List<Integer> partial = new ArrayList<>();

class Search {
    void explore(int start, int remaining) {
        if (remaining == 0) {
            int[] copy = new int[partial.size()];
            for (int i = 0; i < copy.length; i += 1) copy[i] = partial.get(i);
            found.add(copy);
            return;
        }
        for (int i = start; i < sorted.length; i += 1) {
            if (sorted[i] > remaining) break;
            partial.add(sorted[i]);
            explore(i, remaining - sorted[i]);
            partial.remove(partial.size() - 1);
        }
    }
}

new Search().explore(0, target);
return found.toArray(new int[0][]);`,
      CPP: `vector<int> sorted = numbers;
sort(sorted.begin(), sorted.end());
vector<vector<int>> found;
vector<int> partial;

function<void(int, int)> explore = [&](int start, int remaining) {
    if (remaining == 0) {
        found.push_back(partial);
        return;
    }
    for (int i = start; i < (int)sorted.size(); i += 1) {
        if (sorted[i] > remaining) break;
        partial.push_back(sorted[i]);
        explore(i, remaining - sorted[i]);
        partial.pop_back();
    }
};

explore(0, target);
return found;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "choose-k-from-n",
    title: "Choose k From the First n",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Return every way of choosing k numbers from 1 up to n, ignoring order. " +
      "List the chosen numbers in increasing order within each combination, and " +
      "return the combinations compared entry by entry.",
    explanation:
      "The plain search — loop from the current start, take, recurse, un-take — " +
      "produces the right answer and wastes most of its time in branches that " +
      "cannot possibly reach k numbers. The pruning worth knowing here is a " +
      "counting argument: if you still need r more numbers and only q candidates " +
      "remain, any start beyond n - r + 1 is hopeless, so the loop bound can be " +
      "tightened rather than the branch abandoned later. That turns a search " +
      "that explores every prefix into one that explores only viable ones, and " +
      "it is the cleanest small example of pruning by counting rather than by " +
      "testing. Choosing in increasing order is what makes combinations distinct " +
      "from arrangements.",
    constraints: [
      "n is between 1 and 20 and k is between 0 and n.",
      "Each combination lists its numbers in increasing order.",
      "Choosing zero numbers gives exactly one combination: the empty one.",
    ],
    hints: [
      "Always choose the next number larger than the last, so order never repeats a combination.",
      "If you need r more numbers, starting beyond n - r + 1 can never finish.",
      "Tighten the loop bound rather than abandoning the branch afterwards.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "chooseKFromN",
      params: [
        { name: "n", type: "int" },
        { name: "k", type: "int" },
      ],
      returns: "int[][]",
    },
    topicSlugs: ["dsa-backtracking", "dsa-recursion", "js-loops"],
    examples: [
      {
        input: "n = 4, k = 2",
        output: "[[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]",
        explanation: "Six ways to pick two of four.",
      },
      {
        input: "n = 3, k = 3",
        output: "[[1, 2, 3]]",
        explanation: "Taking all of them leaves only one combination.",
      },
    ],
    tests: [
      {
        args: [4, 2],
        expected: [
          [1, 2],
          [1, 3],
          [1, 4],
          [2, 3],
          [2, 4],
          [3, 4],
        ],
      },
      { args: [3, 3], expected: [[1, 2, 3]] },
      { args: [1, 1], expected: [[1]] },
      { args: [5, 0], expected: [[]], hidden: true },
      {
        args: [4, 1],
        expected: [[1], [2], [3], [4]],
        hidden: true,
      },
      {
        args: [5, 4],
        expected: [
          [1, 2, 3, 4],
          [1, 2, 3, 5],
          [1, 2, 4, 5],
          [1, 3, 4, 5],
          [2, 3, 4, 5],
        ],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const combinations = [];
const partial = [];

function explore(start) {
  if (partial.length === k) {
    combinations.push([...partial]);
    return;
  }
  const needed = k - partial.length;
  for (let value = start; value <= n - needed + 1; value += 1) {
    partial.push(value);
    explore(value + 1);
    partial.pop();
  }
}

explore(1);
return combinations;`,
      TYPESCRIPT: `const combinations: number[][] = [];
const partial: number[] = [];

function explore(start: number): void {
  if (partial.length === k) {
    combinations.push([...partial]);
    return;
  }
  const needed = k - partial.length;
  for (let value = start; value <= n - needed + 1; value += 1) {
    partial.push(value);
    explore(value + 1);
    partial.pop();
  }
}

explore(1);
return combinations;`,
      PYTHON: `combinations = []
partial = []

def explore(start):
    if len(partial) == k:
        combinations.append(list(partial))
        return
    needed = k - len(partial)
    for value in range(start, n - needed + 2):
        partial.append(value)
        explore(value + 1)
        partial.pop()

explore(1)
return combinations`,
      JAVA: `List<int[]> combinations = new ArrayList<>();
List<Integer> partial = new ArrayList<>();

class Search {
    void explore(int start) {
        if (partial.size() == k) {
            int[] copy = new int[partial.size()];
            for (int i = 0; i < copy.length; i += 1) copy[i] = partial.get(i);
            combinations.add(copy);
            return;
        }
        int needed = k - partial.size();
        for (int value = start; value <= n - needed + 1; value += 1) {
            partial.add(value);
            explore(value + 1);
            partial.remove(partial.size() - 1);
        }
    }
}

new Search().explore(1);
return combinations.toArray(new int[0][]);`,
      CPP: `vector<vector<int>> combinations;
vector<int> partial;

function<void(int)> explore = [&](int start) {
    if ((int)partial.size() == k) {
        combinations.push_back(partial);
        return;
    }
    int needed = k - (int)partial.size();
    for (int value = start; value <= n - needed + 1; value += 1) {
        partial.push_back(value);
        explore(value + 1);
        partial.pop_back();
    }
};

explore(1);
return combinations;`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "keypad-letter-words",
    title: "Words From a Phone Keypad",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "On an old phone keypad, 2 carries \"abc\", 3 \"def\", 4 \"ghi\", 5 \"jkl\", " +
      "6 \"mno\", 7 \"pqrs\", 8 \"tuv\" and 9 \"wxyz\". Given a run of digits, " +
      "return every letter combination it could spell, in the order the search " +
      "below produces — which is alphabetical. Empty input gives an empty list.",
    explanation:
      "This is a product of independent choices, one per digit, so the search " +
      "has depth equal to the number of digits and no pruning is possible — " +
      "every branch reaches a valid answer. That makes it the cleanest place to " +
      "see the skeleton without the distraction of a constraint: at depth i, " +
      "loop over the letters of digit i, append, recurse to depth i + 1, remove. " +
      "Record when the depth equals the number of digits. Because the letter " +
      "lists are already alphabetical and the loop runs left to right, the " +
      "output comes out alphabetical without sorting. The one case worth being " +
      "deliberate about is empty input: the skeleton would record a single empty " +
      "word, and the problem asks for nothing at all, so it needs its own line.",
    constraints: [
      "Between 0 and 8 digits.",
      "Every digit is between 2 and 9 — 0 and 1 carry no letters.",
      "Empty input returns an empty list, not a list holding empty text.",
    ],
    hints: [
      "One choice per digit, and every choice is legal — there is nothing to prune.",
      "Recurse on the position in the digit run, not on the letters.",
      "Empty input is the one case the general skeleton gets wrong.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "keypadLetterWords",
      params: [{ name: "digits", type: "string" }],
      returns: "string[]",
    },
    topicSlugs: ["dsa-backtracking", "dsa-strings", "dsa-recursion"],
    examples: [
      {
        input: 'digits = "23"',
        output: '["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"]',
        explanation: "Three letters on the 2 times three on the 3 gives nine words.",
      },
      {
        input: 'digits = ""',
        output: "[]",
        explanation: "Nothing was dialled, so nothing is spelled.",
      },
    ],
    tests: [
      {
        args: ["23"],
        expected: ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"],
      },
      { args: [""], expected: [] },
      { args: ["2"], expected: ["a", "b", "c"] },
      {
        args: ["7"],
        expected: ["p", "q", "r", "s"],
        hidden: true,
      },
      {
        args: ["79"],
        expected: [
          "pw", "px", "py", "pz",
          "qw", "qx", "qy", "qz",
          "rw", "rx", "ry", "rz",
          "sw", "sx", "sy", "sz",
        ],
        hidden: true,
      },
      {
        args: ["99"],
        expected: [
          "ww", "wx", "wy", "wz",
          "xw", "xx", "xy", "xz",
          "yw", "yx", "yy", "yz",
          "zw", "zx", "zy", "zz",
        ],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `if (digits.length === 0) return [];
const letters = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"];
const words = [];
const partial = [];

function explore(index) {
  if (index === digits.length) {
    words.push(partial.join(""));
    return;
  }
  for (const letter of letters[Number(digits[index])]) {
    partial.push(letter);
    explore(index + 1);
    partial.pop();
  }
}

explore(0);
return words;`,
      TYPESCRIPT: `if (digits.length === 0) return [];
const letters = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"];
const words: string[] = [];
const partial: string[] = [];

function explore(index: number): void {
  if (index === digits.length) {
    words.push(partial.join(""));
    return;
  }
  for (const letter of letters[Number(digits[index])]) {
    partial.push(letter);
    explore(index + 1);
    partial.pop();
  }
}

explore(0);
return words;`,
      PYTHON: `if not digits:
    return []
letters = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"]
words = []
partial = []

def explore(index):
    if index == len(digits):
        words.append("".join(partial))
        return
    for letter in letters[int(digits[index])]:
        partial.append(letter)
        explore(index + 1)
        partial.pop()

explore(0)
return words`,
      JAVA: `if (digits.isEmpty()) return new String[0];
String[] letters = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
List<String> words = new ArrayList<>();
StringBuilder partial = new StringBuilder();

class Search {
    void explore(int index) {
        if (index == digits.length()) {
            words.add(partial.toString());
            return;
        }
        String options = letters[digits.charAt(index) - '0'];
        for (int i = 0; i < options.length(); i += 1) {
            partial.append(options.charAt(i));
            explore(index + 1);
            partial.deleteCharAt(partial.length() - 1);
        }
    }
}

new Search().explore(0);
return words.toArray(new String[0]);`,
      CPP: `if (digits.empty()) return vector<string>{};
vector<string> letters = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
vector<string> words;
string partial;

function<void(int)> explore = [&](int index) {
    if (index == (int)digits.size()) {
        words.push_back(partial);
        return;
    }
    for (char letter : letters[digits[index] - '0']) {
        partial.push_back(letter);
        explore(index + 1);
        partial.pop_back();
    }
};

explore(0);
return words;`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "find-word-in-grid",
    title: "Find the Word in the Grid",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Each row of the grid is a line of letters. Report whether the word can be " +
      "spelled by stepping between horizontally or vertically neighbouring " +
      "squares, starting anywhere. A square may not be used twice in the same " +
      "spelling.",
    explanation:
      "Try every square as a start and walk outwards, matching one letter per " +
      "step. Two things make this backtracking rather than a plain search. " +
      "First, the no-reuse rule is per *path*, not global — a square blocked for " +
      "one route must be free again for the next, which is exactly what undoing " +
      "the mark on the way back out achieves. Marking without unmarking is the " +
      "classic bug here and produces false negatives that are painful to spot. " +
      "Second, the pruning is the letter test itself: check that the square " +
      "matches before recursing, not after, so wrong branches die at depth one " +
      "instead of depth k. Overwriting the square with a sentinel and restoring " +
      "it afterwards is the usual way to mark, and avoids a second grid.",
    constraints: [
      "The grid has between 1 and 200 rows, each between 1 and 200 characters.",
      "All rows have the same length, and every square is a lowercase letter.",
      "The word holds between 1 and 15 lowercase letters.",
    ],
    hints: [
      "Every square is a possible starting point.",
      "The no-reuse rule applies to the current path only — undo the mark on the way out.",
      "Test that the letter matches before you recurse, not after.",
    ],
    estimatedTime: "40 min",
    timeLimitMs: 5000,
    signature: {
      name: "findWordInGrid",
      params: [
        { name: "grid", type: "string[]" },
        { name: "word", type: "string" },
      ],
      returns: "bool",
    },
    topicSlugs: ["dsa-backtracking", "dsa-graph-dfs", "dsa-strings"],
    examples: [
      {
        input: 'grid = ["abce", "sfcs", "adee"], word = "abcced"',
        output: "true",
        explanation: "The path runs right, right, down, down, left, up.",
      },
      {
        input: 'grid = ["abce", "sfcs", "adee"], word = "abcb"',
        output: "false",
        explanation: "Returning to the first b would reuse a square.",
      },
    ],
    tests: [
      { args: [["abce", "sfcs", "adee"], "abcced"], expected: true },
      { args: [["abce", "sfcs", "adee"], "abcb"], expected: false },
      { args: [["abce", "sfcs", "adee"], "see"], expected: true },
      { args: [["a"], "a"], expected: true, hidden: true },
      { args: [["a"], "b"], expected: false, hidden: true },
      { args: [["aa"], "aaa"], expected: false, hidden: true },
      { args: [["ab", "cd"], "abdc"], expected: true, hidden: true },
      { args: [["ab", "cd"], "acdb"], expected: true, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const rows = grid.length;
const columns = grid[0].length;
const board = grid.map((row) => row.split(""));

function walk(row, column, index) {
  if (index === word.length) return true;
  if (row < 0 || row >= rows || column < 0 || column >= columns) return false;
  if (board[row][column] !== word[index]) return false;

  const letter = board[row][column];
  board[row][column] = "*";
  const found =
    walk(row + 1, column, index + 1) ||
    walk(row - 1, column, index + 1) ||
    walk(row, column + 1, index + 1) ||
    walk(row, column - 1, index + 1);
  board[row][column] = letter;
  return found;
}

for (let row = 0; row < rows; row += 1) {
  for (let column = 0; column < columns; column += 1) {
    if (walk(row, column, 0)) return true;
  }
}
return false;`,
      TYPESCRIPT: `const rows = grid.length;
const columns = grid[0].length;
const board: string[][] = grid.map((row) => row.split(""));

function walk(row: number, column: number, index: number): boolean {
  if (index === word.length) return true;
  if (row < 0 || row >= rows || column < 0 || column >= columns) return false;
  if (board[row][column] !== word[index]) return false;

  const letter = board[row][column];
  board[row][column] = "*";
  const found =
    walk(row + 1, column, index + 1) ||
    walk(row - 1, column, index + 1) ||
    walk(row, column + 1, index + 1) ||
    walk(row, column - 1, index + 1);
  board[row][column] = letter;
  return found;
}

for (let row = 0; row < rows; row += 1) {
  for (let column = 0; column < columns; column += 1) {
    if (walk(row, column, 0)) return true;
  }
}
return false;`,
      PYTHON: `rows = len(grid)
columns = len(grid[0])
board = [list(row) for row in grid]

def walk(row, column, index):
    if index == len(word):
        return True
    if row < 0 or row >= rows or column < 0 or column >= columns:
        return False
    if board[row][column] != word[index]:
        return False

    letter = board[row][column]
    board[row][column] = "*"
    found = (
        walk(row + 1, column, index + 1)
        or walk(row - 1, column, index + 1)
        or walk(row, column + 1, index + 1)
        or walk(row, column - 1, index + 1)
    )
    board[row][column] = letter
    return found

for row in range(rows):
    for column in range(columns):
        if walk(row, column, 0):
            return True
return False`,
      JAVA: `int rows = grid.length;
int columns = grid[0].length();
char[][] board = new char[rows][];
for (int i = 0; i < rows; i += 1) board[i] = grid[i].toCharArray();

class Search {
    boolean walk(int row, int column, int index) {
        if (index == word.length()) return true;
        if (row < 0 || row >= rows || column < 0 || column >= columns) return false;
        if (board[row][column] != word.charAt(index)) return false;

        char letter = board[row][column];
        board[row][column] = '*';
        boolean found =
            walk(row + 1, column, index + 1)
                || walk(row - 1, column, index + 1)
                || walk(row, column + 1, index + 1)
                || walk(row, column - 1, index + 1);
        board[row][column] = letter;
        return found;
    }
}

Search search = new Search();
for (int row = 0; row < rows; row += 1) {
    for (int column = 0; column < columns; column += 1) {
        if (search.walk(row, column, 0)) return true;
    }
}
return false;`,
      CPP: `int rows = (int)grid.size();
int columns = (int)grid[0].size();
vector<string> board = grid;

function<bool(int, int, int)> walk = [&](int row, int column, int index) -> bool {
    if (index == (int)word.size()) return true;
    if (row < 0 || row >= rows || column < 0 || column >= columns) return false;
    if (board[row][column] != word[index]) return false;

    char letter = board[row][column];
    board[row][column] = '*';
    bool found = walk(row + 1, column, index + 1)
        || walk(row - 1, column, index + 1)
        || walk(row, column + 1, index + 1)
        || walk(row, column - 1, index + 1);
    board[row][column] = letter;
    return found;
};

for (int row = 0; row < rows; row += 1) {
    for (int column = 0; column < columns; column += 1) {
        if (walk(row, column, 0)) return true;
    }
}
return false;`,
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "split-into-palindromes",
    title: "Split Into Palindromes",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Cut the text into pieces so that every piece reads the same forwards and " +
      "backwards, and return the number of distinct ways to do it. Cutting " +
      "between every pair of characters always works, since a single character " +
      "is a palindrome.",
    explanation:
      "At each position, try every piece that starts there: for each end point, " +
      "check whether that slice is a palindrome, and if it is, recurse from just " +
      "after it. Reaching the end of the text means one complete way has been " +
      "found. The palindrome test *is* the pruning here — a failed test cuts off " +
      "every arrangement that would have begun with that piece, which is most of " +
      "the search space. Note what makes this different from the subset " +
      "problems: the choices are not independent, because where one piece ends " +
      "decides where the next may start, which is why the recursion carries a " +
      "position rather than an index into a list of options.",
    constraints: [
      "The text holds between 1 and 16 lowercase letters.",
      "Every piece must read the same forwards and backwards.",
      "A single character always counts as a palindrome.",
    ],
    hints: [
      "At each position, try every possible length for the next piece.",
      "Only recurse when the piece you just cut is itself a palindrome.",
      "Reaching the end of the text means one complete split has been found.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "splitIntoPalindromes",
      params: [{ name: "text", type: "string" }],
      returns: "int",
    },
    topicSlugs: ["dsa-backtracking", "dsa-strings", "dsa-recursion"],
    examples: [
      {
        input: 'text = "aab"',
        output: "2",
        explanation: 'Either "a"+"a"+"b" or "aa"+"b".',
      },
      {
        input: 'text = "abc"',
        output: "1",
        explanation: "Nothing longer than one character is a palindrome here.",
      },
    ],
    tests: [
      { args: ["aab"], expected: 2 },
      { args: ["abc"], expected: 1 },
      { args: ["a"], expected: 1 },
      { args: ["aa"], expected: 2, hidden: true },
      { args: ["aaa"], expected: 4, hidden: true },
      { args: ["aaaa"], expected: 8, hidden: true },
      { args: ["abba"], expected: 3, hidden: true },
      { args: ["racecar"], expected: 4, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `function isPalindrome(from, to) {
  let left = from;
  let right = to;
  while (left < right) {
    if (text[left] !== text[right]) return false;
    left += 1;
    right -= 1;
  }
  return true;
}

function explore(start) {
  if (start === text.length) return 1;
  let ways = 0;
  for (let end = start; end < text.length; end += 1) {
    if (isPalindrome(start, end)) ways += explore(end + 1);
  }
  return ways;
}

return explore(0);`,
      TYPESCRIPT: `function isPalindrome(from: number, to: number): boolean {
  let left = from;
  let right = to;
  while (left < right) {
    if (text[left] !== text[right]) return false;
    left += 1;
    right -= 1;
  }
  return true;
}

function explore(start: number): number {
  if (start === text.length) return 1;
  let ways = 0;
  for (let end = start; end < text.length; end += 1) {
    if (isPalindrome(start, end)) ways += explore(end + 1);
  }
  return ways;
}

return explore(0);`,
      PYTHON: `def is_palindrome(from_index, to_index):
    left, right = from_index, to_index
    while left < right:
        if text[left] != text[right]:
            return False
        left += 1
        right -= 1
    return True

def explore(start):
    if start == len(text):
        return 1
    ways = 0
    for end in range(start, len(text)):
        if is_palindrome(start, end):
            ways += explore(end + 1)
    return ways

return explore(0)`,
      JAVA: `class Search {
    boolean isPalindrome(int from, int to) {
        int left = from;
        int right = to;
        while (left < right) {
            if (text.charAt(left) != text.charAt(right)) return false;
            left += 1;
            right -= 1;
        }
        return true;
    }

    int explore(int start) {
        if (start == text.length()) return 1;
        int ways = 0;
        for (int end = start; end < text.length(); end += 1) {
            if (isPalindrome(start, end)) ways += explore(end + 1);
        }
        return ways;
    }
}

return new Search().explore(0);`,
      CPP: `auto isPalindrome = [&](int from, int to) {
    int left = from, right = to;
    while (left < right) {
        if (text[left] != text[right]) return false;
        left += 1;
        right -= 1;
    }
    return true;
};

function<int(int)> explore = [&](int start) {
    if (start == (int)text.size()) return 1;
    int ways = 0;
    for (int end = start; end < (int)text.size(); end += 1) {
        if (isPalindrome(start, end)) ways += explore(end + 1);
    }
    return ways;
};

return explore(0);`,
    },
  },

  // ── 9 ───────────────────────────────────────────────────────────────────
  {
    slug: "place-the-queens",
    title: "Place the Queens",
    difficulty: "HARD",
    interviewFrequency: "HIGH",
    description:
      "Place n queens on an n-by-n board so that no two share a row, a column or " +
      "a diagonal. Return how many distinct placements exist.",
    explanation:
      "Because no two queens share a row, the search can place exactly one queen " +
      "per row and never consider anything else — that observation alone removes " +
      "most of the search space before any pruning. What remains is choosing a " +
      "column for each row, checking it against the queens already placed. " +
      "Scanning previous rows to check makes each test O(n); three sets make it " +
      "O(1). A column is occupied if it is in the column set; the two diagonals " +
      "are identified by row - column and row + column, which are constant along " +
      "a diagonal, so a set of each is enough. Add to all three, recurse to the " +
      "next row, then remove from all three — the same choose/recurse/un-choose " +
      "loop as everywhere else in this file, with the state split across three " +
      "sets instead of one list.",
    constraints: [
      "n is between 1 and 11.",
      "Two placements are distinct if any queen sits on a different square.",
      "Rotations and reflections count separately.",
    ],
    hints: [
      "Exactly one queen goes in each row, so choose a column per row.",
      "A diagonal is identified by row - column; the other by row + column.",
      "Track columns and both diagonal families in sets so each test is constant time.",
    ],
    estimatedTime: "45 min",
    timeLimitMs: 5000,
    signature: {
      name: "placeTheQueens",
      params: [{ name: "n", type: "int" }],
      returns: "int",
    },
    topicSlugs: ["dsa-backtracking", "dsa-recursion", "dsa-hashing"],
    examples: [
      {
        input: "n = 4",
        output: "2",
        explanation: "The two solutions are mirror images of one another.",
      },
      {
        input: "n = 1",
        output: "1",
        explanation: "A single queen on a single square.",
      },
    ],
    tests: [
      { args: [4], expected: 2 },
      { args: [1], expected: 1 },
      { args: [2], expected: 0 },
      { args: [3], expected: 0, hidden: true },
      { args: [5], expected: 10, hidden: true },
      { args: [6], expected: 4, hidden: true },
      { args: [8], expected: 92, hidden: true },
      { args: [9], expected: 352, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const columns = new Set();
const rising = new Set();
const falling = new Set();

function explore(row) {
  if (row === n) return 1;
  let found = 0;
  for (let column = 0; column < n; column += 1) {
    if (columns.has(column) || rising.has(row - column) || falling.has(row + column)) {
      continue;
    }
    columns.add(column);
    rising.add(row - column);
    falling.add(row + column);
    found += explore(row + 1);
    columns.delete(column);
    rising.delete(row - column);
    falling.delete(row + column);
  }
  return found;
}

return explore(0);`,
      TYPESCRIPT: `const columns = new Set<number>();
const rising = new Set<number>();
const falling = new Set<number>();

function explore(row: number): number {
  if (row === n) return 1;
  let found = 0;
  for (let column = 0; column < n; column += 1) {
    if (columns.has(column) || rising.has(row - column) || falling.has(row + column)) {
      continue;
    }
    columns.add(column);
    rising.add(row - column);
    falling.add(row + column);
    found += explore(row + 1);
    columns.delete(column);
    rising.delete(row - column);
    falling.delete(row + column);
  }
  return found;
}

return explore(0);`,
      PYTHON: `columns = set()
rising = set()
falling = set()

def explore(row):
    if row == n:
        return 1
    found = 0
    for column in range(n):
        if column in columns or (row - column) in rising or (row + column) in falling:
            continue
        columns.add(column)
        rising.add(row - column)
        falling.add(row + column)
        found += explore(row + 1)
        columns.discard(column)
        rising.discard(row - column)
        falling.discard(row + column)
    return found

return explore(0)`,
      JAVA: `Set<Integer> columns = new HashSet<>();
Set<Integer> rising = new HashSet<>();
Set<Integer> falling = new HashSet<>();

class Search {
    int explore(int row) {
        if (row == n) return 1;
        int found = 0;
        for (int column = 0; column < n; column += 1) {
            if (columns.contains(column)
                || rising.contains(row - column)
                || falling.contains(row + column)) {
                continue;
            }
            columns.add(column);
            rising.add(row - column);
            falling.add(row + column);
            found += explore(row + 1);
            columns.remove(column);
            rising.remove(row - column);
            falling.remove(row + column);
        }
        return found;
    }
}

return new Search().explore(0);`,
      CPP: `set<int> columns, rising, falling;

function<int(int)> explore = [&](int row) {
    if (row == n) return 1;
    int found = 0;
    for (int column = 0; column < n; column += 1) {
        if (columns.count(column) || rising.count(row - column)
            || falling.count(row + column)) {
            continue;
        }
        columns.insert(column);
        rising.insert(row - column);
        falling.insert(row + column);
        found += explore(row + 1);
        columns.erase(column);
        rising.erase(row - column);
        falling.erase(row + column);
    }
    return found;
};

return explore(0);`,
    },
  },
];
