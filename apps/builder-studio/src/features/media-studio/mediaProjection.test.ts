import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { MEDIA_AREA_CATALOG } from './mediaCatalog';
import { buildMediaStudioModel, reorderGalleryCsv } from './mediaProjection';

describe('mediaProjection (EPIC-BX-05)', () => {
  it('builds Media Dashboard areas without a parallel media store', () => {
    const model = buildMediaStudioModel({
      projectId: 'villa-168',
      snapshot: null,
    });
    assert.equal(model.areas.length, MEDIA_AREA_CATALOG.length);
    assert.ok(model.areas.some((item) => item.id === 'gallery'));
    assert.ok(model.areas.some((item) => item.id === 'hero'));
    assert.ok(model.documents.length >= 0);
  });

  it('reorders gallery.csv rows and renumbers order', () => {
    const csv = 'order,room,file\n1,exterior,01.webp\n2,kitchen,11.webp\n';
    const next = reorderGalleryCsv(csv, 0, 1);
    assert.match(next, /1,kitchen,11\.webp/);
    assert.match(next, /2,exterior,01\.webp/);
  });

  it('exposes Runtime usage on gallery area', () => {
    const model = buildMediaStudioModel({
      projectId: 'villa-168',
      snapshot: null,
    });
    const gallery = model.areas.find((item) => item.id === 'gallery');
    assert.ok(gallery?.usages.includes('Gallery'));
    assert.ok(gallery?.usages.includes('House Navigator'));
  });
});
