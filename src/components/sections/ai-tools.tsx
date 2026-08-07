import { ArrowUpRight } from "lucide-react";

import { Section, SectionHeading } from "@/components/shared/section";
import { Reveal, RevealItem } from "@/components/shared/reveal";
import { Card } from "@/components/ui/card";
import { AI_TOOLS } from "@/lib/data/ai-tools";

export function AiTools() {
  return (
    <Section id="ai-tools" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          eyebrow="AI Tool Academy"
          title={
            <>
              Learn the tools{" "}
              <span className="text-gradient-brand">professionals actually use.</span>
            </>
          }
          description="AI won't replace the fundamentals — it raises the bar on them. We teach each tool's real strengths, its failure modes, and where it belongs in your workflow."
        />

        <Reveal
          stagger={0.05}
          delay={0.05}
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          {AI_TOOLS.map((tool) => (
            <RevealItem key={tool.name}>
              <Card className="group h-full border-white/[0.07] p-5 transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 hover:bg-white/[0.05]">
                {/* Monogram tile built from the tool's own brand gradient. */}
                <div className="flex items-start justify-between">
                  <span
                    className="grid size-11 place-items-center rounded-xl text-[13px] font-bold tracking-tight text-black/80 shadow-[0_8px_24px_-10px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${tool.gradient[0]}, ${tool.gradient[1]})`,
                    }}
                    aria-hidden
                  >
                    {tool.mark}
                  </span>
                  <ArrowUpRight
                    className="size-4 text-white/15 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/60"
                    aria-hidden
                  />
                </div>

                <h3 className="mt-4 text-sm font-semibold tracking-tight text-white">
                  {tool.name}
                </h3>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
                  {tool.category}
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                  {tool.description}
                </p>
              </Card>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
