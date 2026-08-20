import type { SeedProblem } from "../../problems/types";

/**
 * Heaps and priority queues.
 *
 * A heap answers one question — what is the smallest thing here — in constant
 * time, and keeps answering it as things are added and removed in logarithmic
 * time. Every problem in this file is a case where that is strictly less work
 * than sorting: you need the extremes repeatedly, but you never need the whole
 * order.
 *
 * The recurring trick is the bounded heap. To find the k largest values, keep a
 * *min*-heap of size k and evict its smallest whenever it overflows; what
 * survives is the answer, at O(n log k) time and O(k) memory rather than
 * O(n log n) and O(n). Choosing the opposite heap from the one the question
 * names is the part that has to be practised rather than remembered.
 *
 * One practical note the explanations make rather than hide: JavaScript and
 * TypeScript have no priority queue in the standard library, so the reference
 * solutions build a small binary heap by hand. Python has heapq, Java has
 * PriorityQueue and C++ has priority_queue. Knowing which side of that line
 * your interview language falls on is worth more than it should be.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const HEAP_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "smash-the-heaviest-stones",
    title: "Smash the Two Heaviest Stones",
    difficulty: "EASY",
    interviewFrequency: "MEDIUM",
    description:
      "Repeatedly take the two heaviest stones and smash them together. Equal " +
      "weights destroy each other; otherwise the lighter is destroyed and the " +
      "heavier is left with the difference in weight. Return the weight of the " +
      "last stone, or 0 if none remains.",
    explanation:
      "The rule always names the two current heaviest, and smashing changes the " +
      "collection, so re-sorting after every round is O(n² log n) for no reason. " +
      "A max-heap gives both extractions in O(log n) and puts the remainder back " +
      "in O(log n), making the whole thing O(n log n). The base cases are worth " +
      "being careful about: the loop must continue while at least two stones " +
      "remain, a zero remainder should not be pushed back — it is not a stone — " +
      "and an empty heap at the end answers 0. In a language without a heap, " +
      "note that a sorted list with binary insertion is O(n) per insert and " +
      "therefore no better than the naive answer.",
    constraints: [
      "Between 1 and 30 stones.",
      "Each weight is between 1 and 1,000.",
      "A smash of equal weights leaves nothing at all.",
    ],
    hints: [
      "You need the two largest repeatedly, but never the full order.",
      "Push the remainder back only when it is not zero.",
      "Finish when fewer than two stones are left.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "smashTheHeaviestStones",
      params: [{ name: "weights", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-heap", "dsa-sorting", "js-arrays"],
    examples: [
      {
        input: "weights = [2, 7, 4, 1, 8, 1]",
        output: "1",
        explanation: "8 and 7 leave 1; then 4 and 2 leave 2; then 2 and 1 leave 1, which meets the last 1.",
      },
      {
        input: "weights = [1]",
        output: "1",
        explanation: "Nothing to smash it against.",
      },
    ],
    tests: [
      { args: [[2, 7, 4, 1, 8, 1]], expected: 1 },
      { args: [[1]], expected: 1 },
      { args: [[2, 2]], expected: 0 },
      { args: [[3, 7, 2]], expected: 2, hidden: true },
      { args: [[10, 4, 2, 10]], expected: 2, hidden: true },
      { args: [[1, 1, 1]], expected: 1, hidden: true },
      { args: [[1000, 1]], expected: 999, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const heap = [...weights].sort((a, b) => b - a);
while (heap.length > 1) {
  const first = heap.shift();
  const second = heap.shift();
  const left = first - second;
  if (left > 0) {
    let at = heap.length;
    heap.push(left);
    while (at > 0 && heap[at - 1] < left) {
      heap[at] = heap[at - 1];
      at -= 1;
    }
    heap[at] = left;
  }
}
return heap.length === 0 ? 0 : heap[0];`,
      TYPESCRIPT: `const heap: number[] = [...weights].sort((a, b) => b - a);
while (heap.length > 1) {
  const first = heap.shift() as number;
  const second = heap.shift() as number;
  const left = first - second;
  if (left > 0) {
    let at = heap.length;
    heap.push(left);
    while (at > 0 && heap[at - 1] < left) {
      heap[at] = heap[at - 1];
      at -= 1;
    }
    heap[at] = left;
  }
}
return heap.length === 0 ? 0 : heap[0];`,
      PYTHON: `import heapq

heap = [-weight for weight in weights]
heapq.heapify(heap)
while len(heap) > 1:
    first = -heapq.heappop(heap)
    second = -heapq.heappop(heap)
    if first != second:
        heapq.heappush(heap, -(first - second))
return -heap[0] if heap else 0`,
      JAVA: `PriorityQueue<Integer> heap = new PriorityQueue<>(Collections.reverseOrder());
for (int weight : weights) heap.add(weight);
while (heap.size() > 1) {
    int first = heap.poll();
    int second = heap.poll();
    if (first != second) heap.add(first - second);
}
return heap.isEmpty() ? 0 : heap.peek();`,
      CPP: `priority_queue<int> heap(weights.begin(), weights.end());
while (heap.size() > 1) {
    int first = heap.top();
    heap.pop();
    int second = heap.top();
    heap.pop();
    if (first != second) heap.push(first - second);
}
return heap.empty() ? 0 : heap.top();`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "k-most-frequent-values",
    title: "The k Most Frequent Values",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Return the k values that occur most often. Ties in frequency are broken " +
      "by taking the smaller value first, and the answer is returned in " +
      "increasing order so it can be compared exactly.",
    explanation:
      "Count with a hash map, then choose. Sorting the counts is O(m log m) in " +
      "the number of distinct values and is a perfectly good answer; a heap of " +
      "size k brings it to O(m log k), which matters when k is small and m is " +
      "large. The heap has to be a *min*-heap ordered by frequency — push each " +
      "value, and once the heap holds more than k, evict its smallest, because " +
      "the least frequent thing in a full heap is exactly the thing that cannot " +
      "be in the answer. There is also a linear option worth mentioning: bucket " +
      "the values by frequency, since no frequency can exceed the input length, " +
      "and read the buckets from the top. The stated tie-break and final sort " +
      "exist so the answer is unique.",
    constraints: [
      "The list holds between 1 and 100,000 values.",
      "Values are between -100,000 and 100,000, and k is at most the number of distinct values.",
      "Ties in frequency are broken in favour of the smaller value.",
    ],
    hints: [
      "Count first; the rest of the problem is a selection over the counts.",
      "To keep the k largest, evict from a min-heap once it overflows.",
      "Frequencies are bounded by the input length, which allows a linear bucket pass.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "kMostFrequentValues",
      params: [
        { name: "values", type: "int[]" },
        { name: "k", type: "int" },
      ],
      returns: "int[]",
    },
    topicSlugs: ["dsa-heap", "dsa-hashing", "dsa-sorting"],
    examples: [
      {
        input: "values = [1, 1, 1, 2, 2, 3], k = 2",
        output: "[1, 2]",
      },
      {
        input: "values = [4, 4, 5, 5, 6], k = 1",
        output: "[4]",
        explanation: "4 and 5 both occur twice, and the tie goes to the smaller.",
      },
    ],
    tests: [
      { args: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2] },
      { args: [[4, 4, 5, 5, 6], 1], expected: [4] },
      { args: [[7], 1], expected: [7] },
      { args: [[1, 2, 3], 3], expected: [1, 2, 3], hidden: true },
      { args: [[5, 5, 5], 1], expected: [5], hidden: true },
      {
        args: [[-1, -1, 2, 2, 3, 3, 3], 2],
        expected: [-1, 3],
        hidden: true,
      },
      { args: [[1, 2, 2, 3, 3, 3], 2], expected: [2, 3], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const counts = new Map();
for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);

const ranked = [...counts.entries()].sort(
  (a, b) => b[1] - a[1] || a[0] - b[0],
);
return ranked.slice(0, k).map((entry) => entry[0]).sort((a, b) => a - b);`,
      TYPESCRIPT: `const counts = new Map<number, number>();
for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);

const ranked = [...counts.entries()].sort(
  (a, b) => b[1] - a[1] || a[0] - b[0],
);
return ranked.slice(0, k).map((entry) => entry[0]).sort((a, b) => a - b);`,
      PYTHON: `counts = {}
for value in values:
    counts[value] = counts.get(value, 0) + 1

ranked = sorted(counts.items(), key=lambda entry: (-entry[1], entry[0]))
return sorted(entry[0] for entry in ranked[:k])`,
      JAVA: `Map<Integer, Integer> counts = new HashMap<>();
for (int value : values) counts.merge(value, 1, Integer::sum);

List<Map.Entry<Integer, Integer>> ranked = new ArrayList<>(counts.entrySet());
ranked.sort((a, b) -> {
    if (!a.getValue().equals(b.getValue())) return b.getValue() - a.getValue();
    return a.getKey() - b.getKey();
});

int[] answer = new int[k];
for (int i = 0; i < k; i += 1) answer[i] = ranked.get(i).getKey();
Arrays.sort(answer);
return answer;`,
      CPP: `unordered_map<int, int> counts;
for (int value : values) counts[value] += 1;

vector<pair<int, int>> ranked(counts.begin(), counts.end());
sort(ranked.begin(), ranked.end(),
     [](const pair<int, int>& a, const pair<int, int>& b) {
         if (a.second != b.second) return a.second > b.second;
         return a.first < b.first;
     });

vector<int> answer;
for (int i = 0; i < k; i += 1) answer.push_back(ranked[i].first);
sort(answer.begin(), answer.end());
return answer;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "k-closest-to-the-origin",
    title: "The k Closest Points",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Each point is given as [x, y]. Return the k points nearest the origin, " +
      "ordered by distance, with ties broken by smaller x and then by smaller y.",
    explanation:
      "Never take the square root. Comparing distances is the same as comparing " +
      "x² + y², the square root is monotonic so it cannot change any ordering, " +
      "and skipping it avoids both the cost and the floating-point comparison " +
      "that would make ties unreliable. With that settled, the selection is the " +
      "bounded-heap pattern: a max-heap of size k holding the closest points " +
      "seen so far, evicting the furthest whenever it overflows, at O(n log k). " +
      "Sorting everything is O(n log n) and is a fine answer to give first. " +
      "There is also quickselect, which is O(n) on average and the answer an " +
      "interviewer is fishing for when they ask whether you can beat n log k.",
    constraints: [
      "Between 1 and 10,000 points, each a pair [x, y].",
      "Coordinates are between -10,000 and 10,000, and k is at most the number of points.",
      "Ties are broken by smaller x, then smaller y.",
    ],
    hints: [
      "Compare squared distances — the square root changes no ordering.",
      "A max-heap of size k keeps the closest points seen so far.",
      "Quickselect does it in linear time on average, if you are asked for better.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "kClosestToTheOrigin",
      params: [
        { name: "points", type: "int[][]" },
        { name: "k", type: "int" },
      ],
      returns: "int[][]",
    },
    topicSlugs: ["dsa-heap", "dsa-sorting", "js-arrays"],
    examples: [
      {
        input: "points = [[1, 3], [-2, 2]], k = 1",
        output: "[[-2, 2]]",
        explanation: "Squared distances are 10 and 8.",
      },
      {
        input: "points = [[3, 3], [5, -1], [-2, 4]], k = 2",
        output: "[[3, 3], [-2, 4]]",
      },
    ],
    tests: [
      {
        args: [
          [
            [1, 3],
            [-2, 2],
          ],
          1,
        ],
        expected: [[-2, 2]],
      },
      {
        args: [
          [
            [3, 3],
            [5, -1],
            [-2, 4],
          ],
          2,
        ],
        expected: [
          [3, 3],
          [-2, 4],
        ],
      },
      { args: [[[0, 0]], 1], expected: [[0, 0]] },
      {
        args: [
          [
            [1, 0],
            [0, 1],
          ],
          2,
        ],
        expected: [
          [0, 1],
          [1, 0],
        ],
        hidden: true,
      },
      {
        args: [
          [
            [2, 2],
            [1, 1],
            [3, 3],
          ],
          2,
        ],
        expected: [
          [1, 1],
          [2, 2],
        ],
        hidden: true,
      },
      {
        args: [
          [
            [-1, -1],
            [1, 1],
          ],
          1,
        ],
        expected: [[-1, -1]],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const ordered = [...points].sort((a, b) => {
  const first = a[0] * a[0] + a[1] * a[1];
  const second = b[0] * b[0] + b[1] * b[1];
  return first - second || a[0] - b[0] || a[1] - b[1];
});
return ordered.slice(0, k).map((point) => [point[0], point[1]]);`,
      TYPESCRIPT: `const ordered = [...points].sort((a, b) => {
  const first = a[0] * a[0] + a[1] * a[1];
  const second = b[0] * b[0] + b[1] * b[1];
  return first - second || a[0] - b[0] || a[1] - b[1];
});
return ordered.slice(0, k).map((point) => [point[0], point[1]]);`,
      PYTHON: `ordered = sorted(points, key=lambda p: (p[0] * p[0] + p[1] * p[1], p[0], p[1]))
return [list(point) for point in ordered[:k]]`,
      JAVA: `int[][] ordered = points.clone();
Arrays.sort(ordered, (a, b) -> {
    long first = (long) a[0] * a[0] + (long) a[1] * a[1];
    long second = (long) b[0] * b[0] + (long) b[1] * b[1];
    if (first != second) return Long.compare(first, second);
    if (a[0] != b[0]) return Integer.compare(a[0], b[0]);
    return Integer.compare(a[1], b[1]);
});
int[][] answer = new int[k][];
for (int i = 0; i < k; i += 1) answer[i] = new int[] {ordered[i][0], ordered[i][1]};
return answer;`,
      CPP: `vector<vector<int>> ordered = points;
sort(ordered.begin(), ordered.end(),
     [](const vector<int>& a, const vector<int>& b) {
         long long first = (long long)a[0] * a[0] + (long long)a[1] * a[1];
         long long second = (long long)b[0] * b[0] + (long long)b[1] * b[1];
         if (first != second) return first < second;
         if (a[0] != b[0]) return a[0] < b[0];
         return a[1] < b[1];
     });
return vector<vector<int>>(ordered.begin(), ordered.begin() + k);`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "merge-many-sorted-lists",
    title: "Merge Many Sorted Lists",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Several lists are each already in increasing order. Merge them into one " +
      "increasing list holding every value from all of them, keeping duplicates.",
    explanation:
      "Concatenating and sorting is O(N log N) and throws away the fact that the " +
      "input was sorted — say so before proposing it. Merging two at a time is " +
      "better but re-copies the accumulated result on every merge, giving O(kN). " +
      "The heap version does it in O(N log k): put the first value of each list " +
      "into a min-heap alongside which list it came from, then repeatedly take " +
      "the smallest and push the next value from that same list. Because the " +
      "heap only ever holds one candidate per list, its size is k rather than N, " +
      "and each of the N values is pushed and popped exactly once. Merging " +
      "pairwise in a tournament — halving the number of lists each round — is " +
      "the other O(N log k) answer, and is worth knowing as the divide-and-" +
      "conquer alternative to the heap.",
    constraints: [
      "Between 0 and 1,000 lists, holding between 0 and 100,000 values in total.",
      "Each list is in non-decreasing order; values are between -10,000 and 10,000.",
      "Duplicates are kept, and empty lists are allowed.",
    ],
    hints: [
      "Sorting the concatenation ignores everything the input already told you.",
      "Only k values can ever be candidates at once — one per list.",
      "A heap holding (value, which list) gives the next value in log k.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "mergeManySortedLists",
      params: [{ name: "lists", type: "int[][]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-heap", "dsa-sorting", "dsa-linked-list"],
    examples: [
      {
        input: "lists = [[1, 4, 5], [1, 3, 4], [2, 6]]",
        output: "[1, 1, 2, 3, 4, 4, 5, 6]",
      },
      {
        input: "lists = []",
        output: "[]",
      },
    ],
    tests: [
      {
        args: [
          [
            [1, 4, 5],
            [1, 3, 4],
            [2, 6],
          ],
        ],
        expected: [1, 1, 2, 3, 4, 4, 5, 6],
      },
      { args: [[]], expected: [] },
      { args: [[[]]], expected: [] },
      { args: [[[1]]], expected: [1], hidden: true },
      {
        args: [
          [
            [],
            [1, 2],
            [],
          ],
        ],
        expected: [1, 2],
        hidden: true,
      },
      {
        args: [
          [
            [-3, -1],
            [-2, 0],
          ],
        ],
        expected: [-3, -2, -1, 0],
        hidden: true,
      },
      {
        args: [
          [
            [5, 5],
            [5],
          ],
        ],
        expected: [5, 5, 5],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `// A min-heap of [value, listIndex, position]. JavaScript has none built in.
const heap = [];
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

for (let i = 0; i < lists.length; i += 1) {
  if (lists[i].length > 0) push([lists[i][0], i, 0]);
}

const merged = [];
while (heap.length > 0) {
  const [value, list, position] = pop();
  merged.push(value);
  if (position + 1 < lists[list].length) {
    push([lists[list][position + 1], list, position + 1]);
  }
}
return merged;`,
      TYPESCRIPT: `// A min-heap of [value, listIndex, position]. TypeScript has none built in.
const heap: number[][] = [];
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

for (let i = 0; i < lists.length; i += 1) {
  if (lists[i].length > 0) push([lists[i][0], i, 0]);
}

const merged: number[] = [];
while (heap.length > 0) {
  const entry = pop();
  merged.push(entry[0]);
  if (entry[2] + 1 < lists[entry[1]].length) {
    push([lists[entry[1]][entry[2] + 1], entry[1], entry[2] + 1]);
  }
}
return merged;`,
      PYTHON: `import heapq

heap = []
for i, one in enumerate(lists):
    if one:
        heapq.heappush(heap, (one[0], i, 0))

merged = []
while heap:
    value, which, position = heapq.heappop(heap)
    merged.append(value)
    if position + 1 < len(lists[which]):
        heapq.heappush(heap, (lists[which][position + 1], which, position + 1))
return merged`,
      JAVA: `PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
for (int i = 0; i < lists.length; i += 1) {
    if (lists[i].length > 0) heap.add(new int[] {lists[i][0], i, 0});
}

List<Integer> merged = new ArrayList<>();
while (!heap.isEmpty()) {
    int[] entry = heap.poll();
    merged.add(entry[0]);
    if (entry[2] + 1 < lists[entry[1]].length) {
        heap.add(new int[] {lists[entry[1]][entry[2] + 1], entry[1], entry[2] + 1});
    }
}

int[] answer = new int[merged.size()];
for (int i = 0; i < answer.length; i += 1) answer[i] = merged.get(i);
return answer;`,
      CPP: `priority_queue<vector<int>, vector<vector<int>>, greater<vector<int>>> heap;
for (int i = 0; i < (int)lists.size(); i += 1) {
    if (!lists[i].empty()) heap.push(vector<int>{lists[i][0], i, 0});
}

vector<int> merged;
while (!heap.empty()) {
    vector<int> entry = heap.top();
    heap.pop();
    merged.push_back(entry[0]);
    if (entry[2] + 1 < (int)lists[entry[1]].size()) {
        heap.push(vector<int>{lists[entry[1]][entry[2] + 1], entry[1], entry[2] + 1});
    }
}
return merged;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "join-the-ropes-cheaply",
    title: "Join the Ropes Cheaply",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Joining two ropes costs the sum of their lengths and produces one rope of " +
      "that length. Keep joining until a single rope remains, and return the " +
      "smallest total cost possible. Fewer than two ropes cost nothing.",
    explanation:
      "Each join charges for the whole length it produces, so a rope's length is " +
      "paid again at every join it later takes part in — meaning the cost of a " +
      "rope is its length times the number of joins above it. To keep the total " +
      "down, the longest ropes must take part in the fewest joins, which means " +
      "joining the two *shortest* ropes at every step. That is the same argument " +
      "Huffman coding rests on, and it is worth recognising by name. A min-heap " +
      "makes each step O(log n): take the two smallest, charge their sum, push " +
      "the sum back. Sorting once is not enough, because the rope you create is " +
      "usually not the largest and has to re-enter the ordering.",
    constraints: [
      "Between 0 and 100,000 ropes.",
      "Each length is between 1 and 10,000.",
      "Zero or one rope needs no joins and costs 0.",
    ],
    hints: [
      "A rope's length is charged once per join it takes part in.",
      "So the longest ropes should be joined last — always take the two shortest.",
      "The rope you create must go back into the pool, which is why sorting once is not enough.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "joinTheRopesCheaply",
      params: [{ name: "lengths", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-heap", "dsa-greedy", "js-arrays"],
    examples: [
      {
        input: "lengths = [4, 3, 2, 6]",
        output: "29",
        explanation: "Join 2+3 for 5, then 4+5 for 9, then 6+9 for 15 — a total of 29.",
      },
      {
        input: "lengths = [5]",
        output: "0",
        explanation: "One rope needs no joining.",
      },
    ],
    tests: [
      { args: [[4, 3, 2, 6]], expected: 29 },
      { args: [[5]], expected: 0 },
      { args: [[]], expected: 0 },
      { args: [[1, 2]], expected: 3, hidden: true },
      { args: [[1, 1, 1, 1]], expected: 8, hidden: true },
      { args: [[1, 2, 3, 4, 5]], expected: 33, hidden: true },
      { args: [[10000, 10000]], expected: 20000, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const heap = [];
function push(value) {
  heap.push(value);
  let at = heap.length - 1;
  while (at > 0) {
    const parent = (at - 1) >> 1;
    if (heap[parent] <= heap[at]) break;
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
      if (left < heap.length && heap[left] < heap[smallest]) smallest = left;
      if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
      if (smallest === at) break;
      [heap[smallest], heap[at]] = [heap[at], heap[smallest]];
      at = smallest;
    }
  }
  return top;
}

for (const length of lengths) push(length);
let cost = 0;
while (heap.length > 1) {
  const joined = pop() + pop();
  cost += joined;
  push(joined);
}
return cost;`,
      TYPESCRIPT: `const heap: number[] = [];
function push(value: number): void {
  heap.push(value);
  let at = heap.length - 1;
  while (at > 0) {
    const parent = (at - 1) >> 1;
    if (heap[parent] <= heap[at]) break;
    [heap[parent], heap[at]] = [heap[at], heap[parent]];
    at = parent;
  }
}
function pop(): number {
  const top = heap[0];
  const last = heap.pop() as number;
  if (heap.length > 0) {
    heap[0] = last;
    let at = 0;
    for (;;) {
      const left = at * 2 + 1;
      const right = left + 1;
      let smallest = at;
      if (left < heap.length && heap[left] < heap[smallest]) smallest = left;
      if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
      if (smallest === at) break;
      [heap[smallest], heap[at]] = [heap[at], heap[smallest]];
      at = smallest;
    }
  }
  return top;
}

for (const length of lengths) push(length);
let cost = 0;
while (heap.length > 1) {
  const joined = pop() + pop();
  cost += joined;
  push(joined);
}
return cost;`,
      PYTHON: `import heapq

heap = list(lengths)
heapq.heapify(heap)
cost = 0
while len(heap) > 1:
    joined = heapq.heappop(heap) + heapq.heappop(heap)
    cost += joined
    heapq.heappush(heap, joined)
return cost`,
      JAVA: `PriorityQueue<Integer> heap = new PriorityQueue<>();
for (int length : lengths) heap.add(length);
int cost = 0;
while (heap.size() > 1) {
    int joined = heap.poll() + heap.poll();
    cost += joined;
    heap.add(joined);
}
return cost;`,
      CPP: `priority_queue<int, vector<int>, greater<int>> heap(lengths.begin(), lengths.end());
int cost = 0;
while (heap.size() > 1) {
    int first = heap.top();
    heap.pop();
    int second = heap.top();
    heap.pop();
    int joined = first + second;
    cost += joined;
    heap.push(joined);
}
return cost;`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "kth-smallest-in-sorted-grid",
    title: "The kth Smallest in a Sorted Grid",
    difficulty: "HARD",
    interviewFrequency: "HIGH",
    description:
      "Every row of the grid increases left to right, and every column increases " +
      "top to bottom. Return the kth smallest value in the whole grid, counting " +
      "from 1 and counting duplicates separately.",
    explanation:
      "Flattening and sorting is O(n² log n) and ignores the structure. Two " +
      "better answers exist and both are worth having. The heap version treats " +
      "the rows as sorted lists and merges them: seed a min-heap with the first " +
      "value of each row, then pop k times, pushing the next value from the row " +
      "each pop came from — O(k log n). The binary-search version is the one " +
      "that scales: search the *value* range rather than the grid, and for a " +
      "candidate value count how many entries are no larger than it by walking " +
      "from the bottom-left corner, moving right when the value is too small and " +
      "up when it is too large. That count is monotonic in the candidate, so " +
      "binary search converges, and the smallest candidate whose count reaches k " +
      "is the answer — O(n log(max - min)) with no heap at all. Searching an " +
      "answer range rather than an index range is the reusable idea.",
    constraints: [
      "The grid is n by n with n between 1 and 300.",
      "Values are between -1,000,000,000 and 1,000,000,000.",
      "k is between 1 and n squared, and duplicates count separately.",
    ],
    hints: [
      "The rows are sorted lists — merging them is one answer.",
      "Better: binary search the value range rather than the positions.",
      "Counting entries no larger than a candidate is one walk from the bottom-left corner.",
    ],
    estimatedTime: "45 min",
    timeLimitMs: 5000,
    signature: {
      name: "kthSmallestInSortedGrid",
      params: [
        { name: "grid", type: "int[][]" },
        { name: "k", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-heap", "dsa-binary-search", "js-arrays"],
    examples: [
      {
        input: "grid = [[1, 5, 9], [10, 11, 13], [12, 13, 15]], k = 8",
        output: "13",
        explanation: "Sorted, the values run 1, 5, 9, 10, 11, 12, 13, 13, 15.",
      },
      {
        input: "grid = [[-5]], k = 1",
        output: "-5",
      },
    ],
    tests: [
      {
        args: [
          [
            [1, 5, 9],
            [10, 11, 13],
            [12, 13, 15],
          ],
          8,
        ],
        expected: 13,
      },
      { args: [[[-5]], 1], expected: -5 },
      {
        args: [
          [
            [1, 2],
            [1, 3],
          ],
          2,
        ],
        expected: 1,
      },
      {
        args: [
          [
            [1, 2],
            [1, 3],
          ],
          4,
        ],
        expected: 3,
        hidden: true,
      },
      {
        args: [
          [
            [1, 1],
            [1, 1],
          ],
          3,
        ],
        expected: 1,
        hidden: true,
      },
      {
        args: [
          [
            [1, 3, 5],
            [6, 7, 12],
            [11, 14, 14],
          ],
          6,
        ],
        expected: 11,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const n = grid.length;
let low = grid[0][0];
let high = grid[n - 1][n - 1];

function noLargerThan(limit) {
  let count = 0;
  let row = n - 1;
  let column = 0;
  while (row >= 0 && column < n) {
    if (grid[row][column] <= limit) {
      count += row + 1;
      column += 1;
    } else {
      row -= 1;
    }
  }
  return count;
}

while (low < high) {
  const middle = Math.floor((low + high) / 2);
  if (noLargerThan(middle) >= k) high = middle;
  else low = middle + 1;
}
return low;`,
      TYPESCRIPT: `const n = grid.length;
let low = grid[0][0];
let high = grid[n - 1][n - 1];

function noLargerThan(limit: number): number {
  let count = 0;
  let row = n - 1;
  let column = 0;
  while (row >= 0 && column < n) {
    if (grid[row][column] <= limit) {
      count += row + 1;
      column += 1;
    } else {
      row -= 1;
    }
  }
  return count;
}

while (low < high) {
  const middle = Math.floor((low + high) / 2);
  if (noLargerThan(middle) >= k) high = middle;
  else low = middle + 1;
}
return low;`,
      PYTHON: `import math

n = len(grid)
low = grid[0][0]
high = grid[n - 1][n - 1]

def no_larger_than(limit):
    count = 0
    row = n - 1
    column = 0
    while row >= 0 and column < n:
        if grid[row][column] <= limit:
            count += row + 1
            column += 1
        else:
            row -= 1
    return count

while low < high:
    middle = math.floor((low + high) / 2)
    if no_larger_than(middle) >= k:
        high = middle
    else:
        low = middle + 1
return low`,
      JAVA: `int n = grid.length;
int low = grid[0][0];
int high = grid[n - 1][n - 1];

class Counter {
    int noLargerThan(long limit) {
        int count = 0;
        int row = n - 1;
        int column = 0;
        while (row >= 0 && column < n) {
            if (grid[row][column] <= limit) {
                count += row + 1;
                column += 1;
            } else {
                row -= 1;
            }
        }
        return count;
    }
}

Counter counter = new Counter();
while (low < high) {
    long middle = ((long) low + high) >> 1;
    if (counter.noLargerThan(middle) >= k) high = (int) middle;
    else low = (int) middle + 1;
}
return low;`,
      CPP: `int n = (int)grid.size();
long long low = grid[0][0];
long long high = grid[n - 1][n - 1];

auto noLargerThan = [&](long long limit) {
    int count = 0;
    int row = n - 1;
    int column = 0;
    while (row >= 0 && column < n) {
        if (grid[row][column] <= limit) {
            count += row + 1;
            column += 1;
        } else {
            row -= 1;
        }
    }
    return count;
};

while (low < high) {
    long long middle = low + (high - low) / 2;
    if (noLargerThan(middle) >= k) high = middle;
    else low = middle + 1;
}
return (int)low;`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "narrowest-range-covering-all",
    title: "The Narrowest Range Covering All",
    difficulty: "HARD",
    interviewFrequency: "MEDIUM",
    description:
      "Given several lists, each already in increasing order, find the narrowest " +
      "range [low, high] that contains at least one value from every list. If " +
      "two ranges are equally narrow, return the one starting at the smaller " +
      "value. Every list holds at least one value.",
    explanation:
      "A range containing one value from every list is exactly a choice of one " +
      "value per list, and its width is the largest chosen minus the smallest. " +
      "So the question is which choices are worth considering. Keep one pointer " +
      "per list, all starting at the front, and hold the k chosen values in a " +
      "min-heap while tracking their maximum separately. The current range runs " +
      "from the heap's smallest to that maximum, and it is a candidate. To " +
      "improve it you must raise the smallest — nothing else can narrow the " +
      "range — so advance the pointer belonging to whichever list produced the " +
      "smallest, push its next value, and update the maximum. When any list runs " +
      "out, no better range exists and the sweep stops. It is O(N log k), and " +
      "the argument for advancing the minimum is what makes it correct rather " +
      "than merely plausible.",
    constraints: [
      "Between 1 and 3,000 lists, each holding between 1 and 50 values.",
      "Every list is in non-decreasing order; values are between -100,000 and 100,000.",
      "Ties in width are broken by the smaller starting value.",
    ],
    hints: [
      "A valid range is a choice of one value from each list, and its width is max minus min.",
      "Only raising the current minimum can ever narrow the range.",
      "Stop as soon as one list is exhausted — nothing beyond that can help.",
    ],
    estimatedTime: "50 min",
    timeLimitMs: 5000,
    signature: {
      name: "narrowestRangeCoveringAll",
      params: [{ name: "lists", type: "int[][]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-heap", "dsa-sliding-window", "dsa-two-pointers"],
    examples: [
      {
        input: "lists = [[4, 10, 15, 24, 26], [0, 9, 12, 20], [5, 18, 22, 30]]",
        output: "[20, 24]",
        explanation: "20 comes from the second list, 24 from the first and 22 from the third.",
      },
      {
        input: "lists = [[1, 2, 3], [1, 2, 3], [1, 2, 3]]",
        output: "[1, 1]",
        explanation: "All three lists hold a 1, so the range collapses to a point.",
      },
    ],
    tests: [
      {
        args: [
          [
            [4, 10, 15, 24, 26],
            [0, 9, 12, 20],
            [5, 18, 22, 30],
          ],
        ],
        expected: [20, 24],
      },
      {
        args: [
          [
            [1, 2, 3],
            [1, 2, 3],
            [1, 2, 3],
          ],
        ],
        expected: [1, 1],
      },
      { args: [[[5]]], expected: [5, 5] },
      {
        args: [
          [
            [1, 10],
            [2, 9],
          ],
        ],
        expected: [1, 2],
        hidden: true,
      },
      {
        args: [
          [
            [-5, 0],
            [3],
          ],
        ],
        expected: [0, 3],
        hidden: true,
      },
      {
        args: [
          [
            [10],
            [11],
            [12],
          ],
        ],
        expected: [10, 12],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const k = lists.length;
const at = new Array(k).fill(0);
let bestLow = 0;
let bestHigh = 0;
let started = false;

for (;;) {
  let low = Infinity;
  let high = -Infinity;
  let lowest = -1;
  for (let i = 0; i < k; i += 1) {
    const value = lists[i][at[i]];
    if (value < low) {
      low = value;
      lowest = i;
    }
    if (value > high) high = value;
  }
  if (!started || high - low < bestHigh - bestLow) {
    bestLow = low;
    bestHigh = high;
    started = true;
  }
  at[lowest] += 1;
  if (at[lowest] === lists[lowest].length) break;
}
return [bestLow, bestHigh];`,
      TYPESCRIPT: `const k = lists.length;
const at: number[] = new Array(k).fill(0);
let bestLow = 0;
let bestHigh = 0;
let started = false;

for (;;) {
  let low = Infinity;
  let high = -Infinity;
  let lowest = -1;
  for (let i = 0; i < k; i += 1) {
    const value = lists[i][at[i]];
    if (value < low) {
      low = value;
      lowest = i;
    }
    if (value > high) high = value;
  }
  if (!started || high - low < bestHigh - bestLow) {
    bestLow = low;
    bestHigh = high;
    started = true;
  }
  at[lowest] += 1;
  if (at[lowest] === lists[lowest].length) break;
}
return [bestLow, bestHigh];`,
      PYTHON: `import heapq

heap = []
high = None
for i, one in enumerate(lists):
    heapq.heappush(heap, (one[0], i, 0))
    high = one[0] if high is None else max(high, one[0])

best_low, best_high = None, None
while True:
    low, which, position = heapq.heappop(heap)
    if best_low is None or high - low < best_high - best_low:
        best_low, best_high = low, high
    if position + 1 == len(lists[which]):
        break
    nxt = lists[which][position + 1]
    high = max(high, nxt)
    heapq.heappush(heap, (nxt, which, position + 1))
return [best_low, best_high]`,
      JAVA: `int k = lists.length;
PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
int high = Integer.MIN_VALUE;
for (int i = 0; i < k; i += 1) {
    heap.add(new int[] {lists[i][0], i, 0});
    high = Math.max(high, lists[i][0]);
}

int bestLow = 0;
int bestHigh = 0;
boolean started = false;
while (true) {
    int[] entry = heap.poll();
    if (!started || high - entry[0] < bestHigh - bestLow) {
        bestLow = entry[0];
        bestHigh = high;
        started = true;
    }
    if (entry[2] + 1 == lists[entry[1]].length) break;
    int next = lists[entry[1]][entry[2] + 1];
    high = Math.max(high, next);
    heap.add(new int[] {next, entry[1], entry[2] + 1});
}
return new int[] {bestLow, bestHigh};`,
      CPP: `int k = (int)lists.size();
priority_queue<vector<int>, vector<vector<int>>, greater<vector<int>>> heap;
int high = INT_MIN;
for (int i = 0; i < k; i += 1) {
    heap.push(vector<int>{lists[i][0], i, 0});
    high = max(high, lists[i][0]);
}

int bestLow = 0, bestHigh = 0;
bool started = false;
while (true) {
    vector<int> entry = heap.top();
    heap.pop();
    if (!started || high - entry[0] < bestHigh - bestLow) {
        bestLow = entry[0];
        bestHigh = high;
        started = true;
    }
    if (entry[2] + 1 == (int)lists[entry[1]].size()) break;
    int nextValue = lists[entry[1]][entry[2] + 1];
    high = max(high, nextValue);
    heap.push(vector<int>{nextValue, entry[1], entry[2] + 1});
}
return vector<int>{bestLow, bestHigh};`,
    },
  },
];
