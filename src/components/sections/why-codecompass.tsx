import { Section, SectionHeading } from "@/components/shared/section";
import { Reveal, RevealItem } from "@/components/shared/reveal";
import { Glow } from "@/components/shared/backdrops";
import { Card } from "@/components/ui/card";
import { PILLARS } from "@/lib/data/features";
import { accent } from "@/lib/accents";
import { cn } from "@/lib/utils";

export function WhyCodeCompass() {
  return (
    <Section id="why" className="overflow-hidden">
      <Glow className="left-1/2 top-10 -translate-x-1/2 opacity-40" color="violet" size="md" />

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          eyebrow="Why CodeCompass"
          title={
            <>
              Not another course platform.
              <br className="hidden sm:block" /> A{" "}
              <span className="text-gradient-brand">sense of direction.</span>
            </>
          }
          description="Most beginners don't fail because the material is too hard. They stall because nobody tells them what comes next. CodeCompass is that missing layer."
        />

        <Reveal stagger={0.12} delay={0.1} className="mt-16 grid gap-6 md:grid-cols-3">
          {PILLARS.map((pillar, index) => {
            const tokens = accent(pillar.accent);
            return (
              <RevealItem key={pillar.title}>
                <Card
                  className={cn(
                    "group h-full border-white/[0.07] p-8 transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/[0.05]",
                    tokens.border,
                  )}
                >
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute -right-16 -top-16 size-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100",
                      tokens.glow,
                    )}
                  />

                  <span className="font-mono text-xs text-white/25">
                    0{index + 1}
                  </span>

                  <div
                    className={cn(
                      "mt-5 grid size-12 place-items-center rounded-2xl border border-white/[0.08] transition-transform duration-500 group-hover:scale-105",
                      tokens.tile,
                    )}
                  >
                    <pillar.icon className={cn("size-6", tokens.text)} aria-hidden />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold tracking-tight text-white">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {pillar.description}
                  </p>
                </Card>
              </RevealItem>
            );
          })}
        </Reveal>
      </div>
    </Section>
  );
}
