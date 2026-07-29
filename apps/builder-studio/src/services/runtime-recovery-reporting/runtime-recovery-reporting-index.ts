import type {
  RuntimeRecoveryReportPackage,
  RuntimeRecoveryReportingIndexEntry,
} from '../../model';

/**
 * RuntimeRecoveryReportingIndex (EPIC-BLD-46).
 */
export type RuntimeRecoveryReportingIndex = {
  index(
    packageId: string,
    pkg: RuntimeRecoveryReportPackage,
  ): RuntimeRecoveryReportingIndexEntry;
  find(reportId: string): readonly RuntimeRecoveryReportingIndexEntry[];
  list(packageId?: string): readonly RuntimeRecoveryReportingIndexEntry[];
  rebuild(
    packages: readonly RuntimeRecoveryReportPackage[],
  ): readonly RuntimeRecoveryReportingIndexEntry[];
};

export function createRuntimeRecoveryReportingIndex(): RuntimeRecoveryReportingIndex {
  let entries: RuntimeRecoveryReportingIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next: RuntimeRecoveryReportingIndexEntry = {
        packageId,
        reportId: pkg.report.id,
        sessionId: pkg.report.sessionId,
        finalStatus: pkg.report.finalStatus,
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
