import type { SeedRoadmap } from "./types";

/**
 * Frontend Developer roadmap, version 1.
 *
 * The ordering is the product. Fundamentals come before markup because you
 * cannot reason about a browser you do not understand; CSS comes before
 * JavaScript because the DOM is far easier to manipulate once you can already
 * see and describe it; Git arrives before frameworks because that is the point
 * where projects start being worth keeping.
 */
export const FRONTEND_ROADMAP: SeedRoadmap = {
  careerSlug: "frontend-developer",
  title: "Frontend Developer Roadmap",
  description:
    "Your structured journey from the fundamentals to modern frontend development.",
  estimatedDuration: "8–12 months",
  phases: [
    {
      title: "Computer & Web Fundamentals",
      description:
        "How the machine, the browser and the internet actually work. Everything later assumes this quietly.",
      estimatedDuration: "2–3 weeks",
      whyThisComesNext:
        "You're starting here because every bug you'll ever debug happens somewhere in this picture. Learning what a request is, what a browser does with it, and where your code runs means the rest of the roadmap explains itself instead of feeling like magic.",
      topics: [
        {
          slug: "how-computers-work",
          title: "How computers and software work",
          description:
            "What a program actually is, and what happens between your code and the processor.",
          difficulty: "BEGINNER",
          estimatedTime: "1 hour",
        },
        {
          slug: "how-the-internet-works",
          title: "How the internet works",
          description:
            "Clients, servers, IP addresses and what really happens when you open a website.",
          difficulty: "BEGINNER",
          estimatedTime: "1 hour",
          prerequisites: ["how-computers-work"],
        },
        {
          slug: "browsers",
          title: "Browsers",
          description:
            "How a browser turns text it downloads into the page you can see and click.",
          difficulty: "BEGINNER",
          estimatedTime: "45 minutes",
          prerequisites: ["how-the-internet-works"],
        },
        {
          slug: "http-https",
          title: "HTTP and HTTPS",
          description:
            "Requests, responses, status codes and why the padlock in the address bar matters.",
          difficulty: "BEGINNER",
          estimatedTime: "1 hour",
          prerequisites: ["how-the-internet-works"],
        },
        {
          slug: "dns",
          title: "DNS",
          description:
            "How a domain name you can remember becomes an address a machine can reach.",
          difficulty: "BEGINNER",
          estimatedTime: "30 minutes",
          prerequisites: ["how-the-internet-works"],
        },
        {
          slug: "websites-vs-web-apps",
          title: "Websites vs web applications",
          description:
            "The difference between a page that shows information and software that runs in a browser.",
          difficulty: "BEGINNER",
          estimatedTime: "30 minutes",
        },
        {
          slug: "client-and-server",
          title: "Client and server basics",
          description:
            "Which parts of a product run on your machine, which run elsewhere, and why the split exists.",
          difficulty: "BEGINNER",
          estimatedTime: "45 minutes",
          prerequisites: ["http-https"],
        },
        {
          slug: "developer-tools",
          title: "Developer tools",
          description:
            "Inspecting elements, reading the console and watching network requests — your debugging home.",
          difficulty: "BEGINNER",
          estimatedTime: "1 hour",
          prerequisites: ["browsers"],
        },
      ],
    },
    {
      title: "HTML & the Semantic Web",
      description:
        "Structure and meaning. The skeleton every stylesheet and script later attaches to.",
      estimatedDuration: "2–3 weeks",
      whyThisComesNext:
        "HTML comes before CSS and JavaScript because both of them operate on it. Styling targets structure, and scripts read and change it — so a page built from meaningful elements is easier to style, easier to script, and usable by people who never see it.",
      topics: [
        {
          slug: "html-fundamentals",
          title: "HTML fundamentals",
          description:
            "Elements, attributes and nesting — how a document is put together.",
          difficulty: "BEGINNER",
          estimatedTime: "2 hours",
          prerequisites: ["browsers"],
        },
        {
          slug: "semantic-html",
          title: "Semantic HTML",
          description:
            "Choosing elements for what they mean, not how they look, so the structure carries information.",
          difficulty: "BEGINNER",
          estimatedTime: "1.5 hours",
          prerequisites: ["html-fundamentals"],
        },
        {
          slug: "html-forms",
          title: "Forms",
          description:
            "Inputs, labels and validation — how a page collects anything from a person.",
          difficulty: "BEGINNER",
          estimatedTime: "2 hours",
          prerequisites: ["html-fundamentals"],
        },
        {
          slug: "html-tables",
          title: "Tables",
          description:
            "Presenting genuinely tabular data with headers that make sense out of context.",
          difficulty: "BEGINNER",
          estimatedTime: "45 minutes",
          prerequisites: ["html-fundamentals"],
        },
        {
          slug: "links-and-media",
          title: "Links and media",
          description:
            "Navigation, images, audio and video, including the text alternatives they need.",
          difficulty: "BEGINNER",
          estimatedTime: "1 hour",
          prerequisites: ["html-fundamentals"],
        },
        {
          slug: "accessibility-basics",
          title: "Accessibility basics",
          description:
            "Making a page work for keyboards and screen readers — much cheaper to do now than to retrofit.",
          difficulty: "BEGINNER",
          estimatedTime: "1.5 hours",
          prerequisites: ["semantic-html", "html-forms"],
        },
        {
          slug: "seo-fundamentals",
          title: "SEO fundamentals",
          description:
            "How search engines read a page, and what good structure gives you for free.",
          difficulty: "BEGINNER",
          estimatedTime: "45 minutes",
          isRequired: false,
          prerequisites: ["semantic-html"],
        },
      ],
    },
    {
      title: "CSS & Responsive Design",
      description:
        "Turning structure into something people actually want to look at and can use on any screen.",
      estimatedDuration: "4–6 weeks",
      whyThisComesNext:
        "You're learning CSS before JavaScript because understanding how a page is structured and laid out makes DOM manipulation far easier to reason about later. When you eventually write code that moves elements around, you'll already know what you're moving and what will happen to everything else.",
      topics: [
        {
          slug: "css-fundamentals",
          title: "CSS fundamentals",
          description:
            "Rules, properties and the cascade — how the browser decides what wins.",
          difficulty: "BEGINNER",
          estimatedTime: "2 hours",
          prerequisites: ["html-fundamentals"],
        },
        {
          slug: "css-selectors",
          title: "Selectors",
          description:
            "Targeting exactly the elements you mean, and understanding specificity.",
          difficulty: "BEGINNER",
          estimatedTime: "1.5 hours",
          prerequisites: ["css-fundamentals"],
        },
        {
          slug: "box-model",
          title: "The box model",
          description:
            "Content, padding, border and margin — the single idea behind most layout confusion.",
          difficulty: "BEGINNER",
          estimatedTime: "1.5 hours",
          prerequisites: ["css-fundamentals"],
        },
        {
          slug: "flexbox",
          title: "Flexbox",
          description:
            "Laying out content in a row or column, and distributing the space between.",
          difficulty: "BEGINNER",
          estimatedTime: "2 hours",
          prerequisites: ["box-model"],
        },
        {
          slug: "css-grid",
          title: "Grid",
          description:
            "Two-dimensional layout for the structures flexbox makes awkward.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2.5 hours",
          prerequisites: ["flexbox"],
        },
        {
          slug: "responsive-design",
          title: "Responsive design",
          description:
            "Designing for the small screen first and letting the layout grow, rather than shrinking a desktop.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2 hours",
          prerequisites: ["flexbox"],
        },
        {
          slug: "media-queries",
          title: "Media queries",
          description:
            "Changing layout at deliberate breakpoints — and honouring user preferences like reduced motion.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "1.5 hours",
          prerequisites: ["responsive-design"],
        },
        {
          slug: "css-positioning",
          title: "Positioning",
          description:
            "Static, relative, absolute, sticky and fixed — and the stacking contexts they create.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "1.5 hours",
          prerequisites: ["box-model"],
        },
        {
          slug: "css-animations",
          title: "Transitions and animations",
          description:
            "Motion that communicates state change, kept subtle and interruptible.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2 hours",
          prerequisites: ["css-positioning"],
        },
        {
          slug: "modern-css",
          title: "Modern CSS",
          description:
            "Custom properties, logical properties, container queries and utility-first workflows.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2.5 hours",
          prerequisites: ["css-grid", "media-queries"],
        },
      ],
    },
    {
      title: "JavaScript",
      description:
        "The language that makes a page respond. The largest phase, and the one everything after it leans on.",
      estimatedDuration: "8–10 weeks",
      whyThisComesNext:
        "Now that you can build and style a page, JavaScript is what makes it react. This phase is deliberately long: React, TypeScript and every framework after it are just JavaScript with conventions on top, so time spent here is repaid several times over.",
      topics: [
        {
          slug: "js-variables",
          title: "Variables",
          description: "Storing values, and why let and const behave differently.",
          difficulty: "BEGINNER",
          estimatedTime: "1 hour",
        },
        {
          slug: "js-data-types",
          title: "Data types",
          description:
            "Strings, numbers, booleans, null and undefined — and how JavaScript converts between them.",
          difficulty: "BEGINNER",
          estimatedTime: "1.5 hours",
          prerequisites: ["js-variables"],
        },
        {
          slug: "js-operators",
          title: "Operators",
          description:
            "Arithmetic, comparison and logic, including why === is the one you want.",
          difficulty: "BEGINNER",
          estimatedTime: "1 hour",
          prerequisites: ["js-data-types"],
        },
        {
          slug: "js-conditions",
          title: "Conditions",
          description: "Branching on truth, and what JavaScript considers truthy.",
          difficulty: "BEGINNER",
          estimatedTime: "1 hour",
          prerequisites: ["js-operators"],
        },
        {
          slug: "js-loops",
          title: "Loops",
          description: "Repeating work without repeating yourself.",
          difficulty: "BEGINNER",
          estimatedTime: "1.5 hours",
          prerequisites: ["js-conditions"],
        },
        {
          slug: "js-functions",
          title: "Functions",
          description:
            "Reusable blocks of logic, and how to pass data into them and get results back.",
          difficulty: "BEGINNER",
          estimatedTime: "2 hours",
          prerequisites: ["js-loops"],
        },
        {
          slug: "js-arrays",
          title: "Arrays",
          description:
            "Ordered collections, and the map/filter/reduce methods you'll use constantly.",
          difficulty: "BEGINNER",
          estimatedTime: "2.5 hours",
          prerequisites: ["js-functions"],
        },
        {
          slug: "js-objects",
          title: "Objects",
          description:
            "Modelling a thing with named properties — the shape most real data arrives in.",
          difficulty: "BEGINNER",
          estimatedTime: "2 hours",
          prerequisites: ["js-arrays"],
        },
        {
          slug: "js-scope",
          title: "Scope and closures",
          description:
            "Where a variable is visible, and why a function can remember values after it returns.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2 hours",
          prerequisites: ["js-functions"],
        },
        {
          slug: "js-dom",
          title: "The DOM",
          description:
            "Reading and changing the page from code — the bridge between JavaScript and what you built in HTML.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2.5 hours",
          prerequisites: ["js-objects", "semantic-html"],
        },
        {
          slug: "js-events",
          title: "Events",
          description:
            "Responding to clicks, input and keys, and how events travel through the page.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2 hours",
          prerequisites: ["js-dom"],
        },
        {
          slug: "js-modules",
          title: "Modules",
          description:
            "Splitting code across files with imports and exports instead of one long script.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "1.5 hours",
          prerequisites: ["js-functions"],
        },
        {
          slug: "js-error-handling",
          title: "Error handling",
          description:
            "Failing on purpose, catching what you can recover from, and not hiding what you can't.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "1.5 hours",
          prerequisites: ["js-functions"],
        },
        {
          slug: "js-async",
          title: "Asynchronous JavaScript",
          description:
            "Why some work finishes later, and how the event loop keeps the page responsive meanwhile.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2 hours",
          prerequisites: ["js-events"],
        },
        {
          slug: "js-promises",
          title: "Promises",
          description:
            "Representing a value that hasn't arrived yet, and handling the case where it never does.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2 hours",
          prerequisites: ["js-async"],
        },
        {
          slug: "js-async-await",
          title: "async / await",
          description:
            "Writing asynchronous code that reads top to bottom, with try/catch that works.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "1.5 hours",
          prerequisites: ["js-promises", "js-error-handling"],
        },
        {
          slug: "fetch-api",
          title: "The Fetch API",
          description:
            "Requesting data from a server and dealing with responses that fail.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2 hours",
          prerequisites: ["js-async-await", "http-https"],
        },
      ],
    },
    {
      title: "Git & GitHub",
      description:
        "Version control, collaboration, and a public record of what you've built.",
      estimatedDuration: "1–2 weeks",
      whyThisComesNext:
        "Git arrives now because this is the point where your projects become worth keeping. Learning it before frameworks means every project from here lands in a repository with real history — which is exactly what an employer looks at.",
      topics: [
        {
          slug: "git-fundamentals",
          title: "Git fundamentals",
          description:
            "What version control is for, and the difference between your files, the staging area and history.",
          difficulty: "BEGINNER",
          estimatedTime: "1.5 hours",
        },
        {
          slug: "git-repository",
          title: "Repositories",
          description:
            "Starting a project under version control, locally and on a remote.",
          difficulty: "BEGINNER",
          estimatedTime: "1 hour",
          prerequisites: ["git-fundamentals"],
        },
        {
          slug: "git-commit",
          title: "Commits",
          description:
            "Recording a meaningful unit of change, and writing a message the future will thank you for.",
          difficulty: "BEGINNER",
          estimatedTime: "1 hour",
          prerequisites: ["git-repository"],
        },
        {
          slug: "git-branch",
          title: "Branches",
          description: "Working on something without disturbing what already works.",
          difficulty: "BEGINNER",
          estimatedTime: "1.5 hours",
          prerequisites: ["git-commit"],
        },
        {
          slug: "git-merge",
          title: "Merging and conflicts",
          description:
            "Bringing work back together, and resolving the overlaps calmly.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "1.5 hours",
          prerequisites: ["git-branch"],
        },
        {
          slug: "git-pull-request",
          title: "Pull requests",
          description:
            "Proposing a change, reading review comments, and responding to them.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "1.5 hours",
          prerequisites: ["git-merge"],
        },
        {
          slug: "github-workflow",
          title: "GitHub workflow",
          description:
            "Issues, branches, reviews and releases — how teams actually move work along.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2 hours",
          prerequisites: ["git-pull-request"],
        },
      ],
    },
    {
      title: "React & Component Thinking",
      description:
        "Building interfaces out of composable pieces instead of one growing pile of DOM code.",
      estimatedDuration: "6–8 weeks",
      whyThisComesNext:
        "React only makes sense once plain JavaScript and the DOM do. Every hook and re-render is standard JavaScript underneath — coming here first would mean memorising patterns rather than understanding them.",
      topics: [
        {
          slug: "react-fundamentals",
          title: "React fundamentals",
          description:
            "What problem React solves, and how describing UI beats manipulating it step by step.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2 hours",
          prerequisites: ["js-modules", "js-dom"],
        },
        {
          slug: "react-components",
          title: "Components",
          description:
            "Splitting an interface into pieces that can be understood and reused on their own.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2 hours",
          prerequisites: ["react-fundamentals"],
        },
        {
          slug: "react-props",
          title: "Props",
          description: "Passing data down, and keeping components predictable.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "1.5 hours",
          prerequisites: ["react-components"],
        },
        {
          slug: "react-state",
          title: "State",
          description:
            "Data that changes over time, and what should and shouldn't live in it.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2.5 hours",
          prerequisites: ["react-props"],
        },
        {
          slug: "react-hooks",
          title: "Hooks",
          description:
            "useState, useEffect and friends — and when an effect is the wrong tool.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "3 hours",
          prerequisites: ["react-state", "js-scope"],
        },
        {
          slug: "react-forms",
          title: "Forms",
          description:
            "Controlled inputs, validation and error messages people can act on.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2.5 hours",
          prerequisites: ["react-hooks", "html-forms"],
        },
        {
          slug: "react-routing",
          title: "Routing",
          description: "Multiple pages in a single application, with URLs that work.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2 hours",
          prerequisites: ["react-hooks"],
        },
        {
          slug: "react-api-integration",
          title: "API integration",
          description:
            "Loading real data, and handling the loading and failure states honestly.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2.5 hours",
          prerequisites: ["react-hooks", "fetch-api"],
        },
        {
          slug: "state-management",
          title: "State management concepts",
          description:
            "When component state stops being enough, and what the alternatives cost.",
          difficulty: "ADVANCED",
          estimatedTime: "2 hours",
          prerequisites: ["react-api-integration"],
        },
      ],
    },
    {
      title: "TypeScript",
      description:
        "Describing the shape of your data so mistakes surface while you type, not in production.",
      estimatedDuration: "3–4 weeks",
      whyThisComesNext:
        "TypeScript lands after React on purpose. Types are most convincing when you've already been bitten by a prop that was undefined — learning it now means you're adding safety to code you understand, not fighting a compiler while learning two things at once.",
      topics: [
        {
          slug: "ts-types",
          title: "Types",
          description:
            "Annotating values, and letting inference do most of the work for you.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2 hours",
          prerequisites: ["js-objects"],
        },
        {
          slug: "ts-interfaces",
          title: "Interfaces and object types",
          description:
            "Describing the shape of objects and the contracts between them.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "1.5 hours",
          prerequisites: ["ts-types"],
        },
        {
          slug: "ts-unions",
          title: "Unions and literals",
          description:
            "Modelling a value that can be one of several things, precisely.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "1.5 hours",
          prerequisites: ["ts-interfaces"],
        },
        {
          slug: "ts-narrowing",
          title: "Type narrowing",
          description:
            "Convincing the compiler of what you already know, without reaching for `any`.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "1.5 hours",
          prerequisites: ["ts-unions"],
        },
        {
          slug: "ts-generics",
          title: "Generics",
          description:
            "Writing something once that stays type-safe for every type it's used with.",
          difficulty: "ADVANCED",
          estimatedTime: "2.5 hours",
          prerequisites: ["ts-narrowing"],
        },
        {
          slug: "react-typescript",
          title: "React with TypeScript",
          description: "Typing props, state, events and hooks without ceremony.",
          difficulty: "ADVANCED",
          estimatedTime: "2.5 hours",
          prerequisites: ["ts-generics", "react-hooks"],
        },
      ],
    },
    {
      title: "Modern Frontend",
      description:
        "The practices that separate something that works on your machine from something you can ship.",
      estimatedDuration: "5–7 weeks",
      whyThisComesNext:
        "These topics all assume a working application to apply them to. Rendering strategies, performance budgets and tests are meaningless in the abstract — now you have something real to measure and improve.",
      topics: [
        {
          slug: "nextjs",
          title: "Next.js",
          description:
            "A framework around React that answers routing, rendering and data fetching for you.",
          difficulty: "ADVANCED",
          estimatedTime: "3 hours",
          prerequisites: ["react-routing", "react-typescript"],
        },
        {
          slug: "rendering-strategies",
          title: "Rendering strategies",
          description:
            "Server rendering, static generation and client rendering — and what each costs.",
          difficulty: "ADVANCED",
          estimatedTime: "2 hours",
          prerequisites: ["nextjs"],
        },
        {
          slug: "app-routing",
          title: "Routing and layouts",
          description:
            "Nested layouts, dynamic routes and keeping shared chrome out of every page.",
          difficulty: "ADVANCED",
          estimatedTime: "2 hours",
          prerequisites: ["nextjs"],
        },
        {
          slug: "data-fetching",
          title: "Data fetching",
          description:
            "Where data should be loaded, what to cache, and when to revalidate it.",
          difficulty: "ADVANCED",
          estimatedTime: "2.5 hours",
          prerequisites: ["rendering-strategies"],
        },
        {
          slug: "auth-concepts",
          title: "Authentication concepts",
          description:
            "Sessions, tokens and protected routes from the frontend's point of view.",
          difficulty: "ADVANCED",
          estimatedTime: "2 hours",
          prerequisites: ["data-fetching"],
        },
        {
          slug: "frontend-performance",
          title: "Performance",
          description:
            "Measuring what's actually slow before changing anything, then fixing it.",
          difficulty: "ADVANCED",
          estimatedTime: "2.5 hours",
          prerequisites: ["rendering-strategies"],
        },
        {
          slug: "accessibility-practice",
          title: "Accessibility in practice",
          description:
            "Keyboard flows, focus management and testing with a screen reader.",
          difficulty: "ADVANCED",
          estimatedTime: "2.5 hours",
          prerequisites: ["accessibility-basics", "react-forms"],
        },
        {
          slug: "frontend-testing",
          title: "Testing",
          description:
            "Testing what a user experiences rather than how a component is written.",
          difficulty: "ADVANCED",
          estimatedTime: "3 hours",
          prerequisites: ["react-api-integration"],
        },
      ],
    },
    {
      title: "Projects & Portfolio",
      description:
        "Milestones that prove the whole thing works together. These are the artefacts you'll be hired on.",
      estimatedDuration: "6–10 weeks",
      kind: "PROJECT_MILESTONE",
      whyThisComesNext:
        "Projects come last only in the sense that this is where they're assembled — you should be building small things throughout. What changes here is scope: complete applications, deployed and public, that demonstrate every phase before this one at once.",
      topics: [
        {
          slug: "project-responsive-site",
          title: "Milestone: responsive marketing site",
          description:
            "A multi-section site built from semantic HTML and modern CSS that holds up from phone to desktop.",
          difficulty: "BEGINNER",
          estimatedTime: "1 week",
          prerequisites: ["modern-css"],
        },
        {
          slug: "project-interactive-app",
          title: "Milestone: interactive application",
          description:
            "Something with real state — a task manager or similar — built in plain JavaScript first.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "1–2 weeks",
          prerequisites: ["js-events"],
        },
        {
          slug: "project-api-dashboard",
          title: "Milestone: data dashboard",
          description:
            "A React application consuming a real API, with honest loading and error states.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "2 weeks",
          prerequisites: ["react-api-integration"],
        },
        {
          slug: "project-fullstack-frontend",
          title: "Milestone: production-grade application",
          description:
            "A typed, tested, deployed Next.js application with authentication — your portfolio centrepiece.",
          difficulty: "ADVANCED",
          estimatedTime: "3–4 weeks",
          prerequisites: ["nextjs", "frontend-testing", "auth-concepts"],
        },
      ],
    },
  ],
};
