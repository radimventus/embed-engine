/**
 * CAP-BLD-03 — revalidate working HP-002 texts via object-house only.
 */

import {
  buildBuilderPackageRegistries,
  parseCsv,
  type BuilderHousePackageImport,
  type BuilderPackageImportError,
} from '@embed-engine/object-house/builder-package';

import type { HousePackageMountTexts } from './mountHousePackage';
import { HOUSE_PACKAGE_URL_ROOT } from './housePackagePaths';

export type HousePackageWorkingContent = HousePackageMountTexts & {
  readonly heroRelativePath: string;
};

export type HousePackageValidation = {
  readonly ok: boolean;
  readonly errors: readonly BuilderPackageImportError[];
  readonly builderImport: BuilderHousePackageImport | null;
};

export function planPairsFromRooms(roomsCsvText: string): {
  readonly floorId: string;
  readonly rasterRelativePath: string;
  readonly svgRelativePath: string;
}[] {
  const table = parseCsv(roomsCsvText);
  const floors = new Set<string>();
  for (const row of table.rows) {
    const floor = row.floor?.trim();
    if (floor) {
      floors.add(floor);
    }
  }

  return [...floors]
    .sort((a, b) => a.localeCompare(b, 'en'))
    .map((floorId) => ({
      floorId,
      rasterRelativePath: `media/plans/${floorId}.webp`,
      svgRelativePath: `media/plans/${floorId}.svg`,
    }));
}

/**
 * Validate in-memory HP CSV/manifest texts with object-house registries.
 */
export function validateHousePackageWorking(
  working: HousePackageWorkingContent,
): HousePackageValidation {
  const result = buildBuilderPackageRegistries({
    packageRoot: HOUSE_PACKAGE_URL_ROOT,
    galleryCsv: working.galleryCsv,
    roomsCsv: working.roomsCsv,
    videosCsv: working.videosCsv,
    heroPath: working.heroRelativePath,
    planPairs: planPairsFromRooms(working.roomsCsv),
  });

  if (!result.ok) {
    return { ok: false, errors: result.errors, builderImport: null };
  }

  return { ok: true, errors: [], builderImport: result.result };
}

export type HpEditSection =
  | 'rooms'
  | 'gallery'
  | 'videos'
  | 'manifest'
  | 'hero'
  | 'plans';

const SECTION_LOCATION: Record<HpEditSection, readonly string[]> = {
  rooms: ['rooms.csv'],
  gallery: ['gallery.csv'],
  videos: ['videos.csv'],
  manifest: ['manifest'],
  hero: ['hero', 'media/hero'],
  plans: ['media/plans', 'plan'],
};

export function dirtySections(
  baseline: HousePackageWorkingContent,
  working: HousePackageWorkingContent,
): readonly HpEditSection[] {
  const dirty: HpEditSection[] = [];
  if (baseline.roomsCsv !== working.roomsCsv) dirty.push('rooms');
  if (baseline.galleryCsv !== working.galleryCsv) dirty.push('gallery');
  if (baseline.videosCsv !== working.videosCsv) dirty.push('videos');
  if ((baseline.manifestJson ?? '') !== (working.manifestJson ?? '')) {
    dirty.push('manifest');
  }
  if (baseline.heroRelativePath !== working.heroRelativePath) dirty.push('hero');
  if (baseline.roomsCsv !== working.roomsCsv) {
    // Floor/plan pairs derive from rooms.csv
    if (!dirty.includes('plans')) dirty.push('plans');
  }
  return dirty;
}

/** Errors whose location touches a dirty section (incremental surface). */
export function errorsForDirtySections(
  errors: readonly BuilderPackageImportError[],
  sections: readonly HpEditSection[],
): readonly BuilderPackageImportError[] {
  if (sections.length === 0) {
    return errors;
  }
  const needles = sections.flatMap((section) => SECTION_LOCATION[section]);
  return errors.filter((error) => {
    const loc = (error.path ?? '').toLowerCase();
    const message = error.message.toLowerCase();
    return needles.some(
      (needle) => loc.includes(needle.toLowerCase()) || message.includes(needle.toLowerCase()),
    );
  });
}
