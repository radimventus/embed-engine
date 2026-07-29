import type {
  RuntimeIntegrationIndexEntry,
  RuntimeIntegrationPackage,
} from '../../model';

/**
 * RuntimeIntegrationIndex (EPIC-BLD-48).
 */
export type RuntimeIntegrationIndex = {
  index(
    integrationPackageId: string,
    pkg: RuntimeIntegrationPackage,
  ): readonly RuntimeIntegrationIndexEntry[];
  find(packageId: string): readonly RuntimeIntegrationIndexEntry[];
  list(integrationPackageId?: string): readonly RuntimeIntegrationIndexEntry[];
  rebuild(
    packages: readonly RuntimeIntegrationPackage[],
  ): readonly RuntimeIntegrationIndexEntry[];
};

export function createRuntimeIntegrationIndex(): RuntimeIntegrationIndex {
  let entries: RuntimeIntegrationIndexEntry[] = [];

  return {
    index(integrationPackageId, pkg) {
      const next = pkg.catalog.records.map(
        (record): RuntimeIntegrationIndexEntry => ({
          integrationPackageId,
          catalogId: pkg.catalog.id,
          recordId: record.id,
          packageId: record.packageId,
          packageType: record.packageType,
          source: record.source,
        }),
      );
      entries = [
        ...entries.filter(
          (item) => item.integrationPackageId !== integrationPackageId,
        ),
        ...next,
      ];
      return next;
    },

    find(packageId) {
      return entries.filter((item) => item.packageId === packageId);
    },

    list(integrationPackageId) {
      if (integrationPackageId === undefined) {
        return [...entries];
      }
      return entries.filter(
        (item) => item.integrationPackageId === integrationPackageId,
      );
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
