/**
 * CAP-REF-05 — Deterministic MODERN 4KK canonical content validation.
 */

import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { resetHouseKnowledgeForTests, listHouseKnowledge } from '../knowledge/houseKnowledgeStore';
import {
  listHousePriorityFaq,
  listHousePriorityFaqByPriority,
  resetHousePriorityFaqForTests,
} from '../priority-faq/housePriorityFaqStore';
import { HOUSE_PRIORITY_LABELS } from '../priority-faq/housePriorityFaqTypes';
import {
  getHouseSpecification,
  resetHouseSpecificationsForTests,
} from '../specification/houseSpecificationStore';
import { bootstrapModern4kkReferenceContent } from './modern4kkContentBootstrap';

describe('CAP-REF-05 MODERN 4KK canonical content', () => {
  beforeEach(() => {
    resetHouseSpecificationsForTests();
    resetHouseKnowledgeForTests();
    resetHousePriorityFaqForTests();
  });

  it('loads Specification, Knowledge, and FAQ by houseId after clean initialization', () => {
    bootstrapModern4kkReferenceContent();

    assert.equal(getHouseSpecification('modern-4kk')?.identity.name, 'MODERN 4KK');
    assert.ok(listHouseKnowledge('modern-4kk').length > 0);
    assert.equal(listHousePriorityFaq('modern-4kk').length, 100);
    assert.equal(getHouseSpecification('project-domy-s-energii'), null);
    assert.deepEqual(listHouseKnowledge('project-domy-s-energii'), []);
    assert.deepEqual(listHousePriorityFaq('project-domy-s-energii'), []);
  });

  it('keeps reference and historical knowledge out of current House Specification', () => {
    bootstrapModern4kkReferenceContent();

    const knowledge = listHouseKnowledge('modern-4kk');
    assert.ok(
      knowledge.some(
        (atom) =>
          atom.scope === 'REFERENCE_PROJECT' &&
          atom.subject === 'Ostrava–Krásné Pole',
      ),
    );
    assert.ok(
      knowledge.some(
        (atom) =>
          atom.scope === 'HISTORICAL' &&
          atom.temporalStatus === 'HISTORICAL',
      ),
    );
    assert.ok(knowledge.some((atom) => atom.constraints.length > 0));
    assert.equal(
      'referenceProject' in (getHouseSpecification('modern-4kk') ?? {}),
      false,
    );
  });

  it('provides exactly ten FAQ items for each canonical priority', () => {
    bootstrapModern4kkReferenceContent();

    for (const priority of Object.keys(HOUSE_PRIORITY_LABELS)) {
      assert.equal(
        listHousePriorityFaqByPriority(
          'modern-4kk',
          priority as keyof typeof HOUSE_PRIORITY_LABELS,
        ).length,
        10,
      );
    }
    assert.equal(
      listHousePriorityFaq('modern-4kk').filter(
        (item) => item.knowledgeAtomIds.length > 0,
      ).length,
      100,
    );
  });
});
