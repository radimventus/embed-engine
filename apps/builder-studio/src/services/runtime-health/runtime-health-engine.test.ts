import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { InspectRuntimeInput } from '../../model';
import {
  createBasicHealthEvaluationStrategy,
  createRuntimeHealthValidator,
} from './basic-health-evaluation-strategy';
import { createRuntimeHealthApi } from './runtime-health-api';
import { createRuntimeHealthEngine } from './runtime-health-engine';
import { createRuntimeHealthIndex } from './runtime-health-index';

function sampleInput(
  overrides: Partial<InspectRuntimeInput> = {},
): InspectRuntimeInput {
  return {
    sessionId: 'runtime-session-1',
    runtimeExecutionId: 'runtime-execution-1',
    title: 'Demo Runtime Health',
    observabilityPackageId: 'observability-package-1',
    observationCount: 4,
    executionCount: 2,
    moduleEventCount: 2,
    stateEventCount: 1,
    observabilityHealth: 'Healthy',
    observabilityHealthScore: 0.8,
    hasTimeline: true,
    stateConsistent: true,
    transitionConsistent: true,
    validationPassed: true,
    ...overrides,
  };
}

describe('BasicHealthEvaluationStrategy', () => {
  it('evaluates healthy runtime deterministically', () => {
    const strategy = createBasicHealthEvaluationStrategy();
    const result = strategy.evaluate(
      sampleInput(),
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(result.overallHealth, 'Healthy');
    assert.ok(result.score >= 0.7);
  });

  it('flags state inconsistency as critical', () => {
    const strategy = createBasicHealthEvaluationStrategy();
    const result = strategy.evaluate(
      sampleInput({ stateConsistent: false }),
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(result.overallHealth, 'Critical');
    assert.ok(
      result.findings.some((item) => item.category === 'StateConsistency'),
    );
  });
});

describe('RuntimeHealthValidator', () => {
  it('flags invalid score', () => {
    const validator = createRuntimeHealthValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      report: {
        id: 'r1',
        sessionId: 's1',
        runtimeExecutionId: null,
        overallHealth: 'Healthy',
        warnings: [],
        errors: [],
        findings: [],
        score: 1.5,
        createdAt: '2026-08-19T00:00:00.000Z',
        metadata: {
          title: 't',
          observabilityPackageId: null,
          notes: 'n',
        },
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
    assert.ok(result.issues.some((item) => item.code === 'invalid-score'));
  });
});

describe('createRuntimeHealthEngine', () => {
  it('inspects, summarizes, validates and publishes', () => {
    const engine = createRuntimeHealthEngine({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = engine.inspect(sampleInput());
    assert.equal(pkg.report.overallHealth, 'Healthy');
    assert.ok(
      engine.getEvents().some((event) => event.type === 'RuntimeHealthCalculated'),
    );
    assert.ok(
      engine
        .getEvents()
        .some((event) => event.type === 'DiagnosticFindingCreated'),
    );

    const summary = engine.summarize(pkg.id);
    assert.equal(summary.overallHealth, 'Healthy');

    const validation = engine.analyze(pkg.id);
    assert.equal(validation.valid, true);

    const published = engine.publish(pkg.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      engine.getEvents().some((event) => event.type === 'RuntimeHealthPublished'),
    );

    const disposed = engine.dispose(pkg.id);
    assert.equal(disposed.metadata.status, 'Disposed');
  });
});

describe('RuntimeHealthIndex', () => {
  it('indexes and finds packages', () => {
    const index = createRuntimeHealthIndex();
    const engine = createRuntimeHealthEngine();
    const pkg = engine.inspect(sampleInput());
    const entry = index.index(pkg.id, pkg);
    assert.equal(entry.sessionId, 'runtime-session-1');
    assert.equal(index.find(pkg.report.id).length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createRuntimeHealthApi', () => {
  it('exposes inspect / publish / preview / list / validate', () => {
    const api = createRuntimeHealthApi();
    const inspected = api.inspectRuntime(sampleInput());
    assert.equal(api.listHealthReports().length, 1);
    const validated = api.validateHealth(inspected.id);
    assert.equal(validated.valid, true);
    const published = api.publishHealth(inspected.id);
    assert.equal(published.metadata.status, 'Published');
    assert.equal(api.previewHealth(inspected.id)?.id, inspected.id);
    assert.equal(api.listPackages().length, 1);
    assert.ok(api.listEvents().length > 0);
    assert.equal(api.listIndex().length, 1);
  });
});
