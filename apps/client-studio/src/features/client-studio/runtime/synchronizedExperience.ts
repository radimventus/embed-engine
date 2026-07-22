import type { HousePackageMediaItem } from '@embed-engine/contracts';
import type { ExperienceHouse, ExperienceHouseRoom } from '@embed-engine/model';
import type {
  ExperienceContext,
  FocusRoom,
  SessionExperience,
} from '@embed-engine/runtime';

import {
  getMediaRoom,
  getPresentationAssets,
} from './presentation-assets';

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

/** Hero presentation slice — projected from Decision Focus + room media. */
export type ExperienceHeroContext = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly metrics: readonly { readonly label: string; readonly value: string }[];
  readonly heroMedia: ProjectedMediaAsset | null;
  readonly primaryMediaUrl: string | null;
  /** Decision reason from Interpretation / Decision Focus. */
  readonly primaryReason: string;
  /** Ordered semantic highlights (Decision Focus ordered). */
  readonly highlights: readonly string[];
  readonly focusConfidence: number;
  readonly recommendedAction: string;
  readonly focusRoomName: string | null;
};

/** Floor-plan projection — assets + hotspot regions (ED-DA-02). */
export type ExperienceFloorPlanRoom = {
  readonly id: string;
  readonly title: string;
  readonly floor: string;
  readonly decisionCanvasSrc: string;
  readonly floorPlanRegion: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  } | null;
};

export type ExperienceFloorPlanContext = {
  readonly src: string;
  readonly viewBox: number;
  readonly rooms: readonly ExperienceFloorPlanRoom[];
};

/**
 * Client Studio Experience Context — Runtime semantic context + media projection.
 * Canonical input for Hero, Gallery, Media Explorer, FloorPlan, Navigator.
 * Media modules render this context only — never compose semantics (ED-DA-02).
 */
export type SynchronizedExperienceContext = Omit<ExperienceContext, 'activeRoom'> & {
  readonly activeRoom: {
    readonly id: string | null;
    readonly room: ContextualActiveRoom | null;
    readonly focusRoom: FocusRoom | null;
  };
  readonly roomMedia: ExperienceRoomMediaContext;
  readonly hero: ExperienceHeroContext;
  readonly floorPlan: ExperienceFloorPlanContext;
};

/**
 * Canonical Client Studio Experience — Object house + synchronized Context (ED-DA-05).
 */
export type SynchronizedExperience = {
  readonly house: ExperienceHouse;
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

function orderThumbnailsByRecommendation(
  thumbnails: readonly HousePackageMediaItem[],
  recommendedMedia: SessionExperience['context']['decision']['recommendedMedia'],
  preferredRole?: SessionExperience['context']['decision']['focus']['recommendedMediaRole'],
): readonly HousePackageMediaItem[] {
  const topRole = preferredRole ?? recommendedMedia[0]?.role;
  if (topRole === undefined || thumbnails.length === 0) {
    return thumbnails;
  }

  const preferVideo = topRole === 'video';
  const preferStill =
    topRole === 'gallery' || topRole === 'hero' || topRole === 'thumbnail';

  if (!preferVideo && !preferStill) {
    return thumbnails;
  }

  return Object.freeze(
    [...thumbnails].sort((left, right) => {
      const leftVideo = left.kind === 'video' ? 0 : 1;
      const rightVideo = right.kind === 'video' ? 0 : 1;
      if (preferVideo) {
        return leftVideo - rightVideo;
      }
      return rightVideo - leftVideo;
    }),
  );
}

function projectRoomMedia(
  activeRoom: ContextualActiveRoom | null,
  experience: SessionExperience,
): ExperienceRoomMediaContext {
  if (activeRoom === null) {
    return emptyRoomMedia();
  }

  const thumbnails = orderThumbnailsByRecommendation(
    activeRoom.thumbnails,
    experience.context.decision.recommendedMedia,
    experience.context.decision.focus.recommendedMediaRole,
  );

  return Object.freeze({
    roomId: activeRoom.id,
    title: activeRoom.name,
    heroMedia: activeRoom.heroMedia,
    gallery: activeRoom.gallery,
    videos: activeRoom.videos,
    documents: activeRoom.documents,
    thumbnails,
    heroUrl: activeRoom.heroMedia?.url ?? null,
    videoUrl: activeRoom.videos[0]?.url ?? null,
  });
}

/** Presentation labels for machine reason keys — projection-owned, not UI logic. */
const PRIMARY_REASON_LABELS: Readonly<Record<string, string>> = {
  'explore-house-structure': 'Prohlídka struktury domu',
  'primary-living-volume': 'Hlavní obytný prostor',
  'daily-workflow-core': 'Denní provoz a kuchyně',
  'private-rest-zone': 'Soukromí a odpočinek',
  'service-wet-zone': 'Servisní zóna',
  'flexible-secondary-space': 'Flexibilní sekundární prostor',
  'value-led-exploration': 'Orientace na hodnotu a efektivitu',
  'outdoor-led-exploration': 'Orientace na zahradu a venkovní propojení',
  'space-led-exploration': 'Orientace na prostorovou velkorysost',
  'privacy-led-exploration': 'Orientace na soukromí',
};

const ACTION_LABELS: Readonly<Record<string, string>> = {
  'explore-house-structure': 'Začněte prohlídkou struktury domu',
  'explore-primary-room': 'Soustřeďte se na prioritní místnost',
  'inspect-value-drivers': 'Prověřte hodnotové a nákladové faktory',
  'inspect-outdoor-connection': 'Prověřte propojení se zahradou',
  'inspect-spatial-volume': 'Prověřte prostorovou velkorysost',
  'inspect-privacy-zones': 'Prověřte zóny soukromí',
  'compare-priority-tradeoffs': 'Porovnejte kompromisy priorit',
};

function reasonLabel(primaryReason: string): string {
  return PRIMARY_REASON_LABELS[primaryReason] ?? primaryReason;
}

function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

function projectHeroContext(
  experience: SessionExperience,
  activeRoom: ContextualActiveRoom | null,
): ExperienceHeroContext {
  const { house } = experience;
  const { highlights, focus: decisionFocus } = experience.context.decision;
  const reason = reasonLabel(decisionFocus.focusReason);
  const action = actionLabel(decisionFocus.recommendedAction);
  const focusName =
    decisionFocus.focusRoomName ?? activeRoom?.name ?? house.title;
  const guided = decisionFocus.focusSignalKind !== null;

  if (activeRoom !== null) {
    return Object.freeze({
      eyebrow: guided
        ? `${house.reference} · ${reason}`
        : `${house.reference} · ${activeRoom.name}`,
      title: guided ? focusName : activeRoom.name,
      description: guided
        ? `${action} · ${activeRoom.description}`
        : activeRoom.description,
      metrics: activeRoom.metrics,
      heroMedia: activeRoom.heroMedia,
      primaryMediaUrl: activeRoom.heroMedia?.url ?? null,
      primaryReason: decisionFocus.focusReason,
      highlights,
      focusConfidence: decisionFocus.confidence,
      recommendedAction: decisionFocus.recommendedAction,
      focusRoomName: decisionFocus.focusRoomName,
    });
  }

  const fallback = houseFallbackHero(experience);
  return Object.freeze({
    eyebrow: guided
      ? `${house.reference} · ${reason}`
      : `${house.reference} – ${house.title}`,
    title: guided ? focusName : `${house.city}, ${house.district}`,
    description: guided ? `${action} · ${house.title}` : house.title,
    metrics: Object.freeze([
      { label: 'Užitná plocha', value: `${house.usableArea} m2` },
      { label: 'Energetická třída', value: house.energyClass },
      { label: 'Konstrukce', value: house.construction },
    ]),
    heroMedia: fallback,
    primaryMediaUrl: fallback?.url ?? null,
    primaryReason: decisionFocus.focusReason,
    highlights,
    focusConfidence: decisionFocus.confidence,
    recommendedAction: decisionFocus.recommendedAction,
    focusRoomName: decisionFocus.focusRoomName,
  });
}

function projectFloorPlan(
  experience: SessionExperience,
): ExperienceFloorPlanContext {
  const assets = getPresentationAssets();
  const rooms = experience.house.rooms.map((room) => {
    const chrome = getMediaRoom(room.id);
    return Object.freeze({
      id: room.id,
      title: room.name,
      floor: String(room.floor),
      decisionCanvasSrc: chrome?.decisionCanvasSrc ?? '',
      floorPlanRegion: chrome?.floorPlanRegion ?? null,
    });
  });

  return Object.freeze({
    src: assets.floorPlanSrc,
    viewBox: assets.floorPlanViewBox,
    rooms: Object.freeze(rooms),
  });
}

function projectSynchronizedContext(
  experience: SessionExperience,
  activeRoom: ContextualActiveRoom | null,
): SynchronizedExperienceContext {
  const { context } = experience;

  return Object.freeze({
    ...context,
    activeRoom: Object.freeze({
      id: context.activeRoom.id,
      room: activeRoom,
      focusRoom: context.activeRoom.focusRoom,
    }),
    roomMedia: projectRoomMedia(activeRoom, experience),
    hero: projectHeroContext(experience, activeRoom),
    floorPlan: projectFloorPlan(experience),
  });
}

/**
 * Project synchronized Experience with unified Experience Context (CAP-HP-003.5).
 * Reads Runtime `context` as-is; adds presentation media slices only (ED-DA-05).
 */
export function projectSynchronizedExperience(
  experience: SessionExperience,
): SynchronizedExperience {
  const baseRoom = experience.context.activeRoom.room;
  const activeRoomId = experience.context.activeRoom.id;
  const activeRoom =
    baseRoom === null || activeRoomId === null
      ? null
      : projectRoomContext(baseRoom, experience);

  return Object.freeze({
    house: experience.house,
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
