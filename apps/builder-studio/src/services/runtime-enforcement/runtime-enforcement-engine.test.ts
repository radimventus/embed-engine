import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { EvaluateEnforcementInput } from '../../model';
import {
  BASIC_ENFORCEMENT_RULES,
  createBasicEnforcementStrategy,
  createRuntimeEnforcementValidator,
} from './basic-enforcement-strategy';
import { createRuntimeEnforcementApi } from './runtime-enforcement-api';
import { createRuntimePolicyEnforcementEngine } from './runtime-enforcement-engine';
import { createRuntimeEnforcementIndex } from './runtime-enforcement-index';

function sampleInput(
  overrides: Partial<EvaluateEnforcementInput> = {},
): EvaluateEnforcementInput {
  return {
    sessionId: 'runtime-session-1',
    runtimeExecutionId: 'runtime-execution-1',
    title: 'Demo Enforcement',
    governanceStatus: 'Compliant',
    governanceScore: 1,
    failedPolicyCodes: [],
    failedSeverities: [],
    ...overrides,
  };
}

describe('BasicEnforcementStrategy', () => {
  it('allows compliant governance', () => {
    const strategy = createBasicEnforcementStrategy();
    const triggered = strategy.evaluate(sampleInput(), BASIC_ENFORCEMENT_RULES);
    const decision = strategy.decide(
      sampleInput(),
      triggered,
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(decision.status, 'ALLOW');
    assert.equal(decision.recommendedAction, 'Continue');
  });

  it('blocks on critical severity without executing runtime', () => {
    const strategy = createBasicEnforcementStrategy();
    const input = sampleInput({
      governanceStatus: 'NonCompliant',
      failedSeverities: ['critical'],
      failedPolicyCodes: ['health-not-critical'],
    });
    const triggered = strategy.evaluate(input, BASIC_ENFORCEMENT_RULES);
    const decision = strategy.decide(
      input,
      triggered,
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(decision.status, 'BLOCK');
    assert.equal(decision.recommendedAction, 'RecommendHalt');
  });
});

describe('RuntimeEnforcementValidator', () => {
  it('flags missing session', () => {
    const validator = createRuntimeEnforcementValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      decision: {
        id: 'd1',
        sessionId: '',
        runtimeExecutionId: null,
        status: 'ALLOW',
        reason: 'ok',
        recommendedAction: 'Continue',
        createdAt: '2026-08-19T00:00:00.000Z',
        metadata: {
          title: 't',
          notes: 'n',
          governanceStatus: 'Compliant',
          triggeredRuleIds: [],
        },
      },
      triggeredRules: [],
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
      result.issues.some((item) => item.code === 'decision-missing-session'),
    );
  });
});

describe('createRuntimePolicyEnforcementEngine', () => {
  it('evaluates, decides, validates and publishes', () => {
    const engine = createRuntimePolicyEnforcementEngine({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = engine.evaluate(sampleInput());
    assert.equal(pkg.decision.status, 'ALLOW');
    assert.ok(
      engine.getEvents().some((event) => event.type === 'EnforcementEvaluated'),
    );
    assert.ok(
      engine
        .getEvents()
        .some((event) => event.type === 'EnforcementDecisionCreated'),
    );
    assert.equal(engine.decide(pkg.id).id, pkg.decision.id);

    const validation = engine.validate(pkg.id);
    assert.equal(validation.valid, true);

    const published = engine.publish(pkg.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      engine.getEvents().some((event) => event.type === 'EnforcementPublished'),
    );

    const disposed = engine.dispose(pkg.id);
    assert.equal(disposed.metadata.status, 'Disposed');
  });
});

describe('RuntimeEnforcementIndex', () => {
  it('indexes decisions', () => {
    const index = createRuntimeEnforcementIndex();
    const engine = createRuntimePolicyEnforcementEngine();
    const pkg = engine.evaluate(sampleInput());
    const entry = index.index(pkg.id, pkg);
    assert.equal(entry.status, 'ALLOW');
    assert.equal(index.find(pkg.decision.id).length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createRuntimeEnforcementApi', () => {
  it('exposes evaluate / publish / preview / list / validate', () => {
    const api = createRuntimeEnforcementApi();
    const evaluated = api.evaluateEnforcement(sampleInput());
    assert.equal(api.listEnforcementDecisions().length, 1);
    const validated = api.validateEnforcement(evaluated.id);
    assert.equal(validated.valid, true);
    const published = api.publishEnforcement(evaluated.id);
    assert.equal(published.metadata.status, 'Published');
    assert.equal(api.previewEnforcement(evaluated.id)?.id, evaluated.id);
    assert.equal(api.listPackages().length, 1);
    assert.ok(api.listEvents().length > 0);
    assert.equal(api.listIndex().length, 1);
  });
});
