/**
 * Export Certification Service (EPIC-BLD-70)
 * Metadata-only certification layer confirming export readiness.
 */

export type ExportCertificateStatus = 'CERTIFIED' | 'REVOKED' | 'EXPIRED';

export type ExportCertificate = {
  readonly id: string;
  readonly artifactId: string;
  readonly schemaVersion: string;
  readonly certificationVersion: string;
  readonly status: ExportCertificateStatus;
  readonly issuedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
  };
};

export type ExportCertificationValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type ExportCertificationValidation = {
  readonly valid: boolean;
  readonly issues: readonly ExportCertificationValidationIssue[];
  readonly validatedAt: string;
};

export type ExportCertificationPackage = {
  readonly id: string;
  readonly version: string;
  readonly certificate: ExportCertificate;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Certified' | 'Revoked' | 'Disposed';
  };
  readonly validation: ExportCertificationValidation | null;
};

export type CertifyExportInput = {
  readonly artifactId: string;
  readonly schemaVersion: string;
  readonly certificationVersion: string;
  readonly title?: string;
  readonly notes?: string;
};

export type InitializeExportCertificationInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly certification?: CertifyExportInput;
};

export type ExportCertificationIndexEntry = {
  readonly packageId: string;
  readonly certificateId: string;
  readonly artifactId: string;
  readonly schemaVersion: string;
  readonly certificationVersion: string;
  readonly status: ExportCertificateStatus;
};

export type ExportCertificationEventType =
  | 'ExportCertified'
  | 'ExportCertificationValidated'
  | 'ExportCertificationRevoked'
  | 'ExportCertificationExpired';

export type ExportCertificationEvent = {
  readonly eventId: string;
  readonly type: ExportCertificationEventType;
  readonly packageId: string;
  readonly certificateId: string | null;
  readonly at: string;
  readonly message: string;
};

