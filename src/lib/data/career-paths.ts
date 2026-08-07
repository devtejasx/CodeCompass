import {
  Blocks,
  Bot,
  Boxes,
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

import type { CareerPath } from "@/types";

export const CAREER_PATHS: CareerPath[] = [
  {
    slug: "frontend",
    title: "Frontend",
    description:
      "Build the interfaces people actually touch — layout, interaction and design systems.",
    icon: Blocks,
    difficulty: "Beginner",
    duration: "5–7 months",
    accent: "indigo",
    stack: ["HTML", "CSS", "JavaScript", "React"],
  },
  {
    slug: "backend",
    title: "Backend",
    description:
      "Design the APIs, databases and business logic that power every product.",
    icon: Server,
    difficulty: "Intermediate",
    duration: "6–8 months",
    accent: "violet",
    stack: ["Node.js", "SQL", "APIs", "Auth"],
  },
  {
    slug: "full-stack",
    title: "Full Stack",
    description:
      "Own a feature end to end, from the database schema to the final pixel.",
    icon: Layers,
    difficulty: "Intermediate",
    duration: "9–12 months",
    accent: "cyan",
    stack: ["React", "Node.js", "Postgres", "Deploy"],
  },
  {
    slug: "ai-engineer",
    title: "AI Engineer",
    description:
      "Ship products on top of LLMs — prompting, RAG, agents and evaluation.",
    icon: Bot,
    difficulty: "Advanced",
    duration: "8–12 months",
    accent: "emerald",
    stack: ["Python", "LLM APIs", "RAG", "Agents"],
  },
  {
    slug: "machine-learning",
    title: "Machine Learning",
    description:
      "Train, tune and deploy models that learn patterns from real-world data.",
    icon: BrainCircuit,
    difficulty: "Advanced",
    duration: "10–14 months",
    accent: "violet",
    stack: ["Python", "NumPy", "PyTorch", "MLOps"],
  },
  {
    slug: "data-science",
    title: "Data Scientist",
    description:
      "Turn messy data into decisions with statistics, analysis and storytelling.",
    icon: LineChart,
    difficulty: "Intermediate",
    duration: "7–10 months",
    accent: "cyan",
    stack: ["Python", "Pandas", "SQL", "Viz"],
  },
  {
    slug: "cybersecurity",
    title: "Cybersecurity",
    description:
      "Learn how systems break, then build the defences that keep them safe.",
    icon: ShieldCheck,
    difficulty: "Advanced",
    duration: "9–12 months",
    accent: "rose",
    stack: ["Networking", "Linux", "AppSec", "Forensics"],
  },
  {
    slug: "cloud",
    title: "Cloud",
    description:
      "Architect scalable infrastructure on AWS, Azure or GCP without guesswork.",
    icon: Cloud,
    difficulty: "Intermediate",
    duration: "6–9 months",
    accent: "indigo",
    stack: ["Linux", "AWS", "Terraform", "Networking"],
  },
  {
    slug: "devops",
    title: "DevOps",
    description:
      "Automate the path from a commit on your laptop to production traffic.",
    icon: Workflow,
    difficulty: "Advanced",
    duration: "8–11 months",
    accent: "amber",
    stack: ["Docker", "K8s", "CI/CD", "Observability"],
  },
  {
    slug: "mobile",
    title: "Mobile",
    description:
      "Ship native-feeling apps to the App Store and Play Store with confidence.",
    icon: Smartphone,
    difficulty: "Beginner",
    duration: "5–8 months",
    accent: "emerald",
    stack: ["React Native", "Swift", "Kotlin", "Expo"],
  },
  {
    slug: "blockchain",
    title: "Blockchain",
    description:
      "Write smart contracts and reason about trustless, on-chain systems.",
    icon: Boxes,
    difficulty: "Advanced",
    duration: "7–10 months",
    accent: "amber",
    stack: ["Solidity", "EVM", "Web3.js", "Security"],
  },
  {
    slug: "game-development",
    title: "Game Development",
    description:
      "Bring worlds to life with engines, physics, rendering and game feel.",
    icon: Gamepad2,
    difficulty: "Intermediate",
    duration: "8–12 months",
    accent: "rose",
    stack: ["C#", "Unity", "Godot", "3D Math"],
  },
];
