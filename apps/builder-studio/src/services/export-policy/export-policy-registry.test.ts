import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createExportPolicyApi } from './export-policy-api';

describe('ExportPolicyRegistry', () => {
  it('registers a policy and exposes it via list/find', () => {
    const api = createExportPolicyApi();
    const pkg = api.registerExportPolicy(null, {
      name: 'policy-ready-export',
      conditions: ['artifactPublished', 'schemaValid'],
    });

    assert.ok(pkg.id);
    assert.strictEqual(pkg.policies.length, 1);
    assert.strictEqual(pkg.policies[0].name, 'policy-ready-export');
    assert.deepStrictEqual(pkg.policies[0].conditions, [
      'artifactPublished',
      'schemaValid',
    ]);

    assert.strictEqual(api.listExportPolicies().length, 1);
    assert.strictEqual(api.findExportPolicy('policy-ready-export').length, 1);
  });

  it('supports multiple policies in a package', () => {
    const api = createExportPolicyApi();
    const pkg = api.registerExportPolicy(null, {
      name: 'policy-one',
      conditions: ['artifactPublished'],
    });

    api.registerExportPolicy(pkg.id, {
      name: 'policy-two',
      conditions: ['schemaValid', 'capabilitySupported'],
    });

    const updated = api.getPackage(pkg.id);
    assert.ok(updated);
    assert.strictEqual(updated.policies.length, 2);
  });

  it('validates policies', () => {
    const api = createExportPolicyApi();
    const pkg = api.registerExportPolicy(null, {
      name: 'policy-validate',
      conditions: ['artifactPublished'],
    });
    const validation = api.validateExportPolicy(pkg.id);
    assert.strictEqual(validation.valid, true);
    assert.strictEqual(validation.issues.length, 0);
  });

  it('records register and validate events', () => {
    const api = createExportPolicyApi();
    const pkg = api.registerExportPolicy(null, {
      name: 'policy-events',
      conditions: ['schemaValid'],
    });
    api.validateExportPolicy(pkg.id);

    const events = api.listEvents();
    assert.ok(events.some((e) => e.type === 'ExportPolicyRegistered'));
    assert.ok(events.some((e) => e.type === 'ExportPolicyValidated'));
  });

  it('maintains index entries', () => {
    const api = createExportPolicyApi();
    api.registerExportPolicy(null, {
      name: 'policy-index',
      conditions: ['capabilitySupported'],
    });

    const index = api.listIndex();
    assert.ok(index.length >= 1);
    assert.ok(index.some((e) => e.name === 'policy-index'));
  });

  it('disposes a package', () => {
    const api = createExportPolicyApi();
    const pkg = api.registerExportPolicy(null, {
      name: 'policy-dispose',
      conditions: ['notDeprecated'],
    });
    const disposed = api.disposeExportPolicy(pkg.id);
    assert.strictEqual(disposed.metadata.status, 'Disposed');
  });

  it('rejects empty name/conditions in strategy supports()', () => {
    const api = createExportPolicyApi();

    assert.throws(() => {
      api.registerExportPolicy(null, {
        name: '',
        conditions: ['artifactPublished'],
      });
    }, /does not support/);

    assert.throws(() => {
      api.registerExportPolicy(null, {
        name: 'policy-empty',
        conditions: [],
      });
    }, /does not support/);
  });
});

