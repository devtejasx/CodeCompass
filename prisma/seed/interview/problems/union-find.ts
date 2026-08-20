import type { SeedProblem } from "../../problems/types";

/**
 * Union find.
 *
 * A structure with exactly two operations — which group is this in, and merge
 * these two groups — both of which cost almost nothing once path compression
 * and union by size are in place. Roughly twenty lines, and every problem here
 * is those twenty lines plus about five more.
 *
 * The reason it earns a topic of its own rather than being a footnote to graph
 * traversal is that it answers connectivity questions *incrementally*. A
 * depth-first search tells you the components of a fixed graph; union find
 * keeps telling you as edges arrive, which is what makes "the first moment
 * everything is connected" and "which edge closed a loop" natural rather than
 * quadratic.
 *
 * Both optimisations are used throughout and both are explained once: path
 * compression flattens the tree on the way back from a lookup, and union by
 * size keeps the shorter tree hanging off the taller one. Either alone is good;
 * together they make the amortised cost effectively constant.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const UNION_FIND_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "count-the-provinces",
    title: "Count the Provinces",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "A square grid describes which cities are directly linked: entry [i][j] is " +
      "1 when city i and city j are linked, and 0 otherwise. Links are mutual, " +
      "and every city is linked to itself. A province is a group of cities " +
      "reachable from one another. Return how many provinces there are.",
    explanation:
      "Walk the upper half of the grid and union the endpoints of every link. " +
      "The number of provinces is then the number of groups left, which is " +
      "easiest to track by starting the count at n and decreasing it every time " +
      "a union actually merges two different groups — a union of two cities " +
      "already together must not count. Only the upper triangle needs visiting, " +
      "since the grid is symmetric and the diagonal says nothing. A depth-first " +
      "search would answer this too, in the same O(n²) it takes to read the " +
      "grid; union find is here because it is the version that keeps working " +
      "when the links arrive one at a time instead of all at once, which is the " +
      "follow-up interviewers ask.",
    constraints: [
      "Between 1 and 200 cities, given as an n by n grid.",
      "Entries are 0 or 1, the grid is symmetric, and the diagonal is all 1s.",
      "Every city belongs to exactly one province.",
    ],
    hints: [
      "Start the count at n and decrease it only when a union merges two different groups.",
      "The grid is symmetric — the upper triangle holds every link already.",
      "A union of two cities already in the same group must change nothing.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "countTheProvinces",
      params: [{ name: "links", type: "int[][]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-union-find", "dsa-graph-dfs", "js-arrays"],
    examples: [
      {
        input: "links = [[1, 1, 0], [1, 1, 0], [0, 0, 1]]",
        output: "2",
        explanation: "Cities 0 and 1 are together; city 2 is alone.",
      },
      {
        input: "links = [[1, 0], [0, 1]]",
        output: "2",
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
            [1, 0],
            [0, 1],
          ],
        ],
        expected: 2,
      },
      { args: [[[1]]], expected: 1 },
      {
        args: [
          [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1],
          ],
        ],
        expected: 1,
        hidden: true,
      },
      {
        args: [
          [
            [1, 1, 0, 0],
            [1, 1, 0, 0],
            [0, 0, 1, 1],
            [0, 0, 1, 1],
          ],
        ],
        expected: 2,
        hidden: true,
      },
      {
        args: [
          [
            [1, 0, 0, 1],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [1, 0, 0, 1],
          ],
        ],
        expected: 2,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const n = links.length;
const parent = Array.from({ length: n }, (_, i) => i);
const size = new Array(n).fill(1);

function find(x) {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]];
    x = parent[x];
  }
  return x;
}

let provinces = n;
for (let i = 0; i < n; i += 1) {
  for (let j = i + 1; j < n; j += 1) {
    if (links[i][j] !== 1) continue;
    let a = find(i);
    let b = find(j);
    if (a === b) continue;
    if (size[a] < size[b]) [a, b] = [b, a];
    parent[b] = a;
    size[a] += size[b];
    provinces -= 1;
  }
}
return provinces;`,
      TYPESCRIPT: `const n = links.length;
const parent: number[] = Array.from({ length: n }, (_, i) => i);
const size: number[] = new Array(n).fill(1);

function find(x: number): number {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]];
    x = parent[x];
  }
  return x;
}

let provinces = n;
for (let i = 0; i < n; i += 1) {
  for (let j = i + 1; j < n; j += 1) {
    if (links[i][j] !== 1) continue;
    let a = find(i);
    let b = find(j);
    if (a === b) continue;
    if (size[a] < size[b]) [a, b] = [b, a];
    parent[b] = a;
    size[a] += size[b];
    provinces -= 1;
  }
}
return provinces;`,
      PYTHON: `n = len(links)
parent = list(range(n))
size = [1] * n

def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x

provinces = n
for i in range(n):
    for j in range(i + 1, n):
        if links[i][j] != 1:
            continue
        a, b = find(i), find(j)
        if a == b:
            continue
        if size[a] < size[b]:
            a, b = b, a
        parent[b] = a
        size[a] += size[b]
        provinces -= 1
return provinces`,
      JAVA: `int n = links.length;
int[] parent = new int[n];
int[] size = new int[n];
for (int i = 0; i < n; i += 1) {
    parent[i] = i;
    size[i] = 1;
}

class Sets {
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
}

Sets sets = new Sets();
int provinces = n;
for (int i = 0; i < n; i += 1) {
    for (int j = i + 1; j < n; j += 1) {
        if (links[i][j] != 1) continue;
        int a = sets.find(i);
        int b = sets.find(j);
        if (a == b) continue;
        if (size[a] < size[b]) {
            int swap = a;
            a = b;
            b = swap;
        }
        parent[b] = a;
        size[a] += size[b];
        provinces -= 1;
    }
}
return provinces;`,
      CPP: `int n = (int)links.size();
vector<int> parent(n);
vector<int> size(n, 1);
for (int i = 0; i < n; i += 1) parent[i] = i;

function<int(int)> find = [&](int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
};

int provinces = n;
for (int i = 0; i < n; i += 1) {
    for (int j = i + 1; j < n; j += 1) {
        if (links[i][j] != 1) continue;
        int a = find(i);
        int b = find(j);
        if (a == b) continue;
        if (size[a] < size[b]) swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        provinces -= 1;
    }
}
return provinces;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "the-edge-that-closed-the-loop",
    title: "The Edge That Closed the Loop",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "A tree on n nodes numbered 1 to n has had exactly one extra undirected " +
      "edge added, so it now holds exactly one loop. Return that extra edge. If " +
      "several edges could be removed to leave a tree, return the one appearing " +
      "last in the list.",
    explanation:
      "Add the edges one at a time, and the first edge whose two endpoints are " +
      "already in the same group is the one that closed the loop — every earlier " +
      "edge joined two separate pieces and was therefore part of the tree. " +
      "Because the edges are processed in order, the edge found this way is " +
      "automatically the last one that could be removed, which is exactly the " +
      "tie-break the statement asks for; no second pass is needed. This is the " +
      "clearest example of what union find is *for*: the same answer by " +
      "depth-first search means re-searching the accumulated graph after every " +
      "edge, which is O(n²), whereas here each edge costs almost nothing.",
    constraints: [
      "Between 3 and 1,000 edges, on nodes numbered 1 to n where n is the edge count.",
      "The graph is connected and holds exactly one loop.",
      "The answer is the qualifying edge that appears last in the input.",
    ],
    hints: [
      "Add edges one at a time and watch for the first that joins two nodes already together.",
      "Every edge before that one was joining two separate pieces.",
      "Processing in order gives the required tie-break for free.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "theEdgeThatClosedTheLoop",
      params: [{ name: "edges", type: "int[][]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-union-find", "dsa-graph-dfs", "js-arrays"],
    examples: [
      {
        input: "edges = [[1, 2], [1, 3], [2, 3]]",
        output: "[2, 3]",
        explanation: "By the time [2,3] arrives, 2 and 3 are already joined through 1.",
      },
      {
        input: "edges = [[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]",
        output: "[1, 4]",
      },
    ],
    tests: [
      {
        args: [
          [
            [1, 2],
            [1, 3],
            [2, 3],
          ],
        ],
        expected: [2, 3],
      },
      {
        args: [
          [
            [1, 2],
            [2, 3],
            [3, 4],
            [1, 4],
            [1, 5],
          ],
        ],
        expected: [1, 4],
      },
      {
        args: [
          [
            [1, 2],
            [2, 3],
            [1, 3],
          ],
        ],
        expected: [1, 3],
      },
      {
        args: [
          [
            [1, 2],
            [1, 3],
            [1, 4],
            [3, 4],
          ],
        ],
        expected: [3, 4],
        hidden: true,
      },
      {
        args: [
          [
            [2, 3],
            [1, 2],
            [1, 3],
          ],
        ],
        expected: [1, 3],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const n = edges.length;
const parent = Array.from({ length: n + 1 }, (_, i) => i);
const size = new Array(n + 1).fill(1);

function find(x) {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]];
    x = parent[x];
  }
  return x;
}

for (const [u, v] of edges) {
  let a = find(u);
  let b = find(v);
  if (a === b) return [u, v];
  if (size[a] < size[b]) [a, b] = [b, a];
  parent[b] = a;
  size[a] += size[b];
}
return [];`,
      TYPESCRIPT: `const n = edges.length;
const parent: number[] = Array.from({ length: n + 1 }, (_, i) => i);
const size: number[] = new Array(n + 1).fill(1);

function find(x: number): number {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]];
    x = parent[x];
  }
  return x;
}

for (const edge of edges) {
  let a = find(edge[0]);
  let b = find(edge[1]);
  if (a === b) return [edge[0], edge[1]];
  if (size[a] < size[b]) [a, b] = [b, a];
  parent[b] = a;
  size[a] += size[b];
}
return [];`,
      PYTHON: `n = len(edges)
parent = list(range(n + 1))
size = [1] * (n + 1)

def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x

for u, v in edges:
    a, b = find(u), find(v)
    if a == b:
        return [u, v]
    if size[a] < size[b]:
        a, b = b, a
    parent[b] = a
    size[a] += size[b]
return []`,
      JAVA: `int n = edges.length;
int[] parent = new int[n + 1];
int[] size = new int[n + 1];
for (int i = 0; i <= n; i += 1) {
    parent[i] = i;
    size[i] = 1;
}

class Sets {
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
}

Sets sets = new Sets();
for (int[] edge : edges) {
    int a = sets.find(edge[0]);
    int b = sets.find(edge[1]);
    if (a == b) return new int[] {edge[0], edge[1]};
    if (size[a] < size[b]) {
        int swap = a;
        a = b;
        b = swap;
    }
    parent[b] = a;
    size[a] += size[b];
}
return new int[0];`,
      CPP: `int n = (int)edges.size();
vector<int> parent(n + 1);
vector<int> size(n + 1, 1);
for (int i = 0; i <= n; i += 1) parent[i] = i;

function<int(int)> find = [&](int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
};

for (const vector<int>& edge : edges) {
    int a = find(edge[0]);
    int b = find(edge[1]);
    if (a == b) return vector<int>{edge[0], edge[1]};
    if (size[a] < size[b]) swap(a, b);
    parent[b] = a;
    size[a] += size[b];
}
return vector<int>{};`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "when-everyone-is-connected",
    title: "When Everyone Is Connected",
    difficulty: "HARD",
    interviewFrequency: "MEDIUM",
    description:
      "There are n people numbered 0 to n-1. Each entry [time, a, b] records " +
      "that a and b became acquainted at that time. Acquaintance spreads: if a " +
      "knows b and b knows c, then a knows c. Return the earliest time at which " +
      "everybody knows everybody, or -1 if that never happens.",
    explanation:
      "Sort the records by time and apply them in order, merging the two people " +
      "each one names. Because a merge can only ever reduce the number of " +
      "groups, and the groups only ever grow, the moment the count reaches one " +
      "is the earliest time everybody is connected — there is no need to check " +
      "anything again afterwards, and no need to try candidate times. This is " +
      "the incremental property doing the work: rebuilding the graph and running " +
      "a traversal after each record would be O(records × n) for the same " +
      "answer. Records left unprocessed after the count reaches one are " +
      "irrelevant, and if it never reaches one the answer is -1.",
    constraints: [
      "n is between 1 and 100,000.",
      "Between 0 and 200,000 records, each [time, a, b] with a and b distinct.",
      "Times are between 0 and 1,000,000,000 and may repeat.",
    ],
    hints: [
      "Apply the records in time order — the groups only ever merge.",
      "Track how many groups remain; the moment it hits one, you are done.",
      "One person alone is already connected, at time 0.",
    ],
    estimatedTime: "40 min",
    signature: {
      name: "whenEveryoneIsConnected",
      params: [
        { name: "n", type: "int" },
        { name: "records", type: "int[][]" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-union-find", "dsa-sorting", "js-arrays"],
    examples: [
      {
        input: "n = 3, records = [[5, 0, 1], [3, 1, 2]]",
        output: "5",
        explanation: "At time 3 only 1 and 2 know each other; the group closes at 5.",
      },
      {
        input: "n = 3, records = [[1, 0, 1]]",
        output: "-1",
        explanation: "Person 2 never meets anybody.",
      },
    ],
    tests: [
      {
        args: [
          3,
          [
            [5, 0, 1],
            [3, 1, 2],
          ],
        ],
        expected: 5,
      },
      { args: [3, [[1, 0, 1]]], expected: -1 },
      { args: [1, []], expected: 0 },
      {
        args: [
          4,
          [
            [0, 0, 1],
            [1, 2, 3],
            [2, 0, 2],
          ],
        ],
        expected: 2,
        hidden: true,
      },
      {
        args: [
          2,
          [
            [7, 0, 1],
            [9, 0, 1],
          ],
        ],
        expected: 7,
        hidden: true,
      },
      { args: [2, []], expected: -1, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `if (n === 1) return 0;
const parent = Array.from({ length: n }, (_, i) => i);
const size = new Array(n).fill(1);

function find(x) {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]];
    x = parent[x];
  }
  return x;
}

const ordered = [...records].sort((x, y) => x[0] - y[0]);
let groups = n;
for (const [time, u, v] of ordered) {
  let a = find(u);
  let b = find(v);
  if (a === b) continue;
  if (size[a] < size[b]) [a, b] = [b, a];
  parent[b] = a;
  size[a] += size[b];
  groups -= 1;
  if (groups === 1) return time;
}
return -1;`,
      TYPESCRIPT: `if (n === 1) return 0;
const parent: number[] = Array.from({ length: n }, (_, i) => i);
const size: number[] = new Array(n).fill(1);

function find(x: number): number {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]];
    x = parent[x];
  }
  return x;
}

const ordered = [...records].sort((x, y) => x[0] - y[0]);
let groups = n;
for (const record of ordered) {
  let a = find(record[1]);
  let b = find(record[2]);
  if (a === b) continue;
  if (size[a] < size[b]) [a, b] = [b, a];
  parent[b] = a;
  size[a] += size[b];
  groups -= 1;
  if (groups === 1) return record[0];
}
return -1;`,
      PYTHON: `if n == 1:
    return 0
parent = list(range(n))
size = [1] * n

def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x

groups = n
for time, u, v in sorted(records, key=lambda record: record[0]):
    a, b = find(u), find(v)
    if a == b:
        continue
    if size[a] < size[b]:
        a, b = b, a
    parent[b] = a
    size[a] += size[b]
    groups -= 1
    if groups == 1:
        return time
return -1`,
      JAVA: `if (n == 1) return 0;
int[] parent = new int[n];
int[] size = new int[n];
for (int i = 0; i < n; i += 1) {
    parent[i] = i;
    size[i] = 1;
}

class Sets {
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
}

int[][] ordered = records.clone();
Arrays.sort(ordered, (x, y) -> Integer.compare(x[0], y[0]));
Sets sets = new Sets();
int groups = n;
for (int[] record : ordered) {
    int a = sets.find(record[1]);
    int b = sets.find(record[2]);
    if (a == b) continue;
    if (size[a] < size[b]) {
        int swap = a;
        a = b;
        b = swap;
    }
    parent[b] = a;
    size[a] += size[b];
    groups -= 1;
    if (groups == 1) return record[0];
}
return -1;`,
      CPP: `if (n == 1) return 0;
vector<int> parent(n);
vector<int> size(n, 1);
for (int i = 0; i < n; i += 1) parent[i] = i;

function<int(int)> find = [&](int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
};

vector<vector<int>> ordered = records;
sort(ordered.begin(), ordered.end(),
     [](const vector<int>& x, const vector<int>& y) { return x[0] < y[0]; });

int groups = n;
for (const vector<int>& record : ordered) {
    int a = find(record[1]);
    int b = find(record[2]);
    if (a == b) continue;
    if (size[a] < size[b]) swap(a, b);
    parent[b] = a;
    size[a] += size[b];
    groups -= 1;
    if (groups == 1) return record[0];
}
return -1;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "cheapest-network-to-build",
    title: "The Cheapest Network to Build",
    difficulty: "HARD",
    interviewFrequency: "MEDIUM",
    description:
      "There are n sites numbered 0 to n-1, and each entry [a, b, cost] is a " +
      "possible link and what it costs. Return the least total cost of choosing " +
      "links so that every site can reach every other, or -1 if that is " +
      "impossible.",
    explanation:
      "This is a minimum spanning tree, and Kruskal's algorithm is union find " +
      "with a sort in front of it: consider the links from cheapest to dearest, " +
      "and take one exactly when its endpoints are not already connected. " +
      "Rejecting a link whose endpoints are already together is what stops loops " +
      "forming, and union find is what makes that test cheap. The greedy choice " +
      "is safe by an exchange argument — for any cheapest link crossing between " +
      "two groups, some minimum spanning tree contains it, because swapping it " +
      "into a tree that lacks it and dropping another link across the same " +
      "divide cannot increase the total. Stop once n-1 links have been taken; if " +
      "the links run out first the sites cannot all be joined and the answer is " +
      "-1.",
    constraints: [
      "n is between 1 and 10,000.",
      "Between 0 and 100,000 possible links, each [a, b, cost] with a and b distinct.",
      "Costs are between 0 and 1,000,000, and duplicate links may appear.",
    ],
    hints: [
      "Sort the links by cost and take each one unless it would close a loop.",
      "Union find is what makes 'would this close a loop' cheap to ask.",
      "A tree over n sites needs exactly n - 1 links; fewer means it is impossible.",
    ],
    estimatedTime: "45 min",
    signature: {
      name: "cheapestNetworkToBuild",
      params: [
        { name: "n", type: "int" },
        { name: "links", type: "int[][]" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-union-find", "dsa-greedy", "dsa-sorting"],
    examples: [
      {
        input: "n = 3, links = [[0, 1, 5], [1, 2, 4], [0, 2, 10]]",
        output: "9",
        explanation: "Taking the 4 and the 5 joins all three sites.",
      },
      {
        input: "n = 3, links = [[0, 1, 1]]",
        output: "-1",
        explanation: "Site 2 cannot be reached at all.",
      },
    ],
    tests: [
      {
        args: [
          3,
          [
            [0, 1, 5],
            [1, 2, 4],
            [0, 2, 10],
          ],
        ],
        expected: 9,
      },
      { args: [3, [[0, 1, 1]]], expected: -1 },
      { args: [1, []], expected: 0 },
      {
        args: [
          4,
          [
            [0, 1, 1],
            [1, 2, 1],
            [2, 3, 1],
            [0, 3, 100],
          ],
        ],
        expected: 3,
        hidden: true,
      },
      {
        args: [
          2,
          [
            [0, 1, 7],
            [0, 1, 3],
          ],
        ],
        expected: 3,
        hidden: true,
      },
      { args: [2, []], expected: -1, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const parent = Array.from({ length: n }, (_, i) => i);
const size = new Array(n).fill(1);

function find(x) {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]];
    x = parent[x];
  }
  return x;
}

const ordered = [...links].sort((x, y) => x[2] - y[2]);
let total = 0;
let taken = 0;
for (const [u, v, cost] of ordered) {
  let a = find(u);
  let b = find(v);
  if (a === b) continue;
  if (size[a] < size[b]) [a, b] = [b, a];
  parent[b] = a;
  size[a] += size[b];
  total += cost;
  taken += 1;
  if (taken === n - 1) break;
}
return taken === n - 1 ? total : -1;`,
      TYPESCRIPT: `const parent: number[] = Array.from({ length: n }, (_, i) => i);
const size: number[] = new Array(n).fill(1);

function find(x: number): number {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]];
    x = parent[x];
  }
  return x;
}

const ordered = [...links].sort((x, y) => x[2] - y[2]);
let total = 0;
let taken = 0;
for (const link of ordered) {
  let a = find(link[0]);
  let b = find(link[1]);
  if (a === b) continue;
  if (size[a] < size[b]) [a, b] = [b, a];
  parent[b] = a;
  size[a] += size[b];
  total += link[2];
  taken += 1;
  if (taken === n - 1) break;
}
return taken === n - 1 ? total : -1;`,
      PYTHON: `parent = list(range(n))
size = [1] * n

def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x

total = 0
taken = 0
for u, v, cost in sorted(links, key=lambda link: link[2]):
    a, b = find(u), find(v)
    if a == b:
        continue
    if size[a] < size[b]:
        a, b = b, a
    parent[b] = a
    size[a] += size[b]
    total += cost
    taken += 1
    if taken == n - 1:
        break
return total if taken == n - 1 else -1`,
      JAVA: `int[] parent = new int[n];
int[] size = new int[n];
for (int i = 0; i < n; i += 1) {
    parent[i] = i;
    size[i] = 1;
}

class Sets {
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
}

int[][] ordered = links.clone();
Arrays.sort(ordered, (x, y) -> Integer.compare(x[2], y[2]));
Sets sets = new Sets();
long total = 0;
int taken = 0;
for (int[] link : ordered) {
    int a = sets.find(link[0]);
    int b = sets.find(link[1]);
    if (a == b) continue;
    if (size[a] < size[b]) {
        int swap = a;
        a = b;
        b = swap;
    }
    parent[b] = a;
    size[a] += size[b];
    total += link[2];
    taken += 1;
    if (taken == n - 1) break;
}
return taken == n - 1 ? (int) total : -1;`,
      CPP: `vector<int> parent(n);
vector<int> size(n, 1);
for (int i = 0; i < n; i += 1) parent[i] = i;

function<int(int)> find = [&](int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
};

vector<vector<int>> ordered = links;
sort(ordered.begin(), ordered.end(),
     [](const vector<int>& x, const vector<int>& y) { return x[2] < y[2]; });

long long total = 0;
int taken = 0;
for (const vector<int>& link : ordered) {
    int a = find(link[0]);
    int b = find(link[1]);
    if (a == b) continue;
    if (size[a] < size[b]) swap(a, b);
    parent[b] = a;
    size[a] += size[b];
    total += link[2];
    taken += 1;
    if (taken == n - 1) break;
}
return taken == n - 1 ? (int)total : -1;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "most-stones-you-can-remove",
    title: "The Most Stones You Can Remove",
    difficulty: "HARD",
    interviewFrequency: "MEDIUM",
    description:
      "Stones sit on a grid at the given [row, column] positions, at most one per " +
      "position. A stone may be removed if another stone remains in its row or " +
      "its column. Return the largest number of stones that can be removed.",
    explanation:
      "Two stones sharing a row or a column are connected, and the key claim is " +
      "that from any connected group of k stones, exactly k-1 can be removed: " +
      "remove them in the reverse of the order a spanning tree of the group " +
      "would visit them, and each one always still has a neighbour when its turn " +
      "comes. So the answer is the number of stones minus the number of " +
      "connected groups, and the algorithm is entirely about counting groups. " +
      "Comparing every pair of stones to find them is O(n²); instead union each " +
      "stone with its row and its column, treating rows and columns as nodes in " +
      "the same structure — offsetting the column numbers so they cannot collide " +
      "with row numbers. Counting the distinct groups among the stones then " +
      "gives the answer directly.",
    constraints: [
      "Between 1 and 1,000 stones, each at a distinct [row, column].",
      "Row and column numbers are between 0 and 10,000.",
      "A stone can be removed only while a stone remains in its row or column.",
    ],
    hints: [
      "From a connected group of k stones, exactly k - 1 can go.",
      "So the answer is the stone count minus the number of groups.",
      "Union each stone with its row and its column, keeping the two kinds of node apart.",
    ],
    estimatedTime: "45 min",
    signature: {
      name: "mostStonesYouCanRemove",
      params: [{ name: "stones", type: "int[][]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-union-find", "dsa-hashing", "js-arrays"],
    examples: [
      {
        input: "stones = [[0, 0], [0, 1], [1, 0], [1, 2], [2, 1], [2, 2]]",
        output: "5",
        explanation: "All six are connected, so all but one can go.",
      },
      {
        input: "stones = [[0, 0], [1, 1]]",
        output: "0",
        explanation: "They share neither a row nor a column.",
      },
    ],
    tests: [
      {
        args: [
          [
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 2],
            [2, 1],
            [2, 2],
          ],
        ],
        expected: 5,
      },
      {
        args: [
          [
            [0, 0],
            [1, 1],
          ],
        ],
        expected: 0,
      },
      { args: [[[0, 0]]], expected: 0 },
      {
        args: [
          [
            [0, 0],
            [0, 2],
            [1, 1],
            [2, 0],
            [2, 2],
          ],
        ],
        expected: 3,
        hidden: true,
      },
      {
        args: [
          [
            [0, 1],
            [1, 0],
          ],
        ],
        expected: 0,
        hidden: true,
      },
      {
        args: [
          [
            [0, 0],
            [0, 1],
            [0, 2],
          ],
        ],
        expected: 2,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const OFFSET = 20000;
const parent = new Map();

function find(x) {
  if (!parent.has(x)) parent.set(x, x);
  let root = x;
  while (parent.get(root) !== root) root = parent.get(root);
  while (parent.get(x) !== root) {
    const up = parent.get(x);
    parent.set(x, root);
    x = up;
  }
  return root;
}

for (const [row, column] of stones) {
  const a = find(row);
  const b = find(column + OFFSET);
  if (a !== b) parent.set(b, a);
}

const groups = new Set();
for (const [row] of stones) groups.add(find(row));
return stones.length - groups.size;`,
      TYPESCRIPT: `const OFFSET = 20000;
const parent = new Map<number, number>();

function find(x: number): number {
  if (!parent.has(x)) parent.set(x, x);
  let root = x;
  while (parent.get(root) !== root) root = parent.get(root) as number;
  while (parent.get(x) !== root) {
    const up = parent.get(x) as number;
    parent.set(x, root);
    x = up;
  }
  return root;
}

for (const stone of stones) {
  const a = find(stone[0]);
  const b = find(stone[1] + OFFSET);
  if (a !== b) parent.set(b, a);
}

const groups = new Set<number>();
for (const stone of stones) groups.add(find(stone[0]));
return stones.length - groups.size;`,
      PYTHON: `OFFSET = 20000
parent = {}

def find(x):
    if x not in parent:
        parent[x] = x
    root = x
    while parent[root] != root:
        root = parent[root]
    while parent[x] != root:
        parent[x], x = root, parent[x]
    return root

for row, column in stones:
    a = find(row)
    b = find(column + OFFSET)
    if a != b:
        parent[b] = a

groups = {find(row) for row, _column in stones}
return len(stones) - len(groups)`,
      JAVA: `final int OFFSET = 20000;
Map<Integer, Integer> parent = new HashMap<>();

class Sets {
    int find(int x) {
        parent.putIfAbsent(x, x);
        int root = x;
        while (parent.get(root) != root) root = parent.get(root);
        while (parent.get(x) != root) {
            int up = parent.get(x);
            parent.put(x, root);
            x = up;
        }
        return root;
    }
}

Sets sets = new Sets();
for (int[] stone : stones) {
    int a = sets.find(stone[0]);
    int b = sets.find(stone[1] + OFFSET);
    if (a != b) parent.put(b, a);
}

Set<Integer> groups = new HashSet<>();
for (int[] stone : stones) groups.add(sets.find(stone[0]));
return stones.length - groups.size();`,
      CPP: `const int OFFSET = 20000;
unordered_map<int, int> parent;

function<int(int)> find = [&](int x) {
    if (parent.find(x) == parent.end()) parent[x] = x;
    int root = x;
    while (parent[root] != root) root = parent[root];
    while (parent[x] != root) {
        int up = parent[x];
        parent[x] = root;
        x = up;
    }
    return root;
};

for (const vector<int>& stone : stones) {
    int a = find(stone[0]);
    int b = find(stone[1] + OFFSET);
    if (a != b) parent[b] = a;
}

set<int> groups;
for (const vector<int>& stone : stones) groups.insert(find(stone[0]));
return (int)stones.size() - (int)groups.size();`,
    },
  },
];
