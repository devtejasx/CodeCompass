import { ArrowDown } from "lucide-react";

import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Reveal, RevealItem } from "@/components/shared/reveal";
import { BEGINNER_QUESTIONS } from "@/lib/data/journey";

/**
 * The narrative hinge of the page: name the confusion first, then resolve it.
 * Questions are visually unsettled (offset, muted, quoted); the answer below
 * is centred and solid — the layout itself performs the transition.
 */
export function Problem() {
  return (
    <Section id="problem">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Starting in tech shouldn&apos;t feel overwhelming.
          </h2>
          <p className="pretty mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Every beginner runs into the same wall — not a lack of material, but no idea
            which piece of it comes next.
          </p>
        </Reveal>

        <Reveal
          stagger={0.08}
          delay={0.1}
          className="mx-auto mt-14 flex max-w-3xl flex-col gap-3"
        >
          {BEGINNER_QUESTIONS.map((question, index) => (
            <RevealItem
              key={question.text}
              className={
                // Alternating indents make the stack read as scattered doubt
                // rather than a tidy list.
                index % 2 === 0
                  ? "sm:mr-auto sm:pr-12"
                  : "sm:ml-auto sm:pl-12 sm:text-right"
              }
            >
              <p className="surface inline-block rounded-xl px-5 py-3 text-base text-muted-foreground sm:text-lg">
                <span className="mr-1 text-subtle-foreground" aria-hidden>
                  &ldquo;
                </span>
                {question.text}
                <span className="ml-1 text-subtle-foreground" aria-hidden>
                  &rdquo;
                </span>
              </p>
            </RevealItem>
          ))}
        </Reveal>

        <Reveal delay={0.15} className="mt-14 flex flex-col items-center gap-6">
          <span
            aria-hidden
            className="flex flex-col items-center gap-2 text-subtle-foreground"
          >
            <span className="h-12 w-px bg-gradient-to-b from-transparent to-primary/60" />
            <ArrowDown className="size-4 text-primary" />
          </span>

          <p className="balance text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            CodeCompass gives you direction.
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
