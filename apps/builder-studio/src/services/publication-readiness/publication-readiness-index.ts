import type {
  PublicationReadinessIndexEntry,
  PublicationReadinessPackage,
} from '../../model';

export type PublicationReadinessIndex = {
  index(
    packageId: string,
    pkg: PublicationReadinessPackage,
  ): readonly PublicationReadinessIndexEntry[];
  find(publicationId: string): readonly PublicationReadinessIndexEntry[];
  list(packageId?: string): readonly PublicationReadinessIndexEntry[];
  rebuild(
    packages: readonly PublicationReadinessPackage[],
  ): readonly PublicationReadinessIndexEntry[];
};

export function createPublicationReadinessIndex(): PublicationReadinessIndex {
  let entries: PublicationReadinessIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next: PublicationReadinessIndexEntry = {
        packageId,
        reportId: pkg.report.id,
        publicationId: pkg.report.publicationId,
        objectId: pkg.report.metadata.objectId,
        status: pkg.report.status,
      };
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        next,
      ];
      return [next];
    },

    find(publicationId) {
      return entries.filter((item) => item.publicationId === publicationId);
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
