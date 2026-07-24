/**
 * Presentation helpers that read only ExperienceHouse media
 * (already projected from Builder → Runtime HousePackage).
 * No Builder Registry access.
 *
 * Gallery architecture (TOUR-GALLERY-ARCH-01):
 * Media is a single global timeline. Rooms never own galleries —
 * they only map to the first relevant photo index inside that timeline.
 */

import type { ExperienceHouse } from '@embed-engine/model';
import {
  BUILDER_MEDIA_HERO_ID,
  parseGalleryMediaId,
  parseVideoMediaId,
} from '@embed-engine/object-house/builder-package';

import { resolvePublicAssetUrl } from './presentationAssetBase';

const DECISION_CANVAS_ALIAS: Readonly<Record<string, string>> = {
  vestibule: 'vestibule-corridor',
};

export type GlobalGalleryPhoto = {
  readonly order: number;
  readonly roomId: string;
  readonly url: string;
};

export type TourVideo = {
  readonly order: number;
  readonly roomId: string;
  readonly url: string;
};

export function getOpeningHeroUrlFromHouse(house: ExperienceHouse): string {
  const hero = house.media.find((asset) => asset.id === BUILDER_MEDIA_HERO_ID);
  return hero !== undefined ? resolvePublicAssetUrl(hero.url) : '';
}

/** All gallery photos in global CSV order — never filtered by room. */
export function listGlobalGalleryPhotos(
  house: ExperienceHouse,
): readonly GlobalGalleryPhoto[] {
  const items = house.media
    .map((asset) => {
      const parsed = parseGalleryMediaId(asset.id);
      if (parsed === null) {
        return null;
      }
      return {
        order: parsed.order,
        roomId: parsed.roomId,
        url: resolvePublicAssetUrl(asset.url),
      };
    })
    .filter((item): item is GlobalGalleryPhoto => item !== null)
    .sort((a, b) => a.order - b.order);
  return Object.freeze(items);
}

/**
 * Tour videos in global CSV order.
 * Production package carries a single Tour video — never one per room.
 */
export function listTourVideos(house: ExperienceHouse): readonly TourVideo[] {
  const seenUrls = new Set<string>();
  const items: TourVideo[] = [];

  const sorted = house.media
    .map((asset) => {
      const parsed = parseVideoMediaId(asset.id);
      if (parsed === null) {
        return null;
      }
      return {
        order: parsed.order,
        roomId: parsed.roomId,
        url: resolvePublicAssetUrl(asset.url),
      };
    })
    .filter((item): item is TourVideo => item !== null)
    .sort((a, b) => a.order - b.order);

  for (const item of sorted) {
    if (seenUrls.has(item.url)) {
      continue;
    }
    seenUrls.add(item.url);
    items.push(item);
  }

  return Object.freeze(items);
}

/**
 * Index of the first photo for `roomId` inside the global media timeline
 * (videos first, then gallery photos). Returns null when the room has no photo.
 */
export function firstPhotoTimelineIndexForRoom(
  house: ExperienceHouse,
  roomId: string,
): number | null {
  const videos = listTourVideos(house);
  const photos = listGlobalGalleryPhotos(house);
  const photoIndex = photos.findIndex((photo) => photo.roomId === roomId);
  if (photoIndex < 0) {
    return null;
  }
  return videos.length + photoIndex;
}

/** Photos for a room — used only to resolve the room’s first-image pointer. */
export function listRoomGalleryUrls(
  house: ExperienceHouse,
  roomId: string,
): readonly string[] {
  return Object.freeze(
    listGlobalGalleryPhotos(house)
      .filter((photo) => photo.roomId === roomId)
      .map((photo) => photo.url),
  );
}

export function getFloorPlanUrlFromHouse(house: ExperienceHouse): string {
  const floorplan = house.media.find((asset) => asset.type === 'floorplan');
  return floorplan !== undefined ? resolvePublicAssetUrl(floorplan.url) : '';
}

export function decisionCanvasUrlForRoom(roomId: string): string {
  const fileId = DECISION_CANVAS_ALIAS[roomId] ?? roomId;
  return resolvePublicAssetUrl(`/house-package/decision-canvas/${fileId}.svg`);
}
