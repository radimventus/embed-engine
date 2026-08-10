import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import type { SessionExperience } from '@embed-engine/runtime';

import {
  createTestBuilderRuntime,
  getTestBuilderHousePackage,
  installBuilderPackageRegistriesForTests,
} from './builderPackageTestInstall';
import {
  firstPhotoTimelineIndexForRoom,
  listGlobalGalleryPhotos,
  listTourVideos,
} from './experienceHouseMedia';
import {
  getGalleryMediaProjection,
  getHeroMediaProjection,
  projectSynchronizedExperience,
} from './synchronizedExperience';

before(() => {
  installBuilderPackageRegistriesForTests();
});

describe('Experience Context (CAP-HP-003.5)', () => {
  it('identical Runtime → identical synchronized context', () => {
    const runtime = createTestBuilderRuntime();
    runtime.dispatch({ type: 'SelectRoom', roomId: 'bathroom' }, 2);
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
    const house = getTestBuilderHousePackage();
    const runtime = createTestBuilderRuntime(10);

    runtime.dispatch({ type: 'SelectRoom', roomId: 'bedroom' }, 11);
    const bedroom = projectSynchronizedExperience(runtime.getExperience()!);
    assert.equal(bedroom.context.activeRoom.id, 'bedroom');
    assert.equal(bedroom.context.hero.title, house.identity.title);
    assert.equal(bedroom.context.roomMedia.roomId, 'bedroom');

    runtime.dispatch({ type: 'SelectRoom', roomId: 'living-room' }, 12);
    const living = projectSynchronizedExperience(runtime.getExperience()!);
    assert.equal(living.context.hero.title, house.identity.title);
    assert.equal(living.context.roomMedia.roomId, 'living-room');
    assert.equal(living.context.navigation.currentFloor, '0');
    assert.equal(living.context.hero.heroMedia?.id, 'builder-package-hero');
    assert.match(
      living.context.hero.primaryMediaUrl ?? '',
      /\/house-package\/media\/hero\/hero\.png$/,
    );
    assert.match(
      living.context.roomMedia.heroUrl ?? '',
      /\/house-package\/media\/gallery\//,
    );
    assert.ok(
      (living.context.roomMedia.gallery?.length ?? 0) >= 1,
      'Tour gallery must expose CSV-ordered house-package photos',
    );
    assert.ok(
      (living.context.roomMedia.videos?.length ?? 0) >= 1,
      'Tour must expose videos.csv provider media',
    );
    assert.match(
      living.context.roomMedia.thumbnails.find((item) => item.kind === 'photo')
        ?.src ?? '',
      /\/house-package\/media\/gallery\//,
    );
  });

  it('passes House-level Hero copy through to the Hero context', () => {
    const base = createTestBuilderRuntime().getExperience()!;
    const withHeroCopy: SessionExperience = {
      ...base,
      house: {
        ...base.house,
        heroCopy: {
          eyebrow: 'NOVÝ DŮM',
          headline: 'Rozpoznatelný headline',
          metrics: [
            { value: '100 m²', label: 'Plocha' },
            { value: 'A', label: 'Energie' },
            { value: 'Zděná', label: 'Konstrukce' },
          ],
        },
      },
    };

    assert.equal(
      projectSynchronizedExperience(withHeroCopy).context.hero.copy?.headline,
      'Rozpoznatelný headline',
    );
  });

  it('fallback hero context remains deterministic without catalog media', () => {
    const runtime = createTestBuilderRuntime();
    runtime.dispatch({ type: 'SelectRoom', roomId: 'living-room' }, 2);
    const base = runtime.getExperience()!;

    const withoutCatalog: SessionExperience = {
      house: base.house,
      context: {
        ...base.context,
        activeRoom: {
          id: 'room-unmapped',
          room: {
            id: 'room-unmapped',
            name: 'Neznámá místnost',
            area: 10,
            floor: 0,
          },
          focusRoom: base.context.activeRoom.focusRoom,
        },
      },
    };

    const first = projectSynchronizedExperience(withoutCatalog);
    const second = projectSynchronizedExperience(withoutCatalog);

    assert.deepEqual(first.context.hero, second.context.hero);
    assert.deepEqual(first.context.roomMedia, second.context.roomMedia);
    assert.equal(
      first.context.roomMedia.heroMedia?.url,
      '/house-package/media/hero/hero.png',
    );
    assert.equal(first.context.hero.heroMedia?.id, 'builder-package-hero');
  });

  it('ChangePriority updates decision focus without reordering the Media Timeline', () => {
    const house = getTestBuilderHousePackage();
    const runtime = createTestBuilderRuntime();
    runtime.dispatch({ type: 'SelectRoom', roomId: 'living-room' }, 2);
    const before = projectSynchronizedExperience(runtime.getExperience()!);

    assert.equal(before.context.hero.primaryReason, 'primary-living-volume');
    assert.equal(before.context.roomMedia.thumbnails[0]?.kind, 'video');
    const timelineBefore = before.context.roomMedia.thumbnails.map((item) => item.src);

    runtime.dispatch(
      { type: 'ChangePriority', priorityIds: ['plot', 'layout'] },
      3,
    );
    const after = projectSynchronizedExperience(runtime.getExperience()!);

    assert.equal(after.context.decision.focus.focusSignalKind, 'emphasize-outdoor');
    assert.equal(after.context.decision.focus.recommendedAction, 'inspect-outdoor-connection');
    assert.equal(after.context.hero.primaryReason, 'outdoor-led-exploration');
    assert.equal(after.context.hero.title, house.identity.title);
    assert.equal(after.context.hero.eyebrow, before.context.hero.eyebrow);
    assert.ok(after.context.hero.highlights.includes('outdoor-connection'));
    assert.equal(after.context.decision.focus.recommendedMediaRole, 'gallery');
    assert.equal(after.context.roomMedia.thumbnails[0]?.kind, 'video');
    assert.deepEqual(
      after.context.roomMedia.thumbnails.map((item) => item.src),
      timelineBefore,
      'Global Media Timeline must remain immutable across priority changes',
    );
    assert.equal(
      after.context.hero.focusConfidence,
      after.context.decision.focus.confidence,
    );
  });

  it('adapters read the same contract as experience.context', () => {
    const runtime = createTestBuilderRuntime();
    runtime.dispatch({ type: 'SelectRoom', roomId: 'kitchen' }, 2);
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
    const house = getTestBuilderHousePackage();
    const runtime = createTestBuilderRuntime();

    const kitchen = runtime.dispatch({ type: 'SelectRoom', roomId: 'kitchen' }, 2);
    assert.ok(kitchen.ok);
    if (!kitchen.ok) {
      return;
    }

    const synced = projectSynchronizedExperience(kitchen.experience);
    const hero = synced.context.hero;

    assert.equal(synced.context.activeRoom.id, 'kitchen');
    assert.equal(hero.title, house.identity.title);
    assert.match(hero.eyebrow, /ASTAV-M01/);
    assert.ok(synced.context.activeRoom.room?.heroMedia !== null);
    assert.equal(hero.heroMedia?.id, 'builder-package-hero');
    assert.equal(hero.primaryMediaUrl, hero.heroMedia?.url);
  });

  it('projection owns the global Media Timeline — consumers read context.roomMedia', () => {
    const runtime = createTestBuilderRuntime();
    runtime.dispatch({ type: 'SelectRoom', roomId: 'kitchen' }, 2);
    const synced = projectSynchronizedExperience(runtime.getExperience()!);
    const media = synced.context.roomMedia;

    assert.ok(media.heroMedia !== null);
    assert.ok(Array.isArray(media.gallery));
    assert.ok(
      media.gallery.length >= 1,
      'Global gallery from gallery.csv (not room-filtered)',
    );
    assert.ok(Array.isArray(media.videos));
    assert.ok(media.videos.length >= 1);
    assert.equal(media.videos.length, 1, 'exactly one Tour video');
    assert.match(
      media.videos[0]?.url ?? '',
      /fast\.wistia\.net\/embed\/iframe\//,
    );
    assert.match(
      media.gallery[0]?.url ?? '',
      /\/house-package\/media\/gallery\//,
    );
    assert.ok(Array.isArray(media.documents));
    assert.ok(media.documents.length >= 1);
    assert.ok(Array.isArray(media.thumbnails));
    assert.equal(media.thumbnails[0]?.kind, 'video');
    assert.ok(
      media.thumbnails.some((item) => item.kind === 'photo'),
      'timeline includes photos after the Tour video',
    );
  });

  it('SelectRoom keeps the same Media Timeline and only updates room pointer', () => {
    const runtime = createTestBuilderRuntime();
    runtime.dispatch({ type: 'SelectRoom', roomId: 'kitchen' }, 2);
    const kitchen = projectSynchronizedExperience(runtime.getExperience()!);
    const kitchenTimeline = kitchen.context.roomMedia.thumbnails.map(
      (item) => `${item.kind}:${item.src}`,
    );

    runtime.dispatch({ type: 'SelectRoom', roomId: 'bedroom' }, 3);
    const bedroom = projectSynchronizedExperience(runtime.getExperience()!);
    const bedroomTimeline = bedroom.context.roomMedia.thumbnails.map(
      (item) => `${item.kind}:${item.src}`,
    );

    assert.deepEqual(
      bedroomTimeline,
      kitchenTimeline,
      'Thumbnail strip must be identical across rooms',
    );
    assert.equal(bedroom.context.roomMedia.roomId, 'bedroom');
    assert.notEqual(
      bedroom.context.roomMedia.heroUrl,
      kitchen.context.roomMedia.heroUrl,
    );
    assert.ok(
      kitchen.context.roomMedia.thumbnails.some(
        (item) => item.src === kitchen.context.roomMedia.heroUrl,
      ),
      'Room hero must be a pointer into the global timeline',
    );
  });

  it('room selection maps to the first photo index inside the global timeline', () => {
    const house = getTestBuilderHousePackage();
    const photos = listGlobalGalleryPhotos(house);
    const videos = listTourVideos(house);

    assert.equal(videos.length, 1, 'exactly one Tour video');
    assert.ok(photos.length >= 5, 'gallery.csv photos present');

    const livingIndex = firstPhotoTimelineIndexForRoom(house, 'living-room');
    const kitchenIndex = firstPhotoTimelineIndexForRoom(house, 'kitchen');
    const bedroomIndex = firstPhotoTimelineIndexForRoom(house, 'bedroom');

    assert.equal(livingIndex, videos.length + photos.findIndex((p) => p.roomId === 'living-room'));
    assert.equal(kitchenIndex, videos.length + photos.findIndex((p) => p.roomId === 'kitchen'));
    assert.equal(bedroomIndex, videos.length + photos.findIndex((p) => p.roomId === 'bedroom'));
    assert.ok(kitchenIndex !== null && kitchenIndex > 0);
    assert.ok(livingIndex !== null && livingIndex > kitchenIndex!);
    assert.ok(bedroomIndex !== null && bedroomIndex > livingIndex!);

    const synced = projectSynchronizedExperience(
      createTestBuilderRuntime().getExperience()!,
    );
    assert.equal(synced.context.roomMedia.thumbnails[0]?.kind, 'video');
    assert.equal(
      synced.context.roomMedia.thumbnails[kitchenIndex!]?.src,
      photos.find((p) => p.roomId === 'kitchen')?.url,
    );
  });

  it('every gallery.csv room is reachable via Runtime navigation rooms', () => {
    const house = getTestBuilderHousePackage();
    const runtime = createTestBuilderRuntime();
    const roomIds = new Set(house.rooms.map((room) => room.id));

    const galleryRoomIds = new Set(
      house.media
        .map((asset) => {
          const match = /^gallery:([^:]+):/.exec(asset.id);
          return match?.[1] ?? null;
        })
        .filter((id): id is string => id !== null),
    );

    for (const roomId of galleryRoomIds) {
      assert.ok(roomIds.has(roomId), `gallery room ${roomId} missing from navigation`);
      const result = runtime.dispatch({ type: 'SelectRoom', roomId }, 2);
      assert.equal(result.ok, true, `SelectRoom failed for ${roomId}`);
      if (!result.ok) {
        continue;
      }
      const synced = projectSynchronizedExperience(result.experience);
      assert.equal(synced.context.roomMedia.roomId, roomId);
      assert.ok(
        (synced.context.roomMedia.gallery?.length ?? 0) >= 1,
        `${roomId} must expose the global gallery timeline`,
      );
      assert.equal(
        synced.context.roomMedia.thumbnails[0]?.kind,
        'video',
        'Tour video remains first in the global timeline',
      );
    }
  });

  it('floorPlan is projected on Experience Context (ED-DA-02)', () => {
    const house = getTestBuilderHousePackage();
    const runtime = createTestBuilderRuntime();
    runtime.dispatch({ type: 'SelectRoom', roomId: 'living-room' }, 2);
    const first = projectSynchronizedExperience(runtime.getExperience()!);
    const second = projectSynchronizedExperience(runtime.getExperience()!);

    assert.deepEqual(first.context.floorPlan, second.context.floorPlan);
    assert.ok(first.context.floorPlan.src.length > 0);
    assert.match(
      first.context.floorPlan.src,
      /\/house-package\/media\/plans\/p1\.webp$/,
    );
    assert.equal(first.context.floorPlan.viewBoxWidth, 2790);
    assert.equal(first.context.floorPlan.viewBoxHeight, 1938);
    assert.ok(first.context.floorPlan.viewBox > 0);
    assert.equal(first.context.floorPlan.rooms.length, house.rooms.length);
    const living = first.context.floorPlan.rooms.find(
      (room) => room.id === 'living-room',
    );
    assert.ok(living !== undefined);
    assert.equal(living?.title, 'Obývací pokoj');
    assert.match(
      living?.decisionCanvasSrc ?? '',
      /\/house-package\/decision-canvas\/living-room\.svg$/,
    );
    assert.ok(living?.floorPlanRegion !== null);
    assert.ok(
      (living?.floorPlanRegion?.polygon?.length ?? 0) >= 3,
      'living-room must project HP-003 polygon for highlight/hit-test',
    );

    const vestibule = first.context.floorPlan.rooms.find(
      (room) => room.id === 'vestibule',
    );
    const toilet = first.context.floorPlan.rooms.find(
      (room) => room.id === 'toilet',
    );
    const bathroom = first.context.floorPlan.rooms.find(
      (room) => room.id === 'bathroom',
    );
    const wardrobe = first.context.floorPlan.rooms.find(
      (room) => room.id === 'wardrobe',
    );
    assert.ok(vestibule?.floorPlanRegion?.polygon);
    assert.ok(toilet?.floorPlanRegion?.polygon);
    assert.notDeepEqual(
      vestibule?.floorPlanRegion?.polygon,
      toilet?.floorPlanRegion?.polygon,
    );
    // BBoxes of the hallway cluster overlap; polygons must stay distinct so
    // highlight does not paint toilet/bathroom/wardrobe when vestibule is active.
    const vb = vestibule!.floorPlanRegion!;
    const tb = toilet!.floorPlanRegion!;
    const bb = bathroom!.floorPlanRegion!;
    const wb = wardrobe!.floorPlanRegion!;
    const bboxOverlap = (
      a: { x: number; y: number; width: number; height: number },
      b: { x: number; y: number; width: number; height: number },
    ) =>
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y;
    assert.equal(bboxOverlap(vb, tb), true);
    assert.equal(bboxOverlap(vb, bb), true);
    assert.equal(bboxOverlap(vb, wb), true);
    assert.notDeepEqual(vb.polygon, bb.polygon);
    assert.notDeepEqual(vb.polygon, wb.polygon);
  });
});
