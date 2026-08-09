import Link from "next/link";

import { AccountMenu } from "@/components/app/account-menu";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";

/**
 * Minimal top bar for authenticated pages. The full product sidebar belongs to
 * a later phase — this exists so the app shell is real without pretending to
 * navigate somewhere that doesn't exist yet.
 */
export function AppHeader({ name, email }: { name: string; email: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/dashboard" className="rounded-lg" aria-label="CodeCompass">
            <Logo />
          </Link>
          <AccountMenu name={name} email={email} />
        </div>
      </Container>
    </header>
  );
}
