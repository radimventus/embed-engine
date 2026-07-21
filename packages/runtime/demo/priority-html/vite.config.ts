import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const runtimeRoot = path.resolve(rootDir, "../..");
const repoRoot = path.resolve(runtimeRoot, "../..");

export default defineConfig({
  root: rootDir,
  base: "./",
  build: {
    outDir: path.resolve(rootDir, "dist"),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@embed-engine/core/priority": path.resolve(
        repoRoot,
        "packages/core/src/priority/index.ts",
      ),
      "@embed-engine/core": path.resolve(repoRoot, "packages/core/src/index.ts"),
    },
  },
  server: {
    port: 5179,
    open: false,
  },
});
