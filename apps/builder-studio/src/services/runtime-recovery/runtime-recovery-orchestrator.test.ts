import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { BuildRecoverySequenceInput } from '../../model';
import {
  createBasicRecoveryOrchestrationStrategy,
  createRuntimeRecoveryValidator,
} from './basic-recovery-orchestration-strategy';
import { createRuntimeRecoveryApi } from './runtime-recovery-api';
import { createRuntimeRecoveryOrchestrator } from './runtime-recovery-orchestrator';
import { createRuntimeRecoveryIndex } from './runtime-recovery-index';

function sampleInput(
  overrides: Partial<BuildRecoverySequenceInput> = {},
): BuildRecoverySequenceInput {
  return {
    sessionId: 'runtime-session-1',
    runtimeExecutionId: 'runtime-execution-1',
    title: 'Demo Recovery',
    planId: 'recovery-plan-1',
    recoveryStrategy: 'CONTINUE',
    severity: 'info',
    recommendedSteps: [
      {
        id: 'action-1',
        step: 1,
        description: 'Confirm Runtime remains healthy.',
        priority: 20,
      },
      {
        id: 'action-2',
        step: 2,
        description: 'Continue current Decision Session without interruption.',
        priority: 10,
      },
    ],
    ...overrides,
  };
}

describe('BasicRecoveryOrchestrationStrategy', () => {
  it('builds ordered continue sequence', () => {
    const strategy = createBasicRecoveryOrchestrationStrategy();
    const sequence = strategy.buildSequence(
      sampleInput(),
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(sequence.steps.length, 2);
    assert.equal(sequence.steps[0]?.order, 1);
    assert.equal(sequence.steps[1]?.dependsOn[0], sequence.steps[0]?.id);
    assert.equal(sequence.riskLevel, 'low');
    assert.ok(sequence.estimatedDuration > 0);
  });

  it('builds restart runtime sequence without executing it', () => {
    const strategy = createBasicRecoveryOrchestrationStrategy();
    const sequence = strategy.buildSequence(
      sampleInput({
        recoveryStrategy: 'RESTART_RUNTIME',
        severity: 'critical',
      }),
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(sequence.riskLevel, 'critical');
    assert.ok(sequence.steps.some((step) => step.action === 'RestartRuntime'));
  });
});

describe('RuntimeRecoveryValidator', () => {
  it('flags empty sequence via integrity path', () => {
    const validator = createRuntimeRecoveryValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      sequence: {
        id: 'seq-1',
        runtimeExecutionId: null,
        steps: [],
        estimatedDuration: 0,
        riskLevel: 'low',
        createdAt: '2026-08-19T00:00:00.000Z',
        metadata: {
          title: 't',
          notes: 'n',
          sessionId: 's1',
          planId: null,
          recoveryStrategy: 'CONTINUE',
        },
      },
      createdAt: '2026-08-19T00:00:00.000Z',
      updatedAt: '2026-08-19T00:00:00.000Z',
      metadata: {
        title: 't',
        sessionId: 's1',
        notes: 'n',
        status: 'Draft',
        planId: null,
      },
      validation: null,
    });
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((item) => item.code === 'sequence-empty'));
  });
});

describe('createRuntimeRecoveryOrchestrator', () => {
  it('builds, validates and publishes sequence', () => {
    const orchestrator = createRuntimeRecoveryOrchestrator({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = orchestrator.buildSequence(sampleInput());
    assert.equal(pkg.sequence.steps.length, 2);
    assert.ok(
      orchestrator
        .getEvents()
        .some((event) => event.type === 'RecoverySequenceBuilt'),
    );

    const validation = orchestrator.validate(pkg.id);
    assert.equal(validation.valid, true);
    assert.ok(
      orchestrator
        .getEvents()
        .some((event) => event.type === 'RecoverySequenceValidated'),
    );

    const published = orchestrator.publish(pkg.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      orchestrator
        .getEvents()
        .some((event) => event.type === 'RecoveryPackagePublished'),
    );

    const disposed = orchestrator.dispose(pkg.id);
    assert.equal(disposed.metadata.status, 'Disposed');
  });
});

describe('RuntimeRecoveryIndex', () => {
  it('indexes sequences', () => {
    const index = createRuntimeRecoveryIndex();
    const orchestrator = createRuntimeRecoveryOrchestrator();
    const pkg = orchestrator.buildSequence(sampleInput());
    const entry = index.index(pkg.id, pkg);
    assert.equal(entry.riskLevel, 'low');
    assert.equal(index.find(pkg.sequence.id).length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createRuntimeRecoveryApi', () => {
  it('exposes build / publish / preview / list / validate', () => {
    const api = createRuntimeRecoveryApi();
    const built = api.buildRecoverySequence(sampleInput());
    assert.equal(api.listRecoverySequences().length, 1);
    const validated = api.validateRecoverySequence(built.id);
    assert.equal(validated.valid, true);
    const published = api.publishRecoverySequence(built.id);
    assert.equal(published.metadata.status, 'Published');
    assert.equal(api.previewRecoverySequence(built.id)?.id, built.id);
    assert.equal(api.listPackages().length, 1);
    assert.ok(api.listEvents().length > 0);
    assert.equal(api.listIndex().length, 1);
  });
});
