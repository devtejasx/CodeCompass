import Link from "next/link";

import { AccountMenu } from "@/components/app/account-menu";
import { AppNav } from "@/components/app/app-nav";
import { Logo } from "@/components/shared/logo";

/**
 * Top bar for authenticated pages: brand, primary navigation, account menu.
 *
 * Still deliberately a top bar rather than the full product sidebar — that
 * belongs to a later phase, and faking it now would promise navigation that
 * doesn't exist.
 *
 * The bar spans the window rather than sitting inside the page's content
 * column, which is the one thing that makes the navigation row possible at all.
 * `Container` is `max-w-6xl`, so it hands the header 1088px at every width from
 * 1216px up — while the wordmark (143), the nine-link row (914), the account
 * menu (164) and the gaps between them need 1261px. The row therefore fit at no
 * viewport width, and the last two links spent every desktop render underneath
 * the account menu: laid out, focusable, and impossible to click. Measured, not
 * inferred; see scripts/practice-audit.ts, which now checks what
 * `elementFromPoint` returns at each control's centre.
 *
 * Full width gives the row `viewport - 411px`, so it clears 914px from 1325px
 * up. `AppNav` renders it from `2xl` (1536), which leaves 211px of slack rather
 * than the single pixel that a tighter breakpoint would have left.
 */
export function AppHeader({ name, email }: { name: string; email: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      {/* The page's gutter scale, without the page's max width. */}
      <div className="w-full px-5 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3 sm:gap-4">
          {/*
            The 24px gap belongs to the desktop navigation row, where it
            separates the wordmark from nine links. Below the row's breakpoint
            the only thing next to the logo is the menu button, and at 320px
            that gap was the difference between fitting and not: logo 143 + gap
            24 + button 37 came to 204px in a 195px box, so the wordmark was
            squeezed by 9px. It tightens on small screens and returns to 24px
            where the nav row it exists for actually appears.
          */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-4 2xl:gap-6">
            <Link
              href="/dashboard"
              // tap-target: the wordmark is a link home and is sized by the
              // 32px mark beside it. A standalone control, not a link inside a
              // sentence, so WCAG's inline exemption does not cover it.
              className="tap-target shrink-0 rounded-lg"
              aria-label="CodeCompass"
            >
              <Logo />
            </Link>
            <AppNav />
          </div>

          <AccountMenu name={name} email={email} />
        </div>
      </div>
    </header>
  );
}
