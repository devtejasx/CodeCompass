import type { SeedProblem } from "../../problems/types";

/**
 * Graph depth-first search.
 *
 * Two shapes of graph appear here and both are worth being fluent in. A grid is
 * a graph whose nodes are squares and whose edges are the four neighbours —
 * nothing needs building, and the "adjacency list" is arithmetic on row and
 * column. An edge list needs converting into an adjacency list first, and doing
 * that conversion by reflex is half of what makes graph problems feel routine.
 *
 * The recurring rule is: mark a node as visited when you *enter* it, not when
 * you leave. Marking late lets a node be queued or recursed into twice, which
 * turns a linear traversal into an exponential one and is the single most
 * common graph bug.
 *
 * Cycle detection is the one place where the rules differ between directed and
 * undirected graphs, and that difference gets a problem of its own rather than
 * a footnote.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const GRAPH_DFS_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "flood-fill-a-region",
    title: "Flood Fill a Region",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Starting from one square of the grid, recolour it and every square " +
      "reachable from it through horizontal or vertical neighbours of the same " +
      "original colour. Return the whole grid afterwards.",
    explanation:
      "A grid is a graph in disguise: the nodes are squares and each has up to " +
      "four edges. Recolouring the connected region is a depth-first search that " +
      "recolours each square as it arrives. The detail that makes it terminate " +
      "is recolouring on entry rather than on exit — a square already holding " +
      "the new colour is no longer a match, so it is never re-entered, and the " +
      "recolouring doubles as the visited marker without a second grid. The one " +
      "case that catches people out is when the new colour equals the original: " +
      "the marker then marks nothing, and the search runs forever. Checking for " +
      "that up front and returning immediately is one line and is the whole " +
      "reason this problem is asked. The grid is kept small here so the " +
      "recursion is safe; the problems after this one allow far bigger inputs " +
      "and carry their own stack for exactly that reason.",
    constraints: [
      "The grid has between 1 and 30 rows and between 1 and 30 columns.",
      "Colours are between 0 and 65,535, and the starting square is inside the grid.",
      "Only horizontal and vertical neighbours connect; diagonals do not.",
    ],
    hints: [
      "The grid is a graph — each square has up to four neighbours.",
      "Recolour a square as you enter it, and it becomes its own visited marker.",
      "If the new colour equals the old one, the marker marks nothing.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "floodFillARegion",
      params: [
        { name: "grid", type: "int[][]" },
        { name: "row", type: "int" },
        { name: "column", type: "int" },
        { name: "colour", type: "int" },
      ],
      returns: "int[][]",
    },
    topicSlugs: ["dsa-graph-dfs", "dsa-recursion", "js-arrays"],
    examples: [
      {
        input: "grid = [[1, 1, 1], [1, 1, 0], [1, 0, 1]], row = 1, column = 1, colour = 2",
        output: "[[2, 2, 2], [2, 2, 0], [2, 0, 1]]",
        explanation: "The bottom-right 1 is cut off by the zeros, so it stays.",
      },
      {
        input: "grid = [[0, 0], [0, 0]], row = 0, column = 0, colour = 0",
        output: "[[0, 0], [0, 0]]",
        explanation: "The new colour is the old one, so nothing changes and nothing loops.",
      },
    ],
    tests: [
      {
        args: [
          [
            [1, 1, 1],
            [1, 1, 0],
            [1, 0, 1],
          ],
          1,
          1,
          2,
        ],
        expected: [
          [2, 2, 2],
          [2, 2, 0],
          [2, 0, 1],
        ],
      },
      {
        args: [
          [
            [0, 0],
            [0, 0],
          ],
          0,
          0,
          0,
        ],
        expected: [
          [0, 0],
          [0, 0],
        ],
      },
      { args: [[[5]], 0, 0, 9], expected: [[9]] },
      {
        args: [
          [
            [1, 2],
            [2, 1],
          ],
          0,
          0,
          3,
        ],
        expected: [
          [3, 2],
          [2, 1],
        ],
        hidden: true,
      },
      {
        args: [
          [
            [1, 1],
            [1, 1],
          ],
          1,
          1,
          7,
        ],
        expected: [
          [7, 7],
          [7, 7],
        ],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const painted = grid.map((line) => [...line]);
const original = painted[row][column];
if (original === colour) return painted;

function fill(r, c) {
  if (r < 0 || r >= painted.length || c < 0 || c >= painted[0].length) return;
  if (painted[r][c] !== original) return;
  painted[r][c] = colour;
  fill(r + 1, c);
  fill(r - 1, c);
  fill(r, c + 1);
  fill(r, c - 1);
}

fill(row, column);
return painted;`,
      TYPESCRIPT: `const painted: number[][] = grid.map((line) => [...line]);
const original = painted[row][column];
if (original === colour) return painted;

function fill(r: number, c: number): void {
  if (r < 0 || r >= painted.length || c < 0 || c >= painted[0].length) return;
  if (painted[r][c] !== original) return;
  painted[r][c] = colour;
  fill(r + 1, c);
  fill(r - 1, c);
  fill(r, c + 1);
  fill(r, c - 1);
}

fill(row, column);
return painted;`,
      PYTHON: `painted = [list(line) for line in grid]
original = painted[row][column]
if original == colour:
    return painted

def fill(r, c):
    if r < 0 or r >= len(painted) or c < 0 or c >= len(painted[0]):
        return
    if painted[r][c] != original:
        return
    painted[r][c] = colour
    fill(r + 1, c)
    fill(r - 1, c)
    fill(r, c + 1)
    fill(r, c - 1)

fill(row, column)
return painted`,
      JAVA: `int[][] painted = new int[grid.length][];
for (int i = 0; i < grid.length; i += 1) painted[i] = grid[i].clone();
int original = painted[row][column];
if (original == colour) return painted;

class Fill {
    void fill(int r, int c) {
        if (r < 0 || r >= painted.length || c < 0 || c >= painted[0].length) return;
        if (painted[r][c] != original) return;
        painted[r][c] = colour;
        fill(r + 1, c);
        fill(r - 1, c);
        fill(r, c + 1);
        fill(r, c - 1);
    }
}

new Fill().fill(row, column);
return painted;`,
      CPP: `vector<vector<int>> painted = grid;
int original = painted[row][column];
if (original == colour) return painted;

function<void(int, int)> fill = [&](int r, int c) {
    if (r < 0 || r >= (int)painted.size() || c < 0 || c >= (int)painted[0].size()) return;
    if (painted[r][c] != original) return;
    painted[r][c] = colour;
    fill(r + 1, c);
    fill(r - 1, c);
    fill(r, c + 1);
    fill(r, c - 1);
};

fill(row, column);
return painted;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "count-the-islands",
    title: "Count the Islands",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "The grid holds 1 for land and 0 for water. An island is a group of land " +
      "squares joined horizontally or vertically. Return how many islands there " +
      "are.",
    explanation:
      "Sweep every square. When an unvisited land square turns up, it belongs to " +
      "an island nobody has counted yet, so add one to the total and then run a " +
      "depth-first search that sinks the whole island — marking every square " +
      "reachable from it. Because the search consumes the entire island before " +
      "the sweep continues, the sweep can never count the same island twice, and " +
      "each square is visited a constant number of times, so the whole thing is " +
      "O(rows × columns). The outer loop counts and the inner search erases: " +
      "keeping those two jobs separate is what makes this the template for every " +
      "connected-components question, on grids or otherwise. Sinking the island " +
      "in place avoids a second grid, at the cost of modifying the input — worth " +
      "saying out loud, and worth copying first when the caller still needs it. " +
      "The search here keeps its own stack rather than recursing: one island can " +
      "cover the whole grid, and ninety thousand nested calls overflow the stack " +
      "in every language this problem is offered in.",
    constraints: [
      "The grid has between 1 and 300 rows and between 1 and 300 columns.",
      "Every square is 0 or 1.",
      "Only horizontal and vertical neighbours join; diagonals do not.",
    ],
    hints: [
      "Every unvisited land square you meet in the sweep starts a new island.",
      "Erase the whole island before the sweep moves on.",
      "The outer loop counts; the search only marks.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "countTheIslands",
      params: [{ name: "grid", type: "int[][]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-graph-dfs", "dsa-recursion", "js-arrays"],
    examples: [
      {
        input: "grid = [[1, 1, 0], [0, 1, 0], [0, 0, 1]]",
        output: "2",
        explanation: "Three joined land squares form one island; the corner forms another.",
      },
      {
        input: "grid = [[0, 0], [0, 0]]",
        output: "0",
      },
    ],
    tests: [
      {
        args: [
          [
            [1, 1, 0],
            [0, 1, 0],
            [0, 0, 1],
          ],
        ],
        expected: 2,
      },
      {
        args: [
          [
            [0, 0],
            [0, 0],
          ],
        ],
        expected: 0,
      },
      { args: [[[1]]], expected: 1 },
      {
        args: [
          [
            [1, 0, 1],
            [0, 1, 0],
            [1, 0, 1],
          ],
        ],
        expected: 5,
        hidden: true,
      },
      {
        args: [
          [
            [1, 1],
            [1, 1],
          ],
        ],
        expected: 1,
        hidden: true,
      },
      {
        args: [[[1, 0, 1, 0, 1]]],
        expected: 3,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const land = grid.map((line) => [...line]);
const rows = land.length;
const columns = land[0].length;
const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function sink(startRow, startColumn) {
  const stack = [[startRow, startColumn]];
  land[startRow][startColumn] = 0;
  while (stack.length > 0) {
    const [r, c] = stack.pop();
    for (const [dr, dc] of steps) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
      if (land[nr][nc] !== 1) continue;
      land[nr][nc] = 0;
      stack.push([nr, nc]);
    }
  }
}

let islands = 0;
for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < columns; c += 1) {
    if (land[r][c] === 1) {
      islands += 1;
      sink(r, c);
    }
  }
}
return islands;`,
      TYPESCRIPT: `const land: number[][] = grid.map((line) => [...line]);
const rows = land.length;
const columns = land[0].length;
const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function sink(startRow: number, startColumn: number): void {
  const stack: number[][] = [[startRow, startColumn]];
  land[startRow][startColumn] = 0;
  while (stack.length > 0) {
    const at = stack.pop() as number[];
    for (const step of steps) {
      const nr = at[0] + step[0];
      const nc = at[1] + step[1];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
      if (land[nr][nc] !== 1) continue;
      land[nr][nc] = 0;
      stack.push([nr, nc]);
    }
  }
}

let islands = 0;
for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < columns; c += 1) {
    if (land[r][c] === 1) {
      islands += 1;
      sink(r, c);
    }
  }
}
return islands;`,
      PYTHON: `land = [list(line) for line in grid]
rows = len(land)
columns = len(land[0])

def sink(start_row, start_column):
    stack = [(start_row, start_column)]
    land[start_row][start_column] = 0
    while stack:
        r, c = stack.pop()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if nr < 0 or nr >= rows or nc < 0 or nc >= columns:
                continue
            if land[nr][nc] != 1:
                continue
            land[nr][nc] = 0
            stack.append((nr, nc))

islands = 0
for r in range(rows):
    for c in range(columns):
        if land[r][c] == 1:
            islands += 1
            sink(r, c)
return islands`,
      JAVA: `int[][] land = new int[grid.length][];
for (int i = 0; i < grid.length; i += 1) land[i] = grid[i].clone();
int rows = land.length;
int columns = land[0].length;

int[][] steps = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
class Search {
    void sink(int startRow, int startColumn) {
        Deque<int[]> stack = new ArrayDeque<>();
        stack.push(new int[] {startRow, startColumn});
        land[startRow][startColumn] = 0;
        while (!stack.isEmpty()) {
            int[] at = stack.pop();
            for (int[] step : steps) {
                int nr = at[0] + step[0];
                int nc = at[1] + step[1];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
                if (land[nr][nc] != 1) continue;
                land[nr][nc] = 0;
                stack.push(new int[] {nr, nc});
            }
        }
    }
}

Search search = new Search();
int islands = 0;
for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < columns; c += 1) {
        if (land[r][c] == 1) {
            islands += 1;
            search.sink(r, c);
        }
    }
}
return islands;`,
      CPP: `vector<vector<int>> land = grid;
int rows = (int)land.size();
int columns = (int)land[0].size();
int steps[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

auto sink = [&](int startRow, int startColumn) {
    vector<pair<int, int>> stack{{startRow, startColumn}};
    land[startRow][startColumn] = 0;
    while (!stack.empty()) {
        pair<int, int> at = stack.back();
        stack.pop_back();
        for (auto& step : steps) {
            int nr = at.first + step[0];
            int nc = at.second + step[1];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
            if (land[nr][nc] != 1) continue;
            land[nr][nc] = 0;
            stack.push_back({nr, nc});
        }
    }
};

int islands = 0;
for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < columns; c += 1) {
        if (land[r][c] == 1) {
            islands += 1;
            sink(r, c);
        }
    }
}
return islands;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "largest-island-area",
    title: "The Largest Island",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "The grid holds 1 for land and 0 for water. Return the number of squares " +
      "in the largest island, where an island is land joined horizontally or " +
      "vertically. A grid with no land gives 0.",
    explanation:
      "The same sweep as counting islands, with the search returning a size " +
      "instead of nothing. A square contributes one, plus whatever its four " +
      "neighbours contribute, and marking on entry means each square contributes " +
      "exactly once. The outer loop takes the maximum over the sizes it is " +
      "handed. What makes this worth doing after the count is that it shows the " +
      "search *carrying a result upwards* rather than only marking — which is " +
      "the same distinction the tree files made between a traversal that visits " +
      "and one that computes. The search keeps its own stack, because one island " +
      "may cover a three-hundred-square grid and that many nested calls overflows " +
      "the call stack; counting a square as it is popped rather than summing what " +
      "four recursive calls return is the same total arrived at differently.",
    constraints: [
      "The grid has between 1 and 300 rows and between 1 and 300 columns.",
      "Every square is 0 or 1.",
      "Only horizontal and vertical neighbours join.",
    ],
    hints: [
      "This is the island count with the search returning a number.",
      "A square's contribution is one plus what its neighbours report.",
      "Out of bounds and water both contribute zero — one base case covers both.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "largestIslandArea",
      params: [{ name: "grid", type: "int[][]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-graph-dfs", "dsa-recursion", "js-arrays"],
    examples: [
      {
        input: "grid = [[1, 1, 0], [0, 1, 0], [1, 0, 1]]",
        output: "3",
        explanation: "The three joined squares beat the two lone ones.",
      },
      {
        input: "grid = [[0, 0], [0, 0]]",
        output: "0",
      },
    ],
    tests: [
      {
        args: [
          [
            [1, 1, 0],
            [0, 1, 0],
            [1, 0, 1],
          ],
        ],
        expected: 3,
      },
      {
        args: [
          [
            [0, 0],
            [0, 0],
          ],
        ],
        expected: 0,
      },
      { args: [[[1]]], expected: 1 },
      {
        args: [
          [
            [1, 1],
            [1, 1],
          ],
        ],
        expected: 4,
        hidden: true,
      },
      {
        args: [[[1, 0, 1, 1]]],
        expected: 2,
        hidden: true,
      },
      {
        args: [
          [
            [1, 0, 0],
            [1, 0, 1],
            [1, 0, 1],
          ],
        ],
        expected: 3,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const land = grid.map((line) => [...line]);
const rows = land.length;
const columns = land[0].length;
const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function area(startRow, startColumn) {
  const stack = [[startRow, startColumn]];
  land[startRow][startColumn] = 0;
  let size = 0;
  while (stack.length > 0) {
    const [r, c] = stack.pop();
    size += 1;
    for (const [dr, dc] of steps) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
      if (land[nr][nc] !== 1) continue;
      land[nr][nc] = 0;
      stack.push([nr, nc]);
    }
  }
  return size;
}

let largest = 0;
for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < columns; c += 1) {
    if (land[r][c] !== 1) continue;
    const size = area(r, c);
    if (size > largest) largest = size;
  }
}
return largest;`,
      TYPESCRIPT: `const land: number[][] = grid.map((line) => [...line]);
const rows = land.length;
const columns = land[0].length;
const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function area(startRow: number, startColumn: number): number {
  const stack: number[][] = [[startRow, startColumn]];
  land[startRow][startColumn] = 0;
  let size = 0;
  while (stack.length > 0) {
    const at = stack.pop() as number[];
    size += 1;
    for (const step of steps) {
      const nr = at[0] + step[0];
      const nc = at[1] + step[1];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
      if (land[nr][nc] !== 1) continue;
      land[nr][nc] = 0;
      stack.push([nr, nc]);
    }
  }
  return size;
}

let largest = 0;
for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < columns; c += 1) {
    if (land[r][c] !== 1) continue;
    const size = area(r, c);
    if (size > largest) largest = size;
  }
}
return largest;`,
      PYTHON: `land = [list(line) for line in grid]
rows = len(land)
columns = len(land[0])

def area(start_row, start_column):
    stack = [(start_row, start_column)]
    land[start_row][start_column] = 0
    size = 0
    while stack:
        r, c = stack.pop()
        size += 1
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if nr < 0 or nr >= rows or nc < 0 or nc >= columns:
                continue
            if land[nr][nc] != 1:
                continue
            land[nr][nc] = 0
            stack.append((nr, nc))
    return size

largest = 0
for r in range(rows):
    for c in range(columns):
        if land[r][c] == 1:
            largest = max(largest, area(r, c))
return largest`,
      JAVA: `int[][] land = new int[grid.length][];
for (int i = 0; i < grid.length; i += 1) land[i] = grid[i].clone();
int rows = land.length;
int columns = land[0].length;

int[][] steps = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
class Search {
    int area(int startRow, int startColumn) {
        Deque<int[]> stack = new ArrayDeque<>();
        stack.push(new int[] {startRow, startColumn});
        land[startRow][startColumn] = 0;
        int size = 0;
        while (!stack.isEmpty()) {
            int[] at = stack.pop();
            size += 1;
            for (int[] step : steps) {
                int nr = at[0] + step[0];
                int nc = at[1] + step[1];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
                if (land[nr][nc] != 1) continue;
                land[nr][nc] = 0;
                stack.push(new int[] {nr, nc});
            }
        }
        return size;
    }
}

Search search = new Search();
int largest = 0;
for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < columns; c += 1) {
        if (land[r][c] != 1) continue;
        largest = Math.max(largest, search.area(r, c));
    }
}
return largest;`,
      CPP: `vector<vector<int>> land = grid;
int rows = (int)land.size();
int columns = (int)land[0].size();
int steps[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

auto area = [&](int startRow, int startColumn) {
    vector<pair<int, int>> stack{{startRow, startColumn}};
    land[startRow][startColumn] = 0;
    int size = 0;
    while (!stack.empty()) {
        pair<int, int> at = stack.back();
        stack.pop_back();
        size += 1;
        for (auto& step : steps) {
            int nr = at.first + step[0];
            int nc = at.second + step[1];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
            if (land[nr][nc] != 1) continue;
            land[nr][nc] = 0;
            stack.push_back({nr, nc});
        }
    }
    return size;
};

int largest = 0;
for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < columns; c += 1) {
        if (land[r][c] != 1) continue;
        largest = max(largest, area(r, c));
    }
}
return largest;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "count-connected-groups",
    title: "Count the Connected Groups",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "There are n nodes numbered 0 to n-1, joined by the given undirected " +
      "edges, each written [a, b]. Return how many connected groups the nodes " +
      "fall into. A node with no edges is a group on its own.",
    explanation:
      "First build an adjacency list from the edge list — a list per node, and " +
      "each edge added to both endpoints because the graph is undirected. Doing " +
      "that conversion without thinking about it is most of what makes graph " +
      "questions feel routine, and skipping it means every neighbour lookup " +
      "rescans the entire edge list. Then it is the island sweep on a different " +
      "kind of graph: walk the node numbers, and each unvisited node starts a " +
      "new group whose whole component the search then marks. Total cost is " +
      "O(n + e). The lone-node case needs no special handling, which is a good " +
      "sign the formulation is right: an isolated node simply has an empty " +
      "neighbour list and the search marks only itself.",
    constraints: [
      "n is between 1 and 100,000.",
      "Between 0 and 200,000 edges, each a pair of distinct node numbers.",
      "Edges are undirected, and duplicate edges may appear.",
    ],
    hints: [
      "Turn the edge list into an adjacency list before searching anything.",
      "An undirected edge belongs to both of its endpoints.",
      "Then it is the island sweep: each unvisited node begins a group.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "countConnectedGroups",
      params: [
        { name: "n", type: "int" },
        { name: "edges", type: "int[][]" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-graph-dfs", "dsa-union-find", "js-arrays"],
    examples: [
      {
        input: "n = 5, edges = [[0, 1], [1, 2], [3, 4]]",
        output: "2",
      },
      {
        input: "n = 3, edges = []",
        output: "3",
        explanation: "With no edges every node stands alone.",
      },
    ],
    tests: [
      {
        args: [
          5,
          [
            [0, 1],
            [1, 2],
            [3, 4],
          ],
        ],
        expected: 2,
      },
      { args: [3, []], expected: 3 },
      { args: [1, []], expected: 1 },
      {
        args: [
          4,
          [
            [0, 1],
            [1, 2],
            [2, 3],
          ],
        ],
        expected: 1,
        hidden: true,
      },
      {
        args: [
          4,
          [
            [0, 1],
            [0, 1],
          ],
        ],
        expected: 3,
        hidden: true,
      },
      {
        args: [
          6,
          [
            [0, 1],
            [2, 3],
            [4, 5],
          ],
        ],
        expected: 3,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const neighbours = Array.from({ length: n }, () => []);
for (const [a, b] of edges) {
  neighbours[a].push(b);
  neighbours[b].push(a);
}

const seen = new Array(n).fill(false);
let groups = 0;
for (let start = 0; start < n; start += 1) {
  if (seen[start]) continue;
  groups += 1;
  const stack = [start];
  seen[start] = true;
  while (stack.length > 0) {
    const node = stack.pop();
    for (const next of neighbours[node]) {
      if (!seen[next]) {
        seen[next] = true;
        stack.push(next);
      }
    }
  }
}
return groups;`,
      TYPESCRIPT: `const neighbours: number[][] = Array.from({ length: n }, () => []);
for (const edge of edges) {
  neighbours[edge[0]].push(edge[1]);
  neighbours[edge[1]].push(edge[0]);
}

const seen: boolean[] = new Array(n).fill(false);
let groups = 0;
for (let start = 0; start < n; start += 1) {
  if (seen[start]) continue;
  groups += 1;
  const stack: number[] = [start];
  seen[start] = true;
  while (stack.length > 0) {
    const node = stack.pop() as number;
    for (const next of neighbours[node]) {
      if (!seen[next]) {
        seen[next] = true;
        stack.push(next);
      }
    }
  }
}
return groups;`,
      PYTHON: `neighbours = [[] for _ in range(n)]
for a, b in edges:
    neighbours[a].append(b)
    neighbours[b].append(a)

seen = [False] * n
groups = 0
for start in range(n):
    if seen[start]:
        continue
    groups += 1
    stack = [start]
    seen[start] = True
    while stack:
        node = stack.pop()
        for following in neighbours[node]:
            if not seen[following]:
                seen[following] = True
                stack.append(following)
return groups`,
      JAVA: `List<List<Integer>> neighbours = new ArrayList<>();
for (int i = 0; i < n; i += 1) neighbours.add(new ArrayList<>());
for (int[] edge : edges) {
    neighbours.get(edge[0]).add(edge[1]);
    neighbours.get(edge[1]).add(edge[0]);
}

boolean[] seen = new boolean[n];
int groups = 0;
for (int start = 0; start < n; start += 1) {
    if (seen[start]) continue;
    groups += 1;
    Deque<Integer> stack = new ArrayDeque<>();
    stack.push(start);
    seen[start] = true;
    while (!stack.isEmpty()) {
        int node = stack.pop();
        for (int next : neighbours.get(node)) {
            if (!seen[next]) {
                seen[next] = true;
                stack.push(next);
            }
        }
    }
}
return groups;`,
      CPP: `vector<vector<int>> neighbours(n);
for (const vector<int>& edge : edges) {
    neighbours[edge[0]].push_back(edge[1]);
    neighbours[edge[1]].push_back(edge[0]);
}

vector<bool> seen(n, false);
int groups = 0;
for (int start = 0; start < n; start += 1) {
    if (seen[start]) continue;
    groups += 1;
    vector<int> stack{start};
    seen[start] = true;
    while (!stack.empty()) {
        int node = stack.back();
        stack.pop_back();
        for (int following : neighbours[node]) {
            if (!seen[following]) {
                seen[following] = true;
                stack.push_back(following);
            }
        }
    }
}
return groups;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "does-the-graph-have-a-cycle",
    title: "Does the Graph Have a Cycle?",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "There are n nodes numbered 0 to n-1 joined by undirected edges, each " +
      "written [a, b]. Report whether the graph contains a cycle. There are no " +
      "self-loops and no repeated edges.",
    explanation:
      "In an undirected graph, meeting an already-visited node is *not* enough " +
      "to declare a cycle — every edge is traversable both ways, so the search " +
      "immediately looks back at the node it just came from and sees it marked. " +
      "The fix is to carry the parent along and ignore exactly that one " +
      "neighbour. Any other visited neighbour genuinely closes a loop. Note this " +
      "is precisely the rule that differs in a directed graph, where the " +
      "question becomes whether the visited node is still on the current " +
      "recursion stack rather than merely visited at some point — which is what " +
      "the topological-sort topic builds on. The search must also start from " +
      "every unvisited node, because a cycle can hide in a component the first " +
      "search never reaches. There is a counting shortcut too: a connected " +
      "component with v nodes and more than v-1 edges must contain a cycle.",
    constraints: [
      "n is between 1 and 100,000.",
      "Between 0 and 200,000 edges, each a pair of distinct node numbers.",
      "No self-loops and no repeated edges.",
    ],
    hints: [
      "A visited neighbour is not automatically a cycle — you can always look back the way you came.",
      "Carry the node you arrived from, and ignore that one neighbour.",
      "Start a search from every component; a cycle may hide in one you have not reached.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "doesTheGraphHaveACycle",
      params: [
        { name: "n", type: "int" },
        { name: "edges", type: "int[][]" },
      ],
      returns: "bool",
    },
    topicSlugs: ["dsa-graph-dfs", "dsa-union-find", "js-arrays"],
    examples: [
      {
        input: "n = 4, edges = [[0, 1], [1, 2], [2, 0]]",
        output: "true",
        explanation: "Nodes 0, 1 and 2 form a triangle.",
      },
      {
        input: "n = 3, edges = [[0, 1], [1, 2]]",
        output: "false",
        explanation: "A path is not a cycle, even though 1 is reached from both sides.",
      },
    ],
    tests: [
      {
        args: [
          4,
          [
            [0, 1],
            [1, 2],
            [2, 0],
          ],
        ],
        expected: true,
      },
      {
        args: [
          3,
          [
            [0, 1],
            [1, 2],
          ],
        ],
        expected: false,
      },
      { args: [1, []], expected: false },
      {
        args: [
          5,
          [
            [0, 1],
            [2, 3],
            [3, 4],
            [4, 2],
          ],
        ],
        expected: true,
        hidden: true,
      },
      {
        args: [
          4,
          [
            [0, 1],
            [2, 3],
          ],
        ],
        expected: false,
        hidden: true,
      },
      {
        args: [
          2,
          [[0, 1]],
        ],
        expected: false,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const neighbours = Array.from({ length: n }, () => []);
for (const [a, b] of edges) {
  neighbours[a].push(b);
  neighbours[b].push(a);
}

const seen = new Array(n).fill(false);
for (let start = 0; start < n; start += 1) {
  if (seen[start]) continue;
  const stack = [[start, -1]];
  seen[start] = true;
  while (stack.length > 0) {
    const [node, from] = stack.pop();
    for (const next of neighbours[node]) {
      if (next === from) continue;
      if (seen[next]) return true;
      seen[next] = true;
      stack.push([next, node]);
    }
  }
}
return false;`,
      TYPESCRIPT: `const neighbours: number[][] = Array.from({ length: n }, () => []);
for (const edge of edges) {
  neighbours[edge[0]].push(edge[1]);
  neighbours[edge[1]].push(edge[0]);
}

const seen: boolean[] = new Array(n).fill(false);
for (let start = 0; start < n; start += 1) {
  if (seen[start]) continue;
  const stack: number[][] = [[start, -1]];
  seen[start] = true;
  while (stack.length > 0) {
    const entry = stack.pop() as number[];
    for (const next of neighbours[entry[0]]) {
      if (next === entry[1]) continue;
      if (seen[next]) return true;
      seen[next] = true;
      stack.push([next, entry[0]]);
    }
  }
}
return false;`,
      PYTHON: `neighbours = [[] for _ in range(n)]
for a, b in edges:
    neighbours[a].append(b)
    neighbours[b].append(a)

seen = [False] * n
for start in range(n):
    if seen[start]:
        continue
    stack = [(start, -1)]
    seen[start] = True
    while stack:
        node, came_from = stack.pop()
        for following in neighbours[node]:
            if following == came_from:
                continue
            if seen[following]:
                return True
            seen[following] = True
            stack.append((following, node))
return False`,
      JAVA: `List<List<Integer>> neighbours = new ArrayList<>();
for (int i = 0; i < n; i += 1) neighbours.add(new ArrayList<>());
for (int[] edge : edges) {
    neighbours.get(edge[0]).add(edge[1]);
    neighbours.get(edge[1]).add(edge[0]);
}

boolean[] seen = new boolean[n];
for (int start = 0; start < n; start += 1) {
    if (seen[start]) continue;
    Deque<int[]> stack = new ArrayDeque<>();
    stack.push(new int[] {start, -1});
    seen[start] = true;
    while (!stack.isEmpty()) {
        int[] entry = stack.pop();
        for (int next : neighbours.get(entry[0])) {
            if (next == entry[1]) continue;
            if (seen[next]) return true;
            seen[next] = true;
            stack.push(new int[] {next, entry[0]});
        }
    }
}
return false;`,
      CPP: `vector<vector<int>> neighbours(n);
for (const vector<int>& edge : edges) {
    neighbours[edge[0]].push_back(edge[1]);
    neighbours[edge[1]].push_back(edge[0]);
}

vector<bool> seen(n, false);
for (int start = 0; start < n; start += 1) {
    if (seen[start]) continue;
    vector<pair<int, int>> stack{{start, -1}};
    seen[start] = true;
    while (!stack.empty()) {
        pair<int, int> entry = stack.back();
        stack.pop_back();
        for (int following : neighbours[entry.first]) {
            if (following == entry.second) continue;
            if (seen[following]) return true;
            seen[following] = true;
            stack.push_back({following, entry.first});
        }
    }
}
return false;`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "capture-the-surrounded-regions",
    title: "Capture the Surrounded Regions",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "The grid holds 0 for empty and 1 for a marker. Every group of markers " +
      "joined horizontally or vertically that does not touch the border is " +
      "captured and becomes 2. Groups touching the border are left alone. Return " +
      "the grid afterwards.",
    explanation:
      "Searching each group and asking whether it touched the border works, but " +
      "it means tracking a flag through the recursion and revisiting the group " +
      "to act on the answer. Invert the problem instead: the *survivors* are " +
      "exactly the groups reachable from the border, so start searches only from " +
      "border markers and mark everything they reach as safe. Then one sweep " +
      "turns every remaining marker into a 2 and every safe marker back into a " +
      "1. Two passes, no flags, and no group visited twice. Reformulating 'find " +
      "the things without property X' as 'find the things with property X and " +
      "take the complement' is the transferable idea, and it is usually simpler " +
      "when X is easy to start a search from. The marking search carries its own " +
      "stack, since a border-connected region can span the entire grid.",
    constraints: [
      "The grid has between 1 and 200 rows and between 1 and 200 columns.",
      "Every square is 0 or 1 on input.",
      "A group touching any border square survives.",
    ],
    hints: [
      "Do not ask whether a group touches the border. Start from the border.",
      "Everything reachable from a border marker survives; everything else is captured.",
      "One marking pass, then one rewriting sweep.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "captureTheSurroundedRegions",
      params: [{ name: "grid", type: "int[][]" }],
      returns: "int[][]",
    },
    topicSlugs: ["dsa-graph-dfs", "dsa-recursion", "js-arrays"],
    examples: [
      {
        input: "grid = [[0, 0, 0], [0, 1, 0], [0, 0, 0]]",
        output: "[[0, 0, 0], [0, 2, 0], [0, 0, 0]]",
        explanation: "The middle marker touches no border, so it is captured.",
      },
      {
        input: "grid = [[1, 0], [0, 0]]",
        output: "[[1, 0], [0, 0]]",
        explanation: "That marker is on the border, so it survives.",
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
        expected: [
          [0, 0, 0],
          [0, 2, 0],
          [0, 0, 0],
        ],
      },
      {
        args: [
          [
            [1, 0],
            [0, 0],
          ],
        ],
        expected: [
          [1, 0],
          [0, 0],
        ],
      },
      { args: [[[1]]], expected: [[1]] },
      {
        args: [
          [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
          ],
        ],
        expected: [
          [0, 0, 0, 0],
          [0, 2, 2, 0],
          [0, 2, 0, 0],
          [0, 0, 0, 0],
        ],
        hidden: true,
      },
      {
        args: [
          [
            [1, 1],
            [1, 1],
          ],
        ],
        expected: [
          [1, 1],
          [1, 1],
        ],
        hidden: true,
      },
      {
        // The lower marker is captured only if you forget it is joined to the
        // one on the top border, so the whole group survives.
        args: [
          [
            [0, 1, 0],
            [0, 1, 0],
            [0, 0, 0],
          ],
        ],
        expected: [
          [0, 1, 0],
          [0, 1, 0],
          [0, 0, 0],
        ],
        hidden: true,
      },
      {
        args: [
          [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
          ],
        ],
        expected: [
          [1, 0, 0, 0],
          [0, 2, 0, 0],
          [0, 0, 0, 0],
        ],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const board = grid.map((line) => [...line]);
const rows = board.length;
const columns = board[0].length;

const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];
function markSafe(startRow, startColumn) {
  if (board[startRow][startColumn] !== 1) return;
  const stack = [[startRow, startColumn]];
  board[startRow][startColumn] = 3;
  while (stack.length > 0) {
    const [r, c] = stack.pop();
    for (const [dr, dc] of steps) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
      if (board[nr][nc] !== 1) continue;
      board[nr][nc] = 3;
      stack.push([nr, nc]);
    }
  }
}

for (let r = 0; r < rows; r += 1) {
  markSafe(r, 0);
  markSafe(r, columns - 1);
}
for (let c = 0; c < columns; c += 1) {
  markSafe(0, c);
  markSafe(rows - 1, c);
}

for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < columns; c += 1) {
    if (board[r][c] === 1) board[r][c] = 2;
    else if (board[r][c] === 3) board[r][c] = 1;
  }
}
return board;`,
      TYPESCRIPT: `const board: number[][] = grid.map((line) => [...line]);
const rows = board.length;
const columns = board[0].length;

const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];
function markSafe(startRow: number, startColumn: number): void {
  if (board[startRow][startColumn] !== 1) return;
  const stack: number[][] = [[startRow, startColumn]];
  board[startRow][startColumn] = 3;
  while (stack.length > 0) {
    const at = stack.pop() as number[];
    for (const step of steps) {
      const nr = at[0] + step[0];
      const nc = at[1] + step[1];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
      if (board[nr][nc] !== 1) continue;
      board[nr][nc] = 3;
      stack.push([nr, nc]);
    }
  }
}

for (let r = 0; r < rows; r += 1) {
  markSafe(r, 0);
  markSafe(r, columns - 1);
}
for (let c = 0; c < columns; c += 1) {
  markSafe(0, c);
  markSafe(rows - 1, c);
}

for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < columns; c += 1) {
    if (board[r][c] === 1) board[r][c] = 2;
    else if (board[r][c] === 3) board[r][c] = 1;
  }
}
return board;`,
      PYTHON: `board = [list(line) for line in grid]
rows = len(board)
columns = len(board[0])

def mark_safe(start_row, start_column):
    if board[start_row][start_column] != 1:
        return
    stack = [(start_row, start_column)]
    board[start_row][start_column] = 3
    while stack:
        r, c = stack.pop()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if nr < 0 or nr >= rows or nc < 0 or nc >= columns:
                continue
            if board[nr][nc] != 1:
                continue
            board[nr][nc] = 3
            stack.append((nr, nc))

for r in range(rows):
    mark_safe(r, 0)
    mark_safe(r, columns - 1)
for c in range(columns):
    mark_safe(0, c)
    mark_safe(rows - 1, c)

for r in range(rows):
    for c in range(columns):
        if board[r][c] == 1:
            board[r][c] = 2
        elif board[r][c] == 3:
            board[r][c] = 1
return board`,
      JAVA: `int[][] board = new int[grid.length][];
for (int i = 0; i < grid.length; i += 1) board[i] = grid[i].clone();
int rows = board.length;
int columns = board[0].length;

int[][] steps = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
class Search {
    void markSafe(int startRow, int startColumn) {
        if (board[startRow][startColumn] != 1) return;
        Deque<int[]> stack = new ArrayDeque<>();
        stack.push(new int[] {startRow, startColumn});
        board[startRow][startColumn] = 3;
        while (!stack.isEmpty()) {
            int[] at = stack.pop();
            for (int[] step : steps) {
                int nr = at[0] + step[0];
                int nc = at[1] + step[1];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
                if (board[nr][nc] != 1) continue;
                board[nr][nc] = 3;
                stack.push(new int[] {nr, nc});
            }
        }
    }
}

Search search = new Search();
for (int r = 0; r < rows; r += 1) {
    search.markSafe(r, 0);
    search.markSafe(r, columns - 1);
}
for (int c = 0; c < columns; c += 1) {
    search.markSafe(0, c);
    search.markSafe(rows - 1, c);
}

for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < columns; c += 1) {
        if (board[r][c] == 1) board[r][c] = 2;
        else if (board[r][c] == 3) board[r][c] = 1;
    }
}
return board;`,
      CPP: `vector<vector<int>> board = grid;
int rows = (int)board.size();
int columns = (int)board[0].size();

int steps[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
auto markSafe = [&](int startRow, int startColumn) {
    if (board[startRow][startColumn] != 1) return;
    vector<pair<int, int>> stack{{startRow, startColumn}};
    board[startRow][startColumn] = 3;
    while (!stack.empty()) {
        pair<int, int> at = stack.back();
        stack.pop_back();
        for (auto& step : steps) {
            int nr = at.first + step[0];
            int nc = at.second + step[1];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
            if (board[nr][nc] != 1) continue;
            board[nr][nc] = 3;
            stack.push_back({nr, nc});
        }
    }
};

for (int r = 0; r < rows; r += 1) {
    markSafe(r, 0);
    markSafe(r, columns - 1);
}
for (int c = 0; c < columns; c += 1) {
    markSafe(0, c);
    markSafe(rows - 1, c);
}

for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < columns; c += 1) {
        if (board[r][c] == 1) board[r][c] = 2;
        else if (board[r][c] == 3) board[r][c] = 1;
    }
}
return board;`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "count-differently-shaped-islands",
    title: "Count the Differently Shaped Islands",
    difficulty: "HARD",
    interviewFrequency: "MEDIUM",
    description:
      "The grid holds 1 for land and 0 for water. Two islands have the same " +
      "shape if one can be slid onto the other without rotating or reflecting " +
      "it. Return how many distinct shapes appear.",
    explanation:
      "Counting islands is settled; the new problem is deciding when two are the " +
      "same shape, which means finding a description that is identical for " +
      "translated copies and different for everything else. Recording the " +
      "absolute coordinates fails immediately, because sliding changes them all. " +
      "Recording each square's offset from the island's starting square works, " +
      "provided the squares are visited in the same order for every island — " +
      "which a depth-first search that always tries its four directions in the " +
      "same order guarantees. The list of offsets, joined into a string, is then " +
      "a canonical name for the shape, and the answer is the number of distinct " +
      "names in a set. This is the general technique for 'count distinct " +
      "structures': find a canonical form, then count the distinct forms. " +
      "Getting the canonical form right is the entire problem.",
    constraints: [
      "The grid has between 1 and 100 rows and between 1 and 100 columns.",
      "Every square is 0 or 1.",
      "Shapes are compared under sliding only — never rotation or reflection.",
    ],
    hints: [
      "You need a description of an island that survives sliding it around.",
      "Offsets from the island's first square do that, if the visit order is fixed.",
      "Count the distinct descriptions, not the islands.",
    ],
    estimatedTime: "45 min",
    signature: {
      name: "countDifferentlyShapedIslands",
      params: [{ name: "grid", type: "int[][]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-graph-dfs", "dsa-hashing", "dsa-strings"],
    examples: [
      {
        input: "grid = [[1, 1, 0], [1, 1, 0], [0, 0, 1]]",
        output: "2",
        explanation: "A two-by-two block and a single square are different shapes.",
      },
      {
        input: "grid = [[1, 0, 1], [0, 0, 0], [1, 0, 1]]",
        output: "1",
        explanation: "Four single squares are all the same shape.",
      },
    ],
    tests: [
      {
        args: [
          [
            [1, 1, 0],
            [1, 1, 0],
            [0, 0, 1],
          ],
        ],
        expected: 2,
      },
      {
        args: [
          [
            [1, 0, 1],
            [0, 0, 0],
            [1, 0, 1],
          ],
        ],
        expected: 1,
      },
      { args: [[[0]]], expected: 0 },
      {
        args: [
          [
            [1, 1, 0, 1, 1],
            [0, 0, 0, 0, 0],
          ],
        ],
        expected: 1,
        hidden: true,
      },
      {
        args: [
          [
            [1, 1, 0],
            [0, 1, 0],
            [0, 0, 0],
          ],
        ],
        expected: 1,
        hidden: true,
      },
      {
        args: [
          [
            [1, 1, 0, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 1],
          ],
        ],
        expected: 2,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const land = grid.map((line) => [...line]);
const rows = land.length;
const columns = land[0].length;
const shapes = new Set();

for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < columns; c += 1) {
    if (land[r][c] !== 1) continue;
    const offsets = [];
    const stack = [[r, c]];
    land[r][c] = 0;
    while (stack.length > 0) {
      const [cr, cc] = stack.pop();
      offsets.push((cr - r) + ":" + (cc - c));
      const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const [dr, dc] of steps) {
        const nr = cr + dr;
        const nc = cc + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
        if (land[nr][nc] !== 1) continue;
        land[nr][nc] = 0;
        stack.push([nr, nc]);
      }
    }
    offsets.sort();
    shapes.add(offsets.join("|"));
  }
}
return shapes.size;`,
      TYPESCRIPT: `const land: number[][] = grid.map((line) => [...line]);
const rows = land.length;
const columns = land[0].length;
const shapes = new Set<string>();

for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < columns; c += 1) {
    if (land[r][c] !== 1) continue;
    const offsets: string[] = [];
    const stack: number[][] = [[r, c]];
    land[r][c] = 0;
    while (stack.length > 0) {
      const entry = stack.pop() as number[];
      offsets.push((entry[0] - r) + ":" + (entry[1] - c));
      const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const step of steps) {
        const nr = entry[0] + step[0];
        const nc = entry[1] + step[1];
        if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
        if (land[nr][nc] !== 1) continue;
        land[nr][nc] = 0;
        stack.push([nr, nc]);
      }
    }
    offsets.sort();
    shapes.add(offsets.join("|"));
  }
}
return shapes.size;`,
      PYTHON: `land = [list(line) for line in grid]
rows = len(land)
columns = len(land[0])
shapes = set()

for r in range(rows):
    for c in range(columns):
        if land[r][c] != 1:
            continue
        offsets = []
        stack = [(r, c)]
        land[r][c] = 0
        while stack:
            cr, cc = stack.pop()
            offsets.append((cr - r, cc - c))
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = cr + dr, cc + dc
                if nr < 0 or nr >= rows or nc < 0 or nc >= columns:
                    continue
                if land[nr][nc] != 1:
                    continue
                land[nr][nc] = 0
                stack.append((nr, nc))
        shapes.add(tuple(sorted(offsets)))
return len(shapes)`,
      JAVA: `int[][] land = new int[grid.length][];
for (int i = 0; i < grid.length; i += 1) land[i] = grid[i].clone();
int rows = land.length;
int columns = land[0].length;
Set<String> shapes = new HashSet<>();
int[][] steps = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < columns; c += 1) {
        if (land[r][c] != 1) continue;
        List<String> offsets = new ArrayList<>();
        Deque<int[]> stack = new ArrayDeque<>();
        stack.push(new int[] {r, c});
        land[r][c] = 0;
        while (!stack.isEmpty()) {
            int[] at = stack.pop();
            offsets.add((at[0] - r) + ":" + (at[1] - c));
            for (int[] step : steps) {
                int nr = at[0] + step[0];
                int nc = at[1] + step[1];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
                if (land[nr][nc] != 1) continue;
                land[nr][nc] = 0;
                stack.push(new int[] {nr, nc});
            }
        }
        Collections.sort(offsets);
        shapes.add(String.join("|", offsets));
    }
}
return shapes.size();`,
      CPP: `vector<vector<int>> land = grid;
int rows = (int)land.size();
int columns = (int)land[0].size();
set<vector<pair<int, int>>> shapes;
int steps[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < columns; c += 1) {
        if (land[r][c] != 1) continue;
        vector<pair<int, int>> offsets;
        vector<pair<int, int>> stack{{r, c}};
        land[r][c] = 0;
        while (!stack.empty()) {
            pair<int, int> at = stack.back();
            stack.pop_back();
            offsets.push_back({at.first - r, at.second - c});
            for (auto& step : steps) {
                int nr = at.first + step[0];
                int nc = at.second + step[1];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
                if (land[nr][nc] != 1) continue;
                land[nr][nc] = 0;
                stack.push_back({nr, nc});
            }
        }
        sort(offsets.begin(), offsets.end());
        shapes.insert(offsets);
    }
}
return (int)shapes.size();`,
    },
  },
];
