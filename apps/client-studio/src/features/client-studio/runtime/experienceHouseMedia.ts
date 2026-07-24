/**
 * Presentation helpers that read only ExperienceHouse media
 * (already projected from Builder → Runtime HousePackage).
 * No Builder Registry access.
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

export function getOpeningHeroUrlFromHouse(house: ExperienceHouse): string {
  const hero = house.media.find((asset) => asset.id === BUILDER_MEDIA_HERO_ID);
  return hero !== undefined ? resolvePublicAssetUrl(hero.url) : '';
}

export function listRoomGalleryUrls(
  house: ExperienceHouse,
  roomId: string,
): readonly string[] {
  const items = house.media
    .map((asset) => {
      const parsed = parseGalleryMediaId(asset.id);
      if (parsed === null || parsed.roomId !== roomId) {
        return null;
      }
      return { order: parsed.order, url: resolvePublicAssetUrl(asset.url) };
    })
    .filter((item): item is { order: number; url: string } => item !== null)
    .sort((a, b) => a.order - b.order);
  return Object.freeze(items.map((item) => item.url));
}

export function listRoomVideoUrls(
  house: ExperienceHouse,
  roomId: string,
): readonly string[] {
  const items = house.media
    .map((asset) => {
      const parsed = parseVideoMediaId(asset.id);
      if (parsed === null || parsed.roomId !== roomId) {
        return null;
      }
      return { order: parsed.order, url: resolvePublicAssetUrl(asset.url) };
    })
    .filter((item): item is { order: number; url: string } => item !== null)
    .sort((a, b) => a.order - b.order);
  return Object.freeze(items.map((item) => item.url));
}

export function getFloorPlanUrlFromHouse(house: ExperienceHouse): string {
  const floorplan = house.media.find((asset) => asset.type === 'floorplan');
  return floorplan !== undefined ? resolvePublicAssetUrl(floorplan.url) : '';
}

export function decisionCanvasUrlForRoom(roomId: string): string {
  const fileId = DECISION_CANVAS_ALIAS[roomId] ?? roomId;
  return resolvePublicAssetUrl(`/house-package/decision-canvas/${fileId}.svg`);
}
