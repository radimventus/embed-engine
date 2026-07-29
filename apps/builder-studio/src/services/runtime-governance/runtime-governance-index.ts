import type {
  RuntimeGovernanceIndexEntry,
  RuntimeGovernancePackage,
} from '../../model';

/**
 * RuntimeGovernanceIndex (EPIC-BLD-39).
 */
export type RuntimeGovernanceIndex = {
  index(
    packageId: string,
    pkg: RuntimeGovernancePackage,
  ): RuntimeGovernanceIndexEntry;
  find(evaluationId: string): readonly RuntimeGovernanceIndexEntry[];
  list(packageId?: string): readonly RuntimeGovernanceIndexEntry[];
  rebuild(
    packages: readonly RuntimeGovernancePackage[],
  ): readonly RuntimeGovernanceIndexEntry[];
};

export function createRuntimeGovernanceIndex(): RuntimeGovernanceIndex {
  let entries: RuntimeGovernanceIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next: RuntimeGovernanceIndexEntry = {
        packageId,
        evaluationId: pkg.evaluation.id,
        sessionId: pkg.evaluation.sessionId,
        overallStatus: pkg.evaluation.overallStatus,
        score: pkg.evaluation.score,
      };
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        next,
      ];
      return next;
    },

    find(evaluationId) {
      return entries.filter((item) => item.evaluationId === evaluationId);
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
