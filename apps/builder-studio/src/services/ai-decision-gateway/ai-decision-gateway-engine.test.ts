import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { BuildGatewayAIContextInput } from '../../model';
import {
  createBasicAIContextBuilder,
  createGatewayAIContextValidator,
} from './basic-ai-context-builder';
import { createAIDecisionGatewayApi } from './ai-decision-gateway-api';
import { createAIDecisionGateway } from './ai-decision-gateway';
import { createGatewayAIContextIndex } from './ai-context-index';

function sampleInput(): BuildGatewayAIContextInput {
  return {
    knowledgeBaseId: 'knowledge-base-1',
    knowledgeBaseTitle: 'Demo Knowledge',
    title: 'Demo AI Context',
    maxEntries: 4,
    minConfidence: 0.3,
    entries: [
      {
        id: 'knowledge-entry-1',
        title: 'Knowledge: Repeated source',
        description: 'd1',
        confidence: 0.4,
        sourceHeuristics: ['h1'],
      },
      {
        id: 'knowledge-entry-2',
        title: 'Knowledge: Multi-record package',
        description: 'd2',
        confidence: 0.5,
        sourceHeuristics: ['h2'],
      },
      {
        id: 'knowledge-entry-3',
        title: 'Knowledge: Repeated source',
        description: 'duplicate title',
        confidence: 0.35,
        sourceHeuristics: ['h3'],
      },
      {
        id: 'knowledge-entry-4',
        title: 'Low confidence',
        description: 'low',
        confidence: 0.1,
        sourceHeuristics: ['h4'],
      },
    ],
  };
}

describe('BasicAIContextBuilder', () => {
  it('builds filtered deduped context with references', () => {
    const builder = createBasicAIContextBuilder();
    const context = builder.build(
      sampleInput(),
      (prefix) => `${prefix}-x`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.ok(context.knowledgeEntries.length >= 1);
    assert.ok(context.knowledgeEntries.length <= 4);
    assert.ok(
      context.references.some((ref) => ref.relationship === 'includes'),
    );
    assert.equal(
      new Set(context.knowledgeEntries).size,
      context.knowledgeEntries.length,
    );
  });
});

describe('GatewayAIContextValidator', () => {
  it('flags empty entries', () => {
    const validator = createGatewayAIContextValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'c1',
      knowledgeEntries: [],
      references: [],
      confidence: 0.5,
      metadata: {
        builderId: 'basic',
        status: 'Draft',
        notes: 'n',
        maxEntries: 8,
      },
      createdAt: '2026-08-19T00:00:00.000Z',
    });
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((item) => item.code === 'empty-entries'));
  });
});

describe('createAIDecisionGateway', () => {
  it('builds, filters, validates, publishes and indexes context', () => {
    const gateway = createAIDecisionGateway({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = gateway.buildContext(sampleInput());
    assert.ok(pkg.context.knowledgeEntries.length >= 1);
    assert.ok(
      gateway
        .getEvents(pkg.id)
        .some((event) => event.type === 'AIContextBuilt'),
    );
    assert.ok(
      gateway
        .getEvents(pkg.id)
        .some((event) => event.type === 'AIContextIndexed'),
    );

    const filtered = gateway.filter(pkg.id, { maxEntries: 1 });
    assert.equal(filtered.context.knowledgeEntries.length, 1);

    const validated = gateway.validate(filtered.id);
    assert.equal(validated.validation?.valid, true);
    assert.ok(
      gateway
        .getEvents(filtered.id)
        .some((event) => event.type === 'AIContextValidated'),
    );

    const published = gateway.publish(filtered.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      gateway
        .getEvents(filtered.id)
        .some((event) => event.type === 'AIContextPublished'),
    );
    assert.ok(gateway.getIndex().list(filtered.id).length >= 1);
  });

  it('exposes API build/publish/preview/list/validate', () => {
    const gateway = createAIDecisionGateway();
    const api = createAIDecisionGatewayApi(gateway);
    const pkg = api.buildAIContext(sampleInput());
    assert.ok(api.previewAIContext(pkg.id));
    assert.ok(api.listAIContexts().length >= 1);
    const validated = api.validateAIContext(pkg.id);
    assert.equal(validated.validation?.valid, true);
    const published = api.publishAIContext(pkg.id);
    assert.equal(published.metadata.status, 'Published');
  });
});

describe('GatewayAIContextIndex', () => {
  it('rebuilds index entries', () => {
    const index = createGatewayAIContextIndex();
    const rebuilt = index.rebuild([
      {
        id: 'p1',
        knowledgeBaseId: 'kb1',
        context: {
          id: 'c1',
          knowledgeEntries: ['e1'],
          references: [
            {
              knowledgeEntryId: 'e1',
              relationship: 'includes',
              weight: 0.5,
              metadata: { notes: 'n' },
            },
          ],
          confidence: 0.5,
          metadata: {
            builderId: 'basic',
            status: 'Draft',
            notes: 'n',
            maxEntries: 8,
          },
          createdAt: '2026-08-19T00:00:00.000Z',
        },
      },
    ]);
    assert.equal(rebuilt.length, 1);
    assert.equal(index.find('c1').length, 1);
  });
});
