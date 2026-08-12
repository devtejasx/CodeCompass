import type { SeedLesson } from "./types";

/**
 * Phase 4 of the Frontend roadmap — the JavaScript beginner chain.
 *
 * `js-variables`, `js-functions` and `js-arrays` are authored in ./frontend.ts.
 * These are the six topics between and around them: data types, operators,
 * conditions, loops, objects and scope. Together the nine make an unbroken
 * sequence from the first variable to closures.
 *
 * Most of these topics have practice problems attached in the seed, so the
 * lessons end pointing at them — this is the phase where "learn, then practise"
 * stops being a slogan and becomes the actual next click.
 */
export const FRONTEND_JAVASCRIPT_LESSONS: SeedLesson[] = [
  // ── Data types ─────────────────────────────────────────────────────────
  {
    topicSlug: "js-data-types",
    title: "Data Types",
    description:
      "The kinds of value JavaScript works with, and why the type of a value decides what happens next.",
    estimatedTime: "1.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "Values have kinds",
        content:
          "A variable holds a value, and every value has a type. The type is not decoration — it decides what operations mean. `+` on two numbers adds them; `+` on two strings joins them. Same symbol, different operation, chosen by the types involved.\n\nMost confusing JavaScript behaviour, especially early on, comes down to a value having a different type than you assumed.",
      },
      {
        type: "LIST",
        content: "There are seven primitive types. You will use four constantly:",
        items: [
          "`string` — text: `\"hello\"`, `'world'`, `` `hi ${name}` ``.",
          "`number` — all numbers, whole or decimal: `42`, `-1`, `3.14`. There is no separate integer type.",
          "`boolean` — `true` or `false`.",
          "`undefined` — a variable that exists but has not been given a value.",
          "`null` — a deliberate \"nothing here\", set by you rather than by the language.",
          "`bigint` and `symbol` — for very large integers and unique keys. Rare in frontend work.",
        ],
      },
      {
        type: "TEXT",
        content:
          "Everything that is not a primitive is an object — including arrays and functions. That is worth knowing now because it explains a behaviour you will meet shortly.",
      },
      {
        type: "HEADING",
        content: "undefined and null are not the same",
      },
      {
        type: "CODE",
        content: "The distinction is about who caused it:",
        code: `let a;
console.log(a);        // undefined — never assigned

let b = null;
console.log(b);        // null — deliberately empty

console.log(typeof a); // "undefined"
console.log(typeof b); // "object"  ← a famous, unfixable language bug`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "`undefined` generally means the language has not been told; `null` means you decided there is nothing. A function with no `return` gives back `undefined`; a user who chose not to enter a middle name might be stored as `null`.\n\n`typeof null` returning `\"object\"` is a mistake from the first version of JavaScript. It cannot be fixed without breaking a great deal of existing code, so it stays. Do not read meaning into it.",
      },
      {
        type: "HEADING",
        content: "Checking a type",
      },
      {
        type: "TEXT",
        content:
          "`typeof` gives you the type as a string, and it is reliable for primitives. For arrays it says `\"object\"`, which is technically true and rarely useful — `Array.isArray(value)` is the right check there.",
      },
      {
        type: "CODE",
        content: "In practice:",
        code: `typeof "hi"        // "string"
typeof 42          // "number"
typeof true        // "boolean"
typeof undefined   // "undefined"
typeof [1, 2, 3]   // "object"   ← use Array.isArray instead
typeof null        // "object"   ← the historical bug

Array.isArray([1, 2, 3])  // true`,
        language: "javascript",
      },
      {
        type: "HEADING",
        content: "Type coercion",
      },
      {
        type: "TEXT",
        content:
          "JavaScript will quietly convert between types when an operation needs it. This is called coercion, and it is behind most beginner bugs that look like nonsense.",
      },
      {
        type: "EXAMPLE",
        title: "The classic one",
        content: "Two very similar expressions, two different operations:",
        code: `"5" + 3    // "53"  — + with a string means join
"5" - 3    // 2     — - has no string meaning, so "5" becomes 5

Number("5")     // 5
String(5)       // "5"
Number("abc")   // NaN — "not a number"`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "This matters immediately in real work: values from a form field or a URL are always strings. `\"5\" + 3` gives `\"53\"`, so a total comes out as `\"53\"` instead of `8`. Convert explicitly with `Number()` before doing arithmetic, and the whole class of bug disappears.",
      },
      {
        type: "CALLOUT",
        content:
          "`NaN` means \"not a number\", and confusingly its type *is* number. It is what you get from arithmetic that cannot produce a result. Check for it with `Number.isNaN(value)` — never with `value === NaN`, because `NaN` is the one value in JavaScript not equal to itself.",
      },
      {
        type: "HEADING",
        content: "Truthy and falsy",
      },
      {
        type: "TEXT",
        content:
          "In a condition, any value is treated as true or false. Six values are falsy: `false`, `0`, `\"\"` (empty string), `null`, `undefined` and `NaN`. Everything else is truthy — including `\"0\"`, `\"false\"`, `[]` and `{}`, all of which surprise people.\n\nThe practical trap is `0` and `\"\"` being falsy. `if (count)` skips a genuine count of zero, and `if (name)` skips a genuinely empty answer. When you mean \"was a value provided?\", check for `null` and `undefined` specifically rather than testing truthiness.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Doing arithmetic on form values without converting. They are strings.\n\nUsing `==` instead of `===`. The double equals coerces before comparing, so `\"5\" == 5` is true and `0 == \"\"` is true. Use `===`, which compares type and value, unless you have a specific reason not to.\n\nTesting `value === NaN`. It is never true. Use `Number.isNaN`.\n\nAssuming `[]` or `{}` are falsy because they are empty. They are objects, and all objects are truthy.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Name the type of any value and check it correctly. Predict what `\"5\" + 3` and `\"5\" - 3` produce and explain why. Convert deliberately with `Number()` and `String()`. List the falsy values and say why `0` being one of them causes bugs. There are practice problems on this topic — they are the fastest way to make it stick.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "A quantity comes from a form field as `\"5\"` and you compute `\"5\" + 3`. What is the result?",
        explanation:
          '`"53"`. With a string operand, `+` means concatenation rather than addition. Form fields always give strings, so arithmetic on them needs an explicit `Number()` conversion first. Note `"5" - 3` gives 2, because `-` has no string meaning.',
        options: [
          { text: '"53" — `+` joins when either side is a string', isCorrect: true },
          { text: "8 — JavaScript converts the string to a number" },
          { text: "NaN — you cannot add a string to a number" },
          { text: "An error is thrown" },
        ],
      },
      {
        question:
          "`if (count)` fails to run when `count` is 0, but 0 is a valid count. What is the correct check?",
        explanation:
          "`0` is falsy, so a truthiness test treats a genuine zero as missing. When the question is really \"was a value provided?\", test for null and undefined explicitly — `count != null` covers both, or `count !== undefined && count !== null` if you prefer to be explicit.",
        options: [
          {
            text: "Check for null and undefined explicitly rather than testing truthiness",
            isCorrect: true,
          },
          { text: "Use `if (count == true)` instead" },
          { text: "Convert with `Number(count)` before the check" },
          { text: "Use `if (!!count)` to force a boolean" },
        ],
      },
      {
        question: "Why does `typeof null` return `\"object\"`?",
        explanation:
          "It is a bug from the first version of JavaScript that cannot be fixed without breaking a vast amount of existing code. It carries no meaning — `null` is a primitive, not an object. To test for it, compare with `=== null`.",
        options: [
          {
            text: "A historical bug in the language that cannot be fixed without breaking existing code",
            isCorrect: true,
          },
          { text: "Because null is genuinely an empty object" },
          { text: "Because null inherits from Object.prototype" },
          { text: "Because typeof only reports two categories" },
        ],
      },
      {
        question: "Which of these is truthy?",
        explanation:
          '`"0"` is a non-empty string, and every non-empty string is truthy — the character it contains is irrelevant. The falsy values are exactly: `false`, `0`, `""`, `null`, `undefined` and `NaN`.',
        options: [
          { text: 'The string "0"', isCorrect: true },
          { text: "The number 0" },
          { text: "An empty string" },
          { text: "undefined" },
        ],
      },
    ],
    resources: [
      {
        title: "JavaScript data types and data structures",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Operators ──────────────────────────────────────────────────────────
  {
    topicSlug: "js-operators",
    title: "Operators",
    description:
      "Doing things with values — arithmetic, comparison, logic, and the operators that handle missing data.",
    estimatedTime: "1 hour",
    sections: [
      {
        type: "TEXT",
        title: "Symbols that produce a value",
        content:
          "An operator takes one or two values and produces a new one. You already know most of the arithmetic from school; the ones worth real attention are comparison and logic, because they are what conditions are built from.",
      },
      {
        type: "CODE",
        content: "Arithmetic, with two that may be unfamiliar:",
        code: `10 + 3    // 13
10 - 3    // 7
10 * 3    // 30
10 / 3    // 3.333…
10 % 3    // 1   — remainder after division
10 ** 3   // 1000 — exponentiation

let n = 5;
n += 2;   // 7 — shorthand for n = n + 2
n++;      // 8 — increment by one`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "`%` (remainder, often called modulo) is more useful than it looks. `n % 2 === 0` tests whether a number is even. `index % colours.length` cycles through a list forever without running off the end.",
      },
      {
        type: "HEADING",
        content: "Comparison, and why === matters",
      },
      {
        type: "TEXT",
        content:
          "JavaScript has two equality operators, and one of them is a trap.\n\n`===` (strict equality) compares type and value. `==` (loose equality) converts types first, then compares — which produces results almost nobody wants.",
      },
      {
        type: "EXAMPLE",
        title: "Loose equality, in its own words",
        content: "Every one of these is true:",
        code: `"5" == 5        // true  — string converted to number
0 == ""         // true  — both become 0
0 == false      // true
null == undefined // true

// With strict equality, all of them are false:
"5" === 5       // false
0 === ""        // false`,
        language: "javascript",
      },
      {
        type: "CALLOUT",
        content:
          "Use `===` and `!==` by default. The one common exception is `value == null`, which checks for null *and* undefined in a single comparison — a genuinely useful shorthand, and the only loose comparison most style guides allow.",
      },
      {
        type: "HEADING",
        content: "Logical operators",
      },
      {
        type: "TEXT",
        content:
          "`&&` (and) is true when both sides are; `||` (or) is true when either is; `!` (not) flips a boolean.\n\nThe part worth understanding is that `&&` and `||` do not return `true` or `false` — they return one of the operands. `\"hello\" || \"fallback\"` returns `\"hello\"`, not `true`. This is what makes them useful for choosing values, and it is also where a subtle bug lives.",
      },
      {
        type: "TEXT",
        title: "Short-circuiting",
        content:
          "`&&` stops as soon as it finds something falsy; `||` stops as soon as it finds something truthy. Neither evaluates the right-hand side if the left already decided the answer.\n\nThat is not just an optimisation — it is a guard. `user && user.name` will not throw when `user` is undefined, because `user.name` is never reached.",
      },
      {
        type: "HEADING",
        content: "The two operators that fix a real problem",
      },
      {
        type: "TEXT",
        content:
          "`||` for defaults has a flaw: it treats every falsy value as missing, so a genuine `0` or `\"\"` gets replaced. `??` (nullish coalescing) falls back only for `null` and `undefined`, which is almost always what was meant.",
      },
      {
        type: "CODE",
        content: "The difference matters as soon as zero is a valid value:",
        code: `const count = 0;

count || 10   // 10  ← wrong: 0 is a real count
count ?? 10   // 0   ← right: 0 is not missing

// Optional chaining stops at null or undefined instead of throwing.
const city = user?.address?.city;   // undefined if either is missing
user.profile?.save?.();             // only calls it if it exists`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "`?.` and `??` pair naturally: `const city = user?.address?.city ?? \"Unknown\"` reads exactly as it behaves. Both are widely supported and you should reach for them freely.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Using `==` out of habit. The coercion rules are genuinely surprising and almost never what you want.\n\nUsing `||` for defaults where `0` or `\"\"` are valid. Use `??`.\n\nChaining comparisons like `1 < x < 10`. It parses as `(1 < x) < 10`, which compares a boolean against 10 and is always true. Write `x > 1 && x < 10`.\n\nAssuming `&&` returns a boolean. It returns an operand, which is usually helpful and occasionally surprising.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Choose `===` deliberately and explain why `==` is avoided. Use `%` for even/odd and cycling. Read a short-circuit expression and say what it returns. Pick `??` over `||` when zero or an empty string are real values. Practice problems on this topic will exercise exactly these.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "`const total = discount || 100;` — `discount` is 0, a valid discount. What goes wrong?",
        explanation:
          "`0` is falsy, so `||` treats it as missing and falls back to 100. `??` only falls back for `null` and `undefined`, so `discount ?? 100` correctly keeps the zero.",
        options: [
          { text: "`total` becomes 100, because 0 is falsy; use `??` instead", isCorrect: true },
          { text: "`total` becomes 0, which is correct" },
          { text: "It throws, because 0 cannot be used with `||`" },
          { text: "`total` becomes `false`" },
        ],
      },
      {
        question: "What does `1 < x < 10` actually evaluate?",
        explanation:
          "It evaluates left to right: `1 < x` produces a boolean, which is then compared with 10. `true` becomes 1 and `false` becomes 0, and both are less than 10 — so the expression is always true. Write `x > 1 && x < 10`.",
        options: [
          {
            text: "`(1 < x) < 10` — a boolean compared with 10, so it is always true",
            isCorrect: true,
          },
          { text: "Whether x is between 1 and 10, as written" },
          { text: "A syntax error" },
          { text: "Whether x is greater than 1, ignoring the rest" },
        ],
      },
      {
        question: "Why does `user && user.name` not throw when `user` is undefined?",
        explanation:
          "`&&` short-circuits: once the left side is falsy the result is decided, so the right side is never evaluated and `user.name` is never accessed. `user?.name` expresses the same guard more directly.",
        options: [
          {
            text: "`&&` short-circuits, so the right side is never evaluated once the left is falsy",
            isCorrect: true,
          },
          { text: "JavaScript returns undefined for any property of undefined" },
          { text: "`&&` catches the error internally" },
          { text: "It does throw; the example is wrong" },
        ],
      },
      {
        question: "Which comparison is a reasonable exception to the \"always use ===\" rule?",
        explanation:
          "`value == null` is true for both `null` and `undefined` and nothing else, which makes it a concise and well-understood check for \"no value\". Most style guides permit this one specifically.",
        options: [
          { text: "`value == null`, which checks for null and undefined together", isCorrect: true },
          { text: "`value == 0`, for numeric checks" },
          { text: "`value == \"\"`, for empty strings" },
          { text: "There are no exceptions" },
        ],
      },
    ],
    resources: [
      {
        title: "Expressions and operators",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Conditions ─────────────────────────────────────────────────────────
  {
    topicSlug: "js-conditions",
    title: "Conditions",
    description: "Making code take different paths depending on the situation.",
    estimatedTime: "1 hour",
    sections: [
      {
        type: "TEXT",
        title: "Choosing what to do",
        content:
          "Until now your programs have run straight through, top to bottom. A condition lets a program take one path or another — show an error if a field is empty, apply a discount if an order is large enough, greet a user by name if you know it.\n\nThis is the point where code starts making decisions, and where reading it carefully starts to matter.",
      },
      {
        type: "CODE",
        content: "The basic shape:",
        code: `const hour = 14;

if (hour < 12) {
  console.log("Good morning");
} else if (hour < 18) {
  console.log("Good afternoon");
} else {
  console.log("Good evening");
}`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "Branches are checked in order and the first match wins — the rest are skipped entirely. That is why `hour < 18` does not need to also check `hour >= 12`: if it were under 12, the first branch would already have run.\n\nThis ordering is worth internalising, because a condition placed in the wrong order silently swallows the ones after it.",
      },
      {
        type: "HEADING",
        content: "Conditions are truthiness tests",
      },
      {
        type: "TEXT",
        content:
          "`if` does not require a boolean. It converts whatever it is given, using the truthy and falsy rules from the data types lesson.\n\nThat is convenient and it is where the sharp edge is. `if (count)` looks like \"if there is a count\", but reads as \"if count is truthy\" — and `0` is falsy, so a real count of zero takes the wrong branch.",
      },
      {
        type: "EXAMPLE",
        title: "Say what you mean",
        content: "Two conditions that look equivalent and are not:",
        code: `// Skips a genuine zero and a genuine empty string.
if (quantity) { … }

// Asks the question actually intended.
if (quantity != null) { … }

// Or, if the real rule is "more than none":
if (quantity > 0) { … }`,
        language: "javascript",
      },
      {
        type: "HEADING",
        content: "The ternary, for choosing a value",
      },
      {
        type: "TEXT",
        content:
          "When a condition picks between two *values* rather than two blocks of work, the ternary operator is shorter and reads well:\n\n`const label = count === 1 ? \"item\" : \"items\";`\n\nUse it for exactly that. Nesting ternaries inside ternaries is where readability collapses — at that point an `if` chain is kinder to whoever reads it next, including you.",
      },
      {
        type: "HEADING",
        content: "switch",
      },
      {
        type: "TEXT",
        content:
          "When you are comparing one value against several fixed options, `switch` is often clearer than a long `else if` chain.",
      },
      {
        type: "CODE",
        content: "Note the `break` on every case:",
        code: `switch (status) {
  case "loading":
    showSpinner();
    break;
  case "error":
    showError();
    break;
  case "success":
    showData();
    break;
  default:
    showEmpty();
}`,
        language: "javascript",
      },
      {
        type: "WARNING",
        title: "Forgetting break",
        content:
          "Without `break`, execution falls through into the next case and keeps going. Miss one after `\"loading\"` and a loading status will show the spinner *and* the error.\n\nIt is occasionally intentional — two cases sharing one body — but when it is, say so in a comment, because every reader will otherwise assume it is a bug.",
      },
      {
        type: "HEADING",
        content: "Guard clauses",
      },
      {
        type: "TEXT",
        content:
          "Deeply nested conditions are hard to follow. A guard clause handles the exceptional case immediately and returns, leaving the main path flat and unindented.",
      },
      {
        type: "CODE",
        content: "The same logic, nested and flattened:",
        code: `// Nested: the real work is three levels in.
function save(user) {
  if (user) {
    if (user.email) {
      if (isValid(user.email)) {
        write(user);
      }
    }
  }
}

// Guarded: exceptions first, main path last and flat.
function save(user) {
  if (!user) return;
  if (!user.email) return;
  if (!isValid(user.email)) return;

  write(user);
}`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "The second version is easier to read and much easier to add to — a new precondition is one more line at the top rather than another level of indentation. This is a habit worth forming now.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Write if/else chains where the order is deliberate. Explain why `if (count)` is not the same as \"if a count was given\". Choose a ternary for values and an `if` for blocks. Use `switch` with correct `break`s. Flatten nested conditions with guard clauses. Practice problems on this topic will test the ordering.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "In an if/else-if chain, why does `else if (hour < 18)` not need `hour >= 12` as well?",
        explanation:
          "Branches are checked in order and the first match wins. If `hour` were under 12 the first branch would have run and the rest skipped, so reaching this branch already implies `hour >= 12`.",
        options: [
          {
            text: "Reaching that branch means the earlier condition was false, so hour >= 12 is already implied",
            isCorrect: true,
          },
          { text: "JavaScript infers the lower bound automatically" },
          { text: "It does need it; the example is a bug" },
          { text: "`else if` always checks the previous condition again" },
        ],
      },
      {
        question:
          "A `switch` on `status` shows both the spinner and the error when status is \"loading\". What is wrong?",
        explanation:
          "A missing `break` after the `\"loading\"` case. Execution falls through into the next case and continues until it hits a break or the end of the switch.",
        options: [
          { text: "The \"loading\" case is missing a `break`", isCorrect: true },
          { text: "`switch` compares with `==` and matched twice" },
          { text: "The `default` case always runs as well" },
          { text: "The cases are in the wrong order" },
        ],
      },
      {
        question: "What is the main benefit of guard clauses?",
        explanation:
          "They handle exceptional cases immediately and return, so the main path stays flat and unindented. Adding a new precondition becomes one line at the top rather than another level of nesting.",
        options: [
          {
            text: "The main path stays flat and readable, and new preconditions are one line rather than another level",
            isCorrect: true,
          },
          { text: "They run faster than nested conditions" },
          { text: "They allow a function to return more than one value" },
          { text: "They remove the need for else branches entirely in all code" },
        ],
      },
      {
        question: "When is a ternary the right choice over an if statement?",
        explanation:
          "When the condition selects between two values, as in `count === 1 ? \"item\" : \"items\"`. For branching between blocks of work, or when ternaries would nest, an `if` is clearer.",
        options: [
          { text: "When choosing between two values rather than two blocks of work", isCorrect: true },
          { text: "Whenever the condition fits on one line" },
          { text: "When there are three or more branches" },
          { text: "Ternaries should always be preferred; they are faster" },
        ],
      },
    ],
    resources: [
      {
        title: "Making decisions in your code",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Conditionals",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Loops ──────────────────────────────────────────────────────────────
  {
    topicSlug: "js-loops",
    title: "Loops",
    description: "Repeating work without repeating yourself.",
    estimatedTime: "1.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "Doing something many times",
        content:
          "A loop runs a block of code repeatedly. Almost everything you build involves them: rendering a list of products, validating each field in a form, totalling a basket.\n\nThere are several kinds, and the useful skill is picking the one that says most clearly what you mean.",
      },
      {
        type: "HEADING",
        content: "for...of, the one to reach for first",
      },
      {
        type: "CODE",
        content: "When you want each item and nothing else:",
        code: `const names = ["Ada", "Grace", "Alan"];

for (const name of names) {
  console.log(name);
}`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "There is no counter to set up, no bound to get wrong and no indexing. If the loop body only needs the item, this is the clearest option and the hardest to write a bug into.",
      },
      {
        type: "HEADING",
        content: "The classic for loop",
      },
      {
        type: "CODE",
        content: "Three parts, separated by semicolons:",
        code: `for (let i = 0; i < names.length; i++) {
  console.log(i, names[i]);
}`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "Start at `i = 0`; keep going while `i < names.length`; add one each time round. Use it when you genuinely need the index, are counting rather than iterating, or need to step in an unusual way.\n\nNote `<` and not `<=`. An array of three has indexes 0, 1 and 2, so `i <= names.length` reads one past the end and gives `undefined`. This is the most common loop bug there is, and it has a name — an off-by-one error.",
      },
      {
        type: "HEADING",
        content: "while",
      },
      {
        type: "TEXT",
        content:
          "`while` repeats as long as a condition holds, and you use it when the number of iterations is not known in advance — retrying until something succeeds, or consuming a queue until it is empty.\n\nThe risk is that nothing forces the condition to change. If the body never moves towards making it false, the loop runs forever and the page freezes, because JavaScript runs on a single thread and nothing else gets a turn.",
      },
      {
        type: "CODE",
        content: "The body must move towards the exit:",
        code: `let remaining = 3;

while (remaining > 0) {
  console.log(remaining);
  remaining--;      // without this, the tab locks up
}`,
        language: "javascript",
      },
      {
        type: "HEADING",
        content: "break and continue",
      },
      {
        type: "TEXT",
        content:
          "`break` leaves the loop immediately. `continue` skips the rest of the current iteration and moves to the next. Both are useful and both are easy to overuse — a loop with several `break`s scattered through it is usually a sign the logic wants to be a function with early returns instead.",
      },
      {
        type: "CODE",
        content: "Skip, then stop:",
        code: `for (const order of orders) {
  if (order.cancelled) continue;   // skip this one
  if (order.total > limit) break;  // stop entirely

  process(order);
}`,
        language: "javascript",
      },
      {
        type: "HEADING",
        content: "A look ahead: array methods",
      },
      {
        type: "TEXT",
        content:
          "For arrays specifically, JavaScript has methods that express common loops directly — `forEach`, `map`, `filter`, `reduce`. `map` transforms every item into a new array; `filter` keeps the ones matching a test.\n\nThey are usually clearer than a manual loop because the method name states the intent. You will meet them properly in the Arrays topic; for now it is enough to know that a `for` loop building a new array is often a `map` waiting to happen.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Off-by-one: `i <= array.length` reads past the end. Use `<`.\n\nModifying an array while looping over it by index. Removing an item shifts everything down and the loop skips one.\n\nA `while` whose condition never becomes false. The tab freezes — there is no separate thread to notice.\n\nUsing a `for` loop to build a new array when `map` would say it in one line.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Choose between `for...of`, a counted `for` and `while` based on what you need. Avoid off-by-one errors and explain why they happen. Use `break` and `continue` sparingly. Recognise when an array method would be clearer. This topic has the most practice problems in the phase — they are worth doing before moving on to Functions.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "`for (let i = 0; i <= items.length; i++)` over a 3-item array. What happens on the last iteration?",
        explanation:
          "`i` reaches 3, but valid indexes are 0, 1 and 2 — so `items[3]` is `undefined`. The condition should be `i < items.length`. This off-by-one is the most common loop bug there is.",
        options: [
          { text: "`items[3]` is undefined, because valid indexes stop at 2", isCorrect: true },
          { text: "The loop stops early and skips the last item" },
          { text: "It throws an index out of range error" },
          { text: "It wraps around and reads the first item again" },
        ],
      },
      {
        question:
          "A `while` loop's condition never becomes false. What happens in a browser?",
        explanation:
          "The page freezes. JavaScript runs on a single thread, so an infinite loop blocks everything — rendering, clicks, the lot — until the browser offers to stop the script. Every `while` body must move towards its exit condition.",
        options: [
          {
            text: "The page freezes, because JavaScript is single-threaded and nothing else can run",
            isCorrect: true,
          },
          { text: "The browser automatically stops it after 100 iterations" },
          { text: "It runs in the background without affecting the page" },
          { text: "The loop throws a RangeError immediately" },
        ],
      },
      {
        question: "When is `for...of` a better choice than a counted `for` loop?",
        explanation:
          "When the body only needs each item. There is no counter, no bound and no indexing, which removes the most common sources of loop bugs. Use a counted `for` when you genuinely need the index or a non-standard step.",
        options: [
          {
            text: "When you need each item and not its index — there is less to get wrong",
            isCorrect: true,
          },
          { text: "When the array is very large, because it is faster" },
          { text: "When you need to modify the array while looping" },
          { text: "When the loop must run a fixed number of times" },
        ],
      },
      {
        question: "What is the difference between `break` and `continue`?",
        explanation:
          "`break` exits the loop entirely; `continue` abandons the current iteration and moves to the next. In the example, cancelled orders are skipped with `continue` while an over-limit order stops the loop with `break`.",
        options: [
          {
            text: "`break` exits the loop; `continue` skips to the next iteration",
            isCorrect: true,
          },
          { text: "`break` skips one iteration; `continue` exits the loop" },
          { text: "They are equivalent inside a `for` loop" },
          { text: "`break` only works in switch statements" },
        ],
      },
    ],
    resources: [
      {
        title: "Looping code",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Loops",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Objects ────────────────────────────────────────────────────────────
  {
    topicSlug: "js-objects",
    title: "Objects",
    description:
      "Grouping related data under names — the shape almost all real data arrives in.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "Related values, kept together",
        content:
          "An array is a list of things in order. An object is a set of named values describing one thing.\n\nA user has a name, an email and an age. Keeping those in three separate variables works until you have two users. An object keeps them together, and names each part.",
      },
      {
        type: "CODE",
        content: "Creating and reading an object:",
        code: `const user = {
  name: "Ada",
  email: "ada@example.com",
  age: 36,
};

user.name          // "Ada"    — dot notation
user["email"]      // "…"      — bracket notation

const field = "age";
user[field]        // 36 — brackets when the key is in a variable`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "Use dot notation by default; it is shorter and clearer. Brackets are for when the key is held in a variable, or when it is not a valid identifier — `user[\"first name\"]`.",
      },
      {
        type: "HEADING",
        content: "Objects and arrays go together",
      },
      {
        type: "TEXT",
        content:
          "Almost all real data is an array of objects: a list of products, a list of orders, a list of users. Every API you call will hand you something with this shape, so it is worth being comfortable with it now.",
      },
      {
        type: "CODE",
        content: "The shape you will see constantly:",
        code: `const products = [
  { id: 1, name: "Sourdough", price: 4.5, inStock: true },
  { id: 2, name: "Baguette",  price: 2.8, inStock: false },
];

products[0].name                              // "Sourdough"
products.filter((p) => p.inStock).length      // 1`,
        language: "javascript",
      },
      {
        type: "HEADING",
        content: "Reference, not copy",
      },
      {
        type: "TEXT",
        content:
          "This is the most important idea in the lesson, and it catches everyone.\n\nA variable holding an object does not hold the object — it holds a reference to it. Assigning it to another variable copies the reference, not the object. Both names now point at the same thing, so changing it through one is visible through the other.",
      },
      {
        type: "EXAMPLE",
        title: "One object, two names",
        content: "Compare with a primitive, which does copy:",
        code: `const a = { count: 1 };
const b = a;
b.count = 99;
console.log(a.count);   // 99 — same object

let x = 1;
let y = x;
y = 99;
console.log(x);         // 1 — numbers are copied`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "To get a genuine copy, spread it into a new object: `const b = { ...a }`. Note this is a *shallow* copy — nested objects inside are still shared references. `structuredClone(a)` makes a deep copy when you genuinely need one.\n\nNotice also that `const` did not prevent the change. `const` stops the variable being reassigned; it does not freeze the object it points at.",
      },
      {
        type: "HEADING",
        content: "Destructuring and spread",
      },
      {
        type: "CODE",
        content: "Two pieces of syntax you will see in every codebase:",
        code: `// Pull named values out into variables.
const { name, email } = user;

// With a default for a key that may be absent.
const { role = "member" } = user;

// Copy and override, without mutating the original.
const updated = { ...user, age: 37 };`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "That last pattern — spread, then override — is how updates are written throughout modern JavaScript, and it is the standard way to update state in React. Getting comfortable with it now pays off directly in the React phase.",
      },
      {
        type: "HEADING",
        content: "Walking an object",
      },
      {
        type: "CODE",
        content: "Three ways, depending on what you need:",
        code: `Object.keys(user)     // ["name", "email", "age"]
Object.values(user)   // ["Ada", "ada@example.com", 36]
Object.entries(user)  // [["name", "Ada"], …]

for (const [key, value] of Object.entries(user)) {
  console.log(key, value);
}`,
        language: "javascript",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Expecting assignment to copy an object. It copies a reference.\n\nAssuming `const` makes an object immutable. It does not — only the binding is fixed.\n\nReading a nested property that may not exist. `user.address.city` throws when `address` is undefined; `user.address?.city` gives `undefined` instead.\n\nTreating a spread copy as deep. Nested objects are still shared.\n\nUsing `for...in` on an array. It iterates keys as strings and can pick up inherited properties. Use `for...of` for arrays.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Build and read objects, and work with arrays of them. Explain why changing an object through one variable is visible through another, and copy correctly when you need to. Destructure values and use spread to update without mutating. Optional chaining will save you from a great many crashes. The DOM, next, is itself a tree of objects — this is the lesson that makes it readable.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "`const a = { count: 1 }; const b = a; b.count = 99;` — what is `a.count`?",
        explanation:
          "99. `b = a` copies the reference, not the object, so both names point at the same thing. `const` prevents reassigning the variable; it does not freeze the object. Use `{ ...a }` for a shallow copy.",
        options: [
          { text: "99 — both variables reference the same object", isCorrect: true },
          { text: "1 — assignment creates a copy" },
          { text: "undefined — const objects cannot be modified" },
          { text: "It throws, because `a` is const" },
        ],
      },
      {
        question:
          "`user.address.city` throws when a user has no address. What is the smallest fix?",
        explanation:
          "`user.address?.city`. Optional chaining stops and yields `undefined` if the value before it is null or undefined, instead of throwing. Pair it with `??` to supply a fallback.",
        options: [
          { text: "`user.address?.city`", isCorrect: true },
          { text: "`user.address.city ?? \"\"`" },
          { text: "Wrap every property read in a try/catch" },
          { text: "Check `typeof user.address.city !== \"undefined\"` first" },
        ],
      },
      {
        question: "What does `{ ...user, age: 37 }` produce?",
        explanation:
          "A new object with all of `user`'s properties and `age` set to 37, leaving the original untouched. This copy-and-override pattern is how updates are written throughout modern JavaScript, including React state.",
        options: [
          {
            text: "A new object with user's properties and age overridden, leaving the original unchanged",
            isCorrect: true,
          },
          { text: "The same object with age changed in place" },
          { text: "An object containing only the age property" },
          { text: "A deep copy of user with all nested objects duplicated" },
        ],
      },
      {
        question: "When should you use bracket notation instead of dot notation?",
        explanation:
          "When the key is held in a variable, or is not a valid identifier — `user[field]` or `user[\"first name\"]`. Dot notation is shorter and clearer everywhere else.",
        options: [
          {
            text: "When the key is in a variable, or is not a valid identifier",
            isCorrect: true,
          },
          { text: "When the value is an object rather than a primitive" },
          { text: "When reading rather than writing a property" },
          { text: "Bracket notation should always be preferred" },
        ],
      },
    ],
    resources: [
      {
        title: "Working with objects",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Scope and closures ─────────────────────────────────────────────────
  {
    topicSlug: "js-scope",
    title: "Scope and Closures",
    description:
      "Where a variable can be seen from, and why a function remembers where it was written.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "Where a name is visible",
        content:
          "Scope is the answer to \"from where can this variable be seen?\". Getting it wrong produces two symptoms you will recognise: a variable that is unexpectedly `undefined`, and a variable that unexpectedly still holds a value from somewhere else.",
      },
      {
        type: "LIST",
        content: "There are three levels, from outermost in:",
        items: [
          "Global — declared outside every function and block. Visible everywhere, which is why it should be rare.",
          "Function — declared inside a function. Visible throughout that function, including in functions nested within it.",
          "Block — declared with `let` or `const` inside any `{ }`. Visible only within those braces.",
        ],
      },
      {
        type: "CODE",
        content: "Block scope in action:",
        code: `function example() {
  if (true) {
    let blockScoped = "inside";
    var functionScoped = "also inside";
  }

  console.log(functionScoped); // "also inside" — var ignores the block
  console.log(blockScoped);    // ReferenceError — let does not
}`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "This is the practical difference between `var` and `let`, and the reason modern code uses `const` and `let` exclusively. `var` leaks out of the block it was written in, which produces bugs that are genuinely hard to see.\n\nUse `const` by default. Use `let` when the value must change. There is no situation in new code that calls for `var`.",
      },
      {
        type: "HEADING",
        content: "The scope chain",
      },
      {
        type: "TEXT",
        content:
          "When JavaScript meets a name, it looks in the current scope. Not there? It looks in the enclosing scope. Then the one outside that, up to global. If it is nowhere, you get a ReferenceError.\n\nIt only ever looks *outward*. An outer scope cannot see into a function declared inside it — which is exactly what makes functions useful units of isolation.",
      },
      {
        type: "HEADING",
        content: "Closures",
      },
      {
        type: "TEXT",
        content:
          "A closure is a function together with the scope it was created in. When a function is defined inside another, it keeps access to the outer function's variables — and it keeps that access even after the outer function has finished running.\n\nThat last part is what makes closures surprising, and what makes them useful.",
      },
      {
        type: "EXAMPLE",
        title: "A counter that remembers",
        content: "`createCounter` has already returned. Its `count` is still alive:",
        code: `function createCounter() {
  let count = 0;

  return function () {
    count += 1;
    return count;
  };
}

const next = createCounter();
next();   // 1
next();   // 2

const other = createCounter();
other();  // 1 — a separate count`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "`count` is not global and cannot be reached from outside — there is no way to set it to 100 from elsewhere. The only access is through the returned function. That is genuine privacy, built out of nothing but scope.\n\nAnd each call to `createCounter` produces a fresh scope, which is why `other` starts again at 1.",
      },
      {
        type: "CALLOUT",
        content:
          "You have already been using closures without naming them. Every event handler that refers to a variable from the surrounding function is a closure. Every callback passed to `setTimeout` that remembers something is a closure. Naming the mechanism just lets you reason about it deliberately.",
      },
      {
        type: "HEADING",
        content: "The loop trap",
      },
      {
        type: "TEXT",
        content:
          "The classic closure puzzle, and it is worth understanding because it explains what closures actually capture.",
      },
      {
        type: "CODE",
        content: "One of these logs 3, 3, 3. The other logs 0, 1, 2:",
        code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 3, 3, 3

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 0, 1, 2`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "A closure captures the *variable*, not a snapshot of its value. With `var` there is one `i` shared by all three callbacks, and by the time they run the loop has finished and `i` is 3.\n\n`let` creates a new binding for each iteration, so each callback closes over its own `i`. This is one more reason `var` is not worth keeping around.",
      },
      {
        type: "TEXT",
        title: "Hoisting, briefly",
        content:
          "Declarations are processed before code runs. A `function` declaration is fully hoisted and can be called before the line that defines it. A `var` is hoisted but starts as `undefined`. A `let` or `const` is hoisted but cannot be touched before its declaration — the gap is called the temporal dead zone, and it produces a clear error rather than a silent `undefined`.\n\nThe practical advice needs no theory: declare things before you use them, and this stops being something you have to think about.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Using `var` and being surprised when a variable escapes its block.\n\nExpecting a closure to capture a value. It captures the variable.\n\nAccidentally creating a global by assigning without a declaration. `count = 5` inside a function creates a global in non-strict mode. Modules are strict by default, which turns this into an error.\n\nHolding large objects in a closure that outlives them. The reference keeps them in memory.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Say where any variable is visible from and why. Explain the difference between `var` and `let` in terms of block scope. Read a closure and say what it has captured. Predict the output of both loop examples. This is the last topic in the beginner JavaScript chain — from here the roadmap moves to the DOM, where these ideas start manipulating real pages.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "Why does the `var` version of the loop log 3, 3, 3 while the `let` version logs 0, 1, 2?",
        explanation:
          "A closure captures the variable itself, not its value at the time. `var` has one binding shared by all three callbacks, and by the time they run the loop has finished with `i` at 3. `let` creates a fresh binding each iteration.",
        options: [
          {
            text: "`var` has one shared binding; `let` creates a new binding each iteration, and closures capture the variable",
            isCorrect: true,
          },
          { text: "`setTimeout` behaves differently depending on the declaration used" },
          { text: "`let` makes setTimeout run synchronously" },
          { text: "`var` converts the number to a string" },
        ],
      },
      {
        question:
          "In the counter example, why can nothing outside set `count` to 100?",
        explanation:
          "`count` lives in `createCounter`'s scope, and scope lookup only goes outward — nothing outside can see in. The returned function is the only thing holding a reference, so it is the only route to the value. That is genuine privacy from scope alone.",
        options: [
          {
            text: "`count` is in a scope nothing outside can reach; only the returned function has access",
            isCorrect: true,
          },
          { text: "It is declared with `const`, so it cannot be changed" },
          { text: "JavaScript marks variables in returned functions as read-only" },
          { text: "It can be — `createCounter.count = 100` works" },
        ],
      },
      {
        question: "What is the practical difference between `var` and `let`?",
        explanation:
          "`let` is scoped to the enclosing block; `var` is scoped to the whole function and leaks out of blocks. That leaking is a real source of hard-to-see bugs, which is why modern code uses `const` and `let` only.",
        options: [
          {
            text: "`let` is block-scoped; `var` is function-scoped and leaks out of blocks",
            isCorrect: true,
          },
          { text: "`let` is faster to look up at runtime" },
          { text: "`var` cannot be reassigned" },
          { text: "They behave identically in modern browsers" },
        ],
      },
      {
        question: "Have you already written closures before learning the term?",
        explanation:
          "Almost certainly. Any event handler or callback that refers to a variable from its surrounding function is a closure. The mechanism was already working; naming it is what lets you reason about it on purpose.",
        options: [
          {
            text: "Yes — any callback or event handler using a surrounding variable is a closure",
            isCorrect: true,
          },
          { text: "No — closures only exist when a function returns another function" },
          { text: "No — closures must be created with a special keyword" },
          { text: "Only if the outer function has already returned" },
        ],
      },
    ],
    resources: [
      {
        title: "Closures",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },
];
