import type {
  MetadataIndexEntry,
  MetadataPackage,
} from '../../model';

export type MetadataIndex = {
  index(packageId: string, pkg: MetadataPackage): readonly MetadataIndexEntry[];
  find(metadataId: string): MetadataIndexEntry | null;
  list(): readonly MetadataIndexEntry[];
  findBySlug(slug: string): MetadataIndexEntry | null;
  rebuild(packages: readonly MetadataPackage[]): readonly MetadataIndexEntry[];
};

export function createMetadataIndex(): MetadataIndex {
  let entries: MetadataIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next: MetadataIndexEntry = {
        packageId,
        metadataId: pkg.objectMetadata.id,
        projectId: pkg.objectMetadata.projectId,
        slug: pkg.objectMetadata.slug,
        title: pkg.objectMetadata.title,
        status: pkg.objectMetadata.status,
        updatedAt: pkg.objectMetadata.updatedAt,
      };
      entries = [
        ...entries.filter((entry) => entry.packageId !== packageId),
        next,
      ].sort((left, right) => left.slug.localeCompare(right.slug));
      return [next];
    },

    find(metadataId) {
      return entries.find((entry) => entry.metadataId === metadataId) ?? null;
    },

    list() {
      return [...entries];
    },

    findBySlug(slug) {
      return entries.find((entry) => entry.slug === slug) ?? null;
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
