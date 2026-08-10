import Link from "next/link";
import { Hammer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";

/** Shown for a project slug that isn't in the catalog. No technical detail. */
export default function ProjectNotFound() {
  return (
    <div className="flex flex-1 items-center py-24">
      <Container>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <span
            aria-hidden
            className="grid size-12 place-items-center rounded-xl border border-border bg-surface text-indigo-400"
          >
            <Hammer className="size-5" />
          </span>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            We couldn&apos;t find that project
          </h1>
          <p className="pretty text-sm leading-relaxed text-muted-foreground">
            The link may be out of date, or the project may have been renamed. Anything
            you have already built is unaffected.
          </p>

          <Button asChild className="mt-2">
            <Link href="/projects">Back to projects</Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}
