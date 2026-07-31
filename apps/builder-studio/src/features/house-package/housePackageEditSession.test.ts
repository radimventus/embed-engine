import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createHousePackageEditSession } from './housePackageEditSession';
import type { HousePackageMount } from './mountHousePackage';
import { updateCsvCell } from './housePackageCsv';

function mountFixture(): HousePackageMount {
  const roomsCsv = `floor,room,name,area
p1,exterior,Exteriér,0
p1,kitchen,Kuchyně,14
`;
  const galleryCsv = `order,room,file
1,exterior,01.webp
2,kitchen,11.webp
`;
  const videosCsv = `order,room,provider,mediaId
1,exterior,wistia,abc
`;
  return {
    packageRootLabel: '/house-package',
    canonicalDiskRoot: 'apps/client-studio/public/house-package',
    ok: true,
    errors: [],
    texts: {
      roomsCsv,
      galleryCsv,
      videosCsv,
      manifestJson: '{"version":"1"}',
    },
    heroRelativePath: 'media/hero/hero.png',
    builderImport: null,
    geometryByFloor: {},
    mountedAt: '2026-07-31T12:00:00.000Z',
  };
}

describe('housePackageEditSession (CAP-BLD-03)', () => {
  it('tracks dirty state, undo, and discard/reset over HP CSV texts', () => {
    const session = createHousePackageEditSession(mountFixture());
    let snap = session.snapshot();
    assert.equal(snap.dirtyState, 'clean');
    assert.equal(snap.canUndo, false);
    assert.equal(snap.validation.ok, true);

    const nextRooms = updateCsvCell(snap.working.roomsCsv, 1, 'name', 'Kuchyně XL');
    snap = session.setRoomsCsv(nextRooms);
    assert.equal(snap.dirtyState, 'modified');
    assert.ok(snap.dirty.includes('rooms'));
    assert.equal(snap.canUndo, true);
    assert.equal(snap.validation.ok, true);

    snap = session.undo();
    assert.equal(snap.dirtyState, 'clean');
    assert.match(snap.working.roomsCsv, /Kuchyně/);

    snap = session.setRoomsCsv(nextRooms);
    snap = session.discard();
    assert.equal(snap.dirtyState, 'clean');
    assert.equal(snap.canUndo, false);
    assert.match(snap.working.roomsCsv, /Kuchyně,/);
  });

  it('marks invalid when gallery references unknown room', () => {
    const session = createHousePackageEditSession(mountFixture());
    let snap = session.snapshot();
    const broken = updateCsvCell(
      snap.working.galleryCsv,
      0,
      'room',
      'no-such-room',
    );
    snap = session.setGalleryCsv(broken);
    assert.equal(snap.dirtyState, 'modified');
    assert.equal(snap.validation.ok, false);
    assert.ok(snap.sectionErrors.length > 0);
  });
});
