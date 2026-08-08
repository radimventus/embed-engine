/**
 * CAP-REF-07b — Canonical House Runtime Context tests.
 */

import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { resetHouseKnowledgeForTests } from '../knowledge/houseKnowledgeStore';
import { resetHousePriorityFaqForTests } from '../priority-faq/housePriorityFaqStore';
import { HOUSE_PRIORITY_LABELS } from '../priority-faq/housePriorityFaqTypes';
import { resetHouseSpecificationsForTests } from '../specification/houseSpecificationStore';
import { getCanonicalHouseRuntimeContext } from './canonicalHouseRuntimeContext';

describe('CAP-REF-07b Canonical House Runtime Context', () => {
  beforeEach(() => {
    resetHouseSpecificationsForTests();
    resetHouseKnowledgeForTests();
    resetHousePriorityFaqForTests();
  });

  it('bootstraps and resolves MODERN 4KK canonical content after clean initialization', () => {
    const context = getCanonicalHouseRuntimeContext('modern-4kk');

    assert.ok(context);
    assert.equal(context.identity.houseId, 'modern-4kk');
    assert.equal(context.specification.identity.name, 'MODERN 4KK');
    assert.equal(context.knowledge.length, 20);
    assert.equal(context.priorityFaq.length, 100);
    for (const priority of Object.keys(HOUSE_PRIORITY_LABELS)) {
      assert.equal(
        context.priorityFaq.filter((item) => item.priority === priority).length,
        10,
      );
    }
  });

  it('preserves Knowledge and FAQ safety semantics without legacy commercial data', () => {
    const context = getCanonicalHouseRuntimeContext('modern-4kk');
    assert.ok(context);

    assert.ok(context.knowledge.some((atom) => atom.scope === 'PRODUCT'));
    assert.ok(context.knowledge.some((atom) => atom.scope === 'DSE_KNOW_HOW'));
    assert.ok(
      context.knowledge.some((atom) => atom.scope === 'REFERENCE_PROJECT'),
    );
    assert.ok(context.knowledge.some((atom) => atom.scope === 'HISTORICAL'));
    assert.ok(context.knowledge.some((atom) => atom.constraints.length > 0));
    assert.ok(
      context.priorityFaq.some((item) => item.knowledgeAtomIds.length > 0),
    );
    assert.equal('price' in context, false);
    assert.equal('landArea' in context, false);
    assert.equal('city' in context, false);
    assert.equal('district' in context, false);
    assert.equal(
      'referenceProject' in context.specification,
      false,
    );
  });

  it('does not substitute MODERN 4KK content for an unknown House', () => {
    assert.equal(getCanonicalHouseRuntimeContext('unknown-house'), null);
  });
});
