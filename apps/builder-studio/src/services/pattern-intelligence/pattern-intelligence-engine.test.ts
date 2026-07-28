import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { PatternIntelligenceInput } from '../../model';
import {
  createBasicPatternMatcher,
  createPatternIntelligenceValidator,
} from './basic-pattern-matcher';
import { createPatternIntelligenceApi } from './pattern-intelligence-api';
import { createPatternIntelligenceEngine } from './pattern-intelligence-engine';
import { createPatternIntelligenceIndex } from './pattern-intelligence-index';

function sampleInput(): PatternIntelligenceInput {
  return {
    packageId: 'learning-records-package-1',
    packageName: 'Demo Package',
    snapshotId: 'analytics-snapshot-1',
    title: 'Demo Catalog',
    records: [
      {
        recordId: 'learning-record-1',
        source: 'learning-pipeline',
        note: 'From pipeline',
        timestamp: '2026-08-19T00:00:00.000Z',
      },
      {
        recordId: 'learning-record-2',
        source: 'learning-pipeline',
        note: 'From pipeline again',
        timestamp: '2026-08-19T00:01:00.000Z',
      },
      {
        recordId: 'learning-record-3',
        source: 'builder-demo',
        note: 'Demo',
        timestamp: '2026-08-19T00:02:00.000Z',
      },
    ],
  };
}

describe('BasicPatternMatcher', () => {
  it('matches source-frequency and pipeline patterns with evidence', () => {
    const matcher = createBasicPatternMatcher();
    const patterns = matcher.match(
      sampleInput(),
      (prefix) => `${prefix}-x`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.ok(patterns.some((item) => item.type === 'source-frequency'));
    assert.ok(patterns.some((item) => item.type === 'pipeline-derived'));
    assert.ok(patterns.every((item) => item.evidence.length > 0));
  });
});

describe('PatternIntelligenceValidator', () => {
  it('flags empty evidence', () => {
    const validator = createPatternIntelligenceValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate([
      {
        id: 'p1',
        name: 'Weak',
        description: 'd',
        type: 'source-frequency',
        confidence: 0.5,
        occurrences: 1,
        sources: ['a'],
        evidence: [],
        createdAt: '2026-08-19T00:00:00.000Z',
        metadata: {
          matcherId: 'basic',
          status: 'Draft',
          notes: 'n',
        },
      },
    ]);
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((item) => item.code === 'empty-evidence'));
  });
});

describe('createPatternIntelligenceEngine', () => {
  it('extracts, merges, validates, publishes patterns', () => {
    const engine = createPatternIntelligenceEngine({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const catalog = engine.extract(sampleInput());
    assert.ok(catalog.patterns.length >= 1);
    assert.ok(
      engine
        .getEvents(catalog.id)
        .some((event) => event.type === 'PatternDetected'),
    );

    const merged = engine.merge(catalog.id);
    assert.ok(
      engine
        .getEvents(merged.id)
        .some((event) => event.type === 'PatternMerged'),
    );

    const validated = engine.validate(merged.id);
    assert.equal(validated.validation?.valid, true);
    assert.ok(
      engine
        .getEvents(merged.id)
        .some((event) => event.type === 'PatternValidated'),
    );

    const published = engine.publish(merged.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      published.patterns.every((item) => item.metadata.status === 'Published'),
    );
    assert.ok(
      engine
        .getEvents(merged.id)
        .some((event) => event.type === 'PatternPublished'),
    );
    assert.ok(engine.getIndex().list(merged.id).length >= 1);
  });

  it('exposes API extract/publish/preview/list/validate', () => {
    const engine = createPatternIntelligenceEngine();
    const api = createPatternIntelligenceApi(engine);
    const catalog = api.extractPatterns(sampleInput());
    assert.ok(api.previewPatterns(catalog.id));
    assert.ok(api.listPatterns(catalog.id).length >= 1);
    const validated = api.validatePatterns(catalog.id);
    assert.equal(validated.validation?.valid, true);
    const published = api.publishPatterns(catalog.id);
    assert.equal(published.metadata.status, 'Published');
  });
});

describe('PatternIntelligenceIndex', () => {
  it('rebuilds index entries', () => {
    const index = createPatternIntelligenceIndex();
    const rebuilt = index.rebuild([
      {
        id: 'c1',
        patterns: [
          {
            id: 'p1',
            name: 'n',
            description: 'd',
            type: 'multi-record',
            confidence: 0.5,
            occurrences: 1,
            sources: ['s'],
            evidence: [
              {
                recordId: 'r1',
                snapshotId: 'snap',
                weight: 1,
                timestamp: '2026-08-19T00:00:00.000Z',
                metadata: { source: 's', note: 'n' },
              },
            ],
            createdAt: '2026-08-19T00:00:00.000Z',
            metadata: {
              matcherId: 'basic',
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
