import type { LucideIcon } from "lucide-react";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

/** Brand accent used to tint an individual card's glow, icon and border. */
export type Accent = "indigo" | "violet" | "cyan" | "emerald" | "amber" | "rose";

export interface NavItem {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: NavItem[];
}

export interface Stat {
  value: string;
  label: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: Accent;
}

export interface CareerPath {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  difficulty: Difficulty;
  duration: string;
  accent: Accent;
  stack: string[];
}

export interface JourneyStep {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
  badge: string;
}

export interface AiTool {
  name: string;
  category: string;
  description: string;
  /** Two-stop gradient used for the tool's generated monogram tile. */
  gradient: [string, string];
  mark: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  accent: Accent;
}

export interface Faq {
  question: string;
  answer: string;
}
