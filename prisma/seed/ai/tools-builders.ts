import type { SeedAITool } from "./types";

/**
 * App builders and automation platforms.
 *
 * The lesson that runs through every entry in this file is the same one, so it
 * is worth stating once: these tools produce something that *runs*, which is
 * not the same as something that is *correct*. A generated application that
 * loads is evidence of very little. Every record here therefore spends most of
 * its "when not to use" on the same point — you own what you ship, including
 * the parts you did not write.
 */

const VERIFIED = "2026-08-11";

export const BUILDER_TOOLS: SeedAITool[] = [
  // ── v0 ───────────────────────────────────────────────────────────────────
  {
    slug: "v0",
    name: "v0",
    categorySlug: "ai-app-builders",
    description:
      "Vercel's AI agent for building interfaces and full-stack apps, with one-click deployment.",
    longDescription:
      "v0 describes itself as an AI agent that helps anyone create real code and full-stack apps and agents. In practice it is strongest at the thing it started as: turning a description or a mockup into React and Next.js interfaces you can look at immediately. The generated code is real code — which means it is yours to read, understand and maintain.",
    whatItIs:
      "A browser tool where you describe an interface or an application and get working code back, with a live preview. Its output uses React, Next.js, Tailwind CSS and shadcn/ui, and it can deploy through Vercel. Because the code is conventional, you can take it into your own project — which is the correct way to use it, and also the point at which you become responsible for it.",
    whenToUse: [
      "Getting from a blank page to a first version of an interface you can react to.",
      "Turning a wireframe or mockup into a working component to iterate on.",
      "Exploring several layouts quickly when you are not sure what you want yet.",
      "Producing a prototype for a conversation, clearly labelled as a prototype.",
      "Learning by comparison: generate something, then work out why it is built that way.",
    ],
    whenNotToUse: [
      "For production code you have not read line by line and understood.",
      "When the requirement is precise and the fastest route is writing it yourself.",
      "For anything security-sensitive — authentication, payments, permissions — without a careful review.",
      "As a way to avoid learning the framework. You cannot maintain what you cannot read.",
      "When accessibility, performance or design-system consistency actually matter and you will not check them.",
    ],
    limitations: [
      "Generated code can be verbose, inconsistent with your conventions, or subtly inaccessible.",
      "It cannot know requirements you did not state, and it will invent something plausible in the gap.",
      "Output quality varies with how clearly you described the goal.",
      "The result is a starting point; the last 20% of any interface is still work.",
      "Deployment convenience makes it easy to ship something you have not reviewed.",
    ],
    howDevelopersUseIt:
      "The productive pattern is 'first draft, then ownership'. Generate a version, look at it, decide what is wrong, and iterate in the tool while the changes are still cheap. Then read the code properly, port it into your project on your terms, and make it match your conventions. The unproductive pattern is deploying the generated app as-is and discovering, when something breaks, that nobody on the team has ever read it.",
    officialUrl: "https://v0.app",
    docsUrl: "https://v0.app/docs",
    difficulty: "BEGINNER",
    primaryUse: "Generating interfaces and full-stack apps",
    environments: ["BROWSER", "PLATFORM"],
    icon: "LayoutTemplate",
    verifiedOn: VERIFIED,
    verificationSource: "https://v0.app/docs",
    capabilities: [
      {
        capability: "UI generation",
        detail: "React components and interfaces, using Tailwind CSS and shadcn/ui.",
      },
      { capability: "Next.js application generation" },
      { capability: "Full-stack apps with backend connectivity" },
      { capability: "Generation from wireframes or mockups" },
      { capability: "Real-time preview" },
      { capability: "One-click deployment via Vercel" },
      {
        capability: "Error diagnostics and automatic fixes",
        detail: "Documented as diagnosing errors and fixing code.",
      },
      { capability: "Web search and site inspection" },
    ],
    useCases: [
      { useCase: "DESIGN_UI", note: "Its original and strongest job: interfaces from a description." },
      { useCase: "BUILD_APP", note: "Full-stack applications, with the review that implies." },
      { useCase: "WRITE_CODE", note: "Produces conventional React and Next.js you can take away." },
      { useCase: "LEARN", note: "Generate, then work out why it was built that way." },
    ],
    resources: [
      {
        title: "v0 documentation",
        url: "https://v0.app/docs",
        source: "Vercel",
        type: "DOCUMENTATION",
      },
      { title: "v0", url: "https://v0.app", source: "Vercel", type: "REFERENCE" },
    ],
    learningPath: {
      slug: "v0-path",
      title: "Generating a UI, then owning it",
      description:
        "Two-thirds of this path is about reading and testing the result, because that is where generated code either becomes yours or becomes a liability.",
      difficulty: "BEGINNER",
      estimatedTime: "3–4 hours",
      lessons: [
        {
          title: "Understanding the tool",
          description: "What generation is and is not evidence of.",
          estimatedTime: "30 minutes",
          topicSlug: "ai-academy-what-ai-tools-are",
        },
        {
          title: "Describing what you want",
          description: "Constraints and expected output, for a generator.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-prompting-fundamentals",
        },
        {
          title: "Understanding generated code",
          description: "Reading a codebase nobody on your team wrote.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-understanding-code",
        },
        {
          title: "Testing what was generated",
          description: "Because 'it renders' is not a test.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-testing",
        },
        {
          title: "AI security for developers",
          description: "Generated code can ship generated vulnerabilities.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-ai-security",
        },
        {
          title: "Responsible use",
          description: "You ship it, you own it.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-responsible-ai",
        },
      ],
    },
  },

  // ── Lovable ──────────────────────────────────────────────────────────────
  {
    slug: "lovable",
    name: "Lovable",
    categorySlug: "ai-app-builders",
    description:
      "A full-stack AI development platform: describe an application in natural language and get real, editable code.",
    longDescription:
      "Lovable describes itself as a full-stack AI development platform for building, iterating on and deploying web applications using natural language, with real code, security and enterprise governance. What distinguishes it from a UI generator is scope: it produces frontend, backend, database and authentication together, which is more useful and correspondingly more to review.",
    whatItIs:
      "A platform where you describe an application and it builds one — including the parts that are not the interface. The code is real and editable, and it syncs to GitHub, which matters more than it sounds: it is the difference between a product you can leave and a product you are trapped in. Everything it generates is code somebody eventually has to understand.",
    whenToUse: [
      "Getting an internal tool or dashboard standing up quickly when the requirements are simple.",
      "Prototyping a full-stack idea end to end before committing real effort to it.",
      "Building something small and self-contained where you can review the whole thing.",
      "Learning what a full-stack application needs, by seeing one assembled.",
    ],
    whenNotToUse: [
      "For an application handling sensitive data, without a security review by somebody qualified.",
      "When you cannot read the backend code it produced — that is where the expensive mistakes live.",
      "As a substitute for understanding databases, authentication and authorisation.",
      "For a system with real complexity, where a generated architecture will fight you later.",
      "When the generated app 'works' and nobody has checked what happens on the unhappy paths.",
    ],
    limitations: [
      "A working demo tells you nothing about correctness under load, bad input or hostile use.",
      "Generated authentication and authorisation need a genuine review; getting these wrong is how data leaks.",
      "Architecture is chosen for you, and changing it later is real work.",
      "Iterating by prompt can produce inconsistency across the codebase over time.",
      "You depend on the platform until you take the code out through GitHub sync.",
    ],
    howDevelopersUseIt:
      "The honest use is scoped and reviewed: build the thing, then read it — starting with authentication, data access and anything that touches user input, because those are where generated code most often gets it wrong in ways a demo will never reveal. Sync to GitHub early, so the code is somewhere you control. Developers who treat it as a prototyping tool get a lot out of it; developers who treat it as a replacement for knowing how web applications work eventually meet a problem they cannot describe, let alone fix.",
    officialUrl: "https://lovable.dev",
    docsUrl: "https://docs.lovable.dev",
    difficulty: "BEGINNER",
    primaryUse: "Generating full-stack web applications",
    environments: ["BROWSER", "PLATFORM"],
    icon: "Heart",
    verifiedOn: VERIFIED,
    verificationSource: "https://docs.lovable.dev/introduction",
    capabilities: [
      {
        capability: "Full-stack application generation",
        detail: "Frontend, backend, database, authentication and integrations.",
      },
      { capability: "Natural-language iteration" },
      { capability: "Real, editable code" },
      { capability: "GitHub sync", detail: "For code ownership and deployment workflows." },
      { capability: "Deployment" },
      { capability: "Integrations", detail: "Documented integrations include Resend and Inngest." },
    ],
    useCases: [
      { useCase: "BUILD_APP", note: "Its core job — the whole application, not just the UI." },
      { useCase: "DESIGN_UI", note: "Interfaces come with the rest of the stack." },
      { useCase: "WRITE_CODE", note: "Real code you can take to GitHub and maintain yourself." },
      { useCase: "LEARN", note: "Seeing a full stack assembled is instructive, if you then read it." },
    ],
    resources: [
      {
        title: "Lovable documentation",
        url: "https://docs.lovable.dev",
        source: "Lovable",
        type: "DOCUMENTATION",
      },
      { title: "Lovable", url: "https://lovable.dev", source: "Lovable", type: "REFERENCE" },
    ],
    learningPath: {
      slug: "lovable-path",
      title: "Generating a full stack, then reviewing it",
      description:
        "Heavier on security and testing than the other builder paths, because this tool generates the parts where being wrong is expensive.",
      difficulty: "BEGINNER",
      estimatedTime: "4 hours",
      lessons: [
        {
          title: "Understanding the tool",
          description: "What a generator can and cannot know about your requirements.",
          estimatedTime: "30 minutes",
          topicSlug: "ai-academy-what-ai-tools-are",
        },
        {
          title: "Describing an application",
          description: "Requirements a generator can act on.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-prompting-fundamentals",
        },
        {
          title: "Understanding generated code",
          description: "Especially the backend.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-understanding-code",
        },
        {
          title: "Testing what was generated",
          description: "Unhappy paths, not just the demo.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-testing",
        },
        {
          title: "AI security for developers",
          description: "Authentication and data access, reviewed properly.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-ai-security",
        },
        {
          title: "Responsible use",
          description: "Taking ownership of a codebase you did not type.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-responsible-ai",
        },
      ],
    },
  },

  // ── Bolt ─────────────────────────────────────────────────────────────────
  {
    slug: "bolt",
    name: "Bolt",
    categorySlug: "ai-app-builders",
    description:
      "An AI tool that turns a described idea into a working website or application in the browser.",
    longDescription:
      "Bolt's own support documentation describes it as an AI tool that turns your ideas into real websites and apps. It covers a wide range of project types — marketing sites, portfolios, storefronts, dashboards and internal tools — and works entirely in the browser, which makes it a very low-friction way to get from nothing to something.",
    whatItIs:
      "A browser environment where you describe what you want and it builds it, keeping a version history as you iterate. Low friction is genuinely its feature: there is nothing to install and no environment to configure. That same low friction is why it is easy to end up with something published that nobody has read.",
    whenToUse: [
      "Getting a small site or tool from idea to working in a single sitting.",
      "Prototyping to see whether an idea is worth building properly.",
      "Marketing pages, portfolios and internal tools where the requirements are genuinely simple.",
      "Trying a structure quickly before committing to it in your real project.",
    ],
    whenNotToUse: [
      "For an application with real users and real data you have not reviewed the code for.",
      "When the requirements are complex enough that a generated architecture will constrain you.",
      "As a way to skip learning how the web works, if you intend to work in technology.",
      "For anything where a subtle bug matters, without your own testing.",
    ],
    limitations: [
      "Working in a preview is not evidence of correctness on real data or at real scale.",
      "Iterating by prompt can drift the codebase into inconsistency.",
      "Complex requirements are where generation degrades fastest.",
      "You still need to review, test and secure the result before anybody depends on it.",
    ],
    howDevelopersUseIt:
      "As a sketchpad. A developer with an idea gets a version in front of themselves in minutes, learns what they actually wanted by looking at what they did not, and either throws it away or rebuilds it properly. Used that way it is a genuinely good thinking tool. The failure is treating the prototype as the product — publishing it, gathering users, and only then discovering that nobody understands the code well enough to change it safely.",
    officialUrl: "https://bolt.new/",
    docsUrl: "https://support.bolt.new/",
    difficulty: "BEGINNER",
    primaryUse: "Prototyping websites and apps in the browser",
    environments: ["BROWSER", "PLATFORM"],
    icon: "Zap",
    verifiedOn: VERIFIED,
    verificationSource: "https://support.bolt.new/",
    capabilities: [
      {
        capability: "Website and application generation",
        detail: "Marketing sites, portfolios, storefronts, dashboards and internal tools.",
      },
      { capability: "Browser-based building", detail: "Nothing to install." },
      { capability: "Version control and version history" },
      { capability: "Templates", detail: "A marketplace of starting points." },
      { capability: "Bolt Slides", detail: "Presentation generation." },
    ],
    useCases: [
      { useCase: "BUILD_APP", note: "Idea to running prototype in one sitting." },
      { useCase: "DESIGN_UI", note: "Layouts you can look at rather than imagine." },
      { useCase: "LEARN", note: "Useful for seeing a working structure — if you then read it." },
    ],
    resources: [
      {
        title: "Bolt support documentation",
        url: "https://support.bolt.new/",
        source: "Bolt",
        type: "DOCUMENTATION",
      },
      { title: "Bolt", url: "https://bolt.new/", source: "Bolt", type: "REFERENCE" },
    ],
    learningPath: {
      slug: "bolt-path",
      title: "Prototyping honestly",
      description:
        "Short, and centred on the one decision that matters: knowing whether what you built is a prototype or a product.",
      difficulty: "BEGINNER",
      estimatedTime: "2–3 hours",
      lessons: [
        {
          title: "Understanding the tool",
          description: "What generation proves, and what it does not.",
          estimatedTime: "30 minutes",
          topicSlug: "ai-academy-what-ai-tools-are",
        },
        {
          title: "Describing what you want",
          description: "Clear requirements produce reviewable output.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-prompting-fundamentals",
        },
        {
          title: "Understanding generated code",
          description: "Reading before shipping.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-understanding-code",
        },
        {
          title: "Responsible use",
          description: "Prototype or product — say which, out loud.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-responsible-ai",
        },
      ],
    },
  },

  // ── Replit ───────────────────────────────────────────────────────────────
  {
    slug: "replit",
    name: "Replit",
    categorySlug: "ai-app-builders",
    description:
      "A browser development platform with an AI agent, hosting and databases — build and deploy without local setup.",
    longDescription:
      "Replit describes itself as the fastest way to go from idea to app, website, dashboard, mobile experience, slide deck, video or prototype. Unlike a pure generator it is a full development environment: you get an editor, a running machine, a database and deployment, with an agent that can build for you. That combination makes it a strong learning environment as well as a building one.",
    whatItIs:
      "A development platform that lives in a browser tab. There is no local setup: the editor, the runtime, the database and the deployment all run on Replit's infrastructure. Replit Agent is the AI layer — you describe an idea and it builds something you can then test and refine, in a process Replit's own documentation calls 'vibe coding'.",
    whenToUse: [
      "Learning to program without spending your first evening configuring a toolchain.",
      "Building and deploying something small end to end from any machine.",
      "Prototyping with a real database and a real URL rather than a mock.",
      "Teaching or pairing, where everybody needs the same environment instantly.",
    ],
    whenNotToUse: [
      "As your only environment, if you intend to work professionally — you will need local tooling eventually.",
      "For production systems with meaningful uptime, compliance or scaling requirements you have not evaluated.",
      "When you should be learning how the underlying tooling works and the platform is hiding it.",
      "For agent-generated code you have not read, on an application anybody relies on.",
    ],
    limitations: [
      "Convenience hides fundamentals — dependency management, environment configuration, deployment — that you will eventually need.",
      "Agent-generated code has the same review requirement as any generated code.",
      "Resources, pricing and limits are the platform's, and can change.",
      "Your work lives on their infrastructure until you export it.",
    ],
    howDevelopersUseIt:
      "Two honest uses. Beginners use it to remove the setup barrier that stops many people before they have written anything, which is a real service. Experienced developers use it for throwaway experiments and shareable reproductions — a bug you can hand somebody as a running URL instead of a description. In both cases the agent is best used as a fast first draft, followed by actually reading what it wrote; on a learning platform in particular, code you did not understand is a lesson you did not have.",
    officialUrl: "https://replit.com",
    docsUrl: "https://docs.replit.com",
    difficulty: "BEGINNER",
    primaryUse: "Building and deploying from the browser",
    environments: ["BROWSER", "PLATFORM"],
    icon: "Play",
    verifiedOn: VERIFIED,
    verificationSource: "https://docs.replit.com/",
    capabilities: [
      {
        capability: "Replit Agent",
        detail: "Turns a described idea into a working app you can test and refine.",
      },
      { capability: "Browser-based IDE", detail: "No local setup required." },
      { capability: "Hosting and deployment", detail: "Projects get a live URL." },
      { capability: "Database support", detail: "PostgreSQL is used in Replit's own examples." },
      { capability: "Mobile-responsive app development" },
      {
        capability: "External integrations",
        detail: "Replit documents integration with GitHub, Figma, Vercel, Bolt and Lovable.",
      },
    ],
    useCases: [
      { useCase: "BUILD_APP", note: "Editor, database and deployment in one place." },
      { useCase: "LEARN", note: "Removes the setup barrier that stops many beginners." },
      { useCase: "WRITE_CODE", note: "A real environment, with an agent alongside it." },
    ],
    resources: [
      {
        title: "Replit documentation",
        url: "https://docs.replit.com",
        source: "Replit",
        type: "DOCUMENTATION",
      },
      { title: "Replit", url: "https://replit.com", source: "Replit", type: "REFERENCE" },
    ],
    learningPath: {
      slug: "replit-path",
      title: "Building in the browser",
      description:
        "Aimed at someone using this as a first environment: understand the tool, build, then read what the agent wrote.",
      difficulty: "BEGINNER",
      estimatedTime: "3 hours",
      lessons: [
        {
          title: "Understanding the tool",
          description: "What the agent is doing on your behalf.",
          estimatedTime: "30 minutes",
          topicSlug: "ai-academy-what-ai-tools-are",
        },
        {
          title: "Describing what you want",
          description: "Requirements the agent can build against.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-prompting-fundamentals",
        },
        {
          title: "Using AI as a tutor",
          description: "Hints instead of answers, on a learning platform.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-learning-with-ai",
        },
        {
          title: "Understanding generated code",
          description: "The step that turns building into learning.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-understanding-code",
        },
        {
          title: "Debugging with AI",
          description: "When the thing you built stops working.",
          estimatedTime: "45 minutes",
          topicSlug: "ai-academy-debugging",
        },
        {
          title: "Responsible use",
          description: "What you can honestly say you built.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-responsible-ai",
        },
      ],
    },
  },

  // ── n8n ──────────────────────────────────────────────────────────────────
  {
    slug: "n8n",
    name: "n8n",
    categorySlug: "ai-automation",
    description:
      "A workflow automation tool that combines AI capabilities with business process automation.",
    longDescription:
      "n8n describes itself as a fair-code licensed workflow automation tool that combines AI capabilities with business process automation. You build workflows visually out of nodes: something triggers, data flows through steps that transform it or call services, and AI is one kind of step among many rather than the whole system. It can be self-hosted, which matters when the data passing through is sensitive.",
    whatItIs:
      "A visual workflow builder. A workflow is a collection of nodes that automates a process; a trigger node decides when it runs; credentials hold the authentication its nodes need to reach other services. AI nodes let a model participate in a step — classifying, extracting, summarising — while the surrounding workflow stays ordinary, inspectable software.",
    whenToUse: [
      "Repetitive processes with a clear trigger and clear steps that you do by hand today.",
      "Connecting services that have APIs but no integration with each other.",
      "Putting a model inside a process where its output feeds deterministic steps you control.",
      "Cases where you need to self-host because the data cannot go to a third party.",
      "Learning what triggers, actions, webhooks and credentials actually are, visually.",
    ],
    whenNotToUse: [
      "For a process you have not yet done manually enough times to know the edge cases.",
      "Where a failure would go unnoticed, unless you have built in error handling and alerting.",
      "For an AI step whose output is acted on irreversibly with no human check.",
      "As a replacement for code when the logic is genuinely complex — a large visual graph is harder to maintain than a small program.",
      "With credentials in an environment whose security you have not thought about.",
    ],
    limitations: [
      "Automations fail silently unless you deliberately build error handling and notification.",
      "AI steps are non-deterministic, so the same input can produce different downstream behaviour.",
      "Complex workflows become hard to reason about, version and review.",
      "Credentials are stored to be used, which makes the instance a security-relevant system.",
      "Self-hosting means you own the upgrades, the backups and the uptime.",
    ],
    howDevelopersUseIt:
      "The pattern that survives contact with reality is: do the process by hand first, write down the trigger and the steps, then build it — and add the error path before you add the second feature. When an AI node is involved, developers keep a human approval step in front of anything irreversible, because a model that misclassifies one message in fifty is fine when a person confirms and catastrophic when it sends the email. The most common regret is an automation that quietly stopped working weeks before anybody noticed.",
    officialUrl: "https://n8n.io",
    docsUrl: "https://docs.n8n.io",
    difficulty: "INTERMEDIATE",
    primaryUse: "Automating processes across services",
    environments: ["BROWSER", "PLATFORM"],
    icon: "Workflow",
    verifiedOn: VERIFIED,
    verificationSource: "https://docs.n8n.io/key-concept-glossary.md",
    capabilities: [
      {
        capability: "Visual workflow building",
        detail: "A workflow is a collection of nodes that automates a process.",
      },
      {
        capability: "Trigger nodes",
        detail: "A node responsible for executing the workflow when its conditions are met.",
      },
      {
        capability: "Credentials",
        detail: "Stored authentication that lets nodes connect to external services.",
      },
      { capability: "AI capabilities in workflows", detail: "Including AI agent chat workflows." },
      { capability: "MCP server", detail: "Documented for connecting AI clients to n8n." },
      { capability: "Self-hosting or cloud" },
    ],
    useCases: [
      { useCase: "AUTOMATE", note: "Its core job: triggers, actions and the steps between." },
      {
        useCase: "BUILD_WITH_AI",
        note: "Model calls as one step inside a process you can inspect.",
      },
      { useCase: "LEARN", note: "A good way to see webhooks, triggers and APIs made concrete." },
    ],
    resources: [
      {
        title: "n8n documentation",
        url: "https://docs.n8n.io",
        source: "n8n",
        type: "DOCUMENTATION",
      },
      {
        title: "n8n key concept glossary",
        url: "https://docs.n8n.io/key-concept-glossary/",
        source: "n8n",
        type: "REFERENCE",
        description: "Definitions of node, trigger node, credentials and workflow.",
      },
    ],
    learningPath: {
      slug: "n8n-path",
      title: "Automating a process safely",
      description:
        "Concept-first, then the two things that separate a working automation from a dangerous one: what fails, and who approves.",
      difficulty: "INTERMEDIATE",
      estimatedTime: "3 hours",
      lessons: [
        {
          title: "Understanding the tool",
          description: "Where the model sits inside a workflow.",
          estimatedTime: "30 minutes",
          topicSlug: "ai-academy-what-ai-tools-are",
        },
        {
          title: "AI developer concepts",
          description: "Tool calling, structured output and MCP, which is what AI nodes rest on.",
          estimatedTime: "50 minutes",
          topicSlug: "ai-academy-ai-concepts",
        },
        {
          title: "Designing the process",
          description: "Proposing a design and asking what fails.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-system-design",
        },
        {
          title: "AI security for developers",
          description: "Credentials, data flow and prompt injection in automated steps.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-ai-security",
        },
        {
          title: "Responsible use",
          description: "Human approval in front of anything irreversible.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-responsible-ai",
        },
      ],
    },
  },
];
