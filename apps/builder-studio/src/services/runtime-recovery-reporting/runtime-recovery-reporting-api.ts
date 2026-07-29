import type {
  CollectRecoveryReportInput,
  RecoveryReport,
  RuntimeRecoveryReportPackage,
  RuntimeRecoveryReportingEvent,
  RuntimeRecoveryReportingIndexEntry,
  RuntimeRecoveryReportingValidation,
} from '../../model';
import {
  createRuntimeRecoveryReportingEngine,
  type RuntimeRecoveryReportingEngine,
} from './runtime-recovery-reporting-engine';

/**
 * Runtime Recovery Reporting API (EPIC-BLD-46).
 */
export type RuntimeRecoveryReportingApi = {
  generateRecoveryReport(
    input: CollectRecoveryReportInput,
  ): RuntimeRecoveryReportPackage;
  publishRecoveryReport(packageId: string): RuntimeRecoveryReportPackage;
  previewRecoveryReport(packageId: string): RuntimeRecoveryReportPackage | null;
  listRecoveryReports(): readonly RecoveryReport[];
  validateRecoveryReport(
    packageId: string,
  ): RuntimeRecoveryReportingValidation;
  listPackages(): readonly RuntimeRecoveryReportPackage[];
  listEvents(): readonly RuntimeRecoveryReportingEvent[];
  listIndex(): readonly RuntimeRecoveryReportingIndexEntry[];
  dispose(packageId: string): RuntimeRecoveryReportPackage;
};

export function createRuntimeRecoveryReportingApi(
  engine?: RuntimeRecoveryReportingEngine,
): RuntimeRecoveryReportingApi {
  const reporting = engine ?? createRuntimeRecoveryReportingEngine();

  return {
    generateRecoveryReport(input) {
      return reporting.generate(input);
    },
    publishRecoveryReport(packageId) {
      reporting.validate(packageId);
      return reporting.publish(packageId);
    },
    previewRecoveryReport(packageId) {
      return reporting.getPackage(packageId);
    },
    listRecoveryReports() {
      return reporting.listReports();
    },
    validateRecoveryReport(packageId) {
      return reporting.validate(packageId);
    },
    listPackages() {
      return reporting.listPackages();
    },
    listEvents() {
      return reporting.getEvents();
    },
    listIndex() {
      return reporting.getIndex();
    },
    dispose(packageId) {
      return reporting.dispose(packageId);
    },
  };
}
