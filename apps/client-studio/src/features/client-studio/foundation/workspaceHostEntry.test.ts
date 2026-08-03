/**
 * PT-VR-06 — Workspace hosts Client Studio without mutating its Experience.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(here, '../ClientStudioPage.tsx'), 'utf8');
const header = readFileSync(join(here, '../ClientStudioHeader.tsx'), 'utf8');

describe('PT-VR-06 Client Studio boundaries', () => {
  it('does not branch Experience on Workspace Host', () => {
    assert.doesNotMatch(page, /isConisWorkspaceHost/);
    assert.doesNotMatch(page, /workspaceHost/);
    assert.doesNotMatch(page, /conisWorkspaceHost/);
    assert.match(page, /useState\(1\)/);
    assert.match(page, /useState\(false\)/);
    assert.match(page, /CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG/);
    assert.match(page, /<Hero \/>/);
    assert.match(page, /ClientStudioWelcomeBridge/);
  });

  it('keeps Experience header free of Workspace switcher', () => {
    assert.doesNotMatch(header, /WorkspaceStudioNavigation/);
    assert.doesNotMatch(header, /isOperatorWorkspaceMode/);
    assert.doesNotMatch(header, /isConisWorkspaceHost/);
    assert.match(header, /data-experience-header/);
  });
});
