import type { RuntimeApiIndexEntry, RuntimeApiPackage } from '../../model';

/**
 * RuntimeApiIndex (EPIC-BLD-51).
 */
export type RuntimeApiIndex = {
  index(
    apiPackageId: string,
    pkg: RuntimeApiPackage,
  ): readonly RuntimeApiIndexEntry[];
  find(capability: string): readonly RuntimeApiIndexEntry[];
  list(apiPackageId?: string): readonly RuntimeApiIndexEntry[];
  rebuild(
    packages: readonly RuntimeApiPackage[],
  ): readonly RuntimeApiIndexEntry[];
};

export function createRuntimeApiIndex(): RuntimeApiIndex {
  let entries: RuntimeApiIndexEntry[] = [];

  return {
    index(apiPackageId, pkg) {
      const next = pkg.registry.routes.map(
        (route): RuntimeApiIndexEntry => ({
          apiPackageId,
          registryId: pkg.registry.id,
          routeId: route.id,
          capability: route.capability,
          operation: route.operation,
          version: route.version,
          handler: route.handler,
        }),
      );
      entries = [
        ...entries.filter((item) => item.apiPackageId !== apiPackageId),
        ...next,
      ];
      return next;
    },

    find(capability) {
      return entries.filter((item) => item.capability === capability);
    },

    list(apiPackageId) {
      if (apiPackageId === undefined) {
        return [...entries];
      }
      return entries.filter((item) => item.apiPackageId === apiPackageId);
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
