import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { ExtractPatternsInput } from '../../model';
import {
  createBasicPatternExtractor,
  createPatternValidator,
} from './basic-pattern-extractor';
import { createPatternExtractionApi } from './pattern-extraction-api';
import { createPatternExtractionEngine } from './pattern-extraction-engine';
import { createPatternIndex } from './pattern-index';

function sampleInput(): ExtractPatternsInput {
  return {
    packageId: 'learning-records-package-1',
    packageName: 'Demo Package',
    title: 'Demo Patterns',
    records: [
      {
        recordId: 'learning-record-1',
        source: 'learning-pipeline',
        note: 'From pipeline',
      },
      {
        recordId: 'learning-record-2',
        source: 'learning-pipeline',
        note: 'From pipeline again',
      },
      {
        recordId: 'learning-record-3',
        source: 'builder-demo',
        note: 'Demo',
      },
    ],
  };
}

describe('BasicPatternExtractor', () => {
  it('extracts repeated-source and pipeline patterns', () => {
    const extractor = createBasicPatternExtractor();
    const patterns = extractor.extract(
      sampleInput(),
      (prefix) => `${prefix}-x`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.ok(patterns.some((item) => item.name.includes('Repeated source')));
    assert.ok(patterns.some((item) => item.name.includes('Pipeline')));
  });
});

describe('PatternValidator', () => {
  it('flags empty sources and low confidence', () => {
    const validator = createPatternValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate([
      {
        id: 'p1',
        name: 'Weak',
        description: 'd',
        sourceRecords: [],
        confidence: 0.1,
        createdAt: '2026-08-19T00:00:00.000Z',
        metadata: {
          extractorId: 'basic',
          status: 'Draft',
          notes: 'n',
        },
      },
    ]);
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((item) => item.code === 'empty-sources'));
  });
});

describe('createPatternExtractionEngine', () => {
  it('extracts, validates, publishes and indexes patterns', () => {
    const engine = createPatternExtractionEngine({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const collection = engine.extract(sampleInput());
    assert.ok(collection.patterns.length >= 1);
    assert.ok(
      engine
        .getEvents(collection.id)
        .some((event) => event.type === 'PatternExtracted'),
    );
    assert.ok(
      engine
        .getEvents(collection.id)
        .some((event) => event.type === 'PatternIndexed'),
    );

    const validated = engine.validate(collection.id);
    assert.equal(validated.validation?.valid, true);
    assert.ok(
      engine
        .getEvents(collection.id)
        .some((event) => event.type === 'PatternValidated'),
    );

    const published = engine.publish(collection.id);
    assert.ok(
      published.patterns.every((item) => item.metadata.status === 'Published'),
    );
    assert.ok(
      engine
        .getEvents(collection.id)
        .some((event) => event.type === 'PatternPublished'),
    );
    assert.ok(engine.getIndex().list(collection.id).length >= 1);
  });

  it('exposes API extract/preview/list/validate', () => {
    const engine = createPatternExtractionEngine();
    const api = createPatternExtractionApi(engine);
    const collection = api.extractPatterns(sampleInput());
    assert.ok(api.previewPatterns(collection.id));
    assert.ok(api.listPatterns(collection.id).length >= 1);
    const validated = api.validatePatterns(collection.id);
    assert.equal(validated.validation?.valid, true);
  });
});

describe('PatternIndex', () => {
  it('rebuilds index entries', () => {
    const index = createPatternIndex();
    const rebuilt = index.rebuild([
      {
        id: 'c1',
        patterns: [
          {
            id: 'p1',
            name: 'n',
            description: 'd',
            sourceRecords: ['r1'],
            confidence: 0.5,
            createdAt: '2026-08-19T00:00:00.000Z',
            metadata: {
              extractorId: 'basic',
              status: 'Draft',
              notes: 'n',
            },
          },
        ],
      },
    ]);
    assert.equal(rebuilt.length, 1);
    assert.equal(index.find('p1').length, 1);
  });
});
