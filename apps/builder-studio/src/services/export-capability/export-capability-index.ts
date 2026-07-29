import type {
  ExportCapabilityIndexEntry,
  ExportCapabilityPackage,
} from '../../model';

export type ExportCapabilityIndex = {
  index(
    packageId: string,
    pkg: ExportCapabilityPackage,
  ): readonly ExportCapabilityIndexEntry[];
  find(capabilityName: string): readonly ExportCapabilityIndexEntry[];
  list(packageId?: string): readonly ExportCapabilityIndexEntry[];
  rebuild(packages: readonly ExportCapabilityPackage[]): readonly ExportCapabilityIndexEntry[];
};

export function createExportCapabilityIndex(): ExportCapabilityIndex {
  let entries: ExportCapabilityIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next = pkg.capabilities.map((c) => ({
        packageId,
        capabilityId: c.id,
        name: c.name,
        supportedSchemaVersions: c.supportedSchemaVersions,
        status: c.status,
      }));
      entries = [...entries.filter((e) => e.packageId !== packageId), ...next];
      return next;
    },
    find(name) {
      return entries.filter((e) => e.name === name);
    },
    list(packageId) {
      if (packageId === undefined) return [...entries];
      return entries.filter((e) => e.packageId === packageId);
    },
    rebuild(packages) {
      entries = [];
      for (const pkg of packages) {
        // packageId is deterministic based on package.id.
        this.index(pkg.id, pkg);
      }
      return [...entries];
    },
  };
}

