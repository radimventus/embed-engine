/**
 * BU-001 — Bulk upload kinds (phase 1). Extensible for BU-002 without redesign.
 */

export type BulkUploadKind = 'images' | 'svg' | 'documents';

export type BulkUploadKindConfig = {
  readonly kind: BulkUploadKind;
  readonly title: string;
  readonly description: string;
  readonly accept: string;
  readonly extensions: readonly string[];
  /** Relative folder under active house package. */
  readonly relativeDir: string;
};

export const BULK_UPLOAD_KINDS: Record<BulkUploadKind, BulkUploadKindConfig> = {
  images: {
    kind: 'images',
    title: 'Nahrát více souborů — Obrázky',
    description: 'Vyberte více obrázků najednou (JPG, JPEG, PNG, WEBP).',
    accept: '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp',
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    relativeDir: 'media/gallery',
  },
  svg: {
    kind: 'svg',
    title: 'Nahrát více souborů — SVG',
    description: 'Vyberte více SVG souborů najednou.',
    accept: '.svg,image/svg+xml',
    extensions: ['.svg'],
    relativeDir: 'media/plans',
  },
  documents: {
    kind: 'documents',
    title: 'Nahrát více souborů — Dokumenty',
    description: 'Vyberte více dokumentů najednou (PDF, DOC, DOCX).',
    accept:
      '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['.pdf', '.doc', '.docx'],
    relativeDir: 'media/documents',
  },
};

export function isAllowedBulkExtension(
  kind: BulkUploadKind,
  fileName: string,
): boolean {
  const lower = fileName.toLowerCase();
  return BULK_UPLOAD_KINDS[kind].extensions.some((ext) => lower.endsWith(ext));
}

export function sanitizeBulkFileName(fileName: string): string {
  const base = fileName.split(/[/\\]/).pop() ?? 'file';
  return base.replace(/[^\w.\-()+ ]+/g, '_').replace(/\s+/g, '-');
}
