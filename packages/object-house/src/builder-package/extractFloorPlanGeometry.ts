/**
 * HP-003 Geometry Extractor — authoring SVG string → FloorPlanGeometry.
 * Pure TypeScript (no DOM). Runtime / Decision Kernel never call this.
 */

import {
  HP003_GEOMETRY_SCHEMA,
  HP003_GEOMETRY_SCHEMA_VERSION,
  type FloorPlanBBox,
  type FloorPlanGeometry,
  type FloorPlanGeometryRoom,
} from "./floorPlanGeometry";

export type GeometryExtractErrorCode =
  | "HP003_SVG_EMPTY"
  | "HP003_SVG_NO_VIEWBOX"
  | "HP003_SVG_BAD_FLOOR"
  | "HP003_SVG_MISSING_HP003"
  | "HP003_ROOM_DUP"
  | "HP003_SVG_BAD_SHAPE";

export type GeometryExtractError = {
  readonly code: GeometryExtractErrorCode;
  readonly message: string;
};

export type GeometryExtractResult =
  | { readonly ok: true; readonly geometry: FloorPlanGeometry }
  | { readonly ok: false; readonly errors: readonly GeometryExtractError[] };

function attr(tag: string, name: string): string | undefined {
  const re = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i");
  const match = re.exec(tag);
  if (!match) {
    return undefined;
  }
  return match[2] ?? match[3];
}

function parseViewBox(
  raw: string | undefined,
): { width: number; height: number } | null {
  if (raw === undefined) {
    return null;
  }
  const parts = raw.trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
    return null;
  }
  const width = parts[2]!;
  const height = parts[3]!;
  if (width <= 0 || height <= 0) {
    return null;
  }
  return { width, height };
}

function bboxFromPoints(
  points: ReadonlyArray<readonly [number, number]>,
): FloorPlanBBox | null {
  if (points.length === 0) {
    return null;
  }
  let minX = points[0]![0];
  let minY = points[0]![1];
  let maxX = minX;
  let maxY = minY;
  for (const [x, y] of points) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function parsePolygonPoints(raw: string): Array<[number, number]> {
  const nums = raw.trim().split(/[\s,]+/).map(Number).filter((n) => Number.isFinite(n));
  const points: Array<[number, number]> = [];
  for (let i = 0; i + 1 < nums.length; i += 2) {
    points.push([nums[i]!, nums[i + 1]!]);
  }
  return points;
}

/** Minimal path bbox for M/L/H/V/Z (and treat C/Q/S/T endpoints as points). */
function bboxFromPathD(d: string): { bbox: FloorPlanBBox; polygon: Array<[number, number]> } | null {
  const tokens = d.match(/[MmLlHhVvZzCcSsQqTtAa]|-?\d*\.?\d+(?:e[-+]?\d+)?/g);
  if (tokens === null || tokens.length === 0) {
    return null;
  }
  const points: Array<[number, number]> = [];
  let i = 0;
  let cx = 0;
  let cy = 0;
  let startX = 0;
  let startY = 0;
  let command = "";

  const readNum = (): number | null => {
    if (i >= tokens.length) {
      return null;
    }
    const t = tokens[i]!;
    if (/^[MmLlHhVvZzCcSsQqTtAa]$/.test(t)) {
      return null;
    }
    i += 1;
    return Number(t);
  };

  while (i < tokens.length) {
    const t = tokens[i]!;
    if (/^[MmLlHhVvZzCcSsQqTtAa]$/.test(t)) {
      command = t;
      i += 1;
    }
    if (command === "") {
      break;
    }
    const relative = command === command.toLowerCase();
    const cmd = command.toUpperCase();

    if (cmd === "Z") {
      cx = startX;
      cy = startY;
      points.push([cx, cy]);
      continue;
    }
    if (cmd === "M" || cmd === "L") {
      const x = readNum();
      const y = readNum();
      if (x === null || y === null) {
        break;
      }
      cx = relative ? cx + x : x;
      cy = relative ? cy + y : y;
      if (cmd === "M") {
        startX = cx;
        startY = cy;
      }
      points.push([cx, cy]);
      command = cmd === "M" ? (relative ? "l" : "L") : command;
      continue;
    }
    if (cmd === "H") {
      const x = readNum();
      if (x === null) {
        break;
      }
      cx = relative ? cx + x : x;
      points.push([cx, cy]);
      continue;
    }
    if (cmd === "V") {
      const y = readNum();
      if (y === null) {
        break;
      }
      cy = relative ? cy + y : y;
      points.push([cx, cy]);
      continue;
    }
    if (cmd === "C") {
      const nums = [readNum(), readNum(), readNum(), readNum(), readNum(), readNum()];
      if (nums.some((n) => n === null)) {
        break;
      }
      const x = relative ? cx + nums[4]! : nums[4]!;
      const y = relative ? cy + nums[5]! : nums[5]!;
      cx = x;
      cy = y;
      points.push([cx, cy]);
      continue;
    }
    if (cmd === "Q" || cmd === "S" || cmd === "T") {
      // Consume remaining numeric pairs for this command family loosely.
      const x = readNum();
      const y = readNum();
      if (x === null || y === null) {
        break;
      }
      // For Q need 4 nums — read two more if Q
      if (cmd === "Q" || cmd === "S") {
        const x2 = readNum();
        const y2 = readNum();
        if (x2 === null || y2 === null) {
          break;
        }
        cx = relative ? cx + x2 : x2;
        cy = relative ? cy + y2 : y2;
      } else {
        cx = relative ? cx + x : x;
        cy = relative ? cy + y : y;
      }
      points.push([cx, cy]);
      continue;
    }
    // Unsupported / A — skip one pair
    readNum();
    readNum();
  }

  const bbox = bboxFromPoints(points);
  if (bbox === null || bbox.width < 0 || bbox.height < 0) {
    return null;
  }
  return { bbox, polygon: points };
}

function extractRoomFromTag(tag: string): FloorPlanGeometryRoom | GeometryExtractError {
  const roomId = attr(tag, "data-room")?.trim();
  if (roomId === undefined || roomId.length === 0) {
    return {
      code: "HP003_SVG_BAD_SHAPE",
      message: "Shape with empty data-room.",
    };
  }
  const interactiveRaw = attr(tag, "data-interactive");
  const interactive = interactiveRaw === undefined || interactiveRaw === "true";

  const nameMatch = /^<([a-zA-Z]+)/.exec(tag);
  const tagName = nameMatch?.[1]?.toLowerCase() ?? "";

  if (tagName === "rect") {
    const x = Number(attr(tag, "x") ?? "0");
    const y = Number(attr(tag, "y") ?? "0");
    const width = Number(attr(tag, "width") ?? "0");
    const height = Number(attr(tag, "height") ?? "0");
    if (![x, y, width, height].every((n) => Number.isFinite(n)) || width <= 0 || height <= 0) {
      return {
        code: "HP003_SVG_BAD_SHAPE",
        message: `Invalid rect for room "${roomId}".`,
      };
    }
    const polygon: Array<[number, number]> = [
      [x, y],
      [x + width, y],
      [x + width, y + height],
      [x, y + height],
    ];
    return {
      roomId,
      interactive,
      bbox: { x, y, width, height },
      polygon,
    };
  }

  if (tagName === "polygon") {
    const points = parsePolygonPoints(attr(tag, "points") ?? "");
    const bbox = bboxFromPoints(points);
    if (bbox === null || points.length < 3) {
      return {
        code: "HP003_SVG_BAD_SHAPE",
        message: `Invalid polygon for room "${roomId}".`,
      };
    }
    return { roomId, interactive, bbox, polygon: points };
  }

  if (tagName === "path") {
    const d = attr(tag, "d");
    if (d === undefined) {
      return {
        code: "HP003_SVG_BAD_SHAPE",
        message: `Path without d for room "${roomId}".`,
      };
    }
    const parsed = bboxFromPathD(d);
    if (parsed === null) {
      return {
        code: "HP003_SVG_BAD_SHAPE",
        message: `Could not derive bbox from path for room "${roomId}".`,
      };
    }
    return {
      roomId,
      interactive,
      bbox: parsed.bbox,
      polygon: parsed.polygon,
    };
  }

  return {
    code: "HP003_SVG_BAD_SHAPE",
    message: `Unsupported room shape <${tagName}> for "${roomId}".`,
  };
}

/**
 * Extract HP-003 geometry from an authoring SVG document string.
 */
export function extractFloorPlanGeometryFromSvg(
  svgText: string,
  expectedFloorId: string,
): GeometryExtractResult {
  const errors: GeometryExtractError[] = [];
  const rootMatch = /<svg\b[^>]*>/i.exec(svgText);
  if (rootMatch === null) {
    return {
      ok: false,
      errors: [{ code: "HP003_SVG_EMPTY", message: "Missing <svg> root." }],
    };
  }
  const rootTag = rootMatch[0];
  const viewBox = parseViewBox(attr(rootTag, "viewBox"));
  if (viewBox === null) {
    errors.push({
      code: "HP003_SVG_NO_VIEWBOX",
      message: "Authoring SVG must declare a valid viewBox.",
    });
  }
  const dataFloor = attr(rootTag, "data-floor")?.trim();
  if (dataFloor === undefined || dataFloor !== expectedFloorId) {
    errors.push({
      code: "HP003_SVG_BAD_FLOOR",
      message: `data-floor must equal "${expectedFloorId}" (got "${dataFloor ?? ""}").`,
    });
  }
  const hp003 = attr(rootTag, "data-hp003")?.trim();
  if (hp003 !== "1") {
    errors.push({
      code: "HP003_SVG_MISSING_HP003",
      message: 'Authoring SVG must set data-hp003="1".',
    });
  }

  const roomTagRe =
    /<(path|polygon|rect)\b[^>]*\bdata-room\s*=\s*("[^"]*"|'[^']*')[^>]*\/?>/gi;
  const rooms: FloorPlanGeometryRoom[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = roomTagRe.exec(svgText)) !== null) {
    const result = extractRoomFromTag(match[0]);
    if ("code" in result) {
      errors.push(result);
      continue;
    }
    if (seen.has(result.roomId)) {
      errors.push({
        code: "HP003_ROOM_DUP",
        message: `Duplicate data-room "${result.roomId}".`,
      });
      continue;
    }
    seen.add(result.roomId);
    rooms.push(result);
  }

  if (rooms.length === 0) {
    errors.push({
      code: "HP003_SVG_EMPTY",
      message: "Authoring SVG has no data-room shapes (stub or empty).",
    });
  }

  if (errors.length > 0 || viewBox === null) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    geometry: {
      schema: HP003_GEOMETRY_SCHEMA,
      schemaVersion: HP003_GEOMETRY_SCHEMA_VERSION,
      floorId: expectedFloorId,
      viewBox,
      units: "px",
      rooms,
    },
  };
}
