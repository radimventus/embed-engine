import type {
  Asset,
  AssetIndexEntry,
  AssetPackage,
  AssetType,
} from '../../model';

export type AssetIndex = {
  index(packageId: string, pkg: AssetPackage): readonly AssetIndexEntry[];
  find(assetId: string): AssetIndexEntry | null;
  list(packageId?: string): readonly AssetIndexEntry[];
  listByProject(projectId: string): readonly AssetIndexEntry[];
  listByType(type: AssetType): readonly AssetIndexEntry[];
  rebuild(packages: readonly AssetPackage[]): readonly AssetIndexEntry[];
};

function toEntries(
  packageId: string,
  assets: readonly Asset[],
): readonly AssetIndexEntry[] {
  return assets.map((asset) => ({
    packageId,
    assetId: asset.id,
    projectId: asset.projectId,
    name: asset.name,
    type: asset.type,
    provider: asset.location.provider,
    status: asset.status,
    updatedAt: asset.updatedAt,
  }));
}

export function createAssetIndex(): AssetIndex {
  let entries: AssetIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next = toEntries(packageId, pkg.assets);
      entries = [
        ...entries.filter((entry) => entry.packageId !== packageId),
        ...next,
      ].sort((left, right) => left.assetId.localeCompare(right.assetId));
      return next;
    },

    find(assetId) {
      return entries.find((entry) => entry.assetId === assetId) ?? null;
    },

    list(packageId) {
      if (packageId === undefined) return [...entries];
      return entries.filter((entry) => entry.packageId === packageId);
    },

    listByProject(projectId) {
      return entries.filter((entry) => entry.projectId === projectId);
    },

    listByType(type) {
      return entries.filter((entry) => entry.type === type);
    },

    rebuild(packages) {
      entries = [];
      for (const pkg of packages) {
        this.index(pkg.id, pkg);
      }
      return [...entries];
    },
  };
}
