import type {
  RegisterPolicyInput,
  RuntimePolicy,
  RuntimePolicyEvent,
  RuntimePolicyIndexEntry,
  RuntimePolicyPackage,
  RuntimePolicyValidation,
  UpdatePolicyInput,
} from '../../model';
import {
  createRuntimePolicyEngine,
  type RuntimePolicyEngine,
} from './runtime-policy-engine';

/**
 * Runtime Policy API (EPIC-BLD-40).
 */
export type RuntimePolicyApi = {
  registerPolicy(input: RegisterPolicyInput): RuntimePolicyPackage;
  updatePolicy(
    policyId: string,
    patch: UpdatePolicyInput,
  ): RuntimePolicyPackage;
  publishPolicies(): RuntimePolicyPackage;
  listPolicies(): readonly RuntimePolicy[];
  validatePolicies(): RuntimePolicyValidation;
  initialize(title?: string): RuntimePolicyPackage;
  preview(): RuntimePolicyPackage | null;
  listEvents(): readonly RuntimePolicyEvent[];
  listIndex(): readonly RuntimePolicyIndexEntry[];
  dispose(): RuntimePolicyPackage;
};

export function createRuntimePolicyApi(
  engine?: RuntimePolicyEngine,
): RuntimePolicyApi {
  const policies = engine ?? createRuntimePolicyEngine();

  return {
    initialize(title) {
      return policies.initialize(title);
    },
    registerPolicy(input) {
      policies.initialize();
      return policies.registerPolicy(input);
    },
    updatePolicy(policyId, patch) {
      return policies.updatePolicy(policyId, patch);
    },
    publishPolicies() {
      policies.validate();
      return policies.publishPolicies();
    },
    listPolicies() {
      policies.initialize();
      return policies.listPolicies();
    },
    validatePolicies() {
      policies.initialize();
      return policies.validate();
    },
    preview() {
      return policies.getPackage();
    },
    listEvents() {
      return policies.getEvents();
    },
    listIndex() {
      return policies.getIndex();
    },
    dispose() {
      return policies.dispose();
    },
  };
}
