#!/usr/bin/env node
/**
 * Build the production distribution package for @embed-engine/embed.
 *
 * Produces a deterministic `dist/` layout suitable for future GitHub Pages / CDN
 * publishing. Does not publish anywhere.
 */

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(rootDir, "..");
const distDir = path.join(packageDir, "dist");

const packageJson = JSON.parse(
  readFileSync(path.join(packageDir, "package.json"), "utf8"),
);

/** Required production artifacts (must exist after build). */
const REQUIRED_ARTIFACTS = [
  "embed.es.js",
  "embed.iife.js",
  "index.d.ts",
  "version.json",
];

/** Optional debug artifacts (documented; not required for host pages). */
const OPTIONAL_ARTIFACTS = ["embed.es.js.map", "embed.iife.js.map"];

/**
 * Declaration files that are implementation-internal and must not be part of
 * the public distribution surface.
 */
const INTERNAL_DECLARATIONS = [
  "bootstrap.d.ts",
  "bootstrap.d.ts.map",
  "session.d.ts",
  "session.d.ts.map",
  "styles.d.ts",
  "styles.d.ts.map",
  "iife.d.ts",
  "iife.d.ts.map",
  "embed.bundle.d.ts",
  "embed.bundle.d.ts.map",
  "iife.bundle.d.ts",
  "iife.bundle.d.ts.map",
];

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: packageDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function readEmbedVersionFromSource() {
  const source = readFileSync(path.join(packageDir, "src/version.ts"), "utf8");
  const match = source.match(/EMBED_VERSION\s*=\s*"([^"]+)"/);
  if (!match) {
    throw new Error("Could not parse EMBED_VERSION from src/version.ts");
  }
  return match[1];
}

function writeVersionJson(apiVersion) {
  if (apiVersion !== packageJson.version) {
    throw new Error(
      `Version mismatch: package.json=${packageJson.version} EMBED_VERSION=${apiVersion}. Keep them identical.`,
    );
  }

  const manifest = {
    name: packageJson.name,
    version: packageJson.version,
    apiVersion,
    freeze: "Architecture Freeze v0.1",
    artifacts: {
      esm: "embed.es.js",
      iife: "embed.iife.js",
      types: "index.d.ts",
      sourcemaps: OPTIONAL_ARTIFACTS,
    },
    publicApi: ["Embed.mount", "Embed.unmount", "Embed.version"],
  };

  writeFileSync(
    path.join(distDir, "version.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
}

function pruneInternalDeclarations() {
  for (const file of INTERNAL_DECLARATIONS) {
    const target = path.join(distDir, file);
    if (existsSync(target)) {
      rmSync(target);
    }
  }
}

function assertCompletePackage() {
  const missing = REQUIRED_ARTIFACTS.filter(
    (file) => !existsSync(path.join(distDir, file)),
  );
  if (missing.length > 0) {
    throw new Error(
      `Incomplete distribution package. Missing: ${missing.join(", ")}`,
    );
  }

  // Guard against accidental absolute host paths in shippable JS.
  for (const file of ["embed.es.js", "embed.iife.js"]) {
    const content = readFileSync(path.join(distDir, file), "utf8");
    if (content.includes("/Users/") || content.includes("C:\\\\Users\\\\")) {
      throw new Error(
        `${file} contains absolute user path markers — refusing to ship.`,
      );
    }
  }

  const listing = readdirSync(distDir).sort();
  console.log("Distribution package ready:");
  for (const file of listing) {
    const marker = REQUIRED_ARTIFACTS.includes(file)
      ? "required"
      : OPTIONAL_ARTIFACTS.includes(file)
        ? "optional"
        : "support";
    console.log(`  [${marker}] ${file}`);
  }
}

console.log("→ ESM bundle");
run("pnpm", ["exec", "vite", "build"]);

console.log("→ IIFE bundle");
run("pnpm", ["exec", "vite", "build", "--config", "vite.iife.config.ts"]);

console.log("→ TypeScript declarations");
run("pnpm", ["exec", "tsc", "--emitDeclarationOnly"]);

const apiVersion = readEmbedVersionFromSource();
console.log("→ version.json");
writeVersionJson(apiVersion);

console.log("→ prune internal declarations");
pruneInternalDeclarations();

console.log("→ verify package");
assertCompletePackage();
