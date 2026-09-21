#!/usr/bin/env node
/**
 * TASK 117 — compare committed Studio and Embed release provenance.
 *
 * Usage:
 *   node scripts/validate-canonical-release-provenance.mjs
 *     → Studio sourceGitSha must identify the same commit as Embed fingerprint.commit
 *
 *   node scripts/validate-canonical-release-provenance.mjs --require-head
 *     → also require both to identify the current Git HEAD (publish-time check)
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { evaluateCanonicalReleaseArtifacts } from "./lib/canonicalReleaseProvenance.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requireHead = process.argv.includes("--require-head");

function readJson(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!existsSync(absolutePath)) {
    return null;
  }
  return JSON.parse(readFileSync(absolutePath, "utf8"));
}

function currentHeadSha() {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
}

const studioRelease = readJson("docs/studio/release.json");
const embedVersion = readJson("docs/embed/version.json");
const sourceHeadSha = requireHead ? currentHeadSha() : null;

const result = evaluateCanonicalReleaseArtifacts({
  studioRelease,
  embedVersion,
  sourceHeadSha,
});

if (!result.ok) {
  console.error("PARITY_GUARD=FAIL");
  console.error(result.reason);
  console.error(`studioSourceGitSha=${result.studioSourceGitSha ?? "(missing)"}`);
  console.error(
    `embedFingerprintCommit=${result.embedFingerprintCommit ?? "(missing)"}`,
  );
  if (requireHead) {
    console.error(`sourceHeadSha=${sourceHeadSha}`);
  }
  process.exit(1);
}

console.log("PARITY_GUARD=PASS");
console.log(`studioSourceGitSha=${result.studioSourceGitSha}`);
console.log(`embedFingerprintCommit=${result.embedFingerprintCommit}`);
if (result.sourceHeadSha !== null) {
  console.log(`sourceHeadSha=${result.sourceHeadSha}`);
}
