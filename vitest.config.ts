import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Node tests and the existing sync CLI harness run outside Next's RSC compiler.
    // Keep this alias test-scoped; real client/server enforcement is verified by Next build.
    alias: {
      "server-only": path.resolve(
        import.meta.dirname,
        "node_modules/next/dist/compiled/server-only/empty.js",
      ),
    },
    include: [
      "src/lib/**/*.test.ts",
      "src/components/**/*.test.ts",
      "src/components/**/*.test.tsx",
    ],
    environment: "node",
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
