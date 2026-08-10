#!/usr/bin/env node
/**
 * VR-PUBLISH-02 — Publish the reproducible Partner Environment release.
 *
 * Source of truth is the committed Studio source tree. This script never uses
 * a previous docs artifact as input and refuses a dirty worktree.
 *
 * Output:
 * - docs/studio/{office,builder,manager,sales,workspace}/
 * - docs/house-packages/ and docs/house-package-templates/ (shared package root)
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
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STUDIO_ORIGIN = "https://conis.cz";
const TOPOLOGY_VERSION = "partner-environment-v1";
const stagingRel = ".studio-publish-staging";
const sourcePublicRel = "apps/client-studio/public";

const STUDIOS = [
  {
    id: "office",
    filter: "@embed-engine/office-studio",
    base: "/studio/office/",
    distRel: "apps/office-studio/dist",
    outRel: "docs/studio/office",
  },
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
  {
    id: "workspace",
    filter: "@embed-engine/workspace-host",
    base: "/studio/workspace/",
    distRel: "apps/workspace-host/dist",
    outRel: "docs/studio/workspace",
  },
];

function fail(message) {
  console.error(`\nStudio publish FAILED\n${message}\n`);
  process.exit(1);
}

function assertDirectory(relativePath, label) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!existsSync(absolutePath) || !statSync(absolutePath).isDirectory()) {
    fail(`Required ${label} is missing: ${relativePath}`);
  }
  return absolutePath;
}

function assertFile(relativePath, label) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
    fail(`Required ${label} is missing: ${relativePath}`);
  }
  return absolutePath;
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

function assertCleanSource() {
  const result = spawnSync("git", ["status", "--porcelain"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    fail("Cannot determine Git source state");
  }
  if (result.stdout.trim().length > 0) {
    fail(
      "Refusing to publish a dirty source tree. Commit or remove all source changes before publishing.",
    );
  }
}

function assertSourceTopology() {
  for (const studio of STUDIOS) {
    assertDirectory(path.dirname(studio.distRel), `${studio.id} Studio source`);
    assertFile(
      path.join(path.dirname(studio.distRel), "package.json"),
      `${studio.id} Studio package manifest`,
    );
  }

  assertDirectory(
    path.join(sourcePublicRel, "house-packages", "bungalov-4kk"),
    "BUNGALOV 4KK House Package",
  );
  assertFile(
    path.join(
      sourcePublicRel,
      "house-packages",
      "bungalov-4kk",
      "manifest.json",
    ),
    "BUNGALOV 4KK manifest",
  );
  assertDirectory(
    path.join(sourcePublicRel, "house-packages", "patrovy-5kk"),
    "PATROVÝ 5KK House Package",
  );
  assertFile(
    path.join(
      sourcePublicRel,
      "house-packages",
      "patrovy-5kk",
      "manifest.json",
    ),
    "PATROVÝ 5KK manifest",
  );
  assertFile(
    path.join(
      sourcePublicRel,
      "house-package-templates",
      "authoring-draft-v1",
      "manifest.json",
    ),
    "AUTHORING_DRAFT template manifest",
  );
}

function buildStudio(studio) {
  const distDir = path.join(repoRoot, studio.distRel);

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
      // House Packages are copied by this release script into the shared
      // Pages root after every Studio build succeeds.
      VITE_SHARED_PUBLIC_ROOT: "1",
    },
  );

  if (!existsSync(path.join(distDir, "index.html"))) {
    fail(`Missing ${studio.distRel}/index.html after build`);
  }

}

function stageStudio(studio, stageRoot) {
  const distDir = path.join(repoRoot, studio.distRel);
  const outDir = path.join(stageRoot, "studio", studio.id);
  cpSync(distDir, outDir, { recursive: true });
  const indexHtml = readFileSync(path.join(outDir, "index.html"), "utf8");
  writeFileSync(path.join(outDir, "404.html"), indexHtml);

  console.log(`  staged → ${studio.outRel}/`);
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

function writeStudioSurfaces(stageRoot) {
  const studioDir = path.join(stageRoot, "studio");
  mkdirSync(studioDir, { recursive: true });

  // Default entry → Builder (role redirect continues inside the app after login)
  writeRedirect(path.join(studioDir, "index.html"), "/studio/builder/");

  // Legacy path aliases from RC-002 (/builder → /studio/builder)
  for (const id of ["builder", "manager", "sales"]) {
    const legacyDir = path.join(stageRoot, "legacy", id);
    writeRedirect(path.join(legacyDir, "index.html"), `/studio/${id}/`);
  }

  writeRedirect(
    path.join(stageRoot, "studio-host.html"),
    "/studio/workspace/",
  );
}

function stageSharedHousePackages(stageRoot) {
  const publicRoot = path.join(repoRoot, sourcePublicRel);
  for (const relativePath of [
    "house-packages/bungalov-4kk",
    "house-packages/patrovy-5kk",
    "house-package-templates/authoring-draft-v1",
  ]) {
    cpSync(
      path.join(publicRoot, relativePath),
      path.join(stageRoot, relativePath),
      { recursive: true },
    );
  }

  // Retain the legacy root only while runtime migration paths still resolve it.
  const legacyRoot = path.join(publicRoot, "house-package");
  if (existsSync(legacyRoot)) {
    cpSync(legacyRoot, path.join(stageRoot, "house-package"), {
      recursive: true,
    });
  }
}

function writeReleaseMetadata(stageRoot) {
  const sha = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (sha.status !== 0) {
    fail("Cannot resolve source Git SHA");
  }
  writeFileSync(
    path.join(stageRoot, "studio", "release.json"),
    `${JSON.stringify(
      {
        sourceGitSha: sha.stdout.trim(),
        builtAt: new Date().toISOString(),
        topologyVersion: TOPOLOGY_VERSION,
        surfaces: STUDIOS.map((studio) => studio.id),
        sharedHousePackageRoot: "/house-packages/",
      },
      null,
      2,
    )}\n`,
  );
}

function validateStage(stageRoot) {
  for (const studio of STUDIOS) {
    const indexPath = path.join(stageRoot, "studio", studio.id, "index.html");
    assertFile(
      path.relative(repoRoot, indexPath),
      `${studio.id} production route`,
    );
    const indexHtml = readFileSync(indexPath, "utf8");
    if (indexHtml.includes("localhost") || indexHtml.includes("127.0.0.1")) {
      fail(`${studio.id} output depends on a localhost URL`);
    }
  }

  for (const relativePath of [
    "house-packages/bungalov-4kk/manifest.json",
    "house-packages/patrovy-5kk/manifest.json",
    "house-package-templates/authoring-draft-v1/manifest.json",
  ]) {
    assertFile(
      path.relative(repoRoot, path.join(stageRoot, relativePath)),
      `shared production asset ${relativePath}`,
    );
  }

  assertFile(
    path.relative(repoRoot, path.join(stageRoot, "studio", "release.json")),
    "release metadata",
  );
}

function publishStage(stageRoot) {
  const docsRoot = path.join(repoRoot, "docs");
  const stagedStudio = path.join(stageRoot, "studio");
  const stagedPackages = path.join(stageRoot, "house-packages");
  const stagedTemplates = path.join(stageRoot, "house-package-templates");
  const stagedLegacyPackage = path.join(stageRoot, "house-package");

  for (const id of STUDIOS.map((studio) => studio.id)) {
    const target = path.join(docsRoot, "studio", id);
    rmSync(target, { recursive: true, force: true });
    mkdirSync(path.dirname(target), { recursive: true });
    renameSync(path.join(stagedStudio, id), target);
  }
  renameSync(path.join(stagedStudio, "index.html"), path.join(docsRoot, "studio", "index.html"));
  renameSync(path.join(stagedStudio, "release.json"), path.join(docsRoot, "studio", "release.json"));

  for (const [source, targetName] of [
    [stagedPackages, "house-packages"],
    [stagedTemplates, "house-package-templates"],
    [stagedLegacyPackage, "house-package"],
  ]) {
    if (!existsSync(source)) continue;
    const target = path.join(docsRoot, targetName);
    rmSync(target, { recursive: true, force: true });
    renameSync(source, target);
  }

  for (const id of ["builder", "manager", "sales"]) {
    const target = path.join(docsRoot, id);
    rmSync(target, { recursive: true, force: true });
    renameSync(path.join(stageRoot, "legacy", id), target);
  }
  renameSync(
    path.join(stageRoot, "studio-host.html"),
    path.join(docsRoot, "studio-host.html"),
  );
}

console.log("════════════════════════════════════════════════════════");
console.log("W-01A — Publish CONIS Studio platform");
console.log(`Origin: ${STUDIO_ORIGIN}/studio`);
console.log("════════════════════════════════════════════════════════");

assertCleanSource();
assertSourceTopology();

const stageRoot = path.join(repoRoot, stagingRel);
rmSync(stageRoot, { recursive: true, force: true });
mkdirSync(stageRoot, { recursive: true });

for (const studio of STUDIOS) {
  buildStudio(studio);
}
for (const studio of STUDIOS) {
  stageStudio(studio, stageRoot);
}
stageSharedHousePackages(stageRoot);
writeStudioSurfaces(stageRoot);
writeReleaseMetadata(stageRoot);
validateStage(stageRoot);
publishStage(stageRoot);
rmSync(stageRoot, { recursive: true, force: true });

console.log("\n════════════════════════════════════════════════════════");
console.log("Studio platform READY");
console.log("════════════════════════════════════════════════════════");
console.log("Paths:");
console.log(`  ${STUDIO_ORIGIN}/studio/`);
for (const studio of STUDIOS) {
  console.log(`  ${STUDIO_ORIGIN}${studio.base}`);
}
