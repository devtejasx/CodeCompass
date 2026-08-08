"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

type Element = "div" | "section" | "ul" | "li" | "p" | "span";

export interface RevealProps extends Omit<
  React.ComponentProps<"div">,
  "ref" | "style"
> {
  delay?: number;
  /** Set to stagger direct RevealItem children instead of animating as one block. */
  stagger?: number;
  as?: Element;
}

/**
 * Scroll-triggered entrance. Subtle by design: 16px of travel and a short
 * fade — enough to feel alive, not enough to read as a "gaming" site.
 *
 * Under prefers-reduced-motion the final state renders immediately.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  stagger,
  as = "div",
  ...props
}: RevealProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  const variants: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduced ? 0 : 0.5,
        delay: reduced ? 0 : delay,
        ease: EASE,
        ...(stagger ? { staggerChildren: stagger, delayChildren: delay } : {}),
      },
    },
  };

  return (
    <MotionTag
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </MotionTag>
  );
}

/** Direct child of a `Reveal` that has `stagger` set. */
export function RevealItem({
  children,
  className,
  as = "div",
  ...props
}: Omit<RevealProps, "stagger" | "delay">) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  const variants: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0 : 0.45, ease: EASE },
    },
  };

  return (
    <MotionTag
      className={cn(className)}
      variants={variants}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </MotionTag>
  );
}
