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
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-6">
            <Link href="/dashboard" className="rounded-lg" aria-label="CodeCompass">
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
