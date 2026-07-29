import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { RegisterPlatformPublicationInput } from '../../model';
import {
  createBasicPlatformPublicationStrategy,
  createPlatformPublicationValidator,
} from './basic-platform-publication-strategy';
import { createPlatformPublicationApi } from './platform-publication-api';
import { createPlatformPublicationCatalog } from './platform-publication-catalog';
import { createPlatformPublicationIndex } from './platform-publication-index';

function sampleEntry(
  overrides: Partial<RegisterPlatformPublicationInput> = {},
): RegisterPlatformPublicationInput {
  return {
    objectId: 'object-house-1',
    publicationVersion: '1.0.0',
    title: 'Demo House',
    category: 'residential',
    visibility: 'public',
    sourcePublishedObjectId: 'published-object-1',
    objectVersion: '1.0.0',
    runtimeVersion: '1.0.0',
    ...overrides,
  };
}

describe('BasicPlatformPublicationStrategy', () => {
  it('registers and refreshes catalog entries', () => {
    const strategy = createBasicPlatformPublicationStrategy();
    const entry = strategy.register(sampleEntry(), (prefix) => `${prefix}-1`);
    assert.equal(entry.status, 'Registered');
    assert.equal(entry.category, 'residential');
    assert.equal(strategy.refresh(entry).status, 'Active');
  });
});

describe('PlatformPublicationValidator', () => {
  it('flags missing objectId', () => {
    const validator = createPlatformPublicationValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      snapshot: {
        id: 's1',
        entries: [
          {
            id: 'e1',
            objectId: '',
            publicationVersion: '1.0.0',
            status: 'Registered',
            category: 'general',
            visibility: 'public',
            metadata: {
              title: 't',
              notes: 'n',
              sourcePublishedObjectId: null,
              objectVersion: '1.0.0',
              runtimeVersion: null,
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
    assert.ok(
      result.issues.some((item) => item.code === 'entry-missing-object-id'),
    );
  });
});

describe('createPlatformPublicationCatalog', () => {
  it('registers, refreshes, validates and indexes', () => {
    const catalog = createPlatformPublicationCatalog({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = catalog.initialize({
      sessionId: 'platform-session-1',
      title: 'Demo Catalog',
      entries: [sampleEntry()],
    });
    assert.equal(pkg.snapshot.entries.length, 1);
    assert.ok(
      catalog
        .getEvents()
        .some((event) => event.type === 'PlatformPublicationRegistered'),
    );
    assert.ok(
      catalog
        .getEvents()
        .some((event) => event.type === 'PlatformPublicationIndexed'),
    );

    const refreshed = catalog.refresh(pkg.id);
    assert.equal(refreshed.snapshot.entries[0]?.status, 'Active');
    assert.ok(
      catalog
        .getEvents()
        .some((event) => event.type === 'PlatformPublicationRefreshed'),
    );

    const validation = catalog.validate(pkg.id);
    assert.equal(validation.valid, true);
    assert.ok(
      catalog
        .getEvents()
        .some((event) => event.type === 'PlatformPublicationValidated'),
    );
    assert.equal(catalog.find(pkg.id, 'object-house-1').length, 1);
    assert.equal(catalog.list(pkg.id).length, 1);
  });
});

describe('PlatformPublicationIndex', () => {
  it('indexes catalog entries', () => {
    const index = createPlatformPublicationIndex();
    const catalog = createPlatformPublicationCatalog();
    const pkg = catalog.initialize({
      sessionId: 's1',
      entries: [sampleEntry()],
    });
    const entries = index.index(pkg.id, pkg);
    assert.equal(entries.length, 1);
    assert.equal(index.find('object-house-1').length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createPlatformPublicationApi', () => {
  it('exposes register / refresh / list / find / validate', () => {
    const api = createPlatformPublicationApi();
    const created = api.registerPlatformPublication(null, sampleEntry(), {
      sessionId: 'platform-session-1',
      title: 'API Catalog',
    });
    assert.equal(api.listPlatformPublications(created.id).length, 1);
    assert.equal(
      api.findPlatformPublication(created.id, 'object-house-1').length,
      1,
    );
    const refreshed = api.refreshPlatformPublication(created.id);
    assert.equal(refreshed.snapshot.entries[0]?.status, 'Active');
    const validated = api.validatePlatformPublication(created.id);
    assert.equal(validated.valid, true);
  });
});
