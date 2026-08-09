import type { SeedRoadmap } from "./types";

/**
 * Full Stack Developer roadmap, version 1.
 *
 * Deliberately not the frontend and backend roadmaps concatenated. The guiding
 * idea is one language carried across both sides: JavaScript/TypeScript is
 * learned once in the browser, then reused on the server, so the second half is
 * new *concepts* rather than a second syntax. Integration gets its own phase
 * because wiring two halves together is a distinct skill neither side teaches.
 */
export const FULLSTACK_ROADMAP: SeedRoadmap = {
  careerSlug: "full-stack-developer",
  title: "Full Stack Developer Roadmap",
  description:
    "Your structured journey to building and shipping complete products, front to back.",
  estimatedDuration: "12–18 months",
  phases: [
    {
      title: "Foundations",
      description:
        "How machines, browsers and the internet fit together — the shared ground under both halves.",
      estimatedDuration: "2–3 weeks",
      whyThisComesNext:
        "Full stack means you'll be debugging across a boundary. Knowing what a request is and where each piece of code runs is what lets you tell a frontend problem from a backend one instead of guessing.",
      topics: [
        {
          slug: "fs-computer-fundamentals",
          title: "How computers and software work",
          description: "Programs, processes and where your code actually executes.",
          difficulty: "BEGINNER",
          estimatedTime: "1.5 hours",
        },
        {
          slug: "fs-internet",
          title: "How the internet works",
          description: "Clients, servers, DNS and the journey of a single request.",
          difficulty: "BEGINNER",
          estimatedTime: "2 hours",
          prerequisites: ["fs-computer-fundamentals"],
        },
        {
          slug: "fs-http",
          title: "HTTP and the request cycle",
          description:
            "Methods, status codes and headers — the contract between your two halves.",
          difficulty: "BEGINNER",
          estimatedTime: "2 hours",
          prerequisites: ["fs-internet"],
        },
        {
          slug: "fs-command-line",
          title: "Command line and tooling",
          description:
            "Navigating a shell, running processes and reading output — required on both sides.",
          difficulty: "BEGINNER",
          estimatedTime: "2 hours",
        },
      ],
    },
    {
      title: "The Web Layer: HTML & CSS",
      description: "Structure and presentation — the surface everything else serves.",
      estimatedDuration: "4–5 weeks",
      whyThisComesNext:
        "Starting on the visible side gives you something to look at while you learn, which matters when the alternative is months of invisible progress. It's also the fastest way to build intuition for what the backend will eventually need to supply.",
      topics: [
        {
          slug: "fs-html",
          title: "HTML and semantics",
          description:
            "Elements, forms and accessible structure that scripts and styles can rely on.",
          difficulty: "BEGINNER",
          estimatedTime: "4 hours",
          prerequisites: ["fs-http"],
        },
        {
          slug: "fs-css",
          title: "CSS and layout",
          description:
            "The box model, flexbox and grid — arranging a page deliberately.",
          difficulty: "BEGINNER",
          estimatedTime: "5 hours",
          prerequisites: ["fs-html"],
        },
        {
          slug: "fs-responsive",
          title: "Responsive design",
          description:
            "One layout that works from phone to desktop, built small-screen first.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "3 hours",
          prerequisites: ["fs-css"],
        },
      ],
    },
    {
      title: "JavaScript",
      description:
        "The one language you'll use on both sides. Learned once, applied twice.",
      estimatedDuration: "8–10 weeks",
      whyThisComesNext:
        "This is the hinge of the whole roadmap. Because JavaScript runs in the browser and on the server, going deep here now means the backend phases later are about new ideas — data, auth, deployment — rather than a second language learned from scratch.",
      topics: [
        {
          slug: "fs-js-basics",
          title: "Language fundamentals",
          description: "Variables, types, conditions, loops and functions.",
          difficulty: "BEGINNER",
          estimatedTime: "6 hours",
          prerequisites: ["fs-html"],
        },
        {
          slug: "fs-js-collections",
          title: "Arrays and objects",
          description:
            "Working with collections and structured data — the shape APIs speak in.",
          difficulty: "BEGINNER",
          estimatedTime: "4 hours",
          prerequisites: ["fs-js-basics"],
        },
        {
          slug: "fs-js-dom",
          title: "The DOM and events",
          description:
            "Reading and changing the page, and responding to what users do.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "4 hours",
          prerequisites: ["fs-js-collections", "fs-css"],
        },
        {
          slug: "fs-js-async",
          title: "Async, promises and fetch",
          description:
            "Work that finishes later — the model behind every network call you'll write.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "4 hours",
          prerequisites: ["fs-js-dom", "fs-http"],
        },
        {
          slug: "fs-js-modules",
          title: "Modules and error handling",
          description:
            "Organising code across files and failing in ways you can diagnose.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "3 hours",
          prerequisites: ["fs-js-async"],
        },
      ],
    },
    {
      title: "Git & GitHub",
      description: "Version control and the collaboration workflow.",
      estimatedDuration: "1–2 weeks",
      whyThisComesNext:
        "Before you start building anything with two moving halves, you want history. Git here means every experiment from this point is reversible and every project is publishable.",
      topics: [
        {
          slug: "fs-git",
          title: "Git fundamentals",
          description: "Repositories, commits, branches and merges.",
          difficulty: "BEGINNER",
          estimatedTime: "2.5 hours",
        },
        {
          slug: "fs-github",
          title: "GitHub workflow",
          description: "Pull requests, reviews and working alongside other people.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2 hours",
          prerequisites: ["fs-git"],
        },
      ],
    },
    {
      title: "Frontend Framework & TypeScript",
      description:
        "Component thinking, and types that hold across the boundary you're about to build.",
      estimatedDuration: "7–9 weeks",
      whyThisComesNext:
        "React formalises patterns you've already hit by hand. TypeScript joins it here rather than later because in full stack its real payoff is a single shared definition of your data — the same types describing what the server sends and what the client expects.",
      topics: [
        {
          slug: "fs-react",
          title: "React fundamentals",
          description:
            "Components, props and state — describing UI rather than steering it.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "5 hours",
          prerequisites: ["fs-js-modules"],
        },
        {
          slug: "fs-react-hooks",
          title: "Hooks and data flow",
          description: "State, effects and lifting data to where it belongs.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "4 hours",
          prerequisites: ["fs-react"],
        },
        {
          slug: "fs-react-routing",
          title: "Routing and forms",
          description:
            "Multiple views, and collecting input you can trust enough to send.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "4 hours",
          prerequisites: ["fs-react-hooks"],
        },
        {
          slug: "fs-typescript",
          title: "TypeScript",
          description:
            "Types, interfaces and narrowing — describing data once for both halves.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "5 hours",
          prerequisites: ["fs-react-hooks"],
        },
      ],
    },
    {
      title: "Backend & Data",
      description:
        "The server side: a runtime, an API, and somewhere for the data to live.",
      estimatedDuration: "8–10 weeks",
      whyThisComesNext:
        "You already know the language, so this phase is about new responsibilities rather than new syntax. Databases and APIs are taught together here because in full-stack work you'll design them together — the endpoint and the table it serves are one decision.",
      topics: [
        {
          slug: "fs-node",
          title: "Node.js and the server runtime",
          description:
            "Running JavaScript outside the browser, and what changes when you do.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "3 hours",
          prerequisites: ["fs-js-modules"],
        },
        {
          slug: "fs-databases",
          title: "Databases and SQL",
          description:
            "Modelling data in tables, and querying it without loading everything.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "6 hours",
          prerequisites: ["fs-node"],
        },
        {
          slug: "fs-data-modelling",
          title: "Schema design and migrations",
          description:
            "Relationships and keys, and changing a schema that already holds data.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "4 hours",
          prerequisites: ["fs-databases", "fs-git"],
        },
        {
          slug: "fs-apis",
          title: "Building REST APIs",
          description:
            "Endpoints, validation and status codes — the contract your frontend consumes.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "5 hours",
          prerequisites: ["fs-data-modelling", "fs-http"],
        },
        {
          slug: "fs-auth",
          title: "Authentication and authorization",
          description:
            "Sessions, password hashing and permissions — on the server, where it counts.",
          difficulty: "ADVANCED",
          estimatedTime: "5 hours",
          prerequisites: ["fs-apis"],
        },
        {
          slug: "fs-server-security",
          title: "Security fundamentals",
          description:
            "Validating input, managing secrets and never trusting the client.",
          difficulty: "ADVANCED",
          estimatedTime: "3 hours",
          prerequisites: ["fs-auth"],
        },
      ],
    },
    {
      title: "Integration",
      description:
        "Making the two halves one product — the phase neither side teaches on its own.",
      estimatedDuration: "4–5 weeks",
      whyThisComesNext:
        "This is the phase that makes you full stack rather than someone who knows two things. Shared types, loading and error states, and end-to-end auth are the seams where real applications break, and they only exist once both halves do.",
      topics: [
        {
          slug: "fs-shared-types",
          title: "Shared types across the boundary",
          description:
            "One definition of your data used by both server and client, so a rename breaks the build not production.",
          difficulty: "ADVANCED",
          estimatedTime: "3 hours",
          prerequisites: ["fs-typescript", "fs-apis"],
        },
        {
          slug: "fs-data-fetching",
          title: "Data fetching and state",
          description:
            "Where to load data, what to cache, and how to keep the screen honest while it's in flight.",
          difficulty: "ADVANCED",
          estimatedTime: "4 hours",
          prerequisites: ["fs-shared-types", "fs-react-routing"],
        },
        {
          slug: "fs-auth-flow",
          title: "End-to-end authentication",
          description:
            "Protected routes, session handling and redirects that work on the server too.",
          difficulty: "ADVANCED",
          estimatedTime: "4 hours",
          prerequisites: ["fs-auth", "fs-data-fetching"],
        },
        {
          slug: "fs-error-states",
          title: "Errors across the stack",
          description:
            "Turning a server failure into something the interface can say without leaking detail.",
          difficulty: "ADVANCED",
          estimatedTime: "2.5 hours",
          prerequisites: ["fs-data-fetching"],
        },
      ],
    },
    {
      title: "Testing, Deployment & Architecture",
      description:
        "Shipping it, keeping it running, and structuring it so it survives growth.",
      estimatedDuration: "5–6 weeks",
      whyThisComesNext:
        "Architecture is the last thing, not the first. Patterns only make sense as answers to problems you've felt — now you've built something with enough moving parts for those problems to be real.",
      topics: [
        {
          slug: "fs-testing",
          title: "Testing across the stack",
          description:
            "Unit tests for logic, integration tests for the seams, end-to-end for the flows that matter.",
          difficulty: "ADVANCED",
          estimatedTime: "5 hours",
          prerequisites: ["fs-error-states"],
        },
        {
          slug: "fs-docker",
          title: "Docker fundamentals",
          description: "Packaging the application so it runs identically everywhere.",
          difficulty: "ADVANCED",
          estimatedTime: "3 hours",
          prerequisites: ["fs-command-line", "fs-server-security"],
        },
        {
          slug: "fs-deployment",
          title: "Deployment and CI/CD",
          description:
            "Environments, secrets and an automated path from commit to production.",
          difficulty: "ADVANCED",
          estimatedTime: "4 hours",
          prerequisites: ["fs-docker", "fs-testing"],
        },
        {
          slug: "fs-architecture",
          title: "Full-stack architecture",
          description:
            "Where logic belongs, what to render on the server, and how to keep boundaries clean as it grows.",
          difficulty: "ADVANCED",
          estimatedTime: "4 hours",
          prerequisites: ["fs-deployment"],
        },
        {
          slug: "fs-performance",
          title: "Performance and monitoring",
          description:
            "Measuring both halves, and knowing when something breaks before users report it.",
          difficulty: "ADVANCED",
          estimatedTime: "3 hours",
          prerequisites: ["fs-deployment"],
        },
      ],
    },
    {
      title: "Full-Stack Projects",
      description:
        "Complete products, deployed and public — the evidence that all of it works together.",
      estimatedDuration: "8–12 weeks",
      kind: "PROJECT_MILESTONE",
      whyThisComesNext:
        "A full-stack portfolio is not two projects. One application that authenticates real users, stores real data and is deployed where anyone can reach it demonstrates more than a dozen exercises.",
      topics: [
        {
          slug: "fs-project-crud",
          title: "Milestone: full-stack CRUD application",
          description:
            "A React frontend over your own API and database, doing something genuinely useful.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2 weeks",
          prerequisites: ["fs-apis", "fs-react-routing"],
        },
        {
          slug: "fs-project-auth-app",
          title: "Milestone: multi-user application",
          description:
            "Accounts, sessions and per-user data, with authorization enforced on the server.",
          difficulty: "ADVANCED",
          estimatedTime: "3 weeks",
          prerequisites: ["fs-auth-flow"],
        },
        {
          slug: "fs-project-production",
          title: "Milestone: production product",
          description:
            "Typed end to end, tested, containerised and deployed — the one you put at the top of your CV.",
          difficulty: "ADVANCED",
          estimatedTime: "4–6 weeks",
          prerequisites: ["fs-deployment", "fs-architecture"],
        },
      ],
    },
  ],
};
