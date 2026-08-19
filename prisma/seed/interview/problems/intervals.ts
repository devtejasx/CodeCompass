import type { SeedProblem } from "../../problems/types";

/**
 * Intervals.
 *
 * Almost every problem in this file is solved by the same two lines: sort on
 * the right key, then sweep once keeping a single number. What changes between
 * problems is only *which* key — start, end, or the events pulled apart into
 * two separate lists — and getting that choice right is the whole exercise.
 * Merging sorts by start because you build a growing block; scheduling sorts by
 * end because the meeting that frees the room soonest leaves the most room for
 * everything after it.
 *
 * Intervals arrive as int[][], each inner list a [start, end] pair, which the
 * statement says out loud. That keeps them runnable in all five languages
 * without a Pair type the harness would have to spell five ways.
 *
 * The file is also where greedy is introduced by demonstration rather than by
 * assertion: the exchange argument for "sort by end" is spelled out in the
 * explanation of the non-overlapping problem, and reused after that.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const INTERVAL_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "intervals-overlap",
    title: "Do These Two Overlap?",
    difficulty: "EASY",
    interviewFrequency: "MEDIUM",
    description:
      "Two ranges are given as [start, end], each including both endpoints. " +
      "Report whether they share at least one point. Ranges that merely touch — " +
      "one ending exactly where the other begins — do share that point, and " +
      "count as overlapping.",
    explanation:
      "The instinct is to enumerate the arrangements: A entirely before B, A " +
      "inside B, B inside A, and so on. That is four or five cases and at least " +
      "one of them will be wrong. Flip the question and ask when they *fail* to " +
      "overlap, which has only two answers: A finishes before B starts, or B " +
      "finishes before A starts. Negating that gives a single condition — " +
      "aStart <= bEnd and bStart <= aEnd — and it is correct for every " +
      "arrangement including containment and touching. This inversion is worth " +
      "keeping; it is the test the rest of this file is built on.",
    constraints: [
      "Each range is given as exactly two integers, start then end.",
      "Endpoints are between -1,000,000,000 and 1,000,000,000.",
      "A range's start is never after its end.",
    ],
    hints: [
      "Do not enumerate the overlapping arrangements. Enumerate the non-overlapping ones.",
      "There are only two ways to miss: one finishes before the other starts.",
      "Negate that, and one condition covers every case.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "intervalsOverlap",
      params: [
        { name: "first", type: "int[]" },
        { name: "second", type: "int[]" },
      ],
      returns: "bool",
    },
    topicSlugs: ["dsa-intervals", "js-arrays", "js-conditions"],
    examples: [
      {
        input: "first = [1, 5], second = [4, 8]",
        output: "true",
        explanation: "They share the points from 4 to 5.",
      },
      {
        input: "first = [1, 3], second = [5, 7]",
        output: "false",
        explanation: "The first finishes at 3, before the second begins at 5.",
      },
    ],
    tests: [
      {
        args: [
          [1, 5],
          [4, 8],
        ],
        expected: true,
      },
      {
        args: [
          [1, 3],
          [5, 7],
        ],
        expected: false,
      },
      {
        args: [
          [2, 4],
          [4, 6],
        ],
        expected: true,
      },
      {
        args: [
          [1, 10],
          [3, 4],
        ],
        expected: true,
        hidden: true,
      },
      {
        args: [
          [5, 5],
          [5, 5],
        ],
        expected: true,
        hidden: true,
      },
      {
        args: [
          [9, 12],
          [1, 8],
        ],
        expected: false,
        hidden: true,
      },
      {
        args: [
          [-5, 0],
          [0, 5],
        ],
        expected: true,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `return first[0] <= second[1] && second[0] <= first[1];`,
      TYPESCRIPT: `return first[0] <= second[1] && second[0] <= first[1];`,
      PYTHON: `return first[0] <= second[1] and second[0] <= first[1]`,
      JAVA: `return first[0] <= second[1] && second[0] <= first[1];`,
      CPP: `return first[0] <= second[1] && second[0] <= first[1];`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "can-attend-every-meeting",
    title: "Can You Attend Every Meeting?",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Given a list of meetings as [start, end] pairs, decide whether one person " +
      "could attend all of them. A meeting ending exactly when the next begins " +
      "is fine — you can walk straight from one to the other.",
    explanation:
      "Comparing every pair costs O(n²) and is unnecessary: if any two meetings " +
      "clash, then two meetings that are *adjacent once sorted by start time* " +
      "also clash. So sort by start and check each neighbouring pair, which is " +
      "O(n log n) and dominated by the sort. The comparison to make is " +
      "current start < previous end — strictly less, because touching is " +
      "allowed here. Note how much work the sort did: it turned a question " +
      "about all pairs into a question about neighbours, which is the move this " +
      "whole topic repeats.",
    constraints: [
      "Between 0 and 10,000 meetings.",
      "Each meeting is a [start, end] pair with start no later than end.",
      "Times are between 0 and 1,000,000.",
    ],
    hints: [
      "You do not need to compare every pair of meetings.",
      "After sorting by start time, a clash must involve two neighbours.",
      "Touching is allowed, so the comparison is strict.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "canAttendEveryMeeting",
      params: [{ name: "meetings", type: "int[][]" }],
      returns: "bool",
    },
    topicSlugs: ["dsa-intervals", "dsa-sorting", "js-arrays"],
    examples: [
      {
        input: "meetings = [[0, 30], [5, 10], [15, 20]]",
        output: "false",
        explanation: "The 0–30 meeting swallows both of the others.",
      },
      {
        input: "meetings = [[7, 10], [2, 4]]",
        output: "true",
        explanation: "Sorted, they run 2–4 then 7–10, with a gap between.",
      },
    ],
    tests: [
      {
        args: [
          [
            [0, 30],
            [5, 10],
            [15, 20],
          ],
        ],
        expected: false,
      },
      {
        args: [
          [
            [7, 10],
            [2, 4],
          ],
        ],
        expected: true,
      },
      {
        args: [
          [
            [1, 5],
            [5, 9],
          ],
        ],
        expected: true,
      },
      { args: [[]], expected: true, hidden: true },
      { args: [[[3, 8]]], expected: true, hidden: true },
      {
        args: [
          [
            [4, 9],
            [4, 5],
          ],
        ],
        expected: false,
        hidden: true,
      },
      {
        args: [
          [
            [10, 20],
            [1, 3],
            [3, 10],
            [20, 21],
          ],
        ],
        expected: true,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const ordered = [...meetings].sort((a, b) => a[0] - b[0]);
for (let i = 1; i < ordered.length; i += 1) {
  if (ordered[i][0] < ordered[i - 1][1]) return false;
}
return true;`,
      TYPESCRIPT: `const ordered = [...meetings].sort((a, b) => a[0] - b[0]);
for (let i = 1; i < ordered.length; i += 1) {
  if (ordered[i][0] < ordered[i - 1][1]) return false;
}
return true;`,
      PYTHON: `ordered = sorted(meetings, key=lambda meeting: meeting[0])
for i in range(1, len(ordered)):
    if ordered[i][0] < ordered[i - 1][1]:
        return False
return True`,
      JAVA: `int[][] ordered = meetings.clone();
Arrays.sort(ordered, (a, b) -> Integer.compare(a[0], b[0]));
for (int i = 1; i < ordered.length; i += 1) {
    if (ordered[i][0] < ordered[i - 1][1]) return false;
}
return true;`,
      CPP: `vector<vector<int>> ordered = meetings;
sort(ordered.begin(), ordered.end(),
     [](const vector<int>& a, const vector<int>& b) { return a[0] < b[0]; });
for (size_t i = 1; i < ordered.size(); i += 1) {
    if (ordered[i][0] < ordered[i - 1][1]) return false;
}
return true;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "merge-overlapping-ranges",
    title: "Merge the Overlapping Ranges",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Combine every group of overlapping or touching ranges into a single range " +
      "covering the same points, and return the result sorted by start. Two " +
      "ranges that merely touch, such as [1,4] and [4,7], become one range.",
    explanation:
      "Sort by start, and the problem becomes local. Walk the sorted list " +
      "carrying one open range. If the next range begins at or before the open " +
      "range's end, it belongs to the same block: extend the end to the larger " +
      "of the two, which matters because a range fully swallowed by the open one " +
      "must not shrink it. Otherwise the open range is finished — emit it and " +
      "open a new one. Sorting by start is what makes 'begins at or before the " +
      "current end' a complete test for membership: anything overlapping the " +
      "open block has to start inside it, because everything later starts later " +
      "still. Emit the final open range after the loop.",
    constraints: [
      "Between 1 and 10,000 ranges.",
      "Each range is a [start, end] pair with start no later than end.",
      "Endpoints are between 0 and 1,000,000.",
    ],
    hints: [
      "Sort by start, then you only ever compare against the range you are currently building.",
      "A new range joins the block if it starts at or before the block's current end.",
      "Extend with the larger end — a swallowed range must not shorten the block.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "mergeOverlappingRanges",
      params: [{ name: "ranges", type: "int[][]" }],
      returns: "int[][]",
    },
    topicSlugs: ["dsa-intervals", "dsa-sorting", "js-arrays"],
    examples: [
      {
        input: "ranges = [[1, 3], [2, 6], [8, 10], [15, 18]]",
        output: "[[1, 6], [8, 10], [15, 18]]",
        explanation: "[1,3] and [2,6] overlap and become [1,6]; the rest stand alone.",
      },
      {
        input: "ranges = [[1, 4], [4, 5]]",
        output: "[[1, 5]]",
        explanation: "They touch at 4, which is enough to merge them.",
      },
    ],
    tests: [
      {
        args: [
          [
            [1, 3],
            [2, 6],
            [8, 10],
            [15, 18],
          ],
        ],
        expected: [
          [1, 6],
          [8, 10],
          [15, 18],
        ],
      },
      {
        args: [
          [
            [1, 4],
            [4, 5],
          ],
        ],
        expected: [[1, 5]],
      },
      { args: [[[5, 7]]], expected: [[5, 7]] },
      {
        args: [
          [
            [1, 10],
            [2, 3],
            [4, 5],
          ],
        ],
        expected: [[1, 10]],
        hidden: true,
      },
      {
        args: [
          [
            [5, 6],
            [1, 2],
          ],
        ],
        expected: [
          [1, 2],
          [5, 6],
        ],
        hidden: true,
      },
      {
        args: [
          [
            [2, 2],
            [2, 2],
          ],
        ],
        expected: [[2, 2]],
        hidden: true,
      },
      {
        args: [
          [
            [1, 4],
            [0, 2],
            [3, 5],
          ],
        ],
        expected: [[0, 5]],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const ordered = [...ranges].sort((a, b) => a[0] - b[0]);
const merged = [];
for (const [start, end] of ordered) {
  const open = merged[merged.length - 1];
  if (open !== undefined && start <= open[1]) {
    if (end > open[1]) open[1] = end;
  } else {
    merged.push([start, end]);
  }
}
return merged;`,
      TYPESCRIPT: `const ordered = [...ranges].sort((a, b) => a[0] - b[0]);
const merged: number[][] = [];
for (const [start, end] of ordered) {
  const open = merged[merged.length - 1];
  if (open !== undefined && start <= open[1]) {
    if (end > open[1]) open[1] = end;
  } else {
    merged.push([start, end]);
  }
}
return merged;`,
      PYTHON: `merged = []
for start, end in sorted(ranges, key=lambda entry: entry[0]):
    if merged and start <= merged[-1][1]:
        merged[-1][1] = max(merged[-1][1], end)
    else:
        merged.append([start, end])
return merged`,
      JAVA: `int[][] ordered = ranges.clone();
Arrays.sort(ordered, (a, b) -> Integer.compare(a[0], b[0]));
List<int[]> merged = new ArrayList<>();
for (int[] range : ordered) {
    if (!merged.isEmpty() && range[0] <= merged.get(merged.size() - 1)[1]) {
        int[] open = merged.get(merged.size() - 1);
        open[1] = Math.max(open[1], range[1]);
    } else {
        merged.add(new int[] {range[0], range[1]});
    }
}
return merged.toArray(new int[0][]);`,
      CPP: `vector<vector<int>> ordered = ranges;
sort(ordered.begin(), ordered.end(),
     [](const vector<int>& a, const vector<int>& b) { return a[0] < b[0]; });
vector<vector<int>> merged;
for (const vector<int>& range : ordered) {
    if (!merged.empty() && range[0] <= merged.back()[1]) {
        merged.back()[1] = max(merged.back()[1], range[1]);
    } else {
        merged.push_back(range);
    }
}
return merged;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "insert-into-sorted-ranges",
    title: "Insert One More Range",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "The existing ranges are already sorted by start and none of them overlap. " +
      "Add one more range, merging it with any it touches or overlaps, and return " +
      "the resulting list — still sorted, still non-overlapping.",
    explanation:
      "You could append and re-run the general merge, but that throws away the " +
      "sortedness you were handed. Instead walk once in three stages. First, " +
      "copy across every range that finishes strictly before the newcomer " +
      "starts; those are untouched. Second, absorb every range that overlaps it, " +
      "widening the newcomer's start to the smaller start and its end to the " +
      "larger end as you go, then emit the widened range once. Third, copy the " +
      "rest. That is O(n) with no sort at all, and the three-stage shape is the " +
      "standard answer whenever the input arrives already ordered.",
    constraints: [
      "Between 0 and 10,000 existing ranges, sorted by start and non-overlapping.",
      "Every range is a [start, end] pair with start no later than end.",
      "Endpoints are between 0 and 1,000,000,000.",
    ],
    hints: [
      "The input is already sorted — do not throw that away by sorting again.",
      "Three stages: ranges entirely before, ranges that overlap, ranges entirely after.",
      "While absorbing, widen the new range on both sides.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "insertIntoSortedRanges",
      params: [
        { name: "ranges", type: "int[][]" },
        { name: "addition", type: "int[]" },
      ],
      returns: "int[][]",
    },
    topicSlugs: ["dsa-intervals", "js-arrays", "js-loops"],
    examples: [
      {
        input: "ranges = [[1, 3], [6, 9]], addition = [2, 5]",
        output: "[[1, 5], [6, 9]]",
        explanation: "The addition overlaps [1,3] and widens it to [1,5].",
      },
      {
        input: "ranges = [[1, 2], [8, 10]], addition = [4, 6]",
        output: "[[1, 2], [4, 6], [8, 10]]",
        explanation: "It fits in the gap and merges with nothing.",
      },
    ],
    tests: [
      {
        args: [
          [
            [1, 3],
            [6, 9],
          ],
          [2, 5],
        ],
        expected: [
          [1, 5],
          [6, 9],
        ],
      },
      {
        args: [
          [
            [1, 2],
            [8, 10],
          ],
          [4, 6],
        ],
        expected: [
          [1, 2],
          [4, 6],
          [8, 10],
        ],
      },
      { args: [[], [3, 7]], expected: [[3, 7]] },
      {
        args: [
          [
            [1, 5],
            [6, 8],
          ],
          [0, 9],
        ],
        expected: [[0, 9]],
        hidden: true,
      },
      {
        args: [[[5, 7]], [1, 2]],
        expected: [
          [1, 2],
          [5, 7],
        ],
        hidden: true,
      },
      {
        args: [[[1, 2]], [3, 4]],
        expected: [
          [1, 2],
          [3, 4],
        ],
        hidden: true,
      },
      {
        args: [[[1, 5]], [2, 3]],
        expected: [[1, 5]],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const result = [];
let start = addition[0];
let end = addition[1];
let i = 0;

while (i < ranges.length && ranges[i][1] < start) {
  result.push([ranges[i][0], ranges[i][1]]);
  i += 1;
}
while (i < ranges.length && ranges[i][0] <= end) {
  start = Math.min(start, ranges[i][0]);
  end = Math.max(end, ranges[i][1]);
  i += 1;
}
result.push([start, end]);
while (i < ranges.length) {
  result.push([ranges[i][0], ranges[i][1]]);
  i += 1;
}
return result;`,
      TYPESCRIPT: `const result: number[][] = [];
let start = addition[0];
let end = addition[1];
let i = 0;

while (i < ranges.length && ranges[i][1] < start) {
  result.push([ranges[i][0], ranges[i][1]]);
  i += 1;
}
while (i < ranges.length && ranges[i][0] <= end) {
  start = Math.min(start, ranges[i][0]);
  end = Math.max(end, ranges[i][1]);
  i += 1;
}
result.push([start, end]);
while (i < ranges.length) {
  result.push([ranges[i][0], ranges[i][1]]);
  i += 1;
}
return result;`,
      PYTHON: `result = []
start, end = addition[0], addition[1]
i = 0

while i < len(ranges) and ranges[i][1] < start:
    result.append([ranges[i][0], ranges[i][1]])
    i += 1
while i < len(ranges) and ranges[i][0] <= end:
    start = min(start, ranges[i][0])
    end = max(end, ranges[i][1])
    i += 1
result.append([start, end])
while i < len(ranges):
    result.append([ranges[i][0], ranges[i][1]])
    i += 1
return result`,
      JAVA: `List<int[]> result = new ArrayList<>();
int start = addition[0];
int end = addition[1];
int i = 0;

while (i < ranges.length && ranges[i][1] < start) {
    result.add(new int[] {ranges[i][0], ranges[i][1]});
    i += 1;
}
while (i < ranges.length && ranges[i][0] <= end) {
    start = Math.min(start, ranges[i][0]);
    end = Math.max(end, ranges[i][1]);
    i += 1;
}
result.add(new int[] {start, end});
while (i < ranges.length) {
    result.add(new int[] {ranges[i][0], ranges[i][1]});
    i += 1;
}
return result.toArray(new int[0][]);`,
      CPP: `vector<vector<int>> result;
int start = addition[0];
int end = addition[1];
size_t i = 0;

while (i < ranges.size() && ranges[i][1] < start) {
    result.push_back(ranges[i]);
    i += 1;
}
while (i < ranges.size() && ranges[i][0] <= end) {
    start = min(start, ranges[i][0]);
    end = max(end, ranges[i][1]);
    i += 1;
}
result.push_back(vector<int>{start, end});
while (i < ranges.size()) {
    result.push_back(ranges[i]);
    i += 1;
}
return result;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "fewest-ranges-to-drop",
    title: "Fewest Ranges to Drop",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Remove as few ranges as possible so that none of the ones left overlap. " +
      "Return how many you had to remove. Ranges that only touch at an endpoint " +
      "do not count as overlapping.",
    explanation:
      "Turn it around: dropping the fewest is the same as keeping the most, " +
      "which is the classic scheduling question. Sort by *end* and greedily keep " +
      "any range starting at or after the last kept range's end. Sorting by end " +
      "is the whole answer, and here is why it is safe. Suppose an optimal " +
      "selection exists whose first range is not the earliest-finishing one. " +
      "Swap that first range for the earliest-finishing one: it ends no later, " +
      "so it cannot clash with anything the optimal selection kept afterwards, " +
      "and the selection is still the same size and still valid. Repeating the " +
      "argument turns any optimal answer into the greedy one — so greedy is " +
      "optimal. That is an exchange argument, and it is what separates a greedy " +
      "solution you can defend from one you are guessing at.",
    constraints: [
      "Between 1 and 100,000 ranges.",
      "Each range is a [start, end] pair with start strictly before end.",
      "Endpoints are between -50,000 and 50,000.",
    ],
    hints: [
      "Removing the fewest is keeping the most — solve the easier phrasing.",
      "Sort by end, not by start.",
      "Keep a range whenever it starts at or after the last one you kept ended.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "fewestRangesToDrop",
      params: [{ name: "ranges", type: "int[][]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-intervals", "dsa-greedy", "dsa-sorting"],
    examples: [
      {
        input: "ranges = [[1, 2], [2, 3], [3, 4], [1, 3]]",
        output: "1",
        explanation: "Dropping [1,3] leaves three ranges that only touch.",
      },
      {
        input: "ranges = [[1, 2], [1, 2], [1, 2]]",
        output: "2",
        explanation: "All three cover the same span, so only one can stay.",
      },
    ],
    tests: [
      {
        args: [
          [
            [1, 2],
            [2, 3],
            [3, 4],
            [1, 3],
          ],
        ],
        expected: 1,
      },
      {
        args: [
          [
            [1, 2],
            [1, 2],
            [1, 2],
          ],
        ],
        expected: 2,
      },
      {
        args: [
          [
            [1, 2],
            [2, 3],
          ],
        ],
        expected: 0,
      },
      { args: [[[5, 9]]], expected: 0, hidden: true },
      {
        args: [
          [
            [1, 100],
            [11, 22],
            [1, 11],
            [2, 12],
          ],
        ],
        expected: 2,
        hidden: true,
      },
      {
        args: [
          [
            [-10, -5],
            [-6, -1],
            [0, 3],
          ],
        ],
        expected: 1,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const ordered = [...ranges].sort((a, b) => a[1] - b[1]);
let kept = 0;
let lastEnd = -Infinity;
for (const [start, end] of ordered) {
  if (start >= lastEnd) {
    kept += 1;
    lastEnd = end;
  }
}
return ranges.length - kept;`,
      TYPESCRIPT: `const ordered = [...ranges].sort((a, b) => a[1] - b[1]);
let kept = 0;
let lastEnd = -Infinity;
for (const [start, end] of ordered) {
  if (start >= lastEnd) {
    kept += 1;
    lastEnd = end;
  }
}
return ranges.length - kept;`,
      PYTHON: `kept = 0
last_end = float("-inf")
for start, end in sorted(ranges, key=lambda entry: entry[1]):
    if start >= last_end:
        kept += 1
        last_end = end
return len(ranges) - kept`,
      JAVA: `int[][] ordered = ranges.clone();
Arrays.sort(ordered, (a, b) -> Integer.compare(a[1], b[1]));
int kept = 0;
long lastEnd = Long.MIN_VALUE;
for (int[] range : ordered) {
    if (range[0] >= lastEnd) {
        kept += 1;
        lastEnd = range[1];
    }
}
return ranges.length - kept;`,
      CPP: `vector<vector<int>> ordered = ranges;
sort(ordered.begin(), ordered.end(),
     [](const vector<int>& a, const vector<int>& b) { return a[1] < b[1]; });
int kept = 0;
long long lastEnd = LLONG_MIN;
for (const vector<int>& range : ordered) {
    if (range[0] >= lastEnd) {
        kept += 1;
        lastEnd = range[1];
    }
}
return (int)ranges.size() - kept;`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "rooms-needed-at-once",
    title: "How Many Rooms at Once",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Given meetings as [start, end] pairs, find the smallest number of rooms " +
      "that could hold all of them. A meeting ending exactly when another begins " +
      "can hand over the same room.",
    explanation:
      "The answer is the largest number of meetings running simultaneously, so " +
      "stop thinking about meetings and think about *events*. Pull the starts " +
      "into one sorted list and the ends into another, then sweep with two " +
      "pointers: advance through the starts, and every time the next start is at " +
      "or after the earliest unmatched end, a room has just been freed, so " +
      "consume that end too. The number of starts you have consumed without a " +
      "matching end is the number of rooms in use, and its peak is the answer. " +
      "Separating an interval into its two endpoints is worth remembering — it " +
      "is the general sweep-line technique, and it is why the handover rule " +
      "falls out of a single comparison rather than a special case.",
    constraints: [
      "Between 0 and 100,000 meetings.",
      "Each meeting is a [start, end] pair with start no later than end.",
      "Times are between 0 and 1,000,000.",
    ],
    hints: [
      "The answer is the peak number of meetings happening at the same moment.",
      "Split each meeting into a start event and an end event, and sort each list.",
      "Sweep the starts; an end at or before the next start frees a room.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "roomsNeededAtOnce",
      params: [{ name: "meetings", type: "int[][]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-intervals", "dsa-sorting", "dsa-heap"],
    examples: [
      {
        input: "meetings = [[0, 30], [5, 10], [15, 20]]",
        output: "2",
        explanation:
          "The long meeting overlaps each short one, but the two short ones never overlap each other.",
      },
      {
        input: "meetings = [[7, 10], [2, 4]]",
        output: "1",
        explanation: "They never run at the same time, so one room is enough.",
      },
    ],
    tests: [
      {
        args: [
          [
            [0, 30],
            [5, 10],
            [15, 20],
          ],
        ],
        expected: 2,
      },
      {
        args: [
          [
            [7, 10],
            [2, 4],
          ],
        ],
        expected: 1,
      },
      {
        args: [
          [
            [1, 5],
            [5, 9],
          ],
        ],
        expected: 1,
      },
      { args: [[]], expected: 0, hidden: true },
      {
        args: [
          [
            [1, 10],
            [2, 9],
            [3, 8],
          ],
        ],
        expected: 3,
        hidden: true,
      },
      {
        args: [
          [
            [2, 7],
            [2, 7],
          ],
        ],
        expected: 2,
        hidden: true,
      },
      {
        args: [
          [
            [1, 2],
            [2, 3],
            [3, 4],
            [4, 5],
          ],
        ],
        expected: 1,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const starts = meetings.map((m) => m[0]).sort((a, b) => a - b);
const ends = meetings.map((m) => m[1]).sort((a, b) => a - b);
let rooms = 0;
let peak = 0;
let finished = 0;
for (const start of starts) {
  while (finished < ends.length && ends[finished] <= start) {
    rooms -= 1;
    finished += 1;
  }
  rooms += 1;
  if (rooms > peak) peak = rooms;
}
return peak;`,
      TYPESCRIPT: `const starts = meetings.map((m) => m[0]).sort((a, b) => a - b);
const ends = meetings.map((m) => m[1]).sort((a, b) => a - b);
let rooms = 0;
let peak = 0;
let finished = 0;
for (const start of starts) {
  while (finished < ends.length && ends[finished] <= start) {
    rooms -= 1;
    finished += 1;
  }
  rooms += 1;
  if (rooms > peak) peak = rooms;
}
return peak;`,
      PYTHON: `starts = sorted(meeting[0] for meeting in meetings)
ends = sorted(meeting[1] for meeting in meetings)
rooms = 0
peak = 0
finished = 0
for start in starts:
    while finished < len(ends) and ends[finished] <= start:
        rooms -= 1
        finished += 1
    rooms += 1
    peak = max(peak, rooms)
return peak`,
      JAVA: `int n = meetings.length;
int[] starts = new int[n];
int[] ends = new int[n];
for (int i = 0; i < n; i += 1) {
    starts[i] = meetings[i][0];
    ends[i] = meetings[i][1];
}
Arrays.sort(starts);
Arrays.sort(ends);
int rooms = 0;
int peak = 0;
int finished = 0;
for (int start : starts) {
    while (finished < n && ends[finished] <= start) {
        rooms -= 1;
        finished += 1;
    }
    rooms += 1;
    peak = Math.max(peak, rooms);
}
return peak;`,
      CPP: `vector<int> starts, ends;
for (const vector<int>& meeting : meetings) {
    starts.push_back(meeting[0]);
    ends.push_back(meeting[1]);
}
sort(starts.begin(), starts.end());
sort(ends.begin(), ends.end());
int rooms = 0, peak = 0;
size_t finished = 0;
for (int start : starts) {
    while (finished < ends.size() && ends[finished] <= start) {
        rooms -= 1;
        finished += 1;
    }
    rooms += 1;
    peak = max(peak, rooms);
}
return peak;`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "arrows-to-burst-balloons",
    title: "Arrows to Burst Every Balloon",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Each balloon spans a horizontal range [left, right], both ends included. " +
      "An arrow fired straight up at position x bursts every balloon whose range " +
      "contains x. Return the fewest arrows that burst them all.",
    explanation:
      "Every arrow bursts a group of balloons that all share a point, so the " +
      "question is how few groups the balloons can be split into — the same " +
      "scheduling shape as dropping the fewest ranges, read the other way round. " +
      "Sort by right edge and fire the first arrow at the smallest right edge " +
      "there is. That arrow bursts every balloon it reaches, and by the exchange " +
      "argument no arrow placed elsewhere could burst more of the balloons that " +
      "remain. Skip everything it burst, fire the next arrow at the next " +
      "unburst balloon's right edge, and repeat. Because the ends are included " +
      "here, a balloon starting exactly at the arrow's position is burst — so " +
      "the comparison is 'left > arrow', not 'left >= arrow'.",
    constraints: [
      "Between 1 and 100,000 balloons.",
      "Each balloon is a [left, right] pair with left no greater than right.",
      "Coordinates are between -100,000,000 and 100,000,000.",
    ],
    hints: [
      "An arrow is a point shared by a group of balloons — count the groups.",
      "Sort by right edge, and always fire at the current smallest right edge.",
      "Both ends are inclusive, so a balloon starting exactly at the arrow still bursts.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "arrowsToBurstBalloons",
      params: [{ name: "balloons", type: "int[][]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-intervals", "dsa-greedy", "dsa-sorting"],
    examples: [
      {
        input: "balloons = [[10, 16], [2, 8], [1, 6], [7, 12]]",
        output: "2",
        explanation:
          "An arrow at 6 bursts the two leftmost; an arrow at 12 bursts the other two.",
      },
      {
        input: "balloons = [[1, 2], [3, 4], [5, 6]]",
        output: "3",
        explanation: "No two balloons share a point, so each needs its own arrow.",
      },
    ],
    tests: [
      {
        args: [
          [
            [10, 16],
            [2, 8],
            [1, 6],
            [7, 12],
          ],
        ],
        expected: 2,
      },
      {
        args: [
          [
            [1, 2],
            [3, 4],
            [5, 6],
          ],
        ],
        expected: 3,
      },
      {
        args: [
          [
            [1, 2],
            [2, 3],
          ],
        ],
        expected: 1,
      },
      { args: [[[4, 9]]], expected: 1, hidden: true },
      {
        args: [
          [
            [1, 10],
            [2, 3],
            [4, 5],
          ],
        ],
        expected: 2,
        hidden: true,
      },
      {
        args: [
          [
            [-5, -1],
            [-3, 0],
            [1, 4],
          ],
        ],
        expected: 2,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const ordered = [...balloons].sort((a, b) => a[1] - b[1]);
let arrows = 0;
let lastShot = -Infinity;
for (const [left, right] of ordered) {
  if (left > lastShot) {
    arrows += 1;
    lastShot = right;
  }
}
return arrows;`,
      TYPESCRIPT: `const ordered = [...balloons].sort((a, b) => a[1] - b[1]);
let arrows = 0;
let lastShot = -Infinity;
for (const [left, right] of ordered) {
  if (left > lastShot) {
    arrows += 1;
    lastShot = right;
  }
}
return arrows;`,
      PYTHON: `arrows = 0
last_shot = float("-inf")
for left, right in sorted(balloons, key=lambda entry: entry[1]):
    if left > last_shot:
        arrows += 1
        last_shot = right
return arrows`,
      JAVA: `int[][] ordered = balloons.clone();
Arrays.sort(ordered, (a, b) -> Integer.compare(a[1], b[1]));
int arrows = 0;
long lastShot = Long.MIN_VALUE;
for (int[] balloon : ordered) {
    if (balloon[0] > lastShot) {
        arrows += 1;
        lastShot = balloon[1];
    }
}
return arrows;`,
      CPP: `vector<vector<int>> ordered = balloons;
sort(ordered.begin(), ordered.end(),
     [](const vector<int>& a, const vector<int>& b) { return a[1] < b[1]; });
int arrows = 0;
long long lastShot = LLONG_MIN;
for (const vector<int>& balloon : ordered) {
    if (balloon[0] > lastShot) {
        arrows += 1;
        lastShot = balloon[1];
    }
}
return arrows;`,
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "busiest-employee-window",
    title: "When Was Everyone Busy?",
    difficulty: "HARD",
    interviewFrequency: "MEDIUM",
    description:
      "Given everybody's booked ranges as [start, end] pairs, return the free " +
      "gaps that every single person shares, sorted by start. A gap counts only " +
      "if it has positive length and lies between two booked ranges — the open " +
      "time before the first booking and after the last does not count.",
    explanation:
      "The people are a red herring: a moment is free for everybody exactly when " +
      "it is inside nobody's booking, so pour every range into one list and " +
      "forget who owns what. Merge that list the usual way — sort by start, " +
      "extend while the next range begins at or before the current end — and the " +
      "result is every stretch of busy time. The answer is then simply the gaps " +
      "between consecutive merged blocks: from one block's end to the next " +
      "block's start, kept only when that is a positive length. Discarding the " +
      "ownership information at the start is the whole insight, and it is what " +
      "makes an intimidating scheduling question into merge-intervals with two " +
      "extra lines.",
    constraints: [
      "Between 1 and 50,000 booked ranges in total.",
      "Each range is a [start, end] pair with start strictly before end.",
      "Times are between 1 and 100,000,000.",
    ],
    hints: [
      "Whose booking it is never matters — a moment is free only if nobody has it.",
      "Merge every range into one list of busy blocks.",
      "The answer is the positive-length gaps between consecutive blocks.",
    ],
    estimatedTime: "40 min",
    signature: {
      name: "busiestEmployeeWindow",
      params: [{ name: "bookings", type: "int[][]" }],
      returns: "int[][]",
    },
    topicSlugs: ["dsa-intervals", "dsa-sorting", "js-arrays"],
    examples: [
      {
        input: "bookings = [[1, 3], [6, 7], [2, 4], [2, 5], [9, 12]]",
        output: "[[5, 6], [7, 9]]",
        explanation:
          "Busy blocks are [1,5], [6,7] and [9,12], leaving the gaps 5–6 and 7–9.",
      },
      {
        input: "bookings = [[1, 3], [3, 5]]",
        output: "[]",
        explanation: "They touch, so the busy time is continuous and there is no gap.",
      },
    ],
    tests: [
      {
        args: [
          [
            [1, 3],
            [6, 7],
            [2, 4],
            [2, 5],
            [9, 12],
          ],
        ],
        expected: [
          [5, 6],
          [7, 9],
        ],
      },
      {
        args: [
          [
            [1, 3],
            [3, 5],
          ],
        ],
        expected: [],
      },
      {
        args: [
          [
            [1, 2],
            [5, 6],
          ],
        ],
        expected: [[2, 5]],
      },
      { args: [[[7, 9]]], expected: [], hidden: true },
      {
        args: [
          [
            [1, 10],
            [2, 3],
          ],
        ],
        expected: [],
        hidden: true,
      },
      {
        args: [
          [
            [10, 11],
            [1, 2],
            [5, 6],
          ],
        ],
        expected: [
          [2, 5],
          [6, 10],
        ],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const ordered = [...bookings].sort((a, b) => a[0] - b[0]);
const busy = [];
for (const [start, end] of ordered) {
  const open = busy[busy.length - 1];
  if (open !== undefined && start <= open[1]) {
    if (end > open[1]) open[1] = end;
  } else {
    busy.push([start, end]);
  }
}

const free = [];
for (let i = 1; i < busy.length; i += 1) {
  if (busy[i][0] > busy[i - 1][1]) free.push([busy[i - 1][1], busy[i][0]]);
}
return free;`,
      TYPESCRIPT: `const ordered = [...bookings].sort((a, b) => a[0] - b[0]);
const busy: number[][] = [];
for (const [start, end] of ordered) {
  const open = busy[busy.length - 1];
  if (open !== undefined && start <= open[1]) {
    if (end > open[1]) open[1] = end;
  } else {
    busy.push([start, end]);
  }
}

const free: number[][] = [];
for (let i = 1; i < busy.length; i += 1) {
  if (busy[i][0] > busy[i - 1][1]) free.push([busy[i - 1][1], busy[i][0]]);
}
return free;`,
      PYTHON: `busy = []
for start, end in sorted(bookings, key=lambda entry: entry[0]):
    if busy and start <= busy[-1][1]:
        busy[-1][1] = max(busy[-1][1], end)
    else:
        busy.append([start, end])

free = []
for i in range(1, len(busy)):
    if busy[i][0] > busy[i - 1][1]:
        free.append([busy[i - 1][1], busy[i][0]])
return free`,
      JAVA: `int[][] ordered = bookings.clone();
Arrays.sort(ordered, (a, b) -> Integer.compare(a[0], b[0]));
List<int[]> busy = new ArrayList<>();
for (int[] booking : ordered) {
    if (!busy.isEmpty() && booking[0] <= busy.get(busy.size() - 1)[1]) {
        int[] open = busy.get(busy.size() - 1);
        open[1] = Math.max(open[1], booking[1]);
    } else {
        busy.add(new int[] {booking[0], booking[1]});
    }
}

List<int[]> free = new ArrayList<>();
for (int i = 1; i < busy.size(); i += 1) {
    if (busy.get(i)[0] > busy.get(i - 1)[1]) {
        free.add(new int[] {busy.get(i - 1)[1], busy.get(i)[0]});
    }
}
return free.toArray(new int[0][]);`,
      CPP: `vector<vector<int>> ordered = bookings;
sort(ordered.begin(), ordered.end(),
     [](const vector<int>& a, const vector<int>& b) { return a[0] < b[0]; });
vector<vector<int>> busy;
for (const vector<int>& booking : ordered) {
    if (!busy.empty() && booking[0] <= busy.back()[1]) {
        busy.back()[1] = max(busy.back()[1], booking[1]);
    } else {
        busy.push_back(booking);
    }
}

vector<vector<int>> freeGaps;
for (size_t i = 1; i < busy.size(); i += 1) {
    if (busy[i][0] > busy[i - 1][1]) {
        freeGaps.push_back(vector<int>{busy[i - 1][1], busy[i][0]});
    }
}
return freeGaps;`,
    },
  },
];
