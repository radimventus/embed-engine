#!/usr/bin/env node
/**
 * Unified Reference House publish workflow (PT-INFRA-03).
 *
 * Orchestrates existing sync steps and validates content hashes across:
 *   packages/reference-house → public/reference-house → docs/reference-house
 *
 * Does not commit or push — operator publishes via git after a successful run.
 */

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const PACKAGE_ROOT = path.join(root, "packages/reference-house");
const PUBLIC_ROOT = path.join(
  root,
  "apps/client-studio/public/reference-house",
);
const DOCS_ROOT = path.join(root, "docs/reference-house");
const DIST_DIR = path.join(root, "packages/embed/dist");

const DIST_REQUIRED = [
  "embed.es.js",
  "embed.iife.js",
  "index.d.ts",
  "version.json",
];

const IGNORE_NAMES = new Set([".DS_Store"]);

function fail(message) {
  console.error(message);
  process.exit(1);
}

function runNode(scriptRelative, label) {
  const scriptPath = path.join(root, scriptRelative);
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: root,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    fail(`✗ ${label} failed (exit ${result.status ?? 1})`);
  }
}

function runPnpm(args, label) {
  const result = spawnSync("pnpm", args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    fail(`✗ ${label} failed (exit ${result.status ?? 1})`);
  }
}

function isEmbedDistUsable() {
  return DIST_REQUIRED.every((file) => existsSync(path.join(DIST_DIR, file)));
}

function ensureEmbedDist() {
  if (isEmbedDistUsable()) {
    console.log("✓ embed dist ready (build skipped)");
    return;
  }
  console.log("→ embed dist missing or incomplete — building…");
  runPnpm(["--filter", "@embed-engine/embed", "build"], "embed build");
  if (!isEmbedDistUsable()) {
    fail("✗ embed dist still unusable after build");
  }
  console.log("✓ embed dist built");
}

function listPublishedRelativePaths(baseDir) {
  const files = [];

  function walk(dir, relativeDir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (IGNORE_NAMES.has(entry.name)) {
        continue;
      }
      const absolute = path.join(dir, entry.name);
      const relative = relativeDir
        ? `${relativeDir}/${entry.name}`
        : entry.name;
      if (entry.isDirectory()) {
        walk(absolute, relative);
        continue;
      }
      if (entry.isFile()) {
        files.push(relative.split(path.sep).join("/"));
      }
    }
  }

  const houseJson = path.join(baseDir, "house.json");
  if (!existsSync(houseJson) || !statSync(houseJson).isFile()) {
    fail(`✗ Missing house.json in ${baseDir}`);
  }
  files.push("house.json");

  const assetsDir = path.join(baseDir, "assets");
  if (!existsSync(assetsDir) || !statSync(assetsDir).isDirectory()) {
    fail(`✗ Missing assets/ in ${baseDir}`);
  }
  walk(assetsDir, "assets");

  return files.sort();
}

function sha256File(filePath) {
  const hash = createHash("sha256");
  hash.update(readFileSync(filePath));
  return hash.digest("hex");
}

function reportMismatch(relativePath, packageHash, publicHash, docsHash) {
  console.error("✗ Asset mismatch detected");
  console.error("");
  console.error(`packages/reference-house/${relativePath}`);
  console.error(`  sha256 ${packageHash ?? "(missing)"}`);
  console.error("↓");
  console.error(`apps/client-studio/public/reference-house/${relativePath}`);
  console.error(`  sha256 ${publicHash ?? "(missing)"}`);
  console.error("↓");
  console.error(`docs/reference-house/${relativePath}`);
  console.error(`  sha256 ${docsHash ?? "(missing)"}`);
  process.exit(1);
}

function validatePublishedAssets() {
  const packageFiles = listPublishedRelativePaths(PACKAGE_ROOT);
  const publicFiles = listPublishedRelativePaths(PUBLIC_ROOT);
  const docsFiles = listPublishedRelativePaths(DOCS_ROOT);

  const packageSet = new Set(packageFiles);
  const publicSet = new Set(publicFiles);
  const docsSet = new Set(docsFiles);

  const all = new Set([...packageSet, ...publicSet, ...docsSet]);

  for (const relative of [...all].sort()) {
    const inPackage = packageSet.has(relative);
    const inPublic = publicSet.has(relative);
    const inDocs = docsSet.has(relative);

    if (!inPackage || !inPublic || !inDocs) {
      reportMismatch(
        relative,
        inPackage
          ? sha256File(path.join(PACKAGE_ROOT, relative))
          : null,
        inPublic ? sha256File(path.join(PUBLIC_ROOT, relative)) : null,
        inDocs ? sha256File(path.join(DOCS_ROOT, relative)) : null,
      );
    }

    const packageHash = sha256File(path.join(PACKAGE_ROOT, relative));
    const publicHash = sha256File(path.join(PUBLIC_ROOT, relative));
    const docsHash = sha256File(path.join(DOCS_ROOT, relative));

    if (packageHash !== publicHash || publicHash !== docsHash) {
      reportMismatch(relative, packageHash, publicHash, docsHash);
    }
  }

  return packageFiles.length;
}

function main() {
  if (!existsSync(path.join(PACKAGE_ROOT, "house.json"))) {
    fail(`✗ Missing ${PACKAGE_ROOT}/house.json`);
  }

  const validateOnly = process.argv.includes("--validate-only");

  console.log(
    validateOnly
      ? "Reference House publish validation"
      : "Reference House publish workflow",
  );
  console.log("");

  if (!validateOnly) {
    runNode(
      "scripts/sync-reference-house-public.mjs",
      "packages → public sync",
    );
    console.log("✓ packages → public");

    ensureEmbedDist();

    runNode("packages/embed/scripts/sync-pages.mjs", "public → docs sync");
    console.log("✓ public → docs");
  }

  const verifiedCount = validatePublishedAssets();
  console.log("✓ Asset validation OK");
  console.log(`✓ ${verifiedCount} files verified`);
  console.log("");
  if (validateOnly) {
    console.log("Validation completed.");
    return;
  }
  console.log("Publish workflow completed.");
  console.log(
    "Next: commit docs/reference-house (+ public/packages copies) and push the Pages branch.",
  );
}

main();
