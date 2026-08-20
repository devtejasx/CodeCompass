import type { SeedProblem } from "../../problems/types";

/**
 * Graph breadth-first search.
 *
 * One property justifies the whole topic: when every edge costs the same,
 * breadth-first search reaches each node by a shortest path, and depth-first
 * search does not. Everything here is an application of that, so every
 * explanation says what the "edge" is and why each one costs the same — because
 * the moment they stop costing the same, this is the wrong algorithm and the
 * shortest-path topic is the right one.
 *
 * Two extensions appear repeatedly. Multi-source BFS starts with every source
 * already in the queue at distance zero, which computes the distance to the
 * *nearest* source in one sweep rather than one sweep per source. And the level
 * batch — reading the queue's size before the round, as the tree traversal file
 * introduced — is what turns "visit in order" into "count the rounds".
 *
 * Marking on entry matters even more here than in depth-first search: a node
 * queued twice is not merely slow, it can be dequeued with a stale, longer
 * distance and corrupt the answer.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const GRAPH_BFS_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "steps-from-the-source",
    title: "Steps From the Source",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "There are n nodes numbered 0 to n-1, joined by the given undirected " +
      "edges. Return a list giving, for each node, the fewest edges needed to " +
      "reach it from node 0. A node that cannot be reached gets -1, and node 0 " +
      "itself gets 0.",
    explanation:
      "Breadth-first search from node 0. Keep a distance per node, start every " +
      "entry at -1 to mean 'not reached', set node 0 to 0, and push it. Each " +
      "time a node comes off the queue, any neighbour still at -1 gets this " +
      "node's distance plus one and joins the queue. Using the distance array " +
      "as the visited marker is the neat part — one array does both jobs, and " +
      "because a node is assigned exactly once it can never be queued twice. " +
      "The reason this gives shortest paths is that the queue hands out nodes in " +
      "non-decreasing distance order, so the first time a node is reached is " +
      "along a shortest route. Depth-first search would reach every node too, " +
      "but by whatever path it wandered down first.",
    constraints: [
      "n is between 1 and 100,000.",
      "Between 0 and 200,000 undirected edges, each a pair of distinct nodes.",
      "Unreachable nodes are reported as -1.",
    ],
    hints: [
      "One array can hold the distances and act as the visited marker.",
      "Seed it with -1 everywhere, and 0 at the starting node.",
      "Assign a neighbour's distance as you queue it, not as you dequeue it.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "stepsFromTheSource",
      params: [
        { name: "n", type: "int" },
        { name: "edges", type: "int[][]" },
      ],
      returns: "int[]",
    },
    topicSlugs: ["dsa-graph-bfs", "dsa-queue-deque", "js-arrays"],
    examples: [
      {
        input: "n = 4, edges = [[0, 1], [1, 2]]",
        output: "[0, 1, 2, -1]",
        explanation: "Node 3 has no edges at all.",
      },
      {
        input: "n = 1, edges = []",
        output: "[0]",
      },
    ],
    tests: [
      {
        args: [
          4,
          [
            [0, 1],
            [1, 2],
          ],
        ],
        expected: [0, 1, 2, -1],
      },
      { args: [1, []], expected: [0] },
      {
        args: [
          3,
          [
            [0, 1],
            [0, 2],
          ],
        ],
        expected: [0, 1, 1],
      },
      { args: [2, []], expected: [0, -1], hidden: true },
      {
        args: [
          5,
          [
            [0, 1],
            [1, 2],
            [2, 3],
            [0, 3],
            [3, 4],
          ],
        ],
        expected: [0, 1, 2, 1, 2],
        hidden: true,
      },
      {
        args: [
          4,
          [
            [1, 2],
            [2, 3],
          ],
        ],
        expected: [0, -1, -1, -1],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const neighbours = Array.from({ length: n }, () => []);
for (const [a, b] of edges) {
  neighbours[a].push(b);
  neighbours[b].push(a);
}

const distance = new Array(n).fill(-1);
distance[0] = 0;
const queue = [0];
let head = 0;
while (head < queue.length) {
  const node = queue[head];
  head += 1;
  for (const next of neighbours[node]) {
    if (distance[next] === -1) {
      distance[next] = distance[node] + 1;
      queue.push(next);
    }
  }
}
return distance;`,
      TYPESCRIPT: `const neighbours: number[][] = Array.from({ length: n }, () => []);
for (const edge of edges) {
  neighbours[edge[0]].push(edge[1]);
  neighbours[edge[1]].push(edge[0]);
}

const distance: number[] = new Array(n).fill(-1);
distance[0] = 0;
const queue: number[] = [0];
let head = 0;
while (head < queue.length) {
  const node = queue[head];
  head += 1;
  for (const next of neighbours[node]) {
    if (distance[next] === -1) {
      distance[next] = distance[node] + 1;
      queue.push(next);
    }
  }
}
return distance;`,
      PYTHON: `from collections import deque

neighbours = [[] for _ in range(n)]
for a, b in edges:
    neighbours[a].append(b)
    neighbours[b].append(a)

distance = [-1] * n
distance[0] = 0
queue = deque([0])
while queue:
    node = queue.popleft()
    for following in neighbours[node]:
        if distance[following] == -1:
            distance[following] = distance[node] + 1
            queue.append(following)
return distance`,
      JAVA: `List<List<Integer>> neighbours = new ArrayList<>();
for (int i = 0; i < n; i += 1) neighbours.add(new ArrayList<>());
for (int[] edge : edges) {
    neighbours.get(edge[0]).add(edge[1]);
    neighbours.get(edge[1]).add(edge[0]);
}

int[] distance = new int[n];
Arrays.fill(distance, -1);
distance[0] = 0;
Deque<Integer> queue = new ArrayDeque<>();
queue.addLast(0);
while (!queue.isEmpty()) {
    int node = queue.pollFirst();
    for (int next : neighbours.get(node)) {
        if (distance[next] == -1) {
            distance[next] = distance[node] + 1;
            queue.addLast(next);
        }
    }
}
return distance;`,
      CPP: `vector<vector<int>> neighbours(n);
for (const vector<int>& edge : edges) {
    neighbours[edge[0]].push_back(edge[1]);
    neighbours[edge[1]].push_back(edge[0]);
}

vector<int> distance(n, -1);
distance[0] = 0;
vector<int> queue{0};
size_t head = 0;
while (head < queue.size()) {
    int node = queue[head];
    head += 1;
    for (int following : neighbours[node]) {
        if (distance[following] == -1) {
            distance[following] = distance[node] + 1;
            queue.push_back(following);
        }
    }
}
return distance;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "minutes-until-all-spoil",
    title: "Minutes Until Everything Spoils",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "The grid holds 0 for an empty cell, 1 for a fresh item and 2 for a " +
      "spoiled one. Every minute, each spoiled item spoils its fresh horizontal " +
      "and vertical neighbours. Return the number of minutes until nothing fresh " +
      "is left, or -1 if something can never spoil. If nothing is fresh to begin " +
      "with, the answer is 0.",
    explanation:
      "Everything spoiled at the start begins spoiling at the same moment, so " +
      "this is a breadth-first search with *many* sources rather than one: put " +
      "every spoiled cell into the queue before the first round, all at distance " +
      "zero. That computes each fresh cell's distance to the nearest spoiled one " +
      "in a single sweep — running one search per source instead would be " +
      "correct and needlessly slow. Process the queue in level batches, counting " +
      "one minute per batch that actually spoils something, and track how many " +
      "fresh items remain. If any are left when the queue empties, they were " +
      "unreachable and the answer is -1. Counting the batches rather than " +
      "tracking timestamps per cell is what keeps this to a single integer of " +
      "state.",
    constraints: [
      "The grid has between 1 and 300 rows and between 1 and 300 columns.",
      "Every cell is 0, 1 or 2.",
      "Spoiling spreads only horizontally and vertically, one step per minute.",
    ],
    hints: [
      "Everything already spoiled starts at the same moment — queue all of it first.",
      "Count minutes as level batches, not per cell.",
      "Anything still fresh when the queue empties can never be reached.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "minutesUntilAllSpoil",
      params: [{ name: "grid", type: "int[][]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-graph-bfs", "dsa-queue-deque", "js-arrays"],
    examples: [
      {
        input: "grid = [[2, 1, 1], [1, 1, 0], [0, 1, 1]]",
        output: "4",
      },
      {
        input: "grid = [[2, 1, 1], [0, 1, 1], [1, 0, 1]]",
        output: "-1",
        explanation: "The bottom-left item is sealed off by empty cells.",
      },
    ],
    tests: [
      {
        args: [
          [
            [2, 1, 1],
            [1, 1, 0],
            [0, 1, 1],
          ],
        ],
        expected: 4,
      },
      {
        args: [
          [
            [2, 1, 1],
            [0, 1, 1],
            [1, 0, 1],
          ],
        ],
        expected: -1,
      },
      { args: [[[0, 2]]], expected: 0 },
      { args: [[[1]]], expected: -1, hidden: true },
      { args: [[[2]]], expected: 0, hidden: true },
      { args: [[[0]]], expected: 0, hidden: true },
      {
        args: [
          [
            [2, 1, 1],
            [1, 1, 1],
            [1, 1, 1],
          ],
        ],
        expected: 4,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const rows = grid.length;
const columns = grid[0].length;
const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];

const board = grid.map((line) => [...line]);
let queue = [];
let fresh = 0;
for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < columns; c += 1) {
    if (board[r][c] === 2) queue.push([r, c]);
    else if (board[r][c] === 1) fresh += 1;
  }
}

let minutes = 0;
while (queue.length > 0 && fresh > 0) {
  const next = [];
  for (const [r, c] of queue) {
    for (const [dr, dc] of steps) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
      if (board[nr][nc] !== 1) continue;
      board[nr][nc] = 2;
      fresh -= 1;
      next.push([nr, nc]);
    }
  }
  if (next.length === 0) break;
  queue = next;
  minutes += 1;
}
return fresh === 0 ? minutes : -1;`,
      TYPESCRIPT: `const rows = grid.length;
const columns = grid[0].length;
const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];

const board: number[][] = grid.map((line) => [...line]);
let queue: number[][] = [];
let fresh = 0;
for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < columns; c += 1) {
    if (board[r][c] === 2) queue.push([r, c]);
    else if (board[r][c] === 1) fresh += 1;
  }
}

let minutes = 0;
while (queue.length > 0 && fresh > 0) {
  const next: number[][] = [];
  for (const at of queue) {
    for (const step of steps) {
      const nr = at[0] + step[0];
      const nc = at[1] + step[1];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
      if (board[nr][nc] !== 1) continue;
      board[nr][nc] = 2;
      fresh -= 1;
      next.push([nr, nc]);
    }
  }
  if (next.length === 0) break;
  queue = next;
  minutes += 1;
}
return fresh === 0 ? minutes : -1;`,
      PYTHON: `rows = len(grid)
columns = len(grid[0])
board = [list(line) for line in grid]

queue = []
fresh = 0
for r in range(rows):
    for c in range(columns):
        if board[r][c] == 2:
            queue.append((r, c))
        elif board[r][c] == 1:
            fresh += 1

minutes = 0
while queue and fresh > 0:
    following = []
    for r, c in queue:
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if nr < 0 or nr >= rows or nc < 0 or nc >= columns:
                continue
            if board[nr][nc] != 1:
                continue
            board[nr][nc] = 2
            fresh -= 1
            following.append((nr, nc))
    if not following:
        break
    queue = following
    minutes += 1
return minutes if fresh == 0 else -1`,
      JAVA: `int rows = grid.length;
int columns = grid[0].length;
int[][] steps = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

int[][] board = new int[rows][];
for (int i = 0; i < rows; i += 1) board[i] = grid[i].clone();

List<int[]> queue = new ArrayList<>();
int fresh = 0;
for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < columns; c += 1) {
        if (board[r][c] == 2) queue.add(new int[] {r, c});
        else if (board[r][c] == 1) fresh += 1;
    }
}

int minutes = 0;
while (!queue.isEmpty() && fresh > 0) {
    List<int[]> next = new ArrayList<>();
    for (int[] at : queue) {
        for (int[] step : steps) {
            int nr = at[0] + step[0];
            int nc = at[1] + step[1];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
            if (board[nr][nc] != 1) continue;
            board[nr][nc] = 2;
            fresh -= 1;
            next.add(new int[] {nr, nc});
        }
    }
    if (next.isEmpty()) break;
    queue = next;
    minutes += 1;
}
return fresh == 0 ? minutes : -1;`,
      CPP: `int rows = (int)grid.size();
int columns = (int)grid[0].size();
int steps[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

vector<vector<int>> board = grid;
vector<pair<int, int>> queue;
int fresh = 0;
for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < columns; c += 1) {
        if (board[r][c] == 2) queue.push_back({r, c});
        else if (board[r][c] == 1) fresh += 1;
    }
}

int minutes = 0;
while (!queue.empty() && fresh > 0) {
    vector<pair<int, int>> following;
    for (auto& at : queue) {
        for (auto& step : steps) {
            int nr = at.first + step[0];
            int nc = at.second + step[1];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
            if (board[nr][nc] != 1) continue;
            board[nr][nc] = 2;
            fresh -= 1;
            following.push_back({nr, nc});
        }
    }
    if (following.empty()) break;
    queue = following;
    minutes += 1;
}
return fresh == 0 ? minutes : -1;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "shortest-clear-route",
    title: "The Shortest Clear Route",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "The grid holds 0 for a clear square and 1 for a blocked one. Travel from " +
      "the top-left corner to the bottom-right, stepping to any of the eight " +
      "surrounding squares, never onto a blocked one. Return the number of " +
      "squares on the shortest such route, counting both ends, or -1 if there is " +
      "none.",
    explanation:
      "Eight neighbours instead of four changes nothing structurally — the edges " +
      "still all cost one step, so breadth-first search still gives the shortest " +
      "route. The only change is the list of offsets, which is worth writing as " +
      "data rather than as eight blocks of code. Mark a square as visited when " +
      "it is queued rather than when it is dequeued: with eight neighbours a " +
      "square is reachable from many directions at once, and marking late lets " +
      "it enter the queue several times, which is where this problem punishes " +
      "carelessness more than a four-neighbour grid does. The two ends must both " +
      "be checked for being blocked before anything starts — a blocked start is " +
      "the case most solutions miss, and the answer counts squares rather than " +
      "steps, so a one-by-one clear grid answers 1.",
    constraints: [
      "The grid is square, with between 1 and 100 rows.",
      "Every square is 0 or 1.",
      "Movement is to any of the eight surrounding squares.",
    ],
    hints: [
      "Eight directions is still an unweighted graph — the algorithm does not change.",
      "Write the eight offsets as data, not as eight branches.",
      "Check that both corners are clear before starting, and count squares rather than steps.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "shortestClearRoute",
      params: [{ name: "grid", type: "int[][]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-graph-bfs", "dsa-queue-deque", "js-arrays"],
    examples: [
      {
        input: "grid = [[0, 1], [1, 0]]",
        output: "2",
        explanation: "The two clear corners touch diagonally.",
      },
      {
        input: "grid = [[1, 0], [0, 0]]",
        output: "-1",
        explanation: "The starting corner is blocked.",
      },
    ],
    tests: [
      {
        args: [
          [
            [0, 1],
            [1, 0],
          ],
        ],
        expected: 2,
      },
      {
        args: [
          [
            [1, 0],
            [0, 0],
          ],
        ],
        expected: -1,
      },
      { args: [[[0]]], expected: 1 },
      { args: [[[1]]], expected: -1, hidden: true },
      {
        // Three squares would need a single stepping stone next to both
        // corners, and (1,1) is blocked — so the route must go round.
        args: [
          [
            [0, 0, 0],
            [1, 1, 0],
            [1, 1, 0],
          ],
        ],
        expected: 4,
        hidden: true,
      },
      {
        args: [
          [
            [0, 1, 1],
            [1, 1, 1],
            [1, 1, 0],
          ],
        ],
        expected: -1,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const n = grid.length;
if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) return -1;

const steps = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];
const seen = grid.map((line) => line.map(() => false));
seen[0][0] = true;
let queue = [[0, 0]];
let squares = 1;

while (queue.length > 0) {
  const next = [];
  for (const [r, c] of queue) {
    if (r === n - 1 && c === n - 1) return squares;
    for (const [dr, dc] of steps) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
      if (grid[nr][nc] === 1 || seen[nr][nc]) continue;
      seen[nr][nc] = true;
      next.push([nr, nc]);
    }
  }
  queue = next;
  squares += 1;
}
return -1;`,
      TYPESCRIPT: `const n = grid.length;
if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) return -1;

const steps = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];
const seen: boolean[][] = grid.map((line) => line.map(() => false));
seen[0][0] = true;
let queue: number[][] = [[0, 0]];
let squares = 1;

while (queue.length > 0) {
  const next: number[][] = [];
  for (const at of queue) {
    if (at[0] === n - 1 && at[1] === n - 1) return squares;
    for (const step of steps) {
      const nr = at[0] + step[0];
      const nc = at[1] + step[1];
      if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
      if (grid[nr][nc] === 1 || seen[nr][nc]) continue;
      seen[nr][nc] = true;
      next.push([nr, nc]);
    }
  }
  queue = next;
  squares += 1;
}
return -1;`,
      PYTHON: `n = len(grid)
if grid[0][0] == 1 or grid[n - 1][n - 1] == 1:
    return -1

steps = (
    (1, 0), (-1, 0), (0, 1), (0, -1),
    (1, 1), (1, -1), (-1, 1), (-1, -1),
)
seen = [[False] * n for _ in range(n)]
seen[0][0] = True
queue = [(0, 0)]
squares = 1

while queue:
    following = []
    for r, c in queue:
        if r == n - 1 and c == n - 1:
            return squares
        for dr, dc in steps:
            nr, nc = r + dr, c + dc
            if nr < 0 or nr >= n or nc < 0 or nc >= n:
                continue
            if grid[nr][nc] == 1 or seen[nr][nc]:
                continue
            seen[nr][nc] = True
            following.append((nr, nc))
    queue = following
    squares += 1
return -1`,
      JAVA: `int n = grid.length;
if (grid[0][0] == 1 || grid[n - 1][n - 1] == 1) return -1;

int[][] steps = {
    {1, 0}, {-1, 0}, {0, 1}, {0, -1},
    {1, 1}, {1, -1}, {-1, 1}, {-1, -1},
};
boolean[][] seen = new boolean[n][n];
seen[0][0] = true;
List<int[]> queue = new ArrayList<>();
queue.add(new int[] {0, 0});
int squares = 1;

while (!queue.isEmpty()) {
    List<int[]> next = new ArrayList<>();
    for (int[] at : queue) {
        if (at[0] == n - 1 && at[1] == n - 1) return squares;
        for (int[] step : steps) {
            int nr = at[0] + step[0];
            int nc = at[1] + step[1];
            if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
            if (grid[nr][nc] == 1 || seen[nr][nc]) continue;
            seen[nr][nc] = true;
            next.add(new int[] {nr, nc});
        }
    }
    queue = next;
    squares += 1;
}
return -1;`,
      CPP: `int n = (int)grid.size();
if (grid[0][0] == 1 || grid[n - 1][n - 1] == 1) return -1;

int steps[8][2] = {
    {1, 0}, {-1, 0}, {0, 1}, {0, -1},
    {1, 1}, {1, -1}, {-1, 1}, {-1, -1},
};
vector<vector<bool>> seen(n, vector<bool>(n, false));
seen[0][0] = true;
vector<pair<int, int>> queue{{0, 0}};
int squares = 1;

while (!queue.empty()) {
    vector<pair<int, int>> following;
    for (auto& at : queue) {
        if (at.first == n - 1 && at.second == n - 1) return squares;
        for (auto& step : steps) {
            int nr = at.first + step[0];
            int nc = at.second + step[1];
            if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
            if (grid[nr][nc] == 1 || seen[nr][nc]) continue;
            seen[nr][nc] = true;
            following.push_back({nr, nc});
        }
    }
    queue = following;
    squares += 1;
}
return -1;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "distance-to-the-nearest-zero",
    title: "Distance to the Nearest Zero",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Every cell of the grid is 0 or 1. Replace each cell with the number of " +
      "horizontal or vertical steps to the nearest 0. A cell already holding 0 " +
      "becomes 0. At least one 0 is always present.",
    explanation:
      "The instinct is to search outwards from each 1, which is one traversal " +
      "per cell and quadratic. Turn it around and search *from the zeros*, all " +
      "of them at once: put every zero into the queue at distance 0, then expand. " +
      "The first time a cell is reached, it is reached from the nearest zero, " +
      "because the queue delivers cells in non-decreasing distance order — so one " +
      "sweep answers the question for every cell simultaneously. This is the " +
      "multi-source pattern in its purest form, and recognising it is worth more " +
      "than the problem: the same reframing turns 'nearest exit', 'nearest " +
      "hospital' and 'time for the fire to reach here' into a single BFS. Use " +
      "the answer grid as the visited marker, seeded with -1, and no second grid " +
      "is needed.",
    constraints: [
      "The grid has between 1 and 300 rows and between 1 and 300 columns.",
      "Every cell is 0 or 1, and at least one 0 is present.",
      "Distance is counted in horizontal and vertical steps.",
    ],
    hints: [
      "Searching outwards from every 1 is one traversal per cell.",
      "Search from the zeros instead — all of them, in the same queue, at distance 0.",
      "The first time a cell is reached is from its nearest zero.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "distanceToTheNearestZero",
      params: [{ name: "grid", type: "int[][]" }],
      returns: "int[][]",
    },
    topicSlugs: ["dsa-graph-bfs", "dsa-queue-deque", "js-arrays"],
    examples: [
      {
        input: "grid = [[0, 0, 0], [0, 1, 0], [1, 1, 1]]",
        output: "[[0, 0, 0], [0, 1, 0], [1, 2, 1]]",
      },
      {
        input: "grid = [[0]]",
        output: "[[0]]",
      },
    ],
    tests: [
      {
        args: [
          [
            [0, 0, 0],
            [0, 1, 0],
            [1, 1, 1],
          ],
        ],
        expected: [
          [0, 0, 0],
          [0, 1, 0],
          [1, 2, 1],
        ],
      },
      { args: [[[0]]], expected: [[0]] },
      {
        args: [
          [
            [0, 1],
            [1, 1],
          ],
        ],
        expected: [
          [0, 1],
          [1, 2],
        ],
      },
      { args: [[[0, 1, 1, 1]]], expected: [[0, 1, 2, 3]], hidden: true },
      {
        args: [
          [
            [0, 0],
            [0, 0],
          ],
        ],
        expected: [
          [0, 0],
          [0, 0],
        ],
        hidden: true,
      },
      {
        args: [[[1, 1, 0, 1, 1]]],
        expected: [[2, 1, 0, 1, 2]],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const rows = grid.length;
const columns = grid[0].length;
const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];

const distance = grid.map((line) => line.map(() => -1));
let queue = [];
for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < columns; c += 1) {
    if (grid[r][c] === 0) {
      distance[r][c] = 0;
      queue.push([r, c]);
    }
  }
}

while (queue.length > 0) {
  const next = [];
  for (const [r, c] of queue) {
    for (const [dr, dc] of steps) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
      if (distance[nr][nc] !== -1) continue;
      distance[nr][nc] = distance[r][c] + 1;
      next.push([nr, nc]);
    }
  }
  queue = next;
}
return distance;`,
      TYPESCRIPT: `const rows = grid.length;
const columns = grid[0].length;
const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];

const distance: number[][] = grid.map((line) => line.map(() => -1));
let queue: number[][] = [];
for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < columns; c += 1) {
    if (grid[r][c] === 0) {
      distance[r][c] = 0;
      queue.push([r, c]);
    }
  }
}

while (queue.length > 0) {
  const next: number[][] = [];
  for (const at of queue) {
    for (const step of steps) {
      const nr = at[0] + step[0];
      const nc = at[1] + step[1];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
      if (distance[nr][nc] !== -1) continue;
      distance[nr][nc] = distance[at[0]][at[1]] + 1;
      next.push([nr, nc]);
    }
  }
  queue = next;
}
return distance;`,
      PYTHON: `rows = len(grid)
columns = len(grid[0])
distance = [[-1] * columns for _ in range(rows)]

queue = []
for r in range(rows):
    for c in range(columns):
        if grid[r][c] == 0:
            distance[r][c] = 0
            queue.append((r, c))

while queue:
    following = []
    for r, c in queue:
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if nr < 0 or nr >= rows or nc < 0 or nc >= columns:
                continue
            if distance[nr][nc] != -1:
                continue
            distance[nr][nc] = distance[r][c] + 1
            following.append((nr, nc))
    queue = following
return distance`,
      JAVA: `int rows = grid.length;
int columns = grid[0].length;
int[][] steps = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

int[][] distance = new int[rows][columns];
for (int[] line : distance) Arrays.fill(line, -1);

List<int[]> queue = new ArrayList<>();
for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < columns; c += 1) {
        if (grid[r][c] == 0) {
            distance[r][c] = 0;
            queue.add(new int[] {r, c});
        }
    }
}

while (!queue.isEmpty()) {
    List<int[]> next = new ArrayList<>();
    for (int[] at : queue) {
        for (int[] step : steps) {
            int nr = at[0] + step[0];
            int nc = at[1] + step[1];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
            if (distance[nr][nc] != -1) continue;
            distance[nr][nc] = distance[at[0]][at[1]] + 1;
            next.add(new int[] {nr, nc});
        }
    }
    queue = next;
}
return distance;`,
      CPP: `int rows = (int)grid.size();
int columns = (int)grid[0].size();
int steps[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

vector<vector<int>> distance(rows, vector<int>(columns, -1));
vector<pair<int, int>> queue;
for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < columns; c += 1) {
        if (grid[r][c] == 0) {
            distance[r][c] = 0;
            queue.push_back({r, c});
        }
    }
}

while (!queue.empty()) {
    vector<pair<int, int>> following;
    for (auto& at : queue) {
        for (auto& step : steps) {
            int nr = at.first + step[0];
            int nc = at.second + step[1];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
            if (distance[nr][nc] != -1) continue;
            distance[nr][nc] = distance[at.first][at.second] + 1;
            following.push_back({nr, nc});
        }
    }
    queue = following;
}
return distance;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "shortest-word-chain",
    title: "The Shortest Word Chain",
    difficulty: "HARD",
    interviewFrequency: "HIGH",
    description:
      "Change the start word into the target word one letter at a time, so that " +
      "every intermediate word appears in the given dictionary. Return the number " +
      "of words in the shortest such chain, counting both ends, or 0 if there is " +
      "none. The target must itself be in the dictionary.",
    explanation:
      "The words are nodes and two words are joined when they differ in exactly " +
      "one letter, so this is a shortest path in an unweighted graph — breadth-" +
      "first search, not a search over letters. The trap is building the graph by " +
      "comparing every pair of words, which is O(m² × length) and dominates " +
      "everything. Instead, generate a word's neighbours on demand: for each " +
      "position, try each of the 26 letters and keep the results that are in the " +
      "dictionary, which costs O(26 × length) per word using a hash set for " +
      "membership. Remove a word from the dictionary as it is queued — that is " +
      "the visited marker, and it also stops the same word being expanded from " +
      "several places in the same round. Count words rather than steps, so a " +
      "start that already equals the target answers 1.",
    constraints: [
      "The dictionary holds between 0 and 5,000 words.",
      "All words have the same length, between 1 and 10 lowercase letters.",
      "The start word need not be in the dictionary; the target must be.",
    ],
    hints: [
      "Words are nodes; an edge is a one-letter difference. That makes it a shortest path.",
      "Do not compare every pair — generate neighbours by trying each letter at each position.",
      "Delete a word from the dictionary when you queue it, and it cannot be queued twice.",
    ],
    estimatedTime: "50 min",
    timeLimitMs: 5000,
    signature: {
      name: "shortestWordChain",
      params: [
        { name: "start", type: "string" },
        { name: "target", type: "string" },
        { name: "dictionary", type: "string[]" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-graph-bfs", "dsa-hashing", "dsa-strings"],
    examples: [
      {
        input: 'start = "hit", target = "cog", dictionary = ["hot", "dot", "dog", "lot", "log", "cog"]',
        output: "5",
        explanation: "hit → hot → dot → dog → cog is five words.",
      },
      {
        input: 'start = "hit", target = "cog", dictionary = ["hot", "dot", "dog"]',
        output: "0",
        explanation: "The target is not in the dictionary, so nothing can reach it.",
      },
    ],
    tests: [
      {
        args: ["hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]],
        expected: 5,
      },
      { args: ["hit", "cog", ["hot", "dot", "dog"]], expected: 0 },
      { args: ["a", "c", ["a", "b", "c"]], expected: 2 },
      { args: ["ab", "ab", ["ab"]], expected: 1, hidden: true },
      { args: ["ab", "cd", ["cd"]], expected: 0, hidden: true },
      { args: ["ab", "cb", ["cb"]], expected: 2, hidden: true },
      { args: ["hot", "dog", ["hot", "dog"]], expected: 0, hidden: true },
      { args: ["hot", "dog", ["hot", "dot", "dog"]], expected: 3, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const available = new Set(dictionary);
if (!available.has(target)) return 0;

const alphabet = "abcdefghijklmnopqrstuvwxyz";
let queue = [start];
available.delete(start);
let words = 1;

while (queue.length > 0) {
  const next = [];
  for (const word of queue) {
    if (word === target) return words;
    for (let i = 0; i < word.length; i += 1) {
      for (const letter of alphabet) {
        if (letter === word[i]) continue;
        const candidate = word.slice(0, i) + letter + word.slice(i + 1);
        if (!available.has(candidate)) continue;
        available.delete(candidate);
        next.push(candidate);
      }
    }
  }
  queue = next;
  words += 1;
}
return 0;`,
      TYPESCRIPT: `const available = new Set<string>(dictionary);
if (!available.has(target)) return 0;

const alphabet = "abcdefghijklmnopqrstuvwxyz";
let queue: string[] = [start];
available.delete(start);
let words = 1;

while (queue.length > 0) {
  const next: string[] = [];
  for (const word of queue) {
    if (word === target) return words;
    for (let i = 0; i < word.length; i += 1) {
      for (const letter of alphabet) {
        if (letter === word[i]) continue;
        const candidate = word.slice(0, i) + letter + word.slice(i + 1);
        if (!available.has(candidate)) continue;
        available.delete(candidate);
        next.push(candidate);
      }
    }
  }
  queue = next;
  words += 1;
}
return 0;`,
      PYTHON: `available = set(dictionary)
if target not in available:
    return 0

alphabet = "abcdefghijklmnopqrstuvwxyz"
queue = [start]
available.discard(start)
words = 1

while queue:
    following = []
    for word in queue:
        if word == target:
            return words
        for i in range(len(word)):
            for letter in alphabet:
                if letter == word[i]:
                    continue
                candidate = word[:i] + letter + word[i + 1:]
                if candidate not in available:
                    continue
                available.discard(candidate)
                following.append(candidate)
    queue = following
    words += 1
return 0`,
      JAVA: `Set<String> available = new HashSet<>(Arrays.asList(dictionary));
if (!available.contains(target)) return 0;

List<String> queue = new ArrayList<>();
queue.add(start);
available.remove(start);
int words = 1;

while (!queue.isEmpty()) {
    List<String> next = new ArrayList<>();
    for (String word : queue) {
        if (word.equals(target)) return words;
        char[] letters = word.toCharArray();
        for (int i = 0; i < letters.length; i += 1) {
            char original = letters[i];
            for (char letter = 'a'; letter <= 'z'; letter += 1) {
                if (letter == original) continue;
                letters[i] = letter;
                String candidate = new String(letters);
                if (!available.contains(candidate)) continue;
                available.remove(candidate);
                next.add(candidate);
            }
            letters[i] = original;
        }
    }
    queue = next;
    words += 1;
}
return 0;`,
      CPP: `unordered_set<string> available(dictionary.begin(), dictionary.end());
if (available.find(target) == available.end()) return 0;

vector<string> queue{start};
available.erase(start);
int words = 1;

while (!queue.empty()) {
    vector<string> following;
    for (const string& word : queue) {
        if (word == target) return words;
        string candidate = word;
        for (size_t i = 0; i < candidate.size(); i += 1) {
            char original = candidate[i];
            for (char letter = 'a'; letter <= 'z'; letter += 1) {
                if (letter == original) continue;
                candidate[i] = letter;
                if (available.find(candidate) == available.end()) continue;
                available.erase(candidate);
                following.push_back(candidate);
            }
            candidate[i] = original;
        }
    }
    queue = following;
    words += 1;
}
return 0;`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "shortest-bridge-between-islands",
    title: "The Shortest Bridge",
    difficulty: "HARD",
    interviewFrequency: "MEDIUM",
    description:
      "The grid holds exactly two islands of 1s, joined horizontally and " +
      "vertically. Return the fewest 0s that must be turned into 1s to join them " +
      "into one island.",
    explanation:
      "Two searches, and using the right one for each half is the whole problem. " +
      "First, a depth-first search from any land square finds one entire island " +
      "and marks it — depth-first is fine here because the question is which " +
      "squares belong, not how far away they are. Then a breadth-first search " +
      "seeded with *every* square of that island expands outwards one ring at a " +
      "time; the number of rings crossed before touching the other island is the " +
      "answer, because each ring is one square of water. Seeding with the whole " +
      "island rather than one square is what makes this the distance from the " +
      "island, not from a corner of it — the same multi-source idea as the " +
      "nearest-zero problem. Marking water as visited while expanding keeps it " +
      "linear.",
    constraints: [
      "The grid is square, with between 2 and 100 rows.",
      "Every square is 0 or 1, and exactly two islands are present.",
      "Islands are joined horizontally and vertically only.",
    ],
    hints: [
      "Find one whole island first — depth-first is enough for that half.",
      "Then expand outwards from every square of it at once.",
      "The number of rings crossed before reaching the other island is the answer.",
    ],
    estimatedTime: "50 min",
    timeLimitMs: 5000,
    signature: {
      name: "shortestBridgeBetweenIslands",
      params: [{ name: "grid", type: "int[][]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-graph-bfs", "dsa-graph-dfs", "js-arrays"],
    examples: [
      {
        input: "grid = [[0, 1], [1, 0]]",
        output: "1",
        explanation: "One square of water joins the two diagonal islands.",
      },
      {
        input: "grid = [[0, 1, 0], [0, 0, 0], [0, 0, 1]]",
        output: "2",
      },
    ],
    tests: [
      {
        args: [
          [
            [0, 1],
            [1, 0],
          ],
        ],
        expected: 1,
      },
      {
        args: [
          [
            [0, 1, 0],
            [0, 0, 0],
            [0, 0, 1],
          ],
        ],
        expected: 2,
      },
      {
        args: [
          [
            [1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1],
            [1, 0, 1, 0, 1],
            [1, 0, 0, 0, 1],
            [1, 1, 1, 1, 1],
          ],
        ],
        expected: 1,
      },
      {
        args: [
          [
            [1, 0, 0, 1],
            [0, 0, 0, 0],
          ],
        ],
        expected: 2,
        hidden: true,
      },
      {
        args: [
          [
            [1, 1, 0, 0, 1],
          ],
        ],
        expected: 2,
        hidden: true,
      },
      {
        args: [
          [
            [1, 0],
            [0, 1],
          ],
        ],
        expected: 1,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const n = grid.length;
const columns = grid[0].length;
const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const board = grid.map((line) => [...line]);

let frontier = [];
outer: for (let r = 0; r < n; r += 1) {
  for (let c = 0; c < columns; c += 1) {
    if (board[r][c] !== 1) continue;
    const stack = [[r, c]];
    board[r][c] = 2;
    while (stack.length > 0) {
      const [cr, cc] = stack.pop();
      frontier.push([cr, cc]);
      for (const [dr, dc] of steps) {
        const nr = cr + dr;
        const nc = cc + dc;
        if (nr < 0 || nr >= n || nc < 0 || nc >= columns) continue;
        if (board[nr][nc] !== 1) continue;
        board[nr][nc] = 2;
        stack.push([nr, nc]);
      }
    }
    break outer;
  }
}

let rings = 0;
while (frontier.length > 0) {
  const next = [];
  for (const [r, c] of frontier) {
    for (const [dr, dc] of steps) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= n || nc < 0 || nc >= columns) continue;
      if (board[nr][nc] === 1) return rings;
      if (board[nr][nc] !== 0) continue;
      board[nr][nc] = 2;
      next.push([nr, nc]);
    }
  }
  frontier = next;
  rings += 1;
}
return rings;`,
      TYPESCRIPT: `const n = grid.length;
const columns = grid[0].length;
const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const board: number[][] = grid.map((line) => [...line]);

let frontier: number[][] = [];
outer: for (let r = 0; r < n; r += 1) {
  for (let c = 0; c < columns; c += 1) {
    if (board[r][c] !== 1) continue;
    const stack: number[][] = [[r, c]];
    board[r][c] = 2;
    while (stack.length > 0) {
      const at = stack.pop() as number[];
      frontier.push(at);
      for (const step of steps) {
        const nr = at[0] + step[0];
        const nc = at[1] + step[1];
        if (nr < 0 || nr >= n || nc < 0 || nc >= columns) continue;
        if (board[nr][nc] !== 1) continue;
        board[nr][nc] = 2;
        stack.push([nr, nc]);
      }
    }
    break outer;
  }
}

let rings = 0;
while (frontier.length > 0) {
  const next: number[][] = [];
  for (const at of frontier) {
    for (const step of steps) {
      const nr = at[0] + step[0];
      const nc = at[1] + step[1];
      if (nr < 0 || nr >= n || nc < 0 || nc >= columns) continue;
      if (board[nr][nc] === 1) return rings;
      if (board[nr][nc] !== 0) continue;
      board[nr][nc] = 2;
      next.push([nr, nc]);
    }
  }
  frontier = next;
  rings += 1;
}
return rings;`,
      PYTHON: `n = len(grid)
columns = len(grid[0])
steps = ((1, 0), (-1, 0), (0, 1), (0, -1))
board = [list(line) for line in grid]

frontier = []
found = False
for r in range(n):
    if found:
        break
    for c in range(columns):
        if board[r][c] != 1:
            continue
        stack = [(r, c)]
        board[r][c] = 2
        while stack:
            cr, cc = stack.pop()
            frontier.append((cr, cc))
            for dr, dc in steps:
                nr, nc = cr + dr, cc + dc
                if nr < 0 or nr >= n or nc < 0 or nc >= columns:
                    continue
                if board[nr][nc] != 1:
                    continue
                board[nr][nc] = 2
                stack.append((nr, nc))
        found = True
        break

rings = 0
while frontier:
    following = []
    for r, c in frontier:
        for dr, dc in steps:
            nr, nc = r + dr, c + dc
            if nr < 0 or nr >= n or nc < 0 or nc >= columns:
                continue
            if board[nr][nc] == 1:
                return rings
            if board[nr][nc] != 0:
                continue
            board[nr][nc] = 2
            following.append((nr, nc))
    frontier = following
    rings += 1
return rings`,
      JAVA: `int n = grid.length;
int columns = grid[0].length;
int[][] steps = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
int[][] board = new int[n][];
for (int i = 0; i < n; i += 1) board[i] = grid[i].clone();

List<int[]> frontier = new ArrayList<>();
boolean found = false;
for (int r = 0; r < n && !found; r += 1) {
    for (int c = 0; c < columns && !found; c += 1) {
        if (board[r][c] != 1) continue;
        Deque<int[]> stack = new ArrayDeque<>();
        stack.push(new int[] {r, c});
        board[r][c] = 2;
        while (!stack.isEmpty()) {
            int[] at = stack.pop();
            frontier.add(at);
            for (int[] step : steps) {
                int nr = at[0] + step[0];
                int nc = at[1] + step[1];
                if (nr < 0 || nr >= n || nc < 0 || nc >= columns) continue;
                if (board[nr][nc] != 1) continue;
                board[nr][nc] = 2;
                stack.push(new int[] {nr, nc});
            }
        }
        found = true;
    }
}

int rings = 0;
while (!frontier.isEmpty()) {
    List<int[]> next = new ArrayList<>();
    for (int[] at : frontier) {
        for (int[] step : steps) {
            int nr = at[0] + step[0];
            int nc = at[1] + step[1];
            if (nr < 0 || nr >= n || nc < 0 || nc >= columns) continue;
            if (board[nr][nc] == 1) return rings;
            if (board[nr][nc] != 0) continue;
            board[nr][nc] = 2;
            next.add(new int[] {nr, nc});
        }
    }
    frontier = next;
    rings += 1;
}
return rings;`,
      CPP: `int n = (int)grid.size();
int columns = (int)grid[0].size();
int steps[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
vector<vector<int>> board = grid;

vector<pair<int, int>> frontier;
bool found = false;
for (int r = 0; r < n && !found; r += 1) {
    for (int c = 0; c < columns && !found; c += 1) {
        if (board[r][c] != 1) continue;
        vector<pair<int, int>> stack{{r, c}};
        board[r][c] = 2;
        while (!stack.empty()) {
            pair<int, int> at = stack.back();
            stack.pop_back();
            frontier.push_back(at);
            for (auto& step : steps) {
                int nr = at.first + step[0];
                int nc = at.second + step[1];
                if (nr < 0 || nr >= n || nc < 0 || nc >= columns) continue;
                if (board[nr][nc] != 1) continue;
                board[nr][nc] = 2;
                stack.push_back({nr, nc});
            }
        }
        found = true;
    }
}

int rings = 0;
while (!frontier.empty()) {
    vector<pair<int, int>> following;
    for (auto& at : frontier) {
        for (auto& step : steps) {
            int nr = at.first + step[0];
            int nc = at.second + step[1];
            if (nr < 0 || nr >= n || nc < 0 || nc >= columns) continue;
            if (board[nr][nc] == 1) return rings;
            if (board[nr][nc] != 0) continue;
            board[nr][nc] = 2;
            following.push_back({nr, nc});
        }
    }
    frontier = following;
    rings += 1;
}
return rings;`,
    },
  },
];
