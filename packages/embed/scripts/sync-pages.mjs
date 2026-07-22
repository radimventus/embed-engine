#!/usr/bin/env node
/**
 * Sync production distribution package into the GitHub Pages publish directory.
 *
 * Source: packages/embed/dist/ (M3/S1)
 * Target: docs/embed/     (served when Pages source = /docs)
 *
 * Does not enable Pages or push to remote — that is an operator step.
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
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const distDir = path.join(rootDir, "packages/embed/dist");
const pagesDir = path.join(rootDir, "docs/embed");

const REQUIRED = ["embed.es.js", "embed.iife.js", "index.d.ts", "version.json"];

const PUBLIC_FILES = [
  "embed.es.js",
  "embed.es.js.map",
  "embed.iife.js",
  "embed.iife.js.map",
  "version.json",
  "index.d.ts",
  "Embed.d.ts",
  "fixtures.d.ts",
  "mount.d.ts",
  "unmount.d.ts",
  "version.d.ts",
  "delivery/types.d.ts",
  // declaration maps for editors (optional but small)
  "index.d.ts.map",
  "Embed.d.ts.map",
  "fixtures.d.ts.map",
  "mount.d.ts.map",
  "unmount.d.ts.map",
  "version.d.ts.map",
  "delivery/types.d.ts.map",
];

function assertDistReady() {
  const missing = REQUIRED.filter((file) => !existsSync(path.join(distDir, file)));
  if (missing.length > 0) {
    throw new Error(
      `Missing dist artifacts: ${missing.join(", ")}. Run: pnpm --filter @embed-engine/embed build`,
    );
  }
}

function writeIndexHtml(version) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Embed Engine — Distribution ${version}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; color: #1c2b22; }
    code, pre { background: #f0f4f1; padding: 0.15rem 0.35rem; border-radius: 0.25rem; }
    pre { padding: 0.75rem 1rem; overflow: auto; }
    a { color: #2f6b4f; }
  </style>
</head>
<body>
  <h1>Embed Engine distribution</h1>
  <p>Version <strong>${version}</strong> — public artifacts for host pages.</p>
  <ul>
    <li><a href="./embed.iife.js"><code>embed.iife.js</code></a> — global <code>Embed</code></li>
    <li><a href="./embed.es.js"><code>embed.es.js</code></a> — ESM</li>
    <li><a href="./version.json"><code>version.json</code></a> — manifest</li>
  </ul>
  <h2>Usage</h2>
  <pre>&lt;script src="https://radimventus.github.io/embed-engine/embed/embed.iife.js"&gt;&lt;/script&gt;
&lt;script&gt;
  Embed.mount({ target: "#embed", objectId: "house-modern-01" });
&lt;/script&gt;</pre>
  <p>Legacy Garden (explicit opt-in only): <code>Embed.mount({ target: "#embed", fixture: "garden" })</code></p>
</body>
</html>
`;
  writeFileSync(path.join(pagesDir, "index.html"), html, "utf8");
}

function writeNoJekyll() {
  // Ensure GitHub Pages does not process artifacts with Jekyll.
  writeFileSync(path.join(rootDir, "docs/.nojekyll"), "", "utf8");
}

assertDistReady();

const versionJson = JSON.parse(
  readFileSync(path.join(distDir, "version.json"), "utf8"),
);

rmSync(pagesDir, { recursive: true, force: true });
mkdirSync(pagesDir, { recursive: true });

for (const file of PUBLIC_FILES) {
  const source = path.join(distDir, file);
  if (!existsSync(source)) continue;
  cpSync(source, path.join(pagesDir, file));
}

writeIndexHtml(versionJson.version);
writeNoJekyll();

const publishedIife = path.join(pagesDir, "embed.iife.js");
const publishedVersion = JSON.parse(
  readFileSync(path.join(pagesDir, "version.json"), "utf8"),
);

if (publishedVersion.version !== versionJson.version) {
  throw new Error("Published version.json does not match dist version.json");
}
if (!existsSync(publishedIife)) {
  throw new Error("embed.iife.js missing from docs/embed after sync");
}

console.log(`Synced distribution ${versionJson.version} → docs/embed/`);
console.log("Public files:");
for (const file of PUBLIC_FILES) {
  if (existsSync(path.join(pagesDir, file))) {
    console.log(`  - ${file}`);
  }
}
console.log("  - index.html");
console.log("  - ../.nojekyll");
