"use client";

import { Check, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface OptionCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: () => void;
  /** Native radio semantics so arrow keys and screen readers behave correctly. */
  name: string;
  value: string;
}

/**
 * A real <input type="radio"> with a styled label — deliberately not a
 * clickable div. That gives keyboard selection, arrow-key roving within the
 * group, and correct announcement for free.
 */
export function OptionCard({
  title,
  description,
  icon: Icon,
  selected,
  onSelect,
  name,
  value,
}: OptionCardProps) {
  return (
    <label
      className={cn(
        "group relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 sm:p-5",
        "transition-colors duration-200 ease-out-expo",
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background",
        selected
          ? "border-primary/60 bg-primary/[0.09]"
          : "border-border bg-surface/60 hover:border-white/15 hover:bg-surface-raised",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />

      <span
        aria-hidden
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-lg border transition-colors duration-200",
          selected
            ? "border-primary/40 bg-primary/15 text-indigo-300"
            : "border-border bg-surface text-muted-foreground group-hover:text-foreground",
        )}
      >
        <Icon className="size-[18px]" />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-sm font-medium transition-colors duration-200",
            selected ? "text-foreground" : "text-foreground",
          )}
        >
          {title}
        </span>
        {description ? (
          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>

      <span
        aria-hidden
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-all duration-200",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-transparent text-transparent",
        )}
      >
        <Check className="size-3" />
      </span>
    </label>
  );
}
