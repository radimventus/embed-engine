import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { REFERENCE_HOUSE_PACKAGE } from '@embed-engine/object-house';
import { createDecisionSessionRuntime } from '@embed-engine/runtime';
import type { SessionExperience } from '@embed-engine/runtime';

import {
  getGalleryMediaProjection,
  getHeroMediaProjection,
  projectSynchronizedExperience,
} from './synchronizedExperience';

describe('Contextual Media Projection (CAP-HP-003.4)', () => {
  it('SelectRoom updates Hero media through projected activeRoom', () => {
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

    assert.equal(synced.activeRoom?.id, 'room-kitchen');
    assert.equal(hero.title, 'Kuchyně');
    assert.match(hero.eyebrow, /Kuchyně/);
    assert.ok(synced.activeRoom?.heroMedia !== null);
    assert.equal(hero.primaryMediaUrl, synced.activeRoom?.heroMedia?.url);
    assert.equal(hero.heroMedia?.id, synced.activeRoom?.heroMedia?.id);
  });

  it('SelectRoom updates Gallery through the same projected model', () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 10,
    });

    runtime.dispatch({ type: 'SelectRoom', roomId: 'room-bedroom' }, 11);
    const bedroom = projectSynchronizedExperience(runtime.getExperience()!);
    assert.equal(getGalleryMediaProjection(bedroom).roomId, 'room-bedroom');
    assert.ok(bedroom.activeRoom!.gallery.length > 0);

    runtime.dispatch({ type: 'SelectRoom', roomId: 'room-living' }, 12);
    const living = projectSynchronizedExperience(runtime.getExperience()!);
    const gallery = getGalleryMediaProjection(living);
    const hero = getHeroMediaProjection(living);

    assert.equal(gallery.roomId, 'room-living');
    assert.equal(living.activeRoom?.name, hero.title);
    assert.deepEqual(
      gallery.gallery.map((asset) => asset.url),
      living.activeRoom?.gallery.map((asset) => asset.url),
    );
    assert.deepEqual(gallery.thumbnails, living.activeRoom?.thumbnails);
    assert.equal(hero.primaryMediaUrl, gallery.heroUrl);
  });

  it('room without gallery uses projected fallback for hero and thumbnails', () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: 'SelectRoom', roomId: 'room-living' }, 2);
    const base = runtime.getExperience()!;

    const withoutCatalog: SessionExperience = {
      ...base,
      activeRoomId: 'room-unmapped',
      activeRoom: {
        id: 'room-unmapped',
        name: 'Neznámá místnost',
        area: 10,
        floor: 0,
      },
    };

    const synced = projectSynchronizedExperience(withoutCatalog);
    assert.equal(synced.activeRoom?.gallery.length, 0);
    assert.equal(synced.activeRoom?.videos.length, 0);
    assert.ok(synced.activeRoom?.heroMedia !== null);
    assert.equal(synced.activeRoom?.heroMedia?.id, 'media-exterior');
    assert.equal(synced.activeRoom?.thumbnails.length, 1);
    assert.equal(
      synced.activeRoom?.thumbnails[0]?.src,
      synced.activeRoom?.heroMedia?.url,
    );
  });

  it('identical Runtime state produces identical media projection', () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: 'SelectRoom', roomId: 'room-bath' }, 2);
    const experience = runtime.getExperience()!;

    const first = projectSynchronizedExperience(experience);
    const second = projectSynchronizedExperience(experience);

    assert.deepEqual(first.activeRoom?.heroMedia, second.activeRoom?.heroMedia);
    assert.deepEqual(first.activeRoom?.gallery, second.activeRoom?.gallery);
    assert.deepEqual(first.activeRoom?.videos, second.activeRoom?.videos);
    assert.deepEqual(first.activeRoom?.documents, second.activeRoom?.documents);
    assert.deepEqual(first.activeRoom?.thumbnails, second.activeRoom?.thumbnails);

    const again = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    again.dispatch({ type: 'SelectRoom', roomId: 'room-bath' }, 2);
    const twin = projectSynchronizedExperience(again.getExperience()!);

    assert.deepEqual(twin.activeRoom?.heroMedia, first.activeRoom?.heroMedia);
    assert.deepEqual(twin.activeRoom?.gallery, first.activeRoom?.gallery);
    assert.deepEqual(twin.activeRoom?.thumbnails, first.activeRoom?.thumbnails);
  });

  it('projection owns media — consumers read activeRoom fields only', () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: 'SelectRoom', roomId: 'room-kitchen' }, 2);
    const synced = projectSynchronizedExperience(runtime.getExperience()!);
    const room = synced.activeRoom!;

    assert.ok(room.heroMedia !== null);
    assert.ok(Array.isArray(room.gallery));
    assert.ok(Array.isArray(room.videos));
    assert.ok(Array.isArray(room.documents));
    assert.ok(Array.isArray(room.thumbnails));
    assert.equal(
      getGalleryMediaProjection(synced).mediaItems.length,
      room.thumbnails.length,
    );
  });
});
