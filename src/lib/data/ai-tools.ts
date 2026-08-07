import type { AiTool } from "@/types";

/**
 * Tool marks are generated from CSS gradients + a monogram — the site ships
 * zero external images, so no third-party logo files are used.
 */
export const AI_TOOLS: AiTool[] = [
  {
    name: "ChatGPT",
    category: "Assistant",
    description: "Explain concepts, debug errors and rubber-duck at 2am.",
    gradient: ["#10A37F", "#0B7A5E"],
    mark: "GP",
  },
  {
    name: "Claude",
    category: "Assistant",
    description: "Long-context reasoning for reading and refactoring real codebases.",
    gradient: ["#D97757", "#B4552F"],
    mark: "CL",
  },
  {
    name: "Gemini",
    category: "Assistant",
    description: "Multimodal help across docs, screenshots and diagrams.",
    gradient: ["#4285F4", "#9B72CB"],
    mark: "GM",
  },
  {
    name: "GitHub Copilot",
    category: "In-editor",
    description: "Inline completions and chat that live inside your editor.",
    gradient: ["#6E7681", "#24292F"],
    mark: "CP",
  },
  {
    name: "Cursor",
    category: "AI IDE",
    description: "An editor built around multi-file edits and codebase context.",
    gradient: ["#5B6CFF", "#1E1E2E"],
    mark: "CU",
  },
  {
    name: "Windsurf",
    category: "AI IDE",
    description: "Agentic flows that carry a task across files without hand-holding.",
    gradient: ["#0FBFA0", "#0A7C82"],
    mark: "WS",
  },
  {
    name: "Perplexity",
    category: "Research",
    description: "Cited answers for the questions docs never quite cover.",
    gradient: ["#22B8CF", "#1A6E7E"],
    mark: "PX",
  },
  {
    name: "Bolt.new",
    category: "App builder",
    description: "Spin a full-stack prototype into existence from one prompt.",
    gradient: ["#3B82F6", "#1E3A8A"],
    mark: "BO",
  },
  {
    name: "Lovable",
    category: "App builder",
    description: "Describe a product, get a working app you can keep editing.",
    gradient: ["#F472B6", "#9333EA"],
    mark: "LV",
  },
  {
    name: "v0",
    category: "UI generation",
    description: "Generate production-ready React and Tailwind interfaces.",
    gradient: ["#FFFFFF", "#71717A"],
    mark: "V0",
  },
];
