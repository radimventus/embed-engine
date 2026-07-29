import type {
  RuntimeHealthIndexEntry,
  RuntimeHealthPackage,
} from '../../model';

/**
 * RuntimeHealthIndex (EPIC-BLD-37).
 */
export type RuntimeHealthIndex = {
  index(
    packageId: string,
    pkg: RuntimeHealthPackage,
  ): RuntimeHealthIndexEntry;
  find(reportId: string): readonly RuntimeHealthIndexEntry[];
  list(packageId?: string): readonly RuntimeHealthIndexEntry[];
  rebuild(
    packages: readonly RuntimeHealthPackage[],
  ): readonly RuntimeHealthIndexEntry[];
};

export function createRuntimeHealthIndex(): RuntimeHealthIndex {
  let entries: RuntimeHealthIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next: RuntimeHealthIndexEntry = {
        packageId,
        reportId: pkg.report.id,
        sessionId: pkg.report.sessionId,
        overallHealth: pkg.report.overallHealth,
        score: pkg.report.score,
      };
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        next,
      ];
      return next;
    },

    find(reportId) {
      return entries.filter((item) => item.reportId === reportId);
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
