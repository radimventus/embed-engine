/**
 * Runtime Compatibility Manager (EPIC-BLD-52).
 * Deterministic version compatibility evaluation — no migration or mutation.
 */

export type CompatibilityStatus = 'Compatible' | 'Incompatible' | 'Deprecated';

export type CompatibilityRule = {
  readonly id: string;
  readonly sourceVersion: string;
  readonly targetVersion: string;
  readonly status: CompatibilityStatus;
  readonly reason: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly dimension: 'runtime' | 'manifest' | 'api' | 'consumer';
  };
};

export type RuntimeCompatibilityMatrix = {
  readonly id: string;
  readonly runtimeVersion: string;
  readonly manifestVersion: string;
  readonly apiVersion: string;
  readonly supportedConsumers: readonly string[];
  readonly rules: readonly CompatibilityRule[];
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly sessionId: string;
    readonly overallStatus: CompatibilityStatus;
  };
};

export type RuntimeCompatibilityPackage = {
  readonly id: string;
  readonly version: string;
  readonly matrix: RuntimeCompatibilityMatrix;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: RuntimeCompatibilityValidation | null;
};

export type RuntimeCompatibilityValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimeCompatibilityValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimeCompatibilityValidationIssue[];
  readonly validatedAt: string;
};

export type RegisterCompatibilityRuleInput = {
  readonly sourceVersion: string;
  readonly targetVersion: string;
  readonly status: CompatibilityStatus;
  readonly reason: string;
  readonly dimension?: CompatibilityRule['metadata']['dimension'];
  readonly title?: string;
  readonly notes?: string;
};

export type InitializeCompatibilityInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly runtimeVersion?: string;
  readonly manifestVersion?: string;
  readonly apiVersion?: string;
  readonly supportedConsumers?: readonly string[];
  readonly rules?: readonly RegisterCompatibilityRuleInput[];
};

export type EvaluateCompatibilityInput = {
  readonly sourceVersion: string;
  readonly targetVersion: string;
  readonly dimension?: CompatibilityRule['metadata']['dimension'];
};

export type CompatibilityEvaluation = {
  readonly id: string;
  readonly sourceVersion: string;
  readonly targetVersion: string;
  readonly status: CompatibilityStatus;
  readonly reason: string;
  readonly matchedRuleId: string | null;
  readonly evaluatedAt: string;
};

export type RuntimeCompatibilityIndexEntry = {
  readonly packageId: string;
  readonly matrixId: string;
  readonly ruleId: string;
  readonly sourceVersion: string;
  readonly targetVersion: string;
  readonly status: CompatibilityStatus;
};

export type RuntimeCompatibilityEventType =
  | 'CompatibilityEvaluated'
  | 'CompatibilityPublished'
  | 'CompatibilityValidated'
  | 'CompatibilityRegistered';

export type RuntimeCompatibilityEvent = {
  readonly eventId: string;
  readonly type: RuntimeCompatibilityEventType;
  readonly packageId: string;
  readonly matrixId: string | null;
  readonly ruleId: string | null;
  readonly at: string;
  readonly message: string;
};
