import type { BuildIssue, ProjectPackage } from '../../model';
import type { PublishValidationResult } from '../../model';

/**
 * Package Validation for Publish (EPIC-BLD-04).
 * Operates on ProjectPackage only — never on Project.
 * Publish may fail when errors are present.
 */
export function validatePackage(
  projectPackage: ProjectPackage | null,
): PublishValidationResult {
  const errors: BuildIssue[] = [];
  const warnings: BuildIssue[] = [];

  if (projectPackage === null) {
    errors.push({
      code: 'PACKAGE_NOT_FOUND',
      severity: 'error',
      message: 'ProjectPackage neexistuje.',
    });
    return { errors, warnings };
  }

  if (projectPackage.packageId.trim().length === 0) {
    errors.push({
      code: 'PACKAGE_ID_MISSING',
      severity: 'error',
      message: 'packageId chybí.',
    });
  }

  if (projectPackage.manifest === undefined || projectPackage.manifest === null) {
    errors.push({
      code: 'MANIFEST_MISSING',
      severity: 'error',
      message: 'Package manifest chybí.',
    });
  } else {
    if (projectPackage.manifest.version.trim().length === 0) {
      errors.push({
        code: 'PACKAGE_VERSION_MISSING',
        severity: 'error',
        message: 'packageVersion / manifest.version chybí.',
      });
    }
    if (projectPackage.manifest.manifestId.trim().length === 0) {
      errors.push({
        code: 'MANIFEST_ID_MISSING',
        severity: 'error',
        message: 'manifestId chybí.',
      });
    }
  }

  const assetCount =
    projectPackage.assets.hero.length +
    projectPackage.assets.photographs.length +
    projectPackage.assets.video.length;

  if (assetCount === 0) {
    errors.push({
      code: 'ASSETS_MISSING',
      severity: 'error',
      message: 'Package neobsahuje žádné assets.',
    });
  }

  if (!projectPackage.publishable) {
    errors.push({
      code: 'BUILD_NOT_SUCCESSFUL',
      severity: 'error',
      message: 'Build neproběhl úspěšně (package není publishable).',
    });
  }

  if (projectPackage.manifest.projectId.trim().length === 0) {
    errors.push({
      code: 'RUNTIME_ENTRY_UNRESOLVABLE',
      severity: 'error',
      message: 'Nelze odvodit runtimeEntry — chybí projectId.',
    });
  }

  if (projectPackage.layouts.svg.length === 0) {
    warnings.push({
      code: 'LAYOUT_SVG_MISSING',
      severity: 'warning',
      message: 'Distribution nemá SVG layout.',
    });
  }

  if (projectPackage.knowledge.length === 0) {
    warnings.push({
      code: 'KNOWLEDGE_EMPTY',
      severity: 'warning',
      message: 'Distribution nemá knowledge dokumenty.',
    });
  }

  return { errors, warnings };
}
