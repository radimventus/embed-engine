import type { HousePackageMediaItem } from '@embed-engine/contracts';
import type { ExperienceHouse, ExperienceHouseRoom } from '@embed-engine/model';
import type {
  ExperienceContext,
  FocusRoom,
  SessionExperience,
} from '@embed-engine/runtime';

import {
  decisionCanvasUrlForRoom,
  getFloorPlanUrlForFloor,
  getFloorPlanUrlFromHouse,
  getOpeningHeroUrlFromHouse,
  listGlobalGalleryPhotos,
  listRoomGalleryUrls,
  listTourVideos,
} from './experienceHouseMedia';
import { resolvePublicAssetUrl } from './presentationAssetBase';
import {
  REFERENCE_FLOORPLAN_HEIGHT,
  REFERENCE_FLOORPLAN_REGIONS,
  REFERENCE_FLOORPLAN_WIDTH,
} from './referenceFloorPlanGeometry';

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
  /** Global Media Timeline (video first, then all gallery photos). Identical for every room. */
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

/** Hero presentation slice — Object Discovery opening (CSCB-02). */
export type ExperienceHeroContext = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly metrics: readonly { readonly label: string; readonly value: string }[];
  readonly heroMedia: ProjectedMediaAsset | null;
  readonly primaryMediaUrl: string | null;
  /** Decision Focus metadata retained for adapters — Hero UI does not interpret it. */
  readonly primaryReason: string;
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
  /** Natural floorplan width in viewBox units (Reference House: 3450). */
  readonly viewBoxWidth: number;
  /** Natural floorplan height in viewBox units (Reference House: 1938). */
  readonly viewBoxHeight: number;
  /**
   * @deprecated Prefer viewBoxWidth — retained as width for older adapters.
   */
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

/** Opening Hero from Runtime HousePackage media (Builder-derived). */
function packageHeroMedia(house: ExperienceHouse): ProjectedMediaAsset | null {
  const src = getOpeningHeroUrlFromHouse(house);
  if (src.length === 0) {
    return null;
  }
  return Object.freeze({
    id: 'builder-package-hero',
    kind: 'image' as const,
    url: src,
    thumbnailUrl: src,
    title: 'Hero',
  });
}

function projectHouseDocuments(
  experience: SessionExperience,
): readonly ProjectedMediaAsset[] {
  const docs = experience.house.documents ?? [];
  return Object.freeze(
    docs.map((doc) => {
      const url = resolvePublicAssetUrl(doc.url);
      return Object.freeze({
        id: doc.id,
        kind: 'document' as const,
        url,
        thumbnailUrl: url,
        title: doc.title,
      });
    }),
  );
}

/**
 * Global Media Timeline — video(s) then all gallery photos in CSV order.
 * Identical for every room. Never filtered, reordered, or rebuilt per room.
 */
function projectGlobalMediaTimeline(house: ExperienceHouse): {
  readonly gallery: readonly ProjectedMediaAsset[];
  readonly videos: readonly ProjectedMediaAsset[];
  readonly thumbnails: readonly HousePackageMediaItem[];
} {
  const photos = listGlobalGalleryPhotos(house);
  const tourVideos = listTourVideos(house);
  const firstPhotoUrl = photos[0]?.url;

  const gallery = Object.freeze(
    photos.map((photo, index) =>
      Object.freeze({
        id: `gallery-photo-${photo.order}-${index}`,
        kind: 'image' as const,
        url: photo.url,
        thumbnailUrl: photo.url,
        title: photo.roomId,
      }),
    ),
  );

  const videos = Object.freeze(
    tourVideos.map((video, index) =>
      Object.freeze({
        id: `tour-video-${video.order}-${index}`,
        kind: 'video' as const,
        url: video.url,
        thumbnailUrl: firstPhotoUrl ?? video.url,
        title: 'Tour',
      }),
    ),
  );

  const thumbnails = Object.freeze([
    ...videos.map((video) => ({
      kind: 'video' as const,
      src: video.url,
      thumbnailSrc: video.thumbnailUrl,
    })),
    ...gallery.map((photo) => ({
      kind: 'photo' as const,
      src: photo.url,
      thumbnailSrc: photo.thumbnailUrl,
    })),
  ] satisfies HousePackageMediaItem[]);

  return { gallery, videos, thumbnails };
}

function projectRoomContext(
  room: ExperienceHouseRoom,
  experience: SessionExperience,
  globalMedia: ReturnType<typeof projectGlobalMediaTimeline>,
): ContextualActiveRoom {
  const fallbackHero = packageHeroMedia(experience.house);
  const documents = projectHouseDocuments(experience);
  const roomPhotoUrls = listRoomGalleryUrls(experience.house, room.id);
  const roomHeroUrl = roomPhotoUrls[0];
  const heroMedia =
    roomHeroUrl !== undefined
      ? Object.freeze({
          id: `${room.id}-hero`,
          kind: 'image' as const,
          url: roomHeroUrl,
          thumbnailUrl: roomHeroUrl,
          title: room.name,
        })
      : fallbackHero;

  return Object.freeze({
    ...room,
    description: `${room.name} · ${room.area} m² · patro ${room.floor}`,
    heroMedia,
    gallery: globalMedia.gallery,
    videos: globalMedia.videos,
    documents,
    thumbnails: globalMedia.thumbnails,
    metrics: Object.freeze([
      { label: 'Plocha', value: `${room.area} m²` },
      {
        label: 'Patro',
        value: room.floor === 0 ? 'Přízemí' : `Patro ${room.floor}`,
      },
      {
        label: 'Média',
        value: String(globalMedia.gallery.length + globalMedia.videos.length),
      },
    ]),
  });
}

function projectRoomMedia(
  activeRoom: ContextualActiveRoom | null,
  experience: SessionExperience,
  globalMedia: ReturnType<typeof projectGlobalMediaTimeline>,
): ExperienceRoomMediaContext {
  const documents =
    activeRoom?.documents ?? projectHouseDocuments(experience);
  const idleHero = packageHeroMedia(experience.house);

  if (activeRoom === null) {
    return Object.freeze({
      roomId: null,
      title: idleHero?.title ?? experience.house.title,
      heroMedia: idleHero,
      gallery: globalMedia.gallery,
      videos: globalMedia.videos,
      documents,
      thumbnails: globalMedia.thumbnails,
      heroUrl: idleHero?.url ?? null,
      videoUrl: globalMedia.videos[0]?.url ?? null,
    });
  }

  return Object.freeze({
    roomId: activeRoom.id,
    title: activeRoom.name,
    heroMedia: activeRoom.heroMedia,
    gallery: globalMedia.gallery,
    videos: globalMedia.videos,
    documents,
    thumbnails: globalMedia.thumbnails,
    heroUrl: activeRoom.heroMedia?.url ?? null,
    videoUrl: globalMedia.videos[0]?.url ?? null,
  });
}
function formatArea(m2: number): string {
  return `${m2} m²`;
}

function formatPriceCzk(price: number): string {
  return `${price.toLocaleString('cs-CZ')} Kč`;
}

/**
 * Opening Hero projection — Object Discovery (CSCB-02 / SR-002).
 * Identity from Object; primary media from Builder Package Hero Registry (CAP-BP-01).
 * Decision Focus metadata is retained for adapters but does not rewrite identity.
 */
function projectHeroContext(
  experience: SessionExperience,
  _activeRoom: ContextualActiveRoom | null,
): ExperienceHeroContext {
  const { house } = experience;
  const object = experience.context.object;
  const { highlights, focus: decisionFocus } = experience.context.decision;
  const heroMedia = packageHeroMedia(house);

  return Object.freeze({
    eyebrow: `${object.reference} · ${object.construction}`,
    title: object.title,
    description: house.hasGarden
      ? `${house.roomCount} místností · se zahradou`
      : `${house.roomCount} místností`,
    metrics: Object.freeze([
      { label: 'Užitná plocha', value: formatArea(object.usableArea) },
      { label: 'Pozemek', value: formatArea(house.landArea) },
      { label: 'Cena', value: formatPriceCzk(house.price) },
    ]),
    heroMedia,
    primaryMediaUrl: heroMedia?.url ?? null,
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
  const currentFloor =
    experience.context.navigation.currentFloor ??
    experience.context.navigation.floors[0] ??
    '0';
  const floorPlanSrc =
    getFloorPlanUrlForFloor(experience.house, currentFloor) ||
    getFloorPlanUrlFromHouse(experience.house);
  const hasBuilderFloorplan = floorPlanSrc.length > 0;
  const viewBoxWidth = hasBuilderFloorplan
    ? REFERENCE_FLOORPLAN_WIDTH
    : 400;
  const viewBoxHeight = hasBuilderFloorplan
    ? REFERENCE_FLOORPLAN_HEIGHT
    : 400;

  const rooms = experience.house.rooms.map((room) => {
    const referenceRegion = REFERENCE_FLOORPLAN_REGIONS[room.id] ?? null;
    return Object.freeze({
      id: room.id,
      title: room.name,
      floor: String(room.floor),
      decisionCanvasSrc: decisionCanvasUrlForRoom(room.id),
      floorPlanRegion: referenceRegion,
    });
  });

  return Object.freeze({
    src: floorPlanSrc,
    viewBoxWidth,
    viewBoxHeight,
    viewBox: viewBoxWidth,
    rooms: Object.freeze(rooms),
  });
}

function projectSynchronizedContext(
  experience: SessionExperience,
  activeRoom: ContextualActiveRoom | null,
  globalMedia: ReturnType<typeof projectGlobalMediaTimeline>,
): SynchronizedExperienceContext {
  const { context } = experience;

  return Object.freeze({
    ...context,
    activeRoom: Object.freeze({
      id: context.activeRoom.id,
      room: activeRoom,
      focusRoom: context.activeRoom.focusRoom,
    }),
    roomMedia: projectRoomMedia(activeRoom, experience, globalMedia),
    hero: projectHeroContext(experience, activeRoom),
    floorPlan: projectFloorPlan(experience),
  });
}

/**
 * Project synchronized Experience with unified Experience Context (CAP-HP-003.5).
 * Reads Runtime `context` as-is; adds presentation media slices only (ED-DA-05).
 * Gallery thumbnails are the global Media Timeline — navigation changes activeIndex only.
 */
export function projectSynchronizedExperience(
  experience: SessionExperience,
): SynchronizedExperience {
  const globalMedia = projectGlobalMediaTimeline(experience.house);
  const baseRoom = experience.context.activeRoom.room;
  const activeRoomId = experience.context.activeRoom.id;
  const activeRoom =
    baseRoom === null || activeRoomId === null
      ? null
      : projectRoomContext(baseRoom, experience, globalMedia);

  return Object.freeze({
    house: experience.house,
    context: projectSynchronizedContext(experience, activeRoom, globalMedia),
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
