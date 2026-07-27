import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { buildBuilderPackageRegistries } from "./buildRegistries";
import {
  bpError,
  type BuilderPackageImportError,
  type BuilderPackageImportResult,
} from "./errors";

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readUtf8(filePath: string): Promise<string | undefined> {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return undefined;
  }
}

function packageRelative(packageRoot: string, absolutePath: string): string {
  return path.relative(packageRoot, absolutePath).split(path.sep).join("/");
}

async function discoverPlanPairs(
  packageRoot: string,
  errors: BuilderPackageImportError[],
): Promise<
  readonly {
    readonly floorId: string;
    readonly rasterRelativePath: string;
    readonly svgRelativePath: string;
  }[]
> {
  const plansDir = path.join(packageRoot, "media", "plans");
  if (!(await pathExists(plansDir))) {
    errors.push(bpError("BP_MISSING_FILE", "Missing media/plans/ directory.", "media/plans/"));
    return [];
  }

  const names = await readdir(plansDir);
  const basenames = new Set<string>();

  for (const name of names) {
    const match = /^(p\d+)\.(png|webp|svg)$/i.exec(name);
    if (!match) {
      continue;
    }
    basenames.add(match[1]!.toLowerCase());
  }

  const floors = [...basenames].sort((a, b) => a.localeCompare(b, "en"));
  const pairs = [];

  for (const floorId of floors) {
    const svgName = `${floorId}.svg`;
    const svgPath = path.join(plansDir, svgName);
    const webpPath = path.join(plansDir, `${floorId}.webp`);
    const pngPath = path.join(plansDir, `${floorId}.png`);

    const hasSvg = await pathExists(svgPath);
    const hasWebp = await pathExists(webpPath);
    const hasPng = await pathExists(pngPath);

    if (!hasSvg || (!hasWebp && !hasPng)) {
      errors.push(
        bpError(
          "BP_PLAN_INCOMPLETE",
          `Floor ${floorId} requires ${floorId}.svg and ${floorId}.webp (or .png).`,
          `media/plans/${floorId}`,
        ),
      );
      continue;
    }

    const rasterAbsolute = hasWebp ? webpPath : pngPath;
    pairs.push({
      floorId,
      rasterRelativePath: packageRelative(packageRoot, rasterAbsolute),
      svgRelativePath: packageRelative(packageRoot, svgPath),
    });
  }

  return pairs;
}

async function collectExistingPaths(packageRoot: string): Promise<Set<string>> {
  const existing = new Set<string>();
  const queue = [packageRoot];

  while (queue.length > 0) {
    const current = queue.pop()!;
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(absolute);
        continue;
      }
      existing.add(packageRelative(packageRoot, absolute));
    }
  }

  return existing;
}

async function resolveHeroPath(
  packageRoot: string,
  errors: BuilderPackageImportError[],
): Promise<string | undefined> {
  const heroDir = path.join(packageRoot, "media", "hero");
  const preferredPng = path.join(heroDir, "hero.png");
  if (await pathExists(preferredPng)) {
    return packageRelative(packageRoot, preferredPng);
  }

  const preferredWebp = path.join(heroDir, "hero.webp");
  if (await pathExists(preferredWebp)) {
    return packageRelative(packageRoot, preferredWebp);
  }

  if (!(await pathExists(heroDir))) {
    errors.push(bpError("BP_MISSING_FILE", "Missing media/hero/ directory.", "media/hero/"));
    return undefined;
  }

  const names = await readdir(heroDir);
  const media = names.find((name) => /\.(webp|jpg|jpeg|png|mp4|webm)$/i.test(name));
  if (media === undefined) {
    errors.push(
      bpError("BP_ASSET_MISSING", "No Hero media file under media/hero/.", "media/hero/"),
    );
    return undefined;
  }

  return packageRelative(packageRoot, path.join(heroDir, media));
}

/**
 * Import an HP-002 Builder House Package from disk and generate Runtime registries.
 * Does not write files — returns in-memory registries for callers to persist.
 */
export async function importBuilderHousePackage(
  packageRoot: string,
): Promise<BuilderPackageImportResult> {
  const root = path.resolve(packageRoot);
  const errors: BuilderPackageImportError[] = [];

  const roomsCsvPath = path.join(root, "rooms.csv");
  const galleryCsvPath = path.join(root, "gallery.csv");
  const videosCsvPath = path.join(root, "videos.csv");

  for (const [absolute, relative] of [
    [roomsCsvPath, "rooms.csv"],
    [galleryCsvPath, "gallery.csv"],
    [videosCsvPath, "videos.csv"],
  ] as const) {
    if (!(await pathExists(absolute))) {
      errors.push(bpError("BP_MISSING_FILE", `Missing required file: ${relative}`, relative));
    }
  }

  const roomsText = await readUtf8(roomsCsvPath);
  const galleryText = await readUtf8(galleryCsvPath);
  const videosText = await readUtf8(videosCsvPath);
  const heroPath = await resolveHeroPath(root, errors);
  const planPairs = await discoverPlanPairs(root, errors);

  if (errors.length > 0 || !roomsText || !galleryText || !videosText || heroPath === undefined) {
    if (!roomsText || !galleryText || !videosText) {
      errors.push(bpError("BP_MISSING_FILE", "Failed to read one or more required CSV files."));
    }
    return { ok: false, errors };
  }

  const existingRelativePaths = await collectExistingPaths(root);

  return buildBuilderPackageRegistries({
    packageRoot: root,
    galleryCsv: galleryText,
    roomsCsv: roomsText,
    videosCsv: videosText,
    heroPath,
    planPairs,
    existingRelativePaths,
  });
}
