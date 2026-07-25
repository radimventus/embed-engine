import { existsSync, readFileSync } from "node:fs";
import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

import { createSsotResolveAliases } from "./vite.ssot-aliases";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = path.resolve(rootDir, "../..");
const clientStudioSrc = path.resolve(repoRoot, "apps/client-studio/src");
const fingerprintFile = path.join(rootDir, ".build/fingerprint.json");

function readBuildFingerprintDefine(): string {
  if (!existsSync(fingerprintFile)) {
    throw new Error(
      `Missing ${fingerprintFile}. Run packages/embed build via build-distribution.mjs (generates fingerprint).`,
    );
  }
  const fingerprint = JSON.parse(readFileSync(fingerprintFile, "utf8")) as {
    commit: string;
    builtAt: string;
    runtimeSource: string;
    marker: string;
  };
  if (
    typeof fingerprint.commit !== "string" ||
    typeof fingerprint.builtAt !== "string" ||
    typeof fingerprint.runtimeSource !== "string" ||
    typeof fingerprint.marker !== "string"
  ) {
    throw new Error("Invalid .build/fingerprint.json for Vite define");
  }
  return JSON.stringify(fingerprint);
}

/**
 * Embed production ESM/IIFE — compiles the SAME live source aliases as Local / demo.
 * No parallel Runtime implementation.
 *
 * Public Release Snapshot must NOT bake developer secrets from repo `.env*`.
 * Live Local / Embed Demo still load keys via their own Vite `envDir`.
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
    // Sterile env: do not load repo-root `.env.local` into public Pages artifacts.
    envDir: path.join(rootDir, ".build"),
    resolve: {
      alias: createSsotResolveAliases(),
      dedupe: ["react", "react-dom"],
    },
    css: {
      postcss: path.resolve(rootDir, "postcss.config.js"),
    },
    define: {
      __CLIENT_STUDIO_VERSION__: JSON.stringify("0.1.0"),
      __EMBED_RUNTIME_BUILD__: readBuildFingerprintDefine(),
      "process.env.NODE_ENV": JSON.stringify("production"),
      // Strip OpenAI key from public IIFE/ESM (partner hosts supply their own later).
      "import.meta.env.VITE_OPENAI_API_KEY": JSON.stringify(""),
    },
    build: {
      // SSOT: only docs/embed — packages/embed/dist is a symlink to this tree.
      outDir: path.resolve(repoRoot, "docs/embed"),
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
