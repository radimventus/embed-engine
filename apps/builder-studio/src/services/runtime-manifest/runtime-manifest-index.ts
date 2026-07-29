import type {
  RuntimeManifestIndexEntry,
  RuntimeManifestPackage,
} from '../../model';

/**
 * RuntimeManifestIndex (EPIC-BLD-50).
 */
export type RuntimeManifestIndex = {
  index(
    packageId: string,
    pkg: RuntimeManifestPackage,
  ): RuntimeManifestIndexEntry;
  find(manifestId: string): readonly RuntimeManifestIndexEntry[];
  list(packageId?: string): readonly RuntimeManifestIndexEntry[];
  rebuild(
    packages: readonly RuntimeManifestPackage[],
  ): readonly RuntimeManifestIndexEntry[];
};

export function createRuntimeManifestIndex(): RuntimeManifestIndex {
  let entries: RuntimeManifestIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next: RuntimeManifestIndexEntry = {
        packageId,
        manifestId: pkg.manifest.id,
        sessionId: pkg.manifest.metadata.sessionId,
        capabilityCount: pkg.manifest.capabilities.length,
        registryVersion: pkg.manifest.registryVersion,
      };
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        next,
      ];
      return next;
    },

    find(manifestId) {
      return entries.filter((item) => item.manifestId === manifestId);
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
