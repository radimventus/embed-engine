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

describe('Experience Context (CAP-HP-003.5)', () => {
  it('identical Runtime → identical synchronized context', () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: 'SelectRoom', roomId: 'room-bath' }, 2);
    const experience = runtime.getExperience()!;

    const first = projectSynchronizedExperience(experience);
    const second = projectSynchronizedExperience(experience);

    assert.deepEqual(first.context, second.context);
    assert.deepEqual(first.context.hero, second.context.hero);
    assert.deepEqual(first.context.roomMedia, second.context.roomMedia);
    assert.deepEqual(first.context.navigation, second.context.navigation);
    assert.deepEqual(first.context.decision, second.context.decision);
  });

  it('room change updates unified context for Hero and Gallery', () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 10,
    });

    runtime.dispatch({ type: 'SelectRoom', roomId: 'room-bedroom' }, 11);
    const bedroom = projectSynchronizedExperience(runtime.getExperience()!);
    assert.equal(bedroom.context.activeRoom.id, 'room-bedroom');
    assert.equal(bedroom.context.hero.title, 'Ložnice');
    assert.equal(bedroom.context.roomMedia.roomId, 'room-bedroom');

    runtime.dispatch({ type: 'SelectRoom', roomId: 'room-living' }, 12);
    const living = projectSynchronizedExperience(runtime.getExperience()!);
    assert.equal(living.context.hero.title, 'Obývací pokoj');
    assert.equal(living.context.roomMedia.roomId, 'room-living');
    assert.equal(living.context.navigation.currentFloor, '0');
    assert.equal(
      living.context.hero.primaryMediaUrl,
      living.context.roomMedia.heroUrl,
    );
  });

  it('fallback hero context remains deterministic without catalog media', () => {
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

    const first = projectSynchronizedExperience(withoutCatalog);
    const second = projectSynchronizedExperience(withoutCatalog);

    assert.deepEqual(first.context.hero, second.context.hero);
    assert.deepEqual(first.context.roomMedia, second.context.roomMedia);
    assert.equal(first.context.roomMedia.gallery.length, 0);
    assert.equal(first.context.hero.heroMedia?.id, 'media-exterior');
  });

  it('ChangePriority reshapes Experience Context hero and gallery ordering', () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: 'SelectRoom', roomId: 'room-living' }, 2);
    const before = projectSynchronizedExperience(runtime.getExperience()!);

    assert.equal(before.context.hero.primaryReason, 'primary-living-volume');
    assert.equal(before.context.roomMedia.thumbnails[0]?.kind, 'video');

    runtime.dispatch(
      { type: 'ChangePriority', priorityIds: ['plot', 'layout'] },
      3,
    );
    const after = projectSynchronizedExperience(runtime.getExperience()!);

    assert.equal(after.context.decision.focus.focusSignalKind, 'emphasize-outdoor');
    assert.equal(after.context.decision.focus.recommendedAction, 'inspect-outdoor-connection');
    assert.equal(after.context.hero.primaryReason, 'outdoor-led-exploration');
    assert.match(after.context.hero.eyebrow, /Orientace na zahradu/);
    assert.match(after.context.hero.description, /Prověřte propojení se zahradou/);
    assert.ok(after.context.hero.highlights.includes('outdoor-connection'));
    assert.equal(after.context.decision.focus.recommendedMediaRole, 'gallery');
    assert.equal(after.context.roomMedia.thumbnails[0]?.kind, 'photo');
    assert.notEqual(before.context.hero.eyebrow, after.context.hero.eyebrow);
    assert.equal(
      after.context.hero.focusConfidence,
      after.context.decision.focus.confidence,
    );
  });

  it('adapters read the same contract as experience.context', () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: 'SelectRoom', roomId: 'room-kitchen' }, 2);
    const synced = projectSynchronizedExperience(runtime.getExperience()!);

    assert.deepEqual(getHeroMediaProjection(synced), synced.context.hero);
    assert.equal(
      getGalleryMediaProjection(synced).roomId,
      synced.context.roomMedia.roomId,
    );
    assert.deepEqual(
      getGalleryMediaProjection(synced).thumbnails,
      synced.context.roomMedia.thumbnails,
    );
  });
});

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
    const hero = synced.context.hero;

    assert.equal(synced.activeRoom?.id, 'room-kitchen');
    assert.equal(hero.title, 'Kuchyně');
    assert.match(hero.eyebrow, /Kuchyně/);
    assert.ok(synced.activeRoom?.heroMedia !== null);
    assert.equal(hero.primaryMediaUrl, synced.activeRoom?.heroMedia?.url);
  });

  it('projection owns media — consumers read context.roomMedia', () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: 'SelectRoom', roomId: 'room-kitchen' }, 2);
    const synced = projectSynchronizedExperience(runtime.getExperience()!);
    const media = synced.context.roomMedia;

    assert.ok(media.heroMedia !== null);
    assert.ok(Array.isArray(media.gallery));
    assert.ok(Array.isArray(media.videos));
    assert.ok(Array.isArray(media.documents));
    assert.ok(Array.isArray(media.thumbnails));
  });

  it('floorPlan is projected on Experience Context (ED-DA-02)', () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: 'SelectRoom', roomId: 'room-living' }, 2);
    const first = projectSynchronizedExperience(runtime.getExperience()!);
    const second = projectSynchronizedExperience(runtime.getExperience()!);

    assert.deepEqual(first.context.floorPlan, second.context.floorPlan);
    assert.ok(first.context.floorPlan.src.length > 0);
    assert.ok(first.context.floorPlan.viewBox > 0);
    assert.equal(
      first.context.floorPlan.rooms.length,
      REFERENCE_HOUSE_PACKAGE.rooms.length,
    );
    const living = first.context.floorPlan.rooms.find(
      (room) => room.id === 'room-living',
    );
    assert.ok(living !== undefined);
    assert.equal(living?.title, 'Obývací pokoj');
    assert.ok(living?.floorPlanRegion !== null);
  });
});
