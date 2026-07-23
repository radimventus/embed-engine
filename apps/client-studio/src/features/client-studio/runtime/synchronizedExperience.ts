import type { HousePackageMediaItem } from '@embed-engine/contracts';
import type { ExperienceHouse, ExperienceHouseRoom } from '@embed-engine/model';
import type {
  ExperienceContext,
  FocusRoom,
  SessionExperience,
} from '@embed-engine/runtime';

import {
  getMediaRoom,
  getOpeningHeroSrc,
  getPresentationAssets,
} from './presentation-assets';
import { resolvePublicAssetUrl } from './presentationAssetBase';
import {
  REFERENCE_FLOORPLAN_HEIGHT,
  REFERENCE_FLOORPLAN_REGIONS,
  REFERENCE_FLOORPLAN_WIDTH,
  referenceFloorPlanSvgPath,
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

/** Opening Hero from Builder Package Hero Registry (CAP-BP-01). */
function packageHeroMedia(): ProjectedMediaAsset | null {
  const src = getOpeningHeroSrc();
  if (src.length === 0) {
    return null;
  }
  const url = resolvePublicAssetUrl(src);
  return Object.freeze({
    id: 'builder-package-hero',
    kind: 'image' as const,
    url,
    thumbnailUrl: url,
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

function referenceDecisionCanvasSrc(roomId: string): string {
  return resolvePublicAssetUrl(referenceFloorPlanSvgPath(roomId));
}

function projectRoomContext(
  room: ExperienceHouseRoom,
  experience: SessionExperience,
): ContextualActiveRoom {
  const fallbackHero = packageHeroMedia();
  const documents = projectHouseDocuments(experience);
  const mediaRoom = getMediaRoom(room.id);

  const gallery: readonly ProjectedMediaAsset[] =
    mediaRoom !== null && mediaRoom.photos.length > 0
      ? Object.freeze(
          mediaRoom.photos.map((url, index) => {
            const resolved = resolvePublicAssetUrl(url);
            return Object.freeze({
              id: `${room.id}-photo-${index}`,
              kind: 'image' as const,
              url: resolved,
              thumbnailUrl: resolved,
              title: room.name,
            });
          }),
        )
      : Object.freeze([]);

  const videos: readonly ProjectedMediaAsset[] =
    mediaRoom !== null && mediaRoom.videoSrc.length > 0
      ? Object.freeze([
          Object.freeze({
            id: `${room.id}-video`,
            kind: 'video' as const,
            url: resolvePublicAssetUrl(mediaRoom.videoSrc),
            thumbnailUrl: resolvePublicAssetUrl(
              mediaRoom.heroSrc || mediaRoom.photos[0] || mediaRoom.videoSrc,
            ),
            title: room.name,
          }),
        ])
      : Object.freeze([]);

  const heroMedia =
    mediaRoom !== null && mediaRoom.heroSrc.length > 0
      ? Object.freeze({
          id: `${room.id}-hero`,
          kind: 'image' as const,
          url: resolvePublicAssetUrl(mediaRoom.heroSrc),
          thumbnailUrl: resolvePublicAssetUrl(mediaRoom.heroSrc),
          title: room.name,
        })
      : (gallery[0] ?? fallbackHero);

  const thumbnails: HousePackageMediaItem[] = [
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
  ];

  return Object.freeze({
    ...room,
    description: `${room.name} · ${room.area} m² · patro ${room.floor}`,
    heroMedia,
    gallery,
    videos,
    documents,
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

function emptyRoomMedia(
  experience: SessionExperience,
): ExperienceRoomMediaContext {
  const idleHero = packageHeroMedia();
  const gallery = Object.freeze([]) as readonly ProjectedMediaAsset[];
  const videos = Object.freeze([]) as readonly ProjectedMediaAsset[];
  const documents = projectHouseDocuments(experience);
  const thumbnails = Object.freeze([]) as readonly HousePackageMediaItem[];

  return Object.freeze({
    roomId: null,
    title: idleHero?.title ?? experience.house.title,
    heroMedia: idleHero,
    gallery,
    videos,
    documents,
    thumbnails,
    heroUrl: idleHero?.url ?? null,
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
    return emptyRoomMedia(experience);
  }

  const thumbnails = orderThumbnailsByRecommendation(
    activeRoom.thumbnails,
    experience.context.decision.recommendedMedia,
    experience.context.decision.focus.recommendedMediaRole,
  );

  const preferredStill =
    thumbnails.find((item) => item.kind === 'photo') ?? null;
  const preferredHeroUrl = preferredStill?.src ?? activeRoom.heroMedia?.url ?? null;
  const preferredHero =
    preferredHeroUrl !== null
      ? Object.freeze({
          id: `${activeRoom.id}-focus-hero`,
          kind: 'image' as const,
          url: preferredHeroUrl,
          thumbnailUrl: preferredStill?.thumbnailSrc ?? preferredHeroUrl,
          title: activeRoom.name,
        })
      : activeRoom.heroMedia;

  return Object.freeze({
    roomId: activeRoom.id,
    title: activeRoom.name,
    heroMedia: preferredHero,
    gallery: activeRoom.gallery,
    videos: activeRoom.videos,
    documents: activeRoom.documents,
    thumbnails,
    heroUrl: preferredHero?.url ?? null,
    videoUrl: activeRoom.videos[0]?.url ?? null,
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
  const heroMedia = packageHeroMedia();

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
  const assets = getPresentationAssets();
  const objectFloorplan = experience.house.media.find(
    (asset) => asset.type === 'floorplan',
  );
  const useReferenceGeometry = objectFloorplan !== undefined;
  const viewBoxWidth = useReferenceGeometry
    ? REFERENCE_FLOORPLAN_WIDTH
    : assets.floorPlanViewBox;
  const viewBoxHeight = useReferenceGeometry
    ? REFERENCE_FLOORPLAN_HEIGHT
    : assets.floorPlanViewBox;

  const rooms = experience.house.rooms.map((room) => {
    const chrome = getMediaRoom(room.id);
    const referenceRegion = REFERENCE_FLOORPLAN_REGIONS[room.id] ?? null;
    return Object.freeze({
      id: room.id,
      title: room.name,
      floor: String(room.floor),
      decisionCanvasSrc: useReferenceGeometry
        ? referenceDecisionCanvasSrc(room.id)
        : (chrome?.decisionCanvasSrc ?? ''),
      floorPlanRegion: useReferenceGeometry
        ? referenceRegion
        : (chrome?.floorPlanRegion ?? null),
    });
  });

  return Object.freeze({
    src: resolvePublicAssetUrl(
      objectFloorplan?.url ?? assets.floorPlanSrc,
    ),
    viewBoxWidth,
    viewBoxHeight,
    viewBox: viewBoxWidth,
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
