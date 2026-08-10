/**
 * CAP-BLD-04 — build object-house persist payload from dirty HP working copy.
 * Browser-safe (no node:fs import).
 */

import type { HousePackageWorkingContent } from './validateHousePackageWorking';
import { dirtySections, type HpEditSection } from './validateHousePackageWorking';
import type { ExperienceHeroCopy } from '@embed-engine/model';

const HERO_MANIFEST_KEY = 'heroRelativePath';

/** Mirrors PersistBuilderHousePackageFiles from object-house (browser-safe). */
export type HousePackagePersistFiles = {
  readonly roomsCsv?: string;
  readonly galleryCsv?: string;
  readonly videosCsv?: string;
  readonly manifestJson?: string | null;
};

/**
 * Merge preferred hero path into existing auxiliary manifest.json (hero metadata).
 * Does not invent a new package file — uses HP manifest.json only.
 */
export function mergeHeroIntoManifestJson(
  manifestJson: string | null,
  heroRelativePath: string,
  heroCopy: ExperienceHeroCopy | null,
): string {
  let parsed: Record<string, unknown> = {};
  if (manifestJson !== null && manifestJson.trim().length > 0) {
    try {
      const value = JSON.parse(manifestJson) as unknown;
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        parsed = { ...(value as Record<string, unknown>) };
      }
    } catch {
      parsed = {};
    }
  }
  parsed[HERO_MANIFEST_KEY] = heroRelativePath;
  if (heroCopy !== null) {
    parsed.heroCopy = heroCopy;
  }
  return `${JSON.stringify(parsed, null, 2)}\n`;
}

export function readHeroRelativePathFromManifest(
  manifestJson: string | null,
): string | null {
  if (manifestJson === null || manifestJson.trim().length === 0) {
    return null;
  }
  try {
    const value = JSON.parse(manifestJson) as unknown;
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof (value as Record<string, unknown>)[HERO_MANIFEST_KEY] === 'string'
    ) {
      const pathValue = (
        (value as Record<string, unknown>)[HERO_MANIFEST_KEY] as string
      ).trim();
      return pathValue.length > 0 ? pathValue : null;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Map dirty sections → files for persistBuilderHousePackage (changed only).
 */
export function buildPersistFiles(
  baseline: HousePackageWorkingContent,
  working: HousePackageWorkingContent,
): {
  readonly files: HousePackagePersistFiles;
  readonly dirty: readonly HpEditSection[];
} {
  const dirty = dirtySections(baseline, working);
  const files: {
    roomsCsv?: string;
    galleryCsv?: string;
    videosCsv?: string;
    manifestJson?: string | null;
  } = {};

  if (dirty.includes('rooms')) {
    files.roomsCsv = working.roomsCsv;
  }
  if (dirty.includes('gallery')) {
    files.galleryCsv = working.galleryCsv;
  }
  if (dirty.includes('videos')) {
    files.videosCsv = working.videosCsv;
  }

  const manifestDirty =
    dirty.includes('manifest') || dirty.includes('hero');
  if (manifestDirty) {
    files.manifestJson = dirty.includes('hero')
      ? mergeHeroIntoManifestJson(
          working.manifestJson,
          working.heroRelativePath,
          working.heroCopy,
        )
      : working.manifestJson;
  }

  return { files, dirty };
}
