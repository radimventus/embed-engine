import type {
  PublishedObjectIndexEntry,
  PublishedObjectPackage,
} from '../../model';

/**
 * PublishedObjectIndex (EPIC-BLD-56).
 */
export type PublishedObjectIndex = {
  index(
    packageId: string,
    pkg: PublishedObjectPackage,
  ): readonly PublishedObjectIndexEntry[];
  find(objectId: string): readonly PublishedObjectIndexEntry[];
  list(packageId?: string): readonly PublishedObjectIndexEntry[];
  rebuild(
    packages: readonly PublishedObjectPackage[],
  ): readonly PublishedObjectIndexEntry[];
};

export function createPublishedObjectIndex(): PublishedObjectIndex {
  let entries: PublishedObjectIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next = pkg.catalog.objects.map(
        (object): PublishedObjectIndexEntry => ({
          packageId,
          catalogId: pkg.catalog.id,
          publishedObjectId: object.id,
          objectId: object.objectId,
          version: object.version,
          publicationVersion: object.publicationVersion,
          status: object.status,
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
