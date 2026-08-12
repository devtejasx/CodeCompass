"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, LogOut } from "lucide-react";

import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

interface AccountMenuProps {
  name: string;
  email: string;
}

/** Initials from the user's own name — no avatar service, no image files. */
function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export function AccountMenu({ name, email }: AccountMenuProps) {
  const reduced = useReducedMotion();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click and on Escape — expected of any menu.
  React.useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="account-menu"
        // Below `sm` the visible name is display:none and both remaining
        // children are aria-hidden, which would leave the button with no
        // accessible name at all. The label carries it at every width.
        aria-label={`Account menu for ${name}`}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-surface/60 py-1.5 pl-1.5 pr-2.5",
          "text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground",
        )}
      >
        <span
          aria-hidden
          className="grid size-7 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground"
        >
          {initialsOf(name)}
        </span>
        <span className="hidden max-w-[10rem] truncate sm:block">{name}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="account-menu"
            role="menu"
            initial={{ opacity: 0, y: reduced ? 0 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -4 }}
            transition={{ duration: reduced ? 0 : 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-surface-raised shadow-lg"
          >
            <div className="border-b border-border px-4 py-3">
              <p className="truncate text-sm font-medium text-foreground">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>

            {/* A real form post, so logout works without client-side auth state. */}
            <form action={logout}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              >
                <LogOut className="size-4" aria-hidden />
                Log out
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
