import type { SeedProblem } from "../../problems/types";

/**
 * Sliding window.
 *
 * A window that grows on the right and shrinks on the left, instead of being
 * rebuilt from scratch at every start position. That is the entire idea, and
 * the reason it turns O(n²) into O(n): each element is added once and removed
 * at most once, so the two pointers together travel 2n steps however much the
 * window moves.
 *
 * Two shapes, in this order. A fixed window (the size is given) only needs the
 * add/remove bookkeeping. A variable window needs a rule for when to shrink,
 * and choosing that rule is where the thinking is: shrink while the window is
 * invalid when you want the longest, shrink while it is *valid* when you want
 * the shortest.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const SLIDING_WINDOW_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "max-sum-of-window",
    title: "Best Window of a Fixed Size",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Return the largest total any run of exactly k neighbouring numbers can " +
      "reach. The window size never changes, and k is never larger than the " +
      "list.",
    explanation:
      "Summing each window from scratch costs O(n × k) and repeats almost all " +
      "of its work: two neighbouring windows share every element but two. So " +
      "compute the first window's total once, then slide — add the number " +
      "entering on the right, subtract the one leaving on the left — and keep " +
      "the best total seen. That is O(n) with two additions per step. This " +
      "add-one/remove-one bookkeeping is the whole fixed-window pattern; " +
      "everything else in this file is the same idea with a more interesting " +
      "thing being tracked than a sum.",
    constraints: [
      "The list has between 1 and 100,000 numbers.",
      "k is between 1 and the length of the list.",
      "Each number is between -10,000 and 10,000.",
    ],
    hints: [
      "Neighbouring windows differ by only two elements.",
      "Add the entering number, subtract the leaving one.",
      "Negative numbers mean you cannot start the best total at 0.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "maxSumOfWindow",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "k", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-sliding-window", "js-arrays", "data-structures"],
    examples: [
      {
        input: "numbers = [1, 12, -5, -6, 50, 3], k = 4",
        output: "51",
        explanation: "12 + (-5) + (-6) + 50 is 51.",
      },
      { input: "numbers = [2, 3], k = 2", output: "5" },
    ],
    tests: [
      { args: [[1, 12, -5, -6, 50, 3], 4], expected: 51 },
      { args: [[2, 3], 2], expected: 5 },
      { args: [[5], 1], expected: 5 },
      { args: [[-1, -2, -3], 2], expected: -3, hidden: true },
      { args: [[1, 2, 3, 4], 2], expected: 7, hidden: true },
      { args: [[4, 4, 4], 3], expected: 12, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let total = 0;
for (let i = 0; i < k; i += 1) total += numbers[i];
let best = total;
for (let i = k; i < numbers.length; i += 1) {
  total += numbers[i] - numbers[i - k];
  if (total > best) best = total;
}
return best;`,
      TYPESCRIPT: `let total = 0;
for (let i = 0; i < k; i += 1) total += numbers[i];
let best = total;
for (let i = k; i < numbers.length; i += 1) {
  total += numbers[i] - numbers[i - k];
  if (total > best) best = total;
}
return best;`,
      PYTHON: `total = sum(numbers[:k])
best = total
for i in range(k, len(numbers)):
    total += numbers[i] - numbers[i - k]
    if total > best:
        best = total
return best`,
      JAVA: `int total = 0;
for (int i = 0; i < k; i += 1) total += numbers[i];
int best = total;
for (int i = k; i < numbers.length; i += 1) {
    total += numbers[i] - numbers[i - k];
    if (total > best) best = total;
}
return best;`,
      CPP: `int total = 0;
for (int i = 0; i < k; i += 1) total += numbers[i];
int best = total;
for (int i = k; i < (int)numbers.size(); i += 1) {
    total += numbers[i] - numbers[i - k];
    if (total > best) best = total;
}
return best;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "nearby-duplicate",
    title: "A Duplicate Close By",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Return true if the list contains the same value twice within a distance " +
      "of k positions — that is, two equal values whose positions differ by at " +
      "most k. Duplicates further apart than that do not count.",
    explanation:
      "The plain 'contains a duplicate' question wants a set of everything seen. " +
      "Here only the last k values matter, so keep a set of exactly those: add " +
      "each value as you pass it, and once the set holds more than k values, " +
      "remove the one that has just fallen out of range. Then a hit in the set " +
      "is by definition a hit within k. This is the first problem where the " +
      "window holds a data structure rather than a running number, which is the " +
      "step everything after it depends on.",
    constraints: [
      "The list has between 1 and 100,000 numbers.",
      "k is between 0 and 100,000.",
      "Each number is between -1,000,000,000 and 1,000,000,000.",
    ],
    hints: [
      "Only the last k values can possibly be close enough.",
      "Drop the value that leaves the window as the window moves.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "hasNearbyDuplicate",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "k", type: "int" },
      ],
      returns: "bool",
    },
    topicSlugs: ["dsa-sliding-window", "dsa-hashing"],
    examples: [
      { input: "numbers = [1, 2, 3, 1], k = 3", output: "true" },
      {
        input: "numbers = [1, 2, 3, 1, 2, 3], k = 2",
        output: "false",
        explanation: "Every repeat is three positions apart.",
      },
    ],
    tests: [
      { args: [[1, 2, 3, 1], 3], expected: true },
      { args: [[1, 0, 1, 1], 1], expected: true },
      { args: [[1, 2, 3, 1, 2, 3], 2], expected: false },
      { args: [[1], 1], expected: false, hidden: true },
      { args: [[99, 99], 2], expected: true, hidden: true },
      { args: [[1, 2, 1], 1], expected: false, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const window = new Set();
for (let i = 0; i < numbers.length; i += 1) {
  if (window.has(numbers[i])) return true;
  window.add(numbers[i]);
  if (window.size > k) window.delete(numbers[i - k]);
}
return false;`,
      TYPESCRIPT: `const window = new Set<number>();
for (let i = 0; i < numbers.length; i += 1) {
  if (window.has(numbers[i])) return true;
  window.add(numbers[i]);
  if (window.size > k) window.delete(numbers[i - k]);
}
return false;`,
      PYTHON: `window = set()
for i, value in enumerate(numbers):
    if value in window:
        return True
    window.add(value)
    if len(window) > k:
        window.discard(numbers[i - k])
return False`,
      JAVA: `Set<Integer> window = new HashSet<>();
for (int i = 0; i < numbers.length; i += 1) {
    if (window.contains(numbers[i])) return true;
    window.add(numbers[i]);
    if (window.size() > k) window.remove(numbers[i - k]);
}
return false;`,
      CPP: `unordered_set<int> window;
for (int i = 0; i < (int)numbers.size(); i += 1) {
    if (window.count(numbers[i])) return true;
    window.insert(numbers[i]);
    if ((int)window.size() > k) window.erase(numbers[i - k]);
}
return false;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "longest-unique-substring",
    title: "Longest Substring Without Repeats",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Find the length of the longest run of neighbouring characters that " +
      "contains no repeated character. The run must be contiguous — picking " +
      "characters out of order is a different problem.",
    explanation:
      "Grow a window to the right, one character at a time, and keep a map from " +
      "character to the position where you last saw it. When the incoming " +
      "character is already inside the current window, jump the left edge to " +
      "just past that earlier position — not one step at a time, straight past " +
      "it, because every window that still contains the old copy is invalid. The " +
      "guard that matters is 'inside the current window': a character last seen " +
      "before the left edge is not a repeat any more, and forgetting that check " +
      "makes the window jump backwards.",
    constraints: [
      "The text is between 0 and 100,000 characters.",
      "It may contain letters, digits, symbols and spaces.",
      "The answer for empty text is 0.",
    ],
    hints: [
      "Remember where each character was last seen.",
      "On a repeat, move the left edge past the earlier copy in one jump.",
      "Ignore a previous position that is already left of the window.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "longestUniqueSubstring",
      params: [{ name: "text", type: "string" }],
      returns: "int",
    },
    topicSlugs: ["dsa-sliding-window", "dsa-hashing", "dsa-strings"],
    examples: [
      {
        input: 'text = "abcabcbb"',
        output: "3",
        explanation: '"abc" is the longest run with no repeats.',
      },
      { input: 'text = "pwwkew"', output: "3" },
    ],
    tests: [
      { args: ["abcabcbb"], expected: 3 },
      { args: ["bbbbb"], expected: 1 },
      { args: ["pwwkew"], expected: 3 },
      { args: [""], expected: 0, hidden: true },
      { args: ["au"], expected: 2, hidden: true },
      { args: ["dvdf"], expected: 3, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const lastSeen = new Map();
let left = 0;
let best = 0;
for (let right = 0; right < text.length; right += 1) {
  const character = text[right];
  const previous = lastSeen.get(character);
  if (previous !== undefined && previous >= left) left = previous + 1;
  lastSeen.set(character, right);
  const length = right - left + 1;
  if (length > best) best = length;
}
return best;`,
      TYPESCRIPT: `const lastSeen = new Map<string, number>();
let left = 0;
let best = 0;
for (let right = 0; right < text.length; right += 1) {
  const character = text[right];
  const previous = lastSeen.get(character);
  if (previous !== undefined && previous >= left) left = previous + 1;
  lastSeen.set(character, right);
  const length = right - left + 1;
  if (length > best) best = length;
}
return best;`,
      PYTHON: `last_seen = {}
left = 0
best = 0
for right, character in enumerate(text):
    previous = last_seen.get(character)
    if previous is not None and previous >= left:
        left = previous + 1
    last_seen[character] = right
    best = max(best, right - left + 1)
return best`,
      JAVA: `Map<Character, Integer> lastSeen = new HashMap<>();
int left = 0;
int best = 0;
for (int right = 0; right < text.length(); right += 1) {
    char character = text.charAt(right);
    Integer previous = lastSeen.get(character);
    if (previous != null && previous >= left) left = previous + 1;
    lastSeen.put(character, right);
    best = Math.max(best, right - left + 1);
}
return best;`,
      CPP: `unordered_map<char, int> lastSeen;
int left = 0;
int best = 0;
for (int right = 0; right < (int)text.size(); right += 1) {
    char character = text[right];
    auto found = lastSeen.find(character);
    if (found != lastSeen.end() && found->second >= left) left = found->second + 1;
    lastSeen[character] = right;
    best = max(best, right - left + 1);
}
return best;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "longest-run-after-replacements",
    title: "Longest Run After k Replacements",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "You may change at most k characters in the text, each to any letter you " +
      "like. Return the length of the longest run of identical characters you " +
      "can end up with.",
    explanation:
      "A window can be made uniform when the number of characters that are not " +
      "its most common one is at most k — that is, window length minus the " +
      "highest count inside it. So slide a window keeping counts per character, " +
      "and shrink from the left whenever that difference exceeds k. The clever " +
      "detail is that the highest count never needs to be recomputed exactly: " +
      "keeping the best count ever seen is enough, because the window only ever " +
      "grows when a better count appears, and a stale value can never make an " +
      "invalid window look valid.",
    constraints: [
      "The text is between 1 and 100,000 uppercase English letters.",
      "k is between 0 and the length of the text.",
      "Replacements may produce any letter.",
    ],
    hints: [
      "A window works if length minus its most common count is at most k.",
      "Keep counts per letter and shrink when that difference is too big.",
      "The best count seen so far is enough — it never needs recomputing.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "longestRunAfterReplacements",
      params: [
        { name: "text", type: "string" },
        { name: "k", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-sliding-window", "dsa-hashing"],
    examples: [
      {
        input: 'text = "AABABBA", k = 1',
        output: "4",
        explanation: 'Changing one B gives "AAAA" inside the window.',
      },
      { input: 'text = "ABAB", k = 2', output: "4" },
    ],
    tests: [
      { args: ["ABAB", 2], expected: 4 },
      { args: ["AABABBA", 1], expected: 4 },
      { args: ["A", 0], expected: 1 },
      { args: ["AAAA", 0], expected: 4, hidden: true },
      { args: ["ABBB", 2], expected: 4, hidden: true },
      { args: ["ABCDE", 1], expected: 2, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const counts = new Map();
let left = 0;
let bestCount = 0;
let best = 0;
for (let right = 0; right < text.length; right += 1) {
  const character = text[right];
  const count = (counts.get(character) ?? 0) + 1;
  counts.set(character, count);
  if (count > bestCount) bestCount = count;
  while (right - left + 1 - bestCount > k) {
    counts.set(text[left], counts.get(text[left]) - 1);
    left += 1;
  }
  const length = right - left + 1;
  if (length > best) best = length;
}
return best;`,
      TYPESCRIPT: `const counts = new Map<string, number>();
let left = 0;
let bestCount = 0;
let best = 0;
for (let right = 0; right < text.length; right += 1) {
  const character = text[right];
  const count = (counts.get(character) ?? 0) + 1;
  counts.set(character, count);
  if (count > bestCount) bestCount = count;
  while (right - left + 1 - bestCount > k) {
    counts.set(text[left], (counts.get(text[left]) ?? 0) - 1);
    left += 1;
  }
  const length = right - left + 1;
  if (length > best) best = length;
}
return best;`,
      PYTHON: `counts = {}
left = 0
best_count = 0
best = 0
for right, character in enumerate(text):
    counts[character] = counts.get(character, 0) + 1
    best_count = max(best_count, counts[character])
    while right - left + 1 - best_count > k:
        counts[text[left]] -= 1
        left += 1
    best = max(best, right - left + 1)
return best`,
      JAVA: `int[] counts = new int[26];
int left = 0;
int bestCount = 0;
int best = 0;
for (int right = 0; right < text.length(); right += 1) {
    int index = text.charAt(right) - 'A';
    counts[index] += 1;
    bestCount = Math.max(bestCount, counts[index]);
    while (right - left + 1 - bestCount > k) {
        counts[text.charAt(left) - 'A'] -= 1;
        left += 1;
    }
    best = Math.max(best, right - left + 1);
}
return best;`,
      CPP: `vector<int> counts(26, 0);
int left = 0;
int bestCount = 0;
int best = 0;
for (int right = 0; right < (int)text.size(); right += 1) {
    int index = text[right] - 'A';
    counts[index] += 1;
    bestCount = max(bestCount, counts[index]);
    while (right - left + 1 - bestCount > k) {
        counts[text[left] - 'A'] -= 1;
        left += 1;
    }
    best = max(best, right - left + 1);
}
return best;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "permutation-in-text",
    title: "Is a Rearrangement Hiding in Here?",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Return true if some run of neighbouring characters in the text is a " +
      "rearrangement of the pattern — the same letters, the same number of " +
      "each, in any order.",
    explanation:
      "A rearrangement has exactly the pattern's letter counts, and it has the " +
      "pattern's length, so this is a fixed window of that length with a " +
      "counting test. Slide it once, adding the entering letter and removing the " +
      "leaving one, and compare counts. Comparing two whole count maps at every " +
      "position is O(26n) and fine; the tidier version keeps a single 'how many " +
      "letters currently match their target count' number and adjusts it as " +
      "counts change, which makes each step O(1). A pattern longer than the text " +
      "is an immediate no.",
    constraints: [
      "Both strings are between 1 and 20,000 lowercase letters.",
      "The run must be contiguous.",
      "A pattern longer than the text can never be found.",
    ],
    hints: [
      "The window length is fixed — it is the pattern's length.",
      "Track counts per letter and slide, adding one and removing one.",
      "Compare counts rather than sorting the window each time.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "containsRearrangement",
      params: [
        { name: "pattern", type: "string" },
        { name: "text", type: "string" },
      ],
      returns: "bool",
    },
    topicSlugs: ["dsa-sliding-window", "dsa-hashing", "dsa-strings"],
    examples: [
      {
        input: 'pattern = "ab", text = "eidbaooo"',
        output: "true",
        explanation: '"ba" is a rearrangement of "ab".',
      },
      { input: 'pattern = "ab", text = "eidboaoo"', output: "false" },
    ],
    tests: [
      { args: ["ab", "eidbaooo"], expected: true },
      { args: ["ab", "eidboaoo"], expected: false },
      { args: ["a", "a"], expected: true },
      { args: ["adc", "dcda"], expected: true, hidden: true },
      { args: ["hello", "ooolleoooleh"], expected: false, hidden: true },
      { args: ["abc", "ab"], expected: false, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `if (pattern.length > text.length) return false;
const target = new Array(26).fill(0);
const window = new Array(26).fill(0);
const index = (c) => c.charCodeAt(0) - 97;
for (const character of pattern) target[index(character)] += 1;
for (let right = 0; right < text.length; right += 1) {
  window[index(text[right])] += 1;
  if (right >= pattern.length) window[index(text[right - pattern.length])] -= 1;
  if (right >= pattern.length - 1) {
    let same = true;
    for (let i = 0; i < 26; i += 1) {
      if (window[i] !== target[i]) {
        same = false;
        break;
      }
    }
    if (same) return true;
  }
}
return false;`,
      TYPESCRIPT: `if (pattern.length > text.length) return false;
const target: number[] = new Array(26).fill(0);
const window: number[] = new Array(26).fill(0);
const index = (c: string): number => c.charCodeAt(0) - 97;
for (const character of pattern) target[index(character)] += 1;
for (let right = 0; right < text.length; right += 1) {
  window[index(text[right])] += 1;
  if (right >= pattern.length) window[index(text[right - pattern.length])] -= 1;
  if (right >= pattern.length - 1) {
    let same = true;
    for (let i = 0; i < 26; i += 1) {
      if (window[i] !== target[i]) {
        same = false;
        break;
      }
    }
    if (same) return true;
  }
}
return false;`,
      PYTHON: `if len(pattern) > len(text):
    return False
target = [0] * 26
window = [0] * 26
for character in pattern:
    target[ord(character) - 97] += 1
for right, character in enumerate(text):
    window[ord(character) - 97] += 1
    if right >= len(pattern):
        window[ord(text[right - len(pattern)]) - 97] -= 1
    if right >= len(pattern) - 1 and window == target:
        return True
return False`,
      JAVA: `if (pattern.length() > text.length()) return false;
int[] target = new int[26];
int[] window = new int[26];
for (int i = 0; i < pattern.length(); i += 1) target[pattern.charAt(i) - 'a'] += 1;
for (int right = 0; right < text.length(); right += 1) {
    window[text.charAt(right) - 'a'] += 1;
    if (right >= pattern.length()) {
        window[text.charAt(right - pattern.length()) - 'a'] -= 1;
    }
    if (right >= pattern.length() - 1 && Arrays.equals(window, target)) return true;
}
return false;`,
      CPP: `if (pattern.size() > text.size()) return false;
vector<int> target(26, 0);
vector<int> window(26, 0);
for (char character : pattern) target[character - 'a'] += 1;
for (int right = 0; right < (int)text.size(); right += 1) {
    window[text[right] - 'a'] += 1;
    if (right >= (int)pattern.size()) {
        window[text[right - (int)pattern.size()] - 'a'] -= 1;
    }
    if (right >= (int)pattern.size() - 1 && window == target) return true;
}
return false;`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "find-rearrangement-starts",
    title: "Where the Rearrangements Start",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Find every position in the text where a rearrangement of the pattern " +
      "begins, and return those positions in increasing order. Overlapping " +
      "matches all count.",
    explanation:
      "The same fixed window as the previous problem, except you record the " +
      "start position instead of returning at the first hit. Because the window " +
      "moves one character at a time, overlapping matches come out naturally and " +
      "in increasing order, so no sorting is needed at the end. The position to " +
      "record is the window's left edge — right minus pattern length plus one — " +
      "which is the arithmetic worth writing down before the loop rather than " +
      "guessing inside it.",
    constraints: [
      "Both strings are between 1 and 30,000 lowercase letters.",
      "Positions are 0-based and returned in increasing order.",
      "Overlapping matches are all reported.",
    ],
    hints: [
      "Same window as the yes/no version — collect instead of returning.",
      "The start position is right - patternLength + 1.",
      "Matches come out in order, so nothing needs sorting.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "findRearrangementStarts",
      params: [
        { name: "text", type: "string" },
        { name: "pattern", type: "string" },
      ],
      returns: "int[]",
    },
    topicSlugs: ["dsa-sliding-window", "dsa-hashing", "dsa-strings"],
    examples: [
      {
        input: 'text = "cbaebabacd", pattern = "abc"',
        output: "[0, 6]",
        explanation: '"cba" starts at 0 and "bac" starts at 6.',
      },
      {
        input: 'text = "abab", pattern = "ab"',
        output: "[0, 1, 2]",
        explanation: "Overlapping matches all count.",
      },
    ],
    tests: [
      { args: ["cbaebabacd", "abc"], expected: [0, 6] },
      { args: ["abab", "ab"], expected: [0, 1, 2] },
      { args: ["a", "ab"], expected: [] },
      { args: ["aa", "aa"], expected: [0], hidden: true },
      { args: ["baa", "aa"], expected: [1], hidden: true },
      { args: ["abcabc", "cab"], expected: [0, 1, 2, 3], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const result = [];
if (pattern.length > text.length) return result;
const target = new Array(26).fill(0);
const window = new Array(26).fill(0);
const index = (c) => c.charCodeAt(0) - 97;
for (const character of pattern) target[index(character)] += 1;
for (let right = 0; right < text.length; right += 1) {
  window[index(text[right])] += 1;
  if (right >= pattern.length) window[index(text[right - pattern.length])] -= 1;
  if (right >= pattern.length - 1) {
    let same = true;
    for (let i = 0; i < 26; i += 1) {
      if (window[i] !== target[i]) {
        same = false;
        break;
      }
    }
    if (same) result.push(right - pattern.length + 1);
  }
}
return result;`,
      TYPESCRIPT: `const result: number[] = [];
if (pattern.length > text.length) return result;
const target: number[] = new Array(26).fill(0);
const window: number[] = new Array(26).fill(0);
const index = (c: string): number => c.charCodeAt(0) - 97;
for (const character of pattern) target[index(character)] += 1;
for (let right = 0; right < text.length; right += 1) {
  window[index(text[right])] += 1;
  if (right >= pattern.length) window[index(text[right - pattern.length])] -= 1;
  if (right >= pattern.length - 1) {
    let same = true;
    for (let i = 0; i < 26; i += 1) {
      if (window[i] !== target[i]) {
        same = false;
        break;
      }
    }
    if (same) result.push(right - pattern.length + 1);
  }
}
return result;`,
      PYTHON: `result = []
if len(pattern) > len(text):
    return result
target = [0] * 26
window = [0] * 26
for character in pattern:
    target[ord(character) - 97] += 1
for right, character in enumerate(text):
    window[ord(character) - 97] += 1
    if right >= len(pattern):
        window[ord(text[right - len(pattern)]) - 97] -= 1
    if right >= len(pattern) - 1 and window == target:
        result.append(right - len(pattern) + 1)
return result`,
      JAVA: `List<Integer> found = new ArrayList<>();
if (pattern.length() <= text.length()) {
    int[] target = new int[26];
    int[] window = new int[26];
    for (int i = 0; i < pattern.length(); i += 1) target[pattern.charAt(i) - 'a'] += 1;
    for (int right = 0; right < text.length(); right += 1) {
        window[text.charAt(right) - 'a'] += 1;
        if (right >= pattern.length()) {
            window[text.charAt(right - pattern.length()) - 'a'] -= 1;
        }
        if (right >= pattern.length() - 1 && Arrays.equals(window, target)) {
            found.add(right - pattern.length() + 1);
        }
    }
}
int[] result = new int[found.size()];
for (int i = 0; i < found.size(); i += 1) result[i] = found.get(i);
return result;`,
      CPP: `vector<int> result;
if (pattern.size() > text.size()) return result;
vector<int> target(26, 0);
vector<int> window(26, 0);
for (char character : pattern) target[character - 'a'] += 1;
for (int right = 0; right < (int)text.size(); right += 1) {
    window[text[right] - 'a'] += 1;
    if (right >= (int)pattern.size()) {
        window[text[right - (int)pattern.size()] - 'a'] -= 1;
    }
    if (right >= (int)pattern.size() - 1 && window == target) {
        result.push_back(right - (int)pattern.size() + 1);
    }
}
return result;`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "shortest-subarray-reaching-target",
    title: "Shortest Subarray Reaching a Target",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Every number is positive. Return the length of the shortest run of " +
      "neighbouring numbers whose total is at least the target, or 0 if no run " +
      "reaches it.",
    explanation:
      "This is the shrink-while-valid half of the pattern. Grow the window to " +
      "the right, adding to a running total; the moment the total reaches the " +
      "target, record the length and then shrink from the left for as long as " +
      "the window still reaches it. Shrinking while valid is what finds the " +
      "*shortest* window rather than merely a valid one — and it is only sound " +
      "because the numbers are positive, so removing an element can never " +
      "increase the total. With negative numbers this approach breaks and the " +
      "problem becomes a much harder one involving a deque of prefix sums.",
    constraints: [
      "The list has between 1 and 100,000 numbers.",
      "Every number is between 1 and 10,000.",
      "Return 0 when no run reaches the target.",
    ],
    hints: [
      "Grow to the right while the total is short of the target.",
      "Once it reaches the target, shrink from the left while it still does.",
      "This only works because every number is positive.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "shortestSubarrayReaching",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "target", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-sliding-window", "dsa-arrays"],
    examples: [
      {
        input: "numbers = [2, 3, 1, 2, 4, 3], target = 7",
        output: "2",
        explanation: "[4, 3] reaches 7 and nothing shorter does.",
      },
      { input: "numbers = [1, 1, 1, 1], target = 11", output: "0" },
    ],
    tests: [
      { args: [[2, 3, 1, 2, 4, 3], 7], expected: 2 },
      { args: [[1, 4, 4], 4], expected: 1 },
      { args: [[1, 1, 1, 1, 1, 1, 1, 1], 11], expected: 0 },
      { args: [[1], 1], expected: 1, hidden: true },
      { args: [[1, 2, 3, 4, 5], 11], expected: 3, hidden: true },
      { args: [[5, 1, 3], 9], expected: 3, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let left = 0;
let total = 0;
let best = 0;
for (let right = 0; right < numbers.length; right += 1) {
  total += numbers[right];
  while (total >= target) {
    const length = right - left + 1;
    if (best === 0 || length < best) best = length;
    total -= numbers[left];
    left += 1;
  }
}
return best;`,
      TYPESCRIPT: `let left = 0;
let total = 0;
let best = 0;
for (let right = 0; right < numbers.length; right += 1) {
  total += numbers[right];
  while (total >= target) {
    const length = right - left + 1;
    if (best === 0 || length < best) best = length;
    total -= numbers[left];
    left += 1;
  }
}
return best;`,
      PYTHON: `left = 0
total = 0
best = 0
for right, value in enumerate(numbers):
    total += value
    while total >= target:
        length = right - left + 1
        if best == 0 or length < best:
            best = length
        total -= numbers[left]
        left += 1
return best`,
      JAVA: `int left = 0;
int total = 0;
int best = 0;
for (int right = 0; right < numbers.length; right += 1) {
    total += numbers[right];
    while (total >= target) {
        int length = right - left + 1;
        if (best == 0 || length < best) best = length;
        total -= numbers[left];
        left += 1;
    }
}
return best;`,
      CPP: `int left = 0;
int total = 0;
int best = 0;
for (int right = 0; right < (int)numbers.size(); right += 1) {
    total += numbers[right];
    while (total >= target) {
        int length = right - left + 1;
        if (best == 0 || length < best) best = length;
        total -= numbers[left];
        left += 1;
    }
}
return best;`,
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "longest-two-distinct",
    title: "Longest Run With Two Distinct Values",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Return the length of the longest run of neighbouring values that " +
      "contains at most two different values. A run of a single repeated value " +
      "counts, since one is fewer than two.",
    explanation:
      "Shrink-while-invalid, with a count map as the window's state. Add each " +
      "incoming value to the map; while the map holds more than two distinct " +
      "keys, remove values from the left, deleting a key when its count reaches " +
      "zero. Deleting the key is the part that must not be skipped — a key left " +
      "behind with a count of zero keeps the window looking invalid forever. " +
      "Generalising two to k costs nothing but the constant, which is why the " +
      "'fruit picking' and 'at most k distinct' problems are this same solution " +
      "wearing a different story.",
    constraints: [
      "The list has between 1 and 100,000 values.",
      "Each value is between 0 and 1,000,000.",
      "At most two distinct values may appear in the run.",
    ],
    hints: [
      "The window's state is a map from value to how many are inside.",
      "Shrink while the map has more than two keys.",
      "Remove a key entirely when its count drops to zero.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "longestTwoDistinct",
      params: [{ name: "values", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-sliding-window", "dsa-hashing"],
    examples: [
      { input: "values = [1, 2, 1]", output: "3" },
      {
        input: "values = [1, 2, 3, 2, 2]",
        output: "4",
        explanation: "[2, 3, 2, 2] uses only the values 2 and 3.",
      },
    ],
    tests: [
      { args: [[1, 2, 1]], expected: 3 },
      { args: [[0, 1, 2, 2]], expected: 3 },
      { args: [[1, 2, 3, 2, 2]], expected: 4 },
      { args: [[1]], expected: 1, hidden: true },
      { args: [[1, 2, 3, 4]], expected: 2, hidden: true },
      { args: [[3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4]], expected: 5, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const counts = new Map();
let left = 0;
let best = 0;
for (let right = 0; right < values.length; right += 1) {
  counts.set(values[right], (counts.get(values[right]) ?? 0) + 1);
  while (counts.size > 2) {
    const leaving = values[left];
    const remaining = counts.get(leaving) - 1;
    if (remaining === 0) counts.delete(leaving);
    else counts.set(leaving, remaining);
    left += 1;
  }
  const length = right - left + 1;
  if (length > best) best = length;
}
return best;`,
      TYPESCRIPT: `const counts = new Map<number, number>();
let left = 0;
let best = 0;
for (let right = 0; right < values.length; right += 1) {
  counts.set(values[right], (counts.get(values[right]) ?? 0) + 1);
  while (counts.size > 2) {
    const leaving = values[left];
    const remaining = (counts.get(leaving) ?? 0) - 1;
    if (remaining === 0) counts.delete(leaving);
    else counts.set(leaving, remaining);
    left += 1;
  }
  const length = right - left + 1;
  if (length > best) best = length;
}
return best;`,
      PYTHON: `counts = {}
left = 0
best = 0
for right, value in enumerate(values):
    counts[value] = counts.get(value, 0) + 1
    while len(counts) > 2:
        leaving = values[left]
        counts[leaving] -= 1
        if counts[leaving] == 0:
            del counts[leaving]
        left += 1
    best = max(best, right - left + 1)
return best`,
      JAVA: `Map<Integer, Integer> counts = new HashMap<>();
int left = 0;
int best = 0;
for (int right = 0; right < values.length; right += 1) {
    counts.put(values[right], counts.getOrDefault(values[right], 0) + 1);
    while (counts.size() > 2) {
        int leaving = values[left];
        int remaining = counts.get(leaving) - 1;
        if (remaining == 0) counts.remove(leaving);
        else counts.put(leaving, remaining);
        left += 1;
    }
    best = Math.max(best, right - left + 1);
}
return best;`,
      CPP: `unordered_map<int, int> counts;
int left = 0;
int best = 0;
for (int right = 0; right < (int)values.size(); right += 1) {
    counts[values[right]] += 1;
    while ((int)counts.size() > 2) {
        int leaving = values[left];
        counts[leaving] -= 1;
        if (counts[leaving] == 0) counts.erase(leaving);
        left += 1;
    }
    best = max(best, right - left + 1);
}
return best;`,
    },
  },

  // ── 9 ───────────────────────────────────────────────────────────────────
  {
    slug: "longest-ones-after-flips",
    title: "Longest Run of Ones After k Flips",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "The list contains only 0s and 1s. You may flip at most k zeros to ones. " +
      "Return the length of the longest run of ones you can produce.",
    explanation:
      "Rephrase it and the window appears: find the longest run containing at " +
      "most k zeros. So grow to the right counting the zeros inside, and shrink " +
      "from the left whenever that count exceeds k, undoing the count as zeros " +
      "leave. The answer is the largest window ever seen. Nothing is actually " +
      "flipped — the flips are just permission for the window to contain that " +
      "many zeros, and noticing that a 'you may change k things' problem is " +
      "really a 'window containing at most k bad things' problem is the " +
      "transferable move here.",
    constraints: [
      "The list has between 1 and 100,000 values.",
      "Every value is 0 or 1.",
      "k is between 0 and the length of the list.",
    ],
    hints: [
      "Do not flip anything — count how many zeros the window contains.",
      "Shrink from the left when the window holds more than k zeros.",
      "The answer is the widest window ever seen.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "longestOnesAfterFlips",
      params: [
        { name: "bits", type: "int[]" },
        { name: "k", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-sliding-window", "dsa-arrays"],
    examples: [
      {
        input: "bits = [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], k = 2",
        output: "6",
        explanation: "Flipping the two zeros near the end joins six ones.",
      },
      { input: "bits = [1, 1], k = 0", output: "2" },
    ],
    tests: [
      { args: [[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2], expected: 6 },
      {
        args: [[0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3],
        expected: 10,
      },
      { args: [[1, 1], 0], expected: 2 },
      { args: [[0], 1], expected: 1, hidden: true },
      { args: [[0, 0], 0], expected: 0, hidden: true },
      { args: [[1, 0, 1, 0, 1], 1], expected: 3, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let left = 0;
let zeros = 0;
let best = 0;
for (let right = 0; right < bits.length; right += 1) {
  if (bits[right] === 0) zeros += 1;
  while (zeros > k) {
    if (bits[left] === 0) zeros -= 1;
    left += 1;
  }
  const length = right - left + 1;
  if (length > best) best = length;
}
return best;`,
      TYPESCRIPT: `let left = 0;
let zeros = 0;
let best = 0;
for (let right = 0; right < bits.length; right += 1) {
  if (bits[right] === 0) zeros += 1;
  while (zeros > k) {
    if (bits[left] === 0) zeros -= 1;
    left += 1;
  }
  const length = right - left + 1;
  if (length > best) best = length;
}
return best;`,
      PYTHON: `left = 0
zeros = 0
best = 0
for right, bit in enumerate(bits):
    if bit == 0:
        zeros += 1
    while zeros > k:
        if bits[left] == 0:
            zeros -= 1
        left += 1
    best = max(best, right - left + 1)
return best`,
      JAVA: `int left = 0;
int zeros = 0;
int best = 0;
for (int right = 0; right < bits.length; right += 1) {
    if (bits[right] == 0) zeros += 1;
    while (zeros > k) {
        if (bits[left] == 0) zeros -= 1;
        left += 1;
    }
    best = Math.max(best, right - left + 1);
}
return best;`,
      CPP: `int left = 0;
int zeros = 0;
int best = 0;
for (int right = 0; right < (int)bits.size(); right += 1) {
    if (bits[right] == 0) zeros += 1;
    while (zeros > k) {
        if (bits[left] == 0) zeros -= 1;
        left += 1;
    }
    best = max(best, right - left + 1);
}
return best;`,
    },
  },

  // ── 10 ──────────────────────────────────────────────────────────────────
  {
    slug: "max-vowels-in-window",
    title: "Most Vowels in a Window",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Return the largest number of vowels found in any run of exactly k " +
      "neighbouring characters. The vowels are a, e, i, o and u.",
    explanation:
      "A fixed window again, this time counting a property rather than summing " +
      "values. Count the vowels in the first k characters, then slide: add one " +
      "if the entering character is a vowel, subtract one if the leaving " +
      "character was. Keep the best count. It is worth writing the vowel test as " +
      "its own small function or set lookup rather than a chain of comparisons — " +
      "not for speed, but because the sliding logic is the part being reviewed " +
      "and it should stay visible.",
    constraints: [
      "The text is between 1 and 100,000 lowercase letters.",
      "k is between 1 and the length of the text.",
      "Vowels are a, e, i, o and u.",
    ],
    hints: [
      "Count the vowels in the first window, then slide.",
      "Add one for the entering character, subtract one for the leaving one.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "maxVowelsInWindow",
      params: [
        { name: "text", type: "string" },
        { name: "k", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-sliding-window", "dsa-strings"],
    examples: [
      {
        input: 'text = "abciiidef", k = 3',
        output: "3",
        explanation: '"iii" holds three vowels.',
      },
      { input: 'text = "leetcode", k = 3', output: "2" },
    ],
    tests: [
      { args: ["abciiidef", 3], expected: 3 },
      { args: ["aeiou", 2], expected: 2 },
      { args: ["leetcode", 3], expected: 2 },
      { args: ["rhythms", 4], expected: 0, hidden: true },
      { args: ["tryhard", 4], expected: 1, hidden: true },
      { args: ["a", 1], expected: 1, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const isVowel = (c) => c === "a" || c === "e" || c === "i" || c === "o" || c === "u";
let count = 0;
for (let i = 0; i < k; i += 1) if (isVowel(text[i])) count += 1;
let best = count;
for (let right = k; right < text.length; right += 1) {
  if (isVowel(text[right])) count += 1;
  if (isVowel(text[right - k])) count -= 1;
  if (count > best) best = count;
}
return best;`,
      TYPESCRIPT: `const isVowel = (c: string): boolean =>
  c === "a" || c === "e" || c === "i" || c === "o" || c === "u";
let count = 0;
for (let i = 0; i < k; i += 1) if (isVowel(text[i])) count += 1;
let best = count;
for (let right = k; right < text.length; right += 1) {
  if (isVowel(text[right])) count += 1;
  if (isVowel(text[right - k])) count -= 1;
  if (count > best) best = count;
}
return best;`,
      PYTHON: `vowels = {"a", "e", "i", "o", "u"}
count = sum(1 for character in text[:k] if character in vowels)
best = count
for right in range(k, len(text)):
    if text[right] in vowels:
        count += 1
    if text[right - k] in vowels:
        count -= 1
    best = max(best, count)
return best`,
      JAVA: `String vowels = "aeiou";
int count = 0;
for (int i = 0; i < k; i += 1) {
    if (vowels.indexOf(text.charAt(i)) >= 0) count += 1;
}
int best = count;
for (int right = k; right < text.length(); right += 1) {
    if (vowels.indexOf(text.charAt(right)) >= 0) count += 1;
    if (vowels.indexOf(text.charAt(right - k)) >= 0) count -= 1;
    best = Math.max(best, count);
}
return best;`,
      CPP: `string vowels = "aeiou";
auto isVowel = [&](char c) { return vowels.find(c) != string::npos; };
int count = 0;
for (int i = 0; i < k; i += 1) if (isVowel(text[i])) count += 1;
int best = count;
for (int right = k; right < (int)text.size(); right += 1) {
    if (isVowel(text[right])) count += 1;
    if (isVowel(text[right - k])) count -= 1;
    best = max(best, count);
}
return best;`,
    },
  },

  // ── 11 ──────────────────────────────────────────────────────────────────
  {
    slug: "subarrays-with-k-distinct",
    title: "Subarrays With Exactly k Distinct Values",
    difficulty: "HARD",
    interviewFrequency: "MEDIUM",
    description:
      "Count the runs of neighbouring values that contain exactly k different " +
      "values. Runs are counted by position, so two runs holding the same " +
      "values at different places both count.",
    explanation:
      "A window cannot directly answer 'exactly k', because when the window is " +
      "valid there is no rule for which side to move. The trick is to answer a " +
      "question a window *can* handle — at most k distinct — and subtract: " +
      "exactly k equals at-most-k minus at-most-(k-1). Counting subarrays with " +
      "at most k distinct values is an ordinary shrink-while-invalid window " +
      "where each right position contributes (right - left + 1) valid subarrays " +
      "ending there. Turning an awkward equality into the difference of two " +
      "inequalities is a genuinely reusable trick, and it appears again in " +
      "counting problems with sums and with divisors.",
    constraints: [
      "The list has between 1 and 20,000 values.",
      "Each value is between 1 and 20,000.",
      "k is between 1 and the length of the list.",
    ],
    hints: [
      "A window can count 'at most k' but not 'exactly k'.",
      "Exactly k is at-most-k minus at-most-(k-1).",
      "For at most k, each right edge adds (right - left + 1) subarrays.",
    ],
    estimatedTime: "40 min",
    signature: {
      name: "subarraysWithKDistinct",
      params: [
        { name: "values", type: "int[]" },
        { name: "k", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-sliding-window", "dsa-hashing"],
    examples: [
      {
        input: "values = [1, 2, 1, 2, 3], k = 2",
        output: "7",
        explanation: "Seven runs hold exactly two different values.",
      },
      { input: "values = [1, 2, 1, 3, 4], k = 3", output: "3" },
    ],
    tests: [
      { args: [[1, 2, 1, 2, 3], 2], expected: 7 },
      { args: [[1, 2, 1, 3, 4], 3], expected: 3 },
      { args: [[1], 1], expected: 1 },
      { args: [[1, 1, 1], 1], expected: 6, hidden: true },
      { args: [[1, 2], 2], expected: 1, hidden: true },
      { args: [[1, 2, 3], 1], expected: 3, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const atMost = (limit) => {
  if (limit === 0) return 0;
  const counts = new Map();
  let left = 0;
  let total = 0;
  for (let right = 0; right < values.length; right += 1) {
    counts.set(values[right], (counts.get(values[right]) ?? 0) + 1);
    while (counts.size > limit) {
      const leaving = values[left];
      const remaining = counts.get(leaving) - 1;
      if (remaining === 0) counts.delete(leaving);
      else counts.set(leaving, remaining);
      left += 1;
    }
    total += right - left + 1;
  }
  return total;
};
return atMost(k) - atMost(k - 1);`,
      TYPESCRIPT: `const atMost = (limit: number): number => {
  if (limit === 0) return 0;
  const counts = new Map<number, number>();
  let left = 0;
  let total = 0;
  for (let right = 0; right < values.length; right += 1) {
    counts.set(values[right], (counts.get(values[right]) ?? 0) + 1);
    while (counts.size > limit) {
      const leaving = values[left];
      const remaining = (counts.get(leaving) ?? 0) - 1;
      if (remaining === 0) counts.delete(leaving);
      else counts.set(leaving, remaining);
      left += 1;
    }
    total += right - left + 1;
  }
  return total;
};
return atMost(k) - atMost(k - 1);`,
      PYTHON: `def at_most(limit: int) -> int:
    if limit == 0:
        return 0
    counts = {}
    left = 0
    total = 0
    for right, value in enumerate(values):
        counts[value] = counts.get(value, 0) + 1
        while len(counts) > limit:
            leaving = values[left]
            counts[leaving] -= 1
            if counts[leaving] == 0:
                del counts[leaving]
            left += 1
        total += right - left + 1
    return total

return at_most(k) - at_most(k - 1)`,
      JAVA: `int exact = 0;
for (int round = 0; round < 2; round += 1) {
    int limit = k - round;
    if (limit == 0) continue;
    Map<Integer, Integer> counts = new HashMap<>();
    int left = 0;
    int total = 0;
    for (int right = 0; right < values.length; right += 1) {
        counts.put(values[right], counts.getOrDefault(values[right], 0) + 1);
        while (counts.size() > limit) {
            int leaving = values[left];
            int remaining = counts.get(leaving) - 1;
            if (remaining == 0) counts.remove(leaving);
            else counts.put(leaving, remaining);
            left += 1;
        }
        total += right - left + 1;
    }
    exact += (round == 0) ? total : -total;
}
return exact;`,
      CPP: `auto atMost = [&](int limit) {
    if (limit == 0) return 0;
    unordered_map<int, int> counts;
    int left = 0;
    int total = 0;
    for (int right = 0; right < (int)values.size(); right += 1) {
        counts[values[right]] += 1;
        while ((int)counts.size() > limit) {
            int leaving = values[left];
            counts[leaving] -= 1;
            if (counts[leaving] == 0) counts.erase(leaving);
            left += 1;
        }
        total += right - left + 1;
    }
    return total;
};
return atMost(k) - atMost(k - 1);`,
    },
  },

  // ── 12 ──────────────────────────────────────────────────────────────────
  {
    slug: "minimum-window-substring",
    title: "Smallest Window Containing Every Letter",
    difficulty: "HARD",
    interviewFrequency: "VERY_HIGH",
    description:
      "Find the shortest run of neighbouring characters in the text that " +
      "contains every character of the pattern, counting repeats — a pattern " +
      "with two 'a's needs two 'a's in the window. Return that run, or an empty " +
      "string if no such run exists. When two runs tie, return the one that " +
      "starts earlier.",
    explanation:
      "Grow the window until it covers the pattern, then shrink from the left " +
      "while it still covers it, recording the best. The engineering is in " +
      "'still covers it': comparing full count maps at every step is too slow, " +
      "so keep a need map plus a single counter of how many pattern characters " +
      "are currently satisfied. A character increments that counter only on the " +
      "step where its window count reaches its required count — not on every " +
      "occurrence — and decrements it only when it drops below. With that, each " +
      "pointer moves at most n times and the whole thing is linear.",
    constraints: [
      "Both strings are between 0 and 100,000 characters.",
      "They contain uppercase and lowercase English letters.",
      "Return an empty string when no window covers the pattern.",
    ],
    hints: [
      "Grow until valid, then shrink while still valid.",
      "Keep a count of satisfied characters rather than comparing maps.",
      "A character counts as satisfied only when its count first reaches the requirement.",
    ],
    estimatedTime: "45 min",
    signature: {
      name: "minimumWindowSubstring",
      params: [
        { name: "text", type: "string" },
        { name: "pattern", type: "string" },
      ],
      returns: "string",
    },
    topicSlugs: ["dsa-sliding-window", "dsa-hashing", "dsa-strings"],
    examples: [
      {
        input: 'text = "ADOBECODEBANC", pattern = "ABC"',
        output: '"BANC"',
        explanation: "No shorter run contains an A, a B and a C.",
      },
      {
        input: 'text = "a", pattern = "aa"',
        output: '""',
        explanation: "The text has only one a, so nothing covers the pattern.",
      },
    ],
    tests: [
      { args: ["ADOBECODEBANC", "ABC"], expected: "BANC" },
      { args: ["a", "a"], expected: "a" },
      { args: ["a", "aa"], expected: "" },
      { args: ["ab", "b"], expected: "b", hidden: true },
      { args: ["aa", "aa"], expected: "aa", hidden: true },
      { args: ["abc", "cba"], expected: "abc", hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `if (pattern.length === 0 || text.length < pattern.length) return "";
const need = new Map();
for (const character of pattern) need.set(character, (need.get(character) ?? 0) + 1);
const have = new Map();
let satisfied = 0;
let bestStart = 0;
let bestLength = 0;
let left = 0;
for (let right = 0; right < text.length; right += 1) {
  const entering = text[right];
  if (need.has(entering)) {
    have.set(entering, (have.get(entering) ?? 0) + 1);
    if (have.get(entering) === need.get(entering)) satisfied += 1;
  }
  while (satisfied === need.size) {
    const length = right - left + 1;
    if (bestLength === 0 || length < bestLength) {
      bestLength = length;
      bestStart = left;
    }
    const leaving = text[left];
    if (need.has(leaving)) {
      if (have.get(leaving) === need.get(leaving)) satisfied -= 1;
      have.set(leaving, have.get(leaving) - 1);
    }
    left += 1;
  }
}
return text.slice(bestStart, bestStart + bestLength);`,
      TYPESCRIPT: `if (pattern.length === 0 || text.length < pattern.length) return "";
const need = new Map<string, number>();
for (const character of pattern) need.set(character, (need.get(character) ?? 0) + 1);
const have = new Map<string, number>();
let satisfied = 0;
let bestStart = 0;
let bestLength = 0;
let left = 0;
for (let right = 0; right < text.length; right += 1) {
  const entering = text[right];
  if (need.has(entering)) {
    have.set(entering, (have.get(entering) ?? 0) + 1);
    if (have.get(entering) === need.get(entering)) satisfied += 1;
  }
  while (satisfied === need.size) {
    const length = right - left + 1;
    if (bestLength === 0 || length < bestLength) {
      bestLength = length;
      bestStart = left;
    }
    const leaving = text[left];
    if (need.has(leaving)) {
      if (have.get(leaving) === need.get(leaving)) satisfied -= 1;
      have.set(leaving, (have.get(leaving) ?? 0) - 1);
    }
    left += 1;
  }
}
return text.slice(bestStart, bestStart + bestLength);`,
      PYTHON: `if not pattern or len(text) < len(pattern):
    return ""
need = {}
for character in pattern:
    need[character] = need.get(character, 0) + 1
have = {}
satisfied = 0
best_start = 0
best_length = 0
left = 0
for right, entering in enumerate(text):
    if entering in need:
        have[entering] = have.get(entering, 0) + 1
        if have[entering] == need[entering]:
            satisfied += 1
    while satisfied == len(need):
        length = right - left + 1
        if best_length == 0 or length < best_length:
            best_length = length
            best_start = left
        leaving = text[left]
        if leaving in need:
            if have[leaving] == need[leaving]:
                satisfied -= 1
            have[leaving] -= 1
        left += 1
return text[best_start:best_start + best_length]`,
      JAVA: `if (pattern.isEmpty() || text.length() < pattern.length()) return "";
Map<Character, Integer> need = new HashMap<>();
for (int i = 0; i < pattern.length(); i += 1) {
    need.put(pattern.charAt(i), need.getOrDefault(pattern.charAt(i), 0) + 1);
}
Map<Character, Integer> have = new HashMap<>();
int satisfied = 0;
int bestStart = 0;
int bestLength = 0;
int left = 0;
for (int right = 0; right < text.length(); right += 1) {
    char entering = text.charAt(right);
    if (need.containsKey(entering)) {
        have.put(entering, have.getOrDefault(entering, 0) + 1);
        if (have.get(entering).equals(need.get(entering))) satisfied += 1;
    }
    while (satisfied == need.size()) {
        int length = right - left + 1;
        if (bestLength == 0 || length < bestLength) {
            bestLength = length;
            bestStart = left;
        }
        char leaving = text.charAt(left);
        if (need.containsKey(leaving)) {
            if (have.get(leaving).equals(need.get(leaving))) satisfied -= 1;
            have.put(leaving, have.get(leaving) - 1);
        }
        left += 1;
    }
}
return text.substring(bestStart, bestStart + bestLength);`,
      CPP: `if (pattern.empty() || text.size() < pattern.size()) return "";
unordered_map<char, int> need;
for (char character : pattern) need[character] += 1;
unordered_map<char, int> have;
int satisfied = 0;
int bestStart = 0;
int bestLength = 0;
int left = 0;
for (int right = 0; right < (int)text.size(); right += 1) {
    char entering = text[right];
    if (need.count(entering)) {
        have[entering] += 1;
        if (have[entering] == need[entering]) satisfied += 1;
    }
    while (satisfied == (int)need.size()) {
        int length = right - left + 1;
        if (bestLength == 0 || length < bestLength) {
            bestLength = length;
            bestStart = left;
        }
        char leaving = text[left];
        if (need.count(leaving)) {
            if (have[leaving] == need[leaving]) satisfied -= 1;
            have[leaving] -= 1;
        }
        left += 1;
    }
}
return text.substr(bestStart, bestLength);`,
    },
  },
];
