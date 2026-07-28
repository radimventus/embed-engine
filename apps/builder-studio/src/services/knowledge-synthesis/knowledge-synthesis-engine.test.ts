import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { SynthesizeKnowledgeInput } from '../../model';
import {
  createBasicKnowledgeSynthesizer,
  createKnowledgeSynthesisValidator,
} from './basic-knowledge-synthesizer';
import { createKnowledgeSynthesisApi } from './knowledge-synthesis-api';
import { createKnowledgeSynthesisEngine } from './knowledge-synthesis-engine';
import { createKnowledgeSynthesisIndex } from './knowledge-synthesis-index';

function sampleInput(): SynthesizeKnowledgeInput {
  return {
    catalogId: 'heuristic-catalog-1',
    catalogTitle: 'Demo Heuristics',
    title: 'Demo Knowledge Base',
    heuristics: [
      {
        id: 'derived-heuristic-1',
        name: 'Heuristic: Repeated source',
        description: 'From pattern.',
        confidence: 0.4,
        priority: 1,
        sourcePatterns: ['extracted-pattern-1'],
      },
      {
        id: 'derived-heuristic-2',
        name: 'Heuristic: Multi-record package',
        description: 'From pattern.',
        confidence: 0.5,
        priority: 2,
        sourcePatterns: ['extracted-pattern-2'],
      },
    ],
  };
}

describe('BasicKnowledgeSynthesizer', () => {
  it('synthesizes entries with heuristic references', () => {
    const synthesizer = createBasicKnowledgeSynthesizer();
    const entries = synthesizer.synthesize(
      sampleInput(),
      (prefix) => `${prefix}-x`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.ok(entries.length >= 2);
    assert.ok(entries.every((item) => item.references.length > 0));
    assert.ok(entries.some((item) => item.title.includes('Catalog knowledge')));
  });
});

describe('KnowledgeSynthesisValidator', () => {
  it('flags empty references', () => {
    const validator = createKnowledgeSynthesisValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate([
      {
        id: 'e1',
        title: 'Weak',
        description: 'd',
        confidence: 0.5,
        sourceHeuristics: ['h1'],
        references: [],
        createdAt: '2026-08-19T00:00:00.000Z',
        metadata: {
          synthesizerId: 'basic',
          status: 'Draft',
          notes: 'n',
        },
      },
    ]);
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((item) => item.code === 'empty-references'));
  });
});

describe('createKnowledgeSynthesisEngine', () => {
  it('synthesizes, merges, validates and publishes knowledge', () => {
    const engine = createKnowledgeSynthesisEngine({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const base = engine.synthesize(sampleInput());
    assert.ok(base.entries.length >= 1);
    assert.ok(
      engine
        .getEvents(base.id)
        .some((event) => event.type === 'KnowledgeSynthesized'),
    );

    const merged = engine.merge(base.id);
    assert.ok(
      engine
        .getEvents(merged.id)
        .some((event) => event.type === 'KnowledgeMerged'),
    );

    const validated = engine.validate(merged.id);
    assert.equal(validated.validation?.valid, true);
    assert.ok(
      engine
        .getEvents(merged.id)
        .some((event) => event.type === 'KnowledgeValidated'),
    );

    const published = engine.publish(merged.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      published.entries.every((item) => item.metadata.status === 'Published'),
    );
    assert.ok(
      engine
        .getEvents(merged.id)
        .some((event) => event.type === 'KnowledgePublished'),
    );
    assert.ok(engine.getIndex().list(merged.id).length >= 1);
  });

  it('exposes API synthesize/publish/preview/list/validate', () => {
    const engine = createKnowledgeSynthesisEngine();
    const api = createKnowledgeSynthesisApi(engine);
    const base = api.synthesizeKnowledge(sampleInput());
    assert.ok(api.previewKnowledge(base.id));
    assert.ok(api.listKnowledge(base.id).length >= 1);
    const validated = api.validateKnowledge(base.id);
    assert.equal(validated.validation?.valid, true);
    const published = api.publishKnowledge(base.id);
    assert.equal(published.metadata.status, 'Published');
  });
});

describe('KnowledgeSynthesisIndex', () => {
  it('rebuilds index entries', () => {
    const index = createKnowledgeSynthesisIndex();
    const rebuilt = index.rebuild([
      {
        id: 'kb1',
        entries: [
          {
            id: 'e1',
            title: 'n',
            description: 'd',
            confidence: 0.5,
            sourceHeuristics: ['h1'],
            references: [
              {
                heuristicId: 'h1',
                relationship: 'derived-from',
                weight: 0.5,
                metadata: { notes: 'n' },
              },
            ],
            createdAt: '2026-08-19T00:00:00.000Z',
            metadata: {
              synthesizerId: 'basic',
              status: 'Draft',
              notes: 'n',
            },
          },
        ],
      },
    ]);
    assert.equal(rebuilt.length, 1);
    assert.equal(index.find('e1').length, 1);
  });
});
