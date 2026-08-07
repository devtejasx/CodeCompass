import { ArrowRight, Compass } from "lucide-react";

import { Reveal } from "@/components/shared/reveal";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/data/site";

export function FinalCta() {
  return (
    <section id="cta" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-[2rem] px-6 py-16 text-center sm:px-12 sm:py-20">
            <GridBackdrop className="mask-radial-fade opacity-60" />
            <Glow className="left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 opacity-80" color="indigo" size="md" />
            <Glow className="bottom-0 right-0 translate-x-1/4 translate-y-1/3 opacity-50" color="cyan" size="sm" />
            <div className="hairline-top absolute inset-x-0 top-0" />

            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/60">
              <Compass className="size-3.5 text-indigo-300" aria-hidden />
              {SITE.promise}
            </span>

            <h2 className="mx-auto mt-6 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl sm:leading-[1.08]">
              Your Tech Journey{" "}
              <span className="text-gradient-brand">Starts Here.</span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Take the two-minute career assessment and get a roadmap built for
              where you are today — not where a curriculum assumes you are.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <a href="#top">
                  Start Learning Free
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </a>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <a href="#careers">Explore Career Paths</a>
              </Button>
            </div>

            <p className="mt-6 text-sm text-white/35">
              Free forever plan · No credit card required · Cancel anytime
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
