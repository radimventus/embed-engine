import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  authorSvgRelativePath,
  roomSvgDirectoryRelativePath,
} from "./floorPlanGeometry";

type GeneratedRoomShape = {
  readonly roomId: string;
  readonly d: string;
  readonly transform?: string;
};

export type GenerateAuthorSvgFromRoomSvgsResult =
  | {
      readonly ok: true;
      readonly authorSvgPath: string;
      readonly roomIds: readonly string[];
      readonly viewBox: string;
    }
  | {
      readonly ok: false;
      readonly errors: readonly string[];
    };

function attr(tag: string, name: string): string | undefined {
  const re = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i");
  const match = re.exec(tag);
  if (!match) {
    return undefined;
  }
  return match[2] ?? match[3];
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function rectToPath(tag: string): string | null {
  const x = Number(attr(tag, "x") ?? "0");
  const y = Number(attr(tag, "y") ?? "0");
  const width = Number(attr(tag, "width") ?? "");
  const height = Number(attr(tag, "height") ?? "");
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }
  return `M ${x} ${y} H ${x + width} V ${y + height} H ${x} Z`;
}

function polygonToPath(tag: string): string | null {
  const pointsRaw = attr(tag, "points");
  if (pointsRaw === undefined) {
    return null;
  }
  const nums = pointsRaw
    .trim()
    .split(/[\s,]+/)
    .map(Number)
    .filter((value) => Number.isFinite(value));
  if (nums.length < 6 || nums.length % 2 !== 0) {
    return null;
  }
  const segments: string[] = [];
  for (let i = 0; i < nums.length; i += 2) {
    const x = nums[i]!;
    const y = nums[i + 1]!;
    segments.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }
  segments.push("Z");
  return segments.join(" ");
}

function pathToPath(tag: string): string | null {
  const d = attr(tag, "d")?.trim();
  if (!d) {
    return null;
  }
  return d;
}

function shapeTagToPath(tag: string): string | null {
  if (/^<path\b/i.test(tag)) {
    return pathToPath(tag);
  }
  if (/^<polygon\b/i.test(tag)) {
    return polygonToPath(tag);
  }
  if (/^<rect\b/i.test(tag)) {
    return rectToPath(tag);
  }
  return null;
}

function extractRootSvgTag(svgText: string): string | null {
  return svgText.match(/<svg\b[^>]*>/i)?.[0] ?? null;
}

function parseViewBox(svgText: string): string | null {
  const rootTag = extractRootSvgTag(svgText);
  if (rootTag === null) {
    return null;
  }
  const viewBox = attr(rootTag, "viewBox")?.trim();
  return viewBox && viewBox.length > 0 ? viewBox : null;
}

function extractDrawableShapes(svgText: string): readonly string[] {
  const matches = svgText.match(/<(path|polygon|rect)\b[^>]*\/?>/gi);
  return matches ?? [];
}

function roomIdFromFilename(fileName: string): string | null {
  const match = /^room-(.+)\.svg$/i.exec(fileName);
  if (match === null) {
    return null;
  }
  const roomId = match[1]!.trim().toLowerCase();
  return roomId.length > 0 ? roomId : null;
}

function buildRoomShape(fileName: string, svgText: string): GeneratedRoomShape | string {
  const roomId = roomIdFromFilename(fileName);
  if (roomId === null) {
    return `Room SVG must match room-<roomId>.svg: ${fileName}`;
  }

  const transforms = new Set<string>();
  const dParts: string[] = [];
  for (const tag of extractDrawableShapes(svgText)) {
    const d = shapeTagToPath(tag);
    if (d === null) {
      return `Unsupported or invalid shape in ${fileName}`;
    }
    dParts.push(d);
    const transform = attr(tag, "transform")?.trim();
    if (transform) {
      transforms.add(transform);
    }
  }

  if (dParts.length === 0) {
    return `Room SVG has no path/polygon/rect geometry: ${fileName}`;
  }
  if (transforms.size > 1) {
    return `Room SVG contains shapes with mixed transforms: ${fileName}`;
  }

  return {
    roomId,
    d: dParts.join(" "),
    transform: transforms.size === 1 ? [...transforms][0] : undefined,
  };
}

export async function generateAuthorSvgFromRoomSvgs(
  packageRoot: string,
  floorId: string,
): Promise<GenerateAuthorSvgFromRoomSvgsResult | null> {
  const roomDir = path.join(packageRoot, roomSvgDirectoryRelativePath(floorId));
  let names: readonly string[];
  try {
    names = await readdir(roomDir);
  } catch {
    return null;
  }

  const roomFiles = names
    .filter((name) => /^room-.+\.svg$/i.test(name))
    .sort((a, b) => a.localeCompare(b, "en"));
  if (roomFiles.length === 0) {
    return null;
  }

  const errors: string[] = [];
  const roomShapes: GeneratedRoomShape[] = [];
  let commonViewBox: string | null = null;

  for (const fileName of roomFiles) {
    const absolute = path.join(roomDir, fileName);
    const svgText = await readFile(absolute, "utf8");
    const viewBox = parseViewBox(svgText);
    if (viewBox === null) {
      errors.push(`Room SVG must declare viewBox: ${fileName}`);
      continue;
    }
    if (commonViewBox === null) {
      commonViewBox = viewBox;
    } else if (commonViewBox !== viewBox) {
      errors.push(
        `Room SVG viewBox mismatch in ${fileName}: expected "${commonViewBox}", got "${viewBox}"`,
      );
      continue;
    }

    const roomShape = buildRoomShape(fileName, svgText);
    if (typeof roomShape === "string") {
      errors.push(roomShape);
      continue;
    }
    roomShapes.push(roomShape);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  if (commonViewBox === null) {
    return { ok: false, errors: [`No room SVG viewBox found for ${floorId}`] };
  }

  const authorSvg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${escapeXml(commonViewBox)}" data-floor="${escapeXml(floorId)}" data-hp003="1">`,
    `  <!-- Generated from ${roomSvgDirectoryRelativePath(floorId)}/room-*.svg. Do not edit by hand. -->`,
    ...roomShapes.map((room) => {
      const transform = room.transform
        ? ` transform="${escapeXml(room.transform)}"`
        : "";
      return `  <path id="${escapeXml(room.roomId)}" data-room="${escapeXml(room.roomId)}"${transform} d="${escapeXml(room.d)}" fill="#f5b900" fill-opacity="0.01" />`;
    }),
    `</svg>`,
    "",
  ].join("\n");

  const authorSvgPath = path.join(packageRoot, authorSvgRelativePath(floorId));
  await writeFile(authorSvgPath, authorSvg, "utf8");
  return {
    ok: true,
    authorSvgPath,
    roomIds: roomShapes.map((room) => room.roomId),
    viewBox: commonViewBox,
  };
}
