import type { LearningPackageIndexEntry, LearningRecordReference } from '../../model';

/**
 * LearningIndex (EPIC-BLD-23).
 * Indexation only — no analysis.
 */
export type LearningIndex = {
  index(
    packageId: string,
    records: readonly LearningRecordReference[],
  ): readonly LearningPackageIndexEntry[];
  find(recordId: string): readonly LearningPackageIndexEntry[];
  list(packageId?: string): readonly LearningPackageIndexEntry[];
  rebuild(
    packages: readonly {
      readonly id: string;
      readonly records: readonly LearningRecordReference[];
    }[],
  ): readonly LearningPackageIndexEntry[];
};

export function createLearningIndex(): LearningIndex {
  let entries: LearningPackageIndexEntry[] = [];

  return {
    index(packageId, records) {
      const next = records.map((ref) => ({
        packageId,
        recordId: ref.recordId,
        referenceId: ref.id,
        source: ref.source,
        timestamp: ref.timestamp,
      }));
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        ...next,
      ];
      return next;
    },

    find(recordId) {
      return entries.filter((item) => item.recordId === recordId);
    },

    list(packageId) {
      if (packageId === undefined) {
        return [...entries];
      }
      return entries.filter((item) => item.packageId === packageId);
    },

    rebuild(packages) {
      entries = [];
      for (const pkg of packages) {
        this.index(pkg.id, pkg.records);
      }
      return [...entries];
    },
  };
}
