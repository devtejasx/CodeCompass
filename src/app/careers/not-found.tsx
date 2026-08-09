import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";

/** Shown for an unknown career slug — no technical detail, just a way back. */
export default function CareerNotFound() {
  return (
    <div className="flex flex-1 items-center py-24">
      <Container>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <span
            aria-hidden
            className="grid size-12 place-items-center rounded-xl border border-border bg-surface text-indigo-400"
          >
            <Compass className="size-5" />
          </span>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            We couldn&apos;t find that career
          </h1>
          <p className="pretty text-sm leading-relaxed text-muted-foreground">
            The path you followed may be out of date, or that career isn&apos;t in the
            catalog yet. The explorer has everything we currently cover.
          </p>

          <Button asChild className="mt-2">
            <Link href="/careers">Explore all careers</Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}
