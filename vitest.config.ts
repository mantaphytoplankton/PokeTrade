import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    // Default environment is Node; component tests opt into jsdom per-file
    // with a `// @vitest-environment jsdom` docblock at the top of the file.
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // `server-only` throws unconditionally unless resolved under the
      // `react-server` export condition (which Next.js's own bundler sets).
      // Vitest isn't that bundler, so point it at the no-op branch directly.
      "server-only": path.resolve(__dirname, "node_modules/server-only/empty.js"),
    },
  },
});
