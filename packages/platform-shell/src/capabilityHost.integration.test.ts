import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { composeStudioById } from '@embed-engine/capabilities';

describe('platformShell capability host (EPIC-BX-13)', () => {
  it('Platform Shell dependency can load studio capability hosts', () => {
    const builder = composeStudioById('builder');
    const manager = composeStudioById('manager');
    const sales = composeStudioById('sales');
    assert.ok(builder.declaredIds.includes('media'));
    assert.ok(manager.declaredIds.includes('operations'));
    assert.ok(sales.declaredIds.includes('pipeline'));
  });
});
