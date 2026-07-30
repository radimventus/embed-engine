/**
 * HP-003 validation: authoring geometry ↔ rooms.csv consistency.
 */

import type { FloorPlanGeometry } from "./floorPlanGeometry";
import type { RoomCsvRow } from "./types";

export type Hp003ValidationErrorCode =
  | "HP003_ROOM_UNBOUND"
  | "HP003_CSV_NO_GEOMETRY"
  | "HP003_VIEWBOX_MISMATCH"
  | "HP003_ROOM_DUP";

export type Hp003ValidationError = {
  readonly code: Hp003ValidationErrorCode;
  readonly message: string;
  readonly path?: string;
};

export type ValidateFloorPlanGeometryOptions = {
  readonly geometry: FloorPlanGeometry;
  readonly rooms: readonly RoomCsvRow[];
  /** Natural raster pixel size when known (webp/png). */
  readonly rasterSize?: { readonly width: number; readonly height: number };
};

/**
 * Bidirectional HP-003 checks between extracted geometry and rooms.csv.
 */
export function validateFloorPlanGeometryAgainstRooms(
  options: ValidateFloorPlanGeometryOptions,
): readonly Hp003ValidationError[] {
  const { geometry, rooms, rasterSize } = options;
  const errors: Hp003ValidationError[] = [];
  const csvRoomIds = new Set(
    rooms.filter((r) => r.floor === geometry.floorId).map((r) => r.room),
  );
  const geometryRoomIds = new Set(geometry.rooms.map((r) => r.roomId));

  const seen = new Set<string>();
  for (const room of geometry.rooms) {
    if (seen.has(room.roomId)) {
      errors.push({
        code: "HP003_ROOM_DUP",
        message: `Duplicate geometry roomId "${room.roomId}".`,
        path: `media/plans/${geometry.floorId}.geometry.json`,
      });
    }
    seen.add(room.roomId);
    if (!csvRoomIds.has(room.roomId)) {
      errors.push({
        code: "HP003_ROOM_UNBOUND",
        message: `Geometry room "${room.roomId}" is not in rooms.csv for floor ${geometry.floorId}.`,
        path: `media/plans/${geometry.floorId}.author.svg`,
      });
    }
  }

  for (const row of rooms) {
    if (row.floor !== geometry.floorId) {
      continue;
    }
    // Zero-area placeholders (e.g. exterior) may omit geometry — WARN-as-skip per HP-003 pilot.
    if (row.area <= 0) {
      continue;
    }
    if (!geometryRoomIds.has(row.room)) {
      errors.push({
        code: "HP003_CSV_NO_GEOMETRY",
        message: `rooms.csv room "${row.room}" on ${geometry.floorId} has no SVG geometry (area=${row.area}).`,
        path: "rooms.csv",
      });
    }
  }

  if (rasterSize !== undefined) {
    if (
      rasterSize.width !== geometry.viewBox.width ||
      rasterSize.height !== geometry.viewBox.height
    ) {
      errors.push({
        code: "HP003_VIEWBOX_MISMATCH",
        message: `Raster ${rasterSize.width}×${rasterSize.height} ≠ geometry viewBox ${geometry.viewBox.width}×${geometry.viewBox.height}.`,
        path: `media/plans/${geometry.floorId}`,
      });
    }
  }

  return errors;
}
