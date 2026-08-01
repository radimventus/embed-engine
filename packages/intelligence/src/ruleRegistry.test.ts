import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  INTELLIGENCE_RULE_REGISTRY,
  getRulesByCategory,
} from './rules/ruleRegistry';

describe('ruleRegistry (EPIC-BX-12)', () => {
  it('exposes a single registry covering all four categories', () => {
    assert.ok(INTELLIGENCE_RULE_REGISTRY.length >= 20);
    for (const category of [
      'quality',
      'conversion',
      'knowledge',
      'decision',
    ] as const) {
      assert.ok(
        getRulesByCategory(category).length > 0,
        `expected rules for ${category}`,
      );
    }
  });

  it('keeps rule ids unique within static entries', () => {
    const ids = INTELLIGENCE_RULE_REGISTRY.map((rule) => rule.id);
    assert.equal(ids.length, new Set(ids).size);
  });
});
