/**
 * BU-001 — Presentation staging for SVG / documents (gallery uses gallery.csv).
 * BU-002 can extend this store with order, rename, selection — without redesign.
 */

export type StagedBulkAsset = {
  readonly id: string;
  readonly kind: 'svg' | 'documents';
  readonly fileName: string;
  readonly relativePath: string;
  readonly uploadedAt: string;
};

const STORAGE_PREFIX = 'builder.bulkUpload.v1:';

function storageKey(projectId: string, kind: 'svg' | 'documents'): string {
  return `${STORAGE_PREFIX}${projectId}:${kind}`;
}

function readList(
  projectId: string,
  kind: 'svg' | 'documents',
): StagedBulkAsset[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(projectId, kind));
    if (raw === null) return [];
    const parsed = JSON.parse(raw) as { items?: StagedBulkAsset[] };
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

function writeList(
  projectId: string,
  kind: 'svg' | 'documents',
  items: readonly StagedBulkAsset[],
): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    storageKey(projectId, kind),
    JSON.stringify({ items }),
  );
}

export function listStagedBulkAssets(
  projectId: string,
  kind: 'svg' | 'documents',
): readonly StagedBulkAsset[] {
  return readList(projectId, kind);
}

export function appendStagedBulkAssets(
  projectId: string,
  kind: 'svg' | 'documents',
  assets: readonly StagedBulkAsset[],
): readonly StagedBulkAsset[] {
  const next = [...readList(projectId, kind)];
  for (const asset of assets) {
    if (!next.some((item) => item.relativePath === asset.relativePath)) {
      next.push(asset);
    }
  }
  writeList(projectId, kind, next);
  return next;
}
