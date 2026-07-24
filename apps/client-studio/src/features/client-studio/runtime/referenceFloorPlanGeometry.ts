/**
 * Reference House floorplan geometry — must match the natural raster size
 * of `media/plans/p1.webp` (TOUR-17 / TOUR-22).
 */

export const REFERENCE_FLOORPLAN_WIDTH = 2790;
export const REFERENCE_FLOORPLAN_HEIGHT = 1938;

export type ReferenceFloorPlanRegion = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

/**
 * Room highlight regions in natural image pixel space (2790×1938).
 * Scaled from the prior 3450-wide authoring space to the real raster.
 */
export const REFERENCE_FLOORPLAN_REGIONS: Readonly<
  Record<string, ReferenceFloorPlanRegion>
> = {
  bedroom: { x: 388, y: 360, width: 421, height: 720 },
  'children-room': { x: 825, y: 360, width: 388, height: 720 },
  bathroom: { x: 1229, y: 620, width: 340, height: 460 },
  'living-room': { x: 1601, y: 340, width: 793, height: 520 },
  kitchen: { x: 1601, y: 880, width: 793, height: 280 },
};
