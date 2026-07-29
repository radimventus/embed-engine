import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { RegisterPublishedObjectInput } from '../../model';
import {
  createBasicPublishedObjectStrategy,
  createPublishedObjectValidator,
} from './basic-published-object-strategy';
import { createPublishedObjectApi } from './published-object-api';
import { createPublishedObjectRegistry } from './published-object-registry';
import { createPublishedObjectIndex } from './published-object-index';

function sampleObject(
  overrides: Partial<RegisterPublishedObjectInput> = {},
): RegisterPublishedObjectInput {
  return {
    objectId: 'object-house-1',
    version: '1.0.0',
    publicationVersion: '1.0.0',
    title: 'Demo House',
    manifest: {
      id: 'publication-manifest-1',
      objectVersion: '1.0.0',
      runtimeVersion: '1.0.0',
      contractVersion: '1.0.0',
      compatibilityVersion: '1.0.0',
      generatedAt: '2026-08-19T00:00:00.000Z',
    },
    sourcePublicationPackageId: 'publication-package-1',
    sourceObjectPackageId: 'publication-object-package-1',
    checksum: 'chk-demo',
    ...overrides,
  };
}

describe('BasicPublishedObjectStrategy', () => {
  it('registers and archives Published Object', () => {
    const strategy = createBasicPublishedObjectStrategy();
    const object = strategy.register(
      sampleObject(),
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(object.status, 'Registered');
    assert.equal(strategy.archive(object).status, 'Archived');
  });
});

describe('PublishedObjectValidator', () => {
  it('flags missing objectId', () => {
    const validator = createPublishedObjectValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      catalog: {
        id: 'c1',
        objects: [
          {
            id: 'po1',
            objectId: '',
            version: '1.0.0',
            publicationVersion: '1.0.0',
            status: 'Registered',
            manifest: {
              id: 'm1',
              objectVersion: '1.0.0',
              runtimeVersion: '1.0.0',
              contractVersion: '1.0.0',
              compatibilityVersion: '1.0.0',
              generatedAt: '2026-08-19T00:00:00.000Z',
            },
            createdAt: '2026-08-19T00:00:00.000Z',
            metadata: {
              title: 't',
              notes: 'n',
              sourcePublicationPackageId: null,
              sourceObjectPackageId: null,
              checksum: null,
            },
          },
        ],
        generatedAt: '2026-08-19T00:00:00.000Z',
        metadata: {
          title: 't',
          notes: 'n',
          sessionId: 's1',
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
    assert.ok(result.issues.some((item) => item.code === 'object-missing-id'));
  });
});

describe('createPublishedObjectRegistry', () => {
  it('registers, archives, validates and indexes', () => {
    const registry = createPublishedObjectRegistry({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = registry.initialize({
      sessionId: 'published-session-1',
      title: 'Demo Catalog',
      objects: [sampleObject()],
    });
    assert.equal(pkg.catalog.objects.length, 1);
    assert.ok(
      registry
        .getEvents()
        .some((event) => event.type === 'PublishedObjectRegistered'),
    );
    assert.ok(
      registry
        .getEvents()
        .some((event) => event.type === 'PublishedObjectIndexed'),
    );

    const publishedObjectId = pkg.catalog.objects[0]!.id;
    const archived = registry.archive(pkg.id, publishedObjectId);
    assert.equal(archived.catalog.objects[0]?.status, 'Archived');
    assert.ok(
      registry
        .getEvents()
        .some((event) => event.type === 'PublishedObjectArchived'),
    );

    const validation = registry.validate(pkg.id);
    assert.equal(validation.valid, true);
    assert.ok(
      registry
        .getEvents()
        .some((event) => event.type === 'PublishedObjectValidated'),
    );
    assert.equal(registry.find(pkg.id, 'object-house-1').length, 1);
    assert.equal(registry.list(pkg.id).length, 1);
  });
});

describe('PublishedObjectIndex', () => {
  it('indexes published objects', () => {
    const index = createPublishedObjectIndex();
    const registry = createPublishedObjectRegistry();
    const pkg = registry.initialize({
      sessionId: 's1',
      objects: [sampleObject()],
    });
    const entries = index.index(pkg.id, pkg);
    assert.equal(entries.length, 1);
    assert.equal(index.find('object-house-1').length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createPublishedObjectApi', () => {
  it('exposes register / archive / list / find / validate', () => {
    const api = createPublishedObjectApi();
    const created = api.registerPublishedObject(null, sampleObject(), {
      sessionId: 'published-session-1',
      title: 'API Catalog',
    });
    assert.equal(api.listPublishedObjects(created.id).length, 1);
    assert.equal(
      api.findPublishedObject(created.id, 'object-house-1').length,
      1,
    );
    const publishedObjectId = created.catalog.objects[0]!.id;
    const archived = api.archivePublishedObject(created.id, publishedObjectId);
    assert.equal(archived.catalog.objects[0]?.status, 'Archived');
    const validated = api.validatePublishedObject(created.id);
    assert.equal(validated.valid, true);
  });
});
