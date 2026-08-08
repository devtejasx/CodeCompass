import { Section, SectionHeading } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Reveal, RevealItem } from "@/components/shared/reveal";
import { LEARNING_AREAS } from "@/lib/data/learning";
import { accentClass } from "@/lib/accents";
import { cn } from "@/lib/utils";

export function WhatYouLearn() {
  return (
    <Section id="learn">
      <Container>
        <SectionHeading
          eyebrow="What you'll learn"
          title="The whole skill set, not just the syntax."
          description="Writing code is one part of the job. CodeCompass covers the rest of what makes someone employable."
        />

        {/*
         * Hairline grid: a 1px gap over a border-coloured background renders
         * shared dividers, so the six cards read as one panel.
         */}
        <Reveal
          stagger={0.05}
          delay={0.05}
          as="ul"
          className="mt-16 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
        >
          {LEARNING_AREAS.map((area) => (
            <RevealItem
              as="li"
              key={area.title}
              className="group bg-background p-7 transition-colors duration-300 hover:bg-surface/70"
            >
              <span className="grid size-10 place-items-center rounded-lg border border-border bg-surface">
                <area.icon
                  className={cn("size-[18px]", accentClass(area.accent))}
                  aria-hidden
                />
              </span>
              <h3 className="mt-5 font-medium tracking-tight text-foreground">
                {area.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {area.description}
              </p>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
