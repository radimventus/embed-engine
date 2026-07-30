/**
 * Experience-side HP-003 geometry cache (not Decision Runtime).
 * Loaded from House Package `media/plans/pN.geometry.json` at bootstrap.
 */

import type { FloorPlanGeometry } from '@embed-engine/object-house/builder-package';

const geometryByFloorId = new Map<string, FloorPlanGeometry>();

export function setFloorPlanGeometryForFloor(
  floorId: string,
  geometry: FloorPlanGeometry,
): void {
  geometryByFloorId.set(floorId, geometry);
}

export function getFloorPlanGeometryForFloor(
  floorId: string,
): FloorPlanGeometry | null {
  return geometryByFloorId.get(floorId) ?? null;
}

export function clearFloorPlanGeometryCache(): void {
  geometryByFloorId.clear();
}

export function listFloorPlanGeometryFloors(): readonly string[] {
  return Object.freeze([...geometryByFloorId.keys()]);
}
