/**
 * ARCH-01 / OF-14A / VR-04 — Workspace Host architecture guards.
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
    assert.match(app, /studioFrameSrc\('office'\)|surface === 'office'|WORKSPACE_STUDIO_LABELS\[surface\]/);
  });
});
