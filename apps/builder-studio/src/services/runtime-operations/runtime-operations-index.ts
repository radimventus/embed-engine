import type {
  RuntimeOperationsIndexEntry,
  RuntimeOperationsPackage,
} from '../../model';

/**
 * RuntimeOperationsIndex (EPIC-BLD-47).
 */
export type RuntimeOperationsIndex = {
  index(
    packageId: string,
    pkg: RuntimeOperationsPackage,
  ): RuntimeOperationsIndexEntry;
  find(snapshotId: string): readonly RuntimeOperationsIndexEntry[];
  list(packageId?: string): readonly RuntimeOperationsIndexEntry[];
  rebuild(
    packages: readonly RuntimeOperationsPackage[],
  ): readonly RuntimeOperationsIndexEntry[];
};

export function createRuntimeOperationsIndex(): RuntimeOperationsIndex {
  let entries: RuntimeOperationsIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next: RuntimeOperationsIndexEntry = {
        packageId,
        snapshotId: pkg.snapshot.id,
        sessionId: pkg.snapshot.metadata.sessionId,
        recoveryStatus: pkg.snapshot.recoveryStatus,
      };
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        next,
      ];
      return next;
    },

    find(snapshotId) {
      return entries.filter((item) => item.snapshotId === snapshotId);
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
