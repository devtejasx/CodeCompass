import type { SeedProblem } from "../../problems/types";

/**
 * Monotonic stacks.
 *
 * One idea, six disguises. A plain stack remembers what you saw most recently;
 * a monotonic stack additionally refuses to hold anything that has already been
 * beaten, and that refusal is what collapses an O(n²) scan into O(n). Every
 * problem here is secretly "for each element, find the nearest element on one
 * side that is bigger (or smaller)" — the skill is recognising that sentence
 * inside a question about temperatures, stock prices or rectangles.
 *
 * The file is ordered by how well hidden the pattern is. The first problem
 * states it outright. The last two ask for an area and a sum, and only give up
 * the pattern once you ask *which element stopped this one from extending*.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const MONOTONIC_STACK_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "next-greater-to-the-right",
    title: "Next Greater to the Right",
    difficulty: "EASY",
    interviewFrequency: "VERY_HIGH",
    description:
      "For every number in the list, find the first number after it that is " +
      "strictly larger. Return those answers in a list of the same length, " +
      "using -1 wherever no larger number follows. The last entry is therefore " +
      "always -1.",
    explanation:
      "Comparing every pair costs O(n²), and almost all of that work is wasted: " +
      "once a number has been answered it never needs looking at again. Keep a " +
      "stack of indices whose answer is still unknown, and keep it decreasing. " +
      "When a new number arrives, every index on top of the stack holding a " +
      "smaller value has just found its answer — pop them and record it. Then " +
      "push the new index, which is now the one waiting. Each index is pushed " +
      "once and popped once, so the whole scan is O(n) even though the inner " +
      "loop looks nested.",
    constraints: [
      "The list holds between 1 and 100,000 integers.",
      "Values fit in a 32-bit signed integer and may be negative.",
      '"Larger" means strictly larger, so equal values do not answer each other.',
    ],
    hints: [
      "You never need to compare two numbers that are both already answered.",
      "Hold the indices still waiting for an answer, largest value at the bottom.",
      "A new number answers every waiting index smaller than it, in one go.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "nextGreaterToTheRight",
      params: [{ name: "values", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-monotonic-stack", "dsa-stack", "js-arrays"],
    examples: [
      {
        input: "values = [2, 1, 3, 1]",
        output: "[3, 3, -1, -1]",
        explanation:
          "2 and 1 are both answered by the 3. The 3 has nothing larger after it, and neither does the final 1.",
      },
      {
        input: "values = [5, 4, 3]",
        output: "[-1, -1, -1]",
        explanation: "The list only falls, so nothing ever finds something larger.",
      },
    ],
    tests: [
      { args: [[2, 1, 3, 1]], expected: [3, 3, -1, -1] },
      { args: [[5, 4, 3]], expected: [-1, -1, -1] },
      { args: [[1, 2, 3]], expected: [2, 3, -1] },
      { args: [[7]], expected: [-1], hidden: true },
      { args: [[2, 2, 2]], expected: [-1, -1, -1], hidden: true },
      { args: [[-5, -2, -9, -1]], expected: [-2, -1, -1, -1], hidden: true },
      {
        args: [[1, 3, 2, 4, 2, 5]],
        expected: [3, 4, 4, 5, 5, -1],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const answers = new Array(values.length).fill(-1);
const waiting = [];
for (let i = 0; i < values.length; i += 1) {
  while (waiting.length > 0 && values[waiting[waiting.length - 1]] < values[i]) {
    answers[waiting.pop()] = values[i];
  }
  waiting.push(i);
}
return answers;`,
      TYPESCRIPT: `const answers: number[] = new Array(values.length).fill(-1);
const waiting: number[] = [];
for (let i = 0; i < values.length; i += 1) {
  while (waiting.length > 0 && values[waiting[waiting.length - 1]] < values[i]) {
    answers[waiting.pop() as number] = values[i];
  }
  waiting.push(i);
}
return answers;`,
      PYTHON: `answers = [-1] * len(values)
waiting = []
for i, value in enumerate(values):
    while waiting and values[waiting[-1]] < value:
        answers[waiting.pop()] = value
    waiting.append(i)
return answers`,
      JAVA: `int[] answers = new int[values.length];
Arrays.fill(answers, -1);
Deque<Integer> waiting = new ArrayDeque<>();
for (int i = 0; i < values.length; i += 1) {
    while (!waiting.isEmpty() && values[waiting.peek()] < values[i]) {
        answers[waiting.pop()] = values[i];
    }
    waiting.push(i);
}
return answers;`,
      CPP: `vector<int> answers(values.size(), -1);
vector<int> waiting;
for (int i = 0; i < (int)values.size(); i += 1) {
    while (!waiting.empty() && values[waiting.back()] < values[i]) {
        answers[waiting.back()] = values[i];
        waiting.pop_back();
    }
    waiting.push_back(i);
}
return answers;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "days-until-warmer",
    title: "Days Until It Gets Warmer",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Given a run of daily temperatures, report for each day how many days you " +
      "have to wait before a warmer one arrives. If no later day is warmer, the " +
      "answer for that day is 0.",
    explanation:
      "This is the previous problem wearing a calendar. The difference is that " +
      "the answer is a distance rather than a value, which is exactly why the " +
      "stack should hold indices and not temperatures: when day j finally " +
      "resolves day i, the answer is j - i, and you can only compute that if " +
      "you kept i. Keep the stack decreasing in temperature. Each day pops " +
      "every colder day still waiting, writes its gap, then joins the queue of " +
      "the unresolved. Days never warmed keep the 0 they started with, so no " +
      "special case is needed at the end.",
    constraints: [
      "Between 1 and 100,000 daily readings.",
      "Each reading is between -100 and 100 degrees.",
      "A day is only resolved by a strictly warmer day.",
    ],
    hints: [
      "The answer is a gap between two days, so remember days, not temperatures.",
      "Keep the unresolved days on a stack, warmest at the bottom.",
      "Start every answer at 0 and you never need to handle 'never warms up'.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "daysUntilWarmer",
      params: [{ name: "temperatures", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-monotonic-stack", "dsa-stack", "js-arrays"],
    examples: [
      {
        input: "temperatures = [30, 40, 50, 30, 40]",
        output: "[1, 1, 0, 1, 0]",
        explanation:
          "Day 0 waits one day for 40. Day 2's 50 is never beaten, so it reports 0.",
      },
      {
        input: "temperatures = [50, 40, 30]",
        output: "[0, 0, 0]",
        explanation: "It only gets colder, so nobody ever waits successfully.",
      },
    ],
    tests: [
      { args: [[30, 40, 50, 30, 40]], expected: [1, 1, 0, 1, 0] },
      { args: [[50, 40, 30]], expected: [0, 0, 0] },
      { args: [[30, 60, 90]], expected: [1, 1, 0] },
      { args: [[25]], expected: [0], hidden: true },
      { args: [[40, 40, 40]], expected: [0, 0, 0], hidden: true },
      {
        args: [[73, 74, 75, 71, 69, 72, 76, 73]],
        expected: [1, 1, 4, 2, 1, 1, 0, 0],
        hidden: true,
      },
      {
        args: [[-5, -10, -3, -20, 0]],
        expected: [2, 1, 2, 1, 0],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const answers = new Array(temperatures.length).fill(0);
const waiting = [];
for (let day = 0; day < temperatures.length; day += 1) {
  while (
    waiting.length > 0 &&
    temperatures[waiting[waiting.length - 1]] < temperatures[day]
  ) {
    const earlier = waiting.pop();
    answers[earlier] = day - earlier;
  }
  waiting.push(day);
}
return answers;`,
      TYPESCRIPT: `const answers: number[] = new Array(temperatures.length).fill(0);
const waiting: number[] = [];
for (let day = 0; day < temperatures.length; day += 1) {
  while (
    waiting.length > 0 &&
    temperatures[waiting[waiting.length - 1]] < temperatures[day]
  ) {
    const earlier = waiting.pop() as number;
    answers[earlier] = day - earlier;
  }
  waiting.push(day);
}
return answers;`,
      PYTHON: `answers = [0] * len(temperatures)
waiting = []
for day, reading in enumerate(temperatures):
    while waiting and temperatures[waiting[-1]] < reading:
        earlier = waiting.pop()
        answers[earlier] = day - earlier
    waiting.append(day)
return answers`,
      JAVA: `int[] answers = new int[temperatures.length];
Deque<Integer> waiting = new ArrayDeque<>();
for (int day = 0; day < temperatures.length; day += 1) {
    while (!waiting.isEmpty() && temperatures[waiting.peek()] < temperatures[day]) {
        int earlier = waiting.pop();
        answers[earlier] = day - earlier;
    }
    waiting.push(day);
}
return answers;`,
      CPP: `vector<int> answers(temperatures.size(), 0);
vector<int> waiting;
for (int day = 0; day < (int)temperatures.size(); day += 1) {
    while (!waiting.empty() && temperatures[waiting.back()] < temperatures[day]) {
        int earlier = waiting.back();
        waiting.pop_back();
        answers[earlier] = day - earlier;
    }
    waiting.push_back(day);
}
return answers;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "next-greater-circular",
    title: "Next Greater, Going Around",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "The list is circular: after the last entry comes the first again. For " +
      "each number find the first strictly larger number you meet walking " +
      "forwards, wrapping around at most once. Use -1 when the whole circle " +
      "holds nothing larger.",
    explanation:
      "Wrapping sounds like it needs different code, but it only needs a longer " +
      "walk. Scan the indices 0 to 2n-1 and read position i % n, which is the " +
      "list traversed twice — enough for every element to see the entire circle " +
      "once. The stack logic is unchanged. The one rule that keeps it correct " +
      "is to stop pushing during the second lap: indices from the first lap can " +
      "still be answered, but an index has no business waiting twice. Only the " +
      "single largest value, or a tie for it, ends with -1.",
    constraints: [
      "The list holds between 1 and 100,000 integers.",
      "You may wrap past the end at most once.",
      "Equal values never answer one another.",
    ],
    hints: [
      "Walking the list twice is the same as walking it once in a circle.",
      "Use i % n to read, and let the loop run to 2n - 1.",
      "During the second lap, resolve waiting indices but do not add new ones.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "nextGreaterCircular",
      params: [{ name: "values", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-monotonic-stack", "dsa-stack", "js-arrays"],
    examples: [
      {
        input: "values = [3, 2, 4]",
        output: "[4, 4, -1]",
        explanation: "The 4 answers both earlier numbers; nothing beats the 4 itself.",
      },
      {
        input: "values = [5, 4, 6, 1]",
        output: "[6, 6, -1, 5]",
        explanation: "The final 1 wraps around and meets the 5 at the front.",
      },
    ],
    tests: [
      { args: [[3, 2, 4]], expected: [4, 4, -1] },
      { args: [[5, 4, 6, 1]], expected: [6, 6, -1, 5] },
      { args: [[1, 2, 1]], expected: [2, -1, 2] },
      { args: [[9]], expected: [-1], hidden: true },
      { args: [[2, 2]], expected: [-1, -1], hidden: true },
      { args: [[4, 3, 2, 1]], expected: [-1, 4, 4, 4], hidden: true },
      {
        args: [[-1, -3, -2, -5]],
        expected: [-1, -2, -1, -1],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const n = values.length;
const answers = new Array(n).fill(-1);
const waiting = [];
for (let step = 0; step < 2 * n; step += 1) {
  const i = step % n;
  while (waiting.length > 0 && values[waiting[waiting.length - 1]] < values[i]) {
    answers[waiting.pop()] = values[i];
  }
  if (step < n) waiting.push(i);
}
return answers;`,
      TYPESCRIPT: `const n = values.length;
const answers: number[] = new Array(n).fill(-1);
const waiting: number[] = [];
for (let step = 0; step < 2 * n; step += 1) {
  const i = step % n;
  while (waiting.length > 0 && values[waiting[waiting.length - 1]] < values[i]) {
    answers[waiting.pop() as number] = values[i];
  }
  if (step < n) waiting.push(i);
}
return answers;`,
      PYTHON: `n = len(values)
answers = [-1] * n
waiting = []
for step in range(2 * n):
    i = step % n
    while waiting and values[waiting[-1]] < values[i]:
        answers[waiting.pop()] = values[i]
    if step < n:
        waiting.append(i)
return answers`,
      JAVA: `int n = values.length;
int[] answers = new int[n];
Arrays.fill(answers, -1);
Deque<Integer> waiting = new ArrayDeque<>();
for (int step = 0; step < 2 * n; step += 1) {
    int i = step % n;
    while (!waiting.isEmpty() && values[waiting.peek()] < values[i]) {
        answers[waiting.pop()] = values[i];
    }
    if (step < n) waiting.push(i);
}
return answers;`,
      CPP: `int n = (int)values.size();
vector<int> answers(n, -1);
vector<int> waiting;
for (int step = 0; step < 2 * n; step += 1) {
    int i = step % n;
    while (!waiting.empty() && values[waiting.back()] < values[i]) {
        answers[waiting.back()] = values[i];
        waiting.pop_back();
    }
    if (step < n) waiting.push_back(i);
}
return answers;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "price-run-lengths",
    title: "How Long This Price Has Led",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "For each day's price, count how many consecutive days ending today had a " +
      "price less than or equal to today's — today included. A price that beats " +
      "everything before it scores the whole history so far; a price lower than " +
      "yesterday's scores 1.",
    explanation:
      "The naive walk backwards is O(n²) on a rising run. The insight is that " +
      "once you find the nearest earlier day with a strictly greater price, the " +
      "answer is simply the distance to it — everything in between was already " +
      "shown to be no greater. So this is 'previous greater element' with the " +
      "index turned into a length. Keep a stack of indices decreasing in price, " +
      "pop everything today matches or beats, and whatever is left on top is " +
      "the day that blocks you. If the stack empties, nothing has ever beaten " +
      "today and the answer is the day number plus one.",
    constraints: [
      "Between 1 and 100,000 prices.",
      "Each price is between 1 and 100,000.",
      "The count includes today, so it is never below 1.",
    ],
    hints: [
      "The answer is the gap back to the nearest strictly greater earlier price.",
      "Pop while the stack's top price is less than or equal to today's.",
      "An empty stack means today leads the whole history so far.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "priceRunLengths",
      params: [{ name: "prices", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-monotonic-stack", "dsa-stack", "js-arrays"],
    examples: [
      {
        input: "prices = [100, 80, 60, 70, 60, 75]",
        output: "[1, 1, 1, 2, 1, 4]",
        explanation:
          "The final 75 covers 60, 70 and 60 as well as itself, stopping at the 80.",
      },
      {
        input: "prices = [1, 2, 3]",
        output: "[1, 2, 3]",
        explanation: "Each price leads everything before it, so the run keeps growing.",
      },
    ],
    tests: [
      { args: [[100, 80, 60, 70, 60, 75]], expected: [1, 1, 1, 2, 1, 4] },
      { args: [[1, 2, 3]], expected: [1, 2, 3] },
      { args: [[3, 2, 1]], expected: [1, 1, 1] },
      { args: [[5]], expected: [1], hidden: true },
      { args: [[4, 4, 4, 4]], expected: [1, 2, 3, 4], hidden: true },
      {
        args: [[10, 4, 5, 90, 120, 80]],
        expected: [1, 1, 2, 4, 5, 1],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const answers = new Array(prices.length).fill(0);
const higher = [];
for (let day = 0; day < prices.length; day += 1) {
  while (higher.length > 0 && prices[higher[higher.length - 1]] <= prices[day]) {
    higher.pop();
  }
  answers[day] = higher.length === 0 ? day + 1 : day - higher[higher.length - 1];
  higher.push(day);
}
return answers;`,
      TYPESCRIPT: `const answers: number[] = new Array(prices.length).fill(0);
const higher: number[] = [];
for (let day = 0; day < prices.length; day += 1) {
  while (higher.length > 0 && prices[higher[higher.length - 1]] <= prices[day]) {
    higher.pop();
  }
  answers[day] = higher.length === 0 ? day + 1 : day - higher[higher.length - 1];
  higher.push(day);
}
return answers;`,
      PYTHON: `answers = [0] * len(prices)
higher = []
for day, price in enumerate(prices):
    while higher and prices[higher[-1]] <= price:
        higher.pop()
    answers[day] = day + 1 if not higher else day - higher[-1]
    higher.append(day)
return answers`,
      JAVA: `int[] answers = new int[prices.length];
Deque<Integer> higher = new ArrayDeque<>();
for (int day = 0; day < prices.length; day += 1) {
    while (!higher.isEmpty() && prices[higher.peek()] <= prices[day]) {
        higher.pop();
    }
    answers[day] = higher.isEmpty() ? day + 1 : day - higher.peek();
    higher.push(day);
}
return answers;`,
      CPP: `vector<int> answers(prices.size(), 0);
vector<int> higher;
for (int day = 0; day < (int)prices.size(); day += 1) {
    while (!higher.empty() && prices[higher.back()] <= prices[day]) {
        higher.pop_back();
    }
    answers[day] = higher.empty() ? day + 1 : day - higher.back();
    higher.push_back(day);
}
return answers;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "sum-of-window-minimums",
    title: "Total of Every Block's Smallest",
    difficulty: "HARD",
    interviewFrequency: "HIGH",
    description:
      "Consider every contiguous block of the list — there are n(n+1)/2 of them. " +
      "Take the smallest value in each block and add all those minimums " +
      "together. Return the total modulo 1,000,000,007.",
    explanation:
      "Enumerating blocks is O(n²) and hopeless at the stated size, so turn the " +
      "question inside out: instead of asking each block for its minimum, ask " +
      "each element how many blocks it is the minimum of. An element at index i " +
      "rules every block that starts after the nearest strictly smaller element " +
      "on its left and ends before the nearest smaller-or-equal element on its " +
      "right. If those boundaries sit at distances L and R, the element " +
      "contributes value × L × R. The strict-on-one-side, non-strict-on-the-other " +
      "asymmetry is what stops equal values double-counting the same block. Both " +
      "boundary arrays come from one monotonic stack pass each, so the whole " +
      "thing is O(n).",
    constraints: [
      "The list holds between 1 and 30,000 integers.",
      "Each value is between 1 and 30,000.",
      "Return the total modulo 1,000,000,007.",
    ],
    hints: [
      "Do not enumerate blocks. Count the blocks each element is smallest in.",
      "You need the nearest smaller element on each side, by index.",
      "Break ties strictly on one side only, or equal values claim the same block twice.",
    ],
    estimatedTime: "45 min",
    timeLimitMs: 5000,
    signature: {
      name: "sumOfWindowMinimums",
      params: [{ name: "values", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-monotonic-stack", "dsa-stack", "js-arrays"],
    examples: [
      {
        input: "values = [3, 1, 2]",
        output: "9",
        explanation:
          "Blocks [3],[1],[2],[3,1],[1,2],[3,1,2] have minimums 3,1,2,1,1,1 — a total of 9.",
      },
      {
        input: "values = [2, 2]",
        output: "6",
        explanation: "Minimums are 2, 2 and 2, so the total is 6.",
      },
    ],
    tests: [
      { args: [[3, 1, 2]], expected: 9 },
      { args: [[2, 2]], expected: 6 },
      { args: [[1]], expected: 1 },
      { args: [[3, 1, 2, 4]], expected: 17 },
      { args: [[5]], expected: 5, hidden: true },
      { args: [[1, 2, 3, 4]], expected: 20, hidden: true },
      { args: [[4, 3, 2, 1]], expected: 20, hidden: true },
      { args: [[2, 2, 2]], expected: 12, hidden: true },
      { args: [[11, 81, 94, 43, 3]], expected: 444, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const MOD = 1000000007n;
const n = values.length;
const left = new Array(n).fill(0);
const right = new Array(n).fill(0);
let stack = [];

for (let i = 0; i < n; i += 1) {
  while (stack.length > 0 && values[stack[stack.length - 1]] >= values[i]) stack.pop();
  left[i] = stack.length === 0 ? i + 1 : i - stack[stack.length - 1];
  stack.push(i);
}

stack = [];
for (let i = n - 1; i >= 0; i -= 1) {
  while (stack.length > 0 && values[stack[stack.length - 1]] > values[i]) stack.pop();
  right[i] = stack.length === 0 ? n - i : stack[stack.length - 1] - i;
  stack.push(i);
}

let total = 0n;
for (let i = 0; i < n; i += 1) {
  total = (total + BigInt(values[i]) * BigInt(left[i]) * BigInt(right[i])) % MOD;
}
return Number(total);`,
      TYPESCRIPT: `const MOD = 1000000007n;
const n = values.length;
const left: number[] = new Array(n).fill(0);
const right: number[] = new Array(n).fill(0);
let stack: number[] = [];

for (let i = 0; i < n; i += 1) {
  while (stack.length > 0 && values[stack[stack.length - 1]] >= values[i]) stack.pop();
  left[i] = stack.length === 0 ? i + 1 : i - stack[stack.length - 1];
  stack.push(i);
}

stack = [];
for (let i = n - 1; i >= 0; i -= 1) {
  while (stack.length > 0 && values[stack[stack.length - 1]] > values[i]) stack.pop();
  right[i] = stack.length === 0 ? n - i : stack[stack.length - 1] - i;
  stack.push(i);
}

let total = 0n;
for (let i = 0; i < n; i += 1) {
  total = (total + BigInt(values[i]) * BigInt(left[i]) * BigInt(right[i])) % MOD;
}
return Number(total);`,
      PYTHON: `MOD = 1000000007
n = len(values)
left = [0] * n
right = [0] * n

stack = []
for i in range(n):
    while stack and values[stack[-1]] >= values[i]:
        stack.pop()
    left[i] = i + 1 if not stack else i - stack[-1]
    stack.append(i)

stack = []
for i in range(n - 1, -1, -1):
    while stack and values[stack[-1]] > values[i]:
        stack.pop()
    right[i] = n - i if not stack else stack[-1] - i
    stack.append(i)

total = 0
for i in range(n):
    total = (total + values[i] * left[i] * right[i]) % MOD
return total`,
      JAVA: `final long MOD = 1000000007L;
int n = values.length;
int[] left = new int[n];
int[] right = new int[n];
Deque<Integer> stack = new ArrayDeque<>();

for (int i = 0; i < n; i += 1) {
    while (!stack.isEmpty() && values[stack.peek()] >= values[i]) stack.pop();
    left[i] = stack.isEmpty() ? i + 1 : i - stack.peek();
    stack.push(i);
}

stack.clear();
for (int i = n - 1; i >= 0; i -= 1) {
    while (!stack.isEmpty() && values[stack.peek()] > values[i]) stack.pop();
    right[i] = stack.isEmpty() ? n - i : stack.peek() - i;
    stack.push(i);
}

long total = 0;
for (int i = 0; i < n; i += 1) {
    total = (total + (long) values[i] * left[i] % MOD * right[i]) % MOD;
}
return (int) total;`,
      CPP: `const long long MOD = 1000000007LL;
int n = (int)values.size();
vector<int> leftSpan(n, 0), rightSpan(n, 0);
vector<int> pending;

for (int i = 0; i < n; i += 1) {
    while (!pending.empty() && values[pending.back()] >= values[i]) pending.pop_back();
    leftSpan[i] = pending.empty() ? i + 1 : i - pending.back();
    pending.push_back(i);
}

pending.clear();
for (int i = n - 1; i >= 0; i -= 1) {
    while (!pending.empty() && values[pending.back()] > values[i]) pending.pop_back();
    rightSpan[i] = pending.empty() ? n - i : pending.back() - i;
    pending.push_back(i);
}

long long total = 0;
for (int i = 0; i < n; i += 1) {
    total = (total + (long long)values[i] * leftSpan[i] % MOD * rightSpan[i]) % MOD;
}
return (int)total;`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "largest-rectangle-in-skyline",
    title: "Largest Rectangle in a Skyline",
    difficulty: "HARD",
    interviewFrequency: "HIGH",
    description:
      "A row of bars stands side by side, each one unit wide and given by its " +
      "height. Find the area of the largest rectangle that fits entirely inside " +
      "the outline they form. The rectangle may span several bars, but its " +
      "height is then limited by the shortest bar it covers.",
    explanation:
      "Every candidate rectangle is capped by some bar — the shortest one it " +
      "spans — so it is enough to ask, for each bar, how wide a rectangle of " +
      "exactly that height can be. That width runs from just past the nearest " +
      "shorter bar on the left to just before the nearest shorter bar on the " +
      "right, which is the monotonic stack's specialty. Doing it in a single " +
      "pass is the elegant version: keep indices of increasing height, and when " +
      "a shorter bar arrives, every taller bar on the stack has just found its " +
      "right boundary. Pop it, and its left boundary is whatever now sits " +
      "beneath it. Adding a sentinel of height 0 at the end flushes the stack " +
      "without a second loop.",
    constraints: [
      "Between 1 and 100,000 bars.",
      "Each height is between 0 and 10,000.",
      "Bars are contiguous and each is exactly one unit wide.",
    ],
    hints: [
      "Every rectangle is limited by the shortest bar it covers, so try each bar as that limit.",
      "A bar's rectangle stretches to the nearest shorter bar on each side.",
      "Keep heights increasing on the stack, and finish with a zero-height sentinel.",
    ],
    estimatedTime: "45 min",
    timeLimitMs: 5000,
    signature: {
      name: "largestRectangleInSkyline",
      params: [{ name: "heights", type: "int[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-monotonic-stack", "dsa-stack", "js-arrays"],
    examples: [
      {
        input: "heights = [2, 1, 5, 6, 2, 3]",
        output: "10",
        explanation:
          "The bars of height 5 and 6 together give a 2-wide, 5-tall rectangle.",
      },
      {
        input: "heights = [2, 4]",
        output: "4",
        explanation: "Either one 4-tall bar or two 2-tall bars — both give 4.",
      },
    ],
    tests: [
      { args: [[2, 1, 5, 6, 2, 3]], expected: 10 },
      { args: [[2, 4]], expected: 4 },
      { args: [[5]], expected: 5 },
      { args: [[0]], expected: 0, hidden: true },
      { args: [[3, 3, 3, 3]], expected: 12, hidden: true },
      { args: [[1, 2, 3, 4, 5]], expected: 9, hidden: true },
      { args: [[5, 4, 3, 2, 1]], expected: 9, hidden: true },
      { args: [[2, 0, 2]], expected: 2, hidden: true },
      { args: [[4, 2, 0, 3, 2, 5]], expected: 6, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const stack = [];
let best = 0;
for (let i = 0; i <= heights.length; i += 1) {
  const current = i === heights.length ? 0 : heights[i];
  while (stack.length > 0 && heights[stack[stack.length - 1]] >= current) {
    const height = heights[stack.pop()];
    const leftEdge = stack.length === 0 ? -1 : stack[stack.length - 1];
    const width = i - leftEdge - 1;
    if (height * width > best) best = height * width;
  }
  stack.push(i);
}
return best;`,
      TYPESCRIPT: `const stack: number[] = [];
let best = 0;
for (let i = 0; i <= heights.length; i += 1) {
  const current = i === heights.length ? 0 : heights[i];
  while (stack.length > 0 && heights[stack[stack.length - 1]] >= current) {
    const height = heights[stack.pop() as number];
    const leftEdge = stack.length === 0 ? -1 : stack[stack.length - 1];
    const width = i - leftEdge - 1;
    if (height * width > best) best = height * width;
  }
  stack.push(i);
}
return best;`,
      PYTHON: `stack = []
best = 0
for i in range(len(heights) + 1):
    current = 0 if i == len(heights) else heights[i]
    while stack and heights[stack[-1]] >= current:
        height = heights[stack.pop()]
        left_edge = -1 if not stack else stack[-1]
        width = i - left_edge - 1
        best = max(best, height * width)
    stack.append(i)
return best`,
      JAVA: `Deque<Integer> stack = new ArrayDeque<>();
int best = 0;
for (int i = 0; i <= heights.length; i += 1) {
    int current = i == heights.length ? 0 : heights[i];
    while (!stack.isEmpty() && heights[stack.peek()] >= current) {
        int height = heights[stack.pop()];
        int leftEdge = stack.isEmpty() ? -1 : stack.peek();
        int width = i - leftEdge - 1;
        best = Math.max(best, height * width);
    }
    stack.push(i);
}
return best;`,
      CPP: `vector<int> pending;
int best = 0;
for (int i = 0; i <= (int)heights.size(); i += 1) {
    int current = i == (int)heights.size() ? 0 : heights[i];
    while (!pending.empty() && heights[pending.back()] >= current) {
        int height = heights[pending.back()];
        pending.pop_back();
        int leftEdge = pending.empty() ? -1 : pending.back();
        int width = i - leftEdge - 1;
        best = max(best, height * width);
    }
    pending.push_back(i);
}
return best;`,
    },
  },
];
