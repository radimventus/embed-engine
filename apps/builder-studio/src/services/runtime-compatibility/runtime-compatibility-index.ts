import type {
  RuntimeCompatibilityIndexEntry,
  RuntimeCompatibilityPackage,
} from '../../model';

/**
 * RuntimeCompatibilityIndex (EPIC-BLD-52).
 */
export type RuntimeCompatibilityIndex = {
  index(
    packageId: string,
    pkg: RuntimeCompatibilityPackage,
  ): readonly RuntimeCompatibilityIndexEntry[];
  find(sourceVersion: string): readonly RuntimeCompatibilityIndexEntry[];
  list(packageId?: string): readonly RuntimeCompatibilityIndexEntry[];
  rebuild(
    packages: readonly RuntimeCompatibilityPackage[],
  ): readonly RuntimeCompatibilityIndexEntry[];
};

export function createRuntimeCompatibilityIndex(): RuntimeCompatibilityIndex {
  let entries: RuntimeCompatibilityIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next = pkg.matrix.rules.map(
        (rule): RuntimeCompatibilityIndexEntry => ({
          packageId,
          matrixId: pkg.matrix.id,
          ruleId: rule.id,
          sourceVersion: rule.sourceVersion,
          targetVersion: rule.targetVersion,
          status: rule.status,
        }),
      );
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        ...next,
      ];
      return next;
    },

    find(sourceVersion) {
      return entries.filter((item) => item.sourceVersion === sourceVersion);
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
