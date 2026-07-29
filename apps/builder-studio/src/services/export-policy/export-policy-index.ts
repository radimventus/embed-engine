import type {
  ExportPolicyIndexEntry,
  ExportPolicyPackage,
} from '../../model';

export type ExportPolicyIndex = {
  index(packageId: string, pkg: ExportPolicyPackage): readonly ExportPolicyIndexEntry[];
  find(policyName: string): readonly ExportPolicyIndexEntry[];
  list(packageId?: string): readonly ExportPolicyIndexEntry[];
  rebuild(packages: readonly ExportPolicyPackage[]): readonly ExportPolicyIndexEntry[];
};

export function createExportPolicyIndex(): ExportPolicyIndex {
  let entries: ExportPolicyIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next = pkg.policies.map((policy) => ({
        packageId,
        policyId: policy.id,
        name: policy.name,
        conditions: policy.conditions,
        status: policy.status,
      }));
      entries = [...entries.filter((e) => e.packageId !== packageId), ...next];
      return next;
    },

    find(policyName) {
      return entries.filter((e) => e.name === policyName);
    },

    list(packageId) {
      if (packageId === undefined) return [...entries];
      return entries.filter((e) => e.packageId === packageId);
    },

    rebuild(packages) {
      entries = [];
      for (const pkg of packages) {
        this.index(pkg.id, pkg);
      }
      return [...entries];
    },
  };
}

