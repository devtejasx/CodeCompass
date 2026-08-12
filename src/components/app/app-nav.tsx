"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Code2,
  Compass,
  GitBranch,
  Hammer,
  LayoutDashboard,
  Menu,
  Route,
  Sparkles,
  UserRound,
  X,
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

/** Sub-routes count: /careers/frontend-developer still sits under "Explore Careers". */
function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Primary navigation for authenticated pages.
 *
 * Nine destinations do not fit on a phone, and they did not fit on a tablet
 * either — laid out in a single non-wrapping row they measured 1105px, which
 * pushed every authenticated page into horizontal scroll at 375px, 768px and
 * 1024px alike. Icon-only did not save it: nine icons plus the logo and the
 * account menu still overflow a 375px viewport.
 *
 * So there are two navigations, and only one is ever rendered to the user:
 * the full row from `xl` up, where all nine labels genuinely fit, and a
 * disclosure menu below it. Both are built from the same LINKS array, so they
 * cannot drift apart.
 *
 * Client-side because it needs the current path to mark the active link.
 */
export function AppNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <>
      <nav aria-label="Primary" className={cn("hidden xl:block", className)}>
        <ul className="flex items-center gap-1">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-200",
                    active
                      ? "bg-surface-raised text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <link.icon className="size-4 shrink-0" aria-hidden />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <MobileNav pathname={pathname} />
    </>
  );
}

/**
 * The compact navigation, below `xl`.
 *
 * A disclosure rather than a scrolling strip: a row you have to swipe hides
 * destinations behind a gesture with nothing to suggest they are there, which
 * for a product whose whole promise is "you always know what comes next" is the
 * wrong trade.
 */
function MobileNav({ pathname }: { pathname: string }) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close on navigation. Without this the panel stays open over the new page.
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = LINKS.find((link) => isActive(pathname, link.href));

  return (
    <div ref={containerRef} className="relative xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="primary-nav-menu"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-surface/60 px-2.5 py-1.5",
          "text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground",
        )}
      >
        {open ? (
          <X className="size-4 shrink-0" aria-hidden />
        ) : (
          <Menu className="size-4 shrink-0" aria-hidden />
        )}
        {/* Naming the current section means the bar still says where you are. */}
        <span className="hidden max-w-[9rem] truncate sm:block">
          {current?.label ?? "Menu"}
        </span>
      </button>

      {/*
        The open panel is a full-width sheet pinned under the header rather
        than a dropdown anchored to the button. A 16rem panel opening from a
        button that already sits ~140px in overflows a 375px viewport by
        exactly the amount this component exists to eliminate; spanning the
        viewport sidesteps the arithmetic entirely and reads better on a phone.
      */}
      {open ? (
        <nav
          id="primary-nav-menu"
          aria-label="Primary"
          className="fixed inset-x-0 top-16 z-50 border-b border-border bg-surface-raised shadow-lg"
        >
          <ul className="mx-auto flex max-w-3xl flex-col py-1">
            {LINKS.map((link) => {
              const active = isActive(pathname, link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-surface text-foreground"
                        : "text-muted-foreground hover:bg-surface hover:text-foreground",
                    )}
                  >
                    <link.icon className="size-4 shrink-0" aria-hidden />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
