/**
 * CAP-BLD-05 — run working + disk HP validation into a unified report.
 */

import type { BuilderPackageImportError } from '@embed-engine/object-house/builder-package';

import {
  buildHousePackageValidationReport,
  type HousePackageValidationReport,
} from './housePackageValidationReport';
import { probeHousePackageAssetPaths } from './probeHousePackageAssets';
import { requestHousePackageDiskValidate } from './requestHousePackageDiskValidate';
import type { HousePackageWorkingContent } from './validateHousePackageWorking';
import { validateHousePackageWorking } from './validateHousePackageWorking';

export async function runWorkingHousePackageValidation(
  working: HousePackageWorkingContent,
  options?: {
    readonly dirty?: boolean;
  },
): Promise<HousePackageValidationReport> {
  const existingRelativePaths = await probeHousePackageAssetPaths(working);
  const validation = validateHousePackageWorking(working, {
    existingRelativePaths,
  });

  const warnings =
    options?.dirty === true
      ? [
          {
            type: 'UNSAVED_WORKING_COPY',
            file: '(session)',
            item: 'working-copy',
            description:
              'Working copy differs from disk. Save before Publish to include latest edits.',
            category: 'mandatory' as const,
            editor: 'overview' as const,
          },
        ]
      : [];

  return buildHousePackageValidationReport({
    errors: validation.errors,
    warnings,
    source: 'working',
  });
}

export async function runDiskHousePackageValidation(options?: {
  readonly dirty?: boolean;
}): Promise<HousePackageValidationReport> {
  const result = await requestHousePackageDiskValidate();
  const errors: readonly BuilderPackageImportError[] =
    result.ok === true
      ? result.errors
      : (result.errors ?? [
          {
            code: 'BP_MISSING_FILE',
            message: result.error,
          },
        ]);

  const warnings =
    options?.dirty === true
      ? [
          {
            type: 'UNSAVED_WORKING_COPY',
            file: '(session)',
            item: 'working-copy',
            description:
              'Unsaved Builder edits will not be included until Save. Disk package may still be publishable.',
            category: 'mandatory' as const,
            editor: 'overview' as const,
          },
        ]
      : [];

  return buildHousePackageValidationReport({
    errors,
    warnings,
    source: 'disk',
  });
}
