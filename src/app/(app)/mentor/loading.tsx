/**
 * The authenticated shell's skeleton, for the routes beneath this segment.
 *
 * Scoped here rather than on the (app) group because a loading boundary is a
 * Suspense boundary, and one sitting above a page lets Next.js flush the
 * response — committing HTTP 200 — before that page can call `notFound()`.
 * Every segment holding a `[slug]` page that can 404 is deliberately left
 * without one. See components/app/app-loading.
 */
export { default } from "@/components/app/app-loading";
