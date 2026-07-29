import type {
  RuntimeBootstrapIndexEntry,
  RuntimeBootstrapPackage,
} from '../../model';

export type RuntimeBootstrapIndex = {
  index(
    packageId: string,
    pkg: RuntimeBootstrapPackage,
  ): readonly RuntimeBootstrapIndexEntry[];
  find(publicationId: string): readonly RuntimeBootstrapIndexEntry[];
  list(packageId?: string): readonly RuntimeBootstrapIndexEntry[];
  rebuild(
    packages: readonly RuntimeBootstrapPackage[],
  ): readonly RuntimeBootstrapIndexEntry[];
};

export function createRuntimeBootstrapIndex(): RuntimeBootstrapIndex {
  let entries: RuntimeBootstrapIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next: RuntimeBootstrapIndexEntry = {
        packageId,
        runtimeSessionId: pkg.runtimeSession.id,
        publicationId: pkg.runtimeSession.publicationId,
        objectId: pkg.runtimeSession.objectId,
        runtimeVersion: pkg.runtimeSession.runtimeVersion,
        bootstrapVersion: pkg.runtimeSession.bootstrapVersion,
        sessionState: pkg.runtimeSession.metadata.sessionState,
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
