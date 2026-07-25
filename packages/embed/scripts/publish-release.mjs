#!/usr/bin/env node
/**
 * CAP-RLS-01 — Official Embed Release Snapshot publish.
 *
 * Single entry for preparing docs/embed from the current Runtime source.
 * Does not push to git / GitHub Pages (operator commits + pushes docs/embed).
 *
 * Usage:
 *   pnpm embed:publish
 *     → build Release Snapshot into docs/embed + Release Validation
 *
 *   pnpm embed:publish -- --remote
 *     → Remote Validation only (never builds)
 *     → validates existing docs/embed against GitHub Pages
 *
 *   pnpm embed:publish -- --validate-only
 *     → local Release Validation only (never builds)
 *
 * If a new snapshot is required, run `pnpm embed:publish` (without --remote)
 * explicitly first, then commit/push, then `--remote`.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  packageDir,
  readFingerprint,
  repoRoot,
  RUNTIME_HOUSE_PACKAGE_SOURCE,
  sha256File,
} from "./lib/buildFingerprint.mjs";
import {
  assertSingleDistributionTree,
  pagesDir,
} from "./lib/distributionTree.mjs";

const PAGES_ORIGIN = "https://radimventus.github.io/embed-engine";
const ARTIFACTS = ["embed.iife.js", "embed.es.js", "version.json"];

const wantRemote = process.argv.includes("--remote");
const validateOnly = process.argv.includes("--validate-only");
/** Remote / validate-only must never mint a new fingerprint. */
const skipBuild = wantRemote || validateOnly;

function banner(title) {
  const line = "═".repeat(56);
  console.log(`\n${line}`);
  console.log(title);
  console.log(line);
}

function fail(message) {
  banner(wantRemote || validateOnly ? "Validation FAILED" : "Publish FAILED");
  console.error(message);
  if (!skipBuild) {
    console.error("\nRelease Snapshot was NOT marked READY.");
  }
  process.exit(1);
}

function run(label, command, args, cwd = packageDir) {
  console.log(`\n→ ${label}`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    fail(`${label} exited with code ${result.status ?? 1}`);
  }
}

function readVersionJson() {
  const versionPath = path.join(pagesDir, "version.json");
  if (!existsSync(versionPath)) {
    fail(
      `Missing docs/embed/version.json.\nRun \`pnpm embed:publish\` first to create a Release Snapshot.`,
    );
  }
  return JSON.parse(readFileSync(versionPath, "utf8"));
}

/**
 * Fingerprint for validation:
 * - after build → packages/embed/.build/fingerprint.json
 * - --remote / --validate-only → docs/embed/version.json (Release Snapshot SSOT)
 */
function resolveValidationFingerprint(versionJson) {
  if (skipBuild) {
    const fp = versionJson.fingerprint;
    if (
      !fp ||
      typeof fp.commit !== "string" ||
      typeof fp.builtAt !== "string" ||
      typeof fp.marker !== "string" ||
      fp.runtimeSource !== RUNTIME_HOUSE_PACKAGE_SOURCE
    ) {
      fail(
        "docs/embed/version.json fingerprint is incomplete or invalid.\nRun `pnpm embed:publish` to rebuild the Release Snapshot.",
      );
    }
    return {
      commit: fp.commit,
      builtAt: fp.builtAt,
      runtimeSource: fp.runtimeSource,
      marker: fp.marker,
    };
  }
  return readFingerprint();
}

function validateLocalRelease() {
  console.log("\n→ Release Validation (local snapshot)");
  assertSingleDistributionTree();

  const versionJson = readVersionJson();
  const fingerprint = resolveValidationFingerprint(versionJson);

  for (const file of ARTIFACTS) {
    const pagesFile = path.join(pagesDir, file);
    if (!existsSync(pagesFile)) {
      fail(`Missing docs/embed/${file}`);
    }
  }

  const iife = path.join(pagesDir, "embed.iife.js");

  if (versionJson.fingerprint?.marker !== fingerprint.marker) {
    fail(
      `version.json fingerprint does not match expected fingerprint\n  expected: ${fingerprint.marker}\n  version:  ${versionJson.fingerprint?.marker ?? "(missing)"}`,
    );
  }
  if (versionJson.fingerprint?.runtimeSource !== RUNTIME_HOUSE_PACKAGE_SOURCE) {
    fail("version.json Runtime source mismatch");
  }

  const iifeSha = sha256File(iife);
  if (versionJson.fingerprint?.iifeSha256 !== iifeSha) {
    fail("version.json iifeSha256 does not match docs/embed/embed.iife.js");
  }

  const iifeText = readFileSync(iife, "utf8");
  if (!iifeText.includes(fingerprint.marker)) {
    fail("embed.iife.js does not contain build fingerprint marker");
  }
  if (!iifeText.includes(RUNTIME_HOUSE_PACKAGE_SOURCE)) {
    fail("embed.iife.js does not contain Runtime source string");
  }

  // Public Pages must never ship developer API keys (push protection / partner hosts).
  if (/sk-[A-Za-z0-9_-]{20,}/.test(iifeText) || /sk-proj-/.test(iifeText)) {
    fail(
      "embed.iife.js appears to contain an API key secret — refuse public Release Snapshot",
    );
  }

  const distIife = path.join(packageDir, "dist", "embed.iife.js");
  if (sha256File(distIife) !== iifeSha) {
    fail("packages/embed/dist/embed.iife.js ≠ docs/embed/embed.iife.js");
  }

  console.log(`  marker:       ${fingerprint.marker}`);
  console.log(`  runtime:      ${RUNTIME_HOUSE_PACKAGE_SOURCE}`);
  console.log(`  iifeSha256:   ${iifeSha}`);
  console.log(`  tree:         docs/embed ≡ packages/embed/dist`);
  console.log("  Release Validation PASS");

  return { fingerprint, versionJson, iifeSha };
}

async function validateRemotePages(fingerprint, versionJson) {
  console.log("\n→ Remote Validation (GitHub Pages — no rebuild)");
  const versionUrl = `${PAGES_ORIGIN}/embed/version.json`;
  const iifeUrl = `${PAGES_ORIGIN}/embed/embed.iife.js`;

  const versionRes = await fetch(versionUrl, { cache: "no-store" });
  if (!versionRes.ok) {
    fail(`Remote version.json HTTP ${versionRes.status}: ${versionUrl}`);
  }
  const remoteVersion = await versionRes.json();

  if (remoteVersion.fingerprint?.marker !== fingerprint.marker) {
    fail(
      `Remote Pages fingerprint mismatch.\n  local Release Snapshot: ${fingerprint.marker}\n  Published Embed:        ${remoteVersion.fingerprint?.marker ?? "(missing)"}\n\nIf you need a new snapshot, run \`pnpm embed:publish\` (build), commit + push docs/embed,\nwait for Pages, then re-run:\n  pnpm embed:publish -- --remote`,
    );
  }

  const iifeRes = await fetch(iifeUrl, { cache: "no-store" });
  if (!iifeRes.ok) {
    fail(`Remote IIFE HTTP ${iifeRes.status}: ${iifeUrl}`);
  }
  const remoteIife = await iifeRes.text();
  if (!remoteIife.includes(fingerprint.marker)) {
    fail("Remote IIFE does not contain Release Snapshot fingerprint marker");
  }

  const { createHash } = await import("node:crypto");
  const hash = createHash("sha256").update(remoteIife).digest("hex");
  if (hash !== versionJson.fingerprint.iifeSha256) {
    fail(
      `Remote IIFE SHA-256 mismatch\n  local Release Snapshot: ${versionJson.fingerprint.iifeSha256}\n  Published Embed:        ${hash}`,
    );
  }

  console.log(`  remote marker matches ${fingerprint.commit}`);
  console.log("  Remote Validation PASS");
}

banner(
  skipBuild
    ? "CAP-RLS-01 — Embed Release Validation (no build)"
    : "CAP-RLS-01 — Embed Release Snapshot publish",
);
console.log("Official path: pnpm embed:publish");
console.log(`Repo: ${repoRoot}`);
if (wantRemote) {
  console.log(
    "Mode: Remote Validation — existing docs/embed vs GitHub Pages (never rebuilds)",
  );
} else if (validateOnly) {
  console.log("Mode: local Release Validation only (never rebuilds)");
}

if (!skipBuild) {
  run(
    "Build Release Snapshot (docs/embed)",
    "node",
    ["./scripts/build-distribution.mjs"],
  );
} else {
  console.log("\n→ Skip build (validate existing Release Snapshot in docs/embed)");
}

let release;
try {
  release = validateLocalRelease();
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

if (wantRemote) {
  try {
    await validateRemotePages(release.fingerprint, release.versionJson);
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
}

banner(wantRemote ? "Remote Validation READY" : "Release Snapshot READY");
console.log(`marker:     ${release.fingerprint.marker}`);
console.log(`builtAt:    ${release.fingerprint.builtAt}`);
console.log(`iifeSha256: ${release.iifeSha}`);
console.log(`artifacts:  ${path.relative(repoRoot, pagesDir)}/`);
console.log("");
if (!skipBuild) {
  console.log("Next (GitHub Pages deploy):");
  console.log(
    "  1. git add docs/embed docs/house-package docs/media docs/reference-house docs/.nojekyll",
  );
  console.log('  2. git commit -m "chore(embed): publish release snapshot"');
  console.log("  3. git push");
  console.log(
    "  4. pnpm embed:publish -- --remote   # Remote Validation only (never rebuilds)",
  );
  console.log("");
}
console.log("Local Runtime / Embed Demo (no publish needed):");
console.log("  Local:      pnpm --filter @embed-engine/client-studio dev");
console.log("  Embed Demo: pnpm --filter @embed-engine/embed demo");
