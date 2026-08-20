import type { SeedProblem } from "../../problems/types";

/**
 * Topological sort.
 *
 * Ordering work that depends on other work. Every problem here is the same
 * machinery — count how many prerequisites each task still has, start with the
 * ones that have none, and release a task when its last prerequisite is
 * finished — and the variations are only in what gets recorded along the way:
 * a count, an order, the number of rounds, the longest chain.
 *
 * The cycle check comes free and is the reason this beats a hand-rolled
 * recursion. If the process stops having released fewer than every task, the
 * ones left are exactly those in or behind a cycle. Nothing extra is needed to
 * detect that, which is why "can this be ordered at all" and "give me the
 * order" are the same algorithm with a different return statement.
 *
 * Edges are written [a, b] meaning a must come before b, and every problem
 * repeats that in its statement — the direction is the thing candidates most
 * often get backwards.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const TOPOLOGICAL_SORT_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "can-every-task-be-done",
    title: "Can Every Task Be Done?",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "There are n tasks numbered 0 to n-1. Each pair [a, b] means task a must " +
      "be finished before task b starts. Report whether an order exists that " +
      "does all of them.",
    explanation:
      "An order exists exactly when the dependencies contain no cycle, so the " +
      "question is cycle detection in a directed graph. Count each task's " +
      "unfinished prerequisites, queue every task whose count is zero, and " +
      "repeatedly take one, mark it done, and decrement the counts of everything " +
      "that depended on it — releasing anything whose count reaches zero. Keep a " +
      "tally of how many tasks were released. If that tally reaches n the order " +
      "exists; if the queue empties first, every remaining task is waiting on " +
      "something that will never finish, which is precisely a cycle. Nothing in " +
      "this needs a separate cycle check, and that is the point: the count " +
      "reaching n *is* the check.",
    constraints: [
      "n is between 1 and 100,000.",
      "Between 0 and 200,000 dependency pairs, each [before, after].",
      "Duplicate pairs may appear.",
    ],
    hints: [
      "An order exists if and only if there is no cycle.",
      "Count each task's outstanding prerequisites and start with the zeros.",
      "If fewer than n tasks are ever released, the rest are stuck in a cycle.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "canEveryTaskBeDone",
      params: [
        { name: "n", type: "int" },
        { name: "dependencies", type: "int[][]" },
      ],
      returns: "bool",
    },
    topicSlugs: ["dsa-topological-sort", "dsa-graph-bfs", "js-arrays"],
    examples: [
      {
        input: "n = 2, dependencies = [[0, 1]]",
        output: "true",
        explanation: "Do 0, then 1.",
      },
      {
        input: "n = 2, dependencies = [[0, 1], [1, 0]]",
        output: "false",
        explanation: "Each waits for the other.",
      },
    ],
    tests: [
      { args: [2, [[0, 1]]], expected: true },
      {
        args: [
          2,
          [
            [0, 1],
            [1, 0],
          ],
        ],
        expected: false,
      },
      { args: [1, []], expected: true },
      {
        args: [
          4,
          [
            [0, 1],
            [1, 2],
            [2, 3],
          ],
        ],
        expected: true,
        hidden: true,
      },
      {
        args: [
          3,
          [
            [0, 1],
            [1, 2],
            [2, 0],
          ],
        ],
        expected: false,
        hidden: true,
      },
      {
        args: [
          5,
          [
            [0, 1],
            [0, 2],
            [3, 4],
          ],
        ],
        expected: true,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const after = Array.from({ length: n }, () => []);
const waiting = new Array(n).fill(0);
for (const [before, next] of dependencies) {
  after[before].push(next);
  waiting[next] += 1;
}

const queue = [];
for (let task = 0; task < n; task += 1) if (waiting[task] === 0) queue.push(task);

let head = 0;
let done = 0;
while (head < queue.length) {
  const task = queue[head];
  head += 1;
  done += 1;
  for (const next of after[task]) {
    waiting[next] -= 1;
    if (waiting[next] === 0) queue.push(next);
  }
}
return done === n;`,
      TYPESCRIPT: `const after: number[][] = Array.from({ length: n }, () => []);
const waiting: number[] = new Array(n).fill(0);
for (const pair of dependencies) {
  after[pair[0]].push(pair[1]);
  waiting[pair[1]] += 1;
}

const queue: number[] = [];
for (let task = 0; task < n; task += 1) if (waiting[task] === 0) queue.push(task);

let head = 0;
let done = 0;
while (head < queue.length) {
  const task = queue[head];
  head += 1;
  done += 1;
  for (const next of after[task]) {
    waiting[next] -= 1;
    if (waiting[next] === 0) queue.push(next);
  }
}
return done === n;`,
      PYTHON: `after = [[] for _ in range(n)]
waiting = [0] * n
for before, following in dependencies:
    after[before].append(following)
    waiting[following] += 1

queue = [task for task in range(n) if waiting[task] == 0]
head = 0
done = 0
while head < len(queue):
    task = queue[head]
    head += 1
    done += 1
    for following in after[task]:
        waiting[following] -= 1
        if waiting[following] == 0:
            queue.append(following)
return done == n`,
      JAVA: `List<List<Integer>> after = new ArrayList<>();
for (int i = 0; i < n; i += 1) after.add(new ArrayList<>());
int[] waiting = new int[n];
for (int[] pair : dependencies) {
    after.get(pair[0]).add(pair[1]);
    waiting[pair[1]] += 1;
}

List<Integer> queue = new ArrayList<>();
for (int task = 0; task < n; task += 1) if (waiting[task] == 0) queue.add(task);

int head = 0;
int done = 0;
while (head < queue.size()) {
    int task = queue.get(head);
    head += 1;
    done += 1;
    for (int next : after.get(task)) {
        waiting[next] -= 1;
        if (waiting[next] == 0) queue.add(next);
    }
}
return done == n;`,
      CPP: `vector<vector<int>> after(n);
vector<int> waiting(n, 0);
for (const vector<int>& pair : dependencies) {
    after[pair[0]].push_back(pair[1]);
    waiting[pair[1]] += 1;
}

vector<int> queue;
for (int task = 0; task < n; task += 1) if (waiting[task] == 0) queue.push_back(task);

size_t head = 0;
int done = 0;
while (head < queue.size()) {
    int task = queue[head];
    head += 1;
    done += 1;
    for (int following : after[task]) {
        waiting[following] -= 1;
        if (waiting[following] == 0) queue.push_back(following);
    }
}
return done == n;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "an-order-for-the-tasks",
    title: "An Order for the Tasks",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "There are n tasks numbered 0 to n-1, and each pair [a, b] means a must " +
      "come before b. Return a valid order. When several tasks are ready at the " +
      "same time, take the smallest-numbered one, so the answer is unique. " +
      "Return an empty list if no order exists.",
    explanation:
      "Identical to the previous problem, except the tasks are recorded as they " +
      "are released rather than merely counted. The one addition is the " +
      "tie-break. Usually a topological order is not unique and any of them is " +
      "acceptable; here the smallest ready task is always taken, which makes the " +
      "answer well defined and turns the plain queue into a min-heap. That is a " +
      "genuine change in cost — O(n log n + e) rather than O(n + e) — and it is " +
      "worth knowing that the tie-break, not the ordering, is what pays for it. " +
      "If the recorded order ends up shorter than n there was a cycle, and the " +
      "partial order is meaningless, so an empty list is returned instead.",
    constraints: [
      "n is between 1 and 100,000.",
      "Between 0 and 200,000 dependency pairs, each [before, after].",
      "Among the tasks ready at any moment, the smallest number is taken first.",
    ],
    hints: [
      "Record the tasks as they are released, rather than only counting them.",
      "The stated tie-break turns the queue into a min-heap.",
      "A short result means a cycle — return nothing rather than a partial order.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "anOrderForTheTasks",
      params: [
        { name: "n", type: "int" },
        { name: "dependencies", type: "int[][]" },
      ],
      returns: "int[]",
    },
    topicSlugs: ["dsa-topological-sort", "dsa-heap", "js-arrays"],
    examples: [
      {
        input: "n = 4, dependencies = [[1, 0], [2, 0], [0, 3]]",
        output: "[1, 2, 0, 3]",
        explanation: "1 and 2 are both ready first, and 1 is smaller.",
      },
      {
        input: "n = 2, dependencies = [[0, 1], [1, 0]]",
        output: "[]",
      },
    ],
    tests: [
      {
        args: [
          4,
          [
            [1, 0],
            [2, 0],
            [0, 3],
          ],
        ],
        expected: [1, 2, 0, 3],
      },
      {
        args: [
          2,
          [
            [0, 1],
            [1, 0],
          ],
        ],
        expected: [],
      },
      { args: [3, []], expected: [0, 1, 2] },
      { args: [1, []], expected: [0], hidden: true },
      {
        args: [
          4,
          [
            [3, 0],
            [3, 1],
            [1, 2],
          ],
        ],
        expected: [3, 0, 1, 2],
        hidden: true,
      },
      {
        args: [
          3,
          [
            [0, 1],
            [1, 2],
            [2, 0],
          ],
        ],
        expected: [],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const after = Array.from({ length: n }, () => []);
const waiting = new Array(n).fill(0);
for (const [before, next] of dependencies) {
  after[before].push(next);
  waiting[next] += 1;
}

const ready = [];
for (let task = 0; task < n; task += 1) if (waiting[task] === 0) ready.push(task);
ready.sort((a, b) => a - b);

const order = [];
while (ready.length > 0) {
  const task = ready.shift();
  order.push(task);
  for (const next of after[task]) {
    waiting[next] -= 1;
    if (waiting[next] === 0) {
      let at = ready.length;
      ready.push(next);
      while (at > 0 && ready[at - 1] > next) {
        ready[at] = ready[at - 1];
        at -= 1;
      }
      ready[at] = next;
    }
  }
}
return order.length === n ? order : [];`,
      TYPESCRIPT: `const after: number[][] = Array.from({ length: n }, () => []);
const waiting: number[] = new Array(n).fill(0);
for (const pair of dependencies) {
  after[pair[0]].push(pair[1]);
  waiting[pair[1]] += 1;
}

const ready: number[] = [];
for (let task = 0; task < n; task += 1) if (waiting[task] === 0) ready.push(task);
ready.sort((a, b) => a - b);

const order: number[] = [];
while (ready.length > 0) {
  const task = ready.shift() as number;
  order.push(task);
  for (const next of after[task]) {
    waiting[next] -= 1;
    if (waiting[next] === 0) {
      let at = ready.length;
      ready.push(next);
      while (at > 0 && ready[at - 1] > next) {
        ready[at] = ready[at - 1];
        at -= 1;
      }
      ready[at] = next;
    }
  }
}
return order.length === n ? order : [];`,
      PYTHON: `import heapq

after = [[] for _ in range(n)]
waiting = [0] * n
for before, following in dependencies:
    after[before].append(following)
    waiting[following] += 1

ready = [task for task in range(n) if waiting[task] == 0]
heapq.heapify(ready)

order = []
while ready:
    task = heapq.heappop(ready)
    order.append(task)
    for following in after[task]:
        waiting[following] -= 1
        if waiting[following] == 0:
            heapq.heappush(ready, following)
return order if len(order) == n else []`,
      JAVA: `List<List<Integer>> after = new ArrayList<>();
for (int i = 0; i < n; i += 1) after.add(new ArrayList<>());
int[] waiting = new int[n];
for (int[] pair : dependencies) {
    after.get(pair[0]).add(pair[1]);
    waiting[pair[1]] += 1;
}

PriorityQueue<Integer> ready = new PriorityQueue<>();
for (int task = 0; task < n; task += 1) if (waiting[task] == 0) ready.add(task);

List<Integer> order = new ArrayList<>();
while (!ready.isEmpty()) {
    int task = ready.poll();
    order.add(task);
    for (int next : after.get(task)) {
        waiting[next] -= 1;
        if (waiting[next] == 0) ready.add(next);
    }
}
if (order.size() != n) return new int[0];
int[] answer = new int[n];
for (int i = 0; i < n; i += 1) answer[i] = order.get(i);
return answer;`,
      CPP: `vector<vector<int>> after(n);
vector<int> waiting(n, 0);
for (const vector<int>& pair : dependencies) {
    after[pair[0]].push_back(pair[1]);
    waiting[pair[1]] += 1;
}

priority_queue<int, vector<int>, greater<int>> ready;
for (int task = 0; task < n; task += 1) if (waiting[task] == 0) ready.push(task);

vector<int> order;
while (!ready.empty()) {
    int task = ready.top();
    ready.pop();
    order.push_back(task);
    for (int following : after[task]) {
        waiting[following] -= 1;
        if (waiting[following] == 0) ready.push(following);
    }
}
if ((int)order.size() != n) return vector<int>{};
return order;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "rounds-to-finish-everything",
    title: "Rounds to Finish Everything",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "There are n tasks and each pair [a, b] means a must finish before b " +
      "starts. Any number of tasks may run in parallel in a single round, as long " +
      "as their prerequisites are already done. Return the fewest rounds needed, " +
      "or -1 if the tasks cannot all be done.",
    explanation:
      "Unlimited parallelism means every task that is ready should run " +
      "immediately, so the answer is the number of *levels* in the dependency " +
      "graph rather than any property of an individual order. That makes this " +
      "the level-batch pattern again: everything with no outstanding " +
      "prerequisites forms round one, releasing whatever they unblock into round " +
      "two, and so on. Reading the ready-set's size before each round and " +
      "processing exactly that many tasks keeps the boundaries — exactly as the " +
      "tree traversal file did for levels. The count of rounds is the length of " +
      "the longest dependency chain, which is worth stating because it explains " +
      "why adding machines cannot help beyond it. A cycle shows up the same way " +
      "as before: fewer tasks released than exist.",
    constraints: [
      "n is between 1 and 100,000.",
      "Between 0 and 200,000 dependency pairs, each [before, after].",
      "Any number of ready tasks may run in the same round.",
    ],
    hints: [
      "With unlimited parallelism, every ready task should start at once.",
      "So the answer counts levels, which is the longest dependency chain.",
      "Process the ready set in batches, one batch per round.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "roundsToFinishEverything",
      params: [
        { name: "n", type: "int" },
        { name: "dependencies", type: "int[][]" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-topological-sort", "dsa-graph-bfs", "js-arrays"],
    examples: [
      {
        input: "n = 3, dependencies = [[0, 2], [1, 2]]",
        output: "2",
        explanation: "Tasks 0 and 1 run together, then task 2.",
      },
      {
        input: "n = 2, dependencies = [[0, 1], [1, 0]]",
        output: "-1",
      },
    ],
    tests: [
      {
        args: [
          3,
          [
            [0, 2],
            [1, 2],
          ],
        ],
        expected: 2,
      },
      {
        args: [
          2,
          [
            [0, 1],
            [1, 0],
          ],
        ],
        expected: -1,
      },
      { args: [3, []], expected: 1 },
      { args: [1, []], expected: 1, hidden: true },
      {
        args: [
          4,
          [
            [0, 1],
            [1, 2],
            [2, 3],
          ],
        ],
        expected: 4,
        hidden: true,
      },
      {
        args: [
          5,
          [
            [0, 1],
            [0, 2],
            [1, 3],
            [2, 3],
            [3, 4],
          ],
        ],
        expected: 4,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const after = Array.from({ length: n }, () => []);
const waiting = new Array(n).fill(0);
for (const [before, next] of dependencies) {
  after[before].push(next);
  waiting[next] += 1;
}

let current = [];
for (let task = 0; task < n; task += 1) if (waiting[task] === 0) current.push(task);

let rounds = 0;
let done = 0;
while (current.length > 0) {
  rounds += 1;
  const next = [];
  for (const task of current) {
    done += 1;
    for (const following of after[task]) {
      waiting[following] -= 1;
      if (waiting[following] === 0) next.push(following);
    }
  }
  current = next;
}
return done === n ? rounds : -1;`,
      TYPESCRIPT: `const after: number[][] = Array.from({ length: n }, () => []);
const waiting: number[] = new Array(n).fill(0);
for (const pair of dependencies) {
  after[pair[0]].push(pair[1]);
  waiting[pair[1]] += 1;
}

let current: number[] = [];
for (let task = 0; task < n; task += 1) if (waiting[task] === 0) current.push(task);

let rounds = 0;
let done = 0;
while (current.length > 0) {
  rounds += 1;
  const next: number[] = [];
  for (const task of current) {
    done += 1;
    for (const following of after[task]) {
      waiting[following] -= 1;
      if (waiting[following] === 0) next.push(following);
    }
  }
  current = next;
}
return done === n ? rounds : -1;`,
      PYTHON: `after = [[] for _ in range(n)]
waiting = [0] * n
for before, following in dependencies:
    after[before].append(following)
    waiting[following] += 1

current = [task for task in range(n) if waiting[task] == 0]
rounds = 0
done = 0
while current:
    rounds += 1
    nxt = []
    for task in current:
        done += 1
        for following in after[task]:
            waiting[following] -= 1
            if waiting[following] == 0:
                nxt.append(following)
    current = nxt
return rounds if done == n else -1`,
      JAVA: `List<List<Integer>> after = new ArrayList<>();
for (int i = 0; i < n; i += 1) after.add(new ArrayList<>());
int[] waiting = new int[n];
for (int[] pair : dependencies) {
    after.get(pair[0]).add(pair[1]);
    waiting[pair[1]] += 1;
}

List<Integer> current = new ArrayList<>();
for (int task = 0; task < n; task += 1) if (waiting[task] == 0) current.add(task);

int rounds = 0;
int done = 0;
while (!current.isEmpty()) {
    rounds += 1;
    List<Integer> next = new ArrayList<>();
    for (int task : current) {
        done += 1;
        for (int following : after.get(task)) {
            waiting[following] -= 1;
            if (waiting[following] == 0) next.add(following);
        }
    }
    current = next;
}
return done == n ? rounds : -1;`,
      CPP: `vector<vector<int>> after(n);
vector<int> waiting(n, 0);
for (const vector<int>& pair : dependencies) {
    after[pair[0]].push_back(pair[1]);
    waiting[pair[1]] += 1;
}

vector<int> current;
for (int task = 0; task < n; task += 1) if (waiting[task] == 0) current.push_back(task);

int rounds = 0;
int done = 0;
while (!current.empty()) {
    rounds += 1;
    vector<int> following;
    for (int task : current) {
        done += 1;
        for (int nextTask : after[task]) {
            waiting[nextTask] -= 1;
            if (waiting[nextTask] == 0) following.push_back(nextTask);
        }
    }
    current = following;
}
return done == n ? rounds : -1;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "longest-chain-of-tasks",
    title: "The Longest Chain of Tasks",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Each pair [a, b] means a must come before b. Return the number of tasks " +
      "on the longest chain of dependencies, or -1 if the dependencies contain a " +
      "cycle. A single task with no dependencies is a chain of 1.",
    explanation:
      "The longest path in a general graph is intractable, but in a graph with " +
      "no cycles it is easy, and the reason is the topological order: once tasks " +
      "are processed in an order where every prerequisite comes first, the " +
      "longest chain ending at a task is one more than the best of its " +
      "prerequisites' answers, and those are all already known. So carry a length " +
      "per task through the same release loop, updating each successor as it is " +
      "unblocked. The answer is the largest length recorded. This is the first " +
      "genuine dynamic programming here, and the topological order is what " +
      "supplies the guarantee dynamic programming needs — that a subproblem is " +
      "solved before anything that depends on it.",
    constraints: [
      "n is between 1 and 100,000.",
      "Between 0 and 200,000 dependency pairs, each [before, after].",
      "A chain is counted in tasks, so a lone task scores 1.",
    ],
    hints: [
      "Longest paths are hard in general and easy once there are no cycles.",
      "Process in topological order and every prerequisite's answer is already final.",
      "Carry a length per task and update each successor as it is released.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "longestChainOfTasks",
      params: [
        { name: "n", type: "int" },
        { name: "dependencies", type: "int[][]" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-topological-sort", "dsa-dp-1d", "js-arrays"],
    examples: [
      {
        input: "n = 4, dependencies = [[0, 1], [1, 2], [0, 3]]",
        output: "3",
        explanation: "0 → 1 → 2 is three tasks long.",
      },
      {
        input: "n = 3, dependencies = []",
        output: "1",
        explanation: "Nothing depends on anything, so every chain is one task.",
      },
    ],
    tests: [
      {
        args: [
          4,
          [
            [0, 1],
            [1, 2],
            [0, 3],
          ],
        ],
        expected: 3,
      },
      { args: [3, []], expected: 1 },
      {
        args: [
          2,
          [
            [0, 1],
            [1, 0],
          ],
        ],
        expected: -1,
      },
      { args: [1, []], expected: 1, hidden: true },
      {
        args: [
          5,
          [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4],
          ],
        ],
        expected: 5,
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
        expected: 2,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const after = Array.from({ length: n }, () => []);
const waiting = new Array(n).fill(0);
for (const [before, next] of dependencies) {
  after[before].push(next);
  waiting[next] += 1;
}

const chain = new Array(n).fill(1);
const queue = [];
for (let task = 0; task < n; task += 1) if (waiting[task] === 0) queue.push(task);

let head = 0;
let done = 0;
let longest = 0;
while (head < queue.length) {
  const task = queue[head];
  head += 1;
  done += 1;
  if (chain[task] > longest) longest = chain[task];
  for (const next of after[task]) {
    if (chain[task] + 1 > chain[next]) chain[next] = chain[task] + 1;
    waiting[next] -= 1;
    if (waiting[next] === 0) queue.push(next);
  }
}
return done === n ? longest : -1;`,
      TYPESCRIPT: `const after: number[][] = Array.from({ length: n }, () => []);
const waiting: number[] = new Array(n).fill(0);
for (const pair of dependencies) {
  after[pair[0]].push(pair[1]);
  waiting[pair[1]] += 1;
}

const chain: number[] = new Array(n).fill(1);
const queue: number[] = [];
for (let task = 0; task < n; task += 1) if (waiting[task] === 0) queue.push(task);

let head = 0;
let done = 0;
let longest = 0;
while (head < queue.length) {
  const task = queue[head];
  head += 1;
  done += 1;
  if (chain[task] > longest) longest = chain[task];
  for (const next of after[task]) {
    if (chain[task] + 1 > chain[next]) chain[next] = chain[task] + 1;
    waiting[next] -= 1;
    if (waiting[next] === 0) queue.push(next);
  }
}
return done === n ? longest : -1;`,
      PYTHON: `after = [[] for _ in range(n)]
waiting = [0] * n
for before, following in dependencies:
    after[before].append(following)
    waiting[following] += 1

chain = [1] * n
queue = [task for task in range(n) if waiting[task] == 0]
head = 0
done = 0
longest = 0
while head < len(queue):
    task = queue[head]
    head += 1
    done += 1
    longest = max(longest, chain[task])
    for following in after[task]:
        chain[following] = max(chain[following], chain[task] + 1)
        waiting[following] -= 1
        if waiting[following] == 0:
            queue.append(following)
return longest if done == n else -1`,
      JAVA: `List<List<Integer>> after = new ArrayList<>();
for (int i = 0; i < n; i += 1) after.add(new ArrayList<>());
int[] waiting = new int[n];
for (int[] pair : dependencies) {
    after.get(pair[0]).add(pair[1]);
    waiting[pair[1]] += 1;
}

int[] chain = new int[n];
Arrays.fill(chain, 1);
List<Integer> queue = new ArrayList<>();
for (int task = 0; task < n; task += 1) if (waiting[task] == 0) queue.add(task);

int head = 0;
int done = 0;
int longest = 0;
while (head < queue.size()) {
    int task = queue.get(head);
    head += 1;
    done += 1;
    longest = Math.max(longest, chain[task]);
    for (int next : after.get(task)) {
        chain[next] = Math.max(chain[next], chain[task] + 1);
        waiting[next] -= 1;
        if (waiting[next] == 0) queue.add(next);
    }
}
return done == n ? longest : -1;`,
      CPP: `vector<vector<int>> after(n);
vector<int> waiting(n, 0);
for (const vector<int>& pair : dependencies) {
    after[pair[0]].push_back(pair[1]);
    waiting[pair[1]] += 1;
}

vector<int> chain(n, 1);
vector<int> queue;
for (int task = 0; task < n; task += 1) if (waiting[task] == 0) queue.push_back(task);

size_t head = 0;
int done = 0;
int longest = 0;
while (head < queue.size()) {
    int task = queue[head];
    head += 1;
    done += 1;
    longest = max(longest, chain[task]);
    for (int following : after[task]) {
        chain[following] = max(chain[following], chain[task] + 1);
        waiting[following] -= 1;
        if (waiting[following] == 0) queue.push_back(following);
    }
}
return done == n ? longest : -1;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "deduce-the-alphabet",
    title: "Deduce the Alphabet",
    difficulty: "HARD",
    interviewFrequency: "HIGH",
    description:
      "A dictionary from an unknown language lists its words in that language's " +
      "alphabetical order. Work out an order of its letters consistent with the " +
      "list, taking the smallest available letter whenever several are possible " +
      "so the answer is unique. Return the letters as text, or empty text if the " +
      "list is inconsistent.",
    explanation:
      "Two consecutive words tell you exactly one thing: at their first differing " +
      "position, the earlier word's letter comes before the later word's. That " +
      "single edge per adjacent pair is all the information there is — comparing " +
      "beyond the first difference would be inventing constraints. Collect those " +
      "edges over every adjacent pair and topologically sort the letters that " +
      "actually appear, taking the smallest ready letter to make the answer " +
      "unique. Two failure modes must both be caught. A cycle among the letters " +
      "is inconsistent, detected as usual by releasing fewer letters than exist. " +
      "And a word followed by a strict prefix of itself — \"abc\" then \"ab\" — is " +
      "impossible in any alphabet, produces no edge at all, and so must be " +
      "checked explicitly. That second case is what separates a working solution " +
      "from a nearly-working one.",
    constraints: [
      "Between 1 and 1,000 words, each between 1 and 20 lowercase letters.",
      "Only letters appearing in the words are included in the answer.",
      "Among letters available at the same moment, the smallest is taken first.",
    ],
    hints: [
      "Each adjacent pair of words yields exactly one ordering fact, at the first difference.",
      "Do not read past that first difference — anything further is not implied.",
      "A word followed by a strict prefix of itself is impossible and yields no edge.",
    ],
    estimatedTime: "50 min",
    signature: {
      name: "deduceTheAlphabet",
      params: [{ name: "words", type: "string[]" }],
      returns: "string",
    },
    topicSlugs: ["dsa-topological-sort", "dsa-strings", "dsa-hashing"],
    examples: [
      {
        input: 'words = ["wrt", "wrf", "er", "ett", "rftt"]',
        output: '"wertf"',
        explanation: "wrt before wrf gives t before f; wrf before er gives w before e.",
      },
      {
        input: 'words = ["abc", "ab"]',
        output: '""',
        explanation: "A word can never come before its own prefix.",
      },
    ],
    tests: [
      {
        args: [["wrt", "wrf", "er", "ett", "rftt"]],
        expected: "wertf",
      },
      { args: [["abc", "ab"]], expected: "" },
      { args: [["z", "x"]], expected: "zx" },
      { args: [["abc"]], expected: "abc", hidden: true },
      { args: [["z", "x", "z"]], expected: "", hidden: true },
      { args: [["ab", "abc"]], expected: "abc", hidden: true },
      { args: [["ba", "bc", "ac"]], expected: "bac", hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const present = new Set();
for (const word of words) for (const letter of word) present.add(letter);

const after = new Map();
const waiting = new Map();
for (const letter of present) {
  after.set(letter, []);
  waiting.set(letter, 0);
}

for (let i = 0; i + 1 < words.length; i += 1) {
  const first = words[i];
  const second = words[i + 1];
  const shared = Math.min(first.length, second.length);
  let at = 0;
  while (at < shared && first[at] === second[at]) at += 1;
  if (at === shared) {
    if (first.length > second.length) return "";
    continue;
  }
  after.get(first[at]).push(second[at]);
  waiting.set(second[at], waiting.get(second[at]) + 1);
}

const ready = [...present].filter((letter) => waiting.get(letter) === 0).sort();
let order = "";
while (ready.length > 0) {
  const letter = ready.shift();
  order += letter;
  for (const next of after.get(letter)) {
    waiting.set(next, waiting.get(next) - 1);
    if (waiting.get(next) === 0) {
      ready.push(next);
      ready.sort();
    }
  }
}
return order.length === present.size ? order : "";`,
      TYPESCRIPT: `const present = new Set<string>();
for (const word of words) for (const letter of word) present.add(letter);

const after = new Map<string, string[]>();
const waiting = new Map<string, number>();
for (const letter of present) {
  after.set(letter, []);
  waiting.set(letter, 0);
}

for (let i = 0; i + 1 < words.length; i += 1) {
  const first = words[i];
  const second = words[i + 1];
  const shared = Math.min(first.length, second.length);
  let at = 0;
  while (at < shared && first[at] === second[at]) at += 1;
  if (at === shared) {
    if (first.length > second.length) return "";
    continue;
  }
  (after.get(first[at]) as string[]).push(second[at]);
  waiting.set(second[at], (waiting.get(second[at]) as number) + 1);
}

const ready = [...present].filter((letter) => waiting.get(letter) === 0).sort();
let order = "";
while (ready.length > 0) {
  const letter = ready.shift() as string;
  order += letter;
  for (const next of after.get(letter) as string[]) {
    waiting.set(next, (waiting.get(next) as number) - 1);
    if (waiting.get(next) === 0) {
      ready.push(next);
      ready.sort();
    }
  }
}
return order.length === present.size ? order : "";`,
      PYTHON: `import heapq

present = set()
for word in words:
    for letter in word:
        present.add(letter)

after = {letter: [] for letter in present}
waiting = {letter: 0 for letter in present}

for i in range(len(words) - 1):
    first, second = words[i], words[i + 1]
    shared = min(len(first), len(second))
    at = 0
    while at < shared and first[at] == second[at]:
        at += 1
    if at == shared:
        if len(first) > len(second):
            return ""
        continue
    after[first[at]].append(second[at])
    waiting[second[at]] += 1

ready = [letter for letter in present if waiting[letter] == 0]
heapq.heapify(ready)
order = []
while ready:
    letter = heapq.heappop(ready)
    order.append(letter)
    for following in after[letter]:
        waiting[following] -= 1
        if waiting[following] == 0:
            heapq.heappush(ready, following)
return "".join(order) if len(order) == len(present) else ""`,
      JAVA: `Set<Character> present = new HashSet<>();
for (String word : words) {
    for (int i = 0; i < word.length(); i += 1) present.add(word.charAt(i));
}

Map<Character, List<Character>> after = new HashMap<>();
Map<Character, Integer> waiting = new HashMap<>();
for (char letter : present) {
    after.put(letter, new ArrayList<>());
    waiting.put(letter, 0);
}

for (int i = 0; i + 1 < words.length; i += 1) {
    String first = words[i];
    String second = words[i + 1];
    int shared = Math.min(first.length(), second.length());
    int at = 0;
    while (at < shared && first.charAt(at) == second.charAt(at)) at += 1;
    if (at == shared) {
        if (first.length() > second.length()) return "";
        continue;
    }
    after.get(first.charAt(at)).add(second.charAt(at));
    waiting.merge(second.charAt(at), 1, Integer::sum);
}

PriorityQueue<Character> ready = new PriorityQueue<>();
for (char letter : present) if (waiting.get(letter) == 0) ready.add(letter);

StringBuilder order = new StringBuilder();
while (!ready.isEmpty()) {
    char letter = ready.poll();
    order.append(letter);
    for (char next : after.get(letter)) {
        waiting.merge(next, -1, Integer::sum);
        if (waiting.get(next) == 0) ready.add(next);
    }
}
return order.length() == present.size() ? order.toString() : "";`,
      CPP: `set<char> present;
for (const string& word : words) for (char letter : word) present.insert(letter);

map<char, vector<char>> after;
map<char, int> waiting;
for (char letter : present) {
    after[letter] = vector<char>();
    waiting[letter] = 0;
}

for (size_t i = 0; i + 1 < words.size(); i += 1) {
    const string& first = words[i];
    const string& second = words[i + 1];
    size_t shared = min(first.size(), second.size());
    size_t at = 0;
    while (at < shared && first[at] == second[at]) at += 1;
    if (at == shared) {
        if (first.size() > second.size()) return "";
        continue;
    }
    after[first[at]].push_back(second[at]);
    waiting[second[at]] += 1;
}

priority_queue<char, vector<char>, greater<char>> ready;
for (char letter : present) if (waiting[letter] == 0) ready.push(letter);

string order;
while (!ready.empty()) {
    char letter = ready.top();
    ready.pop();
    order += letter;
    for (char following : after[letter]) {
        waiting[following] -= 1;
        if (waiting[following] == 0) ready.push(following);
    }
}
return order.size() == present.size() ? order : "";`,
    },
  },
];
