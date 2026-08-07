import { ArrowUpRight, Clock } from "lucide-react";

import { Section, SectionHeading } from "@/components/shared/section";
import { Reveal, RevealItem } from "@/components/shared/reveal";
import { GridBackdrop } from "@/components/shared/backdrops";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CAREER_PATHS } from "@/lib/data/career-paths";
import { accent } from "@/lib/accents";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types";

const DIFFICULTY_VARIANT: Record<Difficulty, "beginner" | "intermediate" | "advanced"> = {
  Beginner: "beginner",
  Intermediate: "intermediate",
  Advanced: "advanced",
};

export function CareerPaths() {
  return (
    <Section id="careers" className="relative overflow-hidden">
      <GridBackdrop variant="dots" className="mask-fade-b opacity-60" />

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          eyebrow="Career Paths"
          title={
            <>
              Twelve doors into tech.{" "}
              <span className="text-gradient-brand">Pick one with confidence.</span>
            </>
          }
          description="Each path lists what you'll actually do, how hard it is, and how long it realistically takes — before you commit a single evening to it."
        />

        <Reveal
          stagger={0.05}
          delay={0.05}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CAREER_PATHS.map((path) => {
            const tokens = accent(path.accent);
            return (
              <RevealItem key={path.slug}>
                <Card
                  className={cn(
                    "group h-full cursor-pointer border-white/[0.07] p-6 transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/[0.05] hover:shadow-glow-sm",
                    tokens.border,
                  )}
                >
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute -right-20 -top-20 size-44 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100",
                      tokens.glow,
                    )}
                  />

                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={cn(
                        "grid size-11 place-items-center rounded-xl border border-white/[0.08] transition-transform duration-500 group-hover:scale-105",
                        tokens.tile,
                      )}
                    >
                      <path.icon className={cn("size-5", tokens.text)} aria-hidden />
                    </div>
                    <ArrowUpRight
                      className="size-4 -translate-y-0.5 text-white/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-1 group-hover:text-white/70"
                      aria-hidden
                    />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">
                    {path.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {path.description}
                  </p>

                  <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Core stack">
                    {path.stack.map((tech) => (
                      <li
                        key={tech}
                        className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] text-white/50"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                    <Badge variant={DIFFICULTY_VARIANT[path.difficulty]}>
                      {path.difficulty}
                    </Badge>
                    <span className="inline-flex items-center gap-1.5 text-xs text-white/45">
                      <Clock className="size-3.5" aria-hidden />
                      {path.duration}
                    </span>
                  </div>
                </Card>
              </RevealItem>
            );
          })}
        </Reveal>

        <Reveal delay={0.15} className="mt-10 text-center text-sm text-white/40">
          …and 38 more specialisations inside the app.
        </Reveal>
      </div>
    </Section>
  );
}
