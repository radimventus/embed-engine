import type { HousePackageMediaItem } from '@embed-engine/contracts';
import type { SessionExperience } from '@embed-engine/runtime';

import { getMediaRoom } from '../../walkthrough/presentation-assets';

/**
 * Room-scoped media + metadata already filtered for the active room.
 * Components render this — they must not filter HousePackage themselves.
 */
export type ProjectedRoomMedia = {
  readonly roomId: string;
  readonly title: string;
  readonly description: string;
  readonly floor: number;
  readonly area: number;
  readonly heroUrl: string | null;
  readonly galleryUrls: readonly string[];
  readonly videoUrl: string | null;
  readonly mediaItems: readonly HousePackageMediaItem[];
  readonly metrics: readonly {
    readonly label: string;
    readonly value: string;
  }[];
};

/**
 * Canonical Client Studio Experience model (CAP-HP-003.3).
 * Shared by Hero, Gallery, Media Explorer, House Navigator.
 */
export type SynchronizedExperience = SessionExperience & {
  readonly roomMedia: ProjectedRoomMedia | null;
};

/**
 * Projection enrichment: active-room media selection lives here only.
 */
export function projectSynchronizedExperience(
  experience: SessionExperience,
): SynchronizedExperience {
  const activeRoom = experience.activeRoom;
  if (activeRoom === null || experience.activeRoomId === null) {
    return Object.freeze({
      ...experience,
      roomMedia: null,
    });
  }

  const assets = getMediaRoom(activeRoom.id);
  const mediaItems = Object.freeze([...(assets?.mediaItems ?? [])]);
  const galleryUrls = Object.freeze([...(assets?.gallerySrcs ?? [])]);

  const roomMedia: ProjectedRoomMedia = Object.freeze({
    roomId: activeRoom.id,
    title: activeRoom.name,
    description: `${activeRoom.name} · ${activeRoom.area} m² · patro ${activeRoom.floor}`,
    floor: activeRoom.floor,
    area: activeRoom.area,
    heroUrl: assets?.heroSrc ?? null,
    galleryUrls,
    videoUrl: assets?.videoSrc ?? null,
    mediaItems,
    metrics: Object.freeze([
      { label: 'Plocha', value: `${activeRoom.area} m²` },
      { label: 'Patro', value: activeRoom.floor === 0 ? 'Přízemí' : `Patro ${activeRoom.floor}` },
      {
        label: 'Média',
        value: String(galleryUrls.length + (assets?.videoSrc ? 1 : 0)),
      },
    ]),
  });

  return Object.freeze({
    ...experience,
    roomMedia,
  });
}

/** Pure slice for Hero — no component-side filtering. */
export function getHeroMediaProjection(experience: SynchronizedExperience): {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly metrics: readonly { readonly label: string; readonly value: string }[];
  readonly primaryMediaUrl: string | null;
} {
  const { house, roomMedia } = experience;
  if (roomMedia !== null) {
    return {
      eyebrow: `${house.reference} · ${roomMedia.title}`,
      title: roomMedia.title,
      description: roomMedia.description,
      metrics: roomMedia.metrics,
      primaryMediaUrl: roomMedia.heroUrl,
    };
  }

  return {
    eyebrow: `${house.reference} – ${house.title}`,
    title: `${house.city}, ${house.district}`,
    description: house.title,
    metrics: [
      { label: 'Užitná plocha', value: `${house.usableArea} m2` },
      { label: 'Energetická třída', value: house.energyClass },
      { label: 'Konstrukce', value: house.construction },
    ],
    primaryMediaUrl:
      house.media.find((asset) => asset.type === 'image')?.url ?? null,
  };
}

/** Pure slice for Gallery / Media Explorer. */
export function getGalleryMediaProjection(experience: SynchronizedExperience): {
  readonly roomId: string | null;
  readonly title: string | null;
  readonly mediaItems: readonly HousePackageMediaItem[];
  readonly heroUrl: string | null;
  readonly videoUrl: string | null;
} {
  const { roomMedia } = experience;
  if (roomMedia === null) {
    return {
      roomId: null,
      title: null,
      mediaItems: Object.freeze([]),
      heroUrl: null,
      videoUrl: null,
    };
  }

  return {
    roomId: roomMedia.roomId,
    title: roomMedia.title,
    mediaItems: roomMedia.mediaItems,
    heroUrl: roomMedia.heroUrl,
    videoUrl: roomMedia.videoUrl,
  };
}
