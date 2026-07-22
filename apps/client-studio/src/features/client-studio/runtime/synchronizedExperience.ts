import type { HousePackageMediaItem } from '@embed-engine/contracts';
import type { ExperienceHouseRoom } from '@embed-engine/model';
import type {
  ExperienceContext,
  FocusRoom,
  SessionExperience,
} from '@embed-engine/runtime';
import { projectExperienceContext } from '@embed-engine/runtime';

import {
  getMediaRoom,
  getPresentationAssets,
} from '../../walkthrough/presentation-assets';

/**
 * First-class projected media asset (CAP-HP-003.4).
 * Ordering, primary, and fallback are owned by Projection.
 */
export type ProjectedMediaAsset = {
  readonly id: string;
  readonly kind: 'image' | 'video' | 'document' | 'floorplan';
  readonly url: string;
  readonly thumbnailUrl: string;
  readonly title: string;
};

/**
 * Active room with contextual media already resolved.
 * UI renders these fields — never filters Object Package / asset catalogs.
 */
export type ContextualActiveRoom = ExperienceHouseRoom & {
  readonly description: string;
  readonly heroMedia: ProjectedMediaAsset | null;
  readonly gallery: readonly ProjectedMediaAsset[];
  readonly videos: readonly ProjectedMediaAsset[];
  readonly documents: readonly ProjectedMediaAsset[];
  /** Ordered rail items (video first, then gallery photos). */
  readonly thumbnails: readonly HousePackageMediaItem[];
  readonly metrics: readonly {
    readonly label: string;
    readonly value: string;
  }[];
};

/** Room media slice of the unified Experience Context. */
export type ExperienceRoomMediaContext = {
  readonly roomId: string | null;
  readonly title: string | null;
  readonly heroMedia: ProjectedMediaAsset | null;
  readonly gallery: readonly ProjectedMediaAsset[];
  readonly videos: readonly ProjectedMediaAsset[];
  readonly documents: readonly ProjectedMediaAsset[];
  readonly thumbnails: readonly HousePackageMediaItem[];
  readonly heroUrl: string | null;
  readonly videoUrl: string | null;
};

/** Hero presentation slice — projected, not derived in UI. */
export type ExperienceHeroContext = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly metrics: readonly { readonly label: string; readonly value: string }[];
  readonly heroMedia: ProjectedMediaAsset | null;
  readonly primaryMediaUrl: string | null;
};

/**
 * Client Studio Experience Context — Runtime semantic context + room media.
 * Canonical input for Hero, Gallery, Media Explorer, Navigator, and future modules.
 */
export type SynchronizedExperienceContext = Omit<ExperienceContext, 'activeRoom'> & {
  readonly activeRoom: {
    readonly id: string | null;
    readonly room: ContextualActiveRoom | null;
    readonly focusRoom: FocusRoom | null;
  };
  readonly roomMedia: ExperienceRoomMediaContext;
  readonly hero: ExperienceHeroContext;
};

/**
 * Canonical Client Studio Experience — semantic state + contextual media.
 */
export type SynchronizedExperience = Omit<
  SessionExperience,
  'activeRoom' | 'context'
> & {
  readonly activeRoom: ContextualActiveRoom | null;
  readonly context: SynchronizedExperienceContext;
};

function houseFallbackHero(experience: SessionExperience): ProjectedMediaAsset | null {
  const houseImage = experience.house.media.find((asset) => asset.type === 'image');
  if (houseImage !== undefined) {
    return Object.freeze({
      id: houseImage.id,
      kind: 'image' as const,
      url: houseImage.url,
      thumbnailUrl: houseImage.url,
      title: houseImage.title,
    });
  }

  const opening = getPresentationAssets().openingHeroSrc;
  if (opening.length === 0) {
    return null;
  }

  return Object.freeze({
    id: 'fallback-opening-hero',
    kind: 'image' as const,
    url: opening,
    thumbnailUrl: opening,
    title: experience.house.title,
  });
}

function projectRoomContext(
  room: ExperienceHouseRoom,
  experience: SessionExperience,
): ContextualActiveRoom {
  const assets = getMediaRoom(room.id);
  const fallbackHero = houseFallbackHero(experience);

  const gallery: ProjectedMediaAsset[] = (assets?.gallerySrcs ?? []).map(
    (url, index) =>
      Object.freeze({
        id: `${room.id}-gallery-${index + 1}`,
        kind: 'image' as const,
        url,
        thumbnailUrl: url,
        title: `${room.name} · ${index + 1}`,
      }),
  );

  const videos: ProjectedMediaAsset[] =
    assets?.videoSrc !== undefined && assets.videoSrc.length > 0
      ? [
          Object.freeze({
            id: `${room.id}-video`,
            kind: 'video' as const,
            url: assets.videoSrc,
            thumbnailUrl: assets.heroSrc || fallbackHero?.url || assets.videoSrc,
            title: `${room.name} · video`,
          }),
        ]
      : [];

  const documents: ProjectedMediaAsset[] = [];

  const heroFromRoom =
    assets?.heroSrc !== undefined && assets.heroSrc.length > 0
      ? Object.freeze({
          id: `${room.id}-hero`,
          kind: 'image' as const,
          url: assets.heroSrc,
          thumbnailUrl: assets.heroSrc,
          title: room.name,
        })
      : null;

  const heroMedia =
    heroFromRoom ??
    (gallery[0] !== undefined
      ? Object.freeze({ ...gallery[0], id: `${room.id}-hero-fallback` })
      : fallbackHero);

  const thumbnails: HousePackageMediaItem[] =
    assets?.mediaItems !== undefined && assets.mediaItems.length > 0
      ? [...assets.mediaItems]
      : heroMedia !== null
        ? [
            {
              kind: 'photo',
              src: heroMedia.url,
              thumbnailSrc: heroMedia.thumbnailUrl,
            },
          ]
        : [];

  return Object.freeze({
    ...room,
    description: `${room.name} · ${room.area} m² · patro ${room.floor}`,
    heroMedia,
    gallery: Object.freeze(gallery),
    videos: Object.freeze(videos),
    documents: Object.freeze(documents),
    thumbnails: Object.freeze(thumbnails),
    metrics: Object.freeze([
      { label: 'Plocha', value: `${room.area} m²` },
      {
        label: 'Patro',
        value: room.floor === 0 ? 'Přízemí' : `Patro ${room.floor}`,
      },
      {
        label: 'Média',
        value: String(gallery.length + videos.length),
      },
    ]),
  });
}

function emptyRoomMedia(): ExperienceRoomMediaContext {
  return Object.freeze({
    roomId: null,
    title: null,
    heroMedia: null,
    gallery: Object.freeze([]),
    videos: Object.freeze([]),
    documents: Object.freeze([]),
    thumbnails: Object.freeze([]),
    heroUrl: null,
    videoUrl: null,
  });
}

function projectRoomMedia(
  activeRoom: ContextualActiveRoom | null,
): ExperienceRoomMediaContext {
  if (activeRoom === null) {
    return emptyRoomMedia();
  }

  return Object.freeze({
    roomId: activeRoom.id,
    title: activeRoom.name,
    heroMedia: activeRoom.heroMedia,
    gallery: activeRoom.gallery,
    videos: activeRoom.videos,
    documents: activeRoom.documents,
    thumbnails: activeRoom.thumbnails,
    heroUrl: activeRoom.heroMedia?.url ?? null,
    videoUrl: activeRoom.videos[0]?.url ?? null,
  });
}

function projectHeroContext(
  experience: SessionExperience,
  activeRoom: ContextualActiveRoom | null,
): ExperienceHeroContext {
  const { house } = experience;
  if (activeRoom !== null) {
    return Object.freeze({
      eyebrow: `${house.reference} · ${activeRoom.name}`,
      title: activeRoom.name,
      description: activeRoom.description,
      metrics: activeRoom.metrics,
      heroMedia: activeRoom.heroMedia,
      primaryMediaUrl: activeRoom.heroMedia?.url ?? null,
    });
  }

  const fallback = houseFallbackHero(experience);
  return Object.freeze({
    eyebrow: `${house.reference} – ${house.title}`,
    title: `${house.city}, ${house.district}`,
    description: house.title,
    metrics: Object.freeze([
      { label: 'Užitná plocha', value: `${house.usableArea} m2` },
      { label: 'Energetická třída', value: house.energyClass },
      { label: 'Konstrukce', value: house.construction },
    ]),
    heroMedia: fallback,
    primaryMediaUrl: fallback?.url ?? null,
  });
}

function projectSynchronizedContext(
  experience: SessionExperience,
  activeRoom: ContextualActiveRoom | null,
): SynchronizedExperienceContext {
  const base = projectExperienceContext({
    house: experience.house,
    activeRoomId: experience.activeRoomId,
    activeRoom,
    focusRoom: experience.focusRoom,
    priorityIds: experience.priorityIds,
    prioritySignals: experience.prioritySignals,
    variantId: experience.variantId,
    scenarioId: experience.scenarioId,
    primaryReason: experience.primaryReason,
    highlights: experience.highlights,
    recommendedMedia: experience.recommendedMedia,
    interpretationSummary: experience.interpretationSummary,
    roomImportanceRank: experience.roomImportanceRank,
    appliedRuleIds: experience.appliedRuleIds,
    rulesetId: experience.rulesetId,
    rulesetVersion: experience.rulesetVersion,
  });

  return Object.freeze({
    ...base,
    activeRoom: Object.freeze({
      id: experience.activeRoomId,
      room: activeRoom,
      focusRoom: experience.focusRoom,
    }),
    roomMedia: projectRoomMedia(activeRoom),
    hero: projectHeroContext(experience, activeRoom),
  });
}

/**
 * Project synchronized Experience with unified Experience Context (CAP-HP-003.5).
 * Owns semantic grouping, media, defaults, and context completeness.
 */
export function projectSynchronizedExperience(
  experience: SessionExperience,
): SynchronizedExperience {
  const baseRoom = experience.activeRoom;
  const activeRoom =
    baseRoom === null || experience.activeRoomId === null
      ? null
      : projectRoomContext(baseRoom, experience);

  return Object.freeze({
    ...experience,
    activeRoom,
    context: projectSynchronizedContext(experience, activeRoom),
  });
}

/** @deprecated Prefer `experience.context.hero` — kept for thin adapters. */
export function getHeroMediaProjection(experience: SynchronizedExperience): ExperienceHeroContext {
  return experience.context.hero;
}

/** @deprecated Prefer `experience.context.roomMedia` — kept for thin adapters. */
export function getGalleryMediaProjection(experience: SynchronizedExperience): ExperienceRoomMediaContext & {
  readonly mediaItems: readonly HousePackageMediaItem[];
} {
  const { roomMedia } = experience.context;
  return {
    ...roomMedia,
    mediaItems: roomMedia.thumbnails,
  };
}
