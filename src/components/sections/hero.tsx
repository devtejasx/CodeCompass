"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { ProductMockup } from "@/components/shared/product-mockup";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduced = useReducedMotion();

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduced ? 0 : 0.6,
      delay: reduced ? 0 : delay,
      ease: EASE,
    },
  });

  return (
    <section id="top" className="relative overflow-hidden pt-32 sm:pt-36 lg:pt-40">
      <GridBackdrop className="mask-radial" />
      <Glow className="-top-32 left-1/2 size-[36rem] -translate-x-1/2" />

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-12">
          {/* Copy */}
          <div className="flex min-w-0 flex-col items-start">
            <motion.p
              {...rise(0)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground"
            >
              <span className="size-1.5 rounded-full bg-accent" aria-hidden />
              Never wonder what to learn next
            </motion.p>

            <motion.h1
              {...rise(0.06)}
              className="balance mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Navigate Your <span className="text-gradient">Journey Into Tech.</span>
            </motion.h1>

            <motion.p
              {...rise(0.12)}
              className="pretty mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Don&apos;t know where to start in tech? CodeCompass gives you a clear path
              to explore careers, learn the right skills, master modern tools, and know
              what to learn next.
            </motion.p>

            <motion.div
              {...rise(0.18)}
              className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
            >
              <Button size="lg" asChild>
                <a href="#cta">
                  Start Your Journey
                  <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <a href="#careers">Explore Career Paths</a>
              </Button>
            </motion.div>

            <motion.p {...rise(0.24)} className="mt-6 text-sm text-subtle-foreground">
              Built for beginners. Designed for the journey.
            </motion.p>
          </div>

          {/* Product shot */}
          <motion.div
            initial={{ opacity: 0, y: reduced ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduced ? 0 : 0.8,
              delay: reduced ? 0 : 0.2,
              ease: EASE,
            }}
            className="min-w-0"
          >
            <ProductMockup />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
