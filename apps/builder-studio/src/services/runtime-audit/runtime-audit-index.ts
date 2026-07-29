import type {
  RuntimeAuditIndexEntry,
  RuntimeAuditPackage,
} from '../../model';

/**
 * RuntimeAuditIndex (EPIC-BLD-38).
 */
export type RuntimeAuditIndex = {
  index(
    packageId: string,
    pkg: RuntimeAuditPackage,
  ): RuntimeAuditIndexEntry;
  find(trailId: string): readonly RuntimeAuditIndexEntry[];
  list(packageId?: string): readonly RuntimeAuditIndexEntry[];
  rebuild(
    packages: readonly RuntimeAuditPackage[],
  ): readonly RuntimeAuditIndexEntry[];
};

export function createRuntimeAuditIndex(): RuntimeAuditIndex {
  let entries: RuntimeAuditIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next: RuntimeAuditIndexEntry = {
        packageId,
        trailId: pkg.trail.id,
        sessionId: pkg.trail.sessionId,
        recordCount: pkg.trail.records.length,
        status: pkg.metadata.status,
      };
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        next,
      ];
      return next;
    },

    find(trailId) {
      return entries.filter((item) => item.trailId === trailId);
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
