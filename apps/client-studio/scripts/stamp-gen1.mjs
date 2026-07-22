#!/usr/bin/env node
/**
 * Stamp GEN1.json after a conscious Client Studio Gen1 freeze.
 */

import { execSync } from "node:child_process";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(rootDir, "..");
const outDir = path.join(appDir, "gen1");
const packageJson = JSON.parse(
  readFileSync(path.join(appDir, "package.json"), "utf8"),
);

if (!existsSync(path.join(outDir, "index.html"))) {
  throw new Error("gen1/index.html missing — run cs:gen1:freeze build first");
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
  // offline / non-git
}

const manifest = {
  generation: "Gen1",
  type: "Static Client Studio",
  status: "Frozen",
  runtime: "current",
  createdFrom: gitCommit,
  sourceBranch: gitBranch,
  packageVersion: packageJson.version,
  frozenAt: new Date().toISOString(),
  description: "Last Client Studio before Decision Experience",
  serve: {
    command: "pnpm cs:gen1",
    url: "http://127.0.0.1:5175/",
    host: "127.0.0.1",
    port: 5175,
  },
  updatePolicy:
    "Replace only after an explicit team decision. Never auto-update from day-to-day development. Procedure: pnpm cs:gen1:freeze && commit apps/client-studio/gen1/.",
  includes: [
    "Hero",
    "Media Explorer",
    "House Navigator",
    "Priority (input UI)",
    "FAQ / advisor chrome (static presentation as shipped at freeze)",
    "Lead Capture",
    "Design tokens and assets at freeze time",
  ],
  excludes: [
    "Decision Experience (product stage after Gen1)",
    "Interpretation as a first-class product layer",
    "Recommendation intelligence beyond freeze-time UI",
    "Adaptive Experience",
    "Day-to-day development on :4173",
  ],
};

writeFileSync(
  path.join(outDir, "GEN1.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(`Stamped ${path.join(outDir, "GEN1.json")}`);
console.log(`  createdFrom: ${manifest.createdFrom}`);
console.log(`  frozenAt: ${manifest.frozenAt}`);
