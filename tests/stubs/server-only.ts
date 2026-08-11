/**
 * Stands in for the `server-only` package under Vitest.
 *
 * That package resolves through an `exports` map: the `react-server` condition
 * gets a harmless module, and everything else gets one that throws on import.
 * Vitest is neither a browser nor a React Server Components build, so it lands
 * on the throwing entry and every server-only module fails to load.
 *
 * Aliasing it here restores the ability to test that code directly. The real
 * guarantee is unaffected: `next build` still resolves the genuine package, so
 * importing a server-only module from a client component is still a build
 * error.
 */
export {};
