import type {
  RuntimeRegistryIndexEntry,
  RuntimeRegistryPackage,
} from '../../model';

/**
 * RuntimeRegistryIndex (EPIC-BLD-49).
 */
export type RuntimeRegistryIndex = {
  index(
    registryPackageId: string,
    pkg: RuntimeRegistryPackage,
  ): readonly RuntimeRegistryIndexEntry[];
  find(packageId: string): readonly RuntimeRegistryIndexEntry[];
  list(registryPackageId?: string): readonly RuntimeRegistryIndexEntry[];
  rebuild(
    packages: readonly RuntimeRegistryPackage[],
  ): readonly RuntimeRegistryIndexEntry[];
};

export function createRuntimeRegistryIndex(): RuntimeRegistryIndex {
  let entries: RuntimeRegistryIndexEntry[] = [];

  return {
    index(registryPackageId, pkg) {
      const next = pkg.catalog.entries.map(
        (entry): RuntimeRegistryIndexEntry => ({
          registryPackageId,
          catalogId: pkg.catalog.id,
          entryId: entry.id,
          packageId: entry.packageId,
          packageType: entry.packageType,
          version: entry.version,
          source: entry.source,
        }),
      );
      entries = [
        ...entries.filter(
          (item) => item.registryPackageId !== registryPackageId,
        ),
        ...next,
      ];
      return next;
    },

    find(packageId) {
      return entries.filter((item) => item.packageId === packageId);
    },

    list(registryPackageId) {
      if (registryPackageId === undefined) {
        return [...entries];
      }
      return entries.filter(
        (item) => item.registryPackageId === registryPackageId,
      );
    },

    rebuild(packages) {
      entries = [];
      for (const item of packages) {
        this.index(item.id, item);
      }
      return [...entries];
    },
  };
}
