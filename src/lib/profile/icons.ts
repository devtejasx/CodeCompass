import {
  Accessibility,
  Binary,
  Braces,
  Code2,
  Component,
  Database,
  FileType,
  FlaskConical,
  Github,
  Globe,
  Hammer,
  Layout,
  type LucideIcon,
  MousePointerClick,
  Network,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  GitBranch,
} from "lucide-react";

import type { CapabilityCategory } from "@/generated/prisma/client";

/**
 * A database row can't carry a React component, so capabilities store an icon
 * *name* and it is resolved here. An unknown name falls back rather than
 * crashing or rendering an empty box.
 */
const CAPABILITY_ICONS: Record<string, LucideIcon> = {
  Accessibility,
  Binary,
  Braces,
  Code2,
  Component,
  Database,
  FileType,
  FlaskConical,
  GitBranch,
  Github,
  Globe,
  Hammer,
  Layout,
  MousePointerClick,
  Network,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
};

export function capabilityIcon(name: string): LucideIcon {
  return CAPABILITY_ICONS[name] ?? Code2;
}

/** Display strings for the category enum — never hardcoded in components. */
export const CATEGORY_LABEL: Record<CapabilityCategory, string> = {
  PROGRAMMING: "Programming",
  WEB_DEVELOPMENT: "Web development",
  FRAMEWORKS: "Frameworks",
  DATA: "Data & backend",
  DEVELOPER_TOOLS: "Developer tools",
  VERSION_CONTROL: "Git & GitHub",
  AI_SKILLS: "AI skills",
  PROJECT_DELIVERY: "Building & shipping",
};
