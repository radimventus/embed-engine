import type {
  ExportCertificationIndexEntry,
  ExportCertificationPackage,
} from '../../model';

export type ExportCertificationIndex = {
  index(packageId: string, pkg: ExportCertificationPackage): readonly ExportCertificationIndexEntry[];
  find(artifactId: string): readonly ExportCertificationIndexEntry[];
  list(packageId?: string): readonly ExportCertificationIndexEntry[];
  rebuild(packages: readonly ExportCertificationPackage[]): readonly ExportCertificationIndexEntry[];
};

export function createExportCertificationIndex(): ExportCertificationIndex {
  let entries: ExportCertificationIndexEntry[] = [];

  return {
    index(packageId, pkg) {
      const next = [
        {
          packageId,
          certificateId: pkg.certificate.id,
          artifactId: pkg.certificate.artifactId,
          schemaVersion: pkg.certificate.schemaVersion,
          certificationVersion: pkg.certificate.certificationVersion,
          status: pkg.certificate.status,
        },
      ];
      entries = [...entries.filter((e) => e.packageId !== packageId), ...next];
      return next;
    },
    find(artifactId) {
      return entries.filter((e) => e.artifactId === artifactId);
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

