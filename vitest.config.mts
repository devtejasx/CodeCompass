import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: ["./tests/global-setup.ts"],
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    // The suite shares one Postgres database; parallel files would race on
    // the truncate between tests.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      // Vitest is neither a browser nor an RSC build, so it resolves the real
      // package to its throwing entry. See tests/stubs/server-only.ts — the
      // build-time guarantee is unaffected.
      "server-only": path.resolve(import.meta.dirname, "./tests/stubs/server-only.ts"),
    },
  },
});
