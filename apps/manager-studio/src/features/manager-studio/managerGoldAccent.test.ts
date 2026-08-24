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

  it("keeps selected sidebar wired to Manager accent", () => {
    const sidebar = source(
      "src/features/manager-studio/ManagerStudioSidebar.tsx",
    );

    assert.match(sidebar, /border-\[var\(--platform-accent\)\]/);

    assert.match(sidebar, /aria-current=\{isActive \? "page" : undefined\}/);
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
