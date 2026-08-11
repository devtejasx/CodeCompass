import type { SeedAITool } from "./types";

/**
 * Model APIs, routing services and the protocol underneath them.
 *
 * The line this file is on the far side of: everything above is a tool you use,
 * and everything here is a component you become responsible for. Once a model
 * call is inside your application, its cost, latency, failure modes and output
 * are yours to handle — which is why every record here talks about errors,
 * spend and evaluation rather than features alone.
 *
 * CodeCompass itself calls none of these. Phase 9 teaches the concepts; no key
 * is read and no request is made.
 */

const VERIFIED = "2026-08-11";

export const PLATFORM_TOOLS: SeedAITool[] = [
  // ── OpenAI API ───────────────────────────────────────────────────────────
  {
    slug: "openai-api",
    name: "OpenAI API",
    categorySlug: "ai-platforms",
    description:
      "OpenAI's developer platform: call models from your own code for text, tools, structured output, embeddings, images and audio.",
    longDescription:
      "The OpenAI API is what you use when a model needs to be part of your product rather than a tab you have open. Its documentation covers text generation, function (tool) calling, structured outputs against a JSON Schema you define, embeddings, image and audio capabilities, the Responses API, and an Agents SDK for building agents with tools and workflows.",
    whatItIs:
      "An HTTP API and a set of SDKs. You send a request containing your instructions and context, you get a response back, and you pay per token. Everything a chat product does — memory, tools, document reading — is something you assemble on top of this. The interesting engineering is not the call itself; it is what you do about latency, cost, failure and output you cannot fully predict.",
    whenToUse: [
      "When a language model genuinely needs to be a feature of your application.",
      "Turning unstructured input into structured data, using structured outputs against a schema.",
      "Semantic search and similarity, using embeddings.",
      "Letting a model call your own functions, through tool calling, with your code deciding what actually runs.",
      "Building an agent whose steps and permissions you control.",
    ],
    whenNotToUse: [
      "When ordinary code would do. A regular expression is cheaper, faster and deterministic.",
      "Where a wrong answer causes harm and there is no verification step or human in the loop.",
      "Before you have thought about cost — per-token pricing scales with usage in ways a demo never shows.",
      "In a client-side application with the key in the browser. The key belongs on your server, always.",
      "Where latency matters and you have not measured it.",
    ],
    limitations: [
      "Non-deterministic output: the same input can produce different responses, so your tests must accommodate that.",
      "Cost scales with tokens, and long context is expensive at volume.",
      "Rate limits apply, and your application has to handle being throttled.",
      "Models are deprecated and replaced over time, so pinning and migration are your problem.",
      "Latency is real and variable; user-facing calls need timeouts and a fallback.",
      "You have a hard dependency on an external service's availability.",
    ],
    howDevelopersUseIt:
      "Production use looks much less magical than a demo. The call is wrapped in a server-side function with a timeout, a retry policy and a budget guard. Output is constrained with structured outputs where possible, because a schema you can validate beats a paragraph you have to parse. Tool calling is used to let the model choose an action while your code decides whether that action is allowed. And there is an evaluation set — a fixed list of inputs with expected properties — so that changing a prompt or a model is a measured decision rather than a vibe.",
    officialUrl: "https://platform.openai.com",
    docsUrl: "https://developers.openai.com/api/docs/",
    difficulty: "ADVANCED",
    primaryUse: "Building AI features into your own software",
    environments: ["API"],
    icon: "Cpu",
    verifiedOn: VERIFIED,
    verificationSource: "https://developers.openai.com/api/docs/",
    capabilities: [
      { capability: "Text generation" },
      {
        capability: "Tool calling",
        detail: "Function calling connects models to external data and systems.",
      },
      {
        capability: "Structured outputs",
        detail: "Responses that follow a JSON Schema you define.",
      },
      { capability: "Embeddings", detail: "Text as vectors, for search and clustering." },
      { capability: "Images", detail: "Generation and vision understanding." },
      { capability: "Audio", detail: "Speech-to-text and text-to-speech." },
      { capability: "Responses API" },
      { capability: "Agents SDK", detail: "Building agents with tools and workflows." },
      { capability: "MCP support", detail: "MCP documents ChatGPT among its supported clients." },
    ],
    useCases: [
      { useCase: "BUILD_WITH_AI", note: "The API you reach for to put a model inside a product." },
      {
        useCase: "ANALYSE_DATA",
        note: "Structured outputs turn unstructured text into data you can query.",
      },
      { useCase: "WRITE_CODE", note: "Models are available through the API for code tasks too." },
    ],
    resources: [
      {
        title: "OpenAI API documentation",
        url: "https://developers.openai.com/api/docs/",
        source: "OpenAI",
        type: "DOCUMENTATION",
      },
      {
        title: "OpenAI platform",
        url: "https://platform.openai.com",
        source: "OpenAI",
        type: "REFERENCE",
      },
    ],
    learningPath: {
      slug: "openai-api-path",
      title: "Putting a model inside your product",
      description:
        "Concepts before code: you cannot make sensible decisions about context, cost or evaluation until the vocabulary means something.",
      difficulty: "ADVANCED",
      estimatedTime: "3–4 hours",
      lessons: [
        {
          title: "Understanding the tool",
          description: "What the model does, and what it cannot do for you.",
          estimatedTime: "30 minutes",
          topicSlug: "ai-academy-what-ai-tools-are",
        },
        {
          title: "AI developer concepts",
          description:
            "Tokens, context, embeddings, RAG, tool calling, structured output, MCP, evaluation.",
          estimatedTime: "50 minutes",
          topicSlug: "ai-academy-ai-concepts",
        },
        {
          title: "Prompting as a programmer",
          description: "The prompt is part of your source code now.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-prompting-fundamentals",
        },
        {
          title: "Designing around a non-deterministic component",
          description: "Failure cases you have to design for.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-system-design",
        },
        {
          title: "Testing an AI feature",
          description: "What an assertion looks like when the output varies.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-testing",
        },
        {
          title: "AI security for developers",
          description: "Keys, prompt injection and untrusted input reaching a model.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-ai-security",
        },
      ],
    },
  },

  // ── Anthropic Claude API ─────────────────────────────────────────────────
  {
    slug: "anthropic-api",
    name: "Claude API",
    categorySlug: "ai-platforms",
    description:
      "Anthropic's developer platform: the Messages API and SDKs for building with Claude models.",
    longDescription:
      "The Claude API is Anthropic's developer platform. The core surface is the Messages API — you send a list of messages and get a reply — with official SDKs for Python, TypeScript, C#, Go, Java, PHP and Ruby, plus a CLI. It is the same set of concerns as any model API: context, cost, tools, structured output and evaluation.",
    whatItIs:
      "An HTTP API with SDKs in most mainstream languages. You authenticate with a key that lives in your environment, send a request to the Messages endpoint, and handle the response. Around that core Anthropic documents the wider feature set — tools, context management, structured outputs — which is where a simple call becomes an actual product feature.",
    whenToUse: [
      "Building a feature on Claude models in your own application.",
      "Work where the input is large and the reasoning matters more than the response time.",
      "Letting a model use tools you define, with your code deciding what is permitted.",
      "Extracting structured data from unstructured text.",
      "Any language on the supported SDK list, rather than only Python and JavaScript.",
    ],
    whenNotToUse: [
      "When ordinary deterministic code solves the problem.",
      "In a browser with the key exposed. Keys belong on a server you control.",
      "Without a cost model. Token pricing is easy to ignore in development and hard to ignore in production.",
      "Where being wrong is unacceptable and nothing verifies the output.",
      "As a drop-in for a search index or a database.",
    ],
    limitations: [
      "Non-deterministic output, which changes how you test.",
      "Per-token cost, and long context is where the bill grows.",
      "Rate limits your application has to handle gracefully.",
      "Model versions change; pinning and planned migration are your responsibility.",
      "Network latency and availability are a dependency you have taken on.",
    ],
    howDevelopersUseIt:
      "Much the same discipline as any model API, with one habit worth calling out: because these models handle large context well, the temptation is to send everything. Sending everything is also the fastest way to a surprising invoice and a slow endpoint, so the useful skill is deciding what actually needs to be in the request. Beyond that — key in the environment, call on the server, output validated against a schema where possible, an evaluation set so prompt changes are measured, and a fallback path for when the API is unavailable.",
    officialUrl: "https://platform.claude.com",
    docsUrl: "https://platform.claude.com/docs",
    difficulty: "ADVANCED",
    primaryUse: "Building with Claude models in your own code",
    environments: ["API", "TERMINAL"],
    icon: "Cpu",
    verifiedOn: VERIFIED,
    verificationSource: "https://platform.claude.com/docs/en/get-started",
    capabilities: [
      {
        capability: "Messages API",
        detail: "The core endpoint: send messages, receive a model reply.",
      },
      {
        capability: "Official SDKs",
        detail: "Python, TypeScript, C#, Go, Java, PHP and Ruby.",
      },
      { capability: "CLI", detail: "A command-line client with its own authentication flow." },
      { capability: "Tools", detail: "Documented among the platform's core capabilities." },
      { capability: "Structured outputs" },
      { capability: "Context management" },
      { capability: "MCP support", detail: "MCP lists Claude among its supported clients." },
    ],
    useCases: [
      { useCase: "BUILD_WITH_AI", note: "The developer surface behind the Claude assistant." },
      { useCase: "ANALYSE_DATA", note: "Structured extraction from documents and text." },
      { useCase: "WRITE_CODE", note: "Code-focused tasks through the same API." },
    ],
    resources: [
      {
        title: "Claude API — get started",
        url: "https://platform.claude.com/docs/en/get-started",
        source: "Anthropic",
        type: "DOCUMENTATION",
      },
      {
        title: "Claude developer platform",
        url: "https://platform.claude.com",
        source: "Anthropic",
        type: "REFERENCE",
      },
    ],
    learningPath: {
      slug: "anthropic-api-path",
      title: "Building on a model API",
      description:
        "The same shape as the other platform paths, because the skills genuinely transfer: only the endpoint changes.",
      difficulty: "ADVANCED",
      estimatedTime: "3–4 hours",
      lessons: [
        {
          title: "Understanding the tool",
          description: "What you are actually calling.",
          estimatedTime: "30 minutes",
          topicSlug: "ai-academy-what-ai-tools-are",
        },
        {
          title: "AI developer concepts",
          description: "The vocabulary the documentation assumes.",
          estimatedTime: "50 minutes",
          topicSlug: "ai-academy-ai-concepts",
        },
        {
          title: "Prompting as a programmer",
          description: "Prompts that live in version control.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-prompting-fundamentals",
        },
        {
          title: "Designing around a non-deterministic component",
          description: "Timeouts, fallbacks and budget guards.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-system-design",
        },
        {
          title: "Testing an AI feature",
          description: "Evaluation sets instead of exact-match assertions.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-testing",
        },
        {
          title: "AI security for developers",
          description: "Where the key lives, and what reaches the model.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-ai-security",
        },
      ],
    },
  },

  // ── Google Gemini API ────────────────────────────────────────────────────
  {
    slug: "google-gemini-api",
    name: "Google Gemini API",
    categorySlug: "ai-platforms",
    description:
      "Google's model API: long context, multimodal understanding, structured output, function calling and Search grounding.",
    longDescription:
      "The Gemini API is Google's developer surface for its models. Its documentation is notably strong on scale and modality: very long context, understanding of images, video and documents, structured outputs, function calling, image generation, a Live API for real-time voice, and grounding in Google Search.",
    whatItIs:
      "An HTTP API with SDKs, reached through Google AI for Developers. The features that most distinguish it are context length — Google documents inputting millions of tokens — and multimodality, including processing long PDFs and video with full multimodal understanding. Tool integrations documented include Google Search, Maps, code execution and computer use.",
    whenToUse: [
      "Inputs that are genuinely large: long documents, transcripts, video.",
      "Multimodal problems where the input is not text — images, video, PDFs.",
      "Answers that need grounding in current web results, using Search grounding.",
      "Structured extraction, using constrained JSON output.",
      "Real-time voice applications, through the Live API.",
    ],
    whenNotToUse: [
      "When simple code would do the job deterministically.",
      "Without a cost estimate — very long context is exactly where token cost concentrates.",
      "With the key in client-side code.",
      "For output nobody validates, in a path where being wrong matters.",
      "As a substitute for a proper search index over your own data.",
    ],
    limitations: [
      "Long context is capability, not comprehension: a model can be given a million tokens and still miss the relevant one.",
      "Per-token pricing makes very large inputs expensive at volume.",
      "Non-deterministic output, with the testing consequences that brings.",
      "Rate limits and quota apply.",
      "Feature and model availability differ by region and tier and change over time.",
    ],
    howDevelopersUseIt:
      "The distinctive use is feeding it things other APIs would need chunking for — a whole specification, a recorded session, a large PDF — and asking specific questions about them. That is genuinely powerful, and it is also where the discipline is needed: developers who get value from it still measure whether a smaller, targeted input gives the same answer for a fraction of the cost. Search grounding is used where currency matters, with the same rule as any search tool: the citation is the evidence.",
    officialUrl: "https://ai.google.dev",
    docsUrl: "https://ai.google.dev/gemini-api/docs",
    difficulty: "ADVANCED",
    primaryUse: "Long-context and multimodal AI features",
    environments: ["API"],
    icon: "Cpu",
    verifiedOn: VERIFIED,
    verificationSource: "https://ai.google.dev/gemini-api/docs",
    capabilities: [
      { capability: "Text generation" },
      {
        capability: "Long context",
        detail: "Documented as inputting millions of tokens across images, video and documents.",
      },
      { capability: "Structured outputs", detail: "Constrain responses to JSON." },
      { capability: "Function calling", detail: "Connect the model to external APIs and tools." },
      { capability: "Image generation" },
      { capability: "Video understanding" },
      {
        capability: "Document processing",
        detail: "Documented as processing up to 1000 pages of PDF with multimodal understanding.",
      },
      { capability: "Live API", detail: "Real-time voice applications." },
      { capability: "Thinking", detail: "Reasoning capabilities for complex tasks and agents." },
      {
        capability: "Tool integrations",
        detail: "Google Search, Maps, code execution and computer use.",
      },
    ],
    useCases: [
      { useCase: "BUILD_WITH_AI", note: "Especially where inputs are long or multimodal." },
      { useCase: "ANALYSE_DATA", note: "Documents, video and transcripts into structured output." },
      { useCase: "RESEARCH", note: "Search grounding for answers that need to be current." },
    ],
    resources: [
      {
        title: "Gemini API documentation",
        url: "https://ai.google.dev/gemini-api/docs",
        source: "Google",
        type: "DOCUMENTATION",
      },
      {
        title: "Google AI for Developers",
        url: "https://ai.google.dev",
        source: "Google",
        type: "REFERENCE",
      },
    ],
    learningPath: {
      slug: "google-gemini-api-path",
      title: "Long context and multimodal input",
      description:
        "Same foundations as the other platform paths, with the emphasis on deciding what actually needs to be in the request.",
      difficulty: "ADVANCED",
      estimatedTime: "3–4 hours",
      lessons: [
        {
          title: "Understanding the tool",
          description: "Capability is not comprehension.",
          estimatedTime: "30 minutes",
          topicSlug: "ai-academy-what-ai-tools-are",
        },
        {
          title: "AI developer concepts",
          description: "Context windows, tokens, embeddings, RAG and tool calling.",
          estimatedTime: "50 minutes",
          topicSlug: "ai-academy-ai-concepts",
        },
        {
          title: "Prompting as a programmer",
          description: "Instructions that survive a model change.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-prompting-fundamentals",
        },
        {
          title: "Research and verification",
          description: "Grounded answers still need their sources read.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-research",
        },
        {
          title: "Testing an AI feature",
          description: "Measuring a change rather than sensing it.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-testing",
        },
        {
          title: "AI security for developers",
          description: "Untrusted documents are untrusted input.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-ai-security",
        },
      ],
    },
  },

  // ── OpenRouter ───────────────────────────────────────────────────────────
  {
    slug: "openrouter",
    name: "OpenRouter",
    categorySlug: "ai-platforms",
    description:
      "One API endpoint for hundreds of models, with automatic fallbacks and an OpenAI-compatible interface.",
    longDescription:
      "OpenRouter gives access to hundreds of AI models through a single API endpoint, handling fallbacks automatically and selecting cost-effective options. Its practical appeal is that it removes the integration cost of comparing or switching models: one endpoint, one key, and an OpenAI SDK-compatible interface so existing code works without modification.",
    whatItIs:
      "A routing layer in front of many providers. You call one endpoint and name a model; OpenRouter forwards the request and returns the response. Because the endpoint is OpenAI-compatible, code written against the OpenAI SDK can point at it unchanged. It also offers typed client SDKs for TypeScript and Python and an Agent SDK for tool use and state.",
    whenToUse: [
      "Comparing several models on your own task without writing an integration for each.",
      "Keeping the option to switch models without rewriting your application.",
      "Wanting automatic fallback when a provider is unavailable.",
      "Reaching models from providers you do not have separate accounts with.",
      "Early experiments, where flexibility matters more than a direct relationship with one vendor.",
    ],
    whenNotToUse: [
      "When you have committed to one provider and want their newest features the day they ship.",
      "Where adding an intermediary is unacceptable for data-handling or compliance reasons.",
      "Without reading the terms for how requests are handled and routed.",
      "When latency is critical and the extra hop has not been measured.",
    ],
    limitations: [
      "You depend on a routing service in addition to the underlying provider.",
      "Provider-specific features may lag behind or be unavailable through a unified interface.",
      "Automatic routing means the model that answered may not be the one you assumed unless you pin it.",
      "Pricing is per-model and changes as the catalog changes.",
      "Model behaviour differs between providers, so switching is never purely a configuration change.",
    ],
    howDevelopersUseIt:
      "The honest use is evaluation. A developer with a real task and a fixed set of test inputs runs the same evaluation against four models through one interface, compares quality and cost, and picks one — a comparison that would otherwise cost four integrations. In production it is used where the ability to change models quickly is worth an extra dependency. The mistake is assuming models are interchangeable: a prompt tuned for one can degrade noticeably on another, which is exactly what the evaluation is for.",
    officialUrl: "https://openrouter.ai",
    docsUrl: "https://openrouter.ai/docs",
    difficulty: "INTERMEDIATE",
    primaryUse: "One interface to many models",
    environments: ["API"],
    icon: "Route",
    verifiedOn: VERIFIED,
    verificationSource: "https://openrouter.ai/docs/quickstart",
    capabilities: [
      {
        capability: "Unified API for many models",
        detail: "Hundreds of models through a single endpoint.",
      },
      { capability: "Automatic fallbacks" },
      {
        capability: "Cost-aware routing",
        detail: "Documented as picking cost-effective options per request.",
      },
      {
        capability: "OpenAI SDK compatibility",
        detail: "Existing OpenAI-based code can point at it without modification.",
      },
      { capability: "Client SDKs", detail: "TypeScript and Python." },
      { capability: "Agent SDK", detail: "Building agents with tool use and state management." },
      { capability: "Model catalog API", detail: "Browse available models programmatically." },
    ],
    useCases: [
      { useCase: "BUILD_WITH_AI", note: "One integration instead of one per provider." },
      {
        useCase: "RESEARCH",
        note: "Comparing model quality on your own task rather than on a leaderboard.",
      },
    ],
    resources: [
      {
        title: "OpenRouter quickstart",
        url: "https://openrouter.ai/docs/quickstart",
        source: "OpenRouter",
        type: "DOCUMENTATION",
      },
      {
        title: "OpenRouter models",
        url: "https://openrouter.ai/models",
        source: "OpenRouter",
        type: "REFERENCE",
      },
    ],
    learningPath: {
      slug: "openrouter-path",
      title: "Comparing models honestly",
      description:
        "Built around evaluation, because that is the only reason a routing layer is worth an extra dependency.",
      difficulty: "INTERMEDIATE",
      estimatedTime: "2–3 hours",
      lessons: [
        {
          title: "Understanding the tool",
          description: "What differs between models, and what does not.",
          estimatedTime: "30 minutes",
          topicSlug: "ai-academy-what-ai-tools-are",
        },
        {
          title: "AI developer concepts",
          description: "Tokens, context and cost, which is what you are comparing.",
          estimatedTime: "50 minutes",
          topicSlug: "ai-academy-ai-concepts",
        },
        {
          title: "Testing an AI feature",
          description: "A fixed evaluation set is what makes a comparison mean anything.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-testing",
        },
        {
          title: "Research and verification",
          description: "Benchmarks are not your task.",
          estimatedTime: "35 minutes",
          topicSlug: "ai-academy-research",
        },
      ],
    },
  },

  // ── Model Context Protocol ───────────────────────────────────────────────
  {
    slug: "model-context-protocol",
    name: "Model Context Protocol (MCP)",
    categorySlug: "ai-developer-infrastructure",
    description:
      "An open standard for connecting AI applications to external data sources and tools.",
    longDescription:
      "MCP is an open-source standard for connecting AI applications to external systems. Its own documentation uses the analogy of a USB-C port for AI applications: rather than every assistant building a bespoke integration with every service, a service exposes an MCP server once and any MCP client can use it. It is supported across a wide range of clients including Claude, ChatGPT, VS Code and Cursor.",
    whatItIs:
      "A protocol, not a product. An MCP server exposes data sources, tools or prompts; an MCP client — an AI application — connects and uses them. That is the whole idea, and it matters because it turns 'my assistant cannot see my data' from an integration project into a configuration step. For a developer it is worth understanding as the standard shape of how AI tools reach the outside world.",
    whenToUse: [
      "When an AI tool you use needs access to data or systems it cannot currently see.",
      "Exposing your own service to AI applications once, rather than per-client.",
      "Understanding what a coding assistant is actually connected to, and therefore what it can do.",
      "Reasoning about the blast radius of an agent, which is exactly the set of tools it can reach.",
    ],
    whenNotToUse: [
      "Where a plain API call from your own code would be simpler and more predictable.",
      "Connecting a server whose behaviour and provenance you have not checked — a tool the model can call is a capability you have granted.",
      "As a way to give an agent broad access you would not give a new colleague on their first day.",
      "For sensitive systems, without deciding which operations require human approval.",
    ],
    limitations: [
      "It is a standard, so implementation quality and completeness vary between servers.",
      "Every connected server widens what an AI application can do, including by mistake.",
      "Content returned by a server is untrusted input, and untrusted input reaching a model is where prompt injection lives.",
      "The specification is evolving; client support differs.",
      "It solves connection, not judgement — what the model does with the access is still a question you have to answer.",
    ],
    howDevelopersUseIt:
      "Two directions. As a consumer, a developer connects their assistant to servers for the systems they work in, and the useful discipline is treating each connection as a permission grant: what can this let the model do, and what would go wrong if it did that at the wrong moment? As a producer, a team exposes their own service through an MCP server so it works with every client at once. The security habit that matters in both directions is remembering that anything a server returns is data from outside your trust boundary.",
    officialUrl: "https://modelcontextprotocol.io",
    docsUrl: "https://modelcontextprotocol.io/docs/getting-started/intro",
    difficulty: "INTERMEDIATE",
    primaryUse: "Connecting AI applications to data and tools",
    environments: ["API", "PLATFORM"],
    icon: "Plug",
    verifiedOn: VERIFIED,
    verificationSource: "https://modelcontextprotocol.io/docs/getting-started/intro",
    capabilities: [
      {
        capability: "Open standard for AI connections",
        detail: "Described as a standardised way to connect AI applications to external systems.",
      },
      {
        capability: "Data source access",
        detail: "Local files, databases and other systems, exposed by a server.",
      },
      { capability: "Tool access", detail: "Search engines, calculators and other callable tools." },
      { capability: "Workflows", detail: "Specialised prompts exposed by a server." },
      { capability: "Servers and clients", detail: "Build either side of the connection." },
      {
        capability: "Broad client support",
        detail: "Claude, ChatGPT, Visual Studio Code and Cursor are among the documented clients.",
      },
    ],
    useCases: [
      {
        useCase: "BUILD_WITH_AI",
        note: "The standard way to give an AI application access to real systems.",
      },
      {
        useCase: "AUTOMATE",
        note: "Tools an agent can call, exposed once and reused across clients.",
      },
    ],
    resources: [
      {
        title: "What is MCP?",
        url: "https://modelcontextprotocol.io/docs/getting-started/intro",
        source: "Model Context Protocol",
        type: "DOCUMENTATION",
      },
      {
        title: "Model Context Protocol",
        url: "https://modelcontextprotocol.io",
        source: "Model Context Protocol",
        type: "REFERENCE",
      },
    ],
    learningPath: {
      slug: "model-context-protocol-path",
      title: "Connecting AI to real systems",
      description:
        "Short, and deliberately ending on security: every connection you add is a capability you granted.",
      difficulty: "INTERMEDIATE",
      estimatedTime: "2–3 hours",
      lessons: [
        {
          title: "AI developer concepts",
          description: "Tool calling and context, which is what MCP standardises.",
          estimatedTime: "50 minutes",
          topicSlug: "ai-academy-ai-concepts",
        },
        {
          title: "AI coding agents",
          description: "What an agent can reach is what it can affect.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-coding-agents",
        },
        {
          title: "AI security for developers",
          description: "Untrusted input, prompt injection and permission grants.",
          estimatedTime: "40 minutes",
          topicSlug: "ai-academy-ai-security",
        },
      ],
    },
  },
];
