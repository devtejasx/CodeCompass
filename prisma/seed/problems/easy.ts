import type { SeedProblem } from "./types";

/**
 * Easy problems — the ones a learner meets straight after a lesson.
 *
 * Every statement is original prose. The shapes (reverse a string, FizzBuzz,
 * factorial) are common exercises; the wording, examples, constraints, hints
 * and explanations are written here and copied from nowhere.
 *
 * Solution bodies are the answer key. They are stored server-side only and are
 * never selected by a query that feeds the browser.
 */
export const EASY_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "add-two-numbers",
    title: "Add Two Numbers",
    difficulty: "EASY",
    description:
      "Write a function that takes two whole numbers and returns their total. " +
      "This is the smallest possible complete function: it takes input, does one " +
      "thing with it, and returns a result. Getting comfortable with that shape " +
      "matters more than the arithmetic.",
    explanation:
      "A function has three parts: the values it receives (its parameters), the " +
      "work it does, and the value it hands back (its return value). Here the work " +
      "is a single addition, so the whole function is one return statement. Notice " +
      "that the function does not print anything — returning a value and printing " +
      "a value are different things, and almost every function you write should " +
      "return rather than print.",
    constraints: [
      "Both inputs are whole numbers between -1,000,000 and 1,000,000.",
      "Return the result — do not print it.",
    ],
    hints: [
      "The whole solution is one line.",
      "Use the + operator on the two parameters.",
      "Remember to return the result rather than printing it.",
    ],
    estimatedTime: "5 min",
    signature: {
      name: "addTwoNumbers",
      params: [
        { name: "a", type: "int" },
        { name: "b", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["js-functions", "fs-js-basics", "language-syntax"],
    examples: [
      { input: "a = 3, b = 4", output: "7" },
      {
        input: "a = -2, b = 10",
        output: "8",
        explanation: "Negative values work the same way.",
      },
    ],
    tests: [
      { args: [3, 4], expected: 7 },
      { args: [-2, 10], expected: 8 },
      { args: [0, 0], expected: 0 },
      { args: [1000000, 1], expected: 1000001, hidden: true },
      { args: [-500, -500], expected: -1000, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: "return a + b;",
      TYPESCRIPT: "return a + b;",
      PYTHON: "return a + b",
      JAVA: "return a + b;",
      CPP: "return a + b;",
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "find-maximum",
    title: "Find the Largest Number",
    difficulty: "EASY",
    description:
      "Given a list of whole numbers, return the largest one. The list always " +
      "has at least one number in it. Walk through the list once, keeping track " +
      "of the biggest value you have seen so far.",
    explanation:
      "The pattern here is called a running maximum. You start by assuming the " +
      "first element is the answer, then compare every other element against it " +
      "and replace it whenever you find something bigger. It only needs one pass " +
      "over the list, so it stays fast even on very long lists. A common mistake " +
      "is to start from 0 instead of from the first element — that breaks the " +
      "moment every number is negative.",
    constraints: [
      "The list contains between 1 and 10,000 numbers.",
      "Each number is between -1,000,000 and 1,000,000.",
      "The list is never empty.",
    ],
    hints: [
      "Start by assuming the first element is the largest.",
      "Loop over the rest and replace your answer whenever you find something bigger.",
      "Do not start your running maximum at 0 — all the numbers might be negative.",
    ],
    estimatedTime: "10 min",
    signature: {
      name: "findMaximum",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["js-arrays", "fs-js-collections", "data-structures"],
    examples: [
      { input: "numbers = [3, 9, 2, 7]", output: "9" },
      {
        input: "numbers = [-8, -3, -20]",
        output: "-3",
        explanation: "All negative — the answer is the one closest to zero.",
      },
    ],
    tests: [
      { args: [[3, 9, 2, 7]], expected: 9 },
      { args: [[-8, -3, -20]], expected: -3 },
      { args: [[5]], expected: 5 },
      { args: [[1, 2, 3, 4, 100]], expected: 100, hidden: true },
      { args: [[100, 4, 3, 2, 1]], expected: 100, hidden: true },
      { args: [[0, 0, 0]], expected: 0, hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        "let largest = numbers[0];\nfor (const value of numbers) {\n  if (value > largest) largest = value;\n}\nreturn largest;",
      TYPESCRIPT:
        "let largest = numbers[0];\nfor (const value of numbers) {\n  if (value > largest) largest = value;\n}\nreturn largest;",
      PYTHON:
        "largest = numbers[0]\nfor value in numbers:\n    if value > largest:\n        largest = value\nreturn largest",
      JAVA: "int largest = numbers[0];\nfor (int value : numbers) {\n    if (value > largest) largest = value;\n}\nreturn largest;",
      CPP: "int largest = numbers[0];\nfor (int value : numbers) {\n    if (value > largest) largest = value;\n}\nreturn largest;",
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "reverse-a-string",
    title: "Reverse a String",
    difficulty: "EASY",
    description:
      "Given a piece of text, return the same characters in the opposite order. " +
      'For example "compass" becomes "ssapmoc". Spaces and punctuation are ' +
      "characters too, so they move as well.",
    explanation:
      "Strings are sequences of characters, and reversing one means reading it " +
      "from the end to the start. Most languages give you a direct way to do this " +
      "— a slice, a built-in reverse, or a string builder — and reaching for it " +
      "is the right call. If you would rather do it by hand, loop from the last " +
      "index down to zero and append each character to a new string. What you " +
      "must not do is modify the input in place: in many languages strings cannot " +
      "be changed at all.",
    constraints: [
      "The text is between 0 and 1,000 characters long.",
      "It may contain spaces, digits and punctuation.",
      "Empty text returns empty text.",
    ],
    hints: [
      "Think of the text as a sequence you can walk backwards.",
      "Many languages have a built-in reverse for sequences.",
      "Build a new string rather than trying to change the input.",
    ],
    estimatedTime: "10 min",
    signature: {
      name: "reverseString",
      params: [{ name: "text", type: "string" }],
      returns: "string",
    },
    topicSlugs: ["js-data-types", "js-loops", "fs-js-basics"],
    examples: [
      { input: 'text = "compass"', output: '"ssapmoc"' },
      {
        input: 'text = "a b"',
        output: '"b a"',
        explanation: "The space is a character and moves with everything else.",
      },
    ],
    tests: [
      { args: ["compass"], expected: "ssapmoc" },
      { args: ["a b"], expected: "b a" },
      { args: [""], expected: "" },
      { args: ["x"], expected: "x", hidden: true },
      { args: ["Hello, World!"], expected: "!dlroW ,olleH", hidden: true },
      { args: ["12345"], expected: "54321", hidden: true },
    ],
    solutions: {
      JAVASCRIPT: 'return text.split("").reverse().join("");',
      TYPESCRIPT: 'return text.split("").reverse().join("");',
      PYTHON: "return text[::-1]",
      JAVA: "return new StringBuilder(text).reverse().toString();",
      CPP: "string result = text;\nreverse(result.begin(), result.end());\nreturn result;",
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "count-vowels",
    title: "Count the Vowels",
    difficulty: "EASY",
    description:
      "Count how many vowels appear in a piece of text. The vowels are a, e, i, " +
      'o and u, and capital letters count too — so "Apple" has two vowels, not ' +
      "one. Every other character is ignored.",
    explanation:
      "This is a counting loop: start at zero, look at each character in turn, " +
      "and add one whenever the character qualifies. The only wrinkle is case. " +
      'Rather than checking against ten characters ("aeiouAEIOU"), lower-case ' +
      "each character first and check against five. Normalising your input before " +
      "you test it is a habit worth building — it removes a whole category of bug.",
    constraints: [
      "The text is between 0 and 5,000 characters long.",
      "Only a, e, i, o, u count as vowels. y does not.",
      "Both upper and lower case count.",
    ],
    hints: [
      "Keep a counter that starts at zero.",
      "Lower-case each character before comparing, so you only test five letters.",
      'A string like "aeiou" can be searched — you do not need five separate comparisons.',
    ],
    estimatedTime: "10 min",
    signature: {
      name: "countVowels",
      params: [{ name: "text", type: "string" }],
      returns: "int",
    },
    topicSlugs: ["js-loops", "js-data-types", "fs-js-basics"],
    examples: [
      { input: 'text = "Apple"', output: "2", explanation: "A and e both count." },
      { input: 'text = "rhythm"', output: "0", explanation: "y is not a vowel here." },
    ],
    tests: [
      { args: ["Apple"], expected: 2 },
      { args: ["rhythm"], expected: 0 },
      { args: [""], expected: 0 },
      { args: ["AEIOU"], expected: 5, hidden: true },
      { args: ["the quick brown fox"], expected: 5, hidden: true },
      { args: ["12345!"], expected: 0, hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        'let count = 0;\nfor (const character of text.toLowerCase()) {\n  if ("aeiou".includes(character)) count += 1;\n}\nreturn count;',
      TYPESCRIPT:
        'let count = 0;\nfor (const character of text.toLowerCase()) {\n  if ("aeiou".includes(character)) count += 1;\n}\nreturn count;',
      PYTHON:
        'count = 0\nfor character in text.lower():\n    if character in "aeiou":\n        count += 1\nreturn count',
      JAVA: 'int count = 0;\nfor (char character : text.toLowerCase().toCharArray()) {\n    if ("aeiou".indexOf(character) >= 0) count += 1;\n}\nreturn count;',
      CPP: 'int count = 0;\nfor (char character : text) {\n    char lowered = tolower(static_cast<unsigned char>(character));\n    if (string("aeiou").find(lowered) != string::npos) count += 1;\n}\nreturn count;',
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "check-palindrome",
    title: "Palindrome Check",
    difficulty: "EASY",
    description:
      "A palindrome reads the same forwards and backwards. Decide whether a " +
      "piece of text is one, ignoring capital letters, spaces and punctuation — " +
      'so "Never odd or even" counts as a palindrome. Return true or false.',
    explanation:
      "There are two steps and it helps to keep them separate. First clean the " +
      "input: drop everything that is not a letter or a digit, and lower-case " +
      "what remains. Then compare the cleaned text with its own reverse. Trying " +
      "to do both at once is where this problem usually goes wrong. An empty " +
      "string, once cleaned, is a palindrome — it reads the same in both " +
      "directions because there is nothing to read.",
    constraints: [
      "The text is between 0 and 2,000 characters long.",
      "Comparison ignores case, spaces and punctuation.",
      "Text that cleans down to nothing counts as a palindrome.",
    ],
    hints: [
      "Do the cleaning first, in its own step.",
      "Keep only letters and digits, and lower-case them.",
      "Compare the cleaned text against its reverse.",
    ],
    estimatedTime: "12 min",
    signature: {
      name: "isPalindrome",
      params: [{ name: "text", type: "string" }],
      returns: "bool",
    },
    topicSlugs: ["js-conditions", "js-functions", "fs-js-basics"],
    examples: [
      { input: 'text = "Never odd or even"', output: "true" },
      { input: 'text = "compass"', output: "false" },
    ],
    tests: [
      { args: ["Never odd or even"], expected: true },
      { args: ["compass"], expected: false },
      { args: [""], expected: true },
      { args: ["A man, a plan, a canal: Panama"], expected: true, hidden: true },
      { args: ["12321"], expected: true, hidden: true },
      { args: ["ab"], expected: false, hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        'const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, "");\nreturn cleaned === cleaned.split("").reverse().join("");',
      TYPESCRIPT:
        'const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, "");\nreturn cleaned === cleaned.split("").reverse().join("");',
      PYTHON:
        'cleaned = "".join(character for character in text.lower() if character.isalnum())\nreturn cleaned == cleaned[::-1]',
      JAVA: 'String cleaned = text.toLowerCase().replaceAll("[^a-z0-9]", "");\nreturn cleaned.equals(new StringBuilder(cleaned).reverse().toString());',
      CPP: "string cleaned;\nfor (char character : text) {\n    if (isalnum(static_cast<unsigned char>(character))) {\n        cleaned += tolower(static_cast<unsigned char>(character));\n    }\n}\nstring reversed = cleaned;\nreverse(reversed.begin(), reversed.end());\nreturn cleaned == reversed;",
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "array-sum",
    title: "Total Up a List",
    difficulty: "EASY",
    description:
      "Add together every number in a list and return the total. An empty list " +
      "totals zero. Do it with a loop rather than a built-in sum, so the pattern " +
      "is one you can reuse when the thing you are accumulating is not a number.",
    explanation:
      "This is the accumulator pattern, and you will use it constantly: create a " +
      "variable to hold the running result, update it once per element, and " +
      "return it at the end. The starting value matters. For a sum it is 0, " +
      "because adding 0 changes nothing. For a product it would be 1. Choosing a " +
      "starting value that has no effect on the operation is what makes the empty " +
      "case work without a special branch.",
    constraints: [
      "The list contains between 0 and 10,000 numbers.",
      "Each number is between -100,000 and 100,000.",
      "An empty list returns 0.",
    ],
    hints: [
      "Create a total that starts at 0.",
      "Add each element to the total inside a loop.",
      "Return the total after the loop, not inside it.",
    ],
    estimatedTime: "8 min",
    signature: {
      name: "sumArray",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["js-arrays", "js-loops", "data-structures"],
    examples: [
      { input: "numbers = [1, 2, 3, 4]", output: "10" },
      { input: "numbers = []", output: "0", explanation: "Nothing to add." },
    ],
    tests: [
      { args: [[1, 2, 3, 4]], expected: 10 },
      { args: [[]], expected: 0 },
      { args: [[-5, 5]], expected: 0 },
      { args: [[100]], expected: 100, hidden: true },
      { args: [[-1, -2, -3]], expected: -6, hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        "let total = 0;\nfor (const value of numbers) {\n  total += value;\n}\nreturn total;",
      TYPESCRIPT:
        "let total = 0;\nfor (const value of numbers) {\n  total += value;\n}\nreturn total;",
      PYTHON: "total = 0\nfor value in numbers:\n    total += value\nreturn total",
      JAVA: "int total = 0;\nfor (int value : numbers) {\n    total += value;\n}\nreturn total;",
      CPP: "int total = 0;\nfor (int value : numbers) {\n    total += value;\n}\nreturn total;",
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "count-occurrences",
    title: "Count How Often a Value Appears",
    difficulty: "EASY",
    description:
      "Given a list of numbers and a target value, return how many times the " +
      "target appears in the list. If it never appears, return 0.",
    explanation:
      "A counting loop with a condition inside it. The important detail is that " +
      "you keep looking after you find a match — a beginner's instinct is often " +
      "to return as soon as something matches, which answers a different question " +
      '("does it appear at all?"). Read the problem statement again whenever you ' +
      "feel the urge to return early: it tells you whether you are searching or " +
      "counting.",
    constraints: [
      "The list contains between 0 and 10,000 numbers.",
      "The target may or may not be present.",
      "Return a count, not a position.",
    ],
    hints: [
      "Keep a counter outside the loop.",
      "Compare each element with the target and add one when they match.",
      "Do not return early — you need to see the whole list.",
    ],
    estimatedTime: "8 min",
    signature: {
      name: "countOccurrences",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "target", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["js-arrays", "js-loops", "fs-js-collections"],
    examples: [
      { input: "numbers = [1, 2, 2, 3, 2], target = 2", output: "3" },
      { input: "numbers = [1, 2, 3], target = 9", output: "0" },
    ],
    tests: [
      { args: [[1, 2, 2, 3, 2], 2], expected: 3 },
      { args: [[1, 2, 3], 9], expected: 0 },
      { args: [[], 1], expected: 0 },
      { args: [[7, 7, 7, 7], 7], expected: 4, hidden: true },
      { args: [[-1, -1, 0], -1], expected: 2, hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        "let count = 0;\nfor (const value of numbers) {\n  if (value === target) count += 1;\n}\nreturn count;",
      TYPESCRIPT:
        "let count = 0;\nfor (const value of numbers) {\n  if (value === target) count += 1;\n}\nreturn count;",
      PYTHON:
        "count = 0\nfor value in numbers:\n    if value == target:\n        count += 1\nreturn count",
      JAVA: "int count = 0;\nfor (int value : numbers) {\n    if (value == target) count += 1;\n}\nreturn count;",
      CPP: "int count = 0;\nfor (int value : numbers) {\n    if (value == target) count += 1;\n}\nreturn count;",
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "remove-duplicates",
    title: "Remove Duplicate Values",
    difficulty: "EASY",
    description:
      "Return a new list containing each value from the input exactly once, in " +
      "the order the value first appeared. The input is not sorted and must not " +
      "be modified.",
    explanation:
      "The naive approach — for each element, scan everything you have kept so " +
      "far — works, but it re-reads the output list over and over. Keeping a set " +
      "of values you have already seen turns each of those scans into a single " +
      "lookup, which is what makes this fast on long lists. The reason you still " +
      "need a separate result list is ordering: a set remembers membership, not " +
      "the order things arrived in.",
    constraints: [
      "The list contains between 0 and 10,000 numbers.",
      "The original order of first appearance must be preserved.",
      "Do not modify the input list.",
    ],
    hints: [
      "Keep a record of the values you have already seen.",
      "A set gives you a fast 'have I seen this?' check.",
      "Append to a separate result list so the order is preserved.",
    ],
    estimatedTime: "12 min",
    signature: {
      name: "removeDuplicates",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["js-arrays", "fs-js-collections", "data-structures"],
    examples: [
      { input: "numbers = [1, 2, 2, 3, 1]", output: "[1, 2, 3]" },
      { input: "numbers = []", output: "[]" },
    ],
    tests: [
      { args: [[1, 2, 2, 3, 1]], expected: [1, 2, 3] },
      { args: [[]], expected: [] },
      { args: [[5, 5, 5]], expected: [5] },
      { args: [[3, 1, 2]], expected: [3, 1, 2], hidden: true },
      { args: [[-1, -1, 0, 1]], expected: [-1, 0, 1], hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        "const seen = new Set();\nconst result = [];\nfor (const value of numbers) {\n  if (!seen.has(value)) {\n    seen.add(value);\n    result.push(value);\n  }\n}\nreturn result;",
      TYPESCRIPT:
        "const seen = new Set<number>();\nconst result: number[] = [];\nfor (const value of numbers) {\n  if (!seen.has(value)) {\n    seen.add(value);\n    result.push(value);\n  }\n}\nreturn result;",
      PYTHON:
        "seen = set()\nresult = []\nfor value in numbers:\n    if value not in seen:\n        seen.add(value)\n        result.append(value)\nreturn result",
      JAVA: "LinkedHashSet<Integer> seen = new LinkedHashSet<>();\nfor (int value : numbers) {\n    seen.add(value);\n}\nint[] result = new int[seen.size()];\nint index = 0;\nfor (int value : seen) {\n    result[index] = value;\n    index += 1;\n}\nreturn result;",
      CPP: "unordered_set<int> seen;\nvector<int> result;\nfor (int value : numbers) {\n    if (seen.insert(value).second) {\n        result.push_back(value);\n    }\n}\nreturn result;",
    },
  },

  // ── 9 ───────────────────────────────────────────────────────────────────
  {
    slug: "second-largest",
    title: "Find the Second Largest",
    difficulty: "EASY",
    description:
      "Return the second largest distinct value in a list. Duplicates do not " +
      "count as separate values, so in [5, 5, 3] the second largest is 3, not 5. " +
      "The list always contains at least two distinct values.",
    explanation:
      'The word "distinct" is doing all the work in this problem. Sorting the ' +
      "raw list and taking the second-from-last element is wrong the moment the " +
      "largest value appears twice. Remove duplicates first, then sort, then take " +
      "the second from the end. If you would rather do it in one pass, track two " +
      "values — the largest and the best value strictly smaller than it — and be " +
      "careful to skip anything equal to your current largest.",
    constraints: [
      "The list contains between 2 and 10,000 numbers.",
      "It always contains at least two distinct values.",
      "Duplicates do not count as separate values.",
    ],
    hints: [
      "Duplicates are the trap here — deal with them first.",
      "Reduce the list to its distinct values, then sort.",
      "The answer is the second element from the largest end.",
    ],
    estimatedTime: "12 min",
    signature: {
      name: "secondLargest",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["js-arrays", "data-structures", "fs-js-collections"],
    examples: [
      { input: "numbers = [4, 9, 1, 7]", output: "7" },
      {
        input: "numbers = [5, 5, 3]",
        output: "3",
        explanation: "The two 5s are one distinct value.",
      },
    ],
    tests: [
      { args: [[4, 9, 1, 7]], expected: 7 },
      { args: [[5, 5, 3]], expected: 3 },
      { args: [[1, 2]], expected: 1 },
      { args: [[-1, -2, -3]], expected: -2, hidden: true },
      { args: [[10, 10, 10, 9]], expected: 9, hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        "const distinct = [...new Set(numbers)].sort((a, b) => b - a);\nreturn distinct[1];",
      TYPESCRIPT:
        "const distinct = [...new Set(numbers)].sort((a, b) => b - a);\nreturn distinct[1];",
      PYTHON: "distinct = sorted(set(numbers), reverse=True)\nreturn distinct[1]",
      JAVA: "TreeSet<Integer> distinct = new TreeSet<>();\nfor (int value : numbers) {\n    distinct.add(value);\n}\nreturn distinct.lower(distinct.last());",
      CPP: "vector<int> values(numbers);\nsort(values.begin(), values.end());\nvalues.erase(unique(values.begin(), values.end()), values.end());\nreturn values[values.size() - 2];",
    },
  },

  // ── 10 ──────────────────────────────────────────────────────────────────
  {
    slug: "fizzbuzz-sequence",
    title: "FizzBuzz Sequence",
    difficulty: "EASY",
    description:
      "Produce the FizzBuzz sequence from 1 up to and including a given limit, " +
      'as a list of strings. A number divisible by 3 becomes "Fizz", one ' +
      'divisible by 5 becomes "Buzz", one divisible by both becomes "FizzBuzz", ' +
      "and anything else becomes the number itself written as text.",
    explanation:
      "The order of your checks is the whole problem. If you test for 3 first, " +
      '15 becomes "Fizz" and you never reach the combined case. Test the most ' +
      "specific condition first — divisible by both — then the two single cases, " +
      "then the fallback. An alternative that scales better is to build the word " +
      'up: start with an empty string, append "Fizz" if divisible by 3, append ' +
      '"Buzz" if divisible by 5, and use the number if the string is still empty.',
    constraints: [
      "The limit is between 1 and 1,000.",
      "The sequence starts at 1 and includes the limit.",
      "Every element is a string, including the plain numbers.",
    ],
    hints: [
      "The remainder operator (% in most languages) tells you about divisibility.",
      "Check divisible-by-both before checking either one on its own.",
      "Plain numbers must be converted to text — the list holds strings only.",
    ],
    estimatedTime: "12 min",
    signature: {
      name: "fizzBuzz",
      params: [{ name: "limit", type: "int" }],
      returns: "string[]",
    },
    topicSlugs: ["js-loops", "js-conditions", "language-syntax"],
    examples: [
      { input: "limit = 5", output: '["1", "2", "Fizz", "4", "Buzz"]' },
      {
        input: "limit = 15",
        output: '["1", "2", "Fizz", …, "14", "FizzBuzz"]',
        explanation: "15 is divisible by both 3 and 5.",
      },
    ],
    tests: [
      { args: [5], expected: ["1", "2", "Fizz", "4", "Buzz"] },
      { args: [1], expected: ["1"] },
      { args: [3], expected: ["1", "2", "Fizz"] },
      {
        args: [15],
        expected: [
          "1",
          "2",
          "Fizz",
          "4",
          "Buzz",
          "Fizz",
          "7",
          "8",
          "Fizz",
          "Buzz",
          "11",
          "Fizz",
          "13",
          "14",
          "FizzBuzz",
        ],
        hidden: true,
      },
      {
        args: [10],
        expected: ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz"],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT:
        'const result = [];\nfor (let n = 1; n <= limit; n += 1) {\n  if (n % 15 === 0) result.push("FizzBuzz");\n  else if (n % 3 === 0) result.push("Fizz");\n  else if (n % 5 === 0) result.push("Buzz");\n  else result.push(String(n));\n}\nreturn result;',
      TYPESCRIPT:
        'const result: string[] = [];\nfor (let n = 1; n <= limit; n += 1) {\n  if (n % 15 === 0) result.push("FizzBuzz");\n  else if (n % 3 === 0) result.push("Fizz");\n  else if (n % 5 === 0) result.push("Buzz");\n  else result.push(String(n));\n}\nreturn result;',
      PYTHON:
        'result = []\nfor n in range(1, limit + 1):\n    if n % 15 == 0:\n        result.append("FizzBuzz")\n    elif n % 3 == 0:\n        result.append("Fizz")\n    elif n % 5 == 0:\n        result.append("Buzz")\n    else:\n        result.append(str(n))\nreturn result',
    },
  },

  // ── 11 ──────────────────────────────────────────────────────────────────
  {
    slug: "factorial",
    title: "Factorial of a Number",
    difficulty: "EASY",
    description:
      "The factorial of a whole number is the product of every number from 1 up " +
      "to it: the factorial of 5 is 1 × 2 × 3 × 4 × 5 = 120. Return the factorial " +
      "of the given number. The factorial of 0 is defined to be 1.",
    explanation:
      "This is the accumulator pattern again, but multiplying instead of adding, " +
      "which changes the starting value: begin at 1, not 0, or every answer comes " +
      "out as zero. The 0 case falls out for free — the loop simply never runs and " +
      "you return your starting 1. That is a nice property to notice: choosing the " +
      "right initial value often removes the special case you were about to write.",
    constraints: [
      "The input is between 0 and 12.",
      "The factorial of 0 is 1.",
      "The result always fits in a normal integer at these sizes.",
    ],
    hints: [
      "Start your running result at 1, not 0.",
      "Multiply by every number from 2 up to the input.",
      "Check what your loop does when the input is 0 — it should not run at all.",
    ],
    estimatedTime: "10 min",
    signature: {
      name: "factorial",
      params: [{ name: "n", type: "int" }],
      returns: "int",
    },
    topicSlugs: ["js-loops", "js-functions", "functions-and-modules"],
    examples: [
      { input: "n = 5", output: "120" },
      { input: "n = 0", output: "1", explanation: "Defined as 1, not 0." },
    ],
    tests: [
      { args: [5], expected: 120 },
      { args: [0], expected: 1 },
      { args: [1], expected: 1 },
      { args: [10], expected: 3628800, hidden: true },
      { args: [12], expected: 479001600, hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        "let result = 1;\nfor (let i = 2; i <= n; i += 1) {\n  result *= i;\n}\nreturn result;",
      TYPESCRIPT:
        "let result = 1;\nfor (let i = 2; i <= n; i += 1) {\n  result *= i;\n}\nreturn result;",
      PYTHON: "result = 1\nfor i in range(2, n + 1):\n    result *= i\nreturn result",
    },
  },

  // ── 12 ──────────────────────────────────────────────────────────────────
  {
    slug: "keep-even-numbers",
    title: "Keep Only the Even Numbers",
    difficulty: "EASY",
    description:
      "Given a list of whole numbers, return a new list containing only the even " +
      "ones, in the same order. Zero is even. The original list must not be " +
      "modified.",
    explanation:
      "This is filtering: walk the input, test each element, and keep the ones " +
      "that pass. Building a new list rather than removing from the original is " +
      "not just tidiness — removing elements while you iterate over the same list " +
      "shifts the positions of everything after them and is a classic source of " +
      "skipped elements. A number is even when dividing by 2 leaves no remainder, " +
      "and that test works for negatives too.",
    constraints: [
      "The list contains between 0 and 10,000 numbers.",
      "Zero counts as even.",
      "Negative even numbers are kept as well.",
    ],
    hints: [
      "Build a new list rather than removing from the input.",
      "A number is even when the remainder of dividing by 2 is 0.",
      "Check that your test still works for negative numbers.",
    ],
    estimatedTime: "8 min",
    signature: {
      name: "keepEvenNumbers",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["js-arrays", "js-conditions", "fs-js-collections"],
    examples: [
      { input: "numbers = [1, 2, 3, 4]", output: "[2, 4]" },
      { input: "numbers = [1, 3]", output: "[]" },
    ],
    tests: [
      { args: [[1, 2, 3, 4]], expected: [2, 4] },
      { args: [[1, 3]], expected: [] },
      { args: [[]], expected: [] },
      { args: [[0, -2, -3]], expected: [0, -2], hidden: true },
      { args: [[2, 4, 6]], expected: [2, 4, 6], hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        "const result = [];\nfor (const value of numbers) {\n  if (value % 2 === 0) result.push(value);\n}\nreturn result;",
      TYPESCRIPT:
        "const result: number[] = [];\nfor (const value of numbers) {\n  if (value % 2 === 0) result.push(value);\n}\nreturn result;",
      PYTHON:
        "result = []\nfor value in numbers:\n    if value % 2 == 0:\n        result.append(value)\nreturn result",
    },
  },

  // ── 13 ──────────────────────────────────────────────────────────────────
  {
    slug: "average-of-list",
    title: "Average of a List",
    difficulty: "EASY",
    description:
      "Return the average of a list of whole numbers, rounded to two decimal " +
      "places. The list always has at least one number. For [1, 2, 4] the average " +
      "is 2.3333…, which rounds to 2.33.",
    explanation:
      "Two things bite here. The first is integer division: in several languages " +
      "dividing one whole number by another throws away the fraction, so 7 / 2 is " +
      "3 rather than 3.5. Make sure at least one side of the division is a " +
      "decimal. The second is rounding — round at the very end, on the final " +
      "answer, never on the running total, or the error compounds.",
    constraints: [
      "The list contains between 1 and 10,000 numbers.",
      "Round the final answer to two decimal places.",
      "The list is never empty.",
    ],
    hints: [
      "Total the list first, then divide by how many numbers there are.",
      "Watch out for integer division — the result must keep its fraction.",
      "Round once, at the end.",
    ],
    estimatedTime: "10 min",
    signature: {
      name: "averageOf",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "float",
    },
    topicSlugs: ["js-arrays", "js-operators", "fs-js-basics"],
    examples: [
      { input: "numbers = [1, 2, 4]", output: "2.33" },
      { input: "numbers = [10]", output: "10" },
    ],
    tests: [
      { args: [[1, 2, 4]], expected: 2.33 },
      { args: [[10]], expected: 10 },
      { args: [[2, 4]], expected: 3 },
      { args: [[1, 2]], expected: 1.5, hidden: true },
      { args: [[-3, 3]], expected: 0, hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        "let total = 0;\nfor (const value of numbers) {\n  total += value;\n}\nreturn Math.round((total / numbers.length) * 100) / 100;",
      TYPESCRIPT:
        "let total = 0;\nfor (const value of numbers) {\n  total += value;\n}\nreturn Math.round((total / numbers.length) * 100) / 100;",
      PYTHON:
        "total = 0\nfor value in numbers:\n    total += value\nreturn round(total / len(numbers), 2)",
    },
  },

  // ── 14 ──────────────────────────────────────────────────────────────────
  {
    slug: "odd-or-even",
    title: "Odd or Even",
    difficulty: "EASY",
    description:
      "Return true when the given whole number is even and false when it is odd. " +
      "Zero is even. Negative numbers follow the same rule: -4 is even, -3 is odd.",
    explanation:
      "The remainder operator answers this directly. The one thing to be careful " +
      "about is that in several languages the remainder of a negative number is " +
      "itself negative — -3 % 2 is -1, not 1 — so testing whether the remainder " +
      "equals 1 quietly fails for negatives. Test whether it equals 0 instead. " +
      "That is the general lesson: prefer the comparison that has one right answer " +
      "over the one that has several.",
    constraints: [
      "The input is between -1,000,000 and 1,000,000.",
      "Zero is even.",
      "Return a boolean, not a string.",
    ],
    hints: [
      "The remainder of dividing by 2 tells you everything.",
      "Compare the remainder with 0, not with 1.",
      "Check your answer against a negative odd number before you submit.",
    ],
    estimatedTime: "5 min",
    signature: {
      name: "isEven",
      params: [{ name: "number", type: "int" }],
      returns: "bool",
    },
    topicSlugs: ["js-operators", "js-conditions", "language-syntax"],
    examples: [
      { input: "number = 4", output: "true" },
      { input: "number = -3", output: "false" },
    ],
    tests: [
      { args: [4], expected: true },
      { args: [-3], expected: false },
      { args: [0], expected: true },
      { args: [-4], expected: true, hidden: true },
      { args: [999999], expected: false, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: "return number % 2 === 0;",
      TYPESCRIPT: "return number % 2 === 0;",
      PYTHON: "return number % 2 == 0",
    },
  },

  // ── 15 ──────────────────────────────────────────────────────────────────
  {
    slug: "celsius-to-fahrenheit",
    title: "Convert Celsius to Fahrenheit",
    difficulty: "EASY",
    description:
      "Convert a temperature from Celsius to Fahrenheit and return it rounded to " +
      "one decimal place. The formula is: multiply by 9, divide by 5, then add 32. " +
      "So 100°C is 212°F.",
    explanation:
      "The point of this one is precedence and integer division, not thermometry. " +
      "Multiplying before dividing keeps the arithmetic exact for longer; dividing " +
      "by 5 first in a language with integer division would throw away the " +
      "fraction before you ever multiply. Write the formula in the order given and " +
      "make sure your division produces a decimal.",
    constraints: [
      "The input is between -273.15 and 1,000.",
      "Round the answer to one decimal place.",
      "Negative temperatures are valid input.",
    ],
    hints: [
      "Multiply by 9 before dividing by 5.",
      "Make sure the division keeps its fractional part.",
      "Round only the final result.",
    ],
    estimatedTime: "6 min",
    signature: {
      name: "celsiusToFahrenheit",
      params: [{ name: "celsius", type: "float" }],
      returns: "float",
    },
    topicSlugs: ["js-operators", "js-functions", "fs-js-basics"],
    examples: [
      { input: "celsius = 100", output: "212" },
      {
        input: "celsius = -40",
        output: "-40",
        explanation: "The two scales meet at -40.",
      },
    ],
    tests: [
      { args: [100], expected: 212 },
      { args: [-40], expected: -40 },
      { args: [0], expected: 32 },
      { args: [37], expected: 98.6, hidden: true },
      { args: [21.5], expected: 70.7, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: "return Math.round((celsius * 9 / 5 + 32) * 10) / 10;",
      TYPESCRIPT: "return Math.round((celsius * 9 / 5 + 32) * 10) / 10;",
      PYTHON: "return round(celsius * 9 / 5 + 32, 1)",
    },
  },

  // ── 16 ──────────────────────────────────────────────────────────────────
  {
    slug: "capitalise-words",
    title: "Capitalise Every Word",
    difficulty: "EASY",
    description:
      "Given a sentence, return it with the first letter of every word in upper " +
      'case and the rest of each word in lower case. So "hello THERE world" ' +
      'becomes "Hello There World". Words are separated by single spaces.',
    explanation:
      "Split the sentence into words, transform each word, then join them back " +
      "together with spaces. That split-transform-join shape comes up constantly " +
      "in text work and is worth recognising. The detail people miss is the rest " +
      "of the word: the statement asks for the remainder in lower case, so simply " +
      'upper-casing the first character leaves "THERE" as "THERE" instead of ' +
      '"There".',
    constraints: [
      "The sentence is between 0 and 1,000 characters long.",
      "Words are separated by single spaces.",
      "The rest of each word must end up in lower case.",
    ],
    hints: [
      "Split on the space character to get the words.",
      "For each word, upper-case the first character and lower-case the rest.",
      "Join the words back together with a single space.",
    ],
    estimatedTime: "12 min",
    signature: {
      name: "capitaliseWords",
      params: [{ name: "sentence", type: "string" }],
      returns: "string",
    },
    topicSlugs: ["js-data-types", "js-functions", "fs-js-basics"],
    examples: [
      { input: 'sentence = "hello THERE world"', output: '"Hello There World"' },
      { input: 'sentence = ""', output: '""' },
    ],
    tests: [
      { args: ["hello THERE world"], expected: "Hello There World" },
      { args: [""], expected: "" },
      { args: ["a"], expected: "A" },
      { args: ["code compass"], expected: "Code Compass", hidden: true },
      { args: ["MIXED case HERE"], expected: "Mixed Case Here", hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        'return sentence\n  .split(" ")\n  .map((word) =>\n    word.length === 0 ? word : word[0].toUpperCase() + word.slice(1).toLowerCase(),\n  )\n  .join(" ");',
      TYPESCRIPT:
        'return sentence\n  .split(" ")\n  .map((word: string) =>\n    word.length === 0 ? word : word[0].toUpperCase() + word.slice(1).toLowerCase(),\n  )\n  .join(" ");',
      PYTHON:
        'words = sentence.split(" ")\nresult = []\nfor word in words:\n    if word == "":\n        result.append(word)\n    else:\n        result.append(word[0].upper() + word[1:].lower())\nreturn " ".join(result)',
    },
  },

  // ── 17 ──────────────────────────────────────────────────────────────────
  {
    slug: "count-letters",
    title: "Count Characters Without Spaces",
    difficulty: "EASY",
    description:
      "Return how many characters a piece of text contains, ignoring spaces. " +
      'So "code compass" has 11 characters, not 12. Punctuation and digits do ' +
      "count.",
    explanation:
      "You can do this two ways and both are fine. Either count every character " +
      "that is not a space as you walk the text, or take the total length and " +
      "subtract the number of spaces. The second is shorter but only correct if " +
      "you count *every* space, including any at the start or end. Prefer the " +
      "version whose correctness you can see at a glance.",
    constraints: [
      "The text is between 0 and 5,000 characters long.",
      "Only the space character is ignored.",
      "Punctuation and digits are counted.",
    ],
    hints: [
      "Walk the text one character at a time.",
      "Skip the character when it is a space.",
      "Everything that is not a space adds one.",
    ],
    estimatedTime: "6 min",
    signature: {
      name: "countLetters",
      params: [{ name: "text", type: "string" }],
      returns: "int",
    },
    topicSlugs: ["js-loops", "js-data-types", "fs-js-basics"],
    examples: [
      { input: 'text = "code compass"', output: "11" },
      { input: 'text = "   "', output: "0" },
    ],
    tests: [
      { args: ["code compass"], expected: 11 },
      { args: ["   "], expected: 0 },
      { args: [""], expected: 0 },
      { args: ["a b c"], expected: 3, hidden: true },
      { args: ["no-spaces-here!"], expected: 15, hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        'let count = 0;\nfor (const character of text) {\n  if (character !== " ") count += 1;\n}\nreturn count;',
      TYPESCRIPT:
        'let count = 0;\nfor (const character of text) {\n  if (character !== " ") count += 1;\n}\nreturn count;',
      PYTHON:
        'count = 0\nfor character in text:\n    if character != " ":\n        count += 1\nreturn count',
    },
  },

  // ── 18 ──────────────────────────────────────────────────────────────────
  {
    slug: "range-difference",
    title: "Difference Between Largest and Smallest",
    difficulty: "EASY",
    description:
      "Given a list of whole numbers, return the largest value minus the " +
      "smallest. For [4, 1, 9] the answer is 8. A list with one number returns 0, " +
      "because the largest and smallest are the same value.",
    explanation:
      "This is two running comparisons in a single pass: track the largest so far " +
      "and the smallest so far, then subtract at the end. Both must start from the " +
      "first element rather than from 0 or from some sentinel like 999999 — a " +
      "sentinel is a bug waiting for input that exceeds it. The result is never " +
      "negative, which is a useful sanity check on your own answer.",
    constraints: [
      "The list contains between 1 and 10,000 numbers.",
      "Each number is between -1,000,000 and 1,000,000.",
      "The answer is never negative.",
    ],
    hints: [
      "You need both the largest and the smallest — track them together.",
      "Start both from the first element.",
      "Subtract once, after the loop.",
    ],
    estimatedTime: "10 min",
    signature: {
      name: "rangeDifference",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["js-arrays", "js-loops", "data-structures"],
    examples: [
      { input: "numbers = [4, 1, 9]", output: "8" },
      { input: "numbers = [7]", output: "0" },
    ],
    tests: [
      { args: [[4, 1, 9]], expected: 8 },
      { args: [[7]], expected: 0 },
      { args: [[-5, 5]], expected: 10 },
      { args: [[-10, -3]], expected: 7, hidden: true },
      { args: [[2, 2, 2]], expected: 0, hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        "let largest = numbers[0];\nlet smallest = numbers[0];\nfor (const value of numbers) {\n  if (value > largest) largest = value;\n  if (value < smallest) smallest = value;\n}\nreturn largest - smallest;",
      TYPESCRIPT:
        "let largest = numbers[0];\nlet smallest = numbers[0];\nfor (const value of numbers) {\n  if (value > largest) largest = value;\n  if (value < smallest) smallest = value;\n}\nreturn largest - smallest;",
      PYTHON:
        "largest = numbers[0]\nsmallest = numbers[0]\nfor value in numbers:\n    if value > largest:\n        largest = value\n    if value < smallest:\n        smallest = value\nreturn largest - smallest",
    },
  },

  // ── 19 ──────────────────────────────────────────────────────────────────
  {
    slug: "repeat-string",
    title: "Repeat a String",
    difficulty: "EASY",
    description:
      "Return the given text joined to itself a number of times. Repeating " +
      '"ab" three times gives "ababab". Repeating anything zero times gives an ' +
      "empty string.",
    explanation:
      "Most languages have a direct way to repeat a string, and using it is the " +
      "right answer. If you build the result in a loop instead, be aware that in " +
      "many languages strings cannot be modified, so each concatenation creates a " +
      "whole new string — fine for small counts, wasteful for large ones. The zero " +
      "case is the one to check: your loop should produce an empty string, not the " +
      "original text.",
    constraints: [
      "The text is between 0 and 100 characters long.",
      "The repeat count is between 0 and 100.",
      "A count of 0 returns an empty string.",
    ],
    hints: [
      "Look for a built-in repeat before writing a loop.",
      "If you loop, start from an empty string.",
      "Check what happens when the count is 0.",
    ],
    estimatedTime: "6 min",
    signature: {
      name: "repeatString",
      params: [
        { name: "text", type: "string" },
        { name: "times", type: "int" },
      ],
      returns: "string",
    },
    topicSlugs: ["js-data-types", "js-loops", "language-syntax"],
    examples: [
      { input: 'text = "ab", times = 3', output: '"ababab"' },
      { input: 'text = "hi", times = 0', output: '""' },
    ],
    tests: [
      { args: ["ab", 3], expected: "ababab" },
      { args: ["hi", 0], expected: "" },
      { args: ["", 5], expected: "" },
      { args: ["x", 1], expected: "x", hidden: true },
      { args: ["-", 10], expected: "----------", hidden: true },
    ],
    solutions: {
      JAVASCRIPT: "return text.repeat(times);",
      TYPESCRIPT: "return text.repeat(times);",
      PYTHON: "return text * times",
    },
  },

  // ── 20 ──────────────────────────────────────────────────────────────────
  {
    slug: "sum-of-digits",
    title: "Sum the Digits",
    difficulty: "EASY",
    description:
      "Given a whole number, add up its individual digits and return the total. " +
      "For 472 the answer is 4 + 7 + 2 = 13. Negative numbers use the digits of " +
      "their absolute value, so -472 also gives 13.",
    explanation:
      "There are two clean approaches. The arithmetic one repeatedly takes the " +
      "last digit with a remainder-by-10 and then removes it with an integer " +
      "division by 10, until nothing is left. The text one converts the number to " +
      "a string and adds up each character's numeric value. Both are fine; the " +
      "arithmetic version is worth writing at least once because the take-the-last-" +
      "digit-then-shrink pattern shows up in many number problems.",
    constraints: [
      "The input is between -1,000,000 and 1,000,000.",
      "Use the digits of the absolute value for negative input.",
      "The digits of 0 sum to 0.",
    ],
    hints: [
      "Handle the sign first, so the rest of your code sees a positive number.",
      "Remainder by 10 gives you the last digit.",
      "Integer division by 10 removes that digit so you can repeat.",
    ],
    estimatedTime: "10 min",
    signature: {
      name: "sumOfDigits",
      params: [{ name: "number", type: "int" }],
      returns: "int",
    },
    topicSlugs: ["js-loops", "js-operators", "language-syntax"],
    examples: [
      { input: "number = 472", output: "13" },
      { input: "number = -472", output: "13" },
    ],
    tests: [
      { args: [472], expected: 13 },
      { args: [-472], expected: 13 },
      { args: [0], expected: 0 },
      { args: [1000000], expected: 1, hidden: true },
      { args: [99999], expected: 45, hidden: true },
    ],
    solutions: {
      JAVASCRIPT:
        "let remaining = Math.abs(number);\nlet total = 0;\nwhile (remaining > 0) {\n  total += remaining % 10;\n  remaining = Math.floor(remaining / 10);\n}\nreturn total;",
      TYPESCRIPT:
        "let remaining = Math.abs(number);\nlet total = 0;\nwhile (remaining > 0) {\n  total += remaining % 10;\n  remaining = Math.floor(remaining / 10);\n}\nreturn total;",
      PYTHON:
        "remaining = abs(number)\ntotal = 0\nwhile remaining > 0:\n    total += remaining % 10\n    remaining //= 10\nreturn total",
    },
  },
];
