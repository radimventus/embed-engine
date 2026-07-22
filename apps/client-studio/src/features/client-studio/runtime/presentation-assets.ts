/**
 * Media catalog adapter for `projectSynchronizedExperience` only (ED-DA-02).
 * Not Object Package SSOT — residual until ED-DA-02 Object-owned projection closes.
 *
 * Media UI modules must not import this file; they read Experience Context.
 * Maps Object Package RoomId → catalog assets under /house-package.
 */
import type {
  HousePackageManifest,
  ResolvedHousePackage,
  ResolvedHousePackageRoom,
} from '@embed-engine/contracts';
import { resolveHousePackage } from '@embed-engine/kernel';

import manifest from '../../../../public/house-package/manifest.json';

const MEDIA_PACKAGE = resolveHousePackage(manifest as HousePackageManifest);

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
  return MEDIA_PACKAGE.rooms.find((room) => room.id === mediaRoomId) ?? null;
}

export function getPresentationAssets(): ResolvedHousePackage {
  return MEDIA_PACKAGE;
}
