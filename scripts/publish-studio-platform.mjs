#!/usr/bin/env node
/**
 * RC-002 — Publish CONIS Studio platform to docs/{builder,manager,sales}/
 * for GitHub Pages hosting on https://studio.conis.cz (and path aliases on conis.cz).
 *
 * Usage:
 *   pnpm studio:publish
 */

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STUDIO_ORIGIN = "https://studio.conis.cz";

const STUDIOS = [
  {
    id: "builder",
    filter: "@embed-engine/builder-studio",
    base: "/builder/",
    distRel: "apps/builder-studio/dist",
    outRel: "docs/builder",
  },
  {
    id: "manager",
    filter: "@embed-engine/manager-studio",
    base: "/manager/",
    distRel: "apps/manager-studio/dist",
    outRel: "docs/manager",
  },
  {
    id: "sales",
    filter: "@embed-engine/sales-studio",
    base: "/sales/",
    distRel: "apps/sales-studio/dist",
    outRel: "docs/sales",
  },
];

function fail(message) {
  console.error(`\nStudio publish FAILED\n${message}\n`);
  process.exit(1);
}

function run(label, command, args, env = {}) {
  console.log(`\n→ ${label}`);
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    env: { ...process.env, ...env },
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    fail(`${label} exited with code ${result.status ?? 1}`);
  }
}

function publishStudio(studio) {
  const distDir = path.join(repoRoot, studio.distRel);
  const outDir = path.join(repoRoot, studio.outRel);

  run(
    `Build ${studio.id} (base=${studio.base})`,
    "pnpm",
    ["--filter", studio.filter, "build"],
    {
      VITE_BASE: studio.base,
      VITE_PLATFORM_ORIGIN: STUDIO_ORIGIN,
      // Never bake local AI keys into public Studio bundles.
      VITE_OPENAI_API_KEY: "",
      VITE_OPENAI_MODEL: "",
      OPENAI_API_KEY: "",
    },
  );

  if (!existsSync(path.join(distDir, "index.html"))) {
    fail(`Missing ${studio.distRel}/index.html after build`);
  }

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(path.dirname(outDir), { recursive: true });
  cpSync(distDir, outDir, { recursive: true });

  // GitHub Pages SPA deep-link / refresh fallback
  const indexHtml = readFileSync(path.join(outDir, "index.html"), "utf8");
  writeFileSync(path.join(outDir, "404.html"), indexHtml);

  console.log(`  published → ${studio.outRel}/`);
}

function writeStudioRootHint() {
  const hintPath = path.join(repoRoot, "docs", "studio-host.html");
  writeFileSync(
    hintPath,
    `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0; url=/builder/" />
  <title>CONIS Studio</title>
  <script>location.replace('/builder/');</script>
</head>
<body>
  <p><a href="/builder/">Pokračovat do CONIS Studio</a></p>
</body>
</html>
`,
  );
}

console.log("════════════════════════════════════════════════════════");
console.log("RC-002 — Publish CONIS Studio platform");
console.log(`Origin: ${STUDIO_ORIGIN}`);
console.log("════════════════════════════════════════════════════════");

for (const studio of STUDIOS) {
  publishStudio(studio);
}
writeStudioRootHint();

console.log("\n════════════════════════════════════════════════════════");
console.log("Studio platform READY");
console.log("════════════════════════════════════════════════════════");
console.log("Paths:");
for (const studio of STUDIOS) {
  console.log(`  ${STUDIO_ORIGIN}${studio.base}`);
}
console.log("\nNext: commit docs/builder docs/manager docs/sales, push,");
console.log("ensure DNS CNAME studio.conis.cz → GitHub Pages.");
