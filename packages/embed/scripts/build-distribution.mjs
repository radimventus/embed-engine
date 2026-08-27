#!/usr/bin/env node
/**
 * Build the production distribution package for @embed-engine/embed.
 *
 * SSOT: writes once into docs/embed. packages/embed/dist is a symlink to that tree.
 * PT-DEPLOY-EMBED-01: generates Runtime build fingerprint, verifies package,
 * runs Runtime smoke — does not push to remote.
 */

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createBuildFingerprint,
  packageDir,
  readFingerprint,
  sha256File,
  writeFingerprint,
  RUNTIME_HOUSE_PACKAGE_SOURCE,
} from "./lib/buildFingerprint.mjs";
import {
  assertSingleDistributionTree,
  distDir,
  ensureSingleDistributionTree,
} from "./lib/distributionTree.mjs";

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
 * Public production AI Delivery endpoint.
 * Not a secret. Every reproducible production Embed build must carry it,
 * otherwise createEmbedAIDelivery() intentionally resolves to disabled.
 */
const PUBLIC_AI_DELIVERY_URL =
  process.env.VITE_AI_DELIVERY_URL?.trim() ||
  "https://embed-engineai-delivery-edge-production.up.railway.app";

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

function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    cwd: packageDir,
    stdio: "inherit",
    env: { ...process.env, ...env },
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

function writeVersionJson(apiVersion, fingerprint) {
  if (apiVersion !== packageJson.version) {
    throw new Error(
      `Version mismatch: package.json=${packageJson.version} EMBED_VERSION=${apiVersion}. Keep them identical.`,
    );
  }

  const iifePath = path.join(distDir, "embed.iife.js");
  const esmPath = path.join(distDir, "embed.es.js");
  const iifeSha256 = sha256File(iifePath);
  const esmSha256 = sha256File(esmPath);

  const manifest = {
    name: packageJson.name,
    version: packageJson.version,
    apiVersion,
    freeze: "Architecture Freeze v0.1",
    fingerprint: {
      commit: fingerprint.commit,
      builtAt: fingerprint.builtAt,
      runtimeSource: fingerprint.runtimeSource,
      marker: fingerprint.marker,
      iifeSha256,
      esmSha256,
    },
    artifacts: {
      esm: "embed.es.js",
      iife: "embed.iife.js",
      types: "index.d.ts",
      sourcemaps: OPTIONAL_ARTIFACTS,
    },
    publicApi: ["Embed.mount", "Embed.unmount", "Embed.version", "Embed.build"],
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

function assertCompletePackage(fingerprint) {
  const missing = REQUIRED_ARTIFACTS.filter(
    (file) => !existsSync(path.join(distDir, file)),
  );
  if (missing.length > 0) {
    throw new Error(
      `Incomplete distribution package. Missing: ${missing.join(", ")}`,
    );
  }

  for (const file of ["embed.es.js", "embed.iife.js"]) {
    const content = readFileSync(path.join(distDir, file), "utf8");
    if (content.includes("/Users/") || content.includes("C:\\\\Users\\\\")) {
      throw new Error(
        `${file} contains absolute user path markers — refusing to ship.`,
      );
    }
    if (!content.includes(fingerprint.marker)) {
      throw new Error(`${file} missing build fingerprint marker — refusing to ship.`);
    }
    if (!content.includes(RUNTIME_HOUSE_PACKAGE_SOURCE)) {
      throw new Error(`${file} missing Runtime source string — refusing to ship.`);
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
  console.log(
    `  fingerprint: ${fingerprint.commit} @ ${fingerprint.builtAt} (${RUNTIME_HOUSE_PACKAGE_SOURCE})`,
  );
}

console.log("→ Single distribution tree (docs/embed ≡ packages/embed/dist)");
ensureSingleDistributionTree();
assertSingleDistributionTree();

console.log("→ Runtime build fingerprint");
const fingerprint = createBuildFingerprint();
writeFingerprint(fingerprint);
console.log(`  commit=${fingerprint.commit}`);
console.log(`  builtAt=${fingerprint.builtAt}`);
console.log(`  runtimeSource=${fingerprint.runtimeSource}`);

console.log("→ ESM bundle");
run("pnpm", ["exec", "vite", "build"], {
  VITE_AI_DELIVERY_URL: PUBLIC_AI_DELIVERY_URL,
});

console.log("→ IIFE bundle");
run(
  "pnpm",
  ["exec", "vite", "build", "--config", "vite.iife.config.ts"],
  {
    VITE_AI_DELIVERY_URL: PUBLIC_AI_DELIVERY_URL,
  },
);

console.log("→ TypeScript declarations");
run("pnpm", ["exec", "tsc", "--emitDeclarationOnly"]);

const apiVersion = readEmbedVersionFromSource();
console.log("→ version.json");
writeVersionJson(apiVersion, readFingerprint());

console.log("→ prune internal declarations");
pruneInternalDeclarations();

console.log("→ verify package");
assertCompletePackage(readFingerprint());

console.log("→ Runtime smoke");
run("node", ["./scripts/smoke-runtime.mjs"]);

// Host HTML + static assets only — JS already lives in docs/embed (no copy).
console.log("→ Finalize Pages host surfaces (same tree)");
run("node", ["./scripts/sync-pages.mjs"]);
assertSingleDistributionTree();
