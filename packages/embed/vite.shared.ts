import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = path.resolve(rootDir, "../..");
const clientStudioSrc = path.resolve(repoRoot, "apps/client-studio/src");

/**
 * Resolve workspace packages via package.json exports (built `dist/`).
 * Only alias the Client Studio mount bridge (app code, not a package).
 */
const aliases = {
  "@client-studio/embed-mount": path.resolve(
    clientStudioSrc,
    "embed/mountClientStudio.tsx",
  ),
};

/**
 * Shared resolve/build fragments for Embed ESM + IIFE that include Client Studio.
 */
export function createEmbedViteConfig(options: {
  readonly emptyOutDir: boolean;
  readonly entry: string;
  readonly formats: ("es" | "iife")[];
  readonly fileName: string;
  readonly libName?: string;
  readonly exports: "named" | "default";
}) {
  return defineConfig({
    plugins: [react()],
    resolve: {
      alias: aliases,
      dedupe: ["react", "react-dom"],
    },
    css: {
      postcss: path.resolve(rootDir, "postcss.config.js"),
    },
    define: {
      __CLIENT_STUDIO_VERSION__: JSON.stringify("0.1.0"),
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
    build: {
      emptyOutDir: options.emptyOutDir,
      sourcemap: true,
      cssCodeSplit: false,
      lib: {
        entry: options.entry,
        name: options.libName,
        formats: options.formats,
        fileName: () => options.fileName,
      },
      rollupOptions: {
        output: {
          exports: options.exports,
          sourcemapExcludeSources: true,
          assetFileNames: "embed.[ext]",
        },
      },
      commonjsOptions: {
        include: [/node_modules/],
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react/jsx-runtime"],
    },
  });
}

export { rootDir, repoRoot, clientStudioSrc };
