import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getPlatformTheme } from './platformTheme';
import { PLATFORM_STUDIO_SWITCH_ORDER } from './StudioSwitcher';

describe('platformCompliance (VR-FIX-05 / OF-01)', () => {
  it('keeps CONIS navy identity and interaction blue (PR-022C)', () => {
    const theme = getPlatformTheme('builder');
    assert.equal(theme.navy, '#001930');
    assert.equal(theme.gold, '#B8922D');
    assert.equal(theme.canvas, '#F7F6F4');
    assert.equal(theme.headerHeightPx, 70);
    assert.equal(theme.accent, '#18428F');
  });

  it('keeps pilot studio order Client → Manager → Sales → Builder → Office', () => {
    assert.deepEqual([...PLATFORM_STUDIO_SWITCH_ORDER], [
      'client',
      'manager',
      'sales',
      'builder',
      'office',
    ]);
  });
});
