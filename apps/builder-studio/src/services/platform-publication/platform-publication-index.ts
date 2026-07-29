import type {
  PlatformPublicationIndexEntry,
  PlatformPublicationPackage,
} from '../../model';

/**
 * PlatformPublicationIndex (EPIC-BLD-57).
 */
export type PlatformPublicationIndex = {
  index(
    packageId: string,
    pkg: PlatformPublicationPackage,
  ): readonly PlatformPublicationIndexEntry[];
  find(objectId: string): readonly PlatformPublicationIndexEntry[];
  list(packageId?: string): readonly PlatformPublicationIndexEntry[];
  rebuild(
    packages: readonly PlatformPublicationPackage[],
  ): readonly PlatformPublicationIndexEntry[];
};

export function createPlatformPublicationIndex(): PlatformPublicationIndex {
  let entries: PlatformPublicationIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next = pkg.snapshot.entries.map(
        (entry): PlatformPublicationIndexEntry => ({
          packageId,
          snapshotId: pkg.snapshot.id,
          entryId: entry.id,
          objectId: entry.objectId,
          publicationVersion: entry.publicationVersion,
          category: entry.category,
          visibility: entry.visibility,
          status: entry.status,
        }),
      );
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        ...next,
      ];
      return next;
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
