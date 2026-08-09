import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";

/**
 * Header for signed-out visitors browsing the explorer.
 *
 * The marketing SiteNav isn't reused here because its links are in-page
 * anchors that don't exist on /careers — they would all be dead. Same height
 * and treatment as AppHeader so the layout doesn't shift between the two.
 */
export function ExploreHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="rounded-lg" aria-label="CodeCompass — home">
            <Logo />
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Start Your Journey</Link>
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
