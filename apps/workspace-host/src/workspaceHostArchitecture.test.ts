/**
 * ARCH-01 / VR-04 / VR-05 / PT-VR-06 — Workspace Host architecture guards.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const hostRoot = join(here, '..');

function read(relative: string): string {
  return readFileSync(join(hostRoot, relative), 'utf8');
}

describe('VR-04 Canonical Workspace Shell', () => {
  it('keeps a single Workspace Shell with in-shell studio switching', () => {
    const app = read('src/WorkspaceHostApp.tsx');
    const html = read('index.html');

    assert.match(app, /workspace-shell__header/);
    assert.match(app, /workspace-shell__top/);
    assert.match(app, /WorkspaceStudioNavigation/);
    assert.match(app, /onSelectSurface=\{selectSurface\}/);
    assert.match(app, /retainWorkspace:\s*true/);
    assert.match(app, /navigate:\s*false/);
    assert.match(app, /workspace-shell-frame-/);
    assert.match(app, /withWorkspaceShellEmbed/);
    assert.doesNotMatch(app, /mode:\s*'launcher'/);
    assert.doesNotMatch(html, /Prozkoumat dům/);
    assert.doesNotMatch(html, /Reference House/);
  });

  it('defaults to Client Studio and keeps Office as a switchable view', () => {
    const app = read('src/WorkspaceHostApp.tsx');
    assert.match(app, /readActiveSurface\(\)[\s\S]*'client'/);
    assert.match(
      app,
      /studioFrameSrc\('office'\)|surface === 'office'|WORKSPACE_STUDIO_LABELS\[surface\]/,
    );
  });

  it('VR-05 — missing context does not bounce into Office Platform Switcher', () => {
    const main = read('src/main.tsx');
    assert.match(main, /workspace-host-missing-context/);
    assert.doesNotMatch(
      main,
      /location\.replace\(resolveCloudStudioHref\('office'\)\)/,
    );
  });

  it('PT-VR-06 — Workspace Shell hosts studios without redesign chrome', () => {
    const app = read('src/WorkspaceHostApp.tsx');
    const css = read('src/workspace-host.css');

    assert.doesNotMatch(app, /workspace-shell__rail/);
    assert.doesNotMatch(app, /workspace-shell__body/);
    assert.doesNotMatch(app, /conisWorkspaceHost/);
    assert.doesNotMatch(css, /workspace-shell__rail/);
    assert.match(app, /workspace-shell__main/);
    assert.match(app, /Embed\.mount/);
    assert.match(app, /mode:\s*'standalone'/);
  });
});
