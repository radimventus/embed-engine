import type {
  RuntimeRecoveryExecutionIndexEntry,
  RuntimeRecoveryExecutionPackage,
} from '../../model';

/**
 * RuntimeRecoveryExecutionIndex (EPIC-BLD-44).
 */
export type RuntimeRecoveryExecutionIndex = {
  index(
    packageId: string,
    pkg: RuntimeRecoveryExecutionPackage,
  ): RuntimeRecoveryExecutionIndexEntry;
  find(executionId: string): readonly RuntimeRecoveryExecutionIndexEntry[];
  list(packageId?: string): readonly RuntimeRecoveryExecutionIndexEntry[];
  rebuild(
    packages: readonly RuntimeRecoveryExecutionPackage[],
  ): readonly RuntimeRecoveryExecutionIndexEntry[];
};

export function createRuntimeRecoveryExecutionIndex(): RuntimeRecoveryExecutionIndex {
  let entries: RuntimeRecoveryExecutionIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next: RuntimeRecoveryExecutionIndexEntry = {
        packageId,
        executionId: pkg.execution.id,
        sequenceId: pkg.execution.sequenceId,
        status: pkg.execution.status,
      };
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        next,
      ];
      return next;
    },

    find(executionId) {
      return entries.filter((item) => item.executionId === executionId);
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
