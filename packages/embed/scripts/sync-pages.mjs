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
    <li><a href="./live.html"><strong>Live Launcher</strong></a> — Hero CTA → fullscreen Delivery Overlay</li>
    <li><a href="./embed.iife.js"><code>embed.iife.js</code></a> — global <code>Embed</code></li>
    <li><a href="./embed.es.js"><code>embed.es.js</code></a> — ESM</li>
    <li><a href="./version.json"><code>version.json</code></a> — manifest</li>
  </ul>
  <h2>Usage (Launcher Mode — partner default)</h2>
  <pre>&lt;button type="button" id="open-client-studio"&gt;Prozkoumat dům&lt;/button&gt;
&lt;script src="https://radimventus.github.io/embed-engine/embed/embed.iife.js?v=ux-01e"&gt;&lt;/script&gt;
&lt;script&gt;
  Embed.mount({
    mode: "launcher",
    launcher: "#open-client-studio",
    objectId: "house-modern-01",
    assetBase: "https://radimventus.github.io/embed-engine",
  });
&lt;/script&gt;</pre>
  <p>No inline Client Studio on load — CTA arms the Launcher. Hosts that already serve <code>/media</code> may omit <code>assetBase</code>.</p>
  <p>After publishing a new IIFE, bump the <code>?v=</code> query (or hard-refresh) so hosts are not stuck on a cached bundle.</p>
  <p>Inline / Standalone (explicit): <code>Embed.mount({ target: "#embed", objectId: "house-modern-01" })</code></p>
  <p>Legacy Garden (explicit opt-in only): <code>Embed.mount({ target: "#embed", fixture: "garden" })</code></p>
</body>
</html>
`;
  writeFileSync(path.join(pagesDir, "index.html"), html, "utf8");
}

function writeLiveHtml() {
  const html = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Embed — Launcher Experience (live)</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      font-family: Inter, system-ui, sans-serif;
      background: #f7f6f4;
      color: #001930;
    }
    .host-header {
      width: min(920px, calc(100% - 2rem));
      margin: 0 auto;
      padding: 1.25rem 0 0.75rem;
    }
    .host-eyebrow {
      margin: 0 0 0.35rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-size: 0.75rem;
      color: #5a6b60;
      font-weight: 700;
    }
    .host-main {
      width: min(920px, calc(100% - 2rem));
      margin: 0 auto;
      padding: 1rem 0 4rem;
    }
    .host-hero {
      padding: 2rem 0 1.5rem;
      border-top: 1px solid #e3e3e3;
    }
    .host-hero h2 {
      margin: 0;
      font-size: 1.75rem;
      line-height: 1.2;
    }
    .host-hero p {
      margin: 0.75rem 0 1.25rem;
      color: #4a5c52;
      max-width: 36rem;
    }
    .host-launcher {
      appearance: none;
      border: none;
      background: #001930;
      color: #f7f6f4;
      font: inherit;
      font-weight: 600;
      font-size: 1rem;
      padding: 0.85rem 1.25rem;
      cursor: pointer;
    }
    .host-filler {
      margin-top: 3rem;
      padding: 2rem 0;
      border-top: 1px solid #e3e3e3;
      color: #4a5c52;
    }
  </style>
</head>
<body>
  <header class="host-header">
    <p class="host-eyebrow">Partner website (host)</p>
    <h1>Reference House</h1>
    <p>
      Launcher Mode: žádný automatický inline mount. CTA otevře fullscreen
      Delivery Overlay → Reveal → social-proof → Experience. Close obnoví host.
    </p>
  </header>

  <main class="host-main">
    <section class="host-hero" id="host-hero">
      <h2>Prozkoumejte dům v Client Studio</h2>
      <p>
        Jediný vstupní bod. Client Studio není součástí stránky, dokud
        nekliknete na CTA.
      </p>
      <button type="button" id="open-client-studio" class="host-launcher">
        Prozkoumat dům
      </button>
    </section>
    <p class="host-filler">
      Partnerský obsah pod Hero — ověření scroll lock / restore po Close.
    </p>
    <p class="host-filler">Další blok hostitelské stránky.</p>
    <p class="host-filler">Ještě jeden blok, aby stránka byla delší než viewport.</p>
  </main>

  <script src="./embed.iife.js?v=ux-01e"></script>
  <script>
    Embed.mount({
      mode: "launcher",
      launcher: "#open-client-studio",
      objectId: "house-modern-01",
      assetBase: "https://radimventus.github.io/embed-engine",
      entryPoint: "hero-cta",
      launcherId: "open-client-studio",
    });
  </script>
</body>
</html>
`;
  writeFileSync(path.join(pagesDir, "live.html"), html, "utf8");
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
writeLiveHtml();
writeNoJekyll();

// Hero / Object media used by root-absolute `/media/...` URLs (not the full house-package catalog).
const mediaSource = path.join(
  rootDir,
  "apps/client-studio/public/media",
);
const mediaTarget = path.join(rootDir, "docs/media");
if (existsSync(mediaSource)) {
  rmSync(mediaTarget, { recursive: true, force: true });
  cpSync(mediaSource, mediaTarget, { recursive: true });
}

// Reference House Package assets for Tour (`/reference-house/...` + assetBase).
const referenceHouseSource = path.join(
  rootDir,
  "apps/client-studio/public/reference-house",
);
const referenceHouseTarget = path.join(rootDir, "docs/reference-house");
if (existsSync(referenceHouseSource)) {
  rmSync(referenceHouseTarget, { recursive: true, force: true });
  cpSync(referenceHouseSource, referenceHouseTarget, { recursive: true });
}

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
console.log("  - live.html");
console.log("  - ../.nojekyll");
if (existsSync(referenceHouseTarget)) {
  console.log("  - ../reference-house/ (Tour assets)");
}
