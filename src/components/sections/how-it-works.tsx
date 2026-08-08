import { Section, SectionHeading } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Reveal, RevealItem } from "@/components/shared/reveal";
import { WORK_STEPS } from "@/lib/data/journey";

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="Three steps, in order."
          description="No dashboard to configure and no syllabus to decode. Pick a direction, and the next step is always waiting."
        />

        <Reveal
          stagger={0.1}
          delay={0.1}
          className="mt-16 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3"
        >
          {WORK_STEPS.map((step) => (
            <RevealItem
              key={step.number}
              className="group bg-background p-8 transition-colors duration-300 hover:bg-surface/70"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-subtle-foreground">
                  {step.number}
                </span>
                <step.icon
                  className="size-5 text-subtle-foreground transition-colors duration-300 group-hover:text-foreground"
                  aria-hidden
                />
              </div>

              <h3 className="mt-8 text-lg font-medium tracking-tight text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
