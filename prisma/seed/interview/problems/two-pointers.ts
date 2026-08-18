import type { SeedProblem } from "../../problems/types";

/**
 * Two pointers.
 *
 * Two indices moving under a rule you can defend — that last part is the whole
 * skill. Every problem here has a one-line argument for why moving a particular
 * pointer cannot skip the answer, and a solution written without that argument
 * is a guess that happens to pass the samples.
 *
 * The file runs from same-direction pointers (move zeroes, dedupe) through
 * opposite-direction ones (sorted pairs, containers) to the two hardest uses:
 * the fixed outer loop with an inner sweep in three-sum, and the
 * running-maximum version in trapping rain water.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const TWO_POINTER_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "move-zeroes-to-end",
    title: "Move the Zeroes to the End",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Move every zero to the end of the list while keeping the other values " +
      "in the order they arrived. Return the rearranged list. [0, 1, 0, 3, 12] " +
      "becomes [1, 3, 12, 0, 0].",
    explanation:
      "Two indices walking the same way. One reads every position; the other " +
      "marks where the next non-zero value belongs. Whenever the reader finds " +
      "something that is not zero, it goes to the writer's position and the " +
      "writer moves on. When the reader finishes, everything from the writer " +
      "onwards is zero. This is the pattern behind most in-place filtering: the " +
      "writer index is the length of the answer so far, which is exactly what " +
      "'remove elements matching X' also needs.",
    constraints: [
      "The list has between 1 and 100,000 numbers.",
      "Each number is between -1,000,000 and 1,000,000.",
      "Non-zero values keep their relative order.",
    ],
    hints: [
      "One index reads, another marks where the next kept value goes.",
      "After the read finishes, fill the rest with zeroes.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "moveZeroesToEnd",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-two-pointers", "js-arrays", "data-structures"],
    examples: [
      { input: "numbers = [0, 1, 0, 3, 12]", output: "[1, 3, 12, 0, 0]" },
      { input: "numbers = [1, 2, 3]", output: "[1, 2, 3]" },
    ],
    tests: [
      { args: [[0, 1, 0, 3, 12]], expected: [1, 3, 12, 0, 0] },
      { args: [[0]], expected: [0] },
      { args: [[1, 2, 3]], expected: [1, 2, 3] },
      { args: [[0, 0, 1]], expected: [1, 0, 0], hidden: true },
      { args: [[1, 0]], expected: [1, 0], hidden: true },
      { args: [[0, 0, 0]], expected: [0, 0, 0], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const result = numbers.slice();
let write = 0;
for (let read = 0; read < result.length; read += 1) {
  if (result[read] !== 0) {
    result[write] = result[read];
    write += 1;
  }
}
while (write < result.length) {
  result[write] = 0;
  write += 1;
}
return result;`,
      TYPESCRIPT: `const result: number[] = numbers.slice();
let write = 0;
for (let read = 0; read < result.length; read += 1) {
  if (result[read] !== 0) {
    result[write] = result[read];
    write += 1;
  }
}
while (write < result.length) {
  result[write] = 0;
  write += 1;
}
return result;`,
      PYTHON: `result = list(numbers)
write = 0
for read in range(len(result)):
    if result[read] != 0:
        result[write] = result[read]
        write += 1
while write < len(result):
    result[write] = 0
    write += 1
return result`,
      JAVA: `int[] result = Arrays.copyOf(numbers, numbers.length);
int write = 0;
for (int read = 0; read < result.length; read += 1) {
    if (result[read] != 0) {
        result[write] = result[read];
        write += 1;
    }
}
while (write < result.length) {
    result[write] = 0;
    write += 1;
}
return result;`,
      CPP: `vector<int> result = numbers;
int write = 0;
for (int read = 0; read < (int)result.size(); read += 1) {
    if (result[read] != 0) {
        result[write] = result[read];
        write += 1;
    }
}
while (write < (int)result.size()) {
    result[write] = 0;
    write += 1;
}
return result;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "dedupe-sorted-list",
    title: "Remove Duplicates From a Sorted List",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "The list is already sorted, so equal values sit next to each other. " +
      "Return the distinct values, still in order. An empty list returns an " +
      "empty list.",
    explanation:
      "Because the list is sorted, a duplicate is always the previous value — " +
      "which means no set is needed and no memory beyond the answer. Keep a " +
      "write index and copy a value only when it differs from the last one you " +
      "kept. The interview version asks for it in place, returning the new " +
      "length, which is the same loop: the write index *is* the length. Reaching " +
      "for a hash set here is the tell that the sortedness went unnoticed.",
    constraints: [
      "The list has between 0 and 100,000 numbers.",
      "The list is sorted in non-decreasing order.",
      "Each number is between -10,000 and 10,000.",
    ],
    hints: [
      "Sorted means duplicates are neighbours.",
      "Compare each value with the last one you kept, not with everything.",
    ],
    estimatedTime: "10 min",
    signature: {
      name: "dedupeSorted",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-two-pointers", "js-arrays"],
    examples: [
      { input: "numbers = [1, 1, 2]", output: "[1, 2]" },
      {
        input: "numbers = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]",
        output: "[0, 1, 2, 3, 4]",
      },
    ],
    tests: [
      { args: [[1, 1, 2]], expected: [1, 2] },
      { args: [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]], expected: [0, 1, 2, 3, 4] },
      { args: [[]], expected: [] },
      { args: [[1]], expected: [1], hidden: true },
      { args: [[2, 2, 2]], expected: [2], hidden: true },
      { args: [[-1, 0, 0, 1]], expected: [-1, 0, 1], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const result = [];
for (const value of numbers) {
  if (result.length === 0 || result[result.length - 1] !== value) {
    result.push(value);
  }
}
return result;`,
      TYPESCRIPT: `const result: number[] = [];
for (const value of numbers) {
  if (result.length === 0 || result[result.length - 1] !== value) {
    result.push(value);
  }
}
return result;`,
      PYTHON: `result = []
for value in numbers:
    if not result or result[-1] != value:
        result.append(value)
return result`,
      JAVA: `int[] kept = new int[numbers.length];
int write = 0;
for (int value : numbers) {
    if (write == 0 || kept[write - 1] != value) {
        kept[write] = value;
        write += 1;
    }
}
return Arrays.copyOf(kept, write);`,
      CPP: `vector<int> result;
for (int value : numbers) {
    if (result.empty() || result.back() != value) {
        result.push_back(value);
    }
}
return result;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "merge-two-sorted-lists",
    title: "Merge Two Sorted Lists",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Both lists are already sorted in increasing order. Combine them into " +
      "one sorted list containing everything from both, duplicates included, " +
      "and return it.",
    explanation:
      "Concatenating and sorting is O((n + m) log(n + m)) and throws away the " +
      "fact that both inputs are already ordered. With one index per list you " +
      "can take the smaller front value each time and finish in O(n + m): " +
      "whichever list still has the smallest unused value goes next. When one " +
      "list runs out, the rest of the other is already sorted, so it can be " +
      "copied wholesale. This is the merge half of merge sort, and it is the " +
      "same shape as merging k sorted lists once a heap is involved.",
    constraints: [
      "Each list has between 0 and 50,000 numbers.",
      "Both lists are sorted in non-decreasing order.",
      "Each number is between -100,000 and 100,000.",
    ],
    hints: [
      "One index per list; take the smaller front value.",
      "When one runs out, the rest of the other needs no comparison.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "mergeSortedLists",
      params: [
        { name: "first", type: "int[]" },
        { name: "second", type: "int[]" },
      ],
      returns: "int[]",
    },
    topicSlugs: ["dsa-two-pointers", "dsa-sorting", "js-arrays"],
    examples: [
      { input: "first = [1, 2, 4], second = [1, 3, 4]", output: "[1, 1, 2, 3, 4, 4]" },
      { input: "first = [], second = [1]", output: "[1]" },
    ],
    tests: [
      {
        args: [
          [1, 2, 4],
          [1, 3, 4],
        ],
        expected: [1, 1, 2, 3, 4, 4],
      },
      { args: [[], [1]], expected: [1] },
      { args: [[], []], expected: [] },
      { args: [[5], [1]], expected: [1, 5], hidden: true },
      { args: [[1, 2, 3], []], expected: [1, 2, 3], hidden: true },
      {
        args: [
          [-3, 0],
          [-1, 2],
        ],
        expected: [-3, -1, 0, 2],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const result = [];
let i = 0;
let j = 0;
while (i < first.length && j < second.length) {
  if (first[i] <= second[j]) {
    result.push(first[i]);
    i += 1;
  } else {
    result.push(second[j]);
    j += 1;
  }
}
while (i < first.length) {
  result.push(first[i]);
  i += 1;
}
while (j < second.length) {
  result.push(second[j]);
  j += 1;
}
return result;`,
      TYPESCRIPT: `const result: number[] = [];
let i = 0;
let j = 0;
while (i < first.length && j < second.length) {
  if (first[i] <= second[j]) {
    result.push(first[i]);
    i += 1;
  } else {
    result.push(second[j]);
    j += 1;
  }
}
while (i < first.length) {
  result.push(first[i]);
  i += 1;
}
while (j < second.length) {
  result.push(second[j]);
  j += 1;
}
return result;`,
      PYTHON: `result = []
i = 0
j = 0
while i < len(first) and j < len(second):
    if first[i] <= second[j]:
        result.append(first[i])
        i += 1
    else:
        result.append(second[j])
        j += 1
result.extend(first[i:])
result.extend(second[j:])
return result`,
      JAVA: `int[] result = new int[first.length + second.length];
int i = 0;
int j = 0;
int at = 0;
while (i < first.length && j < second.length) {
    if (first[i] <= second[j]) {
        result[at++] = first[i];
        i += 1;
    } else {
        result[at++] = second[j];
        j += 1;
    }
}
while (i < first.length) result[at++] = first[i++];
while (j < second.length) result[at++] = second[j++];
return result;`,
      CPP: `vector<int> result;
size_t i = 0;
size_t j = 0;
while (i < first.size() && j < second.size()) {
    if (first[i] <= second[j]) {
        result.push_back(first[i]);
        i += 1;
    } else {
        result.push_back(second[j]);
        j += 1;
    }
}
while (i < first.size()) result.push_back(first[i++]);
while (j < second.size()) result.push_back(second[j++]);
return result;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "sorted-squares",
    title: "Squares of a Sorted List",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "The input is sorted in increasing order but may contain negative " +
      "numbers. Return the squares of those numbers, sorted in increasing " +
      "order. Squaring alone does not keep the order: [-4, -1, 0, 3] squares " +
      "to [16, 1, 0, 9].",
    explanation:
      "Squaring and re-sorting is O(n log n) and works. The linear answer comes " +
      "from noticing that the largest square is always at one end or the other — " +
      "the most negative value or the most positive one. So put one pointer at " +
      "each end, compare the two squares, and write the bigger one into the " +
      "*back* of the result, moving that pointer inwards. Filling the answer " +
      "backwards is the part worth remembering; trying to fill it forwards makes " +
      "the same idea much harder to write.",
    constraints: [
      "The list has between 1 and 100,000 numbers.",
      "The list is sorted in non-decreasing order.",
      "Each number is between -10,000 and 10,000.",
    ],
    hints: [
      "The biggest square is at one end of the list.",
      "Two pointers, one at each end, comparing squares.",
      "Fill the result from the back.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "sortedSquares",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-two-pointers", "js-arrays"],
    examples: [
      { input: "numbers = [-4, -1, 0, 3, 10]", output: "[0, 1, 9, 16, 100]" },
      { input: "numbers = [-7, -3, 2, 3, 11]", output: "[4, 9, 9, 49, 121]" },
    ],
    tests: [
      { args: [[-4, -1, 0, 3, 10]], expected: [0, 1, 9, 16, 100] },
      { args: [[-7, -3, 2, 3, 11]], expected: [4, 9, 9, 49, 121] },
      { args: [[0]], expected: [0] },
      { args: [[-5, -4]], expected: [16, 25], hidden: true },
      { args: [[1, 2]], expected: [1, 4], hidden: true },
      { args: [[-1, 0, 1]], expected: [0, 1, 1], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const n = numbers.length;
const result = new Array(n).fill(0);
let left = 0;
let right = n - 1;
for (let at = n - 1; at >= 0; at -= 1) {
  const leftSquare = numbers[left] * numbers[left];
  const rightSquare = numbers[right] * numbers[right];
  if (leftSquare > rightSquare) {
    result[at] = leftSquare;
    left += 1;
  } else {
    result[at] = rightSquare;
    right -= 1;
  }
}
return result;`,
      TYPESCRIPT: `const n = numbers.length;
const result: number[] = new Array(n).fill(0);
let left = 0;
let right = n - 1;
for (let at = n - 1; at >= 0; at -= 1) {
  const leftSquare = numbers[left] * numbers[left];
  const rightSquare = numbers[right] * numbers[right];
  if (leftSquare > rightSquare) {
    result[at] = leftSquare;
    left += 1;
  } else {
    result[at] = rightSquare;
    right -= 1;
  }
}
return result;`,
      PYTHON: `n = len(numbers)
result = [0] * n
left = 0
right = n - 1
for at in range(n - 1, -1, -1):
    left_square = numbers[left] * numbers[left]
    right_square = numbers[right] * numbers[right]
    if left_square > right_square:
        result[at] = left_square
        left += 1
    else:
        result[at] = right_square
        right -= 1
return result`,
      JAVA: `int n = numbers.length;
int[] result = new int[n];
int left = 0;
int right = n - 1;
for (int at = n - 1; at >= 0; at -= 1) {
    int leftSquare = numbers[left] * numbers[left];
    int rightSquare = numbers[right] * numbers[right];
    if (leftSquare > rightSquare) {
        result[at] = leftSquare;
        left += 1;
    } else {
        result[at] = rightSquare;
        right -= 1;
    }
}
return result;`,
      CPP: `int n = (int)numbers.size();
vector<int> result(n, 0);
int left = 0;
int right = n - 1;
for (int at = n - 1; at >= 0; at -= 1) {
    int leftSquare = numbers[left] * numbers[left];
    int rightSquare = numbers[right] * numbers[right];
    if (leftSquare > rightSquare) {
        result[at] = leftSquare;
        left += 1;
    } else {
        result[at] = rightSquare;
        right -= 1;
    }
}
return result;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "two-sum-sorted",
    title: "Two Sum in a Sorted List",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "The list is sorted in increasing order. Find the two positions whose " +
      "values add up to the target and return them as [smaller, larger]. " +
      "Exactly one pair works. Solve it without a hash map.",
    explanation:
      "Start with the smallest and largest values. Their total is either too " +
      "big, too small, or exactly right. Too big means the largest value is too " +
      "large for any partner still available, so move the right pointer in; too " +
      "small means the smallest value is too small for any remaining partner, so " +
      "move the left one out. Each step permanently discards one value, and the " +
      "discarded value could not have been part of the answer — that argument is " +
      "the solution, and it is what makes the search linear with no extra " +
      "memory.",
    constraints: [
      "The list has between 2 and 100,000 numbers, sorted in non-decreasing order.",
      "Exactly one pair adds up to the target.",
      "Return 0-based positions in increasing order.",
    ],
    hints: [
      "Start at both ends.",
      "A total that is too large can only be fixed by shrinking the larger value.",
      "Each comparison lets you discard one value forever.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "twoSumSorted",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "target", type: "int" },
      ],
      returns: "int[]",
    },
    topicSlugs: ["dsa-two-pointers", "dsa-binary-search"],
    examples: [
      { input: "numbers = [2, 7, 11, 15], target = 9", output: "[0, 1]" },
      { input: "numbers = [2, 3, 4], target = 6", output: "[0, 2]" },
    ],
    tests: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[2, 3, 4], 6], expected: [0, 2] },
      { args: [[-1, 0], -1], expected: [0, 1] },
      { args: [[1, 2, 3, 4, 4, 9, 56, 90], 8], expected: [3, 4], hidden: true },
      { args: [[0, 0, 3, 4], 0], expected: [0, 1], hidden: true },
      { args: [[1, 3, 5], 8], expected: [1, 2], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let left = 0;
let right = numbers.length - 1;
while (left < right) {
  const total = numbers[left] + numbers[right];
  if (total === target) return [left, right];
  if (total < target) left += 1;
  else right -= 1;
}
return [];`,
      TYPESCRIPT: `let left = 0;
let right = numbers.length - 1;
while (left < right) {
  const total = numbers[left] + numbers[right];
  if (total === target) return [left, right];
  if (total < target) left += 1;
  else right -= 1;
}
return [];`,
      PYTHON: `left = 0
right = len(numbers) - 1
while left < right:
    total = numbers[left] + numbers[right]
    if total == target:
        return [left, right]
    if total < target:
        left += 1
    else:
        right -= 1
return []`,
      JAVA: `int left = 0;
int right = numbers.length - 1;
while (left < right) {
    int total = numbers[left] + numbers[right];
    if (total == target) return new int[] { left, right };
    if (total < target) left += 1;
    else right -= 1;
}
return new int[0];`,
      CPP: `int left = 0;
int right = (int)numbers.size() - 1;
while (left < right) {
    int total = numbers[left] + numbers[right];
    if (total == target) return vector<int>{left, right};
    if (total < target) left += 1;
    else right -= 1;
}
return vector<int>{};`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "three-sum-zero",
    title: "Triplets That Sum to Zero",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Find every distinct group of three values that adds up to zero. Each " +
      "triplet comes back with its values in increasing order, and the list of " +
      "triplets is sorted too, so the same input always gives the same answer. " +
      "Two triplets with the same three values count as one.",
    explanation:
      "Sort first — it costs O(n log n), which is free next to the O(n²) that " +
      "follows, and it makes both halves of the problem easy. Then fix each " +
      "value in turn and solve two-sum on the sorted remainder with the " +
      "two-pointer sweep, looking for the negative of the fixed value. " +
      "Duplicates are the part people lose marks on: skip a fixed value equal to " +
      "the previous one, and after recording a triplet, skip both pointers past " +
      "any repeats. Sorting is also what makes those skips a comparison with a " +
      "neighbour rather than a lookup in a set.",
    constraints: [
      "The list has between 0 and 3,000 numbers.",
      "Each number is between -100,000 and 100,000.",
      "Each triplet is sorted, and the triplets themselves are in ascending order.",
    ],
    hints: [
      "Sort the list before doing anything else.",
      "Fix one value, then run the sorted two-pointer sweep on the rest.",
      "Skip repeated values at all three positions or you will emit duplicates.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "threeSumZero",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int[][]",
    },
    topicSlugs: ["dsa-two-pointers", "dsa-sorting"],
    examples: [
      {
        input: "numbers = [-1, 0, 1, 2, -1, -4]",
        output: "[[-1, -1, 2], [-1, 0, 1]]",
        explanation:
          "Both triplets total zero; the repeated -1 gives only one of each.",
      },
      { input: "numbers = [0, 1, 1]", output: "[]" },
    ],
    tests: [
      {
        args: [[-1, 0, 1, 2, -1, -4]],
        expected: [
          [-1, -1, 2],
          [-1, 0, 1],
        ],
      },
      { args: [[0, 1, 1]], expected: [] },
      { args: [[0, 0, 0]], expected: [[0, 0, 0]] },
      {
        args: [[-2, 0, 1, 1, 2]],
        expected: [
          [-2, 0, 2],
          [-2, 1, 1],
        ],
        hidden: true,
      },
      { args: [[1, 2, -2, -1]], expected: [], hidden: true },
      { args: [[]], expected: [], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const sorted = numbers.slice().sort((a, b) => a - b);
const result = [];
for (let i = 0; i < sorted.length - 2; i += 1) {
  if (i > 0 && sorted[i] === sorted[i - 1]) continue;
  let left = i + 1;
  let right = sorted.length - 1;
  while (left < right) {
    const total = sorted[i] + sorted[left] + sorted[right];
    if (total < 0) {
      left += 1;
    } else if (total > 0) {
      right -= 1;
    } else {
      result.push([sorted[i], sorted[left], sorted[right]]);
      left += 1;
      right -= 1;
      while (left < right && sorted[left] === sorted[left - 1]) left += 1;
      while (left < right && sorted[right] === sorted[right + 1]) right -= 1;
    }
  }
}
return result;`,
      TYPESCRIPT: `const sorted = numbers.slice().sort((a, b) => a - b);
const result: number[][] = [];
for (let i = 0; i < sorted.length - 2; i += 1) {
  if (i > 0 && sorted[i] === sorted[i - 1]) continue;
  let left = i + 1;
  let right = sorted.length - 1;
  while (left < right) {
    const total = sorted[i] + sorted[left] + sorted[right];
    if (total < 0) {
      left += 1;
    } else if (total > 0) {
      right -= 1;
    } else {
      result.push([sorted[i], sorted[left], sorted[right]]);
      left += 1;
      right -= 1;
      while (left < right && sorted[left] === sorted[left - 1]) left += 1;
      while (left < right && sorted[right] === sorted[right + 1]) right -= 1;
    }
  }
}
return result;`,
      PYTHON: `sorted_numbers = sorted(numbers)
result = []
for i in range(len(sorted_numbers) - 2):
    if i > 0 and sorted_numbers[i] == sorted_numbers[i - 1]:
        continue
    left = i + 1
    right = len(sorted_numbers) - 1
    while left < right:
        total = sorted_numbers[i] + sorted_numbers[left] + sorted_numbers[right]
        if total < 0:
            left += 1
        elif total > 0:
            right -= 1
        else:
            result.append([sorted_numbers[i], sorted_numbers[left], sorted_numbers[right]])
            left += 1
            right -= 1
            while left < right and sorted_numbers[left] == sorted_numbers[left - 1]:
                left += 1
            while left < right and sorted_numbers[right] == sorted_numbers[right + 1]:
                right -= 1
return result`,
      JAVA: `int[] sorted = Arrays.copyOf(numbers, numbers.length);
Arrays.sort(sorted);
List<int[]> found = new ArrayList<>();
for (int i = 0; i + 2 < sorted.length; i += 1) {
    if (i > 0 && sorted[i] == sorted[i - 1]) continue;
    int left = i + 1;
    int right = sorted.length - 1;
    while (left < right) {
        int total = sorted[i] + sorted[left] + sorted[right];
        if (total < 0) {
            left += 1;
        } else if (total > 0) {
            right -= 1;
        } else {
            found.add(new int[] { sorted[i], sorted[left], sorted[right] });
            left += 1;
            right -= 1;
            while (left < right && sorted[left] == sorted[left - 1]) left += 1;
            while (left < right && sorted[right] == sorted[right + 1]) right -= 1;
        }
    }
}
return found.toArray(new int[0][]);`,
      CPP: `vector<int> sorted = numbers;
sort(sorted.begin(), sorted.end());
vector<vector<int>> result;
for (int i = 0; i + 2 < (int)sorted.size(); i += 1) {
    if (i > 0 && sorted[i] == sorted[i - 1]) continue;
    int left = i + 1;
    int right = (int)sorted.size() - 1;
    while (left < right) {
        int total = sorted[i] + sorted[left] + sorted[right];
        if (total < 0) {
            left += 1;
        } else if (total > 0) {
            right -= 1;
        } else {
            result.push_back({sorted[i], sorted[left], sorted[right]});
            left += 1;
            right -= 1;
            while (left < right && sorted[left] == sorted[left - 1]) left += 1;
            while (left < right && sorted[right] == sorted[right + 1]) right -= 1;
        }
    }
}
return result;`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "three-sum-closest",
    title: "Closest Triplet Sum",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Find the three values whose total comes closest to the target, and " +
      "return that total. Exactly one total is closest. The list has at least " +
      "three numbers.",
    explanation:
      "Same skeleton as three-sum: sort, fix one value, sweep the rest with two " +
      "pointers. The difference is what you do with a total that misses. Instead " +
      "of discarding it, compare how far it is from the target with the best " +
      "distance seen so far, then move the pointer that pushes the total in the " +
      "right direction — left when the total is too small, right when it is too " +
      "big. An exact hit can be returned immediately, because nothing beats zero " +
      "distance.",
    constraints: [
      "The list has between 3 and 1,000 numbers.",
      "Each number is between -10,000 and 10,000.",
      "Exactly one total is closest to the target.",
    ],
    hints: [
      "Sort, fix one value, sweep the rest with two pointers.",
      "Track the best distance seen, not just the best total.",
      "An exact match cannot be beaten — return it.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "closestTripletSum",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "target", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-two-pointers", "dsa-sorting"],
    examples: [
      {
        input: "numbers = [-1, 2, 1, -4], target = 1",
        output: "2",
        explanation: "-1 + 2 + 1 is 2, which is one away from the target.",
      },
      { input: "numbers = [0, 0, 0], target = 1", output: "0" },
    ],
    tests: [
      { args: [[-1, 2, 1, -4], 1], expected: 2 },
      { args: [[0, 0, 0], 1], expected: 0 },
      { args: [[1, 2, 4, 8, 16, 32, 64, 128], 82], expected: 82 },
      { args: [[1, 1, 1, 0], -100], expected: 2, hidden: true },
      { args: [[-1, 0, 1, 1], 100], expected: 2, hidden: true },
      { args: [[5, 5, 5], 20], expected: 15, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const sorted = numbers.slice().sort((a, b) => a - b);
let best = sorted[0] + sorted[1] + sorted[2];
for (let i = 0; i < sorted.length - 2; i += 1) {
  let left = i + 1;
  let right = sorted.length - 1;
  while (left < right) {
    const total = sorted[i] + sorted[left] + sorted[right];
    if (Math.abs(total - target) < Math.abs(best - target)) best = total;
    if (total === target) return total;
    if (total < target) left += 1;
    else right -= 1;
  }
}
return best;`,
      TYPESCRIPT: `const sorted = numbers.slice().sort((a, b) => a - b);
let best = sorted[0] + sorted[1] + sorted[2];
for (let i = 0; i < sorted.length - 2; i += 1) {
  let left = i + 1;
  let right = sorted.length - 1;
  while (left < right) {
    const total = sorted[i] + sorted[left] + sorted[right];
    if (Math.abs(total - target) < Math.abs(best - target)) best = total;
    if (total === target) return total;
    if (total < target) left += 1;
    else right -= 1;
  }
}
return best;`,
      PYTHON: `sorted_numbers = sorted(numbers)
best = sorted_numbers[0] + sorted_numbers[1] + sorted_numbers[2]
for i in range(len(sorted_numbers) - 2):
    left = i + 1
    right = len(sorted_numbers) - 1
    while left < right:
        total = sorted_numbers[i] + sorted_numbers[left] + sorted_numbers[right]
        if abs(total - target) < abs(best - target):
            best = total
        if total == target:
            return total
        if total < target:
            left += 1
        else:
            right -= 1
return best`,
      JAVA: `int[] sorted = Arrays.copyOf(numbers, numbers.length);
Arrays.sort(sorted);
int best = sorted[0] + sorted[1] + sorted[2];
for (int i = 0; i + 2 < sorted.length; i += 1) {
    int left = i + 1;
    int right = sorted.length - 1;
    while (left < right) {
        int total = sorted[i] + sorted[left] + sorted[right];
        if (Math.abs(total - target) < Math.abs(best - target)) best = total;
        if (total == target) return total;
        if (total < target) left += 1;
        else right -= 1;
    }
}
return best;`,
      CPP: `vector<int> sorted = numbers;
sort(sorted.begin(), sorted.end());
int best = sorted[0] + sorted[1] + sorted[2];
for (int i = 0; i + 2 < (int)sorted.size(); i += 1) {
    int left = i + 1;
    int right = (int)sorted.size() - 1;
    while (left < right) {
        int total = sorted[i] + sorted[left] + sorted[right];
        if (abs(total - target) < abs(best - target)) best = total;
        if (total == target) return total;
        if (total < target) left += 1;
        else right -= 1;
    }
}
return best;`,
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "most-water-container",
    title: "The Container That Holds the Most",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Each number is the height of a vertical line standing on a flat base, " +
      "one unit apart. Pick two lines so that the container they form with the " +
      "base holds as much water as possible, and return that amount. Water is " +
      "limited by the shorter of the two lines.",
    explanation:
      "Every pair is O(n²). Start instead with the widest possible container — " +
      "the two outermost lines — and move inwards. Moving either pointer costs " +
      "you width, so it is only worth doing if the height can improve, and the " +
      "height is capped by the shorter line. That means moving the taller line " +
      "can never help: the shorter one still caps it and the width has shrunk. " +
      "So always move the shorter line, and every step either finds a better " +
      "container or safely discards one that could not have been better.",
    constraints: [
      "There are between 2 and 100,000 lines.",
      "Each height is between 0 and 100,000.",
      "The lines are one unit apart.",
    ],
    hints: [
      "Start as wide as possible.",
      "Water is capped by the shorter line, so moving the taller one cannot help.",
      "Move the shorter line inwards each step.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "mostWaterContainer",
      params: [{ name: "heights", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-two-pointers", "dsa-greedy"],
    examples: [
      {
        input: "heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]",
        output: "49",
        explanation: "The lines of height 8 and 7 are seven units apart.",
      },
      { input: "heights = [1, 1]", output: "1" },
    ],
    tests: [
      { args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
      { args: [[1, 1]], expected: 1 },
      { args: [[4, 3, 2, 1, 4]], expected: 16 },
      { args: [[1, 2, 1]], expected: 2, hidden: true },
      { args: [[2, 3, 4, 5, 18, 17, 6]], expected: 17, hidden: true },
      { args: [[0, 2]], expected: 0, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let left = 0;
let right = heights.length - 1;
let best = 0;
while (left < right) {
  const height = Math.min(heights[left], heights[right]);
  const held = height * (right - left);
  if (held > best) best = held;
  if (heights[left] < heights[right]) left += 1;
  else right -= 1;
}
return best;`,
      TYPESCRIPT: `let left = 0;
let right = heights.length - 1;
let best = 0;
while (left < right) {
  const height = Math.min(heights[left], heights[right]);
  const held = height * (right - left);
  if (held > best) best = held;
  if (heights[left] < heights[right]) left += 1;
  else right -= 1;
}
return best;`,
      PYTHON: `left = 0
right = len(heights) - 1
best = 0
while left < right:
    height = min(heights[left], heights[right])
    held = height * (right - left)
    if held > best:
        best = held
    if heights[left] < heights[right]:
        left += 1
    else:
        right -= 1
return best`,
      JAVA: `int left = 0;
int right = heights.length - 1;
int best = 0;
while (left < right) {
    int height = Math.min(heights[left], heights[right]);
    int held = height * (right - left);
    if (held > best) best = held;
    if (heights[left] < heights[right]) left += 1;
    else right -= 1;
}
return best;`,
      CPP: `int left = 0;
int right = (int)heights.size() - 1;
int best = 0;
while (left < right) {
    int height = min(heights[left], heights[right]);
    int held = height * (right - left);
    if (held > best) best = held;
    if (heights[left] < heights[right]) left += 1;
    else right -= 1;
}
return best;`,
    },
  },

  // ── 9 ───────────────────────────────────────────────────────────────────
  {
    slug: "sort-three-colours",
    title: "Sort Three Values in One Pass",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "The list contains only the values 0, 1 and 2. Sort it so that all the " +
      "0s come first, then the 1s, then the 2s. Do it in a single pass rather " +
      "than by counting first and rewriting afterwards.",
    explanation:
      "Counting how many of each value there are and rewriting the list is two " +
      "passes and is a perfectly good answer. The one-pass version is the Dutch " +
      "national flag partition: three pointers, one marking the end of the 0s, " +
      "one marking the start of the 2s, and one scanning. A 0 is swapped down to " +
      "the low boundary, a 2 is swapped up to the high boundary, and a 1 is left " +
      "alone. The subtle rule is that after swapping a 2 into place you must not " +
      "advance the scanner — the value you just received has not been looked at " +
      "yet.",
    constraints: [
      "The list has between 1 and 100,000 values.",
      "Every value is 0, 1 or 2.",
      "One pass, constant extra memory.",
    ],
    hints: [
      "Three regions: settled 0s, the part being scanned, settled 2s.",
      "Swap 0s to the front boundary and 2s to the back boundary.",
      "After swapping in a value from the back, do not advance the scanner.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "sortThreeColours",
      params: [{ name: "colours", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-two-pointers", "dsa-sorting"],
    examples: [
      { input: "colours = [2, 0, 2, 1, 1, 0]", output: "[0, 0, 1, 1, 2, 2]" },
      { input: "colours = [2, 0, 1]", output: "[0, 1, 2]" },
    ],
    tests: [
      { args: [[2, 0, 2, 1, 1, 0]], expected: [0, 0, 1, 1, 2, 2] },
      { args: [[2, 0, 1]], expected: [0, 1, 2] },
      { args: [[0]], expected: [0] },
      { args: [[1, 1]], expected: [1, 1], hidden: true },
      { args: [[2, 2, 0, 0]], expected: [0, 0, 2, 2], hidden: true },
      { args: [[1, 0, 2, 1, 0]], expected: [0, 0, 1, 1, 2], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const result = colours.slice();
let low = 0;
let at = 0;
let high = result.length - 1;
while (at <= high) {
  if (result[at] === 0) {
    const held = result[low];
    result[low] = result[at];
    result[at] = held;
    low += 1;
    at += 1;
  } else if (result[at] === 2) {
    const held = result[high];
    result[high] = result[at];
    result[at] = held;
    high -= 1;
  } else {
    at += 1;
  }
}
return result;`,
      TYPESCRIPT: `const result: number[] = colours.slice();
let low = 0;
let at = 0;
let high = result.length - 1;
while (at <= high) {
  if (result[at] === 0) {
    const held = result[low];
    result[low] = result[at];
    result[at] = held;
    low += 1;
    at += 1;
  } else if (result[at] === 2) {
    const held = result[high];
    result[high] = result[at];
    result[at] = held;
    high -= 1;
  } else {
    at += 1;
  }
}
return result;`,
      PYTHON: `result = list(colours)
low = 0
at = 0
high = len(result) - 1
while at <= high:
    if result[at] == 0:
        result[low], result[at] = result[at], result[low]
        low += 1
        at += 1
    elif result[at] == 2:
        result[high], result[at] = result[at], result[high]
        high -= 1
    else:
        at += 1
return result`,
      JAVA: `int[] result = Arrays.copyOf(colours, colours.length);
int low = 0;
int at = 0;
int high = result.length - 1;
while (at <= high) {
    if (result[at] == 0) {
        int held = result[low];
        result[low] = result[at];
        result[at] = held;
        low += 1;
        at += 1;
    } else if (result[at] == 2) {
        int held = result[high];
        result[high] = result[at];
        result[at] = held;
        high -= 1;
    } else {
        at += 1;
    }
}
return result;`,
      CPP: `vector<int> result = colours;
int low = 0;
int at = 0;
int high = (int)result.size() - 1;
while (at <= high) {
    if (result[at] == 0) {
        swap(result[low], result[at]);
        low += 1;
        at += 1;
    } else if (result[at] == 2) {
        swap(result[high], result[at]);
        high -= 1;
    } else {
        at += 1;
    }
}
return result;`,
    },
  },

  // ── 10 ──────────────────────────────────────────────────────────────────
  {
    slug: "palindrome-after-one-removal",
    title: "Almost a Palindrome",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Decide whether the text can be made into a palindrome by deleting at " +
      "most one character. Text that is already a palindrome counts, since " +
      "deleting nothing is allowed.",
    explanation:
      "Walk inwards from both ends as usual. Everything matches until, at some " +
      "point, it does not — and at that moment there are exactly two " +
      "possibilities left: delete the left character, or delete the right one. " +
      "So check whether either of the two remaining spans is a plain palindrome " +
      "and return true if either is. That is why the answer is still linear: the " +
      "expensive-looking branch happens at most once, because after using your " +
      "single deletion there is nothing left to spend.",
    constraints: [
      "The text is between 1 and 100,000 characters.",
      "It contains lowercase English letters only.",
      "At most one character may be removed.",
    ],
    hints: [
      "Walk in from both ends until something does not match.",
      "At the first mismatch there are only two things you can delete.",
      "Check both remaining spans with an ordinary palindrome test.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "isAlmostPalindrome",
      params: [{ name: "text", type: "string" }],
      returns: "bool",
    },
    topicSlugs: ["dsa-two-pointers", "dsa-strings"],
    examples: [
      {
        input: 'text = "abca"',
        output: "true",
        explanation: "Deleting either b or c leaves a palindrome.",
      },
      { input: 'text = "abc"', output: "false" },
    ],
    tests: [
      { args: ["aba"], expected: true },
      { args: ["abca"], expected: true },
      { args: ["abc"], expected: false },
      { args: ["deeee"], expected: true, hidden: true },
      { args: ["abcdefdba"], expected: false, hidden: true },
      { args: ["a"], expected: true, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const isPalindrome = (from, to) => {
  while (from < to) {
    if (text[from] !== text[to]) return false;
    from += 1;
    to -= 1;
  }
  return true;
};
let left = 0;
let right = text.length - 1;
while (left < right) {
  if (text[left] !== text[right]) {
    return isPalindrome(left + 1, right) || isPalindrome(left, right - 1);
  }
  left += 1;
  right -= 1;
}
return true;`,
      TYPESCRIPT: `const isPalindrome = (from: number, to: number): boolean => {
  while (from < to) {
    if (text[from] !== text[to]) return false;
    from += 1;
    to -= 1;
  }
  return true;
};
let left = 0;
let right = text.length - 1;
while (left < right) {
  if (text[left] !== text[right]) {
    return isPalindrome(left + 1, right) || isPalindrome(left, right - 1);
  }
  left += 1;
  right -= 1;
}
return true;`,
      PYTHON: `def is_palindrome(from_index: int, to_index: int) -> bool:
    while from_index < to_index:
        if text[from_index] != text[to_index]:
            return False
        from_index += 1
        to_index -= 1
    return True

left = 0
right = len(text) - 1
while left < right:
    if text[left] != text[right]:
        return is_palindrome(left + 1, right) or is_palindrome(left, right - 1)
    left += 1
    right -= 1
return True`,
      JAVA: `int left = 0;
int right = text.length() - 1;
while (left < right) {
    if (text.charAt(left) == text.charAt(right)) {
        left += 1;
        right -= 1;
        continue;
    }
    // The single deletion is spent here: check both remaining spans.
    for (int[] span : new int[][] { { left + 1, right }, { left, right - 1 } }) {
        int from = span[0];
        int to = span[1];
        boolean same = true;
        while (from < to) {
            if (text.charAt(from) != text.charAt(to)) {
                same = false;
                break;
            }
            from += 1;
            to -= 1;
        }
        if (same) return true;
    }
    return false;
}
return true;`,
      CPP: `auto isPalindrome = [&](int from, int to) {
    while (from < to) {
        if (text[from] != text[to]) return false;
        from += 1;
        to -= 1;
    }
    return true;
};
int left = 0;
int right = (int)text.size() - 1;
while (left < right) {
    if (text[left] != text[right]) {
        return isPalindrome(left + 1, right) || isPalindrome(left, right - 1);
    }
    left += 1;
    right -= 1;
}
return true;`,
    },
  },

  // ── 11 ──────────────────────────────────────────────────────────────────
  {
    slug: "backspace-compare",
    title: "Compare With Backspaces",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Two strings were typed on a keyboard where # means backspace. Decide " +
      "whether they end up showing the same text. A backspace on empty text " +
      "does nothing.",
    explanation:
      "Building both final strings with a stack is easy and correct, and it is " +
      "the answer to give first. The follow-up asks for constant extra memory, " +
      "and that changes the direction of travel: read both strings from the " +
      "*end*, because a backspace only affects characters before it, which means " +
      "reading backwards lets you skip deleted characters as you meet them. " +
      "Count the pending backspaces, skip that many characters, then compare the " +
      "two surviving characters and carry on.",
    constraints: [
      "Both strings are between 0 and 200 characters.",
      "They contain lowercase letters and the # character.",
      "A backspace with nothing to delete has no effect.",
    ],
    hints: [
      "The stack version is fine — write it first.",
      "For constant memory, read both strings from the end.",
      "Count pending backspaces and skip that many characters.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "backspaceCompare",
      params: [
        { name: "first", type: "string" },
        { name: "second", type: "string" },
      ],
      returns: "bool",
    },
    topicSlugs: ["dsa-two-pointers", "dsa-stack", "dsa-strings"],
    examples: [
      {
        input: 'first = "ab#c", second = "ad#c"',
        output: "true",
        explanation: 'Both end up as "ac".',
      },
      { input: 'first = "a#c", second = "b"', output: "false" },
    ],
    tests: [
      { args: ["ab#c", "ad#c"], expected: true },
      { args: ["ab##", "c#d#"], expected: true },
      { args: ["a#c", "b"], expected: false },
      { args: ["###", ""], expected: true, hidden: true },
      { args: ["a##c", "#a#c"], expected: true, hidden: true },
      { args: ["bxj##tw", "bxo#j##tw"], expected: true, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const typed = (text) => {
  const out = [];
  for (const character of text) {
    if (character === "#") out.pop();
    else out.push(character);
  }
  return out.join("");
};
return typed(first) === typed(second);`,
      TYPESCRIPT: `const typed = (text: string): string => {
  const out: string[] = [];
  for (const character of text) {
    if (character === "#") out.pop();
    else out.push(character);
  }
  return out.join("");
};
return typed(first) === typed(second);`,
      PYTHON: `def typed(text: str) -> str:
    out = []
    for character in text:
        if character == "#":
            if out:
                out.pop()
        else:
            out.append(character)
    return "".join(out)

return typed(first) == typed(second)`,
      JAVA: `String[] inputs = { first, second };
String[] finished = new String[2];
for (int which = 0; which < 2; which += 1) {
    StringBuilder out = new StringBuilder();
    String text = inputs[which];
    for (int i = 0; i < text.length(); i += 1) {
        char character = text.charAt(i);
        if (character == '#') {
            if (out.length() > 0) out.deleteCharAt(out.length() - 1);
        } else {
            out.append(character);
        }
    }
    finished[which] = out.toString();
}
return finished[0].equals(finished[1]);`,
      CPP: `auto typed = [](const string& text) {
    string out;
    for (char character : text) {
        if (character == '#') {
            if (!out.empty()) out.pop_back();
        } else {
            out += character;
        }
    }
    return out;
};
return typed(first) == typed(second);`,
    },
  },

  // ── 12 ──────────────────────────────────────────────────────────────────
  {
    slug: "trapping-rain-water",
    title: "Trapping Rain Water",
    difficulty: "HARD",
    interviewFrequency: "VERY_HIGH",
    description:
      "Each number is the height of a bar, one unit wide, standing side by " +
      "side. After rain, water settles in the dips between taller bars. Return " +
      "how many units of water are trapped in total.",
    explanation:
      "Think about one column at a time rather than about pools. The water " +
      "above column i is decided by the tallest bar to its left and the tallest " +
      "bar to its right: the shorter of those two, minus the bar itself, or zero " +
      "if that is negative. Precomputing both running maxima gives an O(n) " +
      "solution with two extra arrays. The two-pointer version removes those " +
      "arrays: walk in from both ends, keep the best height seen from each side, " +
      "and always process the side whose running maximum is smaller — because " +
      "that side's answer is already decided, whatever the other side turns out " +
      "to hold.",
    constraints: [
      "There is between 0 and 100,000 bars.",
      "Each height is between 0 and 100,000.",
      "Water outside the outermost bars runs away.",
    ],
    hints: [
      "Ask how much water sits above one column, not where the pools are.",
      "That answer is min(tallest to the left, tallest to the right) minus the bar.",
      "Two pointers with a running maximum on each side removes the extra arrays.",
    ],
    estimatedTime: "40 min",
    signature: {
      name: "trapRainWater",
      params: [{ name: "heights", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-two-pointers", "dsa-monotonic-stack"],
    examples: [
      {
        input: "heights = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]",
        output: "6",
        explanation: "Six unit squares of water sit in the dips.",
      },
      { input: "heights = [4, 2, 0, 3, 2, 5]", output: "9" },
    ],
    tests: [
      { args: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expected: 6 },
      { args: [[4, 2, 0, 3, 2, 5]], expected: 9 },
      { args: [[1, 2]], expected: 0 },
      { args: [[]], expected: 0, hidden: true },
      { args: [[3, 0, 3]], expected: 3, hidden: true },
      { args: [[5]], expected: 0, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let left = 0;
let right = heights.length - 1;
let bestLeft = 0;
let bestRight = 0;
let held = 0;
while (left < right) {
  if (heights[left] < heights[right]) {
    bestLeft = Math.max(bestLeft, heights[left]);
    held += bestLeft - heights[left];
    left += 1;
  } else {
    bestRight = Math.max(bestRight, heights[right]);
    held += bestRight - heights[right];
    right -= 1;
  }
}
return held;`,
      TYPESCRIPT: `let left = 0;
let right = heights.length - 1;
let bestLeft = 0;
let bestRight = 0;
let held = 0;
while (left < right) {
  if (heights[left] < heights[right]) {
    bestLeft = Math.max(bestLeft, heights[left]);
    held += bestLeft - heights[left];
    left += 1;
  } else {
    bestRight = Math.max(bestRight, heights[right]);
    held += bestRight - heights[right];
    right -= 1;
  }
}
return held;`,
      PYTHON: `left = 0
right = len(heights) - 1
best_left = 0
best_right = 0
held = 0
while left < right:
    if heights[left] < heights[right]:
        best_left = max(best_left, heights[left])
        held += best_left - heights[left]
        left += 1
    else:
        best_right = max(best_right, heights[right])
        held += best_right - heights[right]
        right -= 1
return held`,
      JAVA: `int left = 0;
int right = heights.length - 1;
int bestLeft = 0;
int bestRight = 0;
int held = 0;
while (left < right) {
    if (heights[left] < heights[right]) {
        bestLeft = Math.max(bestLeft, heights[left]);
        held += bestLeft - heights[left];
        left += 1;
    } else {
        bestRight = Math.max(bestRight, heights[right]);
        held += bestRight - heights[right];
        right -= 1;
    }
}
return held;`,
      CPP: `int left = 0;
int right = (int)heights.size() - 1;
int bestLeft = 0;
int bestRight = 0;
int held = 0;
while (left < right) {
    if (heights[left] < heights[right]) {
        bestLeft = max(bestLeft, heights[left]);
        held += bestLeft - heights[left];
        left += 1;
    } else {
        bestRight = max(bestRight, heights[right]);
        held += bestRight - heights[right];
        right -= 1;
    }
}
return held;`,
    },
  },
];
