/**
 * HP-003 FloorPlan geometry artifact — published contract (browser-safe).
 */

export const HP003_GEOMETRY_SCHEMA = "hp-003-floorplan-geometry" as const;
export const HP003_GEOMETRY_SCHEMA_VERSION = "1.0" as const;

export type FloorPlanBBox = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type FloorPlanGeometryRoom = {
  readonly roomId: string;
  readonly interactive: boolean;
  readonly bbox: FloorPlanBBox;
  readonly polygon?: ReadonlyArray<readonly [number, number]>;
};

export type FloorPlanGeometry = {
  readonly schema: typeof HP003_GEOMETRY_SCHEMA;
  readonly schemaVersion: typeof HP003_GEOMETRY_SCHEMA_VERSION;
  readonly floorId: string;
  readonly viewBox: { readonly width: number; readonly height: number };
  readonly units: "px";
  readonly rooms: readonly FloorPlanGeometryRoom[];
};

export function isFloorPlanGeometry(value: unknown): value is FloorPlanGeometry {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    record.schema === HP003_GEOMETRY_SCHEMA &&
    typeof record.schemaVersion === "string" &&
    typeof record.floorId === "string" &&
    Array.isArray(record.rooms)
  );
}

export function geometryRelativePath(floorId: string): string {
  return `media/plans/${floorId}.geometry.json`;
}

export function authorSvgRelativePath(floorId: string): string {
  return `media/plans/${floorId}.author.svg`;
}
