import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const root = process.cwd();

function source(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

describe("TASK 74 — Manager responsive navigation", () => {
  it("keeps Project as context but exposes only House in Manager UI", () => {
    const sidebar = source(
      "src/features/manager-studio/ManagerStudioSidebar.tsx",
    );
    const scope = source(
      "src/features/manager-studio/ManagerWorkspaceScopeControls.tsx",
    );

    assert.match(sidebar, /ManagerWorkspaceScopeControls/);
    assert.doesNotMatch(
      sidebar,
      /PARTNER_NAV_GROUPS|NavGroup|scrollToSection|aria-current/,
    );

    assert.match(scope, /const projectId = session\?\.projectId \?\? null/);
    assert.match(scope, /listWorkspaceHouses\(projectId\)/);
    assert.match(scope, />\s*Dům\s*</);
    assert.doesNotMatch(scope, />\s*Projekt\s*</);
    assert.doesNotMatch(scope, /createWorkspaceProjectChangeMessage/);
  });

  it("turns Manager rail into a top scope bar on tablet/mobile", () => {
    const shell = source("src/components/layout/AppShell.tsx");
    const css = source("src/index.css");

    assert.match(shell, /manager-shell-body/);
    assert.match(shell, /manager-shell-rail/);
    assert.match(shell, /manager-shell-content/);

    assert.match(css, /@media \(max-width: 1100px\)/);
    assert.match(css, /\.manager-shell-body/);
    assert.match(css, /flex-direction:\s*column/);
    assert.match(css, /\.manager-studio-sidebar/);
    assert.match(css, /width:\s*100% !important/);
  });
});
