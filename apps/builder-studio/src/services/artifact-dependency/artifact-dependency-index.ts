import type {
  ArtifactDependencyIndexEntry,
  ArtifactDependencyPackage,
} from '../../model';

export type ArtifactDependencyIndex = {
  index(
    packageId: string,
    pkg: ArtifactDependencyPackage,
  ): readonly ArtifactDependencyIndexEntry[];
  find(artifactId: string): readonly ArtifactDependencyIndexEntry[];
  list(packageId?: string): readonly ArtifactDependencyIndexEntry[];
  rebuild(
    packages: readonly ArtifactDependencyPackage[],
  ): readonly ArtifactDependencyIndexEntry[];
};

export function createArtifactDependencyIndex(): ArtifactDependencyIndex {
  let entries: ArtifactDependencyIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next = pkg.dependencies.map((dependency) => ({
        packageId,
        dependencyId: dependency.id,
        sourceArtifactId: dependency.sourceArtifactId,
        targetArtifactId: dependency.targetArtifactId,
        dependencyType: dependency.dependencyType,
        status: dependency.status,
      }));
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        ...next,
      ];
      return next;
    },

    find(artifactId) {
      return entries.filter(
        (item) =>
          item.sourceArtifactId === artifactId || item.targetArtifactId === artifactId,
      );
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
