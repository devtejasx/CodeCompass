import type { SeedProject } from "./types";

/**
 * Backend projects. Deliberately language-agnostic: every one of these can be
 * built in Node, Python, Go or Java, and the requirements are written in terms
 * of behaviour rather than framework.
 */
export const BACKEND_PROJECTS: SeedProject[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "rest-api-basics",
    title: "REST API",
    shortDescription:
      "A CRUD API with correct status codes, validation and error handling.",
    description:
      "The first API you write from scratch. One resource, five endpoints, and all the " +
      "details that separate an API someone can use from one that merely responds: the " +
      "right status codes, consistent error shapes, and validation that rejects bad " +
      "input before it reaches your logic.",
    difficulty: "BEGINNER",
    type: "BACKEND",
    estimatedDuration: "6–8 hours",
    whyBuildThis:
      "You will practise HTTP as a protocol rather than as something a library hides, " +
      "designing routes that read predictably, and handling failure deliberately. " +
      "Getting status codes right is not pedantry — it is what lets any client, " +
      "written by anyone, understand what happened.",
    whatYouBuild:
      "An API for a single resource of your choosing — books, recipes, whatever you " +
      "find interesting — with endpoints to list, read, create, update and delete. " +
      "Data lives in memory or a file; the database comes in the next project.",
    technologies: [
      { name: "Node.js", category: "PLATFORM" },
      { name: "Express", category: "FRAMEWORK" },
      { name: "JSON", category: "TOOL" },
      { name: "HTTP", category: "TOOL" },
    ],
    prerequisiteTopicSlugs: [
      "http-deep",
      "client-server-model",
      "language-syntax",
      "functions-and-modules",
      "rest-apis",
    ],
    relatedTopicSlugs: ["request-validation", "error-handling-backend"],
    requirements: [
      {
        title: "Five working endpoints",
        description: "List, read one, create, update and delete.",
      },
      {
        title: "Correct status codes",
        description:
          "201 for a created resource, 404 for one that does not exist, 400 for bad " +
          "input, 204 for a delete with no body.",
      },
      {
        title: "Input validation on write",
        description:
          "Reject missing fields, wrong types and impossible values before doing " +
          "anything with them.",
      },
      {
        title: "A consistent error shape",
        description:
          "Every error response has the same structure, whatever went wrong.",
      },
      {
        title: "List supports filtering",
        description: "At least one query parameter that narrows the results.",
      },
      {
        title: "Route handlers stay thin",
        description:
          "A handler reads the request and returns a response. The work happens in " +
          "functions that know nothing about HTTP.",
        category: "TECHNICAL",
      },
      {
        title: "No unhandled errors reach the client",
        description:
          "A thrown exception must not return a stack trace. Catch and translate.",
        category: "TECHNICAL",
      },
      {
        title: "Documented in the README",
        description: "Every endpoint, its parameters and an example response.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Design the resource and routes",
        description:
          "Write the endpoint list on paper before writing code. Nouns for paths, HTTP " +
          "verbs for actions.",
        estimatedTime: "45 minutes",
        concepts: ["REST", "API design"],
      },
      {
        title: "Get a server responding",
        description: "One route returning a fixed JSON payload. Confirm it with curl.",
        estimatedTime: "45 minutes",
        concepts: ["HTTP"],
      },
      {
        title: "Implement list and read",
        description: "Against an in-memory array. Handle the not-found case now.",
        estimatedTime: "1 hour",
        concepts: ["Routing"],
      },
      {
        title: "Implement create",
        description: "Parse the body, validate it, return 201 with the new resource.",
        estimatedTime: "1 hour",
        concepts: ["Validation"],
      },
      {
        title: "Implement update and delete",
        description: "Think about what each returns, and what happens for a bad id.",
        estimatedTime: "1 hour",
      },
      {
        title: "Centralise error handling",
        description:
          "One place that turns an error into a response. Every route uses it.",
        estimatedTime: "1 hour",
        concepts: ["Error handling"],
      },
      {
        title: "Add filtering and document it",
        description:
          "Query parameters on the list endpoint, and a README that explains them.",
        estimatedTime: "1 hour",
      },
    ],
    hints: [
      {
        title: "The status code is part of the answer",
        content:
          "Returning 200 with an error message in the body forces every client to " +
          "parse the body to find out whether it worked. The code should say it.",
      },
      {
        title: "Validate at the boundary",
        content:
          "Check input the moment it arrives and reject it there. Once bad data is " +
          "inside your application, every function downstream has to worry about it.",
      },
      {
        title: "Test with curl before building a client",
        content:
          "Exercising your API from the command line forces you to look at the actual " +
          "responses, including the ones a friendly frontend would paper over.",
      },
    ],
    resources: [
      {
        title: "HTTP request methods",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods",
        source: "MDN",
        type: "REFERENCE",
      },
      {
        title: "HTTP response status codes",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status",
        source: "MDN",
        type: "REFERENCE",
      },
      {
        title: "Express routing guide",
        url: "https://expressjs.com/en/guide/routing.html",
        source: "Express",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "url-shortener",
    title: "URL Shortener",
    shortDescription:
      "Turn long links into short codes, redirect them, and count the clicks.",
    description:
      "A small service with a genuinely interesting design question at its centre: how " +
      "do you generate a short code that is unique, hard to guess in bulk, and stays " +
      "short as the table grows? It also introduces redirects and a real database.",
    difficulty: "BEGINNER",
    type: "BACKEND",
    estimatedDuration: "6–8 hours",
    whyBuildThis:
      "You will practise persisting data properly, thinking about uniqueness and " +
      "collisions, using database indexes where they matter, and handling redirects. " +
      "It is also a service where a careless implementation is an open redirect, so it " +
      "is a good first lesson in validating what users hand you.",
    whatYouBuild:
      "A service that accepts a long URL and returns a short one. Visiting the short " +
      "URL redirects to the original and records the visit. A stats endpoint reports " +
      "how many times each link has been used.",
    technologies: [
      { name: "Node.js", category: "PLATFORM" },
      { name: "Express", category: "FRAMEWORK" },
      { name: "PostgreSQL", category: "DATABASE" },
      { name: "SQL", category: "LANGUAGE" },
    ],
    prerequisiteTopicSlugs: [
      "rest-apis",
      "database-fundamentals",
      "sql",
      "data-structures",
    ],
    relatedTopicSlugs: ["indexes-and-performance", "security-fundamentals"],
    requirements: [
      {
        title: "Shorten a URL",
        description: "Accept a long URL, return a short code and the full short link.",
      },
      {
        title: "Redirect on visit",
        description:
          "With the correct redirect status code. Know which one you chose and why.",
      },
      {
        title: "Reject invalid URLs",
        description:
          "Only http and https. A relative path or a javascript: URL must be refused.",
      },
      {
        title: "Count visits",
        description: "Per link, incremented on each successful redirect.",
      },
      {
        title: "A stats endpoint",
        description: "Original URL, short code, visit count and creation time.",
      },
      {
        title: "Unknown codes return 404",
        description: "Not a redirect to somewhere unexpected.",
      },
      {
        title: "Short codes are unique",
        description:
          "Guaranteed by the database, not by hoping the generator does not collide.",
        category: "TECHNICAL",
      },
      {
        title: "The lookup column is indexed",
        description: "Every redirect queries it — it must not be a table scan.",
        category: "TECHNICAL",
      },
      {
        title: "Rate limit the shorten endpoint",
        description: "So one client cannot fill your table.",
        category: "TECHNICAL",
        isRequired: false,
      },
    ],
    milestones: [
      {
        title: "Design the schema",
        description:
          "One table. Decide your columns, your primary key, and which column needs a " +
          "unique index.",
        estimatedTime: "45 minutes",
        concepts: ["Database design"],
      },
      {
        title: "Connect to the database",
        description: "Get a query running and returning rows before building anything.",
        estimatedTime: "45 minutes",
        concepts: ["SQL"],
      },
      {
        title: "Write the code generator",
        description:
          "Decide length and alphabet. Work out roughly how many links you can store " +
          "before collisions become likely.",
        estimatedTime: "1 hour",
        concepts: ["Algorithms"],
      },
      {
        title: "Implement shortening",
        description:
          "Validate the URL, generate a code, insert, return the short link.",
        estimatedTime: "1.5 hours",
        concepts: ["Validation"],
      },
      {
        title: "Implement the redirect",
        description:
          "Look up the code and redirect. Decide between 301 and 302 and write down why.",
        estimatedTime: "1 hour",
        concepts: ["HTTP"],
      },
      {
        title: "Record visits",
        description:
          "Increment on redirect. Think about whether the count must be exact under " +
          "concurrent requests.",
        estimatedTime: "1 hour",
        concepts: ["Database"],
      },
      {
        title: "Add the stats endpoint",
        description: "And decide whether stats should be public at all.",
        estimatedTime: "45 minutes",
      },
      {
        title: "Handle collisions and edge cases",
        description:
          "What happens when your generator produces a code that already exists? It " +
          "will, eventually.",
        estimatedTime: "1 hour",
        concepts: ["Error handling"],
      },
    ],
    hints: [
      {
        title: "Let the database enforce uniqueness",
        content:
          "Checking whether a code exists and then inserting it is two operations with " +
          "a gap between them. A unique constraint plus a retry on conflict is correct " +
          "under concurrency; the check-then-insert is not.",
      },
      {
        title: "Validate the scheme, not just the shape",
        content:
          "A string can parse as a URL and still be dangerous. Accept only http and " +
          "https, or you have built an open redirect that a phisher will enjoy.",
      },
      {
        title: "301 is forever",
        content:
          "A permanent redirect gets cached by browsers, sometimes indefinitely — which " +
          "also means your visit counter stops seeing the visits. Consider what you " +
          "actually want.",
      },
    ],
    resources: [
      {
        title: "PostgreSQL indexes",
        url: "https://www.postgresql.org/docs/current/indexes.html",
        source: "PostgreSQL",
        type: "DOCUMENTATION",
      },
      {
        title: "HTTP redirections",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Redirections",
        source: "MDN",
        type: "DOCUMENTATION",
      },
      {
        title: "OWASP: unvalidated redirects and forwards",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html",
        source: "OWASP",
        type: "ARTICLE",
      },
    ],
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "notes-api",
    title: "Notes API",
    shortDescription:
      "A persistent notes service with search, tags, pagination and migrations.",
    description:
      "Your first API backed by a real schema you evolve over time. Notes have tags, " +
      "which means a many-to-many relationship; the list endpoint needs pagination, " +
      "because returning ten thousand rows is not an option.",
    difficulty: "BEGINNER",
    type: "BACKEND",
    estimatedDuration: "8–10 hours",
    whyBuildThis:
      "You will practise modelling a relationship properly, using an ORM and " +
      "migrations so schema changes are versioned rather than remembered, and " +
      "paginating results. Migrations in particular are the difference between a " +
      "schema you can deploy and one that only exists on your laptop.",
    whatYouBuild:
      "An API where notes can be created, listed, searched by text, filtered by tag, " +
      "updated and deleted. Listing is paginated. The schema is managed by migrations " +
      "from the very first commit.",
    technologies: [
      { name: "Node.js", category: "PLATFORM" },
      { name: "PostgreSQL", category: "DATABASE" },
      { name: "Prisma", category: "LIBRARY" },
      { name: "REST", category: "TOOL" },
    ],
    prerequisiteTopicSlugs: [
      "rest-apis",
      "request-validation",
      "database-fundamentals",
      "orms-and-migrations",
    ],
    relatedTopicSlugs: ["database-design", "sql", "error-handling-backend"],
    requirements: [
      {
        title: "Full CRUD for notes",
        description: "Title, body and timestamps.",
      },
      {
        title: "Notes can be tagged",
        description: "Many tags per note, many notes per tag.",
      },
      {
        title: "Search notes by text",
        description: "Across title and body.",
      },
      {
        title: "Filter by tag",
        description: "Combinable with search.",
      },
      {
        title: "Paginated listing",
        description:
          "With a sensible default and a maximum page size the client cannot exceed.",
      },
      {
        title: "Validation with useful messages",
        description: "Which field was wrong and why, not just 'invalid'.",
      },
      {
        title: "Schema is managed by migrations",
        description: "Committed to the repository and replayable from scratch.",
        category: "TECHNICAL",
      },
      {
        title: "No N+1 queries",
        description:
          "Loading twenty notes with their tags must not be twenty-one queries.",
        category: "TECHNICAL",
      },
      {
        title: "Deleting a note cleans up its tag links",
        description: "Handled by the schema, not by remembering to do it.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Model notes and tags",
        description:
          "Draw the tables. The join table between them is the thing to get right.",
        estimatedTime: "1 hour",
        concepts: ["Database design"],
      },
      {
        title: "Set up the ORM and first migration",
        description: "Schema in code, migration generated and applied.",
        estimatedTime: "1 hour",
        concepts: ["Migrations"],
      },
      {
        title: "Implement note CRUD",
        description: "Without tags to begin with. Get the basics solid.",
        estimatedTime: "2 hours",
      },
      {
        title: "Add tags",
        description:
          "Attaching and detaching. Decide whether creating a note can create new tags.",
        estimatedTime: "2 hours",
        concepts: ["Relationships"],
      },
      {
        title: "Add search",
        description:
          "Start with a simple case-insensitive match; note where it will stop scaling.",
        estimatedTime: "1 hour",
        concepts: ["SQL"],
      },
      {
        title: "Add pagination",
        description:
          "Return the page, the page size and the total so a client can build a pager.",
        estimatedTime: "1.5 hours",
      },
      {
        title: "Check your queries",
        description:
          "Log the SQL your ORM generates for the list endpoint. Count the queries.",
        estimatedTime: "1 hour",
        concepts: ["Performance"],
      },
    ],
    hints: [
      {
        title: "The join table is the design",
        content:
          "Many-to-many always means a third table. Making it explicit now leaves room " +
          "for it to carry its own data later — who added the tag, when.",
      },
      {
        title: "Cap the page size",
        content:
          "If the client picks the limit, someone will ask for a million. Clamp it " +
          "server-side and document the maximum.",
      },
      {
        title: "Read the SQL your ORM writes",
        content:
          "Turn on query logging and look. An ORM makes it very easy to write one query " +
          "per row without noticing, and you will only see it in the log.",
      },
    ],
    resources: [
      {
        title: "Prisma relations",
        url: "https://www.prisma.io/docs/orm/prisma-schema/data-model/relations",
        source: "Prisma",
        type: "DOCUMENTATION",
      },
      {
        title: "Prisma Migrate",
        url: "https://www.prisma.io/docs/orm/prisma-migrate",
        source: "Prisma",
        type: "DOCUMENTATION",
      },
      {
        title: "PostgreSQL LIMIT and OFFSET",
        url: "https://www.postgresql.org/docs/current/queries-limit.html",
        source: "PostgreSQL",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "authentication-api",
    title: "Authentication API",
    shortDescription:
      "Registration, login and protected routes, built with the details right.",
    description:
      "Authentication is where a mistake stops being a bug and becomes a breach. You " +
      "will implement registration and login yourself — once — so you understand what " +
      "the libraries you use afterwards are actually doing.",
    difficulty: "INTERMEDIATE",
    type: "BACKEND",
    estimatedDuration: "10–12 hours",
    whyBuildThis:
      "You will practise password hashing, token issuing and verification, and the " +
      "difference between authentication and authorization. Just as importantly you " +
      "will meet the details that matter: why login errors must be vague, why timing " +
      "can leak information, and why a token needs an expiry.",
    whatYouBuild:
      "An API where a user can register, log in and access routes that require a valid " +
      "session. Passwords are hashed with a slow algorithm, tokens expire, and login " +
      "cannot be used to discover which email addresses exist.",
    technologies: [
      { name: "Node.js", category: "PLATFORM" },
      { name: "PostgreSQL", category: "DATABASE" },
      { name: "bcrypt", category: "LIBRARY" },
      { name: "JWT", category: "LIBRARY" },
    ],
    prerequisiteTopicSlugs: [
      "authentication",
      "authorization",
      "security-fundamentals",
      "rest-apis",
    ],
    relatedTopicSlugs: [
      "request-validation",
      "rate-limiting",
      "error-handling-backend",
    ],
    requirements: [
      {
        title: "Registration with validation",
        description: "Email format, password strength, and a duplicate-email check.",
      },
      {
        title: "Login issuing a token",
        description: "With an expiry, and a documented lifetime.",
      },
      {
        title: "Protected routes",
        description: "Which reject a missing, malformed or expired token.",
      },
      {
        title: "A route returning the current user",
        description: "Derived from the token, never from a client-supplied id.",
      },
      {
        title: "Logout",
        description:
          "Decide what this means for your token strategy, and be honest in the README " +
          "about what it does and does not guarantee.",
      },
      {
        title: "At least two roles",
        description: "With a route only one of them can reach.",
      },
      {
        title: "Passwords hashed with a slow algorithm",
        description:
          "bcrypt, scrypt or argon2 with a sensible cost. Never a plain hash function.",
        category: "TECHNICAL",
      },
      {
        title: "Login errors are indistinguishable",
        description:
          "Unknown email and wrong password return the same message and take a similar " +
          "amount of time.",
        category: "TECHNICAL",
      },
      {
        title: "Secrets come from the environment",
        description: "No signing key in the repository.",
        category: "TECHNICAL",
      },
      {
        title: "Login attempts are rate limited",
        description: "So the endpoint cannot be brute-forced.",
        category: "TECHNICAL",
      },
      {
        title: "The password hash never leaves the server",
        description: "Not in any response, not in any log.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Model users and roles",
        description: "Decide what you store and — more importantly — what you do not.",
        estimatedTime: "45 minutes",
        concepts: ["Database design"],
      },
      {
        title: "Implement registration",
        description: "Validate, hash, store. Never store the plaintext, even briefly.",
        estimatedTime: "2 hours",
        concepts: ["Hashing", "Validation"],
      },
      {
        title: "Implement login",
        description:
          "Compare against the hash and issue a token. Make both failure paths " +
          "identical from the outside.",
        estimatedTime: "2 hours",
        concepts: ["Authentication"],
      },
      {
        title: "Add token verification middleware",
        description:
          "One place that validates a token and attaches the user to the request.",
        estimatedTime: "1.5 hours",
        concepts: ["Middleware"],
      },
      {
        title: "Protect some routes",
        description: "And confirm each rejection case by hand: missing, bad, expired.",
        estimatedTime: "1 hour",
      },
      {
        title: "Add role-based authorization",
        description:
          "Authentication is who you are; authorization is what you may do. Keep them " +
          "separate in the code too.",
        estimatedTime: "1.5 hours",
        concepts: ["Authorization"],
      },
      {
        title: "Add rate limiting",
        description: "On login and registration at minimum.",
        estimatedTime: "1 hour",
        concepts: ["Rate limiting"],
      },
      {
        title: "Attack your own API",
        description:
          "Try to enumerate accounts. Try an expired token. Try another user's id in a " +
          "request body. Fix what you find.",
        estimatedTime: "1.5 hours",
        concepts: ["Security"],
      },
    ],
    hints: [
      {
        title: "Slow hashing is the point",
        content:
          "SHA-256 is fast, which is exactly why it is wrong for passwords. Use a " +
          "function designed to be expensive, with a cost factor you can raise later.",
      },
      {
        title: "Never say which half was wrong",
        content:
          "'No account with that email' tells an attacker which addresses are " +
          "registered. One message for both cases — and take the same time in both, or " +
          "the clock leaks what the message did not.",
      },
      {
        title: "The token says who; your code says whether",
        content:
          "Never take a user id from a request body or query string to decide what to " +
          "return. It comes from the verified token, always.",
      },
    ],
    resources: [
      {
        title: "OWASP password storage cheat sheet",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html",
        source: "OWASP",
        type: "ARTICLE",
      },
      {
        title: "OWASP authentication cheat sheet",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html",
        source: "OWASP",
        type: "ARTICLE",
      },
      {
        title: "Introduction to JSON Web Tokens",
        url: "https://jwt.io/introduction",
        source: "jwt.io",
        type: "ARTICLE",
      },
      {
        title: "OWASP Top Ten",
        url: "https://owasp.org/www-project-top-ten/",
        source: "OWASP",
        type: "REFERENCE",
      },
    ],
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "blog-api",
    title: "Blog API",
    shortDescription:
      "Posts, comments, authors and drafts, with ownership rules that hold.",
    description:
      "A content API with relationships in several directions and real authorization " +
      "questions. Who may edit a post? Who may see a draft? Getting those rules right " +
      "in one place, rather than scattered through the handlers, is the lesson.",
    difficulty: "INTERMEDIATE",
    type: "BACKEND",
    estimatedDuration: "12–15 hours",
    whyBuildThis:
      "You will practise modelling related data, enforcing ownership consistently, and " +
      "designing an API whose behaviour depends on who is asking. Draft visibility is a " +
      "deceptively good exercise: the same endpoint returns different things to " +
      "different callers, and getting that wrong leaks unpublished work.",
    whatYouBuild:
      "An API for a blog: authors write posts, posts can be drafts or published, " +
      "readers comment on published posts. Only an author can edit their own post, and " +
      "a draft is invisible to everyone else.",
    technologies: [
      { name: "Node.js", category: "PLATFORM" },
      { name: "PostgreSQL", category: "DATABASE" },
      { name: "Prisma", category: "LIBRARY" },
      { name: "REST", category: "TOOL" },
    ],
    prerequisiteTopicSlugs: [
      "database-design",
      "orms-and-migrations",
      "rest-apis",
      "request-validation",
      "error-handling-backend",
    ],
    relatedTopicSlugs: ["authorization", "indexes-and-performance", "api-versioning"],
    requirements: [
      {
        title: "CRUD for posts",
        description: "With a draft and a published state.",
      },
      {
        title: "Comments on published posts",
        description: "Commenting on a draft must not be possible.",
      },
      {
        title: "Only the author can edit or delete",
        description: "Anyone else gets a clear refusal.",
      },
      {
        title: "Drafts are invisible to others",
        description:
          "Including in listings, search results and by direct id. A 404 rather than a " +
          "403, so the existence of the draft is not revealed.",
      },
      {
        title: "List posts with pagination and sorting",
        description: "Newest first by default.",
      },
      {
        title: "Filter posts by author and by tag",
        description: "Combinable.",
      },
      {
        title: "Publishing sets a published timestamp",
        description: "Once. Re-publishing must not move it.",
      },
      {
        title: "Authorization lives in one place",
        description:
          "A single function decides whether this user may do this to this post. " +
          "Handlers ask it; they do not each re-implement it.",
        category: "TECHNICAL",
      },
      {
        title: "Deleting a post handles its comments",
        description: "Decide cascade or refuse, and enforce it in the schema.",
        category: "TECHNICAL",
      },
      {
        title: "Listing does not N+1 on authors",
        description: "Twenty posts with their authors is not twenty-one queries.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Model posts, authors, comments and tags",
        description: "Four tables and their relationships. Draw it before coding it.",
        estimatedTime: "1.5 hours",
        concepts: ["Database design"],
      },
      {
        title: "Implement post CRUD",
        description: "Ignoring drafts and permissions for now.",
        estimatedTime: "2.5 hours",
      },
      {
        title: "Add ownership rules",
        description: "One authorization function, used everywhere. Test it directly.",
        estimatedTime: "2 hours",
        concepts: ["Authorization"],
      },
      {
        title: "Add the draft state",
        description:
          "And think hard about every endpoint that could reveal one — list, search, " +
          "read by id, comment count.",
        estimatedTime: "2 hours",
        concepts: ["Authorization"],
      },
      {
        title: "Add comments",
        description: "With their own validation and their own ownership rules.",
        estimatedTime: "2 hours",
      },
      {
        title: "Add tags, filtering and sorting",
        description: "Combinable filters, with pagination that still works.",
        estimatedTime: "2 hours",
      },
      {
        title: "Review your queries and indexes",
        description:
          "Look at the SQL for your list endpoint and add the indexes it wants.",
        estimatedTime: "1.5 hours",
        concepts: ["Performance"],
      },
    ],
    hints: [
      {
        title: "404 hides more than 403",
        content:
          "Telling someone they are forbidden from reading a draft confirms it exists. " +
          "For resources that should be invisible, not-found is the more discreet answer.",
      },
      {
        title: "One place decides permissions",
        content:
          "The moment two handlers each check ownership their own way, they will drift, " +
          "and one of them will be the one you forget to update.",
      },
      {
        title: "Check every read path",
        content:
          "Draft leaks rarely happen on the obvious endpoint. They happen in the search " +
          "results, the tag listing, or the count on the author's profile.",
      },
    ],
    resources: [
      {
        title: "PostgreSQL foreign keys",
        url: "https://www.postgresql.org/docs/current/ddl-constraints.html",
        source: "PostgreSQL",
        type: "DOCUMENTATION",
      },
      {
        title: "OWASP authorization cheat sheet",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html",
        source: "OWASP",
        type: "ARTICLE",
      },
      {
        title: "Prisma relation queries",
        url: "https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries",
        source: "Prisma",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "inventory-api",
    title: "Inventory API",
    shortDescription:
      "Stock levels that stay correct when two requests arrive at the same time.",
    description:
      "An inventory service is where transactions stop being theory. Two customers " +
      "buying the last item simultaneously is not a rare edge case — it is the normal " +
      "case at any scale, and code that reads then writes will oversell.",
    difficulty: "INTERMEDIATE",
    type: "BACKEND",
    estimatedDuration: "12–15 hours",
    whyBuildThis:
      "You will practise database transactions, isolation and locking, and the habit of " +
      "asking 'what if two of these run at once?' about every write. You will also " +
      "build an audit trail, which is how real systems answer 'why is this number wrong?'",
    whatYouBuild:
      "An API managing products and stock across locations, with movements in and out, " +
      "reservations, and a complete history. Stock can never go negative, even under " +
      "concurrent requests, and every change is traceable.",
    technologies: [
      { name: "Node.js", category: "PLATFORM" },
      { name: "PostgreSQL", category: "DATABASE" },
      { name: "SQL", category: "LANGUAGE" },
      { name: "REST", category: "TOOL" },
    ],
    prerequisiteTopicSlugs: [
      "transactions",
      "database-design",
      "rest-apis",
      "backend-architecture",
    ],
    relatedTopicSlugs: [
      "indexes-and-performance",
      "backend-testing",
      "error-handling-backend",
    ],
    requirements: [
      { title: "Products with stock per location", description: "Several locations." },
      {
        title: "Record stock movements",
        description: "In, out, and transfers between locations.",
      },
      {
        title: "Stock can never go negative",
        description: "Enforced by the database, not only by application code.",
      },
      {
        title: "Reserve stock",
        description: "Reserved units are unavailable but not yet removed.",
      },
      {
        title: "Reservations expire",
        description: "And release their stock when they do.",
      },
      {
        title: "A full movement history",
        description: "Every change, with what, how much, when and why.",
      },
      {
        title: "A low-stock report",
        description: "Products below a configurable threshold.",
      },
      {
        title: "Multi-step operations are transactional",
        description:
          "A transfer decrements one location and increments another. Both, or neither.",
        category: "TECHNICAL",
      },
      {
        title: "Concurrent writes are correct",
        description:
          "Two simultaneous requests for the last unit result in one success and one " +
          "clear failure. Prove it with a test that fires both at once.",
        category: "TECHNICAL",
      },
      {
        title: "Current stock is derived or reconcilable",
        description:
          "Either compute it from movements, or store it and provide a way to check it " +
          "against the history.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Model products, locations and movements",
        description:
          "The movement table is the heart of this. Decide whether stock is a stored " +
          "column or a sum.",
        estimatedTime: "2 hours",
        concepts: ["Database design"],
      },
      {
        title: "Implement products and locations",
        description: "Plain CRUD, to get the boring part done.",
        estimatedTime: "1.5 hours",
      },
      {
        title: "Implement stock in and out",
        description: "Single-location movements first, without transactions.",
        estimatedTime: "2 hours",
      },
      {
        title: "Add the non-negative constraint",
        description:
          "A check constraint in the database. Watch your naive implementation fail.",
        estimatedTime: "1 hour",
        concepts: ["Constraints"],
      },
      {
        title: "Make writes transactional",
        description:
          "Wrap the multi-step operations. Understand what your isolation level does " +
          "and does not prevent.",
        estimatedTime: "2.5 hours",
        concepts: ["Transactions"],
      },
      {
        title: "Prove it under concurrency",
        description:
          "Write a test that fires two conflicting requests simultaneously and asserts " +
          "exactly one succeeds.",
        estimatedTime: "2 hours",
        concepts: ["Testing", "Concurrency"],
      },
      {
        title: "Add reservations and expiry",
        description:
          "Including how expired reservations get released — and what runs that.",
        estimatedTime: "2.5 hours",
      },
      {
        title: "Add reporting",
        description: "Low stock and movement history, with the indexes they need.",
        estimatedTime: "1.5 hours",
        concepts: ["Performance"],
      },
    ],
    hints: [
      {
        title: "Read-then-write is a race",
        content:
          "Selecting the current stock, checking it in your code, then updating leaves " +
          "a gap where another request does the same. Do the check inside the write, or " +
          "lock the row.",
      },
      {
        title: "Let the database say no",
        content:
          "A check constraint that stock >= 0 turns a subtle logic bug into a loud " +
          "error. Application validation is for good messages; the constraint is for " +
          "correctness.",
      },
      {
        title: "The ledger is the truth",
        content:
          "Recording every movement and summing them is slower but always reconcilable. " +
          "A stored quantity with no history cannot be audited when it goes wrong — and " +
          "it will.",
      },
    ],
    resources: [
      {
        title: "PostgreSQL transaction isolation",
        url: "https://www.postgresql.org/docs/current/transaction-iso.html",
        source: "PostgreSQL",
        type: "DOCUMENTATION",
      },
      {
        title: "PostgreSQL explicit locking",
        url: "https://www.postgresql.org/docs/current/explicit-locking.html",
        source: "PostgreSQL",
        type: "DOCUMENTATION",
      },
      {
        title: "PostgreSQL constraints",
        url: "https://www.postgresql.org/docs/current/ddl-constraints.html",
        source: "PostgreSQL",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "scalable-ecommerce-backend",
    title: "Scalable E-commerce Backend",
    shortDescription:
      "A service designed for load: caching, queues, observability and tests.",
    description:
      "The most demanding backend project here. Products, orders, payments-shaped " +
      "workflows and stock, built with the concerns that only appear under load — " +
      "caching with correct invalidation, work moved off the request path, and enough " +
      "instrumentation to diagnose it at three in the morning.",
    difficulty: "ADVANCED",
    type: "BACKEND",
    estimatedDuration: "30–40 hours",
    whyBuildThis:
      "You will practise architecture: deciding what belongs where, what can be " +
      "asynchronous, what must be immediate, and what has to be exactly once. You will " +
      "also learn that caching is easy and cache invalidation is where the bodies are " +
      "buried.",
    whatYouBuild:
      "A backend handling a product catalogue, carts, order placement and fulfilment. " +
      "Reads are cached and correctly invalidated; slow work runs on a queue with " +
      "retries; the service is rate limited, instrumented, and covered by tests you " +
      "would trust before a deploy.",
    technologies: [
      { name: "Node.js", category: "PLATFORM" },
      { name: "PostgreSQL", category: "DATABASE" },
      { name: "Redis", category: "DATABASE" },
      { name: "Docker", category: "TOOL" },
      { name: "Message queue", category: "TOOL" },
    ],
    prerequisiteTopicSlugs: [
      "backend-architecture",
      "caching-concepts",
      "background-jobs",
      "scalability-basics",
      "rate-limiting",
      "backend-testing",
    ],
    relatedTopicSlugs: ["redis", "monitoring", "docker-fundamentals", "transactions"],
    requirements: [
      {
        title: "Product catalogue with search and filters",
        description: "Paginated, and fast on a large dataset.",
      },
      {
        title: "Carts and order placement",
        description: "Placing an order reserves stock atomically.",
      },
      {
        title: "An order lifecycle",
        description: "With defined states and only legal transitions between them.",
      },
      {
        title: "Slow work runs asynchronously",
        description:
          "Confirmation emails, invoice generation and similar do not block the request.",
      },
      {
        title: "Failed jobs retry with backoff",
        description: "And end somewhere visible when they keep failing.",
      },
      {
        title: "Catalogue reads are cached",
        description: "With invalidation that actually fires when a product changes.",
      },
      {
        title: "The API is rate limited",
        description: "Per client, with the limits documented.",
      },
      {
        title: "Order placement is idempotent",
        description:
          "A retried request with the same idempotency key must not create a second " +
          "order.",
        category: "TECHNICAL",
      },
      {
        title: "Structured logging with request ids",
        description:
          "So one request can be followed through every log line it produced.",
        category: "TECHNICAL",
      },
      {
        title: "Health and metrics endpoints",
        description: "Enough to tell whether the service is actually healthy.",
        category: "TECHNICAL",
      },
      {
        title: "Meaningful test coverage",
        description:
          "Unit tests on the domain rules and integration tests on the critical paths.",
        category: "TECHNICAL",
      },
      {
        title: "Runs with one command",
        description: "Docker Compose brings up the service and its dependencies.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Design the architecture",
        description:
          "Write it down: modules, boundaries, what is synchronous and what is not. " +
          "This document is the project.",
        estimatedTime: "3 hours",
        concepts: ["Architecture"],
      },
      {
        title: "Set up the environment",
        description: "Docker Compose with the database, cache and queue.",
        estimatedTime: "2 hours",
        concepts: ["Docker"],
      },
      {
        title: "Build the catalogue",
        description: "Products, search, filters, pagination — uncached to start.",
        estimatedTime: "4 hours",
      },
      {
        title: "Build carts and orders",
        description: "Order placement inside a transaction that also reserves stock.",
        estimatedTime: "5 hours",
        concepts: ["Transactions"],
      },
      {
        title: "Make order placement idempotent",
        description: "Idempotency keys, and a decision about how long they live.",
        estimatedTime: "3 hours",
        concepts: ["Idempotency"],
      },
      {
        title: "Introduce the queue",
        description:
          "Move the slow work off the request path. Handle a worker dying mid-job.",
        estimatedTime: "4 hours",
        concepts: ["Background jobs"],
      },
      {
        title: "Add caching",
        description:
          "Then deliberately break it: change a product and make sure the cache " +
          "notices.",
        estimatedTime: "4 hours",
        concepts: ["Caching"],
      },
      {
        title: "Add rate limiting",
        description:
          "Shared across instances, which means it lives in the cache layer.",
        estimatedTime: "2 hours",
        concepts: ["Rate limiting"],
      },
      {
        title: "Instrument everything",
        description: "Structured logs with request ids, metrics, health checks.",
        estimatedTime: "3 hours",
        concepts: ["Monitoring"],
      },
      {
        title: "Write the tests you would trust",
        description: "Domain rules as unit tests, critical paths as integration tests.",
        estimatedTime: "5 hours",
        concepts: ["Testing"],
      },
      {
        title: "Load test and fix what breaks",
        description:
          "Put real load through it. The bottleneck will not be where you expected.",
        estimatedTime: "3 hours",
        concepts: ["Performance"],
      },
    ],
    hints: [
      {
        title: "Invalidation is the hard half",
        content:
          "Adding a cache takes an afternoon. Knowing every place that must clear it " +
          "takes the rest of the project. Write down what invalidates each key as you " +
          "add it.",
      },
      {
        title: "Assume the worker dies",
        content:
          "A job will be interrupted halfway. Design each one so running it twice is " +
          "harmless — that is a much easier guarantee than running it exactly once.",
      },
      {
        title: "Idempotency keys belong to the client",
        content:
          "The client generates the key and resends it on retry. If you generate it " +
          "server-side you cannot tell a retry from a genuine second order.",
      },
    ],
    resources: [
      {
        title: "Redis documentation",
        url: "https://redis.io/docs/latest/",
        source: "Redis",
        type: "DOCUMENTATION",
      },
      {
        title: "The Twelve-Factor App",
        url: "https://12factor.net/",
        source: "12factor.net",
        type: "ARTICLE",
      },
      {
        title: "Docker Compose overview",
        url: "https://docs.docker.com/compose/",
        source: "Docker",
        type: "DOCUMENTATION",
      },
      {
        title: "PostgreSQL performance tips",
        url: "https://www.postgresql.org/docs/current/performance-tips.html",
        source: "PostgreSQL",
        type: "DOCUMENTATION",
      },
    ],
  },
];
