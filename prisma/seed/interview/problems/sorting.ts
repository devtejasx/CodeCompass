import type { SeedProblem } from "../../problems/types";

/**
 * Sorting, as a step rather than a goal.
 *
 * Almost nothing here is "sort this list". The problems are about choosing the
 * key: sort by a property, sort by a count, sort by a comparison rule that is
 * not the natural one, or notice that a full sort is more than the question
 * needs. Writing merge sort by hand sits in the middle of the file because
 * knowing what your language's sort actually does — and what it costs — is part
 * of the same skill.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const SORTING_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "sort-by-parity",
    title: "Evens Before Odds",
    difficulty: "EASY",
    interviewFrequency: "MEDIUM",
    description:
      "Rearrange the list so every even number comes before every odd number. " +
      "Within each group the original order is kept, so [3, 1, 2, 4] becomes " +
      "[2, 4, 3, 1].",
    explanation:
      "Two passes and one output list: collect the evens, then collect the " +
      "odds. That is O(n), keeps the original order inside each group, and " +
      "needs no comparison function at all — which is the point, because " +
      "'sort by a boolean property' is not really sorting. The in-place " +
      "version uses two pointers from opposite ends and is faster on memory, " +
      "but it does not preserve order within the groups, so it answers a " +
      "slightly different question.",
    constraints: [
      "The list has between 1 and 100,000 numbers.",
      "Each number is between 0 and 1,000,000.",
      "Relative order within evens and within odds is preserved.",
    ],
    hints: [
      "Two passes over the list is enough.",
      "No comparison function is needed — this is partitioning, not sorting.",
    ],
    estimatedTime: "10 min",
    signature: {
      name: "sortByParity",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-sorting", "js-arrays", "data-structures"],
    examples: [
      { input: "numbers = [3, 1, 2, 4]", output: "[2, 4, 3, 1]" },
      { input: "numbers = [0]", output: "[0]" },
    ],
    tests: [
      { args: [[3, 1, 2, 4]], expected: [2, 4, 3, 1] },
      { args: [[0]], expected: [0] },
      { args: [[1, 2, 3, 4]], expected: [2, 4, 1, 3] },
      { args: [[1, 3]], expected: [1, 3], hidden: true },
      { args: [[2, 4]], expected: [2, 4], hidden: true },
      { args: [[5, 2, 7, 4, 1]], expected: [2, 4, 5, 7, 1], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const result = [];
for (const value of numbers) if (value % 2 === 0) result.push(value);
for (const value of numbers) if (value % 2 !== 0) result.push(value);
return result;`,
      TYPESCRIPT: `const result: number[] = [];
for (const value of numbers) if (value % 2 === 0) result.push(value);
for (const value of numbers) if (value % 2 !== 0) result.push(value);
return result;`,
      PYTHON: `result = [value for value in numbers if value % 2 == 0]
result.extend(value for value in numbers if value % 2 != 0)
return result`,
      JAVA: `int[] result = new int[numbers.length];
int at = 0;
for (int value : numbers) if (value % 2 == 0) result[at++] = value;
for (int value : numbers) if (value % 2 != 0) result[at++] = value;
return result;`,
      CPP: `vector<int> result;
for (int value : numbers) if (value % 2 == 0) result.push_back(value);
for (int value : numbers) if (value % 2 != 0) result.push_back(value);
return result;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "height-order-mistakes",
    title: "How Many Are Out of Order?",
    difficulty: "EASY",
    interviewFrequency: "MEDIUM",
    description:
      "A line of students should be standing in non-decreasing order of " +
      "height. Count how many are standing in a position where their height " +
      "does not match the height that should be there.",
    explanation:
      "Sort a copy, then compare position by position and count the " +
      "disagreements. The subtlety is that you are comparing *heights*, not " +
      "people: two students of the same height standing in each other's places " +
      "produce no mistakes, because the line still looks correct. Since the " +
      "heights are small and bounded, a counting sort makes this O(n) rather " +
      "than O(n log n) — the classic case for sorting without comparisons.",
    constraints: [
      "There are between 1 and 100,000 students.",
      "Each height is between 1 and 100.",
      "Compare heights, not identities.",
    ],
    hints: [
      "Sort a copy and compare the two lists position by position.",
      "Equal heights swapping places is not a mistake.",
      "Bounded heights mean counting sort is available.",
    ],
    estimatedTime: "10 min",
    signature: {
      name: "countHeightMistakes",
      params: [{ name: "heights", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-sorting", "js-arrays"],
    examples: [
      {
        input: "heights = [1, 1, 4, 2, 1, 3]",
        output: "3",
        explanation: "Sorted it is [1, 1, 1, 2, 3, 4]; three positions differ.",
      },
      { input: "heights = [1, 2, 3, 4, 5]", output: "0" },
    ],
    tests: [
      { args: [[1, 1, 4, 2, 1, 3]], expected: 3 },
      { args: [[5, 1, 2, 3, 4]], expected: 5 },
      { args: [[1, 2, 3, 4, 5]], expected: 0 },
      { args: [[1]], expected: 0, hidden: true },
      { args: [[2, 1]], expected: 2, hidden: true },
      { args: [[3, 3, 3]], expected: 0, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const expected = heights.slice().sort((a, b) => a - b);
let mistakes = 0;
for (let i = 0; i < heights.length; i += 1) {
  if (heights[i] !== expected[i]) mistakes += 1;
}
return mistakes;`,
      TYPESCRIPT: `const expected = heights.slice().sort((a, b) => a - b);
let mistakes = 0;
for (let i = 0; i < heights.length; i += 1) {
  if (heights[i] !== expected[i]) mistakes += 1;
}
return mistakes;`,
      PYTHON: `expected = sorted(heights)
return sum(1 for i, height in enumerate(heights) if height != expected[i])`,
      JAVA: `int[] expected = Arrays.copyOf(heights, heights.length);
Arrays.sort(expected);
int mistakes = 0;
for (int i = 0; i < heights.length; i += 1) {
    if (heights[i] != expected[i]) mistakes += 1;
}
return mistakes;`,
      CPP: `vector<int> expected = heights;
sort(expected.begin(), expected.end());
int mistakes = 0;
for (int i = 0; i < (int)heights.size(); i += 1) {
    if (heights[i] != expected[i]) mistakes += 1;
}
return mistakes;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "merge-sort-by-hand",
    title: "Write Merge Sort",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Sort the list into increasing order without calling your language's " +
      "sort function. Implement merge sort: split the list in half, sort each " +
      "half, and merge the two sorted halves back together.",
    explanation:
      "Merge sort is the clearest example of divide and conquer, and writing it " +
      "once makes the O(n log n) real rather than memorised: log n levels of " +
      "splitting, each level doing O(n) work merging. The base case is a list of " +
      "one element, which is already sorted. The merge step is the two-pointer " +
      "walk from earlier in the curriculum. Merge sort is also stable — equal " +
      "values keep their original order, provided the merge takes from the left " +
      "half when the two fronts are equal, which is the one line where stability " +
      "is won or lost.",
    constraints: [
      "The list has between 0 and 100,000 numbers.",
      "Each number is between -1,000,000 and 1,000,000.",
      "Do not call the built-in sort.",
    ],
    hints: [
      "A list of one element is already sorted — that is the base case.",
      "Sort each half, then merge with the two-pointer walk.",
      "Take from the left half on ties to keep the sort stable.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "mergeSortNumbers",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-sorting", "dsa-recursion", "data-structures"],
    examples: [
      { input: "numbers = [5, 2, 3, 1]", output: "[1, 2, 3, 5]" },
      { input: "numbers = [5, 1, 1, 2, 0, 0]", output: "[0, 0, 1, 1, 2, 5]" },
    ],
    tests: [
      { args: [[5, 2, 3, 1]], expected: [1, 2, 3, 5] },
      { args: [[5, 1, 1, 2, 0, 0]], expected: [0, 0, 1, 1, 2, 5] },
      { args: [[]], expected: [] },
      { args: [[1]], expected: [1], hidden: true },
      { args: [[-1, -3]], expected: [-3, -1], hidden: true },
      { args: [[2, 2]], expected: [2, 2], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const sort = (values) => {
  if (values.length <= 1) return values;
  const middle = Math.floor(values.length / 2);
  const left = sort(values.slice(0, middle));
  const right = sort(values.slice(middle));
  const merged = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      merged.push(left[i]);
      i += 1;
    } else {
      merged.push(right[j]);
      j += 1;
    }
  }
  while (i < left.length) merged.push(left[i++]);
  while (j < right.length) merged.push(right[j++]);
  return merged;
};
return sort(numbers.slice());`,
      TYPESCRIPT: `const sort = (values: number[]): number[] => {
  if (values.length <= 1) return values;
  const middle = Math.floor(values.length / 2);
  const left = sort(values.slice(0, middle));
  const right = sort(values.slice(middle));
  const merged: number[] = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      merged.push(left[i]);
      i += 1;
    } else {
      merged.push(right[j]);
      j += 1;
    }
  }
  while (i < left.length) merged.push(left[i++]);
  while (j < right.length) merged.push(right[j++]);
  return merged;
};
return sort(numbers.slice());`,
      PYTHON: `def sort(values: list[int]) -> list[int]:
    if len(values) <= 1:
        return values
    middle = len(values) // 2
    left = sort(values[:middle])
    right = sort(values[middle:])
    merged = []
    i = 0
    j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged

return sort(list(numbers))`,
      JAVA: `int n = numbers.length;
int[] current = Arrays.copyOf(numbers, n);
int[] buffer = new int[n];
for (int width = 1; width < n; width *= 2) {
    for (int start = 0; start < n; start += 2 * width) {
        int middle = Math.min(start + width, n);
        int end = Math.min(start + 2 * width, n);
        int i = start;
        int j = middle;
        int at = start;
        while (i < middle && j < end) {
            if (current[i] <= current[j]) buffer[at++] = current[i++];
            else buffer[at++] = current[j++];
        }
        while (i < middle) buffer[at++] = current[i++];
        while (j < end) buffer[at++] = current[j++];
    }
    int[] held = current;
    current = buffer;
    buffer = held;
}
return current;`,
      CPP: `int n = (int)numbers.size();
vector<int> current = numbers;
vector<int> buffer(n, 0);
for (int width = 1; width < n; width *= 2) {
    for (int start = 0; start < n; start += 2 * width) {
        int middle = min(start + width, n);
        int end = min(start + 2 * width, n);
        int i = start;
        int j = middle;
        int at = start;
        while (i < middle && j < end) {
            if (current[i] <= current[j]) buffer[at++] = current[i++];
            else buffer[at++] = current[j++];
        }
        while (i < middle) buffer[at++] = current[i++];
        while (j < end) buffer[at++] = current[j++];
    }
    swap(current, buffer);
}
return current;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "h-index",
    title: "The h-Index",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "A researcher's h-index is the largest number h such that at least h of " +
      "their papers have been cited at least h times each. Given the citation " +
      "count of every paper, return the h-index.",
    explanation:
      "Sort the counts from highest to lowest. Walking that list, the paper at " +
      "position i (counting from 1) is the i-th most cited, so if it has at " +
      "least i citations then i papers have at least i citations each — and the " +
      "answer is the largest i for which that holds. Stopping at the first " +
      "failure is safe, because the counts only go down from there. With bounded " +
      "citation counts a counting-sort version reaches O(n), which is the " +
      "follow-up worth mentioning.",
    constraints: [
      "There are between 1 and 5,000 papers.",
      "Each citation count is between 0 and 1,000.",
      "The h-index can be 0.",
    ],
    hints: [
      "Sort the counts from highest to lowest.",
      "At position i (from 1), ask whether that paper has at least i citations.",
      "Stop at the first position where it does not.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "hIndex",
      params: [{ name: "citations", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-sorting", "js-arrays"],
    examples: [
      {
        input: "citations = [3, 0, 6, 1, 5]",
        output: "3",
        explanation: "Three papers have at least three citations each.",
      },
      { input: "citations = [1, 3, 1]", output: "1" },
    ],
    tests: [
      { args: [[3, 0, 6, 1, 5]], expected: 3 },
      { args: [[1, 3, 1]], expected: 1 },
      { args: [[0]], expected: 0 },
      { args: [[100]], expected: 1, hidden: true },
      { args: [[1, 1, 1]], expected: 1, hidden: true },
      { args: [[4, 4, 4, 4]], expected: 4, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const sorted = citations.slice().sort((a, b) => b - a);
let h = 0;
for (let i = 0; i < sorted.length; i += 1) {
  if (sorted[i] >= i + 1) h = i + 1;
  else break;
}
return h;`,
      TYPESCRIPT: `const sorted = citations.slice().sort((a, b) => b - a);
let h = 0;
for (let i = 0; i < sorted.length; i += 1) {
  if (sorted[i] >= i + 1) h = i + 1;
  else break;
}
return h;`,
      PYTHON: `sorted_counts = sorted(citations, reverse=True)
h = 0
for i, count in enumerate(sorted_counts):
    if count >= i + 1:
        h = i + 1
    else:
        break
return h`,
      JAVA: `int[] sorted = Arrays.copyOf(citations, citations.length);
Arrays.sort(sorted);
int h = 0;
for (int i = 0; i < sorted.length; i += 1) {
    int count = sorted[sorted.length - 1 - i];
    if (count >= i + 1) h = i + 1;
    else break;
}
return h;`,
      CPP: `vector<int> sorted = citations;
sort(sorted.begin(), sorted.end(), greater<int>());
int h = 0;
for (int i = 0; i < (int)sorted.size(); i += 1) {
    if (sorted[i] >= i + 1) h = i + 1;
    else break;
}
return h;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "sort-by-frequency",
    title: "Sort by How Often They Appear",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Rearrange the values so the most frequent come first. Values appearing " +
      "the same number of times are ordered from smallest to largest, and each " +
      "value is repeated as many times as it occurred.",
    explanation:
      "Two steps that keep each other honest: count occurrences into a map, " +
      "then sort the distinct values by a two-part key — count descending, value " +
      "ascending — and expand each one back out. The tie-break is what makes the " +
      "answer deterministic, and an interviewer will usually ask for one " +
      "precisely because candidates forget that a sort with an ambiguous key " +
      "produces different output on different runtimes.",
    constraints: [
      "The list has between 1 and 100,000 numbers.",
      "Each number is between -1,000,000 and 1,000,000.",
      "Equal frequencies are ordered by value, smallest first.",
    ],
    hints: [
      "Count first, then sort the distinct values.",
      "The comparison has two parts: count descending, then value ascending.",
      "Expand each value back out to its count.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "sortByFrequency",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-sorting", "dsa-hashing"],
    examples: [
      {
        input: "numbers = [1, 1, 2, 2, 2, 3]",
        output: "[2, 2, 2, 1, 1, 3]",
        explanation: "2 appears three times, 1 twice, 3 once.",
      },
      {
        input: "numbers = [4, 4, 1, 1, 2]",
        output: "[1, 1, 4, 4, 2]",
        explanation: "1 and 4 tie on count, so the smaller value goes first.",
      },
    ],
    tests: [
      { args: [[1, 1, 2, 2, 2, 3]], expected: [2, 2, 2, 1, 1, 3] },
      { args: [[4, 4, 1, 1, 2]], expected: [1, 1, 4, 4, 2] },
      { args: [[2, 3, 5]], expected: [2, 3, 5] },
      { args: [[7]], expected: [7], hidden: true },
      { args: [[3, 3, 1, 1, 2, 2]], expected: [1, 1, 2, 2, 3, 3], hidden: true },
      { args: [[-1, -1, 0]], expected: [-1, -1, 0], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const counts = new Map();
for (const value of numbers) counts.set(value, (counts.get(value) ?? 0) + 1);
const distinct = [...counts.keys()].sort((a, b) => {
  const byCount = counts.get(b) - counts.get(a);
  return byCount !== 0 ? byCount : a - b;
});
const result = [];
for (const value of distinct) {
  for (let i = 0; i < counts.get(value); i += 1) result.push(value);
}
return result;`,
      TYPESCRIPT: `const counts = new Map<number, number>();
for (const value of numbers) counts.set(value, (counts.get(value) ?? 0) + 1);
const distinct = [...counts.keys()].sort((a, b) => {
  const byCount = (counts.get(b) ?? 0) - (counts.get(a) ?? 0);
  return byCount !== 0 ? byCount : a - b;
});
const result: number[] = [];
for (const value of distinct) {
  for (let i = 0; i < (counts.get(value) ?? 0); i += 1) result.push(value);
}
return result;`,
      PYTHON: `counts = {}
for value in numbers:
    counts[value] = counts.get(value, 0) + 1
result = []
for value in sorted(counts, key=lambda v: (-counts[v], v)):
    result.extend([value] * counts[value])
return result`,
      JAVA: `Map<Integer, Integer> counts = new HashMap<>();
for (int value : numbers) counts.put(value, counts.getOrDefault(value, 0) + 1);
List<Integer> distinct = new ArrayList<>(counts.keySet());
distinct.sort((a, b) -> {
    int byCount = counts.get(b) - counts.get(a);
    return byCount != 0 ? byCount : Integer.compare(a, b);
});
int[] result = new int[numbers.length];
int at = 0;
for (int value : distinct) {
    for (int i = 0; i < counts.get(value); i += 1) result[at++] = value;
}
return result;`,
      CPP: `unordered_map<int, int> counts;
for (int value : numbers) counts[value] += 1;
vector<int> distinct;
for (const auto& entry : counts) distinct.push_back(entry.first);
sort(distinct.begin(), distinct.end(), [&](int a, int b) {
    if (counts[a] != counts[b]) return counts[a] > counts[b];
    return a < b;
});
vector<int> result;
for (int value : distinct) {
    for (int i = 0; i < counts[value]; i += 1) result.push_back(value);
}
return result;`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "relative-sort-order",
    title: "Sort by Somebody Else's Order",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Sort the first list so that values which appear in the second list come " +
      "first, in the order the second list gives them. Values not mentioned " +
      "there go afterwards, sorted from smallest to largest. The second list " +
      "has no duplicates and every value in it appears in the first list.",
    explanation:
      "The order list is really a lookup from value to rank, so turn it into " +
      "one: a map from value to its position. Then a single comparison covers " +
      "both groups — ranked values compare by rank, unranked ones compare by " +
      "value, and a ranked value always beats an unranked one. Giving unranked " +
      "values a rank of 'larger than any real rank' collapses those three rules " +
      "into one expression, which is a trick worth keeping for any 'these first, " +
      "then everything else' ordering.",
    constraints: [
      "The first list has between 1 and 1,000 numbers.",
      "The second list has no duplicates and every value in it appears in the first.",
      "Each number is between 0 and 1,000.",
    ],
    hints: [
      "Turn the order list into a map from value to rank.",
      "Give unranked values a rank beyond every real one.",
      "Break ties between unranked values by their value.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "relativeSort",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "order", type: "int[]" },
      ],
      returns: "int[]",
    },
    topicSlugs: ["dsa-sorting", "dsa-hashing"],
    examples: [
      {
        input:
          "numbers = [2, 3, 1, 3, 2, 4, 6, 7, 9, 2, 19], order = [2, 1, 4, 3, 9, 6]",
        output: "[2, 2, 2, 1, 4, 3, 3, 9, 6, 7, 19]",
        explanation: "7 and 19 are unmentioned, so they follow in increasing order.",
      },
      { input: "numbers = [1, 2], order = [2]", output: "[2, 1]" },
    ],
    tests: [
      {
        args: [
          [2, 3, 1, 3, 2, 4, 6, 7, 9, 2, 19],
          [2, 1, 4, 3, 9, 6],
        ],
        expected: [2, 2, 2, 1, 4, 3, 3, 9, 6, 7, 19],
      },
      { args: [[1, 2], [2]], expected: [2, 1] },
      { args: [[1], [1]], expected: [1] },
      {
        args: [
          [28, 6, 22, 8, 44, 17],
          [22, 28, 8, 6],
        ],
        expected: [22, 28, 8, 6, 17, 44],
        hidden: true,
      },
      { args: [[5, 4], []], expected: [4, 5], hidden: true },
      { args: [[3, 1, 2], [3]], expected: [3, 1, 2], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const rank = new Map();
for (let i = 0; i < order.length; i += 1) rank.set(order[i], i);
const beyond = order.length;
return numbers.slice().sort((a, b) => {
  const rankA = rank.has(a) ? rank.get(a) : beyond;
  const rankB = rank.has(b) ? rank.get(b) : beyond;
  return rankA !== rankB ? rankA - rankB : a - b;
});`,
      TYPESCRIPT: `const rank = new Map<number, number>();
for (let i = 0; i < order.length; i += 1) rank.set(order[i], i);
const beyond = order.length;
return numbers.slice().sort((a, b) => {
  const rankA = rank.get(a) ?? beyond;
  const rankB = rank.get(b) ?? beyond;
  return rankA !== rankB ? rankA - rankB : a - b;
});`,
      PYTHON: `rank = {value: i for i, value in enumerate(order)}
beyond = len(order)
return sorted(numbers, key=lambda value: (rank.get(value, beyond), value))`,
      JAVA: `Map<Integer, Integer> rank = new HashMap<>();
for (int i = 0; i < order.length; i += 1) rank.put(order[i], i);
int beyond = order.length;
Integer[] boxed = new Integer[numbers.length];
for (int i = 0; i < numbers.length; i += 1) boxed[i] = numbers[i];
Arrays.sort(boxed, (a, b) -> {
    int rankA = rank.getOrDefault(a, beyond);
    int rankB = rank.getOrDefault(b, beyond);
    return rankA != rankB ? Integer.compare(rankA, rankB) : Integer.compare(a, b);
});
int[] result = new int[boxed.length];
for (int i = 0; i < boxed.length; i += 1) result[i] = boxed[i];
return result;`,
      CPP: `unordered_map<int, int> rank;
for (int i = 0; i < (int)order.size(); i += 1) rank[order[i]] = i;
int beyond = (int)order.size();
vector<int> result = numbers;
sort(result.begin(), result.end(), [&](int a, int b) {
    int rankA = rank.count(a) ? rank[a] : beyond;
    int rankB = rank.count(b) ? rank[b] : beyond;
    if (rankA != rankB) return rankA < rankB;
    return a < b;
});
return result;`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "largest-number-arrangement",
    title: "Arrange Digits Into the Largest Number",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Arrange the numbers in whatever order produces the largest possible " +
      "number when their digits are written one after another, and return that " +
      'number as a string. A list of nothing but zeros gives "0".',
    explanation:
      "Sorting by size is wrong: 9 must come before 30 even though 9 is " +
      "smaller, because 930 beats 309. The right comparison is 'which order of " +
      "these two produces the bigger joined string?' — compare a + b with b + a " +
      "as text and put the bigger arrangement first. That comparator is " +
      "genuinely transitive, which is why sorting with it produces the global " +
      'best. The one edge case is all zeros: the join gives "000" and the ' +
      'answer should be "0", so check whether the result starts with a zero ' +
      "before returning it.",
    constraints: [
      "The list has between 1 and 100 non-negative numbers.",
      "Each number is between 0 and 1,000,000,000.",
      "The answer is returned as a string, since it can be very large.",
    ],
    hints: [
      "Sorting numerically gives the wrong answer — try 9 and 30.",
      "Compare a + b against b + a as strings.",
      'All zeros must return "0", not "000".',
    ],
    estimatedTime: "30 min",
    signature: {
      name: "largestArrangement",
      params: [{ name: "numbers", type: "int[]" }],
      returns: "string",
    },
    topicSlugs: ["dsa-sorting", "dsa-strings", "dsa-greedy"],
    examples: [
      { input: "numbers = [10, 2]", output: '"210"' },
      {
        input: "numbers = [3, 30, 34, 5, 9]",
        output: '"9534330"',
        explanation: "34 beats 3 here because 34 then 3 makes 343, not 334.",
      },
    ],
    tests: [
      { args: [[10, 2]], expected: "210" },
      { args: [[3, 30, 34, 5, 9]], expected: "9534330" },
      { args: [[0, 0]], expected: "0" },
      { args: [[1]], expected: "1", hidden: true },
      { args: [[432, 43243]], expected: "43243432", hidden: true },
      { args: [[0, 1]], expected: "10", hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const parts = numbers.map((value) => String(value));
parts.sort((a, b) => (b + a < a + b ? -1 : b + a > a + b ? 1 : 0));
const joined = parts.join("");
return joined[0] === "0" ? "0" : joined;`,
      TYPESCRIPT: `const parts = numbers.map((value) => String(value));
parts.sort((a, b) => (b + a < a + b ? -1 : b + a > a + b ? 1 : 0));
const joined = parts.join("");
return joined[0] === "0" ? "0" : joined;`,
      PYTHON: `import functools

parts = [str(value) for value in numbers]
parts.sort(key=functools.cmp_to_key(lambda a, b: (a + b < b + a) - (a + b > b + a)))
joined = "".join(parts)
return "0" if joined[0] == "0" else joined`,
      JAVA: `String[] parts = new String[numbers.length];
for (int i = 0; i < numbers.length; i += 1) parts[i] = String.valueOf(numbers[i]);
Arrays.sort(parts, (a, b) -> (b + a).compareTo(a + b));
StringBuilder joined = new StringBuilder();
for (String part : parts) joined.append(part);
String answer = joined.toString();
return answer.charAt(0) == '0' ? "0" : answer;`,
      CPP: `vector<string> parts;
for (int value : numbers) parts.push_back(to_string(value));
sort(parts.begin(), parts.end(), [](const string& a, const string& b) {
    return a + b > b + a;
});
string joined;
for (const string& part : parts) joined += part;
return joined[0] == '0' ? "0" : joined;`,
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "kth-largest-value",
    title: "The k-th Largest Value",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Return the k-th largest value in the list, counting duplicates as " +
      "separate values. With k = 1 that is the maximum. The list always has at " +
      "least k values.",
    explanation:
      "Sorting descending and taking position k - 1 is O(n log n) and is a " +
      "perfectly good first answer. Two better ones exist and are what the " +
      "question is really asking about. A min-heap of size k costs O(n log k) " +
      "and is the right choice when the values arrive as a stream. Quickselect " +
      "— partition around a pivot and recurse into only the side that can " +
      "contain the answer — averages O(n), which is the best possible, at the " +
      "cost of a bad worst case. Being able to name the trade-off matters more " +
      "than writing quickselect from memory.",
    constraints: [
      "The list has between 1 and 100,000 numbers.",
      "k is between 1 and the length of the list.",
      "Duplicates count separately.",
    ],
    hints: [
      "Sorting works — then think about what you are wasting.",
      "A min-heap of size k keeps only the k largest values seen.",
      "Quickselect recurses into one side of a partition, not both.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "kthLargestValue",
      params: [
        { name: "numbers", type: "int[]" },
        { name: "k", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-sorting", "dsa-heap"],
    examples: [
      { input: "numbers = [3, 2, 1, 5, 6, 4], k = 2", output: "5" },
      {
        input: "numbers = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4",
        output: "4",
        explanation: "Sorted descending: 6, 5, 5, 4 — the fourth is 4.",
      },
    ],
    tests: [
      { args: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
      { args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 },
      { args: [[1], 1], expected: 1 },
      { args: [[2, 1], 2], expected: 1, hidden: true },
      { args: [[7, 7, 7], 2], expected: 7, hidden: true },
      { args: [[-1, -2, -3], 1], expected: -1, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const sorted = numbers.slice().sort((a, b) => b - a);
return sorted[k - 1];`,
      TYPESCRIPT: `const sorted = numbers.slice().sort((a, b) => b - a);
return sorted[k - 1];`,
      PYTHON: `sorted_values = sorted(numbers, reverse=True)
return sorted_values[k - 1]`,
      JAVA: `int[] sorted = Arrays.copyOf(numbers, numbers.length);
Arrays.sort(sorted);
return sorted[sorted.length - k];`,
      CPP: `vector<int> sorted = numbers;
sort(sorted.begin(), sorted.end(), greater<int>());
return sorted[k - 1];`,
    },
  },
];
