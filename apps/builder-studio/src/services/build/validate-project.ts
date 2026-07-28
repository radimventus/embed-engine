import type { ActiveProjectModel } from '../../model';
import type {
  BuildIssue,
  BuildValidationResult,
  CollectedAssets,
} from '../../model';

/**
 * Build Validation (EPIC-BLD-03).
 * Returns errors and warnings. Does not stop the Build pipeline.
 */
export function validateProject(
  project: ActiveProjectModel,
  collected: CollectedAssets,
  manifestId: string,
): BuildValidationResult {
  const errors: BuildIssue[] = [];
  const warnings: BuildIssue[] = [];

  if (manifestId.trim().length === 0) {
    errors.push({
      code: 'MANIFEST_ID_MISSING',
      severity: 'error',
      message: 'Project nemá manifestId.',
    });
  }

  if (project.metadata.title.trim().length === 0) {
    errors.push({
      code: 'METADATA_TITLE_MISSING',
      severity: 'error',
      message: 'Project metadata.title chybí.',
    });
  }

  if (project.metadata.partnerName.trim().length === 0) {
    errors.push({
      code: 'METADATA_PARTNER_MISSING',
      severity: 'error',
      message: 'Project metadata.partnerName chybí.',
    });
  }

  if (collected.hero.length === 0) {
    errors.push({
      code: 'HERO_MISSING',
      severity: 'error',
      message: 'Chybí Hero asset.',
      categoryId: 'hero',
    });
  }

  const layoutCount =
    collected.svg.length +
    collected.floorplan.length +
    collected.csvRooms.length +
    collected.csvImages.length;

  if (layoutCount === 0) {
    errors.push({
      code: 'LAYOUT_MISSING',
      severity: 'error',
      message: 'Chybí alespoň jeden Layout resource.',
    });
  }

  if (collected.photographs.length === 0) {
    warnings.push({
      code: 'PHOTOGRAPHS_EMPTY',
      severity: 'warning',
      message: 'Projekt nemá žádné fotografie.',
      categoryId: 'photographs',
    });
  }

  if (collected.video.length === 0) {
    warnings.push({
      code: 'VIDEO_EMPTY',
      severity: 'warning',
      message: 'Projekt nemá video.',
      categoryId: 'video',
    });
  }

  if (collected.knowledge.length === 0) {
    warnings.push({
      code: 'KNOWLEDGE_EMPTY',
      severity: 'warning',
      message: 'Projekt nemá knowledge dokumenty.',
    });
  }

  if (collected.svg.length === 0) {
    warnings.push({
      code: 'SVG_EMPTY',
      severity: 'warning',
      message: 'Chybí SVG pro House Navigator.',
      categoryId: 'svg',
    });
  }

  const erroredCollections = [
    ...project.assets.media,
    ...project.assets.layout,
    ...project.assets.knowledge,
  ].filter((collection) => collection.state === 'Error');

  for (const collection of erroredCollections) {
    warnings.push({
      code: 'ASSET_CATEGORY_ERROR_STATE',
      severity: 'warning',
      message: `Kategorie ${collection.title} je ve stavu Error.`,
      categoryId: collection.categoryId,
    });
  }

  return { errors, warnings };
}
