import type {
  CertifyExportInput,
  ExportCertificate,
} from '../../model';

export type ExportCertificationStrategy = {
  readonly id: string;
  supports(input: CertifyExportInput): boolean;
  certify(input: CertifyExportInput, createId: () => string, now: () => string): ExportCertificate;
  validate(certificate: ExportCertificate): boolean;
};

export function createBasicExportCertificationStrategy(): ExportCertificationStrategy {
  return {
    id: 'basic-export-certification-strategy',

    supports(input) {
      return (
        input.artifactId.trim().length > 0 &&
        input.schemaVersion.trim().length > 0 &&
        input.certificationVersion.trim().length > 0
      );
    },

    certify(input, createId, now) {
      return {
        id: createId(),
        artifactId: input.artifactId.trim(),
        schemaVersion: input.schemaVersion.trim(),
        certificationVersion: input.certificationVersion.trim(),
        status: 'CERTIFIED',
        issuedAt: now(),
        metadata: {
          title: input.title?.trim() || `Certificate ${input.artifactId.trim()}`,
          notes: input.notes?.trim() || 'Export certified.',
        },
      };
    },

    validate(certificate) {
      return (
        certificate.artifactId.trim().length > 0 &&
        certificate.schemaVersion.trim().length > 0 &&
        certificate.certificationVersion.trim().length > 0
      );
    },
  };
}

