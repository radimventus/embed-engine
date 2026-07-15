export type HousePackageFloorPlanRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type HousePackageRoomMedia = {
  folder: string;
  hero: string;
  gallery: readonly string[];
  video: string;
};

export type HousePackageRoom = {
  id: string;
  title: string;
  floor: string;
  decisionCanvas: string;
  media: HousePackageRoomMedia;
  floorPlanRegion?: HousePackageFloorPlanRegion;
};

export type HousePackageFloorPlan = {
  path: string;
  viewBox: number;
};

export type HousePackageWalkthrough = {
  roomId: string;
};

export type HousePackageOpening = {
  roomId: string;
  asset: 'hero';
};

export type HousePackageManifest = {
  version: string;
  basePath: string;
  defaultRoomId: string;
  floorPlan: HousePackageFloorPlan;
  walkthrough: HousePackageWalkthrough;
  opening: HousePackageOpening;
  rooms: readonly HousePackageRoom[];
};
