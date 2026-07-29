import type {
  CertifyExportInput,
  ExportCertificate,
  ExportCertificationEvent,
  ExportCertificationIndexEntry,
  ExportCertificationPackage,
  ExportCertificationValidation,
  InitializeExportCertificationInput,
} from '../../model';
import {
  createExportCertificationService,
  type ExportCertificationService,
} from './export-certification-service';

export type ExportCertificationApi = {
  certifyExport(
    packageId: string | null,
    input: CertifyExportInput,
    init?: InitializeExportCertificationInput,
  ): ExportCertificationPackage;
  findExportCertificate(artifactId: string): ExportCertificate | null;
  listExportCertificates(): readonly ExportCertificate[];
  validateExportCertification(packageId: string): ExportCertificationValidation;
  revokeExportCertification(packageId: string): ExportCertificationPackage;
  disposeExportCertification(packageId: string): ExportCertificationPackage;
  getPackage(packageId: string): ExportCertificationPackage | null;
  listPackages(): readonly ExportCertificationPackage[];
  listEvents(): readonly ExportCertificationEvent[];
  listIndex(): readonly ExportCertificationIndexEntry[];
};

export function createExportCertificationApi(
  service?: ExportCertificationService,
): ExportCertificationApi {
  const registry = service ?? createExportCertificationService();

  return {
    certifyExport(packageId, input, init) {
      if (packageId === null) {
        return registry.initialize({
          sessionId: init?.sessionId ?? 'export-certification-session-demo',
          title: init?.title ?? 'Builder Export Certification',
          certification: init?.certification ?? input,
        });
      }
      return registry.certify(packageId, input);
    },

    findExportCertificate(artifactId) {
      return registry.findExportCertificate(artifactId);
    },

    listExportCertificates() {
      return registry.listExportCertificates();
    },

    validateExportCertification(packageId) {
      return registry.validate(packageId);
    },

    revokeExportCertification(packageId) {
      return registry.revoke(packageId);
    },

    disposeExportCertification(packageId) {
      return registry.dispose(packageId);
    },

    getPackage(packageId) {
      return registry.getPackage(packageId);
    },

    listPackages() {
      return registry.listPackages();
    },

    listEvents() {
      return registry.getEvents();
    },

    listIndex() {
      return registry.getIndex();
    },
  };
}

