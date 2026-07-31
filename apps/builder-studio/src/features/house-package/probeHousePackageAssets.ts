/**
 * CAP-BLD-05 — probe HP-002 asset paths for object-house existingRelativePaths.
 */

import { parseCsv } from '@embed-engine/object-house/builder-package';

import { HOUSE_PACKAGE_URL_ROOT } from './housePackagePaths';
import { planPairsFromRooms } from './validateHousePackageWorking';
import type { HousePackageWorkingContent } from './validateHousePackageWorking';

async function probeExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { cache: 'no-store', method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Collect package-relative paths that exist under /house-package for registry checks.
 */
export async function probeHousePackageAssetPaths(
  working: HousePackageWorkingContent,
): Promise<ReadonlySet<string>> {
  const candidates = new Set<string>();
  candidates.add(working.heroRelativePath);

  for (const pair of planPairsFromRooms(working.roomsCsv)) {
    candidates.add(pair.rasterRelativePath);
    candidates.add(pair.svgRelativePath);
    candidates.add(`media/plans/${pair.floorId}.author.svg`);
    candidates.add(`media/plans/${pair.floorId}.geometry.json`);
    candidates.add(`media/plans/${pair.floorId}.png`);
  }

  const gallery = parseCsv(working.galleryCsv);
  for (const row of gallery.rows) {
    const file = row.file?.trim();
    if (file) {
      candidates.add(`media/gallery/${file}`);
    }
  }

  const existing = new Set<string>();
  await Promise.all(
    [...candidates].map(async (relative) => {
      const ok = await probeExists(`${HOUSE_PACKAGE_URL_ROOT}/${relative}`);
      if (ok) {
        existing.add(relative);
      }
    }),
  );
  return existing;
}
