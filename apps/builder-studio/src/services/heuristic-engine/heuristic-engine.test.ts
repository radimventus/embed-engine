import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { DeriveHeuristicsInput } from '../../model';
import {
  createBasicHeuristicDeriver,
  createHeuristicValidator,
} from './basic-heuristic-deriver';
import { createHeuristicEngineApi } from './heuristic-engine-api';
import { createHeuristicEngine } from './heuristic-engine';
import { createHeuristicIndex } from './heuristic-index';

function sampleInput(): DeriveHeuristicsInput {
  return {
    collectionId: 'pattern-collection-1',
    collectionTitle: 'Demo Patterns',
    title: 'Demo Heuristics',
    patterns: [
      {
        id: 'extracted-pattern-1',
        name: 'Repeated source: learning-pipeline',
        description: '2 records share source.',
        confidence: 0.4,
        sourceRecords: ['learning-record-1', 'learning-record-2'],
      },
      {
        id: 'extracted-pattern-2',
        name: 'Multi-record package',
        description: '3 record references.',
        confidence: 0.5,
        sourceRecords: [
          'learning-record-1',
          'learning-record-2',
          'learning-record-3',
        ],
      },
    ],
  };
}

describe('BasicHeuristicDeriver', () => {
  it('derives heuristics with rules from patterns', () => {
    const deriver = createBasicHeuristicDeriver();
    const heuristics = deriver.derive(
      sampleInput(),
      (prefix) => `${prefix}-x`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.ok(heuristics.length >= 2);
    assert.ok(heuristics.every((item) => item.rules.length > 0));
    assert.ok(
      heuristics.some((item) => item.name.includes('Collection aggregate')),
    );
  });
});

describe('HeuristicValidator', () => {
  it('flags empty rules', () => {
    const validator = createHeuristicValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate([
      {
        id: 'h1',
        name: 'Weak',
        description: 'd',
        confidence: 0.5,
        priority: 1,
        sourcePatterns: ['p1'],
        rules: [],
        createdAt: '2026-08-19T00:00:00.000Z',
        metadata: {
          deriverId: 'basic',
          status: 'Draft',
          notes: 'n',
        },
      },
    ]);
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((item) => item.code === 'empty-rules'));
  });
});

describe('createHeuristicEngine', () => {
  it('derives, validates, publishes and indexes heuristics', () => {
    const engine = createHeuristicEngine({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const catalog = engine.derive(sampleInput());
    assert.ok(catalog.heuristics.length >= 1);
    assert.ok(
      engine
        .getEvents(catalog.id)
        .some((event) => event.type === 'HeuristicDerived'),
    );
    assert.ok(
      engine
        .getEvents(catalog.id)
        .some((event) => event.type === 'HeuristicIndexed'),
    );

    const validated = engine.validate(catalog.id);
    assert.equal(validated.validation?.valid, true);
    assert.ok(
      engine
        .getEvents(catalog.id)
        .some((event) => event.type === 'HeuristicValidated'),
    );

    const published = engine.publish(catalog.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      published.heuristics.every(
        (item) => item.metadata.status === 'Published',
      ),
    );
    assert.ok(
      engine
        .getEvents(catalog.id)
        .some((event) => event.type === 'HeuristicPublished'),
    );
    assert.ok(engine.getIndex().list(catalog.id).length >= 1);
  });

  it('exposes API derive/publish/preview/list/validate', () => {
    const engine = createHeuristicEngine();
    const api = createHeuristicEngineApi(engine);
    const catalog = api.deriveHeuristics(sampleInput());
    assert.ok(api.previewHeuristics(catalog.id));
    assert.ok(api.listHeuristics(catalog.id).length >= 1);
    const validated = api.validateHeuristics(catalog.id);
    assert.equal(validated.validation?.valid, true);
    const published = api.publishHeuristics(catalog.id);
    assert.equal(published.metadata.status, 'Published');
  });
});

describe('HeuristicIndex', () => {
  it('rebuilds index entries', () => {
    const index = createHeuristicIndex();
    const rebuilt = index.rebuild([
      {
        id: 'c1',
        heuristics: [
          {
            id: 'h1',
            name: 'n',
            description: 'd',
            confidence: 0.5,
            priority: 1,
            sourcePatterns: ['p1'],
            rules: [
              {
                id: 'r1',
                condition: 'c',
                outcome: 'o',
                weight: 0.5,
                metadata: { notes: 'n' },
              },
            ],
            createdAt: '2026-08-19T00:00:00.000Z',
            metadata: {
              deriverId: 'basic',
              status: 'Draft',
              notes: 'n',
            },
          },
        ],
      },
    ]);
    assert.equal(rebuilt.length, 1);
    assert.equal(index.find('h1').length, 1);
  });
});
