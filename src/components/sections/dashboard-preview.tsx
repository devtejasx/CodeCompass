import {
  Bell,
  BookOpen,
  CheckCircle2,
  Circle,
  Compass,
  Flame,
  FolderGit2,
  GitBranch,
  LayoutDashboard,
  type LucideIcon,
  PlayCircle,
  Route,
  Search,
  Settings,
  Sparkles,
  Terminal,
  Trophy,
} from "lucide-react";

import { Section, SectionHeading } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { Glow } from "@/components/shared/backdrops";
import { LogoMark } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

interface SidebarLink {
  label: string;
  icon: LucideIcon;
  active?: boolean;
}

const SIDEBAR: SidebarLink[] = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "My Roadmap", icon: Route },
  { label: "Practice", icon: Terminal },
  { label: "Projects", icon: FolderGit2 },
  { label: "AI Tools", icon: Sparkles },
  { label: "Career Paths", icon: Compass },
];

const UPCOMING = [
  { label: "State & Data Fetching", meta: "6 lessons · 2h 10m" },
  { label: "Routing & Layouts", meta: "4 lessons · 1h 30m" },
  { label: "Forms & Validation", meta: "5 lessons · 1h 55m" },
];

const COMPLETED = [
  "JavaScript Fundamentals",
  "DOM & Events",
  "Async JavaScript",
  "Git Basics",
];

const ACTIVITY: { icon: LucideIcon; text: string; time: string; tone: string }[] = [
  {
    icon: CheckCircle2,
    text: "Completed “Async JavaScript”",
    time: "2h ago",
    tone: "text-emerald-400",
  },
  {
    icon: GitBranch,
    text: "Opened your first pull request",
    time: "Yesterday",
    tone: "text-indigo-300",
  },
  {
    icon: Trophy,
    text: "Earned badge · 20-day streak",
    time: "2 days ago",
    tone: "text-amber-300",
  },
  {
    icon: Terminal,
    text: "Solved 12 array problems",
    time: "3 days ago",
    tone: "text-cyan-300",
  },
];

const STAT_TILES = [
  { label: "Total XP", value: "4,820", sub: "+180 today", accent: "from-indigo-500 to-violet-500" },
  { label: "Topics done", value: "34", sub: "of 50", accent: "from-emerald-500 to-teal-500" },
  { label: "Streak", value: "21d", sub: "personal best", accent: "from-amber-400 to-orange-500" },
  { label: "Rank", value: "Top 8%", sub: "this month", accent: "from-cyan-400 to-sky-500" },
];

export function DashboardPreview() {
  return (
    <Section id="dashboard" className="relative overflow-hidden">
      <Glow className="left-1/2 top-24 -translate-x-1/2 opacity-50" color="indigo" size="lg" />

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          eyebrow="Learning Dashboard"
          title={
            <>
              Your whole journey,{" "}
              <span className="text-gradient-brand">on one screen.</span>
            </>
          }
          description="Progress, roadmap, current lesson and streak — so the answer to “what now?” is always waiting for you when you sit down."
        />

        <Reveal delay={0.1} className="mt-16">
          <div className="glass-strong relative overflow-hidden rounded-[1.75rem] p-1.5 shadow-[0_60px_140px_-60px_rgba(79,70,229,0.7)]">
            <div className="hairline-top absolute inset-x-0 top-0" />

            <div className="overflow-hidden rounded-[1.4rem] border border-white/[0.06] bg-[#0A0A0D]">
              <div className="grid lg:grid-cols-[232px_1fr]">
                {/* ── Sidebar ─────────────────────────────── */}
                <aside className="hidden flex-col gap-6 border-r border-white/[0.06] bg-white/[0.015] p-5 lg:flex">
                  <div className="flex items-center gap-2.5">
                    <LogoMark className="size-8" />
                    <span className="text-sm font-semibold tracking-tight text-white">
                      CodeCompass
                    </span>
                  </div>

                  <nav className="flex flex-col gap-1" aria-label="Dashboard preview">
                    {SIDEBAR.map((link) => (
                      <span
                        key={link.label}
                        className={cn(
                          "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition-colors",
                          link.active
                            ? "border border-white/[0.08] bg-white/[0.06] text-white"
                            : "text-white/45",
                        )}
                      >
                        <link.icon className="size-4" aria-hidden />
                        {link.label}
                      </span>
                    ))}
                  </nav>

                  <div className="mt-auto rounded-2xl border border-indigo-400/20 bg-gradient-to-b from-indigo-500/12 to-transparent p-4">
                    <p className="text-[13px] font-medium text-white">Level 7</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-indigo-400 to-violet-400" />
                    </div>
                    <p className="mt-2 text-[11px] text-white/40">680 XP to Level 8</p>
                  </div>

                  <span className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-white/40">
                    <Settings className="size-4" aria-hidden />
                    Settings
                  </span>
                </aside>

                {/* ── Main ────────────────────────────────── */}
                <div className="min-w-0 p-5 sm:p-6">
                  {/* Topbar */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">
                        Good evening
                      </p>
                      <h3 className="mt-1 text-lg font-semibold tracking-tight text-white">
                        Frontend Developer · Week 14
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-xs text-white/35 sm:flex">
                        <Search className="size-3.5" aria-hidden />
                        Search topics…
                      </span>
                      <span className="grid size-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/45">
                        <Bell className="size-4" aria-hidden />
                      </span>
                      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-[11px] font-semibold text-white">
                        TN
                      </span>
                    </div>
                  </div>

                  {/* Stat tiles */}
                  <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {STAT_TILES.map((tile) => (
                      <div
                        key={tile.label}
                        className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                      >
                        <div
                          aria-hidden
                          className={cn(
                            "absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-70",
                            tile.accent,
                          )}
                        />
                        <p className="text-[11px] uppercase tracking-[0.14em] text-white/35">
                          {tile.label}
                        </p>
                        <p className="mt-2 font-mono text-xl font-semibold text-white">
                          {tile.value}
                        </p>
                        <p className="mt-0.5 text-[11px] text-white/35">{tile.sub}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
                    {/* Current lesson + roadmap */}
                    <div className="flex flex-col gap-4">
                      <div className="rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/[0.13] to-transparent p-5">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-indigo-300/80">
                          <PlayCircle className="size-3.5" aria-hidden />
                          Current lesson
                        </div>
                        <h4 className="mt-2 text-base font-semibold text-white">
                          React Hooks — useState in depth
                        </h4>
                        <p className="mt-1 text-[13px] text-muted-foreground">
                          Module 4 · Lesson 3 of 9 · 18 min remaining
                        </p>
                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full w-[38%] rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400" />
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black">
                            Resume
                          </span>
                          <span className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60">
                            View notes
                          </span>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                        <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-white/35">
                          <BookOpen className="size-3.5" aria-hidden />
                          Upcoming topics
                        </p>
                        <ul className="mt-3 flex flex-col divide-y divide-white/[0.05]">
                          {UPCOMING.map((topic, i) => (
                            <li
                              key={topic.label}
                              className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                            >
                              <span className="flex min-w-0 items-center gap-2.5">
                                <span className="grid size-6 shrink-0 place-items-center rounded-md border border-white/[0.07] bg-white/[0.03] font-mono text-[10px] text-white/40">
                                  {i + 1}
                                </span>
                                <span className="truncate text-[13px] text-white/75">
                                  {topic.label}
                                </span>
                              </span>
                              <span className="shrink-0 font-mono text-[11px] text-white/30">
                                {topic.meta}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right column */}
                    <div className="flex flex-col gap-4">
                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] uppercase tracking-[0.14em] text-white/35">
                            Completed topics
                          </p>
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-300">
                            <Flame className="size-3.5" aria-hidden />
                            21d
                          </span>
                        </div>
                        <ul className="mt-3 flex flex-col gap-2.5">
                          {COMPLETED.map((topic) => (
                            <li
                              key={topic}
                              className="flex items-center gap-2.5 text-[13px] text-white/65"
                            >
                              <CheckCircle2
                                className="size-4 shrink-0 text-emerald-400"
                                aria-hidden
                              />
                              <span className="truncate">{topic}</span>
                            </li>
                          ))}
                          <li className="flex items-center gap-2.5 text-[13px] text-white/30">
                            <Circle className="size-4 shrink-0 text-white/15" aria-hidden />
                            <span className="truncate">React Fundamentals</span>
                          </li>
                        </ul>
                      </div>

                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-white/35">
                          Recent activity
                        </p>
                        <ul className="mt-3 flex flex-col gap-3">
                          {ACTIVITY.map((entry) => (
                            <li key={entry.text} className="flex items-start gap-2.5">
                              <entry.icon
                                className={cn("mt-0.5 size-4 shrink-0", entry.tone)}
                                aria-hidden
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[13px] text-white/70">
                                  {entry.text}
                                </span>
                                <span className="block font-mono text-[11px] text-white/30">
                                  {entry.time}
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
