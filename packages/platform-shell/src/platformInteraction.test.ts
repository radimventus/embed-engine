import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PLATFORM_STUDIOS } from './platformStudios';
import type { PlatformNoticeTone } from './PlatformNotice';

describe('platformInteraction (VR-FIX-03 / OF-01)', () => {
  it('exposes the same four studios for cross-studio navigation', () => {
    assert.deepEqual(
      PLATFORM_STUDIOS.map((studio) => studio.id).sort(),
      ['builder', 'manager', 'office', 'sales'],
    );
  });

  it('keeps a single notice tone vocabulary', () => {
    const tones: readonly PlatformNoticeTone[] = [
      'success',
      'warning',
      'error',
      'info',
    ];
    assert.equal(tones.length, 4);
    assert.ok(tones.includes('success'));
    assert.ok(tones.includes('error'));
  });

  it('keeps studio switcher order Office → Manager → Sales → Builder', () => {
    const order: readonly string[] = [
      'office',
      'manager',
      'sales',
      'builder',
    ];
    for (const id of order) {
      assert.ok(PLATFORM_STUDIOS.some((studio) => studio.id === id));
    }
    assert.deepEqual(
      PLATFORM_STUDIOS.map((studio) => studio.id),
      order,
    );
  });
});
