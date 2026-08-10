import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

describe("VR-PUBLISH-02 Partner Environment release topology", () => {
  it("builds exactly the five Studio surfaces, including Workspace Host", () => {
    const publish = read("scripts/publish-studio-platform.mjs");

    for (const id of ["office", "builder", "manager", "sales", "workspace"]) {
      assert.match(publish, new RegExp(`id: "${id}"`));
      assert.match(publish, new RegExp(`docs/studio/${id}`));
    }
    assert.doesNotMatch(publish, /id:\s*"client"/);
    assert.match(publish, /base: "\/studio\/workspace\/"/);
  });

  it("uses a source-commit gate and stages all artifacts before docs mutation", () => {
    const publish = read("scripts/publish-studio-platform.mjs");

    assert.match(publish, /git", \["status", "--porcelain"\]/);
    assert.match(publish, /assertCleanSource\(\)/);
    assert.match(publish, /const stageRoot/);
    assert.match(publish, /validateStage\(stageRoot\)/);
    assert.match(publish, /publishStage\(stageRoot\)/);
    assert.ok(
      publish.indexOf("validateStage(stageRoot)") <
        publish.indexOf("publishStage(stageRoot)"),
    );
  });

  it("publishes the shared root-absolute House Package contract", () => {
    const publish = read("scripts/publish-studio-platform.mjs");
    const workspaceConfig = read("apps/workspace-host/vite.config.js");
    const managerConfig = read("apps/manager-studio/vite.config.js");

    assert.match(publish, /house-packages\/bungalov-4kk/);
    assert.match(publish, /house-packages\/patrovy-5kk/);
    assert.match(publish, /house-package-templates\/authoring-draft-v1/);
    assert.match(publish, /sharedHousePackageRoot: "\/house-packages\/"/);
    assert.match(workspaceConfig, /VITE_SHARED_PUBLIC_ROOT/);
    assert.match(managerConfig, /VITE_SHARED_PUBLIC_ROOT/);
  });

  it("keeps Embed separate and routes operator Client selection to Workspace", () => {
    const studios = read("packages/platform-shell/src/platformStudios.ts");
    const access = read("packages/platform-access/src/cloud/cloudConfig.ts");

    assert.match(studios, /CLOUD_CLIENT_PATH = '\/studio\/workspace\/'/);
    assert.match(access, /client: '\/embed\/'/);
    assert.match(access, /CLOUD_WORKSPACE_HOST_PATH = '\/studio\/workspace\/'/);
  });
});
