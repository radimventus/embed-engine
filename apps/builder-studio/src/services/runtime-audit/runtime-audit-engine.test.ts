import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { RecordAuditInput } from '../../model';
import {
  createBasicAuditRecordingStrategy,
  createRuntimeAuditValidator,
} from './basic-audit-recording-strategy';
import { createRuntimeAuditApi } from './runtime-audit-api';
import { createRuntimeAuditEngine } from './runtime-audit-engine';
import { createRuntimeAuditIndex } from './runtime-audit-index';

function sampleInput(): RecordAuditInput {
  return {
    sessionId: 'runtime-session-1',
    title: 'Demo Runtime Audit',
    sources: [
      {
        sessionId: 'runtime-session-1',
        runtimeExecutionId: 'runtime-execution-1',
        moduleExecutionId: null,
        action: 'DecisionExecutionStarted',
        entity: 'DecisionExecution',
        timestamp: '2026-08-19T10:00:00.000Z',
        source: 'decision-orchestrator',
        packageId: 'decision-pkg-1',
      },
      {
        sessionId: 'runtime-session-1',
        runtimeExecutionId: 'runtime-execution-1',
        moduleExecutionId: null,
        action: 'RuntimeStarted',
        entity: 'RuntimeExecution',
        timestamp: '2026-08-19T10:00:01.000Z',
        source: 'experience-runtime',
        packageId: 'runtime-pkg-1',
      },
      {
        sessionId: 'runtime-session-1',
        runtimeExecutionId: 'runtime-execution-1',
        moduleExecutionId: 'module-execution-1',
        action: 'ModuleActivated',
        entity: 'ModuleExecution',
        timestamp: '2026-08-19T10:00:02.000Z',
        source: 'experience-modules',
        packageId: null,
      },
      {
        sessionId: 'runtime-session-1',
        runtimeExecutionId: 'runtime-execution-1',
        moduleExecutionId: 'module-execution-1',
        action: 'ExperienceStateCreated',
        entity: 'StateTransition',
        timestamp: '2026-08-19T10:00:03.000Z',
        source: 'experience-state',
        packageId: null,
      },
      {
        sessionId: 'runtime-session-1',
        runtimeExecutionId: 'runtime-execution-1',
        moduleExecutionId: null,
        action: 'ObservabilityPublished',
        entity: 'PublishedPackage',
        timestamp: '2026-08-19T10:00:04.000Z',
        source: 'runtime-observability',
        packageId: 'obs-pkg-1',
      },
      {
        sessionId: 'runtime-session-1',
        runtimeExecutionId: 'runtime-execution-1',
        moduleExecutionId: null,
        action: 'RuntimeHealthValidated',
        entity: 'ValidationEvent',
        timestamp: '2026-08-19T10:00:05.000Z',
        source: 'runtime-health',
        packageId: 'health-pkg-1',
      },
    ],
  };
}

describe('BasicAuditRecordingStrategy', () => {
  it('records sorted immutable audit records', () => {
    const strategy = createBasicAuditRecordingStrategy();
    const input = sampleInput();
    assert.equal(strategy.supports(input), true);
    const records = strategy.record(input.sources, input.sessionId, (p) => `${p}-1`);
    assert.equal(records.length, 6);
    assert.equal(records[0]?.action, 'DecisionExecutionStarted');
    assert.equal(records[5]?.entity, 'ValidationEvent');
  });
});

describe('RuntimeAuditValidator', () => {
  it('flags empty trail', () => {
    const validator = createRuntimeAuditValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      trail: {
        id: 't1',
        sessionId: 's1',
        records: [],
        startedAt: '2026-08-19T00:00:00.000Z',
        completedAt: null,
        metadata: { title: 't', notes: 'n', status: 'Open' },
      },
      createdAt: '2026-08-19T00:00:00.000Z',
      updatedAt: '2026-08-19T00:00:00.000Z',
      metadata: {
        title: 't',
        sessionId: 's1',
        notes: 'n',
        status: 'Draft',
        immutable: true,
      },
      validation: null,
    });
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((item) => item.code === 'empty-trail'));
  });
});

describe('createRuntimeAuditEngine', () => {
  it('records, appends, finalizes, validates and publishes', () => {
    const engine = createRuntimeAuditEngine({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = engine.record(sampleInput());
    assert.equal(pkg.trail.records.length, 6);
    assert.equal(pkg.metadata.immutable, true);
    assert.ok(
      engine.getEvents().some((event) => event.type === 'AuditRecordCreated'),
    );
    assert.ok(
      engine.getEvents().some((event) => event.type === 'AuditTrailUpdated'),
    );

    const appended = engine.append({
      packageId: pkg.id,
      sources: [
        {
          sessionId: 'runtime-session-1',
          runtimeExecutionId: 'runtime-execution-1',
          moduleExecutionId: null,
          action: 'HealthPublished',
          entity: 'PublishedPackage',
          timestamp: '2026-08-19T10:00:06.000Z',
          source: 'runtime-health',
          packageId: 'health-pkg-1',
        },
      ],
    });
    assert.equal(appended.trail.records.length, 7);

    const finalized = engine.finalize(pkg.id);
    assert.equal(finalized.trail.metadata.status, 'Finalized');
    assert.ok(finalized.trail.completedAt !== null);

    assert.throws(() => {
      engine.append({
        packageId: pkg.id,
        sources: sampleInput().sources.slice(0, 1),
      });
    }, /finalized/);

    const validation = engine.analyze(pkg.id);
    assert.equal(validation.valid, true);

    const published = engine.publish(pkg.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      engine.getEvents().some((event) => event.type === 'AuditPublished'),
    );

    const disposed = engine.dispose(pkg.id);
    assert.equal(disposed.metadata.status, 'Disposed');
  });
});

describe('RuntimeAuditIndex', () => {
  it('indexes and finds packages', () => {
    const index = createRuntimeAuditIndex();
    const engine = createRuntimeAuditEngine();
    const pkg = engine.record(sampleInput());
    const entry = index.index(pkg.id, pkg);
    assert.equal(entry.sessionId, 'runtime-session-1');
    assert.equal(index.find(pkg.trail.id).length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createRuntimeAuditApi', () => {
  it('exposes record / publish / preview / list / validate', () => {
    const api = createRuntimeAuditApi();
    const recorded = api.recordAudit(sampleInput());
    assert.equal(api.listAuditTrails().length, 1);
    const validated = api.validateAudit(recorded.id);
    assert.equal(validated.valid, true);
    const published = api.publishAudit(recorded.id);
    assert.equal(published.metadata.status, 'Published');
    assert.equal(api.previewAudit(recorded.id)?.id, recorded.id);
    assert.equal(api.listPackages().length, 1);
    assert.ok(api.listEvents().length > 0);
    assert.equal(api.listIndex().length, 1);
  });
});
