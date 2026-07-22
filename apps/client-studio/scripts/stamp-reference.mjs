#!/usr/bin/env node
/**
 * Stamp REFERENCE.json after a conscious Reference Build freeze.
 */

import { execSync } from "node:child_process";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(rootDir, "..");
const outDir = path.join(appDir, "reference-build");
const packageJson = JSON.parse(
  readFileSync(path.join(appDir, "package.json"), "utf8"),
);

if (!existsSync(path.join(outDir, "index.html"))) {
  throw new Error(
    "reference-build/index.html missing — run reference:freeze build first",
  );
}

let gitCommit = "unknown";
let gitBranch = "unknown";
try {
  gitCommit = execSync("git rev-parse HEAD", {
    cwd: appDir,
    encoding: "utf8",
  }).trim();
  gitBranch = execSync("git rev-parse --abbrev-ref HEAD", {
    cwd: appDir,
    encoding: "utf8",
  }).trim();
} catch {
  // offline / non-git — leave unknown
}

const manifest = {
  id: "client-studio-reference-build",
  title: "Client Studio Reference Build",
  purpose: "Frozen visual / UX etalon for regression and comparison",
  package: packageJson.name,
  packageVersion: packageJson.version,
  frozenAt: new Date().toISOString(),
  sourceCommit: gitCommit,
  sourceBranch: gitBranch,
  serve: {
    command: "pnpm --filter @embed-engine/client-studio reference",
    url: "http://127.0.0.1:5174/",
    host: "127.0.0.1",
    port: 5174,
  },
  updatePolicy:
    "Replace only after an explicit team decision. Never auto-update from day-to-day development. Procedure: pnpm --filter @embed-engine/client-studio reference:freeze && commit reference-build/.",
  notFor: [
    "day-to-day development",
    "experimental feature flags",
    "production Embed delivery (use GitHub Pages IIFE)",
  ],
};

writeFileSync(
  path.join(outDir, "REFERENCE.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(`Stamped ${path.join(outDir, "REFERENCE.json")}`);
console.log(`  frozenAt: ${manifest.frozenAt}`);
console.log(`  sourceCommit: ${manifest.sourceCommit}`);
