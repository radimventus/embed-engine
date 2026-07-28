import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  FAQ_VISIBLE_PAGE_SIZE,
  hasMoreFaqItems,
  initialFaqVisibleCount,
  nextFaqVisibleCount,
} from './faqProgressiveLoading';

describe('CAP UX 48 / RACIO 05 FAQ progressive loading', () => {
  it('starts with at most three panels', () => {
    assert.equal(FAQ_VISIBLE_PAGE_SIZE, 3);
    assert.equal(initialFaqVisibleCount(11), 3);
    assert.equal(initialFaqVisibleCount(2), 2);
    assert.equal(initialFaqVisibleCount(0), 0);
  });

  it('each load adds three while preserving previous count', () => {
    let visible = initialFaqVisibleCount(11);
    assert.equal(visible, 3);
    assert.equal(hasMoreFaqItems(visible, 11), true);

    visible = nextFaqVisibleCount(visible, 11);
    assert.equal(visible, 6);
    assert.equal(hasMoreFaqItems(visible, 11), true);

    visible = nextFaqVisibleCount(visible, 11);
    assert.equal(visible, 9);
    assert.equal(hasMoreFaqItems(visible, 11), true);

    visible = nextFaqVisibleCount(visible, 11);
    assert.equal(visible, 11);
    assert.equal(hasMoreFaqItems(visible, 11), false);
  });

  it('supports unlimited expansion bounded only by data length', () => {
    let visible = initialFaqVisibleCount(23);
    assert.equal(visible, 3);
    while (hasMoreFaqItems(visible, 23)) {
      const previous = visible;
      visible = nextFaqVisibleCount(visible, 23);
      assert.ok(visible > previous);
      assert.ok(visible - previous <= FAQ_VISIBLE_PAGE_SIZE);
    }
    assert.equal(visible, 23);
  });
});
