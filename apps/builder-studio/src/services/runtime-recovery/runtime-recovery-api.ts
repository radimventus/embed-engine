import type {
  BuildRecoverySequenceInput,
  RecoverySequence,
  RuntimeRecoveryEvent,
  RuntimeRecoveryIndexEntry,
  RuntimeRecoveryPackage,
  RuntimeRecoveryValidation,
} from '../../model';
import {
  createRuntimeRecoveryOrchestrator,
  type RuntimeRecoveryOrchestrator,
} from './runtime-recovery-orchestrator';

/**
 * Runtime Recovery API (EPIC-BLD-43).
 */
export type RuntimeRecoveryApi = {
  buildRecoverySequence(
    input: BuildRecoverySequenceInput,
  ): RuntimeRecoveryPackage;
  publishRecoverySequence(packageId: string): RuntimeRecoveryPackage;
  previewRecoverySequence(packageId: string): RuntimeRecoveryPackage | null;
  listRecoverySequences(): readonly RecoverySequence[];
  validateRecoverySequence(packageId: string): RuntimeRecoveryValidation;
  listPackages(): readonly RuntimeRecoveryPackage[];
  listEvents(): readonly RuntimeRecoveryEvent[];
  listIndex(): readonly RuntimeRecoveryIndexEntry[];
  dispose(packageId: string): RuntimeRecoveryPackage;
};

export function createRuntimeRecoveryApi(
  orchestrator?: RuntimeRecoveryOrchestrator,
): RuntimeRecoveryApi {
  const recovery = orchestrator ?? createRuntimeRecoveryOrchestrator();

  return {
    buildRecoverySequence(input) {
      return recovery.buildSequence(input);
    },
    publishRecoverySequence(packageId) {
      recovery.validate(packageId);
      return recovery.publish(packageId);
    },
    previewRecoverySequence(packageId) {
      return recovery.getPackage(packageId);
    },
    listRecoverySequences() {
      return recovery.listSequences();
    },
    validateRecoverySequence(packageId) {
      return recovery.validate(packageId);
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
