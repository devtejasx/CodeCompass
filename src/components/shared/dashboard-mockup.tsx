"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Flame,
  PlayCircle,
  Route,
} from "lucide-react";

import { cn } from "@/lib/utils";

const COMPLETED = [
  "HTML & Semantic Structure",
  "CSS Layout & Flexbox",
  "JavaScript Fundamentals",
];

const ROADMAP = [
  { label: "React Fundamentals", state: "current" as const },
  { label: "State & Data Fetching", state: "next" as const },
  { label: "Routing & Layouts", state: "locked" as const },
];

const STREAK_DAYS = [true, true, true, true, false, true, true];

/**
 * The hero product shot. Every pixel is CSS + SVG — no screenshots, so it
 * stays crisp at any density and ships nothing to download.
 */
export function DashboardMockup({ className }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <div className={cn("relative", className)}>
      {/* Ambient bloom behind the panel */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-[radial-gradient(60%_60%_at_50%_40%,rgba(79,70,229,0.35),transparent_70%)] blur-2xl"
      />

      <div className="glass-strong relative overflow-hidden rounded-[1.75rem] p-1 shadow-[0_40px_120px_-40px_rgba(79,70,229,0.65)]">
        <div className="hairline-top absolute inset-x-0 top-0" />

        <div className="rounded-[1.5rem] border border-white/[0.06] bg-[#0B0B0F]/90 p-5 sm:p-6">
          {/* Window chrome */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-white/15" />
              <span className="size-2.5 rounded-full bg-white/15" />
              <span className="size-2.5 rounded-full bg-white/15" />
            </div>
            <div className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] text-white/35">
              app.codecompass.dev
            </div>
          </div>

          {/* Career progress header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
                Career Progress
              </p>
              {/* Mockup chrome, not document structure — deliberately not a heading. */}
              <p className="mt-1.5 text-xl font-semibold tracking-tight text-white">
                Frontend Developer
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
              On track
            </span>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-sm text-white/55">Overall completion</span>
              <span className="font-mono text-sm text-white">68%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400"
                initial={{ width: reduced ? "68%" : 0 }}
                animate={{ width: "68%" }}
                transition={{ duration: reduced ? 0 : 1.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[11px] text-white/35">
              <span>34 / 50 topics</span>
              <span>~7 weeks left</span>
            </div>
          </div>

          {/* Next lesson */}
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-indigo-400/20 bg-indigo-500/[0.08] p-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300">
              <PlayCircle className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                Next lesson
              </p>
              <p className="truncate text-sm font-medium text-white">
                React Hooks — useState in depth
              </p>
            </div>
            <ArrowUpRight className="size-4 shrink-0 text-white/35" aria-hidden />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {/* Completed topics */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">
                Completed Topics
              </p>
              <ul className="flex flex-col gap-2.5">
                {COMPLETED.map((topic) => (
                  <li key={topic} className="flex items-center gap-2.5 text-[13px] text-white/70">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden />
                    <span className="truncate">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Learning roadmap */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">
                <Route className="size-3.5" aria-hidden />
                Learning Roadmap
              </p>
              <ul className="flex flex-col gap-2.5">
                {ROADMAP.map((node) => (
                  <li
                    key={node.label}
                    className={cn(
                      "flex items-center gap-2.5 text-[13px]",
                      node.state === "current" ? "text-white" : "text-white/45",
                    )}
                  >
                    {node.state === "current" ? (
                      <span className="relative grid size-4 shrink-0 place-items-center">
                        <span className="absolute size-4 animate-pulse-ring rounded-full bg-indigo-400/60" />
                        <span className="size-2 rounded-full bg-indigo-400" />
                      </span>
                    ) : (
                      <Circle className="size-4 shrink-0 text-white/20" aria-hidden />
                    )}
                    <span className="truncate">{node.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Streak */}
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-500/12 text-amber-300">
                <Flame className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">21 day streak</p>
                <p className="text-[11px] text-white/40">Personal best · keep going</p>
              </div>
            </div>
            <div className="flex items-center gap-1" aria-hidden>
              {STREAK_DAYS.map((active, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-6 w-1.5 rounded-full",
                    active
                      ? "bg-gradient-to-b from-amber-300 to-amber-500"
                      : "bg-white/10",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating XP chip */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-strong absolute -bottom-5 -left-4 hidden items-center gap-2.5 rounded-2xl px-4 py-3 shadow-glow-sm sm:flex lg:-left-10"
      >
        <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
          XP
        </span>
        <div className="leading-tight">
          <p className="font-mono text-sm font-semibold text-white">4,820</p>
          <p className="text-[10px] text-white/40">+180 today</p>
        </div>
      </motion.div>
    </div>
  );
}
