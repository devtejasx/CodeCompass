import type { SeedAICategory } from "./types";

/**
 * The taxonomy.
 *
 * Nine categories, each of which has tools in it. Empty categories are worse
 * than missing ones: a filter that returns nothing teaches a learner that the
 * catalog is broken. The order here is the order the explorer shows them in —
 * broadest and most familiar first, infrastructure last.
 *
 * The distinction that does the most work is assistant → coding assistant →
 * coding agent. It is the thing beginners most often collapse into "AI", and
 * separating them is most of the reason this taxonomy exists at all.
 */
export const AI_CATEGORIES: SeedAICategory[] = [
  {
    slug: "ai-assistants",
    name: "AI Assistants",
    description:
      "General-purpose conversational tools. You describe a problem in ordinary language and get an answer back. They know nothing about your codebase unless you tell them.",
    icon: "MessageSquare",
  },
  {
    slug: "ai-coding-assistants",
    name: "AI Coding Assistants",
    description:
      "Tools that work where you write code. They can see the file you are in, and often the wider project, so their suggestions are grounded in what you are actually building.",
    icon: "Code2",
  },
  {
    slug: "ai-coding-agents",
    name: "AI Coding Agents",
    description:
      "Tools that plan a task, edit files and run commands across several steps rather than answering one question. The step that matters is the one where you review what they did.",
    icon: "Bot",
  },
  {
    slug: "ai-search-research",
    name: "AI Search & Research",
    description:
      "Tools that search the web and summarise what they find, with links back to the sources. The summary is a starting point; the sources are the answer.",
    icon: "Search",
  },
  {
    slug: "ai-app-builders",
    name: "AI App Builders",
    description:
      "Tools that generate a working application from a description. Fast for a first version — and the code they produce is code you have to be able to read.",
    icon: "LayoutTemplate",
  },
  {
    slug: "ai-automation",
    name: "AI Automation",
    description:
      "Platforms for wiring services together into workflows that run on a trigger, with AI as one step among many rather than the whole thing.",
    icon: "Workflow",
  },
  {
    slug: "ai-knowledge-learning",
    name: "AI Knowledge & Learning",
    description:
      "Tools that answer questions only from sources you supply, which makes them useful for studying material you already trust.",
    icon: "BookOpen",
  },
  {
    slug: "ai-platforms",
    name: "AI APIs & Platforms",
    description:
      "The model APIs you call from your own code. This is where AI stops being a tool you use and becomes a component you are responsible for.",
    icon: "Cpu",
  },
  {
    slug: "ai-developer-infrastructure",
    name: "AI Developer Infrastructure",
    description:
      "The plumbing underneath: standards and services that connect AI applications to real data and real tools.",
    icon: "Plug",
  },
];
