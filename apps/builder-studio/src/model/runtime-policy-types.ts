/**
 * Runtime Policy Engine (EPIC-BLD-40).
 * SSOT for Policy definitions — never enforces, never mutates Runtime / Knowledge.
 */

export type RuntimePolicyCategory =
  | 'Observability'
  | 'Health'
  | 'Audit'
  | 'Session'
  | 'Execution'
  | 'Validation'
  | 'Platform';

export type RuntimePolicyStatus =
  | 'Draft'
  | 'Active'
  | 'Deprecated'
  | 'Disposed';

export type RuntimePolicy = {
  readonly id: string;
  readonly name: string;
  readonly category: RuntimePolicyCategory;
  readonly version: string;
  readonly description: string;
  readonly status: RuntimePolicyStatus;
  readonly metadata: {
    readonly code: string;
    readonly notes: string;
    readonly severity: 'info' | 'warning' | 'error' | 'critical';
  };
};

export type RuntimePolicyRegistry = {
  readonly id: string;
  readonly version: string;
  readonly policies: readonly RuntimePolicy[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly status: 'Open' | 'Published' | 'Disposed';
  };
};

export type RuntimePolicyPackage = {
  readonly id: string;
  readonly version: string;
  readonly registry: RuntimePolicyRegistry;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: RuntimePolicyValidation | null;
};

export type RuntimePolicyValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimePolicyValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimePolicyValidationIssue[];
  readonly validatedAt: string;
};

export type RegisterPolicyInput = {
  readonly name: string;
  readonly category: RuntimePolicyCategory;
  readonly description: string;
  readonly code?: string;
  readonly severity?: RuntimePolicy['metadata']['severity'];
  readonly version?: string;
  readonly notes?: string;
};

export type UpdatePolicyInput = {
  readonly name?: string;
  readonly category?: RuntimePolicyCategory;
  readonly description?: string;
  readonly status?: RuntimePolicyStatus;
  readonly version?: string;
  readonly notes?: string;
  readonly severity?: RuntimePolicy['metadata']['severity'];
};

export type RuntimePolicyIndexEntry = {
  readonly packageId: string;
  readonly registryId: string;
  readonly policyId: string;
  readonly category: RuntimePolicyCategory;
  readonly status: RuntimePolicyStatus;
};

export type RuntimePolicyEventType =
  | 'PolicyRegistered'
  | 'PolicyUpdated'
  | 'PolicyPackagePublished'
  | 'PolicyRegistryValidated';

export type RuntimePolicyEvent = {
  readonly eventId: string;
  readonly type: RuntimePolicyEventType;
  readonly packageId: string;
  readonly policyId: string | null;
  readonly at: string;
  readonly message: string;
};
