import type { SeedProblem } from "./types";

/**
 * Medium problems — a step up, but still reachable straight after the matching
 * lesson. Nothing here needs an algorithm a beginner has not met.
 *
 * As with the easy set, every statement is original prose written for this
 * project.
 */
export const MEDIUM_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "fibonacci-sequence",
    title: "Fibonacci Sequence",
    difficulty: "MEDIUM",
    description:
      "The Fibonacci sequence starts 0, 1 and then every following number is the " +
      "sum of the two before it: 0, 1, 1, 2, 3, 5, 8. Return the first `count` " +
      "numbers of the sequence as a list. A count of 0 returns an empty list.",
    explanation:
      "The tempting solution is recursion — a function that calls itself for the " +
      "two previous values. It reads beautifully and is catastrophically slow, " +
      "because it recomputes the same values over and over. The iterative version " +
      "keeps only the last two numbers and walks forward, which is one pass and " +
      "almost no memory. The awkward part is the start: the first two numbers are " +
      "given rather than computed, so counts of 0, 1 and 2 need to come out right " +
      "before the loop ever runs.",
    constraints: [
      "The count is between 0 and 40.",
      "The sequence starts with 0 then 1.",
      "A count of 0 returns an empty list.",
    ],
    hints: [
      "You only ever need the last two numbers, not the whole history.",
      "Handle counts of 0 and 1 before you start looping.",
      "Each step: append the sum, then shift your two tracked values along.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "fibonacciSequence",
      params: [{ name: "count", type: "int" }],
      returns: "int[]",
    },
    topicSlugs: ["js-loops", "js-arrays", "data-structures"],
    examples: [
      { input: "count = 7", output: "[0, 1, 1, 2, 3, 5, 8]" },
      { input: "count = 1", output: "[0]" },
    ],
    tests: [
      { args: [7], expected: [0, 1, 1, 2, 3, 5, 8] },
      { args: [1], expected: [0] },
      { args: [0], expected: [] },
      { args: [2], expected: [0, 1], hidden: true },
      { args: [10], expected: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34], hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        "const result = [];\nlet previous = 0;\nlet current = 1;\nfor (let i = 0; i < count; i += 1) {\n  result.push(previous);\n  const next = previous + current;\n  previous = current;\n  current = next;\n}\nreturn result;",
      TYPESCRIPT:
        "const result: number[] = [];\nlet previous = 0;\nlet current = 1;\nfor (let i = 0; i < count; i += 1) {\n  result.push(previous);\n  const next = previous + current;\n  previous = current;\n  current = next;\n}\nreturn result;",
      PYTHON:
        "result = []\nprevious = 0\ncurrent = 1\nfor _ in range(count):\n    result.append(previous)\n    previous, current = current, previous + current\nreturn result",
      JAVA: "int[] result = new int[count];\nint previous = 0;\nint current = 1;\nfor (int i = 0; i < count; i += 1) {\n    result[i] = previous;\n    int next = previous + current;\n    previous = current;\n    current = next;\n}\nreturn result;",
      CPP: "vector<int> result;\nint previous = 0;\nint current = 1;\nfor (int i = 0; i < count; i += 1) {\n    result.push_back(previous);\n    int next = previous + current;\n    previous = current;\n    current = next;\n}\nreturn result;",
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "balanced-brackets",
    title: "Balanced Brackets",
    difficulty: "MEDIUM",
    description:
      "A piece of text contains round, square and curly brackets mixed with other " +
      "characters. Decide whether the brackets are balanced: every opening bracket " +
      "is closed by the matching kind, in the right order, and nothing is left " +
      'over. So "a(b[c]d)" is balanced and "a(b]c)" is not.',
    explanation:
      'Counting brackets is not enough — "([)]" has equal numbers of each and is ' +
      "still wrong, because the order is impossible. What you need is a stack. " +
      "Push every opening bracket as you meet it; when you meet a closing bracket, " +
      "the top of the stack must be its partner, so pop and compare. Two things " +
      "make it fail: a closing bracket arriving when the stack is empty, and the " +
      "stack still holding something once the text runs out. Both mean unbalanced.",
    constraints: [
      "The text is between 0 and 2,000 characters long.",
      "Only ( ) [ ] { } are brackets; every other character is ignored.",
      "Empty text is balanced.",
    ],
    hints: [
      "Counting is not enough — the order matters.",
      "Use a stack: push openers, and pop when you meet a closer.",
      "Two failure cases: popping an empty stack, and a non-empty stack at the end.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "hasBalancedBrackets",
      params: [{ name: "text", type: "string" }],
      returns: "bool",
    },
    topicSlugs: ["js-arrays", "data-structures", "fs-js-collections"],
    examples: [
      { input: 'text = "a(b[c]d)"', output: "true" },
      {
        input: 'text = "a(b]c)"',
        output: "false",
        explanation: "The ] tries to close a (.",
      },
    ],
    tests: [
      { args: ["a(b[c]d)"], expected: true },
      { args: ["a(b]c)"], expected: false },
      { args: [""], expected: true },
      { args: ["([)]"], expected: false, hidden: true },
      { args: ["{[()]}"], expected: true, hidden: true },
      { args: [")("], expected: false, hidden: true },
      { args: ["(("], expected: false, hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        'const partners = { ")": "(", "]": "[", "}": "{" };\nconst stack = [];\nfor (const character of text) {\n  if ("([{".includes(character)) {\n    stack.push(character);\n  } else if (character in partners) {\n    if (stack.pop() !== partners[character]) return false;\n  }\n}\nreturn stack.length === 0;',
      TYPESCRIPT:
        'const partners: Record<string, string> = { ")": "(", "]": "[", "}": "{" };\nconst stack: string[] = [];\nfor (const character of text) {\n  if ("([{".includes(character)) {\n    stack.push(character);\n  } else if (character in partners) {\n    if (stack.pop() !== partners[character]) return false;\n  }\n}\nreturn stack.length === 0;',
      PYTHON:
        'partners = {")": "(", "]": "[", "}": "{"}\nstack = []\nfor character in text:\n    if character in "([{":\n        stack.append(character)\n    elif character in partners:\n        if not stack or stack.pop() != partners[character]:\n            return False\nreturn len(stack) == 0',
      JAVA: "Map<Character, Character> partners = new HashMap<>();\npartners.put(')', '(');\npartners.put(']', '[');\npartners.put('}', '{');\nDeque<Character> stack = new ArrayDeque<>();\nfor (char character : text.toCharArray()) {\n    if (character == '(' || character == '[' || character == '{') {\n        stack.push(character);\n    } else if (partners.containsKey(character)) {\n        if (stack.isEmpty() || stack.pop() != partners.get(character)) return false;\n    }\n}\nreturn stack.isEmpty();",
      CPP: "unordered_map<char, char> partners = {{')', '('}, {']', '['}, {'}', '{'}};\nvector<char> stack;\nfor (char character : text) {\n    if (character == '(' || character == '[' || character == '{') {\n        stack.push_back(character);\n    } else if (partners.count(character)) {\n        if (stack.empty() || stack.back() != partners[character]) return false;\n        stack.pop_back();\n    }\n}\nreturn stack.empty();",
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "first-unique-character",
    title: "First Character That Appears Once",
    difficulty: "MEDIUM",
    description:
      "Find the first character in a piece of text that appears exactly once, and " +
      'return it. In "swiss" that character is "w". If every character repeats, ' +
      "return an empty string. Comparison is case-sensitive.",
    explanation:
      "The obvious approach is, for each character, to scan the whole text " +
      "counting how many times it occurs. That works but re-reads the text once " +
      "per character. Instead, make one pass to build a table of counts, then a " +
      "second pass in the original order to find the first character whose count " +
      "is 1. Two passes over the text beats one pass that itself contains a pass. " +
      "The second loop has to go in the original order — a count table on its own " +
      "does not tell you which character came first.",
    constraints: [
      "The text is between 0 and 5,000 characters long.",
      "Comparison is case-sensitive: A and a are different characters.",
      "Return an empty string when no character appears exactly once.",
    ],
    hints: [
      "Count every character first, in one pass.",
      "Then walk the text again in order and return the first character with a count of 1.",
      "Remember the empty-string case for text where everything repeats.",
    ],
    estimatedTime: "18 min",
    signature: {
      name: "firstUniqueCharacter",
      params: [{ name: "text", type: "string" }],
      returns: "string",
    },
    topicSlugs: ["js-objects", "fs-js-collections", "data-structures"],
    examples: [
      { input: 'text = "swiss"', output: '"w"' },
      { input: 'text = "aabb"', output: '""' },
    ],
    tests: [
      { args: ["swiss"], expected: "w" },
      { args: ["aabb"], expected: "" },
      { args: [""], expected: "" },
      { args: ["abcabd"], expected: "c", hidden: true },
      { args: ["Aa"], expected: "A", hidden: true },
      { args: ["x"], expected: "x", hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        'const counts = new Map();\nfor (const character of text) {\n  counts.set(character, (counts.get(character) ?? 0) + 1);\n}\nfor (const character of text) {\n  if (counts.get(character) === 1) return character;\n}\nreturn "";',
      TYPESCRIPT:
        'const counts = new Map<string, number>();\nfor (const character of text) {\n  counts.set(character, (counts.get(character) ?? 0) + 1);\n}\nfor (const character of text) {\n  if (counts.get(character) === 1) return character;\n}\nreturn "";',
      PYTHON:
        'counts = {}\nfor character in text:\n    counts[character] = counts.get(character, 0) + 1\nfor character in text:\n    if counts[character] == 1:\n        return character\nreturn ""',
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "pair-with-target-sum",
    title: "Find the Pair That Adds Up",
    difficulty: "MEDIUM",
    description:
      "Given a list of numbers and a target, find two different positions in the " +
      "list whose values add up to the target, and return those two positions as " +
      "a list, smaller position first. There is exactly one such pair. If the " +
      "list is unusable, that case will not be tested.",
    explanation:
      "Checking every pair works and is easy to reason about, but the number of " +
      "pairs grows with the square of the list length. The faster idea is to ask, " +
      "for each value, whether the number that would complete the pair has already " +
      "been seen. Keep a table mapping each value you have passed to its position; " +
      "then for the current value you only need one lookup. One pass, one lookup " +
      "per element. Store the value *after* you check, or a value equal to half " +
      "the target would match itself.",
    constraints: [
      "The list contains between 2 and 10,000 numbers.",
      "Exactly one valid pair exists.",
      "Positions are zero-based and returned smallest first.",
    ],
    hints: [
      "For each value, what other value would complete the pair?",
      "Keep a table of the values you have already passed and where they were.",
      "Check the table before adding the current value to it.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "findPairIndices",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "target", type: "int" },
      ],
      returns: "int[]",
    },
    topicSlugs: ["js-objects", "js-arrays", "data-structures"],
    examples: [
      {
        input: "numbers = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "2 + 7 = 9.",
      },
      { input: "numbers = [3, 3], target = 6", output: "[0, 1]" },
    ],
    tests: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 3], 6], expected: [0, 1] },
      { args: [[1, 4, 9, 2], 11], expected: [2, 3] },
      { args: [[-3, 5, 8], 5], expected: [0, 2], hidden: true },
      // Deliberately not [0, 0, 4]: with two zeros, both [0, 2] and [1, 2] are
      // valid, and the problem promises exactly one pair.
      { args: [[0, 1, 4], 4], expected: [0, 2], hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        "const seen = new Map();\nfor (let index = 0; index < numbers.length; index += 1) {\n  const partner = target - numbers[index];\n  if (seen.has(partner)) return [seen.get(partner), index];\n  seen.set(numbers[index], index);\n}\nreturn [];",
      TYPESCRIPT:
        "const seen = new Map<number, number>();\nfor (let index = 0; index < numbers.length; index += 1) {\n  const partner = target - numbers[index];\n  const found = seen.get(partner);\n  if (found !== undefined) return [found, index];\n  seen.set(numbers[index], index);\n}\nreturn [];",
      PYTHON:
        "seen = {}\nfor index, value in enumerate(numbers):\n    partner = target - value\n    if partner in seen:\n        return [seen[partner], index]\n    seen[value] = index\nreturn []",
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "most-frequent-word",
    title: "Most Frequent Word",
    difficulty: "MEDIUM",
    description:
      "Given a sentence of words separated by single spaces, return the word that " +
      "appears most often, ignoring capitalisation. Return it in lower case. If " +
      "two words tie, return whichever of them appeared first in the sentence.",
    explanation:
      "Count first, decide second. Build a table of word to count in one pass, " +
      "then walk the words again in order and keep the best so far, replacing it " +
      "only when you find a strictly higher count. That last word — strictly — is " +
      "what implements the tie-break: because you walk in the original order and " +
      "refuse to swap on equal counts, the earliest of the tied words survives. " +
      "Iterating the count table instead would give you an order you do not " +
      "control.",
    constraints: [
      "The sentence contains between 1 and 1,000 words separated by single spaces.",
      "Comparison ignores capitalisation; the answer is returned in lower case.",
      "Ties are broken by first appearance.",
    ],
    hints: [
      "Lower-case the sentence before you split it.",
      "Count the words in one pass into a table.",
      "Walk the words again in order, replacing the best only on a strictly higher count.",
    ],
    estimatedTime: "18 min",
    signature: {
      name: "mostFrequentWord",
      params: [{ name: "sentence", type: "string" }],
      returns: "string",
    },
    topicSlugs: ["js-objects", "fs-js-collections", "data-structures"],
    examples: [
      { input: 'sentence = "the cat the dog"', output: '"the"' },
      {
        input: 'sentence = "one two two One"',
        output: '"one"',
        explanation: 'Both appear twice; "one" came first.',
      },
    ],
    tests: [
      { args: ["the cat the dog"], expected: "the" },
      { args: ["one two two One"], expected: "one" },
      { args: ["solo"], expected: "solo" },
      { args: ["a b c"], expected: "a", hidden: true },
      { args: ["Go go GO stop"], expected: "go", hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        'const words = sentence.toLowerCase().split(" ");\nconst counts = new Map();\nfor (const word of words) {\n  counts.set(word, (counts.get(word) ?? 0) + 1);\n}\nlet best = words[0];\nfor (const word of words) {\n  if (counts.get(word) > counts.get(best)) best = word;\n}\nreturn best;',
      TYPESCRIPT:
        'const words = sentence.toLowerCase().split(" ");\nconst counts = new Map<string, number>();\nfor (const word of words) {\n  counts.set(word, (counts.get(word) ?? 0) + 1);\n}\nlet best = words[0];\nfor (const word of words) {\n  if ((counts.get(word) ?? 0) > (counts.get(best) ?? 0)) best = word;\n}\nreturn best;',
      PYTHON:
        'words = sentence.lower().split(" ")\ncounts = {}\nfor word in words:\n    counts[word] = counts.get(word, 0) + 1\nbest = words[0]\nfor word in words:\n    if counts[word] > counts[best]:\n        best = word\nreturn best',
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "rotate-list-right",
    /*
     * Named for the move it teaches rather than for the operation, because
     * "Rotate a List to the Right" is also the interview catalog's
     * rotate-array-right and two identical titles in one list is a coin flip
     * for the learner. This is the version that arrives at the answer by
     * taking the tail and putting it in front; the other asks for the same
     * result at interview scale. Both are worth solving, so both stay — the
     * title is what changes.
     */
    title: "Move the Tail to the Front",
    difficulty: "MEDIUM",
    description:
      "Move every element of a list a given number of places to the right, " +
      "wrapping the ones that fall off the end back around to the front. Rotating " +
      "[1, 2, 3, 4] by 1 gives [4, 1, 2, 3]. The number of steps may be larger " +
      "than the list.",
    explanation:
      "Rotating by the length of the list leaves it unchanged, so rotating by " +
      "more than the length is the same as rotating by the remainder — take that " +
      "remainder first and a request for a million steps costs the same as one. " +
      "After that, the answer is simply the last `steps` elements followed by " +
      "everything before them. Rotating one element at a time in a loop also " +
      "works, but does far more work than it needs to. Watch the empty list: " +
      "taking a remainder by zero is an error in most languages.",
    constraints: [
      "The list contains between 0 and 10,000 numbers.",
      "The number of steps is between 0 and 1,000,000.",
      "An empty list returns an empty list.",
    ],
    hints: [
      "Rotating by the list's length changes nothing — reduce the steps first.",
      "The answer is the tail of the list followed by its head.",
      "Guard against an empty list before taking any remainder.",
    ],
    estimatedTime: "18 min",
    signature: {
      name: "rotateRight",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "steps", type: "int" },
      ],
      returns: "int[]",
    },
    topicSlugs: ["js-arrays", "data-structures", "fs-js-collections"],
    examples: [
      { input: "numbers = [1, 2, 3, 4], steps = 1", output: "[4, 1, 2, 3]" },
      {
        input: "numbers = [1, 2, 3], steps = 5",
        output: "[2, 3, 1]",
        explanation: "5 steps on a list of 3 is the same as 2 steps.",
      },
    ],
    tests: [
      { args: [[1, 2, 3, 4], 1], expected: [4, 1, 2, 3] },
      { args: [[1, 2, 3], 5], expected: [2, 3, 1] },
      { args: [[], 3], expected: [] },
      { args: [[1, 2, 3], 0], expected: [1, 2, 3], hidden: true },
      { args: [[1, 2, 3], 3], expected: [1, 2, 3], hidden: true },
      { args: [[7], 100], expected: [7], hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        "if (numbers.length === 0) return [];\nconst shift = steps % numbers.length;\nreturn [...numbers.slice(numbers.length - shift), ...numbers.slice(0, numbers.length - shift)];",
      TYPESCRIPT:
        "if (numbers.length === 0) return [];\nconst shift = steps % numbers.length;\nreturn [...numbers.slice(numbers.length - shift), ...numbers.slice(0, numbers.length - shift)];",
      PYTHON:
        "if len(numbers) == 0:\n    return []\nshift = steps % len(numbers)\nreturn numbers[len(numbers) - shift:] + numbers[:len(numbers) - shift]",
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "anagram-check",
    title: "Are These Anagrams",
    difficulty: "MEDIUM",
    description:
      "Two pieces of text are anagrams when one can be rearranged into the other " +
      "using every letter exactly once. Decide whether the two inputs are " +
      "anagrams, ignoring capitalisation and spaces. Return true or false.",
    explanation:
      "Two approaches, both correct. Sorting the cleaned characters of each side " +
      "and comparing the results is short and obviously right. Counting characters " +
      "into a table and comparing the tables avoids the sort and is faster on long " +
      "text. Either way, do the cleaning first — lower-case, drop spaces — and " +
      "compare lengths early, because two pieces of text of different lengths can " +
      "never be anagrams and that check costs nothing.",
    constraints: [
      "Each input is between 0 and 2,000 characters long.",
      "Capitalisation and spaces are ignored.",
      "Two empty strings are anagrams of each other.",
    ],
    hints: [
      "Clean both sides the same way before comparing anything.",
      "Different lengths after cleaning means the answer is false immediately.",
      "Sorting the characters, or counting them, both work.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "areAnagrams",
      params: [
        { name: "first", type: "string" },
        { name: "second", type: "string" },
      ],
      returns: "bool",
    },
    topicSlugs: ["js-data-types", "js-arrays", "data-structures"],
    examples: [
      { input: 'first = "Listen", second = "Silent"', output: "true" },
      { input: 'first = "hello", second = "world"', output: "false" },
    ],
    tests: [
      { args: ["Listen", "Silent"], expected: true },
      { args: ["hello", "world"], expected: false },
      { args: ["", ""], expected: true },
      { args: ["Dormitory", "Dirty Room"], expected: true, hidden: true },
      { args: ["abc", "abcd"], expected: false, hidden: true },
      { args: ["aab", "abb"], expected: false, hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        'const clean = (value) => value.toLowerCase().replace(/ /g, "").split("").sort().join("");\nreturn clean(first) === clean(second);',
      TYPESCRIPT:
        'const clean = (value: string) => value.toLowerCase().replace(/ /g, "").split("").sort().join("");\nreturn clean(first) === clean(second);',
      PYTHON:
        'left = sorted(first.lower().replace(" ", ""))\nright = sorted(second.lower().replace(" ", ""))\nreturn left == right',
      JAVA: 'char[] left = first.toLowerCase().replace(" ", "").toCharArray();\nchar[] right = second.toLowerCase().replace(" ", "").toCharArray();\nArrays.sort(left);\nArrays.sort(right);\nreturn Arrays.equals(left, right);',
      CPP: "string left;\nstring right;\nfor (char character : first) {\n    if (character != ' ') left += tolower(static_cast<unsigned char>(character));\n}\nfor (char character : second) {\n    if (character != ' ') right += tolower(static_cast<unsigned char>(character));\n}\nsort(left.begin(), left.end());\nsort(right.begin(), right.end());\nreturn left == right;",
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "merge-sorted-lists",
    /*
     * The interview catalog owns "Merge Two Sorted Lists" — that is the name
     * the problem is known by in a coding round, and renaming *that* one to
     * resolve the clash would have made it harder to recognise. This is the
     * arrays-topic version of the same idea, so it takes a plainer name that
     * says what is being produced.
     */
    title: "One Sorted List From Two",
    difficulty: "MEDIUM",
    description:
      "Two lists of numbers are each already sorted from smallest to largest. " +
      "Combine them into a single sorted list containing every number from both, " +
      "duplicates included. Either list may be empty.",
    explanation:
      "You could concatenate the two lists and sort the result, and it would be " +
      "correct — but it throws away the fact that both inputs are already sorted. " +
      "The merge instead walks both lists at once with one position marker each, " +
      "repeatedly taking whichever front value is smaller. When one list runs out, " +
      "everything remaining in the other is already in order and can be appended " +
      "wholesale. This is the merge half of merge sort, which is why it is worth " +
      "writing once by hand.",
    constraints: [
      "Each list contains between 0 and 10,000 numbers.",
      "Both lists are already sorted ascending.",
      "Duplicates are kept, not removed.",
    ],
    hints: [
      "Keep one position marker per list.",
      "Take whichever front value is smaller, then advance that marker only.",
      "When one list is exhausted, append the whole remainder of the other.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "mergeSorted",
      params: [
        { name: "first", type: "int[]" },
        { name: "second", type: "int[]" },
      ],
      returns: "int[]",
    },
    topicSlugs: ["js-arrays", "data-structures", "fs-js-collections"],
    examples: [
      { input: "first = [1, 4], second = [2, 3]", output: "[1, 2, 3, 4]" },
      { input: "first = [], second = [5]", output: "[5]" },
    ],
    tests: [
      {
        args: [
          [1, 4],
          [2, 3],
        ],
        expected: [1, 2, 3, 4],
      },
      { args: [[], [5]], expected: [5] },
      { args: [[], []], expected: [] },
      { args: [[1, 1], [1]], expected: [1, 1, 1], hidden: true },
      {
        args: [
          [1, 2, 3],
          [4, 5],
        ],
        expected: [1, 2, 3, 4, 5],
        hidden: true,
      },
      {
        args: [
          [-5, 0],
          [-2, 7],
        ],
        expected: [-5, -2, 0, 7],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT:
        "const result = [];\nlet left = 0;\nlet right = 0;\nwhile (left < first.length && right < second.length) {\n  if (first[left] <= second[right]) {\n    result.push(first[left]);\n    left += 1;\n  } else {\n    result.push(second[right]);\n    right += 1;\n  }\n}\nreturn [...result, ...first.slice(left), ...second.slice(right)];",
      TYPESCRIPT:
        "const result: number[] = [];\nlet left = 0;\nlet right = 0;\nwhile (left < first.length && right < second.length) {\n  if (first[left] <= second[right]) {\n    result.push(first[left]);\n    left += 1;\n  } else {\n    result.push(second[right]);\n    right += 1;\n  }\n}\nreturn [...result, ...first.slice(left), ...second.slice(right)];",
      PYTHON:
        "result = []\nleft = 0\nright = 0\nwhile left < len(first) and right < len(second):\n    if first[left] <= second[right]:\n        result.append(first[left])\n        left += 1\n    else:\n        result.append(second[right])\n        right += 1\nreturn result + first[left:] + second[right:]",
    },
  },

  // ── 9 ───────────────────────────────────────────────────────────────────
  {
    slug: "longest-word",
    title: "Longest Word in a Sentence",
    difficulty: "MEDIUM",
    description:
      "Given a sentence of words separated by single spaces, return the longest " +
      "word. If two words are the same length, return whichever appeared first. " +
      "Punctuation attached to a word counts as part of it.",
    explanation:
      "Split, then run a running maximum over the words — the same pattern as " +
      "finding the largest number, except the thing being compared is length " +
      "rather than value. The tie-break comes for free if you only replace your " +
      "best word on a strictly greater length: an equally long word later in the " +
      "sentence never displaces the earlier one. Start from the first word rather " +
      "than from an empty string, so the single-word case needs no special branch.",
    constraints: [
      "The sentence contains between 1 and 1,000 words separated by single spaces.",
      "Ties are broken by first appearance.",
      "Punctuation is part of the word it is attached to.",
    ],
    hints: [
      "Split the sentence into words first.",
      "Track the best word so far, starting from the first one.",
      "Replace it only when a word is strictly longer.",
    ],
    estimatedTime: "12 min",
    signature: {
      name: "longestWord",
      params: [{ name: "sentence", type: "string" }],
      returns: "string",
    },
    topicSlugs: ["js-arrays", "js-data-types", "fs-js-basics"],
    examples: [
      { input: 'sentence = "never stop learning"', output: '"learning"' },
      {
        input: 'sentence = "one two six"',
        output: '"one"',
        explanation: "All three are the same length, so the first wins.",
      },
    ],
    tests: [
      { args: ["never stop learning"], expected: "learning" },
      { args: ["one two six"], expected: "one" },
      { args: ["solo"], expected: "solo" },
      { args: ["a bb ccc"], expected: "ccc", hidden: true },
      { args: ["hello, world!"], expected: "hello,", hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        'const words = sentence.split(" ");\nlet best = words[0];\nfor (const word of words) {\n  if (word.length > best.length) best = word;\n}\nreturn best;',
      TYPESCRIPT:
        'const words = sentence.split(" ");\nlet best = words[0];\nfor (const word of words) {\n  if (word.length > best.length) best = word;\n}\nreturn best;',
      PYTHON:
        'words = sentence.split(" ")\nbest = words[0]\nfor word in words:\n    if len(word) > len(best):\n        best = word\nreturn best',
    },
  },

  // ── 10 ──────────────────────────────────────────────────────────────────
  {
    slug: "primes-below",
    title: "Primes Below a Number",
    difficulty: "MEDIUM",
    description:
      "Return every prime number strictly below the given limit, in ascending " +
      "order. A prime is a whole number greater than 1 whose only whole divisors " +
      "are 1 and itself. For a limit of 10 the answer is [2, 3, 5, 7].",
    explanation:
      "Testing a number by trying every divisor up to it works but does far more " +
      "than necessary: if a number has a divisor larger than its square root, it " +
      "must also have a matching one smaller, so you can stop at the square root. " +
      "That single change turns a slow loop into a fast one. Two edge cases catch " +
      "people out: 1 is not prime, and 2 is — it is the only even prime, so a test " +
      "that rejects all even numbers has to let it through.",
    constraints: [
      "The limit is between 0 and 10,000.",
      "Numbers strictly below the limit are considered.",
      "1 is not prime; 2 is.",
    ],
    hints: [
      "Write a helper that answers 'is this one number prime?' first.",
      "You only need to test divisors up to the square root.",
      "Check what your code says about 0, 1 and 2.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "primesBelow",
      params: [{ name: "limit", type: "int" }],
      returns: "int[]",
    },
    topicSlugs: ["js-loops", "js-functions", "functions-and-modules"],
    examples: [
      { input: "limit = 10", output: "[2, 3, 5, 7]" },
      { input: "limit = 2", output: "[]", explanation: "Nothing below 2 is prime." },
    ],
    tests: [
      { args: [10], expected: [2, 3, 5, 7] },
      { args: [2], expected: [] },
      { args: [0], expected: [] },
      { args: [3], expected: [2], hidden: true },
      { args: [20], expected: [2, 3, 5, 7, 11, 13, 17, 19], hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        "const isPrime = (value) => {\n  if (value < 2) return false;\n  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {\n    if (value % divisor === 0) return false;\n  }\n  return true;\n};\nconst result = [];\nfor (let value = 2; value < limit; value += 1) {\n  if (isPrime(value)) result.push(value);\n}\nreturn result;",
      TYPESCRIPT:
        "const isPrime = (value: number): boolean => {\n  if (value < 2) return false;\n  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {\n    if (value % divisor === 0) return false;\n  }\n  return true;\n};\nconst result: number[] = [];\nfor (let value = 2; value < limit; value += 1) {\n  if (isPrime(value)) result.push(value);\n}\nreturn result;",
      PYTHON:
        "def is_prime(value):\n    if value < 2:\n        return False\n    divisor = 2\n    while divisor * divisor <= value:\n        if value % divisor == 0:\n            return False\n        divisor += 1\n    return True\n\nresult = []\nfor value in range(2, limit):\n    if is_prime(value):\n        result.append(value)\nreturn result",
    },
  },

  // ── 11 ──────────────────────────────────────────────────────────────────
  {
    slug: "compress-runs",
    title: "Compress Repeated Characters",
    difficulty: "MEDIUM",
    description:
      "Compress text by replacing each run of the same character with that " +
      'character followed by how many times it repeated. So "aaabbc" becomes ' +
      '"a3b2c1". Every character gets a count, even when it appears once. Empty ' +
      "text compresses to empty text.",
    explanation:
      "Walk the text keeping the character you are currently counting and how " +
      "many of it you have seen. When the character changes, write out the run you " +
      "just finished and start a new one. The mistake almost everybody makes the " +
      "first time is forgetting the final run: the loop ends without a change of " +
      "character, so the last group never gets written unless you write it after " +
      "the loop.",
    constraints: [
      "The text is between 0 and 2,000 characters long.",
      "Every character gets a count, including runs of length 1.",
      "Empty text returns empty text.",
    ],
    hints: [
      "Track the current character and how many of it you have seen in a row.",
      "Write out a run when the character changes.",
      "Do not forget to write the final run after the loop ends.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "compressRuns",
      params: [{ name: "text", type: "string" }],
      returns: "string",
    },
    topicSlugs: ["js-loops", "js-data-types", "fs-js-basics"],
    examples: [
      { input: 'text = "aaabbc"', output: '"a3b2c1"' },
      { input: 'text = "abc"', output: '"a1b1c1"' },
    ],
    tests: [
      { args: ["aaabbc"], expected: "a3b2c1" },
      { args: ["abc"], expected: "a1b1c1" },
      { args: [""], expected: "" },
      { args: ["aaaa"], expected: "a4", hidden: true },
      { args: ["aAa"], expected: "a1A1a1", hidden: true },
      { args: ["xxyyxx"], expected: "x2y2x2", hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        'if (text.length === 0) return "";\nlet result = "";\nlet current = text[0];\nlet count = 0;\nfor (const character of text) {\n  if (character === current) {\n    count += 1;\n  } else {\n    result += current + String(count);\n    current = character;\n    count = 1;\n  }\n}\nreturn result + current + String(count);',
      TYPESCRIPT:
        'if (text.length === 0) return "";\nlet result = "";\nlet current = text[0];\nlet count = 0;\nfor (const character of text) {\n  if (character === current) {\n    count += 1;\n  } else {\n    result += current + String(count);\n    current = character;\n    count = 1;\n  }\n}\nreturn result + current + String(count);',
      PYTHON:
        'if len(text) == 0:\n    return ""\nresult = ""\ncurrent = text[0]\ncount = 0\nfor character in text:\n    if character == current:\n        count += 1\n    else:\n        result += current + str(count)\n        current = character\n        count = 1\nreturn result + current + str(count)',
    },
  },

  // ── 12 ──────────────────────────────────────────────────────────────────
  {
    slug: "binary-search-index",
    title: "Find a Value by Halving",
    difficulty: "MEDIUM",
    description:
      "A list of numbers is already sorted from smallest to largest. Find the " +
      "position of a target value in it and return that position, or -1 when the " +
      "target is not present. Do not scan the list from one end — halve the range " +
      "you are searching each time.",
    explanation:
      "Binary search keeps a low and a high boundary and repeatedly looks at the " +
      "middle. If the middle value is the target you are done; if it is too small " +
      "the answer must be to the right, so move low past the middle; if it is too " +
      "big move high before the middle. Each step throws away half of what is " +
      "left, so a list of a million entries takes about twenty comparisons. The " +
      "classic bug is the loop condition: low must be allowed to equal high, or a " +
      "one-element range is never examined.",
    constraints: [
      "The list contains between 0 and 10,000 numbers, sorted ascending.",
      "Values are distinct.",
      "Return -1 when the target is not in the list.",
    ],
    hints: [
      "Keep a low and a high boundary and look at the middle of them.",
      "Compare the middle value with the target to decide which half to keep.",
      "Let the loop run while low is less than *or equal to* high.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "binarySearch",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "target", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["js-arrays", "data-structures", "js-loops"],
    examples: [
      { input: "numbers = [1, 3, 5, 7], target = 5", output: "2" },
      { input: "numbers = [1, 3, 5], target = 4", output: "-1" },
    ],
    tests: [
      { args: [[1, 3, 5, 7], 5], expected: 2 },
      { args: [[1, 3, 5], 4], expected: -1 },
      { args: [[], 1], expected: -1 },
      { args: [[2], 2], expected: 0, hidden: true },
      { args: [[1, 2, 3, 4, 5, 6], 1], expected: 0, hidden: true },
      { args: [[1, 2, 3, 4, 5, 6], 6], expected: 5, hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        "let low = 0;\nlet high = numbers.length - 1;\nwhile (low <= high) {\n  const middle = Math.floor((low + high) / 2);\n  if (numbers[middle] === target) return middle;\n  if (numbers[middle] < target) low = middle + 1;\n  else high = middle - 1;\n}\nreturn -1;",
      TYPESCRIPT:
        "let low = 0;\nlet high = numbers.length - 1;\nwhile (low <= high) {\n  const middle = Math.floor((low + high) / 2);\n  if (numbers[middle] === target) return middle;\n  if (numbers[middle] < target) low = middle + 1;\n  else high = middle - 1;\n}\nreturn -1;",
      PYTHON:
        "low = 0\nhigh = len(numbers) - 1\nwhile low <= high:\n    middle = (low + high) // 2\n    if numbers[middle] == target:\n        return middle\n    if numbers[middle] < target:\n        low = middle + 1\n    else:\n        high = middle - 1\nreturn -1",
      JAVA: "int low = 0;\nint high = numbers.length - 1;\nwhile (low <= high) {\n    int middle = (low + high) / 2;\n    if (numbers[middle] == target) return middle;\n    if (numbers[middle] < target) low = middle + 1;\n    else high = middle - 1;\n}\nreturn -1;",
      CPP: "int low = 0;\nint high = static_cast<int>(numbers.size()) - 1;\nwhile (low <= high) {\n    int middle = (low + high) / 2;\n    if (numbers[middle] == target) return middle;\n    if (numbers[middle] < target) low = middle + 1;\n    else high = middle - 1;\n}\nreturn -1;",
    },
  },
];
