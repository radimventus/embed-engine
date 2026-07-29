import type {
  RecoverySession,
  RuntimeRecoveryCoordinatorEvent,
  RuntimeRecoveryCoordinatorIndexEntry,
  RuntimeRecoveryCoordinatorValidation,
  RuntimeRecoverySummaryPackage,
  StartRecoverySessionInput,
} from '../../model';
import {
  createRuntimeRecoveryCoordinator,
  type RuntimeRecoveryCoordinator,
} from './runtime-recovery-coordinator';

/**
 * Runtime Recovery Coordinator API (EPIC-BLD-45).
 */
export type RuntimeRecoveryCoordinatorApi = {
  startRecoverySession(
    input: StartRecoverySessionInput,
  ): RuntimeRecoverySummaryPackage;
  completeRecoverySession(packageId: string): RuntimeRecoverySummaryPackage;
  publishRecoverySummary(packageId: string): RuntimeRecoverySummaryPackage;
  listRecoverySessions(): readonly RecoverySession[];
  validateRecoverySession(
    packageId: string,
  ): RuntimeRecoveryCoordinatorValidation;
  trackRecoveryProgress(
    packageId: string,
    executions: StartRecoverySessionInput['executions'],
  ): RuntimeRecoverySummaryPackage;
  previewRecoverySummary(
    packageId: string,
  ): RuntimeRecoverySummaryPackage | null;
  listPackages(): readonly RuntimeRecoverySummaryPackage[];
  listEvents(): readonly RuntimeRecoveryCoordinatorEvent[];
  listIndex(): readonly RuntimeRecoveryCoordinatorIndexEntry[];
  dispose(packageId: string): RuntimeRecoverySummaryPackage;
};

export function createRuntimeRecoveryCoordinatorApi(
  coordinator?: RuntimeRecoveryCoordinator,
): RuntimeRecoveryCoordinatorApi {
  const recovery = coordinator ?? createRuntimeRecoveryCoordinator();

  return {
    startRecoverySession(input) {
      const initialized = recovery.initialize(input);
      return recovery.startRecovery(initialized.id);
    },
    completeRecoverySession(packageId) {
      return recovery.completeRecovery(packageId);
    },
    publishRecoverySummary(packageId) {
      recovery.validate(packageId);
      return recovery.publish(packageId);
    },
    listRecoverySessions() {
      return recovery.listSessions();
    },
    validateRecoverySession(packageId) {
      return recovery.validate(packageId);
    },
    trackRecoveryProgress(packageId, executions) {
      return recovery.trackProgress({
        packageId,
        executions: executions ?? [],
      });
    },
    previewRecoverySummary(packageId) {
      return recovery.getPackage(packageId);
    },
    listPackages() {
      return recovery.listPackages();
    },
    listEvents() {
      return recovery.getEvents();
    },
    listIndex() {
      return recovery.getIndex();
    },
    dispose(packageId) {
      return recovery.dispose(packageId);
    },
  };
}
