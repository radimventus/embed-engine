import type {
  EvaluateGovernanceInput,
  GovernanceEvaluation,
  RuntimeGovernanceEvent,
  RuntimeGovernanceIndexEntry,
  RuntimeGovernancePackage,
  RuntimeGovernanceValidation,
} from '../../model';
import {
  createRuntimeGovernanceEngine,
  type RuntimeGovernanceEngine,
} from './runtime-governance-engine';

/**
 * Runtime Governance API (EPIC-BLD-39).
 */
export type RuntimeGovernanceApi = {
  evaluateGovernance(input: EvaluateGovernanceInput): RuntimeGovernancePackage;
  publishGovernance(packageId: string): RuntimeGovernancePackage;
  previewGovernance(packageId: string): RuntimeGovernancePackage | null;
  listGovernanceReports(): readonly GovernanceEvaluation[];
  validateGovernance(packageId: string): RuntimeGovernanceValidation;
  listPackages(): readonly RuntimeGovernancePackage[];
  listEvents(): readonly RuntimeGovernanceEvent[];
  listIndex(): readonly RuntimeGovernanceIndexEntry[];
  dispose(packageId: string): RuntimeGovernancePackage;
};

export function createRuntimeGovernanceApi(
  engine?: RuntimeGovernanceEngine,
): RuntimeGovernanceApi {
  const governance = engine ?? createRuntimeGovernanceEngine();

  return {
    evaluateGovernance(input) {
      return governance.evaluate(input);
    },
    publishGovernance(packageId) {
      governance.validate(packageId);
      return governance.publish(packageId);
    },
    previewGovernance(packageId) {
      return governance.getPackage(packageId);
    },
    listGovernanceReports() {
      return governance.listEvaluations();
    },
    validateGovernance(packageId) {
      return governance.validate(packageId);
    },
    listPackages() {
      return governance.listPackages();
    },
    listEvents() {
      return governance.getEvents();
    },
    listIndex() {
      return governance.getIndex();
    },
    dispose(packageId) {
      return governance.dispose(packageId);
    },
  };
}
