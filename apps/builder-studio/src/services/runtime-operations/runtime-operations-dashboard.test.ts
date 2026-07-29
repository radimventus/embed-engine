import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { CollectOperationsInput } from '../../model';
import {
  createBasicDashboardAggregationStrategy,
  createRuntimeOperationsValidator,
} from './basic-dashboard-aggregation-strategy';
import { createRuntimeOperationsApi } from './runtime-operations-api';
import { createRuntimeOperationsDashboard } from './runtime-operations-dashboard';
import { createRuntimeOperationsIndex } from './runtime-operations-index';

function sampleInput(
  overrides: Partial<CollectOperationsInput> = {},
): CollectOperationsInput {
  return {
    sessionId: 'runtime-session-1',
    runtimeExecutionId: 'runtime-execution-1',
    title: 'Demo Operations',
    policyStatus: 'Published',
    governanceStatus: 'Compliant',
    healthStatus: 'Healthy',
    auditStatus: 'Published',
    enforcementStatus: 'ALLOW',
    recoveryStatus: 'COMPLETED',
    observabilityStatus: 'Published',
    lastReportId: 'recovery-report-1',
    lastReportStatus: 'COMPLETED',
    ...overrides,
  };
}

describe('BasicDashboardAggregationStrategy', () => {
  it('aggregates published statuses without new evaluation', () => {
    const strategy = createBasicDashboardAggregationStrategy();
    const snapshot = strategy.aggregate(
      sampleInput(),
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(snapshot.policyStatus, 'Published');
    assert.equal(snapshot.governanceStatus, 'Compliant');
    assert.equal(snapshot.recoveryStatus, 'COMPLETED');
    assert.equal(snapshot.metadata.lastReportId, 'recovery-report-1');
  });
});

describe('RuntimeOperationsValidator', () => {
  it('flags missing session', () => {
    const validator = createRuntimeOperationsValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      snapshot: {
        id: 's1',
        runtimeExecutionId: null,
        policyStatus: 'Unknown',
        governanceStatus: 'Unknown',
        healthStatus: 'Unknown',
        auditStatus: 'Unknown',
        enforcementStatus: 'Unknown',
        recoveryStatus: 'Unknown',
        createdAt: '2026-08-19T00:00:00.000Z',
        metadata: {
          title: 't',
          notes: 'n',
          sessionId: '',
          observabilityStatus: 'Unknown',
          lastReportId: null,
          lastReportStatus: null,
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
      result.issues.some((item) => item.code === 'snapshot-missing-session'),
    );
  });
});

describe('createRuntimeOperationsDashboard', () => {
  it('collects, aggregates, validates and publishes', () => {
    const dashboard = createRuntimeOperationsDashboard({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const collected = dashboard.collect(sampleInput());
    assert.equal(collected.sessionId, 'runtime-session-1');

    const pkg = dashboard.refresh(sampleInput());
    assert.equal(pkg.snapshot.healthStatus, 'Healthy');
    assert.ok(
      dashboard.getEvents().some((event) => event.type === 'OperationsCollected'),
    );
    assert.ok(
      dashboard
        .getEvents()
        .some((event) => event.type === 'OperationsAggregated'),
    );

    const validation = dashboard.validate(pkg.id);
    assert.equal(validation.valid, true);

    const published = dashboard.publish(pkg.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      dashboard
        .getEvents()
        .some((event) => event.type === 'OperationsPublished'),
    );
  });
});

describe('RuntimeOperationsIndex', () => {
  it('indexes snapshots', () => {
    const index = createRuntimeOperationsIndex();
    const dashboard = createRuntimeOperationsDashboard();
    const pkg = dashboard.refresh(sampleInput());
    const entry = index.index(pkg.id, pkg);
    assert.equal(entry.recoveryStatus, 'COMPLETED');
    assert.equal(index.find(pkg.snapshot.id).length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createRuntimeOperationsApi', () => {
  it('exposes collect / publish / preview / list / validate', () => {
    const api = createRuntimeOperationsApi();
    const collected = api.collectOperations(sampleInput());
    assert.equal(api.listSnapshots().length, 1);
    const validated = api.validateOperations(collected.id);
    assert.equal(validated.valid, true);
    const published = api.publishOperations(collected.id);
    assert.equal(published.metadata.status, 'Published');
    assert.equal(api.previewOperations(collected.id)?.id, collected.id);
  });
});
