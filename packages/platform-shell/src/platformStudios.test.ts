import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getPlatformStudio, PLATFORM_STUDIOS } from './platformStudios';
import { getPlatformTheme } from './platformTheme';

describe('platformShell (EPIC-BX-11 / BX-15)', () => {
  it('exposes Builder, Manager and Sales with local Vite ports', () => {
    assert.equal(PLATFORM_STUDIOS.length, 3);
    assert.equal(getPlatformStudio('builder').href, 'http://127.0.0.1:4177/');
    assert.equal(getPlatformStudio('manager').href, 'http://127.0.0.1:4175/');
    assert.equal(getPlatformStudio('sales').href, 'http://127.0.0.1:4179/');
  });

  it('assigns distinct studio accents', () => {
    const builder = getPlatformTheme('builder');
    const manager = getPlatformTheme('manager');
    const sales = getPlatformTheme('sales');
    assert.notEqual(builder.accent, manager.accent);
    assert.notEqual(manager.accent, sales.accent);
    assert.equal(builder.headerHeightPx, 72);
  });
});
