import type {
  ArtifactVersionIndexEntry,
  ArtifactVersionPackage,
} from '../../model';

export type ArtifactVersionIndex = {
  index(
    packageId: string,
    pkg: ArtifactVersionPackage,
  ): readonly ArtifactVersionIndexEntry[];
  find(artifactId: string): readonly ArtifactVersionIndexEntry[];
  list(packageId?: string): readonly ArtifactVersionIndexEntry[];
  rebuild(
    packages: readonly ArtifactVersionPackage[],
  ): readonly ArtifactVersionIndexEntry[];
};

export function createArtifactVersionIndex(): ArtifactVersionIndex {
  let entries: ArtifactVersionIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next = pkg.artifactVersions.map((version) => ({
        packageId,
        artifactVersionId: version.id,
        artifactId: version.artifactId,
        version: version.version,
        status: version.status,
        active: version.metadata.active,
      }));
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
