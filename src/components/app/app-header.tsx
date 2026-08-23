import Link from "next/link";

import { AccountMenu } from "@/components/app/account-menu";
import { AppNav } from "@/components/app/app-nav";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";

/**
 * Top bar for authenticated pages: brand, primary navigation, account menu.
 *
 * Still deliberately a top bar rather than the full product sidebar — that
 * belongs to a later phase, and faking it now would promise navigation that
 * doesn't exist.
 */
export function AppHeader({ name, email }: { name: string; email: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <Container>
        <div className="flex h-16 items-center justify-between gap-3 sm:gap-4">
          {/*
            The 24px gap belongs to the desktop navigation row, where it
            separates the wordmark from nine links. Below `xl` the only thing
            next to the logo is the menu button, and at 320px that gap was the
            difference between fitting and not: logo 143 + gap 24 + button 37
            came to 204px in a 195px box, so the wordmark was squeezed by 9px.
            It tightens on small screens and returns to 24px where the nav row
            it exists for actually appears.
          */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-4 xl:gap-6">
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
      </Container>
    </header>
  );
}
