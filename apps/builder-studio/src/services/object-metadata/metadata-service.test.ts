import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createMetadataApi } from './metadata-api';
import { createMetadataService } from './metadata-service';

describe('MetadataService', () => {
  it('creates object metadata with summary and empty asset references', () => {
    const api = createMetadataApi();
    const document = api.createMetadata(null, {
      projectId: 'harmony-124',
      title: 'Harmony 124',
      summary: 'Family house overview',
      description: 'Family house',
      category: 'house',
      language: 'cs',
      tags: ['modular'],
      seo: {
        title: 'Harmony 124 | AC Modular',
        description: 'Modular family house',
        keywords: ['house', 'modular'],
        socialImageAssetId: null,
      },
    });

    assert.equal(document.projectId, 'harmony-124');
    assert.equal(document.summary, 'Family house overview');
    assert.deepEqual(document.assetReferences, []);
    assert.equal(api.findMetadataBySlug('harmony-124')?.id, document.id);
  });

  it('rejects duplicate slugs across the workspace', () => {
    const api = createMetadataApi();
    api.createMetadata(null, {
      projectId: 'harmony-124',
      title: 'Harmony 124',
      slug: 'shared-slug',
    });
    assert.throws(() => {
      api.createMetadata(null, {
        projectId: 'family-98',
        title: 'Family 98',
        slug: 'shared-slug',
      });
    }, /not unique/);
  });

  it('attaches and detaches asset references without mutating assets', () => {
    const known = new Set(['asset-0001', 'asset-0002']);
    const service = createMetadataService({
      knownAssetIds: () => known,
    });
    const api = createMetadataApi(service);
    api.createMetadata(null, {
      projectId: 'villa-168',
      title: 'Villa 168',
    });
    const packageId = api.listPackages()[0]!.id;
    api.attachAssetReference(packageId, 'asset-0001');
    api.attachAssetReference(packageId, 'asset-0002');
    let document = api.getPackage(packageId)!.objectMetadata;
    assert.deepEqual(document.assetReferences, ['asset-0001', 'asset-0002']);
    api.detachAssetReference(packageId, 'asset-0001');
    document = api.getPackage(packageId)!.objectMetadata;
    assert.deepEqual(document.assetReferences, ['asset-0002']);
    assert.ok(
      api.listEvents().some((event) => event.type === 'AssetReferenceAttached'),
    );
    assert.ok(
      api.listEvents().some((event) => event.type === 'AssetReferenceDetached'),
    );
  });

  it('publishes draft after validation and emits MetadataPublished', () => {
    const api = createMetadataApi();
    api.createMetadata(null, {
      projectId: 'family-98',
      title: 'Family 98',
      summary: 'Ready object',
    });
    const packageId = api.listPackages()[0]!.id;
    const validation = api.validateMetadata(packageId);
    assert.equal(validation.valid, true);
    const published = api.publishMetadataDraft(packageId);
    assert.equal(published.status, 'PUBLISHED');
    assert.ok(
      api.listEvents().some((event) => event.type === 'MetadataPublished'),
    );
  });

  it('adds attributes with ids and validates without mutating fields', () => {
    const api = createMetadataApi();
    const document = api.createMetadata(null, {
      projectId: 'harmony-124',
      title: 'Harmony 124',
      seo: {
        title: 'x'.repeat(80),
        description: 'ok',
      },
    });
    const packageId = api.listPackages()[0]!.id;
    api.addAttribute(packageId, {
      key: 'usable_area',
      value: '124',
      type: 'number',
      group: 'specs',
      order: 1,
    });
    const before = api.findMetadata(document.id)!;
    const validation = api.validateMetadata(packageId);
    const after = api.findMetadata(document.id)!;
    assert.equal(before.attributes[0]?.id.startsWith('attr-'), true);
    assert.equal(before.title, after.title);
    assert.equal(before.seo.title, after.seo.title);
    assert.equal(validation.valid, true);
    assert.ok(validation.issues.some((issue) => issue.code === 'seo'));
  });
});
