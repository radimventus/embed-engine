import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { REFERENCE_HOUSE_PACKAGE } from '@embed-engine/object-house';
import { createDecisionSessionRuntime } from '@embed-engine/runtime';

import {
  getGalleryMediaProjection,
  getHeroMediaProjection,
  projectSynchronizedExperience,
} from './synchronizedExperience';

describe('Synchronized Media Experience', () => {
  it('room selection updates Hero, Gallery and Media Explorer from one projection', () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });

    const kitchen = runtime.dispatch(
      { type: 'SelectRoom', roomId: 'room-kitchen' },
      2,
    );
    assert.ok(kitchen.ok);
    if (!kitchen.ok) {
      return;
    }

    const synced = projectSynchronizedExperience(kitchen.experience);
    const hero = getHeroMediaProjection(synced);
    const gallery = getGalleryMediaProjection(synced);

    assert.equal(synced.roomMedia?.roomId, 'room-kitchen');
    assert.equal(hero.title, 'Kuchyně');
    assert.match(hero.eyebrow, /Kuchyně/);
    assert.ok(hero.metrics.length > 0);
    assert.equal(gallery.roomId, 'room-kitchen');
    assert.equal(gallery.title, 'Kuchyně');
    assert.ok(gallery.mediaItems.length > 0);
    assert.equal(hero.primaryMediaUrl, gallery.heroUrl);
  });

  it('modules stay synchronized when Runtime changes externally', () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 10,
    });

    runtime.dispatch({ type: 'SelectRoom', roomId: 'room-bedroom' }, 11);
    const bedroom = projectSynchronizedExperience(runtime.getExperience()!);
    assert.equal(getHeroMediaProjection(bedroom).title, 'Ložnice');
    assert.equal(getGalleryMediaProjection(bedroom).roomId, 'room-bedroom');

    // Simulate SVG / AI / Story selecting another room — no module-to-module calls.
    runtime.dispatch({ type: 'SelectRoom', roomId: 'room-living' }, 12);
    const living = projectSynchronizedExperience(runtime.getExperience()!);
    const hero = getHeroMediaProjection(living);
    const gallery = getGalleryMediaProjection(living);

    assert.equal(hero.title, 'Obývací pokoj');
    assert.equal(gallery.roomId, 'room-living');
    assert.equal(living.roomMedia?.title, hero.title);
    assert.deepEqual(
      gallery.mediaItems.map((item) => item.src),
      living.roomMedia?.mediaItems.map((item) => item.src),
    );
  });

  it('does not duplicate room filtering in consumers — projection owns selection', () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: 'SelectRoom', roomId: 'room-bath' }, 2);
    const synced = projectSynchronizedExperience(runtime.getExperience()!);

    assert.equal(synced.activeRoomId, 'room-bath');
    assert.equal(synced.roomMedia?.roomId, synced.activeRoomId);
    assert.equal(
      getGalleryMediaProjection(synced).mediaItems.length,
      synced.roomMedia?.mediaItems.length,
    );
  });
});
