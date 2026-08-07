import { Section, SectionHeading } from "@/components/shared/section";
import { Reveal, RevealItem } from "@/components/shared/reveal";
import { GridBackdrop } from "@/components/shared/backdrops";
import { FEATURES } from "@/lib/data/features";
import { accent } from "@/lib/accents";
import { cn } from "@/lib/utils";

export function FeaturesGrid() {
  return (
    <Section id="features" className="relative overflow-hidden">
      <GridBackdrop variant="small" className="mask-fade-b opacity-50" />

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          eyebrow="Features"
          title={
            <>
              Everything you need,{" "}
              <span className="text-gradient-brand">nothing you don&apos;t.</span>
            </>
          }
          description="One product that covers the whole path — so you're never stitching together eight tabs and three conflicting opinions."
        />

        {/* Hairline grid: cells share borders so the block reads as one surface. */}
        <Reveal
          stagger={0.04}
          delay={0.05}
          className="mt-16 grid overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.015] sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.map((feature) => {
            const tokens = accent(feature.accent);
            return (
              <RevealItem
                key={feature.title}
                className="group relative border-b border-r border-white/[0.06] p-7 transition-colors duration-500 last:border-b-0 hover:bg-white/[0.035]"
              >
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-0 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100",
                    tokens.glow,
                  )}
                />

                <div className="relative">
                  <div
                    className={cn(
                      "grid size-11 place-items-center rounded-xl border border-white/[0.08] transition-transform duration-500 group-hover:scale-105",
                      tokens.tile,
                    )}
                  >
                    <feature.icon className={cn("size-5", tokens.text)} aria-hidden />
                  </div>
                  <h3 className="mt-5 text-[0.95rem] font-semibold tracking-tight text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </RevealItem>
            );
          })}
        </Reveal>
      </div>
    </Section>
  );
}
