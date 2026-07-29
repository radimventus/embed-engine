import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { LoadClientPublicationInput } from '../../model';
import {
  buildInitialClientPublicationPackage,
  createBasicClientPublicationStrategy,
  createClientPublicationValidator,
} from './basic-client-publication-strategy';
import { createClientPublicationAdapter } from './client-publication-adapter';
import { createClientPublicationApi } from './client-publication-api';
import { createClientPublicationIndex } from './client-publication-index';

function samplePublication(
  overrides: Partial<LoadClientPublicationInput> = {},
): LoadClientPublicationInput {
  return {
    publicationId: 'platform-publication-1',
    objectId: 'object-house-1',
    version: '1.0.0',
    title: 'Demo House',
    sourceCatalogPackageId: 'platform-publication-package-1',
    sourcePlatformEntryId: 'platform-publication-entry-1',
    assets: [
      {
        id: 'asset-1',
        kind: 'hero',
        ref: 'client://object-house-1/hero',
        label: 'Hero asset',
      },
    ],
    ...overrides,
  };
}

describe('BasicClientPublicationStrategy', () => {
  it('transforms and publishes client publication model', () => {
    const strategy = createBasicClientPublicationStrategy();
    const model = strategy.transform(samplePublication(), (prefix) => `${prefix}-1`);
    assert.equal(model.metadata.status, 'Transformed');
    assert.equal(strategy.publish(model).metadata.status, 'Published');
  });
});

describe('ClientPublicationValidator', () => {
  it('flags missing publication id', () => {
    const validator = createClientPublicationValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const pkg = buildInitialClientPublicationPackage(
      { sessionId: 's1' },
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    const result = validator.validate({
      ...pkg,
      publicationModel: {
        ...pkg.publicationModel,
        publicationId: '',
      },
    });
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((item) => item.code === 'publication-missing-id'));
  });
});

describe('createClientPublicationAdapter', () => {
  it('loads, transforms, validates and publishes', () => {
    const adapter = createClientPublicationAdapter({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = adapter.initialize({
      sessionId: 'client-publication-session-1',
      title: 'Client Publication',
      publication: samplePublication(),
    });
    assert.equal(pkg.publicationModel.metadata.status, 'Loaded');
    assert.ok(
      adapter.getEvents().some((event) => event.type === 'ClientPublicationLoaded'),
    );

    const transformed = adapter.transform(pkg.id);
    assert.equal(transformed.publicationModel.metadata.status, 'Transformed');
    assert.ok(
      adapter
        .getEvents()
        .some((event) => event.type === 'ClientPublicationTransformed'),
    );

    const validation = adapter.validate(pkg.id);
    assert.equal(validation.valid, true);

    const published = adapter.publish(pkg.id);
    assert.equal(published.publicationModel.metadata.status, 'Published');
    assert.equal(adapter.listClientPublications().length, 1);
    assert.equal(
      adapter.findClientPublication('object-house-1')?.objectId,
      'object-house-1',
    );
  });
});

describe('ClientPublicationIndex', () => {
  it('indexes publication models', () => {
    const index = createClientPublicationIndex();
    const adapter = createClientPublicationAdapter();
    const pkg = adapter.initialize({
      sessionId: 's1',
      publication: samplePublication(),
    });
    const entries = index.index(pkg.id, pkg);
    assert.equal(entries.length, 1);
    assert.equal(index.find('object-house-1').length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createClientPublicationApi', () => {
  it('exposes load, publish, list, find, validate', () => {
    const api = createClientPublicationApi();
    const created = api.loadClientPublication(null, samplePublication(), {
      sessionId: 'client-publication-session-1',
      title: 'API Client Publication',
    });
    const transformed = api.transformClientPublication(created.id);
    assert.equal(transformed.publicationModel.metadata.status, 'Transformed');
    const validated = api.validateClientPublication(created.id);
    assert.equal(validated.valid, true);
    const published = api.publishClientPublication(created.id);
    assert.equal(published.publicationModel.metadata.status, 'Published');
    assert.equal(api.listClientPublications().length, 1);
    assert.equal(
      api.findClientPublication('object-house-1')?.version,
      '1.0.0',
    );
  });
});
