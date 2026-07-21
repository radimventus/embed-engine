import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const packageRoot = path.resolve(rootDir, "..");
const repoRoot = path.resolve(packageRoot, "../..");

export default defineConfig({
  root: rootDir,
  resolve: {
    alias: {
      "@embed-engine/core/priority": path.resolve(
        repoRoot,
        "packages/core/src/priority/index.ts",
      ),
      "@embed-engine/core": path.resolve(repoRoot, "packages/core/src/index.ts"),
      "@embed-engine/runtime": path.resolve(
        repoRoot,
        "packages/runtime/src/index.ts",
      ),
      "@embed-engine/embed": path.resolve(packageRoot, "src/index.ts"),
    },
  },
  server: {
    port: 5180,
    open: false,
  },
});
