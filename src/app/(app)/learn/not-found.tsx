import Link from "next/link";
import { BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";

/** Shown for a topic slug that isn't in any roadmap. No technical detail. */
export default function LearnNotFound() {
  return (
    <div className="flex flex-1 items-center py-24">
      <Container>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <span
            aria-hidden
            className="grid size-12 place-items-center rounded-xl border border-border bg-surface text-indigo-400"
          >
            <BookOpen className="size-5" />
          </span>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            We couldn&apos;t find that topic
          </h1>
          <p className="pretty text-sm leading-relaxed text-muted-foreground">
            The link may be out of date, or the topic may have been renamed. Your
            roadmap has everything currently available.
          </p>

          <Button asChild className="mt-2">
            <Link href="/roadmap">Back to your roadmap</Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}
