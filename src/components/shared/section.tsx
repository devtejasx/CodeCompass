import * as React from "react";

import { cn } from "@/lib/utils";
import { Reveal } from "@/components/shared/reveal";

interface SectionProps extends React.ComponentProps<"section"> {
  id?: string;
}

/** Consistent vertical rhythm for every block on the page. */
export function Section({ className, children, ...props }: SectionProps) {
  return (
    <section
      className={cn("relative py-24 sm:py-28 lg:py-36", className)}
      {...props}
    >
      {children}
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-5",
        align === "center" ? "mx-auto max-w-3xl text-center items-center" : "max-w-2xl",
        className,
      )}
    >
      {eyebrow ? (
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-white/55">
          <span className="size-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400" />
          {eyebrow}
        </span>
      ) : null}

      <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
        {title}
      </h2>

      {description ? (
        <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
