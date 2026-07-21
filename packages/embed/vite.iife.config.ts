import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = path.resolve(rootDir, "../..");

const aliases = {
  "@embed-engine/core/priority": path.resolve(
    repoRoot,
    "packages/core/src/priority/index.ts",
  ),
  "@embed-engine/core": path.resolve(repoRoot, "packages/core/src/index.ts"),
  "@embed-engine/runtime": path.resolve(
    repoRoot,
    "packages/runtime/src/index.ts",
  ),
};

export default defineConfig({
  resolve: { alias: aliases },
  build: {
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: path.resolve(rootDir, "src/iife.ts"),
      name: "Embed",
      formats: ["iife"],
      fileName: () => "embed.iife.js",
    },
    rollupOptions: {
      output: {
        exports: "default",
        sourcemapExcludeSources: true,
      },
    },
  },
});
