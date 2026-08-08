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
import { Container } from "@/components/shared/container";
import { JOURNEY_NODES } from "@/lib/data/journey";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Vertical roadmap. The connecting line fills as the section scrolls, which
 * is the whole point of the section: the path is something you move along.
 */
export function JourneyPreview() {
  const reduced = useReducedMotion();
  const trackRef = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 70%", "end 70%"],
  });

  // Spring so the line trails the scroll rather than snapping to it.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 28,
    restDelta: 0.001,
  });
  const lineHeight = useTransform(smooth, [0, 1], ["0%", "100%"]);

  return (
    <Section id="journey">
      <Container>
        <SectionHeading
          eyebrow="Your journey"
          title="Know what comes next."
          description="Not a catalogue to browse — a sequence, where each stage exists because the one after it depends on it."
        />

        <div ref={trackRef} className="relative mx-auto mt-16 max-w-xl">
          {/* Rail */}
          <div
            aria-hidden
            className="absolute bottom-6 left-5 top-6 w-px bg-border sm:left-1/2 sm:-translate-x-1/2"
          />
          <motion.div
            aria-hidden
            style={{ height: reduced ? "100%" : lineHeight }}
            className="absolute left-5 top-6 w-px bg-gradient-to-b from-primary via-secondary to-accent sm:left-1/2 sm:-translate-x-1/2"
          />

          <ol className="relative flex flex-col gap-3">
            {JOURNEY_NODES.map((node, index) => (
              <motion.li
                key={node.title}
                initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: reduced ? 0 : 0.45, ease: EASE }}
                className="relative flex items-center gap-4 sm:gap-6"
              >
                {/* Node marker sits on the rail at both breakpoints. */}
                <span
                  aria-hidden
                  className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full border border-border bg-background sm:absolute sm:left-1/2 sm:-translate-x-1/2"
                >
                  <node.icon className="size-4 text-muted-foreground" aria-hidden />
                </span>

                {/*
                 * Desktop alternates sides; mobile is a single indented column,
                 * which keeps line lengths readable on a narrow screen.
                 */}
                <div
                  className={
                    index % 2 === 0
                      ? "surface min-w-0 flex-1 rounded-xl p-4 sm:mr-auto sm:w-[calc(50%-2.5rem)] sm:flex-none sm:text-right"
                      : "surface min-w-0 flex-1 rounded-xl p-4 sm:ml-auto sm:w-[calc(50%-2.5rem)] sm:flex-none"
                  }
                >
                  <p className="text-sm font-medium tracking-tight text-foreground">
                    {node.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {node.description}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
