import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createAssetService } from './asset-service';
import { createMockActiveProjects, MOCK_PROJECTS } from './mock-data';

describe('createAssetService', () => {
  it('loads mock active project content', () => {
    const assets = createAssetService();
    const harmony = assets.getActiveProject('harmony-124');
    assert.ok(harmony !== null);
    assert.equal(harmony.assets.media[0]?.files.length, 6);
    assert.equal(harmony.assets.media[0]?.state, 'Ready');
    assert.equal(harmony.assets.layout[3]?.state, 'Empty');
  });

  it('adds and removes assets in memory', () => {
    const assets = createAssetService();
    const created = assets.addAsset('family-98', 'photographs', {
      name: 'new-photo.jpg',
      sizeBytes: 500_000,
      mimeType: 'image/jpeg',
    });
    assert.equal(created.name, 'new-photo.jpg');

    const afterAdd = assets.getActiveProject('family-98');
    assert.equal(afterAdd?.assets.media[0]?.files.length, 3);

    assets.removeAsset('family-98', 'photographs', created.assetId);
    const afterRemove = assets.getActiveProject('family-98');
    assert.equal(afterRemove?.assets.media[0]?.files.length, 2);
  });

  it('updates asset metadata', () => {
    const assets = createAssetService();
    const updated = assets.updateMetadata(
      'harmony-124',
      'photographs',
      'h124-photo-1',
      { label: 'Nový popisek', altText: 'Alt text' },
    );
    assert.equal(updated.metadata.label, 'Nový popisek');
    assert.equal(updated.metadata.altText, 'Alt text');
  });

  it('ensures empty content for new projects', () => {
    const assets = createAssetService(createMockActiveProjects(MOCK_PROJECTS));
    const record = {
      ...MOCK_PROJECTS[0]!,
      projectId: 'nordic-80',
      name: 'Nordic 80',
    };
    const created = assets.ensureProject(record);
    assert.equal(created.assets.media.every((item) => item.state === 'Empty'), true);
    assert.equal(created.assets.knowledge.length, 3);
  });
});
