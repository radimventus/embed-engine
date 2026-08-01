import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { statusToneFromLabel } from './PlatformStatusBadge';
import { getPlatformTheme } from './platformTheme';

describe('platformVisual (VR-FIX-02)', () => {
  it('maps status labels to a single badge vocabulary', () => {
    assert.equal(statusToneFromLabel('PASS'), 'pass');
    assert.equal(statusToneFromLabel('WARNING'), 'warning');
    assert.equal(statusToneFromLabel('FAIL'), 'fail');
    assert.equal(statusToneFromLabel('Draft'), 'draft');
    assert.equal(statusToneFromLabel('Published'), 'published');
    assert.equal(statusToneFromLabel('Ready'), 'ready');
  });

  it('keeps shared navy/gold theme across studios', () => {
    const builder = getPlatformTheme('builder');
    const manager = getPlatformTheme('manager');
    assert.equal(builder.navy, manager.navy);
    assert.equal(builder.gold, manager.gold);
    assert.equal(builder.canvas, '#F7F6F4');
  });

  it('uses shared Navy working accent across studios (PR-022B)', () => {
    assert.equal(getPlatformTheme('builder').accent, '#001930');
    assert.equal(getPlatformTheme('manager').accent, '#001930');
    assert.equal(getPlatformTheme('sales').accent, '#001930');
  });
});
