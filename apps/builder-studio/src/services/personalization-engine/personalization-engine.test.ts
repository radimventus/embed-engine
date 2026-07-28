import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { PersonalizeInput } from '../../model';
import {
  createBasicPersonalizationStrategy,
  createPersonalizationValidator,
} from './basic-personalization-strategy';
import { createPersonalizationEngineApi } from './personalization-engine-api';
import { createPersonalizationEngine } from './personalization-engine';
import { createPersonalizationIndex } from './personalization-index';

function sampleInput(): PersonalizeInput {
  return {
    aiContextPackageId: 'ai-context-package-1',
    aiContextTitle: 'Demo AI Context',
    sessionId: 'runtime-session-1',
    title: 'Demo Personalization',
    priorityProfile: ['price', 'layout'],
    sessionState: 'Active',
    currentMoveIndex: 1,
    knowledgeEntries: [
      { id: 'knowledge-entry-1', confidence: 0.4 },
      { id: 'knowledge-entry-2', confidence: 0.5 },
      { id: 'knowledge-entry-3', confidence: 0.45 },
    ],
  };
}

describe('BasicPersonalizationStrategy', () => {
  it('applies ranking and rules for a session', () => {
    const strategy = createBasicPersonalizationStrategy();
    const result = strategy.apply(
      sampleInput(),
      (prefix) => `${prefix}-x`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(result.context.sessionId, 'runtime-session-1');
    assert.ok(result.context.ranking.length === 3);
    assert.ok(result.rules.length >= 2);
    assert.equal(result.context.ranking[0]?.rank, 1);
  });
});

describe('PersonalizationValidator', () => {
  it('flags empty ranking', () => {
    const validator = createPersonalizationValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate(
      {
        id: 'c1',
        sessionId: 's1',
        priorityProfile: ['price'],
        knowledgeEntries: [],
        ranking: [],
        confidence: 0.5,
        createdAt: '2026-08-19T00:00:00.000Z',
        metadata: {
          strategyId: 'basic',
          status: 'Draft',
          notes: 'n',
          appliedRules: [],
        },
      },
      [],
    );
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((item) => item.code === 'empty-ranking'));
  });
});

describe('createPersonalizationEngine', () => {
  it('personalizes, ranks, validates, publishes and indexes', () => {
    const engine = createPersonalizationEngine({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = engine.personalize(sampleInput());
    assert.ok(pkg.context.ranking.length >= 1);
    assert.ok(
      engine
        .getEvents(pkg.id)
        .some((event) => event.type === 'PersonalizationCreated'),
    );
    assert.ok(
      engine
        .getEvents(pkg.id)
        .some((event) => event.type === 'PersonalizationIndexed'),
    );

    const ranked = engine.rank(pkg.id);
    assert.ok(ranked.context.ranking.length >= 1);

    const validated = engine.validate(ranked.id);
    assert.equal(validated.validation?.valid, true);
    assert.ok(
      engine
        .getEvents(ranked.id)
        .some((event) => event.type === 'PersonalizationValidated'),
    );

    const published = engine.publish(ranked.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      engine
        .getEvents(ranked.id)
        .some((event) => event.type === 'PersonalizationPublished'),
    );
    assert.ok(engine.getIndex().list(ranked.id).length >= 1);
  });

  it('exposes API personalize/publish/preview/list/validate', () => {
    const engine = createPersonalizationEngine();
    const api = createPersonalizationEngineApi(engine);
    const pkg = api.personalize(sampleInput());
    assert.ok(api.previewPersonalization(pkg.id));
    assert.ok(api.listPersonalizations().length >= 1);
    const validated = api.validatePersonalization(pkg.id);
    assert.equal(validated.validation?.valid, true);
    const published = api.publishPersonalization(pkg.id);
    assert.equal(published.metadata.status, 'Published');
  });
});

describe('PersonalizationIndex', () => {
  it('rebuilds index entries', () => {
    const index = createPersonalizationIndex();
    const rebuilt = index.rebuild([
      {
        id: 'p1',
        context: {
          id: 'c1',
          sessionId: 's1',
          priorityProfile: ['price'],
          knowledgeEntries: ['e1'],
          ranking: [{ knowledgeEntryId: 'e1', score: 0.5, rank: 1 }],
          confidence: 0.5,
          createdAt: '2026-08-19T00:00:00.000Z',
          metadata: {
            strategyId: 'basic',
            status: 'Draft',
            notes: 'n',
            appliedRules: ['r1'],
          },
        },
      },
    ]);
    assert.equal(rebuilt.length, 1);
    assert.equal(index.find('c1').length, 1);
  });
});
