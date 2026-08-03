/**
 * OF-14A — Workspace Host must not open partner Hero / Welcome landing.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(here, '../ClientStudioPage.tsx'), 'utf8');
const hostHelper = readFileSync(join(here, 'conisWorkspaceHost.ts'), 'utf8');

describe('OF-14A Workspace Host Client entry', () => {
  it('detects CONIS Workspace Host without touching partner Embed Host', () => {
    assert.match(hostHelper, /conisWorkspaceHost/);
    assert.match(hostHelper, /dataset\.conisWorkspaceHost/);
  });

  it('skips Hero landing and Welcome Bridge on Workspace Host', () => {
    assert.match(page, /isConisWorkspaceHost/);
    assert.match(page, /workspaceHost \? 2 : 1/);
    assert.match(page, /!workspaceHost \? \(/);
    assert.match(page, /<Hero \/>/);
    assert.match(page, /triggers:\s*Object\.freeze\(\[\]\)/);
  });
});
