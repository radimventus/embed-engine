/**
 * Reference House floorplan geometry (pudorys.webp = 3450×1938).
 * SVG overlays and hotspot regions share this coordinate space.
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
 * Room highlight regions aligned to `assets/floorplans/pudorys.webp`.
 * Coordinates are in the natural image pixel space.
 */
export const REFERENCE_FLOORPLAN_REGIONS: Readonly<
  Record<string, ReferenceFloorPlanRegion>
> = {
  'room-bedroom': { x: 480, y: 360, width: 520, height: 720 },
  'room-children': { x: 1020, y: 360, width: 480, height: 720 },
  'room-bath': { x: 1520, y: 620, width: 420, height: 460 },
  'room-living': { x: 1980, y: 340, width: 980, height: 520 },
  'room-kitchen': { x: 1980, y: 880, width: 980, height: 280 },
};

export function referenceFloorPlanSvgPath(roomId: string): string {
  return `/reference-house/assets/floorplans/svg/${roomId}.svg`;
}
