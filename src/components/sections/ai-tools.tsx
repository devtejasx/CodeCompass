import { Section, SectionHeading } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Reveal, RevealItem } from "@/components/shared/reveal";
import { AI_TOOLS } from "@/lib/data/learning";

/**
 * Phase 1 is a visual preview only — no AI integration, no outbound links.
 * Tool marks are generated monograms tinted with each brand's colour, so the
 * section carries no third-party logo files.
 */
export function AiTools() {
  return (
    <Section id="ai-tools">
      <Container>
        <SectionHeading
          eyebrow="AI tools"
          title="AI is changing how developers build."
          description="CodeCompass will help you understand the tools shaping modern software development."
        />

        <Reveal
          stagger={0.04}
          delay={0.05}
          as="ul"
          className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        >
          {AI_TOOLS.map((tool) => (
            <RevealItem as="li" key={tool.name}>
              <div className="surface-interactive flex h-full flex-col items-center gap-3 rounded-xl p-5 text-center">
                <span
                  className="grid size-11 place-items-center rounded-lg border text-xs font-semibold tracking-tight"
                  style={{
                    color: tool.tint,
                    borderColor: `${tool.tint}33`,
                    backgroundColor: `${tool.tint}14`,
                  }}
                  aria-hidden
                >
                  {tool.mark}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {tool.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-subtle-foreground">
                    {tool.category}
                  </span>
                </span>
              </div>
            </RevealItem>
          ))}
        </Reveal>

        <Reveal delay={0.1} className="mt-8 text-center">
          <p className="text-sm text-subtle-foreground">
            Preview only — AI guidance arrives in a later phase.
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
