import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const root = process.cwd();

function source(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

describe("TASK 71F Manager canonical gold accent", () => {
  it("defines Manager accent as canonical CONIS gold", () => {
    const css = source("src/index.css");

    assert.match(css, /--platform-accent:\s*#C89B2D/i);
  });

  it("keeps Manager rail reduced to House scope", () => {
    const sidebar = source(
      "src/features/manager-studio/ManagerStudioSidebar.tsx",
    );
    const scope = source(
      "src/features/manager-studio/ManagerWorkspaceScopeControls.tsx",
    );

    assert.match(sidebar, /ManagerWorkspaceScopeControls/);
    assert.doesNotMatch(sidebar, /PARTNER_NAV_GROUPS|aria-current/);
    assert.match(scope, />\s*Dům\s*</);
    assert.doesNotMatch(scope, />\s*Projekt\s*</);
  });

  it("keeps executive charts wired to Manager accent", () => {
    const home = source(
      "src/features/manager-studio/ManagerWorkCenterHome.tsx",
    );

    assert.match(home, /index === 3[\s\S]*platform-accent/);

    assert.match(home, /index < 2[\s\S]*platform-accent/);

    assert.match(home, /label === "OTÁZKY" \|\| label === "Konverze"/);
  });
});
