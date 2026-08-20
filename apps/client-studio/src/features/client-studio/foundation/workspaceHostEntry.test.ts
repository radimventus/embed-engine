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
const app = readFileSync(join(here, '../ClientStudioApp.tsx'), 'utf8');
const mount = readFileSync(join(here, '../../../embed/mountClientStudio.tsx'), 'utf8');

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

  it('accepts a mount-time initial landing offset without changing later CTA navigation', () => {
    assert.match(mount, /clientInitialLandingOffset/);
    assert.match(mount, /initialLandingOffsetPx={initialLandingOffsetPx}/);
    assert.match(app, /initialLandingOffsetPx={initialLandingOffsetPx}/);
    assert.match(page, /initialLandingOffsetPx = 0/);
    assert.match(page, /useState\(initialLandingOffsetPx\)/);
    const cta = readFileSync(join(here, '../sections/Hero/HeroCTA.tsx'), 'utf8');
    assert.doesNotMatch(cta, /WORKSPACE_LANDING_ADJUSTMENT_PX|workspaceAdjustment/);
  });
});
