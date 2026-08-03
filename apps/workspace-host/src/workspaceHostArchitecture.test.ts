/**
 * ARCH-01 — Workspace Host architecture guards.
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

describe('ARCH-01 / OF-14A Workspace Host', () => {
  it('opens Workspace directly without Embed launcher or partner landing', () => {
    const main = read('src/main.tsx');
    const app = read('src/WorkspaceHostApp.tsx');
    const html = read('index.html');

    assert.match(app, /mode:\s*'standalone'/);
    assert.match(app, /WorkspaceStudioNavigation/);
    assert.match(app, /hostId:\s*'conis-workspace-host'/);
    assert.doesNotMatch(app, /mode:\s*'launcher'/);
    assert.doesNotMatch(app, /Prozkoumat dům/);
    assert.doesNotMatch(html, /Prozkoumat dům/);
    assert.doesNotMatch(html, /Reference House/);
    assert.doesNotMatch(main, /mode:\s*"launcher"/);
    assert.match(main, /getSharedWorkspaceContext/);
  });

  it('keeps Client Studio as the default Workspace surface with canonical switcher', () => {
    const app = read('src/WorkspaceHostApp.tsx');
    assert.match(app, /activeSurface="client"/);
    assert.match(app, /WorkspaceStudioNavigation/);
  });
});
