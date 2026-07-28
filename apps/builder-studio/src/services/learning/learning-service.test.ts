import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createLearningApi } from './learning-api';
import {
  LEARNING_ORIGIN_REGISTRY,
  LEARNING_REGISTRY,
  listLearningOrigins,
} from './learning-registry';
import { createLearningService } from './learning-service';

describe('Learning Registry', () => {
  it('exposes origins and registry sections', () => {
    assert.equal(LEARNING_ORIGIN_REGISTRY.length, 4);
    assert.deepEqual(
      listLearningOrigins().map((item) => item.id),
      ['platform', 'company', 'object', 'session'],
    );
    assert.ok(LEARNING_REGISTRY.observations);
    assert.ok(LEARNING_REGISTRY.patterns);
    assert.ok(LEARNING_REGISTRY.heuristics);
  });
});

describe('createLearningService', () => {
  it('creates LearningPackage with seeded observations, patterns, heuristics', () => {
    const learning = createLearningService({
      now: () => new Date('2026-08-18T18:00:00.000Z'),
      createId: (prefix) => `${prefix}-l`,
    });

    const created = learning.create({
      title: 'Platform Learning',
    });

    assert.equal(created.id, 'learning-platform');
    assert.ok(created.observations.length >= 3);
    assert.ok(created.patterns.length >= 1);
    assert.ok(created.heuristics.some((item) => item.title === 'Energy-first'));
    assert.ok(
      created.observations.every((item) => item.metadata.anonymized === true),
    );
    assert.ok(
      learning
        .getEvents(created.id)
        .some((event) => event.type === 'ObservationRegistered'),
    );
  });

  it('registers observation, pattern and heuristic', () => {
    const learning = createLearningService({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const created = learning.create();
    const withObs = learning.registerObservation(created.id, {
      origin: 'platform',
      category: 'navigator-used',
      payload: { anonymizedBucket: 'C' },
      confidence: 0.6,
      notes: 'Navigator použit',
    });
    assert.ok(
      withObs.observations.some((item) => item.category === 'navigator-used'),
    );

    const withPattern = learning.registerPattern(created.id, {
      description: 'Navigator před kontaktem',
      observations: [withObs.observations.at(-1)!.id],
      confidence: 0.55,
    });
    assert.ok(
      withPattern.patterns.some((item) =>
        item.description.includes('Navigator'),
      ),
    );

    const withHeuristic = learning.registerHeuristic(created.id, {
      title: 'Priority-before-AI',
      description: 'Priority před AI.',
      scope: 'experience',
      weight: 0.7,
    });
    assert.ok(
      withHeuristic.heuristics.some((item) => item.title === 'Priority-before-AI'),
    );
    assert.ok(
      learning
        .getEvents(created.id)
        .some((event) => event.type === 'HeuristicRegistered'),
    );
  });

  it('exposes Learning API load/save/listPatterns', () => {
    const learning = createLearningService();
    const api = createLearningApi(learning);

    const created = learning.create();
    const loaded = api.loadLearning(created.id);
    assert.ok(loaded);

    const saved = api.saveLearning(created.id);
    assert.notEqual(saved.version, created.version);

    const patterns = api.listPatterns(created.id);
    assert.ok(patterns.length >= 1);
  });
});
