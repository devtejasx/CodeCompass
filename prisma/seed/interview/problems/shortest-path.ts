import type { SeedProblem } from "../../problems/types";

/**
 * Shortest paths with weights.
 *
 * Breadth-first search is a shortest-path algorithm only because every edge
 * costs the same. Once they differ, the queue's promise — that nodes come out
 * in non-decreasing distance order — no longer holds, and the fix is to replace
 * the queue with a structure that restores it. That is the entire idea behind
 * Dijkstra's algorithm, and saying it that way makes it something derived from
 * the previous topic rather than memorised.
 *
 * The file covers the three cases an interview actually distinguishes. Dijkstra
 * when the weights are non-negative. Bellman-Ford when a limit on the number of
 * edges makes the greedy argument fail, which is also the algorithm to reach
 * for when weights can go negative. And the case where the "distance" is not a
 * sum at all — the widest bottleneck — which is Dijkstra with the relaxation
 * step changed and is the clearest evidence that the algorithm is a pattern
 * rather than a formula.
 *
 * Weighted edges arrive as int[][], each entry [from, to, weight], which every
 * statement repeats.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const SHORTEST_PATH_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "time-for-the-signal-to-arrive",
    title: "Time for the Signal to Arrive",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "There are n stations numbered 0 to n-1. Each entry [from, to, time] is a " +
      "one-way link and how long a signal takes to cross it. A signal is sent " +
      "from the given station. Return the time until every station has received " +
      "it, or -1 if some station never does.",
    explanation:
      "The answer is the largest of the shortest distances from the source, so " +
      "run Dijkstra's algorithm and take the maximum. The algorithm is breadth-" +
      "first search with the queue replaced by a min-heap ordered on distance, " +
      "which restores the property that made BFS correct: the node pulled out " +
      "next is always the nearest one not yet settled, and because no edge has " +
      "negative weight, nothing discovered later can improve it. Push a node " +
      "again rather than trying to decrease its key in place — the standard " +
      "trick — and skip any entry whose recorded distance is worse than the best " +
      "already known, which is what stops the stale copies costing anything. " +
      "Cost is O(e log e). If any station is still at infinity at the end, it " +
      "was never reached.",
    constraints: [
      "n is between 1 and 10,000.",
      "Between 0 and 100,000 one-way links, each [from, to, time] with time at least 0.",
      "Times are between 0 and 1,000,000, and repeated links may appear.",
    ],
    hints: [
      "The answer is the largest shortest-distance, so solve for all of them.",
      "Replace the BFS queue with a min-heap ordered on distance.",
      "Push duplicates rather than updating in place, and skip stale entries on the way out.",
    ],
    estimatedTime: "40 min",
    signature: {
      name: "timeForTheSignalToArrive",
      params: [
        { name: "n", type: "int" },
        { name: "links", type: "int[][]" },
        { name: "source", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-shortest-path", "dsa-heap", "dsa-graph-bfs"],
    examples: [
      {
        input: "n = 4, links = [[2, 1, 1], [2, 3, 1], [3, 4, 1]], source = 2",
        output: "-1",
        explanation: "There is no station 4 to reach, and station 0 is never reached.",
      },
      {
        input: "n = 2, links = [[0, 1, 1]], source = 0",
        output: "1",
      },
    ],
    tests: [
      {
        args: [
          4,
          [
            [2, 1, 1],
            [2, 3, 1],
          ],
          2,
        ],
        expected: -1,
      },
      { args: [2, [[0, 1, 1]], 0], expected: 1 },
      { args: [1, [], 0], expected: 0 },
      {
        args: [
          3,
          [
            [0, 1, 5],
            [0, 2, 10],
            [1, 2, 2],
          ],
          0,
        ],
        expected: 7,
        hidden: true,
      },
      { args: [2, [[1, 0, 1]], 0], expected: -1, hidden: true },
      {
        args: [
          4,
          [
            [0, 1, 1],
            [1, 2, 1],
            [2, 3, 1],
          ],
          0,
        ],
        expected: 3,
        hidden: true,
      },
      {
        args: [
          3,
          [
            [0, 1, 4],
            [0, 1, 1],
            [1, 2, 1],
          ],
          0,
        ],
        expected: 2,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const out = Array.from({ length: n }, () => []);
for (const [from, to, time] of links) out[from].push([to, time]);

const best = new Array(n).fill(Infinity);
best[source] = 0;

// A min-heap of [distance, node]; JavaScript has no priority queue.
const heap = [[0, source]];
function push(entry) {
  heap.push(entry);
  let at = heap.length - 1;
  while (at > 0) {
    const parent = (at - 1) >> 1;
    if (heap[parent][0] <= heap[at][0]) break;
    [heap[parent], heap[at]] = [heap[at], heap[parent]];
    at = parent;
  }
}
function pop() {
  const top = heap[0];
  const last = heap.pop();
  if (heap.length > 0) {
    heap[0] = last;
    let at = 0;
    for (;;) {
      const left = at * 2 + 1;
      const right = left + 1;
      let smallest = at;
      if (left < heap.length && heap[left][0] < heap[smallest][0]) smallest = left;
      if (right < heap.length && heap[right][0] < heap[smallest][0]) smallest = right;
      if (smallest === at) break;
      [heap[smallest], heap[at]] = [heap[at], heap[smallest]];
      at = smallest;
    }
  }
  return top;
}

while (heap.length > 0) {
  const [distance, node] = pop();
  if (distance > best[node]) continue;
  for (const [next, weight] of out[node]) {
    if (distance + weight < best[next]) {
      best[next] = distance + weight;
      push([best[next], next]);
    }
  }
}

let slowest = 0;
for (const distance of best) {
  if (distance === Infinity) return -1;
  if (distance > slowest) slowest = distance;
}
return slowest;`,
      TYPESCRIPT: `const out: number[][][] = Array.from({ length: n }, () => []);
for (const link of links) out[link[0]].push([link[1], link[2]]);

const best: number[] = new Array(n).fill(Infinity);
best[source] = 0;

// A min-heap of [distance, node]; TypeScript has no priority queue.
const heap: number[][] = [[0, source]];
function push(entry: number[]): void {
  heap.push(entry);
  let at = heap.length - 1;
  while (at > 0) {
    const parent = (at - 1) >> 1;
    if (heap[parent][0] <= heap[at][0]) break;
    [heap[parent], heap[at]] = [heap[at], heap[parent]];
    at = parent;
  }
}
function pop(): number[] {
  const top = heap[0];
  const last = heap.pop() as number[];
  if (heap.length > 0) {
    heap[0] = last;
    let at = 0;
    for (;;) {
      const left = at * 2 + 1;
      const right = left + 1;
      let smallest = at;
      if (left < heap.length && heap[left][0] < heap[smallest][0]) smallest = left;
      if (right < heap.length && heap[right][0] < heap[smallest][0]) smallest = right;
      if (smallest === at) break;
      [heap[smallest], heap[at]] = [heap[at], heap[smallest]];
      at = smallest;
    }
  }
  return top;
}

while (heap.length > 0) {
  const entry = pop();
  if (entry[0] > best[entry[1]]) continue;
  for (const step of out[entry[1]]) {
    if (entry[0] + step[1] < best[step[0]]) {
      best[step[0]] = entry[0] + step[1];
      push([best[step[0]], step[0]]);
    }
  }
}

let slowest = 0;
for (const distance of best) {
  if (distance === Infinity) return -1;
  if (distance > slowest) slowest = distance;
}
return slowest;`,
      PYTHON: `import heapq

out = [[] for _ in range(n)]
for start, finish, time in links:
    out[start].append((finish, time))

best = [float("inf")] * n
best[source] = 0
heap = [(0, source)]

while heap:
    distance, node = heapq.heappop(heap)
    if distance > best[node]:
        continue
    for following, weight in out[node]:
        if distance + weight < best[following]:
            best[following] = distance + weight
            heapq.heappush(heap, (best[following], following))

slowest = 0
for distance in best:
    if distance == float("inf"):
        return -1
    slowest = max(slowest, distance)
return slowest`,
      JAVA: `List<List<int[]>> out = new ArrayList<>();
for (int i = 0; i < n; i += 1) out.add(new ArrayList<>());
for (int[] link : links) out.get(link[0]).add(new int[] {link[1], link[2]});

long[] best = new long[n];
Arrays.fill(best, Long.MAX_VALUE);
best[source] = 0;

PriorityQueue<long[]> heap = new PriorityQueue<>((a, b) -> Long.compare(a[0], b[0]));
heap.add(new long[] {0, source});

while (!heap.isEmpty()) {
    long[] entry = heap.poll();
    int node = (int) entry[1];
    if (entry[0] > best[node]) continue;
    for (int[] step : out.get(node)) {
        long candidate = entry[0] + step[1];
        if (candidate < best[step[0]]) {
            best[step[0]] = candidate;
            heap.add(new long[] {candidate, step[0]});
        }
    }
}

long slowest = 0;
for (long distance : best) {
    if (distance == Long.MAX_VALUE) return -1;
    slowest = Math.max(slowest, distance);
}
return (int) slowest;`,
      CPP: `vector<vector<pair<int, int>>> out(n);
for (const vector<int>& link : links) out[link[0]].push_back({link[1], link[2]});

const long long INF = LLONG_MAX;
vector<long long> best(n, INF);
best[source] = 0;

priority_queue<pair<long long, int>, vector<pair<long long, int>>,
               greater<pair<long long, int>>> heap;
heap.push({0, source});

while (!heap.empty()) {
    pair<long long, int> entry = heap.top();
    heap.pop();
    if (entry.first > best[entry.second]) continue;
    for (auto& step : out[entry.second]) {
        long long candidate = entry.first + step.second;
        if (candidate < best[step.first]) {
            best[step.first] = candidate;
            heap.push({candidate, step.first});
        }
    }
}

long long slowest = 0;
for (long long distance : best) {
    if (distance == INF) return -1;
    slowest = max(slowest, distance);
}
return (int)slowest;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "cheapest-route-within-stops",
    title: "The Cheapest Route Within a Stop Limit",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Each entry [from, to, price] is a one-way leg and its price. Travel from " +
      "the start to the finish using at most the given number of intermediate " +
      "stops. Return the cheapest total price, or -1 if it cannot be done within " +
      "that limit.",
    explanation:
      "Dijkstra is wrong here, and understanding why is the point. Its greedy " +
      "step assumes that once a node is settled at its cheapest price nothing " +
      "can improve it — but with a stop limit, a dearer route reaching a node in " +
      "fewer stops may be the only one that can still finish, so 'settled' is no " +
      "longer meaningful. Bellman-Ford handles it naturally. Keep the best price " +
      "known for each node, and repeat this round exactly stops + 1 times: for " +
      "every leg, see whether taking it improves the destination. Each round " +
      "allows one more leg to be used, so after k rounds the table holds the " +
      "cheapest route using at most k legs. The essential detail is that each " +
      "round must read the *previous* round's table — updating in place lets a " +
      "single round use two legs and quietly breaks the limit, which is the bug " +
      "this problem is really testing for.",
    constraints: [
      "n is between 1 and 1,000, with between 0 and 20,000 one-way legs.",
      "Prices are between 0 and 10,000, and the stop limit is between 0 and n-1.",
      "A limit of 0 stops means the route must be a single direct leg.",
    ],
    hints: [
      "Dijkstra's settled-forever assumption is exactly what the stop limit breaks.",
      "Repeat a relaxation round once per allowed leg.",
      "Read from the previous round's table, or one round will use two legs.",
    ],
    estimatedTime: "40 min",
    signature: {
      name: "cheapestRouteWithinStops",
      params: [
        { name: "n", type: "int" },
        { name: "legs", type: "int[][]" },
        { name: "start", type: "int" },
        { name: "finish", type: "int" },
        { name: "stops", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-shortest-path", "dsa-dp-1d", "js-arrays"],
    examples: [
      {
        input:
          "n = 4, legs = [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], start = 0, finish = 3, stops = 1",
        output: "700",
        explanation: "0 → 1 → 3 costs 700; the cheaper 0 → 1 → 2 → 3 needs two stops.",
      },
      {
        input:
          "n = 3, legs = [[0, 1, 100], [1, 2, 100], [0, 2, 500]], start = 0, finish = 2, stops = 0",
        output: "500",
        explanation: "With no stops allowed, only the direct leg is available.",
      },
    ],
    tests: [
      {
        args: [
          4,
          [
            [0, 1, 100],
            [1, 2, 100],
            [2, 0, 100],
            [1, 3, 600],
            [2, 3, 200],
          ],
          0,
          3,
          1,
        ],
        expected: 700,
      },
      {
        args: [
          3,
          [
            [0, 1, 100],
            [1, 2, 100],
            [0, 2, 500],
          ],
          0,
          2,
          0,
        ],
        expected: 500,
      },
      {
        args: [
          3,
          [
            [0, 1, 100],
            [1, 2, 100],
            [0, 2, 500],
          ],
          0,
          2,
          1,
        ],
        expected: 200,
      },
      { args: [2, [], 0, 1, 5], expected: -1, hidden: true },
      { args: [1, [], 0, 0, 0], expected: 0, hidden: true },
      {
        args: [
          3,
          [
            [0, 1, 5],
            [1, 2, 5],
          ],
          0,
          2,
          0,
        ],
        expected: -1,
        hidden: true,
      },
      {
        args: [
          4,
          [
            [0, 1, 1],
            [1, 2, 1],
            [2, 3, 1],
          ],
          0,
          3,
          2,
        ],
        expected: 3,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `let best = new Array(n).fill(Infinity);
best[start] = 0;

for (let round = 0; round <= stops; round += 1) {
  const previous = [...best];
  for (const [from, to, price] of legs) {
    if (previous[from] === Infinity) continue;
    if (previous[from] + price < best[to]) best[to] = previous[from] + price;
  }
}
return best[finish] === Infinity ? -1 : best[finish];`,
      TYPESCRIPT: `const best: number[] = new Array(n).fill(Infinity);
best[start] = 0;

for (let round = 0; round <= stops; round += 1) {
  const previous = [...best];
  for (const leg of legs) {
    if (previous[leg[0]] === Infinity) continue;
    if (previous[leg[0]] + leg[2] < best[leg[1]]) {
      best[leg[1]] = previous[leg[0]] + leg[2];
    }
  }
}
return best[finish] === Infinity ? -1 : best[finish];`,
      PYTHON: `best = [float("inf")] * n
best[start] = 0

for _round in range(stops + 1):
    previous = list(best)
    for origin, destination, price in legs:
        if previous[origin] == float("inf"):
            continue
        if previous[origin] + price < best[destination]:
            best[destination] = previous[origin] + price
return -1 if best[finish] == float("inf") else best[finish]`,
      JAVA: `final int INF = Integer.MAX_VALUE / 2;
int[] best = new int[n];
Arrays.fill(best, INF);
best[start] = 0;

for (int round = 0; round <= stops; round += 1) {
    int[] previous = best.clone();
    for (int[] leg : legs) {
        if (previous[leg[0]] == INF) continue;
        if (previous[leg[0]] + leg[2] < best[leg[1]]) {
            best[leg[1]] = previous[leg[0]] + leg[2];
        }
    }
}
return best[finish] == INF ? -1 : best[finish];`,
      CPP: `const int INF = INT_MAX / 2;
vector<int> best(n, INF);
best[start] = 0;

for (int round = 0; round <= stops; round += 1) {
    vector<int> previous = best;
    for (const vector<int>& leg : legs) {
        if (previous[leg[0]] == INF) continue;
        if (previous[leg[0]] + leg[2] < best[leg[1]]) {
            best[leg[1]] = previous[leg[0]] + leg[2];
        }
    }
}
return best[finish] == INF ? -1 : best[finish];`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "the-least-strenuous-route",
    title: "The Least Strenuous Route",
    difficulty: "HARD",
    interviewFrequency: "HIGH",
    description:
      "Each square of the grid holds a height. Travel from the top-left corner " +
      "to the bottom-right, stepping between horizontal and vertical neighbours. " +
      "A route's strain is the largest height difference between any two " +
      "consecutive squares on it. Return the smallest strain any route can have.",
    explanation:
      "The cost of a route is a maximum rather than a sum, which sounds like it " +
      "rules out Dijkstra and does not. Dijkstra never actually requires " +
      "addition — it requires that extending a route cannot make it cheaper, and " +
      "a maximum satisfies that just as a sum does. So run it unchanged with one " +
      "line different: instead of best[here] + weight, the candidate cost of " +
      "reaching a neighbour is max(best[here], height difference). Everything " +
      "else — the min-heap, the skip for stale entries, the settled-forever " +
      "argument — carries across untouched. Recognising that the algorithm " +
      "depends on a property rather than on arithmetic is what lets you adapt it " +
      "under pressure. Binary searching the answer and asking 'is the finish " +
      "reachable using only steps below this strain' is the other good answer, " +
      "at O(rows × columns × log range).",
    constraints: [
      "The grid has between 1 and 100 rows and between 1 and 100 columns.",
      "Heights are between 0 and 1,000,000.",
      "A one-square grid needs no steps, so its strain is 0.",
    ],
    hints: [
      "The route's cost is a maximum, not a sum — Dijkstra does not care which.",
      "Change only the relaxation: max(cost so far, this step's difference).",
      "Binary searching the strain and testing reachability also works.",
    ],
    estimatedTime: "45 min",
    timeLimitMs: 5000,
    signature: {
      name: "theLeastStrenuousRoute",
      params: [{ name: "heights", type: "int[][]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-shortest-path", "dsa-heap", "dsa-binary-search"],
    examples: [
      {
        input: "heights = [[1, 2, 2], [3, 8, 2], [5, 3, 5]]",
        output: "2",
        explanation: "Going round the 8 keeps every step within 2.",
      },
      {
        input: "heights = [[1, 2, 3], [3, 8, 4], [5, 3, 5]]",
        output: "1",
      },
    ],
    tests: [
      {
        args: [
          [
            [1, 2, 2],
            [3, 8, 2],
            [5, 3, 5],
          ],
        ],
        expected: 2,
      },
      {
        args: [
          [
            [1, 2, 3],
            [3, 8, 4],
            [5, 3, 5],
          ],
        ],
        expected: 1,
      },
      { args: [[[7]]], expected: 0 },
      { args: [[[1, 10]]], expected: 9, hidden: true },
      {
        args: [
          [
            [1, 1],
            [1, 1],
          ],
        ],
        expected: 0,
        hidden: true,
      },
      {
        args: [
          [
            [1, 2, 1, 1, 1],
            [1, 2, 1, 2, 1],
            [1, 2, 1, 2, 1],
            [1, 2, 1, 2, 1],
            [1, 1, 1, 2, 1],
          ],
        ],
        expected: 0,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const rows = heights.length;
const columns = heights[0].length;
const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];

const best = heights.map((line) => line.map(() => Infinity));
best[0][0] = 0;

const heap = [[0, 0, 0]];
function push(entry) {
  heap.push(entry);
  let at = heap.length - 1;
  while (at > 0) {
    const parent = (at - 1) >> 1;
    if (heap[parent][0] <= heap[at][0]) break;
    [heap[parent], heap[at]] = [heap[at], heap[parent]];
    at = parent;
  }
}
function pop() {
  const top = heap[0];
  const last = heap.pop();
  if (heap.length > 0) {
    heap[0] = last;
    let at = 0;
    for (;;) {
      const left = at * 2 + 1;
      const right = left + 1;
      let smallest = at;
      if (left < heap.length && heap[left][0] < heap[smallest][0]) smallest = left;
      if (right < heap.length && heap[right][0] < heap[smallest][0]) smallest = right;
      if (smallest === at) break;
      [heap[smallest], heap[at]] = [heap[at], heap[smallest]];
      at = smallest;
    }
  }
  return top;
}

while (heap.length > 0) {
  const [strain, r, c] = pop();
  if (strain > best[r][c]) continue;
  if (r === rows - 1 && c === columns - 1) return strain;
  for (const [dr, dc] of steps) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
    const step = Math.abs(heights[nr][nc] - heights[r][c]);
    const candidate = Math.max(strain, step);
    if (candidate < best[nr][nc]) {
      best[nr][nc] = candidate;
      push([candidate, nr, nc]);
    }
  }
}
return 0;`,
      TYPESCRIPT: `const rows = heights.length;
const columns = heights[0].length;
const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];

const best: number[][] = heights.map((line) => line.map(() => Infinity));
best[0][0] = 0;

const heap: number[][] = [[0, 0, 0]];
function push(entry: number[]): void {
  heap.push(entry);
  let at = heap.length - 1;
  while (at > 0) {
    const parent = (at - 1) >> 1;
    if (heap[parent][0] <= heap[at][0]) break;
    [heap[parent], heap[at]] = [heap[at], heap[parent]];
    at = parent;
  }
}
function pop(): number[] {
  const top = heap[0];
  const last = heap.pop() as number[];
  if (heap.length > 0) {
    heap[0] = last;
    let at = 0;
    for (;;) {
      const left = at * 2 + 1;
      const right = left + 1;
      let smallest = at;
      if (left < heap.length && heap[left][0] < heap[smallest][0]) smallest = left;
      if (right < heap.length && heap[right][0] < heap[smallest][0]) smallest = right;
      if (smallest === at) break;
      [heap[smallest], heap[at]] = [heap[at], heap[smallest]];
      at = smallest;
    }
  }
  return top;
}

while (heap.length > 0) {
  const entry = pop();
  const strain = entry[0];
  const r = entry[1];
  const c = entry[2];
  if (strain > best[r][c]) continue;
  if (r === rows - 1 && c === columns - 1) return strain;
  for (const step of steps) {
    const nr = r + step[0];
    const nc = c + step[1];
    if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
    const climb = Math.abs(heights[nr][nc] - heights[r][c]);
    const candidate = Math.max(strain, climb);
    if (candidate < best[nr][nc]) {
      best[nr][nc] = candidate;
      push([candidate, nr, nc]);
    }
  }
}
return 0;`,
      PYTHON: `import heapq

rows = len(heights)
columns = len(heights[0])
best = [[float("inf")] * columns for _ in range(rows)]
best[0][0] = 0
heap = [(0, 0, 0)]

while heap:
    strain, r, c = heapq.heappop(heap)
    if strain > best[r][c]:
        continue
    if r == rows - 1 and c == columns - 1:
        return strain
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nr, nc = r + dr, c + dc
        if nr < 0 or nr >= rows or nc < 0 or nc >= columns:
            continue
        candidate = max(strain, abs(heights[nr][nc] - heights[r][c]))
        if candidate < best[nr][nc]:
            best[nr][nc] = candidate
            heapq.heappush(heap, (candidate, nr, nc))
return 0`,
      JAVA: `int rows = heights.length;
int columns = heights[0].length;
int[][] steps = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

int[][] best = new int[rows][columns];
for (int[] line : best) Arrays.fill(line, Integer.MAX_VALUE);
best[0][0] = 0;

PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
heap.add(new int[] {0, 0, 0});

while (!heap.isEmpty()) {
    int[] entry = heap.poll();
    int strain = entry[0];
    int r = entry[1];
    int c = entry[2];
    if (strain > best[r][c]) continue;
    if (r == rows - 1 && c == columns - 1) return strain;
    for (int[] step : steps) {
        int nr = r + step[0];
        int nc = c + step[1];
        if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
        int candidate = Math.max(strain, Math.abs(heights[nr][nc] - heights[r][c]));
        if (candidate < best[nr][nc]) {
            best[nr][nc] = candidate;
            heap.add(new int[] {candidate, nr, nc});
        }
    }
}
return 0;`,
      CPP: `int rows = (int)heights.size();
int columns = (int)heights[0].size();
int steps[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

vector<vector<int>> best(rows, vector<int>(columns, INT_MAX));
best[0][0] = 0;

priority_queue<vector<int>, vector<vector<int>>, greater<vector<int>>> heap;
heap.push(vector<int>{0, 0, 0});

while (!heap.empty()) {
    vector<int> entry = heap.top();
    heap.pop();
    int strain = entry[0];
    int r = entry[1];
    int c = entry[2];
    if (strain > best[r][c]) continue;
    if (r == rows - 1 && c == columns - 1) return strain;
    for (auto& step : steps) {
        int nr = r + step[0];
        int nc = c + step[1];
        if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
        int candidate = max(strain, abs(heights[nr][nc] - heights[r][c]));
        if (candidate < best[nr][nc]) {
            best[nr][nc] = candidate;
            heap.push(vector<int>{candidate, nr, nc});
        }
    }
}
return 0;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "shortest-route-clearing-walls",
    title: "The Shortest Route, Clearing Some Walls",
    difficulty: "HARD",
    interviewFrequency: "HIGH",
    description:
      "The grid holds 0 for clear and 1 for a wall. Travel from the top-left to " +
      "the bottom-right through horizontal and vertical neighbours, and you may " +
      "clear up to the given number of walls along the way. Return the fewest " +
      "steps needed, or -1 if it cannot be done.",
    explanation:
      "Every move still costs one step, so this remains breadth-first search — " +
      "what changes is the *node*. Arriving at a square with three clearances " +
      "left is a genuinely different situation from arriving with one, so a node " +
      "is a pair (square, clearances remaining) and the visited set has to be " +
      "keyed on both. Marking only the square is the mistake this problem is " +
      "built to catch: it makes a cheap early route with no clearances left block " +
      "a later route that still has some, and the search returns -1 on grids " +
      "that are perfectly passable. With the state widened, everything else is " +
      "the ordinary sweep, at O(rows × columns × clearances). Enlarging the state " +
      "until the greedy or level-order argument becomes true again is the " +
      "reusable idea here.",
    constraints: [
      "The grid has between 1 and 100 rows and between 1 and 100 columns.",
      "Every square is 0 or 1, and the clearance budget is between 0 and 100.",
      "Steps are counted as moves, so a one-square grid answers 0.",
    ],
    hints: [
      "Every move still costs one, so the algorithm is still breadth-first search.",
      "What changes is the node: a square together with how many clearances remain.",
      "Marking only the square makes a spent route block a route that still has budget.",
    ],
    estimatedTime: "50 min",
    timeLimitMs: 5000,
    signature: {
      name: "shortestRouteClearingWalls",
      params: [
        { name: "grid", type: "int[][]" },
        { name: "clearances", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-shortest-path", "dsa-graph-bfs", "js-arrays"],
    examples: [
      {
        input: "grid = [[0, 1], [1, 0]], clearances = 1",
        output: "2",
        explanation: "Clear one wall and walk round the corner in two steps.",
      },
      {
        input: "grid = [[0, 1], [1, 0]], clearances = 0",
        output: "-1",
        explanation: "Both routes are blocked and nothing may be cleared.",
      },
    ],
    tests: [
      {
        args: [
          [
            [0, 1],
            [1, 0],
          ],
          1,
        ],
        expected: 2,
      },
      {
        args: [
          [
            [0, 1],
            [1, 0],
          ],
          0,
        ],
        expected: -1,
      },
      { args: [[[0]], 0], expected: 0 },
      {
        args: [
          [
            [0, 0, 0],
            [1, 1, 0],
            [0, 0, 0],
          ],
          1,
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
          1,
        ],
        expected: -1,
        hidden: true,
      },
      {
        args: [
          [
            [0, 1, 1],
            [1, 1, 1],
            [1, 1, 0],
          ],
          3,
        ],
        expected: 4,
        hidden: true,
      },
      {
        // Three walls stand between the ends, so three clearances are the
        // fewest that get through at all.
        args: [[[0, 1, 1, 1, 0]], 3],
        expected: 4,
        hidden: true,
      },
      {
        args: [[[0, 1, 1, 1, 0]], 2],
        expected: -1,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const rows = grid.length;
const columns = grid[0].length;
const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];

const bestLeft = grid.map((line) => line.map(() => -1));
const startLeft = clearances - grid[0][0];
if (startLeft < 0) return -1;
bestLeft[0][0] = startLeft;

let frontier = [[0, 0, startLeft]];
let moves = 0;
while (frontier.length > 0) {
  const next = [];
  for (const [r, c, left] of frontier) {
    if (r === rows - 1 && c === columns - 1) return moves;
    for (const [dr, dc] of steps) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
      const remaining = left - grid[nr][nc];
      if (remaining < 0 || remaining <= bestLeft[nr][nc]) continue;
      bestLeft[nr][nc] = remaining;
      next.push([nr, nc, remaining]);
    }
  }
  frontier = next;
  moves += 1;
}
return -1;`,
      TYPESCRIPT: `const rows = grid.length;
const columns = grid[0].length;
const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];

const bestLeft: number[][] = grid.map((line) => line.map(() => -1));
const startLeft = clearances - grid[0][0];
if (startLeft < 0) return -1;
bestLeft[0][0] = startLeft;

let frontier: number[][] = [[0, 0, startLeft]];
let moves = 0;
while (frontier.length > 0) {
  const next: number[][] = [];
  for (const at of frontier) {
    if (at[0] === rows - 1 && at[1] === columns - 1) return moves;
    for (const step of steps) {
      const nr = at[0] + step[0];
      const nc = at[1] + step[1];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
      const remaining = at[2] - grid[nr][nc];
      if (remaining < 0 || remaining <= bestLeft[nr][nc]) continue;
      bestLeft[nr][nc] = remaining;
      next.push([nr, nc, remaining]);
    }
  }
  frontier = next;
  moves += 1;
}
return -1;`,
      PYTHON: `rows = len(grid)
columns = len(grid[0])
best_left = [[-1] * columns for _ in range(rows)]

start_left = clearances - grid[0][0]
if start_left < 0:
    return -1
best_left[0][0] = start_left

frontier = [(0, 0, start_left)]
moves = 0
while frontier:
    following = []
    for r, c, left in frontier:
        if r == rows - 1 and c == columns - 1:
            return moves
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if nr < 0 or nr >= rows or nc < 0 or nc >= columns:
                continue
            remaining = left - grid[nr][nc]
            if remaining < 0 or remaining <= best_left[nr][nc]:
                continue
            best_left[nr][nc] = remaining
            following.append((nr, nc, remaining))
    frontier = following
    moves += 1
return -1`,
      JAVA: `int rows = grid.length;
int columns = grid[0].length;
int[][] steps = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

int[][] bestLeft = new int[rows][columns];
for (int[] line : bestLeft) Arrays.fill(line, -1);

int startLeft = clearances - grid[0][0];
if (startLeft < 0) return -1;
bestLeft[0][0] = startLeft;

List<int[]> frontier = new ArrayList<>();
frontier.add(new int[] {0, 0, startLeft});
int moves = 0;
while (!frontier.isEmpty()) {
    List<int[]> next = new ArrayList<>();
    for (int[] at : frontier) {
        if (at[0] == rows - 1 && at[1] == columns - 1) return moves;
        for (int[] step : steps) {
            int nr = at[0] + step[0];
            int nc = at[1] + step[1];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
            int remaining = at[2] - grid[nr][nc];
            if (remaining < 0 || remaining <= bestLeft[nr][nc]) continue;
            bestLeft[nr][nc] = remaining;
            next.add(new int[] {nr, nc, remaining});
        }
    }
    frontier = next;
    moves += 1;
}
return -1;`,
      CPP: `int rows = (int)grid.size();
int columns = (int)grid[0].size();
int steps[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

vector<vector<int>> bestLeft(rows, vector<int>(columns, -1));
int startLeft = clearances - grid[0][0];
if (startLeft < 0) return -1;
bestLeft[0][0] = startLeft;

vector<vector<int>> frontier{{0, 0, startLeft}};
int moves = 0;
while (!frontier.empty()) {
    vector<vector<int>> following;
    for (auto& at : frontier) {
        if (at[0] == rows - 1 && at[1] == columns - 1) return moves;
        for (auto& step : steps) {
            int nr = at[0] + step[0];
            int nc = at[1] + step[1];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
            int remaining = at[2] - grid[nr][nc];
            if (remaining < 0 || remaining <= bestLeft[nr][nc]) continue;
            bestLeft[nr][nc] = remaining;
            following.push_back(vector<int>{nr, nc, remaining});
        }
    }
    frontier = following;
    moves += 1;
}
return -1;`,
    },
  },
];
