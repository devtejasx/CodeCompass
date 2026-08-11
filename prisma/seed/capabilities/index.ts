import type { SeedCapability } from "./types";

/**
 * The capability catalog.
 *
 * Sixteen capabilities, each one a claim a learner should be able to make about
 * themselves, with the sources that would count as evidence for it.
 *
 * Two authoring rules run through the whole file.
 *
 * **A capability spans roadmaps.** A full-stack learner's `fs-react` and a
 * frontend learner's `react-fundamentals` are the same capability, so both are
 * listed. Whichever path somebody followed, the evidence counts — and a learner
 * who changes career keeps everything they genuinely learned.
 *
 * **Sources are named at the coarsest level that stays true.** Practice is
 * attached by topic rather than by problem, so adding a problem to a topic
 * strengthens the capability without anybody editing this file. Projects are
 * named individually because a project is a specific, checkable artefact.
 */
export const CAPABILITIES: SeedCapability[] = [
  // ── Programming ─────────────────────────────────────────────────────────
  {
    slug: "programming-fundamentals",
    name: "Programming Fundamentals",
    description:
      "Variables, types, conditions, loops and functions — the ideas every language shares.",
    longDescription:
      "The parts of programming that transfer. Someone with this capability can read a small program in a language they have not used before and work out roughly what it does, because they recognise the shapes: a value being stored, a decision being made, something repeating, a piece of work given a name.",
    category: "PROGRAMMING",
    icon: "Code2",
    topics: [
      "js-variables",
      "js-data-types",
      "js-operators",
      "js-conditions",
      "js-loops",
      "js-functions",
      "language-syntax",
      "functions-and-modules",
      "fs-js-basics",
    ],
    practiceTopics: [
      "js-variables",
      "js-loops",
      "js-functions",
      "language-syntax",
      "fs-js-basics",
    ],
    projects: ["calculator", "quiz-application"],
  },
  {
    slug: "javascript",
    name: "JavaScript",
    description:
      "The language of the web: objects, scope, modules, errors and asynchronous code.",
    longDescription:
      "Beyond the basics into what makes JavaScript itself. Someone with this capability understands why `this` behaves as it does, what a closure captures, why an async function returns a promise, and how a module boundary works — the things that separate writing JavaScript from fighting it.",
    category: "PROGRAMMING",
    icon: "Braces",
    topics: [
      "js-arrays",
      "js-objects",
      "js-scope",
      "js-modules",
      "js-error-handling",
      "js-async",
      "js-promises",
      "fs-js-modules",
    ],
    practiceTopics: ["js-arrays", "js-objects", "js-async", "js-promises"],
    projects: ["calculator", "quiz-application", "expense-tracker"],
  },
  {
    slug: "data-structures",
    name: "Data Structures & Algorithms",
    description: "Choosing the right shape for data, and reasoning about cost.",
    longDescription:
      "Knowing which structure suits a problem and why. Someone with this capability can say what a lookup costs, why a set beats an array for membership, and when the obvious nested loop is the thing making something slow.",
    category: "PROGRAMMING",
    icon: "Binary",
    topics: ["data-structures", "js-arrays", "js-objects"],
    practiceTopics: ["data-structures", "js-arrays", "js-objects"],
  },

  // ── Web development ─────────────────────────────────────────────────────
  {
    slug: "how-the-web-works",
    name: "How the Web Works",
    description:
      "Requests, responses, browsers, DNS and where your code actually runs.",
    longDescription:
      "The mental model everything else sits on. Someone with this capability can explain what happens between typing a URL and seeing a page, which means they can reason about where a bug is rather than guessing.",
    category: "WEB_DEVELOPMENT",
    icon: "Globe",
    topics: [
      "how-the-internet-works",
      "browsers",
      "http-https",
      "dns",
      "client-and-server",
      "http-deep",
      "client-server-model",
      "networking-basics",
      "fs-internet",
      "fs-http",
    ],
  },
  {
    slug: "html-css",
    name: "HTML & CSS",
    description:
      "Semantic markup, layout with flexbox and grid, and responsive design.",
    longDescription:
      "Building interfaces that work on any screen and make sense to a screen reader. Someone with this capability reaches for the right element rather than a div, and can lay something out without fighting the box model.",
    category: "WEB_DEVELOPMENT",
    icon: "Layout",
    topics: [
      "html-fundamentals",
      "semantic-html",
      "html-forms",
      "css-fundamentals",
      "css-selectors",
      "box-model",
      "flexbox",
      "css-grid",
      "responsive-design",
      "media-queries",
      "fs-html",
      "fs-css",
      "fs-responsive",
    ],
    projects: ["personal-portfolio", "responsive-landing-page"],
  },
  {
    slug: "dom-and-events",
    name: "DOM & Events",
    description: "Making a page respond to the person using it.",
    longDescription:
      "Reading and changing a live page, and responding to what somebody does on it. Someone with this capability understands that the DOM is a tree they can query and mutate, and why event handling is where most interactive bugs live.",
    category: "WEB_DEVELOPMENT",
    icon: "MousePointerClick",
    topics: ["js-dom", "js-events"],
    practiceTopics: ["js-dom", "js-events"],
    projects: ["calculator", "quiz-application", "expense-tracker"],
  },
  {
    slug: "accessibility",
    name: "Accessibility",
    description: "Building interfaces people can actually use, however they use them.",
    longDescription:
      "Semantic structure, keyboard navigation, and not communicating meaning through colour alone. Someone with this capability treats accessibility as part of building the thing rather than something to retrofit.",
    category: "WEB_DEVELOPMENT",
    icon: "Accessibility",
    topics: ["accessibility-basics", "accessibility-practice", "semantic-html"],
    projects: ["personal-portfolio", "responsive-landing-page"],
  },

  // ── Frameworks ──────────────────────────────────────────────────────────
  {
    slug: "react",
    name: "React",
    description: "Components, props, state, hooks and rendering.",
    longDescription:
      "Building interfaces out of composable pieces. Someone with this capability can reason about where state should live, why a component re-rendered, and what a hook's dependency array is actually doing.",
    category: "FRAMEWORKS",
    icon: "Component",
    topics: [
      "react-fundamentals",
      "react-components",
      "react-props",
      "react-state",
      "react-hooks",
      "react-forms",
      "react-routing",
      "fs-react",
      "fs-react-hooks",
      "fs-react-routing",
    ],
    practiceTopics: ["react-state", "react-hooks"],
    projects: ["movie-explorer", "task-management-dashboard", "analytics-dashboard"],
  },
  {
    slug: "typescript",
    name: "TypeScript",
    description: "Types, interfaces, unions, narrowing and generics.",
    longDescription:
      "Using the type system to make wrong states unrepresentable rather than to satisfy a compiler. Someone with this capability can read a type error and understand what it is telling them about their design.",
    category: "FRAMEWORKS",
    icon: "FileType",
    topics: [
      "ts-types",
      "ts-interfaces",
      "ts-unions",
      "ts-narrowing",
      "ts-generics",
      "react-typescript",
      "fs-typescript",
      "fs-shared-types",
    ],
    projects: ["task-management-dashboard", "analytics-dashboard"],
  },

  // ── Data ────────────────────────────────────────────────────────────────
  {
    slug: "api-integration",
    name: "API Integration",
    description: "Fetching data, handling loading and failure, and shaping a response.",
    longDescription:
      "Working with data that lives somewhere else. Someone with this capability designs for the request failing, arriving slowly, or coming back in an unexpected shape — not just for the happy path.",
    category: "DATA",
    icon: "Network",
    topics: [
      "react-api-integration",
      "data-fetching",
      "rest-apis",
      "fs-apis",
      "fs-data-fetching",
      "fs-error-states",
    ],
    projects: ["weather-dashboard", "movie-explorer", "analytics-dashboard"],
  },
  {
    slug: "databases",
    name: "Databases",
    description: "Modelling data, querying it with SQL, and making it fast.",
    longDescription:
      "Deciding how data should be shaped before writing the code that uses it. Someone with this capability can write a join without guessing, and knows what an index costs as well as what it buys.",
    category: "DATA",
    icon: "Database",
    topics: [
      "database-fundamentals",
      "sql",
      "database-design",
      "indexes-and-performance",
      "transactions",
      "fs-databases",
      "fs-data-modelling",
    ],
    projects: ["url-shortener", "inventory-api", "expense-management-app"],
  },
  {
    slug: "backend-apis",
    name: "Backend & APIs",
    description: "Building the server side: routes, validation, auth and errors.",
    longDescription:
      "Writing the half of an application nobody sees. Someone with this capability validates input at the boundary, returns errors that are useful without leaking internals, and knows why authentication and authorisation are different questions.",
    category: "DATA",
    icon: "Server",
    topics: [
      "rest-apis",
      "request-validation",
      "error-handling-backend",
      "authentication",
      "authorization",
      "fs-node",
      "fs-auth",
      "fs-server-security",
      "fs-auth-flow",
    ],
    projects: [
      "rest-api-basics",
      "notes-api",
      "authentication-api",
      "blog-api",
      "fullstack-notes",
    ],
  },

  // ── Version control ─────────────────────────────────────────────────────
  {
    slug: "git",
    name: "Git",
    description: "Commits, branches, merges and recovering when it goes wrong.",
    longDescription:
      "Understanding Git as a graph of snapshots rather than a set of commands to memorise. Someone with this capability can explain what a branch actually is, why a merge conflict is Git declining to guess, and what to do when a push is rejected.",
    category: "VERSION_CONTROL",
    icon: "GitBranch",
    topics: [
      "git-academy-version-control",
      "git-academy-git-basics",
      "git-academy-workflow",
      "git-academy-commits",
      "git-academy-branches",
      "git-basics",
      "fs-git",
    ],
    gitExercises: [
      "stage-two-files",
      "first-commit",
      "branch-and-switch",
      "merge-a-feature",
      "full-workflow",
    ],
  },
  {
    slug: "github-collaboration",
    name: "GitHub & Collaboration",
    description: "Remotes, pull requests, review and working with other people.",
    longDescription:
      "The part of version control that is about a team rather than a repository. Someone with this capability can open a pull request that is easy to review, and understands why a rejected push is Git protecting a colleague.",
    category: "VERSION_CONTROL",
    icon: "Github",
    topics: [
      "git-academy-remotes",
      "git-academy-github",
      "git-academy-collaboration",
      "git-academy-professional-workflow",
      "git-academy-open-source",
      "git-collaboration",
      "code-review",
      "git-pull-request",
      "github-workflow",
      "fs-github",
    ],
    gitExercises: ["rejected-push"],
  },

  // ── AI skills ───────────────────────────────────────────────────────────
  {
    slug: "ai-assisted-development",
    name: "AI-Assisted Development",
    description:
      "Using AI to debug, test, document and refactor — and knowing when not to.",
    longDescription:
      "Working with AI as a tool inside a process you own. Someone with this capability gets useful answers because they ask answerable questions, tests what they are told rather than pasting it, and can say when reaching for AI would be the wrong move.",
    category: "AI_SKILLS",
    icon: "Sparkles",
    topics: [
      "ai-academy-prompting-fundamentals",
      "ai-academy-iterating-on-prompts",
      "ai-academy-debugging",
      "ai-academy-testing",
      "ai-academy-documentation",
      "ai-academy-refactoring",
      "ai-academy-coding-assistants",
    ],
    aiTools: ["chatgpt", "claude", "github-copilot", "cursor"],
    aiWorkflows: [
      "debug-a-bug",
      "write-tests",
      "write-documentation",
      "refactor-code",
      "understand-unfamiliar-code",
    ],
  },
  {
    slug: "responsible-ai",
    name: "Responsible AI Use",
    description: "Verification, secrets, licences and the judgement that stays yours.",
    longDescription:
      "Knowing what you remain accountable for. Someone with this capability reviews what they merge, keeps credentials out of prompts, and can explain why a confident answer is not evidence.",
    category: "AI_SKILLS",
    icon: "ShieldCheck",
    topics: [
      "ai-academy-responsible-ai",
      "ai-academy-ai-security",
      "ai-academy-what-ai-tools-are",
      "ai-academy-research",
    ],
    aiWorkflows: ["research-a-technical-question", "prepare-a-pull-request"],
  },

  // ── Project delivery ────────────────────────────────────────────────────
  {
    slug: "project-development",
    name: "Project Development",
    description: "Taking something from an idea to a finished, working build.",
    longDescription:
      "The capability that only comes from finishing things. Someone with this capability can break a vague idea into milestones, get through the boring middle, and tell when something is actually done rather than nearly done.",
    category: "PROJECT_DELIVERY",
    icon: "Hammer",
    // Every project in the catalog: finishing anything at all is evidence of
    // being able to finish things, which is what this capability is about.
    projects: [
      "personal-portfolio",
      "responsive-landing-page",
      "calculator",
      "quiz-application",
      "weather-dashboard",
      "expense-tracker",
      "movie-explorer",
      "task-management-dashboard",
      "ecommerce-frontend",
      "analytics-dashboard",
      "rest-api-basics",
      "url-shortener",
      "notes-api",
      "authentication-api",
      "blog-api",
      "inventory-api",
      "scalable-ecommerce-backend",
      "fullstack-todo",
      "fullstack-notes",
      "expense-management-app",
      "blog-platform",
      "event-management-platform",
      "ecommerce-application",
      "realtime-collaboration-app",
    ],
  },
  {
    slug: "testing",
    name: "Testing",
    description: "Writing tests that can fail, and that describe intent.",
    longDescription:
      "Knowing what a test is for. Someone with this capability writes assertions from what the code should do rather than what it currently does, and checks that a test can fail before trusting it.",
    category: "DEVELOPER_TOOLS",
    icon: "FlaskConical",
    topics: [
      "frontend-testing",
      "backend-testing",
      "fs-testing",
      "ai-academy-testing",
    ],
    aiWorkflows: ["write-tests"],
  },
  {
    slug: "developer-workflow",
    name: "Developer Workflow",
    description: "The tools and habits around writing code: terminal, editor, review.",
    longDescription:
      "How professional development actually happens between the writing. Someone with this capability is comfortable in a terminal, reads a diff properly, and treats reviewing a change as real work rather than a formality.",
    category: "DEVELOPER_TOOLS",
    icon: "Terminal",
    topics: [
      "developer-tools",
      "fs-command-line",
      "code-review",
      "ai-academy-coding-agents",
    ],
    aiWorkflows: ["prepare-a-pull-request", "review-architecture"],
  },
];
