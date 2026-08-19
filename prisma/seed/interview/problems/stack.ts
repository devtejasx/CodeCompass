import type { SeedProblem } from "../../problems/types";

/**
 * Stacks.
 *
 * Every problem here is the same recognition: the thing you need next is the
 * thing you saw most recently. Bracket matching needs the last opener, undoing
 * needs the last action, evaluating a nested expression needs the innermost
 * pending piece. Once that is spotted the code is short, and the interesting
 * part becomes what you choose to push — a character, an index, a partial
 * score, or a whole pending state.
 *
 * The file ends with the two hard ones, both of which are stacks used for
 * something that does not look like a stack problem at first: arithmetic with
 * parentheses, and measuring the longest valid stretch of brackets.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const STACK_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "remove-adjacent-duplicates",
    title: "Remove Adjacent Duplicates",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Repeatedly remove any two identical characters standing next to each " +
      'other, until no such pair is left. So "abbaca" loses "bb", which brings ' +
      'two "a"s together, and they go too — leaving "ca". Return the final ' +
      "text.",
    explanation:
      "Doing it literally — scan, remove a pair, start again — is O(n²) and " +
      "misses the point. A stack does it in one pass: push each character, " +
      "except that when the incoming character equals the top of the stack you " +
      "pop instead of pushing. The stack always holds the answer so far, so " +
      "removals cascade for free, which is exactly the behaviour the repeated " +
      "scan was paying for. What is left on the stack, read bottom to top, is " +
      "the result.",
    constraints: [
      "The text is between 0 and 100,000 lowercase letters.",
      "Removal repeats until no adjacent pair remains.",
      "The result may be empty.",
    ],
    hints: [
      "Do not rescan from the start after each removal.",
      "Push each character, but pop when it matches the top.",
      "The stack is the answer so far.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "removeAdjacentDuplicates",
      params: [{ name: "text", type: "string" }],
      returns: "string",
    },
    topicSlugs: ["dsa-stack", "dsa-strings", "data-structures"],
    examples: [
      { input: 'text = "abbaca"', output: '"ca"' },
      { input: 'text = "azxxzy"', output: '"ay"' },
    ],
    tests: [
      { args: ["abbaca"], expected: "ca" },
      { args: ["azxxzy"], expected: "ay" },
      { args: ["a"], expected: "a" },
      { args: [""], expected: "", hidden: true },
      { args: ["aa"], expected: "", hidden: true },
      { args: ["abba"], expected: "", hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const stack = [];
for (const character of text) {
  if (stack.length > 0 && stack[stack.length - 1] === character) stack.pop();
  else stack.push(character);
}
return stack.join("");`,
      TYPESCRIPT: `const stack: string[] = [];
for (const character of text) {
  if (stack.length > 0 && stack[stack.length - 1] === character) stack.pop();
  else stack.push(character);
}
return stack.join("");`,
      PYTHON: `stack = []
for character in text:
    if stack and stack[-1] == character:
        stack.pop()
    else:
        stack.append(character)
return "".join(stack)`,
      JAVA: `StringBuilder stack = new StringBuilder();
for (int i = 0; i < text.length(); i += 1) {
    char character = text.charAt(i);
    int size = stack.length();
    if (size > 0 && stack.charAt(size - 1) == character) stack.deleteCharAt(size - 1);
    else stack.append(character);
}
return stack.toString();`,
      CPP: `string stack;
for (char character : text) {
    if (!stack.empty() && stack.back() == character) stack.pop_back();
    else stack += character;
}
return stack;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "min-remove-to-valid-parens",
    title: "Make the Brackets Valid",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "The text contains letters and round brackets. Remove as few brackets as " +
      "possible so that the remaining brackets are balanced, and return the " +
      "result. Letters are never removed. Several answers may be equally short; " +
      "return the one that keeps the earliest brackets it can.",
    explanation:
      "Two things can be wrong: a closing bracket with nothing open, and an " +
      "opening bracket never closed. A stack of *positions* finds both in one " +
      "pass — push the index of every opener, pop on a closer, and a pop from an " +
      "empty stack marks that closer for removal. Whatever indices remain on the " +
      "stack at the end are openers that were never closed, so they are marked " +
      "too. Then rebuild the string skipping the marked positions. Storing " +
      "indices rather than characters is the move worth stealing: you cannot " +
      "delete something later if you did not record where it was.",
    constraints: [
      "The text is between 0 and 100,000 characters.",
      "It contains lowercase letters and the characters ( and ).",
      "Only brackets may be removed.",
    ],
    hints: [
      "Two failure modes: an unmatched closer, and an unclosed opener.",
      "Push positions, not characters.",
      "Whatever is left on the stack at the end also has to go.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "makeBracketsValid",
      params: [{ name: "text", type: "string" }],
      returns: "string",
    },
    topicSlugs: ["dsa-stack", "dsa-strings"],
    examples: [
      {
        input: 'text = "lee(t(c)o)de)"',
        output: '"lee(t(c)o)de"',
        explanation: "The final closing bracket has nothing to close.",
      },
      { input: 'text = "a)b(c)d"', output: '"ab(c)d"' },
    ],
    tests: [
      { args: ["lee(t(c)o)de)"], expected: "lee(t(c)o)de" },
      { args: ["a)b(c)d"], expected: "ab(c)d" },
      { args: ["))(("], expected: "" },
      { args: ["(a(b(c)d)"], expected: "a(b(c)d)", hidden: true },
      { args: [""], expected: "", hidden: true },
      { args: ["((("], expected: "", hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const remove = new Set();
const openers = [];
for (let i = 0; i < text.length; i += 1) {
  if (text[i] === "(") openers.push(i);
  else if (text[i] === ")") {
    if (openers.length > 0) openers.pop();
    else remove.add(i);
  }
}
for (const index of openers) remove.add(index);
let result = "";
for (let i = 0; i < text.length; i += 1) {
  if (!remove.has(i)) result += text[i];
}
return result;`,
      TYPESCRIPT: `const remove = new Set<number>();
const openers: number[] = [];
for (let i = 0; i < text.length; i += 1) {
  if (text[i] === "(") openers.push(i);
  else if (text[i] === ")") {
    if (openers.length > 0) openers.pop();
    else remove.add(i);
  }
}
for (const index of openers) remove.add(index);
let result = "";
for (let i = 0; i < text.length; i += 1) {
  if (!remove.has(i)) result += text[i];
}
return result;`,
      PYTHON: `remove = set()
openers = []
for i, character in enumerate(text):
    if character == "(":
        openers.append(i)
    elif character == ")":
        if openers:
            openers.pop()
        else:
            remove.add(i)
remove.update(openers)
return "".join(character for i, character in enumerate(text) if i not in remove)`,
      JAVA: `Set<Integer> remove = new HashSet<>();
Deque<Integer> openers = new ArrayDeque<>();
for (int i = 0; i < text.length(); i += 1) {
    char character = text.charAt(i);
    if (character == '(') openers.push(i);
    else if (character == ')') {
        if (!openers.isEmpty()) openers.pop();
        else remove.add(i);
    }
}
remove.addAll(openers);
StringBuilder result = new StringBuilder();
for (int i = 0; i < text.length(); i += 1) {
    if (!remove.contains(i)) result.append(text.charAt(i));
}
return result.toString();`,
      CPP: `unordered_set<int> remove;
vector<int> openers;
for (int i = 0; i < (int)text.size(); i += 1) {
    if (text[i] == '(') openers.push_back(i);
    else if (text[i] == ')') {
        if (!openers.empty()) openers.pop_back();
        else remove.insert(i);
    }
}
for (int index : openers) remove.insert(index);
string result;
for (int i = 0; i < (int)text.size(); i += 1) {
    if (!remove.count(i)) result += text[i];
}
return result;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "evaluate-postfix",
    title: "Evaluate a Postfix Expression",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "In postfix notation the operator comes after its two operands, so " +
      '["2", "1", "+", "3", "*"] means (2 + 1) × 3. Evaluate the expression ' +
      "and return the result. Division between integers truncates towards zero.",
    explanation:
      "Postfix exists precisely because it needs no brackets and no precedence " +
      "rules — a stack is enough. Push every number; on an operator, pop two " +
      "values, apply it, and push the answer back. The order of the pops is the " +
      "one detail that matters: the first value popped is the right-hand " +
      "operand, which is invisible for + and × and decides the answer for - and " +
      "÷. Truncating towards zero rather than flooring is the other specified " +
      "behaviour, and it differs from Python's default division, so it has to be " +
      "written explicitly there.",
    constraints: [
      "The expression has between 1 and 10,000 tokens.",
      "Tokens are integers or one of + - * /.",
      "Division truncates towards zero and never divides by zero.",
    ],
    hints: [
      "Numbers get pushed; operators pop two and push one.",
      "The first value popped is the right-hand operand.",
      "Truncation towards zero is not the same as flooring.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "evaluatePostfix",
      params: [{ name: "tokens", type: "string[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-stack", "dsa-strings"],
    examples: [
      { input: 'tokens = ["2", "1", "+", "3", "*"]', output: "9" },
      {
        input: 'tokens = ["4", "13", "5", "/", "+"]',
        output: "6",
        explanation: "13 / 5 truncates to 2, and 4 + 2 is 6.",
      },
    ],
    tests: [
      { args: [["2", "1", "+", "3", "*"]], expected: 9 },
      { args: [["4", "13", "5", "/", "+"]], expected: 6 },
      { args: [["5"]], expected: 5 },
      { args: [["2", "3", "-"]], expected: -1, hidden: true },
      { args: [["10", "2", "/"]], expected: 5, hidden: true },
      { args: [["-3", "2", "*"]], expected: -6, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const stack = [];
for (const token of tokens) {
  if (token === "+" || token === "-" || token === "*" || token === "/") {
    const right = stack.pop();
    const left = stack.pop();
    if (token === "+") stack.push(left + right);
    else if (token === "-") stack.push(left - right);
    else if (token === "*") stack.push(left * right);
    else stack.push(Math.trunc(left / right));
  } else {
    stack.push(Number(token));
  }
}
return stack[stack.length - 1];`,
      TYPESCRIPT: `const stack: number[] = [];
for (const token of tokens) {
  if (token === "+" || token === "-" || token === "*" || token === "/") {
    const right = stack.pop() ?? 0;
    const left = stack.pop() ?? 0;
    if (token === "+") stack.push(left + right);
    else if (token === "-") stack.push(left - right);
    else if (token === "*") stack.push(left * right);
    else stack.push(Math.trunc(left / right));
  } else {
    stack.push(Number(token));
  }
}
return stack[stack.length - 1];`,
      PYTHON: `stack = []
for token in tokens:
    if token in ("+", "-", "*", "/"):
        right = stack.pop()
        left = stack.pop()
        if token == "+":
            stack.append(left + right)
        elif token == "-":
            stack.append(left - right)
        elif token == "*":
            stack.append(left * right)
        else:
            stack.append(int(left / right))
    else:
        stack.append(int(token))
return stack[-1]`,
      JAVA: `Deque<Integer> stack = new ArrayDeque<>();
for (String token : tokens) {
    if (token.equals("+") || token.equals("-") || token.equals("*") || token.equals("/")) {
        int right = stack.pop();
        int left = stack.pop();
        if (token.equals("+")) stack.push(left + right);
        else if (token.equals("-")) stack.push(left - right);
        else if (token.equals("*")) stack.push(left * right);
        else stack.push(left / right);
    } else {
        stack.push(Integer.parseInt(token));
    }
}
return stack.peek();`,
      CPP: `vector<int> stack;
for (const string& token : tokens) {
    if (token == "+" || token == "-" || token == "*" || token == "/") {
        int right = stack.back();
        stack.pop_back();
        int left = stack.back();
        stack.pop_back();
        if (token == "+") stack.push_back(left + right);
        else if (token == "-") stack.push_back(left - right);
        else if (token == "*") stack.push_back(left * right);
        else stack.push_back(left / right);
    } else {
        stack.push_back(stoi(token));
    }
}
return stack.back();`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "decode-repeated-string",
    title: "Expand a Nested Encoding",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Text is encoded as number[content], meaning the content repeated that " +
      'many times, and the encodings can nest: "3[a2[c]]" expands to ' +
      '"accaccacc". Return the fully expanded text.',
    explanation:
      "Nesting is the signal for a stack. Walk the text building up the current " +
      "piece and the current repeat count; when an opening bracket arrives, push " +
      "both onto stacks and start fresh, and when a closing bracket arrives, pop " +
      "them and attach the repeated piece to what came before. Two stacks — one " +
      "of counts, one of partial strings — or one stack of pairs; the choice is " +
      "taste. Multi-digit numbers are the small trap: build the count digit by " +
      "digit rather than assuming it is a single character.",
    constraints: [
      "The encoded text is between 1 and 10,000 characters.",
      "Repeat counts are between 1 and 300 and may have several digits.",
      "The content is lowercase letters and nested encodings only.",
    ],
    hints: [
      "Nesting means a stack.",
      "Push the piece so far and the count so far when a bracket opens.",
      "Build multi-digit counts one digit at a time.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "decodeRepeatedString",
      params: [{ name: "encoded", type: "string" }],
      returns: "string",
    },
    topicSlugs: ["dsa-stack", "dsa-strings"],
    examples: [
      { input: 'encoded = "3[a]2[bc]"', output: '"aaabcbc"' },
      {
        input: 'encoded = "3[a2[c]]"',
        output: '"accaccacc"',
        explanation: 'The inner 2[c] expands first, giving "acc".',
      },
    ],
    tests: [
      { args: ["3[a]2[bc]"], expected: "aaabcbc" },
      { args: ["3[a2[c]]"], expected: "accaccacc" },
      { args: ["2[abc]3[cd]ef"], expected: "abcabccdcdcdef" },
      { args: ["a"], expected: "a", hidden: true },
      { args: ["1[x]"], expected: "x", hidden: true },
      { args: ["2[2[b]]"], expected: "bbbb", hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const counts = [];
const pieces = [];
let current = "";
let count = 0;
for (const character of encoded) {
  if (character >= "0" && character <= "9") {
    count = count * 10 + Number(character);
  } else if (character === "[") {
    counts.push(count);
    pieces.push(current);
    count = 0;
    current = "";
  } else if (character === "]") {
    const times = counts.pop();
    const before = pieces.pop();
    current = before + current.repeat(times);
  } else {
    current += character;
  }
}
return current;`,
      TYPESCRIPT: `const counts: number[] = [];
const pieces: string[] = [];
let current = "";
let count = 0;
for (const character of encoded) {
  if (character >= "0" && character <= "9") {
    count = count * 10 + Number(character);
  } else if (character === "[") {
    counts.push(count);
    pieces.push(current);
    count = 0;
    current = "";
  } else if (character === "]") {
    const times = counts.pop() ?? 0;
    const before = pieces.pop() ?? "";
    current = before + current.repeat(times);
  } else {
    current += character;
  }
}
return current;`,
      PYTHON: `counts = []
pieces = []
current = ""
count = 0
for character in encoded:
    if character.isdigit():
        count = count * 10 + int(character)
    elif character == "[":
        counts.append(count)
        pieces.append(current)
        count = 0
        current = ""
    elif character == "]":
        times = counts.pop()
        before = pieces.pop()
        current = before + current * times
    else:
        current += character
return current`,
      JAVA: `Deque<Integer> counts = new ArrayDeque<>();
Deque<String> pieces = new ArrayDeque<>();
StringBuilder current = new StringBuilder();
int count = 0;
for (int i = 0; i < encoded.length(); i += 1) {
    char character = encoded.charAt(i);
    if (Character.isDigit(character)) {
        count = count * 10 + (character - '0');
    } else if (character == '[') {
        counts.push(count);
        pieces.push(current.toString());
        count = 0;
        current = new StringBuilder();
    } else if (character == ']') {
        int times = counts.pop();
        StringBuilder expanded = new StringBuilder(pieces.pop());
        for (int t = 0; t < times; t += 1) expanded.append(current);
        current = expanded;
    } else {
        current.append(character);
    }
}
return current.toString();`,
      CPP: `vector<int> counts;
vector<string> pieces;
string current;
int count = 0;
for (char character : encoded) {
    if (isdigit((unsigned char)character)) {
        count = count * 10 + (character - '0');
    } else if (character == '[') {
        counts.push_back(count);
        pieces.push_back(current);
        count = 0;
        current.clear();
    } else if (character == ']') {
        int times = counts.back();
        counts.pop_back();
        string expanded = pieces.back();
        pieces.pop_back();
        for (int t = 0; t < times; t += 1) expanded += current;
        current = expanded;
    } else {
        current += character;
    }
}
return current;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "asteroid-collision",
    title: "Asteroid Collisions",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Each number is an asteroid: its size is the absolute value and its " +
      "direction is the sign, positive moving right and negative moving left. " +
      "When two meet, the smaller one is destroyed; if they are the same size " +
      "both are destroyed. Asteroids moving the same way never meet. Return " +
      "what survives, in order.",
    explanation:
      "A collision only happens when a right-moving asteroid is followed by a " +
      "left-moving one, which is exactly the moment a stack can detect: keep the " +
      "survivors so far, and when a left-mover arrives, resolve it against the " +
      "top of the stack repeatedly until it is destroyed or the stack has " +
      "nothing moving right. Three outcomes per comparison — the incoming one " +
      "dies, the stacked one dies and the fight continues, or both die — and " +
      "writing them as three explicit branches rather than nested conditions is " +
      "what keeps this correct.",
    constraints: [
      "There are between 0 and 10,000 asteroids.",
      "Each size is between 1 and 1,000, with a sign giving direction.",
      "No asteroid has size zero.",
    ],
    hints: [
      "A collision needs a right-mover directly before a left-mover.",
      "Keep survivors on a stack and resolve each new arrival against the top.",
      "One arrival can destroy several stacked asteroids in turn.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "asteroidCollision",
      params: [{ name: "asteroids", type: "int[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-stack", "dsa-arrays"],
    examples: [
      {
        input: "asteroids = [5, 10, -5]",
        output: "[5, 10]",
        explanation: "10 destroys the -5; the 5 never meets anything.",
      },
      { input: "asteroids = [8, -8]", output: "[]" },
    ],
    tests: [
      { args: [[5, 10, -5]], expected: [5, 10] },
      { args: [[8, -8]], expected: [] },
      { args: [[10, 2, -5]], expected: [10] },
      { args: [[-2, -1, 1, 2]], expected: [-2, -1, 1, 2], hidden: true },
      { args: [[1, -2, -2, -2]], expected: [-2, -2, -2], hidden: true },
      { args: [[]], expected: [], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const survivors = [];
for (const asteroid of asteroids) {
  let alive = true;
  while (
    alive &&
    asteroid < 0 &&
    survivors.length > 0 &&
    survivors[survivors.length - 1] > 0
  ) {
    const top = survivors[survivors.length - 1];
    if (top < -asteroid) {
      survivors.pop();
    } else if (top === -asteroid) {
      survivors.pop();
      alive = false;
    } else {
      alive = false;
    }
  }
  if (alive) survivors.push(asteroid);
}
return survivors;`,
      TYPESCRIPT: `const survivors: number[] = [];
for (const asteroid of asteroids) {
  let alive = true;
  while (
    alive &&
    asteroid < 0 &&
    survivors.length > 0 &&
    survivors[survivors.length - 1] > 0
  ) {
    const top = survivors[survivors.length - 1];
    if (top < -asteroid) {
      survivors.pop();
    } else if (top === -asteroid) {
      survivors.pop();
      alive = false;
    } else {
      alive = false;
    }
  }
  if (alive) survivors.push(asteroid);
}
return survivors;`,
      PYTHON: `survivors = []
for asteroid in asteroids:
    alive = True
    while alive and asteroid < 0 and survivors and survivors[-1] > 0:
        top = survivors[-1]
        if top < -asteroid:
            survivors.pop()
        elif top == -asteroid:
            survivors.pop()
            alive = False
        else:
            alive = False
    if alive:
        survivors.append(asteroid)
return survivors`,
      JAVA: `List<Integer> survivors = new ArrayList<>();
for (int asteroid : asteroids) {
    boolean alive = true;
    while (alive && asteroid < 0 && !survivors.isEmpty()
            && survivors.get(survivors.size() - 1) > 0) {
        int top = survivors.get(survivors.size() - 1);
        if (top < -asteroid) {
            survivors.remove(survivors.size() - 1);
        } else if (top == -asteroid) {
            survivors.remove(survivors.size() - 1);
            alive = false;
        } else {
            alive = false;
        }
    }
    if (alive) survivors.add(asteroid);
}
int[] result = new int[survivors.size()];
for (int i = 0; i < survivors.size(); i += 1) result[i] = survivors.get(i);
return result;`,
      CPP: `vector<int> survivors;
for (int asteroid : asteroids) {
    bool alive = true;
    while (alive && asteroid < 0 && !survivors.empty() && survivors.back() > 0) {
        int top = survivors.back();
        if (top < -asteroid) {
            survivors.pop_back();
        } else if (top == -asteroid) {
            survivors.pop_back();
            alive = false;
        } else {
            alive = false;
        }
    }
    if (alive) survivors.push_back(asteroid);
}
return survivors;`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "score-of-parentheses",
    title: "Score a Balanced Bracket String",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      'Score a balanced bracket string by three rules: "()" scores 1, two ' +
      "strings side by side score the sum of their scores, and a string wrapped " +
      "in one pair of brackets scores double. Return the total score.",
    explanation:
      "The rules are recursive, so the stack holds partial scores rather than " +
      "characters. Push a marker (a zero works) on every opening bracket; on a " +
      "closing bracket, pop the score accumulated inside — if it is zero the " +
      "pair was empty and scores 1, otherwise it scores double — and add the " +
      "result to whatever is below. When the string ends, the single value left " +
      "is the answer. Recognising that the stack can hold *computed values* " +
      "rather than input characters is the step that makes several harder " +
      "parsing problems tractable.",
    constraints: [
      "The text is between 2 and 1,000 characters.",
      "It contains only ( and ) and is always balanced.",
      "The score fits comfortably in a 32-bit integer.",
    ],
    hints: [
      "The rules are recursive — the stack should hold scores, not characters.",
      "An empty pair scores 1; anything else doubles what was inside.",
      "Add each finished score to the level below.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "scoreOfParentheses",
      params: [{ name: "text", type: "string" }],
      returns: "int",
    },
    topicSlugs: ["dsa-stack", "dsa-recursion"],
    examples: [
      { input: 'text = "()"', output: "1" },
      {
        input: 'text = "(())"',
        output: "2",
        explanation: "The inner pair scores 1 and the wrapper doubles it.",
      },
    ],
    tests: [
      { args: ["()"], expected: 1 },
      { args: ["(())"], expected: 2 },
      { args: ["()()"], expected: 2 },
      { args: ["(()(()))"], expected: 6, hidden: true },
      { args: ["((()))"], expected: 4, hidden: true },
      { args: ["(()())"], expected: 4, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const stack = [0];
for (const character of text) {
  if (character === "(") {
    stack.push(0);
  } else {
    const inside = stack.pop();
    const scored = inside === 0 ? 1 : inside * 2;
    stack[stack.length - 1] += scored;
  }
}
return stack[0];`,
      TYPESCRIPT: `const stack: number[] = [0];
for (const character of text) {
  if (character === "(") {
    stack.push(0);
  } else {
    const inside = stack.pop() ?? 0;
    const scored = inside === 0 ? 1 : inside * 2;
    stack[stack.length - 1] += scored;
  }
}
return stack[0];`,
      PYTHON: `stack = [0]
for character in text:
    if character == "(":
        stack.append(0)
    else:
        inside = stack.pop()
        stack[-1] += 1 if inside == 0 else inside * 2
return stack[0]`,
      JAVA: `List<Integer> stack = new ArrayList<>();
stack.add(0);
for (int i = 0; i < text.length(); i += 1) {
    if (text.charAt(i) == '(') {
        stack.add(0);
    } else {
        int inside = stack.remove(stack.size() - 1);
        int scored = inside == 0 ? 1 : inside * 2;
        stack.set(stack.size() - 1, stack.get(stack.size() - 1) + scored);
    }
}
return stack.get(0);`,
      CPP: `vector<int> stack;
stack.push_back(0);
for (char character : text) {
    if (character == '(') {
        stack.push_back(0);
    } else {
        int inside = stack.back();
        stack.pop_back();
        stack.back() += (inside == 0) ? 1 : inside * 2;
    }
}
return stack[0];`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "basic-calculator-brackets",
    title: "A Calculator With Brackets",
    difficulty: "HARD",
    interviewFrequency: "HIGH",
    description:
      "Evaluate an arithmetic expression containing non-negative numbers, " +
      "plus, minus, brackets and spaces. There is no multiplication or " +
      "division, but brackets can nest and a minus can appear at the start of " +
      "an expression or straight after an opening bracket.",
    explanation:
      "Two variables carry the state — a running total and the sign that " +
      "applies to the next number — and the stack carries the *suspended* state " +
      "while a bracket is open. On an opening bracket, push the running total " +
      "and the pending sign, then reset both as if starting fresh; on a closing " +
      "bracket, finish the inner total, pop the sign, multiply, and add it to " +
      "the popped outer total. Numbers are built digit by digit and added when " +
      "the next non-digit arrives, which means one final add after the loop for " +
      "the number at the end. No recursion is needed, which is the point of the " +
      "exercise.",
    constraints: [
      "The expression is between 1 and 30,000 characters.",
      "It contains digits, +, -, brackets and spaces only.",
      "The expression is always valid and the result fits in a 32-bit integer.",
    ],
    hints: [
      "Keep a running total and the sign that applies to the next number.",
      "A bracket suspends both — push them and start fresh.",
      "Add the pending number once more after the loop ends.",
    ],
    estimatedTime: "40 min",
    signature: {
      name: "basicCalculator",
      params: [{ name: "expression", type: "string" }],
      returns: "int",
    },
    topicSlugs: ["dsa-stack", "dsa-strings"],
    examples: [
      { input: 'expression = "(1+(4+5+2)-3)+(6+8)"', output: "23" },
      { input: 'expression = " 2-1 + 2 "', output: "3" },
    ],
    tests: [
      { args: ["1 + 1"], expected: 2 },
      { args: [" 2-1 + 2 "], expected: 3 },
      { args: ["(1+(4+5+2)-3)+(6+8)"], expected: 23 },
      { args: ["-2+ 1"], expected: -1, hidden: true },
      { args: ["2-(5-6)"], expected: 3, hidden: true },
      { args: ["1"], expected: 1, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const stack = [];
let total = 0;
let sign = 1;
let number = 0;
for (const character of expression) {
  if (character >= "0" && character <= "9") {
    number = number * 10 + Number(character);
  } else if (character === "+") {
    total += sign * number;
    number = 0;
    sign = 1;
  } else if (character === "-") {
    total += sign * number;
    number = 0;
    sign = -1;
  } else if (character === "(") {
    stack.push(total);
    stack.push(sign);
    total = 0;
    sign = 1;
  } else if (character === ")") {
    total += sign * number;
    number = 0;
    const outerSign = stack.pop();
    const outerTotal = stack.pop();
    total = outerTotal + outerSign * total;
    sign = 1;
  }
}
return total + sign * number;`,
      TYPESCRIPT: `const stack: number[] = [];
let total = 0;
let sign = 1;
let number = 0;
for (const character of expression) {
  if (character >= "0" && character <= "9") {
    number = number * 10 + Number(character);
  } else if (character === "+") {
    total += sign * number;
    number = 0;
    sign = 1;
  } else if (character === "-") {
    total += sign * number;
    number = 0;
    sign = -1;
  } else if (character === "(") {
    stack.push(total);
    stack.push(sign);
    total = 0;
    sign = 1;
  } else if (character === ")") {
    total += sign * number;
    number = 0;
    const outerSign = stack.pop() ?? 1;
    const outerTotal = stack.pop() ?? 0;
    total = outerTotal + outerSign * total;
    sign = 1;
  }
}
return total + sign * number;`,
      PYTHON: `stack = []
total = 0
sign = 1
number = 0
for character in expression:
    if character.isdigit():
        number = number * 10 + int(character)
    elif character == "+":
        total += sign * number
        number = 0
        sign = 1
    elif character == "-":
        total += sign * number
        number = 0
        sign = -1
    elif character == "(":
        stack.append(total)
        stack.append(sign)
        total = 0
        sign = 1
    elif character == ")":
        total += sign * number
        number = 0
        outer_sign = stack.pop()
        outer_total = stack.pop()
        total = outer_total + outer_sign * total
        sign = 1
return total + sign * number`,
      JAVA: `Deque<Integer> stack = new ArrayDeque<>();
int total = 0;
int sign = 1;
int number = 0;
for (int i = 0; i < expression.length(); i += 1) {
    char character = expression.charAt(i);
    if (Character.isDigit(character)) {
        number = number * 10 + (character - '0');
    } else if (character == '+') {
        total += sign * number;
        number = 0;
        sign = 1;
    } else if (character == '-') {
        total += sign * number;
        number = 0;
        sign = -1;
    } else if (character == '(') {
        stack.push(total);
        stack.push(sign);
        total = 0;
        sign = 1;
    } else if (character == ')') {
        total += sign * number;
        number = 0;
        int outerSign = stack.pop();
        int outerTotal = stack.pop();
        total = outerTotal + outerSign * total;
        sign = 1;
    }
}
return total + sign * number;`,
      CPP: `vector<int> stack;
int total = 0;
int sign = 1;
int number = 0;
for (char character : expression) {
    if (isdigit((unsigned char)character)) {
        number = number * 10 + (character - '0');
    } else if (character == '+') {
        total += sign * number;
        number = 0;
        sign = 1;
    } else if (character == '-') {
        total += sign * number;
        number = 0;
        sign = -1;
    } else if (character == '(') {
        stack.push_back(total);
        stack.push_back(sign);
        total = 0;
        sign = 1;
    } else if (character == ')') {
        total += sign * number;
        number = 0;
        int outerSign = stack.back();
        stack.pop_back();
        int outerTotal = stack.back();
        stack.pop_back();
        total = outerTotal + outerSign * total;
        sign = 1;
    }
}
return total + sign * number;`,
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "longest-valid-parentheses",
    title: "Longest Valid Bracket Stretch",
    difficulty: "HARD",
    interviewFrequency: "HIGH",
    description:
      "Return the length of the longest run of neighbouring characters that " +
      "forms a properly balanced bracket string. The run must be contiguous, so " +
      '")()())" answers 4 rather than 5.',
    explanation:
      "Checking validity is easy; measuring the longest valid *stretch* needs a " +
      "position, not a count. Push the index of every opening bracket, and start " +
      "the stack holding -1 as a base marker meaning 'the last position where " +
      "everything was balanced'. On a closing bracket, pop: if the stack is now " +
      "empty this closer is unmatched, so push its own index as the new base; " +
      "otherwise the current length is the distance from the new top of the " +
      "stack. Storing indices rather than characters is what turns a validity " +
      "check into a measurement, and the -1 base is what makes a run starting at " +
      "position 0 measure correctly.",
    constraints: [
      "The text is between 0 and 100,000 characters.",
      "It contains only ( and ).",
      "The run must be contiguous.",
    ],
    hints: [
      "Push indices, not brackets.",
      "Seed the stack with -1 as a base position.",
      "An unmatched closer becomes the new base.",
    ],
    estimatedTime: "40 min",
    signature: {
      name: "longestValidParentheses",
      params: [{ name: "text", type: "string" }],
      returns: "int",
    },
    topicSlugs: ["dsa-stack", "dsa-dp-1d"],
    examples: [
      { input: 'text = "(()"', output: "2" },
      {
        input: 'text = ")()())"',
        output: "4",
        explanation: 'The middle "()()"  is the longest balanced stretch.',
      },
    ],
    tests: [
      { args: ["(()"], expected: 2 },
      { args: [")()())"], expected: 4 },
      { args: [""], expected: 0 },
      { args: ["()(()"], expected: 2, hidden: true },
      { args: ["()(())"], expected: 6, hidden: true },
      { args: ["(((("], expected: 0, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const stack = [-1];
let best = 0;
for (let i = 0; i < text.length; i += 1) {
  if (text[i] === "(") {
    stack.push(i);
  } else {
    stack.pop();
    if (stack.length === 0) {
      stack.push(i);
    } else {
      const length = i - stack[stack.length - 1];
      if (length > best) best = length;
    }
  }
}
return best;`,
      TYPESCRIPT: `const stack: number[] = [-1];
let best = 0;
for (let i = 0; i < text.length; i += 1) {
  if (text[i] === "(") {
    stack.push(i);
  } else {
    stack.pop();
    if (stack.length === 0) {
      stack.push(i);
    } else {
      const length = i - stack[stack.length - 1];
      if (length > best) best = length;
    }
  }
}
return best;`,
      PYTHON: `stack = [-1]
best = 0
for i, character in enumerate(text):
    if character == "(":
        stack.append(i)
    else:
        stack.pop()
        if not stack:
            stack.append(i)
        else:
            best = max(best, i - stack[-1])
return best`,
      JAVA: `Deque<Integer> stack = new ArrayDeque<>();
stack.push(-1);
int best = 0;
for (int i = 0; i < text.length(); i += 1) {
    if (text.charAt(i) == '(') {
        stack.push(i);
    } else {
        stack.pop();
        if (stack.isEmpty()) {
            stack.push(i);
        } else {
            best = Math.max(best, i - stack.peek());
        }
    }
}
return best;`,
      CPP: `vector<int> stack;
stack.push_back(-1);
int best = 0;
for (int i = 0; i < (int)text.size(); i += 1) {
    if (text[i] == '(') {
        stack.push_back(i);
    } else {
        stack.pop_back();
        if (stack.empty()) {
            stack.push_back(i);
        } else {
            best = max(best, i - stack.back());
        }
    }
}
return best;`,
    },
  },
];
