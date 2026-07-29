import type {
  RuntimeResilienceIndexEntry,
  RuntimeResiliencePackage,
} from '../../model';

/**
 * RuntimeResilienceIndex (EPIC-BLD-42).
 */
export type RuntimeResilienceIndex = {
  index(
    packageId: string,
    pkg: RuntimeResiliencePackage,
  ): RuntimeResilienceIndexEntry;
  find(planId: string): readonly RuntimeResilienceIndexEntry[];
  list(packageId?: string): readonly RuntimeResilienceIndexEntry[];
  rebuild(
    packages: readonly RuntimeResiliencePackage[],
  ): readonly RuntimeResilienceIndexEntry[];
};

export function createRuntimeResilienceIndex(): RuntimeResilienceIndex {
  let entries: RuntimeResilienceIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next: RuntimeResilienceIndexEntry = {
        packageId,
        planId: pkg.recoveryPlan.id,
        sessionId: pkg.recoveryPlan.sessionId,
        recoveryStrategy: pkg.recoveryPlan.recoveryStrategy,
      };
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        next,
      ];
      return next;
    },

    find(planId) {
      return entries.filter((item) => item.planId === planId);
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
