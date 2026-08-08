import { ArrowRight } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section id="cta" className="relative overflow-hidden py-24 sm:py-32">
      <GridBackdrop className="mask-fade-b opacity-60" />
      <Glow className="-bottom-40 left-1/2 size-[32rem] -translate-x-1/2" />

      <Container>
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2 className="balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Your journey into tech starts here.
          </h2>

          <p className="pretty mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Stop guessing what to learn next. Start building your path.
          </p>

          <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button size="lg" asChild>
              <a href="#top">
                Start Your Journey
                <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <a href="#careers">Explore Careers</a>
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
