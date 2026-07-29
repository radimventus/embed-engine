import type {
  EnforcementDecision,
  EvaluateEnforcementInput,
  RuntimeEnforcementEvent,
  RuntimeEnforcementIndexEntry,
  RuntimeEnforcementPackage,
  RuntimeEnforcementValidation,
} from '../../model';
import {
  createRuntimePolicyEnforcementEngine,
  type RuntimePolicyEnforcementEngine,
} from './runtime-enforcement-engine';

/**
 * Runtime Policy Enforcement API (EPIC-BLD-41).
 */
export type RuntimeEnforcementApi = {
  evaluateEnforcement(
    input: EvaluateEnforcementInput,
  ): RuntimeEnforcementPackage;
  publishEnforcement(packageId: string): RuntimeEnforcementPackage;
  previewEnforcement(packageId: string): RuntimeEnforcementPackage | null;
  listEnforcementDecisions(): readonly EnforcementDecision[];
  validateEnforcement(packageId: string): RuntimeEnforcementValidation;
  listPackages(): readonly RuntimeEnforcementPackage[];
  listEvents(): readonly RuntimeEnforcementEvent[];
  listIndex(): readonly RuntimeEnforcementIndexEntry[];
  dispose(packageId: string): RuntimeEnforcementPackage;
};

export function createRuntimeEnforcementApi(
  engine?: RuntimePolicyEnforcementEngine,
): RuntimeEnforcementApi {
  const enforcement = engine ?? createRuntimePolicyEnforcementEngine();

  return {
    evaluateEnforcement(input) {
      return enforcement.evaluate(input);
    },
    publishEnforcement(packageId) {
      enforcement.validate(packageId);
      return enforcement.publish(packageId);
    },
    previewEnforcement(packageId) {
      return enforcement.getPackage(packageId);
    },
    listEnforcementDecisions() {
      return enforcement.listDecisions();
    },
    validateEnforcement(packageId) {
      return enforcement.validate(packageId);
    },
    listPackages() {
      return enforcement.listPackages();
    },
    listEvents() {
      return enforcement.getEvents();
    },
    listIndex() {
      return enforcement.getIndex();
    },
    dispose(packageId) {
      return enforcement.dispose(packageId);
    },
  };
}
