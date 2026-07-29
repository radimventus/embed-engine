/**
 * Runtime Policy Enforcement Engine (EPIC-BLD-41).
 * Creates Enforcement Decisions only — never executes BLOCK / stops Runtime.
 */

export type EnforcementStatus = 'ALLOW' | 'WARN' | 'RESTRICT' | 'BLOCK';

export type EnforcementRecommendedAction =
  | 'Continue'
  | 'ContinueWithWarning'
  | 'RestrictModules'
  | 'RecommendHalt';

export type EnforcementDecision = {
  readonly id: string;
  readonly sessionId: string;
  readonly runtimeExecutionId: string | null;
  readonly status: EnforcementStatus;
  readonly reason: string;
  readonly recommendedAction: EnforcementRecommendedAction;
  readonly createdAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly governanceStatus: string | null;
    readonly triggeredRuleIds: readonly string[];
  };
};

export type EnforcementRule = {
  readonly id: string;
  readonly policyId: string;
  readonly condition: string;
  readonly action: EnforcementStatus;
  readonly priority: number;
  readonly metadata: {
    readonly notes: string;
    readonly recommendedAction: EnforcementRecommendedAction;
  };
};

export type RuntimeEnforcementPackage = {
  readonly id: string;
  readonly version: string;
  readonly decision: EnforcementDecision;
  readonly triggeredRules: readonly EnforcementRule[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: RuntimeEnforcementValidation | null;
};

export type RuntimeEnforcementValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimeEnforcementValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimeEnforcementValidationIssue[];
  readonly validatedAt: string;
};

export type EvaluateEnforcementInput = {
  readonly sessionId: string;
  readonly runtimeExecutionId?: string | null;
  readonly title?: string;
  readonly governanceStatus?:
    | 'Compliant'
    | 'Warning'
    | 'NonCompliant'
    | 'Unknown'
    | null;
  readonly governanceScore?: number | null;
  readonly failedPolicyCodes?: readonly string[];
  readonly failedSeverities?: readonly (
    | 'info'
    | 'warning'
    | 'error'
    | 'critical'
  )[];
};

export type RuntimeEnforcementIndexEntry = {
  readonly packageId: string;
  readonly decisionId: string;
  readonly sessionId: string;
  readonly status: EnforcementStatus;
};

export type RuntimeEnforcementEventType =
  | 'EnforcementEvaluated'
  | 'EnforcementDecisionCreated'
  | 'EnforcementPublished'
  | 'EnforcementValidated';

export type RuntimeEnforcementEvent = {
  readonly eventId: string;
  readonly type: RuntimeEnforcementEventType;
  readonly packageId: string;
  readonly decisionId: string | null;
  readonly at: string;
  readonly message: string;
};
