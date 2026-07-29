import type {
  RuntimeRecoveryCoordinatorIndexEntry,
  RuntimeRecoverySummaryPackage,
} from '../../model';

/**
 * RuntimeRecoveryCoordinatorIndex (EPIC-BLD-45).
 */
export type RuntimeRecoveryCoordinatorIndex = {
  index(
    packageId: string,
    pkg: RuntimeRecoverySummaryPackage,
  ): RuntimeRecoveryCoordinatorIndexEntry;
  find(
    recoverySessionId: string,
  ): readonly RuntimeRecoveryCoordinatorIndexEntry[];
  list(packageId?: string): readonly RuntimeRecoveryCoordinatorIndexEntry[];
  rebuild(
    packages: readonly RuntimeRecoverySummaryPackage[],
  ): readonly RuntimeRecoveryCoordinatorIndexEntry[];
};

export function createRuntimeRecoveryCoordinatorIndex(): RuntimeRecoveryCoordinatorIndex {
  let entries: RuntimeRecoveryCoordinatorIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next: RuntimeRecoveryCoordinatorIndexEntry = {
        packageId,
        recoverySessionId: pkg.session.id,
        sessionId: pkg.session.metadata.sessionId,
        status: pkg.session.status,
      };
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        next,
      ];
      return next;
    },

    find(recoverySessionId) {
      return entries.filter(
        (item) => item.recoverySessionId === recoverySessionId,
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
