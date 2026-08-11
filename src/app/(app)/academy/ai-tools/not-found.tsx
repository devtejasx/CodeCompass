import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";

/**
 * Shown for a tool or workflow slug that isn't in the catalog.
 *
 * No technical detail, and no suggestion that the reader got something wrong —
 * with AI tooling a dead link genuinely is more often a rename than a typo,
 * which is exactly why superseded tools are kept in the catalog rather than
 * deleted. Searching is therefore the most useful thing to offer.
 */
export default function AIToolNotFound() {
  return (
    <div className="flex flex-1 items-center py-24">
      <Container>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <span
            aria-hidden
            className="grid size-12 place-items-center rounded-xl border border-border bg-surface text-indigo-400"
          >
            <Sparkles className="size-5" />
          </span>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            We couldn&apos;t find that
          </h1>
          <p className="pretty text-sm leading-relaxed text-muted-foreground">
            AI tools get renamed, acquired and discontinued often. The catalog keeps
            superseded names and points them at whatever replaced them, so searching
            for the name you know is usually the fastest way through.
          </p>

          <Button asChild className="mt-2">
            <Link href="/academy/ai-tools">Search the AI tool catalog</Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}
