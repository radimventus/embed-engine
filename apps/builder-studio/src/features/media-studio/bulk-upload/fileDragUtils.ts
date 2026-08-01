/**
 * BU-002 — Detect OS file drags and filter by bulk upload kind.
 */

import {
  isAllowedBulkExtension,
  type BulkUploadKind,
} from './bulkUploadKinds';

export function dataTransferHasFiles(dataTransfer: DataTransfer | null): boolean {
  if (dataTransfer === null) return false;
  return Array.from(dataTransfer.types).includes('Files');
}

export function countFileDragItems(dataTransfer: DataTransfer | null): number {
  if (dataTransfer === null) return 0;
  return Array.from(dataTransfer.items ?? []).filter(
    (item) => item.kind === 'file',
  ).length;
}

export function filesFromDataTransfer(
  dataTransfer: DataTransfer | null,
  kind: BulkUploadKind,
): File[] {
  if (dataTransfer === null) return [];
  const list = dataTransfer.files;
  if (list === null || list.length === 0) return [];
  return Array.from(list).filter((file) =>
    isAllowedBulkExtension(kind, file.name),
  );
}

export function firstImagePreviewUrl(
  dataTransfer: DataTransfer | null,
): string | null {
  if (dataTransfer === null || typeof URL === 'undefined') return null;
  for (const item of Array.from(dataTransfer.items ?? [])) {
    if (item.kind !== 'file') continue;
    if (!item.type.startsWith('image/')) continue;
    const file = item.getAsFile();
    if (file === null) continue;
    return URL.createObjectURL(file);
  }
  const files = dataTransfer.files;
  if (files !== null) {
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
    }
  }
  return null;
}
