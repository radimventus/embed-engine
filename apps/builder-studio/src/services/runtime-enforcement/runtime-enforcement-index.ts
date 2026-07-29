import type {
  RuntimeEnforcementIndexEntry,
  RuntimeEnforcementPackage,
} from '../../model';

/**
 * RuntimeEnforcementIndex (EPIC-BLD-41).
 */
export type RuntimeEnforcementIndex = {
  index(
    packageId: string,
    pkg: RuntimeEnforcementPackage,
  ): RuntimeEnforcementIndexEntry;
  find(decisionId: string): readonly RuntimeEnforcementIndexEntry[];
  list(packageId?: string): readonly RuntimeEnforcementIndexEntry[];
  rebuild(
    packages: readonly RuntimeEnforcementPackage[],
  ): readonly RuntimeEnforcementIndexEntry[];
};

export function createRuntimeEnforcementIndex(): RuntimeEnforcementIndex {
  let entries: RuntimeEnforcementIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next: RuntimeEnforcementIndexEntry = {
        packageId,
        decisionId: pkg.decision.id,
        sessionId: pkg.decision.sessionId,
        status: pkg.decision.status,
      };
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        next,
      ];
      return next;
    },

    find(decisionId) {
      return entries.filter((item) => item.decisionId === decisionId);
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
