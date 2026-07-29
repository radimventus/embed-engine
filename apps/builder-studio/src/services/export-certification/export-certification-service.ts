import type {
  CertifyExportInput,
  ExportCertificationEvent,
  ExportCertificationEventType,
  ExportCertificationIndexEntry,
  ExportCertificationPackage,
  ExportCertificationValidation,
  ExportCertificate,
  InitializeExportCertificationInput,
} from '../../model';
import {
  createBasicExportCertificationStrategy,
  type ExportCertificationStrategy,
} from './basic-export-certification-strategy';
import {
  createBasicExportCertificationValidator,
  type ExportCertificationValidator,
} from './basic-export-certification-validator';
import {
  createExportCertificationIndex,
  type ExportCertificationIndex,
} from './export-certification-index';

export type ExportCertificationServiceOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: ExportCertificationStrategy;
  readonly validator?: ExportCertificationValidator;
  readonly index?: ExportCertificationIndex;
};

export type ExportCertificationService = {
  initialize(input: InitializeExportCertificationInput): ExportCertificationPackage;
  certify(packageId: string, input: CertifyExportInput): ExportCertificationPackage;
  validate(packageId: string): ExportCertificationValidation;
  revoke(packageId: string): ExportCertificationPackage;
  expire(packageId: string): ExportCertificationPackage;
  dispose(packageId: string): ExportCertificationPackage;
  getPackage(packageId: string): ExportCertificationPackage | null;
  listPackages(): readonly ExportCertificationPackage[];
  listExportCertificates(): readonly ExportCertificate[];
  findExportCertificate(artifactId: string): ExportCertificate | null;
  getEvents(): readonly ExportCertificationEvent[];
  getIndex(): readonly ExportCertificationIndexEntry[];
};

export function createExportCertificationService(
  options: ExportCertificationServiceOptions = {},
): ExportCertificationService {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicExportCertificationStrategy();
  const validator = options.validator ?? createBasicExportCertificationValidator();
  const index = options.index ?? createExportCertificationIndex();

  const packages = new Map<string, ExportCertificationPackage>();
  const events: ExportCertificationEvent[] = [];

  const emit = (
    type: ExportCertificationEventType,
    packageId: string,
    certificateId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('export-cert-event'),
      type,
      packageId,
      certificateId,
      at: now().toISOString(),
      message,
    });
  };

  const req = (packageId: string): ExportCertificationPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Export certification package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: ExportCertificationPackage): ExportCertificationPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const buildInitialPackage = (
    input: InitializeExportCertificationInput,
  ): ExportCertificationPackage => {
    const stamp = now().toISOString();
    return {
      id: createId('export-cert-package'),
      version: '1.0.0',
      certificate: {
        id: createId('export-cert'),
        artifactId: 'artifact-pending',
        schemaVersion: '1',
        certificationVersion: '0.0.0',
        status: 'CERTIFIED',
        issuedAt: stamp,
        metadata: {
          title: input.title?.trim() || `Export Certification ${input.sessionId}`,
          notes: 'Awaiting certification.',
        },
      },
      createdAt: stamp,
      updatedAt: stamp,
      metadata: {
        title: input.title?.trim() || `Export Certification ${input.sessionId}`,
        sessionId: input.sessionId,
        notes: 'Export certification package.',
        status: 'Draft',
      },
      validation: null,
    };
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) {
        throw new Error('Export certification service requires sessionId.');
      }
      let pkg = store(buildInitialPackage(input));
      if (input.certification) {
        pkg = this.certify(pkg.id, input.certification);
      }
      return pkg;
    },

    certify(packageId, input) {
      const pkg = req(packageId);
      if (!strategy.supports(input)) {
        throw new Error('Export certification strategy does not support this input.');
      }
      const certificate = strategy.certify(
        input,
        () => createId('export-cert'),
        () => now().toISOString(),
      );
      const next: ExportCertificationPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        certificate,
        validation: null,
        metadata: {
          ...pkg.metadata,
          status: 'Certified',
          notes: `Certified export ${certificate.artifactId}.`,
        },
      };
      store(next);
      emit('ExportCertified', next.id, certificate.id, `Certified ${certificate.artifactId}.`);
      return next;
    },

    validate(packageId) {
      const pkg = req(packageId);
      const validation = validator.validate(pkg.certificate);
      const next: ExportCertificationPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        validation,
        metadata: {
          ...pkg.metadata,
          notes: validation.valid
            ? 'Export certification validated.'
            : 'Export certification validation failed.',
        },
      };
      store(next);
      emit(
        'ExportCertificationValidated',
        next.id,
        next.certificate.id,
        validation.valid ? 'Validated export certification.' : 'Invalid export certification.',
      );
      return validation;
    },

    revoke(packageId) {
      const pkg = req(packageId);
      const next: ExportCertificationPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        certificate: {
          ...pkg.certificate,
          status: 'REVOKED',
        },
        metadata: {
          ...pkg.metadata,
          status: 'Revoked',
          notes: 'Export certification revoked.',
        },
      };
      store(next);
      emit(
        'ExportCertificationRevoked',
        next.id,
        next.certificate.id,
        `Revoked certification ${next.certificate.id}.`,
      );
      return next;
    },

    expire(packageId) {
      const pkg = req(packageId);
      const next: ExportCertificationPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        certificate: {
          ...pkg.certificate,
          status: 'EXPIRED',
        },
        metadata: {
          ...pkg.metadata,
          notes: 'Export certification expired.',
        },
      };
      store(next);
      emit(
        'ExportCertificationExpired',
        next.id,
        next.certificate.id,
        `Expired certification ${next.certificate.id}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = req(packageId);
      const next: ExportCertificationPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed export certification package.',
        },
      };
      store(next);
      return next;
    },

    getPackage(packageId) {
      return packages.get(packageId) ?? null;
    },

    listPackages() {
      return [...packages.values()];
    },

    listExportCertificates() {
      return [...packages.values()].map((pkg) => pkg.certificate);
    },

    findExportCertificate(artifactId) {
      return (
        [...packages.values()].find((pkg) => pkg.certificate.artifactId === artifactId)
          ?.certificate ?? null
      );
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}

