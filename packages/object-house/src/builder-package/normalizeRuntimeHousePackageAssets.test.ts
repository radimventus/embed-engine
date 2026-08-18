import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { normalizeRuntimeHousePackageAssets } from './normalizeRuntimeHousePackageAssets';
import type { HousePackage } from '../HousePackage';

const house: HousePackage = {
  identity: { id: 'same-house', title: 'Same house', reference: 'same-house' },
  overview: { price: 1, usableArea: 1, landArea: 1, rooms: 1, hasGarden: false },
  location: { city: 'Test', district: 'Test' },
  metadata: { energyClass: 'A', construction: 'Test' },
  rooms: [{ id: 'living', name: 'Living', floor: 0, area: 1 }],
  media: [
    { id: 'hero', type: 'image', title: 'Hero', url: '/package/media/hero.png' },
    { id: 'gallery:living:2', type: 'image', title: 'living', url: 'blob:photo-2' },
    { id: 'gallery:living:1', type: 'image', title: 'living', url: 'blob:photo-1' },
    { id: 'floorplan:p1', type: 'floorplan', title: 'p1', url: '/package/media/plans/p1.png' },
  ],
};

describe('normalizeRuntimeHousePackageAssets', () => {
  it('keeps durable and static sources opaque while joining raster and zones by floor', () => {
    const normalized = normalizeRuntimeHousePackageAssets(house, {
      p1: {
        schema: 'hp-003-floorplan-geometry',
        schemaVersion: '1.0',
        floorId: 'p1',
        viewBox: { width: 100, height: 100 },
        units: 'px',
        rooms: [
          {
            roomId: 'living',
            interactive: true,
            bbox: { x: 0, y: 0, width: 100, height: 100 },
          },
        ],
      },
    });

    assert.equal(normalized.houseId, 'same-house');
    assert.equal(normalized.hero?.src, '/package/media/hero.png');
    assert.deepEqual(
      normalized.gallery.map((item) => item.src),
      ['blob:photo-1', 'blob:photo-2'],
    );
    assert.equal(normalized.floors[0]?.rasterSrc, '/package/media/plans/p1.png');
    assert.equal(normalized.floors[0]?.geometry.rooms[0]?.roomId, 'living');
  });
});
