import type { SeedLesson } from "./types";

/**
 * Foundational full-stack lessons. These are separate Topic records from the
 * frontend and backend roadmaps, so the content is written for someone who
 * will cross the boundary rather than specialise on one side.
 */
export const FULLSTACK_LESSONS: SeedLesson[] = [
  {
    topicSlug: "fs-http",
    title: "HTTP and the Request Cycle",
    description: "The contract between the two halves you're about to build.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "Why this matters more in full stack",
        content:
          'As a full-stack developer you write both ends of every request. When something breaks, nobody hands you a boundary to blame — you have to work out which side is wrong.\n\nHTTP is that boundary. Understanding it well is what lets you say "the server sent the wrong status" instead of "the frontend is broken".',
      },
      {
        type: "HEADING",
        content: "The shape of a request",
      },
      {
        type: "TEXT",
        content:
          "Every request has a method (what you intend), a path (what you're addressing), headers (metadata), and often a body (the content). The response has a status code (what happened), headers, and usually a body.\n\nThat's the whole protocol. Everything else is convention layered on top.",
      },
      {
        type: "CODE",
        content: "The same exchange, from both sides:",
        code: `// Client — the frontend half you write
const response = await fetch("/api/notes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Buy flour" }),
});

if (!response.ok) {
  throw new Error("Could not save the note");
}

const note = await response.json();`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "`response.ok` is true for any 2xx status. It is *not* true for 404 or 500 — and critically, `fetch` does not throw on those. It only rejects if the request never completed at all.\n\nThat single fact causes more full-stack bugs than almost anything else: code that assumes a failed request will throw, and silently treats an error page as data.",
      },
      {
        type: "CALLOUT",
        content:
          "fetch resolves for 404 and 500. Always check `response.ok` before reading the body, or you'll parse an error response as if it were your data.",
      },
      {
        type: "HEADING",
        content: "Choosing status codes as the server",
      },
      {
        type: "TEXT",
        content:
          "Now the other half. The status code you return is what your own frontend will branch on, so being sloppy here creates work for yourself later.\n\n2xx succeeded. 4xx means the client sent something wrong — don't retry, fix the request. 5xx means the server broke — retrying might work.",
      },
      {
        type: "LIST",
        content: "The ones you'll reach for constantly:",
        items: [
          "200 — here's what you asked for.",
          "201 — I created something new.",
          "400 — your request was invalid.",
          "401 — I don't know who you are.",
          "403 — I know who you are, and no.",
          "404 — there's nothing here.",
          "500 — I broke.",
        ],
      },
      {
        type: "EXAMPLE",
        title: "Both halves agreeing",
        content:
          "A server that returns honest statuses lets the client write honest handling:",
        code: `// Server
if (!isValidEmail(body.email)) {
  return Response.json({ error: "Enter a valid email." }, { status: 400 });
}

// Client
const response = await fetch("/api/signup", { /* … */ });

if (response.status === 400) {
  const { error } = await response.json();
  setFieldError(error);          // show it on the form
} else if (!response.ok) {
  setError("Something went wrong. Please try again.");
}`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "The 400 carries a message meant for a person, so the form can display it. Anything else unexpected gets a generic message — because an internal failure should never be shown to a user verbatim.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Returning 200 with `{ error: ... }` in the body. The client's `response.ok` check passes, and the error is treated as data.\n\nForgetting `Content-Type: application/json`, so the server parses the body as text and sees nothing.\n\nShowing raw server errors in the interface. Users get a stack trace; you get a support ticket and a security problem.\n\nAssuming `fetch` throws on HTTP errors. It doesn't.",
      },
    ],
    knowledgeChecks: [
      {
        question: "Does fetch throw an error when the server returns 404?",
        explanation:
          "No. fetch resolves normally for any completed response, including 404 and 500 — it only rejects when the request itself failed, such as a network error. You must check response.ok yourself.",
        options: [
          { text: "No — you must check response.ok yourself", isCorrect: true },
          { text: "Yes, it throws for any status above 399" },
          { text: "Yes, but only for 500 errors" },
          { text: "Only if you pass a special option" },
        ],
      },
      {
        question: "Your API rejects an invalid email. What should it return?",
        explanation:
          "400 with a human-readable message. Returning 200 with an error in the body means the client's success check passes and the error gets treated as data — a bug you then have to debug across both halves.",
        options: [
          { text: "400 with a message the form can display", isCorrect: true },
          { text: "200 with an error field in the body" },
          { text: "500 so it appears in error monitoring" },
          { text: "204 with no content" },
        ],
      },
      {
        question: "What should a user see when the server throws an unexpected error?",
        explanation:
          "A friendly, generic message. The real detail belongs in your logs. Showing raw errors leaks internal structure and gives the user nothing they can act on.",
        options: [
          {
            text: "A generic message, with the detail logged server-side",
            isCorrect: true,
          },
          { text: "The full stack trace, so they can report it" },
          { text: "Nothing at all" },
          { text: "The database query that failed" },
        ],
      },
    ],
    resources: [
      {
        title: "Using the Fetch API",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },
  {
    topicSlug: "fs-js-basics",
    title: "JavaScript Language Fundamentals",
    description:
      "The one language you'll use on both sides — learned once, applied twice.",
    estimatedTime: "6 hours",
    sections: [
      {
        type: "TEXT",
        title: "Why JavaScript is the hinge of this roadmap",
        content:
          "JavaScript runs in the browser and, through Node.js, on the server. For a full-stack developer that's an unusually good deal: the syntax you learn now covers both halves, so the backend phases later are about new *concepts* rather than a second language.\n\nThat's why this phase is long. Time here is repaid twice.",
      },
      {
        type: "HEADING",
        content: "Values and variables",
      },
      {
        type: "CODE",
        content: "Declaring values:",
        code: `const name = "Ada";        // cannot be reassigned
let count = 0;             // can be reassigned
count = count + 1;

const isReady = true;      // boolean
const nothing = null;      // deliberately empty`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "Use `const` by default and `let` only when something genuinely changes. The keyword then tells a reader whether a value is stable — which is information you get for free.",
      },
      {
        type: "HEADING",
        content: "Functions",
      },
      {
        type: "TEXT",
        content:
          "A function is a named, reusable block of logic. Parameters carry information in; `return` sends a result back out.",
      },
      {
        type: "CODE",
        content: "Both syntaxes you'll meet:",
        code: `function add(a, b) {
  return a + b;
}

const multiply = (a, b) => a * b;

add(2, 3);        // 5
multiply(2, 3);   // 6`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "The arrow form returns automatically when the body is a single expression. You'll see it constantly in array methods and React — same idea, shorter.",
      },
      {
        type: "HEADING",
        content: "Conditions and control flow",
      },
      {
        type: "CODE",
        content: "Branching:",
        code: `const score = 72;

if (score >= 70) {
  console.log("Passed");
} else {
  console.log("Not yet");
}

// Shorter, when you need a value rather than a branch
const result = score >= 70 ? "Passed" : "Not yet";`,
        language: "javascript",
      },
      {
        type: "CALLOUT",
        content:
          'Use `===` rather than `==`. The double equals converts types before comparing, so `"1" == 1` is true — which is almost never what you meant. Triple equals compares without converting.',
      },
      {
        type: "HEADING",
        content: "Objects: the shape data actually arrives in",
      },
      {
        type: "TEXT",
        content:
          "An object groups related values under names. This matters especially in full stack, because it's the shape of every JSON payload crossing between your halves.",
      },
      {
        type: "CODE",
        content: "Creating and reading an object:",
        code: `const user = {
  id: 42,
  email: "ada@example.com",
  isAdmin: false,
};

console.log(user.email);      // "ada@example.com"

// Pulling values out by name
const { email, isAdmin } = user;`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "That last line is destructuring — it reads named properties into variables. You'll see it in nearly every React component and API handler you write.",
      },
      {
        type: "TEXT",
        title: "Where this shows up in real work",
        content:
          "A request body arrives as an object. A database row comes back as an object. A React component receives its props as an object. The array of results you render is an array of objects.\n\nOnce objects and functions are comfortable, most JavaScript you meet is a rearrangement of things you already know.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Using `==` instead of `===` and being surprised by type coercion.\n\nExpecting `const` to make an object immutable. It stops reassignment of the name; the object's properties can still change.\n\nForgetting that a missing property is `undefined` rather than an error — `user.emial` gives you `undefined`, silently, and the bug surfaces much later.\n\nComparing objects with `===`. That compares identity, not contents: two objects with identical properties are not equal.",
      },
    ],
    knowledgeChecks: [
      {
        question: "Why use === instead of ==?",
        explanation:
          '== converts types before comparing, so "1" == 1 is true. === compares value and type without conversion, which is almost always what you actually meant.',
        options: [
          { text: "=== compares without converting types", isCorrect: true },
          { text: "=== is faster" },
          { text: "== was removed from JavaScript" },
          { text: "They behave identically" },
        ],
      },
      {
        question: "What does `const { email } = user;` do?",
        explanation:
          "It's destructuring — it reads the `email` property from `user` into a variable of the same name. You'll see this constantly in React props and API handlers.",
        options: [
          {
            text: "Reads the email property into a variable named email",
            isCorrect: true,
          },
          { text: "Creates a new object containing only email" },
          { text: "Deletes email from the user object" },
          { text: "Renames the user object to email" },
        ],
      },
      {
        question:
          "What do you get from `user.emial` when the property is spelled `email`?",
        explanation:
          "undefined — silently. JavaScript doesn't error on a missing property, so a typo surfaces much later as a confusing undefined somewhere else. This is a large part of why TypeScript is worth adding.",
        options: [
          { text: "undefined, with no error", isCorrect: true },
          { text: "An error is thrown immediately" },
          { text: "null" },
          { text: "An empty string" },
        ],
      },
      {
        question: "Why is JavaScript a good first language for full-stack work?",
        explanation:
          "It runs in the browser and on the server through Node.js, so one language covers both halves. The backend phases become about new concepts — data, auth, deployment — rather than learning a second syntax.",
        options: [
          { text: "It runs on both the client and the server", isCorrect: true },
          { text: "It is the fastest language available" },
          { text: "It is the only language browsers support for styling" },
          { text: "It removes the need to understand HTTP" },
        ],
      },
    ],
    resources: [
      {
        title: "JavaScript first steps",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },
  {
    topicSlug: "fs-databases",
    title: "Databases and SQL",
    description: "Where your data lives, and how to get exactly what you need.",
    estimatedTime: "6 hours",
    sections: [
      {
        type: "TEXT",
        title: "Why not just use a file?",
        content:
          'You could store data in a JSON file. It works until two requests write at once and one overwrites the other, or the file grows past what fits in memory, or you need "all users who signed up last week" and have to load everything to find out.\n\nA database solves those: concurrent access without corruption, querying without loading everything, and guarantees that survive a crash mid-write.',
      },
      {
        type: "HEADING",
        content: "Tables, rows and columns",
      },
      {
        type: "TEXT",
        content:
          'A relational database stores data in tables. A table has columns (the fields, each with a type) and rows (the records). It\'s a spreadsheet with rules that are actually enforced.\n\nThose rules are the value. A column declared as an integer cannot contain "banana". A column marked unique cannot hold a duplicate. The database refuses bad data rather than trusting every piece of code that touches it.',
      },
      {
        type: "CODE",
        content: "Defining a table:",
        code: `CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);`,
        language: "sql",
      },
      {
        type: "TEXT",
        content:
          "`PRIMARY KEY` uniquely identifies a row. `NOT NULL` means the column must have a value. `UNIQUE` means no two rows may share one — which is how you stop duplicate signups at the database level rather than hoping the application always checks.",
      },
      {
        type: "HEADING",
        content: "Relationships",
      },
      {
        type: "TEXT",
        content:
          "Data is split across tables so nothing is repeated. Notes belong to users, so instead of copying the user's email onto every note, each note stores the user's id.",
      },
      {
        type: "CODE",
        content: "A foreign key ties the two together:",
        code: `CREATE TABLE notes (
  id      SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title   TEXT NOT NULL
);`,
        language: "sql",
      },
      {
        type: "TEXT",
        content:
          "`REFERENCES users(id)` means the database will reject a note pointing at a user who doesn't exist. `ON DELETE CASCADE` says that deleting a user deletes their notes rather than leaving orphans behind.",
      },
      {
        type: "CALLOUT",
        content:
          "Constraints are cheaper than bug reports. Every rule the database enforces is one your application code no longer has to remember — and one a future bug cannot violate.",
      },
      {
        type: "HEADING",
        content: "Querying",
      },
      {
        type: "CODE",
        content: "Reading data back:",
        code: `SELECT users.email, notes.title
FROM notes
JOIN users ON users.id = notes.user_id
WHERE users.email = $1
ORDER BY notes.id DESC
LIMIT 20;`,
        language: "sql",
      },
      {
        type: "TEXT",
        content:
          "`$1` is a parameter placeholder. The value is sent separately from the statement, so it can never be interpreted as SQL. This is how you prevent injection — and it is not optional.",
      },
      {
        type: "TEXT",
        title: "ORMs",
        content:
          "In practice you'll often use an ORM — this project uses Prisma — which lets you query in JavaScript and generates the SQL for you. It's genuinely convenient and handles parameterisation correctly by default.\n\nBut it generates SQL, and when something is slow that SQL is what you read. An ORM makes easy queries easier; it doesn't remove the need to understand joins.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Building queries by concatenating user input. Use parameters, always.\n\nQuerying in a loop — one query per item — when a single join would do. This is the N+1 problem and it's the most common cause of a slow endpoint.\n\nNo indexes on columns you filter by. Fine at a thousand rows, painful at a million.\n\nStoring the same fact in two tables. Now they can disagree, and eventually they will.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What does a UNIQUE constraint on an email column give you?",
        explanation:
          "The database itself refuses a duplicate. That holds even if a bug, a race between two requests, or a script bypasses your application checks — which is exactly why it belongs in the schema rather than only in code.",
        options: [
          { text: "The database rejects duplicate emails outright", isCorrect: true },
          { text: "It sorts the rows by email" },
          { text: "It makes queries on email faster only" },
          { text: "It encrypts the email column" },
        ],
      },
      {
        question: "How should a user-supplied value be included in a query?",
        explanation:
          "As a parameter. The value travels separately from the statement, so it cannot be interpreted as SQL. Concatenating input is SQL injection, and it is the most reliably exploited vulnerability there is.",
        options: [
          { text: "As a parameter placeholder such as $1", isCorrect: true },
          { text: "Concatenated directly into the string" },
          { text: "After stripping quote characters" },
          { text: "Converted to uppercase first" },
        ],
      },
      {
        question: "What is the N+1 problem?",
        explanation:
          "Running one query to fetch a list, then another query per item — so 20 notes cause 21 round trips. A single join fetches the same data once. It's the most common reason an endpoint that felt fine in development crawls in production.",
        options: [
          {
            text: "Querying once per item instead of once with a join",
            isCorrect: true,
          },
          { text: "Having one more column than you need" },
          { text: "A table with N rows and one index" },
          { text: "Running the same migration twice" },
        ],
      },
      {
        question: "Does using an ORM mean you don't need to understand SQL?",
        explanation:
          "No. An ORM generates SQL, and that SQL is what actually runs. When a query is slow you read what it produced and its execution plan — the ORM makes easy queries easier, not joins free.",
        options: [
          {
            text: "No — it generates SQL, which is what actually runs",
            isCorrect: true,
          },
          { text: "Yes, ORMs remove the need entirely" },
          { text: "Only if you never use joins" },
          { text: "Yes, because ORMs are always faster" },
        ],
      },
    ],
    resources: [
      {
        title: "PostgreSQL tutorial",
        url: "https://www.postgresql.org/docs/current/tutorial.html",
        source: "PostgreSQL",
        type: "DOCUMENTATION",
      },
      {
        title: "Prisma — working with your database",
        url: "https://www.prisma.io/docs/orm/prisma-client/queries/crud",
        source: "Prisma",
        type: "DOCUMENTATION",
      },
    ],
  },
];
