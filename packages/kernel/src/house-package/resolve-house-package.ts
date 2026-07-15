import type {
  HousePackageManifest,
  HousePackageRoom,
  ResolvedHousePackage,
  ResolvedHousePackageRoom,
} from '@embed-engine/contracts';

function joinPackagePath(basePath: string, relativePath: string): string {
  const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  const normalizedRelative = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;

  return `${normalizedBase}/${normalizedRelative}`;
}

function resolveRoomMedia(basePath: string, room: HousePackageRoom): ResolvedHousePackageRoom {
  const mediaBase = joinPackagePath(basePath, room.media.folder);
  const heroSrc = `${mediaBase}/${room.media.hero}`;
  const gallerySrcs = room.media.gallery.map((filename) => `${mediaBase}/${filename}`);
  const photos = [heroSrc, ...gallerySrcs];
  const mediaItems = [
    { kind: 'video' as const, src: `${mediaBase}/${room.media.video}`, thumbnailSrc: heroSrc },
    { kind: 'photo' as const, src: heroSrc, thumbnailSrc: heroSrc },
    ...gallerySrcs.map((src) => ({ kind: 'photo' as const, src, thumbnailSrc: src })),
  ];

  return {
    id: room.id,
    title: room.title,
    floor: room.floor,
    decisionCanvasSrc: joinPackagePath(basePath, room.decisionCanvas),
    heroSrc,
    gallerySrcs,
    photos,
    mediaItems,
    videoSrc: `${mediaBase}/${room.media.video}`,
    floorPlanRegion: room.floorPlanRegion ?? null,
  };
}

function findRoomById(
  rooms: readonly ResolvedHousePackageRoom[],
  roomId: string,
): ResolvedHousePackageRoom {
  const room = rooms.find((entry) => entry.id === roomId);

  if (room === undefined) {
    throw new Error(`House package room not found: ${roomId}`);
  }

  return room;
}

export function resolveHousePackage(manifest: HousePackageManifest): ResolvedHousePackage {
  const rooms = manifest.rooms.map((room) => resolveRoomMedia(manifest.basePath, room));
  const walkthroughRoom = findRoomById(rooms, manifest.walkthrough.roomId);
  const openingRoom = findRoomById(rooms, manifest.opening.roomId);
  const openingHeroSrc = openingRoom.heroSrc;

  return {
    defaultRoomId: manifest.defaultRoomId,
    floorPlanSrc: joinPackagePath(manifest.basePath, manifest.floorPlan.path),
    floorPlanViewBox: manifest.floorPlan.viewBox,
    walkthroughVideoSrc: walkthroughRoom.videoSrc,
    walkthroughVideoPoster: walkthroughRoom.heroSrc,
    openingHeroSrc,
    rooms,
  };
}
