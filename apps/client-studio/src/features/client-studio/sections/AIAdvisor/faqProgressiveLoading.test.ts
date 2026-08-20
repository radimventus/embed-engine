import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  FAQ_VISIBLE_PAGE_SIZE,
  hasMoreFaqItems,
  initialFaqVisibleCount,
  nextFaqVisibleCount,
} from './faqProgressiveLoading';

describe('Racio FAQ landing presentation', () => {
  it('starts with the approved five panels', () => {
    assert.equal(FAQ_VISIBLE_PAGE_SIZE, 5);
    assert.equal(initialFaqVisibleCount(11), 5);
    assert.equal(initialFaqVisibleCount(2), 2);
    assert.equal(initialFaqVisibleCount(0), 0);
  });

  it('each load adds five while preserving previous count', () => {
    let visible = initialFaqVisibleCount(11);
    assert.equal(visible, 5);
    assert.equal(hasMoreFaqItems(visible, 11), true);

    visible = nextFaqVisibleCount(visible, 11);
    assert.equal(visible, 10);
    assert.equal(hasMoreFaqItems(visible, 11), true);

    visible = nextFaqVisibleCount(visible, 11);
    assert.equal(visible, 11);
    assert.equal(hasMoreFaqItems(visible, 11), false);
  });

  it('supports unlimited expansion bounded only by data length', () => {
    let visible = initialFaqVisibleCount(23);
    assert.equal(visible, 5);
    while (hasMoreFaqItems(visible, 23)) {
      const previous = visible;
      visible = nextFaqVisibleCount(visible, 23);
      assert.ok(visible > previous);
      assert.ok(visible - previous <= FAQ_VISIBLE_PAGE_SIZE);
    }
    assert.equal(visible, 23);
  });
});
