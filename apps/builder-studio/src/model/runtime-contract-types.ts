/**
 * Runtime Contract Manager (EPIC-BLD-53).
 * Public Runtime contract management — no Runtime mutation or routing.
 */

export type RuntimeContractLifecycle = 'Draft' | 'Published' | 'Deprecated';

export type RuntimeOperationContract = {
  readonly id: string;
  readonly operation: string;
  readonly request: string;
  readonly response: string;
  readonly errors: readonly string[];
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
  };
};

export type RuntimeContract = {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capability: string;
  readonly operations: readonly RuntimeOperationContract[];
  readonly dependencies: readonly string[];
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly status: RuntimeContractLifecycle;
    readonly compatibility: string;
  };
};

export type RuntimeContractPackage = {
  readonly id: string;
  readonly version: string;
  readonly contracts: readonly RuntimeContract[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: RuntimeContractValidation | null;
};

export type RuntimeContractValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimeContractValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimeContractValidationIssue[];
  readonly validatedAt: string;
};

export type RegisterOperationContractInput = {
  readonly operation: string;
  readonly request?: string;
  readonly response?: string;
  readonly errors?: readonly string[];
  readonly title?: string;
  readonly notes?: string;
};

export type RegisterRuntimeContractInput = {
  readonly name: string;
  readonly version: string;
  readonly capability: string;
  readonly operations?: readonly RegisterOperationContractInput[];
  readonly dependencies?: readonly string[];
  readonly title?: string;
  readonly notes?: string;
  readonly compatibility?: string;
  readonly status?: RuntimeContractLifecycle;
};

export type InitializeContractInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly contracts?: readonly RegisterRuntimeContractInput[];
};

export type RuntimeContractIndexEntry = {
  readonly packageId: string;
  readonly contractId: string;
  readonly name: string;
  readonly capability: string;
  readonly version: string;
  readonly status: RuntimeContractLifecycle;
};

export type RuntimeContractEventType =
  | 'RuntimeContractRegistered'
  | 'RuntimeContractPublished'
  | 'RuntimeContractValidated'
  | 'RuntimeContractDeprecated';

export type RuntimeContractEvent = {
  readonly eventId: string;
  readonly type: RuntimeContractEventType;
  readonly packageId: string;
  readonly contractId: string | null;
  readonly at: string;
  readonly message: string;
};
