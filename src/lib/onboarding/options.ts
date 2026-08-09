import {
  Blocks,
  Bot,
  BrainCircuit,
  Clock3,
  Cloud,
  Compass,
  Gamepad2,
  HelpCircle,
  Hourglass,
  Layers,
  LineChart,
  type LucideIcon,
  Rocket,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Timer,
  TrendingUp,
  Workflow,
  Wrench,
} from "lucide-react";

import {
  CareerInterest,
  DailyLearningTime,
  ExperienceLevel,
  ProgrammingLanguage,
} from "@/generated/prisma/client";

export interface Option<T extends string> {
  value: T;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const EXPERIENCE_OPTIONS: Option<ExperienceLevel>[] = [
  {
    value: ExperienceLevel.NEW_TO_TECH,
    title: "Completely new to tech",
    description: "You haven't written code before, and that's a fine place to begin.",
    icon: Compass,
  },
  {
    value: ExperienceLevel.STARTED_LEARNING,
    title: "I've started learning",
    description: "You've tried a tutorial or two but the path still feels unclear.",
    icon: Sparkles,
  },
  {
    value: ExperienceLevel.KNOWS_FUNDAMENTALS,
    title: "I know the fundamentals",
    description: "Variables, loops and functions make sense to you.",
    icon: Wrench,
  },
  {
    value: ExperienceLevel.BUILDING_PROJECTS,
    title: "I'm already building projects",
    description: "You can put something together and want to go deeper.",
    icon: Rocket,
  },
];

export const CAREER_OPTIONS: Option<CareerInterest>[] = [
  {
    value: CareerInterest.FRONTEND,
    title: "Frontend Development",
    description: "The screens people actually use.",
    icon: Blocks,
  },
  {
    value: CareerInterest.BACKEND,
    title: "Backend Development",
    description: "APIs, databases and business logic.",
    icon: Server,
  },
  {
    value: CareerInterest.FULL_STACK,
    title: "Full Stack Development",
    description: "A bit of everything, end to end.",
    icon: Layers,
  },
  {
    value: CareerInterest.AI_ENGINEERING,
    title: "AI Engineering",
    description: "Building products on top of models.",
    icon: Bot,
  },
  {
    value: CareerInterest.MACHINE_LEARNING,
    title: "Machine Learning",
    description: "Training models that learn from data.",
    icon: BrainCircuit,
  },
  {
    value: CareerInterest.DATA_SCIENCE,
    title: "Data Science",
    description: "Statistics, experiments and insight.",
    icon: LineChart,
  },
  {
    value: CareerInterest.DATA_ANALYTICS,
    title: "Data Analytics",
    description: "Turning numbers into decisions.",
    icon: TrendingUp,
  },
  {
    value: CareerInterest.CYBERSECURITY,
    title: "Cybersecurity",
    description: "Breaking and defending systems.",
    icon: ShieldCheck,
  },
  {
    value: CareerInterest.DEVOPS,
    title: "DevOps",
    description: "From commit to production, automatically.",
    icon: Workflow,
  },
  {
    value: CareerInterest.CLOUD,
    title: "Cloud Engineering",
    description: "Infrastructure that scales.",
    icon: Cloud,
  },
  {
    value: CareerInterest.MOBILE,
    title: "Mobile Development",
    description: "Apps for the device in your pocket.",
    icon: Smartphone,
  },
  {
    value: CareerInterest.GAME_DEV,
    title: "Game Development",
    description: "Engines, physics and game feel.",
    icon: Gamepad2,
  },
  {
    value: CareerInterest.OTHER,
    title: "Something else",
    description: "Your interest isn't on this list.",
    icon: Sparkles,
  },
  {
    value: CareerInterest.NOT_SURE,
    title: "I'm not sure yet",
    description: "Perfectly normal. Helping you decide is the whole point.",
    icon: HelpCircle,
  },
];

export const TIME_OPTIONS: Option<DailyLearningTime>[] = [
  {
    value: DailyLearningTime.MINUTES_15_30,
    title: "15–30 minutes",
    description: "Small and steady still adds up.",
    icon: Timer,
  },
  {
    value: DailyLearningTime.MINUTES_30_60,
    title: "30–60 minutes",
    description: "Enough for a focused session most days.",
    icon: Clock3,
  },
  {
    value: DailyLearningTime.HOURS_1_2,
    title: "1–2 hours",
    description: "Room to learn something and practise it.",
    icon: Hourglass,
  },
  {
    value: DailyLearningTime.HOURS_2_4,
    title: "2–4 hours",
    description: "Serious daily momentum.",
    icon: Hourglass,
  },
  {
    value: DailyLearningTime.HOURS_4_PLUS,
    title: "4+ hours",
    description: "You're going all in.",
    icon: Rocket,
  },
];

const LANGUAGE_LABELS: Record<ProgrammingLanguage, string> = {
  JAVASCRIPT_TYPESCRIPT: "JavaScript / TypeScript",
  PYTHON: "Python",
  JAVA: "Java",
  CSHARP: "C#",
  GO: "Go",
  RUST: "Rust",
  SWIFT: "Swift",
  KOTLIN: "Kotlin",
  CPP: "C++",
  SOLIDITY: "Solidity",
  OTHER: "Something else",
  NOT_SURE: "I don't know yet",
};

/**
 * Which languages to *offer* for a given interest. This is presentation only —
 * Phase 2 records a preference and makes no recommendation. Real guidance is a
 * later phase.
 */
const LANGUAGES_BY_CAREER: Partial<Record<CareerInterest, ProgrammingLanguage[]>> = {
  FRONTEND: ["JAVASCRIPT_TYPESCRIPT"],
  BACKEND: ["PYTHON", "JAVA", "JAVASCRIPT_TYPESCRIPT", "CSHARP", "GO", "RUST"],
  FULL_STACK: ["JAVASCRIPT_TYPESCRIPT", "PYTHON", "JAVA", "CSHARP", "GO"],
  AI_ENGINEERING: ["PYTHON", "JAVASCRIPT_TYPESCRIPT"],
  MACHINE_LEARNING: ["PYTHON"],
  DATA_SCIENCE: ["PYTHON"],
  DATA_ANALYTICS: ["PYTHON"],
  CYBERSECURITY: ["PYTHON", "GO", "CPP"],
  DEVOPS: ["PYTHON", "GO", "RUST"],
  CLOUD: ["PYTHON", "GO", "JAVASCRIPT_TYPESCRIPT"],
  MOBILE: ["SWIFT", "KOTLIN", "JAVASCRIPT_TYPESCRIPT"],
  GAME_DEV: ["CSHARP", "CPP", "RUST"],
};

const ALL_LANGUAGES: ProgrammingLanguage[] = [
  "JAVASCRIPT_TYPESCRIPT",
  "PYTHON",
  "JAVA",
  "CSHARP",
  "GO",
  "RUST",
  "SWIFT",
  "KOTLIN",
  "CPP",
  "SOLIDITY",
];

/**
 * Every list ends with "Something else" and "I don't know yet" — not knowing is
 * always a valid answer here.
 */
export function languageOptionsFor(
  career: CareerInterest | null,
): Option<ProgrammingLanguage>[] {
  const base =
    (career && LANGUAGES_BY_CAREER[career]) ??
    ALL_LANGUAGES; /* Other / not sure / unset → show everything */

  const values: ProgrammingLanguage[] = [...base, "OTHER", "NOT_SURE"];

  return values.map((value) => ({
    value,
    title: LANGUAGE_LABELS[value],
    description:
      value === "NOT_SURE"
        ? "We'll help you choose when the time comes."
        : value === "OTHER"
          ? "You have something different in mind."
          : "",
    icon: value === "NOT_SURE" ? HelpCircle : Sparkles,
  }));
}

export const LANGUAGE_LABEL = LANGUAGE_LABELS;

/** Human-readable labels for the dashboard summary. */
export const EXPERIENCE_LABEL: Record<ExperienceLevel, string> = Object.fromEntries(
  EXPERIENCE_OPTIONS.map((o) => [o.value, o.title]),
) as Record<ExperienceLevel, string>;

export const CAREER_LABEL: Record<CareerInterest, string> = Object.fromEntries(
  CAREER_OPTIONS.map((o) => [o.value, o.title]),
) as Record<CareerInterest, string>;

export const TIME_LABEL: Record<DailyLearningTime, string> = Object.fromEntries(
  TIME_OPTIONS.map((o) => [o.value, o.title]),
) as Record<DailyLearningTime, string>;
