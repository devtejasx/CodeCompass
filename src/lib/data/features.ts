import {
  Compass,
  GitBranch,
  Gauge,
  LayoutDashboard,
  Lightbulb,
  Map,
  Rocket,
  Route,
  Sparkles,
  Terminal,
  UserRoundCog,
} from "lucide-react";

import type { Feature } from "@/types";

/** The three-pillar story: choose → follow → become. */
export const PILLARS: Feature[] = [
  {
    title: "Choose Your Career",
    description:
      "Discover software careers like Frontend, Backend, Full Stack, AI, Data Science, DevOps, Cybersecurity and more — with an honest look at what each day actually involves.",
    icon: Compass,
    accent: "indigo",
  },
  {
    title: "Follow Your Roadmap",
    description:
      "Receive a structured learning path with every topic in the correct order, so you never lose an evening deciding what to open next.",
    icon: Route,
    accent: "violet",
  },
  {
    title: "Become a Techie",
    description:
      "Master Git, GitHub, AI tools, coding practice, projects, and the modern development workflows real teams use every day.",
    icon: Rocket,
    accent: "cyan",
  },
];

export const FEATURES: Feature[] = [
  {
    title: "Interactive Roadmaps",
    description:
      "Click through a living map of your field. Every node knows its prerequisites.",
    icon: Map,
    accent: "indigo",
  },
  {
    title: "Coding Practice",
    description:
      "1000+ problems ordered by concept, not difficulty roulette.",
    icon: Terminal,
    accent: "violet",
  },
  {
    title: "Git & GitHub Learning",
    description:
      "Branches, pull requests and code review taught the way teams use them.",
    icon: GitBranch,
    accent: "cyan",
  },
  {
    title: "AI Tool Academy",
    description:
      "Learn Copilot, Cursor, Claude and friends as instruments, not shortcuts.",
    icon: Sparkles,
    accent: "emerald",
  },
  {
    title: "Project Recommendations",
    description:
      "Portfolio-worthy builds matched to exactly what you just learned.",
    icon: Lightbulb,
    accent: "amber",
  },
  {
    title: "Progress Tracking",
    description:
      "Streaks, XP and completion signals that show momentum you can feel.",
    icon: Gauge,
    accent: "rose",
  },
  {
    title: "Personalized Learning",
    description:
      "Your pace, your background, your goal — the path adapts to all three.",
    icon: UserRoundCog,
    accent: "indigo",
  },
  {
    title: "Beautiful UI",
    description:
      "A calm, focused workspace that makes studying feel like using a product.",
    icon: LayoutDashboard,
    accent: "cyan",
  },
];
