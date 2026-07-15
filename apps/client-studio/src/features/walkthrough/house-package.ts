import type { HousePackageManifest } from '@embed-engine/contracts';
import { resolveHousePackage } from '@embed-engine/kernel';

import manifest from '../../../public/house-package/manifest.json';

export const HOUSE_PACKAGE = resolveHousePackage(manifest as HousePackageManifest);
