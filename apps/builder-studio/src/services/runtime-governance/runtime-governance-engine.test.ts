import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { EvaluateGovernanceInput } from '../../model';
import {
  createBasicGovernanceEvaluationStrategy,
  createRuntimeGovernanceValidator,
} from './basic-governance-evaluation-strategy';
import { createRuntimeGovernanceApi } from './runtime-governance-api';
import { createRuntimeGovernanceEngine } from './runtime-governance-engine';
import { createRuntimeGovernanceIndex } from './runtime-governance-index';

function sampleInput(
  overrides: Partial<EvaluateGovernanceInput> = {},
): EvaluateGovernanceInput {
  return {
    sessionId: 'runtime-session-1',
    runtimeExecutionId: 'runtime-execution-1',
    title: 'Demo Runtime Governance',
    hasObservability: true,
    observabilityHealthy: true,
    healthScore: 0.85,
    healthOverall: 'Healthy',
    hasAuditTrail: true,
    auditImmutable: true,
    auditValidated: true,
    healthValidated: true,
    observabilityValidated: true,
    ...overrides,
  };
}

describe('BasicGovernanceEvaluationStrategy', () => {
  it('evaluates compliant platform deterministically', () => {
    const strategy = createBasicGovernanceEvaluationStrategy();
    const result = strategy.evaluate(
      sampleInput(),
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(result.overallStatus, 'Compliant');
    assert.equal(result.failedRules.length, 0);
    assert.ok(result.score >= 0.9);
  });

  it('flags missing audit as non-compliant', () => {
    const strategy = createBasicGovernanceEvaluationStrategy();
    const result = strategy.evaluate(
      sampleInput({ hasAuditTrail: false, healthOverall: 'Critical' }),
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(result.overallStatus, 'NonCompliant');
    assert.ok(
      result.failedRules.some(
        (item) => item.metadata.code === 'audit-trail-present',
      ),
    );
  });
});

describe('RuntimeGovernanceValidator', () => {
  it('flags invalid score', () => {
    const validator = createRuntimeGovernanceValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      evaluation: {
        id: 'e1',
        sessionId: 's1',
        runtimeExecutionId: null,
        passedRules: [],
        failedRules: [],
        overallStatus: 'Compliant',
        score: 1.5,
        createdAt: '2026-08-19T00:00:00.000Z',
        metadata: {
          title: 't',
          notes: 'n',
          evaluatedRuleCount: 0,
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

describe('createRuntimeGovernanceEngine', () => {
  it('evaluates, summarizes, validates and publishes', () => {
    const engine = createRuntimeGovernanceEngine({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = engine.evaluate(sampleInput());
    assert.equal(pkg.evaluation.overallStatus, 'Compliant');
    assert.ok(
      engine.getEvents().some((event) => event.type === 'GovernanceEvaluated'),
    );

    const summary = engine.summarize(pkg.id);
    assert.equal(summary.overallStatus, 'Compliant');
    assert.equal(summary.failedCount, 0);

    const validation = engine.validate(pkg.id);
    assert.equal(validation.valid, true);

    const published = engine.publish(pkg.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      engine.getEvents().some((event) => event.type === 'GovernancePublished'),
    );

    const disposed = engine.dispose(pkg.id);
    assert.equal(disposed.metadata.status, 'Disposed');
  });
});

describe('RuntimeGovernanceIndex', () => {
  it('indexes and finds packages', () => {
    const index = createRuntimeGovernanceIndex();
    const engine = createRuntimeGovernanceEngine();
    const pkg = engine.evaluate(sampleInput());
    const entry = index.index(pkg.id, pkg);
    assert.equal(entry.sessionId, 'runtime-session-1');
    assert.equal(index.find(pkg.evaluation.id).length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createRuntimeGovernanceApi', () => {
  it('exposes evaluate / publish / preview / list / validate', () => {
    const api = createRuntimeGovernanceApi();
    const evaluated = api.evaluateGovernance(sampleInput());
    assert.equal(api.listGovernanceReports().length, 1);
    const validated = api.validateGovernance(evaluated.id);
    assert.equal(validated.valid, true);
    const published = api.publishGovernance(evaluated.id);
    assert.equal(published.metadata.status, 'Published');
    assert.equal(api.previewGovernance(evaluated.id)?.id, evaluated.id);
    assert.equal(api.listPackages().length, 1);
    assert.ok(api.listEvents().length > 0);
    assert.equal(api.listIndex().length, 1);
  });
});
