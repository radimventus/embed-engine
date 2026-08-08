/**
 * CAP-REF-04 — House-owned Priority FAQ tests.
 */

import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import {
  ensureReferenceHousePriorityFaq,
  getHousePriorityFaqItem,
  listHousePriorityFaq,
  listHousePriorityFaqByPriority,
  resetHousePriorityFaqForTests,
  upsertHousePriorityFaq,
  upsertHousePriorityFaqItem,
} from './housePriorityFaqStore';
import {
  HOUSE_PRIORITY_LABELS,
  type HousePriorityFaqItem,
} from './housePriorityFaqTypes';

const LAND_FAQ: HousePriorityFaqItem = {
  id: 'land-suitability',
  houseId: 'modern-4kk',
  priority: 'LAND',
  question: 'Schema test question.',
  answer: 'Schema test answer.',
  knowledgeAtomIds: ['land-knowledge'],
  constraints: ['Schema test constraint.'],
};

describe('CAP-REF-04 House Priority FAQ', () => {
  beforeEach(() => {
    resetHousePriorityFaqForTests();
  });

  it('is House-owned and keeps different Houses isolated', () => {
    upsertHousePriorityFaqItem(LAND_FAQ);
    upsertHousePriorityFaqItem({
      ...LAND_FAQ,
      id: 'other-house-land',
      houseId: 'other-house',
    });

    assert.deepEqual(listHousePriorityFaq('modern-4kk').map((item) => item.id), [
      'land-suitability',
    ]);
    assert.deepEqual(listHousePriorityFaq('other-house').map((item) => item.id), [
      'other-house-land',
    ]);
    assert.deepEqual(listHousePriorityFaq('project-domy-s-energii'), []);
  });

  it('filters FAQ by priority and represents all ten canonical priorities', () => {
    upsertHousePriorityFaq([
      LAND_FAQ,
      { ...LAND_FAQ, id: 'layout', priority: 'LAYOUT' },
      { ...LAND_FAQ, id: 'privacy', priority: 'PRIVACY' },
      { ...LAND_FAQ, id: 'energy', priority: 'ENERGY' },
      { ...LAND_FAQ, id: 'operating-costs', priority: 'OPERATING_COSTS' },
      { ...LAND_FAQ, id: 'design', priority: 'DESIGN' },
      { ...LAND_FAQ, id: 'quality', priority: 'QUALITY' },
      { ...LAND_FAQ, id: 'investment', priority: 'INVESTMENT' },
      { ...LAND_FAQ, id: 'maintenance', priority: 'MAINTENANCE' },
      { ...LAND_FAQ, id: 'flexibility', priority: 'FLEXIBILITY' },
    ]);

    assert.deepEqual(
      listHousePriorityFaqByPriority('modern-4kk', 'LAND').map(
        (item) => item.id,
      ),
      ['land-suitability'],
    );
    assert.deepEqual(Object.values(HOUSE_PRIORITY_LABELS), [
      'Pozemek',
      'Dispozice',
      'Soukromí',
      'Energie',
      'Provozní náklady',
      'Design',
      'Kvalita',
      'Investice',
      'Údržba',
      'Flexibilita',
    ]);
  });

  it('preserves Knowledge links, constraints, and unrelated items on update', () => {
    upsertHousePriorityFaq([
      LAND_FAQ,
      {
        ...LAND_FAQ,
        id: 'energy-comfort',
        priority: 'ENERGY',
        knowledgeAtomIds: ['energy-knowledge'],
      },
    ]);
    upsertHousePriorityFaqItem({
      ...LAND_FAQ,
      answer: 'Updated schema test answer.',
    });

    assert.deepEqual(getHousePriorityFaqItem('modern-4kk', 'land-suitability'), {
      ...LAND_FAQ,
      answer: 'Updated schema test answer.',
    });
    assert.deepEqual(
      getHousePriorityFaqItem('modern-4kk', 'energy-comfort')?.knowledgeAtomIds,
      ['energy-knowledge'],
    );
    assert.equal(listHousePriorityFaq('modern-4kk').length, 2);
  });

  it('accepts MODERN 4KK identity with no FAQ content', () => {
    assert.deepEqual(ensureReferenceHousePriorityFaq(), []);
    assert.deepEqual(listHousePriorityFaq('modern-4kk'), []);
  });
});
