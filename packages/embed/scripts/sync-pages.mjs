#!/usr/bin/env node
/**
 * Finalize GitHub Pages host surfaces in the single distribution tree.
 *
 * JS/types are already written by Vite/tsc into docs/embed.
 * packages/embed/dist is a symlink to that tree — this script does NOT copy bundles.
 */

import {
  cpSync,
  existsSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import {
  assertFileContains,
  packageDir,
  readFingerprint,
  repoRoot,
  RUNTIME_HOUSE_PACKAGE_SOURCE,
  sha256File,
} from "./lib/buildFingerprint.mjs";
import {
  assertSingleDistributionTree,
  distDir,
  pagesDir,
} from "./lib/distributionTree.mjs";

const REQUIRED = ["embed.es.js", "embed.iife.js", "index.d.ts", "version.json"];

/** Public Pages origin for production partner hosts (absolute URLs required). */
const PAGES_ORIGIN = "https://radimventus.github.io/embed-engine";

/**
 * Public AI Delivery Edge URL (Method A host bootstrap).
 * Prefer VITE_AI_DELIVERY_URL (same as IIFE bake) or EMBED_AI_DELIVERY_URL.
 * Never an OpenAI secret.
 */
const AI_DELIVERY_URL = (
  process.env.VITE_AI_DELIVERY_URL?.trim() ||
  process.env.EMBED_AI_DELIVERY_URL?.trim() ||
  ""
).replace(/\/$/, "");

function aiDeliveryHostBootstrap() {
  if (AI_DELIVERY_URL.length === 0) {
    return "";
  }
  return `<script>
  window.__EMBED_AI_DELIVERY__ = { deliveryUrl: ${JSON.stringify(AI_DELIVERY_URL)} };
</script>
`;
}

/**
 * Official partner distribution fragment — derived from Embed.mount launcher API.
 * Cache-bust query is the build commit from the automatic fingerprint.
 */
function buildOfficialPartnerSnippet(cacheBust) {
  const scriptSrc = `${PAGES_ORIGIN}/embed/embed.iife.js?v=${cacheBust}`;
  const deliveryBootstrap = aiDeliveryHostBootstrap();
  return `<!-- BEGIN OFFICIAL PARTNER SNIPPET -->
<div id="embed-hero"></div>
${deliveryBootstrap}<script src="${scriptSrc}"></script>
<script>
  Embed.mount({
    mode: "launcher",
    target: "#embed-hero",
    objectId: "house-modern-01",
    assetBase: "${PAGES_ORIGIN}",
    entryPoint: "hero-cta",
    launcherId: "embed-hero"
  });
</script>
<!-- END OFFICIAL PARTNER SNIPPET -->`;
}

function assertTreeReady() {
  assertSingleDistributionTree();

  const missing = REQUIRED.filter((file) => !existsSync(path.join(pagesDir, file)));
  if (missing.length > 0) {
    throw new Error(
      `Missing distribution artifacts: ${missing.join(", ")}. Run: pnpm --filter @embed-engine/embed build`,
    );
  }

  const fingerprint = readFingerprint();
  const versionJson = JSON.parse(
    readFileSync(path.join(pagesDir, "version.json"), "utf8"),
  );

  if (!versionJson.fingerprint) {
    throw new Error(
      "version.json missing fingerprint — rebuild with current build-distribution.mjs",
    );
  }
  if (versionJson.fingerprint.marker !== fingerprint.marker) {
    throw new Error(
      "version.json fingerprint does not match .build/fingerprint.json — rebuild",
    );
  }
  if (versionJson.fingerprint.runtimeSource !== RUNTIME_HOUSE_PACKAGE_SOURCE) {
    throw new Error("version.json Runtime source mismatch");
  }

  const iifePath = path.join(pagesDir, "embed.iife.js");
  const iifeSha = sha256File(iifePath);
  if (versionJson.fingerprint.iifeSha256 !== iifeSha) {
    throw new Error(
      "version.json iifeSha256 does not match embed.iife.js — rebuild",
    );
  }

  assertFileContains(iifePath, fingerprint.marker, "IIFE fingerprint");
  assertFileContains(
    iifePath,
    RUNTIME_HOUSE_PACKAGE_SOURCE,
    "IIFE Runtime source",
  );

  return { fingerprint, versionJson };
}

function writeIndexHtml(version, cacheBust) {
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
  <p>Version <strong>${version}</strong> — build <code>${cacheBust}</code> — public artifacts for host pages.</p>
  <ul>
    <li><a href="./live.html"><strong>Live Launcher</strong></a> — Embed Hero → fullscreen Delivery Overlay</li>
    <li><a href="./partner-snippet.html"><strong>Partner snippet</strong></a> — copy-paste for DSE / WordPress</li>
    <li><a href="./embed.iife.js"><code>embed.iife.js</code></a> — global <code>Embed</code></li>
    <li><a href="./embed.es.js"><code>embed.es.js</code></a> — ESM</li>
    <li><a href="./version.json"><code>version.json</code></a> — manifest + Runtime fingerprint</li>
  </ul>
  <h2>Usage (Launcher Mode — Embed Hero)</h2>
  <pre>${buildOfficialPartnerSnippet(cacheBust)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")}</pre>
  <p>Copy the official snippet from <a href="./OFFICIAL-PARTNER-SNIPPET.html">OFFICIAL-PARTNER-SNIPPET.html</a> (absolute script URL required on partner hosts).</p>
  <p>After publishing a new IIFE, the <code>?v=</code> query is the build commit (automatic fingerprint). Hard-refresh if a CDN/browser cache sticks.</p>
  <p>Inline / Standalone (explicit): <code>Embed.mount({ target: "#embed", objectId: "house-modern-01" })</code></p>
  <p>Legacy Garden (explicit opt-in only): <code>Embed.mount({ target: "#embed", fixture: "garden" })</code></p>
  <p>Verify console on mount: <code>Embed Runtime</code> / <code>Build:</code> / <code>Runtime:</code> / <code>Built:</code>.</p>
</body>
</html>
`;
  writeFileSync(path.join(pagesDir, "index.html"), html, "utf8");
}

function writeLiveHtml(cacheBust) {
  const html = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Embed — Release snapshot launcher (not Live Runtime)</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      font-family: Inter, system-ui, sans-serif;
      background: #f7f6f4;
      color: #001930;
    }
    .host-header {
      width: min(1432px, calc(100% - 2rem));
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
      width: min(1432px, calc(100% - 2rem));
      margin: 0 auto;
      padding: 1rem 0 4rem;
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
    <p class="host-eyebrow">Partner website (host) · RELEASE SNAPSHOT (docs/embed IIFE)</p>
    <h1>Reference House</h1>
    <p>
      Embed Hero je první scéna Experience na partnerské stránce.
      CTA otevře Client Studio jako plynulé pokračování.
    </p>
  </header>

  <main class="host-main">
    <div id="embed-hero"></div>
    <p class="host-filler">
      Partnerský obsah pod Hero — ověření scroll lock / restore po Close.
    </p>
    <p class="host-filler">Další blok hostitelské stránky.</p>
    <p class="host-filler">Ještě jeden blok, aby stránka byla delší než viewport.</p>
  </main>

  <script src="${PAGES_ORIGIN}/embed/embed.iife.js?v=${cacheBust}"></script>
  ${aiDeliveryHostBootstrap()}  <script>
    Embed.mount({
      mode: "launcher",
      target: "#embed-hero",
      objectId: "house-modern-01",
      assetBase: "${PAGES_ORIGIN}",
      entryPoint: "hero-cta",
      launcherId: "embed-hero",
    });
  </script>
</body>
</html>
`;
  writeFileSync(path.join(pagesDir, "live.html"), html, "utf8");
}

function writePartnerSnippetHtml(cacheBust) {
  const snippet = buildOfficialPartnerSnippet(cacheBust);
  writeFileSync(path.join(pagesDir, "OFFICIAL-PARTNER-SNIPPET.html"), `${snippet}\n`, "utf8");

  const html = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Partner Embed — Official Snippet Harness</title>
  <style>
    body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #f7f6f4; color: #001930; }
    main { width: min(1432px, calc(100% - 2rem)); margin: 0 auto; padding: 2rem 0 4rem; }
  </style>
</head>
<body>
  <main>
${snippet}
  </main>
</body>
</html>
`;
  writeFileSync(path.join(pagesDir, "partner-snippet.html"), html, "utf8");
}

function writeNoJekyll() {
  writeFileSync(path.join(repoRoot, "docs/.nojekyll"), "", "utf8");
}

function syncStaticHostAssets() {
  const mediaSource = path.join(repoRoot, "apps/client-studio/public/media");
  const mediaTarget = path.join(repoRoot, "docs/media");
  if (existsSync(mediaSource)) {
    rmSync(mediaTarget, { recursive: true, force: true });
    cpSync(mediaSource, mediaTarget, { recursive: true });
  }

  const housePackageSource = path.join(
    repoRoot,
    "apps/client-studio/public/house-package",
  );
  const housePackageTarget = path.join(repoRoot, "docs/house-package");
  if (existsSync(housePackageSource)) {
    rmSync(housePackageTarget, { recursive: true, force: true });
    cpSync(housePackageSource, housePackageTarget, { recursive: true });
  }

  const referenceHouseSource = path.join(
    repoRoot,
    "apps/client-studio/public/reference-house",
  );
  const referenceHouseTarget = path.join(repoRoot, "docs/reference-house");
  if (existsSync(referenceHouseSource)) {
    rmSync(referenceHouseTarget, { recursive: true, force: true });
    cpSync(referenceHouseSource, referenceHouseTarget, { recursive: true });
  }

  return { housePackageTarget, referenceHouseTarget };
}

const { fingerprint, versionJson } = assertTreeReady();
const cacheBust = fingerprint.commit;

writeIndexHtml(versionJson.version, cacheBust);
writeLiveHtml(cacheBust);
writePartnerSnippetHtml(cacheBust);
writeNoJekyll();
const { housePackageTarget, referenceHouseTarget } = syncStaticHostAssets();

assertSingleDistributionTree();

const validate = spawnSync(
  process.execPath,
  [path.join(packageDir, "scripts/validate-pages.mjs")],
  { cwd: packageDir, stdio: "inherit" },
);
if (validate.status !== 0) {
  process.exit(validate.status ?? 1);
}

console.log(
  `Pages host finalized ${versionJson.version} (${fingerprint.commit}) in docs/embed/`,
);
console.log(`  dist symlink → ${distDir}`);
console.log("  - index.html / live.html / partner-snippet.html");
if (existsSync(housePackageTarget)) {
  console.log("  - ../house-package/");
}
if (existsSync(referenceHouseTarget)) {
  console.log("  - ../reference-house/");
}
