import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { CollectRuntimeInput } from '../../model';
import {
  createBasicObservationCollector,
  createRuntimeObservabilityValidator,
} from './basic-observation-collector';
import { createRuntimeObservabilityApi } from './runtime-observability-api';
import { createRuntimeObservabilityEngine } from './runtime-observability-engine';
import { createRuntimeObservabilityIndex } from './runtime-observability-index';

function sampleInput(): CollectRuntimeInput {
  return {
    sessionId: 'runtime-session-1',
    title: 'Demo Observability',
    sources: [
      {
        sessionId: 'runtime-session-1',
        executionId: 'runtime-execution-1',
        moduleId: null,
        event: 'RuntimeStarted',
        timestamp: '2026-08-19T10:00:00.000Z',
        source: 'experience-runtime',
      },
      {
        sessionId: 'runtime-session-1',
        executionId: 'runtime-execution-1',
        moduleId: 'hero',
        event: 'ModuleActivated',
        timestamp: '2026-08-19T10:00:01.000Z',
        source: 'experience-modules',
      },
      {
        sessionId: 'runtime-session-1',
        executionId: 'runtime-execution-1',
        moduleId: 'hero',
        event: 'ExperienceStateCreated',
        timestamp: '2026-08-19T10:00:02.000Z',
        source: 'experience-state',
      },
      {
        sessionId: 'runtime-session-1',
        executionId: 'decision-execution-1',
        moduleId: null,
        event: 'DecisionStarted',
        timestamp: '2026-08-19T09:59:50.000Z',
        source: 'decision-orchestrator',
      },
    ],
  };
}

describe('BasicObservationCollector', () => {
  it('collects and sorts observations read-only', () => {
    const collector = createBasicObservationCollector();
    const input = sampleInput();
    assert.equal(collector.supports(input), true);
    const observations = collector.collect(input, (prefix) => `${prefix}-1`);
    assert.equal(observations.length, 4);
    assert.equal(observations[0]?.event, 'DecisionStarted');
    assert.equal(observations[3]?.event, 'ExperienceStateCreated');
  });
});

describe('RuntimeObservabilityValidator', () => {
  it('flags metrics count mismatch', () => {
    const validator = createRuntimeObservabilityValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      timeline: {
        id: 't1',
        sessionId: 's1',
        events: [],
        startedAt: '2026-08-19T00:00:00.000Z',
        updatedAt: '2026-08-19T00:00:00.000Z',
        metadata: { title: 't', notes: 'n' },
      },
      metrics: {
        observationCount: 2,
        sessionCount: 1,
        executionCount: 0,
        moduleEventCount: 0,
        stateEventCount: 0,
        health: 'Healthy',
        healthScore: 0.9,
      },
      createdAt: '2026-08-19T00:00:00.000Z',
      updatedAt: '2026-08-19T00:00:00.000Z',
      metadata: {
        title: 't',
        sessionId: 's1',
        notes: 'n',
        status: 'Draft',
      },
      validation: null,
    });
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((item) => item.code === 'empty-timeline'));
    assert.ok(
      result.issues.some((item) => item.code === 'metrics-count-mismatch'),
    );
  });
});

describe('createRuntimeObservabilityEngine', () => {
  it('collects, aggregates, validates and publishes', () => {
    const engine = createRuntimeObservabilityEngine({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = engine.collect(sampleInput());
    assert.equal(pkg.timeline.events.length, 4);
    assert.equal(pkg.metrics.observationCount, 4);
    assert.ok(
      engine.getEvents().some((event) => event.type === 'RuntimeObserved'),
    );
    assert.ok(
      engine.getEvents().some((event) => event.type === 'TimelineUpdated'),
    );
    assert.ok(
      engine.getEvents().some((event) => event.type === 'MetricsCalculated'),
    );

    const metrics = engine.aggregate(pkg.id);
    assert.equal(metrics.observationCount, 4);
    assert.equal(metrics.health, 'Healthy');

    const validation = engine.analyze(pkg.id);
    assert.equal(validation.valid, true);

    const published = engine.publish(pkg.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      engine
        .getEvents()
        .some((event) => event.type === 'ObservabilityPublished'),
    );

    const disposed = engine.dispose(pkg.id);
    assert.equal(disposed.metadata.status, 'Disposed');
  });

  it('rejects publish when invalid', () => {
    const engine = createRuntimeObservabilityEngine();
    assert.throws(() => {
      engine.publish('missing');
    }, /not found/);
  });
});

describe('RuntimeObservabilityIndex', () => {
  it('indexes and finds packages', () => {
    const index = createRuntimeObservabilityIndex();
    const engine = createRuntimeObservabilityEngine();
    const pkg = engine.collect(sampleInput());
    const entry = index.index(pkg.id, pkg);
    assert.equal(entry.sessionId, 'runtime-session-1');
    assert.equal(index.find(pkg.timeline.id).length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createRuntimeObservabilityApi', () => {
  it('exposes collect / publish / preview / list / validate', () => {
    const api = createRuntimeObservabilityApi();
    const collected = api.collectRuntime(sampleInput());
    assert.equal(api.listObservations(collected.id).length, 4);
    const validated = api.validateObservability(collected.id);
    assert.equal(validated.valid, true);
    const published = api.publishObservability(collected.id);
    assert.equal(published.metadata.status, 'Published');
    assert.equal(api.previewObservability(collected.id)?.id, collected.id);
    assert.equal(api.listPackages().length, 1);
    assert.ok(api.listEvents().length > 0);
    assert.equal(api.listIndex().length, 1);
  });
});
