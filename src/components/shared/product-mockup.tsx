"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Flame, ListChecks } from "lucide-react";

import { LogoMark } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

const COMPLETED = ["HTML", "CSS", "Git & GitHub"];
const PROGRESS = 72;

/**
 * The hero product shot: a plausible slice of the future CodeCompass app,
 * rendered entirely in React + CSS. No screenshots, no image files, so it
 * stays sharp at any density and costs nothing to download.
 */
export function ProductMockup({ className }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <div className={cn("panel rounded-2xl p-4 sm:p-5", className)}>
      {/* App chrome */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <LogoMark className="size-7" />
          <span className="text-sm font-medium tracking-tight text-foreground">
            CodeCompass
          </span>
        </div>
        <span className="rounded-md border border-border px-2 py-0.5 font-mono text-[10px] text-subtle-foreground">
          Beta
        </span>
      </div>

      {/* Path + progress */}
      <div className="pt-5">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-subtle-foreground">Your path</p>
            <p className="mt-1 truncate text-lg font-semibold tracking-tight text-foreground">
              Frontend Developer
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-subtle-foreground">Progress</p>
            <p className="font-mono text-lg font-semibold text-foreground">
              {PROGRESS}%
            </p>
          </div>
        </div>

        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-raised"
          role="progressbar"
          aria-valuenow={PROGRESS}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Frontend Developer path progress"
        >
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: reduced ? `${PROGRESS}%` : 0 }}
            whileInView={{ width: `${PROGRESS}%` }}
            viewport={{ once: true }}
            transition={{
              duration: reduced ? 0 : 1.1,
              delay: reduced ? 0 : 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </div>
      </div>

      {/* Current journey */}
      <div className="mt-5 rounded-xl border border-border bg-surface/60 p-4">
        <p className="text-xs text-subtle-foreground">Current Journey</p>
        <p className="mt-1 text-sm font-medium text-foreground">JavaScript</p>

        <ul className="mt-3 flex flex-col gap-2">
          {COMPLETED.map((topic) => (
            <li key={topic} className="flex items-center gap-2.5 text-sm">
              <span className="grid size-4 shrink-0 place-items-center rounded-full bg-emerald-500/15">
                <Check className="size-2.5 text-emerald-400" aria-hidden />
              </span>
              <span className="text-muted-foreground line-through decoration-border">
                {topic}
              </span>
            </li>
          ))}
          <li className="flex items-center gap-2.5 text-sm">
            <span className="relative grid size-4 shrink-0 place-items-center">
              <span className="size-2 rounded-full bg-primary" />
              <span className="absolute size-4 animate-pulse rounded-full bg-primary/25" />
            </span>
            <span className="font-medium text-foreground">React</span>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-subtle-foreground">
              Next
            </span>
          </li>
        </ul>
      </div>

      {/* Signals */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-surface/60 p-4">
          <Flame className="size-4 text-amber-400" aria-hidden />
          <p className="mt-2 font-mono text-xl font-semibold text-foreground">12</p>
          <p className="text-xs text-subtle-foreground">Day learning streak</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/60 p-4">
          <ListChecks className="size-4 text-cyan-400" aria-hidden />
          <p className="mt-2 font-mono text-xl font-semibold text-foreground">32</p>
          <p className="text-xs text-subtle-foreground">Topics completed</p>
        </div>
      </div>
    </div>
  );
}
