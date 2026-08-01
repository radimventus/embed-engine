import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createDefaultExperienceComposition,
  reorderExperienceModules,
  toggleExperienceModule,
  updateModuleConfig,
} from './experienceComposition';
import { evaluateModuleReadyState } from './experienceModuleReady';

describe('experienceComposition (EPIC-BX-03)', () => {
  it('defaults to production Experience module order', () => {
    const composition = createDefaultExperienceComposition('harmony-124');
    assert.deepEqual(
      composition.modules.map((module) => module.id),
      [
        'hero',
        'priority',
        'house-navigator',
        'faq',
        'ai-advisor',
        'lead-capture',
      ],
    );
  });

  it('reorders modules for Composer canvas', () => {
    const composition = createDefaultExperienceComposition('villa-168');
    const next = reorderExperienceModules(composition, 0, 2);
    assert.equal(next.modules[0]?.id, 'priority');
    assert.equal(next.modules[1]?.id, 'house-navigator');
    assert.equal(next.modules[2]?.id, 'hero');
    assert.equal(next.revision, composition.revision + 1);
  });

  it('toggles module enabled state', () => {
    const composition = createDefaultExperienceComposition('family-98');
    const next = toggleExperienceModule(composition, 'faq');
    assert.equal(
      next.modules.find((module) => module.id === 'faq')?.enabled,
      false,
    );
  });

  it('updates module config without touching HP', () => {
    const composition = createDefaultExperienceComposition('harmony-124');
    const next = updateModuleConfig(composition, 'hero', {
      ...composition.configs.hero,
      title: 'Harmony',
    });
    assert.equal(next.configs.hero.title, 'Harmony');
  });

  it('marks disabled modules as warning ready-state', () => {
    let composition = createDefaultExperienceComposition('harmony-124');
    composition = toggleExperienceModule(composition, 'priority');
    const ready = evaluateModuleReadyState({
      moduleId: 'priority',
      composition,
      snapshot: null,
      validationReport: null,
    });
    assert.equal(ready.state, 'warning');
  });
});
