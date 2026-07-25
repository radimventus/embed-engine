import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

import {
  createSsotResolveAliases,
  repoRoot,
} from "../packages/embed/vite.ssot-aliases";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const embedPackageRoot = path.resolve(repoRoot, "packages/embed");
const clientStudioPublic = path.resolve(
  repoRoot,
  "apps/client-studio/public",
);

/**
 * Playground — third Embed host surface, identical live Runtime aliases.
 * Not an IIFE sandbox (IIFE is release-only via docs/embed after build).
 */
export default defineConfig({
  root: rootDir,
  envDir: repoRoot,
  plugins: [react()],
  publicDir: clientStudioPublic,
  resolve: {
    alias: createSsotResolveAliases(),
    dedupe: ["react", "react-dom"],
  },
  css: {
    postcss: path.resolve(embedPackageRoot, "postcss.config.js"),
  },
  define: {
    __CLIENT_STUDIO_VERSION__: JSON.stringify("0.1.0"),
    "process.env.NODE_ENV": JSON.stringify("development"),
  },
  server: {
    host: "127.0.0.1",
    port: 5185,
    strictPort: true,
    fs: {
      allow: [repoRoot],
    },
  },
});
