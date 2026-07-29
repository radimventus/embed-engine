import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { RegisterCompatibilityRuleInput } from '../../model';
import {
  createBasicRuntimeCompatibilityStrategy,
  createRuntimeCompatibilityValidator,
} from './basic-runtime-compatibility-strategy';
import { createRuntimeCompatibilityApi } from './runtime-compatibility-api';
import { createRuntimeCompatibilityManager } from './runtime-compatibility-manager';
import { createRuntimeCompatibilityIndex } from './runtime-compatibility-index';

function sampleRule(
  overrides: Partial<RegisterCompatibilityRuleInput> = {},
): RegisterCompatibilityRuleInput {
  return {
    sourceVersion: '1.0.0',
    targetVersion: '1.1.0',
    status: 'Compatible',
    reason: 'Minor bump within major 1.',
    dimension: 'runtime',
    ...overrides,
  };
}

describe('BasicRuntimeCompatibilityStrategy', () => {
  it('evaluates explicit rule without migration', () => {
    const strategy = createBasicRuntimeCompatibilityStrategy();
    const manager = createRuntimeCompatibilityManager();
    const pkg = manager.initialize({
      sessionId: 's1',
      rules: [sampleRule()],
    });
    const evaluation = strategy.evaluate(
      pkg.matrix,
      { sourceVersion: '1.0.0', targetVersion: '1.1.0' },
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(evaluation.status, 'Compatible');
    assert.equal(evaluation.matchedRuleId, pkg.matrix.rules[0]?.id);
  });
});

describe('RuntimeCompatibilityValidator', () => {
  it('flags missing runtime version', () => {
    const validator = createRuntimeCompatibilityValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      matrix: {
        id: 'm1',
        runtimeVersion: '',
        manifestVersion: '1.0.0',
        apiVersion: '1.0.0',
        supportedConsumers: [],
        rules: [],
        metadata: {
          title: 't',
          notes: 'n',
          sessionId: 's1',
          overallStatus: 'Compatible',
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
      result.issues.some(
        (item) => item.code === 'matrix-missing-runtime-version',
      ),
    );
  });
});

describe('createRuntimeCompatibilityManager', () => {
  it('registers, evaluates, validates and publishes', () => {
    const manager = createRuntimeCompatibilityManager({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = manager.initialize({
      sessionId: 'runtime-session-1',
      title: 'Demo Compatibility',
      runtimeVersion: '1.0.0',
      manifestVersion: '1.0.0',
      apiVersion: '1.0.0',
      rules: [sampleRule()],
    });
    assert.equal(pkg.matrix.rules.length, 1);
    assert.ok(
      manager
        .getEvents()
        .some((event) => event.type === 'CompatibilityRegistered'),
    );

    const evaluation = manager.evaluate(pkg.id, {
      sourceVersion: '1.0.0',
      targetVersion: '1.1.0',
    });
    assert.equal(evaluation.status, 'Compatible');
    assert.ok(
      manager
        .getEvents()
        .some((event) => event.type === 'CompatibilityEvaluated'),
    );

    const validation = manager.validate(pkg.id);
    assert.equal(validation.valid, true);

    const published = manager.publish(pkg.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      manager
        .getEvents()
        .some((event) => event.type === 'CompatibilityPublished'),
    );
  });
});

describe('RuntimeCompatibilityIndex', () => {
  it('indexes rules', () => {
    const index = createRuntimeCompatibilityIndex();
    const manager = createRuntimeCompatibilityManager();
    const pkg = manager.initialize({
      sessionId: 's1',
      rules: [sampleRule()],
    });
    const entries = index.index(pkg.id, pkg);
    assert.equal(entries.length, 1);
    assert.equal(index.find('1.0.0').length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createRuntimeCompatibilityApi', () => {
  it('exposes evaluate / publish / list / find / validate', () => {
    const api = createRuntimeCompatibilityApi();
    const created = api.registerCompatibilityRule(null, sampleRule(), {
      sessionId: 'runtime-session-1',
      title: 'API Compatibility',
    });
    assert.equal(api.listCompatibilityRules(created.id).length, 1);
    const validated = api.validateCompatibility(created.id);
    assert.equal(validated.valid, true);
    assert.equal(
      api.evaluateCompatibility(created.id, {
        sourceVersion: '1.0.0',
        targetVersion: '1.1.0',
      }).status,
      'Compatible',
    );
    assert.equal(api.findCompatibility(created.id, '1.0.0').length, 1);
  });
});
