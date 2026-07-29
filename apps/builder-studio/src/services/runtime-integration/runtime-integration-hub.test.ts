import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { RegisterRuntimePackageInput } from '../../model';
import {
  createBasicRuntimeIntegrationStrategy,
  createRuntimeIntegrationValidator,
} from './basic-runtime-integration-strategy';
import { createRuntimeIntegrationApi } from './runtime-integration-api';
import { createRuntimeIntegrationHub } from './runtime-integration-hub';
import { createRuntimeIntegrationIndex } from './runtime-integration-index';

function samplePackage(
  overrides: Partial<RegisterRuntimePackageInput> = {},
): RegisterRuntimePackageInput {
  return {
    packageId: 'runtime-policy-package-1',
    packageType: 'Policy',
    version: '1.0.0',
    source: 'Runtime Policy Engine',
    publishedAt: '2026-08-19T00:00:00.000Z',
    title: 'Demo Policy Package',
    status: 'Published',
    ...overrides,
  };
}

describe('BasicRuntimeIntegrationStrategy', () => {
  it('registers published package refs without creating Runtime', () => {
    const strategy = createBasicRuntimeIntegrationStrategy();
    const record = strategy.register(
      samplePackage(),
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(record.packageType, 'Policy');
    assert.equal(record.packageId, 'runtime-policy-package-1');
    assert.equal(record.source, 'Runtime Policy Engine');
  });
});

describe('RuntimeIntegrationValidator', () => {
  it('flags missing catalog session', () => {
    const validator = createRuntimeIntegrationValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      catalog: {
        id: 'c1',
        records: [],
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

describe('createRuntimeIntegrationHub', () => {
  it('registers, resolves, validates and publishes', () => {
    const hub = createRuntimeIntegrationHub({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = hub.initialize({
      sessionId: 'runtime-session-1',
      title: 'Demo Integration',
    });
    assert.equal(pkg.catalog.records.length, 0);

    const registered = hub.register(pkg.id, samplePackage());
    assert.equal(registered.catalog.records.length, 1);
    assert.ok(
      hub
        .getEvents()
        .some((event) => event.type === 'RuntimePackageRegistered'),
    );
    assert.ok(
      hub.getEvents().some((event) => event.type === 'RuntimeCatalogUpdated'),
    );

    const resolved = hub.resolve(pkg.id, 'runtime-policy-package-1');
    assert.equal(resolved?.packageType, 'Policy');

    const validation = hub.validate(pkg.id);
    assert.equal(validation.valid, true);

    const published = hub.publish(pkg.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      hub
        .getEvents()
        .some((event) => event.type === 'RuntimeIntegrationPublished'),
    );
  });
});

describe('RuntimeIntegrationIndex', () => {
  it('indexes registered packages', () => {
    const index = createRuntimeIntegrationIndex();
    const hub = createRuntimeIntegrationHub();
    const pkg = hub.initialize({ sessionId: 's1' });
    const registered = hub.register(pkg.id, samplePackage());
    const entries = index.index(registered.id, registered);
    assert.equal(entries.length, 1);
    assert.equal(index.find('runtime-policy-package-1').length, 1);
    assert.equal(index.rebuild([registered]).length, 1);
  });
});

describe('createRuntimeIntegrationApi', () => {
  it('exposes register / resolve / publish / list / validate', () => {
    const api = createRuntimeIntegrationApi();
    const created = api.registerRuntimePackage(null, samplePackage(), {
      sessionId: 'runtime-session-1',
      title: 'API Integration',
    });
    assert.equal(api.listRuntimePackages(created.id).length, 1);
    const validated = api.validateRuntimeCatalog(created.id);
    assert.equal(validated.valid, true);
    const published = api.publishRuntimeCatalog(created.id);
    assert.equal(published.metadata.status, 'Published');
    assert.equal(
      api.resolveRuntimePackage(created.id, 'runtime-policy-package-1')
        ?.version,
      '1.0.0',
    );
  });
});
