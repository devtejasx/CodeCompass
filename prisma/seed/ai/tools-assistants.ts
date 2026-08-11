import type { SeedAITool } from "./types";

/**
 * General-purpose assistants, plus the search and study tools built the same
 * way.
 *
 * Every capability listed here was checked against the vendor's own site or
 * help centre on the date in `verifiedOn`. Where a product has been renamed —
 * NotebookLM is now presented by Google as Gemini Notebook — the record says so
 * rather than quietly using the old name.
 */

const VERIFIED = "2026-08-11";

export const ASSISTANT_TOOLS: SeedAITool[] = [
  // ── ChatGPT ──────────────────────────────────────────────────────────────
  {
    slug: "chatgpt",
    name: "ChatGPT",
    categorySlug: "ai-assistants",
    description:
      "OpenAI's conversational assistant. General-purpose: you describe a problem in ordinary language and get an answer back.",
    longDescription:
      "ChatGPT is a chat interface to OpenAI's models. It is the tool most people mean when they say 'AI', and it is genuinely broad — it will explain a concept, draft an email, read a file you upload, search the web and write code. That breadth is also its weakness: it knows nothing about your project unless you paste it in, so the quality of what you get back is mostly a function of what you put in.",
    whatItIs:
      "A chat application built on a large language model. You type a message, it predicts a useful reply, and the conversation so far is the only thing it knows about you. It is not a database and it is not searching your computer: unless you attach a file or turn on web search, everything it says comes from patterns learned during training. That is why it can describe a library's API fluently and still get the argument order wrong.",
    whenToUse: [
      "Explaining a concept you have just met, at whatever level you ask for.",
      "Getting several possible causes for an error you can then test yourself.",
      "Drafting the first version of something you will edit — a README, a commit message, a test plan.",
      "Rubber-ducking a design when there is nobody around to think out loud at.",
      "Translating between languages or frameworks you know into ones you do not yet.",
    ],
    whenNotToUse: [
      "When you cannot judge whether the answer is right. An answer you cannot check is a guess you have adopted.",
      "For the current behaviour of a specific library version — go to that library's documentation, which is authoritative in a way a trained model is not.",
      "With credentials, customer data or proprietary code, unless you have checked the account's data-handling settings and are allowed to.",
      "As a substitute for reading the error message. Read it first; you will often not need the tool at all.",
      "For anything where being confidently wrong is expensive and unverifiable — legal, medical, financial or security-critical claims.",
    ],
    limitations: [
      "It can produce fluent, well-structured text that is factually wrong, with no change in tone to warn you.",
      "Its training data has a cut-off date, so recent releases, renames and API changes may be missing or wrong unless it searches the web.",
      "It has a finite context window: in a long conversation, earlier details stop influencing the answer.",
      "It has no memory of your codebase. Everything it 'knows' about your project is what you pasted.",
      "Usage limits and available features differ between the free and paid tiers, and change over time.",
    ],
    howDevelopersUseIt:
      "The realistic pattern is short, well-scoped conversations rather than one long one. A developer hits an unfamiliar error, pastes the message and the twenty relevant lines, and asks for possible causes ranked by likelihood — then goes and tests them. They ask for an explanation of a regex somebody else wrote, then ask for a simpler equivalent, then check both against the actual input. They draft a README section and rewrite half of it. The common thread is that ChatGPT produces candidates and the developer decides which survive.",
    officialUrl: "https://chatgpt.com",
    docsUrl: "https://help.openai.com/en/collections/3742473-chatgpt",
    difficulty: "BEGINNER",
    primaryUse: "General explanation, drafting and problem-solving",
    environments: ["BROWSER"],
    icon: "MessageSquare",
    verifiedOn: VERIFIED,
    verificationSource: "https://help.openai.com/en/collections/3742473-chatgpt",
    capabilities: [
      {
        capability: "Conversational text generation",
        detail: "Explanations, drafts, rewrites and code, in a back-and-forth chat.",
      },
      {
        capability: "Web search",
        detail: "Answers can be grounded in current web results rather than training data alone.",
      },
      {
        capability: "Deep research",
        detail:
          "Documented by OpenAI as an agent that finds, analyses and synthesises many online sources into a report.",
      },
      {
        capability: "Projects",
        detail:
          "Workspaces that keep chats, files and custom instructions for a long-running effort together.",
      },
      {
        capability: "Canvas",
        detail: "A side-by-side editing surface for documents and code, rather than pure chat.",
      },
      {
        capability: "File upload and analysis",
        detail: "Read and reason over documents and data you attach to the conversation.",
      },
      { capability: "Image generation" },
      { capability: "Voice conversation" },
      {
        capability: "Agent mode",
        detail:
          "Documented by OpenAI as carrying out multi-step tasks on its own virtual computer, with on-screen narration you can interrupt.",
      },
    ],
    useCases: [
      {
        useCase: "LEARN",
        note: "Will explain the same idea at four different levels until one lands.",
      },
      {
        useCase: "DEBUG",
        note: "Good at producing a list of plausible causes from an error and some context.",
      },
      {
        useCase: "UNDERSTAND_CODE",
        note: "Paste a function and ask for a line-by-line reading, then the concept behind it.",
      },
      {
        useCase: "DOCUMENT",
        note: "Drafts READMEs and API docs quickly; the draft always needs checking against the code.",
      },
      {
        useCase: "RESEARCH",
        note: "With web search on, it can gather sources — which you then read yourself.",
      },
      {
        useCase: "WRITE_CODE",
        note: "Fine for self-contained functions you can test; it cannot see the rest of your project.",
      },
    ],
    resources: [
      {
        title: "ChatGPT help centre",
        url: "https://help.openai.com/en/collections/3742473-chatgpt",
        source: "OpenAI",
        type: "DOCUMENTATION",
        description: "The official documentation for what ChatGPT can do, by feature.",
      },
      {
        title: "ChatGPT capabilities overview",
        url: "https://help.openai.com/en/articles/9260256-chatgpt-capabilities-overview",
        source: "OpenAI",
        type: "REFERENCE",
      },
      {
        title: "Deep research in ChatGPT",
        url: "https://help.openai.com/en/articles/10500283-deep-research-in-chatgpt",
        source: "OpenAI",
        type: "DOCUMENTATION",
      },
    ],
    learningPath: {
      slug: "chatgpt-path",
      title: "Working with a general assistant",
      description:
        "Start with what the tool is really doing, get the request right, then use it for learning and for the everyday jobs where you can check the answer.",
      difficulty: "BEGINNER",
      estimatedTime: "4–5 hours",
      lessons: [
        {
          title: "Understanding the tool",
          description: "What a language model is doing when it answers you.",
          estimatedTime: "30 minutes",
          topicSlug: "ai-academy-what-ai-tools-are",
        },
        {
          title: "Writing effective prompts",
          description: "Context, goal, constraints, expected output.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-prompting-fundamentals",
        },
        {
          title: "Iterating on an answer",
          description: "What to do when the first reply is plausible and wrong.",
          estimatedTime: "30 minutes",
          topicSlug: "ai-academy-iterating-on-prompts",
        },
        {
          title: "Using AI for learning",
          description: "Hints and quizzes instead of solutions.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-learning-with-ai",
        },
        {
          title: "Debugging with AI",
          description: "Hypotheses from the assistant, tests from you.",
          estimatedTime: "45 minutes",
          topicSlug: "ai-academy-debugging",
        },
        {
          title: "Documentation with AI",
          description: "Drafting docs, and the review that has to follow.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-documentation",
        },
        {
          title: "Research and verification",
          description: "Getting to the primary source rather than stopping at the summary.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-research",
        },
        {
          title: "Responsible use",
          description: "Secrets, licences and the accountability that stays with you.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-responsible-ai",
        },
      ],
    },
  },

  // ── Claude ───────────────────────────────────────────────────────────────
  {
    slug: "claude",
    name: "Claude",
    categorySlug: "ai-assistants",
    description:
      "Anthropic's assistant. Strong on long documents and codebases, with a terminal-based coding tool of its own.",
    longDescription:
      "Claude is Anthropic's conversational assistant, available in a browser and desktop app and through a developer platform. In practice developers reach for it when the input is large — a long file, a specification, a pile of logs — and when they want a considered answer rather than a fast one. It also has a distinct surface, Claude Code, which is an agentic coding tool rather than a chat window.",
    whatItIs:
      "A chat application built on Anthropic's Claude models, with a set of surfaces around it: Projects for keeping related conversations and files together, Artifacts for producing something you can look at rather than just read about, connectors for reaching other systems, and Claude Code for working in a terminal on a real repository. As with any assistant, it knows only what is in the conversation.",
    whenToUse: [
      "Reading and reasoning over a long document, specification or file you paste in.",
      "Working through a design or a piece of unfamiliar code where you want the reasoning shown.",
      "Producing something structured — a checklist, a table, a small interactive page — via Artifacts.",
      "Keeping a long-running effort together in a Project, so you are not re-explaining context daily.",
      "Terminal-based work on a real repository, through Claude Code, when you are prepared to review every change.",
    ],
    whenNotToUse: [
      "When you have not read the code yourself. A good explanation of code you never look at is not understanding.",
      "For authoritative current facts about a third-party product — check that product's own documentation.",
      "With secrets or customer data you have not been cleared to share.",
      "As an approval step. If a change needs review, a person reviews it.",
      "When the task is trivially checkable by running it — just run it.",
    ],
    limitations: [
      "It can be wrong while sounding careful, which is a harder failure to spot than being wrong while sounding excited.",
      "Training data has a cut-off, so it may not know about very recent releases unless it searches.",
      "Context is finite, and very long conversations lose their earlier detail.",
      "Available features and limits differ by plan and change over time.",
      "Claude Code can modify files. That power is exactly why the review step is not optional.",
    ],
    howDevelopersUseIt:
      "Two quite different habits. In the chat app, developers paste a large amount of context — a whole module, a spec, a stack trace — and ask a specific question about it, because the tool's usefulness scales with how much real context it has. In Claude Code, they describe a task in a repository and then read the diff it proposes, line by line, the same way they would review a colleague's pull request. The second habit only works if you already have the first: you cannot review a change to code you have never understood.",
    officialUrl: "https://claude.ai",
    docsUrl: "https://platform.claude.com/docs",
    difficulty: "BEGINNER",
    primaryUse: "Long-context reasoning, explanation and coding",
    environments: ["BROWSER", "TERMINAL"],
    icon: "Sparkles",
    verifiedOn: VERIFIED,
    verificationSource: "https://claude.com/product/overview",
    capabilities: [
      {
        capability: "Conversational text generation",
        detail: "Explanations, analysis, drafting and code in a chat interface.",
      },
      {
        capability: "Artifacts",
        detail:
          "Listed by Anthropic as a way to build shareable creations — interactive, visual or checklist output — alongside the conversation.",
      },
      {
        capability: "Projects",
        detail: "Organise conversations and files by topic so context persists across sessions.",
      },
      {
        capability: "Claude Code",
        detail: "A separate agentic coding tool that works on real repositories.",
      },
      { capability: "Web search" },
      {
        capability: "Connectors",
        detail: "Custom connectors and integrations for reaching other systems, built on MCP.",
      },
      { capability: "Voice mode" },
      { capability: "File upload and analysis" },
    ],
    useCases: [
      {
        useCase: "UNDERSTAND_CODE",
        note: "Handles large pastes well, which is what understanding unfamiliar code actually needs.",
      },
      {
        useCase: "LEARN",
        note: "Will explain its reasoning, which is more useful to a learner than a bare answer.",
      },
      { useCase: "DEBUG", note: "Give it the error, the code and what you expected." },
      {
        useCase: "REFACTOR",
        note: "Good at naming what is wrong with a piece of code before proposing changes.",
      },
      {
        useCase: "ARCHITECTURE",
        note: "Useful as a critic of a design you propose first, rather than as the designer.",
      },
      { useCase: "DOCUMENT", note: "Drafts documentation from code you supply." },
      {
        useCase: "WRITE_CODE",
        note: "Through Claude Code it edits real files — which makes reviewing the diff mandatory.",
      },
    ],
    resources: [
      {
        title: "Claude product overview",
        url: "https://claude.com/product/overview",
        source: "Anthropic",
        type: "DOCUMENTATION",
      },
      {
        title: "Claude developer platform documentation",
        url: "https://platform.claude.com/docs",
        source: "Anthropic",
        type: "DOCUMENTATION",
        description: "The API and developer tooling behind the assistant.",
      },
    ],
    learningPath: {
      slug: "claude-path",
      title: "Working with a long-context assistant",
      description:
        "Built around the thing this tool is genuinely good at: giving it a lot of real context and reasoning over it carefully.",
      difficulty: "BEGINNER",
      estimatedTime: "4–5 hours",
      lessons: [
        {
          title: "Understanding the tool",
          description: "What the model is doing, and what it cannot know.",
          estimatedTime: "30 minutes",
          topicSlug: "ai-academy-what-ai-tools-are",
        },
        {
          title: "Writing effective prompts",
          description: "Giving enough context to be answerable.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-prompting-fundamentals",
        },
        {
          title: "Understanding unfamiliar code",
          description: "The four-question sequence, on code you did not write.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-understanding-code",
        },
        {
          title: "Debugging with AI",
          description: "Hypotheses you then test.",
          estimatedTime: "45 minutes",
          topicSlug: "ai-academy-debugging",
        },
        {
          title: "Refactoring with AI",
          description: "Smells first, rewrites last, tests throughout.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-refactoring",
        },
        {
          title: "System design with AI",
          description: "Your design, its critique.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-system-design",
        },
        {
          title: "Coding agents",
          description: "What changes when the tool edits files instead of suggesting text.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-coding-agents",
        },
        {
          title: "Responsible use",
          description: "Where the accountability sits.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-responsible-ai",
        },
      ],
    },
  },

  // ── Gemini ───────────────────────────────────────────────────────────────
  {
    slug: "gemini",
    name: "Gemini",
    categorySlug: "ai-assistants",
    description:
      "Google's assistant, with multimodal input and integration into Google's own products.",
    longDescription:
      "Gemini is Google's conversational assistant, available on the web and on mobile. Google describes it as an interface to a multimodal model — text, images and audio all go in — and it connects to Google's own surfaces such as Workspace, Maps and YouTube. For developers, its distinguishing features are the multimodal input and the research and canvas modes.",
    whatItIs:
      "A chat application built on Google's Gemini models. Multimodal means you can give it an image or audio as well as text — a screenshot of an error, a photo of a whiteboard — and ask questions about it. Like every assistant, it does not know your codebase, and its answers about third-party products are a prediction rather than a lookup unless it searches.",
    whenToUse: [
      "Asking about something you can show more easily than describe — a screenshot, a diagram, a photo.",
      "Longer research questions where its Deep Research mode can gather material for you to read.",
      "Work that already lives in Google's products, where the integration saves copying things around.",
      "Explaining concepts, the same as any general assistant.",
      "Drafting in Canvas when you want an editable surface rather than a chat log.",
    ],
    whenNotToUse: [
      "For the current API of a specific library — read that library's documentation.",
      "With confidential material you have not checked the data-handling terms for.",
      "When you need the answer to be reproducible; assistants are not deterministic.",
      "As your only source on a contested technical question. Compare, then check.",
      "For code changes you will not review.",
    ],
    limitations: [
      "Fluent output can still be wrong, including about Google's own products.",
      "Feature availability differs by region, account type and plan, and changes over time.",
      "Training cut-off applies, so recent changes may be missing unless it searches.",
      "Multimodal input helps but does not make it reliable — it can misread a screenshot confidently.",
      "It knows nothing about your repository unless you paste it in.",
    ],
    howDevelopersUseIt:
      "The habit that makes Gemini distinctive is showing rather than telling: pasting a screenshot of a failing UI, a photo of an architecture sketch, or a chart, and asking what it shows. Beyond that it is used like any assistant — explanation, drafting, and research where Deep Research gathers sources that the developer then reads. As always, the summary is the starting point and the sources are the answer.",
    officialUrl: "https://gemini.google.com",
    docsUrl: "https://gemini.google/overview/",
    difficulty: "BEGINNER",
    primaryUse: "Multimodal explanation and research",
    environments: ["BROWSER"],
    icon: "Star",
    verifiedOn: VERIFIED,
    verificationSource: "https://gemini.google/overview/",
    capabilities: [
      {
        capability: "Multimodal input",
        detail: "Google describes Gemini as handling text, audio and images.",
      },
      {
        capability: "Deep Research",
        detail: "A mode for gathering and synthesising material on a question.",
      },
      { capability: "Canvas", detail: "An editable working surface alongside the chat." },
      {
        capability: "Gems",
        detail: "Customised versions of the assistant with your own standing instructions.",
      },
      { capability: "Image generation" },
      { capability: "Video generation" },
      { capability: "Gemini Live", detail: "Real-time conversational interaction." },
      { capability: "Long context" },
      {
        capability: "Google Workspace integration",
        detail: "Connects to Google's own products, including Maps and YouTube.",
      },
    ],
    useCases: [
      {
        useCase: "RESEARCH",
        note: "Deep Research gathers material on a question; you still read the sources.",
      },
      { useCase: "LEARN", note: "Explains concepts, and can work from an image you show it." },
      {
        useCase: "UNDERSTAND_CODE",
        note: "Paste the code, or a screenshot of the behaviour you cannot explain.",
      },
      { useCase: "DEBUG", note: "Useful when the evidence is visual — a broken layout, a chart." },
      { useCase: "DOCUMENT", note: "Drafts documentation you then check against the code." },
    ],
    resources: [
      {
        title: "Gemini overview",
        url: "https://gemini.google/overview/",
        source: "Google",
        type: "DOCUMENTATION",
      },
      {
        title: "Gemini",
        url: "https://gemini.google.com",
        source: "Google",
        type: "REFERENCE",
        description: "The assistant itself.",
      },
    ],
    learningPath: {
      slug: "gemini-path",
      title: "Research and explanation with a multimodal assistant",
      description:
        "Weighted towards research and verification, which is where this tool's gathering modes are most useful and most in need of discipline.",
      difficulty: "BEGINNER",
      estimatedTime: "3–4 hours",
      lessons: [
        {
          title: "Understanding the tool",
          description: "Prediction, not lookup.",
          estimatedTime: "30 minutes",
          topicSlug: "ai-academy-what-ai-tools-are",
        },
        {
          title: "Writing effective prompts",
          description: "Asking a question that can be answered.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-prompting-fundamentals",
        },
        {
          title: "Research and verification",
          description: "Summaries are not sources.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-research",
        },
        {
          title: "Using AI for learning",
          description: "Explanations at the level you actually need.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-learning-with-ai",
        },
        {
          title: "Documentation with AI",
          description: "Drafting, then reviewing.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-documentation",
        },
        {
          title: "Responsible use",
          description: "What you are still accountable for.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-responsible-ai",
        },
      ],
    },
  },

  // ── Perplexity ───────────────────────────────────────────────────────────
  {
    slug: "perplexity",
    name: "Perplexity",
    categorySlug: "ai-search-research",
    description:
      "An answer engine: it searches the web, synthesises what it finds and cites the pages it used.",
    longDescription:
      "Perplexity answers questions by searching the web and summarising the results with citations, rather than answering purely from a model's training. That makes it structurally better suited to questions about current facts than a plain assistant — and it makes the citations the most important part of the interface, because they are what lets you check the answer.",
    whatItIs:
      "A search product with a language model on top. It retrieves pages, reads them, writes a summary, and links to what it used. The summary is generated text and can misread or over-simplify a source; the links are the actual evidence. Perplexity also offers developer APIs — Search, Agent and Embeddings — for building this kind of grounded answering into your own applications.",
    whenToUse: [
      "Questions where currency matters — what changed in a release, whether a service still exists.",
      "Getting oriented in an unfamiliar area quickly, then reading the sources it surfaces.",
      "Comparing what several sources say about a contested technical question.",
      "Finding the primary source when you know a fact but not where it is documented.",
      "Building web-grounded answering into your own product, via its Search or Agent API.",
    ],
    whenNotToUse: [
      "As the final word. The citation is the answer; the summary is a pointer to it.",
      "When the authoritative source is a specific product's documentation — go straight there.",
      "For reasoning about your own private codebase, which it cannot see.",
      "When the sources it found are low quality. Check what it actually cited before trusting it.",
      "For questions with no factual answer, where a confident synthesis is actively misleading.",
    ],
    limitations: [
      "The summary can misrepresent a source it cited, so a citation is not proof the claim is right.",
      "Source quality varies; it can cite a blog post repeating a mistake as readily as official docs.",
      "It can miss the best source entirely if the question is phrased unusually.",
      "API usage is rate limited and metered.",
      "Like all such tools, it presents synthesis with the same confidence as fact.",
    ],
    howDevelopersUseIt:
      "The productive habit is to treat the answer as a table of contents. A developer asks a focused question, skims the summary to work out which of the cited pages is likely to be authoritative, opens that page, and reads it. When two sources disagree the tool has done its job by surfacing both — resolving the disagreement is the developer's work, usually by finding which one is the vendor's own documentation.",
    officialUrl: "https://www.perplexity.ai",
    docsUrl: "https://docs.perplexity.ai",
    difficulty: "BEGINNER",
    primaryUse: "Web research with citations",
    environments: ["BROWSER", "API"],
    icon: "Search",
    verifiedOn: VERIFIED,
    verificationSource: "https://docs.perplexity.ai/getting-started/overview",
    capabilities: [
      {
        capability: "Web-grounded answers with citations",
        detail: "Documented as providing web-grounded answers with built-in citations.",
      },
      {
        capability: "Search API",
        detail: "Ranked web search results with filtering, for building on.",
      },
      { capability: "Agent API", detail: "Web-grounded answering in a single call." },
      { capability: "Embeddings API" },
    ],
    useCases: [
      {
        useCase: "RESEARCH",
        note: "Built for it: the citations are the point, not a decoration.",
      },
      {
        useCase: "LEARN",
        note: "Good for getting oriented in an unfamiliar area before reading properly.",
      },
      {
        useCase: "BUILD_WITH_AI",
        note: "Its Search and Agent APIs let you add grounded answering to your own app.",
      },
    ],
    resources: [
      {
        title: "Perplexity API documentation",
        url: "https://docs.perplexity.ai",
        source: "Perplexity",
        type: "DOCUMENTATION",
      },
      {
        title: "Perplexity",
        url: "https://www.perplexity.ai",
        source: "Perplexity",
        type: "REFERENCE",
      },
    ],
    learningPath: {
      slug: "perplexity-path",
      title: "Research you can defend",
      description:
        "Short and pointed. The only skill this tool really demands is the discipline to open the citation.",
      difficulty: "BEGINNER",
      estimatedTime: "2 hours",
      lessons: [
        {
          title: "Understanding the tool",
          description: "Retrieval plus generation, and where each one fails.",
          estimatedTime: "30 minutes",
          topicSlug: "ai-academy-what-ai-tools-are",
        },
        {
          title: "Asking a focused question",
          description: "Narrow questions get checkable answers.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-prompting-fundamentals",
        },
        {
          title: "Research and verification",
          description: "Primary sources, and what to do when two disagree.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-research",
        },
        {
          title: "Responsible use",
          description: "Citing what you actually read.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-responsible-ai",
        },
      ],
    },
  },

  // ── Gemini Notebook (formerly NotebookLM) ────────────────────────────────
  {
    slug: "notebooklm",
    name: "Gemini Notebook",
    categorySlug: "ai-knowledge-learning",
    description:
      "Google's source-grounded research tool — it answers only from documents you upload. Presented by Google as Gemini Notebook; previously known as NotebookLM.",
    longDescription:
      "Gemini Notebook answers questions using only the sources you give it. That single constraint is what makes it different from a general assistant: it will not fill a gap with plausible invention from training data, because it is working from your documents. For studying a specification, a set of papers or a pile of internal documentation, that is exactly the property you want.",
    whatItIs:
      "A notebook you fill with sources — documents, PDFs, pasted text — and then question. Answers are grounded in those sources and cite them, so you can jump from a claim to the passage it came from. Google now presents the product as Gemini Notebook; you will still see it referred to as NotebookLM in older material and in its support documentation URLs.",
    whenToUse: [
      "Studying a long specification, standard or set of papers you need to actually know.",
      "Interrogating documentation you already trust, where invention would be the failure mode.",
      "Pulling together a set of related documents and asking questions that cross all of them.",
      "Producing study material — summaries, question lists — from sources you supply.",
      "Any situation where 'answer only from these documents' is the requirement.",
    ],
    whenNotToUse: [
      "For questions your sources do not cover. It is grounded, not omniscient.",
      "For writing code — it is a study tool, not a coding assistant.",
      "With confidential material you have not been cleared to upload.",
      "As a replacement for reading the source when the source is short. Just read it.",
      "When you need current web information; it works from what you gave it.",
    ],
    limitations: [
      "There are documented limits on notebooks, sources per notebook, source size, daily chat queries and audio generations.",
      "Citations are not always attached to an individual passage — Google notes that very short sources may be referenced as a whole.",
      "Its answers are only as good as the sources you supplied, including their mistakes.",
      "It works from selected sources, so a source you forgot to include is simply invisible to it.",
      "Feature availability differs by plan and is still changing; the product has been renamed once already.",
    ],
    howDevelopersUseIt:
      "Developers use it as a reading tool for material they must get right. Upload an RFC, a payment provider's integration guide, or a set of internal design documents, then ask the questions you would otherwise have to skim four hundred pages for — and follow every citation back to the passage. The habit that matters is treating it as a faster way to find the relevant paragraph, not as a way to avoid reading it.",
    officialUrl: "https://notebooklm.google/",
    docsUrl: "https://support.google.com/notebooklm",
    difficulty: "BEGINNER",
    primaryUse: "Studying sources you supply",
    environments: ["BROWSER"],
    icon: "BookOpen",
    verifiedOn: VERIFIED,
    verificationSource: "https://support.google.com/notebooklm/answer/16269187",
    capabilities: [
      {
        capability: "Source-grounded answering",
        detail: "Answers come from the sources you upload, not from open training data.",
      },
      {
        capability: "Citations back to sources",
        detail:
          "Google documents that very short sources may be cited as a whole rather than by passage.",
      },
      { capability: "Audio generation from your sources" },
      { capability: "Notes", detail: "Included in answers only when you select them." },
      { capability: "Multiple notebooks with their own source sets" },
      { capability: "Mobile app" },
    ],
    useCases: [
      {
        useCase: "LEARN",
        note: "Grounding answers in sources you trust is exactly what studying needs.",
      },
      {
        useCase: "RESEARCH",
        note: "Cross-questioning a set of documents you have gathered yourself.",
      },
      {
        useCase: "UNDERSTAND_CODE",
        note: "Useful for specifications and design documents rather than source files.",
      },
    ],
    resources: [
      {
        title: "Gemini Notebook help centre",
        url: "https://support.google.com/notebooklm",
        source: "Google",
        type: "DOCUMENTATION",
      },
      {
        title: "Gemini Notebook",
        url: "https://notebooklm.google/",
        source: "Google",
        type: "REFERENCE",
      },
    ],
    learningPath: {
      slug: "notebooklm-path",
      title: "Studying with grounded answers",
      description:
        "A short path: what grounding buys you, how to ask, and why a citation still has to be opened.",
      difficulty: "BEGINNER",
      estimatedTime: "2 hours",
      lessons: [
        {
          title: "Understanding the tool",
          description: "Why grounding changes the failure mode.",
          estimatedTime: "30 minutes",
          topicSlug: "ai-academy-what-ai-tools-are",
        },
        {
          title: "Using AI as a tutor",
          description: "Hints, quizzes, and finding your own gaps.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-learning-with-ai",
        },
        {
          title: "Research and verification",
          description: "Following a citation to the passage.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-research",
        },
        {
          title: "Responsible use",
          description: "What you may upload, and what you may not.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-responsible-ai",
        },
      ],
    },
  },
];
