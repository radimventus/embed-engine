import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { CollectRecoveryReportInput } from '../../model';
import {
  createBasicRecoveryReportingStrategy,
  createRuntimeRecoveryReportingValidator,
} from './basic-recovery-reporting-strategy';
import { createRuntimeRecoveryReportingApi } from './runtime-recovery-reporting-api';
import { createRuntimeRecoveryReportingEngine } from './runtime-recovery-reporting-engine';
import { createRuntimeRecoveryReportingIndex } from './runtime-recovery-reporting-index';

function sampleInput(
  overrides: Partial<CollectRecoveryReportInput> = {},
): CollectRecoveryReportInput {
  return {
    sessionId: 'runtime-session-1',
    runtimeExecutionId: 'runtime-execution-1',
    title: 'Demo Recovery Report',
    recoverySessionId: 'recovery-session-1',
    recoverySummaryId: 'recovery-summary-1',
    finalStatus: 'COMPLETED',
    duration: 45,
    summaryText: 'Recovery completed successfully.',
    executions: [
      {
        executionId: 'recovery-execution-1',
        status: 'COMPLETED',
        duration: 45,
        description: 'Primary recovery execution',
        sequenceId: 'recovery-sequence-1',
      },
    ],
    ...overrides,
  };
}

describe('BasicRecoveryReportingStrategy', () => {
  it('generates report from collected inputs', () => {
    const strategy = createBasicRecoveryReportingStrategy();
    const collected = strategy.collect(sampleInput());
    const report = strategy.generate(
      collected,
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(report.finalStatus, 'COMPLETED');
    assert.equal(report.executions.length, 1);
    assert.equal(report.duration, 45);
  });
});

describe('RuntimeRecoveryReportingValidator', () => {
  it('flags missing session', () => {
    const validator = createRuntimeRecoveryReportingValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      report: {
        id: 'r1',
        runtimeExecutionId: null,
        sessionId: '',
        summary: 'ok',
        executions: [],
        duration: 0,
        finalStatus: 'UNKNOWN',
        createdAt: '2026-08-19T00:00:00.000Z',
        metadata: {
          title: 't',
          notes: 'n',
          recoverySessionId: null,
          recoverySummaryId: null,
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
    assert.ok(
      result.issues.some((item) => item.code === 'report-missing-session'),
    );
  });
});

describe('createRuntimeRecoveryReportingEngine', () => {
  it('collects, generates, validates and publishes', () => {
    const engine = createRuntimeRecoveryReportingEngine({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const collected = engine.collect(sampleInput());
    assert.equal(collected.sessionId, 'runtime-session-1');

    const pkg = engine.generate(sampleInput());
    assert.equal(pkg.report.finalStatus, 'COMPLETED');
    assert.ok(
      engine
        .getEvents()
        .some((event) => event.type === 'RecoveryReportGenerated'),
    );
    assert.ok(
      engine.getEvents().some((event) => event.type === 'RecoveryReportIndexed'),
    );

    const validation = engine.validate(pkg.id);
    assert.equal(validation.valid, true);
    assert.ok(
      engine
        .getEvents()
        .some((event) => event.type === 'RecoveryReportValidated'),
    );

    const published = engine.publish(pkg.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      engine
        .getEvents()
        .some((event) => event.type === 'RecoveryReportPublished'),
    );
  });
});

describe('RuntimeRecoveryReportingIndex', () => {
  it('indexes reports', () => {
    const index = createRuntimeRecoveryReportingIndex();
    const engine = createRuntimeRecoveryReportingEngine();
    const pkg = engine.generate(sampleInput());
    const entry = index.index(pkg.id, pkg);
    assert.equal(entry.finalStatus, 'COMPLETED');
    assert.equal(index.find(pkg.report.id).length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createRuntimeRecoveryReportingApi', () => {
  it('exposes generate / publish / preview / list / validate', () => {
    const api = createRuntimeRecoveryReportingApi();
    const generated = api.generateRecoveryReport(sampleInput());
    assert.equal(api.listRecoveryReports().length, 1);
    const validated = api.validateRecoveryReport(generated.id);
    assert.equal(validated.valid, true);
    const published = api.publishRecoveryReport(generated.id);
    assert.equal(published.metadata.status, 'Published');
    assert.equal(api.previewRecoveryReport(generated.id)?.id, generated.id);
  });
});
