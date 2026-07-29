import type {
  RuntimeExtensionIndexEntry,
  RuntimeExtensionPackage,
} from '../../model';

/**
 * RuntimeExtensionIndex (EPIC-BLD-54).
 */
export type RuntimeExtensionIndex = {
  index(
    packageId: string,
    pkg: RuntimeExtensionPackage,
  ): readonly RuntimeExtensionIndexEntry[];
  find(capability: string): readonly RuntimeExtensionIndexEntry[];
  list(packageId?: string): readonly RuntimeExtensionIndexEntry[];
  rebuild(
    packages: readonly RuntimeExtensionPackage[],
  ): readonly RuntimeExtensionIndexEntry[];
};

export function createRuntimeExtensionIndex(): RuntimeExtensionIndex {
  let entries: RuntimeExtensionIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next = pkg.registry.extensions.map(
        (extension): RuntimeExtensionIndexEntry => ({
          packageId,
          registryId: pkg.registry.id,
          extensionId: extension.id,
          name: extension.name,
          capability: extension.capability,
          version: extension.version,
          status: extension.status,
        }),
      );
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        ...next,
      ];
      return next;
    },

    find(capability) {
      return entries.filter((item) => item.capability === capability);
    },

    list(packageId) {
      if (packageId === undefined) {
        return [...entries];
      }
      return entries.filter((item) => item.packageId === packageId);
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
