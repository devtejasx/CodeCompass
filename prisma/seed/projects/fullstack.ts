import type { SeedProject } from "./types";

/**
 * Full-stack projects. The distinguishing skill here is not knowing both halves
 * — it is the seam between them: who owns which piece of state, what the client
 * is allowed to assume, and what happens when the two disagree.
 */
export const FULLSTACK_PROJECTS: SeedProject[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "fullstack-todo",
    title: "Full Stack Todo Application",
    shortDescription: "A todo app with a real API and database behind it, end to end.",
    description:
      "The smallest complete full-stack application: a React frontend, an API, and a " +
      "database, wired together properly. Small enough to finish, complete enough that " +
      "every layer is real.",
    difficulty: "BEGINNER",
    type: "FULL_STACK",
    estimatedDuration: "10–12 hours",
    whyBuildThis:
      "You will practise moving data across the client-server boundary and see what " +
      "each side is responsible for. The lesson that sticks is that the server is the " +
      "only thing that can be trusted — the client is a convenience, not a guarantee.",
    whatYouBuild:
      "A todo application where items are created, completed, edited and deleted, " +
      "persisted in a database through your own API. Open it on another device and the " +
      "same todos are there.",
    technologies: [
      { name: "React", category: "FRAMEWORK" },
      { name: "Node.js", category: "PLATFORM" },
      { name: "Express", category: "FRAMEWORK" },
      { name: "PostgreSQL", category: "DATABASE" },
    ],
    prerequisiteTopicSlugs: ["fs-react", "fs-node", "fs-apis", "fs-databases"],
    relatedTopicSlugs: ["fs-data-fetching", "fs-error-states"],
    requirements: [
      {
        title: "Create, complete, edit and delete todos",
        description: "All persisted.",
      },
      {
        title: "Todos survive a refresh and a new device",
        description: "Because they live in the database, not the browser.",
      },
      {
        title: "Filter by active and completed",
        description: "Decide whether the server or the client does the filtering.",
      },
      {
        title: "Loading and error states",
        description: "Every request that can be slow or fail shows both.",
      },
      {
        title: "The interface stays responsive while saving",
        description: "No frozen buttons, no double submissions.",
      },
      {
        title: "The server validates every write",
        description:
          "Independently of the client. Client-side validation is for the user's " +
          "benefit, never for the server's safety.",
        category: "TECHNICAL",
      },
      {
        title: "API calls live in one module",
        description: "Not scattered through components.",
        category: "TECHNICAL",
      },
      {
        title: "Both halves run with documented commands",
        description: "A README that a stranger could follow.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Plan the API",
        description:
          "Decide the endpoints and the shape of a todo before writing either half.",
        estimatedTime: "45 minutes",
        concepts: ["API design"],
      },
      {
        title: "Build the database and API",
        description:
          "Schema, then endpoints. Test them with curl before any UI exists.",
        estimatedTime: "3 hours",
        concepts: ["Databases", "REST"],
      },
      {
        title: "Build the interface against fake data",
        description:
          "A working UI with a hardcoded array. Keeps layout problems separate from " +
          "network problems.",
        estimatedTime: "2.5 hours",
        concepts: ["React"],
      },
      {
        title: "Connect the two",
        description:
          "Replace the fake array with real requests, one endpoint at a time.",
        estimatedTime: "2.5 hours",
        concepts: ["Data fetching"],
      },
      {
        title: "Add loading and error states",
        description:
          "Then test them by stopping your API server and watching what happens.",
        estimatedTime: "1.5 hours",
        concepts: ["Error states"],
      },
      {
        title: "Add filtering and polish",
        description: "Empty state, disabled buttons while saving, a pass over mobile.",
        estimatedTime: "1.5 hours",
      },
    ],
    hints: [
      {
        title: "Build the API first",
        content:
          "Get it working with curl before writing a component. Debugging a UI against " +
          "an API you are not sure about means two unknowns at once.",
      },
      {
        title: "Validate twice, trust once",
        content:
          "Client validation is a courtesy to the user. Server validation is the only " +
          "one that counts — anyone can send a request without your form.",
      },
      {
        title: "Decide who owns the id",
        content:
          "If the server generates ids, the client cannot know one until the response " +
          "arrives. That decision shapes how optimistic your UI can be.",
      },
    ],
    resources: [
      {
        title: "Express routing guide",
        url: "https://expressjs.com/en/guide/routing.html",
        source: "Express",
        type: "DOCUMENTATION",
      },
      {
        title: "Synchronizing with effects",
        url: "https://react.dev/learn/synchronizing-with-effects",
        source: "React",
        type: "DOCUMENTATION",
      },
      {
        title: "Cross-Origin Resource Sharing",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS",
        source: "MDN",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "fullstack-notes",
    title: "Notes Application",
    shortDescription:
      "Notes with folders, search and autosave, backed by your own API.",
    description:
      "A step up from todos: richer data, a folder hierarchy, and autosave. Saving " +
      "while the user is still typing is where you meet debouncing, request ordering, " +
      "and the question of what 'saved' means.",
    difficulty: "BEGINNER",
    type: "FULL_STACK",
    estimatedDuration: "12–15 hours",
    whyBuildThis:
      "You will practise modelling data with a relationship, keeping client and server " +
      "in step while the client keeps changing, and designing an interface that tells " +
      "the truth about whether work is saved. Autosave is a small feature with a " +
      "surprising amount of correctness in it.",
    whatYouBuild:
      "A notes application with folders, full-text search, and notes that save " +
      "themselves as you type. The interface always shows whether the current text has " +
      "reached the server.",
    technologies: [
      { name: "React", category: "FRAMEWORK" },
      { name: "Node.js", category: "PLATFORM" },
      { name: "PostgreSQL", category: "DATABASE" },
      { name: "Prisma", category: "LIBRARY" },
    ],
    prerequisiteTopicSlugs: [
      "fs-react-hooks",
      "fs-node",
      "fs-apis",
      "fs-data-modelling",
    ],
    relatedTopicSlugs: ["fs-databases", "fs-error-states", "fs-data-fetching"],
    requirements: [
      { title: "Create, edit and delete notes", description: "With title and body." },
      {
        title: "Organise notes into folders",
        description: "Move a note between them.",
      },
      { title: "Search across all notes", description: "Title and body." },
      {
        title: "Notes autosave",
        description: "Without a save button, and without a request per keystroke.",
      },
      {
        title: "Save status is always visible",
        description: "Saving, saved, or failed — never ambiguous.",
      },
      {
        title: "A failed save is recoverable",
        description: "The user's text is not lost, and they can retry.",
      },
      {
        title: "Autosave is debounced",
        description: "Fires on a pause in typing, not on every character.",
        category: "TECHNICAL",
      },
      {
        title: "Out-of-order saves cannot revert content",
        description:
          "A slow earlier save resolving after a faster later one must not overwrite it.",
        category: "TECHNICAL",
      },
      {
        title: "Deleting a folder handles its notes",
        description: "Decide the rule and enforce it in the schema.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Model notes and folders",
        description: "And decide what happens to notes when a folder is deleted.",
        estimatedTime: "1 hour",
        concepts: ["Data modelling"],
      },
      {
        title: "Build the API",
        description: "CRUD for both, plus search. Verified with curl.",
        estimatedTime: "3 hours",
        concepts: ["REST"],
      },
      {
        title: "Build the shell",
        description: "Folder sidebar, note list, editor pane. Static first.",
        estimatedTime: "2.5 hours",
        concepts: ["React"],
      },
      {
        title: "Wire up reading",
        description: "Real folders and notes, selecting one to open it.",
        estimatedTime: "2 hours",
        concepts: ["Data fetching"],
      },
      {
        title: "Implement autosave",
        description:
          "Debounced. Then watch the network tab and count the requests while typing a " +
          "sentence.",
        estimatedTime: "2.5 hours",
        concepts: ["Debouncing"],
      },
      {
        title: "Handle save failures and ordering",
        description:
          "Turn off your server mid-edit. The text must survive and the status must be " +
          "honest.",
        estimatedTime: "2 hours",
        concepts: ["Error states"],
      },
      {
        title: "Add search and folder management",
        description: "Moving notes between folders, renaming, deleting.",
        estimatedTime: "2 hours",
      },
    ],
    hints: [
      {
        title: "Debounce, then guard",
        content:
          "Debouncing reduces requests but does not order them. You still need to know " +
          "which save is the latest, or a slow one will resurrect old text.",
      },
      {
        title: "Never block typing on the network",
        content:
          "The editor's value is client state. The server is told about it afterwards. " +
          "Making the input wait for a response makes the app feel broken.",
      },
      {
        title: "'Saved' is a claim — make it true",
        content:
          "Only show saved once the server has confirmed it. Showing it optimistically " +
          "and being wrong is how people lose work and stop trusting the app.",
      },
    ],
    resources: [
      {
        title: "Prisma Client CRUD",
        url: "https://www.prisma.io/docs/orm/prisma-client/queries/crud",
        source: "Prisma",
        type: "DOCUMENTATION",
      },
      {
        title: "You might not need an effect",
        url: "https://react.dev/learn/you-might-not-need-an-effect",
        source: "React",
        type: "ARTICLE",
      },
      {
        title: "PostgreSQL full text search",
        url: "https://www.postgresql.org/docs/current/textsearch.html",
        source: "PostgreSQL",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "expense-management-app",
    title: "Expense Management Application",
    shortDescription:
      "A typed full-stack app with shared types, reports and multiple routes.",
    description:
      "The same domain as the frontend expense tracker, but with a server, a database " +
      "and TypeScript across both halves. Sharing types between client and server is " +
      "the point: the compiler, not a code review, catches the mismatch.",
    difficulty: "INTERMEDIATE",
    type: "FULL_STACK",
    estimatedDuration: "18–22 hours",
    whyBuildThis:
      "You will practise defining a contract once and enforcing it on both sides, " +
      "server-side aggregation, and routing that reflects application state. Changing " +
      "an API response and seeing the frontend fail to compile is a genuinely different " +
      "experience from finding out in production.",
    whatYouBuild:
      "An application where expenses are recorded against categories and budgets, with " +
      "reports by month and category, filtering that lives in the URL, and types shared " +
      "between the API and the interface.",
    technologies: [
      { name: "TypeScript", category: "LANGUAGE" },
      { name: "React", category: "FRAMEWORK" },
      { name: "Node.js", category: "PLATFORM" },
      { name: "PostgreSQL", category: "DATABASE" },
    ],
    prerequisiteTopicSlugs: [
      "fs-react-routing",
      "fs-data-fetching",
      "fs-data-modelling",
      "fs-apis",
      "fs-typescript",
    ],
    relatedTopicSlugs: ["fs-shared-types", "fs-error-states"],
    requirements: [
      { title: "Record expenses", description: "Amount, category, date and note." },
      { title: "Manage categories", description: "Create, rename and archive." },
      {
        title: "Set a monthly budget per category",
        description: "And show progress against it.",
      },
      {
        title: "Reports by month and category",
        description:
          "Aggregated on the server, not by shipping every row to the client.",
      },
      {
        title: "Filters live in the URL",
        description: "So a filtered report can be bookmarked and shared.",
      },
      {
        title: "Export to CSV",
        description: "Respecting the current filters.",
        isRequired: false,
      },
      {
        title: "Request and response types are shared",
        description:
          "Defined once and imported by both halves. Changing one must break the other " +
          "at compile time.",
        category: "TECHNICAL",
      },
      {
        title: "Server validates against the same schema",
        description:
          "One schema producing both the runtime validator and the TypeScript type.",
        category: "TECHNICAL",
      },
      {
        title: "Money is stored as integers",
        description: "Minor units. Formatted only for display.",
        category: "TECHNICAL",
      },
      {
        title: "Aggregation happens in the database",
        description: "Sums and groupings are SQL's job.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Set up the shared workspace",
        description:
          "A structure where both halves can import the same types. Do this first; " +
          "retrofitting it is miserable.",
        estimatedTime: "2 hours",
        concepts: ["Tooling", "TypeScript"],
      },
      {
        title: "Define the domain types and schemas",
        description:
          "One schema per payload, generating both the validator and the type.",
        estimatedTime: "2 hours",
        concepts: ["Shared types", "Validation"],
      },
      {
        title: "Build the database and expense API",
        description:
          "Schema and CRUD endpoints, typed end to end using the shared definitions. " +
          "Confirm that changing a shared type breaks the other half at compile time.",
        estimatedTime: "3.5 hours",
        concepts: ["Databases", "REST"],
      },
      {
        title: "Add categories and budgets",
        description: "Including what archiving a category does to its past expenses.",
        estimatedTime: "3 hours",
      },
      {
        title: "Build the reporting endpoints",
        description: "Grouped aggregation in SQL. Check the query plan.",
        estimatedTime: "3 hours",
        concepts: ["SQL", "Performance"],
      },
      {
        title: "Build the interface",
        description: "Routes for entry, list and reports.",
        estimatedTime: "4 hours",
        concepts: ["React", "Routing"],
      },
      {
        title: "Move filters into the URL",
        description: "Handle a URL someone has edited by hand into nonsense.",
        estimatedTime: "2 hours",
        concepts: ["Routing"],
      },
      {
        title: "Error states and polish",
        description: "Every route that fetches handles loading, empty and failure.",
        estimatedTime: "2 hours",
        concepts: ["Error states"],
      },
    ],
    hints: [
      {
        title: "One schema, two outputs",
        content:
          "A validation library that infers TypeScript types from its schemas gives you " +
          "runtime checking and compile-time types from a single definition. Two " +
          "separate declarations will drift.",
      },
      {
        title: "Do not aggregate in JavaScript",
        content:
          "Fetching every expense to sum them in the client works with fifty rows and " +
          "collapses at fifty thousand. GROUP BY exists for this.",
      },
      {
        title: "The URL is state you get for free",
        content:
          "Filters in the query string give you the back button, bookmarking and " +
          "sharing without writing any of it.",
      },
    ],
    resources: [
      {
        title: "TypeScript handbook",
        url: "https://www.typescriptlang.org/docs/handbook/intro.html",
        source: "TypeScript",
        type: "DOCUMENTATION",
      },
      {
        title: "Zod documentation",
        url: "https://zod.dev/",
        source: "Zod",
        type: "DOCUMENTATION",
      },
      {
        title: "PostgreSQL aggregate functions",
        url: "https://www.postgresql.org/docs/current/functions-aggregate.html",
        source: "PostgreSQL",
        type: "REFERENCE",
      },
    ],
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "blog-platform",
    title: "Blog Platform",
    shortDescription:
      "A multi-user publishing platform with real accounts and permissions.",
    description:
      "Your first application with genuine users. Sessions, ownership, drafts and " +
      "public pages — and every one of those is a place where a mistake shows someone " +
      "else's data to the wrong person.",
    difficulty: "INTERMEDIATE",
    type: "FULL_STACK",
    estimatedDuration: "20–25 hours",
    whyBuildThis:
      "You will practise a complete authentication flow across client and server, " +
      "permission checks that live in one place, and the discipline of never trusting " +
      "an identifier that arrived from the browser. This is the project where security " +
      "stops being a chapter and becomes a habit.",
    whatYouBuild:
      "A platform where people register, write posts as drafts, publish them, and " +
      "comment on each other's work. Published posts are public; drafts are visible " +
      "only to their author; nobody can edit anybody else's anything.",
    technologies: [
      { name: "React", category: "FRAMEWORK" },
      { name: "Node.js", category: "PLATFORM" },
      { name: "PostgreSQL", category: "DATABASE" },
      { name: "Sessions", category: "TOOL" },
    ],
    prerequisiteTopicSlugs: [
      "fs-auth",
      "fs-auth-flow",
      "fs-data-modelling",
      "fs-apis",
      "fs-error-states",
    ],
    relatedTopicSlugs: ["fs-server-security", "fs-react-routing", "fs-databases"],
    requirements: [
      {
        title: "Register, log in and log out",
        description: "With a persistent session.",
      },
      {
        title: "Write, edit and delete your own posts",
        description: "And only your own.",
      },
      {
        title: "Drafts and published posts",
        description: "Publishing is an explicit action.",
      },
      {
        title: "Public reading without an account",
        description: "Published posts are readable by anyone.",
      },
      {
        title: "Comment on published posts",
        description: "Signed in only. Authors can remove comments on their own posts.",
      },
      {
        title: "Author profile pages",
        description: "Listing that author's published work.",
      },
      {
        title: "Drafts never leak",
        description:
          "Not in listings, not by direct URL, not in search, not in counts.",
      },
      {
        title: "Every write re-checks ownership on the server",
        description:
          "The client hiding a button is presentation. The server refusing is security.",
        category: "TECHNICAL",
      },
      {
        title: "The session user is never taken from the request body",
        description: "It comes from the verified session, every time.",
        category: "TECHNICAL",
      },
      {
        title: "Post content is rendered safely",
        description:
          "If you allow any markup, sanitise it. Assume someone will try to inject a " +
          "script.",
        category: "TECHNICAL",
      },
      {
        title: "Protected routes handle an expired session",
        description: "Gracefully, without dumping the user somewhere confusing.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Model users, posts and comments",
        description: "Including the draft state and what deletion cascades to.",
        estimatedTime: "1.5 hours",
        concepts: ["Data modelling"],
      },
      {
        title: "Build authentication on the server",
        description:
          "Register, log in, log out, and a way to identify the current user.",
        estimatedTime: "4 hours",
        concepts: ["Authentication"],
      },
      {
        title: "Wire authentication into the client",
        description: "Forms, session state, and routes that require it.",
        estimatedTime: "3 hours",
        concepts: ["Auth flow"],
      },
      {
        title: "Build post authoring",
        description: "Create, edit, delete — with ownership enforced server-side.",
        estimatedTime: "4 hours",
        concepts: ["Authorization"],
      },
      {
        title: "Add drafts and publishing",
        description:
          "Then go through every endpoint asking whether it could reveal a draft.",
        estimatedTime: "3 hours",
        concepts: ["Authorization"],
      },
      {
        title: "Build public reading",
        description: "Post pages and author profiles, working signed out.",
        estimatedTime: "3 hours",
      },
      {
        title: "Add comments",
        description: "With their own permission rules for deletion.",
        estimatedTime: "2.5 hours",
      },
      {
        title: "Try to break your own permissions",
        description:
          "Log in as one user and attempt to edit another's post directly against the " +
          "API. Fix whatever succeeds.",
        estimatedTime: "2 hours",
        concepts: ["Security"],
      },
    ],
    hints: [
      {
        title: "Hiding a button is not a permission",
        content:
          "Anyone can send the request without your interface. Every check the UI makes " +
          "must exist again on the server, where it counts.",
      },
      {
        title: "One function answers 'may they?'",
        content:
          "Write a single function that decides whether a user may act on a post, and " +
          "call it from every handler. Duplicated checks drift apart.",
      },
      {
        title: "Test the leak paths, not the happy path",
        content:
          "Draft leaks turn up in listings, counts and search — never on the endpoint " +
          "you were thinking about when you wrote the check.",
      },
    ],
    resources: [
      {
        title: "OWASP session management cheat sheet",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html",
        source: "OWASP",
        type: "ARTICLE",
      },
      {
        title: "OWASP cross-site scripting prevention",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html",
        source: "OWASP",
        type: "ARTICLE",
      },
      {
        title: "Using HTTP cookies",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies",
        source: "MDN",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "event-management-platform",
    title: "Event Management Platform",
    shortDescription:
      "Create events, sell out capacity, and never let two people take one seat.",
    description:
      "An events platform with registration, capacity limits and waitlists. The " +
      "interesting part is capacity: the moment an event nearly sells out, correctness " +
      "under concurrency stops being theoretical.",
    difficulty: "INTERMEDIATE",
    type: "FULL_STACK",
    estimatedDuration: "22–28 hours",
    whyBuildThis:
      "You will practise designing around a constraint that must never be violated, " +
      "handling time zones without losing your mind, and building flows that span " +
      "several steps. Overbooking is the kind of bug that is invisible in development " +
      "and obvious in production.",
    whatYouBuild:
      "A platform where organisers create events with a capacity and attendees " +
      "register. When an event fills, further registrations join a waitlist and are " +
      "promoted automatically when someone cancels.",
    technologies: [
      { name: "React", category: "FRAMEWORK" },
      { name: "TypeScript", category: "LANGUAGE" },
      { name: "Node.js", category: "PLATFORM" },
      { name: "PostgreSQL", category: "DATABASE" },
    ],
    prerequisiteTopicSlugs: [
      "fs-auth",
      "fs-data-modelling",
      "fs-shared-types",
      "fs-data-fetching",
      "fs-error-states",
    ],
    relatedTopicSlugs: ["fs-architecture", "fs-testing", "fs-typescript"],
    requirements: [
      {
        title: "Organisers create and edit events",
        description: "Title, description, time, location and capacity.",
      },
      { title: "Attendees register and cancel", description: "Signed in." },
      {
        title: "Capacity is never exceeded",
        description: "Not even when several people register at the same instant.",
      },
      {
        title: "A waitlist when full",
        description: "Ordered, with a visible position.",
      },
      {
        title: "Automatic promotion from the waitlist",
        description: "When someone cancels, the next person gets the place.",
      },
      {
        title: "Times display in the viewer's zone",
        description: "An event at 18:00 in London is not 18:00 in New York.",
      },
      {
        title: "Organisers see their attendee list",
        description: "Attendees do not.",
      },
      {
        title: "Registration is transactional",
        description:
          "Checking capacity and creating a registration happen as one atomic " +
          "operation, or the check is meaningless.",
        category: "TECHNICAL",
      },
      {
        title: "Concurrency is proven, not assumed",
        description:
          "A test that fires more simultaneous registrations than there are places, and " +
          "asserts the capacity held.",
        category: "TECHNICAL",
      },
      {
        title: "Timestamps stored in UTC",
        description: "Converted only at the edges, for display.",
        category: "TECHNICAL",
      },
      {
        title: "Registering twice is impossible",
        description: "Enforced by a unique constraint, not by a check in the handler.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Model events, registrations and the waitlist",
        description:
          "Decide whether waitlist entries are registrations in a different state or a " +
          "separate thing. Both work; pick one and be consistent.",
        estimatedTime: "2 hours",
        concepts: ["Data modelling"],
      },
      {
        title: "Build event management",
        description: "Organiser CRUD with ownership enforced.",
        estimatedTime: "3.5 hours",
      },
      {
        title: "Implement registration naively",
        description:
          "Check capacity, then insert. Then write the test that proves it is wrong.",
        estimatedTime: "2.5 hours",
      },
      {
        title: "Make registration correct",
        description:
          "Transaction plus a constraint or a lock. Rerun the concurrency test until " +
          "it passes.",
        estimatedTime: "3 hours",
        concepts: ["Transactions", "Concurrency"],
      },
      {
        title: "Add cancellation and waitlist promotion",
        description:
          "Also transactional — a cancellation and a promotion are one operation.",
        estimatedTime: "3.5 hours",
      },
      {
        title: "Handle time zones",
        description:
          "Store UTC, display local. Test with your machine set to a different zone.",
        estimatedTime: "2.5 hours",
        concepts: ["Dates and times"],
      },
      {
        title: "Build the attendee interface",
        description: "Browse, register, cancel, see waitlist position.",
        estimatedTime: "4 hours",
        concepts: ["React"],
      },
      {
        title: "Build the organiser dashboard",
        description: "Their events, attendee lists, capacity at a glance.",
        estimatedTime: "3 hours",
      },
    ],
    hints: [
      {
        title: "Write the failing test first",
        content:
          "Fire twenty simultaneous registrations at an event with ten places. Watch " +
          "the naive version oversell. That test is what tells you the fix worked.",
      },
      {
        title: "Constraints beat checks",
        content:
          "A unique constraint on (event, attendee) makes double registration " +
          "impossible. A check in your handler makes it merely unlikely.",
      },
      {
        title: "Store UTC, always",
        content:
          "Convert at the edges only. A timestamp stored in local time is a bug waiting " +
          "for daylight saving, and it will be very hard to unpick afterwards.",
      },
    ],
    resources: [
      {
        title: "PostgreSQL date/time types",
        url: "https://www.postgresql.org/docs/current/datatype-datetime.html",
        source: "PostgreSQL",
        type: "DOCUMENTATION",
      },
      {
        title: "PostgreSQL transaction isolation",
        url: "https://www.postgresql.org/docs/current/transaction-iso.html",
        source: "PostgreSQL",
        type: "DOCUMENTATION",
      },
      {
        title: "Intl.DateTimeFormat",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat",
        source: "MDN",
        type: "REFERENCE",
      },
    ],
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "ecommerce-application",
    title: "E-commerce Application",
    shortDescription:
      "A complete shop: catalogue, cart, checkout, orders, admin and deployment.",
    description:
      "A full application with several user types, a multi-step flow that must not " +
      "lose anyone's money, and enough surface area that architecture starts to matter " +
      "more than any individual feature.",
    difficulty: "ADVANCED",
    type: "FULL_STACK",
    estimatedDuration: "40–50 hours",
    whyBuildThis:
      "You will practise structuring an application large enough to get lost in, " +
      "designing a checkout that survives interruption, separating customer and admin " +
      "concerns, and shipping it. It is the closest thing here to what a real product " +
      "team actually builds.",
    whatYouBuild:
      "A shop with a searchable catalogue, a persistent cart, a multi-step checkout, " +
      "order history for customers and an admin area for managing products and orders. " +
      "It is tested and deployed.",
    technologies: [
      { name: "Next.js", category: "FRAMEWORK" },
      { name: "TypeScript", category: "LANGUAGE" },
      { name: "PostgreSQL", category: "DATABASE" },
      { name: "Prisma", category: "LIBRARY" },
      { name: "Docker", category: "TOOL" },
    ],
    prerequisiteTopicSlugs: [
      "fs-architecture",
      "fs-auth-flow",
      "fs-server-security",
      "fs-performance",
      "fs-testing",
    ],
    relatedTopicSlugs: ["fs-deployment", "fs-docker", "fs-data-modelling"],
    requirements: [
      {
        title: "Catalogue with search, filters and pagination",
        description: "Fast on a few thousand products.",
      },
      {
        title: "A cart that persists",
        description: "Across sessions for signed-in users.",
      },
      {
        title: "Multi-step checkout",
        description: "Recoverable if the customer leaves halfway and comes back.",
      },
      {
        title: "Orders with a lifecycle",
        description: "Defined states, and only legal transitions between them.",
      },
      {
        title: "Customer order history",
        description: "Each customer sees their own orders and nobody else's.",
      },
      {
        title: "An admin area",
        description: "Manage products, stock and order status.",
      },
      {
        title: "Stock cannot be oversold",
        description: "Placing an order and reserving stock is one atomic operation.",
      },
      {
        title: "No real payments",
        description:
          "A simulated payment step. Do not handle real card details in a learning " +
          "project — that is a compliance question, not a coding one.",
      },
      {
        title: "Roles are enforced on the server",
        description: "Every admin route, every time.",
        category: "TECHNICAL",
      },
      {
        title: "Order placement is idempotent",
        description: "A double-submitted checkout creates one order.",
        category: "TECHNICAL",
      },
      {
        title: "Critical paths are tested",
        description: "Checkout and stock reservation at minimum.",
        category: "TECHNICAL",
      },
      {
        title: "Deployed and reachable",
        description: "With migrations run as part of the deploy, not by hand.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Design the architecture",
        description:
          "Modules, boundaries, where business rules live. Write it down before " +
          "building.",
        estimatedTime: "4 hours",
        concepts: ["Architecture"],
      },
      {
        title: "Model the domain",
        description: "Products, stock, carts, orders, users, roles.",
        estimatedTime: "3 hours",
        concepts: ["Data modelling"],
      },
      {
        title: "Build authentication and roles",
        description: "Customer and admin, enforced server-side from the start.",
        estimatedTime: "4 hours",
        concepts: ["Auth"],
      },
      {
        title: "Build the catalogue",
        description: "Search, filters, pagination, detail pages.",
        estimatedTime: "6 hours",
      },
      {
        title: "Build the cart",
        description: "Persistent, correct arithmetic, surviving sign-in.",
        estimatedTime: "4 hours",
      },
      {
        title: "Build checkout",
        description:
          "Multi-step and resumable. Decide what happens if they close the tab at " +
          "step two.",
        estimatedTime: "6 hours",
      },
      {
        title: "Implement order placement",
        description: "Transactional, idempotent, with stock reserved atomically.",
        estimatedTime: "5 hours",
        concepts: ["Transactions", "Idempotency"],
      },
      {
        title: "Build the admin area",
        description: "Products, stock, order management.",
        estimatedTime: "6 hours",
      },
      {
        title: "Test the critical paths",
        description:
          "Checkout and stock. These are the ones that cost money when wrong.",
        estimatedTime: "5 hours",
        concepts: ["Testing"],
      },
      {
        title: "Deploy it",
        description:
          "Real environment, migrations in the pipeline, secrets in configuration.",
        estimatedTime: "4 hours",
        concepts: ["Deployment"],
      },
    ],
    hints: [
      {
        title: "Prices belong to the order",
        content:
          "Copy the price onto the order line when the order is placed. Referencing the " +
          "product means an old order's total changes when someone edits the price.",
      },
      {
        title: "Assume checkout gets interrupted",
        content:
          "People close tabs, lose signal and come back an hour later. Design for that " +
          "from the start rather than treating it as an edge case.",
      },
      {
        title: "Do not touch real card data",
        content:
          "Handling real payment details brings compliance obligations that have no " +
          "place in a learning project. Simulate the step — the interesting engineering " +
          "is everywhere else.",
      },
    ],
    resources: [
      {
        title: "Next.js documentation",
        url: "https://nextjs.org/docs",
        source: "Next.js",
        type: "DOCUMENTATION",
      },
      {
        title: "Prisma transactions",
        url: "https://www.prisma.io/docs/orm/prisma-client/queries/transactions",
        source: "Prisma",
        type: "DOCUMENTATION",
      },
      {
        title: "The Twelve-Factor App",
        url: "https://12factor.net/",
        source: "12factor.net",
        type: "ARTICLE",
      },
      {
        title: "Playwright documentation",
        url: "https://playwright.dev/docs/intro",
        source: "Playwright",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "realtime-collaboration-app",
    title: "Real-time Collaboration Application",
    shortDescription:
      "A shared workspace where several people edit at once and stay in sync.",
    description:
      "The hardest project in the catalogue. Multiple people changing the same data " +
      "simultaneously, over a connection that drops, with a user interface that has to " +
      "stay responsive throughout. Conflict resolution is not a feature you add at the " +
      "end — it is the design.",
    difficulty: "ADVANCED",
    type: "FULL_STACK",
    estimatedDuration: "40–50 hours",
    whyBuildThis:
      "You will practise real-time transport, optimistic updates with reconciliation, " +
      "reconnection, and thinking clearly about what happens when two truths disagree. " +
      "Very few developers have built this, and the reasoning it teaches transfers to " +
      "anything distributed.",
    whatYouBuild:
      "A collaborative workspace — a shared board or document — where several people " +
      "work at once, see each other's cursors and changes live, and can drop off the " +
      "network and rejoin without losing or duplicating work.",
    technologies: [
      { name: "React", category: "FRAMEWORK" },
      { name: "TypeScript", category: "LANGUAGE" },
      { name: "WebSockets", category: "TOOL" },
      { name: "Node.js", category: "PLATFORM" },
      { name: "PostgreSQL", category: "DATABASE" },
    ],
    prerequisiteTopicSlugs: [
      "fs-architecture",
      "fs-performance",
      "fs-testing",
      "fs-deployment",
      "fs-docker",
    ],
    relatedTopicSlugs: ["fs-auth-flow", "fs-server-security", "fs-data-modelling"],
    requirements: [
      {
        title: "Several people edit simultaneously",
        description: "Changes appear for everyone within a moment.",
      },
      {
        title: "Presence",
        description: "Who is here now, and where they are working.",
      },
      {
        title: "Changes apply immediately for the person making them",
        description: "No waiting for a server round trip before the UI responds.",
      },
      {
        title: "Concurrent edits converge",
        description:
          "Two people editing at once end up with the same result. Document your " +
          "conflict rule and defend it.",
      },
      {
        title: "Survives disconnection",
        description: "Reconnect, resynchronise, without losing or duplicating changes.",
      },
      {
        title: "Changes are persisted",
        description: "A reload shows the current state.",
      },
      {
        title: "Only invited people can join a workspace",
        description: "Authorised on connection, not just in the interface.",
      },
      {
        title: "Optimistic updates reconcile with the server",
        description:
          "When the server disagrees, the client corrects itself visibly rather than " +
          "silently diverging.",
        category: "TECHNICAL",
      },
      {
        title: "Reconnection is automatic with backoff",
        description: "Not a reload prompt, and not a tight retry loop.",
        category: "TECHNICAL",
      },
      {
        title: "Message volume is bounded",
        description:
          "Cursor movements are throttled. A moving mouse must not produce sixty " +
          "messages a second per user.",
        category: "TECHNICAL",
      },
      {
        title: "Convergence is tested",
        description:
          "A test that applies concurrent operations in different orders and asserts " +
          "the same final state.",
        category: "TECHNICAL",
      },
      {
        title: "Socket authorisation is enforced server-side",
        description: "A connection is authorised before it joins a room.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Choose your conflict model",
        description:
          "Last-write-wins, operational transformation, or a CRDT. Read enough to " +
          "choose deliberately and write down why — this decision shapes everything.",
        estimatedTime: "4 hours",
        concepts: ["Distributed systems"],
      },
      {
        title: "Get a socket connection working",
        description: "Two browsers, one message passed between them.",
        estimatedTime: "2.5 hours",
        concepts: ["WebSockets"],
      },
      {
        title: "Build the single-user version",
        description:
          "The whole workspace working for one person, persisted. Do not add " +
          "collaboration until this is solid.",
        estimatedTime: "6 hours",
      },
      {
        title: "Add rooms and presence",
        description: "Joining, leaving, and who is currently here.",
        estimatedTime: "4 hours",
      },
      {
        title: "Broadcast changes",
        description: "Everyone sees everyone's edits. Conflicts will now appear.",
        estimatedTime: "5 hours",
      },
      {
        title: "Implement conflict resolution",
        description: "Your chosen model, applied consistently on both sides.",
        estimatedTime: "8 hours",
        concepts: ["Conflict resolution"],
      },
      {
        title: "Add optimistic updates",
        description:
          "Local changes apply instantly and reconcile when the server replies.",
        estimatedTime: "5 hours",
      },
      {
        title: "Handle disconnection",
        description:
          "Turn off your wifi mid-edit and turn it back on. Nothing may be lost or " +
          "applied twice.",
        estimatedTime: "5 hours",
        concepts: ["Resilience"],
      },
      {
        title: "Throttle and optimise",
        description: "Bound the message rate. Measure with several clients connected.",
        estimatedTime: "3 hours",
        concepts: ["Performance"],
      },
      {
        title: "Test convergence",
        description:
          "Apply the same operations in different orders and assert identical results.",
        estimatedTime: "4 hours",
        concepts: ["Testing"],
      },
    ],
    hints: [
      {
        title: "Single-user first",
        content:
          "Get the whole thing working for one person before a second connects. " +
          "Debugging collaboration on top of an unfinished feature is two problems at " +
          "once.",
      },
      {
        title: "Choose your conflict rule explicitly",
        content:
          "Last-write-wins is legitimate and simple — for some data. What is not " +
          "legitimate is not having decided, and discovering your rule by watching what " +
          "the bugs do.",
      },
      {
        title: "Reconnection is the real test",
        content:
          "Anything works on a perfect network. The design shows itself when a client " +
          "misses thirty seconds of changes and rejoins — decide now how it catches up.",
      },
    ],
    resources: [
      {
        title: "WebSockets API",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API",
        source: "MDN",
        type: "DOCUMENTATION",
      },
      {
        title: "Socket.IO documentation",
        url: "https://socket.io/docs/v4/",
        source: "Socket.IO",
        type: "DOCUMENTATION",
      },
      {
        title: "Yjs documentation",
        url: "https://docs.yjs.dev/",
        source: "Yjs",
        type: "DOCUMENTATION",
      },
      {
        title: "Vitest guide",
        url: "https://vitest.dev/guide/",
        source: "Vitest",
        type: "DOCUMENTATION",
      },
    ],
  },
];
