import type { SeedProblem } from "../../problems/types";

/**
 * Two-dimensional dynamic programming.
 *
 * A table indexed by two things at once. Two families live here and it is worth
 * keeping them apart.
 *
 * The first is genuinely geometric: a grid, where entry [r][c] is the answer
 * for the square at that position and the recurrence looks at the neighbours
 * above and to the left. These are the gentlest 2-D problems because the table
 * and the problem have the same shape.
 *
 * The second is the harder and more common family: two *sequences*, where entry
 * [i][j] is the answer for the first i of one and the first j of the other.
 * Nothing about the input is two-dimensional — the second dimension is a
 * modelling choice, and making it is the skill. Every explanation in that half
 * therefore begins by saying what [i][j] means, then asks what the last
 * character of each prefix could have been, which is the question that produces
 * the recurrence.
 *
 * Knapsack closes the file, where the second dimension is a *budget* rather
 * than a position — the third way this shape shows up, and the one candidates
 * least often recognise.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const DP_2D_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "count-paths-across-the-grid",
    title: "Count the Paths Across the Grid",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Starting in the top-left corner of a grid with the given number of rows " +
      "and columns, and moving only right or down, count the distinct paths to " +
      "the bottom-right corner.",
    explanation:
      "State: paths[r][c] is the number of ways to reach that square. You can " +
      "only have arrived from directly above or directly to the left, and those " +
      "two sets of paths are disjoint, so paths[r][c] = paths[r-1][c] + " +
      "paths[r][c-1]. The top row and left column are all 1, since there is " +
      "exactly one way along each edge. That fills the table in O(rows × " +
      "columns). Because each row only reads the row above and the entry to its " +
      "left, a single array reused row by row suffices, dropping the memory to " +
      "O(columns) — the standard 2-D-to-1-D reduction, and the follow-up here. " +
      "There is also a closed form: every path makes the same number of moves, " +
      "and choosing which of them go down is a binomial coefficient.",
    constraints: [
      "Between 1 and 100 rows and between 1 and 100 columns.",
      "Only rightward and downward moves are allowed.",
      "The answer fits in a 32-bit signed integer.",
    ],
    hints: [
      "Entry [r][c] counts the ways to reach that square.",
      "You arrived from above or from the left, and never both at once.",
      "One row of the table is enough if you overwrite it in place.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "countPathsAcrossTheGrid",
      params: [
        { name: "rows", type: "int" },
        { name: "columns", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-2d", "dsa-recursion", "js-loops"],
    examples: [
      {
        input: "rows = 3, columns = 7",
        output: "28",
      },
      {
        input: "rows = 1, columns = 5",
        output: "1",
        explanation: "One row leaves no choices at all.",
      },
    ],
    tests: [
      { args: [3, 7], expected: 28 },
      { args: [1, 5], expected: 1 },
      { args: [3, 2], expected: 3 },
      { args: [1, 1], expected: 1, hidden: true },
      { args: [2, 2], expected: 2, hidden: true },
      { args: [10, 10], expected: 48620, hidden: true },
      { args: [3, 3], expected: 6, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const row = new Array(columns).fill(1);
for (let r = 1; r < rows; r += 1) {
  for (let c = 1; c < columns; c += 1) row[c] += row[c - 1];
}
return row[columns - 1];`,
      TYPESCRIPT: `const row: number[] = new Array(columns).fill(1);
for (let r = 1; r < rows; r += 1) {
  for (let c = 1; c < columns; c += 1) row[c] += row[c - 1];
}
return row[columns - 1];`,
      PYTHON: `row = [1] * columns
for _r in range(1, rows):
    for c in range(1, columns):
        row[c] += row[c - 1]
return row[columns - 1]`,
      JAVA: `int[] row = new int[columns];
Arrays.fill(row, 1);
for (int r = 1; r < rows; r += 1) {
    for (int c = 1; c < columns; c += 1) row[c] += row[c - 1];
}
return row[columns - 1];`,
      CPP: `vector<int> row(columns, 1);
for (int r = 1; r < rows; r += 1) {
    for (int c = 1; c < columns; c += 1) row[c] += row[c - 1];
}
return row[columns - 1];`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "count-paths-around-obstacles",
    title: "Count the Paths Around the Obstacles",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "The grid holds 0 for a clear square and 1 for a blocked one. Moving only " +
      "right or down from the top-left corner, count the distinct paths to the " +
      "bottom-right. A blocked corner at either end means no paths at all.",
    explanation:
      "The recurrence is unchanged; only the initialisation and one guard " +
      "differ. A blocked square has zero paths through it whatever its " +
      "neighbours say, so set it to 0 and move on — that zero then propagates " +
      "naturally, because everything downstream sums it. The top row and left " +
      "column can no longer be filled with 1s: once an obstacle appears in the " +
      "top row, every square after it is unreachable, so those edges have to be " +
      "computed rather than assumed. That is the whole difference, and it is the " +
      "general pattern for adding obstacles to any grid DP — write the blocked " +
      "value as the identity for the combining operation (0 for a sum, infinity " +
      "for a minimum) and the rest of the recurrence needs no special cases.",
    constraints: [
      "The grid has between 1 and 100 rows and between 1 and 100 columns.",
      "Every square is 0 or 1.",
      "The answer fits in a 32-bit signed integer.",
    ],
    hints: [
      "A blocked square has zero paths, whatever its neighbours have.",
      "The top row and left column can no longer be assumed to be all ones.",
      "Setting a blocked square to zero makes the zero spread on its own.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "countPathsAroundObstacles",
      params: [{ name: "grid", type: "int[][]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-2d", "js-arrays", "js-loops"],
    examples: [
      {
        input: "grid = [[0, 0, 0], [0, 1, 0], [0, 0, 0]]",
        output: "2",
        explanation: "The middle square is blocked, leaving one route each way round.",
      },
      {
        input: "grid = [[1]]",
        output: "0",
        explanation: "The start is blocked.",
      },
    ],
    tests: [
      {
        args: [
          [
            [0, 0, 0],
            [0, 1, 0],
            [0, 0, 0],
          ],
        ],
        expected: 2,
      },
      { args: [[[1]]], expected: 0 },
      { args: [[[0]]], expected: 1 },
      {
        args: [
          [
            [0, 1],
            [0, 0],
          ],
        ],
        expected: 1,
        hidden: true,
      },
      {
        args: [
          [
            [0, 0],
            [1, 1],
          ],
        ],
        expected: 0,
        hidden: true,
      },
      { args: [[[0, 1, 0]]], expected: 0, hidden: true },
      {
        args: [
          [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
          ],
        ],
        expected: 6,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const rows = grid.length;
const columns = grid[0].length;
const row = new Array(columns).fill(0);
row[0] = grid[0][0] === 1 ? 0 : 1;

for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < columns; c += 1) {
    if (grid[r][c] === 1) row[c] = 0;
    else if (c > 0) row[c] += row[c - 1];
  }
}
return row[columns - 1];`,
      TYPESCRIPT: `const rows = grid.length;
const columns = grid[0].length;
const row: number[] = new Array(columns).fill(0);
row[0] = grid[0][0] === 1 ? 0 : 1;

for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < columns; c += 1) {
    if (grid[r][c] === 1) row[c] = 0;
    else if (c > 0) row[c] += row[c - 1];
  }
}
return row[columns - 1];`,
      PYTHON: `rows = len(grid)
columns = len(grid[0])
row = [0] * columns
row[0] = 0 if grid[0][0] == 1 else 1

for r in range(rows):
    for c in range(columns):
        if grid[r][c] == 1:
            row[c] = 0
        elif c > 0:
            row[c] += row[c - 1]
return row[columns - 1]`,
      JAVA: `int rows = grid.length;
int columns = grid[0].length;
int[] row = new int[columns];
row[0] = grid[0][0] == 1 ? 0 : 1;

for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < columns; c += 1) {
        if (grid[r][c] == 1) row[c] = 0;
        else if (c > 0) row[c] += row[c - 1];
    }
}
return row[columns - 1];`,
      CPP: `int rows = (int)grid.size();
int columns = (int)grid[0].size();
vector<int> row(columns, 0);
row[0] = grid[0][0] == 1 ? 0 : 1;

for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < columns; c += 1) {
        if (grid[r][c] == 1) row[c] = 0;
        else if (c > 0) row[c] += row[c - 1];
    }
}
return row[columns - 1];`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "cheapest-way-across-the-grid",
    title: "The Cheapest Way Across the Grid",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Each square of the grid holds a cost. Starting in the top-left and moving " +
      "only right or down, return the smallest total cost of reaching the " +
      "bottom-right, counting both ends.",
    explanation:
      "State: cost[r][c] is the cheapest total for arriving at that square. You " +
      "arrived from above or from the left, so cost[r][c] is this square's value " +
      "plus the smaller of those two — with the top row and left column having " +
      "only one predecessor each. Note what makes this a DP rather than a " +
      "shortest-path search: movement is restricted to right and down, so the " +
      "graph has no cycles and the squares can be filled in a fixed order. " +
      "Allow moves in all four directions and that order disappears, the " +
      "recurrence becomes circular, and Dijkstra is the right tool instead — " +
      "which is exactly the least-strenuous-route problem in the shortest-path " +
      "topic. Recognising which of the two a grid question is asking for is the " +
      "point of having both.",
    constraints: [
      "The grid has between 1 and 200 rows and between 1 and 200 columns.",
      "Each cost is between 0 and 200.",
      "Only rightward and downward moves are allowed.",
    ],
    hints: [
      "Entry [r][c] is the cheapest arrival cost at that square.",
      "The top row and left column each have only one way in.",
      "Right-and-down only is what makes a fixed fill order possible at all.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "cheapestWayAcrossTheGrid",
      params: [{ name: "grid", type: "int[][]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-2d", "dsa-shortest-path", "js-arrays"],
    examples: [
      {
        input: "grid = [[1, 3, 1], [1, 5, 1], [4, 2, 1]]",
        output: "7",
        explanation: "1 → 3 → 1 → 1 → 1.",
      },
      { input: "grid = [[5]]", output: "5" },
    ],
    tests: [
      {
        args: [
          [
            [1, 3, 1],
            [1, 5, 1],
            [4, 2, 1],
          ],
        ],
        expected: 7,
      },
      { args: [[[5]]], expected: 5 },
      {
        args: [
          [
            [1, 2],
            [1, 1],
          ],
        ],
        expected: 3,
      },
      { args: [[[1, 2, 3]]], expected: 6, hidden: true },
      {
        args: [
          [
            [0, 0],
            [0, 0],
          ],
        ],
        expected: 0,
        hidden: true,
      },
      {
        args: [
          [
            [1, 2, 3],
            [4, 5, 6],
          ],
        ],
        expected: 12,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const rows = grid.length;
const columns = grid[0].length;
const row = new Array(columns).fill(0);

for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < columns; c += 1) {
    if (r === 0 && c === 0) row[c] = grid[0][0];
    else if (r === 0) row[c] = row[c - 1] + grid[r][c];
    else if (c === 0) row[c] = row[c] + grid[r][c];
    else row[c] = Math.min(row[c], row[c - 1]) + grid[r][c];
  }
}
return row[columns - 1];`,
      TYPESCRIPT: `const rows = grid.length;
const columns = grid[0].length;
const row: number[] = new Array(columns).fill(0);

for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < columns; c += 1) {
    if (r === 0 && c === 0) row[c] = grid[0][0];
    else if (r === 0) row[c] = row[c - 1] + grid[r][c];
    else if (c === 0) row[c] = row[c] + grid[r][c];
    else row[c] = Math.min(row[c], row[c - 1]) + grid[r][c];
  }
}
return row[columns - 1];`,
      PYTHON: `rows = len(grid)
columns = len(grid[0])
row = [0] * columns

for r in range(rows):
    for c in range(columns):
        if r == 0 and c == 0:
            row[c] = grid[0][0]
        elif r == 0:
            row[c] = row[c - 1] + grid[r][c]
        elif c == 0:
            row[c] = row[c] + grid[r][c]
        else:
            row[c] = min(row[c], row[c - 1]) + grid[r][c]
return row[columns - 1]`,
      JAVA: `int rows = grid.length;
int columns = grid[0].length;
int[] row = new int[columns];

for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < columns; c += 1) {
        if (r == 0 && c == 0) row[c] = grid[0][0];
        else if (r == 0) row[c] = row[c - 1] + grid[r][c];
        else if (c == 0) row[c] = row[c] + grid[r][c];
        else row[c] = Math.min(row[c], row[c - 1]) + grid[r][c];
    }
}
return row[columns - 1];`,
      CPP: `int rows = (int)grid.size();
int columns = (int)grid[0].size();
vector<int> row(columns, 0);

for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < columns; c += 1) {
        if (r == 0 && c == 0) row[c] = grid[0][0];
        else if (r == 0) row[c] = row[c - 1] + grid[r][c];
        else if (c == 0) row[c] = row[c] + grid[r][c];
        else row[c] = min(row[c], row[c - 1]) + grid[r][c];
    }
}
return row[columns - 1];`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "longest-shared-subsequence",
    title: "The Longest Shared Subsequence",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Return the length of the longest sequence of characters appearing in both " +
      "texts in the same order, not necessarily next to each other.",
    explanation:
      "This is the first problem where the second dimension is invented rather " +
      "than given. State: best[i][j] is the answer for the first i characters of " +
      "one text and the first j of the other. Now ask about the last character " +
      "of each prefix. If they match, that pair can be taken and nothing is lost " +
      "by doing so, giving 1 + best[i-1][j-1]. If they differ, at least one of " +
      "them is unused, so the answer is the better of best[i-1][j] and " +
      "best[i][j-1]. Either row index being zero gives zero. That is O(mn) time " +
      "and, because each row reads only the row above and the entry to its left, " +
      "O(min(m, n)) memory if reduced. The 'match, or discard one side' shape is " +
      "the template for edit distance and for the wildcard matching later — the " +
      "same table with different arms.",
    constraints: [
      "Each text holds between 0 and 1,000 lowercase letters.",
      "Characters may be reused across the two texts but each position once.",
      "Order must be preserved, but the characters need not be adjacent.",
    ],
    hints: [
      "Entry [i][j] is the answer for the first i of one text and the first j of the other.",
      "Ask what the last character of each prefix does.",
      "If they match, take both; if not, discard one side and try each way.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "longestSharedSubsequence",
      params: [
        { name: "first", type: "string" },
        { name: "second", type: "string" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-2d", "dsa-strings", "js-loops"],
    examples: [
      {
        input: 'first = "abcde", second = "ace"',
        output: "3",
        explanation: '"ace" appears in order inside "abcde".',
      },
      {
        input: 'first = "abc", second = "def"',
        output: "0",
      },
    ],
    tests: [
      { args: ["abcde", "ace"], expected: 3 },
      { args: ["abc", "def"], expected: 0 },
      { args: ["abc", "abc"], expected: 3 },
      { args: ["", "abc"], expected: 0, hidden: true },
      { args: ["a", "a"], expected: 1, hidden: true },
      { args: ["bl", "yby"], expected: 1, hidden: true },
      { args: ["oxcpqrsvwf", "shmtulqrypy"], expected: 2, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const m = first.length;
const n = second.length;
let previous = new Array(n + 1).fill(0);
for (let i = 1; i <= m; i += 1) {
  const current = new Array(n + 1).fill(0);
  for (let j = 1; j <= n; j += 1) {
    if (first[i - 1] === second[j - 1]) current[j] = previous[j - 1] + 1;
    else current[j] = Math.max(previous[j], current[j - 1]);
  }
  previous = current;
}
return previous[n];`,
      TYPESCRIPT: `const m = first.length;
const n = second.length;
let previous: number[] = new Array(n + 1).fill(0);
for (let i = 1; i <= m; i += 1) {
  const current: number[] = new Array(n + 1).fill(0);
  for (let j = 1; j <= n; j += 1) {
    if (first[i - 1] === second[j - 1]) current[j] = previous[j - 1] + 1;
    else current[j] = Math.max(previous[j], current[j - 1]);
  }
  previous = current;
}
return previous[n];`,
      PYTHON: `m, n = len(first), len(second)
previous = [0] * (n + 1)
for i in range(1, m + 1):
    current = [0] * (n + 1)
    for j in range(1, n + 1):
        if first[i - 1] == second[j - 1]:
            current[j] = previous[j - 1] + 1
        else:
            current[j] = max(previous[j], current[j - 1])
    previous = current
return previous[n]`,
      JAVA: `int m = first.length();
int n = second.length();
int[] previous = new int[n + 1];
for (int i = 1; i <= m; i += 1) {
    int[] current = new int[n + 1];
    for (int j = 1; j <= n; j += 1) {
        if (first.charAt(i - 1) == second.charAt(j - 1)) current[j] = previous[j - 1] + 1;
        else current[j] = Math.max(previous[j], current[j - 1]);
    }
    previous = current;
}
return previous[n];`,
      CPP: `int m = (int)first.size();
int n = (int)second.size();
vector<int> previous(n + 1, 0);
for (int i = 1; i <= m; i += 1) {
    vector<int> current(n + 1, 0);
    for (int j = 1; j <= n; j += 1) {
        if (first[i - 1] == second[j - 1]) current[j] = previous[j - 1] + 1;
        else current[j] = max(previous[j], current[j - 1]);
    }
    previous = current;
}
return previous[n];`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "longest-shared-block",
    title: "The Longest Shared Block",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Return the length of the longest run of characters that appears in both " +
      "texts as an unbroken block.",
    explanation:
      "One word changes from the previous problem — unbroken — and it changes the " +
      "state in a way worth dwelling on. Entry [i][j] can no longer mean 'the " +
      "answer for these two prefixes', because a shared block might have ended " +
      "long ago; it has to mean the length of the shared block *ending exactly " +
      "at* i and j. Then the recurrence has only one arm: if the two characters " +
      "match, the value is 1 + best[i-1][j-1]; if not, it is 0, because the run " +
      "is broken. And since the state is anchored at a position rather than " +
      "summarising a prefix, the answer is the largest entry anywhere in the " +
      "table rather than its last cell. That pairing — anchored state, maximum " +
      "over the table — is the same one the longest rising run used, and " +
      "recognising when a problem forces it is most of the difficulty here.",
    constraints: [
      "Each text holds between 0 and 1,000 lowercase letters.",
      "The block must be contiguous in both texts.",
      "Empty texts share a block of length 0.",
    ],
    hints: [
      "Entry [i][j] must mean the block *ending at* i and j, not the best so far.",
      "A mismatch resets that entry to zero rather than carrying anything over.",
      "The answer is the largest entry in the table, not the last one.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "longestSharedBlock",
      params: [
        { name: "first", type: "string" },
        { name: "second", type: "string" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-2d", "dsa-strings", "js-loops"],
    examples: [
      {
        input: 'first = "abcde", second = "abfce"',
        output: "2",
        explanation: '"ab" is the longest unbroken block in both.',
      },
      {
        input: 'first = "abc", second = "xyz"',
        output: "0",
      },
    ],
    tests: [
      { args: ["abcde", "abfce"], expected: 2 },
      { args: ["abc", "xyz"], expected: 0 },
      { args: ["abc", "abc"], expected: 3 },
      { args: ["", "a"], expected: 0, hidden: true },
      { args: ["aaa", "aa"], expected: 2, hidden: true },
      { args: ["ababc", "babca"], expected: 4, hidden: true },
      { args: ["xabcy", "zabcw"], expected: 3, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const m = first.length;
const n = second.length;
let previous = new Array(n + 1).fill(0);
let best = 0;
for (let i = 1; i <= m; i += 1) {
  const current = new Array(n + 1).fill(0);
  for (let j = 1; j <= n; j += 1) {
    if (first[i - 1] === second[j - 1]) {
      current[j] = previous[j - 1] + 1;
      if (current[j] > best) best = current[j];
    }
  }
  previous = current;
}
return best;`,
      TYPESCRIPT: `const m = first.length;
const n = second.length;
let previous: number[] = new Array(n + 1).fill(0);
let best = 0;
for (let i = 1; i <= m; i += 1) {
  const current: number[] = new Array(n + 1).fill(0);
  for (let j = 1; j <= n; j += 1) {
    if (first[i - 1] === second[j - 1]) {
      current[j] = previous[j - 1] + 1;
      if (current[j] > best) best = current[j];
    }
  }
  previous = current;
}
return best;`,
      PYTHON: `m, n = len(first), len(second)
previous = [0] * (n + 1)
best = 0
for i in range(1, m + 1):
    current = [0] * (n + 1)
    for j in range(1, n + 1):
        if first[i - 1] == second[j - 1]:
            current[j] = previous[j - 1] + 1
            best = max(best, current[j])
    previous = current
return best`,
      JAVA: `int m = first.length();
int n = second.length();
int[] previous = new int[n + 1];
int best = 0;
for (int i = 1; i <= m; i += 1) {
    int[] current = new int[n + 1];
    for (int j = 1; j <= n; j += 1) {
        if (first.charAt(i - 1) == second.charAt(j - 1)) {
            current[j] = previous[j - 1] + 1;
            best = Math.max(best, current[j]);
        }
    }
    previous = current;
}
return best;`,
      CPP: `int m = (int)first.size();
int n = (int)second.size();
vector<int> previous(n + 1, 0);
int best = 0;
for (int i = 1; i <= m; i += 1) {
    vector<int> current(n + 1, 0);
    for (int j = 1; j <= n; j += 1) {
        if (first[i - 1] == second[j - 1]) {
            current[j] = previous[j - 1] + 1;
            best = max(best, current[j]);
        }
    }
    previous = current;
}
return best;`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "split-into-equal-halves",
    title: "Split Into Two Equal Halves",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Report whether the values can be divided into two groups with the same " +
      "total. Every value must go into exactly one group.",
    explanation:
      "Two groups with equal totals means each holds half the overall sum, so an " +
      "odd total is impossible and can be rejected in one line. What is left is " +
      "the question of whether some subset reaches exactly half — a subset-sum " +
      "problem, which is knapsack without the values differing from the weights. " +
      "State: reachable[t] is true when some subset totals t. Process the values " +
      "one at a time, and for each, mark t as reachable when t - value already " +
      "was. The iteration must run *downwards* over the totals: going upwards " +
      "would let the same value be used twice within one pass, silently turning " +
      "this into the unlimited-supply problem. That downward loop is the whole " +
      "difference between the two knapsack variants and is worth being able to " +
      "explain rather than merely remember.",
    constraints: [
      "Between 1 and 200 values, each between 1 and 100.",
      "Every value must be placed in one of the two groups.",
      "An odd total makes the split impossible.",
    ],
    hints: [
      "Each group must hold exactly half the total, so an odd total fails immediately.",
      "Entry t says whether some subset reaches exactly t.",
      "Sweep the totals downwards, or a value gets used twice in one pass.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "splitIntoEqualHalves",
      params: [{ name: "values", type: "int[]" }],
      returns: "bool",
    },
    topicSlugs: ["dsa-dp-2d", "dsa-backtracking", "js-arrays"],
    examples: [
      {
        input: "values = [1, 5, 11, 5]",
        output: "true",
        explanation: "11 against 1 + 5 + 5.",
      },
      {
        input: "values = [1, 2, 3, 5]",
        output: "false",
        explanation: "The total is 11, which is odd.",
      },
    ],
    tests: [
      { args: [[1, 5, 11, 5]], expected: true },
      { args: [[1, 2, 3, 5]], expected: false },
      { args: [[1, 1]], expected: true },
      { args: [[1]], expected: false, hidden: true },
      { args: [[2, 2, 2, 2]], expected: true, hidden: true },
      { args: [[3, 3, 3, 4, 5]], expected: true, hidden: true },
      { args: [[100, 100, 100, 100, 100, 100, 100, 100]], expected: true, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let total = 0;
for (const value of values) total += value;
if (total % 2 !== 0) return false;

const half = total / 2;
const reachable = new Array(half + 1).fill(false);
reachable[0] = true;
for (const value of values) {
  for (let t = half; t >= value; t -= 1) {
    if (reachable[t - value]) reachable[t] = true;
  }
}
return reachable[half];`,
      TYPESCRIPT: `let total = 0;
for (const value of values) total += value;
if (total % 2 !== 0) return false;

const half = total / 2;
const reachable: boolean[] = new Array(half + 1).fill(false);
reachable[0] = true;
for (const value of values) {
  for (let t = half; t >= value; t -= 1) {
    if (reachable[t - value]) reachable[t] = true;
  }
}
return reachable[half];`,
      PYTHON: `total = sum(values)
if total % 2 != 0:
    return False

half = total // 2
reachable = [False] * (half + 1)
reachable[0] = True
for value in values:
    for t in range(half, value - 1, -1):
        if reachable[t - value]:
            reachable[t] = True
return reachable[half]`,
      JAVA: `int total = 0;
for (int value : values) total += value;
if (total % 2 != 0) return false;

int half = total / 2;
boolean[] reachable = new boolean[half + 1];
reachable[0] = true;
for (int value : values) {
    for (int t = half; t >= value; t -= 1) {
        if (reachable[t - value]) reachable[t] = true;
    }
}
return reachable[half];`,
      CPP: `int total = 0;
for (int value : values) total += value;
if (total % 2 != 0) return false;

int half = total / 2;
vector<bool> reachable(half + 1, false);
reachable[0] = true;
for (int value : values) {
    for (int t = half; t >= value; t -= 1) {
        if (reachable[t - value]) reachable[t] = true;
    }
}
return reachable[half];`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "best-value-within-the-weight-limit",
    title: "The Best Value Within the Weight Limit",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Each item has a weight and a value, given as pairs [weight, value], and " +
      "may be taken at most once. Return the largest total value that fits " +
      "within the weight limit.",
    explanation:
      "The classic knapsack, and the place to notice that the second dimension " +
      "of a 2-D DP need not be a position at all — here it is a *budget*. State: " +
      "best[w] is the greatest value achievable with capacity exactly w " +
      "available. For each item in turn, and for each capacity from the limit " +
      "downwards, taking the item gives value + best[w - weight], and the larger " +
      "of that and the existing entry wins. The downward sweep is again what " +
      "enforces at-most-once. Note that greedy on value-per-weight is wrong for " +
      "this version and right for the fractional one, where items may be split — " +
      "a distinction interviewers like precisely because the two problems sound " +
      "identical. Cost is O(items × limit), which is pseudo-polynomial: it grows " +
      "with the *value* of the limit rather than its size in digits.",
    constraints: [
      "Between 0 and 200 items, each a [weight, value] pair.",
      "Weights and values are between 0 and 1,000, and the limit is between 0 and 5,000.",
      "Each item may be taken at most once.",
    ],
    hints: [
      "The second dimension is the remaining capacity, not a position.",
      "For each item, sweep the capacities downwards.",
      "Greedy on value per unit weight solves the fractional version, not this one.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "bestValueWithinTheWeightLimit",
      params: [
        { name: "items", type: "int[][]" },
        { name: "limit", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-2d", "dsa-greedy", "js-arrays"],
    examples: [
      {
        input: "items = [[1, 1], [3, 4], [4, 5], [5, 7]], limit = 7",
        output: "9",
        explanation: "Take the [3,4] and the [4,5].",
      },
      {
        input: "items = [[5, 10]], limit = 4",
        output: "0",
        explanation: "The only item is too heavy.",
      },
    ],
    tests: [
      {
        args: [
          [
            [1, 1],
            [3, 4],
            [4, 5],
            [5, 7],
          ],
          7,
        ],
        expected: 9,
      },
      { args: [[[5, 10]], 4], expected: 0 },
      { args: [[], 10], expected: 0 },
      { args: [[[2, 3]], 2], expected: 3, hidden: true },
      {
        args: [
          [
            [1, 10],
            [1, 10],
          ],
          1,
        ],
        expected: 10,
        hidden: true,
      },
      {
        args: [
          [
            [2, 3],
            [3, 4],
            [4, 5],
          ],
          5,
        ],
        expected: 7,
        hidden: true,
      },
      { args: [[[0, 5]], 0], expected: 5, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const best = new Array(limit + 1).fill(0);
for (const [weight, value] of items) {
  for (let w = limit; w >= weight; w -= 1) {
    if (best[w - weight] + value > best[w]) best[w] = best[w - weight] + value;
  }
}
return best[limit];`,
      TYPESCRIPT: `const best: number[] = new Array(limit + 1).fill(0);
for (const item of items) {
  for (let w = limit; w >= item[0]; w -= 1) {
    if (best[w - item[0]] + item[1] > best[w]) best[w] = best[w - item[0]] + item[1];
  }
}
return best[limit];`,
      PYTHON: `best = [0] * (limit + 1)
for weight, value in items:
    for w in range(limit, weight - 1, -1):
        best[w] = max(best[w], best[w - weight] + value)
return best[limit]`,
      JAVA: `int[] best = new int[limit + 1];
for (int[] item : items) {
    for (int w = limit; w >= item[0]; w -= 1) {
        best[w] = Math.max(best[w], best[w - item[0]] + item[1]);
    }
}
return best[limit];`,
      CPP: `vector<int> best(limit + 1, 0);
for (const vector<int>& item : items) {
    for (int w = limit; w >= item[0]; w -= 1) {
        best[w] = max(best[w], best[w - item[0]] + item[1]);
    }
}
return best[limit];`,
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "count-subsets-reaching-target",
    title: "Count the Subsets Reaching a Target",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Give every value either a plus or a minus sign, then add them all up. " +
      "Count the assignments of signs whose total is exactly the target. Two " +
      "assignments differing at any position count separately, even if the " +
      "values there are equal.",
    explanation:
      "Searching all 2^n sign assignments is exponential; the transformation " +
      "makes it a subset-sum count. Let P be the values given a plus and N those " +
      "given a minus. Then P - N is the target and P + N is the total, so adding " +
      "the two gives P = (target + total) / 2 — a fixed number. So the answer is " +
      "the number of subsets summing to exactly that, which is one table indexed " +
      "by sum. Two rejections come free from this: if target + total is odd, or " +
      "if the target's magnitude exceeds the total, no assignment works. The " +
      "table is filled per value, sweeping downwards as before, and counts " +
      "rather than marks. Turning a signed problem into an unsigned one by " +
      "algebra is the transferable move — the DP itself is one already met.",
    constraints: [
      "Between 1 and 20 values, each between 0 and 1,000.",
      "The target is between -1,000 and 1,000.",
      "Positions are distinct, so equal values in different places count separately.",
    ],
    hints: [
      "Let P be the plus-signed values and N the minus-signed ones.",
      "P - N is the target and P + N is the total, which pins down P exactly.",
      "So count the subsets summing to that fixed number.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "countSubsetsReachingTarget",
      params: [
        { name: "values", type: "int[]" },
        { name: "target", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-2d", "dsa-backtracking", "js-arrays"],
    examples: [
      {
        input: "values = [1, 1, 1, 1, 1], target = 3",
        output: "5",
        explanation: "Any one of the five may take the minus sign.",
      },
      {
        input: "values = [1], target = 2",
        output: "0",
      },
    ],
    tests: [
      { args: [[1, 1, 1, 1, 1], 3], expected: 5 },
      { args: [[1], 2], expected: 0 },
      { args: [[1], 1], expected: 1 },
      { args: [[1], -1], expected: 1, hidden: true },
      { args: [[0, 0], 0], expected: 4, hidden: true },
      { args: [[1, 2, 3], 0], expected: 2, hidden: true },
      { args: [[2, 2], 4], expected: 1, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let total = 0;
for (const value of values) total += value;
if (target > total || target < -total) return 0;
if ((target + total) % 2 !== 0) return 0;

const wanted = (target + total) / 2;
const ways = new Array(wanted + 1).fill(0);
ways[0] = 1;
for (const value of values) {
  for (let s = wanted; s >= value; s -= 1) ways[s] += ways[s - value];
}
return ways[wanted];`,
      TYPESCRIPT: `let total = 0;
for (const value of values) total += value;
if (target > total || target < -total) return 0;
if ((target + total) % 2 !== 0) return 0;

const wanted = (target + total) / 2;
const ways: number[] = new Array(wanted + 1).fill(0);
ways[0] = 1;
for (const value of values) {
  for (let s = wanted; s >= value; s -= 1) ways[s] += ways[s - value];
}
return ways[wanted];`,
      PYTHON: `total = sum(values)
if target > total or target < -total:
    return 0
if (target + total) % 2 != 0:
    return 0

wanted = (target + total) // 2
ways = [0] * (wanted + 1)
ways[0] = 1
for value in values:
    for s in range(wanted, value - 1, -1):
        ways[s] += ways[s - value]
return ways[wanted]`,
      JAVA: `int total = 0;
for (int value : values) total += value;
if (target > total || target < -total) return 0;
if ((target + total) % 2 != 0) return 0;

int wanted = (target + total) / 2;
int[] ways = new int[wanted + 1];
ways[0] = 1;
for (int value : values) {
    for (int s = wanted; s >= value; s -= 1) ways[s] += ways[s - value];
}
return ways[wanted];`,
      CPP: `int total = 0;
for (int value : values) total += value;
if (target > total || target < -total) return 0;
if ((target + total) % 2 != 0) return 0;

int wanted = (target + total) / 2;
vector<int> ways(wanted + 1, 0);
ways[0] = 1;
for (int value : values) {
    for (int s = wanted; s >= value; s -= 1) ways[s] += ways[s - value];
}
return ways[wanted];`,
    },
  },

  // ── 9 ───────────────────────────────────────────────────────────────────
  {
    slug: "edits-to-turn-one-into-the-other",
    title: "Edits to Turn One Text Into the Other",
    difficulty: "HARD",
    interviewFrequency: "VERY_HIGH",
    description:
      "Return the fewest single-character edits — inserting, deleting or " +
      "replacing one character — needed to turn the first text into the second.",
    explanation:
      "State: cost[i][j] is the fewest edits turning the first i characters of " +
      "one into the first j of the other. If the last characters match, nothing " +
      "need be done about them and the cost is cost[i-1][j-1]. If they differ, " +
      "the last edit was one of exactly three things: replace, giving " +
      "1 + cost[i-1][j-1]; delete from the first, giving 1 + cost[i-1][j]; or " +
      "insert into the first, giving 1 + cost[i][j-1]. Take the smallest. The " +
      "base cases are the empty prefixes: turning nothing into j characters " +
      "costs j insertions, and the reverse costs i deletions. Being able to say " +
      "which of the three neighbours corresponds to which edit is what separates " +
      "understanding this table from memorising it, and it is the exact question " +
      "an interviewer asks when you write it down.",
    constraints: [
      "Each text holds between 0 and 500 lowercase letters.",
      "Inserting, deleting and replacing each cost one edit.",
      "Turning a text into itself costs nothing.",
    ],
    hints: [
      "Entry [i][j] is the cost for the first i of one and the first j of the other.",
      "Matching last characters cost nothing extra.",
      "Otherwise the last edit was a replace, a delete or an insert — one per neighbour.",
    ],
    estimatedTime: "45 min",
    signature: {
      name: "editsToTurnOneIntoTheOther",
      params: [
        { name: "first", type: "string" },
        { name: "second", type: "string" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-2d", "dsa-strings", "js-loops"],
    examples: [
      {
        input: 'first = "horse", second = "ros"',
        output: "3",
        explanation: "Replace the h, delete the r, delete the e.",
      },
      {
        input: 'first = "", second = "abc"',
        output: "3",
        explanation: "Three insertions.",
      },
    ],
    tests: [
      { args: ["horse", "ros"], expected: 3 },
      { args: ["", "abc"], expected: 3 },
      { args: ["abc", "abc"], expected: 0 },
      { args: ["", ""], expected: 0, hidden: true },
      { args: ["abc", ""], expected: 3, hidden: true },
      { args: ["intention", "execution"], expected: 5, hidden: true },
      { args: ["a", "b"], expected: 1, hidden: true },
      { args: ["sunday", "saturday"], expected: 3, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const m = first.length;
const n = second.length;
let previous = new Array(n + 1).fill(0);
for (let j = 0; j <= n; j += 1) previous[j] = j;

for (let i = 1; i <= m; i += 1) {
  const current = new Array(n + 1).fill(0);
  current[0] = i;
  for (let j = 1; j <= n; j += 1) {
    if (first[i - 1] === second[j - 1]) current[j] = previous[j - 1];
    else {
      current[j] = 1 + Math.min(previous[j - 1], previous[j], current[j - 1]);
    }
  }
  previous = current;
}
return previous[n];`,
      TYPESCRIPT: `const m = first.length;
const n = second.length;
let previous: number[] = new Array(n + 1).fill(0);
for (let j = 0; j <= n; j += 1) previous[j] = j;

for (let i = 1; i <= m; i += 1) {
  const current: number[] = new Array(n + 1).fill(0);
  current[0] = i;
  for (let j = 1; j <= n; j += 1) {
    if (first[i - 1] === second[j - 1]) current[j] = previous[j - 1];
    else {
      current[j] = 1 + Math.min(previous[j - 1], previous[j], current[j - 1]);
    }
  }
  previous = current;
}
return previous[n];`,
      PYTHON: `m, n = len(first), len(second)
previous = list(range(n + 1))

for i in range(1, m + 1):
    current = [0] * (n + 1)
    current[0] = i
    for j in range(1, n + 1):
        if first[i - 1] == second[j - 1]:
            current[j] = previous[j - 1]
        else:
            current[j] = 1 + min(previous[j - 1], previous[j], current[j - 1])
    previous = current
return previous[n]`,
      JAVA: `int m = first.length();
int n = second.length();
int[] previous = new int[n + 1];
for (int j = 0; j <= n; j += 1) previous[j] = j;

for (int i = 1; i <= m; i += 1) {
    int[] current = new int[n + 1];
    current[0] = i;
    for (int j = 1; j <= n; j += 1) {
        if (first.charAt(i - 1) == second.charAt(j - 1)) current[j] = previous[j - 1];
        else {
            current[j] = 1 + Math.min(previous[j - 1], Math.min(previous[j], current[j - 1]));
        }
    }
    previous = current;
}
return previous[n];`,
      CPP: `int m = (int)first.size();
int n = (int)second.size();
vector<int> previous(n + 1, 0);
for (int j = 0; j <= n; j += 1) previous[j] = j;

for (int i = 1; i <= m; i += 1) {
    vector<int> current(n + 1, 0);
    current[0] = i;
    for (int j = 1; j <= n; j += 1) {
        if (first[i - 1] == second[j - 1]) current[j] = previous[j - 1];
        else {
            current[j] = 1 + min(previous[j - 1], min(previous[j], current[j - 1]));
        }
    }
    previous = current;
}
return previous[n];`,
    },
  },

  // ── 10 ──────────────────────────────────────────────────────────────────
  {
    slug: "longest-palindromic-subsequence",
    title: "The Longest Palindromic Subsequence",
    difficulty: "HARD",
    interviewFrequency: "HIGH",
    description:
      "Return the length of the longest sequence of characters that appears in " +
      "the text in order, not necessarily next to each other, and reads the same " +
      "forwards and backwards.",
    explanation:
      "There is a one-line answer worth spotting first: a palindromic " +
      "subsequence of the text is exactly a subsequence shared by the text and " +
      "its reverse, so running the longest-shared-subsequence table against the " +
      "reversed text solves it immediately. The direct formulation is more " +
      "instructive though, because it introduces an interval state. Let " +
      "best[i][j] be the answer for the stretch from i to j. If the two ends " +
      "match they can both be taken, giving 2 + best[i+1][j-1]; if not, one end " +
      "must be dropped, so take the better of best[i+1][j] and best[i][j-1]. " +
      "Every stretch of length one scores 1. The fill order is the new part: the " +
      "table must be filled by increasing stretch length, not by row, because a " +
      "stretch depends on shorter stretches inside it. That ordering is what the " +
      "advanced interval problems all rest on.",
    constraints: [
      "The text holds between 1 and 500 lowercase letters.",
      "The subsequence must read the same in both directions.",
      "A single character is a palindrome of length 1.",
    ],
    hints: [
      "It equals the longest subsequence shared by the text and its reverse.",
      "Directly: let entry [i][j] be the answer for the stretch from i to j.",
      "Fill the table by increasing stretch length, since each depends on shorter ones.",
    ],
    estimatedTime: "45 min",
    signature: {
      name: "longestPalindromicSubsequence",
      params: [{ name: "text", type: "string" }],
      returns: "int",
    },
    topicSlugs: ["dsa-dp-2d", "dsa-strings", "dsa-dp-advanced"],
    examples: [
      {
        input: 'text = "bbbab"',
        output: "4",
        explanation: '"bbbb".',
      },
      {
        input: 'text = "cbbd"',
        output: "2",
        explanation: '"bb".',
      },
    ],
    tests: [
      { args: ["bbbab"], expected: 4 },
      { args: ["cbbd"], expected: 2 },
      { args: ["a"], expected: 1 },
      { args: ["abcde"], expected: 1, hidden: true },
      { args: ["aaaa"], expected: 4, hidden: true },
      { args: ["racecar"], expected: 7, hidden: true },
      { args: ["agbdba"], expected: 5, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const n = text.length;
const best = Array.from({ length: n }, () => new Array(n).fill(0));
for (let i = 0; i < n; i += 1) best[i][i] = 1;

for (let span = 2; span <= n; span += 1) {
  for (let i = 0; i + span - 1 < n; i += 1) {
    const j = i + span - 1;
    if (text[i] === text[j]) best[i][j] = 2 + (span === 2 ? 0 : best[i + 1][j - 1]);
    else best[i][j] = Math.max(best[i + 1][j], best[i][j - 1]);
  }
}
return best[0][n - 1];`,
      TYPESCRIPT: `const n = text.length;
const best: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
for (let i = 0; i < n; i += 1) best[i][i] = 1;

for (let span = 2; span <= n; span += 1) {
  for (let i = 0; i + span - 1 < n; i += 1) {
    const j = i + span - 1;
    if (text[i] === text[j]) best[i][j] = 2 + (span === 2 ? 0 : best[i + 1][j - 1]);
    else best[i][j] = Math.max(best[i + 1][j], best[i][j - 1]);
  }
}
return best[0][n - 1];`,
      PYTHON: `n = len(text)
best = [[0] * n for _ in range(n)]
for i in range(n):
    best[i][i] = 1

for span in range(2, n + 1):
    for i in range(0, n - span + 1):
        j = i + span - 1
        if text[i] == text[j]:
            best[i][j] = 2 + (0 if span == 2 else best[i + 1][j - 1])
        else:
            best[i][j] = max(best[i + 1][j], best[i][j - 1])
return best[0][n - 1]`,
      JAVA: `int n = text.length();
int[][] best = new int[n][n];
for (int i = 0; i < n; i += 1) best[i][i] = 1;

for (int span = 2; span <= n; span += 1) {
    for (int i = 0; i + span - 1 < n; i += 1) {
        int j = i + span - 1;
        if (text.charAt(i) == text.charAt(j)) {
            best[i][j] = 2 + (span == 2 ? 0 : best[i + 1][j - 1]);
        } else {
            best[i][j] = Math.max(best[i + 1][j], best[i][j - 1]);
        }
    }
}
return best[0][n - 1];`,
      CPP: `int n = (int)text.size();
vector<vector<int>> best(n, vector<int>(n, 0));
for (int i = 0; i < n; i += 1) best[i][i] = 1;

for (int span = 2; span <= n; span += 1) {
    for (int i = 0; i + span - 1 < n; i += 1) {
        int j = i + span - 1;
        if (text[i] == text[j]) best[i][j] = 2 + (span == 2 ? 0 : best[i + 1][j - 1]);
        else best[i][j] = max(best[i + 1][j], best[i][j - 1]);
    }
}
return best[0][n - 1];`,
    },
  },

  // ── 11 ──────────────────────────────────────────────────────────────────
  {
    slug: "match-with-star-wildcards",
    title: "Match With Star Wildcards",
    difficulty: "HARD",
    interviewFrequency: "HIGH",
    description:
      "The pattern holds lowercase letters, question marks and stars. A question " +
      "mark matches exactly one character; a star matches any run of characters, " +
      "including none at all. Report whether the pattern matches the whole text.",
    explanation:
      "State: matches[i][j] is true when the first i characters of the text are " +
      "matched by the first j of the pattern. A letter or a question mark " +
      "consumes exactly one of each, so it depends on matches[i-1][j-1] — with " +
      "the letter also having to agree. The star is the interesting arm and has " +
      "two readings that must both be tried: it matches nothing, leaving " +
      "matches[i][j-1], or it matches one more character, leaving " +
      "matches[i-1][j]. That second reading is what lets a single star absorb a " +
      "run of any length without the state ever needing to record how much it " +
      "has swallowed. The base row matters: empty text is matched by a pattern " +
      "of stars alone, and by nothing else, so it must be filled deliberately " +
      "rather than left false. A greedy two-pointer solution also exists and is " +
      "faster, but this table is the one to be able to derive.",
    constraints: [
      "The text holds between 0 and 2,000 lowercase letters.",
      "The pattern holds between 0 and 2,000 characters: letters, '?' and '*'.",
      "The whole text must be matched, not merely a prefix.",
    ],
    hints: [
      "Entry [i][j] says whether the first i of the text match the first j of the pattern.",
      "A star either matches nothing or swallows one more character — try both.",
      "Empty text is matched by a pattern of stars and nothing else.",
    ],
    estimatedTime: "50 min",
    signature: {
      name: "matchWithStarWildcards",
      params: [
        { name: "text", type: "string" },
        { name: "pattern", type: "string" },
      ],
      returns: "bool",
    },
    topicSlugs: ["dsa-dp-2d", "dsa-strings", "dsa-dp-advanced"],
    examples: [
      {
        input: 'text = "adceb", pattern = "*a*b"',
        output: "true",
        explanation: 'The first star matches nothing and the second matches "dce".',
      },
      {
        input: 'text = "acdcb", pattern = "a*c?b"',
        output: "false",
      },
    ],
    tests: [
      { args: ["adceb", "*a*b"], expected: true },
      { args: ["acdcb", "a*c?b"], expected: false },
      { args: ["aa", "a"], expected: false },
      { args: ["", "*"], expected: true, hidden: true },
      { args: ["", ""], expected: true, hidden: true },
      { args: ["", "a"], expected: false, hidden: true },
      { args: ["aa", "*"], expected: true, hidden: true },
      { args: ["cb", "?a"], expected: false, hidden: true },
      { args: ["abc", "a?c"], expected: true, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const m = text.length;
const n = pattern.length;
let previous = new Array(n + 1).fill(false);
previous[0] = true;
for (let j = 1; j <= n; j += 1) {
  previous[j] = previous[j - 1] && pattern[j - 1] === "*";
}

for (let i = 1; i <= m; i += 1) {
  const current = new Array(n + 1).fill(false);
  for (let j = 1; j <= n; j += 1) {
    const p = pattern[j - 1];
    if (p === "*") current[j] = current[j - 1] || previous[j];
    else if (p === "?" || p === text[i - 1]) current[j] = previous[j - 1];
  }
  previous = current;
}
return previous[n];`,
      TYPESCRIPT: `const m = text.length;
const n = pattern.length;
let previous: boolean[] = new Array(n + 1).fill(false);
previous[0] = true;
for (let j = 1; j <= n; j += 1) {
  previous[j] = previous[j - 1] && pattern[j - 1] === "*";
}

for (let i = 1; i <= m; i += 1) {
  const current: boolean[] = new Array(n + 1).fill(false);
  for (let j = 1; j <= n; j += 1) {
    const p = pattern[j - 1];
    if (p === "*") current[j] = current[j - 1] || previous[j];
    else if (p === "?" || p === text[i - 1]) current[j] = previous[j - 1];
  }
  previous = current;
}
return previous[n];`,
      PYTHON: `m, n = len(text), len(pattern)
previous = [False] * (n + 1)
previous[0] = True
for j in range(1, n + 1):
    previous[j] = previous[j - 1] and pattern[j - 1] == "*"

for i in range(1, m + 1):
    current = [False] * (n + 1)
    for j in range(1, n + 1):
        p = pattern[j - 1]
        if p == "*":
            current[j] = current[j - 1] or previous[j]
        elif p == "?" or p == text[i - 1]:
            current[j] = previous[j - 1]
    previous = current
return previous[n]`,
      JAVA: `int m = text.length();
int n = pattern.length();
boolean[] previous = new boolean[n + 1];
previous[0] = true;
for (int j = 1; j <= n; j += 1) {
    previous[j] = previous[j - 1] && pattern.charAt(j - 1) == '*';
}

for (int i = 1; i <= m; i += 1) {
    boolean[] current = new boolean[n + 1];
    for (int j = 1; j <= n; j += 1) {
        char p = pattern.charAt(j - 1);
        if (p == '*') current[j] = current[j - 1] || previous[j];
        else if (p == '?' || p == text.charAt(i - 1)) current[j] = previous[j - 1];
    }
    previous = current;
}
return previous[n];`,
      CPP: `int m = (int)text.size();
int n = (int)pattern.size();
vector<bool> previous(n + 1, false);
previous[0] = true;
for (int j = 1; j <= n; j += 1) {
    previous[j] = previous[j - 1] && pattern[j - 1] == '*';
}

for (int i = 1; i <= m; i += 1) {
    vector<bool> current(n + 1, false);
    for (int j = 1; j <= n; j += 1) {
        char p = pattern[j - 1];
        if (p == '*') current[j] = current[j - 1] || previous[j];
        else if (p == '?' || p == text[i - 1]) current[j] = previous[j - 1];
    }
    previous = current;
}
return previous[n];`,
    },
  },
];
