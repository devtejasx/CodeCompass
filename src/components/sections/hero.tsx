"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Compass, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardMockup } from "@/components/shared/dashboard-mockup";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { SITE } from "@/lib/data/site";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduced = useReducedMotion();

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0 : 0.8, delay: reduced ? 0 : delay, ease: EASE },
  });

  return (
    <section
      id="top"
      className="relative overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-36 lg:pb-36 lg:pt-44"
    >
      <GridBackdrop className="mask-radial-fade opacity-70" />
      <Glow className="-top-40 left-1/2 -translate-x-1/2" color="indigo" size="lg" />
      <Glow className="-right-20 top-40 opacity-70" color="violet" size="md" />
      <Glow className="-left-32 top-72 opacity-50" color="cyan" size="md" />

      <div className="mx-auto grid max-w-6xl gap-16 px-5 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12">
        <div className="flex min-w-0 flex-col items-start">
          <motion.a
            href="#journey"
            {...rise(0)}
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-4 text-sm text-white/70 backdrop-blur transition-colors hover:border-white/20 hover:text-white"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-2.5 py-1 text-[11px] font-semibold text-white">
              <Sparkles className="size-3" aria-hidden />
              New
            </span>
            AI-generated roadmaps for 50+ careers
            <ArrowRight
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden
            />
          </motion.a>

          <motion.h1
            {...rise(0.08)}
            className="mt-7 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[4rem]"
          >
            Navigate Your{" "}
            <span className="text-gradient-brand">Journey Into Tech.</span>
          </motion.h1>

          <motion.p
            {...rise(0.16)}
            className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {SITE.description}
          </motion.p>

          <motion.div {...rise(0.24)} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <a href="#cta">
                Start Your Journey
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </a>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <a href="#careers">
                <Compass />
                Explore Career Paths
              </a>
            </Button>
          </motion.div>

          <motion.p
            {...rise(0.32)}
            className="mt-6 text-sm text-white/40"
          >
            Free to start · No credit card · Built for absolute beginners
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 32, scale: reduced ? 1 : 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduced ? 0 : 1, delay: reduced ? 0 : 0.25, ease: EASE }}
          className="min-w-0 lg:pl-4"
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}
