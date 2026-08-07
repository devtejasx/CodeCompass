"use client";

import * as React from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import { Section, SectionHeading } from "@/components/shared/section";
import { Glow } from "@/components/shared/backdrops";
import { JOURNEY_STEPS } from "@/lib/data/journey";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function JourneyTimeline() {
  const reduced = useReducedMotion();
  const trackRef = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 65%", "end 65%"],
  });

  // Spring-smoothed so the line trails the scroll instead of snapping to it.
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  const height = useTransform(progress, [0, 1], ["0%", "100%"]);

  return (
    <Section id="journey" className="relative overflow-hidden">
      <Glow className="-left-40 top-1/3 opacity-40" color="indigo" size="lg" />
      <Glow className="-right-40 bottom-1/4 opacity-40" color="violet" size="md" />

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          eyebrow="Learning Journey"
          title={
            <>
              Nine stages from{" "}
              <span className="text-gradient-brand">zero to techie.</span>
            </>
          }
          description="This is the order. Not a menu to browse — a sequence where each stage exists because the next one needs it."
        />

        <div ref={trackRef} className="relative mx-auto mt-20 max-w-3xl">
          {/* Rail */}
          <div
            aria-hidden
            className="absolute left-[27px] top-2 h-[calc(100%-1rem)] w-px bg-white/[0.08] sm:left-1/2 sm:-translate-x-1/2"
          />
          {/* Filled rail, driven by scroll */}
          <motion.div
            aria-hidden
            style={{ height: reduced ? "100%" : height }}
            className="absolute left-[27px] top-2 w-px bg-gradient-to-b from-indigo-500 via-violet-500 to-cyan-400 shadow-[0_0_16px_rgba(124,58,237,0.65)] sm:left-1/2 sm:-translate-x-1/2"
          />

          <ol className="flex flex-col gap-10 sm:gap-14">
            {JOURNEY_STEPS.map((item, index) => {
              const alignRight = index % 2 === 1;
              return (
                <li key={item.step} className="relative">
                  <div
                    className={cn(
                      "grid items-center gap-6 sm:grid-cols-2",
                      alignRight && "sm:[&>*:first-child]:order-2",
                    )}
                  >
                    {/* Card */}
                    <motion.div
                      initial={{ opacity: 0, x: reduced ? 0 : alignRight ? 28 : -28 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: reduced ? 0 : 0.65, ease: EASE }}
                      className={cn(
                        "glass group ml-14 min-w-0 rounded-2xl p-5 transition-colors duration-300 hover:border-white/20 sm:ml-0",
                        alignRight ? "sm:ml-10" : "sm:mr-10",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-indigo-300 transition-transform duration-300 group-hover:scale-105">
                          <item.icon className="size-[18px]" aria-hidden />
                        </span>
                        <div>
                          <h3 className="text-base font-semibold tracking-tight text-white">
                            {item.title}
                          </h3>
                          <p className="font-mono text-[11px] text-white/35">
                            {item.badge}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </motion.div>

                    {/* Spacer for the opposite column on desktop */}
                    <div aria-hidden className="hidden sm:block" />
                  </div>

                  {/* Node */}
                  <motion.span
                    aria-hidden
                    initial={{ scale: reduced ? 1 : 0.4, opacity: reduced ? 1 : 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
                    className="absolute left-[13px] top-5 grid size-7 place-items-center rounded-full border border-white/15 bg-[#0B0B0F] font-mono text-[11px] font-semibold text-white/70 sm:left-1/2 sm:-translate-x-1/2"
                  >
                    {item.step}
                  </motion.span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </Section>
  );
}
