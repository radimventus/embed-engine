import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildKnowledgeDashboardModel,
  searchKnowledgeCategories,
} from './knowledgeProjection';
import { KNOWLEDGE_CATEGORY_CATALOG } from './knowledgeCatalog';

describe('knowledgeProjection (EPIC-BX-04)', () => {
  it('projects all catalog categories without inventing a store', () => {
    const model = buildKnowledgeDashboardModel({
      projectId: 'villa-168',
      snapshot: null,
    });
    assert.equal(model.categories.length, KNOWLEDGE_CATEGORY_CATALOG.length);
    assert.ok(model.categories.some((item) => item.id === 'layout'));
    assert.ok(model.categories.some((item) => item.id === 'ai-context'));
    assert.ok(model.categories.some((item) => item.id === 'faq'));
  });

  it('marks empty layout as missing when no HP rooms are mounted', () => {
    const model = buildKnowledgeDashboardModel({
      projectId: 'villa-168',
      snapshot: null,
    });
    const layout = model.categories.find((item) => item.id === 'layout');
    assert.equal(layout?.health, 'missing');
  });

  it('searches categories, fields and values', () => {
    const model = buildKnowledgeDashboardModel({
      projectId: 'villa-168',
      snapshot: null,
    });
    const byLabel = searchKnowledgeCategories(model.categories, 'Energet');
    assert.ok(byLabel.some((item) => item.id === 'energy'));
    const byValue = searchKnowledgeCategories(model.categories, 'Praha');
    assert.ok(byValue.some((item) => item.id === 'location'));
  });

  it('exposes Runtime dependencies on each category', () => {
    const model = buildKnowledgeDashboardModel({
      projectId: 'villa-168',
      snapshot: null,
    });
    const ai = model.categories.find((item) => item.id === 'ai-context');
    assert.ok(ai?.dependencies.includes('AI'));
    assert.ok(ai?.dependencies.includes('Runtime'));
  });
});
