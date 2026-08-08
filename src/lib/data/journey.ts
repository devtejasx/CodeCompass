import {
  Braces,
  Compass,
  FolderGit2,
  GitBranch,
  Layers,
  Lightbulb,
  Rocket,
  Trophy,
} from "lucide-react";

import type { BeginnerQuestion, JourneyNode, WorkStep } from "@/types";

/** The doubts that stall people before they write a line of code. */
export const BEGINNER_QUESTIONS: BeginnerQuestion[] = [
  { text: "Should I learn Python or JavaScript?" },
  { text: "Frontend or Backend?" },
  { text: "What should I learn first?" },
  { text: "Which tools actually matter?" },
  { text: "Am I learning things in the right order?" },
];

export const WORK_STEPS: WorkStep[] = [
  {
    number: "01",
    title: "Choose Your Path",
    description: "Explore technology careers and understand what each field involves.",
    icon: Compass,
  },
  {
    number: "02",
    title: "Follow Your Journey",
    description: "Get a structured path showing what to learn and what comes next.",
    icon: Rocket,
  },
  {
    number: "03",
    title: "Keep Moving Forward",
    description:
      "Learn, practice, build, and progress through your technology journey.",
    icon: Trophy,
  },
];

export const JOURNEY_NODES: JourneyNode[] = [
  {
    title: "Choose Your Career",
    description: "Pick the field that fits how you like to work.",
    icon: Compass,
  },
  {
    title: "Fundamentals",
    description: "How computers, networks and the internet actually work.",
    icon: Lightbulb,
  },
  {
    title: "Programming Language",
    description: "One language, learned properly rather than three, half-learned.",
    icon: Braces,
  },
  {
    title: "Git & GitHub",
    description: "Version control, branches and pull requests.",
    icon: GitBranch,
  },
  {
    title: "Frameworks & Tools",
    description: "The stack your field runs on, once the basics hold.",
    icon: Layers,
  },
  {
    title: "Projects",
    description: "Build real things that prove what you know.",
    icon: FolderGit2,
  },
  {
    title: "Advanced Concepts",
    description: "Testing, architecture, performance and deployment.",
    icon: Rocket,
  },
  {
    title: "Become a Techie",
    description: "A portfolio, a workflow, and the confidence to interview.",
    icon: Trophy,
  },
];
