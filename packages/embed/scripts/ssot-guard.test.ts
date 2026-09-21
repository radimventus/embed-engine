/**
 * SSOT guard — architectural invariants that make Local↔Embed divergence impossible.
 *
 * Failures here mean a parallel Runtime / SPA path was reintroduced,
 * or an archival freeze was reattached to the live Embed Demo server.
 */

import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  createSsotResolveAliases,
  clientStudioMountAliases,
  workspaceSourceAliases,
} from "../vite.ssot-aliases";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");

function read(rel: string): string {
  return readFileSync(join(repoRoot, rel), "utf8");
}

describe("SSOT — single Runtime host path", () => {
  it("Local Client Studio entry is an Embed host (no parallel SPA Runtime)", () => {
    const main = read("apps/client-studio/src/main.tsx");
    assert.match(main, /Embed\.mount/);
    assert.match(main, /@embed-engine\/embed/);
    assert.doesNotMatch(main, /ClientStudioApp/);
    assert.doesNotMatch(main, /createRoot/);
  });

  it("Embed demo entry uses Embed.mount", () => {
    const main = read("packages/embed/demo/main.ts");
    assert.match(main, /Embed\.mount/);
  });

  it("Local and Embed demo Vite configs share createSsotResolveAliases", () => {
    const cs = read("apps/client-studio/vite.config.ts");
    const demo = read("packages/embed/demo/vite.config.ts");
    const shared = read("packages/embed/vite.shared.ts");
    assert.match(cs, /createSsotResolveAliases/);
    assert.match(demo, /createSsotResolveAliases/);
    assert.match(shared, /createSsotResolveAliases/);
  });

  it("SSOT aliases point at live src / mountClientStudio (not package dist)", () => {
    const aliases = createSsotResolveAliases();
    const asMap = Object.fromEntries(
      (Array.isArray(aliases) ? aliases : []).map((a) => {
        const entry = a as { find: string; replacement: string };
        return [entry.find, entry.replacement];
      }),
    );
    assert.equal(
      asMap["@client-studio/embed-mount"],
      clientStudioMountAliases["@client-studio/embed-mount"],
    );
    assert.match(asMap["@embed-engine/runtime"]!, /packages\/runtime\/src/);
    assert.match(asMap["@embed-engine/ai"]!, /packages\/ai\/src/);
    assert.match(asMap["@embed-engine/embed"]!, /packages\/embed\/src/);
    assert.match(
      asMap["@embed-engine/object-house/builder-package"]!,
      /builder-package\/index\.ts$/,
    );
    assert.doesNotMatch(asMap["@embed-engine/runtime"]!, /\/dist\//);
    assert.ok(
      Object.keys(workspaceSourceAliases).length >= 10,
      "workspace source aliases must cover Runtime packages",
    );
  });

  it("Embed build writes a single distribution tree (docs/embed ≡ dist symlink)", () => {
    const build = read("packages/embed/scripts/build-distribution.mjs");
    const tree = read("packages/embed/scripts/lib/distributionTree.mjs");
    const sync = read("packages/embed/scripts/sync-pages.mjs");
    const shared = read("packages/embed/vite.shared.ts");
    const pkg = JSON.parse(read("packages/embed/package.json"));
    assert.match(build, /ensureSingleDistributionTree/);
    assert.match(tree, /docs\/embed/);
    assert.match(shared, /docs\/embed/);
    assert.doesNotMatch(sync, /cpSync\(source,\s*target\)/);
    assert.match(sync, /does NOT copy bundles/);
    assert.equal(pkg.scripts["sync:pages"], "pnpm run publish:release");
    assert.equal(pkg.scripts["deploy:pages"], "pnpm run publish:release");
    assert.equal(pkg.scripts["publish:release"], "node ./scripts/publish-release.mjs");
  });

  it("Playground is a live Embed host (no frozen IIFE)", () => {
    const html = read("playground/index.html");
    const main = read("playground/main.ts");
    const vite = read("playground/vite.config.ts");
    assert.doesNotMatch(html, /embed\.iife\.js/);
    assert.match(html, /type="module"/);
    assert.match(main, /Embed\.mount/);
    assert.match(vite, /createSsotResolveAliases/);
  });

  it("Reference-house publish always rebuilds embed (never skips stale IIFE)", () => {
    const publish = read("scripts/publish-reference-house.mjs");
    assert.doesNotMatch(publish, /build skipped/);
    assert.match(publish, /always rebuilds the single tree/);
  });

  it("Embed demo Vite root has no frozen IIFE host pages", () => {
    const demoDir = join(repoRoot, "packages/embed/demo");
    const htmlFiles = readdirSync(demoDir).filter((name) =>
      name.endsWith(".html"),
    );
    for (const name of htmlFiles) {
      const html = readFileSync(join(demoDir, name), "utf8");
      assert.doesNotMatch(
        html,
        /embed\.iife\.js/,
        `${name} must not load frozen IIFE on the live demo server`,
      );
    }
    assert.equal(existsSync(join(demoDir, "iife.html")), false);
    assert.equal(existsSync(join(demoDir, "local-parity.html")), false);
  });

  it("Frozen IIFE hosts live only under archive/ (explicit, labeled)", () => {
    const archiveIife = read(
      "packages/embed/archive/frozen-iife-hosts/iife.html",
    );
    const archiveParity = read(
      "packages/embed/archive/frozen-iife-hosts/local-parity.html",
    );
    assert.match(archiveIife, /ARCHIVAL SNAPSHOT/);
    assert.match(archiveParity, /ARCHIVAL SNAPSHOT/);
    assert.match(archiveIife, /embed\.iife\.js/);
    assert.match(archiveParity, /embed\.iife\.js/);
  });

  it("Client Studio freezes are labeled archival snapshots (not Live Runtime)", () => {
    const reference = JSON.parse(
      read("apps/client-studio/reference-build/REFERENCE.json"),
    );
    const gen1 = JSON.parse(read("apps/client-studio/gen1/GEN1.json"));
    assert.equal(reference.kind, "archival-snapshot");
    assert.equal(gen1.kind, "archival-snapshot");
    assert.match(
      read("apps/client-studio/reference-build/ARCHIVAL.md"),
      /not Live Runtime/i,
    );
    assert.match(
      read("apps/client-studio/gen1/ARCHIVAL.md"),
      /not Live Runtime/i,
    );
    assert.ok(reference.notFor.includes("Live Runtime SSOT verification"));
  });

  it("Embed demo Vite is MPA (no SPA fallback masking removed freeze routes)", () => {
    const demo = read("packages/embed/demo/vite.config.ts");
    assert.match(demo, /appType:\s*["']mpa["']/);
  });
});

describe("SSOT — canonical Client Studio Experience delivery", () => {
  it("production Embed Experience mounts canonical Client Studio", () => {
    const delivery = read(
      "packages/embed/src/delivery/mountClientStudioDelivery.ts",
    );
    const launch = read("packages/embed/src/delivery/launchExperience.ts");
    const mount = read("packages/embed/src/mount.ts");
    const aliases = read("packages/embed/vite.ssot-aliases.ts");
    const clientMount = read(
      "apps/client-studio/src/embed/mountClientStudio.tsx",
    );

    assert.match(delivery, /from "@client-studio\/embed-mount"/);
    assert.match(delivery, /mountClientStudio\(/);
    assert.match(launch, /from "@client-studio\/embed-mount"/);
    assert.match(launch, /mountClientStudio\(/);
    assert.match(mount, /bootstrapClientStudioDelivery/);
    assert.match(
      aliases,
      /embed\/mountClientStudio\.tsx/,
    );
    assert.match(clientMount, /ClientStudioApp/);
    assert.match(clientMount, /export function mountClientStudio/);
  });

  it("Builder preview uses the same canonical Experience mount", () => {
    const preview = read(
      "apps/builder-studio/src/features/house-package/mountHousePackageRuntimePreview.ts",
    );
    const builderVite = read("apps/builder-studio/vite.config.ts");
    assert.match(preview, /Embed\.mount\(/);
    assert.match(preview, /mode: 'inline'/);
    assert.match(preview, /objectId/);
    assert.doesNotMatch(preview, /createStubRuntimeAdapter/);
    assert.match(builderVite, /createSsotResolveAliases/);
  });

  it("does not host a second Journey/Priority/Racio/Audit Experience tree", () => {
    const embedSrc = join(repoRoot, "packages/embed/src");
    const forbidden = [
      "JourneySceneFrame",
      "ClientStudioPage",
      "useProgressiveScrollUnlock",
      "pinnedSceneOrder",
      "AuditLeadCapture",
      "AuditConsentDialog",
    ];
    function walk(dir: string): string[] {
      return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const next = join(dir, entry.name);
        if (entry.isDirectory()) return walk(next);
        return [next];
      });
    }
    const files = walk(embedSrc).filter((file) =>
      /\.(ts|tsx|js|mjs)$/.test(file),
    );
    for (const file of files) {
      const relative = file.slice(repoRoot.length + 1);
      if (relative.includes(".test.")) continue;
      const source = readFileSync(file, "utf8");
      for (const token of forbidden) {
        assert.equal(
          source.includes(token),
          false,
          `${relative} must not reimplement ${token}`,
        );
      }
    }
  });

  it("Studio publish cannot READY without rebuilding/validating Embed provenance", () => {
    const studioPublish = read("scripts/publish-studio-platform.mjs");
    const provenance = read("scripts/lib/canonicalReleaseProvenance.mjs");
    assert.match(studioPublish, /evaluateCanonicalReleaseArtifacts/);
    assert.match(studioPublish, /publishCanonicalEmbedRelease/);
    assert.match(studioPublish, /\["embed:publish"\]/);
    assert.match(studioPublish, /assertCanonicalEmbedProvenance/);
    assert.match(studioPublish, /CONIS_STUDIO_PUBLISH_RUNNING/);
    assert.match(provenance, /commitsIdentifySameSource/);
    const embedPublish = read("packages/embed/scripts/publish-release.mjs");
    assert.doesNotMatch(embedPublish, /studio:publish/);
  });

  it("TASK 119 scroll contract remains in canonical Client Studio source", () => {
    const scroll = read(
      "apps/client-studio/src/features/client-studio/foundation/scrollToSection.ts",
    );
    const unlock = read(
      "apps/client-studio/src/features/client-studio/foundation/useProgressiveScrollUnlock.ts",
    );
    const pinned = read(
      "apps/client-studio/src/features/client-studio/foundation/pinnedSceneOrder.ts",
    );
    assert.match(unlock, /PROGRESSIVE_SCROLL_UNLOCK_THRESHOLD_PX = 80/);
    assert.match(scroll, /CANONICAL_SCROLL_MIN_DURATION_MS = 653/);
    assert.match(scroll, /CANONICAL_SCROLL_MAX_DURATION_MS = 1056/);
    assert.match(scroll, /614\.4 \+ Math\.abs\(distancePx\) \* 0\.3648/);
    assert.match(scroll, /bounded \* bounded \* \(3 - 2 \* bounded\)/);
    assert.match(pinned, /orientationStop === "hero"/);
    assert.match(pinned, /PILOT_SECTION_IDS\.socialProof/);
  });
});
