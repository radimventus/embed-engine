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
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: path.resolve(rootDir, "src/index.ts"),
      formats: ["es"],
      fileName: () => "embed.es.js",
    },
    rollupOptions: {
      output: {
        exports: "named",
        sourcemapExcludeSources: true,
      },
    },
  },
});
