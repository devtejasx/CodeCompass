import {
  BarChart3,
  Blocks,
  Bot,
  BrainCircuit,
  Cloud,
  Gamepad2,
  Layers,
  LineChart,
  Server,
  ShieldCheck,
  Smartphone,
  Workflow,
} from "lucide-react";

import type { CareerPathCard } from "@/types";

/**
 * Phase 1: informational cards only. No routes, no detail pages, no data
 * fetching. `slug` is here so each card becomes /careers/[slug] later without
 * touching this file's shape.
 */
export const CAREER_PATHS: CareerPathCard[] = [
  {
    slug: "frontend-developer",
    name: "Frontend Developer",
    description:
      "Build the screens people use — layout, interaction, and the feel of a product.",
    icon: Blocks,
    difficulty: "Beginner",
    accent: "indigo",
  },
  {
    slug: "backend-developer",
    name: "Backend Developer",
    description: "Write the APIs, databases and logic that everything else depends on.",
    icon: Server,
    difficulty: "Intermediate",
    accent: "violet",
  },
  {
    slug: "full-stack-developer",
    name: "Full Stack Developer",
    description:
      "Carry a feature the whole way, from the database schema to the final pixel.",
    icon: Layers,
    difficulty: "Intermediate",
    accent: "cyan",
  },
  {
    slug: "ai-engineer",
    name: "AI Engineer",
    description:
      "Build products on top of language models and reason about their limits.",
    icon: Bot,
    difficulty: "Advanced",
    accent: "indigo",
  },
  {
    slug: "machine-learning-engineer",
    name: "Machine Learning Engineer",
    description: "Train, evaluate and ship models that learn patterns from real data.",
    icon: BrainCircuit,
    difficulty: "Advanced",
    accent: "violet",
  },
  {
    slug: "data-scientist",
    name: "Data Scientist",
    description:
      "Use statistics and experiments to answer questions the business can act on.",
    icon: LineChart,
    difficulty: "Advanced",
    accent: "cyan",
  },
  {
    slug: "data-analyst",
    name: "Data Analyst",
    description: "Turn raw numbers into clear reports, dashboards and decisions.",
    icon: BarChart3,
    difficulty: "Beginner",
    accent: "indigo",
  },
  {
    slug: "devops-engineer",
    name: "DevOps Engineer",
    description:
      "Automate the path from a commit on your laptop to production traffic.",
    icon: Workflow,
    difficulty: "Advanced",
    accent: "violet",
  },
  {
    slug: "cloud-engineer",
    name: "Cloud Engineer",
    description:
      "Design infrastructure that stays reliable as it scales, and costs what it should.",
    icon: Cloud,
    difficulty: "Intermediate",
    accent: "cyan",
  },
  {
    slug: "cybersecurity-engineer",
    name: "Cybersecurity Engineer",
    description:
      "Learn how systems break, then build the defences that keep them standing.",
    icon: ShieldCheck,
    difficulty: "Advanced",
    accent: "indigo",
  },
  {
    slug: "mobile-developer",
    name: "Mobile Developer",
    description: "Ship apps that feel native on the device in someone's hand.",
    icon: Smartphone,
    difficulty: "Beginner",
    accent: "violet",
  },
  {
    slug: "game-developer",
    name: "Game Developer",
    description: "Bring worlds to life with engines, physics, rendering and game feel.",
    icon: Gamepad2,
    difficulty: "Intermediate",
    accent: "cyan",
  },
];
