import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { HousePackage } from '@embed-engine/object-house';
import {
  isFloorPlanGeometry,
  type FloorPlanGeometry,
} from '@embed-engine/object-house/builder-package';
import {
  createFixedClock,
  createDecisionSessionRuntime,
  type DecisionSessionRuntime,
} from '@embed-engine/runtime';

import {
  bootstrapBuilderPackageRegistriesSyncForTests,
  getBuilderRuntimeHousePackage,
  resetBuilderPackageBootstrapForTests,
} from './builderPackageBootstrap';

const packageRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../public/house-package',
);

function loadFloorPlanGeometryByFloorFromDisk(): Readonly<
  Record<string, FloorPlanGeometry>
> {
  const plansDir = join(packageRoot, 'media/plans');
  const byFloor: Record<string, FloorPlanGeometry> = {};
  for (const name of readdirSync(plansDir)) {
    const match = /^(p\d+)\.geometry\.json$/i.exec(name);
    if (match === null) {
      continue;
    }
    const floorId = match[1]!.toLowerCase();
    const parsed: unknown = JSON.parse(
      readFileSync(join(plansDir, name), 'utf8'),
    );
    if (!isFloorPlanGeometry(parsed)) {
      throw new Error(`Invalid HP-003 geometry at media/plans/${name}`);
    }
    const geometry = parsed as FloorPlanGeometry;
    if (geometry.floorId !== floorId) {
      throw new Error(
        `HP-003 floorId mismatch in ${name}: expected ${floorId}, got ${geometry.floorId}`,
      );
    }
    byFloor[floorId] = geometry;
  }
  return byFloor;
}

/** Load HP-002 CSVs + HP-003 geometry from disk for Node unit tests. */
export function installBuilderPackageRegistriesForTests(): void {
  resetBuilderPackageBootstrapForTests();
  bootstrapBuilderPackageRegistriesSyncForTests(
    {
      galleryCsv: readFileSync(join(packageRoot, 'gallery.csv'), 'utf8'),
      roomsCsv: readFileSync(join(packageRoot, 'rooms.csv'), 'utf8'),
      videosCsv: readFileSync(join(packageRoot, 'videos.csv'), 'utf8'),
    },
    loadFloorPlanGeometryByFloorFromDisk(),
  );
}

export function getTestBuilderHousePackage(): HousePackage {
  installBuilderPackageRegistriesForTests();
  return getBuilderRuntimeHousePackage();
}

export function createTestBuilderRuntime(now = 1): DecisionSessionRuntime {
  return createDecisionSessionRuntime({
    housePackage: getTestBuilderHousePackage(),
    clock: createFixedClock(now),
    now,
  });
}
