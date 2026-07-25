/**
 * PT-DEPLOY-EMBED-01 — Validate the single distribution tree (docs/embed).
 * Optional: --remote to fetch published GitHub Pages artifacts.
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  assertFileContains,
  readFingerprint,
  RUNTIME_HOUSE_PACKAGE_SOURCE,
  sha256File,
} from "./lib/buildFingerprint.mjs";
import {
  assertSingleDistributionTree,
  pagesDir,
} from "./lib/distributionTree.mjs";

const PAGES_ORIGIN = "https://radimventus.github.io/embed-engine";

const ARTIFACTS = ["embed.iife.js", "embed.es.js", "version.json"];

function assertLocalDistribution() {
  assertSingleDistributionTree();
  const fingerprint = readFingerprint();
  console.log("→ Validate single distribution tree (docs/embed ≡ dist)");

  for (const file of ARTIFACTS) {
    const pagesFile = path.join(pagesDir, file);
    if (!existsSync(pagesFile)) {
      throw new Error(`Missing docs/embed/${file} — run build first`);
    }
  }

  const iife = path.join(pagesDir, "embed.iife.js");
  assertFileContains(iife, fingerprint.marker, "pages IIFE fingerprint");
  assertFileContains(iife, RUNTIME_HOUSE_PACKAGE_SOURCE, "pages IIFE Runtime source");

  const versionJson = JSON.parse(
    readFileSync(path.join(pagesDir, "version.json"), "utf8"),
  );
  if (versionJson.fingerprint?.marker !== fingerprint.marker) {
    throw new Error("docs/embed/version.json fingerprint does not match build fingerprint");
  }
  if (versionJson.fingerprint?.iifeSha256 !== sha256File(iife)) {
    throw new Error("docs/embed/version.json iifeSha256 does not match docs/embed/embed.iife.js");
  }

  console.log(`  commit: ${fingerprint.commit}`);
  console.log(`  builtAt: ${fingerprint.builtAt}`);
  console.log(`  iifeSha256: ${versionJson.fingerprint.iifeSha256}`);
  console.log("Local distribution validation PASS");
  return { fingerprint, versionJson };
}

async function assertRemotePages(fingerprint, versionJson) {
  console.log("→ Validate published GitHub Pages");
  const versionUrl = `${PAGES_ORIGIN}/embed/version.json`;
  const iifeUrl = `${PAGES_ORIGIN}/embed/embed.iife.js`;

  const versionRes = await fetch(versionUrl, { cache: "no-store" });
  if (!versionRes.ok) {
    throw new Error(`Remote version.json HTTP ${versionRes.status}: ${versionUrl}`);
  }
  const remoteVersion = await versionRes.json();

  if (remoteVersion.fingerprint?.marker !== fingerprint.marker) {
    throw new Error(
      `Remote Pages fingerprint mismatch.\n  local:  ${fingerprint.marker}\n  remote: ${remoteVersion.fingerprint?.marker ?? "(missing)"}\nPush docs/embed and wait for Pages, or omit --remote until published.`,
    );
  }
  if (remoteVersion.fingerprint?.runtimeSource !== RUNTIME_HOUSE_PACKAGE_SOURCE) {
    throw new Error("Remote version.json Runtime source mismatch");
  }

  const iifeRes = await fetch(iifeUrl, { cache: "no-store" });
  if (!iifeRes.ok) {
    throw new Error(`Remote IIFE HTTP ${iifeRes.status}: ${iifeUrl}`);
  }
  const remoteIife = await iifeRes.text();
  if (!remoteIife.includes(fingerprint.marker)) {
    throw new Error("Remote IIFE does not contain local build fingerprint marker");
  }
  if (!remoteIife.includes(RUNTIME_HOUSE_PACKAGE_SOURCE)) {
    throw new Error("Remote IIFE does not contain Runtime source string");
  }

  const { createHash } = await import("node:crypto");
  const hash = createHash("sha256").update(remoteIife).digest("hex");
  if (hash !== versionJson.fingerprint.iifeSha256) {
    throw new Error(
      `Remote IIFE SHA-256 mismatch vs local build\n  local:  ${versionJson.fingerprint.iifeSha256}\n  remote: ${hash}`,
    );
  }

  console.log(`  remote version.json fingerprint matches ${fingerprint.commit}`);
  console.log("Remote Pages validation PASS");
}

async function main() {
  const remote = process.argv.includes("--remote");
  const { fingerprint, versionJson } = assertLocalDistribution();
  if (remote) {
    await assertRemotePages(fingerprint, versionJson);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
