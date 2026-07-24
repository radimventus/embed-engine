/**
 * Shared Embed build fingerprint helpers (PT-DEPLOY-EMBED-01).
 * Fingerprint is generated only during build — never hand-edited.
 */

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsLibDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(scriptsLibDir, "../..");
const repoRoot = path.resolve(packageDir, "../..");
const buildDir = path.join(packageDir, ".build");
const fingerprintPath = path.join(buildDir, "fingerprint.json");

/** Canonical Runtime HousePackage author — must match object-house export. */
export const RUNTIME_HOUSE_PACKAGE_SOURCE =
  "builder-package/projectBuilderImportToHousePackage";

export const FINGERPRINT_MARKER_PREFIX = "EMBED_RUNTIME_BUILD:";

/**
 * @typedef {{
 *   readonly commit: string;
 *   readonly builtAt: string;
 *   readonly runtimeSource: string;
 *   readonly marker: string;
 * }} EmbedBuildFingerprint
 */

export function resolveGitCommit(cwd = repoRoot) {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      cwd,
      encoding: "utf8",
    }).trim();
  } catch {
    return "unknown";
  }
}

/** @param {Date} [now] @returns {EmbedBuildFingerprint} */
export function createBuildFingerprint(now = new Date()) {
  const commit = resolveGitCommit();
  const builtAt = now.toISOString().replace(/\.\d{3}Z$/, "Z");
  const marker = `${FINGERPRINT_MARKER_PREFIX}${commit}@${builtAt}`;
  return Object.freeze({
    commit,
    builtAt,
    runtimeSource: RUNTIME_HOUSE_PACKAGE_SOURCE,
    marker,
  });
}

/** @param {EmbedBuildFingerprint} fingerprint */
export function writeFingerprint(fingerprint) {
  mkdirSync(buildDir, { recursive: true });
  writeFileSync(
    fingerprintPath,
    `${JSON.stringify(fingerprint, null, 2)}\n`,
    "utf8",
  );
  return fingerprintPath;
}

/** @returns {EmbedBuildFingerprint} */
export function readFingerprint() {
  if (!existsSync(fingerprintPath)) {
    throw new Error(
      `Missing ${path.relative(repoRoot, fingerprintPath)}. Run embed build first.`,
    );
  }
  const raw = JSON.parse(readFileSync(fingerprintPath, "utf8"));
  if (
    typeof raw.commit !== "string" ||
    typeof raw.builtAt !== "string" ||
    raw.runtimeSource !== RUNTIME_HOUSE_PACKAGE_SOURCE ||
    typeof raw.marker !== "string"
  ) {
    throw new Error("Invalid embed build fingerprint.json");
  }
  return Object.freeze(raw);
}

export function sha256File(filePath) {
  const hash = createHash("sha256");
  hash.update(readFileSync(filePath));
  return hash.digest("hex");
}

export function assertFileContains(filePath, needle, label) {
  const content = readFileSync(filePath, "utf8");
  if (!content.includes(needle)) {
    throw new Error(
      `${label}: expected ${path.basename(filePath)} to contain ${JSON.stringify(needle)}`,
    );
  }
}

export function assertFilesIdentical(a, b, label) {
  const hashA = sha256File(a);
  const hashB = sha256File(b);
  if (hashA !== hashB) {
    throw new Error(
      `${label}: SHA-256 mismatch\n  ${a}\n    ${hashA}\n  ${b}\n    ${hashB}`,
    );
  }
}

export { packageDir, repoRoot, buildDir, fingerprintPath };
