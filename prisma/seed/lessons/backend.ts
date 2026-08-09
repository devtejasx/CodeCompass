import type { SeedLesson } from "./types";

/** Foundational backend lessons. Same teaching shape as the frontend set. */
export const BACKEND_LESSONS: SeedLesson[] = [
  {
    topicSlug: "computer-fundamentals",
    title: "How Computers Work",
    description:
      "Processes, memory and threads — the resources your server competes for.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "Why a backend developer needs this",
        content:
          "On the frontend you can get a long way without thinking about what a process is. On the backend you cannot. Your code runs on a machine with finite memory, shared by other work, handling many requests at once.\n\nWhen a service becomes slow or falls over, the explanation is almost always in this layer.",
      },
      {
        type: "HEADING",
        content: "Programs and processes",
      },
      {
        type: "TEXT",
        content:
          "A program is a file on disk — instructions, sitting there doing nothing. A process is that program actually running: loaded into memory, given a slice of the processor, tracked by the operating system.\n\nOne program can become many processes. Running your server twice gives you two processes that share nothing except the file they came from.",
      },
      {
        type: "CALLOUT",
        content:
          'This is why "it works on my machine" happens. The program is identical; the process runs in a different environment, with different memory available and different variables set.',
      },
      {
        type: "HEADING",
        content: "Memory",
      },
      {
        type: "TEXT",
        content:
          "Memory (RAM) is where a process keeps everything it's currently working with. It is fast and finite. Disk is slow and large.\n\nWhen a process asks for more memory than exists, the operating system either starts swapping to disk — which is dramatically slower — or kills the process. A backend that loads an entire database table into memory works fine with a thousand rows and dies at ten million.",
      },
      {
        type: "LIST",
        content: "The practical consequences you'll actually hit:",
        items: [
          "Reading a whole file into memory fails once files get big — stream it instead.",
          "Fetching every row from a table is fine in development and fatal in production.",
          "A memory leak is code that holds references it no longer needs, so memory only ever grows.",
          'Restarting a process clears its memory, which is why "turn it off and on again" often works — and why it hides the real bug.',
        ],
      },
      {
        type: "HEADING",
        content: "Concurrency: doing several things at once",
      },
      {
        type: "TEXT",
        content:
          "A server handles many requests at the same time. How it does that shapes everything about how you write code for it.\n\nMost backend work is waiting — for a database, for another service, for disk. If your code blocks the processor while waiting, nothing else can run. This is the single most important performance idea in backend development.",
      },
      {
        type: "CODE",
        content: "Blocking versus not blocking, in Node.js:",
        code: `// Blocking — nothing else runs until this finishes
const data = fs.readFileSync("large.json");

// Non-blocking — the process handles other work while waiting
const data = await fs.promises.readFile("large.json");`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "Both read the same file. The first stops everything; under load, every other request queues behind it. The second lets the process do useful work while the disk does its job.",
      },
      {
        type: "TEXT",
        title: "Where this shows up in real work",
        content:
          '"The API is slow under load" is usually one of these: blocking work on a hot path, a query pulling far more data than needed, or memory growing until the process is killed and restarted.\n\nKnowing the layer means you can form a hypothesis instead of randomly adding caching.',
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Assuming a machine with 16 GB of memory means your process can use 16 GB — it shares with everything else, and containers usually impose a much lower limit.\n\nTesting only with small data. Most memory and performance bugs are invisible below a certain size.\n\nTreating a restart as a fix. It clears the symptom and loses the evidence.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What is the difference between a program and a process?",
        explanation:
          "A program is the file on disk; a process is that program running, with its own memory and its share of the processor. One program can become many independent processes.",
        options: [
          {
            text: "A program is a file on disk; a process is it running",
            isCorrect: true,
          },
          { text: "They mean the same thing" },
          { text: "A process is written in a compiled language" },
          { text: "A program runs only on servers" },
        ],
      },
      {
        question: "Why is blocking work a problem on a server?",
        explanation:
          "While the process is blocked, it cannot handle anything else — every other request queues behind it. Since most backend work is waiting on I/O, non-blocking calls are what let one process serve many requests at once.",
        options: [
          { text: "Other requests cannot be handled while it waits", isCorrect: true },
          { text: "It uses more disk space" },
          { text: "It prevents the code from compiling" },
          { text: "It only affects development, not production" },
        ],
      },
      {
        question:
          "Your service works in testing but is killed in production. Likely cause?",
        explanation:
          "Loading far more data than the environment has memory for. Small test datasets hide this completely — the code is identical, the data volume is not. Containers usually cap memory well below the machine total.",
        options: [
          {
            text: "It loads more data into memory than the environment allows",
            isCorrect: true,
          },
          { text: "Production uses a different programming language" },
          { text: "The tests were written incorrectly" },
          { text: "Production disables functions" },
        ],
      },
    ],
    resources: [
      {
        title: "Node.js — blocking vs non-blocking",
        url: "https://nodejs.org/en/learn/asynchronous-work/overview-of-blocking-vs-non-blocking",
        source: "Node.js",
        type: "DOCUMENTATION",
      },
    ],
  },
  {
    topicSlug: "http-deep",
    title: "HTTP in Depth",
    description: "Methods, status codes and headers — the contract your API speaks.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "HTTP is a conversation format",
        content:
          "HTTP defines how a client asks for something and how a server answers. Every API you build or consume is this same shape: a request with a method and a path, and a response with a status code and a body.\n\nOn the backend you're no longer just reading these — you're deciding what they should be. Getting them right is most of what \"good API design\" means.",
      },
      {
        type: "HEADING",
        content: "Methods say what you intend",
      },
      {
        type: "LIST",
        content: "The methods that carry almost all real traffic:",
        items: [
          "GET — fetch something. Must not change anything.",
          "POST — create something, or perform an action.",
          "PUT — replace a resource entirely.",
          "PATCH — change part of a resource.",
          "DELETE — remove a resource.",
        ],
      },
      {
        type: "CALLOUT",
        content:
          "GET must be safe: calling it repeatedly changes nothing. Browsers, caches and crawlers all assume this. A GET endpoint that deletes something will eventually be triggered by something you didn't write.",
      },
      {
        type: "HEADING",
        content: "Status codes say what happened",
      },
      {
        type: "TEXT",
        content:
          'The number is grouped by its first digit, and the grouping is the part worth memorising: 2xx succeeded, 4xx the client got it wrong, 5xx the server got it wrong.\n\nThat 4xx/5xx split matters more than any individual code. It\'s the difference between "you sent something invalid" and "we broke" — and it determines whether a client should retry.',
      },
      {
        type: "CODE",
        content: "The codes you'll return most often:",
        code: `200 OK           Request succeeded
201 Created      A new resource was created
204 No Content   Succeeded, nothing to return

400 Bad Request  The request was malformed or invalid
401 Unauthorized We don't know who you are
403 Forbidden    We know who you are; you may not do this
404 Not Found    No such resource
409 Conflict     Clashes with existing state (duplicate email)
422 Unprocessable Well-formed but semantically invalid

500 Internal Server Error   Something broke on our side`,
        language: "http",
      },
      {
        type: "TEXT",
        content:
          'The 401 versus 403 distinction catches people out. 401 means "authenticate" — we don\'t know who you are. 403 means "we know exactly who you are, and no".',
      },
      {
        type: "HEADING",
        content: "Headers carry the metadata",
      },
      {
        type: "TEXT",
        content:
          'Headers describe the request or response rather than being the content. `Content-Type` says what format the body is in. `Authorization` carries credentials. `Cache-Control` tells caches what they may keep.\n\nGetting `Content-Type` wrong is a common cause of "the server received nothing" — the body was sent, but the server parsed it as the wrong format.',
      },
      {
        type: "EXAMPLE",
        title: "A complete exchange",
        content: "Creating a resource and getting a proper answer back:",
        code: `POST /api/users HTTP/1.1
Content-Type: application/json

{ "email": "ada@example.com" }

--- response ---

HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/users/42

{ "id": 42, "email": "ada@example.com" }`,
        language: "http",
      },
      {
        type: "TEXT",
        content:
          "201 rather than 200 because something was created. `Location` tells the client where the new thing lives. The body echoes what was made, including the server-assigned id.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          'Returning 200 with an error message in the body. Clients check the status code — a 200 means success, so error handling never runs.\n\nUsing POST for everything. It works, and it throws away every bit of meaning the method system gives you.\n\nReturning 500 for invalid user input. That says "we broke", triggers alerts, and tells the client to retry something that will never succeed. Use 400.\n\nLeaking internal detail in error responses. Stack traces belong in your logs, not in the body.',
      },
    ],
    knowledgeChecks: [
      {
        question: "A user submits an invalid email. What status should you return?",
        explanation:
          "400 — the client sent something invalid. Returning 500 claims the server broke, which triggers alerts and tells clients to retry a request that can never succeed.",
        options: [
          { text: "400 Bad Request", isCorrect: true },
          { text: "500 Internal Server Error" },
          { text: "200 OK with an error in the body" },
          { text: "404 Not Found" },
        ],
      },
      {
        question: "What is the difference between 401 and 403?",
        explanation:
          "401 means we don't know who you are — authenticate. 403 means we know exactly who you are and you're still not allowed. One is about identity, the other about permission.",
        options: [
          {
            text: "401 means not authenticated; 403 means authenticated but not allowed",
            isCorrect: true,
          },
          { text: "They are interchangeable" },
          { text: "401 is for APIs, 403 is for web pages" },
          { text: "403 means the resource does not exist" },
        ],
      },
      {
        question: "Why must GET requests never change data?",
        explanation:
          "Browsers, caches, crawlers and link previewers all assume GET is safe and may call it without a user's involvement. A GET that deletes something will eventually be triggered by something you didn't write.",
        options: [
          {
            text: "Caches, crawlers and browsers may call them automatically",
            isCorrect: true,
          },
          { text: "GET requests are slower than POST" },
          { text: "GET cannot send a request body" },
          { text: "It is only a naming convention" },
        ],
      },
      {
        question: "You created a new resource. Which status code is most appropriate?",
        explanation:
          "201 Created, ideally with a Location header pointing at the new resource. 200 is not wrong exactly, but 201 tells the client something new exists — information it would otherwise have to infer.",
        options: [
          { text: "201 Created", isCorrect: true },
          { text: "204 No Content" },
          { text: "302 Found" },
          { text: "400 Bad Request" },
        ],
      },
    ],
    resources: [
      {
        title: "HTTP response status codes",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status",
        source: "MDN Web Docs",
        type: "REFERENCE",
      },
      {
        title: "HTTP request methods",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods",
        source: "MDN Web Docs",
        type: "REFERENCE",
      },
    ],
  },
  {
    topicSlug: "sql",
    title: "SQL",
    description: "Asking a database precise questions and getting exact answers.",
    estimatedTime: "6 hours",
    sections: [
      {
        type: "TEXT",
        title: "What SQL is for",
        content:
          "SQL is how you talk to a relational database. You describe *what* you want, and the database works out how to get it efficiently.\n\nThat's unusual. In most programming you specify the steps. In SQL you specify the result, and the database's query planner decides the strategy. Once that clicks, SQL stops feeling like an odd language and starts feeling like stating requirements.",
      },
      {
        type: "HEADING",
        content: "Selecting data",
      },
      {
        type: "CODE",
        content: "The basic shape of every query:",
        code: `SELECT email, created_at
FROM users
WHERE created_at > '2026-01-01'
ORDER BY created_at DESC
LIMIT 10;`,
        language: "sql",
      },
      {
        type: "TEXT",
        content:
          "`SELECT` chooses columns. `FROM` chooses the table. `WHERE` filters rows. `ORDER BY` sorts. `LIMIT` caps how many come back.\n\nRead it as a sentence: give me these columns, from this table, for rows matching this, newest first, at most ten.",
      },
      {
        type: "CALLOUT",
        content:
          "Always `SELECT` the columns you need rather than `SELECT *`. It moves less data, survives schema changes better, and makes it obvious to the next reader what the query actually depends on.",
      },
      {
        type: "HEADING",
        content: "Joins: combining tables",
      },
      {
        type: "TEXT",
        content:
          "Relational databases split data across tables to avoid repeating it. Users in one table, orders in another, with orders storing a `user_id` pointing back. A join puts them back together for one query.",
      },
      {
        type: "CODE",
        content: "Every order with the email of the person who placed it:",
        code: `SELECT users.email, orders.total
FROM orders
JOIN users ON users.id = orders.user_id
WHERE orders.total > 100;`,
        language: "sql",
      },
      {
        type: "TEXT",
        content:
          "`JOIN users ON users.id = orders.user_id` is the important line — it says how rows in the two tables correspond. Get that condition wrong and you'll silently produce far more rows than you expect, because every order matches every user.",
      },
      {
        type: "TEXT",
        title: "INNER versus LEFT",
        content:
          'A plain `JOIN` (an inner join) keeps only rows that matched in both tables. A `LEFT JOIN` keeps every row from the left table, filling in nulls where there was no match.\n\nThe choice matters. "All users and their order count" needs a LEFT JOIN — an inner join silently drops every user who has never ordered, which is exactly the group you were probably investigating.',
      },
      {
        type: "HEADING",
        content: "Aggregation",
      },
      {
        type: "CODE",
        content: "Counting and summing per group:",
        code: `SELECT users.email, COUNT(orders.id) AS order_count
FROM users
LEFT JOIN orders ON orders.user_id = users.id
GROUP BY users.email
ORDER BY order_count DESC;`,
        language: "sql",
      },
      {
        type: "TEXT",
        content:
          "`GROUP BY` collapses rows that share a value into one, and aggregate functions like `COUNT`, `SUM` and `AVG` summarise each group. The rule to remember: every column in the SELECT must either be in the GROUP BY or wrapped in an aggregate.",
      },
      {
        type: "TEXT",
        title: "Where this shows up in real work",
        content:
          "Even with an ORM generating queries for you, SQL is what actually runs. When an endpoint is slow, you read the query the ORM produced and its execution plan.\n\nAn ORM makes easy queries easier. It does not remove the need to understand what a join costs.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Building queries by concatenating strings with user input. That's SQL injection — use parameterised queries, always, with no exceptions.\n\nForgetting the join condition, producing a cross join that multiplies rows.\n\nUsing INNER JOIN where LEFT JOIN was meant, silently losing rows with no match.\n\nRunning a query per item in a loop — the N+1 problem — when one query with a join would do.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What is the difference between INNER JOIN and LEFT JOIN?",
        explanation:
          "INNER JOIN keeps only rows matching in both tables. LEFT JOIN keeps every row from the left table, with nulls where there was no match. Using INNER where LEFT was meant silently drops exactly the rows you were often looking for.",
        options: [
          {
            text: "INNER keeps only matching rows; LEFT keeps all left-table rows",
            isCorrect: true,
          },
          { text: "LEFT is faster than INNER" },
          { text: "They produce identical results" },
          { text: "INNER works on one table only" },
        ],
      },
      {
        question: "How should user input be included in a query?",
        explanation:
          "As a parameter. Concatenating input into SQL is injection, and it is the most reliably exploited vulnerability there is. Parameterised queries send the value separately from the statement, so it can never be interpreted as SQL.",
        options: [
          { text: "As a parameter in a parameterised query", isCorrect: true },
          { text: "Concatenated into the query string" },
          { text: "After removing quote characters" },
          { text: "Encoded as base64 first" },
        ],
      },
      {
        question:
          "You want all users and how many orders each has, including users with none. What do you need?",
        explanation:
          "A LEFT JOIN from users to orders, with GROUP BY and COUNT. An inner join would drop every user with zero orders — usually the exact group the question is about.",
        options: [
          { text: "LEFT JOIN with GROUP BY and COUNT", isCorrect: true },
          { text: "INNER JOIN with GROUP BY" },
          { text: "Two separate queries combined in code" },
          { text: "SELECT * with ORDER BY" },
        ],
      },
      {
        question: "Why prefer naming columns over SELECT *?",
        explanation:
          "It transfers less data, doesn't break unpredictably when the schema changes, and makes the query's actual dependencies obvious to the next person reading it.",
        options: [
          {
            text: "Less data transferred, and the query's dependencies are explicit",
            isCorrect: true,
          },
          { text: "SELECT * is not valid SQL" },
          { text: "SELECT * cannot be used with WHERE" },
          { text: "It changes the sort order" },
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
    ],
  },
];
