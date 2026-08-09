import type { SeedRoadmap } from "./types";

/**
 * Backend Developer roadmap, version 1.
 *
 * Deliberately not the usual generic ordering. Two choices are worth naming:
 * databases come *before* REST APIs, because an API is mostly a way to expose
 * data and designing one without understanding storage produces endpoints you
 * regret; and security is folded in next to authentication rather than parked
 * at the end, because retrofitting it is how breaches happen.
 */
export const BACKEND_ROADMAP: SeedRoadmap = {
  careerSlug: "backend-developer",
  title: "Backend Developer Roadmap",
  description:
    "Your structured journey from the fundamentals to production-ready backend systems.",
  estimatedDuration: "9–14 months",
  phases: [
    {
      title: "Computer & Internet Fundamentals",
      description:
        "What a machine does with your code, and how two machines talk to each other.",
      estimatedDuration: "2–3 weeks",
      whyThisComesNext:
        "Backend work is mostly about what happens between machines. Processes, memory and network requests aren't background trivia here — they're the material you'll be working with every day, so they come first.",
      topics: [
        {
          slug: "computer-fundamentals",
          title: "How computers work",
          description:
            "Processes, memory, threads and the filesystem — the resources your server actually competes for.",
          difficulty: "BEGINNER",
          estimatedTime: "2 hours",
        },
        {
          slug: "operating-systems",
          title: "Operating systems and the command line",
          description:
            "Working in a shell, managing processes and reading logs — your server has no other interface.",
          difficulty: "BEGINNER",
          estimatedTime: "3 hours",
          prerequisites: ["computer-fundamentals"],
        },
        {
          slug: "networking-basics",
          title: "How the internet works",
          description: "IP, TCP, DNS and what a request travels through to reach you.",
          difficulty: "BEGINNER",
          estimatedTime: "2 hours",
          prerequisites: ["computer-fundamentals"],
        },
        {
          slug: "http-deep",
          title: "HTTP in depth",
          description:
            "Methods, status codes, headers and why the difference between them matters to an API.",
          difficulty: "BEGINNER",
          estimatedTime: "2 hours",
          prerequisites: ["networking-basics"],
        },
        {
          slug: "client-server-model",
          title: "The client–server model",
          description:
            "Which responsibilities belong on the server, and why the client can never be trusted.",
          difficulty: "BEGINNER",
          estimatedTime: "1 hour",
          prerequisites: ["http-deep"],
        },
      ],
    },
    {
      title: "Programming Fundamentals",
      description:
        "One language, learned properly, plus the data structures you'll reach for daily.",
      estimatedDuration: "8–10 weeks",
      whyThisComesNext:
        "Pick one language and go deep rather than sampling several. Everything after this — frameworks, ORMs, testing — is that language with libraries attached, and switching later is far easier than people expect once the fundamentals are solid.",
      topics: [
        {
          slug: "choose-language",
          title: "Choosing a backend language",
          description:
            "Python, JavaScript/TypeScript, Java, C# or Go — what each is genuinely good at, and how to pick one and commit.",
          difficulty: "BEGINNER",
          estimatedTime: "1 hour",
        },
        {
          slug: "language-syntax",
          title: "Syntax and control flow",
          description:
            "Variables, conditions, loops and functions in the language you chose.",
          difficulty: "BEGINNER",
          estimatedTime: "6 hours",
          prerequisites: ["choose-language"],
        },
        {
          slug: "functions-and-modules",
          title: "Functions and modules",
          description:
            "Structuring code across files so it stays navigable past a few hundred lines.",
          difficulty: "BEGINNER",
          estimatedTime: "3 hours",
          prerequisites: ["language-syntax"],
        },
        {
          slug: "data-structures",
          title: "Core data structures",
          description:
            "Lists, maps and sets — and the cost of choosing the wrong one at scale.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "5 hours",
          prerequisites: ["functions-and-modules"],
        },
        {
          slug: "oop-and-composition",
          title: "Objects, composition and interfaces",
          description:
            "Modelling a domain in code without building an inheritance tree you'll regret.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "4 hours",
          prerequisites: ["data-structures"],
        },
        {
          slug: "async-programming",
          title: "Asynchronous programming",
          description:
            "Concurrency, I/O waits and why a blocked thread is a backend problem.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "4 hours",
          prerequisites: ["oop-and-composition"],
        },
      ],
    },
    {
      title: "Git & GitHub",
      description: "Version control and the collaboration workflow teams run on.",
      estimatedDuration: "1–2 weeks",
      whyThisComesNext:
        "You now write enough code to lose some. Git before databases means every schema change and migration from here is recorded, reviewable, and reversible.",
      topics: [
        {
          slug: "git-basics",
          title: "Git fundamentals",
          description:
            "Repositories, commits, branches and history you can actually read.",
          difficulty: "BEGINNER",
          estimatedTime: "2 hours",
        },
        {
          slug: "git-collaboration",
          title: "Branching and pull requests",
          description: "Working alongside other people without overwriting them.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2 hours",
          prerequisites: ["git-basics"],
        },
        {
          slug: "code-review",
          title: "Code review",
          description:
            "Reading someone else's change well, and receiving comments on your own.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "1.5 hours",
          prerequisites: ["git-collaboration"],
        },
      ],
    },
    {
      title: "Databases & Data Modelling",
      description:
        "Where the data lives, how it's shaped, and how to get it back out quickly.",
      estimatedDuration: "6–8 weeks",
      whyThisComesNext:
        "Databases come before APIs here, which is the opposite of many roadmaps. An API is largely a way to expose data — designing endpoints before you can model and query that data produces interfaces that fight the storage underneath them for years.",
      topics: [
        {
          slug: "database-fundamentals",
          title: "Database fundamentals",
          description:
            "What a database gives you that a file does not: durability, concurrency and querying.",
          difficulty: "BEGINNER",
          estimatedTime: "2 hours",
          prerequisites: ["data-structures"],
        },
        {
          slug: "sql",
          title: "SQL",
          description:
            "Selecting, joining, filtering and aggregating — the language of relational data.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "6 hours",
          prerequisites: ["database-fundamentals"],
        },
        {
          slug: "database-design",
          title: "Database design",
          description:
            "Tables, keys, relationships and normalisation — getting the shape right early.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "4 hours",
          prerequisites: ["sql"],
        },
        {
          slug: "indexes-and-performance",
          title: "Indexes and query performance",
          description:
            "Why a query is slow, how to read a plan, and what an index actually costs.",
          difficulty: "ADVANCED",
          estimatedTime: "3 hours",
          prerequisites: ["database-design"],
        },
        {
          slug: "transactions",
          title: "Transactions and consistency",
          description:
            "Making several changes succeed or fail as one, and what isolation levels trade away.",
          difficulty: "ADVANCED",
          estimatedTime: "2.5 hours",
          prerequisites: ["database-design"],
        },
        {
          slug: "orms-and-migrations",
          title: "ORMs and migrations",
          description:
            "Working with a database from code, and evolving a schema that already holds real data.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "3 hours",
          prerequisites: ["database-design", "git-basics"],
        },
        {
          slug: "nosql-tradeoffs",
          title: "NoSQL trade-offs",
          description:
            "When a document or key-value store genuinely fits, and when it's just avoiding schema design.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2 hours",
          isRequired: false,
          prerequisites: ["database-design"],
        },
      ],
    },
    {
      title: "APIs & Application Architecture",
      description:
        "Exposing your data and logic through an interface other developers can use without surprises.",
      estimatedDuration: "5–7 weeks",
      whyThisComesNext:
        "With a language and a database behind you, an API is the natural next layer — it's the seam where your data meets everyone else. Structure and error handling sit in this phase too, because an API is where inconsistency becomes someone else's problem.",
      topics: [
        {
          slug: "rest-apis",
          title: "REST APIs",
          description:
            "Resources, verbs and status codes — designing endpoints that behave predictably.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "4 hours",
          prerequisites: ["http-deep", "sql"],
        },
        {
          slug: "request-validation",
          title: "Input validation",
          description:
            "Rejecting bad data at the boundary, because nothing past it should have to check again.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2 hours",
          prerequisites: ["rest-apis"],
        },
        {
          slug: "error-handling-backend",
          title: "Error handling",
          description:
            "Failing usefully: the right status, a message a client can act on, and detail in the logs not the response.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2.5 hours",
          prerequisites: ["rest-apis"],
        },
        {
          slug: "backend-architecture",
          title: "Application architecture",
          description:
            "Layers, boundaries and dependency direction — keeping business logic out of your route handlers.",
          difficulty: "ADVANCED",
          estimatedTime: "4 hours",
          prerequisites: ["error-handling-backend", "oop-and-composition"],
        },
        {
          slug: "background-jobs",
          title: "Background jobs and queues",
          description:
            "Moving slow work out of the request cycle so responses stay fast.",
          difficulty: "ADVANCED",
          estimatedTime: "3 hours",
          prerequisites: ["async-programming", "backend-architecture"],
        },
        {
          slug: "api-versioning",
          title: "API design and versioning",
          description:
            "Changing an interface other people depend on without breaking them.",
          difficulty: "ADVANCED",
          estimatedTime: "2 hours",
          prerequisites: ["rest-apis"],
        },
      ],
    },
    {
      title: "Authentication, Authorization & Security",
      description:
        "Proving who someone is, deciding what they may do, and closing the gaps around both.",
      estimatedDuration: "4–5 weeks",
      whyThisComesNext:
        "Security sits here, immediately after APIs, rather than at the end. Authentication and authorization are cheap to design in and expensive to retrofit — and every endpoint you write from now on will need both.",
      topics: [
        {
          slug: "authentication",
          title: "Authentication",
          description:
            "Password hashing, sessions and tokens — establishing who a request is from.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "4 hours",
          prerequisites: ["rest-apis"],
        },
        {
          slug: "authorization",
          title: "Authorization",
          description:
            "Roles and permissions — deciding what an authenticated user is allowed to touch.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "3 hours",
          prerequisites: ["authentication"],
        },
        {
          slug: "security-fundamentals",
          title: "Security fundamentals",
          description:
            "Injection, XSS, CSRF and secret management — the failures that actually happen.",
          difficulty: "ADVANCED",
          estimatedTime: "4 hours",
          prerequisites: ["authorization", "request-validation"],
        },
        {
          slug: "rate-limiting",
          title: "Rate limiting and abuse protection",
          description: "Keeping one client from ruining the service for everyone else.",
          difficulty: "ADVANCED",
          estimatedTime: "2 hours",
          prerequisites: ["security-fundamentals"],
        },
      ],
    },
    {
      title: "Testing, Caching & Performance",
      description:
        "Confidence that it works, and that it keeps working as traffic grows.",
      estimatedDuration: "4–5 weeks",
      whyThisComesNext:
        "You need something worth testing and something slow enough to be worth caching. Both of those exist now — and caching before you can measure is how you end up serving stale data for no gain.",
      topics: [
        {
          slug: "backend-testing",
          title: "Testing",
          description:
            "Unit, integration and end-to-end — and knowing which one a given risk deserves.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "4 hours",
          prerequisites: ["backend-architecture"],
        },
        {
          slug: "caching-concepts",
          title: "Caching concepts",
          description:
            "What's safe to cache, for how long, and how to invalidate it without lying to users.",
          difficulty: "ADVANCED",
          estimatedTime: "3 hours",
          prerequisites: ["indexes-and-performance"],
        },
        {
          slug: "redis",
          title: "Redis in practice",
          description: "An in-memory store for caching, sessions and simple queues.",
          difficulty: "ADVANCED",
          estimatedTime: "3 hours",
          prerequisites: ["caching-concepts"],
        },
        {
          slug: "scalability-basics",
          title: "Scalability basics",
          description:
            "Where systems bend under load, and what horizontal scaling actually requires of your code.",
          difficulty: "ADVANCED",
          estimatedTime: "2.5 hours",
          prerequisites: ["redis"],
        },
      ],
    },
    {
      title: "Deployment & Operations",
      description: "Getting it running somewhere real, and knowing when it stops.",
      estimatedDuration: "3–4 weeks",
      whyThisComesNext:
        "Software that only runs on your laptop isn't finished. This phase turns a working project into a running service — and monitoring belongs with it, because the first thing you'll want after deploying is to know what's happening.",
      topics: [
        {
          slug: "docker-fundamentals",
          title: "Docker fundamentals",
          description:
            "Packaging an application with everything it needs so it runs the same anywhere.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "3.5 hours",
          prerequisites: ["operating-systems"],
        },
        {
          slug: "deployment",
          title: "Deployment",
          description:
            "Environments, configuration and getting a release out without downtime.",
          difficulty: "ADVANCED",
          estimatedTime: "3 hours",
          prerequisites: ["docker-fundamentals"],
        },
        {
          slug: "ci-cd",
          title: "CI/CD",
          description:
            "Automating tests and releases so shipping is routine rather than an event.",
          difficulty: "ADVANCED",
          estimatedTime: "2.5 hours",
          prerequisites: ["deployment", "backend-testing"],
        },
        {
          slug: "monitoring",
          title: "Monitoring and observability",
          description:
            "Logs, metrics and alerts — finding out something is wrong before your users tell you.",
          difficulty: "ADVANCED",
          estimatedTime: "3 hours",
          prerequisites: ["deployment"],
        },
      ],
    },
    {
      title: "Backend Projects",
      description:
        "Complete services that demonstrate the whole stack of decisions above.",
      estimatedDuration: "6–10 weeks",
      kind: "PROJECT_MILESTONE",
      whyThisComesNext:
        "These milestones are where the phases stop being separate subjects. A deployed API with authentication, tests and monitoring is one artefact that proves all of them at once.",
      topics: [
        {
          slug: "project-crud-api",
          title: "Milestone: CRUD API",
          description:
            "A REST API over a real database, with validation and honest error responses.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "1–2 weeks",
          prerequisites: ["request-validation", "orms-and-migrations"],
        },
        {
          slug: "project-auth-service",
          title: "Milestone: authenticated service",
          description:
            "Registration, login and permissions, with passwords stored correctly.",
          difficulty: "ADVANCED",
          estimatedTime: "2 weeks",
          prerequisites: ["authorization"],
        },
        {
          slug: "project-deployed-backend",
          title: "Milestone: deployed, monitored service",
          description:
            "Containerised, released through CI, with tests and logging you'd trust on call.",
          difficulty: "ADVANCED",
          estimatedTime: "3–4 weeks",
          prerequisites: ["ci-cd", "monitoring"],
        },
      ],
    },
  ],
};
