import type { SeedAITool } from "./types";

/**
 * Coding assistants and coding agents.
 *
 * These are the highest-leverage and highest-risk tools in the catalog, because
 * they do not suggest text — they change files. Every one of them has a review
 * step in `howDevelopersUseIt`, and that is not editorial padding: it is the
 * difference between using the tool and being used by it.
 *
 * This file also carries the catalog's worked example of a tool changing.
 * Windsurf is now presented by Cognition as Devin Desktop. The Windsurf record
 * is kept, marked DEPRECATED and pointed at its successor, because a learner
 * who has heard the old name still deserves an answer.
 */

const VERIFIED = "2026-08-11";

export const CODING_TOOLS: SeedAITool[] = [
  // ── GitHub Copilot ───────────────────────────────────────────────────────
  {
    slug: "github-copilot",
    name: "GitHub Copilot",
    categorySlug: "ai-coding-assistants",
    description:
      "GitHub's AI coding assistant. Suggests code as you type, answers questions in chat, and can work agentically on a task.",
    longDescription:
      "Copilot is the assistant most developers meet first, because it installs into the editor they already use. GitHub describes it as an AI coding assistant that helps you write code faster and with less effort. It spans several surfaces — inline suggestions in an IDE, a chat interface, the command line, GitHub.com itself — which is both its strength and the reason 'does Copilot do X' rarely has a single answer.",
    whatItIs:
      "A coding assistant that runs where you work. As you type it offers completions, which you accept or ignore. In chat you can ask about code, and it has more context than a browser assistant because it can see the file and the project. GitHub also documents agent-driven development, where it researches, plans, modifies code and opens a pull request for review — note that the last two words are the whole point.",
    whenToUse: [
      "Writing the obvious next few lines: boilerplate, repetitive shapes, the third similar handler.",
      "Asking about code in the project you are actually in, with the file already in context.",
      "Generating a first draft of tests for a function whose behaviour you can state.",
      "Writing a pull request description once you know what the change does.",
      "Getting a suggestion when you know what you want but cannot recall the exact API.",
    ],
    whenNotToUse: [
      "When you cannot read the suggestion. Accepting code you do not understand is how you inherit a bug you cannot find.",
      "For work that has to be exactly right first time without testing — a suggestion is a proposal, not a guarantee.",
      "In code subject to licence obligations you have not thought about.",
      "As a substitute for knowing your codebase. It sees context; it does not have judgement about your architecture.",
      "For security-critical code you will not review carefully — generated code can contain vulnerabilities.",
    ],
    limitations: [
      "Suggestions can be subtly wrong: right shape, wrong condition. Fluency is not correctness.",
      "It can suggest APIs that do not exist, or that existed in an older version of a library.",
      "Its context is limited; a suggestion may contradict a convention established elsewhere in the project.",
      "Feature availability differs across IDEs, plans and surfaces, and changes over time.",
      "Agentic changes need a human review, and a reviewer who does not understand the code cannot provide one.",
    ],
    howDevelopersUseIt:
      "The rhythm for inline suggestions is: type enough to express intent, glance at what appears, and accept only if it is what you were about to write anyway. Suggestions you have to study are usually suggestions to reject. For chat, developers ask about the code in front of them — 'why does this return undefined when the array is empty' — because the point of an editor assistant over a browser one is that it can see the file. For agent mode, the work is in the review: read the diff, run the tests, and treat it exactly like a colleague's pull request from somebody who is fast, well-read and occasionally confidently wrong.",
    officialUrl: "https://github.com/features/copilot",
    docsUrl: "https://docs.github.com/copilot",
    difficulty: "BEGINNER",
    primaryUse: "AI-assisted coding in your editor",
    environments: ["IDE", "BROWSER", "TERMINAL"],
    icon: "Github",
    verifiedOn: VERIFIED,
    verificationSource:
      "https://docs.github.com/en/copilot/get-started/what-is-github-copilot",
    capabilities: [
      {
        capability: "Code suggestions",
        detail: "Recommendations as you type in your IDE.",
      },
      { capability: "Chat", detail: "A conversational interface for coding assistance." },
      { capability: "Command-line support", detail: "Ask for help from the terminal." },
      {
        capability: "Copilot Spaces",
        detail: "Organise and share context so responses are better grounded.",
      },
      {
        capability: "Pull request descriptions",
        detail: "Generate a summary of the changes in a pull request.",
      },
      {
        capability: "Agent-driven development",
        detail:
          "Documented as researching, planning, modifying code and creating pull requests for review.",
      },
    ],
    useCases: [
      { useCase: "WRITE_CODE", note: "Its core job: suggestions where you are already typing." },
      {
        useCase: "UNDERSTAND_CODE",
        note: "Chat has the current file in context, so questions can be specific.",
      },
      { useCase: "TEST", note: "Drafts test scaffolding from a function you point it at." },
      { useCase: "DEBUG", note: "Ask about the failing code with the file already in context." },
      { useCase: "DOCUMENT", note: "Comments, docstrings and pull request descriptions." },
      { useCase: "REFACTOR", note: "Suggests alternatives; you decide which are improvements." },
    ],
    resources: [
      {
        title: "What is GitHub Copilot?",
        url: "https://docs.github.com/en/copilot/get-started/what-is-github-copilot",
        source: "GitHub",
        type: "DOCUMENTATION",
      },
      {
        title: "GitHub Copilot documentation",
        url: "https://docs.github.com/copilot",
        source: "GitHub",
        type: "DOCUMENTATION",
      },
    ],
    learningPath: {
      slug: "github-copilot-path",
      title: "Coding with an assistant in your editor",
      description:
        "Everything here is about the moment of acceptance: knowing what a good suggestion looks like before you press Tab.",
      difficulty: "BEGINNER",
      estimatedTime: "4–5 hours",
      lessons: [
        {
          title: "Understanding the tool",
          description: "Prediction, in your editor.",
          estimatedTime: "30 minutes",
          topicSlug: "ai-academy-what-ai-tools-are",
        },
        {
          title: "Assistants are not chatbots",
          description: "What changes when the tool can see your files.",
          estimatedTime: "30 minutes",
          topicSlug: "ai-academy-chatbots-assistants-agents",
        },
        {
          title: "AI coding assistants",
          description: "Autocomplete, chat with context, and reviewing a suggestion.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-coding-assistants",
        },
        {
          title: "Understanding unfamiliar code",
          description: "The prerequisite for reviewing anything.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-understanding-code",
        },
        {
          title: "Testing with AI",
          description: "Edge cases from the assistant, assertions from you.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-testing",
        },
        {
          title: "Debugging with AI",
          description: "Hypotheses in the editor.",
          estimatedTime: "45 minutes",
          topicSlug: "ai-academy-debugging",
        },
        {
          title: "Documentation with AI",
          description: "Comments and pull request descriptions worth reading.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-documentation",
        },
        {
          title: "AI security for developers",
          description: "Generated code can contain vulnerabilities.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-ai-security",
        },
      ],
    },
  },

  // ── Cursor ───────────────────────────────────────────────────────────────
  {
    slug: "cursor",
    name: "Cursor",
    categorySlug: "ai-coding-assistants",
    description:
      "A coding agent built into a development environment. Works across your codebase to plan changes, fix bugs and review work.",
    longDescription:
      "Cursor's own documentation describes it as a coding agent for building software — used to understand your codebase, plan and build features, fix bugs, review changes and work with the tools you already use. In practice it sits between 'assistant' and 'agent': it will complete a line for you, and it will also plan and execute a multi-file change that you then have to review.",
    whatItIs:
      "A development environment with an agent at its centre. Rather than one autocomplete feature, it offers a set of modes — planning before acting, reviewing what the agent did, debugging — plus customisation through rules, skills, subagents and hooks, and MCP for connecting external tools. It can also run in the cloud and from a CLI, so the same agent can work outside your editor.",
    whenToUse: [
      "Changes that touch several files, where an agent that can see the whole project has a real advantage.",
      "Understanding a codebase you have just joined, by asking questions about it in place.",
      "Working through a bug where the relevant code is spread across modules.",
      "Establishing project conventions once, as rules, instead of restating them every conversation.",
      "Reviewing a change before it goes anywhere, using its review surface as a first pass.",
    ],
    whenNotToUse: [
      "On code you are not able to review. The faster the agent, the more review capacity you need — not less.",
      "For a change you cannot test. An agent's confidence is not evidence.",
      "In an unfamiliar codebase where you cannot yet tell a good change from a plausible one.",
      "When a two-line edit would do. Starting an agent for a typo is slower, not faster.",
      "With repositories whose contents you are not permitted to send to a third-party service.",
    ],
    limitations: [
      "Multi-file changes are harder to review than single suggestions, and the temptation to skim is proportional to the diff size.",
      "It can make a change that passes tests and still misunderstands the intent of the code.",
      "Feature set and pricing evolve quickly — check the current documentation rather than a tutorial.",
      "Cloud and agent features send code to a service; that has to be allowed where you work.",
      "Rules and skills need maintaining; stale rules quietly steer the agent wrong.",
    ],
    howDevelopersUseIt:
      "Experienced users front-load the specification and back-load the trust. They describe the change and let it plan first, read the plan and correct the misunderstanding there — where it costs a sentence rather than a diff. Then they let it work, and read the resulting change properly: what files, what behaviour, what tests. Codebase conventions go into rules so they are stated once. The failure mode everybody eventually experiences is accepting a large change because it looked confident, discovering a subtle behavioural difference days later, and having no memory of the code because they never read it.",
    officialUrl: "https://cursor.com",
    docsUrl: "https://cursor.com/docs",
    difficulty: "INTERMEDIATE",
    primaryUse: "AI-assisted development across a codebase",
    environments: ["IDE", "TERMINAL"],
    icon: "MousePointer2",
    verifiedOn: VERIFIED,
    verificationSource: "https://cursor.com/docs",
    capabilities: [
      {
        capability: "Agent",
        detail: "Plans and makes changes across the codebase rather than answering one question.",
      },
      {
        capability: "Plan Mode",
        detail: "Produces a plan you can correct before any code is touched.",
      },
      { capability: "Agent review", detail: "A surface for reviewing what the agent changed." },
      {
        capability: "Rules",
        detail: "Project conventions stated once and applied to every request.",
      },
      { capability: "Skills and subagents" },
      { capability: "Hooks" },
      { capability: "MCP support", detail: "Connect external tools and data through MCP servers." },
      { capability: "Cloud agents" },
      { capability: "CLI", detail: "The agent outside the editor, including headless and CI use." },
      { capability: "SDKs", detail: "TypeScript and Python." },
      {
        capability: "Integrations",
        detail: "GitHub, GitLab, Azure DevOps, Bitbucket, JetBrains, Slack, Linear, Jira, Notion.",
      },
    ],
    useCases: [
      { useCase: "WRITE_CODE", note: "Multi-file changes with the whole project in view." },
      { useCase: "UNDERSTAND_CODE", note: "Ask questions about a codebase from inside it." },
      { useCase: "DEBUG", note: "Follows a bug across files rather than one pasted snippet." },
      { useCase: "REFACTOR", note: "Plan mode first, so you correct the approach before the diff." },
      { useCase: "TEST", note: "Generates tests it can then run against the project." },
    ],
    resources: [
      {
        title: "Cursor documentation",
        url: "https://cursor.com/docs",
        source: "Cursor",
        type: "DOCUMENTATION",
      },
      {
        title: "MCP in Cursor",
        url: "https://cursor.com/docs/context/mcp",
        source: "Cursor",
        type: "DOCUMENTATION",
        description: "How Cursor connects to external tools and data sources.",
      },
    ],
    learningPath: {
      slug: "cursor-path",
      title: "Working with an agent in your codebase",
      description:
        "Deliberately weighted towards understanding and reviewing code, because that is the capacity a multi-file agent consumes fastest.",
      difficulty: "INTERMEDIATE",
      estimatedTime: "5–6 hours",
      lessons: [
        {
          title: "Chatbots, assistants and agents",
          description: "Where this tool sits, and what that means for trust.",
          estimatedTime: "30 minutes",
          topicSlug: "ai-academy-chatbots-assistants-agents",
        },
        {
          title: "Writing effective prompts",
          description: "A specification the agent can actually follow.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-prompting-fundamentals",
        },
        {
          title: "Understanding unfamiliar code",
          description: "You cannot review what you cannot read.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-understanding-code",
        },
        {
          title: "AI coding assistants",
          description: "Suggestions, context and acceptance.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-coding-assistants",
        },
        {
          title: "AI coding agents",
          description: "Planning, tool use, iteration and approval.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-coding-agents",
        },
        {
          title: "Debugging with AI",
          description: "Across files, with the project in context.",
          estimatedTime: "45 minutes",
          topicSlug: "ai-academy-debugging",
        },
        {
          title: "Testing with AI",
          description: "Because a passing test suite is what makes a large diff reviewable.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-testing",
        },
        {
          title: "Refactoring with AI",
          description: "Behaviour preserved, and proved.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-refactoring",
        },
        {
          title: "AI security for developers",
          description: "What leaves your machine, and what arrives in your repository.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-ai-security",
        },
      ],
    },
  },

  // ── Windsurf (renamed) ───────────────────────────────────────────────────
  {
    slug: "windsurf",
    name: "Windsurf",
    categorySlug: "ai-coding-assistants",
    status: "DEPRECATED",
    supersededBySlug: "devin-desktop",
    statusNote:
      "Cognition now presents Windsurf as Devin Desktop. Its own site states that Devin Desktop is the new name for Windsurf, and existing users receive it as a standard over-the-air update.",
    description:
      "An AI-powered development environment. Now presented by Cognition as Devin Desktop — this record is kept so the old name still leads somewhere.",
    longDescription:
      "Windsurf was an AI-native development environment, best known for its Cascade agent. It is included in this catalog with a DEPRECATED status because the name has changed rather than because the product has gone: Cognition's own site states that Devin Desktop is the new name for Windsurf, built on the same IDE foundation, and that existing users get it as a standard update with no loss of settings or extensions.",
    whatItIs:
      "The former name of the editor now called Devin Desktop. If you are reading a tutorial, a job description or a blog post from before the change, this is the product it means. CodeCompass keeps renamed and discontinued tools in the catalog rather than deleting them, because the most likely reason you are searching for a name is that you saw it somewhere and want to know what it is now.",
    whenToUse: [
      "As a pointer: if you have encountered the name Windsurf, follow it to Devin Desktop.",
      "When reading older material that refers to Windsurf or its Cascade agent.",
    ],
    whenNotToUse: [
      "As a current product recommendation. Look at the successor record instead.",
      "As a source for current features, pricing or availability — check the successor's own documentation.",
    ],
    limitations: [
      "This record is historical. Any capability list for the current product belongs to Devin Desktop, not here.",
      "Documentation URLs for windsurf.com now redirect to the successor's documentation.",
      "Material written before the rename describes features under names the current product may no longer use.",
      "Comparisons and reviews of Windsurf are now comparisons of a product that has since changed hands and direction.",
    ],
    howDevelopersUseIt:
      "They do not, under this name, any more. The reason this entry exists is that tool catalogs rot quietly: a name disappears, every article about it stays online, and a learner ends up on a redirect with no explanation. Recording the rename is the honest alternative to deleting the row and pretending the product never existed.",
    officialUrl: "https://devin.ai/desktop",
    docsUrl: "https://docs.devin.ai",
    difficulty: "INTERMEDIATE",
    primaryUse: "Superseded — see Devin Desktop",
    environments: ["IDE"],
    icon: "Wind",
    verifiedOn: VERIFIED,
    verificationSource: "https://devin.ai/desktop",
    capabilities: [
      {
        capability: "Superseded by Devin Desktop",
        detail:
          "Cognition states that Devin Desktop is the new name for Windsurf and is built on its IDE foundation.",
      },
    ],
    useCases: [
      {
        useCase: "WRITE_CODE",
        note: "Historical. The current product under this lineage is Devin Desktop.",
      },
    ],
    resources: [
      {
        title: "Devin Desktop — the new name for Windsurf",
        url: "https://devin.ai/desktop",
        source: "Cognition",
        type: "DOCUMENTATION",
      },
    ],
    learningPath: {
      slug: "windsurf-path",
      title: "What happened to Windsurf",
      description:
        "A single lesson: tools get renamed, acquired and discontinued, and knowing how to find out what a name became is itself a skill.",
      difficulty: "BEGINNER",
      estimatedTime: "30 minutes",
      lessons: [
        {
          title: "Research and verification",
          description:
            "How to establish what a tool is called now, and who owns it, from official sources.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-research",
        },
      ],
    },
  },

  // ── Devin Desktop ────────────────────────────────────────────────────────
  {
    slug: "devin-desktop",
    name: "Devin Desktop",
    categorySlug: "ai-coding-agents",
    description:
      "Cognition's development environment and agent command centre. The product formerly called Windsurf.",
    longDescription:
      "Devin Desktop is Cognition's IDE, described on its own site as the command centre for managing all your agents in one place. It is a full development environment — syntax highlighting, autocomplete, debugging — with the distinguishing idea that you are supervising several agents rather than pair-programming with one.",
    whatItIs:
      "An editor built around managing agents. Alongside ordinary IDE features it offers a Kanban view of agent tasks by status, Spaces for sharing context and Git worktrees between agents, and support for the Agent Client Protocol so it can work across different models and agents. The mental shift it asks for is real: your job moves from writing code to specifying work and reviewing results.",
    whenToUse: [
      "When you genuinely have several independent tasks that can run in parallel and be reviewed separately.",
      "Long-running work you want to hand off and check on, rather than watch line by line.",
      "Working with agents from more than one vendor in one place, via ACP.",
      "When you want an IDE and an agent supervisor in the same window rather than two tools.",
    ],
    whenNotToUse: [
      "Before you can review agent output competently. Parallelism multiplies whatever your review quality already is.",
      "For small, well-understood edits, where specifying the task costs more than doing it.",
      "On code you cannot send to a third-party service.",
      "As a way to ship faster without reading the changes. That is not speed, it is deferred cost.",
    ],
    limitations: [
      "Several agents working at once produces more change than one person can carefully review — the bottleneck moves to you.",
      "Agents can make confident changes that satisfy the instruction and miss the intent.",
      "The product is young and was renamed recently; features and terminology are still moving.",
      "Agentic work needs your repository accessible to the service.",
    ],
    howDevelopersUseIt:
      "The realistic pattern is to treat agents as a small team of fast juniors: give each a well-scoped, independently reviewable task, watch the board, and review each result on its own. The discipline that makes it work is refusing to increase parallelism beyond your review capacity — a queue of five finished tasks you have not read is not five tasks done, it is five unreviewed changes and a growing temptation.",
    officialUrl: "https://devin.ai/desktop",
    docsUrl: "https://docs.devin.ai",
    difficulty: "ADVANCED",
    primaryUse: "Supervising coding agents in an IDE",
    environments: ["IDE"],
    icon: "Bot",
    verifiedOn: VERIFIED,
    verificationSource: "https://devin.ai/desktop",
    capabilities: [
      {
        capability: "Agent command centre",
        detail: "Manage local and cloud agents from one interface.",
      },
      {
        capability: "Full IDE",
        detail: "Syntax highlighting, autocomplete and debugging tools.",
      },
      { capability: "Spaces", detail: "Share context and Git worktrees across agents." },
      {
        capability: "Kanban view",
        detail: "Agent tasks organised by status: running, waiting for review, done.",
      },
      { capability: "Fast Context", detail: "Locates the files and lines an agent needs." },
      { capability: "Supercomplete", detail: "Predictive code completion." },
      {
        capability: "Agent Client Protocol (ACP)",
        detail: "Work across different models and agents.",
      },
    ],
    useCases: [
      { useCase: "WRITE_CODE", note: "Agents make the changes; you specify and review them." },
      { useCase: "DEBUG", note: "Hand a reproducible failure to an agent and review the fix." },
      { useCase: "REFACTOR", note: "Well-scoped mechanical changes are a good agent task." },
      { useCase: "UNDERSTAND_CODE", note: "Fast Context finds the relevant files quickly." },
    ],
    resources: [
      {
        title: "Devin Desktop",
        url: "https://devin.ai/desktop",
        source: "Cognition",
        type: "DOCUMENTATION",
      },
      {
        title: "Devin documentation",
        url: "https://docs.devin.ai",
        source: "Cognition",
        type: "DOCUMENTATION",
      },
    ],
    learningPath: {
      slug: "devin-desktop-path",
      title: "Supervising agents",
      description:
        "Aimed squarely at the skill this tool actually demands, which is reviewing work you did not do.",
      difficulty: "ADVANCED",
      estimatedTime: "4–5 hours",
      lessons: [
        {
          title: "Chatbots, assistants and agents",
          description: "The distinction this tool lives at the far end of.",
          estimatedTime: "30 minutes",
          topicSlug: "ai-academy-chatbots-assistants-agents",
        },
        {
          title: "AI coding assistants",
          description: "The step before agents, and why it comes first.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-coding-assistants",
        },
        {
          title: "AI coding agents",
          description: "Planning, tool use, file changes, approval.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-coding-agents",
        },
        {
          title: "Understanding unfamiliar code",
          description: "Review is reading. This is the reading part.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-understanding-code",
        },
        {
          title: "Testing with AI",
          description: "Tests are what make an unreviewed change survivable.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-testing",
        },
        {
          title: "AI security for developers",
          description: "Agents with tool access change the threat model.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-ai-security",
        },
        {
          title: "Responsible use",
          description: "You remain the author of everything you merge.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-responsible-ai",
        },
      ],
    },
  },

  // ── Claude Code ──────────────────────────────────────────────────────────
  {
    slug: "claude-code",
    name: "Claude Code",
    categorySlug: "ai-coding-agents",
    description:
      "Anthropic's agentic coding tool. Works on a real repository from the terminal, and proposes changes you review.",
    longDescription:
      "Claude Code is listed by Anthropic among its core products, alongside the Claude assistant itself. It is a coding agent rather than a chat window: you describe a task in the context of a real repository and it works through it — reading files, making changes, running commands — leaving you a change to review.",
    whatItIs:
      "An agent that operates on your codebase. The difference from a browser assistant is that it does not need you to paste anything: it reads the files itself. The difference from autocomplete is that it takes multi-step actions rather than offering the next line. Both differences point the same way — the value goes up and so does the amount of reviewing you owe.",
    whenToUse: [
      "Tasks that span several files where pasting context into a chat window would be absurd.",
      "Well-specified changes you can describe precisely and verify afterwards.",
      "Exploring an unfamiliar repository by asking questions answered from the actual files.",
      "Mechanical migrations where the correctness criterion is 'the tests still pass'.",
    ],
    whenNotToUse: [
      "On changes you will not read. This is the single rule that matters.",
      "In a repository with no tests and no way to check behaviour, unless you plan to check by hand.",
      "For work whose requirements you cannot yet state — an agent cannot resolve an ambiguity you have not noticed.",
      "Where your code may not be sent to a third-party service.",
    ],
    limitations: [
      "It can satisfy the letter of an instruction while missing the intent.",
      "Large diffs are hard to review well, and the tool makes large diffs easy to produce.",
      "It works from what it can read; conventions that live only in your head are invisible to it.",
      "Model knowledge has a cut-off, so it may use an older form of a library's API.",
      "Running commands is powerful and therefore consequential — know what you have authorised.",
    ],
    howDevelopersUseIt:
      "The pattern that works is small, verifiable increments: state the task and the constraint, let it work, read the diff, run the tests, and commit that step before starting the next. Developers who get value from it treat the review as the real work — the agent produces a candidate change quickly, and the human decides whether it is the change they wanted. Developers who get burned by it are the ones who let a single session produce forty files of changes and then had to decide whether to trust all of it at once.",
    officialUrl: "https://claude.com/product/claude-code",
    docsUrl: "https://platform.claude.com/docs",
    difficulty: "INTERMEDIATE",
    primaryUse: "Agentic coding in a real repository",
    environments: ["TERMINAL", "IDE", "BROWSER"],
    icon: "Terminal",
    verifiedOn: VERIFIED,
    verificationSource: "https://claude.com/product/claude-code",
    capabilities: [
      {
        capability: "Agentic coding in your codebase",
        detail:
          "Anthropic describes building, debugging and shipping directly in the codebase rather than from pasted snippets.",
      },
      { capability: "Terminal integration" },
      { capability: "IDE extensions", detail: "VS Code and JetBrains." },
      { capability: "Web and mobile access" },
      { capability: "Slack integration", detail: "Start tasks from a conversation." },
      { capability: "GitHub and GitLab integration" },
      {
        capability: "Multi-file edits",
        detail: "Changes spanning several files, and issues turned into pull requests.",
      },
      {
        capability: "MCP support",
        detail: "Capabilities extended through MCP servers.",
      },
    ],
    useCases: [
      { useCase: "WRITE_CODE", note: "Multi-file changes in a repository you then review." },
      { useCase: "UNDERSTAND_CODE", note: "Asks and answers questions from the actual files." },
      { useCase: "REFACTOR", note: "Mechanical changes verified by an existing test suite." },
      { useCase: "TEST", note: "Can write and run tests as part of the same task." },
      { useCase: "DEBUG", note: "Reproduce, investigate, propose — you confirm the diagnosis." },
    ],
    resources: [
      {
        title: "Claude product overview",
        url: "https://claude.com/product/overview",
        source: "Anthropic",
        type: "DOCUMENTATION",
      },
      {
        title: "Claude developer documentation",
        url: "https://platform.claude.com/docs",
        source: "Anthropic",
        type: "DOCUMENTATION",
      },
    ],
    learningPath: {
      slug: "claude-code-path",
      title: "Agentic coding, reviewed",
      description:
        "Front-loaded with the review skills, because an agent that edits files is only as safe as the person reading the diff.",
      difficulty: "INTERMEDIATE",
      estimatedTime: "4–5 hours",
      lessons: [
        {
          title: "Chatbots, assistants and agents",
          description: "What an agent is allowed to do that a chatbot is not.",
          estimatedTime: "30 minutes",
          topicSlug: "ai-academy-chatbots-assistants-agents",
        },
        {
          title: "Writing effective prompts",
          description: "A task specification an agent can follow.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-prompting-fundamentals",
        },
        {
          title: "Understanding unfamiliar code",
          description: "The reading skill review depends on.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-understanding-code",
        },
        {
          title: "AI coding agents",
          description: "Planning, tool use, iteration, approval.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-coding-agents",
        },
        {
          title: "Testing with AI",
          description: "The safety net that makes an agent's diff checkable.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-testing",
        },
        {
          title: "Refactoring with AI",
          description: "Proving behaviour did not change.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-refactoring",
        },
        {
          title: "Responsible use",
          description: "You are the author of the commit.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-responsible-ai",
        },
      ],
    },
  },
];
