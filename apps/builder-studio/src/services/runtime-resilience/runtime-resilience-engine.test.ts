import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { EvaluateResilienceInput } from '../../model';
import {
  createBasicRecoveryStrategy,
  createRuntimeResilienceValidator,
} from './basic-recovery-strategy';
import { createRuntimeResilienceApi } from './runtime-resilience-api';
import { createRuntimeResilienceEngine } from './runtime-resilience-engine';
import { createRuntimeResilienceIndex } from './runtime-resilience-index';

function sampleInput(
  overrides: Partial<EvaluateResilienceInput> = {},
): EvaluateResilienceInput {
  return {
    sessionId: 'runtime-session-1',
    runtimeExecutionId: 'runtime-execution-1',
    title: 'Demo Resilience',
    healthStatus: 'Healthy',
    healthScore: 1,
    enforcementStatus: 'ALLOW',
    disruptionCodes: [],
    moduleFailures: [],
    hasCheckpoint: true,
    ...overrides,
  };
}

describe('BasicRecoveryStrategy', () => {
  it('continues when healthy and allowed', () => {
    const strategy = createBasicRecoveryStrategy();
    const input = sampleInput();
    const kind = strategy.evaluate(input);
    const plan = strategy.createPlan(
      input,
      kind,
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(kind, 'CONTINUE');
    assert.equal(plan.estimatedRecoveryLevel, 'Full');
    assert.ok(plan.recommendedSteps.length >= 1);
  });

  it('recommends restart runtime on critical without executing it', () => {
    const strategy = createBasicRecoveryStrategy();
    const input = sampleInput({
      healthStatus: 'Critical',
      enforcementStatus: 'BLOCK',
    });
    const kind = strategy.evaluate(input);
    const plan = strategy.createPlan(
      input,
      kind,
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(kind, 'RESTART_RUNTIME');
    assert.equal(plan.severity, 'critical');
    assert.equal(plan.estimatedRecoveryLevel, 'Minimal');
  });

  it('recommends restore checkpoint on degraded health', () => {
    const strategy = createBasicRecoveryStrategy();
    const kind = strategy.evaluate(
      sampleInput({ healthStatus: 'Degraded', enforcementStatus: 'WARN' }),
    );
    assert.equal(kind, 'RESTORE_CHECKPOINT');
  });
});

describe('RuntimeResilienceValidator', () => {
  it('flags missing session', () => {
    const validator = createRuntimeResilienceValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      recoveryPlan: {
        id: 'plan-1',
        sessionId: '',
        runtimeExecutionId: null,
        severity: 'info',
        recoveryStrategy: 'CONTINUE',
        recommendedSteps: [
          {
            id: 'a1',
            step: 1,
            description: 'Continue',
            priority: 10,
            metadata: { notes: 'n', strategy: 'CONTINUE' },
          },
        ],
        estimatedRecoveryLevel: 'Full',
        createdAt: '2026-08-19T00:00:00.000Z',
        metadata: {
          title: 't',
          notes: 'n',
          healthStatus: 'Healthy',
          enforcementStatus: 'ALLOW',
          disruptionCodes: [],
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
      result.issues.some((item) => item.code === 'plan-missing-session'),
    );
  });
});

describe('createRuntimeResilienceEngine', () => {
  it('inspects, evaluates, validates and publishes', () => {
    const engine = createRuntimeResilienceEngine({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const inspected = engine.inspect(sampleInput());
    assert.equal(inspected.sessionId, 'runtime-session-1');

    const pkg = engine.evaluate(sampleInput());
    assert.equal(pkg.recoveryPlan.recoveryStrategy, 'CONTINUE');
    assert.ok(
      engine.getEvents().some((event) => event.type === 'RecoveryEvaluated'),
    );
    assert.ok(
      engine.getEvents().some((event) => event.type === 'RecoveryPlanCreated'),
    );
    assert.equal(engine.createRecoveryPlan(pkg.id).id, pkg.recoveryPlan.id);

    const validation = engine.validate(pkg.id);
    assert.equal(validation.valid, true);

    const published = engine.publish(pkg.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      engine.getEvents().some((event) => event.type === 'RecoveryPublished'),
    );

    const disposed = engine.dispose(pkg.id);
    assert.equal(disposed.metadata.status, 'Disposed');
  });
});

describe('RuntimeResilienceIndex', () => {
  it('indexes recovery plans', () => {
    const index = createRuntimeResilienceIndex();
    const engine = createRuntimeResilienceEngine();
    const pkg = engine.evaluate(sampleInput());
    const entry = index.index(pkg.id, pkg);
    assert.equal(entry.recoveryStrategy, 'CONTINUE');
    assert.equal(index.find(pkg.recoveryPlan.id).length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createRuntimeResilienceApi', () => {
  it('exposes evaluate / publish / preview / list / validate', () => {
    const api = createRuntimeResilienceApi();
    const evaluated = api.evaluateRecovery(sampleInput());
    assert.equal(api.listRecoveryPlans().length, 1);
    const validated = api.validateRecovery(evaluated.id);
    assert.equal(validated.valid, true);
    const published = api.publishRecovery(evaluated.id);
    assert.equal(published.metadata.status, 'Published');
    assert.equal(api.previewRecovery(evaluated.id)?.id, evaluated.id);
    assert.equal(api.listPackages().length, 1);
    assert.ok(api.listEvents().length > 0);
    assert.equal(api.listIndex().length, 1);
  });
});
