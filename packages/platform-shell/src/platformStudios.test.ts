import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getPlatformStudio, PLATFORM_STUDIOS } from './platformStudios';
import { getPlatformTheme } from './platformTheme';

describe('platformShell (EPIC-BX-11 / BX-15 / VR-FIX-01)', () => {
  it('exposes Builder, Manager and Sales with local Vite ports', () => {
    assert.equal(PLATFORM_STUDIOS.length, 3);
    assert.equal(getPlatformStudio('builder').href, 'http://127.0.0.1:4177/');
    assert.equal(getPlatformStudio('manager').href, 'http://127.0.0.1:4175/');
    assert.equal(getPlatformStudio('sales').href, 'http://127.0.0.1:4179/');
  });

  it('uses shared platform accent and click-model header height', () => {
    const builder = getPlatformTheme('builder');
    const manager = getPlatformTheme('manager');
    const sales = getPlatformTheme('sales');
    assert.equal(builder.headerHeightPx, 70);
    assert.equal(builder.navy, '#001930');
    assert.equal(builder.gold, '#B8922D');
    assert.equal(builder.accent, '#18428F');
    assert.equal(manager.accent, '#138D45');
    assert.equal(sales.accent, '#B8922D');
  });
});
