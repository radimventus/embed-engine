import type {
  ClientPublicationIndexEntry,
  ClientPublicationPackage,
} from '../../model';

export type ClientPublicationIndex = {
  index(
    packageId: string,
    pkg: ClientPublicationPackage,
  ): readonly ClientPublicationIndexEntry[];
  find(objectId: string): readonly ClientPublicationIndexEntry[];
  list(packageId?: string): readonly ClientPublicationIndexEntry[];
  rebuild(
    packages: readonly ClientPublicationPackage[],
  ): readonly ClientPublicationIndexEntry[];
};

export function createClientPublicationIndex(): ClientPublicationIndex {
  let entries: ClientPublicationIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next: ClientPublicationIndexEntry = {
        packageId,
        publicationModelId: pkg.publicationModel.id,
        publicationId: pkg.publicationModel.publicationId,
        objectId: pkg.publicationModel.objectId,
        version: pkg.publicationModel.version,
        status: pkg.publicationModel.metadata.status,
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
