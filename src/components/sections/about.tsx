import { Section } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { Divider } from "@/components/shared/backdrops";
import { SITE } from "@/lib/data/site";

/**
 * Short by design. The nav and footer both link to "About", so this exists to
 * give those links a real destination and to state the principle plainly —
 * not to pad the page with a company story that doesn't exist yet.
 */
export function About() {
  return (
    <Section id="about" className="py-20 sm:py-24">
      <Container>
        <Divider className="mb-20" />

        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-subtle-foreground">
            About
          </p>

          <blockquote className="balance mt-6 text-2xl font-medium leading-snug tracking-tight text-foreground sm:text-3xl">
            &ldquo;{SITE.principle}&rdquo;
          </blockquote>

          <p className="pretty mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            CodeCompass isn&apos;t a course catalogue. It&apos;s the layer above one —
            the part that decides what you learn, in what order, and what to build to
            prove it. {SITE.footerBlurb}
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
