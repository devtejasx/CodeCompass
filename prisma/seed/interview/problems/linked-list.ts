import type { SeedProblem } from "../../problems/types";

/**
 * Linked lists, modelled as their values.
 *
 * A list arrives as `int[]` — its values in order — and the statement says so.
 * That is a deliberate trade, explained in prisma/seed/problems/types.ts: five
 * node definitions the harness would have to agree with buys nothing, and the
 * algorithm being practised (reverse, find the middle, remove the nth from the
 * end, add two numbers) is identical either way. What is lost is pointer
 * surgery, which is a language exercise; what is gained is that every one of
 * these runs in all five languages.
 *
 * The cycle problems are the exception, and they say so: a cycle cannot exist
 * in a list of values, so those take the *next-index* form instead, which is
 * the same structure written down honestly.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const LINKED_LIST_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "reverse-linked-list",
    title: "Reverse a Linked List",
    difficulty: "EASY",
    interviewFrequency: "VERY_HIGH",
    description:
      "A linked list is given as its values in order. Return the values of the " +
      "reversed list. An empty list reverses to an empty list.",
    explanation:
      "With real nodes this is the three-pointer dance every interviewer has " +
      "seen a hundred times: hold the previous node, remember the next one " +
      "before you overwrite the current node's link, then step forward. Written " +
      "over values the same walk becomes a loop from the back, and the thing " +
      "worth carrying away is the invariant rather than the pointer juggling — " +
      "everything before the cursor is already reversed, everything after it is " +
      "untouched. If you can state that sentence you can rewrite the pointer " +
      "version from memory.",
    constraints: [
      "The list has between 0 and 100,000 values.",
      "Each value is between -1,000,000 and 1,000,000.",
      "Return a new list; the input is not modified.",
    ],
    hints: [
      "Walk from the end, or build the answer by prepending.",
      "State the invariant: what is true of everything you have already passed?",
    ],
    estimatedTime: "10 min",
    signature: {
      name: "reverseLinkedList",
      params: [{ name: "values", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-linked-list", "js-arrays", "data-structures"],
    examples: [
      { input: "values = [1, 2, 3, 4, 5]", output: "[5, 4, 3, 2, 1]" },
      { input: "values = []", output: "[]" },
    ],
    tests: [
      { args: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
      { args: [[]], expected: [] },
      { args: [[1]], expected: [1] },
      { args: [[1, 2]], expected: [2, 1], hidden: true },
      { args: [[-1, 0]], expected: [0, -1], hidden: true },
      { args: [[7, 7]], expected: [7, 7], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const result = [];
for (let i = values.length - 1; i >= 0; i -= 1) result.push(values[i]);
return result;`,
      TYPESCRIPT: `const result: number[] = [];
for (let i = values.length - 1; i >= 0; i -= 1) result.push(values[i]);
return result;`,
      PYTHON: `result = []
for i in range(len(values) - 1, -1, -1):
    result.append(values[i])
return result`,
      JAVA: `int[] result = new int[values.length];
for (int i = 0; i < values.length; i += 1) {
    result[i] = values[values.length - 1 - i];
}
return result;`,
      CPP: `vector<int> result;
for (int i = (int)values.size() - 1; i >= 0; i -= 1) result.push_back(values[i]);
return result;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "middle-of-list",
    title: "The Middle of the List",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Return the value at the middle of the list. When the list has an even " +
      "number of values there are two middles, and the answer is the second of " +
      "them. The list is never empty.",
    explanation:
      "Dividing the length by two is correct and, over real nodes, cheats: you " +
      "would have to walk the list once to count it and once more to reach the " +
      "middle. The interview answer is the fast/slow pointer — move one cursor " +
      "one step at a time and another two steps at a time, and when the fast one " +
      "runs off the end the slow one is standing on the middle. One pass, and " +
      "the same trick finds cycles, the start of a cycle, and the n-th node from " +
      "the end. Taking two steps at a time is also why the even case lands on " +
      "the second middle rather than the first.",
    constraints: [
      "The list has between 1 and 100,000 values.",
      "Each value is between -1,000,000 and 1,000,000.",
      "With an even count, return the second of the two middles.",
    ],
    hints: [
      "One cursor moving twice as fast as the other.",
      "When the fast cursor runs out, the slow one is at the middle.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "middleValue",
      params: [{ name: "values", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-linked-list", "dsa-two-pointers"],
    examples: [
      { input: "values = [1, 2, 3, 4, 5]", output: "3" },
      {
        input: "values = [1, 2, 3, 4, 5, 6]",
        output: "4",
        explanation: "Two middles, 3 and 4 — the second one is the answer.",
      },
    ],
    tests: [
      { args: [[1, 2, 3, 4, 5]], expected: 3 },
      { args: [[1, 2, 3, 4, 5, 6]], expected: 4 },
      { args: [[1]], expected: 1 },
      { args: [[1, 2]], expected: 2, hidden: true },
      { args: [[1, 2, 3]], expected: 2, hidden: true },
      { args: [[5, 6, 7, 8]], expected: 7, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let slow = 0;
let fast = 0;
while (fast < values.length && fast + 1 < values.length) {
  slow += 1;
  fast += 2;
}
return values[slow];`,
      TYPESCRIPT: `let slow = 0;
let fast = 0;
while (fast < values.length && fast + 1 < values.length) {
  slow += 1;
  fast += 2;
}
return values[slow];`,
      PYTHON: `slow = 0
fast = 0
while fast < len(values) and fast + 1 < len(values):
    slow += 1
    fast += 2
return values[slow]`,
      JAVA: `int slow = 0;
int fast = 0;
while (fast < values.length && fast + 1 < values.length) {
    slow += 1;
    fast += 2;
}
return values[slow];`,
      CPP: `int slow = 0;
int fast = 0;
while (fast < (int)values.size() && fast + 1 < (int)values.size()) {
    slow += 1;
    fast += 2;
}
return values[slow];`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "list-is-palindrome",
    title: "Is the List a Palindrome?",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Decide whether the list reads the same forwards and backwards. An empty " +
      "list and a single-value list both count as palindromes.",
    explanation:
      "Over values this is two indices walking towards each other. Over real " +
      "nodes it is the interview question, because a singly linked list cannot " +
      "be walked backwards: the O(1)-memory answer finds the middle with the " +
      "fast/slow pointer, reverses the second half in place, compares the two " +
      "halves, and — if you are being thorough — puts the list back the way it " +
      "was. Copying the values into an array first is O(n) memory and is worth " +
      "saying out loud as the simple version before reaching for the clever one.",
    constraints: [
      "The list has between 0 and 100,000 values.",
      "Each value is between -1,000,000 and 1,000,000.",
      "Empty and single-value lists are palindromes.",
    ],
    hints: [
      "Two indices from the ends is the value-based version.",
      "With real nodes you would reverse the second half instead.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "listIsPalindrome",
      params: [{ name: "values", type: "int[]" }],
      returns: "bool",
    },
    topicSlugs: ["dsa-linked-list", "dsa-two-pointers"],
    examples: [
      { input: "values = [1, 2, 2, 1]", output: "true" },
      { input: "values = [1, 2]", output: "false" },
    ],
    tests: [
      { args: [[1, 2, 2, 1]], expected: true },
      { args: [[1, 2]], expected: false },
      { args: [[1]], expected: true },
      { args: [[]], expected: true, hidden: true },
      { args: [[1, 2, 1]], expected: true, hidden: true },
      { args: [[1, 2, 3]], expected: false, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let left = 0;
let right = values.length - 1;
while (left < right) {
  if (values[left] !== values[right]) return false;
  left += 1;
  right -= 1;
}
return true;`,
      TYPESCRIPT: `let left = 0;
let right = values.length - 1;
while (left < right) {
  if (values[left] !== values[right]) return false;
  left += 1;
  right -= 1;
}
return true;`,
      PYTHON: `left = 0
right = len(values) - 1
while left < right:
    if values[left] != values[right]:
        return False
    left += 1
    right -= 1
return True`,
      JAVA: `int left = 0;
int right = values.length - 1;
while (left < right) {
    if (values[left] != values[right]) return false;
    left += 1;
    right -= 1;
}
return true;`,
      CPP: `int left = 0;
int right = (int)values.size() - 1;
while (left < right) {
    if (values[left] != values[right]) return false;
    left += 1;
    right -= 1;
}
return true;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "remove-nth-from-end",
    title: "Remove the n-th Node From the End",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Remove the value that is n places from the end of the list and return " +
      "what is left. With n = 1 that is the last value. n is never larger than " +
      "the list.",
    explanation:
      "The one-pass answer is two cursors n apart: move the first cursor n " +
      "steps ahead, then move both together until the leading one falls off the " +
      "end — at which point the trailing one is sitting exactly where you need " +
      "to cut. Counting the length first and subtracting is two passes and is " +
      "perfectly acceptable, but the gap technique is what the question is " +
      "fishing for, and it is the same idea as the fast/slow pointer with a " +
      "fixed distance instead of a fixed ratio. Removing the head is the case " +
      "that breaks naive pointer code, which is why real implementations use a " +
      "dummy node in front.",
    constraints: [
      "The list has between 1 and 100,000 values.",
      "n is between 1 and the length of the list.",
      "Return a new list.",
    ],
    hints: [
      "Two cursors kept exactly n apart.",
      "When the leading cursor runs out, the trailing one is at the cut.",
      "Removing the first value is the case worth checking.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "removeNthFromEnd",
      params: [
        { name: "values", type: "int[]" },
        { name: "n", type: "int" },
      ],
      returns: "int[]",
    },
    topicSlugs: ["dsa-linked-list", "dsa-two-pointers"],
    examples: [
      { input: "values = [1, 2, 3, 4, 5], n = 2", output: "[1, 2, 3, 5]" },
      { input: "values = [1], n = 1", output: "[]" },
    ],
    tests: [
      { args: [[1, 2, 3, 4, 5], 2], expected: [1, 2, 3, 5] },
      { args: [[1], 1], expected: [] },
      { args: [[1, 2], 1], expected: [1] },
      { args: [[1, 2], 2], expected: [2], hidden: true },
      { args: [[1, 2, 3], 3], expected: [2, 3], hidden: true },
      { args: [[1, 2, 3, 4], 1], expected: [1, 2, 3], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const cut = values.length - n;
const result = [];
for (let i = 0; i < values.length; i += 1) {
  if (i !== cut) result.push(values[i]);
}
return result;`,
      TYPESCRIPT: `const cut = values.length - n;
const result: number[] = [];
for (let i = 0; i < values.length; i += 1) {
  if (i !== cut) result.push(values[i]);
}
return result;`,
      PYTHON: `cut = len(values) - n
return [value for i, value in enumerate(values) if i != cut]`,
      JAVA: `int cut = values.length - n;
int[] result = new int[values.length - 1];
int at = 0;
for (int i = 0; i < values.length; i += 1) {
    if (i != cut) result[at++] = values[i];
}
return result;`,
      CPP: `int cut = (int)values.size() - n;
vector<int> result;
for (int i = 0; i < (int)values.size(); i += 1) {
    if (i != cut) result.push_back(values[i]);
}
return result;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "swap-adjacent-pairs",
    title: "Swap Every Two Values",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Swap the values in pairs: the first with the second, the third with the " +
      "fourth, and so on. A value left over at the end because the list is odd " +
      "stays where it is.",
    explanation:
      "Step two at a time and swap within each step. The reason this is a " +
      "medium over real nodes is that swapping two nodes means rewiring three " +
      "links — the node before the pair, and both nodes in it — and the node " +
      "before the first pair does not exist, which is the case a dummy head is " +
      "invented to solve. Over values the loop is short, and the detail that " +
      "still matters is the bound: stopping at length - 1 is what leaves the odd " +
      "final value alone instead of reading past the end.",
    constraints: [
      "The list has between 0 and 100,000 values.",
      "Each value is between -1,000,000 and 1,000,000.",
      "An odd final value is left in place.",
    ],
    hints: [
      "Step by two, swapping each pair.",
      "Stop before the last position when the length is odd.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "swapAdjacentPairs",
      params: [{ name: "values", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-linked-list", "js-arrays"],
    examples: [
      { input: "values = [1, 2, 3, 4]", output: "[2, 1, 4, 3]" },
      {
        input: "values = [1, 2, 3]",
        output: "[2, 1, 3]",
        explanation: "3 has no partner, so it does not move.",
      },
    ],
    tests: [
      { args: [[1, 2, 3, 4]], expected: [2, 1, 4, 3] },
      { args: [[]], expected: [] },
      { args: [[1]], expected: [1] },
      { args: [[1, 2, 3]], expected: [2, 1, 3], hidden: true },
      { args: [[1, 2]], expected: [2, 1], hidden: true },
      { args: [[1, 2, 3, 4, 5]], expected: [2, 1, 4, 3, 5], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const result = values.slice();
for (let i = 0; i + 1 < result.length; i += 2) {
  const held = result[i];
  result[i] = result[i + 1];
  result[i + 1] = held;
}
return result;`,
      TYPESCRIPT: `const result: number[] = values.slice();
for (let i = 0; i + 1 < result.length; i += 2) {
  const held = result[i];
  result[i] = result[i + 1];
  result[i + 1] = held;
}
return result;`,
      PYTHON: `result = list(values)
for i in range(0, len(result) - 1, 2):
    result[i], result[i + 1] = result[i + 1], result[i]
return result`,
      JAVA: `int[] result = Arrays.copyOf(values, values.length);
for (int i = 0; i + 1 < result.length; i += 2) {
    int held = result[i];
    result[i] = result[i + 1];
    result[i + 1] = held;
}
return result;`,
      CPP: `vector<int> result = values;
for (int i = 0; i + 1 < (int)result.size(); i += 2) {
    swap(result[i], result[i + 1]);
}
return result;`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "odd-even-positions",
    title: "Odd Positions, Then Even",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Rearrange the list so that everything in an odd position comes first, " +
      "followed by everything in an even position, with both groups keeping " +
      "their relative order. Positions are counted from 1, so the first value " +
      "is in an odd position.",
    explanation:
      "This is about positions, not values — an easy misreading that the " +
      "examples are chosen to catch. Two passes and one output list is the " +
      "clearest version; over real nodes you would instead weave two chains and " +
      "join them, which is the same idea with links. The constraint that both " +
      "groups keep their order is what rules out swapping in place, and it is " +
      "the sort of requirement worth reading twice before writing anything.",
    constraints: [
      "The list has between 0 and 100,000 values.",
      "Positions are counted from 1.",
      "Both groups keep their relative order.",
    ],
    hints: [
      "Positions, not values — check the examples.",
      "Collect the odd positions, then the even ones.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "oddEvenPositions",
      params: [{ name: "values", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-linked-list", "js-arrays"],
    examples: [
      {
        input: "values = [1, 2, 3, 4, 5]",
        output: "[1, 3, 5, 2, 4]",
        explanation: "Positions 1, 3, 5 first, then positions 2 and 4.",
      },
      { input: "values = [2, 1, 3, 5, 6, 4, 7]", output: "[2, 3, 6, 7, 1, 5, 4]" },
    ],
    tests: [
      { args: [[1, 2, 3, 4, 5]], expected: [1, 3, 5, 2, 4] },
      { args: [[2, 1, 3, 5, 6, 4, 7]], expected: [2, 3, 6, 7, 1, 5, 4] },
      { args: [[]], expected: [] },
      { args: [[1]], expected: [1], hidden: true },
      { args: [[1, 2]], expected: [1, 2], hidden: true },
      { args: [[1, 2, 3]], expected: [1, 3, 2], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const result = [];
for (let i = 0; i < values.length; i += 2) result.push(values[i]);
for (let i = 1; i < values.length; i += 2) result.push(values[i]);
return result;`,
      TYPESCRIPT: `const result: number[] = [];
for (let i = 0; i < values.length; i += 2) result.push(values[i]);
for (let i = 1; i < values.length; i += 2) result.push(values[i]);
return result;`,
      PYTHON: `return list(values[0::2]) + list(values[1::2])`,
      JAVA: `int[] result = new int[values.length];
int at = 0;
for (int i = 0; i < values.length; i += 2) result[at++] = values[i];
for (int i = 1; i < values.length; i += 2) result[at++] = values[i];
return result;`,
      CPP: `vector<int> result;
for (int i = 0; i < (int)values.size(); i += 2) result.push_back(values[i]);
for (int i = 1; i < (int)values.size(); i += 2) result.push_back(values[i]);
return result;`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "reorder-list-alternating",
    title: "Fold the List Together",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Reorder the list so it reads first value, last value, second value, " +
      "second-last value, and so on, until everything has been used. The list " +
      "is folded in half rather than reversed.",
    explanation:
      "Over values, two indices walking towards each other and taking turns is " +
      "the whole solution. The reason this is asked about linked lists is the " +
      "three-step recipe it forces: find the middle with the fast/slow pointer, " +
      "reverse the second half, then weave the two halves together one node at " +
      "a time. Each of those three steps is a problem earlier in this file, " +
      "which is what makes it a good final question — it is not one trick but " +
      "three, composed.",
    constraints: [
      "The list has between 0 and 100,000 values.",
      "Each value is between -1,000,000 and 1,000,000.",
      "Return a new list.",
    ],
    hints: [
      "Take from the front, then from the back, then from the front.",
      "With real nodes: find the middle, reverse the tail, weave.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "reorderAlternating",
      params: [{ name: "values", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-linked-list", "dsa-two-pointers"],
    examples: [
      { input: "values = [1, 2, 3, 4]", output: "[1, 4, 2, 3]" },
      { input: "values = [1, 2, 3, 4, 5]", output: "[1, 5, 2, 4, 3]" },
    ],
    tests: [
      { args: [[1, 2, 3, 4]], expected: [1, 4, 2, 3] },
      { args: [[1, 2, 3, 4, 5]], expected: [1, 5, 2, 4, 3] },
      { args: [[1]], expected: [1] },
      { args: [[]], expected: [], hidden: true },
      { args: [[1, 2]], expected: [1, 2], hidden: true },
      { args: [[1, 2, 3]], expected: [1, 3, 2], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const result = [];
let left = 0;
let right = values.length - 1;
while (left <= right) {
  result.push(values[left]);
  if (left !== right) result.push(values[right]);
  left += 1;
  right -= 1;
}
return result;`,
      TYPESCRIPT: `const result: number[] = [];
let left = 0;
let right = values.length - 1;
while (left <= right) {
  result.push(values[left]);
  if (left !== right) result.push(values[right]);
  left += 1;
  right -= 1;
}
return result;`,
      PYTHON: `result = []
left = 0
right = len(values) - 1
while left <= right:
    result.append(values[left])
    if left != right:
        result.append(values[right])
    left += 1
    right -= 1
return result`,
      JAVA: `int[] result = new int[values.length];
int at = 0;
int left = 0;
int right = values.length - 1;
while (left <= right) {
    result[at++] = values[left];
    if (left != right) result[at++] = values[right];
    left += 1;
    right -= 1;
}
return result;`,
      CPP: `vector<int> result;
int left = 0;
int right = (int)values.size() - 1;
while (left <= right) {
    result.push_back(values[left]);
    if (left != right) result.push_back(values[right]);
    left += 1;
    right -= 1;
}
return result;`,
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "add-two-number-lists",
    title: "Add Two Numbers Stored Backwards",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Two numbers are stored as lists of single digits with the least " +
      "significant digit first, so [2, 4, 3] is the number 342. Add them and " +
      "return the total in the same backwards form.",
    explanation:
      "Storing the digits backwards is a gift, not an obstacle: addition starts " +
      "at the least significant digit, so the lists are already in the order you " +
      "need. Walk both at once with a carry, treating a list that has run out as " +
      "contributing 0, and keep going while either list has digits left or a " +
      "carry is still pending. That last condition is the one people forget, and " +
      "it is exactly what makes 99 + 1 come out as three digits rather than two.",
    constraints: [
      "Each list has between 1 and 100 digits.",
      "Each digit is between 0 and 9.",
      "Neither number has leading zeros, except the number 0 itself.",
    ],
    hints: [
      "The backwards order is already the order addition needs.",
      "A finished list contributes 0.",
      "Keep looping while a carry is still pending.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "addNumberLists",
      params: [
        { name: "first", type: "int[]" },
        { name: "second", type: "int[]" },
      ],
      returns: "int[]",
    },
    topicSlugs: ["dsa-linked-list", "dsa-arrays"],
    examples: [
      {
        input: "first = [2, 4, 3], second = [5, 6, 4]",
        output: "[7, 0, 8]",
        explanation: "342 + 465 = 807.",
      },
      {
        input: "first = [9, 9], second = [1]",
        output: "[0, 0, 1]",
        explanation: "99 + 1 = 100, which needs one more digit.",
      },
    ],
    tests: [
      {
        args: [
          [2, 4, 3],
          [5, 6, 4],
        ],
        expected: [7, 0, 8],
      },
      { args: [[0], [0]], expected: [0] },
      { args: [[9, 9], [1]], expected: [0, 0, 1] },
      { args: [[9], [9]], expected: [8, 1], hidden: true },
      { args: [[1], [9, 9]], expected: [0, 0, 1], hidden: true },
      { args: [[5], [5]], expected: [0, 1], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const result = [];
let carry = 0;
let i = 0;
while (i < first.length || i < second.length || carry > 0) {
  const a = i < first.length ? first[i] : 0;
  const b = i < second.length ? second[i] : 0;
  const total = a + b + carry;
  result.push(total % 10);
  carry = Math.floor(total / 10);
  i += 1;
}
return result;`,
      TYPESCRIPT: `const result: number[] = [];
let carry = 0;
let i = 0;
while (i < first.length || i < second.length || carry > 0) {
  const a = i < first.length ? first[i] : 0;
  const b = i < second.length ? second[i] : 0;
  const total = a + b + carry;
  result.push(total % 10);
  carry = Math.floor(total / 10);
  i += 1;
}
return result;`,
      PYTHON: `result = []
carry = 0
i = 0
while i < len(first) or i < len(second) or carry > 0:
    a = first[i] if i < len(first) else 0
    b = second[i] if i < len(second) else 0
    total = a + b + carry
    result.append(total % 10)
    carry = total // 10
    i += 1
return result`,
      JAVA: `List<Integer> digits = new ArrayList<>();
int carry = 0;
int i = 0;
while (i < first.length || i < second.length || carry > 0) {
    int a = i < first.length ? first[i] : 0;
    int b = i < second.length ? second[i] : 0;
    int total = a + b + carry;
    digits.add(total % 10);
    carry = total / 10;
    i += 1;
}
int[] result = new int[digits.size()];
for (int at = 0; at < digits.size(); at += 1) result[at] = digits.get(at);
return result;`,
      CPP: `vector<int> result;
int carry = 0;
size_t i = 0;
while (i < first.size() || i < second.size() || carry > 0) {
    int a = i < first.size() ? first[i] : 0;
    int b = i < second.size() ? second[i] : 0;
    int total = a + b + carry;
    result.push_back(total % 10);
    carry = total / 10;
    i += 1;
}
return result;`,
    },
  },

  // ── 9 ───────────────────────────────────────────────────────────────────
  {
    slug: "detect-cycle-start",
    title: "Where Does the Loop Begin?",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "A list is given as links rather than values: position i holds the " +
      "position of the next node, or -1 for the end. Starting from position 0, " +
      "return the position where a loop begins, or -1 if the list ends " +
      "properly. An empty list has no loop.",
    explanation:
      "A cycle cannot be written down as a list of values, which is why this " +
      "problem takes the link form. Floyd's algorithm finds the loop with two " +
      "cursors, one moving twice as fast: if they ever land on the same node " +
      "there is a loop, and if the fast one reaches the end there is not. " +
      "Finding *where* the loop starts is the second half, and it is the part " +
      "worth remembering: put one cursor back at the start, move both one step " +
      "at a time, and they meet at the entrance. That works because the distance " +
      "from the start to the entrance equals the distance from the meeting point " +
      "to the entrance, once you go round.",
    constraints: [
      "The list has between 0 and 100,000 nodes.",
      "Each link is a valid position or -1.",
      "The walk always begins at position 0.",
    ],
    hints: [
      "Two cursors, one moving twice as fast, detect the loop.",
      "To find the entrance, restart one cursor and move both one step at a time.",
      "An empty input has no loop.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "detectCycleStart",
      params: [{ name: "links", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-linked-list", "dsa-two-pointers"],
    examples: [
      {
        input: "links = [1, 2, 3, 1]",
        output: "1",
        explanation: "0 → 1 → 2 → 3 → 1, so the loop begins at position 1.",
      },
      { input: "links = [1, 2, 3, -1]", output: "-1" },
    ],
    tests: [
      { args: [[1, 2, 3, 1]], expected: 1 },
      { args: [[1, 2, 3, -1]], expected: -1 },
      { args: [[-1]], expected: -1 },
      { args: [[0]], expected: 0, hidden: true },
      { args: [[1, 0]], expected: 0, hidden: true },
      { args: [[]], expected: -1, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `if (links.length === 0) return -1;
const step = (from) => (from === -1 ? -1 : links[from]);
let slow = 0;
let fast = 0;
while (true) {
  slow = step(slow);
  fast = step(step(fast));
  if (fast === -1 || slow === -1) return -1;
  if (slow === fast) break;
}
let entry = 0;
while (entry !== slow) {
  entry = step(entry);
  slow = step(slow);
}
return entry;`,
      TYPESCRIPT: `if (links.length === 0) return -1;
const step = (from: number): number => (from === -1 ? -1 : links[from]);
let slow = 0;
let fast = 0;
while (true) {
  slow = step(slow);
  fast = step(step(fast));
  if (fast === -1 || slow === -1) return -1;
  if (slow === fast) break;
}
let entry = 0;
while (entry !== slow) {
  entry = step(entry);
  slow = step(slow);
}
return entry;`,
      PYTHON: `if not links:
    return -1

def step(from_index: int) -> int:
    return -1 if from_index == -1 else links[from_index]

slow = 0
fast = 0
while True:
    slow = step(slow)
    fast = step(step(fast))
    if fast == -1 or slow == -1:
        return -1
    if slow == fast:
        break
entry = 0
while entry != slow:
    entry = step(entry)
    slow = step(slow)
return entry`,
      JAVA: `if (links.length == 0) return -1;
int slow = 0;
int fast = 0;
while (true) {
    slow = slow == -1 ? -1 : links[slow];
    fast = fast == -1 ? -1 : links[fast];
    fast = fast == -1 ? -1 : links[fast];
    if (fast == -1 || slow == -1) return -1;
    if (slow == fast) break;
}
int entry = 0;
while (entry != slow) {
    entry = links[entry];
    slow = links[slow];
}
return entry;`,
      CPP: `if (links.empty()) return -1;
int slow = 0;
int fast = 0;
while (true) {
    slow = slow == -1 ? -1 : links[slow];
    fast = fast == -1 ? -1 : links[fast];
    fast = fast == -1 ? -1 : links[fast];
    if (fast == -1 || slow == -1) return -1;
    if (slow == fast) break;
}
int entry = 0;
while (entry != slow) {
    entry = links[entry];
    slow = links[slow];
}
return entry;`,
    },
  },

  // ── 10 ──────────────────────────────────────────────────────────────────
  {
    slug: "remove-all-duplicate-values",
    title: "Keep Only the Values That Appear Once",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "The list is sorted. Remove every value that appears more than once — " +
      "not just the extra copies, but all of them — and return what is left, " +
      "still in order.",
    explanation:
      "The distinction from ordinary de-duplication is the whole question: " +
      "[1, 1, 2] becomes [2], not [1, 2]. Because the list is sorted, equal " +
      "values are neighbours, so walk it in runs: find where each run of equal " +
      "values ends, and keep the value only when the run has length one. Over " +
      "real nodes the same logic needs a pointer to the node *before* the run so " +
      "the whole run can be skipped, which is the other reason a dummy head " +
      "exists.",
    constraints: [
      "The list has between 0 and 100,000 values, sorted in non-decreasing order.",
      "Each value is between -1,000,000 and 1,000,000.",
      "A value appearing twice is removed entirely.",
    ],
    hints: [
      "Sorted input means equal values are neighbours.",
      "Walk in runs and keep a run only when its length is one.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "keepValuesAppearingOnce",
      params: [{ name: "values", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-linked-list", "dsa-two-pointers"],
    examples: [
      {
        input: "values = [1, 2, 3, 3, 4, 4, 5]",
        output: "[1, 2, 5]",
        explanation: "Both 3s and both 4s go.",
      },
      { input: "values = [1, 1, 1, 2, 3]", output: "[2, 3]" },
    ],
    tests: [
      { args: [[1, 2, 3, 3, 4, 4, 5]], expected: [1, 2, 5] },
      { args: [[1, 1, 1, 2, 3]], expected: [2, 3] },
      { args: [[1, 2, 3]], expected: [1, 2, 3] },
      { args: [[]], expected: [], hidden: true },
      { args: [[1, 1]], expected: [], hidden: true },
      { args: [[1, 1, 2, 2]], expected: [], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const result = [];
let at = 0;
while (at < values.length) {
  let end = at;
  while (end + 1 < values.length && values[end + 1] === values[at]) end += 1;
  if (end === at) result.push(values[at]);
  at = end + 1;
}
return result;`,
      TYPESCRIPT: `const result: number[] = [];
let at = 0;
while (at < values.length) {
  let end = at;
  while (end + 1 < values.length && values[end + 1] === values[at]) end += 1;
  if (end === at) result.push(values[at]);
  at = end + 1;
}
return result;`,
      PYTHON: `result = []
at = 0
while at < len(values):
    end = at
    while end + 1 < len(values) and values[end + 1] == values[at]:
        end += 1
    if end == at:
        result.append(values[at])
    at = end + 1
return result`,
      JAVA: `List<Integer> kept = new ArrayList<>();
int at = 0;
while (at < values.length) {
    int end = at;
    while (end + 1 < values.length && values[end + 1] == values[at]) end += 1;
    if (end == at) kept.add(values[at]);
    at = end + 1;
}
int[] result = new int[kept.size()];
for (int i = 0; i < kept.size(); i += 1) result[i] = kept.get(i);
return result;`,
      CPP: `vector<int> result;
int at = 0;
while (at < (int)values.size()) {
    int end = at;
    while (end + 1 < (int)values.size() && values[end + 1] == values[at]) end += 1;
    if (end == at) result.push_back(values[at]);
    at = end + 1;
}
return result;`,
    },
  },
];
