import type {
  RuntimeContractIndexEntry,
  RuntimeContractPackage,
} from '../../model';

/**
 * RuntimeContractIndex (EPIC-BLD-53).
 */
export type RuntimeContractIndex = {
  index(
    packageId: string,
    pkg: RuntimeContractPackage,
  ): readonly RuntimeContractIndexEntry[];
  find(capability: string): readonly RuntimeContractIndexEntry[];
  list(packageId?: string): readonly RuntimeContractIndexEntry[];
  rebuild(
    packages: readonly RuntimeContractPackage[],
  ): readonly RuntimeContractIndexEntry[];
};

export function createRuntimeContractIndex(): RuntimeContractIndex {
  let entries: RuntimeContractIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next = pkg.contracts.map(
        (contract): RuntimeContractIndexEntry => ({
          packageId,
          contractId: contract.id,
          name: contract.name,
          capability: contract.capability,
          version: contract.version,
          status: contract.metadata.status,
        }),
      );
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        ...next,
      ];
      return next;
    },

    find(capability) {
      return entries.filter((item) => item.capability === capability);
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
