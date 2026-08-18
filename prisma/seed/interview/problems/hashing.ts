import type { SeedProblem } from "../../problems/types";

/**
 * Hash maps and sets — memory traded for time.
 *
 * The order is deliberate: lookup ("have I seen this?"), then counting, then
 * keying by something derived from the value rather than the value itself.
 * That last idea — a canonical key, like a word's sorted letters — is what
 * turns grouping problems from quadratic comparisons into one pass, and it is
 * the step most people have to be shown once.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const HASHING_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "two-sum-indices",
    title: "Two Sum",
    difficulty: "EASY",
    interviewFrequency: "VERY_HIGH",
    description:
      "Given a list of numbers and a target, find the two positions whose " +
      "values add up to the target and return them as [smaller, larger]. " +
      "Exactly one pair works, and you may not use the same position twice.",
    explanation:
      "The obvious solution tries every pair, which is O(n²). The hash-map " +
      "solution is one pass: for each number, the partner it needs is target " +
      "minus that number, so ask a map whether you have already seen that " +
      "partner. If you have, you are done; if not, record the current number " +
      "with its position and carry on. Storing as you go — rather than filling " +
      "the map first — is what stops a number pairing with itself. This is the " +
      "most-asked interview problem there is, and the pattern behind it (look " +
      "for the complement, not for the pair) reappears in three-sum, four-sum " +
      "and every subarray-sum problem later on.",
    constraints: [
      "The list has between 2 and 10,000 numbers.",
      "Each number is between -1,000,000 and 1,000,000.",
      "Exactly one pair adds up to the target.",
      "Return the two positions in increasing order.",
    ],
    hints: [
      "For each number, work out what its partner would have to be.",
      "A hash map from value to position answers 'have I seen the partner?' in O(1).",
      "Record each number after you check for its partner, not before.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "twoSum",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "target", type: "int" },
      ],
      returns: "int[]",
    },
    topicSlugs: ["dsa-hashing", "js-objects", "data-structures"],
    examples: [
      {
        input: "numbers = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "2 + 7 is 9, and those values sit at positions 0 and 1.",
      },
      { input: "numbers = [3, 2, 4], target = 6", output: "[1, 2]" },
    ],
    tests: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
      { args: [[3, 3], 6], expected: [0, 1] },
      { args: [[-1, 0, 5], 4], expected: [0, 2], hidden: true },
      { args: [[0, 4, 3, 0], 0], expected: [0, 3], hidden: true },
      { args: [[1, 2, 3, 4, 5], 9], expected: [3, 4], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const seen = new Map();
for (let i = 0; i < numbers.length; i += 1) {
  const partner = target - numbers[i];
  if (seen.has(partner)) return [seen.get(partner), i];
  seen.set(numbers[i], i);
}
return [];`,
      TYPESCRIPT: `const seen = new Map<number, number>();
for (let i = 0; i < numbers.length; i += 1) {
  const partner = target - numbers[i];
  const at = seen.get(partner);
  if (at !== undefined) return [at, i];
  seen.set(numbers[i], i);
}
return [];`,
      PYTHON: `seen = {}
for i, value in enumerate(numbers):
    partner = target - value
    if partner in seen:
        return [seen[partner], i]
    seen[value] = i
return []`,
      JAVA: `Map<Integer, Integer> seen = new HashMap<>();
for (int i = 0; i < numbers.length; i += 1) {
    int partner = target - numbers[i];
    if (seen.containsKey(partner)) {
        return new int[] { seen.get(partner), i };
    }
    seen.put(numbers[i], i);
}
return new int[0];`,
      CPP: `unordered_map<int, int> seen;
for (int i = 0; i < (int)numbers.size(); i += 1) {
    int partner = target - numbers[i];
    auto found = seen.find(partner);
    if (found != seen.end()) return vector<int>{ found->second, i };
    seen[numbers[i]] = i;
}
return vector<int>{};`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "contains-duplicate",
    title: "Contains a Duplicate",
    difficulty: "EASY",
    interviewFrequency: "VERY_HIGH",
    description:
      "Return true if any value appears more than once in the list, and false " +
      "if every value is distinct.",
    explanation:
      "Walk the list adding each value to a set, and the moment you meet a " +
      "value the set already holds, you have your answer. That is O(n) time and " +
      "O(n) memory, and it stops early on the first repeat rather than always " +
      "examining everything. Sorting first and comparing neighbours also works " +
      "in O(n log n) with no extra memory, which is the right answer when memory " +
      "is the constraint — being able to say which trade-off you are making is " +
      "most of what this question is testing.",
    constraints: [
      "The list has between 1 and 100,000 numbers.",
      "Each number is between -1,000,000 and 1,000,000.",
    ],
    hints: [
      "A set answers 'have I seen this before?' in constant time.",
      "You can stop the moment you find the first repeat.",
    ],
    estimatedTime: "10 min",
    signature: {
      name: "containsDuplicate",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "bool",
    },
    topicSlugs: ["dsa-hashing", "js-arrays", "fs-js-collections"],
    examples: [
      { input: "numbers = [1, 2, 3, 1]", output: "true" },
      { input: "numbers = [1, 2, 3, 4]", output: "false" },
    ],
    tests: [
      { args: [[1, 2, 3, 1]], expected: true },
      { args: [[1, 2, 3, 4]], expected: false },
      { args: [[5]], expected: false },
      { args: [[1, 1]], expected: true, hidden: true },
      { args: [[-1, 0, 1, -1]], expected: true, hidden: true },
      { args: [[10, 20, 30, 40, 50]], expected: false, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const seen = new Set();
for (const value of numbers) {
  if (seen.has(value)) return true;
  seen.add(value);
}
return false;`,
      TYPESCRIPT: `const seen = new Set<number>();
for (const value of numbers) {
  if (seen.has(value)) return true;
  seen.add(value);
}
return false;`,
      PYTHON: `seen = set()
for value in numbers:
    if value in seen:
        return True
    seen.add(value)
return False`,
      JAVA: `Set<Integer> seen = new HashSet<>();
for (int value : numbers) {
    if (!seen.add(value)) return true;
}
return false;`,
      CPP: `unordered_set<int> seen;
for (int value : numbers) {
    if (seen.count(value)) return true;
    seen.insert(value);
}
return false;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "first-repeated-value",
    title: "First Repeated Value",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Return the first value in the list that you meet for a second time — " +
      "the one whose *second* appearance comes earliest. If every value is " +
      "distinct, return -1.",
    explanation:
      "The wording is the whole problem. 'First repeated' does not mean the " +
      "repeated value that appears earliest in the list; it means the one that " +
      "completes its repeat earliest. Reading left to right with a set gives " +
      "you exactly that for free: the first time you meet a value the set " +
      "already holds, that value's second appearance is the earliest second " +
      "appearance in the list, because you have not skipped anything. Getting " +
      "this right is a lesson in reading the specification before reaching for " +
      "an algorithm.",
    constraints: [
      "The list has between 1 and 100,000 numbers.",
      "Each number is between -1,000,000 and 1,000,000.",
      "Return -1 when no value repeats.",
    ],
    hints: [
      "Read left to right and stop at the first value your set already holds.",
      "The answer is about which repeat completes first, not which value starts first.",
    ],
    estimatedTime: "10 min",
    signature: {
      name: "firstRepeatedValue",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-hashing", "js-arrays"],
    examples: [
      {
        input: "numbers = [2, 5, 1, 2, 3, 5, 1, 2, 4]",
        output: "2",
        explanation: "2 repeats at position 3, before 5 repeats at position 5.",
      },
      {
        input: "numbers = [2, 1, 1, 2, 3, 5, 1, 2, 4]",
        output: "1",
        explanation: "Here 1 completes its repeat first, even though 2 came first.",
      },
    ],
    tests: [
      { args: [[2, 5, 1, 2, 3, 5, 1, 2, 4]], expected: 2 },
      { args: [[2, 1, 1, 2, 3, 5, 1, 2, 4]], expected: 1 },
      { args: [[1, 2, 3, 4]], expected: -1 },
      { args: [[1]], expected: -1, hidden: true },
      { args: [[7, 7]], expected: 7, hidden: true },
      { args: [[3, 1, 3, 1]], expected: 3, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const seen = new Set();
for (const value of numbers) {
  if (seen.has(value)) return value;
  seen.add(value);
}
return -1;`,
      TYPESCRIPT: `const seen = new Set<number>();
for (const value of numbers) {
  if (seen.has(value)) return value;
  seen.add(value);
}
return -1;`,
      PYTHON: `seen = set()
for value in numbers:
    if value in seen:
        return value
    seen.add(value)
return -1`,
      JAVA: `Set<Integer> seen = new HashSet<>();
for (int value : numbers) {
    if (!seen.add(value)) return value;
}
return -1;`,
      CPP: `unordered_set<int> seen;
for (int value : numbers) {
    if (seen.count(value)) return value;
    seen.insert(value);
}
return -1;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "note-from-letters",
    title: "Note From Letters",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "You want to spell out a note using letters cut from a page. Return true " +
      "if the page contains enough of each letter to spell the note. Each " +
      "letter on the page can be used at most once, and letters are lowercase.",
    explanation:
      "Counting, not membership: it is not enough that the page contains an " +
      "'a', it must contain as many 'a's as the note needs. So count the " +
      "letters on the page into a map, then walk the note decrementing. The " +
      "moment a count would go below zero, the page is short of that letter and " +
      "the answer is false. Counting the page rather than the note is the small " +
      "choice that lets you stop early instead of comparing two finished maps.",
    constraints: [
      "Both strings are between 0 and 100,000 characters long.",
      "Both contain lowercase English letters only.",
      "An empty note can always be spelled.",
    ],
    hints: [
      "Membership is not enough — you need counts.",
      "Count the page first, then spend those letters walking the note.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "canSpellNote",
      params: [
        { name: "note", type: "string" },
        { name: "page", type: "string" },
      ],
      returns: "bool",
    },
    topicSlugs: ["dsa-hashing", "js-objects", "fs-js-collections"],
    examples: [
      { input: 'note = "aa", page = "aab"', output: "true" },
      {
        input: 'note = "aa", page = "ab"',
        output: "false",
        explanation: "The page has only one a.",
      },
    ],
    tests: [
      { args: ["aa", "aab"], expected: true },
      { args: ["aa", "ab"], expected: false },
      { args: ["a", "b"], expected: false },
      { args: ["", "abc"], expected: true, hidden: true },
      { args: ["abc", "cba"], expected: true, hidden: true },
      { args: ["aabb", "ab"], expected: false, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const available = new Map();
for (const letter of page) {
  available.set(letter, (available.get(letter) ?? 0) + 1);
}
for (const letter of note) {
  const left = available.get(letter) ?? 0;
  if (left === 0) return false;
  available.set(letter, left - 1);
}
return true;`,
      TYPESCRIPT: `const available = new Map<string, number>();
for (const letter of page) {
  available.set(letter, (available.get(letter) ?? 0) + 1);
}
for (const letter of note) {
  const left = available.get(letter) ?? 0;
  if (left === 0) return false;
  available.set(letter, left - 1);
}
return true;`,
      PYTHON: `available = {}
for letter in page:
    available[letter] = available.get(letter, 0) + 1
for letter in note:
    left = available.get(letter, 0)
    if left == 0:
        return False
    available[letter] = left - 1
return True`,
      JAVA: `Map<Character, Integer> available = new HashMap<>();
for (char letter : page.toCharArray()) {
    available.put(letter, available.getOrDefault(letter, 0) + 1);
}
for (char letter : note.toCharArray()) {
    int left = available.getOrDefault(letter, 0);
    if (left == 0) return false;
    available.put(letter, left - 1);
}
return true;`,
      CPP: `unordered_map<char, int> available;
for (char letter : page) available[letter] += 1;
for (char letter : note) {
    if (available[letter] == 0) return false;
    available[letter] -= 1;
}
return true;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "shared-values",
    title: "Values in Both Lists",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Return every value that appears in both lists, without duplicates, in " +
      "increasing order. If the lists share nothing, return an empty list.",
    explanation:
      "Put the first list into a set, then walk the second collecting anything " +
      "the set contains — into a second set, so a value appearing twice in the " +
      "second list is only collected once. Sort at the end because the question " +
      "asks for order, and a hash set has none. The alternative is sorting both " +
      "lists and walking them with two pointers, which uses no extra memory and " +
      "is what you would do if the inputs were already sorted or too large to " +
      "hold.",
    constraints: [
      "Each list has between 0 and 10,000 numbers.",
      "Each number is between -100,000 and 100,000.",
      "The result must be sorted in increasing order with no repeats.",
    ],
    hints: [
      "One set for membership, one set for the answer.",
      "A hash set has no order — sort before returning.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "sharedValues",
      params: [
        { name: "first", type: "int[]" },
        { name: "second", type: "int[]" },
      ],
      returns: "int[]",
    },
    topicSlugs: ["dsa-hashing", "js-arrays", "fs-js-collections"],
    examples: [
      { input: "first = [1, 2, 2, 1], second = [2, 2]", output: "[2]" },
      {
        input: "first = [4, 9, 5], second = [9, 4, 9, 8, 4]",
        output: "[4, 9]",
        explanation: "Both shared values appear once each, in increasing order.",
      },
    ],
    tests: [
      {
        args: [
          [1, 2, 2, 1],
          [2, 2],
        ],
        expected: [2],
      },
      {
        args: [
          [4, 9, 5],
          [9, 4, 9, 8, 4],
        ],
        expected: [4, 9],
      },
      {
        args: [
          [1, 2, 3],
          [4, 5],
        ],
        expected: [],
      },
      { args: [[1], [1]], expected: [1], hidden: true },
      {
        args: [
          [3, 1, 2],
          [2, 3],
        ],
        expected: [2, 3],
        hidden: true,
      },
      { args: [[], [1, 2]], expected: [], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const inFirst = new Set(first);
const shared = new Set();
for (const value of second) {
  if (inFirst.has(value)) shared.add(value);
}
return [...shared].sort((a, b) => a - b);`,
      TYPESCRIPT: `const inFirst = new Set<number>(first);
const shared = new Set<number>();
for (const value of second) {
  if (inFirst.has(value)) shared.add(value);
}
return [...shared].sort((a, b) => a - b);`,
      PYTHON: `in_first = set(first)
shared = set()
for value in second:
    if value in in_first:
        shared.add(value)
return sorted(shared)`,
      JAVA: `Set<Integer> inFirst = new HashSet<>();
for (int value : first) inFirst.add(value);
TreeSet<Integer> shared = new TreeSet<>();
for (int value : second) {
    if (inFirst.contains(value)) shared.add(value);
}
int[] result = new int[shared.size()];
int at = 0;
for (int value : shared) result[at++] = value;
return result;`,
      CPP: `unordered_set<int> inFirst(first.begin(), first.end());
set<int> shared;
for (int value : second) {
    if (inFirst.count(value)) shared.insert(value);
}
return vector<int>(shared.begin(), shared.end());`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "happy-number",
    title: "Happy Number",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Replace a number with the sum of the squares of its digits, then do it " +
      "again, and again. Some numbers reach 1 and stay there — those are happy. " +
      "The rest fall into a loop that never reaches 1. Return true if the given " +
      "number is happy.",
    explanation:
      "The process either reaches 1 or repeats a value it has already produced, " +
      "and once it repeats anything it will repeat forever. So keep a set of " +
      "every value you have produced: reaching 1 means happy, and producing a " +
      "value already in the set means a loop, which means not happy. There is " +
      "no third outcome — the digit-square sum of any number below 10^10 is " +
      "under 1,000, so the sequence has nowhere infinite to go. The same problem " +
      "can be solved with the fast/slow pointer from cycle detection, using no " +
      "memory at all.",
    constraints: [
      "The number is between 1 and 1,000,000.",
      "Only the digits matter, so the number is always positive.",
    ],
    hints: [
      "Every unhappy number ends up repeating a value it has already produced.",
      "A set of seen values turns 'does it loop?' into 'have I been here?'.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "isHappyNumber",
      params: [{ name: "number", type: "int" }],
      returns: "bool",
    },
    topicSlugs: ["dsa-hashing", "js-loops"],
    examples: [
      {
        input: "number = 19",
        output: "true",
        explanation: "19 → 82 → 68 → 100 → 1.",
      },
      { input: "number = 2", output: "false" },
    ],
    tests: [
      { args: [19], expected: true },
      { args: [2], expected: false },
      { args: [1], expected: true },
      { args: [7], expected: true, hidden: true },
      { args: [4], expected: false, hidden: true },
      { args: [100], expected: true, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const seen = new Set();
let current = number;
while (current !== 1 && !seen.has(current)) {
  seen.add(current);
  let total = 0;
  let left = current;
  while (left > 0) {
    const digit = left % 10;
    total += digit * digit;
    left = Math.floor(left / 10);
  }
  current = total;
}
return current === 1;`,
      TYPESCRIPT: `const seen = new Set<number>();
let current = number;
while (current !== 1 && !seen.has(current)) {
  seen.add(current);
  let total = 0;
  let left = current;
  while (left > 0) {
    const digit = left % 10;
    total += digit * digit;
    left = Math.floor(left / 10);
  }
  current = total;
}
return current === 1;`,
      PYTHON: `seen = set()
current = number
while current != 1 and current not in seen:
    seen.add(current)
    total = 0
    left = current
    while left > 0:
        digit = left % 10
        total += digit * digit
        left //= 10
    current = total
return current == 1`,
      JAVA: `Set<Integer> seen = new HashSet<>();
int current = number;
while (current != 1 && !seen.contains(current)) {
    seen.add(current);
    int total = 0;
    int left = current;
    while (left > 0) {
        int digit = left % 10;
        total += digit * digit;
        left /= 10;
    }
    current = total;
}
return current == 1;`,
      CPP: `unordered_set<int> seen;
int current = number;
while (current != 1 && !seen.count(current)) {
    seen.insert(current);
    int total = 0;
    int left = current;
    while (left > 0) {
        int digit = left % 10;
        total += digit * digit;
        left /= 10;
    }
    current = total;
}
return current == 1;`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "isomorphic-strings",
    title: "Same Shape, Different Letters",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Two strings have the same shape if you can turn one into the other by " +
      "renaming letters consistently: every occurrence of a letter becomes the " +
      'same new letter, and no two letters become the same one. "egg" and "add" ' +
      'have the same shape; "foo" and "bar" do not. Return true when the ' +
      "shapes match.",
    explanation:
      "One map is not enough, and that is the point of the problem. Mapping " +
      'left to right accepts "badc" against "baba", because nothing stops ' +
      "two different letters mapping onto the same target. You need the " +
      "renaming to be reversible: a map each way, and a mismatch in either " +
      "direction is a no. Strings of different lengths can never match, which " +
      "is worth checking first because it is free.",
    constraints: [
      "Both strings are between 0 and 50,000 characters long.",
      "They contain printable ASCII characters.",
      "Strings of different lengths never have the same shape.",
    ],
    hints: [
      "Check the lengths before anything else.",
      "One map is not enough — two letters must never map to the same letter.",
      "Keep a map in each direction and reject any disagreement.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "haveSameShape",
      params: [
        { name: "first", type: "string" },
        { name: "second", type: "string" },
      ],
      returns: "bool",
    },
    topicSlugs: ["dsa-hashing", "dsa-strings", "js-objects"],
    examples: [
      { input: 'first = "egg", second = "add"', output: "true" },
      {
        input: 'first = "foo", second = "bar"',
        output: "false",
        explanation: "o would have to become both a and r.",
      },
    ],
    tests: [
      { args: ["egg", "add"], expected: true },
      { args: ["foo", "bar"], expected: false },
      { args: ["paper", "title"], expected: true },
      { args: ["badc", "baba"], expected: false, hidden: true },
      { args: ["ab", "aa"], expected: false, hidden: true },
      { args: ["", ""], expected: true, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `if (first.length !== second.length) return false;
const forward = new Map();
const backward = new Map();
for (let i = 0; i < first.length; i += 1) {
  const from = first[i];
  const to = second[i];
  if (forward.has(from) && forward.get(from) !== to) return false;
  if (backward.has(to) && backward.get(to) !== from) return false;
  forward.set(from, to);
  backward.set(to, from);
}
return true;`,
      TYPESCRIPT: `if (first.length !== second.length) return false;
const forward = new Map<string, string>();
const backward = new Map<string, string>();
for (let i = 0; i < first.length; i += 1) {
  const from = first[i];
  const to = second[i];
  if (forward.has(from) && forward.get(from) !== to) return false;
  if (backward.has(to) && backward.get(to) !== from) return false;
  forward.set(from, to);
  backward.set(to, from);
}
return true;`,
      PYTHON: `if len(first) != len(second):
    return False
forward = {}
backward = {}
for from_char, to_char in zip(first, second):
    if from_char in forward and forward[from_char] != to_char:
        return False
    if to_char in backward and backward[to_char] != from_char:
        return False
    forward[from_char] = to_char
    backward[to_char] = from_char
return True`,
      JAVA: `if (first.length() != second.length()) return false;
Map<Character, Character> forward = new HashMap<>();
Map<Character, Character> backward = new HashMap<>();
for (int i = 0; i < first.length(); i += 1) {
    char from = first.charAt(i);
    char to = second.charAt(i);
    if (forward.containsKey(from) && forward.get(from) != to) return false;
    if (backward.containsKey(to) && backward.get(to) != from) return false;
    forward.put(from, to);
    backward.put(to, from);
}
return true;`,
      CPP: `if (first.size() != second.size()) return false;
unordered_map<char, char> forward;
unordered_map<char, char> backward;
for (size_t i = 0; i < first.size(); i += 1) {
    char from = first[i];
    char to = second[i];
    if (forward.count(from) && forward[from] != to) return false;
    if (backward.count(to) && backward[to] != from) return false;
    forward[from] = to;
    backward[to] = from;
}
return true;`,
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "group-anagrams",
    title: "Group Anagrams",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Group the words that are anagrams of one another — same letters, " +
      "different order. Return one string per group: that group's words in " +
      "alphabetical order, joined with commas. The groups themselves come back " +
      "in alphabetical order too, so the answer is the same every run.",
    explanation:
      "Comparing every word with every other word is O(n²) and needless. The " +
      "trick is a canonical key: two words are anagrams exactly when their " +
      "sorted letters are identical, so sorting each word gives you a key you " +
      "can group by in a hash map. One pass over the words, one sort per word, " +
      "and the groups fall out of the map. (When the words are long and the " +
      "alphabet small, a 26-slot letter count makes a cheaper key than sorting " +
      "— same idea, different canonical form.) The alphabetical ordering this " +
      "problem asks for is only so the answer is comparable; a real interviewer " +
      "will not care about order.",
    constraints: [
      "There are between 1 and 10,000 words.",
      "Each word is between 0 and 100 lowercase letters.",
      "Within a group, words are sorted alphabetically; groups are sorted too.",
    ],
    hints: [
      "Two anagrams share something once you sort their letters.",
      "Use that sorted form as a hash-map key and collect words under it.",
      "Sort inside each group and then sort the groups before returning.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "groupAnagrams",
      params: [{ name: "words", type: "string[]" }],
      returns: "string[]",
    },
    topicSlugs: ["dsa-hashing", "dsa-strings", "js-objects"],
    examples: [
      {
        input: 'words = ["eat", "tea", "tan", "ate", "nat", "bat"]',
        output: '["ate,eat,tea", "bat", "nat,tan"]',
        explanation: "Three groups, each listed alphabetically.",
      },
      { input: 'words = ["a"]', output: '["a"]' },
    ],
    tests: [
      {
        args: [["eat", "tea", "tan", "ate", "nat", "bat"]],
        expected: ["ate,eat,tea", "bat", "nat,tan"],
      },
      { args: [["a"]], expected: ["a"] },
      { args: [[""]], expected: [""] },
      {
        args: [["ab", "ba", "abc"]],
        expected: ["ab,ba", "abc"],
        hidden: true,
      },
      {
        args: [["listen", "silent", "enlist"]],
        expected: ["enlist,listen,silent"],
        hidden: true,
      },
      { args: [["x", "y"]], expected: ["x", "y"], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const groups = new Map();
for (const word of words) {
  const key = word.split("").sort().join("");
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(word);
}
const result = [];
for (const group of groups.values()) {
  result.push(group.sort().join(","));
}
return result.sort();`,
      TYPESCRIPT: `const groups = new Map<string, string[]>();
for (const word of words) {
  const key = word.split("").sort().join("");
  const group = groups.get(key) ?? [];
  group.push(word);
  groups.set(key, group);
}
const result: string[] = [];
for (const group of groups.values()) {
  result.push(group.sort().join(","));
}
return result.sort();`,
      PYTHON: `groups = {}
for word in words:
    key = "".join(sorted(word))
    groups.setdefault(key, []).append(word)
return sorted(",".join(sorted(group)) for group in groups.values())`,
      JAVA: `Map<String, List<String>> groups = new HashMap<>();
for (String word : words) {
    char[] letters = word.toCharArray();
    Arrays.sort(letters);
    String key = new String(letters);
    groups.computeIfAbsent(key, missing -> new ArrayList<>()).add(word);
}
List<String> result = new ArrayList<>();
for (List<String> group : groups.values()) {
    Collections.sort(group);
    result.add(String.join(",", group));
}
Collections.sort(result);
return result.toArray(new String[0]);`,
      CPP: `map<string, vector<string>> groups;
for (const string& word : words) {
    string key = word;
    sort(key.begin(), key.end());
    groups[key].push_back(word);
}
vector<string> result;
for (auto& entry : groups) {
    sort(entry.second.begin(), entry.second.end());
    string joined;
    for (size_t i = 0; i < entry.second.size(); i += 1) {
        if (i) joined += ",";
        joined += entry.second[i];
    }
    result.push_back(joined);
}
sort(result.begin(), result.end());
return result;`,
    },
  },

  // ── 9 ───────────────────────────────────────────────────────────────────
  {
    slug: "longest-consecutive-run",
    title: "Longest Consecutive Run",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Given an unordered list of numbers, find the length of the longest run " +
      "of consecutive values it contains — values that would sit next to each " +
      "other if you counted upwards. The values do not have to be adjacent in " +
      "the list, and duplicates do not extend a run.",
    explanation:
      "Sorting solves it in O(n log n) and is a fine first answer. The O(n) " +
      "answer is a set plus one observation: only start counting from a value " +
      "whose predecessor is absent, because any other value is in the middle of " +
      "a run that will be counted from its own start. Without that check the " +
      "same run gets walked from every one of its members and the solution is " +
      "quadratic again. With it, every value is visited at most twice overall, " +
      "which is what makes the whole thing linear.",
    constraints: [
      "The list has between 0 and 100,000 numbers.",
      "Each number is between -1,000,000,000 and 1,000,000,000.",
      "An empty list has a longest run of 0.",
    ],
    hints: [
      "Put everything in a set so 'is the next value present?' is O(1).",
      "Only start counting at a value whose predecessor is missing.",
      "Without that rule you walk the same run once per member.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "longestConsecutiveRun",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-hashing", "data-structures"],
    examples: [
      {
        input: "numbers = [100, 4, 200, 1, 3, 2]",
        output: "4",
        explanation: "1, 2, 3, 4 is the longest run.",
      },
      { input: "numbers = [5, 5, 5]", output: "1" },
    ],
    tests: [
      { args: [[100, 4, 200, 1, 3, 2]], expected: 4 },
      { args: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], expected: 9 },
      { args: [[]], expected: 0 },
      { args: [[1]], expected: 1, hidden: true },
      { args: [[1, 2, 0, 1]], expected: 3, hidden: true },
      { args: [[5, 5, 5]], expected: 1, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const values = new Set(numbers);
let best = 0;
for (const value of values) {
  if (values.has(value - 1)) continue;
  let length = 1;
  while (values.has(value + length)) length += 1;
  if (length > best) best = length;
}
return best;`,
      TYPESCRIPT: `const values = new Set<number>(numbers);
let best = 0;
for (const value of values) {
  if (values.has(value - 1)) continue;
  let length = 1;
  while (values.has(value + length)) length += 1;
  if (length > best) best = length;
}
return best;`,
      PYTHON: `values = set(numbers)
best = 0
for value in values:
    if value - 1 in values:
        continue
    length = 1
    while value + length in values:
        length += 1
    best = max(best, length)
return best`,
      JAVA: `Set<Integer> values = new HashSet<>();
for (int value : numbers) values.add(value);
int best = 0;
for (int value : values) {
    if (values.contains(value - 1)) continue;
    int length = 1;
    while (values.contains(value + length)) length += 1;
    if (length > best) best = length;
}
return best;`,
      CPP: `unordered_set<int> values(numbers.begin(), numbers.end());
int best = 0;
for (int value : values) {
    if (values.count(value - 1)) continue;
    int length = 1;
    while (values.count(value + length)) length += 1;
    if (length > best) best = length;
}
return best;`,
    },
  },

  // ── 10 ──────────────────────────────────────────────────────────────────
  {
    slug: "valid-sudoku-board",
    title: "Valid Sudoku Board",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Check whether a partly filled 9×9 Sudoku board breaks any rule: no " +
      "digit may repeat within a row, within a column, or within one of the " +
      "nine 3×3 boxes. Empty cells hold 0 and are always allowed. You are only " +
      "validating what is on the board — it does not have to be solvable.",
    explanation:
      "Twenty-seven separate 'are these unique?' checks, which one pass can do " +
      "at once. Keep a set for each row, each column and each box; for every " +
      "filled cell, try to add its digit to all three. A failed insertion means " +
      "a repeat, and the board is invalid. The only piece of arithmetic worth " +
      "writing down is the box index: (row / 3) * 3 + (column / 3), using " +
      "integer division, which maps the nine boxes to 0 through 8.",
    constraints: [
      "The board is always 9×9.",
      "Each cell holds 0 (empty) or a digit from 1 to 9.",
      "The board need not be solvable — only currently legal.",
    ],
    hints: [
      "One set per row, one per column, one per 3×3 box.",
      "The box holding cell (r, c) is (r / 3) * 3 + (c / 3) with integer division.",
      "Skip empty cells entirely — zeros never conflict.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "isValidSudoku",
      params: [{ name: "board", type: "int[][]" }],
      returns: "bool",
    },
    topicSlugs: ["dsa-hashing", "dsa-arrays"],
    examples: [
      {
        input: "board = a 9×9 grid with 5 and 3 in the first row",
        output: "true",
        explanation: "No row, column or box repeats a digit.",
      },
      {
        input: "board = the same grid with the first cell changed to 8",
        output: "false",
        explanation: "The top-left box would then hold two 8s.",
      },
    ],
    tests: [
      {
        args: [
          [
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9],
          ],
        ],
        expected: true,
      },
      {
        args: [
          [
            [8, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9],
          ],
        ],
        expected: false,
      },
      {
        args: [
          [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
          ],
        ],
        expected: true,
        hidden: true,
      },
      {
        args: [
          [
            [1, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
          ],
        ],
        expected: false,
        hidden: true,
      },
      {
        args: [
          [
            [1, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
          ],
        ],
        expected: false,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const rows = [];
const cols = [];
const boxes = [];
for (let i = 0; i < 9; i += 1) {
  rows.push(new Set());
  cols.push(new Set());
  boxes.push(new Set());
}
for (let r = 0; r < 9; r += 1) {
  for (let c = 0; c < 9; c += 1) {
    const digit = board[r][c];
    if (digit === 0) continue;
    const box = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    if (rows[r].has(digit) || cols[c].has(digit) || boxes[box].has(digit)) {
      return false;
    }
    rows[r].add(digit);
    cols[c].add(digit);
    boxes[box].add(digit);
  }
}
return true;`,
      TYPESCRIPT: `const rows: Set<number>[] = [];
const cols: Set<number>[] = [];
const boxes: Set<number>[] = [];
for (let i = 0; i < 9; i += 1) {
  rows.push(new Set<number>());
  cols.push(new Set<number>());
  boxes.push(new Set<number>());
}
for (let r = 0; r < 9; r += 1) {
  for (let c = 0; c < 9; c += 1) {
    const digit = board[r][c];
    if (digit === 0) continue;
    const box = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    if (rows[r].has(digit) || cols[c].has(digit) || boxes[box].has(digit)) {
      return false;
    }
    rows[r].add(digit);
    cols[c].add(digit);
    boxes[box].add(digit);
  }
}
return true;`,
      PYTHON: `rows = [set() for _ in range(9)]
cols = [set() for _ in range(9)]
boxes = [set() for _ in range(9)]
for r in range(9):
    for c in range(9):
        digit = board[r][c]
        if digit == 0:
            continue
        box = (r // 3) * 3 + (c // 3)
        if digit in rows[r] or digit in cols[c] or digit in boxes[box]:
            return False
        rows[r].add(digit)
        cols[c].add(digit)
        boxes[box].add(digit)
return True`,
      JAVA: `boolean[][] rows = new boolean[9][10];
boolean[][] cols = new boolean[9][10];
boolean[][] boxes = new boolean[9][10];
for (int r = 0; r < 9; r += 1) {
    for (int c = 0; c < 9; c += 1) {
        int digit = board[r][c];
        if (digit == 0) continue;
        int box = (r / 3) * 3 + (c / 3);
        if (rows[r][digit] || cols[c][digit] || boxes[box][digit]) return false;
        rows[r][digit] = true;
        cols[c][digit] = true;
        boxes[box][digit] = true;
    }
}
return true;`,
      CPP: `vector<vector<bool>> rows(9, vector<bool>(10, false));
vector<vector<bool>> cols(9, vector<bool>(10, false));
vector<vector<bool>> boxes(9, vector<bool>(10, false));
for (int r = 0; r < 9; r += 1) {
    for (int c = 0; c < 9; c += 1) {
        int digit = board[r][c];
        if (digit == 0) continue;
        int box = (r / 3) * 3 + (c / 3);
        if (rows[r][digit] || cols[c][digit] || boxes[box][digit]) return false;
        rows[r][digit] = true;
        cols[c][digit] = true;
        boxes[box][digit] = true;
    }
}
return true;`,
    },
  },

  // ── 11 ──────────────────────────────────────────────────────────────────
  {
    slug: "count-value-pairs-with-difference",
    title: "Pairs With a Given Difference",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Count how many distinct pairs of values differ by exactly the given " +
      "amount. Pairs are counted by value, not by position, so [1, 1, 3] " +
      "contains one pair differing by 2, not two. The difference is never " +
      "negative.",
    explanation:
      "Two problems wearing one hat. When the difference is greater than zero, " +
      "put the distinct values in a set and count how many of them have a " +
      "partner at value + difference — each pair is then found exactly once, " +
      "from its smaller half. When the difference is zero the question changes " +
      "completely: a pair means the same value twice, so what you need is a " +
      "count per value and a tally of the values appearing at least twice. " +
      "Spotting that the zero case is different, rather than discovering it " +
      "from a failing test, is what this problem is for.",
    constraints: [
      "The list has between 1 and 10,000 numbers.",
      "Each number is between -1,000,000 and 1,000,000.",
      "The difference is between 0 and 1,000,000.",
    ],
    hints: [
      "Count pairs by value, so work from the distinct values.",
      "For a positive difference, look up value + difference in a set.",
      "A difference of zero is a different question: which values repeat?",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "countPairsWithDifference",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "difference", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-hashing", "js-arrays"],
    examples: [
      {
        input: "numbers = [3, 1, 4, 1, 5], difference = 2",
        output: "2",
        explanation: "The pairs are (1, 3) and (3, 5).",
      },
      {
        input: "numbers = [1, 3, 1, 5, 4], difference = 0",
        output: "1",
        explanation: "Only the value 1 appears more than once.",
      },
    ],
    tests: [
      { args: [[3, 1, 4, 1, 5], 2], expected: 2 },
      { args: [[1, 2, 3, 4, 5], 1], expected: 4 },
      { args: [[1, 3, 1, 5, 4], 0], expected: 1 },
      { args: [[1, 2, 4, 4, 3, 3, 0, 9, 2, 3], 3], expected: 2, hidden: true },
      { args: [[5, 5, 5], 0], expected: 1, hidden: true },
      { args: [[1, 2, 3], 5], expected: 0, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `if (difference === 0) {
  const counts = new Map();
  for (const value of numbers) counts.set(value, (counts.get(value) ?? 0) + 1);
  let repeats = 0;
  for (const count of counts.values()) if (count > 1) repeats += 1;
  return repeats;
}
const values = new Set(numbers);
let pairs = 0;
for (const value of values) {
  if (values.has(value + difference)) pairs += 1;
}
return pairs;`,
      TYPESCRIPT: `if (difference === 0) {
  const counts = new Map<number, number>();
  for (const value of numbers) counts.set(value, (counts.get(value) ?? 0) + 1);
  let repeats = 0;
  for (const count of counts.values()) if (count > 1) repeats += 1;
  return repeats;
}
const values = new Set<number>(numbers);
let pairs = 0;
for (const value of values) {
  if (values.has(value + difference)) pairs += 1;
}
return pairs;`,
      PYTHON: `if difference == 0:
    counts = {}
    for value in numbers:
        counts[value] = counts.get(value, 0) + 1
    return sum(1 for count in counts.values() if count > 1)
values = set(numbers)
return sum(1 for value in values if value + difference in values)`,
      JAVA: `if (difference == 0) {
    Map<Integer, Integer> counts = new HashMap<>();
    for (int value : numbers) counts.put(value, counts.getOrDefault(value, 0) + 1);
    int repeats = 0;
    for (int count : counts.values()) if (count > 1) repeats += 1;
    return repeats;
}
Set<Integer> values = new HashSet<>();
for (int value : numbers) values.add(value);
int pairs = 0;
for (int value : values) {
    if (values.contains(value + difference)) pairs += 1;
}
return pairs;`,
      CPP: `if (difference == 0) {
    unordered_map<int, int> counts;
    for (int value : numbers) counts[value] += 1;
    int repeats = 0;
    for (const auto& entry : counts) if (entry.second > 1) repeats += 1;
    return repeats;
}
unordered_set<int> values(numbers.begin(), numbers.end());
int pairs = 0;
for (int value : values) {
    if (values.count(value + difference)) pairs += 1;
}
return pairs;`,
    },
  },

  // ── 12 ──────────────────────────────────────────────────────────────────
  {
    slug: "unique-delivery-addresses",
    title: "Unique Delivery Addresses",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "A mail system ignores dots in the part before the @, and ignores " +
      "everything from a plus sign onwards in that same part. The part after " +
      "the @ is used exactly as written. Count how many genuinely different " +
      'addresses a list contains — so "a.b+tag@mail.com" and "ab@mail.com" are ' +
      "the same address.",
    explanation:
      "Normalise, then count. Split each address at the @ — the last one, " +
      "although these inputs have only one — then clean the local part by " +
      "cutting it at the first plus and removing every dot. Rejoin, put the " +
      "result in a set, and the answer is the set's size. The lesson is the " +
      "shape rather than the string handling: whenever things are 'the same' " +
      "under some rule, write the rule as a function that produces a canonical " +
      "form, and let a hash set do the comparing.",
    constraints: [
      "There are between 1 and 10,000 addresses.",
      "Each address contains exactly one @ and is at most 100 characters.",
      "The local part contains lowercase letters, dots and plus signs.",
    ],
    hints: [
      "Write one function that turns an address into its canonical form.",
      "Cut the local part at the first plus, then remove the dots.",
      "The domain is never changed.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "countUniqueAddresses",
      params: [{ name: "addresses", type: "string[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-hashing", "dsa-strings", "js-objects"],
    examples: [
      {
        input: 'addresses = ["a.b+tag@mail.com", "ab@mail.com"]',
        output: "1",
        explanation: "Both normalise to ab@mail.com.",
      },
      {
        input: 'addresses = ["x@mail.com", "x@other.com"]',
        output: "2",
        explanation: "The domain is never ignored.",
      },
    ],
    tests: [
      { args: [["a.b+tag@mail.com", "ab@mail.com"]], expected: 1 },
      { args: [["x@mail.com", "x@other.com"]], expected: 2 },
      {
        args: [["first.last@mail.com", "firstlast@mail.com", "first+last@mail.com"]],
        expected: 2,
      },
      { args: [["a@b.com"]], expected: 1, hidden: true },
      { args: [["a.a.a+z@b.com", "aaa@b.com"]], expected: 1, hidden: true },
      { args: [["u+1@x.com", "u+2@x.com"]], expected: 1, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const seen = new Set();
for (const address of addresses) {
  const at = address.indexOf("@");
  let local = address.slice(0, at);
  const domain = address.slice(at);
  const plus = local.indexOf("+");
  if (plus !== -1) local = local.slice(0, plus);
  local = local.split(".").join("");
  seen.add(local + domain);
}
return seen.size;`,
      TYPESCRIPT: `const seen = new Set<string>();
for (const address of addresses) {
  const at = address.indexOf("@");
  let local = address.slice(0, at);
  const domain = address.slice(at);
  const plus = local.indexOf("+");
  if (plus !== -1) local = local.slice(0, plus);
  local = local.split(".").join("");
  seen.add(local + domain);
}
return seen.size;`,
      PYTHON: `seen = set()
for address in addresses:
    at = address.index("@")
    local = address[:at]
    domain = address[at:]
    plus = local.find("+")
    if plus != -1:
        local = local[:plus]
    local = local.replace(".", "")
    seen.add(local + domain)
return len(seen)`,
      JAVA: `Set<String> seen = new HashSet<>();
for (String address : addresses) {
    int at = address.indexOf('@');
    String local = address.substring(0, at);
    String domain = address.substring(at);
    int plus = local.indexOf('+');
    if (plus != -1) local = local.substring(0, plus);
    local = local.replace(".", "");
    seen.add(local + domain);
}
return seen.size();`,
      CPP: `unordered_set<string> seen;
for (const string& address : addresses) {
    size_t at = address.find('@');
    string local = address.substr(0, at);
    string domain = address.substr(at);
    size_t plus = local.find('+');
    if (plus != string::npos) local = local.substr(0, plus);
    string cleaned;
    for (char c : local) if (c != '.') cleaned += c;
    seen.insert(cleaned + domain);
}
return (int)seen.size();`,
    },
  },

  // ── 13 ──────────────────────────────────────────────────────────────────
  {
    slug: "four-list-zero-sum",
    title: "Zero Sums Across Four Lists",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Four lists of the same length are given. Count the combinations — one " +
      "value taken from each list, chosen by position — whose four values add " +
      "up to zero. Positions are what make a combination distinct, so equal " +
      "values at different positions count separately.",
    explanation:
      "Trying every combination is O(n⁴) and hopeless past a few hundred " +
      "entries. Split the four lists into two halves. Add every pair from the " +
      "first two lists into a map from sum to how many times that sum occurs — " +
      "that is O(n²). Then walk every pair from the last two lists and ask the " +
      "map how many first-half pairs would cancel it out, adding that count to " +
      "the answer. Two O(n²) passes rather than one O(n⁴) one. Meet in the " +
      "middle is the general name for this, and it is the standard follow-up " +
      "once someone has solved two-sum with a map.",
    constraints: [
      "All four lists have the same length, between 1 and 500.",
      "Each value is between -100,000,000 and 100,000,000.",
      "Combinations are counted by position, not by value.",
    ],
    hints: [
      "Four nested loops is too slow — split the problem in half.",
      "Count every sum of a pair from the first two lists in a map.",
      "For each pair from the last two, look up the sum that cancels it.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "countZeroSums",
      params: [
        { name: "first", type: "int[]" },
        { name: "second", type: "int[]" },
        { name: "third", type: "int[]" },
        { name: "fourth", type: "int[]" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-hashing", "data-structures"],
    examples: [
      {
        input: "first = [1, 2], second = [-2, -1], third = [-1, 2], fourth = [0, 2]",
        output: "2",
        explanation: "Two position combinations add up to zero.",
      },
      { input: "first = [0], second = [0], third = [0], fourth = [0]", output: "1" },
    ],
    tests: [
      {
        args: [
          [1, 2],
          [-2, -1],
          [-1, 2],
          [0, 2],
        ],
        expected: 2,
      },
      { args: [[0], [0], [0], [0]], expected: 1 },
      { args: [[1], [1], [1], [1]], expected: 0 },
      {
        args: [
          [-1, 1],
          [1, -1],
          [0, 0],
          [0, 0],
        ],
        expected: 8,
        hidden: true,
      },
      { args: [[1], [-1], [0], [0]], expected: 1, hidden: true },
      {
        args: [
          [2, -2],
          [2, -2],
          [2, -2],
          [2, -2],
        ],
        expected: 6,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const sums = new Map();
for (const a of first) {
  for (const b of second) {
    sums.set(a + b, (sums.get(a + b) ?? 0) + 1);
  }
}
let total = 0;
for (const c of third) {
  for (const d of fourth) {
    total += sums.get(-(c + d)) ?? 0;
  }
}
return total;`,
      TYPESCRIPT: `const sums = new Map<number, number>();
for (const a of first) {
  for (const b of second) {
    sums.set(a + b, (sums.get(a + b) ?? 0) + 1);
  }
}
let total = 0;
for (const c of third) {
  for (const d of fourth) {
    total += sums.get(-(c + d)) ?? 0;
  }
}
return total;`,
      PYTHON: `sums = {}
for a in first:
    for b in second:
        sums[a + b] = sums.get(a + b, 0) + 1
total = 0
for c in third:
    for d in fourth:
        total += sums.get(-(c + d), 0)
return total`,
      JAVA: `Map<Integer, Integer> sums = new HashMap<>();
for (int a : first) {
    for (int b : second) {
        sums.put(a + b, sums.getOrDefault(a + b, 0) + 1);
    }
}
int total = 0;
for (int c : third) {
    for (int d : fourth) {
        total += sums.getOrDefault(-(c + d), 0);
    }
}
return total;`,
      CPP: `unordered_map<int, int> sums;
for (int a : first) {
    for (int b : second) {
        sums[a + b] += 1;
    }
}
int total = 0;
for (int c : third) {
    for (int d : fourth) {
        auto found = sums.find(-(c + d));
        if (found != sums.end()) total += found->second;
    }
}
return total;`,
    },
  },

  // ── 14 ──────────────────────────────────────────────────────────────────
  {
    slug: "find-all-duplicates",
    title: "Every Repeated Value",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "A list of length n holds values from 1 to n, where each value appears " +
      "either once or twice. Return every value that appears twice, in " +
      "increasing order. If nothing repeats, return an empty list.",
    explanation:
      "A hash map of counts is the straightforward answer and is worth writing " +
      "first. The reason this problem is asked, though, is the constraint " +
      "hiding in the wording: the values are exactly 1 to n, which means each " +
      "value is also a valid index. That lets you record 'I have seen value v' " +
      "by negating the number sitting at position v - 1, and a value whose slot " +
      "is already negative is a value you have seen before — no extra memory at " +
      "all. This solution returns the answer sorted, which the counting version " +
      "gets by sorting at the end.",
    constraints: [
      "The list has between 1 and 100,000 numbers.",
      "Every value is between 1 and the length of the list.",
      "Each value appears once or twice.",
    ],
    hints: [
      "Start with a map from value to count.",
      "Then notice that every value is also a legal index into the list itself.",
      "Return the answer in increasing order.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "findAllDuplicates",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-hashing", "dsa-arrays"],
    examples: [
      {
        input: "numbers = [4, 3, 2, 7, 8, 2, 3, 1]",
        output: "[2, 3]",
        explanation: "2 and 3 each appear twice; everything else appears once.",
      },
      { input: "numbers = [1]", output: "[]" },
    ],
    tests: [
      { args: [[4, 3, 2, 7, 8, 2, 3, 1]], expected: [2, 3] },
      { args: [[1, 1, 2]], expected: [1] },
      { args: [[1]], expected: [] },
      { args: [[2, 2]], expected: [2], hidden: true },
      { args: [[1, 2, 3]], expected: [], hidden: true },
      { args: [[3, 3, 1, 1, 2]], expected: [1, 3], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const counts = new Map();
for (const value of numbers) counts.set(value, (counts.get(value) ?? 0) + 1);
const result = [];
for (const [value, count] of counts) {
  if (count > 1) result.push(value);
}
return result.sort((a, b) => a - b);`,
      TYPESCRIPT: `const counts = new Map<number, number>();
for (const value of numbers) counts.set(value, (counts.get(value) ?? 0) + 1);
const result: number[] = [];
for (const [value, count] of counts) {
  if (count > 1) result.push(value);
}
return result.sort((a, b) => a - b);`,
      PYTHON: `counts = {}
for value in numbers:
    counts[value] = counts.get(value, 0) + 1
return sorted(value for value, count in counts.items() if count > 1)`,
      JAVA: `Map<Integer, Integer> counts = new HashMap<>();
for (int value : numbers) counts.put(value, counts.getOrDefault(value, 0) + 1);
List<Integer> repeated = new ArrayList<>();
for (Map.Entry<Integer, Integer> entry : counts.entrySet()) {
    if (entry.getValue() > 1) repeated.add(entry.getKey());
}
Collections.sort(repeated);
int[] result = new int[repeated.size()];
for (int i = 0; i < repeated.size(); i += 1) result[i] = repeated.get(i);
return result;`,
      CPP: `unordered_map<int, int> counts;
for (int value : numbers) counts[value] += 1;
vector<int> result;
for (const auto& entry : counts) {
    if (entry.second > 1) result.push_back(entry.first);
}
sort(result.begin(), result.end());
return result;`,
    },
  },
];
