"use client";

import * as React from "react";
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

/**
 * The account dropdown.
 *
 * Opens with a CSS fade-and-drop (`.pop` in globals.css) rather than Framer
 * Motion. This component sits in the authenticated layout, so it was on every
 * signed-in page, and the animation it needed the library for was four pixels
 * of travel and a fade.
 */
export function AccountMenu({ name, email }: AccountMenuProps) {
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
          // tap-target: 42px tall, two short of the figure both platform
          // guidelines land on. The utility grows the hit area on coarse
          // pointers and leaves the geometry alone — see globals.css.
          "tap-target flex items-center gap-2 rounded-lg border border-border bg-surface/60 py-1.5 pl-1.5 pr-2.5",
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

      {/*
        Mounted at all times so CSS can animate it closed as well as open, and
        `inert` while closed so the log-out button is neither tabbable nor
        announced — the same isolation unmounting used to provide.

        `max-w` keeps the 16rem panel inside a 320px viewport: it is anchored to
        the right edge of a button that already sits most of the way across the
        header, so on the narrowest phones the fixed width alone would hang off
        the screen.
      */}
      <div
        id="account-menu"
        role="menu"
        data-open={open}
        inert={!open}
        className="pop absolute right-0 z-50 mt-2 w-64 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-xl border border-border bg-surface-raised shadow-lg"
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
      </div>
    </div>
  );
}
