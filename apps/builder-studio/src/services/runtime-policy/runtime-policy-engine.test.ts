import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  createBasicPolicyRegistryStrategy,
  createRuntimePolicyValidator,
} from './basic-policy-registry-strategy';
import { createRuntimePolicyApi } from './runtime-policy-api';
import { createRuntimePolicyEngine } from './runtime-policy-engine';
import { createRuntimePolicyIndex } from './runtime-policy-index';

describe('BasicPolicyRegistryStrategy', () => {
  it('registers a draft policy', () => {
    const strategy = createBasicPolicyRegistryStrategy();
    const policy = strategy.register(
      {
        name: 'Demo Policy',
        category: 'Platform',
        description: 'Demo description',
        code: 'demo-policy',
      },
      (prefix) => `${prefix}-1`,
    );
    assert.equal(policy.status, 'Draft');
    assert.equal(policy.metadata.code, 'demo-policy');
  });
});

describe('RuntimePolicyValidator', () => {
  it('flags empty registry', () => {
    const validator = createRuntimePolicyValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      registry: {
        id: 'r1',
        version: '1.0.0',
        policies: [],
        createdAt: '2026-08-19T00:00:00.000Z',
        updatedAt: '2026-08-19T00:00:00.000Z',
        metadata: { title: 't', notes: 'n', status: 'Open' },
      },
      createdAt: '2026-08-19T00:00:00.000Z',
      updatedAt: '2026-08-19T00:00:00.000Z',
      metadata: { title: 't', notes: 'n', status: 'Draft' },
      validation: null,
    });
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((item) => item.code === 'empty-registry'));
  });
});

describe('createRuntimePolicyEngine', () => {
  it('initializes, registers, updates, validates and publishes', () => {
    const engine = createRuntimePolicyEngine({
      seed: true,
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = engine.initialize('Demo Policies');
    assert.ok(pkg.registry.policies.length >= 4);
    assert.ok(
      engine.getEvents().some((event) => event.type === 'PolicyRegistered'),
    );

    const registered = engine.registerPolicy({
      name: 'Execution Binding',
      category: 'Execution',
      description: 'Runtime execution id should be present.',
      code: 'execution-bound',
      severity: 'warning',
    });
    assert.ok(
      registered.registry.policies.some(
        (item) => item.metadata.code === 'execution-bound',
      ),
    );

    const policyId = registered.registry.policies.find(
      (item) => item.metadata.code === 'execution-bound',
    )?.id;
    assert.ok(policyId);
    const updated = engine.updatePolicy(policyId, {
      description: 'Updated execution binding policy.',
      status: 'Draft',
    });
    assert.ok(
      updated.registry.policies.some((item) =>
        item.description.includes('Updated'),
      ),
    );
    assert.ok(
      engine.getEvents().some((event) => event.type === 'PolicyUpdated'),
    );

    const validation = engine.validate();
    assert.equal(validation.valid, true);

    const published = engine.publishPolicies();
    assert.equal(published.metadata.status, 'Published');
    assert.equal(published.registry.metadata.status, 'Published');
    assert.ok(
      published.registry.policies.every(
        (item) => item.status === 'Active' || item.status === 'Deprecated',
      ),
    );
    assert.ok(
      engine
        .getEvents()
        .some((event) => event.type === 'PolicyPackagePublished'),
    );

    assert.equal(engine.listPolicies().length, published.registry.policies.length);
    const disposed = engine.dispose();
    assert.equal(disposed.metadata.status, 'Disposed');
  });
});

describe('RuntimePolicyIndex', () => {
  it('indexes policies from package', () => {
    const index = createRuntimePolicyIndex();
    const engine = createRuntimePolicyEngine({ seed: true });
    const pkg = engine.initialize();
    const entries = index.index(pkg.id, pkg);
    assert.ok(entries.length >= 4);
    assert.equal(index.find(entries[0]!.policyId).length, 1);
    assert.equal(index.rebuild([pkg]).length, entries.length);
  });
});

describe('createRuntimePolicyApi', () => {
  it('exposes register / update / publish / list / validate', () => {
    const api = createRuntimePolicyApi(
      createRuntimePolicyEngine({ seed: true }),
    );
    api.initialize();
    const registered = api.registerPolicy({
      name: 'Validation Summary',
      category: 'Validation',
      description: 'Upstream validations must pass.',
      code: 'validation-summary',
    });
    assert.ok(api.listPolicies().length >= 5);
    const target = registered.registry.policies.find(
      (item) => item.metadata.code === 'validation-summary',
    );
    assert.ok(target);
    api.updatePolicy(target.id, { notes: 'Updated notes' });
    const validated = api.validatePolicies();
    assert.equal(validated.valid, true);
    const published = api.publishPolicies();
    assert.equal(published.metadata.status, 'Published');
    assert.equal(api.preview()?.id, published.id);
    assert.ok(api.listEvents().length > 0);
    assert.ok(api.listIndex().length > 0);
  });
});
