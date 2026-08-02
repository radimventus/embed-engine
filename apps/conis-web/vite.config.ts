import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appDir, "../..");
/** Production public web tree (GitHub Pages / docs → https://conis.cz). */
const docsRoot = path.resolve(repoRoot, "docs");

/**
 * DEV-014 — CONIS public website development host.
 *
 * Serves the same `docs/` tree that publishes to GitHub Pages.
 * Separate from Studio hosts (:4175 / :4177 / :4179) and Embed Demo (:5180).
 */
export default defineConfig({
  root: docsRoot,
  appType: "mpa",
  publicDir: false,
  server: {
    host: "127.0.0.1",
    port: 4190,
    strictPort: true,
    open: "/",
  },
  preview: {
    host: "127.0.0.1",
    port: 4191,
    strictPort: true,
  },
});
