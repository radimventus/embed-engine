/**
 * CAP-REF-03 — House-owned Knowledge tests.
 */

import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import {
  ensureReferenceHouseKnowledge,
  getHouseKnowledge,
  resetHouseKnowledgeForTests,
  upsertHouseKnowledge,
  upsertHouseKnowledgeAtom,
} from './houseKnowledgeStore';
import type { HouseKnowledgeAtom } from './houseKnowledgeTypes';

const PRODUCT_ATOM: HouseKnowledgeAtom = {
  id: 'product-layout',
  houseId: 'modern-4kk',
  subject: 'MODERN 4KK layout',
  category: 'layout',
  statement: 'Schema test product statement.',
  scope: 'PRODUCT',
  confidence: 'CONFIRMED',
  source: {
    sourceId: 'current-product-record',
    kind: 'CURRENT_CONFIRMED',
  },
  validFrom: '2026-01-01',
  temporalStatus: 'CURRENT',
  constraints: [],
  relatedTopics: ['layout'],
};

describe('CAP-REF-03 House Knowledge', () => {
  beforeEach(() => {
    resetHouseKnowledgeForTests();
  });

  it('is House-owned and keeps different Houses isolated', () => {
    upsertHouseKnowledgeAtom(PRODUCT_ATOM);
    upsertHouseKnowledgeAtom({
      ...PRODUCT_ATOM,
      id: 'other-house-layout',
      houseId: 'other-house',
    });

    assert.deepEqual(getHouseKnowledge('modern-4kk').map((atom) => atom.id), [
      'product-layout',
    ]);
    assert.deepEqual(getHouseKnowledge('other-house').map((atom) => atom.id), [
      'other-house-layout',
    ]);
    assert.deepEqual(getHouseKnowledge('project-domy-s-energii'), []);
  });

  it('preserves scope, historical status, provenance, confidence, and constraints', () => {
    const referenceEvidence: HouseKnowledgeAtom = {
      ...PRODUCT_ATOM,
      id: 'reference-ostrava',
      subject: 'Ostrava–Krásné Pole',
      category: 'reference-realization',
      statement: 'Schema test reference realization statement.',
      scope: 'REFERENCE_PROJECT',
      confidence: 'DOCUMENTED',
      source: {
        sourceId: 'reference-evidence',
        kind: 'REFERENCE_EVIDENCE',
      },
      temporalStatus: 'UNKNOWN',
      constraints: [
        'Reference site conditions are not transferable House properties.',
      ],
      relatedTopics: ['reference-realization'],
    };
    const historical: HouseKnowledgeAtom = {
      ...PRODUCT_ATOM,
      id: 'historical-system',
      scope: 'HISTORICAL',
      confidence: 'DOCUMENTED',
      source: {
        sourceId: 'historical-technical-document',
        kind: 'HISTORICAL',
      },
      temporalStatus: 'HISTORICAL',
      constraints: ['Not a current product configuration.'],
      relatedTopics: ['historical-system'],
    };

    upsertHouseKnowledge([PRODUCT_ATOM, referenceEvidence, historical]);
    const atoms = getHouseKnowledge('modern-4kk');

    assert.equal(atoms[1]?.scope, 'REFERENCE_PROJECT');
    assert.equal(atoms[1]?.confidence, 'DOCUMENTED');
    assert.equal(atoms[1]?.source.kind, 'REFERENCE_EVIDENCE');
    assert.deepEqual(atoms[1]?.constraints, [
      'Reference site conditions are not transferable House properties.',
    ]);
    assert.equal(atoms[2]?.scope, 'HISTORICAL');
    assert.equal(atoms[2]?.temporalStatus, 'HISTORICAL');
    assert.equal(atoms[0]?.scope, 'PRODUCT');
  });

  it('updates one atom without removing unrelated House Knowledge', () => {
    upsertHouseKnowledge([
      PRODUCT_ATOM,
      {
        ...PRODUCT_ATOM,
        id: 'dse-know-how',
        scope: 'DSE_KNOW_HOW',
        source: { sourceId: 'product-doc', kind: 'PRODUCT_DOCUMENTATION' },
      },
      {
        ...PRODUCT_ATOM,
        id: 'customer-evidence',
        scope: 'CUSTOMER_EVIDENCE',
        source: { sourceId: 'customer-record', kind: 'HISTORICAL' },
        temporalStatus: 'HISTORICAL',
      },
    ]);
    upsertHouseKnowledgeAtom({
      ...PRODUCT_ATOM,
      statement: 'Updated schema test product statement.',
    });

    const atoms = getHouseKnowledge('modern-4kk');
    assert.equal(atoms.length, 3);
    assert.equal(atoms[0]?.statement, 'Updated schema test product statement.');
    assert.equal(atoms[1]?.scope, 'DSE_KNOW_HOW');
    assert.equal(atoms[2]?.scope, 'CUSTOMER_EVIDENCE');
  });

  it('accepts MODERN 4KK identity with no factual Knowledge atoms', () => {
    assert.deepEqual(ensureReferenceHouseKnowledge(), []);
    assert.deepEqual(getHouseKnowledge('modern-4kk'), []);
  });
});
