import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { ProjectDecisionContextInput } from '../../model';
import {
  createBasicPersonalizationProjector,
  createPersonalizationRuntimeValidator,
} from './basic-personalization-projector';
import { createPersonalizationRuntimeApi } from './personalization-runtime-api';
import { createPersonalizationRuntimeEngine } from './personalization-runtime-engine';
import { createPersonalizationRuntimeIndex } from './personalization-runtime-index';

function sampleInput(): ProjectDecisionContextInput {
  return {
    aiContextPackageId: 'ai-context-package-1',
    aiContextTitle: 'Demo AI Context',
    sessionId: 'runtime-session-1',
    title: 'Demo Decision Context',
    decisionProfile: 'price-first',
    priorityProfile: ['price', 'layout'],
    behaviorProfile: ['attentive', 'exploring'],
    sessionState: 'Running',
    knowledgeEntries: [
      { id: 'knowledge-entry-1', confidence: 0.4 },
      { id: 'knowledge-entry-2', confidence: 0.5 },
      { id: 'knowledge-entry-3', confidence: 0.45 },
    ],
  };
}

describe('BasicPersonalizationProjector', () => {
  it('projects ranked decision context with auditable reasons', () => {
    const projector = createBasicPersonalizationProjector();
    const context = projector.project(
      sampleInput(),
      (prefix) => `${prefix}-x`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(context.sessionId, 'runtime-session-1');
    assert.ok(context.ranking.length === 3);
    assert.ok(context.ranking.every((item) => item.reason.length > 0));
    assert.equal(context.ranking[0]?.priority, 1);
  });
});

describe('PersonalizationRuntimeValidator', () => {
  it('flags empty ranking', () => {
    const validator = createPersonalizationRuntimeValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'c1',
      sessionId: 's1',
      priorityProfile: ['price'],
      behaviorProfile: ['attentive'],
      knowledgeEntries: [],
      ranking: [],
      confidence: 0.5,
      metadata: {
        projectorId: 'basic',
        status: 'Draft',
        notes: 'n',
        decisionProfile: 'balanced',
      },
      createdAt: '2026-08-19T00:00:00.000Z',
    });
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((item) => item.code === 'empty-ranking'));
  });
});

describe('createPersonalizationRuntimeEngine', () => {
  it('projects, ranks, validates, publishes and indexes', () => {
    const engine = createPersonalizationRuntimeEngine({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = engine.project(sampleInput());
    assert.ok(pkg.context.ranking.length >= 1);
    assert.ok(
      engine
        .getEvents(pkg.id)
        .some((event) => event.type === 'PersonalizedContextCreated'),
    );
    assert.ok(
      engine
        .getEvents(pkg.id)
        .some((event) => event.type === 'PersonalizedContextIndexed'),
    );

    const ranked = engine.rank(pkg.id);
    assert.ok(ranked.context.ranking.length >= 1);

    const validated = engine.validate(ranked.id);
    assert.equal(validated.validation?.valid, true);
    assert.ok(
      engine
        .getEvents(ranked.id)
        .some((event) => event.type === 'PersonalizedContextValidated'),
    );

    const published = engine.publish(ranked.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      engine
        .getEvents(ranked.id)
        .some((event) => event.type === 'PersonalizedContextPublished'),
    );
    assert.ok(engine.getIndex().list(ranked.id).length >= 1);
  });

  it('exposes API project/publish/preview/list/validate', () => {
    const engine = createPersonalizationRuntimeEngine();
    const api = createPersonalizationRuntimeApi(engine);
    const pkg = api.projectDecisionContext(sampleInput());
    assert.ok(api.previewDecisionContext(pkg.id));
    assert.ok(api.listDecisionContexts().length >= 1);
    const validated = api.validateDecisionContext(pkg.id);
    assert.equal(validated.validation?.valid, true);
    const published = api.publishDecisionContext(pkg.id);
    assert.equal(published.metadata.status, 'Published');
  });
});

describe('PersonalizationRuntimeIndex', () => {
  it('rebuilds index entries', () => {
    const index = createPersonalizationRuntimeIndex();
    const rebuilt = index.rebuild([
      {
        id: 'p1',
        context: {
          id: 'c1',
          sessionId: 's1',
          priorityProfile: ['price'],
          behaviorProfile: ['attentive'],
          knowledgeEntries: ['e1'],
          ranking: [
            {
              knowledgeEntryId: 'e1',
              reason: 'test',
              weight: 0.5,
              priority: 1,
              metadata: { notes: 'n' },
            },
          ],
          confidence: 0.5,
          metadata: {
            projectorId: 'basic',
            status: 'Draft',
            notes: 'n',
            decisionProfile: 'balanced',
          },
          createdAt: '2026-08-19T00:00:00.000Z',
        },
      },
    ]);
    assert.equal(rebuilt.length, 1);
    assert.equal(index.find('c1').length, 1);
  });
});
