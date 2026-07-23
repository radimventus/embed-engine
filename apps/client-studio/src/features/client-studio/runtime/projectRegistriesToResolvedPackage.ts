import type {
  ResolvedHousePackage,
  ResolvedHousePackageRoom,
} from '@embed-engine/contracts';
import type { BuilderHousePackageImport } from '@embed-engine/object-house/builder-package';

import { resolveBuilderVideoUrl } from './builderVideoUrl';

const PACKAGE_PUBLIC_ROOT = '/house-package';

/** Decision-canvas filename aliases when room id ≠ SVG basename. */
const DECISION_CANVAS_ALIAS: Readonly<Record<string, string>> = {
  vestibule: 'vestibule-corridor',
};

function packageUrl(relativePath: string): string {
  const normalized = relativePath.replace(/^\/+/, '');
  return `${PACKAGE_PUBLIC_ROOT}/${normalized}`;
}

function decisionCanvasSrc(roomId: string): string {
  const fileId = DECISION_CANVAS_ALIAS[roomId] ?? roomId;
  return packageUrl(`decision-canvas/${fileId}.svg`);
}

/**
 * Project HP-002 Runtime registries into the ResolvedHousePackage shape
 * consumed by Client Studio presentation adapters (order from gallery.csv only).
 */
export function projectRegistriesToResolvedPackage(
  registries: BuilderHousePackageImport,
): ResolvedHousePackage {
  const { rooms, gallery, videos, hero, floors } = registries;

  const resolvedRooms: ResolvedHousePackageRoom[] = rooms.rooms.map((room) => {
    const galleryEntries = gallery.entries.filter((entry) => entry.roomId === room.roomId);
    // Preserve CSV order — never sort by filename.
    const gallerySrcs = galleryEntries.map((entry) => packageUrl(entry.path));
    const photos = gallerySrcs;
    const roomVideos = videos.entries.filter((entry) => entry.roomId === room.roomId);
    const primaryVideo = roomVideos[0];
    const videoSrc =
      primaryVideo !== undefined
        ? resolveBuilderVideoUrl(primaryVideo.provider, primaryVideo.mediaId)
        : '';
    const heroSrc = gallerySrcs[0] ?? '';

    const mediaItems = [
      ...(videoSrc
        ? [
            {
              kind: 'video' as const,
              src: videoSrc,
              thumbnailSrc: heroSrc || videoSrc,
            },
          ]
        : []),
      ...photos.map((src) => ({
        kind: 'photo' as const,
        src,
        thumbnailSrc: src,
      })),
    ];

    return {
      id: room.roomId,
      title: room.name,
      floor: room.floorId,
      decisionCanvasSrc: decisionCanvasSrc(room.roomId),
      heroSrc,
      gallerySrcs,
      photos,
      mediaItems,
      videoSrc,
      floorPlanRegion: null,
    };
  });

  const openingHero = hero.entries[0];
  const openingHeroSrc =
    openingHero !== undefined ? packageUrl(openingHero.path) : '';

  const primaryFloor = floors.floors[0];
  const floorPlanSrc =
    primaryFloor !== undefined ? packageUrl(primaryFloor.planPng) : '';

  const defaultRoomId =
    resolvedRooms.find((room) => room.id === 'exterior')?.id ??
    resolvedRooms[0]?.id ??
    'exterior';

  const walkthroughVideo =
    videos.entries.find((entry) => entry.roomId === defaultRoomId) ?? videos.entries[0];
  const walkthroughVideoSrc =
    walkthroughVideo !== undefined
      ? resolveBuilderVideoUrl(walkthroughVideo.provider, walkthroughVideo.mediaId)
      : '';

  const walkthroughPoster =
    resolvedRooms.find((room) => room.id === defaultRoomId)?.heroSrc ?? openingHeroSrc;

  return {
    defaultRoomId,
    floorPlanSrc,
    floorPlanViewBox: 400,
    walkthroughVideoSrc,
    walkthroughVideoPoster: walkthroughPoster,
    openingHeroSrc,
    rooms: resolvedRooms,
  };
}
