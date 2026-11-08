import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    server: {
      deps: {
        inline: ["next-auth", "@auth/core"],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "next/server": path.resolve(
        __dirname,
        "./node_modules/next/server.js"
      ),
      "next/headers": path.resolve(
        __dirname,
        "./node_modules/next/headers.js"
      ),
      "next/navigation": path.resolve(
        __dirname,
        "./node_modules/next/navigation.js"
      ),
      "next/cache": path.resolve(
        __dirname,
        "./node_modules/next/cache.js"
      ),
    },
  },
});
