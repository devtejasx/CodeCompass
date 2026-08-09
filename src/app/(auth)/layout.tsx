import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";

/**
 * Auth pages get a focused single-column shell — the marketing nav would only
 * be a distraction here. Same tokens and backdrops as the landing page, so it
 * still reads as CodeCompass.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <GridBackdrop className="mask-radial" />
      <Glow className="-top-40 left-1/2 size-[32rem] -translate-x-1/2" />

      <header className="relative px-5 py-6 sm:px-6">
        <Link
          href="/"
          className="inline-flex rounded-lg"
          aria-label="CodeCompass — home"
        >
          <Logo />
        </Link>
      </header>

      <main
        id="main"
        className="relative flex flex-1 items-center justify-center px-5 pb-16 pt-4 sm:px-6"
      >
        <div className="w-full max-w-[26rem]">{children}</div>
      </main>
    </div>
  );
}
