"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";

/**
 * What the authenticated shell shows when a page throws.
 *
 * There was no error boundary anywhere under /app, so any server-side failure —
 * a dropped database connection, a query that times out — reached Next.js's
 * default handler and gave the learner an unstyled page with no way forward.
 * Their progress was fine; the screen simply implied otherwise.
 *
 * Two things this deliberately does.
 *
 * It offers `reset()` before it offers anything else, because most failures
 * here are transient and retrying in place is both the fastest fix and the one
 * that keeps the learner where they were.
 *
 * It shows no error text. `error.message` from a server component can carry a
 * query, a connection string or a file path, and in production Next.js already
 * replaces it with a `digest` that maps to the server logs. Showing that digest
 * is useful for support; showing the message would be a leak.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative flex-1 py-10 sm:py-14">
      <Container>
        <div className="mx-auto max-w-md text-center" role="alert">
          <div className="mx-auto grid size-11 place-items-center rounded-xl border border-amber-500/25 bg-amber-500/[0.08]">
            <AlertTriangle className="size-5 text-amber-400" aria-hidden />
          </div>

          <h1 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
            Something went wrong loading this page
          </h1>

          <p className="pretty mt-2 text-sm leading-relaxed text-muted-foreground">
            Your progress is saved. This is usually temporary — trying again
            normally works.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Button onClick={reset}>Try again</Button>
            <Button variant="secondary" asChild>
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>

          {error.digest ? (
            <p className="mt-6 font-mono text-xs text-subtle-foreground">
              Reference: {error.digest}
            </p>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
