import type {
  EvaluateResilienceInput,
  RecoveryPlan,
  RuntimeResilienceEvent,
  RuntimeResilienceIndexEntry,
  RuntimeResiliencePackage,
  RuntimeResilienceValidation,
} from '../../model';
import {
  createRuntimeResilienceEngine,
  type RuntimeResilienceEngine,
} from './runtime-resilience-engine';

/**
 * Runtime Resilience API (EPIC-BLD-42).
 */
export type RuntimeResilienceApi = {
  evaluateRecovery(input: EvaluateResilienceInput): RuntimeResiliencePackage;
  publishRecovery(packageId: string): RuntimeResiliencePackage;
  previewRecovery(packageId: string): RuntimeResiliencePackage | null;
  listRecoveryPlans(): readonly RecoveryPlan[];
  validateRecovery(packageId: string): RuntimeResilienceValidation;
  listPackages(): readonly RuntimeResiliencePackage[];
  listEvents(): readonly RuntimeResilienceEvent[];
  listIndex(): readonly RuntimeResilienceIndexEntry[];
  dispose(packageId: string): RuntimeResiliencePackage;
};

export function createRuntimeResilienceApi(
  engine?: RuntimeResilienceEngine,
): RuntimeResilienceApi {
  const resilience = engine ?? createRuntimeResilienceEngine();

  return {
    evaluateRecovery(input) {
      return resilience.evaluate(input);
    },
    publishRecovery(packageId) {
      resilience.validate(packageId);
      return resilience.publish(packageId);
    },
    previewRecovery(packageId) {
      return resilience.getPackage(packageId);
    },
    listRecoveryPlans() {
      return resilience.listPlans();
    },
    validateRecovery(packageId) {
      return resilience.validate(packageId);
    },
    listPackages() {
      return resilience.listPackages();
    },
    listEvents() {
      return resilience.getEvents();
    },
    listIndex() {
      return resilience.getIndex();
    },
    dispose(packageId) {
      return resilience.dispose(packageId);
    },
  };
}
