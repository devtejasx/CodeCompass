import { ArrowRight } from "lucide-react";

import { Section, SectionHeading } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Reveal, RevealItem } from "@/components/shared/reveal";
import { Badge, DIFFICULTY_VARIANT } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CAREER_PATHS } from "@/lib/data/careers";
import { accentClass } from "@/lib/accents";
import { cn } from "@/lib/utils";

/**
 * Phase 1: informational cards only — no links, no detail routes. Rendered as
 * a plain list so nothing announces itself as interactive to a screen reader
 * before the behaviour exists.
 */
export function CareerPaths() {
  return (
    <Section id="careers">
      <Container>
        <SectionHeading
          eyebrow="Career paths"
          title="Explore the world of technology."
          description="Twelve directions people actually build careers in — what each one involves, and how steep the climb is from zero."
        />

        <Reveal
          stagger={0.04}
          delay={0.05}
          as="ul"
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CAREER_PATHS.map((career) => (
            <RevealItem as="li" key={career.slug}>
              <Card interactive className="group h-full p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-lg border border-border bg-surface">
                    <career.icon
                      className={cn("size-[18px]", accentClass(career.accent))}
                      aria-hidden
                    />
                  </span>
                  <ArrowRight
                    className="size-4 text-subtle-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-foreground"
                    aria-hidden
                  />
                </div>

                <h3 className="mt-5 font-medium tracking-tight text-foreground">
                  {career.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {career.description}
                </p>

                <div className="mt-5">
                  <Badge variant={DIFFICULTY_VARIANT[career.difficulty]}>
                    {career.difficulty}
                  </Badge>
                </div>
              </Card>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
