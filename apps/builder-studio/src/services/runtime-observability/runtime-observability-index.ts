import type {
  RuntimeObservabilityIndexEntry,
  RuntimeObservabilityPackage,
} from '../../model';

/**
 * RuntimeObservabilityIndex (EPIC-BLD-36).
 */
export type RuntimeObservabilityIndex = {
  index(
    packageId: string,
    pkg: RuntimeObservabilityPackage,
  ): RuntimeObservabilityIndexEntry;
  find(timelineId: string): readonly RuntimeObservabilityIndexEntry[];
  list(packageId?: string): readonly RuntimeObservabilityIndexEntry[];
  rebuild(
    packages: readonly RuntimeObservabilityPackage[],
  ): readonly RuntimeObservabilityIndexEntry[];
};

export function createRuntimeObservabilityIndex(): RuntimeObservabilityIndex {
  let entries: RuntimeObservabilityIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next: RuntimeObservabilityIndexEntry = {
        packageId,
        timelineId: pkg.timeline.id,
        sessionId: pkg.timeline.sessionId,
        observationCount: pkg.metrics.observationCount,
        health: pkg.metrics.health,
      };
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        next,
      ];
      return next;
    },

    find(timelineId) {
      return entries.filter((item) => item.timelineId === timelineId);
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
