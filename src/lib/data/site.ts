import { Github, Linkedin, Twitter } from "lucide-react";

import type { FooterGroup, NavLink, SocialLink } from "@/types";

export const SITE = {
  name: "CodeCompass",
  tagline: "Navigate Your Journey Into Tech.",
  principle: "Never wonder what to learn next.",
  description:
    "CodeCompass helps you discover technology careers, understand what to learn, and navigate your journey into tech.",
  footerBlurb: "Guiding the next generation of tech professionals.",
} as const;

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "#top" },
  { label: "Explore Careers", href: "#careers" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
];

export const FOOTER_GROUPS: FooterGroup[] = [
  {
    title: "Product",
    links: [
      { label: "Explore", href: "#careers" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Careers", href: "#careers" },
      { label: "About", href: "#about" },
    ],
  },
  {
    title: "Journey",
    links: [
      { label: "Roadmap", href: "#journey" },
      { label: "What You'll Learn", href: "#learn" },
      { label: "AI Tools", href: "#ai-tools" },
      { label: "Dashboard", href: "#dashboard" },
    ],
  },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "GitHub", href: "#", icon: Github },
  { label: "LinkedIn", href: "#", icon: Linkedin },
  { label: "X", href: "#", icon: Twitter },
];
