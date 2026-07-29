import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAssetManagerApi } from './asset-manager-api';
import { createAssetManagerService } from './asset-manager-service';

describe('AssetManagerService', () => {
  it('creates assets with unique ids and provider-independent locations', () => {
    const api = createAssetManagerApi();
    const first = api.createAsset(null, {
      projectId: 'harmony-124',
      name: 'Facade.jpg',
      type: 'IMAGE',
      location: {
        provider: 'LOCAL',
        uri: 'file:///assets/harmony-124/facade.jpg',
        key: 'facade.jpg',
      },
      size: 120_000,
    });
    const second = api.createAsset(api.listPackages()[0]!.id, {
      projectId: 'harmony-124',
      name: 'Walkthrough.mp4',
      type: 'VIDEO',
      location: {
        provider: 'S3',
        uri: 's3://conis-media/harmony-124/walkthrough.mp4',
        bucket: 'conis-media',
        key: 'harmony-124/walkthrough.mp4',
        region: 'eu-central-1',
      },
      size: 4_000_000,
    });

    assert.notEqual(first.id, second.id);
    assert.equal(first.location.provider, 'LOCAL');
    assert.equal(second.location.provider, 'S3');
    assert.equal(second.location.bucket, 'conis-media');
    assert.equal(api.listProjectAssets('harmony-124').length, 2);
    assert.equal(api.findAsset(first.id)?.name, 'Facade.jpg');
  });

  it('rejects assets for a different project than the package', () => {
    const api = createAssetManagerApi();
    api.createAsset(null, {
      projectId: 'harmony-124',
      name: 'Plan.svg',
      type: 'FLOORPLAN',
      location: {
        provider: 'CLOUDINARY',
        uri: 'cloudinary://demo/plan',
        key: 'plan',
        publicId: 'plan',
      },
    });
    const packageId = api.listPackages()[0]!.id;
    assert.throws(() => {
      api.createAsset(packageId, {
        projectId: 'other-project',
        name: 'Other.jpg',
        type: 'IMAGE',
        location: {
          provider: 'URL',
          uri: 'https://cdn.example.com/other.jpg',
        },
      });
    }, /must match package project/);
  });

  it('archives without deleting and restores back to ACTIVE', () => {
    const api = createAssetManagerApi();
    const asset = api.createAsset(null, {
      projectId: 'family-98',
      name: 'Brochure.pdf',
      type: 'DOCUMENT',
      location: {
        provider: 'LOCAL',
        uri: 'file:///assets/family-98/brochure.pdf',
        key: 'brochure.pdf',
      },
    });
    const packageId = api.listPackages()[0]!.id;
    const archived = api.archiveAsset(packageId, asset.id);
    assert.equal(archived.status, 'ARCHIVED');
    assert.equal(api.findAsset(asset.id)?.status, 'ARCHIVED');

    const restored = api.restoreAsset(packageId, asset.id);
    assert.equal(restored.status, 'ACTIVE');
    assert.ok(api.listEvents().some((event) => event.type === 'AssetRestored'));
  });

  it('updates metadata and emits dedicated metadata event', () => {
    const api = createAssetManagerApi();
    const asset = api.createAsset(null, {
      projectId: 'villa-168',
      name: 'Model.glb',
      type: 'MODEL_3D',
      location: {
        provider: 'OTHER',
        uri: 'asset://villa-168/model.glb',
        key: 'model.glb',
      },
    });
    const packageId = api.listPackages()[0]!.id;
    api.updateAsset(packageId, asset.id, {
      label: 'Exterior GLB',
      notes: 'Primary 3D model',
    });
    const events = api.listEvents();
    assert.ok(events.some((event) => event.type === 'AssetUpdated'));
    assert.ok(events.some((event) => event.type === 'AssetMetadataChanged'));
  });

  it('lists by type and sorts deterministically by provider', () => {
    const service = createAssetManagerService({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${String(n).padStart(4, '0')}`;
        };
      })(),
      now: () => new Date('2026-07-29T10:00:00.000Z'),
    });
    const api = createAssetManagerApi(service);
    const pkg = service.initialize({ projectId: 'harmony-124' });
    api.createAsset(pkg.id, {
      projectId: 'harmony-124',
      name: 'B-Image',
      type: 'IMAGE',
      location: { provider: 'URL', uri: 'https://cdn.example.com/b.jpg' },
    });
    api.createAsset(pkg.id, {
      projectId: 'harmony-124',
      name: 'A-Image',
      type: 'IMAGE',
      location: {
        provider: 'LOCAL',
        uri: 'file:///a.jpg',
        key: 'a.jpg',
      },
    });
    api.createAsset(pkg.id, {
      projectId: 'harmony-124',
      name: 'Docs',
      type: 'DOCUMENT',
      location: {
        provider: 'S3',
        uri: 's3://bucket/docs.pdf',
        bucket: 'bucket',
        key: 'docs.pdf',
      },
    });

    const images = api.listAssetsByType('IMAGE');
    assert.deepEqual(
      images.map((asset) => asset.name),
      ['A-Image', 'B-Image'],
    );
    const byProvider = api.listAssets({
      projectId: 'harmony-124',
      sortBy: 'provider',
    });
    assert.deepEqual(
      byProvider.map((asset) => asset.location.provider),
      ['LOCAL', 'S3', 'URL'],
    );
    assert.equal(api.listIndex().length, 3);
  });

  it('validates package integrity including location rules', () => {
    const api = createAssetManagerApi();
    const asset = api.createAsset(null, {
      projectId: 'harmony-124',
      name: 'Link',
      type: 'URL',
      location: {
        provider: 'URL',
        uri: 'https://example.com/tour',
      },
    });
    const packageId = api.listPackages()[0]!.id;
    const validation = api.validateAssets(packageId);
    assert.equal(validation.valid, true);
    assert.ok(api.findAsset(asset.id));
  });
});
