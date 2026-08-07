import {
  Braces,
  Compass,
  Cpu,
  FolderGit2,
  GitBranch,
  Layers,
  Rocket,
  Sparkles,
  Trophy,
} from "lucide-react";

import type { JourneyStep } from "@/types";

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    step: 1,
    title: "Career Selection",
    description:
      "Answer a short set of questions about your interests, strengths and goals. We match you to the field where you'll actually enjoy the work.",
    icon: Compass,
    badge: "Week 1",
  },
  {
    step: 2,
    title: "Computer Fundamentals",
    description:
      "How computers, memory, networks and the internet really work — the mental model everything else hangs from.",
    icon: Cpu,
    badge: "Weeks 1–3",
  },
  {
    step: 3,
    title: "Programming Language",
    description:
      "One language, learned properly. Syntax, logic, data structures and the habit of reading code before writing it.",
    icon: Braces,
    badge: "Months 1–3",
  },
  {
    step: 4,
    title: "Git & GitHub",
    description:
      "Version control from your first commit to your first pull request review — the skill every job posting quietly assumes.",
    icon: GitBranch,
    badge: "Month 3",
  },
  {
    step: 5,
    title: "Frameworks",
    description:
      "The tools your field runs on, introduced only once the fundamentals underneath them make sense.",
    icon: Layers,
    badge: "Months 4–6",
  },
  {
    step: 6,
    title: "Projects",
    description:
      "Build real, scoped applications. Each one is chosen to stretch exactly the skill you just picked up.",
    icon: FolderGit2,
    badge: "Months 5–8",
  },
  {
    step: 7,
    title: "AI Developer Tools",
    description:
      "Copilot, Cursor, Claude, v0 and the rest — how professionals use them to move faster without losing understanding.",
    icon: Sparkles,
    badge: "Month 7",
  },
  {
    step: 8,
    title: "Advanced Topics",
    description:
      "System design, testing, performance, security and deployment. The difference between writing code and shipping software.",
    icon: Rocket,
    badge: "Months 8–11",
  },
  {
    step: 9,
    title: "Become a Techie",
    description:
      "A portfolio, a workflow, a network and the confidence to interview. You stop asking what to learn next and start choosing.",
    icon: Trophy,
    badge: "Year 1",
  },
];
