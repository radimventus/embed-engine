import type {
  RuntimeRecoveryIndexEntry,
  RuntimeRecoveryPackage,
} from '../../model';

/**
 * RuntimeRecoveryIndex (EPIC-BLD-43).
 */
export type RuntimeRecoveryIndex = {
  index(
    packageId: string,
    pkg: RuntimeRecoveryPackage,
  ): RuntimeRecoveryIndexEntry;
  find(sequenceId: string): readonly RuntimeRecoveryIndexEntry[];
  list(packageId?: string): readonly RuntimeRecoveryIndexEntry[];
  rebuild(
    packages: readonly RuntimeRecoveryPackage[],
  ): readonly RuntimeRecoveryIndexEntry[];
};

export function createRuntimeRecoveryIndex(): RuntimeRecoveryIndex {
  let entries: RuntimeRecoveryIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next: RuntimeRecoveryIndexEntry = {
        packageId,
        sequenceId: pkg.sequence.id,
        sessionId: pkg.sequence.metadata.sessionId,
        riskLevel: pkg.sequence.riskLevel,
      };
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        next,
      ];
      return next;
    },

    find(sequenceId) {
      return entries.filter((item) => item.sequenceId === sequenceId);
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
