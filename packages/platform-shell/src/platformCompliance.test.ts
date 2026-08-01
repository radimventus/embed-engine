import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getPlatformTheme } from './platformTheme';
import { PLATFORM_STUDIO_SWITCH_ORDER } from './StudioSwitcher';

describe('platformCompliance (VR-FIX-05)', () => {
  it('keeps CONIS design-manual navy/gold/canvas tokens (PR-022B)', () => {
    const theme = getPlatformTheme('builder');
    assert.equal(theme.navy, '#001930');
    assert.equal(theme.gold, '#B8922D');
    assert.equal(theme.canvas, '#F7F6F4');
    assert.equal(theme.headerHeightPx, 70);
    assert.equal(theme.accent, '#001930');
  });

  it('keeps pilot studio order Manager → Sales → Builder', () => {
    assert.deepEqual([...PLATFORM_STUDIO_SWITCH_ORDER], [
      'manager',
      'sales',
      'builder',
    ]);
  });
});
