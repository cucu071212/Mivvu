import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/lib/**/*.test.ts", "src/components/**/*.test.ts"],
    environment: "node",
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
