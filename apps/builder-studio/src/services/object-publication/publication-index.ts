import type {
  PublicationIndexEntry,
  PublicationPackage,
} from '../../model';

/**
 * PublicationIndex (EPIC-BLD-55).
 */
export type PublicationIndex = {
  index(
    packageId: string,
    pkg: PublicationPackage,
  ): readonly PublicationIndexEntry[];
  find(objectId: string): readonly PublicationIndexEntry[];
  list(packageId?: string): readonly PublicationIndexEntry[];
  rebuild(
    packages: readonly PublicationPackage[],
  ): readonly PublicationIndexEntry[];
};

export function createPublicationIndex(): PublicationIndex {
  let entries: PublicationIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next: PublicationIndexEntry = {
        packageId,
        objectPackageId: pkg.objectPackage.id,
        objectId: pkg.objectPackage.objectId,
        version: pkg.objectPackage.version,
        status: pkg.metadata.status,
        checksum: pkg.objectPackage.checksum,
      };
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        next,
      ];
      return [next];
    },

    find(objectId) {
      return entries.filter((item) => item.objectId === objectId);
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
