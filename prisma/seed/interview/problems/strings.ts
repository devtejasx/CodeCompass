import type { SeedProblem } from "../../problems/types";

/**
 * String manipulation.
 *
 * Strings are arrays of characters that pretend to be values, and most string
 * bugs come from forgetting one half of that sentence. The problems here work
 * through the consequences: scanning with two indices, building output in a
 * list rather than by repeated concatenation, and treating "same" as a
 * question about a normalised form rather than about the raw text.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const STRING_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "clean-palindrome",
    title: "Palindrome, Ignoring Everything Else",
    difficulty: "EASY",
    interviewFrequency: "VERY_HIGH",
    description:
      "Decide whether a piece of text reads the same forwards and backwards " +
      "once you ignore punctuation, spaces and capitalisation. Only letters " +
      "and digits count. Text with nothing but punctuation in it counts as a " +
      "palindrome.",
    explanation:
      "Two indices, one at each end, walking towards each other. Each one skips " +
      "anything that is not a letter or digit, then the two characters are " +
      "compared with case folded away; a mismatch ends it immediately. Building " +
      "a cleaned copy of the string and comparing it with its reverse is also " +
      "correct and easier to write — the two-pointer version is what an " +
      "interviewer is looking for, because it uses no extra memory and stops at " +
      "the first mismatch rather than always doing the whole string.",
    constraints: [
      "The text is between 0 and 200,000 characters long.",
      "It may contain letters, digits, spaces and punctuation.",
      "Comparison ignores case.",
    ],
    hints: [
      "One index from the left, one from the right.",
      "Skip characters that are not letters or digits before comparing.",
      "Fold case when you compare, not when you scan.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "isCleanPalindrome",
      params: [{ name: "text", type: "string" }],
      returns: "bool",
    },
    topicSlugs: ["dsa-strings", "dsa-two-pointers", "js-data-types"],
    examples: [
      {
        input: 'text = "A man, a plan, a canal: Panama"',
        output: "true",
        explanation: 'Cleaned, it reads "amanaplanacanalpanama".',
      },
      { input: 'text = "race a car"', output: "false" },
    ],
    tests: [
      { args: ["A man, a plan, a canal: Panama"], expected: true },
      { args: ["race a car"], expected: false },
      { args: [" "], expected: true },
      { args: [""], expected: true, hidden: true },
      { args: ["0P"], expected: false, hidden: true },
      { args: ["ab_a"], expected: true, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const isLetterOrDigit = (c) => /[a-z0-9]/i.test(c);
let left = 0;
let right = text.length - 1;
while (left < right) {
  while (left < right && !isLetterOrDigit(text[left])) left += 1;
  while (left < right && !isLetterOrDigit(text[right])) right -= 1;
  if (text[left].toLowerCase() !== text[right].toLowerCase()) return false;
  left += 1;
  right -= 1;
}
return true;`,
      TYPESCRIPT: `const isLetterOrDigit = (c: string): boolean => /[a-z0-9]/i.test(c);
let left = 0;
let right = text.length - 1;
while (left < right) {
  while (left < right && !isLetterOrDigit(text[left])) left += 1;
  while (left < right && !isLetterOrDigit(text[right])) right -= 1;
  if (text[left].toLowerCase() !== text[right].toLowerCase()) return false;
  left += 1;
  right -= 1;
}
return true;`,
      PYTHON: `left = 0
right = len(text) - 1
while left < right:
    while left < right and not text[left].isalnum():
        left += 1
    while left < right and not text[right].isalnum():
        right -= 1
    if text[left].lower() != text[right].lower():
        return False
    left += 1
    right -= 1
return True`,
      JAVA: `int left = 0;
int right = text.length() - 1;
while (left < right) {
    while (left < right && !Character.isLetterOrDigit(text.charAt(left))) left += 1;
    while (left < right && !Character.isLetterOrDigit(text.charAt(right))) right -= 1;
    if (Character.toLowerCase(text.charAt(left)) != Character.toLowerCase(text.charAt(right))) {
        return false;
    }
    left += 1;
    right -= 1;
}
return true;`,
      CPP: `int left = 0;
int right = (int)text.size() - 1;
while (left < right) {
    while (left < right && !isalnum((unsigned char)text[left])) left += 1;
    while (left < right && !isalnum((unsigned char)text[right])) right -= 1;
    if (tolower((unsigned char)text[left]) != tolower((unsigned char)text[right])) {
        return false;
    }
    left += 1;
    right -= 1;
}
return true;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "longest-common-prefix",
    title: "Longest Common Prefix",
    difficulty: "EASY",
    interviewFrequency: "VERY_HIGH",
    description:
      "Return the longest starting section that every word in the list shares. " +
      "If they have nothing in common at the start, return an empty string. " +
      "The list always contains at least one word.",
    explanation:
      "Take the first word as a working answer and shorten it against each " +
      "other word in turn: while the current word does not start with the " +
      "working answer, drop a character from the end. An empty answer means " +
      "there is nothing in common and you can stop early. The alternative is a " +
      "column-wise scan — compare position 0 of every word, then position 1, " +
      "stopping at the first disagreement or the first word that runs out — " +
      "which is the same amount of work arranged differently. Both are O(total " +
      "characters), which is as good as it gets when the answer might be every " +
      "character.",
    constraints: [
      "There is between 1 and 200 words.",
      "Each word is between 0 and 200 lowercase letters.",
      "Return an empty string when there is no shared prefix.",
    ],
    hints: [
      "Start with the first word as the candidate answer.",
      "Shorten the candidate until the next word starts with it.",
      "An empty candidate means you can stop immediately.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "longestCommonPrefix",
      params: [{ name: "words", type: "string[]" }],
      returns: "string",
    },
    topicSlugs: ["dsa-strings", "js-arrays"],
    examples: [
      { input: 'words = ["flower", "flow", "flight"]', output: '"fl"' },
      {
        input: 'words = ["dog", "racecar", "car"]',
        output: '""',
        explanation: "Not even the first character is shared.",
      },
    ],
    tests: [
      { args: [["flower", "flow", "flight"]], expected: "fl" },
      { args: [["dog", "racecar", "car"]], expected: "" },
      { args: [["single"]], expected: "single" },
      { args: [["", ""]], expected: "", hidden: true },
      { args: [["abc", "abc"]], expected: "abc", hidden: true },
      { args: [["a", "ab"]], expected: "a", hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let prefix = words[0];
for (const word of words) {
  while (prefix.length > 0 && !word.startsWith(prefix)) {
    prefix = prefix.slice(0, -1);
  }
  if (prefix.length === 0) return "";
}
return prefix;`,
      TYPESCRIPT: `let prefix = words[0];
for (const word of words) {
  while (prefix.length > 0 && !word.startsWith(prefix)) {
    prefix = prefix.slice(0, -1);
  }
  if (prefix.length === 0) return "";
}
return prefix;`,
      PYTHON: `prefix = words[0]
for word in words:
    while prefix and not word.startswith(prefix):
        prefix = prefix[:-1]
    if not prefix:
        return ""
return prefix`,
      JAVA: `String prefix = words[0];
for (String word : words) {
    while (prefix.length() > 0 && !word.startsWith(prefix)) {
        prefix = prefix.substring(0, prefix.length() - 1);
    }
    if (prefix.isEmpty()) return "";
}
return prefix;`,
      CPP: `string prefix = words[0];
for (const string& word : words) {
    while (!prefix.empty() && word.compare(0, prefix.size(), prefix) != 0) {
        prefix.pop_back();
    }
    if (prefix.empty()) return "";
}
return prefix;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "roman-to-integer",
    title: "Roman Numeral to Number",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Convert a Roman numeral to the number it represents. The symbols are I " +
      "(1), V (5), X (10), L (50), C (100), D (500) and M (1000). A smaller " +
      "symbol placed before a larger one is subtracted: IV is 4 and IX is 9.",
    explanation:
      "Read left to right and compare each symbol with the one after it. If " +
      "the current symbol is worth less than the next, it is being subtracted, " +
      "so subtract it; otherwise add it. That single rule covers all six " +
      "subtractive pairs without listing them, which is why it is the version " +
      "worth remembering. Reading right to left works too: add each symbol " +
      "unless it is smaller than the largest seen so far.",
    constraints: [
      "The numeral is between 1 and 15 characters.",
      "It is a valid Roman numeral in the range 1 to 3999.",
      "Symbols are uppercase.",
    ],
    hints: [
      "Compare each symbol with the one after it.",
      "Smaller before larger means subtract rather than add.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "romanToInteger",
      params: [{ name: "numeral", type: "string" }],
      returns: "int",
    },
    topicSlugs: ["dsa-strings", "js-objects"],
    examples: [
      { input: 'numeral = "LVIII"', output: "58", explanation: "L + V + III." },
      {
        input: 'numeral = "MCMXCIV"',
        output: "1994",
        explanation: "M + CM (900) + XC (90) + IV (4).",
      },
    ],
    tests: [
      { args: ["III"], expected: 3 },
      { args: ["LVIII"], expected: 58 },
      { args: ["MCMXCIV"], expected: 1994 },
      { args: ["IV"], expected: 4, hidden: true },
      { args: ["IX"], expected: 9, hidden: true },
      { args: ["MMMCMXCIX"], expected: 3999, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const worth = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
let total = 0;
for (let i = 0; i < numeral.length; i += 1) {
  const value = worth[numeral[i]];
  const next = i + 1 < numeral.length ? worth[numeral[i + 1]] : 0;
  total += value < next ? -value : value;
}
return total;`,
      TYPESCRIPT: `const worth: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};
let total = 0;
for (let i = 0; i < numeral.length; i += 1) {
  const value = worth[numeral[i]];
  const next = i + 1 < numeral.length ? worth[numeral[i + 1]] : 0;
  total += value < next ? -value : value;
}
return total;`,
      PYTHON: `worth = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
total = 0
for i, symbol in enumerate(numeral):
    value = worth[symbol]
    next_value = worth[numeral[i + 1]] if i + 1 < len(numeral) else 0
    total += -value if value < next_value else value
return total`,
      JAVA: `Map<Character, Integer> worth = new HashMap<>();
worth.put('I', 1);
worth.put('V', 5);
worth.put('X', 10);
worth.put('L', 50);
worth.put('C', 100);
worth.put('D', 500);
worth.put('M', 1000);
int total = 0;
for (int i = 0; i < numeral.length(); i += 1) {
    int value = worth.get(numeral.charAt(i));
    int next = i + 1 < numeral.length() ? worth.get(numeral.charAt(i + 1)) : 0;
    total += value < next ? -value : value;
}
return total;`,
      CPP: `unordered_map<char, int> worth = {
    {'I', 1}, {'V', 5}, {'X', 10}, {'L', 50},
    {'C', 100}, {'D', 500}, {'M', 1000}
};
int total = 0;
for (size_t i = 0; i < numeral.size(); i += 1) {
    int value = worth[numeral[i]];
    int next = i + 1 < numeral.size() ? worth[numeral[i + 1]] : 0;
    total += value < next ? -value : value;
}
return total;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "find-substring-index",
    title: "Where Does It Start?",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Find the position where the second string first appears inside the " +
      "first, and return that position. Return -1 when it does not appear at " +
      "all, and 0 when the second string is empty.",
    explanation:
      "The direct approach tries every starting position in the haystack and " +
      "compares forwards from there, which is O(n × m) in the worst case and " +
      "perfectly acceptable in an interview as long as you say so. The reason " +
      "to write it by hand rather than calling the library function is the " +
      "boundary arithmetic: the last starting position worth trying is length " +
      "of haystack minus length of needle, and getting that wrong is how you " +
      "read past the end of the string. The linear-time answer is the KMP " +
      "algorithm, which is worth knowing about even if you never write it from " +
      "memory.",
    constraints: [
      "Both strings are between 0 and 10,000 characters.",
      "Both contain lowercase English letters.",
      "An empty needle is found at position 0.",
    ],
    hints: [
      "Stop trying start positions once fewer than needle-length characters remain.",
      "Handle the empty needle before the loop.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "findSubstringIndex",
      params: [
        { name: "haystack", type: "string" },
        { name: "needle", type: "string" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-strings", "js-data-types"],
    examples: [
      { input: 'haystack = "hello", needle = "ll"', output: "2" },
      { input: 'haystack = "aaaaa", needle = "bba"', output: "-1" },
    ],
    tests: [
      { args: ["hello", "ll"], expected: 2 },
      { args: ["aaaaa", "bba"], expected: -1 },
      { args: ["abc", ""], expected: 0 },
      { args: ["mississippi", "issip"], expected: 4, hidden: true },
      { args: ["a", "a"], expected: 0, hidden: true },
      { args: ["abc", "abcd"], expected: -1, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `if (needle.length === 0) return 0;
for (let start = 0; start + needle.length <= haystack.length; start += 1) {
  let at = 0;
  while (at < needle.length && haystack[start + at] === needle[at]) at += 1;
  if (at === needle.length) return start;
}
return -1;`,
      TYPESCRIPT: `if (needle.length === 0) return 0;
for (let start = 0; start + needle.length <= haystack.length; start += 1) {
  let at = 0;
  while (at < needle.length && haystack[start + at] === needle[at]) at += 1;
  if (at === needle.length) return start;
}
return -1;`,
      PYTHON: `if not needle:
    return 0
for start in range(len(haystack) - len(needle) + 1):
    at = 0
    while at < len(needle) and haystack[start + at] == needle[at]:
        at += 1
    if at == len(needle):
        return start
return -1`,
      JAVA: `if (needle.isEmpty()) return 0;
for (int start = 0; start + needle.length() <= haystack.length(); start += 1) {
    int at = 0;
    while (at < needle.length() && haystack.charAt(start + at) == needle.charAt(at)) {
        at += 1;
    }
    if (at == needle.length()) return start;
}
return -1;`,
      CPP: `if (needle.empty()) return 0;
for (int start = 0; start + (int)needle.size() <= (int)haystack.size(); start += 1) {
    int at = 0;
    while (at < (int)needle.size() && haystack[start + at] == needle[at]) at += 1;
    if (at == (int)needle.size()) return start;
}
return -1;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "add-binary-strings",
    title: "Add Two Binary Strings",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Two non-negative numbers are given as strings of 0s and 1s. Add them " +
      "and return the answer, also as a binary string. The inputs can be far " +
      "longer than any integer type, so convert nothing.",
    explanation:
      "Column addition, exactly as taught at school, from the right. Walk both " +
      "strings backwards with one index each, taking a 0 when a string has run " +
      "out, and keep a carry between columns. Each column produces total % 2 as " +
      "its digit and total / 2 as the next carry. Collect the digits as you go " +
      "and reverse at the end — appending to a list and reversing once is " +
      "cheaper than prepending to a string every time, which quietly copies the " +
      "whole string on each step. Do not forget the final carry.",
    constraints: [
      "Each string is between 1 and 10,000 characters.",
      "Each contains only the characters 0 and 1, with no leading zeros unless the value is 0.",
      "Do not convert the strings to integers.",
    ],
    hints: [
      "Walk both strings from the right with a carry.",
      "A string that has run out contributes 0.",
      "Build the digits in a list and reverse once at the end.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "addBinary",
      params: [
        { name: "first", type: "string" },
        { name: "second", type: "string" },
      ],
      returns: "string",
    },
    topicSlugs: ["dsa-strings", "js-loops"],
    examples: [
      { input: 'first = "11", second = "1"', output: '"100"' },
      { input: 'first = "1010", second = "1011"', output: '"10101"' },
    ],
    tests: [
      { args: ["11", "1"], expected: "100" },
      { args: ["1010", "1011"], expected: "10101" },
      { args: ["0", "0"], expected: "0" },
      { args: ["1", "1"], expected: "10", hidden: true },
      { args: ["0", "1"], expected: "1", hidden: true },
      { args: ["111", "1"], expected: "1000", hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const digits = [];
let i = first.length - 1;
let j = second.length - 1;
let carry = 0;
while (i >= 0 || j >= 0 || carry > 0) {
  const a = i >= 0 ? Number(first[i]) : 0;
  const b = j >= 0 ? Number(second[j]) : 0;
  const total = a + b + carry;
  digits.push(String(total % 2));
  carry = total >= 2 ? 1 : 0;
  i -= 1;
  j -= 1;
}
return digits.reverse().join("");`,
      TYPESCRIPT: `const digits: string[] = [];
let i = first.length - 1;
let j = second.length - 1;
let carry = 0;
while (i >= 0 || j >= 0 || carry > 0) {
  const a = i >= 0 ? Number(first[i]) : 0;
  const b = j >= 0 ? Number(second[j]) : 0;
  const total = a + b + carry;
  digits.push(String(total % 2));
  carry = total >= 2 ? 1 : 0;
  i -= 1;
  j -= 1;
}
return digits.reverse().join("");`,
      PYTHON: `digits = []
i = len(first) - 1
j = len(second) - 1
carry = 0
while i >= 0 or j >= 0 or carry > 0:
    a = int(first[i]) if i >= 0 else 0
    b = int(second[j]) if j >= 0 else 0
    total = a + b + carry
    digits.append(str(total % 2))
    carry = 1 if total >= 2 else 0
    i -= 1
    j -= 1
return "".join(reversed(digits))`,
      JAVA: `StringBuilder digits = new StringBuilder();
int i = first.length() - 1;
int j = second.length() - 1;
int carry = 0;
while (i >= 0 || j >= 0 || carry > 0) {
    int a = i >= 0 ? first.charAt(i) - '0' : 0;
    int b = j >= 0 ? second.charAt(j) - '0' : 0;
    int total = a + b + carry;
    digits.append((char) ('0' + (total % 2)));
    carry = total >= 2 ? 1 : 0;
    i -= 1;
    j -= 1;
}
return digits.reverse().toString();`,
      CPP: `string digits;
int i = (int)first.size() - 1;
int j = (int)second.size() - 1;
int carry = 0;
while (i >= 0 || j >= 0 || carry > 0) {
    int a = i >= 0 ? first[i] - '0' : 0;
    int b = j >= 0 ? second[j] - '0' : 0;
    int total = a + b + carry;
    digits += (char)('0' + (total % 2));
    carry = total >= 2 ? 1 : 0;
    i -= 1;
    j -= 1;
}
reverse(digits.begin(), digits.end());
return digits;`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "reverse-only-letters",
    title: "Reverse the Letters Only",
    difficulty: "EASY",
    interviewFrequency: "MEDIUM",
    description:
      "Reverse the letters in a piece of text while leaving every other " +
      'character exactly where it is. So "ab-cd" becomes "dc-ba": the ' +
      "hyphen has not moved, but the letters around it have swapped.",
    explanation:
      "Two indices moving towards each other again, but this time each one " +
      "stops on a letter and the pair is swapped. Everything that is not a " +
      "letter is stepped over and therefore stays where it was. The habit worth " +
      "taking from this is separating the scan from the work: the loop's job is " +
      "to find the next pair of positions that matter, and the swap is a " +
      "detail. The same skeleton solves 'reverse the vowels' and 'reverse only " +
      "digits' without a rewrite.",
    constraints: [
      "The text is between 1 and 10,000 characters.",
      "It may contain letters, digits and punctuation, but no spaces.",
      "Case is preserved — only positions change.",
    ],
    hints: [
      "Walk one index from each end, stopping only on letters.",
      "Swap, then move both indices inwards.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "reverseOnlyLetters",
      params: [{ name: "text", type: "string" }],
      returns: "string",
    },
    topicSlugs: ["dsa-strings", "dsa-two-pointers"],
    examples: [
      { input: 'text = "ab-cd"', output: '"dc-ba"' },
      {
        input: 'text = "a-bC-dEf-ghIj"',
        output: '"j-Ih-gfE-dCba"',
        explanation: "Every hyphen is still at the same index.",
      },
    ],
    tests: [
      { args: ["ab-cd"], expected: "dc-ba" },
      { args: ["a-bC-dEf-ghIj"], expected: "j-Ih-gfE-dCba" },
      { args: ["Test1ng-Leet=code-Q!"], expected: "Qedo1ct-eeLg=ntse-T!" },
      { args: ["ab"], expected: "ba", hidden: true },
      { args: ["7_28]"], expected: "7_28]", hidden: true },
      { args: ["a"], expected: "a", hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const letters = text.split("");
const isLetter = (c) => /[a-z]/i.test(c);
let left = 0;
let right = letters.length - 1;
while (left < right) {
  if (!isLetter(letters[left])) {
    left += 1;
  } else if (!isLetter(letters[right])) {
    right -= 1;
  } else {
    const held = letters[left];
    letters[left] = letters[right];
    letters[right] = held;
    left += 1;
    right -= 1;
  }
}
return letters.join("");`,
      TYPESCRIPT: `const letters = text.split("");
const isLetter = (c: string): boolean => /[a-z]/i.test(c);
let left = 0;
let right = letters.length - 1;
while (left < right) {
  if (!isLetter(letters[left])) {
    left += 1;
  } else if (!isLetter(letters[right])) {
    right -= 1;
  } else {
    const held = letters[left];
    letters[left] = letters[right];
    letters[right] = held;
    left += 1;
    right -= 1;
  }
}
return letters.join("");`,
      PYTHON: `letters = list(text)
left = 0
right = len(letters) - 1
while left < right:
    if not letters[left].isalpha():
        left += 1
    elif not letters[right].isalpha():
        right -= 1
    else:
        letters[left], letters[right] = letters[right], letters[left]
        left += 1
        right -= 1
return "".join(letters)`,
      JAVA: `char[] letters = text.toCharArray();
int left = 0;
int right = letters.length - 1;
while (left < right) {
    if (!Character.isLetter(letters[left])) {
        left += 1;
    } else if (!Character.isLetter(letters[right])) {
        right -= 1;
    } else {
        char held = letters[left];
        letters[left] = letters[right];
        letters[right] = held;
        left += 1;
        right -= 1;
    }
}
return new String(letters);`,
      CPP: `string letters = text;
int left = 0;
int right = (int)letters.size() - 1;
while (left < right) {
    if (!isalpha((unsigned char)letters[left])) {
        left += 1;
    } else if (!isalpha((unsigned char)letters[right])) {
        right -= 1;
    } else {
        char held = letters[left];
        letters[left] = letters[right];
        letters[right] = held;
        left += 1;
        right -= 1;
    }
}
return letters;`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "reverse-words-in-sentence",
    title: "Reverse the Word Order",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Return the words of a sentence in the opposite order, separated by " +
      "single spaces. Leading, trailing and repeated spaces in the input are " +
      "not kept: the words themselves are unchanged, only their order and the " +
      "spacing between them.",
    explanation:
      "In a language with a split function this is three calls — split on " +
      "whitespace, drop the empty pieces, reverse, join with one space — and " +
      "that is a fine answer worth writing first. The version an interviewer " +
      "usually wants next collects each word by hand: walk the string, skip " +
      "spaces, take characters until the next space, and push the word onto a " +
      "list. That version is the one that survives the follow-up 'do it in " +
      "place on a character array', because you already know where every word " +
      "starts and ends.",
    constraints: [
      "The sentence is between 1 and 10,000 characters.",
      "It contains letters, digits and spaces only.",
      "The result has no leading or trailing spaces and single spaces between words.",
    ],
    hints: [
      "Splitting on whitespace leaves empty pieces when spaces repeat — drop them.",
      "Reverse the list of words, not the characters.",
      "Join with exactly one space.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "reverseWordOrder",
      params: [{ name: "sentence", type: "string" }],
      returns: "string",
    },
    topicSlugs: ["dsa-strings", "js-arrays"],
    examples: [
      { input: 'sentence = "the sky is blue"', output: '"blue is sky the"' },
      {
        input: 'sentence = "  hello world  "',
        output: '"world hello"',
        explanation: "The surrounding spaces are dropped.",
      },
    ],
    tests: [
      { args: ["the sky is blue"], expected: "blue is sky the" },
      { args: ["  hello world  "], expected: "world hello" },
      { args: ["a good   example"], expected: "example good a" },
      { args: ["one"], expected: "one", hidden: true },
      { args: ["   "], expected: "", hidden: true },
      { args: ["a b"], expected: "b a", hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const words = [];
let at = 0;
while (at < sentence.length) {
  while (at < sentence.length && sentence[at] === " ") at += 1;
  let start = at;
  while (at < sentence.length && sentence[at] !== " ") at += 1;
  if (at > start) words.push(sentence.slice(start, at));
}
return words.reverse().join(" ");`,
      TYPESCRIPT: `const words: string[] = [];
let at = 0;
while (at < sentence.length) {
  while (at < sentence.length && sentence[at] === " ") at += 1;
  const start = at;
  while (at < sentence.length && sentence[at] !== " ") at += 1;
  if (at > start) words.push(sentence.slice(start, at));
}
return words.reverse().join(" ");`,
      PYTHON: `words = []
at = 0
while at < len(sentence):
    while at < len(sentence) and sentence[at] == " ":
        at += 1
    start = at
    while at < len(sentence) and sentence[at] != " ":
        at += 1
    if at > start:
        words.append(sentence[start:at])
words.reverse()
return " ".join(words)`,
      JAVA: `List<String> words = new ArrayList<>();
int at = 0;
while (at < sentence.length()) {
    while (at < sentence.length() && sentence.charAt(at) == ' ') at += 1;
    int start = at;
    while (at < sentence.length() && sentence.charAt(at) != ' ') at += 1;
    if (at > start) words.add(sentence.substring(start, at));
}
Collections.reverse(words);
return String.join(" ", words);`,
      CPP: `vector<string> words;
int at = 0;
int n = (int)sentence.size();
while (at < n) {
    while (at < n && sentence[at] == ' ') at += 1;
    int start = at;
    while (at < n && sentence[at] != ' ') at += 1;
    if (at > start) words.push_back(sentence.substr(start, at - start));
}
string result;
for (int i = (int)words.size() - 1; i >= 0; i -= 1) {
    if (!result.empty()) result += " ";
    result += words[i];
}
return result;`,
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "text-to-integer",
    title: "Parse a Number From Text",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Read a number from the front of a piece of text, the way a lenient " +
      "parser would: skip any leading spaces, accept one optional + or -, then " +
      "read digits until something that is not a digit. Anything after that is " +
      "ignored, and text that does not start with a number after the spaces " +
      "gives 0. Clamp the answer to the 32-bit signed range.",
    explanation:
      "This problem is not about algorithms at all — it is about following a " +
      "specification exactly, which is what a lot of real interview questions " +
      "are testing. Handle the four stages in order (spaces, sign, digits, " +
      "stop) and do not let them blur together: a sign after a digit is not a " +
      "sign, and a second sign ends the number. Clamping matters as much as " +
      "parsing: accumulate into a type wide enough to notice the overflow, or " +
      "check before each multiplication, and return the boundary value rather " +
      "than a wrapped one.",
    constraints: [
      "The text is between 0 and 200 characters.",
      "It may contain letters, digits, spaces and the characters + and -.",
      "The answer is clamped to between -2,147,483,648 and 2,147,483,647.",
    ],
    hints: [
      "Four stages, in order: spaces, one optional sign, digits, then stop.",
      "Anything unexpected ends the number rather than being skipped.",
      "Clamp rather than wrap when the digits overflow.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "textToInteger",
      params: [{ name: "text", type: "string" }],
      returns: "int",
    },
    topicSlugs: ["dsa-strings", "js-data-types"],
    examples: [
      { input: 'text = "   -42 is cold"', output: "-42" },
      {
        input: 'text = "words and 987"',
        output: "0",
        explanation: "The first non-space character is not a digit or a sign.",
      },
    ],
    tests: [
      { args: ["42"], expected: 42 },
      { args: ["   -42 is cold"], expected: -42 },
      { args: ["4193 with words"], expected: 4193 },
      { args: ["words and 987"], expected: 0, hidden: true },
      { args: ["-91283472332"], expected: -2147483648, hidden: true },
      { args: ["+1"], expected: 1, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const LOW = -2147483648;
const HIGH = 2147483647;
let at = 0;
while (at < text.length && text[at] === " ") at += 1;
let sign = 1;
if (at < text.length && (text[at] === "+" || text[at] === "-")) {
  if (text[at] === "-") sign = -1;
  at += 1;
}
let value = 0;
while (at < text.length && text[at] >= "0" && text[at] <= "9") {
  value = value * 10 + (text.charCodeAt(at) - 48);
  if (sign === 1 && value > HIGH) return HIGH;
  if (sign === -1 && -value < LOW) return LOW;
  at += 1;
}
return sign * value;`,
      TYPESCRIPT: `const LOW = -2147483648;
const HIGH = 2147483647;
let at = 0;
while (at < text.length && text[at] === " ") at += 1;
let sign = 1;
if (at < text.length && (text[at] === "+" || text[at] === "-")) {
  if (text[at] === "-") sign = -1;
  at += 1;
}
let value = 0;
while (at < text.length && text[at] >= "0" && text[at] <= "9") {
  value = value * 10 + (text.charCodeAt(at) - 48);
  if (sign === 1 && value > HIGH) return HIGH;
  if (sign === -1 && -value < LOW) return LOW;
  at += 1;
}
return sign * value;`,
      PYTHON: `LOW = -2147483648
HIGH = 2147483647
at = 0
while at < len(text) and text[at] == " ":
    at += 1
sign = 1
if at < len(text) and text[at] in "+-":
    if text[at] == "-":
        sign = -1
    at += 1
value = 0
while at < len(text) and text[at].isdigit():
    value = value * 10 + int(text[at])
    if sign == 1 and value > HIGH:
        return HIGH
    if sign == -1 and -value < LOW:
        return LOW
    at += 1
return sign * value`,
      JAVA: `int LOW = -2147483648;
int HIGH = 2147483647;
int at = 0;
while (at < text.length() && text.charAt(at) == ' ') at += 1;
int sign = 1;
if (at < text.length() && (text.charAt(at) == '+' || text.charAt(at) == '-')) {
    if (text.charAt(at) == '-') sign = -1;
    at += 1;
}
long value = 0;
while (at < text.length() && Character.isDigit(text.charAt(at))) {
    value = value * 10 + (text.charAt(at) - '0');
    if (sign == 1 && value > HIGH) return HIGH;
    if (sign == -1 && -value < LOW) return LOW;
    at += 1;
}
return (int) (sign * value);`,
      CPP: `long long LOW = -2147483648LL;
long long HIGH = 2147483647LL;
int at = 0;
int n = (int)text.size();
while (at < n && text[at] == ' ') at += 1;
int sign = 1;
if (at < n && (text[at] == '+' || text[at] == '-')) {
    if (text[at] == '-') sign = -1;
    at += 1;
}
long long value = 0;
while (at < n && isdigit((unsigned char)text[at])) {
    value = value * 10 + (text[at] - '0');
    if (sign == 1 && value > HIGH) return (int)HIGH;
    if (sign == -1 && -value < LOW) return (int)LOW;
    at += 1;
}
return (int)(sign * value);`,
    },
  },

  // ── 9 ───────────────────────────────────────────────────────────────────
  {
    slug: "integer-to-roman",
    title: "Number to Roman Numeral",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Convert a number between 1 and 3999 into its Roman numeral. Remember " +
      "the subtractive forms: 4 is IV rather than IIII, 9 is IX, 40 is XL, 90 " +
      "is XC, 400 is CD and 900 is CM.",
    explanation:
      "Treat the six subtractive forms as symbols in their own right. Once CM, " +
      "CD, XC, XL, IX and IV sit in the value table alongside M, D, C, L, X, V " +
      "and I, the algorithm is greedy and tiny: walk the table from largest to " +
      "smallest, and while the number is at least the current value, append " +
      "that symbol and subtract. No special cases, no branches. The table being " +
      "in descending order is what makes greedy correct here — each symbol is " +
      "used as many times as it can be before the next one is considered.",
    constraints: [
      "The number is between 1 and 3999.",
      "Symbols are uppercase.",
      "Use the subtractive forms where they apply.",
    ],
    hints: [
      "Put IV, IX, XL, XC, CD and CM in the table as symbols.",
      "Walk the table largest first, subtracting while you can.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "integerToRoman",
      params: [{ name: "number", type: "int" }],
      returns: "string",
    },
    topicSlugs: ["dsa-strings", "dsa-greedy"],
    examples: [
      { input: "number = 58", output: '"LVIII"' },
      { input: "number = 1994", output: '"MCMXCIV"' },
    ],
    tests: [
      { args: [3], expected: "III" },
      { args: [58], expected: "LVIII" },
      { args: [1994], expected: "MCMXCIV" },
      { args: [4], expected: "IV", hidden: true },
      { args: [9], expected: "IX", hidden: true },
      { args: [3999], expected: "MMMCMXCIX", hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
const symbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
let left = number;
let result = "";
for (let i = 0; i < values.length; i += 1) {
  while (left >= values[i]) {
    result += symbols[i];
    left -= values[i];
  }
}
return result;`,
      TYPESCRIPT: `const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
const symbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
let left = number;
let result = "";
for (let i = 0; i < values.length; i += 1) {
  while (left >= values[i]) {
    result += symbols[i];
    left -= values[i];
  }
}
return result;`,
      PYTHON: `values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
symbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"]
left = number
result = []
for value, symbol in zip(values, symbols):
    while left >= value:
        result.append(symbol)
        left -= value
return "".join(result)`,
      JAVA: `int[] values = { 1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1 };
String[] symbols = { "M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I" };
int left = number;
StringBuilder result = new StringBuilder();
for (int i = 0; i < values.length; i += 1) {
    while (left >= values[i]) {
        result.append(symbols[i]);
        left -= values[i];
    }
}
return result.toString();`,
      CPP: `vector<int> values = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
vector<string> symbols = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};
int left = number;
string result;
for (size_t i = 0; i < values.size(); i += 1) {
    while (left >= values[i]) {
        result += symbols[i];
        left -= values[i];
    }
}
return result;`,
    },
  },

  // ── 10 ──────────────────────────────────────────────────────────────────
  {
    slug: "count-and-say",
    title: "Describe the Previous Line",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      'A sequence starts at "1". Each line describes the one before it by ' +
      'reading off its runs: "1" is read as one 1, giving "11"; "11" is read ' +
      'as two 1s, giving "21"; "21" is read as one 2 then one 1, giving ' +
      '"1211". Return line n.',
    explanation:
      "Two pieces: a function that describes one string, and a loop that " +
      "applies it n - 1 times. The describing function is a run-length scan — " +
      "walk the string counting how long the current character repeats, then " +
      "append the count followed by the character. Build the result in a list " +
      "and join once; repeated string concatenation copies the whole string " +
      "each time, which is the usual reason a correct solution here still runs " +
      "slowly.",
    constraints: [
      "n is between 1 and 30.",
      'Line 1 is the string "1".',
      "The answer contains digits only.",
    ],
    hints: [
      "Write 'describe one string' first, then call it n - 1 times.",
      "Count the run, then append count followed by the character.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "countAndSay",
      params: [{ name: "n", type: "int" }],
      returns: "string",
    },
    topicSlugs: ["dsa-strings", "js-loops"],
    examples: [
      { input: "n = 4", output: '"1211"', explanation: "1 → 11 → 21 → 1211." },
      { input: "n = 1", output: '"1"' },
    ],
    tests: [
      { args: [1], expected: "1" },
      { args: [4], expected: "1211" },
      { args: [5], expected: "111221" },
      { args: [2], expected: "11", hidden: true },
      { args: [3], expected: "21", hidden: true },
      { args: [6], expected: "312211", hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let line = "1";
for (let step = 1; step < n; step += 1) {
  const parts = [];
  let at = 0;
  while (at < line.length) {
    const character = line[at];
    let run = 0;
    while (at < line.length && line[at] === character) {
      run += 1;
      at += 1;
    }
    parts.push(String(run));
    parts.push(character);
  }
  line = parts.join("");
}
return line;`,
      TYPESCRIPT: `let line = "1";
for (let step = 1; step < n; step += 1) {
  const parts: string[] = [];
  let at = 0;
  while (at < line.length) {
    const character = line[at];
    let run = 0;
    while (at < line.length && line[at] === character) {
      run += 1;
      at += 1;
    }
    parts.push(String(run));
    parts.push(character);
  }
  line = parts.join("");
}
return line;`,
      PYTHON: `line = "1"
for _ in range(n - 1):
    parts = []
    at = 0
    while at < len(line):
        character = line[at]
        run = 0
        while at < len(line) and line[at] == character:
            run += 1
            at += 1
        parts.append(str(run))
        parts.append(character)
    line = "".join(parts)
return line`,
      JAVA: `String line = "1";
for (int step = 1; step < n; step += 1) {
    StringBuilder next = new StringBuilder();
    int at = 0;
    while (at < line.length()) {
        char character = line.charAt(at);
        int run = 0;
        while (at < line.length() && line.charAt(at) == character) {
            run += 1;
            at += 1;
        }
        next.append(run).append(character);
    }
    line = next.toString();
}
return line;`,
      CPP: `string line = "1";
for (int step = 1; step < n; step += 1) {
    string next;
    size_t at = 0;
    while (at < line.size()) {
        char character = line[at];
        int run = 0;
        while (at < line.size() && line[at] == character) {
            run += 1;
            at += 1;
        }
        next += to_string(run);
        next += character;
    }
    line = next;
}
return line;`,
    },
  },

  // ── 11 ──────────────────────────────────────────────────────────────────
  {
    slug: "multiply-number-strings",
    title: "Multiply Two Number Strings",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Two non-negative numbers arrive as strings of digits. Return their " +
      "product, also as a string. The numbers can be hundreds of digits long, " +
      "so converting them to integers is not an option.",
    explanation:
      "Long multiplication, with one useful observation: the digit at position " +
      "i of the first number times the digit at position j of the second always " +
      "lands in positions i + j and i + j + 1 of the answer. So allocate a " +
      "result of length m + n, add every product into that pair of slots, and " +
      "carry afterwards in one sweep. Then strip the leading zeros — and " +
      'remember the answer is exactly "0" if everything was stripped, which ' +
      "is the case that catches people out when one input is zero.",
    constraints: [
      "Each string is between 1 and 200 digits.",
      'Neither has leading zeros, except the single string "0".',
      "Do not convert the inputs to integers.",
    ],
    hints: [
      "Digits i and j contribute to positions i + j and i + j + 1.",
      "Add everything first, then carry in one pass.",
      'Strip leading zeros, but leave "0" if that is the whole answer.',
    ],
    estimatedTime: "35 min",
    signature: {
      name: "multiplyNumberStrings",
      params: [
        { name: "first", type: "string" },
        { name: "second", type: "string" },
      ],
      returns: "string",
    },
    topicSlugs: ["dsa-strings", "dsa-arrays"],
    examples: [
      { input: 'first = "123", second = "456"', output: '"56088"' },
      {
        input: 'first = "0", second = "999"',
        output: '"0"',
        explanation: "Every digit strips away, so the answer is a single zero.",
      },
    ],
    tests: [
      { args: ["2", "3"], expected: "6" },
      { args: ["123", "456"], expected: "56088" },
      { args: ["0", "999"], expected: "0" },
      { args: ["9", "9"], expected: "81", hidden: true },
      { args: ["10", "10"], expected: "100", hidden: true },
      {
        args: ["123456789", "987654321"],
        expected: "121932631112635269",
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const m = first.length;
const n = second.length;
const slots = new Array(m + n).fill(0);
for (let i = m - 1; i >= 0; i -= 1) {
  for (let j = n - 1; j >= 0; j -= 1) {
    const product = (first.charCodeAt(i) - 48) * (second.charCodeAt(j) - 48);
    const low = i + j + 1;
    const total = product + slots[low];
    slots[low] = total % 10;
    slots[i + j] += Math.floor(total / 10);
  }
}
let start = 0;
while (start < slots.length - 1 && slots[start] === 0) start += 1;
return slots.slice(start).join("");`,
      TYPESCRIPT: `const m = first.length;
const n = second.length;
const slots: number[] = new Array(m + n).fill(0);
for (let i = m - 1; i >= 0; i -= 1) {
  for (let j = n - 1; j >= 0; j -= 1) {
    const product = (first.charCodeAt(i) - 48) * (second.charCodeAt(j) - 48);
    const low = i + j + 1;
    const total = product + slots[low];
    slots[low] = total % 10;
    slots[i + j] += Math.floor(total / 10);
  }
}
let start = 0;
while (start < slots.length - 1 && slots[start] === 0) start += 1;
return slots.slice(start).join("");`,
      PYTHON: `m = len(first)
n = len(second)
slots = [0] * (m + n)
for i in range(m - 1, -1, -1):
    for j in range(n - 1, -1, -1):
        product = int(first[i]) * int(second[j])
        low = i + j + 1
        total = product + slots[low]
        slots[low] = total % 10
        slots[i + j] += total // 10
start = 0
while start < len(slots) - 1 and slots[start] == 0:
    start += 1
return "".join(str(digit) for digit in slots[start:])`,
      JAVA: `int m = first.length();
int n = second.length();
int[] slots = new int[m + n];
for (int i = m - 1; i >= 0; i -= 1) {
    for (int j = n - 1; j >= 0; j -= 1) {
        int product = (first.charAt(i) - '0') * (second.charAt(j) - '0');
        int low = i + j + 1;
        int total = product + slots[low];
        slots[low] = total % 10;
        slots[i + j] += total / 10;
    }
}
int start = 0;
while (start < slots.length - 1 && slots[start] == 0) start += 1;
StringBuilder result = new StringBuilder();
for (int i = start; i < slots.length; i += 1) result.append(slots[i]);
return result.toString();`,
      CPP: `int m = (int)first.size();
int n = (int)second.size();
vector<int> slots(m + n, 0);
for (int i = m - 1; i >= 0; i -= 1) {
    for (int j = n - 1; j >= 0; j -= 1) {
        int product = (first[i] - '0') * (second[j] - '0');
        int low = i + j + 1;
        int total = product + slots[low];
        slots[low] = total % 10;
        slots[i + j] += total / 10;
    }
}
int start = 0;
while (start < (int)slots.size() - 1 && slots[start] == 0) start += 1;
string result;
for (int i = start; i < (int)slots.size(); i += 1) result += (char)('0' + slots[i]);
return result;`,
    },
  },

  // ── 12 ──────────────────────────────────────────────────────────────────
  {
    slug: "zigzag-rows",
    title: "Write It in a Zigzag",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Write the characters of a string down a given number of rows, moving " +
      "down until you hit the bottom row and then diagonally back up to the " +
      "top, over and over. Then read the rows left to right, top to bottom, and " +
      "return what you get. With one row the string is unchanged.",
    explanation:
      "Nothing needs drawing. Keep one string builder per row, walk the input " +
      "once, and append each character to the row you are currently on — then " +
      "move the row index by a step that is +1 while going down and -1 while " +
      "going up, flipping the step whenever you touch the top or bottom row. " +
      "Join the rows at the end. The single-row case has to be handled, because " +
      "there is no bottom to bounce off and the step would never flip.",
    constraints: [
      "The text is between 1 and 10,000 characters.",
      "The number of rows is between 1 and 1,000.",
      "The number of rows may exceed the length of the text.",
    ],
    hints: [
      "One accumulator per row; append as you walk the text.",
      "Flip the direction when the row index reaches the top or the bottom.",
      "One row means nothing changes — handle it first.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "zigzagRows",
      params: [
        { name: "text", type: "string" },
        { name: "rows", type: "int" },
      ],
      returns: "string",
    },
    topicSlugs: ["dsa-strings", "js-arrays"],
    examples: [
      {
        input: 'text = "PAYPALISHIRING", rows = 3',
        output: '"PAHNAPLSIIGYIR"',
        explanation: "Rows read: PAHN, APLSIIG, YIR.",
      },
      { input: 'text = "AB", rows = 1', output: '"AB"' },
    ],
    tests: [
      { args: ["PAYPALISHIRING", 3], expected: "PAHNAPLSIIGYIR" },
      { args: ["PAYPALISHIRING", 4], expected: "PINALSIGYAHRPI" },
      { args: ["AB", 1], expected: "AB" },
      { args: ["A", 5], expected: "A", hidden: true },
      { args: ["ABCD", 2], expected: "ACBD", hidden: true },
      { args: ["ABC", 3], expected: "ABC", hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `if (rows === 1) return text;
const lines = [];
for (let i = 0; i < rows; i += 1) lines.push([]);
let row = 0;
let step = 1;
for (const character of text) {
  lines[row].push(character);
  if (row === 0) step = 1;
  else if (row === rows - 1) step = -1;
  row += step;
}
return lines.map((line) => line.join("")).join("");`,
      TYPESCRIPT: `if (rows === 1) return text;
const lines: string[][] = [];
for (let i = 0; i < rows; i += 1) lines.push([]);
let row = 0;
let step = 1;
for (const character of text) {
  lines[row].push(character);
  if (row === 0) step = 1;
  else if (row === rows - 1) step = -1;
  row += step;
}
return lines.map((line) => line.join("")).join("");`,
      PYTHON: `if rows == 1:
    return text
lines = [[] for _ in range(rows)]
row = 0
step = 1
for character in text:
    lines[row].append(character)
    if row == 0:
        step = 1
    elif row == rows - 1:
        step = -1
    row += step
return "".join("".join(line) for line in lines)`,
      JAVA: `if (rows == 1) return text;
StringBuilder[] lines = new StringBuilder[rows];
for (int i = 0; i < rows; i += 1) lines[i] = new StringBuilder();
int row = 0;
int step = 1;
for (int i = 0; i < text.length(); i += 1) {
    lines[row].append(text.charAt(i));
    if (row == 0) step = 1;
    else if (row == rows - 1) step = -1;
    row += step;
}
StringBuilder result = new StringBuilder();
for (StringBuilder line : lines) result.append(line);
return result.toString();`,
      CPP: `if (rows == 1) return text;
vector<string> lines(rows);
int row = 0;
int step = 1;
for (char character : text) {
    lines[row] += character;
    if (row == 0) step = 1;
    else if (row == rows - 1) step = -1;
    row += step;
}
string result;
for (const string& line : lines) result += line;
return result;`,
    },
  },

  // ── 13 ──────────────────────────────────────────────────────────────────
  {
    slug: "longest-palindromic-substring",
    title: "Longest Palindromic Substring",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Find the longest run of neighbouring characters that reads the same " +
      "both ways, and return it. When two runs tie for longest, return the one " +
      "that starts earlier.",
    explanation:
      "Every palindrome has a centre, and there are only 2n - 1 of them: one " +
      "at each character, and one between each pair. So try each centre and " +
      "expand outwards while the characters either side match, keeping the " +
      "longest span you find. That is O(n²) time and no extra memory, and it is " +
      "the answer interviewers expect. The two-centres-per-position detail is " +
      'what makes even-length palindromes like "bb" findable at all — a ' +
      "solution that only expands around single characters silently misses " +
      "them.",
    constraints: [
      "The text is between 1 and 1,000 characters.",
      "It contains letters and digits.",
      "On a tie, return the earliest-starting run.",
    ],
    hints: [
      "Every palindrome has a centre; there are about 2n of them.",
      "Expand outwards from each centre while the characters match.",
      "Try both a single-character centre and a between-characters centre.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "longestPalindrome",
      params: [{ name: "text", type: "string" }],
      returns: "string",
    },
    topicSlugs: ["dsa-strings", "dsa-two-pointers"],
    examples: [
      {
        input: 'text = "babad"',
        output: '"bab"',
        explanation: '"aba" is also length 3, but "bab" starts earlier.',
      },
      { input: 'text = "cbbd"', output: '"bb"' },
    ],
    tests: [
      { args: ["babad"], expected: "bab" },
      { args: ["cbbd"], expected: "bb" },
      { args: ["a"], expected: "a" },
      { args: ["ac"], expected: "a", hidden: true },
      { args: ["aaaa"], expected: "aaaa", hidden: true },
      { args: ["forgeeksskeegfor"], expected: "geeksskeeg", hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let bestStart = 0;
let bestLength = 1;
const expand = (left, right) => {
  while (left >= 0 && right < text.length && text[left] === text[right]) {
    left -= 1;
    right += 1;
  }
  const length = right - left - 1;
  if (length > bestLength) {
    bestLength = length;
    bestStart = left + 1;
  }
};
for (let centre = 0; centre < text.length; centre += 1) {
  expand(centre, centre);
  expand(centre, centre + 1);
}
return text.slice(bestStart, bestStart + bestLength);`,
      TYPESCRIPT: `let bestStart = 0;
let bestLength = 1;
const expand = (left: number, right: number): void => {
  while (left >= 0 && right < text.length && text[left] === text[right]) {
    left -= 1;
    right += 1;
  }
  const length = right - left - 1;
  if (length > bestLength) {
    bestLength = length;
    bestStart = left + 1;
  }
};
for (let centre = 0; centre < text.length; centre += 1) {
  expand(centre, centre);
  expand(centre, centre + 1);
}
return text.slice(bestStart, bestStart + bestLength);`,
      PYTHON: `best_start = 0
best_length = 1

def expand(left: int, right: int) -> tuple[int, int]:
    while left >= 0 and right < len(text) and text[left] == text[right]:
        left -= 1
        right += 1
    return left + 1, right - left - 1

for centre in range(len(text)):
    for start, length in (expand(centre, centre), expand(centre, centre + 1)):
        if length > best_length:
            best_length = length
            best_start = start
return text[best_start:best_start + best_length]`,
      JAVA: `int bestStart = 0;
int bestLength = 1;
for (int centre = 0; centre < text.length(); centre += 1) {
    for (int offset = 0; offset < 2; offset += 1) {
        int left = centre;
        int right = centre + offset;
        while (left >= 0 && right < text.length()
                && text.charAt(left) == text.charAt(right)) {
            left -= 1;
            right += 1;
        }
        int length = right - left - 1;
        if (length > bestLength) {
            bestLength = length;
            bestStart = left + 1;
        }
    }
}
return text.substring(bestStart, bestStart + bestLength);`,
      CPP: `int bestStart = 0;
int bestLength = 1;
int n = (int)text.size();
for (int centre = 0; centre < n; centre += 1) {
    for (int offset = 0; offset < 2; offset += 1) {
        int left = centre;
        int right = centre + offset;
        while (left >= 0 && right < n && text[left] == text[right]) {
            left -= 1;
            right += 1;
        }
        int length = right - left - 1;
        if (length > bestLength) {
            bestLength = length;
            bestStart = left + 1;
        }
    }
}
return text.substr(bestStart, bestLength);`,
    },
  },

  // ── 14 ──────────────────────────────────────────────────────────────────
  {
    slug: "compare-version-numbers",
    title: "Compare Version Numbers",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Version numbers are dot-separated groups of digits, like 1.2.10. " +
      "Compare two of them and return 1 if the first is newer, -1 if the " +
      "second is newer, and 0 if they are the same version. Leading zeros in a " +
      "group are meaningless, and a missing group counts as zero, so 1.0 and " +
      "1.0.0 are the same version.",
    explanation:
      'Comparing the strings directly is wrong — "1.10" sorts before "1.2" ' +
      "as text and after it as a version. Split both on dots and compare group " +
      "by group as numbers, treating a group that does not exist as 0, which " +
      "handles versions of different lengths without padding anything first. " +
      "Converting each group to a number also disposes of leading zeros for " +
      "free. Return as soon as two groups differ; if you reach the end, the " +
      "versions are equal.",
    constraints: [
      "Each version is between 1 and 500 characters.",
      "Groups contain digits only and are separated by single dots.",
      "Neither version starts or ends with a dot.",
    ],
    hints: [
      "Never compare version strings as text.",
      "A group that does not exist counts as 0, so different lengths are fine.",
      "Converting a group to a number removes leading zeros.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "compareVersions",
      params: [
        { name: "first", type: "string" },
        { name: "second", type: "string" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-strings", "js-arrays"],
    examples: [
      {
        input: 'first = "1.01", second = "1.001"',
        output: "0",
        explanation: "Leading zeros do not change a group's value.",
      },
      { input: 'first = "1.2", second = "1.10"', output: "-1" },
    ],
    tests: [
      { args: ["1.01", "1.001"], expected: 0 },
      { args: ["1.0", "1.0.0"], expected: 0 },
      { args: ["0.1", "1.1"], expected: -1 },
      { args: ["1.2", "1.10"], expected: -1, hidden: true },
      { args: ["2.0", "1.9.9"], expected: 1, hidden: true },
      { args: ["1.0.1", "1"], expected: 1, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const left = first.split(".");
const right = second.split(".");
const groups = Math.max(left.length, right.length);
for (let i = 0; i < groups; i += 1) {
  const a = i < left.length ? Number(left[i]) : 0;
  const b = i < right.length ? Number(right[i]) : 0;
  if (a > b) return 1;
  if (a < b) return -1;
}
return 0;`,
      TYPESCRIPT: `const left = first.split(".");
const right = second.split(".");
const groups = Math.max(left.length, right.length);
for (let i = 0; i < groups; i += 1) {
  const a = i < left.length ? Number(left[i]) : 0;
  const b = i < right.length ? Number(right[i]) : 0;
  if (a > b) return 1;
  if (a < b) return -1;
}
return 0;`,
      PYTHON: `left = first.split(".")
right = second.split(".")
for i in range(max(len(left), len(right))):
    a = int(left[i]) if i < len(left) else 0
    b = int(right[i]) if i < len(right) else 0
    if a > b:
        return 1
    if a < b:
        return -1
return 0`,
      JAVA: `String[] left = first.split("\\\\.");
String[] right = second.split("\\\\.");
int groups = Math.max(left.length, right.length);
for (int i = 0; i < groups; i += 1) {
    int a = i < left.length ? Integer.parseInt(left[i]) : 0;
    int b = i < right.length ? Integer.parseInt(right[i]) : 0;
    if (a > b) return 1;
    if (a < b) return -1;
}
return 0;`,
      CPP: `auto split = [](const string& version) {
    vector<int> groups;
    int value = 0;
    bool any = false;
    for (char c : version) {
        if (c == '.') {
            groups.push_back(value);
            value = 0;
            any = false;
        } else {
            value = value * 10 + (c - '0');
            any = true;
        }
    }
    groups.push_back(any ? value : 0);
    return groups;
};
vector<int> left = split(first);
vector<int> right = split(second);
size_t groups = max(left.size(), right.size());
for (size_t i = 0; i < groups; i += 1) {
    int a = i < left.size() ? left[i] : 0;
    int b = i < right.size() ? right[i] : 0;
    if (a > b) return 1;
    if (a < b) return -1;
}
return 0;`,
    },
  },
];
