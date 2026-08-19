import type { SeedProblem } from "../../problems/types";

/**
 * Binary search.
 *
 * Half the file is searching a sorted list; the other half is the version that
 * separates people in interviews — binary searching the *answer*. Once you can
 * write "is x good enough?" as a monotone yes/no question, the search space
 * stops being the input and becomes the range of possible answers, and problems
 * about eating speeds and ship capacities become the same problem as finding a
 * number in a sorted list.
 *
 * Every solution here uses the same loop shape (inclusive low, inclusive high,
 * middle computed as low + (high - low) / 2) so that the differences between
 * the problems are about the *question* being asked, not about the mechanics.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const BINARY_SEARCH_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "binary-search-value",
    title: "Find a Value in a Sorted List",
    difficulty: "EASY",
    interviewFrequency: "VERY_HIGH",
    description:
      "The list is sorted in increasing order with no duplicates. Return the " +
      "position of the target, or -1 if it is not there. Aim for O(log n) — " +
      "scanning every element defeats the purpose.",
    explanation:
      "Keep a low and a high boundary that between them always contain the " +
      "answer if it exists. Look at the middle: too small means the answer is " +
      "to the right, too big means it is to the left, equal means you are done. " +
      "Each step halves what is left, so a million elements take twenty " +
      "comparisons. Two details prevent the classic bugs: compute the middle as " +
      "low + (high - low) / 2 so a huge range cannot overflow, and move the " +
      "boundary *past* the middle rather than to it, or the loop can stop " +
      "shrinking and spin forever.",
    constraints: [
      "The list has between 0 and 100,000 numbers, sorted in increasing order.",
      "All values are distinct.",
      "Each number is between -1,000,000 and 1,000,000.",
    ],
    hints: [
      "Keep two boundaries that always bracket the answer.",
      "Compare with the middle and discard the half that cannot hold it.",
      "Move boundaries past the middle, never to it.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "binarySearchValue",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "target", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-binary-search", "js-arrays", "data-structures"],
    examples: [
      { input: "numbers = [-1, 0, 3, 5, 9, 12], target = 9", output: "4" },
      { input: "numbers = [-1, 0, 3, 5, 9, 12], target = 2", output: "-1" },
    ],
    tests: [
      { args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
      { args: [[5], 5], expected: 0 },
      { args: [[], 1], expected: -1, hidden: true },
      { args: [[1, 2], 2], expected: 1, hidden: true },
      { args: [[1, 3, 5, 7], 1], expected: 0, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let low = 0;
let high = numbers.length - 1;
while (low <= high) {
  const middle = low + Math.floor((high - low) / 2);
  if (numbers[middle] === target) return middle;
  if (numbers[middle] < target) low = middle + 1;
  else high = middle - 1;
}
return -1;`,
      TYPESCRIPT: `let low = 0;
let high = numbers.length - 1;
while (low <= high) {
  const middle = low + Math.floor((high - low) / 2);
  if (numbers[middle] === target) return middle;
  if (numbers[middle] < target) low = middle + 1;
  else high = middle - 1;
}
return -1;`,
      PYTHON: `low = 0
high = len(numbers) - 1
while low <= high:
    middle = low + (high - low) // 2
    if numbers[middle] == target:
        return middle
    if numbers[middle] < target:
        low = middle + 1
    else:
        high = middle - 1
return -1`,
      JAVA: `int low = 0;
int high = numbers.length - 1;
while (low <= high) {
    int middle = low + (high - low) / 2;
    if (numbers[middle] == target) return middle;
    if (numbers[middle] < target) low = middle + 1;
    else high = middle - 1;
}
return -1;`,
      CPP: `int low = 0;
int high = (int)numbers.size() - 1;
while (low <= high) {
    int middle = low + (high - low) / 2;
    if (numbers[middle] == target) return middle;
    if (numbers[middle] < target) low = middle + 1;
    else high = middle - 1;
}
return -1;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "search-insert-position",
    title: "Where Would It Go?",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "The list is sorted with no duplicates. Return the position of the " +
      "target if it is present, and otherwise the position where it would have " +
      "to be inserted to keep the list sorted.",
    explanation:
      "The same search, with a different thing to return when it fails. Run the " +
      "loop to exhaustion; when it ends, low has walked past every value smaller " +
      "than the target, which is exactly the insertion point. That is worth " +
      "internalising, because 'the first position whose value is at least the " +
      "target' is the lower-bound search that most binary-search variants are " +
      "built on — including finding the first and last occurrence of a repeated " +
      "value later in this file.",
    constraints: [
      "The list has between 0 and 100,000 numbers, sorted in increasing order.",
      "All values are distinct.",
      "The answer can be the length of the list, meaning 'at the end'.",
    ],
    hints: [
      "Run the ordinary search and look at where low ends up.",
      "When the search fails, low is the insertion point.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "searchInsertPosition",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "target", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-binary-search", "js-arrays"],
    examples: [
      { input: "numbers = [1, 3, 5, 6], target = 5", output: "2" },
      {
        input: "numbers = [1, 3, 5, 6], target = 2",
        output: "1",
        explanation: "2 belongs between 1 and 3.",
      },
    ],
    tests: [
      { args: [[1, 3, 5, 6], 5], expected: 2 },
      { args: [[1, 3, 5, 6], 2], expected: 1 },
      { args: [[1, 3, 5, 6], 7], expected: 4 },
      { args: [[1], 0], expected: 0, hidden: true },
      { args: [[], 5], expected: 0, hidden: true },
      { args: [[1, 3, 5, 6], 0], expected: 0, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let low = 0;
let high = numbers.length - 1;
while (low <= high) {
  const middle = low + Math.floor((high - low) / 2);
  if (numbers[middle] === target) return middle;
  if (numbers[middle] < target) low = middle + 1;
  else high = middle - 1;
}
return low;`,
      TYPESCRIPT: `let low = 0;
let high = numbers.length - 1;
while (low <= high) {
  const middle = low + Math.floor((high - low) / 2);
  if (numbers[middle] === target) return middle;
  if (numbers[middle] < target) low = middle + 1;
  else high = middle - 1;
}
return low;`,
      PYTHON: `low = 0
high = len(numbers) - 1
while low <= high:
    middle = low + (high - low) // 2
    if numbers[middle] == target:
        return middle
    if numbers[middle] < target:
        low = middle + 1
    else:
        high = middle - 1
return low`,
      JAVA: `int low = 0;
int high = numbers.length - 1;
while (low <= high) {
    int middle = low + (high - low) / 2;
    if (numbers[middle] == target) return middle;
    if (numbers[middle] < target) low = middle + 1;
    else high = middle - 1;
}
return low;`,
      CPP: `int low = 0;
int high = (int)numbers.size() - 1;
while (low <= high) {
    int middle = low + (high - low) / 2;
    if (numbers[middle] == target) return middle;
    if (numbers[middle] < target) low = middle + 1;
    else high = middle - 1;
}
return low;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "integer-square-root",
    title: "Square Root, Rounded Down",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Return the square root of a non-negative number, rounded down to a " +
      "whole number. The square root of 8 is about 2.83, so the answer is 2. Do " +
      "not use a built-in square root function.",
    explanation:
      "This is the first binary search where the thing being searched is not a " +
      "list. The candidate answers are the whole numbers from 0 to the input, " +
      "and the question 'is candidate × candidate at most the input?' is true " +
      "for every candidate up to the answer and false after it — a monotone " +
      "yes/no, which is exactly what binary search needs. Search that range " +
      "keeping the largest candidate that answered yes. Watch the multiplication: " +
      "in a fixed-width integer type, candidate × candidate can overflow, so " +
      "either use a wider type or compare with division instead.",
    constraints: [
      "The number is between 0 and 2,147,483,647.",
      "Return the whole-number part of the root.",
      "Built-in square root functions are not allowed.",
    ],
    hints: [
      "Search the answers, not a list.",
      "'candidate² ≤ number' is true up to the answer and false after it.",
      "Guard the multiplication against overflow.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "integerSquareRoot",
      params: [{ name: "number", type: "int" }],
      returns: "int",
    },
    topicSlugs: ["dsa-binary-search", "js-loops"],
    examples: [
      {
        input: "number = 8",
        output: "2",
        explanation: "2 × 2 = 4 ≤ 8, but 3 × 3 = 9 > 8.",
      },
      { input: "number = 4", output: "2" },
    ],
    tests: [
      { args: [8], expected: 2 },
      { args: [4], expected: 2 },
      { args: [0], expected: 0 },
      { args: [1], expected: 1, hidden: true },
      { args: [15], expected: 3, hidden: true },
      { args: [2147395599], expected: 46339, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let low = 0;
let high = number;
let best = 0;
while (low <= high) {
  const middle = low + Math.floor((high - low) / 2);
  if (middle * middle <= number) {
    best = middle;
    low = middle + 1;
  } else {
    high = middle - 1;
  }
}
return best;`,
      TYPESCRIPT: `let low = 0;
let high = number;
let best = 0;
while (low <= high) {
  const middle = low + Math.floor((high - low) / 2);
  if (middle * middle <= number) {
    best = middle;
    low = middle + 1;
  } else {
    high = middle - 1;
  }
}
return best;`,
      PYTHON: `low = 0
high = number
best = 0
while low <= high:
    middle = low + (high - low) // 2
    if middle * middle <= number:
        best = middle
        low = middle + 1
    else:
        high = middle - 1
return best`,
      JAVA: `int low = 0;
int high = number;
int best = 0;
while (low <= high) {
    int middle = low + (high - low) / 2;
    if ((long) middle * middle <= number) {
        best = middle;
        low = middle + 1;
    } else {
        high = middle - 1;
    }
}
return best;`,
      CPP: `int low = 0;
int high = number;
int best = 0;
while (low <= high) {
    int middle = low + (high - low) / 2;
    if ((long long)middle * middle <= (long long)number) {
        best = middle;
        low = middle + 1;
    } else {
        high = middle - 1;
    }
}
return best;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "search-rotated-sorted",
    title: "Search a Rotated Sorted List",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "A sorted list has been rotated: [0, 1, 2, 4, 5, 6, 7] might arrive as " +
      "[4, 5, 6, 7, 0, 1, 2]. Find the position of the target, or -1 if it is " +
      "absent. All values are distinct, and the search must still be O(log n).",
    explanation:
      "Rotation breaks the sortedness of the whole list but not of its halves: " +
      "whatever the middle is, at least one side of it is a properly sorted run. " +
      "Work out which — by comparing the middle with the low end — and then ask " +
      "whether the target lies inside that sorted side's range. If it does, " +
      "search there; if it does not, search the other side. Everything else is " +
      "an ordinary binary search. The comparison that decides which half is " +
      "sorted must use ≤ or < consistently with how you handle equal values, " +
      "which is why the distinct-values promise is stated.",
    constraints: [
      "The list has between 1 and 100,000 values, all distinct.",
      "It is a sorted list rotated between 0 and length - 1 times.",
      "The search must be O(log n).",
    ],
    hints: [
      "One side of the middle is always properly sorted.",
      "Decide which side that is by comparing the middle with the low end.",
      "Then ask whether the target lies within that side's range.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "searchRotated",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "target", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-binary-search", "dsa-arrays"],
    examples: [
      { input: "numbers = [4, 5, 6, 7, 0, 1, 2], target = 0", output: "4" },
      { input: "numbers = [4, 5, 6, 7, 0, 1, 2], target = 3", output: "-1" },
    ],
    tests: [
      { args: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
      { args: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
      { args: [[1], 0], expected: -1 },
      { args: [[3, 1], 1], expected: 1, hidden: true },
      { args: [[5, 1, 3], 3], expected: 2, hidden: true },
      { args: [[1, 3], 3], expected: 1, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let low = 0;
let high = numbers.length - 1;
while (low <= high) {
  const middle = low + Math.floor((high - low) / 2);
  if (numbers[middle] === target) return middle;
  if (numbers[low] <= numbers[middle]) {
    if (numbers[low] <= target && target < numbers[middle]) high = middle - 1;
    else low = middle + 1;
  } else {
    if (numbers[middle] < target && target <= numbers[high]) low = middle + 1;
    else high = middle - 1;
  }
}
return -1;`,
      TYPESCRIPT: `let low = 0;
let high = numbers.length - 1;
while (low <= high) {
  const middle = low + Math.floor((high - low) / 2);
  if (numbers[middle] === target) return middle;
  if (numbers[low] <= numbers[middle]) {
    if (numbers[low] <= target && target < numbers[middle]) high = middle - 1;
    else low = middle + 1;
  } else {
    if (numbers[middle] < target && target <= numbers[high]) low = middle + 1;
    else high = middle - 1;
  }
}
return -1;`,
      PYTHON: `low = 0
high = len(numbers) - 1
while low <= high:
    middle = low + (high - low) // 2
    if numbers[middle] == target:
        return middle
    if numbers[low] <= numbers[middle]:
        if numbers[low] <= target < numbers[middle]:
            high = middle - 1
        else:
            low = middle + 1
    else:
        if numbers[middle] < target <= numbers[high]:
            low = middle + 1
        else:
            high = middle - 1
return -1`,
      JAVA: `int low = 0;
int high = numbers.length - 1;
while (low <= high) {
    int middle = low + (high - low) / 2;
    if (numbers[middle] == target) return middle;
    if (numbers[low] <= numbers[middle]) {
        if (numbers[low] <= target && target < numbers[middle]) high = middle - 1;
        else low = middle + 1;
    } else {
        if (numbers[middle] < target && target <= numbers[high]) low = middle + 1;
        else high = middle - 1;
    }
}
return -1;`,
      CPP: `int low = 0;
int high = (int)numbers.size() - 1;
while (low <= high) {
    int middle = low + (high - low) / 2;
    if (numbers[middle] == target) return middle;
    if (numbers[low] <= numbers[middle]) {
        if (numbers[low] <= target && target < numbers[middle]) high = middle - 1;
        else low = middle + 1;
    } else {
        if (numbers[middle] < target && target <= numbers[high]) low = middle + 1;
        else high = middle - 1;
    }
}
return -1;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "rotation-minimum",
    title: "Smallest Value in a Rotated List",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "A sorted list of distinct values has been rotated some number of times. " +
      "Return its smallest value in O(log n) — without scanning the whole list.",
    explanation:
      "The smallest value is the rotation point, and the rotation point is the " +
      "only place where a value is smaller than the one before it. Compare the " +
      "middle with the *high* end rather than the low one: if the middle is " +
      "larger, the rotation point must be to its right, so move low past the " +
      "middle; otherwise the middle might itself be the answer, so keep it and " +
      "move high to it. Comparing with high rather than low is what makes the " +
      "not-rotated-at-all case fall out correctly instead of needing a special " +
      "check.",
    constraints: [
      "The list has between 1 and 100,000 values, all distinct.",
      "It is a sorted list rotated between 0 and length - 1 times.",
      "The search must be O(log n).",
    ],
    hints: [
      "The smallest value is the only one smaller than its predecessor.",
      "Compare the middle with the high end, not the low end.",
      "When the middle might be the answer, keep it rather than skipping past it.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "rotationMinimum",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-binary-search", "dsa-arrays"],
    examples: [
      { input: "numbers = [3, 4, 5, 1, 2]", output: "1" },
      {
        input: "numbers = [11, 13, 15, 17]",
        output: "11",
        explanation: "A list rotated zero times is still valid input.",
      },
    ],
    tests: [
      { args: [[3, 4, 5, 1, 2]], expected: 1 },
      { args: [[4, 5, 6, 7, 0, 1, 2]], expected: 0 },
      { args: [[11, 13, 15, 17]], expected: 11 },
      { args: [[2, 1]], expected: 1, hidden: true },
      { args: [[1]], expected: 1, hidden: true },
      { args: [[5, 1, 2, 3, 4]], expected: 1, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let low = 0;
let high = numbers.length - 1;
while (low < high) {
  const middle = low + Math.floor((high - low) / 2);
  if (numbers[middle] > numbers[high]) low = middle + 1;
  else high = middle;
}
return numbers[low];`,
      TYPESCRIPT: `let low = 0;
let high = numbers.length - 1;
while (low < high) {
  const middle = low + Math.floor((high - low) / 2);
  if (numbers[middle] > numbers[high]) low = middle + 1;
  else high = middle;
}
return numbers[low];`,
      PYTHON: `low = 0
high = len(numbers) - 1
while low < high:
    middle = low + (high - low) // 2
    if numbers[middle] > numbers[high]:
        low = middle + 1
    else:
        high = middle
return numbers[low]`,
      JAVA: `int low = 0;
int high = numbers.length - 1;
while (low < high) {
    int middle = low + (high - low) / 2;
    if (numbers[middle] > numbers[high]) low = middle + 1;
    else high = middle;
}
return numbers[low];`,
      CPP: `int low = 0;
int high = (int)numbers.size() - 1;
while (low < high) {
    int middle = low + (high - low) / 2;
    if (numbers[middle] > numbers[high]) low = middle + 1;
    else high = middle;
}
return numbers[low];`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "first-and-last-position",
    title: "First and Last Position of a Value",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "The list is sorted but may contain duplicates. Return the first and the " +
      "last position where the target appears, as [first, last]. Return " +
      "[-1, -1] when it does not appear at all.",
    explanation:
      "Two binary searches rather than one, because they are asking different " +
      "questions. The first looks for the leftmost occurrence: on finding the " +
      "target, record it and keep searching to the left rather than returning. " +
      "The second does the mirror image, searching right. Each is O(log n), so " +
      "the pair still is. The tempting shortcut — find any occurrence, then walk " +
      "outwards — is O(n) whenever the value fills most of the list, which is " +
      "exactly the case the question is designed around.",
    constraints: [
      "The list has between 0 and 100,000 numbers, sorted in non-decreasing order.",
      "Duplicates are allowed.",
      "Return [-1, -1] when the target is absent.",
    ],
    hints: [
      "Two searches: one biased left, one biased right.",
      "On a match, record the position and keep going in the biased direction.",
      "Do not walk outwards from a match — that can be linear.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "firstAndLastPosition",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "target", type: "int" },
      ],
      returns: "int[]",
    },
    topicSlugs: ["dsa-binary-search", "dsa-arrays"],
    examples: [
      { input: "numbers = [5, 7, 7, 8, 8, 10], target = 8", output: "[3, 4]" },
      { input: "numbers = [5, 7, 7, 8, 8, 10], target = 6", output: "[-1, -1]" },
    ],
    tests: [
      { args: [[5, 7, 7, 8, 8, 10], 8], expected: [3, 4] },
      { args: [[5, 7, 7, 8, 8, 10], 6], expected: [-1, -1] },
      { args: [[], 0], expected: [-1, -1] },
      { args: [[1], 1], expected: [0, 0], hidden: true },
      { args: [[2, 2], 2], expected: [0, 1], hidden: true },
      { args: [[1, 2, 3], 3], expected: [2, 2], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const search = (leftmost) => {
  let low = 0;
  let high = numbers.length - 1;
  let found = -1;
  while (low <= high) {
    const middle = low + Math.floor((high - low) / 2);
    if (numbers[middle] === target) {
      found = middle;
      if (leftmost) high = middle - 1;
      else low = middle + 1;
    } else if (numbers[middle] < target) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return found;
};
return [search(true), search(false)];`,
      TYPESCRIPT: `const search = (leftmost: boolean): number => {
  let low = 0;
  let high = numbers.length - 1;
  let found = -1;
  while (low <= high) {
    const middle = low + Math.floor((high - low) / 2);
    if (numbers[middle] === target) {
      found = middle;
      if (leftmost) high = middle - 1;
      else low = middle + 1;
    } else if (numbers[middle] < target) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return found;
};
return [search(true), search(false)];`,
      PYTHON: `def search(leftmost: bool) -> int:
    low = 0
    high = len(numbers) - 1
    found = -1
    while low <= high:
        middle = low + (high - low) // 2
        if numbers[middle] == target:
            found = middle
            if leftmost:
                high = middle - 1
            else:
                low = middle + 1
        elif numbers[middle] < target:
            low = middle + 1
        else:
            high = middle - 1
    return found

return [search(True), search(False)]`,
      JAVA: `int[] result = new int[] { -1, -1 };
for (int round = 0; round < 2; round += 1) {
    boolean leftmost = round == 0;
    int low = 0;
    int high = numbers.length - 1;
    int found = -1;
    while (low <= high) {
        int middle = low + (high - low) / 2;
        if (numbers[middle] == target) {
            found = middle;
            if (leftmost) high = middle - 1;
            else low = middle + 1;
        } else if (numbers[middle] < target) {
            low = middle + 1;
        } else {
            high = middle - 1;
        }
    }
    result[round] = found;
}
return result;`,
      CPP: `auto search = [&](bool leftmost) {
    int low = 0;
    int high = (int)numbers.size() - 1;
    int found = -1;
    while (low <= high) {
        int middle = low + (high - low) / 2;
        if (numbers[middle] == target) {
            found = middle;
            if (leftmost) high = middle - 1;
            else low = middle + 1;
        } else if (numbers[middle] < target) {
            low = middle + 1;
        } else {
            high = middle - 1;
        }
    }
    return found;
};
return vector<int>{ search(true), search(false) };`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "search-sorted-grid",
    title: "Search a Sorted Grid",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Each row of the grid is sorted left to right, and the first value of " +
      "every row is larger than the last value of the row above it. Decide " +
      "whether the target is somewhere in the grid, in O(log(rows × columns)).",
    explanation:
      "Those two promises together mean the grid is one sorted list that has " +
      "been folded into rows. So binary search it as one: treat the positions 0 " +
      "to rows × columns - 1 as the search space, and turn a position into a " +
      "cell with division and remainder — row is position / columns, column is " +
      "position % columns. No two-stage search is needed, and no separate row " +
      "hunt. If the grid only promised sorted rows and sorted columns, this " +
      "would be a different problem, solved by walking from the top-right corner " +
      "in O(rows + columns).",
    constraints: [
      "The grid has between 1 and 100 rows and between 1 and 100 columns.",
      "Rows are sorted, and each row starts above where the previous row ended.",
      "The search must be logarithmic in the number of cells.",
    ],
    hints: [
      "The two promises together make the grid one sorted list.",
      "Search positions 0 to rows × columns - 1.",
      "Position p is cell (p / columns, p % columns).",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "searchSortedGrid",
      params: [
        { name: "grid", type: "int[][]" },
        { name: "target", type: "int" },
      ],
      returns: "bool",
    },
    topicSlugs: ["dsa-binary-search", "dsa-arrays"],
    examples: [
      {
        input: "grid = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target = 3",
        output: "true",
      },
      {
        input: "grid = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target = 13",
        output: "false",
      },
    ],
    tests: [
      {
        args: [
          [
            [1, 3, 5, 7],
            [10, 11, 16, 20],
            [23, 30, 34, 60],
          ],
          3,
        ],
        expected: true,
      },
      {
        args: [
          [
            [1, 3, 5, 7],
            [10, 11, 16, 20],
            [23, 30, 34, 60],
          ],
          13,
        ],
        expected: false,
      },
      { args: [[[1]], 1], expected: true },
      { args: [[[1]], 2], expected: false, hidden: true },
      { args: [[[1, 3]], 3], expected: true, hidden: true },
      {
        args: [
          [
            [1, 2],
            [3, 4],
          ],
          4,
        ],
        expected: true,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const rows = grid.length;
const cols = grid[0].length;
let low = 0;
let high = rows * cols - 1;
while (low <= high) {
  const middle = low + Math.floor((high - low) / 2);
  const value = grid[Math.floor(middle / cols)][middle % cols];
  if (value === target) return true;
  if (value < target) low = middle + 1;
  else high = middle - 1;
}
return false;`,
      TYPESCRIPT: `const rows = grid.length;
const cols = grid[0].length;
let low = 0;
let high = rows * cols - 1;
while (low <= high) {
  const middle = low + Math.floor((high - low) / 2);
  const value = grid[Math.floor(middle / cols)][middle % cols];
  if (value === target) return true;
  if (value < target) low = middle + 1;
  else high = middle - 1;
}
return false;`,
      PYTHON: `rows = len(grid)
cols = len(grid[0])
low = 0
high = rows * cols - 1
while low <= high:
    middle = low + (high - low) // 2
    value = grid[middle // cols][middle % cols]
    if value == target:
        return True
    if value < target:
        low = middle + 1
    else:
        high = middle - 1
return False`,
      JAVA: `int rows = grid.length;
int cols = grid[0].length;
int low = 0;
int high = rows * cols - 1;
while (low <= high) {
    int middle = low + (high - low) / 2;
    int value = grid[middle / cols][middle % cols];
    if (value == target) return true;
    if (value < target) low = middle + 1;
    else high = middle - 1;
}
return false;`,
      CPP: `int rows = (int)grid.size();
int cols = (int)grid[0].size();
int low = 0;
int high = rows * cols - 1;
while (low <= high) {
    int middle = low + (high - low) / 2;
    int value = grid[middle / cols][middle % cols];
    if (value == target) return true;
    if (value < target) low = middle + 1;
    else high = middle - 1;
}
return false;`,
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "minimum-eating-speed",
    title: "Slowest Speed That Still Finishes",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "There are several piles of bananas and a fixed number of hours. Eating " +
      "at a chosen speed of bananas per hour, each hour you eat from exactly " +
      "one pile — and if that pile has fewer bananas left than your speed, you " +
      "finish it and wait. Return the slowest whole-number speed that clears " +
      "every pile within the hours available.",
    explanation:
      "Binary search on the answer. The candidate speeds run from 1 to the " +
      "largest pile, and 'does speed s finish in time?' is monotone: if a speed " +
      "works then every faster speed works too. So search that range, and for " +
      "each candidate compute the hours needed as the sum over piles of " +
      "ceil(pile / speed). Recognising a monotone yes/no question inside a " +
      "word problem is the entire skill; the rest is the same loop as searching " +
      "a sorted list. Watch the ceiling division — writing it as (pile + speed - " +
      "1) / speed avoids floating point entirely.",
    constraints: [
      "There are between 1 and 10,000 piles.",
      "Each pile holds between 1 and 1,000,000,000 bananas.",
      "The hours available are at least the number of piles.",
    ],
    hints: [
      "The answer is somewhere between 1 and the largest pile.",
      "'Speed s finishes in time' is false then true — that is binary searchable.",
      "Hours needed is the sum of ceil(pile / speed).",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "minimumEatingSpeed",
      params: [
        { name: "piles", type: "int[]" },
        { name: "hours", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-binary-search", "dsa-greedy"],
    examples: [
      {
        input: "piles = [3, 6, 7, 11], hours = 8",
        output: "4",
        explanation: "Speed 4 needs 1 + 2 + 2 + 3 = 8 hours; speed 3 needs 10.",
      },
      { input: "piles = [30, 11, 23, 4, 20], hours = 6", output: "23" },
    ],
    tests: [
      { args: [[3, 6, 7, 11], 8], expected: 4 },
      { args: [[30, 11, 23, 4, 20], 5], expected: 30 },
      { args: [[30, 11, 23, 4, 20], 6], expected: 23 },
      { args: [[1], 1], expected: 1, hidden: true },
      { args: [[1000000000], 2], expected: 500000000, hidden: true },
      { args: [[5, 5], 4], expected: 3, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let low = 1;
let high = 0;
for (const pile of piles) if (pile > high) high = pile;
while (low < high) {
  const speed = low + Math.floor((high - low) / 2);
  let needed = 0;
  for (const pile of piles) needed += Math.ceil(pile / speed);
  if (needed <= hours) high = speed;
  else low = speed + 1;
}
return low;`,
      TYPESCRIPT: `let low = 1;
let high = 0;
for (const pile of piles) if (pile > high) high = pile;
while (low < high) {
  const speed = low + Math.floor((high - low) / 2);
  let needed = 0;
  for (const pile of piles) needed += Math.ceil(pile / speed);
  if (needed <= hours) high = speed;
  else low = speed + 1;
}
return low;`,
      PYTHON: `low = 1
high = max(piles)
while low < high:
    speed = low + (high - low) // 2
    needed = 0
    for pile in piles:
        needed += (pile + speed - 1) // speed
    if needed <= hours:
        high = speed
    else:
        low = speed + 1
return low`,
      JAVA: `int low = 1;
int high = 0;
for (int pile : piles) high = Math.max(high, pile);
while (low < high) {
    int speed = low + (high - low) / 2;
    long needed = 0;
    for (int pile : piles) needed += (pile + (long) speed - 1) / speed;
    if (needed <= hours) high = speed;
    else low = speed + 1;
}
return low;`,
      CPP: `int low = 1;
int high = 0;
for (int pile : piles) high = max(high, pile);
while (low < high) {
    int speed = low + (high - low) / 2;
    long long needed = 0;
    for (int pile : piles) needed += ((long long)pile + speed - 1) / speed;
    if (needed <= hours) high = speed;
    else low = speed + 1;
}
return low;`,
    },
  },

  // ── 9 ───────────────────────────────────────────────────────────────────
  {
    slug: "ship-capacity-in-days",
    title: "Smallest Ship That Ships in Time",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Packages must leave a port in the order they are given, within a fixed " +
      "number of days. Each day the ship carries as many of the next packages " +
      "as fit within its capacity. Return the smallest capacity that gets every " +
      "package away in time.",
    explanation:
      "Binary search on the answer again, with two boundaries worth deriving " +
      "rather than guessing. The capacity can never be less than the heaviest " +
      "package, because that package has to travel; and it never needs to exceed " +
      "the total weight, which is one day's work. Between those, 'does capacity " +
      "c finish within the days?' is monotone, and checking it is one greedy " +
      "pass: fill the current day until the next package would overflow, then " +
      "start a new day. The order-preserving rule is what makes that greedy pass " +
      "correct — packages cannot be rearranged to pack better.",
    constraints: [
      "There are between 1 and 50,000 packages.",
      "Each weight is between 1 and 500.",
      "The days available are between 1 and the number of packages.",
    ],
    hints: [
      "The answer is between the heaviest package and the total weight.",
      "Checking a capacity is one greedy pass counting days.",
      "Packages keep their order — no packing cleverness is allowed.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "shipCapacityInDays",
      params: [
        { name: "weights", type: "int[]" },
        { name: "days", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-binary-search", "dsa-greedy"],
    examples: [
      {
        input: "weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days = 5",
        output: "15",
        explanation: "Five days of 15: 1-5, 6-7, 8, 9, 10.",
      },
      { input: "weights = [3, 2, 2, 4, 1, 4], days = 3", output: "6" },
    ],
    tests: [
      { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5], expected: 15 },
      { args: [[3, 2, 2, 4, 1, 4], 3], expected: 6 },
      { args: [[1, 2, 3, 1, 1], 4], expected: 3 },
      { args: [[1], 1], expected: 1, hidden: true },
      { args: [[5, 5, 5], 3], expected: 5, hidden: true },
      { args: [[10, 10], 1], expected: 20, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let low = 0;
let high = 0;
for (const weight of weights) {
  if (weight > low) low = weight;
  high += weight;
}
while (low < high) {
  const capacity = low + Math.floor((high - low) / 2);
  let needed = 1;
  let carried = 0;
  for (const weight of weights) {
    if (carried + weight > capacity) {
      needed += 1;
      carried = 0;
    }
    carried += weight;
  }
  if (needed <= days) high = capacity;
  else low = capacity + 1;
}
return low;`,
      TYPESCRIPT: `let low = 0;
let high = 0;
for (const weight of weights) {
  if (weight > low) low = weight;
  high += weight;
}
while (low < high) {
  const capacity = low + Math.floor((high - low) / 2);
  let needed = 1;
  let carried = 0;
  for (const weight of weights) {
    if (carried + weight > capacity) {
      needed += 1;
      carried = 0;
    }
    carried += weight;
  }
  if (needed <= days) high = capacity;
  else low = capacity + 1;
}
return low;`,
      PYTHON: `low = max(weights)
high = sum(weights)
while low < high:
    capacity = low + (high - low) // 2
    needed = 1
    carried = 0
    for weight in weights:
        if carried + weight > capacity:
            needed += 1
            carried = 0
        carried += weight
    if needed <= days:
        high = capacity
    else:
        low = capacity + 1
return low`,
      JAVA: `int low = 0;
int high = 0;
for (int weight : weights) {
    low = Math.max(low, weight);
    high += weight;
}
while (low < high) {
    int capacity = low + (high - low) / 2;
    int needed = 1;
    int carried = 0;
    for (int weight : weights) {
        if (carried + weight > capacity) {
            needed += 1;
            carried = 0;
        }
        carried += weight;
    }
    if (needed <= days) high = capacity;
    else low = capacity + 1;
}
return low;`,
      CPP: `int low = 0;
int high = 0;
for (int weight : weights) {
    low = max(low, weight);
    high += weight;
}
while (low < high) {
    int capacity = low + (high - low) / 2;
    int needed = 1;
    int carried = 0;
    for (int weight : weights) {
        if (carried + weight > capacity) {
            needed += 1;
            carried = 0;
        }
        carried += weight;
    }
    if (needed <= days) high = capacity;
    else low = capacity + 1;
}
return low;`,
    },
  },

  // ── 10 ──────────────────────────────────────────────────────────────────
  {
    slug: "median-of-two-sorted",
    title: "Median of Two Sorted Lists",
    difficulty: "HARD",
    interviewFrequency: "VERY_HIGH",
    description:
      "Two sorted lists are given. Return the median of all their values taken " +
      "together — the middle value when the count is odd, and the average of " +
      "the two middle values when it is even. Aim for O(log(m + n)); merging " +
      "them is O(m + n) and is not the answer being looked for.",
    explanation:
      "The median is defined by a split, not by a search: cut both lists so " +
      "that the left halves together hold exactly half the values, and every " +
      "value on the left is at most every value on the right. Only one cut is " +
      "free — choosing how many values to take from the shorter list fixes how " +
      "many come from the longer one — so binary search that single number. The " +
      "cut is correct when the last value taken from each list is no larger than " +
      "the first value left in the other. Searching the shorter list keeps the " +
      "range small and avoids a whole class of index errors, and treating a " +
      "missing neighbour as minus or plus infinity removes the boundary cases " +
      "entirely.",
    constraints: [
      "Each list has between 0 and 50,000 values, sorted in non-decreasing order.",
      "The two lists are not both empty.",
      "Each value is between -1,000,000 and 1,000,000.",
    ],
    hints: [
      "Do not merge — search for the right place to cut.",
      "Binary search how many values come from the shorter list.",
      "Treat missing neighbours as minus and plus infinity.",
    ],
    estimatedTime: "50 min",
    signature: {
      name: "medianOfTwoSorted",
      params: [
        { name: "first", type: "int[]" },
        { name: "second", type: "int[]" },
      ],
      returns: "float",
    },
    topicSlugs: ["dsa-binary-search", "dsa-arrays"],
    examples: [
      {
        input: "first = [1, 3], second = [2]",
        output: "2",
        explanation: "Together they are 1, 2, 3 — the middle value is 2.",
      },
      {
        input: "first = [1, 2], second = [3, 4]",
        output: "2.5",
        explanation: "Together they are 1, 2, 3, 4 — the average of 2 and 3.",
      },
    ],
    tests: [
      {
        args: [[1, 3], [2]],
        expected: 2,
      },
      {
        args: [
          [1, 2],
          [3, 4],
        ],
        expected: 2.5,
      },
      { args: [[], [1]], expected: 1 },
      {
        args: [
          [0, 0],
          [0, 0],
        ],
        expected: 0,
        hidden: true,
      },
      { args: [[2], []], expected: 2, hidden: true },
      {
        args: [
          [1, 2, 3],
          [4, 5, 6],
        ],
        expected: 3.5,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `let shorter = first;
let longer = second;
if (shorter.length > longer.length) {
  const held = shorter;
  shorter = longer;
  longer = held;
}
const m = shorter.length;
const n = longer.length;
const half = Math.floor((m + n + 1) / 2);
let low = 0;
let high = m;
while (low <= high) {
  const take = low + Math.floor((high - low) / 2);
  const other = half - take;
  const leftShort = take > 0 ? shorter[take - 1] : -Infinity;
  const rightShort = take < m ? shorter[take] : Infinity;
  const leftLong = other > 0 ? longer[other - 1] : -Infinity;
  const rightLong = other < n ? longer[other] : Infinity;
  if (leftShort <= rightLong && leftLong <= rightShort) {
    if ((m + n) % 2 === 1) return Math.max(leftShort, leftLong);
    return (Math.max(leftShort, leftLong) + Math.min(rightShort, rightLong)) / 2;
  }
  if (leftShort > rightLong) high = take - 1;
  else low = take + 1;
}
return 0;`,
      TYPESCRIPT: `let shorter = first;
let longer = second;
if (shorter.length > longer.length) {
  const held = shorter;
  shorter = longer;
  longer = held;
}
const m = shorter.length;
const n = longer.length;
const half = Math.floor((m + n + 1) / 2);
let low = 0;
let high = m;
while (low <= high) {
  const take = low + Math.floor((high - low) / 2);
  const other = half - take;
  const leftShort = take > 0 ? shorter[take - 1] : -Infinity;
  const rightShort = take < m ? shorter[take] : Infinity;
  const leftLong = other > 0 ? longer[other - 1] : -Infinity;
  const rightLong = other < n ? longer[other] : Infinity;
  if (leftShort <= rightLong && leftLong <= rightShort) {
    if ((m + n) % 2 === 1) return Math.max(leftShort, leftLong);
    return (Math.max(leftShort, leftLong) + Math.min(rightShort, rightLong)) / 2;
  }
  if (leftShort > rightLong) high = take - 1;
  else low = take + 1;
}
return 0;`,
      PYTHON: `shorter = first
longer = second
if len(shorter) > len(longer):
    shorter, longer = longer, shorter
m = len(shorter)
n = len(longer)
half = (m + n + 1) // 2
low = 0
high = m
while low <= high:
    take = low + (high - low) // 2
    other = half - take
    left_short = shorter[take - 1] if take > 0 else float("-inf")
    right_short = shorter[take] if take < m else float("inf")
    left_long = longer[other - 1] if other > 0 else float("-inf")
    right_long = longer[other] if other < n else float("inf")
    if left_short <= right_long and left_long <= right_short:
        if (m + n) % 2 == 1:
            return float(max(left_short, left_long))
        return (max(left_short, left_long) + min(right_short, right_long)) / 2
    if left_short > right_long:
        high = take - 1
    else:
        low = take + 1
return 0.0`,
      JAVA: `int[] shorter = first;
int[] longer = second;
if (shorter.length > longer.length) {
    int[] held = shorter;
    shorter = longer;
    longer = held;
}
int m = shorter.length;
int n = longer.length;
int half = (m + n + 1) / 2;
int low = 0;
int high = m;
while (low <= high) {
    int take = low + (high - low) / 2;
    int other = half - take;
    long leftShort = take > 0 ? shorter[take - 1] : Long.MIN_VALUE;
    long rightShort = take < m ? shorter[take] : Long.MAX_VALUE;
    long leftLong = other > 0 ? longer[other - 1] : Long.MIN_VALUE;
    long rightLong = other < n ? longer[other] : Long.MAX_VALUE;
    if (leftShort <= rightLong && leftLong <= rightShort) {
        if ((m + n) % 2 == 1) return Math.max(leftShort, leftLong);
        return (Math.max(leftShort, leftLong) + Math.min(rightShort, rightLong)) / 2.0;
    }
    if (leftShort > rightLong) high = take - 1;
    else low = take + 1;
}
return 0.0;`,
      CPP: `vector<int> shorter = first;
vector<int> longer = second;
if (shorter.size() > longer.size()) swap(shorter, longer);
int m = (int)shorter.size();
int n = (int)longer.size();
int half = (m + n + 1) / 2;
int low = 0;
int high = m;
while (low <= high) {
    int take = low + (high - low) / 2;
    int other = half - take;
    long long leftShort = take > 0 ? shorter[take - 1] : LLONG_MIN;
    long long rightShort = take < m ? shorter[take] : LLONG_MAX;
    long long leftLong = other > 0 ? longer[other - 1] : LLONG_MIN;
    long long rightLong = other < n ? longer[other] : LLONG_MAX;
    if (leftShort <= rightLong && leftLong <= rightShort) {
        if ((m + n) % 2 == 1) return (double)max(leftShort, leftLong);
        return (double)(max(leftShort, leftLong) + min(rightShort, rightLong)) / 2.0;
    }
    if (leftShort > rightLong) high = take - 1;
    else low = take + 1;
}
return 0.0;`,
    },
  },
];
