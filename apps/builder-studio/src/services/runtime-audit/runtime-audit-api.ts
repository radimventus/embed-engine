import type {
  RecordAuditInput,
  RuntimeAuditEvent,
  RuntimeAuditIndexEntry,
  RuntimeAuditPackage,
  RuntimeAuditTrail,
  RuntimeAuditValidation,
} from '../../model';
import {
  createRuntimeAuditEngine,
  type RuntimeAuditEngine,
} from './runtime-audit-engine';

/**
 * Runtime Audit API (EPIC-BLD-38).
 */
export type RuntimeAuditApi = {
  recordAudit(input: RecordAuditInput): RuntimeAuditPackage;
  publishAudit(packageId: string): RuntimeAuditPackage;
  previewAudit(packageId: string): RuntimeAuditPackage | null;
  listAuditTrails(): readonly RuntimeAuditTrail[];
  validateAudit(packageId: string): RuntimeAuditValidation;
  listPackages(): readonly RuntimeAuditPackage[];
  listEvents(): readonly RuntimeAuditEvent[];
  listIndex(): readonly RuntimeAuditIndexEntry[];
  appendAudit(
    packageId: string,
    sources: RecordAuditInput['sources'],
  ): RuntimeAuditPackage;
  dispose(packageId: string): RuntimeAuditPackage;
};

export function createRuntimeAuditApi(
  engine?: RuntimeAuditEngine,
): RuntimeAuditApi {
  const audit = engine ?? createRuntimeAuditEngine();

  return {
    recordAudit(input) {
      return audit.record(input);
    },
    publishAudit(packageId) {
      audit.analyze(packageId);
      return audit.publish(packageId);
    },
    previewAudit(packageId) {
      return audit.getPackage(packageId);
    },
    listAuditTrails() {
      return audit.listTrails();
    },
    validateAudit(packageId) {
      return audit.analyze(packageId);
    },
    listPackages() {
      return audit.listPackages();
    },
    listEvents() {
      return audit.getEvents();
    },
    listIndex() {
      return audit.getIndex();
    },
    appendAudit(packageId, sources) {
      return audit.append({ packageId, sources });
    },
    dispose(packageId) {
      return audit.dispose(packageId);
    },
  };
}
