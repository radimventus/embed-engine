import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const packageRoot = path.resolve(rootDir, "..");
const repoRoot = path.resolve(packageRoot, "../..");
const clientStudioPublic = path.resolve(
  repoRoot,
  "apps/client-studio/public",
);

export default defineConfig({
  root: rootDir,
  plugins: [react()],
  publicDir: clientStudioPublic,
  resolve: {
    alias: {
      "@embed-engine/embed": path.resolve(packageRoot, "src/index.ts"),
      "@client-studio/embed-mount": path.resolve(
        repoRoot,
        "apps/client-studio/src/embed/mountClientStudio.tsx",
      ),
    },
    dedupe: ["react", "react-dom"],
  },
  css: {
    postcss: path.resolve(packageRoot, "postcss.config.js"),
  },
  define: {
    __CLIENT_STUDIO_VERSION__: JSON.stringify("0.1.0"),
    "process.env.NODE_ENV": JSON.stringify("development"),
  },
  server: {
    port: 5180,
    open: false,
    fs: {
      allow: [repoRoot],
    },
  },
});
