import type { FooterColumn, NavItem, Stat } from "@/types";

export const SITE = {
  name: "CodeCompass",
  tagline: "Navigate Your Journey Into Tech.",
  promise: "Never let a beginner wonder what to learn next.",
  description:
    "CodeCompass helps beginners discover the right tech career, learn in the correct order, master modern developer tools, and become confident tech professionals.",
} as const;

export const NAV_ITEMS: NavItem[] = [
  { label: "Why CodeCompass", href: "#why" },
  { label: "Career Paths", href: "#careers" },
  { label: "Roadmap", href: "#journey" },
  { label: "AI Tools", href: "#ai-tools" },
  { label: "FAQ", href: "#faq" },
];

export const STATS: Stat[] = [
  { value: "50+", label: "Career Paths" },
  { value: "1000+", label: "Learning Resources" },
  { value: "100+", label: "AI Tools Explained" },
  { value: "1000+", label: "Coding Problems" },
  { value: "∞", label: "Interactive Roadmaps" },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Career Paths", href: "#careers" },
      { label: "Learning Roadmap", href: "#journey" },
      { label: "AI Tool Academy", href: "#ai-tools" },
      { label: "Dashboard", href: "#dashboard" },
      { label: "Features", href: "#features" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Start From Zero", href: "#why" },
      { label: "Git & GitHub", href: "#features" },
      { label: "Coding Practice", href: "#features" },
      { label: "Project Ideas", href: "#features" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
];
