import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { ExecuteRecoveryInput, RecoverySequence } from '../../model';
import {
  createBasicRecoveryExecutionStrategy,
  createRuntimeRecoveryExecutionValidator,
} from './basic-recovery-execution-strategy';
import { createRuntimeRecoveryExecutionApi } from './runtime-recovery-execution-api';
import { createRuntimeRecoveryExecutor } from './runtime-recovery-executor';
import { createRuntimeRecoveryExecutionIndex } from './runtime-recovery-execution-index';

function sampleSequence(
  overrides: Partial<RecoverySequence> = {},
): RecoverySequence {
  return {
    id: 'recovery-sequence-1',
    runtimeExecutionId: 'runtime-execution-1',
    steps: [
      {
        id: 'step-1',
        order: 1,
        action: 'ConfirmHealth',
        description: 'Confirm health',
        dependsOn: [],
        metadata: {
          notes: 'n',
          sourceActionId: null,
          estimatedSeconds: 30,
        },
      },
      {
        id: 'step-2',
        order: 2,
        action: 'ContinueSession',
        description: 'Continue',
        dependsOn: ['step-1'],
        metadata: {
          notes: 'n',
          sourceActionId: null,
          estimatedSeconds: 15,
        },
      },
    ],
    estimatedDuration: 45,
    riskLevel: 'low',
    createdAt: '2026-08-19T00:00:00.000Z',
    metadata: {
      title: 'Demo Sequence',
      notes: 'n',
      sessionId: 'runtime-session-1',
      planId: 'plan-1',
      recoveryStrategy: 'CONTINUE',
    },
    ...overrides,
  };
}

function sampleInput(
  overrides: Partial<ExecuteRecoveryInput> = {},
): ExecuteRecoveryInput {
  return {
    sessionId: 'runtime-session-1',
    title: 'Demo Recovery Execution',
    sequence: sampleSequence(),
    failOnStepId: null,
    ...overrides,
  };
}

describe('BasicRecoveryExecutionStrategy', () => {
  it('executes all steps to completion', () => {
    const strategy = createBasicRecoveryExecutionStrategy();
    const { execution, result } = strategy.execute(
      sampleInput(),
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(execution.status, 'COMPLETED');
    assert.equal(result?.status, 'Succeeded');
    assert.equal(result?.completedSteps.length, 2);
  });

  it('fails on configured step without owning Runtime', () => {
    const strategy = createBasicRecoveryExecutionStrategy();
    const { execution, result } = strategy.execute(
      sampleInput({ failOnStepId: 'step-2' }),
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(execution.status, 'FAILED');
    assert.equal(result?.failedSteps.includes('step-2'), true);
  });
});

describe('RuntimeRecoveryExecutionValidator', () => {
  it('flags missing session', () => {
    const validator = createRuntimeRecoveryExecutionValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const sequence = sampleSequence();
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      execution: {
        id: 'e1',
        runtimeExecutionId: null,
        sequenceId: sequence.id,
        status: 'READY',
        currentStep: null,
        startedAt: null,
        completedAt: null,
        metadata: {
          title: 't',
          notes: 'n',
          sessionId: '',
          totalSteps: 2,
          completedStepIds: [],
          failedStepIds: [],
        },
      },
      result: null,
      sequenceSnapshot: sequence,
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
      result.issues.some((item) => item.code === 'execution-missing-session'),
    );
  });
});

describe('createRuntimeRecoveryExecutor', () => {
  it('initializes, executes, validates and publishes', () => {
    const executor = createRuntimeRecoveryExecutor({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const ready = executor.initialize(sampleInput());
    assert.equal(ready.execution.status, 'READY');

    const executed = executor.execute(ready.id);
    assert.equal(executed.execution.status, 'COMPLETED');
    assert.ok(
      executor
        .getEvents()
        .some((event) => event.type === 'RecoveryExecutionStarted'),
    );
    assert.ok(
      executor
        .getEvents()
        .some((event) => event.type === 'RecoveryExecutionCompleted'),
    );

    const validation = executor.validate(ready.id);
    assert.equal(validation.valid, true);

    const published = executor.publish(ready.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      executor
        .getEvents()
        .some((event) => event.type === 'RecoveryExecutionPublished'),
    );
  });

  it('pauses and resumes from READY', () => {
    const executor = createRuntimeRecoveryExecutor();
    const ready = executor.initialize(sampleInput());
    const paused = executor.pause(ready.id);
    assert.equal(paused.execution.status, 'PAUSED');
    assert.ok(
      executor
        .getEvents()
        .some((event) => event.type === 'RecoveryExecutionPaused'),
    );
    const resumed = executor.resume(ready.id);
    assert.equal(resumed.execution.status, 'COMPLETED');
  });
});

describe('RuntimeRecoveryExecutionIndex', () => {
  it('indexes executions', () => {
    const index = createRuntimeRecoveryExecutionIndex();
    const executor = createRuntimeRecoveryExecutor();
    const pkg = executor.initialize(sampleInput());
    const entry = index.index(pkg.id, pkg);
    assert.equal(entry.status, 'READY');
    assert.equal(index.find(pkg.execution.id).length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createRuntimeRecoveryExecutionApi', () => {
  it('exposes execute / pause / resume / list / validate', () => {
    const api = createRuntimeRecoveryExecutionApi();
    const executed = api.executeRecovery(sampleInput());
    assert.equal(executed.execution.status, 'COMPLETED');
    assert.equal(api.listRecoveryExecutions().length, 1);
    const validated = api.validateRecoveryExecution(executed.id);
    assert.equal(validated.valid, true);
    const published = api.publishRecoveryExecution(executed.id);
    assert.equal(published.metadata.status, 'Published');
    assert.equal(api.previewRecoveryExecution(executed.id)?.id, executed.id);
  });
});
