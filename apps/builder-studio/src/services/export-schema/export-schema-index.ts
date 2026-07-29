import type {
  ExportSchemaIndexEntry,
  ExportSchemaPackage,
} from '../../model';

export type ExportSchemaIndex = {
  index(packageId: string, pkg: ExportSchemaPackage): readonly ExportSchemaIndexEntry[];
  find(name: string): readonly ExportSchemaIndexEntry[];
  list(packageId?: string): readonly ExportSchemaIndexEntry[];
  rebuild(packages: readonly ExportSchemaPackage[]): readonly ExportSchemaIndexEntry[];
};

export function createExportSchemaIndex(): ExportSchemaIndex {
  let entries: ExportSchemaIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next = pkg.schemas.map((s) => ({
        packageId,
        schemaId: s.id,
        name: s.name,
        schemaVersion: s.schemaVersion,
        status: s.status,
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
      for (const pkg of packages) this.index(pkg.id, pkg);
      return [...entries];
    },
  };
}
