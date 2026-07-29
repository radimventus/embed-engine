import type {
  ExecuteRecoveryInput,
  RecoveryExecution,
  RuntimeRecoveryExecutionEvent,
  RuntimeRecoveryExecutionIndexEntry,
  RuntimeRecoveryExecutionPackage,
  RuntimeRecoveryExecutionValidation,
} from '../../model';
import {
  createRuntimeRecoveryExecutor,
  type RuntimeRecoveryExecutor,
} from './runtime-recovery-executor';

/**
 * Runtime Recovery Execution API (EPIC-BLD-44).
 */
export type RuntimeRecoveryExecutionApi = {
  executeRecovery(input: ExecuteRecoveryInput): RuntimeRecoveryExecutionPackage;
  pauseRecovery(packageId: string): RuntimeRecoveryExecutionPackage;
  resumeRecovery(packageId: string): RuntimeRecoveryExecutionPackage;
  listRecoveryExecutions(): readonly RecoveryExecution[];
  validateRecoveryExecution(
    packageId: string,
  ): RuntimeRecoveryExecutionValidation;
  publishRecoveryExecution(
    packageId: string,
  ): RuntimeRecoveryExecutionPackage;
  previewRecoveryExecution(
    packageId: string,
  ): RuntimeRecoveryExecutionPackage | null;
  listPackages(): readonly RuntimeRecoveryExecutionPackage[];
  listEvents(): readonly RuntimeRecoveryExecutionEvent[];
  listIndex(): readonly RuntimeRecoveryExecutionIndexEntry[];
  dispose(packageId: string): RuntimeRecoveryExecutionPackage;
};

export function createRuntimeRecoveryExecutionApi(
  executor?: RuntimeRecoveryExecutor,
): RuntimeRecoveryExecutionApi {
  const recovery = executor ?? createRuntimeRecoveryExecutor();

  return {
    executeRecovery(input) {
      const initialized = recovery.initialize(input);
      return recovery.execute(initialized.id);
    },
    pauseRecovery(packageId) {
      return recovery.pause(packageId);
    },
    resumeRecovery(packageId) {
      return recovery.resume(packageId);
    },
    listRecoveryExecutions() {
      return recovery.listExecutions();
    },
    validateRecoveryExecution(packageId) {
      return recovery.validate(packageId);
    },
    publishRecoveryExecution(packageId) {
      recovery.validate(packageId);
      return recovery.publish(packageId);
    },
    previewRecoveryExecution(packageId) {
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
