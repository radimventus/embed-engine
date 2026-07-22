/**
 * Media catalog adapter for Tour chrome only (hotspot regions / viewBox).
 * Object Package (`REFERENCE_HOUSE_PACKAGE` / `/reference-house`) owns photos,
 * video, floorplan image, and decision-canvas SVG paths (PT-TOUR-01).
 *
 * Media UI modules must not import this file; they read Experience Context.
 */
import type {
  HousePackageManifest,
  ResolvedHousePackage,
  ResolvedHousePackageRoom,
} from '@embed-engine/contracts';
import { resolveHousePackage } from '@embed-engine/kernel';

import manifest from '../../../../public/house-package/manifest.json';

import { getPresentationAssetBase } from './presentationAssetBase';

const BASE_MANIFEST = manifest as HousePackageManifest;
const DEFAULT_MEDIA_PACKAGE = resolveHousePackage(BASE_MANIFEST);

/** Object Package room id → media catalog room id. */
const OBJECT_ROOM_TO_MEDIA_ROOM: Readonly<Record<string, string>> = {
  'room-living': 'living-room',
  'room-kitchen': 'kitchen',
  'room-bedroom': 'bedroom',
  'room-bath': 'bathroom',
  'room-children': 'hall',
};

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
  const assetBase = getPresentationAssetBase();
  if (assetBase === null) {
    return DEFAULT_MEDIA_PACKAGE;
  }

  return resolveHousePackage({
    ...BASE_MANIFEST,
    basePath: `${assetBase}${BASE_MANIFEST.basePath}`,
  });
}
