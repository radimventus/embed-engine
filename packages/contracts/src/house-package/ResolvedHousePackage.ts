import type { HousePackageFloorPlanRegion } from './HousePackageManifest';
import type { HousePackageMediaItem } from './HousePackageMediaItem';

export type ResolvedHousePackageRoom = {
  id: string;
  title: string;
  floor: string;
  decisionCanvasSrc: string;
  heroSrc: string;
  gallerySrcs: readonly string[];
  photos: readonly string[];
  mediaItems: readonly HousePackageMediaItem[];
  videoSrc: string;
  floorPlanRegion: HousePackageFloorPlanRegion | null;
};

export type ResolvedHousePackage = {
  defaultRoomId: string;
  floorPlanSrc: string;
  floorPlanViewBox: number;
  walkthroughVideoSrc: string;
  walkthroughVideoPoster: string;
  openingHeroSrc: string;
  rooms: readonly ResolvedHousePackageRoom[];
};
