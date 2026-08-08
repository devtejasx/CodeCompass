import { Code2, FolderGit2, Sparkles, Terminal, Target, Wrench } from "lucide-react";

import type { AiToolPreview, LearningArea } from "@/types";

export const LEARNING_AREAS: LearningArea[] = [
  {
    title: "Programming",
    description:
      "Learn programming fundamentals and the language relevant to your chosen path.",
    icon: Code2,
    accent: "indigo",
  },
  {
    title: "Developer Tools",
    description:
      "Understand Git, GitHub, terminals, editors, package managers, and modern workflows.",
    icon: Wrench,
    accent: "violet",
  },
  {
    title: "AI Tools",
    description: "Learn how modern developers use AI tools effectively.",
    icon: Sparkles,
    accent: "cyan",
  },
  {
    title: "Projects",
    description: "Turn knowledge into practical projects.",
    icon: FolderGit2,
    accent: "indigo",
  },
  {
    title: "Practice",
    description: "Strengthen your understanding through coding practice.",
    icon: Terminal,
    accent: "violet",
  },
  {
    title: "Modern Development",
    description: "Understand how real-world software is built.",
    icon: Target,
    accent: "cyan",
  },
];

/**
 * Phase 1 is a visual preview only — no AI integration, no linking out.
 * `tint` drives a generated monogram tile so no logo files are shipped.
 */
export const AI_TOOLS: AiToolPreview[] = [
  { name: "ChatGPT", category: "Assistant", mark: "GP", tint: "#10A37F" },
  { name: "Claude", category: "Assistant", mark: "CL", tint: "#D97757" },
  { name: "Gemini", category: "Assistant", mark: "GM", tint: "#4285F4" },
  { name: "Cursor", category: "AI editor", mark: "CU", tint: "#818CF8" },
  { name: "GitHub Copilot", category: "In-editor", mark: "CP", tint: "#8B949E" },
  { name: "Windsurf", category: "AI editor", mark: "WS", tint: "#0FBFA0" },
  { name: "Perplexity", category: "Research", mark: "PX", tint: "#22B8CF" },
  { name: "v0", category: "UI generation", mark: "V0", tint: "#A1A1AA" },
  { name: "Lovable", category: "App builder", mark: "LV", tint: "#F472B6" },
  { name: "Bolt", category: "App builder", mark: "BO", tint: "#3B82F6" },
];
