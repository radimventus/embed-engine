import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { StartRecoverySessionInput } from '../../model';
import {
  createBasicRecoveryCoordinationStrategy,
  createRuntimeRecoveryCoordinatorValidator,
} from './basic-recovery-coordination-strategy';
import { createRuntimeRecoveryCoordinatorApi } from './runtime-recovery-coordinator-api';
import { createRuntimeRecoveryCoordinator } from './runtime-recovery-coordinator';
import { createRuntimeRecoveryCoordinatorIndex } from './runtime-recovery-coordinator-index';

function sampleInput(
  overrides: Partial<StartRecoverySessionInput> = {},
): StartRecoverySessionInput {
  return {
    sessionId: 'runtime-session-1',
    runtimeExecutionId: 'runtime-execution-1',
    title: 'Demo Recovery Coordinator',
    executions: [
      {
        executionId: 'recovery-execution-1',
        status: 'COMPLETED',
        sequenceId: 'recovery-sequence-1',
      },
    ],
    ...overrides,
  };
}

describe('BasicRecoveryCoordinationStrategy', () => {
  it('coordinates completed executions', () => {
    const strategy = createBasicRecoveryCoordinationStrategy();
    const session = strategy.coordinate(
      {
        id: 'recovery-session-1',
        runtimeExecutionId: 'runtime-execution-1',
        status: 'RUNNING',
        executions: [],
        startedAt: '2026-08-19T00:00:00.000Z',
        completedAt: null,
        metadata: {
          title: 't',
          notes: 'n',
          sessionId: 'runtime-session-1',
          progressPercent: 0,
        },
      },
      [
        {
          executionId: 'e1',
          status: 'COMPLETED',
          sequenceId: 's1',
        },
      ],
      () => new Date('2026-08-19T00:01:00.000Z'),
    );
    assert.equal(session.status, 'COMPLETED');
    assert.equal(session.metadata.progressPercent, 100);
  });
});

describe('RuntimeRecoveryCoordinatorValidator', () => {
  it('flags missing session id', () => {
    const validator = createRuntimeRecoveryCoordinatorValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      session: {
        id: 'rs1',
        runtimeExecutionId: null,
        status: 'CREATED',
        executions: [],
        startedAt: null,
        completedAt: null,
        metadata: {
          title: 't',
          notes: 'n',
          sessionId: '',
          progressPercent: 0,
        },
      },
      summary: null,
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
      result.issues.some((item) => item.code === 'session-missing-session-id'),
    );
  });
});

describe('createRuntimeRecoveryCoordinator', () => {
  it('starts, tracks, completes and publishes', () => {
    const coordinator = createRuntimeRecoveryCoordinator({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const started = coordinator.startRecovery(
      coordinator.initialize(sampleInput()).id,
    );
    assert.equal(started.session.status, 'COMPLETED');
    assert.ok(
      coordinator
        .getEvents()
        .some((event) => event.type === 'RecoverySessionStarted'),
    );

    const tracked = coordinator.trackProgress({
      packageId: coordinator.initialize({
        sessionId: 'runtime-session-2',
        executions: [
          {
            executionId: 'e-running',
            status: 'RUNNING',
            sequenceId: 'seq-1',
          },
        ],
      }).id,
      executions: [
        {
          executionId: 'e-running',
          status: 'COMPLETED',
          sequenceId: 'seq-1',
        },
      ],
    });
    assert.equal(tracked.session.status, 'COMPLETED');
    assert.ok(
      coordinator
        .getEvents()
        .some((event) => event.type === 'RecoveryProgressUpdated'),
    );

    const pkg = coordinator.initialize(sampleInput());
    const startedPkg = coordinator.startRecovery(pkg.id);
    const completed = coordinator.completeRecovery(startedPkg.id);
    assert.ok(completed.summary !== null);
    assert.ok(
      coordinator.getEvents().some((event) => event.type === 'RecoveryCompleted'),
    );

    const validation = coordinator.validate(completed.id);
    assert.equal(validation.valid, true);
    const published = coordinator.publish(completed.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      coordinator
        .getEvents()
        .some((event) => event.type === 'RecoverySummaryPublished'),
    );
  });
});

describe('RuntimeRecoveryCoordinatorIndex', () => {
  it('indexes sessions', () => {
    const index = createRuntimeRecoveryCoordinatorIndex();
    const coordinator = createRuntimeRecoveryCoordinator();
    const pkg = coordinator.initialize(sampleInput());
    const entry = index.index(pkg.id, pkg);
    assert.equal(entry.status, 'CREATED');
    assert.equal(index.find(pkg.session.id).length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createRuntimeRecoveryCoordinatorApi', () => {
  it('exposes start / complete / publish / list / validate', () => {
    const api = createRuntimeRecoveryCoordinatorApi();
    const started = api.startRecoverySession(sampleInput());
    assert.equal(api.listRecoverySessions().length, 1);
    const completed = api.completeRecoverySession(started.id);
    assert.ok(completed.summary !== null);
    const validated = api.validateRecoverySession(completed.id);
    assert.equal(validated.valid, true);
    const published = api.publishRecoverySummary(completed.id);
    assert.equal(published.metadata.status, 'Published');
    assert.equal(api.previewRecoverySummary(completed.id)?.id, completed.id);
  });
});
