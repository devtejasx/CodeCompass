import path from "node:path";
import { defineConfig, type Plugin } from "vitest/config";

/**
 * Lets the suite import the execution service's source directly.
 *
 * services/execution is a separate Node project: it compiles under NodeNext, so
 * its own imports carry the .js extension the runtime will need. Vite resolves
 * paths as written and would look for a .js file that only exists after a
 * build, which would make `npm test` depend on having compiled the service
 * first. Rewriting the extension - and only for importers inside that
 * directory, so nothing in src/ or node_modules is affected - keeps the tests
 * reading the same source the reviewer is.
 */
function executionServiceSource(): Plugin {
  const root = path.resolve(import.meta.dirname, "./services/execution/src");
  return {
    name: "codecompass:execution-service-source",
    enforce: "pre",
    resolveId(source, importer) {
      if (!importer || !source.startsWith(".")) return null;
      if (!path.resolve(importer).startsWith(root)) return null;
      if (!source.endsWith(".js")) return null;
      return path.resolve(path.dirname(importer), `${source.slice(0, -3)}.ts`);
    },
  };
}

export default defineConfig({
  plugins: [executionServiceSource()],
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
