import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { HousePackage } from '@embed-engine/object-house';
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

/** Load HP-002 CSVs from disk for Node unit tests (mirrors HTTP public paths). */
export function installBuilderPackageRegistriesForTests(): void {
  resetBuilderPackageBootstrapForTests();
  bootstrapBuilderPackageRegistriesSyncForTests({
    galleryCsv: readFileSync(join(packageRoot, 'gallery.csv'), 'utf8'),
    roomsCsv: readFileSync(join(packageRoot, 'rooms.csv'), 'utf8'),
    videosCsv: readFileSync(join(packageRoot, 'videos.csv'), 'utf8'),
  });
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
