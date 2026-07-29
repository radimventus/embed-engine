import type { ExportCompatibilityIndexEntry, ExportCompatibilityPackage } from '../../model';

export type ExportCompatibilityIndex = {
  index(packageId: string, pkg: ExportCompatibilityPackage): readonly ExportCompatibilityIndexEntry[];
  find(sourceVersion: string): readonly ExportCompatibilityIndexEntry[];
  list(packageId?: string): readonly ExportCompatibilityIndexEntry[];
  rebuild(packages: readonly ExportCompatibilityPackage[]): readonly ExportCompatibilityIndexEntry[];
};

export function createExportCompatibilityIndex(): ExportCompatibilityIndex {
  let entries: ExportCompatibilityIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next = pkg.compatibilities.map((c) => ({
        packageId,
        compatibilityId: c.id,
        sourceSchemaVersion: c.sourceSchemaVersion,
        targetSchemaVersion: c.targetSchemaVersion,
        compatibilityLevel: c.compatibilityLevel,
        status: c.status,
      }));
      entries = [...entries.filter((e) => e.packageId !== packageId), ...next];
      return next;
    },
    find(sourceVersion) { return entries.filter((e) => e.sourceSchemaVersion === sourceVersion); },
    list(packageId) { return packageId === undefined ? [...entries] : entries.filter((e) => e.packageId === packageId); },
    rebuild(packages) { entries = []; for (const p of packages) this.index(p.id, p); return [...entries]; },
  };
}
