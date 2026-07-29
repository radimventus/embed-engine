import type {
  RuntimePolicyIndexEntry,
  RuntimePolicyPackage,
} from '../../model';

/**
 * RuntimePolicyIndex (EPIC-BLD-40).
 */
export type RuntimePolicyIndex = {
  index(
    packageId: string,
    pkg: RuntimePolicyPackage,
  ): readonly RuntimePolicyIndexEntry[];
  find(policyId: string): readonly RuntimePolicyIndexEntry[];
  list(packageId?: string): readonly RuntimePolicyIndexEntry[];
  rebuild(
    packages: readonly RuntimePolicyPackage[],
  ): readonly RuntimePolicyIndexEntry[];
};

export function createRuntimePolicyIndex(): RuntimePolicyIndex {
  let entries: RuntimePolicyIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next = pkg.registry.policies.map((policy) => ({
        packageId,
        registryId: pkg.registry.id,
        policyId: policy.id,
        category: policy.category,
        status: policy.status,
      }));
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        ...next,
      ];
      return next;
    },

    find(policyId) {
      return entries.filter((item) => item.policyId === policyId);
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
