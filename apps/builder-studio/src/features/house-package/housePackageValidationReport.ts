/**
 * CAP-BLD-05 — Validation report over HP-002 via object-house results only.
 * No parallel validator: maps BuilderPackageImportError (+ readiness notes).
 */

import type { BuilderPackageImportError } from '@embed-engine/object-house/builder-package';

import type { HousePackageNavId } from './HousePackageSidebar';
import { HEALABLE_GEOMETRY_CODES } from './productionPublishGate';

export type ValidationSeverity = 'PASS' | 'WARNING' | 'ERROR';

export type ValidationCategoryId =
  | 'manifest'
  | 'rooms'
  | 'gallery'
  | 'videos'
  | 'media'
  | 'plans'
  | 'mandatory'
  | 'missing-assets'
  | 'orphan-refs'
  | 'duplicates';

export type HousePackageValidationIssue = {
  readonly id: string;
  readonly severity: 'WARNING' | 'ERROR';
  readonly category: ValidationCategoryId;
  readonly type: string;
  readonly file: string;
  readonly item: string;
  readonly description: string;
  readonly editor: HousePackageNavId;
};

export type HousePackageValidationPass = {
  readonly id: string;
  readonly category: ValidationCategoryId;
  readonly label: string;
};

export type HousePackageValidationReport = {
  readonly status: 'PASS' | 'WARNING' | 'ERROR';
  readonly errorCount: number;
  readonly warningCount: number;
  readonly passCount: number;
  readonly issues: readonly HousePackageValidationIssue[];
  readonly passes: readonly HousePackageValidationPass[];
  /** Publish gate: true when errorCount === 0 (warnings allowed). */
  readonly canPublish: boolean;
  readonly source: 'working' | 'disk';
  readonly validatedAt: string;
};

const CATEGORY_LABELS: Record<ValidationCategoryId, string> = {
  manifest: 'Manifest',
  rooms: 'rooms.csv',
  gallery: 'gallery.csv',
  videos: 'videos.csv',
  media: 'Media references',
  plans: 'SVG / floorplan',
  mandatory: 'Mandatory fields',
  'missing-assets': 'Missing assets',
  'orphan-refs': 'Orphan references',
  duplicates: 'Duplicate IDs',
};

function categoryForCode(code: string): ValidationCategoryId {
  if (code.startsWith('HP003_')) return 'plans';
  switch (code) {
    case 'BP_DUPLICATE_ORDER':
    case 'BP_DUPLICATE_ROOM':
      return 'duplicates';
    case 'BP_ASSET_MISSING':
      return 'missing-assets';
    case 'BP_UNKNOWN_ROOM':
    case 'BP_UNKNOWN_FLOOR':
      return 'orphan-refs';
    case 'BP_MISSING_FIELD':
    case 'BP_INVALID_TYPE':
    case 'BP_INVALID_CSV':
    case 'BP_INVALID_HERO_COUNT':
      return 'mandatory';
    case 'BP_MISSING_FILE':
      return 'mandatory';
    case 'BP_PLAN_INCOMPLETE':
      return 'plans';
    default:
      return 'mandatory';
  }
}

function categoryForError(error: BuilderPackageImportError): ValidationCategoryId {
  const fromCode = categoryForCode(error.code);
  if (
    fromCode === 'duplicates' ||
    fromCode === 'missing-assets' ||
    fromCode === 'orphan-refs' ||
    fromCode === 'plans'
  ) {
    return fromCode;
  }

  const path = (error.path ?? '').toLowerCase();
  if (path.includes('rooms.csv')) return 'rooms';
  if (path.includes('gallery.csv')) return 'gallery';
  if (path.includes('videos.csv')) return 'videos';
  if (path.includes('manifest')) return 'manifest';
  if (path.includes('media/')) return 'media';
  return fromCode;
}

function editorForPath(path: string, category: ValidationCategoryId): HousePackageNavId {
  const lower = path.toLowerCase();
  if (lower.includes('gallery')) return 'gallery';
  if (lower.includes('videos')) return 'videos';
  if (lower.includes('rooms')) return 'rooms';
  if (lower.includes('manifest') || lower.includes('hero')) return lower.includes('hero') ? 'media' : 'manifest';
  if (lower.includes('plan') || lower.includes('svg') || lower.includes('geometry')) {
    return 'plans';
  }
  if (category === 'gallery') return 'gallery';
  if (category === 'videos') return 'videos';
  if (category === 'rooms') return 'rooms';
  if (category === 'plans' || category === 'media') return category === 'media' ? 'media' : 'plans';
  if (category === 'manifest') return 'manifest';
  return 'overview';
}

function itemFromError(error: BuilderPackageImportError): string {
  const path = error.path ?? '';
  const rowMatch = /:row\s+(\d+)/i.exec(path);
  if (rowMatch) {
    return `row ${rowMatch[1]}`;
  }
  const quoted = /"([^"]+)"/.exec(error.message);
  if (quoted) {
    return quoted[1]!;
  }
  return path.length > 0 ? path : error.code;
}

function fileFromError(error: BuilderPackageImportError): string {
  const path = error.path ?? '';
  if (path.includes('rooms.csv')) return 'rooms.csv';
  if (path.includes('gallery.csv')) return 'gallery.csv';
  if (path.includes('videos.csv')) return 'videos.csv';
  if (path.includes('manifest')) return 'manifest.json';
  if (path.includes('media/')) return path.split(':')[0] ?? path;
  if (path.length > 0) return path.split(':')[0] ?? path;
  return '(package)';
}

/**
 * Build a Builder validation report from object-house import errors + readiness notes.
 */
export function buildHousePackageValidationReport(input: {
  readonly errors: readonly BuilderPackageImportError[];
  readonly warnings?: readonly {
    readonly type: string;
    readonly file: string;
    readonly item: string;
    readonly description: string;
    readonly category: ValidationCategoryId;
    readonly editor: HousePackageNavId;
  }[];
  readonly source: 'working' | 'disk';
  readonly now?: () => Date;
}): HousePackageValidationReport {
  const now = input.now ?? (() => new Date());
  const issues: HousePackageValidationIssue[] = [];

  for (const [index, error] of input.errors.entries()) {
    const category = categoryForError(error);
    const file = fileFromError(error);
    issues.push({
      id: `error-${error.code}-${index}`,
      severity: 'ERROR',
      category,
      type: error.code,
      file,
      item: itemFromError(error),
      description: error.message,
      editor: editorForPath(error.path ?? file, category),
    });
  }

  for (const [index, warning] of (input.warnings ?? []).entries()) {
    issues.push({
      id: `warning-${warning.type}-${index}`,
      severity: 'WARNING',
      category: warning.category,
      type: warning.type,
      file: warning.file,
      item: warning.item,
      description: warning.description,
      editor: warning.editor,
    });
  }

  const erroredCategories = new Set(
    issues.filter((issue) => issue.severity === 'ERROR').map((issue) => issue.category),
  );

  const passes: HousePackageValidationPass[] = (
    Object.keys(CATEGORY_LABELS) as ValidationCategoryId[]
  )
    .filter((category) => !erroredCategories.has(category))
    .map((category) => ({
      id: `pass-${category}`,
      category,
      label: CATEGORY_LABELS[category],
    }));

  const errorCount = issues.filter((issue) => issue.severity === 'ERROR').length;
  const warningCount = issues.filter((issue) => issue.severity === 'WARNING').length;
  const status: HousePackageValidationReport['status'] =
    errorCount > 0 ? 'ERROR' : warningCount > 0 ? 'WARNING' : 'PASS';

  const errorIssues = issues.filter((issue) => issue.severity === 'ERROR');
  const onlyHealableGeometry =
    errorIssues.length > 0 &&
    errorIssues.every((issue) => HEALABLE_GEOMETRY_CODES.has(issue.type));

  return {
    status,
    errorCount,
    warningCount,
    passCount: passes.length,
    issues,
    passes,
    // Healable HP-003 geometry ERRORs still allow Publish (pipeline regenerates).
    canPublish: errorCount === 0 || onlyHealableGeometry,
    source: input.source,
    validatedAt: now().toISOString(),
  };
}

export { CATEGORY_LABELS };
