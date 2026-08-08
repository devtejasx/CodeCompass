import * as React from "react";

import { cn } from "@/lib/utils";
import { Reveal } from "@/components/shared/reveal";

/** Consistent vertical rhythm across every block on the page. */
export function Section({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section className={cn("relative py-20 sm:py-24 lg:py-32", className)} {...props}>
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
  /** Heading level, so the page keeps a correct outline. */
  as?: "h2" | "h3";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "mx-auto max-w-2xl items-center text-center" : "max-w-2xl",
        className,
      )}
    >
      {eyebrow ? (
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-subtle-foreground">
          {eyebrow}
        </span>
      ) : null}

      <Tag className="balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </Tag>

      {description ? (
        <p className="pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
