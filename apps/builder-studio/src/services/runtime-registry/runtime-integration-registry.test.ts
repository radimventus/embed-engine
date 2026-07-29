import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { RegisterRegistryPackageInput } from '../../model';
import {
  createBasicRuntimeRegistryStrategy,
  createRuntimeRegistryValidator,
} from './basic-runtime-registry-strategy';
import { createRuntimeRegistryApi } from './runtime-registry-api';
import { createRuntimeIntegrationRegistry } from './runtime-integration-registry';
import { createRuntimeRegistryIndex } from './runtime-registry-index';

function samplePackage(
  overrides: Partial<RegisterRegistryPackageInput> = {},
): RegisterRegistryPackageInput {
  return {
    packageId: 'runtime-policy-package-1',
    packageType: 'Policy',
    version: '1.0.0',
    source: 'Runtime Integration Hub',
    publishedAt: '2026-08-19T00:00:00.000Z',
    title: 'Demo Policy Package',
    status: 'Published',
    ...overrides,
  };
}

describe('BasicRuntimeRegistryStrategy', () => {
  it('registers published package refs without creating Runtime', () => {
    const strategy = createBasicRuntimeRegistryStrategy();
    const entry = strategy.register(
      samplePackage(),
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(entry.packageType, 'Policy');
    assert.equal(entry.packageId, 'runtime-policy-package-1');
    assert.equal(entry.registeredAt, '2026-08-19T00:00:00.000Z');
  });
});

describe('RuntimeRegistryValidator', () => {
  it('flags missing catalog session', () => {
    const validator = createRuntimeRegistryValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      catalog: {
        id: 'c1',
        entries: [],
        createdAt: '2026-08-19T00:00:00.000Z',
        metadata: {
          title: 't',
          notes: 'n',
          sessionId: '',
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
      result.issues.some((item) => item.code === 'catalog-missing-session'),
    );
  });
});

describe('createRuntimeIntegrationRegistry', () => {
  it('registers, finds, validates and publishes', () => {
    const registry = createRuntimeIntegrationRegistry({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = registry.initialize({
      sessionId: 'runtime-session-1',
      title: 'Demo Registry',
    });
    assert.equal(pkg.catalog.entries.length, 0);

    const registered = registry.register(pkg.id, samplePackage());
    assert.equal(registered.catalog.entries.length, 1);
    assert.ok(
      registry
        .getEvents()
        .some((event) => event.type === 'RuntimePackageRegistered'),
    );

    const updated = registry.register(
      pkg.id,
      samplePackage({ version: '1.1.0' }),
    );
    assert.equal(updated.catalog.entries[0]?.version, '1.1.0');
    assert.ok(
      registry
        .getEvents()
        .some((event) => event.type === 'RuntimePackageUpdated'),
    );

    const found = registry.find(pkg.id, 'runtime-policy-package-1');
    assert.equal(found?.version, '1.1.0');
    assert.equal(registry.list(pkg.id).length, 1);

    const validation = registry.validate(pkg.id);
    assert.equal(validation.valid, true);

    const published = registry.publish(pkg.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      registry
        .getEvents()
        .some((event) => event.type === 'RuntimeRegistryPublished'),
    );
  });
});

describe('RuntimeRegistryIndex', () => {
  it('indexes registered packages', () => {
    const index = createRuntimeRegistryIndex();
    const registry = createRuntimeIntegrationRegistry();
    const pkg = registry.initialize({ sessionId: 's1' });
    const registered = registry.register(pkg.id, samplePackage());
    const entries = index.index(registered.id, registered);
    assert.equal(entries.length, 1);
    assert.equal(index.find('runtime-policy-package-1').length, 1);
    assert.equal(index.rebuild([registered]).length, 1);
  });
});

describe('createRuntimeRegistryApi', () => {
  it('exposes register / find / list / publish / validate', () => {
    const api = createRuntimeRegistryApi();
    const created = api.registerRuntimePackage(null, samplePackage(), {
      sessionId: 'runtime-session-1',
      title: 'API Registry',
    });
    assert.equal(api.listRuntimePackages(created.id).length, 1);
    const validated = api.validateRuntimeRegistry(created.id);
    assert.equal(validated.valid, true);
    const published = api.publishRuntimeRegistry(created.id);
    assert.equal(published.metadata.status, 'Published');
    assert.equal(
      api.findRuntimePackage(created.id, 'runtime-policy-package-1')?.version,
      '1.0.0',
    );
  });
});
