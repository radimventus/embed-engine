/**
 * Reference House floorplan geometry (Builder plans / pudorys = 3450×1938).
 * Regions keyed by Builder Package room ids (rooms.csv).
 */

export const REFERENCE_FLOORPLAN_WIDTH = 3450;
export const REFERENCE_FLOORPLAN_HEIGHT = 1938;

export type ReferenceFloorPlanRegion = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

/**
 * Room highlight regions aligned to Builder / reference floorplan raster.
 * Coordinates are in the natural image pixel space.
 */
export const REFERENCE_FLOORPLAN_REGIONS: Readonly<
  Record<string, ReferenceFloorPlanRegion>
> = {
  bedroom: { x: 480, y: 360, width: 520, height: 720 },
  'children-room': { x: 1020, y: 360, width: 480, height: 720 },
  bathroom: { x: 1520, y: 620, width: 420, height: 460 },
  'living-room': { x: 1980, y: 340, width: 980, height: 520 },
  kitchen: { x: 1980, y: 880, width: 980, height: 280 },
};
