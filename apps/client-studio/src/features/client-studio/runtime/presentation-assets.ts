/**
 * Media catalog adapter for Tour chrome / room media (CAP-BP-01).
 *
 * Sole source: HP-002 Builder House Package → Runtime registries.
 * Historical `manifest.json` + `resolveHousePackage()` are not used.
 *
 * Media UI modules must not import this file; they read Experience Context.
 */
import type {
  ResolvedHousePackage,
  ResolvedHousePackageRoom,
} from '@embed-engine/contracts';

import {
  getBuilderPackageRegistries,
  getBuilderResolvedPackage,
} from './builderPackageBootstrap';
import { getPresentationAssetBase } from './presentationAssetBase';
/**
 * Object Package room id → Builder Package room id (rooms.csv).
 */
const OBJECT_ROOM_TO_MEDIA_ROOM: Readonly<Record<string, string>> = {
  'room-living': 'living-room',
  'room-kitchen': 'kitchen',
  'room-bedroom': 'bedroom',
  'room-bath': 'bathroom',
  'room-children': 'children-room',
  'room-office': 'office',
  'room-toilet': 'toilet',
  'room-hallway-entrance': 'vestibule',
};

function withAssetBase(pkg: ResolvedHousePackage): ResolvedHousePackage {
  const assetBase = getPresentationAssetBase();
  if (assetBase === null) {
    return pkg;
  }

  const prefix = (url: string): string => {
    if (
      url.startsWith('https://') ||
      url.startsWith('http://') ||
      url.startsWith('data:') ||
      url.startsWith('blob:')
    ) {
      return url;
    }
    if (url.startsWith('/')) {
      return `${assetBase}${url}`;
    }
    return url;
  };

  return {
    ...pkg,
    floorPlanSrc: prefix(pkg.floorPlanSrc),
    walkthroughVideoSrc: prefix(pkg.walkthroughVideoSrc),
    walkthroughVideoPoster: prefix(pkg.walkthroughVideoPoster),
    openingHeroSrc: prefix(pkg.openingHeroSrc),
    rooms: pkg.rooms.map((room) => ({
      ...room,
      decisionCanvasSrc: prefix(room.decisionCanvasSrc),
      heroSrc: prefix(room.heroSrc),
      gallerySrcs: room.gallerySrcs.map(prefix),
      photos: room.photos.map(prefix),
      videoSrc: prefix(room.videoSrc),
      mediaItems: room.mediaItems.map((item) => ({
        ...item,
        src: prefix(item.src),
        thumbnailSrc: prefix(item.thumbnailSrc),
      })),
    })),
  };
}

export function resolveMediaRoomId(objectRoomId: string): string | null {
  return OBJECT_ROOM_TO_MEDIA_ROOM[objectRoomId] ?? null;
}

export function getMediaRoom(
  objectRoomId: string,
): ResolvedHousePackageRoom | null {
  const mediaRoomId = resolveMediaRoomId(objectRoomId);
  if (mediaRoomId === null) {
    return null;
  }
  return getPresentationAssets().rooms.find((room) => room.id === mediaRoomId) ?? null;
}

export function getPresentationAssets(): ResolvedHousePackage {
  return withAssetBase(getBuilderResolvedPackage());
}

/** Opening Hero from Hero Registry (not gallery, not Object Package). */
export function getOpeningHeroSrc(): string {
  return getPresentationAssets().openingHeroSrc;
}

/** Expose registries for diagnostics / adapters. */
export function getRuntimeBuilderRegistries() {
  return getBuilderPackageRegistries();
}