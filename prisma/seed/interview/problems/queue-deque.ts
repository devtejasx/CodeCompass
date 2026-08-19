import type { SeedProblem } from "../../problems/types";

/**
 * Queues and deques.
 *
 * The first half is the queue as a *simulator*: a rule is described in the
 * language of people standing in line, and the honest answer is to stand them
 * in a line. These are here partly because online assessments love them, and
 * partly because they teach the habit of asking "does this simulation actually
 * terminate, and how fast" before writing it.
 *
 * The second half is the deque earning its keep. Once you can push and pop at
 * both ends, a window can maintain the answer for its own contents instead of
 * recomputing it, which is what turns the sliding-window maximum from O(nk)
 * into O(n). The last problem is that same machinery over prefix sums, and it
 * is the reason this topic sits after prefix sums in the roadmap rather than
 * next to stacks.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const QUEUE_DEQUE_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "time-to-buy-tickets",
    title: "Time to Buy Your Tickets",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "People stand in a line, and the person at position i wants tickets[i] " +
      "tickets. Each second the person at the front buys exactly one ticket; if " +
      "they still want more they walk to the back of the line, otherwise they " +
      "leave. Return the number of seconds until the person who started at " +
      "position target has bought their last ticket.",
    explanation:
      "Simulating the line works and is worth writing once, but there is a " +
      "closed form worth seeing. Ask how many tickets each other person can " +
      "possibly buy before your target finishes. Somebody standing at or before " +
      "the target gets a turn in every round the target does, so they " +
      "contribute min(their want, target's want). Somebody standing after the " +
      "target loses the final round — the target leaves before reaching them — " +
      "so they contribute min(their want, target's want minus one). Every " +
      "ticket sold takes one second and the target's own tickets are counted by " +
      "the first rule, so summing those minimums is the answer in O(n) with no " +
      "queue at all.",
    constraints: [
      "Between 1 and 100 people are in the line.",
      "Each person wants between 1 and 100 tickets.",
      "target is a valid position in the line.",
    ],
    hints: [
      "You do not need to run the clock. Ask how many tickets each person sells before the target leaves.",
      "Somebody in front of the target — or the target — gets a turn every round.",
      "Somebody behind the target misses the very last round.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "timeToBuyTickets",
      params: [
        { name: "tickets", type: "int[]" },
        { name: "target", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-queue-deque", "js-arrays", "js-loops"],
    examples: [
      {
        input: "tickets = [2, 3, 2], target = 2",
        output: "6",
        explanation:
          "Both neighbours can sell at most 2 before the last person finishes, so 2 + 2 + 2.",
      },
      {
        input: "tickets = [5, 1, 1, 1], target = 0",
        output: "8",
        explanation:
          "The three people behind buy one each, and the target buys all five.",
      },
    ],
    tests: [
      { args: [[2, 3, 2], 2], expected: 6 },
      { args: [[5, 1, 1, 1], 0], expected: 8 },
      { args: [[1], 0], expected: 1 },
      { args: [[1, 1, 1, 1], 3], expected: 4, hidden: true },
      { args: [[3, 3, 3], 1], expected: 8, hidden: true },
      { args: [[100, 100], 1], expected: 200, hidden: true },
      { args: [[2, 1, 4, 3], 2], expected: 10, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const wanted = tickets[target];
let seconds = 0;
for (let i = 0; i < tickets.length; i += 1) {
  const cap = i <= target ? wanted : wanted - 1;
  seconds += Math.min(tickets[i], cap);
}
return seconds;`,
      TYPESCRIPT: `const wanted = tickets[target];
let seconds = 0;
for (let i = 0; i < tickets.length; i += 1) {
  const cap = i <= target ? wanted : wanted - 1;
  seconds += Math.min(tickets[i], cap);
}
return seconds;`,
      PYTHON: `wanted = tickets[target]
seconds = 0
for i, want in enumerate(tickets):
    cap = wanted if i <= target else wanted - 1
    seconds += min(want, cap)
return seconds`,
      JAVA: `int wanted = tickets[target];
int seconds = 0;
for (int i = 0; i < tickets.length; i += 1) {
    int cap = i <= target ? wanted : wanted - 1;
    seconds += Math.min(tickets[i], cap);
}
return seconds;`,
      CPP: `int wanted = tickets[target];
int seconds = 0;
for (int i = 0; i < (int)tickets.size(); i += 1) {
    int cap = i <= target ? wanted : wanted - 1;
    seconds += min(tickets[i], cap);
}
return seconds;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "students-who-never-eat",
    title: "Students Who Never Get Lunch",
    difficulty: "EASY",
    interviewFrequency: "MEDIUM",
    description:
      "Students queue for lunch, each wanting either kind 0 or kind 1. Meals sit " +
      "in a stack. The student at the front takes the top meal if it is the kind " +
      "they want, otherwise they go to the back of the queue. Serving stops when " +
      "everybody still queuing refuses the top meal. Return how many students go " +
      "hungry.",
    explanation:
      "The queue and the stack are a distraction — order within the queue never " +
      "matters, because a student who wants kind 0 is interchangeable with any " +
      "other student who wants kind 0. All that matters is how many students " +
      "want each kind. Walk the meals from the top down, and hand each one out " +
      "if anybody still wants that kind. The first meal nobody wants is where " +
      "everything stops for good, because the queue can no longer change. " +
      "Whoever is left is the answer, and it is a single O(n) pass. Recognising " +
      "that a simulation has an order-independent invariant is the skill this " +
      "problem is really testing.",
    constraints: [
      "Between 1 and 100 students, and exactly as many meals.",
      "Every preference and every meal is 0 or 1.",
      "Serving halts the moment the front meal is refused by everyone waiting.",
    ],
    hints: [
      "Does it matter which student who wants kind 0 takes the meal?",
      "Count how many students want each kind, and forget the queue.",
      "Walk the meals in order; the first one nobody wants ends the process.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "studentsWhoNeverEat",
      params: [
        { name: "preferences", type: "int[]" },
        { name: "meals", type: "int[]" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-queue-deque", "dsa-hashing", "js-arrays"],
    examples: [
      {
        input: "preferences = [1, 1, 0, 0], meals = [0, 1, 0, 1]",
        output: "0",
        explanation: "Everybody eventually reaches a meal they want.",
      },
      {
        input: "preferences = [1, 1, 1, 0, 0, 1], meals = [1, 0, 0, 0, 1, 1]",
        output: "3",
        explanation:
          "After the two 0-eaters are served, three 1-eaters face a stack of 0s and stop.",
      },
    ],
    tests: [
      {
        args: [
          [1, 1, 0, 0],
          [0, 1, 0, 1],
        ],
        expected: 0,
      },
      {
        args: [
          [1, 1, 1, 0, 0, 1],
          [1, 0, 0, 0, 1, 1],
        ],
        expected: 3,
      },
      { args: [[0], [1]], expected: 1 },
      { args: [[1], [1]], expected: 0, hidden: true },
      {
        args: [
          [0, 0, 0],
          [0, 0, 0],
        ],
        expected: 0,
        hidden: true,
      },
      {
        args: [
          [1, 1, 0],
          [0, 0, 1],
        ],
        expected: 2,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `let wantZero = 0;
let wantOne = 0;
for (const preference of preferences) {
  if (preference === 0) wantZero += 1;
  else wantOne += 1;
}
for (const meal of meals) {
  if (meal === 0) {
    if (wantZero === 0) break;
    wantZero -= 1;
  } else {
    if (wantOne === 0) break;
    wantOne -= 1;
  }
}
return wantZero + wantOne;`,
      TYPESCRIPT: `let wantZero = 0;
let wantOne = 0;
for (const preference of preferences) {
  if (preference === 0) wantZero += 1;
  else wantOne += 1;
}
for (const meal of meals) {
  if (meal === 0) {
    if (wantZero === 0) break;
    wantZero -= 1;
  } else {
    if (wantOne === 0) break;
    wantOne -= 1;
  }
}
return wantZero + wantOne;`,
      PYTHON: `want_zero = preferences.count(0)
want_one = preferences.count(1)
for meal in meals:
    if meal == 0:
        if want_zero == 0:
            break
        want_zero -= 1
    else:
        if want_one == 0:
            break
        want_one -= 1
return want_zero + want_one`,
      JAVA: `int wantZero = 0;
int wantOne = 0;
for (int preference : preferences) {
    if (preference == 0) wantZero += 1;
    else wantOne += 1;
}
for (int meal : meals) {
    if (meal == 0) {
        if (wantZero == 0) break;
        wantZero -= 1;
    } else {
        if (wantOne == 0) break;
        wantOne -= 1;
    }
}
return wantZero + wantOne;`,
      CPP: `int wantZero = 0;
int wantOne = 0;
for (int preference : preferences) {
    if (preference == 0) wantZero += 1;
    else wantOne += 1;
}
for (int meal : meals) {
    if (meal == 0) {
        if (wantZero == 0) break;
        wantZero -= 1;
    } else {
        if (wantOne == 0) break;
        wantOne -= 1;
    }
}
return wantZero + wantOne;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "deal-cards-in-order",
    title: "Deal the Cards in Order",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "You will deal a deck face up using a fixed ritual: reveal the top card, " +
      "then move the next top card to the bottom, and repeat until the deck is " +
      "empty. Return the starting order the deck must be in so that the revealed " +
      "cards come out in increasing order.",
    explanation:
      "Running the ritual forwards from an unknown deck is guesswork, so run it " +
      "backwards from a known answer. Sort the values — that is the order they " +
      "must be revealed in — and keep a deque of the *positions* 0, 1, 2, … " +
      "still unfilled. Now replay the ritual on positions instead of cards: take " +
      "the front position and write the next sorted value there, then move the " +
      "new front position to the back, exactly as the ritual would have. Because " +
      "the position deque undergoes the same rotation the real deck will, the " +
      "arrangement it produces is guaranteed to deal correctly. This is the " +
      "general trick for reversing a simulation: simulate the indices, not the " +
      "values.",
    constraints: [
      "The deck holds between 1 and 1,000 cards.",
      "All values are distinct and between 1 and 1,000,000.",
      "Exactly one arrangement produces an increasing reveal.",
    ],
    hints: [
      "You know the order the cards must come out in — sort them.",
      "Run the same ritual on the list of empty positions instead of on cards.",
      "A deque gives you both ends: take from the front, send to the back.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "dealCardsInOrder",
      params: [{ name: "deck", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-queue-deque", "dsa-sorting", "js-arrays"],
    examples: [
      {
        input: "deck = [17, 13, 11, 2, 3, 5, 7]",
        output: "[2, 13, 3, 11, 5, 17, 7]",
        explanation:
          "Dealing this arrangement reveals 2, 3, 5, 7, 11, 13, 17 in that order.",
      },
      {
        input: "deck = [1, 2, 3]",
        output: "[1, 3, 2]",
        explanation: "Reveal 1, send 3 to the bottom, reveal 2, then reveal 3.",
      },
    ],
    tests: [
      {
        args: [[17, 13, 11, 2, 3, 5, 7]],
        expected: [2, 13, 3, 11, 5, 17, 7],
      },
      { args: [[1, 2, 3]], expected: [1, 3, 2] },
      { args: [[9]], expected: [9] },
      { args: [[4, 8]], expected: [4, 8], hidden: true },
      { args: [[5, 1, 4, 2]], expected: [1, 4, 2, 5], hidden: true },
      {
        args: [[6, 5, 4, 3, 2, 1]],
        expected: [1, 4, 2, 6, 3, 5],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const sorted = [...deck].sort((a, b) => a - b);
const positions = [];
for (let i = 0; i < deck.length; i += 1) positions.push(i);

const arrangement = new Array(deck.length).fill(0);
for (const value of sorted) {
  arrangement[positions.shift()] = value;
  if (positions.length > 0) positions.push(positions.shift());
}
return arrangement;`,
      TYPESCRIPT: `const sorted = [...deck].sort((a, b) => a - b);
const positions: number[] = [];
for (let i = 0; i < deck.length; i += 1) positions.push(i);

const arrangement: number[] = new Array(deck.length).fill(0);
for (const value of sorted) {
  arrangement[positions.shift() as number] = value;
  if (positions.length > 0) positions.push(positions.shift() as number);
}
return arrangement;`,
      PYTHON: `from collections import deque

positions = deque(range(len(deck)))
arrangement = [0] * len(deck)
for value in sorted(deck):
    arrangement[positions.popleft()] = value
    if positions:
        positions.append(positions.popleft())
return arrangement`,
      JAVA: `int[] sorted = deck.clone();
Arrays.sort(sorted);
Deque<Integer> positions = new ArrayDeque<>();
for (int i = 0; i < deck.length; i += 1) positions.addLast(i);

int[] arrangement = new int[deck.length];
for (int value : sorted) {
    arrangement[positions.pollFirst()] = value;
    if (!positions.isEmpty()) positions.addLast(positions.pollFirst());
}
return arrangement;`,
      CPP: `vector<int> sorted = deck;
sort(sorted.begin(), sorted.end());
deque<int> positions;
for (int i = 0; i < (int)deck.size(); i += 1) positions.push_back(i);

vector<int> arrangement(deck.size(), 0);
for (int value : sorted) {
    arrangement[positions.front()] = value;
    positions.pop_front();
    if (!positions.empty()) {
        positions.push_back(positions.front());
        positions.pop_front();
    }
}
return arrangement;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "window-maximums",
    title: "The Maximum in Every Window",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "A window of fixed size slides along the list one position at a time. " +
      "Report the largest value inside the window at each of its positions, from " +
      "the leftmost to the rightmost.",
    explanation:
      "Recomputing the maximum per position is O(nk), and the waste is obvious: " +
      "the window barely changes between steps. The fix is a deque holding " +
      "indices whose values decrease from front to back, which makes the front " +
      "index always the current maximum. Two rules maintain it. Before pushing a " +
      "new index, pop from the back everything with a value no larger — those " +
      "can never be the maximum again, because the newcomer is bigger and " +
      "outlives them. Then drop the front if it has fallen out of the window. " +
      "Each index enters and leaves once, so the whole sweep is O(n) despite the " +
      "nested loop.",
    constraints: [
      "The list holds between 1 and 100,000 integers.",
      "The window size is between 1 and the length of the list.",
      "The answer has exactly length - window + 1 entries.",
    ],
    hints: [
      "Between two positions the window loses one value and gains one — reuse the rest.",
      "Keep indices whose values decrease, so the front is always the maximum.",
      "A new value larger than the back makes those entries permanently useless.",
    ],
    estimatedTime: "35 min",
    timeLimitMs: 5000,
    signature: {
      name: "windowMaximums",
      params: [
        { name: "values", type: "int[]" },
        { name: "window", type: "int" },
      ],
      returns: "int[]",
    },
    topicSlugs: ["dsa-queue-deque", "dsa-sliding-window", "js-arrays"],
    examples: [
      {
        input: "values = [1, 3, -1, -3, 5, 3, 6, 7], window = 3",
        output: "[3, 3, 5, 5, 6, 7]",
        explanation:
          "The first window [1,3,-1] peaks at 3; the last, [3,6,7], peaks at 7.",
      },
      {
        input: "values = [4, 2, 9], window = 1",
        output: "[4, 2, 9]",
        explanation: "A window of one always reports the value it sits on.",
      },
    ],
    tests: [
      { args: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expected: [3, 3, 5, 5, 6, 7] },
      { args: [[4, 2, 9], 1], expected: [4, 2, 9] },
      { args: [[7, 2, 4], 2], expected: [7, 4] },
      { args: [[5], 1], expected: [5], hidden: true },
      { args: [[1, 2, 3, 4], 4], expected: [4], hidden: true },
      { args: [[9, 8, 7, 6], 2], expected: [9, 8, 7], hidden: true },
      {
        args: [[-7, -8, -1, -3, -5], 3],
        expected: [-1, -1, -1],
        hidden: true,
      },
      { args: [[2, 2, 2, 2], 2], expected: [2, 2, 2], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const answers = [];
const indices = [];
let head = 0;
for (let i = 0; i < values.length; i += 1) {
  while (indices.length > head && values[indices[indices.length - 1]] <= values[i]) {
    indices.pop();
  }
  indices.push(i);
  if (indices[head] <= i - window) head += 1;
  if (i >= window - 1) answers.push(values[indices[head]]);
}
return answers;`,
      TYPESCRIPT: `const answers: number[] = [];
const indices: number[] = [];
let head = 0;
for (let i = 0; i < values.length; i += 1) {
  while (indices.length > head && values[indices[indices.length - 1]] <= values[i]) {
    indices.pop();
  }
  indices.push(i);
  if (indices[head] <= i - window) head += 1;
  if (i >= window - 1) answers.push(values[indices[head]]);
}
return answers;`,
      PYTHON: `from collections import deque

answers = []
indices = deque()
for i, value in enumerate(values):
    while indices and values[indices[-1]] <= value:
        indices.pop()
    indices.append(i)
    if indices[0] <= i - window:
        indices.popleft()
    if i >= window - 1:
        answers.append(values[indices[0]])
return answers`,
      JAVA: `int[] answers = new int[values.length - window + 1];
Deque<Integer> indices = new ArrayDeque<>();
int written = 0;
for (int i = 0; i < values.length; i += 1) {
    while (!indices.isEmpty() && values[indices.peekLast()] <= values[i]) {
        indices.pollLast();
    }
    indices.addLast(i);
    if (indices.peekFirst() <= i - window) indices.pollFirst();
    if (i >= window - 1) answers[written++] = values[indices.peekFirst()];
}
return answers;`,
      CPP: `vector<int> answers;
deque<int> indices;
for (int i = 0; i < (int)values.size(); i += 1) {
    while (!indices.empty() && values[indices.back()] <= values[i]) {
        indices.pop_back();
    }
    indices.push_back(i);
    if (indices.front() <= i - window) indices.pop_front();
    if (i >= window - 1) answers.push_back(values[indices.front()]);
}
return answers;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "longest-run-within-spread",
    title: "Longest Run Within a Spread",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Find the length of the longest contiguous stretch of the list in which " +
      "the largest and smallest values differ by no more than the given limit. A " +
      "single value always qualifies, since its spread is zero.",
    explanation:
      "A sliding window is the right shape — a stretch that satisfies the limit " +
      "stays satisfying it when you shrink it — but the window has to know both " +
      "its maximum and its minimum, and neither can be recomputed per step " +
      "without going quadratic. Run two deques side by side: one decreasing, " +
      "whose front is the window's maximum, and one increasing, whose front is " +
      "its minimum. Extend the window on the right, and while the two fronts " +
      "differ by more than the limit, advance the left edge, dropping either " +
      "front once it falls outside. Every index joins and leaves each deque at " +
      "most once, so this is O(n) with two copies of the previous problem's " +
      "machinery.",
    constraints: [
      "The list holds between 1 and 100,000 integers.",
      "Values are between 1 and 1,000,000,000.",
      "The limit is between 0 and 1,000,000,000.",
    ],
    hints: [
      "Shrinking a valid stretch keeps it valid, which is what makes a window legal here.",
      "The window needs its maximum and its minimum at once.",
      "Two deques: one decreasing for the maximum, one increasing for the minimum.",
    ],
    estimatedTime: "40 min",
    timeLimitMs: 5000,
    signature: {
      name: "longestRunWithinSpread",
      params: [
        { name: "values", type: "int[]" },
        { name: "limit", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-queue-deque", "dsa-sliding-window", "js-arrays"],
    examples: [
      {
        input: "values = [8, 2, 4, 7], limit = 4",
        output: "2",
        explanation:
          "[2,4] has spread 2. Adding the 7 pushes the spread to 5, which is too wide.",
      },
      {
        input: "values = [10, 1, 2, 4, 7, 2], limit = 5",
        output: "4",
        explanation: "[2,4,7,2] spans 5 exactly, which is allowed.",
      },
    ],
    tests: [
      { args: [[8, 2, 4, 7], 4], expected: 2 },
      { args: [[10, 1, 2, 4, 7, 2], 5], expected: 4 },
      { args: [[4, 2, 2, 2, 4, 4, 2, 2], 0], expected: 3 },
      { args: [[1], 0], expected: 1, hidden: true },
      { args: [[5, 5, 5, 5], 0], expected: 4, hidden: true },
      { args: [[1, 5, 9], 100], expected: 3, hidden: true },
      { args: [[9, 1, 9, 1, 9], 0], expected: 1, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const highs = [];
const lows = [];
let highHead = 0;
let lowHead = 0;
let left = 0;
let best = 0;
for (let right = 0; right < values.length; right += 1) {
  while (highs.length > highHead && values[highs[highs.length - 1]] <= values[right]) highs.pop();
  highs.push(right);
  while (lows.length > lowHead && values[lows[lows.length - 1]] >= values[right]) lows.pop();
  lows.push(right);

  while (values[highs[highHead]] - values[lows[lowHead]] > limit) {
    if (highs[highHead] === left) highHead += 1;
    if (lows[lowHead] === left) lowHead += 1;
    left += 1;
  }
  if (right - left + 1 > best) best = right - left + 1;
}
return best;`,
      TYPESCRIPT: `const highs: number[] = [];
const lows: number[] = [];
let highHead = 0;
let lowHead = 0;
let left = 0;
let best = 0;
for (let right = 0; right < values.length; right += 1) {
  while (highs.length > highHead && values[highs[highs.length - 1]] <= values[right]) highs.pop();
  highs.push(right);
  while (lows.length > lowHead && values[lows[lows.length - 1]] >= values[right]) lows.pop();
  lows.push(right);

  while (values[highs[highHead]] - values[lows[lowHead]] > limit) {
    if (highs[highHead] === left) highHead += 1;
    if (lows[lowHead] === left) lowHead += 1;
    left += 1;
  }
  if (right - left + 1 > best) best = right - left + 1;
}
return best;`,
      PYTHON: `from collections import deque

highs = deque()
lows = deque()
left = 0
best = 0
for right, value in enumerate(values):
    while highs and values[highs[-1]] <= value:
        highs.pop()
    highs.append(right)
    while lows and values[lows[-1]] >= value:
        lows.pop()
    lows.append(right)

    while values[highs[0]] - values[lows[0]] > limit:
        if highs[0] == left:
            highs.popleft()
        if lows[0] == left:
            lows.popleft()
        left += 1
    best = max(best, right - left + 1)
return best`,
      JAVA: `Deque<Integer> highs = new ArrayDeque<>();
Deque<Integer> lows = new ArrayDeque<>();
int left = 0;
int best = 0;
for (int right = 0; right < values.length; right += 1) {
    while (!highs.isEmpty() && values[highs.peekLast()] <= values[right]) highs.pollLast();
    highs.addLast(right);
    while (!lows.isEmpty() && values[lows.peekLast()] >= values[right]) lows.pollLast();
    lows.addLast(right);

    while (values[highs.peekFirst()] - values[lows.peekFirst()] > limit) {
        if (highs.peekFirst() == left) highs.pollFirst();
        if (lows.peekFirst() == left) lows.pollFirst();
        left += 1;
    }
    best = Math.max(best, right - left + 1);
}
return best;`,
      CPP: `deque<int> highs, lows;
int left = 0;
int best = 0;
for (int right = 0; right < (int)values.size(); right += 1) {
    while (!highs.empty() && values[highs.back()] <= values[right]) highs.pop_back();
    highs.push_back(right);
    while (!lows.empty() && values[lows.back()] >= values[right]) lows.pop_back();
    lows.push_back(right);

    while (values[highs.front()] - values[lows.front()] > limit) {
        if (highs.front() == left) highs.pop_front();
        if (lows.front() == left) lows.pop_front();
        left += 1;
    }
    best = max(best, right - left + 1);
}
return best;`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "shortest-run-reaching-target",
    title: "Shortest Run Reaching a Target",
    difficulty: "HARD",
    interviewFrequency: "HIGH",
    description:
      "Find the length of the shortest non-empty contiguous stretch of the list " +
      "whose values add up to at least the target. Values may be negative. " +
      "Return -1 if no stretch reaches the target.",
    explanation:
      "Negative values break the ordinary sliding window: a longer stretch is no " +
      "longer guaranteed to have a bigger sum, so shrinking from the left is " +
      "unsound. Work on prefix sums instead. With totals P[0..n], a stretch from " +
      "i to j-1 reaches the target when P[j] - P[i] >= target, so for each j you " +
      "want the largest i below j with a small enough P[i]. Keep a deque of " +
      "candidate indices whose prefix sums increase. Two pops maintain it: from " +
      "the front, while P[j] - P[front] >= target — that candidate has just been " +
      "used and can only give longer answers later — and from the back, while " +
      "P[back] >= P[j], because a later index with a smaller total beats an " +
      "earlier one with a bigger one on both counts. O(n), and every index is " +
      "touched twice.",
    constraints: [
      "The list holds between 1 and 100,000 integers.",
      "Values are between -100,000 and 100,000.",
      "The target is between 1 and 1,000,000,000.",
    ],
    hints: [
      "Negative values make the plain two-pointer window wrong — reach for prefix sums.",
      "For each end j you want the latest start whose prefix sum is small enough.",
      "Discard a candidate once it is used, and discard any candidate a later, smaller one beats.",
    ],
    estimatedTime: "50 min",
    timeLimitMs: 5000,
    signature: {
      name: "shortestRunReachingTarget",
      params: [
        { name: "values", type: "int[]" },
        { name: "target", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-queue-deque", "dsa-prefix-sum", "js-arrays"],
    examples: [
      {
        input: "values = [2, -1, 2], target = 3",
        output: "3",
        explanation:
          "No shorter stretch reaches 3, but the whole list sums to exactly 3.",
      },
      {
        input: "values = [1, 2], target = 4",
        output: "-1",
        explanation: "Even the whole list only reaches 3.",
      },
    ],
    tests: [
      { args: [[2, -1, 2], 3], expected: 3 },
      { args: [[1, 2], 4], expected: -1 },
      { args: [[1], 1], expected: 1 },
      { args: [[84, -37, 32, 40, 95], 167], expected: 3 },
      { args: [[5], 6], expected: -1, hidden: true },
      { args: [[1, 1, 1, 1, 10], 10], expected: 1, hidden: true },
      { args: [[-1, -2, -3], 1], expected: -1, hidden: true },
      { args: [[3, -2, 5], 6], expected: 3, hidden: true },
      { args: [[10, -5, 10], 15], expected: 3, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const n = values.length;
const prefix = new Array(n + 1).fill(0);
for (let i = 0; i < n; i += 1) prefix[i + 1] = prefix[i] + values[i];

const candidates = [];
let head = 0;
let best = n + 1;
for (let j = 0; j <= n; j += 1) {
  while (candidates.length > head && prefix[j] - prefix[candidates[head]] >= target) {
    if (j - candidates[head] < best) best = j - candidates[head];
    head += 1;
  }
  while (candidates.length > head && prefix[candidates[candidates.length - 1]] >= prefix[j]) {
    candidates.pop();
  }
  candidates.push(j);
}
return best === n + 1 ? -1 : best;`,
      TYPESCRIPT: `const n = values.length;
const prefix: number[] = new Array(n + 1).fill(0);
for (let i = 0; i < n; i += 1) prefix[i + 1] = prefix[i] + values[i];

const candidates: number[] = [];
let head = 0;
let best = n + 1;
for (let j = 0; j <= n; j += 1) {
  while (candidates.length > head && prefix[j] - prefix[candidates[head]] >= target) {
    if (j - candidates[head] < best) best = j - candidates[head];
    head += 1;
  }
  while (candidates.length > head && prefix[candidates[candidates.length - 1]] >= prefix[j]) {
    candidates.pop();
  }
  candidates.push(j);
}
return best === n + 1 ? -1 : best;`,
      PYTHON: `from collections import deque

n = len(values)
prefix = [0] * (n + 1)
for i, value in enumerate(values):
    prefix[i + 1] = prefix[i] + value

candidates = deque()
best = n + 1
for j in range(n + 1):
    while candidates and prefix[j] - prefix[candidates[0]] >= target:
        best = min(best, j - candidates.popleft())
    while candidates and prefix[candidates[-1]] >= prefix[j]:
        candidates.pop()
    candidates.append(j)
return -1 if best == n + 1 else best`,
      JAVA: `int n = values.length;
long[] prefix = new long[n + 1];
for (int i = 0; i < n; i += 1) prefix[i + 1] = prefix[i] + values[i];

Deque<Integer> candidates = new ArrayDeque<>();
int best = n + 1;
for (int j = 0; j <= n; j += 1) {
    while (!candidates.isEmpty() && prefix[j] - prefix[candidates.peekFirst()] >= target) {
        best = Math.min(best, j - candidates.pollFirst());
    }
    while (!candidates.isEmpty() && prefix[candidates.peekLast()] >= prefix[j]) {
        candidates.pollLast();
    }
    candidates.addLast(j);
}
return best == n + 1 ? -1 : best;`,
      CPP: `int n = (int)values.size();
vector<long long> prefix(n + 1, 0);
for (int i = 0; i < n; i += 1) prefix[i + 1] = prefix[i] + values[i];

deque<int> candidates;
int best = n + 1;
for (int j = 0; j <= n; j += 1) {
    while (!candidates.empty() && prefix[j] - prefix[candidates.front()] >= target) {
        best = min(best, j - candidates.front());
        candidates.pop_front();
    }
    while (!candidates.empty() && prefix[candidates.back()] >= prefix[j]) {
        candidates.pop_back();
    }
    candidates.push_back(j);
}
return best == n + 1 ? -1 : best;`,
    },
  },
];
