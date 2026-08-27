import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getPlatformStudio, PLATFORM_STUDIOS } from './platformStudios';
import { getPlatformTheme } from './platformTheme';

describe('platformShell (EPIC-BX-11 / BX-15 / VR-FIX-01 / OF-01)', () => {
  it('routes operator Client selection through the local Workspace Host', () => {
    assert.equal(PLATFORM_STUDIOS.length, 5);
    assert.equal(getPlatformStudio('client').href, 'http://127.0.0.1:4183/');
    assert.equal(getPlatformStudio('office').href, 'http://127.0.0.1:4181/');
    assert.equal(getPlatformStudio('builder').href, 'http://127.0.0.1:4177/');
    assert.equal(getPlatformStudio('manager').href, 'http://127.0.0.1:4175/');
    assert.equal(getPlatformStudio('sales').href, 'http://127.0.0.1:4179/');
  });

  it('uses shared interaction blue and CONIS header height (PR-022C)', () => {
    const office = getPlatformTheme('office');
    const builder = getPlatformTheme('builder');
    const manager = getPlatformTheme('manager');
    const sales = getPlatformTheme('sales');
    assert.equal(builder.headerHeightPx, 70);
    assert.equal(builder.navy, '#001930');
    assert.equal(builder.gold, '#B8922D');
    assert.equal(builder.accent, '#18428F');
    assert.equal(office.accent, '#18428F');
    assert.equal(manager.accent, '#C89B2D');
    assert.equal(sales.accent, '#18428F');
  });
});
