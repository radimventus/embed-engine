import type {
  ArtifactExportIndexEntry,
  ArtifactExportPackage,
} from '../../model';

export type ArtifactExportIndex = {
  index(
    packageId: string,
    pkg: ArtifactExportPackage,
  ): readonly ArtifactExportIndexEntry[];
  find(artifactId: string): readonly ArtifactExportIndexEntry[];
  list(packageId?: string): readonly ArtifactExportIndexEntry[];
  rebuild(
    packages: readonly ArtifactExportPackage[],
  ): readonly ArtifactExportIndexEntry[];
};

export function createArtifactExportIndex(): ArtifactExportIndex {
  let entries: ArtifactExportIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next = [
        {
          packageId,
          artifactId: pkg.exportModel.artifactId,
          artifactType: pkg.exportModel.artifactType,
          exportVersion: pkg.exportModel.exportVersion,
          schemaVersion: pkg.exportModel.schemaVersion,
          status: pkg.metadata.status,
        },
      ];
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        ...next,
      ];
      return next;
    },

    find(artifactId) {
      return entries.filter((item) => item.artifactId === artifactId);
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
