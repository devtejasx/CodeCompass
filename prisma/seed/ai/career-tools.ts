import type { SeedCareerAITool } from "./types";

/**
 * Career → tool → use case.
 *
 * This file is the reason the explorer can say "recommended for you" and mean
 * something. Each edge carries the job the tool does on that path, so a
 * recommendation is always accompanied by its reason — an unexplained list of
 * tools teaches nobody anything.
 *
 * Two rules were followed while authoring it. Every career gets a *small* list,
 * because twelve recommendations is the same as none. And the same tool appears
 * on several paths with different reasons, because the reason is the part that
 * differs: a frontend developer and a data analyst use an assistant for
 * genuinely different work.
 *
 * Careers without an entry are not broken — the explorer falls back to the
 * general catalog, which is the honest answer to "we have not curated this yet".
 */
export const CAREER_AI_TOOLS: SeedCareerAITool[] = [
  {
    careerSlug: "frontend-developer",
    tools: [
      {
        toolSlug: "cursor",
        useCase: "WRITE_CODE",
        reason:
          "Component work spreads across files — the component, its styles, its tests, its types. An agent that can see all of them is doing something a chat window cannot.",
      },
      {
        toolSlug: "github-copilot",
        useCase: "WRITE_CODE",
        reason:
          "Interface code has a lot of repetitive shape. Inline suggestions are at their best exactly there.",
      },
      {
        toolSlug: "v0",
        useCase: "DESIGN_UI",
        reason:
          "Turns a description or a mockup into React and Next.js you can look at, argue with, and then rewrite properly.",
      },
      {
        toolSlug: "claude",
        useCase: "UNDERSTAND_CODE",
        reason:
          "Handles large pastes well, which is what you need when inheriting a component nobody remembers writing.",
      },
      {
        toolSlug: "chatgpt",
        useCase: "LEARN",
        reason:
          "The frontend ecosystem changes constantly; a tutor that explains a new pattern four ways is worth having.",
      },
    ],
  },
  {
    careerSlug: "backend-developer",
    tools: [
      {
        toolSlug: "cursor",
        useCase: "WRITE_CODE",
        reason:
          "Backend changes ripple through routes, services and migrations. Whole-project context is the point.",
      },
      {
        toolSlug: "claude",
        useCase: "ARCHITECTURE",
        reason:
          "Useful as a critic of a design you propose first — which is how backend decisions should be made anyway.",
      },
      {
        toolSlug: "github-copilot",
        useCase: "TEST",
        reason:
          "Drafts test scaffolding for handlers and services, leaving you to decide what correct actually means.",
      },
      {
        toolSlug: "chatgpt",
        useCase: "DEBUG",
        reason:
          "Good at turning a stack trace and some context into a list of causes you can go and test.",
      },
      {
        toolSlug: "openai-api",
        useCase: "BUILD_WITH_AI",
        reason:
          "Sooner or later a backend developer is asked to put a model behind an endpoint. This is that endpoint.",
      },
    ],
  },
  {
    careerSlug: "full-stack-developer",
    tools: [
      {
        toolSlug: "cursor",
        useCase: "WRITE_CODE",
        reason:
          "A full-stack change is a multi-file change by definition. This is the tool shape that matches.",
      },
      {
        toolSlug: "github-copilot",
        useCase: "WRITE_CODE",
        reason:
          "Works in whichever half of the stack you are in today, without changing tools.",
      },
      {
        toolSlug: "claude",
        useCase: "UNDERSTAND_CODE",
        reason: "For the half of the stack you touched least recently.",
      },
      {
        toolSlug: "lovable",
        useCase: "BUILD_APP",
        reason:
          "Generates a whole stack quickly, which is a good prototyping tool and a demanding review.",
      },
      {
        toolSlug: "chatgpt",
        useCase: "LEARN",
        reason: "Full-stack means permanently learning something; this is the fastest first pass.",
      },
    ],
  },
  {
    careerSlug: "software-engineer",
    tools: [
      {
        toolSlug: "cursor",
        useCase: "WRITE_CODE",
        reason: "Codebase-wide context for changes that are never in one file.",
      },
      {
        toolSlug: "claude-code",
        useCase: "REFACTOR",
        reason:
          "Mechanical, test-verified changes across a repository are exactly what an agent should be given.",
      },
      {
        toolSlug: "claude",
        useCase: "ARCHITECTURE",
        reason: "A critic for designs you have already made, not an author of designs you have not.",
      },
      {
        toolSlug: "github-copilot",
        useCase: "WRITE_CODE",
        reason: "The assistant most likely to already be installed where you work.",
      },
      {
        toolSlug: "perplexity",
        useCase: "RESEARCH",
        reason:
          "For questions about libraries and versions where the citation matters more than the summary.",
      },
    ],
  },
  {
    careerSlug: "ai-engineer",
    tools: [
      {
        toolSlug: "openai-api",
        useCase: "BUILD_WITH_AI",
        reason:
          "Text generation, tool calling, structured outputs and embeddings — the components of the job.",
      },
      {
        toolSlug: "anthropic-api",
        useCase: "BUILD_WITH_AI",
        reason: "A second provider, which is how you find out what is model-specific in your prompts.",
      },
      {
        toolSlug: "openrouter",
        useCase: "RESEARCH",
        reason:
          "Evaluating several models against your own task through one interface, rather than four integrations.",
      },
      {
        toolSlug: "model-context-protocol",
        useCase: "BUILD_WITH_AI",
        reason:
          "The standard way AI applications reach real data and tools. Knowing it is knowing the shape of the ecosystem.",
      },
      {
        toolSlug: "google-gemini-api",
        useCase: "BUILD_WITH_AI",
        reason: "Where the input is genuinely long or multimodal, this is the one to reach for.",
      },
      {
        toolSlug: "cursor",
        useCase: "WRITE_CODE",
        reason: "You will still be writing ordinary software around the model. Most of it, in fact.",
      },
    ],
  },
  {
    careerSlug: "machine-learning-engineer",
    tools: [
      {
        toolSlug: "openai-api",
        useCase: "BUILD_WITH_AI",
        reason: "Embeddings and structured output are everyday tools in an ML pipeline now.",
      },
      {
        toolSlug: "anthropic-api",
        useCase: "BUILD_WITH_AI",
        reason: "For work where large context and careful reasoning matter more than latency.",
      },
      {
        toolSlug: "notebooklm",
        useCase: "RESEARCH",
        reason:
          "Answers only from papers and specifications you upload, which is what reading a literature pile needs.",
      },
      {
        toolSlug: "openrouter",
        useCase: "RESEARCH",
        reason: "Comparing models on your task rather than on somebody else's leaderboard.",
      },
      {
        toolSlug: "claude",
        useCase: "UNDERSTAND_CODE",
        reason: "For reading somebody else's training code, which is rarely documented.",
      },
    ],
  },
  {
    careerSlug: "data-scientist",
    tools: [
      {
        toolSlug: "notebooklm",
        useCase: "RESEARCH",
        reason:
          "Grounded in the papers and documents you supply, so it will not invent a finding that was never in them.",
      },
      {
        toolSlug: "chatgpt",
        useCase: "ANALYSE_DATA",
        reason:
          "Uploaded data, explained approaches and drafted analysis code you then check against the data.",
      },
      {
        toolSlug: "claude",
        useCase: "UNDERSTAND_CODE",
        reason: "Long notebooks and inherited analysis scripts are exactly the large-context case.",
      },
      {
        toolSlug: "gemini",
        useCase: "RESEARCH",
        reason: "Multimodal input means you can show it the chart rather than describe it.",
      },
      {
        toolSlug: "google-gemini-api",
        useCase: "ANALYSE_DATA",
        reason: "Long documents and structured extraction, when the analysis has to be programmatic.",
      },
    ],
  },
  {
    careerSlug: "data-analyst",
    tools: [
      {
        toolSlug: "chatgpt",
        useCase: "ANALYSE_DATA",
        reason:
          "Explains statistical approaches and drafts queries; you verify both against the actual data.",
      },
      {
        toolSlug: "notebooklm",
        useCase: "LEARN",
        reason: "Studying documentation for a data platform, answered only from that documentation.",
      },
      {
        toolSlug: "gemini",
        useCase: "RESEARCH",
        reason: "Show it a chart and ask what it shows — a genuinely different way to ask.",
      },
      {
        toolSlug: "claude",
        useCase: "UNDERSTAND_CODE",
        reason: "For the 400-line SQL query somebody left behind.",
      },
    ],
  },
  {
    careerSlug: "data-engineer",
    tools: [
      {
        toolSlug: "cursor",
        useCase: "WRITE_CODE",
        reason: "Pipeline code spans many files and configurations; project context is the point.",
      },
      {
        toolSlug: "n8n",
        useCase: "AUTOMATE",
        reason:
          "Makes triggers, actions and credentials concrete, which is the mental model behind every orchestrator.",
      },
      {
        toolSlug: "claude",
        useCase: "ARCHITECTURE",
        reason: "A critic for a pipeline design you propose, including the failure cases you missed.",
      },
      {
        toolSlug: "chatgpt",
        useCase: "DEBUG",
        reason: "Pipeline failures come with long logs; a first pass at causes is genuinely useful.",
      },
    ],
  },
  {
    careerSlug: "devops-engineer",
    tools: [
      {
        toolSlug: "chatgpt",
        useCase: "DEBUG",
        reason:
          "Infrastructure errors are verbose and unfamiliar; a list of causes to test beats reading alone.",
      },
      {
        toolSlug: "n8n",
        useCase: "AUTOMATE",
        reason: "Workflows, webhooks and error handling, with a human approval step where it matters.",
      },
      {
        toolSlug: "cursor",
        useCase: "WRITE_CODE",
        reason: "Infrastructure as code is code, and it is spread across a lot of files.",
      },
      {
        toolSlug: "perplexity",
        useCase: "RESEARCH",
        reason:
          "Cloud provider behaviour changes; the citation is what makes an answer about it trustworthy.",
      },
      {
        toolSlug: "claude",
        useCase: "ARCHITECTURE",
        reason: "Asking what fails is the right question for infrastructure, and it is good at it.",
      },
    ],
  },
  {
    careerSlug: "cloud-engineer",
    tools: [
      {
        toolSlug: "perplexity",
        useCase: "RESEARCH",
        reason: "Provider documentation changes often enough that a cited answer is the only safe one.",
      },
      {
        toolSlug: "claude",
        useCase: "ARCHITECTURE",
        reason: "Propose the architecture, then ask what breaks when a region goes down.",
      },
      {
        toolSlug: "cursor",
        useCase: "WRITE_CODE",
        reason: "Templates, modules and configuration across a repository.",
      },
      {
        toolSlug: "chatgpt",
        useCase: "LEARN",
        reason: "Cloud services are a vocabulary problem before they are an engineering problem.",
      },
    ],
  },
  {
    careerSlug: "cybersecurity-engineer",
    tools: [
      {
        toolSlug: "claude",
        useCase: "UNDERSTAND_CODE",
        reason: "Reading unfamiliar code carefully is most of defensive security work.",
      },
      {
        toolSlug: "perplexity",
        useCase: "RESEARCH",
        reason:
          "Advisories and vulnerability details must come from the primary source, and this gets you there.",
      },
      {
        toolSlug: "model-context-protocol",
        useCase: "BUILD_WITH_AI",
        reason:
          "Understanding what an AI tool is connected to is understanding what it can be made to do.",
      },
      {
        toolSlug: "chatgpt",
        useCase: "LEARN",
        reason: "For learning the concept behind a class of vulnerability before meeting one.",
      },
    ],
  },
  {
    careerSlug: "mobile-app-developer",
    tools: [
      {
        toolSlug: "cursor",
        useCase: "WRITE_CODE",
        reason: "Mobile features touch views, state, navigation and platform code together.",
      },
      {
        toolSlug: "github-copilot",
        useCase: "WRITE_CODE",
        reason: "Platform APIs are wide and hard to recall precisely; suggestions help there.",
      },
      {
        toolSlug: "claude",
        useCase: "UNDERSTAND_CODE",
        reason: "For the platform code that came with the template and nobody has read.",
      },
      {
        toolSlug: "chatgpt",
        useCase: "LEARN",
        reason: "Two platforms, two sets of conventions, permanent learning.",
      },
    ],
  },
  {
    careerSlug: "game-developer",
    tools: [
      {
        toolSlug: "chatgpt",
        useCase: "LEARN",
        reason: "Game development is maths and systems you can ask to have explained.",
      },
      {
        toolSlug: "cursor",
        useCase: "WRITE_CODE",
        reason: "Gameplay code is interconnected; project-wide context matters.",
      },
      {
        toolSlug: "claude",
        useCase: "UNDERSTAND_CODE",
        reason: "Engine internals and other people's systems code.",
      },
      {
        toolSlug: "github-copilot",
        useCase: "WRITE_CODE",
        reason: "Engine APIs are large and repetitive at the call site.",
      },
    ],
  },
  {
    careerSlug: "qa-test-engineer",
    tools: [
      {
        toolSlug: "github-copilot",
        useCase: "TEST",
        reason: "Scaffolds tests quickly, leaving you the assertions — which is the actual work.",
      },
      {
        toolSlug: "claude",
        useCase: "TEST",
        reason:
          "Genuinely good at listing edge cases you have not covered, which is the hardest part of testing.",
      },
      {
        toolSlug: "cursor",
        useCase: "TEST",
        reason: "Writes and runs tests against the project rather than a pasted snippet.",
      },
      {
        toolSlug: "chatgpt",
        useCase: "DEBUG",
        reason: "Turning a flaky failure into a set of hypotheses to test.",
      },
    ],
  },
  {
    careerSlug: "ui-ux-designer",
    tools: [
      {
        toolSlug: "v0",
        useCase: "DESIGN_UI",
        reason: "Takes a design idea to something interactive, which is a different conversation.",
      },
      {
        toolSlug: "bolt",
        useCase: "BUILD_APP",
        reason: "Prototypes in the browser fast enough to test an idea the same afternoon.",
      },
      {
        toolSlug: "gemini",
        useCase: "RESEARCH",
        reason: "Multimodal input means you can show it the interface rather than describe it.",
      },
      {
        toolSlug: "chatgpt",
        useCase: "LEARN",
        reason: "For understanding what is expensive to build, before proposing it.",
      },
    ],
  },
  {
    careerSlug: "database-engineer",
    tools: [
      {
        toolSlug: "claude",
        useCase: "UNDERSTAND_CODE",
        reason: "Long queries and inherited schemas are the large-context case.",
      },
      {
        toolSlug: "perplexity",
        useCase: "RESEARCH",
        reason:
          "Database guarantees are version-specific and the primary source is the only acceptable answer.",
      },
      {
        toolSlug: "cursor",
        useCase: "REFACTOR",
        reason: "Migrations and query changes across a codebase, with tests as the safety net.",
      },
      {
        toolSlug: "chatgpt",
        useCase: "LEARN",
        reason: "Query planning and indexing are concepts worth having explained several ways.",
      },
    ],
  },
  {
    careerSlug: "embedded-systems-engineer",
    tools: [
      {
        toolSlug: "claude",
        useCase: "UNDERSTAND_CODE",
        reason: "Datasheets, register maps and legacy C are exactly the long-context case.",
      },
      {
        toolSlug: "notebooklm",
        useCase: "RESEARCH",
        reason:
          "Upload the datasheet and question it — grounded answers, from the document that is authoritative.",
      },
      {
        toolSlug: "chatgpt",
        useCase: "DEBUG",
        reason: "Hypotheses for a fault you then confirm on real hardware, which is the only judge.",
      },
      {
        toolSlug: "github-copilot",
        useCase: "WRITE_CODE",
        reason: "Boilerplate around peripherals and interrupts, reviewed carefully.",
      },
    ],
  },
  {
    careerSlug: "solutions-architect",
    tools: [
      {
        toolSlug: "claude",
        useCase: "ARCHITECTURE",
        reason: "Propose the design yourself, then ask what fails. That is the job in one sentence.",
      },
      {
        toolSlug: "perplexity",
        useCase: "RESEARCH",
        reason: "Vendor claims need primary sources before they reach a recommendation.",
      },
      {
        toolSlug: "chatgpt",
        useCase: "DOCUMENT",
        reason: "Architecture documents and decision records, drafted then corrected.",
      },
      {
        toolSlug: "notebooklm",
        useCase: "RESEARCH",
        reason: "Question a pile of vendor documentation without it inventing the answer.",
      },
      {
        toolSlug: "model-context-protocol",
        useCase: "BUILD_WITH_AI",
        reason: "How AI systems integrate with real infrastructure is now an architectural concern.",
      },
    ],
  },
  {
    careerSlug: "blockchain-developer",
    tools: [
      {
        toolSlug: "claude",
        useCase: "UNDERSTAND_CODE",
        reason: "Reading contracts carefully, where a missed detail is not recoverable.",
      },
      {
        toolSlug: "cursor",
        useCase: "WRITE_CODE",
        reason: "Contracts, tests and deployment scripts move together.",
      },
      {
        toolSlug: "perplexity",
        useCase: "RESEARCH",
        reason: "Standards and tooling change fast; the citation is the answer.",
      },
      {
        toolSlug: "chatgpt",
        useCase: "LEARN",
        reason: "The concepts are unusual enough to be worth explaining several ways.",
      },
    ],
  },
];
