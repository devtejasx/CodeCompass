import { Container } from "@/components/shared/container";

/**
 * What the authenticated shell shows while a page's server component runs.
 *
 * Without this file, Next.js has nothing to render between the click and the
 * server's response, so the browser sits on the *previous* page for the whole
 * round trip. Pages here take roughly 50–400ms warm, which is short enough to
 * feel like nothing happened and long enough that a second click seems
 * reasonable — the worst combination.
 *
 * A `loading.tsx` in the route group is a Suspense boundary Next.js wires up
 * for every route beneath it, so navigation commits immediately and this is
 * painted while the data loads. Placed on the group rather than per page: the
 * header comes from the layout and stays put, so one skeleton below it is
 * accurate for all of them, and adding a page does not mean remembering to add
 * a loading state.
 *
 * Deliberately plain. It reuses the page shell's own spacing and Container so
 * the layout does not shift when the real content replaces it, and it says
 * what is happening for anyone using a screen reader rather than relying on
 * moving boxes alone.
 */
export default function AppLoading() {
  return (
    <div className="relative flex-1 py-10 sm:py-14">
      <Container>
        <div
          className="mx-auto max-w-4xl"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="sr-only">Loading…</span>

          <div aria-hidden className="animate-pulse">
            {/* Page heading */}
            <div className="h-8 w-2/3 rounded-lg bg-surface-raised sm:h-9" />
            <div className="mt-3 h-4 w-1/3 rounded bg-surface-raised/70" />

            {/* Primary panel — the shape most pages open with */}
            <div className="mt-8 rounded-xl border border-border bg-surface/50 p-5">
              <div className="h-3 w-32 rounded bg-surface-raised/70" />
              <div className="mt-4 h-5 w-1/2 rounded bg-surface-raised" />
              <div className="mt-3 h-4 w-full rounded bg-surface-raised/70" />
              <div className="mt-2 h-4 w-4/5 rounded bg-surface-raised/70" />
            </div>

            {/* A couple of secondary rows */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="h-28 rounded-xl border border-border bg-surface/40" />
              <div className="h-28 rounded-xl border border-border bg-surface/40" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
