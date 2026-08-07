import { Quote, Star } from "lucide-react";

import { Section, SectionHeading } from "@/components/shared/section";
import { Reveal, RevealItem } from "@/components/shared/reveal";
import { Card } from "@/components/ui/card";
import { TESTIMONIALS } from "@/lib/data/testimonials";
import { accent } from "@/lib/accents";
import { cn } from "@/lib/utils";

export function Testimonials() {
  return (
    <Section id="testimonials" className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          eyebrow="Testimonials"
          title={
            <>
              The moment it clicks:{" "}
              <span className="text-gradient-brand">
                &ldquo;I know where to start.&rdquo;
              </span>
            </>
          }
          description="Placeholder quotes from the kind of learners CodeCompass is built for — career switchers, self-taught beginners and non-CS graduates."
        />

        <Reveal
          stagger={0.06}
          delay={0.05}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TESTIMONIALS.map((item) => {
            const tokens = accent(item.accent);
            return (
              <RevealItem key={item.name}>
                <Card
                  className={cn(
                    "group flex h-full flex-col justify-between border-white/[0.07] p-6 transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.05]",
                    tokens.border,
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5" aria-label="Rated 5 out of 5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="size-3.5 fill-amber-400 text-amber-400"
                            aria-hidden
                          />
                        ))}
                      </div>
                      <Quote
                        className="size-5 text-white/10 transition-colors duration-500 group-hover:text-white/25"
                        aria-hidden
                      />
                    </div>

                    <blockquote className="mt-5 text-[0.95rem] leading-relaxed text-white/80">
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>
                  </div>

                  <figcaption className="mt-6 flex items-center gap-3 border-t border-white/[0.06] pt-5">
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-full border border-white/[0.08] text-xs font-semibold",
                        tokens.tile,
                        tokens.text,
                      )}
                      aria-hidden
                    >
                      {item.initials}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-white">
                        {item.name}
                      </span>
                      <span className="block truncate text-xs text-white/40">
                        {item.role}
                      </span>
                    </span>
                  </figcaption>
                </Card>
              </RevealItem>
            );
          })}
        </Reveal>
      </div>
    </Section>
  );
}
