import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getPlatformTheme } from './platformTheme';
import { PLATFORM_STUDIO_SWITCH_ORDER } from './StudioSwitcher';

describe('platformCompliance (VR-FIX-05)', () => {
  it('keeps click-model navy/gold/canvas tokens', () => {
    const theme = getPlatformTheme('builder');
    assert.equal(theme.navy, '#001930');
    assert.equal(theme.gold, '#B8922D');
    assert.equal(theme.canvas, '#F5F7FB');
    assert.equal(theme.headerHeightPx, 70);
  });

  it('keeps pilot studio order Manager → Sales → Builder', () => {
    assert.deepEqual([...PLATFORM_STUDIO_SWITCH_ORDER], [
      'manager',
      'sales',
      'builder',
    ]);
  });
});
