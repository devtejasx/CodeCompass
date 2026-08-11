"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Code2,
  Compass,
  GitBranch,
  Hammer,
  LayoutDashboard,
  Route,
  Sparkles,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "My Roadmap", icon: Route },
  { href: "/practice", label: "Practice", icon: Code2 },
  { href: "/projects", label: "Projects", icon: Hammer },
  { href: "/academy/git", label: "Git & GitHub", icon: GitBranch },
  { href: "/academy/ai-tools", label: "AI Tools", icon: Sparkles },
  { href: "/mentor", label: "Mentor", icon: Bot },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/careers", label: "Explore Careers", icon: Compass },
];

/**
 * Primary navigation for authenticated pages.
 *
 * Client-side only because it needs the current path to mark the active link;
 * the labels and hrefs are static. Account actions live in the account menu
 * beside it, which is why they aren't repeated here.
 */
export function AppNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className={className}>
      <ul className="flex items-center gap-1">
        {LINKS.map((link) => {
          // Sub-routes count as active: /careers/frontend-developer still sits
          // under "Explore Careers".
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                // The visible label is hidden on narrow screens, so the name is
                // carried by aria-label instead — an sr-only duplicate would be
                // announced twice once the visible one reappears.
                aria-label={link.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-200",
                  active
                    ? "bg-surface-raised text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <link.icon className="size-4 shrink-0" aria-hidden />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
