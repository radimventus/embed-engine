#!/usr/bin/env node
/**
 * W-01A — Publish CONIS Studio platform to docs/studio/{builder,manager,sales}/
 * Public entry: https://conis.cz/studio
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
const STUDIO_ORIGIN = "https://conis.cz";

const STUDIOS = [
  {
    id: "builder",
    filter: "@embed-engine/builder-studio",
    base: "/studio/builder/",
    distRel: "apps/builder-studio/dist",
    outRel: "docs/studio/builder",
  },
  {
    id: "manager",
    filter: "@embed-engine/manager-studio",
    base: "/studio/manager/",
    distRel: "apps/manager-studio/dist",
    outRel: "docs/studio/manager",
  },
  {
    id: "sales",
    filter: "@embed-engine/sales-studio",
    base: "/studio/sales/",
    distRel: "apps/sales-studio/dist",
    outRel: "docs/studio/sales",
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

  const indexHtml = readFileSync(path.join(outDir, "index.html"), "utf8");
  writeFileSync(path.join(outDir, "404.html"), indexHtml);

  console.log(`  published → ${studio.outRel}/`);
}

function writeRedirect(filePath, targetPath) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(
    filePath,
    `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0; url=${targetPath}" />
  <title>CONIS Studio</title>
  <script>location.replace(${JSON.stringify(targetPath)});</script>
</head>
<body>
  <p><a href="${targetPath}">Pokračovat do CONIS Studio</a></p>
</body>
</html>
`,
  );
}

function writeStudioSurfaces() {
  const studioDir = path.join(repoRoot, "docs", "studio");
  mkdirSync(studioDir, { recursive: true });

  // Default entry → Builder (role redirect continues inside the app after login)
  writeRedirect(path.join(studioDir, "index.html"), "/studio/builder/");

  // Office reserved (W-01A) — not implemented yet
  writeRedirect(path.join(studioDir, "office", "index.html"), "/studio/");

  // Legacy path aliases from RC-002 (/builder → /studio/builder)
  for (const id of ["builder", "manager", "sales"]) {
    const legacyDir = path.join(repoRoot, "docs", id);
    rmSync(legacyDir, { recursive: true, force: true });
    writeRedirect(path.join(legacyDir, "index.html"), `/studio/${id}/`);
  }

  writeRedirect(path.join(repoRoot, "docs", "studio-host.html"), "/studio/");
}

console.log("════════════════════════════════════════════════════════");
console.log("W-01A — Publish CONIS Studio platform");
console.log(`Origin: ${STUDIO_ORIGIN}/studio`);
console.log("════════════════════════════════════════════════════════");

for (const studio of STUDIOS) {
  publishStudio(studio);
}
writeStudioSurfaces();

console.log("\n════════════════════════════════════════════════════════");
console.log("Studio platform READY");
console.log("════════════════════════════════════════════════════════");
console.log("Paths:");
console.log(`  ${STUDIO_ORIGIN}/studio/`);
for (const studio of STUDIOS) {
  console.log(`  ${STUDIO_ORIGIN}${studio.base}`);
}
console.log(`  ${STUDIO_ORIGIN}/studio/office/ (reserved)`);
